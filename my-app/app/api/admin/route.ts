
import {  clerkClient } from "@clerk/nextjs/server";

export async function GET(userId:string){

    const client = await clerkClient()

    const user = await client.users.getUser(userId);

    return user.privateMetadata.role === "admin"

}