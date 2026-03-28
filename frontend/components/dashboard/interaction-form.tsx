"use client"

import { useState, useEffect  } from "react"
import { format } from "date-fns"
import { CalendarIcon, Users, Video, Phone } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

// Sample mentee data
const [mentees, setMentees] = useState<{id: string, name: string, year: string, department: string}[]>([])

useEffect(() => {
  fetch('http://localhost:5000/api/mentees')
    .then(r => r.json())
    .then(data => setMentees(data.map((m: any) => ({
      id: String(m.id),
      name: m.name,
      year: m.academic_year,
      department: m.department
    }))))
}, [])
const interactionModes = [
  { value: "in-person", label: "In-Person", icon: Users },
  { value: "online", label: "Online", icon: Video },
  { value: "phone", label: "Phone", icon: Phone },
]

export function InteractionForm() {
  const [selectedMentee, setSelectedMentee] = useState("")
  const [interactionDate, setInteractionDate] = useState<Date>()
  const [interactionMode, setInteractionMode] = useState("")
  const [discussionNotes, setDiscussionNotes] = useState("")
  const [actionItems, setActionItems] = useState("")
  const [nextMeetingDate, setNextMeetingDate] = useState<Date>()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      const response = await fetch('http://localhost:5000/api/interactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          allocation_id: selectedMentee,
          date: interactionDate ? format(interactionDate, 'yyyy-MM-dd') : '',
          mode: interactionMode,
          notes: discussionNotes,
          action_items: actionItems,
          next_meeting_date: nextMeetingDate ? format(nextMeetingDate, 'yyyy-MM-dd') : ''
        })
      })
      
      if (response.ok) {
        setSelectedMentee("")
        setInteractionDate(undefined)
        setInteractionMode("")
        setDiscussionNotes("")
        setActionItems("")
        setNextMeetingDate(undefined)
        alert("Interaction logged successfully!")
      }
    } catch (error) {
      alert("Error connecting to server. Please try again.")
    }
    
    setIsSubmitting(false)
  }

  return (
    <Card className="max-w-2xl border-border shadow-sm">
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Mentee Selection */}
          <div className="space-y-2">
            <Label htmlFor="mentee">Select Mentee</Label>
            <Select value={selectedMentee} onValueChange={setSelectedMentee}>
              <SelectTrigger id="mentee" className="w-full">
                <SelectValue placeholder="Choose a mentee" />
              </SelectTrigger>
              <SelectContent>
                {mentees.map((mentee) => (
                  <SelectItem key={mentee.id} value={mentee.id}>
                    <span className="font-medium">{mentee.name}</span>
                    <span className="text-muted-foreground ml-2">
                      ({mentee.year}, {mentee.department})
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Interaction Date */}
          <div className="space-y-2">
            <Label>Date of Interaction</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !interactionDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {interactionDate ? format(interactionDate, "PPP") : "Select date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={interactionDate}
                  onSelect={setInteractionDate}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Mode of Interaction */}
          <div className="space-y-2">
            <Label htmlFor="mode">Mode of Interaction</Label>
            <Select value={interactionMode} onValueChange={setInteractionMode}>
              <SelectTrigger id="mode" className="w-full">
                <SelectValue placeholder="Select interaction mode" />
              </SelectTrigger>
              <SelectContent>
                {interactionModes.map((mode) => {
                  const Icon = mode.icon
                  return (
                    <SelectItem key={mode.value} value={mode.value}>
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4 text-muted-foreground" />
                        <span>{mode.label}</span>
                      </div>
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>
          </div>

          {/* Discussion Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Discussion Notes</Label>
            <Textarea
              id="notes"
              placeholder="Summarize the key points discussed during the session..."
              value={discussionNotes}
              onChange={(e) => setDiscussionNotes(e.target.value)}
              className="min-h-[120px] resize-none"
            />
          </div>

          {/* Action Items */}
          <div className="space-y-2">
            <Label htmlFor="actions">Action Items</Label>
            <Textarea
              id="actions"
              placeholder="List the action items and tasks agreed upon..."
              value={actionItems}
              onChange={(e) => setActionItems(e.target.value)}
              className="min-h-[100px] resize-none"
            />
          </div>

          {/* Next Meeting Date */}
          <div className="space-y-2">
            <Label>Next Meeting Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !nextMeetingDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {nextMeetingDate ? format(nextMeetingDate, "PPP") : "Select date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={nextMeetingDate}
                  onSelect={setNextMeetingDate}
                  disabled={(date) => date < new Date()}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Submit Button */}
          <Button 
            type="submit" 
            className="w-full"
            disabled={isSubmitting || !selectedMentee || !interactionDate || !interactionMode}
          >
            {isSubmitting ? "Submitting..." : "Submit Interaction"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
