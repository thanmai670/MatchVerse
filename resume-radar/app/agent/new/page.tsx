"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"

export default function NewAgentPage() {
  const [open, setOpen] = useState(true)
  const [resumeFile, setResumeFile] = useState<File | null>(null)
  const [portal, setPortal] = useState("linkedin")
  const router = useRouter()

  const handleCreateAgent = async () => {
    if (!resumeFile) return
    const formData = new FormData()
    formData.append("resume", resumeFile)
    formData.append("portal", portal)

    const res = await fetch("/api/create-agent", {
      method: "POST",
      body: formData,
    })

    if (res.ok) {
      router.push("/dashboard")
    } else {
      alert("Error creating agent")
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create a New Agent</DialogTitle>
        </DialogHeader>
        <div className="my-4 space-y-4">
          <div>
            <label className="block mb-1">Resume:</label>
            <Input type="file" onChange={e => {
              if (e.target.files?.[0]) setResumeFile(e.target.files[0])
            }} />
          </div>
          <div>
            <label className="block mb-1">Job Portal:</label>
            <select
              className="border border-gray-300 rounded p-2 w-full"
              value={portal}
              onChange={(e) => setPortal(e.target.value)}
            >
              <option value="linkedin">LinkedIn</option>
              {/* Future: Add more portals */}
            </select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="secondary" onClick={() => router.push("/dashboard")}>Cancel</Button>
          <Button onClick={handleCreateAgent}>Create</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
