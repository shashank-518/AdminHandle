import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { PrismaClient } from "@/app/generated/prisma";

const prisma = new PrismaClient()

export async function POST(){

    const {userId} = await auth()

    if(!userId){
        return NextResponse.json({error:'Unauthorized'}, {status:401})
    }
    

    try{
        const user = await prisma.users.findUnique({where : {id : userId}})
        if(!user){
            return NextResponse.json({error:'User not found'}, {status:404})
        }

        const subscrptionEnds = new Date()
        subscrptionEnds.setMonth(subscrptionEnds.getMonth()+1)
        const updateSub = await prisma.users.update({
            where:{id:userId},
            data:{
                isSubscribed :true,
                subscriptionEnd:subscrptionEnds
            }
        })

        return NextResponse.json(
            {message:'Subscription successful' , 
            subscrptionEnds : updateSub.subscriptionEnd
            }, 
            {status:200})


    }
    catch(err){
        console.log(err)
        return NextResponse.json({error:'Internal Server Error'}, {status:500})
    }
}

export async function GET(){

    const {userId} = await auth()

    if(!userId){
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {

        const user = await prisma.users.findUnique({where: {id:userId} ,
        
            select : {
                isSubscribed:true,
                subscriptionEnd:true,
            }
        })

        if(!user){
            return NextResponse.json({error:'User not found'}, {status:404})
        }


        const now = new Date()

        if(user.subscriptionEnd && user.subscriptionEnd < now){
            await prisma.users.update({
                where:{id:userId},
                data:{
                    isSubscribed :false,
                    subscriptionEnd:null
                }
            })
            return NextResponse.json({isSubscribed :false,
                    subscriptionEnd:null})
            }

            return NextResponse.json({
                isSubscribed :user.isSubscribed,
                subscriptionEnd:user.subscriptionEnd
            })
        }
         catch (error) {
            console.log(error)
            return NextResponse.json({error:'Internal Server Error'}, {status:500})
        }

        
        
    }




