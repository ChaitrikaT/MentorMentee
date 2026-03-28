"use client"

import { useState, useEffect } from "react"
import {
  Dialog, DialogContent, DialogDescription,
  DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Sparkles } from "lucide-react"

type AddAllocationModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAdd: (mentorId: string, menteeId: string) => void
}

export function AddAllocationModal({ open, onOpenChange, onAdd }: AddAllocationModalProps) {
  const [mentors, setMentors] = useState<any[]>([])
  const [mentees, setMentees] = useState<any[]>([])
  const [selectedMentor, setSelectedMentor] = useState("")
  const [selectedMentee, setSelectedMentee] = useState("")
  const [suggesting, setSuggesting] = useState(false)
  const [suggestionReason, setSuggestionReason] = useState("")

  useEffect(() => {
    if (!open) return
    fetch('http://localhost:5000/api/mentors')
      .then(r => r.json())
      .then(data => setMentors(data))
      .catch(() => setMentors([
        { id: 1, name: "Dr. Kavitha Rao", department: "AI & ML" },
        { id: 2, name: "Prof. Anand Bhat", department: "AI & ML" },
        { id: 3, name: "Dr. Priya Nair", department: "AI & ML" },
        { id: 4, name: "Prof. Suresh Hegde", department: "AI & ML" },
      ]))

    fetch('http://localhost:5000/api/mentees')
      .then(r => r.json())
      .then(data => setMentees(data))
      .catch(() => setMentees([
        { id: 1, name: "Aditya Sharma", academic_year: "1st Year", department: "AI & ML" },
        { id: 2, name: "Sneha Patel", academic_year: "1st Year", department: "AI & ML" },
      ]))
  }, [open])

  const handleAISuggest = async () => {
    setSuggesting(true)
    setSuggestionReason("")
    try {
      const response = await fetch('http://localhost:5000/api/allocations/suggest')
      const suggestions = await response.json()
      if (suggestions.length > 0) {
        const first = suggestions[0]
        setSelectedMentor(String(first.mentor_id))
        setSelectedMentee(String(first.mentee_id))
        setSuggestionReason(`AI Suggestion: ${first.reason}`)
      } else {
        setSuggestionReason("No unallocated mentees found!")
      }
    } catch {
      setSuggestionReason("Could not fetch suggestions.")
    }
    setSuggesting(false)
  }

  const handleSubmit = () => {
    if (selectedMentor && selectedMentee) {
      onAdd(selectedMentor, selectedMentee)
      setSelectedMentor("")
      setSelectedMentee("")
      setSuggestionReason("")
    }
  }

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setSelectedMentor("")
      setSelectedMentee("")
      setSuggestionReason("")
    }
    onOpenChange(open)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Allocation</DialogTitle>
          <DialogDescription>
            Select a mentor and mentee, or use AI to suggest the best match.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-4">
          {/* AI Suggest Button */}
          <Button
            variant="outline"
            onClick={handleAISuggest}
            disabled={suggesting}
            className="w-full gap-2 border-primary/30 text-primary hover:bg-primary/5"
          >
            <Sparkles className="h-4 w-4" />
            {suggesting ? "Finding best match..." : "AI Suggest Best Match"}
          </Button>

          {/* Suggestion reason */}
          {suggestionReason && (
            <div className="rounded-lg bg-primary/5 border border-primary/20 px-3 py-2 text-xs text-primary">
              {suggestionReason}
            </div>
          )}

          {/* Mentor Select */}
          <div className="space-y-2">
            <Label htmlFor="mentor">Select Mentor</Label>
            <Select value={selectedMentor} onValueChange={setSelectedMentor}>
              <SelectTrigger id="mentor" className="w-full">
                <SelectValue placeholder="Choose a mentor" />
              </SelectTrigger>
              <SelectContent>
                {mentors.map((mentor) => (
                  <SelectItem key={mentor.id} value={String(mentor.id)}>
                    <span className="font-medium">{mentor.name}</span>
                    <span className="ml-2 text-muted-foreground">- {mentor.department}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Mentee Select */}
          <div className="space-y-2">
            <Label htmlFor="mentee">Select Mentee</Label>
            <Select value={selectedMentee} onValueChange={setSelectedMentee}>
              <SelectTrigger id="mentee" className="w-full">
                <SelectValue placeholder="Choose a mentee" />
              </SelectTrigger>
              <SelectContent>
                {mentees.map((mentee) => (
                  <SelectItem key={mentee.id} value={String(mentee.id)}>
                    <span className="font-medium">{mentee.name}</span>
                    <span className="ml-2 text-muted-foreground">
                      - {mentee.academic_year}, {mentee.department}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => handleOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={!selectedMentor || !selectedMentee}>
            Add Allocation
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
