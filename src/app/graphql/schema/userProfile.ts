import { prisma } from "@/lib/db";
import { gql } from "graphql-tag";

export const userProfileTypeDefs = gql`
  type UserProfile {
  id:ID!
    name: String
    likes: Int
    saves:Int
    ProfileLinks: [ProfileLink]
    profilePic: String
  }
    type UserNavbarProfile{
    id:ID!
    profilePic:String
    }
    type ProfilePic{
    profilePic:String

    }
    type ProfileLink{
    id:String!
    linkName:String
    linkUrl:String
    }
    type UserName{
    name:String
    }

  extend type Query {
    fetchUser(UserId: ID!): UserProfile
    fetchUserNavbarProfile:UserNavbarProfile
  }

  extend type Mutation {
    createUserProfilePic(userId: ID!, profileUrl: String): ProfilePic
    createUserProfileLinks(userId:ID!,   linkName: String!,linkUrl: String!):ProfileLink
      deleteUserProfileLinks(id:String!):Boolean
      createUserName(userId:ID!,name:String):UserName
      viewNote(userId:ID!,noteId:ID!):Boolean
  }
`;

export const userProfileResolvers = {
  Query: {
    fetchUserNavbarProfile: async (_: any, __: any, context: any) => {
  if (!context.user) {
    throw new Error("User is unauthenticated");
  }
  try {
    const user = await prisma.user.findFirst({
      where: { id: context.user.uid },
      select: {
        id: true,
        profilePic: true,
      },
    });

    if (!user) {
      throw new Error("User not found");
    }

    return user;
  } catch (error) {
    console.error('Navbar User fetch failed:', error);
    throw new Error('Failed to fetch Navbar profile');
  }
}
,
    fetchUser: async (_: any, { userId }: { userId: string },context:any) => {
      console.log('userId',userId);
      // if(!context.user){
      //   throw new Error("Unauthenticated user")
      // }
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
          id:true,
          name: true,
          links: true,
          profilePic: true,
          
        },
      });
      return {
        id:user?.id,
        name: user?.name,
        profilePic: user?.profilePic,
        ProfileLinks: user?.links ?? [],
        saves,
        likes,
      };
    },
  },

  Mutation: {
   viewNote: async (_: any, { userId, noteId }: { userId: string; noteId: string }) => {
  try {
    // Try to find an existing view record
    const existing = await prisma.view.findUnique({
      where: {
        noteId_userId:{
        
          userId, 
          noteId
       }
       },
      

    });

    if (existing) {
      // Already viewed — no increment
      return true;
    }

    // Transaction: create view + increment counter safely
    await prisma.$transaction([
      prisma.view.create({
        data: {
          userId,
          noteId,
        },
      }),
      prisma.note.update({
        where: { id: noteId }, // ensure this matches your actual PK
        data: {
          viewsCount: {
            increment: 1,
          },
        },
      }),
    ]);

    return false;
  } catch (error) {
    // If the record already exists (race condition), ignore it
    if (error.code === "P2002") {
      // Unique constraint violation => already viewed
      return true;
    }
    console.error("Error recording view:", error);
    throw error;
  }
},

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
    },

    createUserName:async(_:any,{userId,name}:{userId:string,name:string},context:any)=>{
      try{
        const updatedName=await prisma.user.update({
          where:{
            id:userId
          },
          data:{
            name
          }

        })
         
        return 
          updatedName
        

      }catch(error){
        throw new Error('Failed to set UserName',error.message)
      }

    }
  },
};
