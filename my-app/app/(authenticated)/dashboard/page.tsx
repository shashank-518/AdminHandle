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

        return (
  <div className="min-h-screen bg-gray-100 p-6">
    <div className="max-w-3xl mx-auto bg-white p-6 rounded-xl shadow-md">
      <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">📋 My Todo Dashboard</h1>

      {/* Search and Add */}
      <div className="flex items-center gap-2 mb-4">
        <input
          type="text"
          placeholder="Search todos..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </div>

      {/* Add Todo */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const title = e.currentTarget.todo.value;
          if (title) handleTodo(title);
          e.currentTarget.reset();
        }}
        className="flex gap-2 mb-6"
      >
        <input
          name="todo"
          placeholder="Add a new todo..."
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
        />
        <button
          type="submit"
          className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition"
        >
          Add
        </button>
      </form>

      {/* Loading */}
      {isLoading && (
        <p className="text-center text-gray-500 mb-4 animate-pulse">Loading todos...</p>
      )}

      {/* Todos */}
      <ul className="space-y-3">
        {todos.map((todo) => (
          <li
            key={todo.id}
            className="flex items-center justify-between bg-gray-50 px-4 py-2 rounded-lg border"
          >
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={todo.completed}
                onChange={() => updateHandleTodo(todo.id, !todo.completed)}
                className="h-5 w-5"
              />
              <span className={`text-gray-800 ${todo.completed ? "line-through" : ""}`}>
                {todo.title}
              </span>
            </div>
            <button
              onClick={() => deleteHandleTodo(todo.id)}
              className="text-red-500 hover:text-red-700 transition"
            >
              🗑
            </button>
          </li>
        ))}
      </ul>

      {/* No Todos */}
      {!isLoading && todos.length === 0 && (
        <p className="text-center text-gray-500 mt-6">No todos found.</p>
      )}

      {/* Pagination */}
      {totalPages && totalPages > 1 && (
        <div className="flex justify-center mt-6 gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => fetchtodos(page)}
              className={`px-3 py-1 rounded-lg border ${
                currentPage === page
                  ? "bg-blue-500 text-white"
                  : "bg-white text-gray-700 hover:bg-blue-100"
              }`}
            >
              {page}
            </button>
          ))}
        </div>
      )}

      {/* Subscription */}
      <div className="mt-8 text-center text-sm text-gray-500">
        {issubscribed ? (
          <span className="px-3 py-1 bg-green-100 text-green-600 rounded-full font-medium">
            ✅ Subscribed
          </span>
        ) : (
          <span className="px-3 py-1 bg-yellow-100 text-yellow-600 rounded-full font-medium">
            ⚠️ Not Subscribed
          </span>
        )}
      </div>
    </div>
  </div>
);
    

}