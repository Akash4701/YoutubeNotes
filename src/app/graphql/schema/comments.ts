import { prisma } from "@/lib/db";
import { gql } from "graphql-tag";

export const commentTypeDefs = gql`
scalar DateTime
  type Comment {
    id: ID!
    content: String!
    authorId:String!
    noteId :ID!
    parentId:ID
    createdAt:DateTime
    updatedAt:DateTime 
  }

  extend type Query {
   hello: String
  }

  extend type Mutation {
    createComment(content:String,noteId:ID,parentId:String):Comment
  }
`;

export const commentResolvers = {
 Query: {

    hello: () => "Hello world!",
  },
  Mutation: {
    
    createComment:async(_:any,{content,noteId,parentId}:{content:string,noteId:string,parentId:string},context:any)=>{
      if(!context.user){
          throw new Error("Not authenticated");
      }
      console.log('authorId',context.user.uid);
      const user = await prisma.user.findUnique({ where: { id: context.user.uid } });
console.log("Matched user:", user);
      console.log('authorId',typeof(context.user.uid));

      
           const comment=await prisma.comment.create({
            data:{
                content,
                authorId: context.user.user_id,
                noteId,
                ...(parentId && { parentId })
            }
           })

           return comment;
        }
  },
};
