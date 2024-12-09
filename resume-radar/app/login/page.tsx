"use client"

import { signIn } from "next-auth/react"
import { Button } from "@/components/ui/button"

export default function LoginPage() {
  return (
    <div className="flex flex-col items-center justify-center h-[80vh] gap-4">
      <h1 className="text-2xl font-semibold">Login</h1>
      <Button onClick={() => signIn('keycloak')}>Sign in with Keycloak</Button>
    </div>
  )
}
