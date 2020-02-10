import 'reflect-metadata';
import { createConnection, getConnectionOptions } from 'typeorm';
import express from 'express';
import session from 'express-session';
import connectSqlite3 from 'connect-sqlite3';
import { ApolloServer } from 'apollo-server-express';
import * as path from 'path';
import { buildSchema } from 'type-graphql';
import Redis from 'ioredis';
import { RedisPubSub } from 'graphql-redis-subscriptions';
import { PlaceResolver } from './resolvers/PlaceResolver';
import { AuthResolver } from './resolvers/AuthResolver';
import http from 'http';

const SQLiteStore = connectSqlite3(session);

async function bootstrap() {
  const app = express();
  // use express session
  app.use(
    session({
      store: new SQLiteStore({
        db: 'database.sqlite',
        concurrentDB: true
      }),
      name: 'qid',
      secret: process.env.SESSION_SECRET || 'aslkdfjoiq12312',
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 1000 * 60 * 60 * 24 * 7 * 365 // 7 years
      }
    })
  );

  // get options from ormconfig.js
  const dbOptions = await getConnectionOptions(
    process.env.NODE_ENV || 'development'
  );
  // configure Redis connection options
  const options: Redis.RedisOptions = {
    retryStrategy: times => Math.max(times * 100, 3000)
  };
  // create Redis-based pub-sub
  const pubSub = new RedisPubSub({
    publisher: new Redis(options),
    subscriber: new Redis(options)
  });
  createConnection({ ...dbOptions, name: 'default' })
    .then(async () => {
      /* Initialize apollo server here */
      // build TypeGraphQL executable schema
      const schema = await buildSchema({
        // add all typescript resolvers
        // __dirname + '/resolvers/*.ts'
        resolvers: [PlaceResolver, AuthResolver],
        validate: true,
        // automatically create `schema.gql` file with schema definition in current folder
        emitSchemaFile: path.resolve(__dirname, 'schema.gql'),
        pubSub
      });

      // Create GraphQL server
      const apolloServer = new ApolloServer({
        schema,
        context: ({ req, res }) => ({ req, res }),
        introspection: true,
        // enable GraphQL Playground
        playground: true
      });

      apolloServer.applyMiddleware({ app, cors: true });

      const port = process.env.PORT || 4000;

      const httpServer = http.createServer(app);
      apolloServer.installSubscriptionHandlers(httpServer);
      // Start the server
      httpServer.listen(port, () => {
        console.log(
          `🚀 Server ready at http://localhost:${port}${apolloServer.graphqlPath}`
        );
        console.log(
          `🚀 Subscriptions ready at ws://localhost:${port}${apolloServer.subscriptionsPath}`
        );
      });
    })
    .catch(error => console.log(error));
}
bootstrap();
