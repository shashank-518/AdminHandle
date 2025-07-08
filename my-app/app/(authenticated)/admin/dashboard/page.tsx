"use client";

import React from 'react'
import { useAuth, useUser} from "@clerk/nextjs";
import { useEffect } from 'react';

const Admin = () => {

    const {user} = useUser()

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

    useEffect(()=>{
    
            const fetchRole = async () => {
        if (user?.id) {
          const role = await userrole(user.id);
          console.log("User role:", role);
        }
      };
    
      fetchRole();
        },[user])
    


  return (
    <div>Hello Admin</div>
  )
}

export default Admin