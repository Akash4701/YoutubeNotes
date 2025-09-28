import { prisma } from "@/lib/db";
import { gql } from "graphql-tag";

export const userTypeDefs = gql`
  type Comment {
    id: ID!
    content: String!
    authorId:ID!
    noteId :ID!
    parentId:ID
    createdAt:String!
    updatedAt:String!    
  }

  extend type Query {
   hello: String
  }

  extend type Mutation {
    createComment(content:String,noteId:String,parentId:String):Boolean
  }
`;

export const userResolvers = {
 Query: {

    hello: () => "Hello world!",
  },
  Mutation: {
    
    createComment:async(_:any,{content,noteId,parentId}:{content:string,noteId:string,parentId:string},context:any)=>{
      if(!context.user){
          throw new Error("Not authenticated");
      }
      
           const comment=await prisma.comment.create({
            data:{
                content,
                authorId: context.user.uid,
                noteId,
                ...(parentId && { parentId })
            }
           })

           return true;
           
    
    
    
        }
  },
};
