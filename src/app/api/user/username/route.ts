import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { findUserByEmail, updateUser, findUserByUsername } from "@/lib/users";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { newUsername } = body;

    if (!newUsername) {
      return NextResponse.json({ error: "Missing new username" }, { status: 400 });
    }

    const user = await findUserByEmail(session.user.email);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if new username is already in use
    const existingUser = await findUserByUsername(newUsername);
    if (existingUser && existingUser.id !== user.id) {
      return NextResponse.json({ error: "Username is already in use" }, { status: 400 });
    }

    await updateUser(user.id, { 
      username: newUsername.toLowerCase()
    });

    return NextResponse.json({ success: true, message: "Username updated successfully." });

  } catch (error: any) {
    console.error("Username update error:", error);
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 });
  }
}
