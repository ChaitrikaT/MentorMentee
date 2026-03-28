"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Download, Calendar, MessageSquare, CheckCircle2, User } from "lucide-react"

export function IndividualReport() {
  const [pairs, setPairs] = useState<{id: string, mentor: string, mentee: string, department: string}[]>([])
  const [selectedPair, setSelectedPair] = useState<string>("")
  const [interactions, setInteractions] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetch('http://localhost:5000/api/allocations')
      .then(r => r.json())
      .then(data => setPairs(data.map((a: any) => ({
        id: String(a.id),
        mentor: a.mentor_name,
        mentee: a.mentee_name,
        department: a.department
      }))))
      .catch(() => console.error('Could not load pairs'))
  }, [])

  useEffect(() => {
    if (!selectedPair) return
    setLoading(true)
    fetch(`http://localhost:5000/api/interactions/${selectedPair}`)
      .then(r => r.json())
      .then(data => { setInteractions(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [selectedPair])

  const handleDownloadPDF = () => {
    window.open(`http://localhost:5000/api/reports/pdf/individual/${selectedPair}`, '_blank')
  }

  const selectedPairData = pairs.find(p => p.id === selectedPair)

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Select Mentor-Mentee Pair</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-4">
            <div className="flex-1 max-w-md space-y-2">
              <Label htmlFor="pair-select">Mentor-Mentee Pair</Label>
              <Select value={selectedPair} onValueChange={setSelectedPair}>
                <SelectTrigger id="pair-select">
                  <SelectValue placeholder="Select a pair" />
                </SelectTrigger>
                <SelectContent>
                  {pairs.map((pair) => (
                    <SelectItem key={pair.id} value={pair.id}>
                      {pair.mentor} — {pair.mentee} ({pair.department})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {selectedPair && (
              <Button onClick={handleDownloadPDF} className="gap-2">
                <Download className="h-4 w-4" />
                Download PDF
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {selectedPair && selectedPairData && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg">Interaction Timeline</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                <span className="font-medium">{selectedPairData.mentor}</span> with <span className="font-medium">{selectedPairData.mentee}</span>
              </p>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MessageSquare className="h-4 w-4" />
              {interactions.length} interactions
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-muted-foreground text-center py-8">Loading interactions...</p>
            ) : interactions.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No interactions logged yet for this pair.</p>
            ) : (
              <div className="relative">
                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />
                <div className="space-y-8">
                  {interactions.map((interaction) => (
                    <div key={interaction.id} className="relative pl-10">
                      <div className="absolute left-2 top-1 h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                        <CheckCircle2 className="h-3 w-3 text-primary-foreground" />
                      </div>
                      <div className="bg-secondary/50 rounded-lg p-4 border border-border">
                        <div className="flex items-center gap-3 mb-3">
                          <span className="inline-flex items-center gap-1.5 text-sm font-medium">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            {new Date(interaction.date).toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })}
                          </span>
                          <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                            {interaction.mode}
                          </span>
                        </div>
                        <div className="space-y-3">
                          <div>
                            <h4 className="text-sm font-medium mb-1">Discussion Notes</h4>
                            <p className="text-sm text-muted-foreground">{interaction.notes || '-'}</p>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium mb-1">Action Items</h4>
                            <p className="text-sm text-muted-foreground">{interaction.action_items || '-'}</p>
                          </div>
                          {interaction.next_meeting_date && (
                            <div>
                              <h4 className="text-sm font-medium mb-1">Next Meeting</h4>
                              <p className="text-sm text-muted-foreground">{interaction.next_meeting_date}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {!selectedPair && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="rounded-full bg-secondary p-4 mb-4">
              <User className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium mb-1">No Pair Selected</h3>
            <p className="text-sm text-muted-foreground max-w-sm">
              Select a mentor-mentee pair from the dropdown above to view their interaction timeline.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
