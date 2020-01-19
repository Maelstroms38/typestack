"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const graphql_tag_1 = __importDefault(require("graphql-tag"));
const ApolloReactHooks = __importStar(require("@apollo/react-hooks"));
exports.BooksDocument = graphql_tag_1.default `
    query Books {
  books {
    title
    author
  }
}
    `;
function useBooksQuery(baseOptions) {
    return ApolloReactHooks.useQuery(exports.BooksDocument, baseOptions);
}
exports.useBooksQuery = useBooksQuery;
function useBooksLazyQuery(baseOptions) {
    return ApolloReactHooks.useLazyQuery(exports.BooksDocument, baseOptions);
}
exports.useBooksLazyQuery = useBooksLazyQuery;
exports.CreateBookDocument = graphql_tag_1.default `
    mutation CreateBook($title: String!, $author: String!) {
  createBook(title: $title, author: $author) {
    title
    author
  }
}
    `;
function useCreateBookMutation(baseOptions) {
    return ApolloReactHooks.useMutation(exports.CreateBookDocument, baseOptions);
}
exports.useCreateBookMutation = useCreateBookMutation;
//# sourceMappingURL=graphql-hooks.js.map