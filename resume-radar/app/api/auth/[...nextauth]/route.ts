import NextAuth from "next-auth"
import KeycloakProvider from "next-auth/providers/keycloak"
import { NextAuthOptions } from "next-auth"
import { authOptions } from "@/app/lib/auth"

// export const authOptions: NextAuthOptions = {
//   providers: [
//     KeycloakProvider({
//       clientId: process.env.KEYCLOAK_CLIENT_ID!,
//       clientSecret: process.env.KEYCLOAK_CLIENT_SECRET!,
//       issuer: process.env.KEYCLOAK_ISSUER!
//     })
//   ],
//   callbacks: {
//     async session({ session, token }) {
//       return session
//     }
//   }
// }

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
