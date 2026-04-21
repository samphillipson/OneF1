import { NextResponse } from 'next/server';
import { findUserByEmail, createUser } from '@/lib/users';
import { sendVerificationEmail } from '@/lib/mailer';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    if (findUserByEmail(email)) {
      return NextResponse.json({ error: "User already exists" }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const id = crypto.randomUUID();

    createUser({
      id,
      email,
      passwordHash,
      isVerified: false,
      verificationToken
    });

    await sendVerificationEmail(email, verificationToken);

    return NextResponse.json({ message: "User registered. Please check your email to verify." });
  } catch (error: any) {
    console.error("Register Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
