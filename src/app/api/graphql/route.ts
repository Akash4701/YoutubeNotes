import { startServerAndCreateNextHandler } from "@as-integrations/next";
import { ApolloServer } from "@apollo/server";
import { NextRequest } from "next/server";

import { typeDefs ,resolvers} from "@/app/graphql/schema/index";
import { getAuth } from "firebase-admin/auth";




const server = new ApolloServer({
    typeDefs,
    resolvers,
});

// Typescript: req has the type NextRequest
const handler = startServerAndCreateNextHandler<NextRequest>(server, {
    context: async (req) => { 
        const authHeader=req.headers.get("authorisation")
        const token=authHeader?.split("Bearer")[1];

        let user=null;
        if(token){
            try{
            user=await getAuth().verifyIdToken(token);
            }catch{
                user=null;
            }


        }

        return {user};

    },
});

export { handler as GET, handler as POST };