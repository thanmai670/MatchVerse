// lib/auth.ts
import "next-auth/jwt"
import { DefaultSession } from "next-auth"

// Extend the built-in session type
declare module "next-auth" {
  interface Session extends DefaultSession {
    accessToken?: string
  }
}

// Extend the built-in JWT type
declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string
  }
}

import { NextAuthOptions } from "next-auth"
import KeycloakProvider from "next-auth/providers/keycloak"

export const authOptions: NextAuthOptions = {
  providers: [
    KeycloakProvider({
      clientId: process.env.KEYCLOAK_CLIENT_ID!,
      clientSecret: process.env.KEYCLOAK_CLIENT_SECRET!,
      issuer: process.env.KEYCLOAK_ISSUER,
    }),
  ],
  callbacks: {
    async jwt({ token, account }) {
      if (account) {
        token.accessToken = account.access_token
      }
      return token
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken
      return session
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  session: {
    strategy: "jwt",
  },
  debug: process.env.NODE_ENV === 'development',
}
