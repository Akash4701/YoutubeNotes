import { startServerAndCreateNextHandler } from "@as-integrations/next";
import { ApolloServer } from "@apollo/server";
import { NextRequest } from "next/server";

import { typeDefs ,resolvers} from "@/app/graphql/schema/index";
import { getAuth } from "firebase-admin/auth";
import { adminAuth } from "@/lib/firebase/admin";




const server = new ApolloServer({
    typeDefs,
    resolvers,
});

// Typescript: req has the type NextRequest
const handler = startServerAndCreateNextHandler<NextRequest>(server, {
    context: async (req) => { 
        const authHeader=req.headers.get("authorization")
       
        const token=authHeader?.split("Bearer ")[1];
          console.log(
            "ke cjkd c",token);
        
        let user=null;
        if(token){
            try{
           
            user = await adminAuth.verifyIdToken(token);
            }catch(e){
                console.log("Token verification failed",e);
                user=null;
            }


        }
        console.log('user',user);

        return {user};

    },
});

export { handler as GET, handler as POST };