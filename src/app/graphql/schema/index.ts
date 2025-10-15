import { mergeTypeDefs, mergeResolvers } from "@graphql-tools/merge";
import { userTypeDefs, userResolvers } from "./user";
import { noteResolvers, noteTypeDefs } from "./notes";
import { commentResolvers, commentTypeDefs } from "./comments";
import { userProfileResolvers, userProfileTypeDefs } from "./userProfile";

const baseTypeDefs = `
  type Query
  type Mutation
`;

export const typeDefs = mergeTypeDefs([baseTypeDefs, userTypeDefs,noteTypeDefs,commentTypeDefs,userProfileTypeDefs]);
export const resolvers = mergeResolvers([userResolvers,noteResolvers,commentResolvers,userProfileResolvers]);
