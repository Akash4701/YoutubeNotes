import { prisma } from "@/lib/db"

const Queries={


}

const Mutations={
     createUser:async(_:any,{name,email,password}:{name:string,email:string,password:string})=>{
        const user=await prisma.user.create({
            data:{
                name,
                email,
                password
            }
        })
        return true



    }


}
export const resolver={Queries,Mutations}