import { NextResponse } from 'next/server';
import { findUserByEmail, createUser, findUserByUsername } from '@/lib/users';
import { sendVerificationEmail } from '@/lib/mailer';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

export async function POST(req: Request) {
  try {
    const { email, password, username } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return NextResponse.json({ error: "Email already exists" }, { status: 400 });
    }

    if (username) {
      const existingUsername = await findUserByUsername(username);
      if (existingUsername) {
        return NextResponse.json({ error: "Username already exists" }, { status: 400 });
      }
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const verificationToken = crypto.randomBytes(32).toString('hex');
    await createUser({
      email,
      username,
      passwordHash,
      verificationToken
    });

    await sendVerificationEmail(email, verificationToken);

    return NextResponse.json({ message: "User registered. Please check your email to verify." });
  } catch (error: any) {
    console.error("Register Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
