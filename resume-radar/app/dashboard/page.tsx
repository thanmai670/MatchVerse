"use client"

import { getServerSession } from "next-auth"
import { authOptions } from "@/app/lib/auth"

import Link from "next/link"
import { Button } from "@/components/ui/button"

export default  function DashboardPage() {
  const session =  getServerSession(authOptions)
  if (!session) {
    // middleware should handle redirect, but double-check
    return <div>Not authenticated</div>
  }

  // In the future, fetch matches from your backend:
  // const matches = await fetchMatchesForUser(session)
  const matches: any[] = [] // Placeholder

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      {matches.length === 0 ? (
        <div className="text-gray-600">No matches found.</div>
      ) : (
        <div>Here we would list the user's matches</div>
      )}

      <div className="mt-4">
        <Link href="/agent/new">
          <Button>Create Agent</Button>
        </Link>
      </div>
    </div>
  )
}
