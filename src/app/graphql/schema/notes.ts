import { prisma } from "@/lib/db";
import { gql } from "graphql-tag";
import { parse } from "path";

export const noteTypeDefs = gql`
  type Notes {
    id: ID!
    title: String!
    youtube_url: String!
    pdf_url: String!
    userId: ID!
    contentCreater: String
    thumbnail: String
    channelName: String
  }

  extend type Query {
   hello: String
  }

  extend type Mutation {
    createNotes(title:String,youtube_url:String,pdf_url:String,contentCreater:String,thumbnail:String,channelName:String):Boolean
  }
`;

export const noteResolvers = {
 Query: {
    hello: () => "Hello world!",
  },
  Mutation: {
    createNotes:async(_:any,{title,youtube_url,pdf_url,contentCreater,thumbnail,channelName}:{title:string,youtube_url:string,pdf_url:string,contentCreater:string,thumbnail:string,channelName:string},context:any)=>{
        
        if(!context.user){
            throw new Error("Not authenticated");
        }

        
       
            const notes=await prisma.note.create({
                data:{
                    title,
                    youtube_url,
                    pdf_url,
                    contentCreater,
                    thumbnail,
                    channelName,
                    userId:context.user.uid
                }
            })
            return true;
    
    
    
        }
  },
};
