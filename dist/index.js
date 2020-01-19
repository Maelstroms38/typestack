"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const typeorm_1 = require("typeorm");
const express_1 = __importDefault(require("express"));
const express_session_1 = __importDefault(require("express-session"));
const connect_sqlite3_1 = __importDefault(require("connect-sqlite3"));
const apollo_server_express_1 = require("apollo-server-express");
const type_graphql_1 = require("type-graphql");
const AuthResolver_1 = require("./resolvers/AuthResolver");
const BookResolver_1 = require("./resolvers/BookResolver");
const SQLiteStore = connect_sqlite3_1.default(express_session_1.default);
(() => __awaiter(void 0, void 0, void 0, function* () {
    const app = express_1.default();
    app.use(express_session_1.default({
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
            maxAge: 1000 * 60 * 60 * 24 * 7 * 365
        }
    }));
    const dbOptions = yield typeorm_1.getConnectionOptions(process.env.NODE_ENV || 'development');
    yield typeorm_1.createConnection(Object.assign(Object.assign({}, dbOptions), { name: 'default' }));
    const apolloServer = new apollo_server_express_1.ApolloServer({
        schema: yield type_graphql_1.buildSchema({
            resolvers: [AuthResolver_1.AuthResolver, BookResolver_1.BookResolver],
            validate: true
        }),
        context: ({ req, res }) => ({ req, res })
    });
    apolloServer.applyMiddleware({ app, cors: false });
    const port = process.env.PORT || 4000;
    app.listen(port, () => {
        console.log(`server started at http://localhost:${port}/graphql`);
    });
}))();
//# sourceMappingURL=index.js.map