import { startServerAndCreateNextHandler } from "@as-integrations/next";
import { ApolloServer } from "@apollo/server";
import { NextRequest } from "next/server";
import { gql } from "graphql-tag";
import { typedefs } from "./typedefs";
import { mutation } from "./mutations";
import { resolver } from "./resolver";

const typeDefs = gql`
   ${typedefs}
  type Query {
    hello: String
  }
    type Mutation{
    ${mutation}

    }

`;

const resolvers = {
  Query: {
    hello: () => "Hello world!",
  },
  Mutation: {
    ...resolver.Mutations
  }
};

const server = new ApolloServer({
    typeDefs,
    resolvers,
});

// Typescript: req has the type NextRequest
const handler = startServerAndCreateNextHandler<NextRequest>(server, {
    context: async req => ({ req }),
});

export { handler as GET, handler as POST };