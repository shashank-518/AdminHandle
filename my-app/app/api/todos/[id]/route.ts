import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { PrismaClient } from "@/app/generated/prisma";

const prisma = new PrismaClient()


export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { completed } = await req.json();
    const todoId = params.id;

    const todo = await prisma.todo.findUnique({
      where: { id: todoId },
    });

    if (!todo) {
      return NextResponse.json({ error: "Todo not found" }, { status: 404 });
    }

    if (todo.userId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const updatedTodo = await prisma.todo.update({
      where: { id: todoId },
      data: { completed },
    });

    return NextResponse.json(updatedTodo);
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function DELETE(req:NextRequest , {params}: {params:{id:string}}  ){

    const {userId} = await auth()
    if(!userId){
        return new NextResponse("Unauthorized", {status:401})
    }

    try {

        const todoId = params.id

        const  todo = await prisma.todo.findUnique({
            where:{
                id:todoId
            }
        })

        if(!todo){
            return new NextResponse("Todo not found", { status: 404 });
        }

        if(todo?.userId !== userId){
            return new NextResponse("Frobidden", {status:401})
        }

        await prisma.todo.delete({
            where:{
                id:todoId
            }
        })

        return new NextResponse("Todo deleted", { status: 200 });

        
        
    } catch (error) {
         return NextResponse.json({ message: "Something went wrong" }, { status: 401 });
    }

}