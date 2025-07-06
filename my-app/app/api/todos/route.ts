import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { PrismaClient } from "@/app/generated/prisma";

const prisma = new PrismaClient()

const ITEMS_PER_PAGE = 10;


export async function GET(req:NextRequest){

    const {userId} = await auth()
    
    if(!userId){
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const {searchParams} = new URL(req.url)
    const page = parseInt(searchParams.get("page") || "1")
    const search = searchParams.get("search") || ""

    try {

        const todos = await prisma.todo.findMany({
            where:{
                userId,
                title:{
                    contains:search,
                    mode:"insensitive"
                },
                
            },
            orderBy:{
                createdAt:"desc"
            },
            take:ITEMS_PER_PAGE,
            skip:(page-1)*ITEMS_PER_PAGE
        })


        const count = await prisma.todo.count({
            where:{
                userId,
                title:{
                    contains:search,
                    mode:"insensitive"
                }
            }
        })

        const totalPages = Math.ceil(count/ITEMS_PER_PAGE)

        return NextResponse.json({
            todos,
            totalPages,
            currentPage : page
        })


        
    } catch (error) {
        return NextResponse.json({ message: "Something went wrong" }, { status: 401 });
    }





}


export async function POST(req:NextRequest){

    const {userId} = await auth()
    
    if(!userId){
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.users.findUnique({
        where:{
            id:userId
        },
        include:{
            todos:true
        }
    })

    if(!user){
        return NextResponse.json({message : "No user was found"}, {status :200})
    }

    if(!user.isSubscribed && user.todos.length >= 3){
        return NextResponse.json(
          { error: "You have reached the maximum limit of todos" },
          { status: 200 }
        );
    }

    const {title} = await req.json()
    const todo = await prisma.todo.create({
        data:{
            title,
            userId
        }
    })

    return NextResponse.json(todo, { status: 201 });


}