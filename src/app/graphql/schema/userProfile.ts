import { prisma } from "@/lib/db";
import { gql } from "graphql-tag";

export const userProfileTypeDefs = gql`
  
  type userProfile{
  name:String
  rating:Float
  views:Int
 likes:Int
 Views:Int
 ProfileLinks:String
 profileUrl:String


  }


 

  extend type Query {
    fetchUser(UserId: ID!): [userProfile]
    
  }

  extend type Mutation {
    createUserProfilePic(UserId:Id!,profileUrl:String):[profilePic]
  }
`;



export const userProfileResolvers = {
  Query: {
    fetchUser: async (_: any, { userId }: { userId: string }) => {
     const saves=await prisma.savedNote.count({
      where:{
        userId
      }
     })
    const likes=await prisma.like.count({
      where:{
        liked:true,
        note:{
          userId
        }
      },
      })

      const links=await prisma.user.findFirst({
        where:{
          id:userId
        },
        select:{
          links:true,
          profilePic:true
        }
      })


    },

    
  Mutation: {
    createUserProfilePic: async (
      _: any,
      {
        userId,
        userProfilePic,
        
      }: { userProfilePic: string; userId: string;  },
      context: any
    ) => {
      if (!context.user) {
        throw new Error("Not authenticated");
      }

      const user = await prisma.user.update({
        where:{
          id:userId

        },
        data:{
        
          profilePic:userProfilePic
        },
        select:{
          profilePic:true
        }


        
      });
      

      
    }
  }
},
}