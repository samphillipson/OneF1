import NextAuth from "next-auth"
import GithubProvider from "next-auth/providers/github"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"
import { findUserByEmail } from "@/lib/users"
import bcrypt from "bcryptjs"

const handler = NextAuth({
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID || "mock-client-id",
      clientSecret: process.env.GITHUB_SECRET || "mock-client-secret",
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_ID || "mock-google-id",
      clientSecret: process.env.GOOGLE_SECRET || "mock-google-secret",
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "test@example.com" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Missing email or password");
        }
        
        const user = findUserByEmail(credentials.email);
        if (!user) {
          throw new Error("Invalid credentials");
        }

        const isValid = await bcrypt.compare(credentials.password, user.passwordHash);
        if (!isValid) {
          throw new Error("Invalid credentials");
        }

        if (!user.isVerified) {
          throw new Error("Please verify your email address before signing in");
        }

        return { id: user.id, email: user.email };
      }
    })
  ],
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: "jwt"
  }
})

export { handler as GET, handler as POST }
