import { NextRequest, NextResponse } from "next/server";
import { clerkClient } from "@clerk/nextjs/server";


export async function GET(req:NextRequest){

    try {

        const client = await clerkClient()
        const response = await client.users.getUserList()
        
        return NextResponse.json({
            totalCount : response.totalCount,
            data: response.data
        },{
            status:200
        })
        
    } catch (error) {
        console.log(error);
        
    }

}