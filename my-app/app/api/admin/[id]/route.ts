import { NextRequest, NextResponse } from "next/server";
import { clerkClient } from "@clerk/nextjs/server";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const client = await clerkClient();
    // console.log("Params:", params);

    const user = await client.users.getUser(params.id);
    // console.log("Fetched user:", user);

    const role = user.privateMetadata?.role;
    console.log("User role:", role);

    const isAdmin = role === "admin";

    return NextResponse.json({ isAdmin, role });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ error: "User not found or bad ID" }, { status: 404 });
  }
}
