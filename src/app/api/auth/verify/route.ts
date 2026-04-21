import { NextResponse } from 'next/server';
import { findUserByVerificationToken, updateUser } from '@/lib/users';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get('token');

  if (!token) {
    return NextResponse.json({ error: "Missing token" }, { status: 400 });
  }

  const user = findUserByVerificationToken(token);

  if (!user) {
    return NextResponse.json({ error: "Invalid or expired token" }, { status: 400 });
  }

  updateUser(user.id, { isVerified: true, verificationToken: undefined });

  // Redirect to login page with a success flag
  return NextResponse.redirect(new URL('/login?verified=true', req.url));
}
