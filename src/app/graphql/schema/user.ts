import { prisma } from "@/lib/db";
import { gql } from "graphql-tag";

export const userTypeDefs = gql`
  type User {
    id: ID!
    name: String!
    email: String!
    password: String!
  }

  extend type Query {
   hello: String
  }

  extend type Mutation {
    createUser(profilePic:String,name:String,email:String,password:String):Boolean
  }
`;

export const userResolvers = {
 Query: {

    hello: () => "Hello world!",
  },
  Mutation: {
    
    createUser:async(_:any,{profilePic,name,email,password}:{profilePic:string,name:string,email:string,password:string},context:any)=>{
      if(!context.user){
          throw new Error("Not authenticated");
      }
      
            const user=await prisma.user.create({
                data:{
                  id:context.user.uid,
                  profilePic,
                    name,
                    email,
                    password
                }
            })
            return true;
    
    
    
        }
  },
};
