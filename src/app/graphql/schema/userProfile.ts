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
    type ProfileLink{
    id:String!
    linkName:String
    linkUrl:String
    }

  extend type Query {
    fetchUser(UserId: ID!): UserProfile
  }

  extend type Mutation {
    createUserProfilePic(userId: ID!, profileUrl: String): ProfilePic
    createUserProfileLinks(userId:ID!,   linkName: String!
      linkUrl: String!):ProfileLink
      deleteUserProfileLinks(id:String!):Boolean
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
        ProfileLinks: user?.links ?? [],
        saves,
        likes,
      };
    },
  },

  Mutation: {
    createUserProfilePic: async (
      _: any,
      { userId, profileUrl }: { profileUrl: string; userId: string },
      context: any
    ) => {
    

      const user = await prisma.user.update({
        where: {
          id: userId,
        },
        data: {
          profilePic: profileUrl,
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
        linkName,
        linkUrl
      }: { userId: string; linkName: string; linkUrl: string  },
      context: any
    ) => {
      // if (!context.user) {
      //   console.log("not authenticated");
      // }
      const newOrUpdatedLink = await prisma.userLink.upsert({
        where: {
          userId_linkUrl:{
           userId,
           linkUrl
          }
        },
        update: {
          linkName: linkName,
          linkUrl: linkUrl,
        },
        create: {
          userId,
          linkName: linkName,
          linkUrl: linkUrl,
        },
        select: {
          id:true,
          linkName: true,
          linkUrl: true,
        },
      });

     

      return {
        id:newOrUpdatedLink.id,
        linkName:newOrUpdatedLink.linkName,
        linkUrl:newOrUpdatedLink.linkUrl
      }
    },

    deleteUserProfileLinks:async(
      _: any,
      {
        id
        
        
      }: { id: string  },
      context: any
    )=>{
      try{
        const deletedLinks=await prisma.userLink.delete({
          where: {
          
          id:id
          
        },
        })

        return true;

      }catch(error){
        console.log('Deletion of links is not successful',error.message)
      }
    }
  },
};
