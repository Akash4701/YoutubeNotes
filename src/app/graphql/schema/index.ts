import { mergeTypeDefs, mergeResolvers } from "@graphql-tools/merge";
import { userTypeDefs, userResolvers } from "./user";
import { noteResolvers, noteTypeDefs } from "./notes";

const baseTypeDefs = `
  type Query
  type Mutation
`;

export const typeDefs = mergeTypeDefs([baseTypeDefs, userTypeDefs,noteTypeDefs]);
export const resolvers = mergeResolvers([userResolvers,noteResolvers]);
