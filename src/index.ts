import 'reflect-metadata';
import { createConnection, getConnectionOptions } from 'typeorm';
import express from 'express';
import session from 'express-session';
import connectSqlite3 from 'connect-sqlite3';
import { ApolloServer } from 'apollo-server-express';
import * as path from 'path';
import { buildSchema } from 'type-graphql';

import { PlaceResolver } from './resolvers/PlaceResolver';

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
  createConnection({ ...dbOptions, name: 'default' })
    .then(async () => {
      /* Initialize apollo server here */
      // build TypeGraphQL executable schema
      const schema = await buildSchema({
        // add all typescript resolvers
        // __dirname + '/resolvers/*.ts'
        resolvers: [PlaceResolver],
        validate: true,
        // automatically create `schema.gql` file with schema definition in current folder
        emitSchemaFile: path.resolve(__dirname, 'schema.gql')
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
      // Start the server
      app.listen(port, () => {
        console.log(`Server started at http://localhost:${port}/graphql`);
      });
    })
    .catch(error => console.log(error));
}
bootstrap();
