"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type AddMentorModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function AddMentorModal({ open, onOpenChange, onSuccess }: AddMentorModalProps) {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [department, setDepartment] = useState("AI & ML")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!name || !email) return
    setIsSubmitting(true)
    
    try {
      const response = await fetch('http://localhost:5000/api/mentors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, department })
      })
      
      if (response.ok) {
        setName("")
        setEmail("")
        onSuccess()
        onOpenChange(false)
      } else {
        alert("Failed to add mentor. Email might already exist.")
      }
    } catch (error) {
      alert("Could not connect to server.")
    }
    setIsSubmitting(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Mentor</DialogTitle>
          <DialogDescription>Add a new faculty member to the MentorBridge system.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Full Name</Label>
            <Input placeholder="e.g. Dr. John Doe" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Email Address (Used for Login)</Label>
            <Input type="email" placeholder="e.g. faculty@sahyadri.edu.in" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Department</Label>
            <Select value={department} onValueChange={setDepartment}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="AI & ML">AI & ML</SelectItem>
                <SelectItem value="Computer Science">Computer Science</SelectItem>
                <SelectItem value="Data Science">Data Science</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={isSubmitting || !name || !email}>
            {isSubmitting ? "Adding..." : "Add Mentor"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}