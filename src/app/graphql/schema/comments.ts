import { prisma } from "@/lib/db";
import { gql } from "graphql-tag";

export const commentTypeDefs = gql`
  scalar DateTime

  type author{
  name:String
  profilePic:String
  }

  type Comment {
    id: ID!
    content: String!
    authorId: String!
    noteId: ID!
    parentId: ID
   author:author

    createdAt: DateTime
    updatedAt: DateTime
  }

  type Reply {
    id: ID!
    content: String!
    authorId: String!
    replies: [Reply]
    parentId: ID
     author:author
    createdAt: DateTime
    updatedAt: DateTime
    hasMoreReplies: Boolean!
    replyCount: Int!
  }

  extend type Query {
    fetchAllComments(noteId: ID!): [Reply]
    fetchNestedReplies(parentId: ID!, depth: Int): [Reply]
  }

  extend type Mutation {
    createComment(content: String!, noteId: ID!, parentId: String): Comment
  }
`;


// Helper function to fetch replies recursively with depth limit
async function fetchRepliesWithDepth(
  parentId: string,
  currentDepth: number = 0,
  maxDepth: number =2
): Promise<any[]> {
  const replies = await prisma.comment.findMany({
    where: { parentId },
    orderBy: { createdAt: 'asc' }
  });

  const repliesWithNesting = await Promise.all(
    replies.map(async (reply) => {
      const replyCount = await prisma.comment.count({
        where: { parentId: reply.id }
      });

      let nestedReplies = [];
      let hasMoreReplies = false;

      if (currentDepth < maxDepth) {
        nestedReplies = await fetchRepliesWithDepth(
          reply.id,
          currentDepth + 1,
          maxDepth
        );
         hasMoreReplies = replyCount > nestedReplies.length;
      } else {
        // At max depth, check if there are more replies to fetch
         hasMoreReplies = replyCount > 0;
      }

      return {
        id: reply.id,
        content: reply.content,
        authorId: reply.authorId,
        parentId: reply.parentId,
        createdAt: reply.createdAt,
        updatedAt: reply.updatedAt,
        replies: nestedReplies,
        hasMoreReplies:replyCount>0,
        replyCount
      };
    })
  );

  return repliesWithNesting;
}

export const commentResolvers = {
  Query: {
    fetchAllComments: async (_: any, { noteId }: { noteId: string }) => {
      // Fetch top-level comments (parentId is null)
      const topLevelComments = await prisma.comment.findMany({
        where: {
          noteId,
          parentId: null
        },
        orderBy: {
          createdAt: 'desc'
        },
        include:{
          author:{
            select:{
              name:true,
              profilePic:true
            }
          }
        }
      });

      // For each top-level comment, fetch nested replies up to depth 2
      const commentsWithReplies = await Promise.all(
        topLevelComments.map(async (comment) => {
          const replyCount = await prisma.comment.count({
            where: { parentId: comment.id }
          });

          const replies = await fetchRepliesWithDepth(comment.id, 0, 2);

          return {
            id: comment.id,
            content: comment.content,
            authorId: comment.authorId,
            parentId: comment.parentId,
            author:{
              name:comment.author.name,
              profilePic:comment.author.profilePic

            },
            createdAt: comment.createdAt,
            updatedAt: comment.updatedAt,
            replies,
            hasMoreReplies:replyCount>0,
            replyCount
          };
        })
      );

      return commentsWithReplies;
    },

    fetchNestedReplies: async (
      _: any,
      { parentId, depth = 2 }: { parentId: string; depth?: number }
    ) => {
      // Fetch replies for a specific parent, going deeper
      const replies = await fetchRepliesWithDepth(parentId, 0, depth);
      return replies;
    }
  },

  Mutation: {
    createComment: async (
      _: any,
      {
        content,
        noteId,
        parentId
      }: { content: string; noteId: string; parentId?: string },
      context: any
    ) => {
      if (!context.user) {
        throw new Error("Not authenticated");
      }

      const comment = await prisma.comment.create({
        data: {
          content,
          authorId: context.user.user_id,
          noteId,
          ...(parentId && { parentId })
        },
        include:{
          author:{
            select:{
              name:true,
              profilePic:true
            }
          }
        }
      });

      return comment;
    }
  }
};