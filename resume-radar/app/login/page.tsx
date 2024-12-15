"use client"

import { signIn } from "next-auth/react"
import { useSearchParams } from "next/navigation"

export default function LoginPage() {
  const searchParams = useSearchParams()
  const error = searchParams.get("error")

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
        <div className="text-center">
          <h2 className="text-3xl font-bold">Sign in to your account</h2>
          {error && (
            <div className="mt-4 p-4 bg-red-50 text-red-500 rounded">
              Authentication error. Please try again.
            </div>
          )}
        </div>
        <div className="mt-8">
          <button
            onClick={() => signIn("keycloak", { callbackUrl: "/dashboard" })}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Sign in with Keycloak
          </button>
        </div>
      </div>
    </div>
  )
}
