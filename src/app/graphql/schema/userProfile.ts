import { prisma } from "@/lib/db";
import { gql } from "graphql-tag";

export const userProfileTypeDefs = gql`
  type UserProfile {
    name: String
    
    
    likes: Int
    saves:Int
    ProfileLinks: [ProfileLink]
    profilePic: String
  }
    type ProfilePic{
    profilePic:String

    }
    type ProfileLinks{
    linkName:String
    linkUrl:String
    }

  extend type Query {
    fetchUser(UserId: ID!): UserProfile
  }

  extend type Mutation {
    createUserProfilePic(userId: Id!, profileUrl: String): ProfilePic
    createUserProfileLinks(UserId:Id!,links:String[]):ProfileLinks
  }
`;

export const userProfileResolvers = {
  Query: {
    fetchUser: async (_: any, { userId }: { userId: string }) => {
      const saves = await prisma.savedNote.count({
        where: {
          userId,
        },
      });
      const likes = await prisma.like.count({
        where: {
          liked: true,
          note: {
            userId,
          },
        },
      });

      const user = await prisma.user.findFirst({
        where: {
          id: userId,
        },
        select: {
          name: true,
          links: true,
          profilePic: true,
          
        },
      });
      return {
        name: user?.name,
        profilePic: user?.profilePic,
        links: user?.links ?? [],
        saves,
        likes,
      };
    },
  },

  Mutation: {
    createUserProfilePic: async (
      _: any,
      { userId, userProfilePic }: { userProfilePic: string; userId: string },
      context: any
    ) => {
      if (!context.user) {
        throw new Error("Not authenticated");
      }

      const user = await prisma.user.update({
        where: {
          id: userId,
        },
        data: {
          profilePic: userProfilePic,
        },
        select: {
          profilePic: true,
        },
      });

      return {
        profilePic: user?.profilePic,
      };
    },
    createUserProfileLinks: async (
      _: any,
      {
        userId,
        links,
      }: { userId: string; links: { linkName: string; linkUrl: string } },
      context: any
    ) => {
      if (!context.user) {
        console.log("not authenticated");
      }
      const newOrUpdatedLink = await prisma.userLink.upsert({
        where: {
          id: userId,
        },
        update: {
          linkName: links.linkName,
          linkUrl: links.linkUrl,
        },
        create: {
          userId,
          linkName: links.linkName,
          linkUrl: links.linkUrl,
        },
        select: {
          linkName: true,
          linkUrl: true,
        },
      });

      newOrUpdatedLink;
    },
  },
};
