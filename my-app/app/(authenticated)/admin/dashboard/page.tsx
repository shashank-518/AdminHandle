"use client";

import React from "react";
import { useUser } from "@clerk/nextjs";
import { SignOutButton } from "@clerk/nextjs";
import { useEffect } from "react";

const Admin = () => {
  const { user } = useUser();
  const [totalCount, setTotalCount] = React.useState(0);
  const [data, setData] = React.useState([]);
  const [role, setRole] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);

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

  const fetchUser = async () => {
    setLoading(true);
    const data = await fetch("/api/admin/users");
    const finalvalue = await data.json();

    setTotalCount(finalvalue.totalCount);
    setData(finalvalue.data);
    setLoading(false);
  };

  useEffect(() => {
    const fetchData = async () => {
      if (user?.id) {
        const fetchedRole = await userrole(user.id);
        setRole(fetchedRole);

        if (fetchedRole === "admin") {
          await fetchUser();
        }
      }
    };
    fetchData();
  }, [user]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-lg text-gray-600 animate-pulse">
          Fetching user data...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 bg-gray-100">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-4 text-center text-gray-800">
          👋 Welcome, Admin
        </h1>
        <div className="flex justify-end">
          <SignOutButton>
            <button className="flex items-center gap-2 px-5 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-medium rounded-xl shadow transition-all duration-200">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1m0-10V4"
                />
              </svg>
              Sign Out
            </button>
          </SignOutButton>
        </div>

        <p className="text-center text-gray-600 mb-8">
          Total Registered Users:{" "}
          <span className="font-semibold">{totalCount}</span>
        </p>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.map((user: any) => (
            <div
              key={user.id}
              className="bg-white rounded-xl shadow-md p-4 hover:shadow-lg transition-all"
            >
              <div className="flex items-center gap-4">
                <div>
                  <h2 className="text-lg font-semibold">
                    {user.username || "No username"}
                  </h2>
                  <p className="text-sm text-gray-600">
                    {user.emailAddresses?.[0]?.emailAddress || "No email"}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    Role: {user.privateMetadata?.role || "N/A"}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {data.length === 0 && (
          <p className="text-center text-gray-500 mt-10">No users found.</p>
        )}
      </div>
    </div>
  );
};

export default Admin;
