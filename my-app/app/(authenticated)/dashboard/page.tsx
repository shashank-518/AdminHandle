"use client";

import { Todo } from "@/app/generated/prisma";
import { useAuth, useUser } from "@clerk/nextjs";
import { useCallback, useEffect, useState } from "react";
import { useDebounceValue } from "usehooks-ts";

export default function Dashboard(){

    const {user} = useUser()
    const {userId} = useAuth()
    const [todos, setTodos] = useState<Todo[]>([])
    const [searchTerm, setSearchTerm] = useState<string>("")
    const [isLoading , setisLoading] = useState(false)
    const [totalPages , setTotalPages] = useState()
    const [currentPage , setcurrentPage] = useState(1)
    const [issubscribed , setissubscribed ] = useState(false)
    const [DebounceSearchTerm] = useDebounceValue(searchTerm, 300)

    const userrole = async (id: string) => {
  try {
    const response = await fetch(`/api/admin/${id}`);

    if (!response.ok) {
      throw new Error("Failed to fetch user role");
    }

    const data = await response.json();

    return data.isAdmin ? "admin" : "user";
  } catch (error) {
    console.error("Error fetching user role:", error);
    return null;
  }
};


console.log(userId);




    
    

    const fetchtodos = useCallback(async(page:number)=>{
        try {
            setisLoading(true)
            const response =await fetch(`/api/todos?page=${page}&search=${DebounceSearchTerm}`)

            if(!response.ok){
                throw new Error("Failed to fetch todos");
            }

            const data = await response.json()
            setTodos(data.todos)
            setTotalPages(data.totalPages)
            setcurrentPage(data.currentPage)
            setisLoading(false)



        } catch (error) {
            setisLoading(false)
        }
    },[DebounceSearchTerm])

    useEffect(()=>{
        // fetchtodos(1)
        // fetchSubscrption()

        const fetchRole = async () => {
    if (user?.id) {
      const role = await userrole(user.id);
      console.log("User role:", role);
    }
  };

  fetchRole();
    },[user])


    const fetchSubscrption = async()=>{

        const response = await fetch(`/api/subscriptions`);

        if(response.ok){
            const data = await response.json()
            setissubscribed(data.isSubscribed)
        }
        

    }

    const handleTodo = async(title :string)=>{

        
        try {
            const response = await fetch('/api/todos',{
                method: 'POST',
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    title:title
                })
            })

            if(!response.ok){
                throw new Error("Failed to fetch todos");
            }

            await fetchtodos(currentPage);

        } catch (error) {
            
        }
    }

    const updateHandleTodo = async(id:string, completed:boolean)=>{

        try {
            const response = await fetch(`/api/todos/${id}`,{
                method: 'PUT',
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    completed:completed
                })
            })

            if(!response.ok){
                throw new Error("Failed to fetch todos");
            }
            
            await fetchtodos(currentPage)
            
        } catch (error) {
            
        }

    }

    const deleteHandleTodo = async(id:string)=>{
    
        try {

            const response = await fetch(`/api/todos/${id}`, {
              method: "DELETE",
            });

             if(!response.ok){
                throw new Error("Failed to fetch todos");
            }
            
            await fetchtodos(currentPage)

            
        } catch (error) {
            
        }
    
    }

    return(
        <h1>Hello World</h1>
    )

}