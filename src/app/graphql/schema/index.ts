import { mergeTypeDefs, mergeResolvers } from "@graphql-tools/merge";
import { userTypeDefs, userResolvers } from "./user";

const baseTypeDefs = `
  type Query
  type Mutation
`;

export const typeDefs = mergeTypeDefs([baseTypeDefs, userTypeDefs]);
export const resolvers = mergeResolvers([userResolvers]);
