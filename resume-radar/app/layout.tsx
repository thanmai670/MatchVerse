import "./globals.css"
import { Inter } from "next/font/google"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/lib/auth"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { SignOutButton } from "@/components/SingOutButton" // Import the new client component
import Providers from '@/app/components/Providers'

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Job Matching App",
  description: "A platform for resume-job matching"
}

export default async function  RootLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)

  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <header className="p-4 border-b flex justify-between">
            <Link href="/">
              <div className="font-bold text-xl">Job Matching</div>
            </Link>
            <div>
              {session ? (
                // Use the client-side button here
                <SignOutButton />
              ) : (
                <Link href="/login">
                  <Button variant="secondary">Login</Button>
                </Link>
              )}
            </div>
          </header>
          {children}
        </Providers>
      </body>
    </html>
  )
}
