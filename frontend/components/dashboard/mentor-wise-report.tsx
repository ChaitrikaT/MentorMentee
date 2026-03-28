"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Users, MessageSquare, TrendingUp, Download } from "lucide-react"

export function MentorWiseReport() {
  const [mentorData, setMentorData] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)
  const [role, setRole] = useState<string>("admin")
  const [email, setEmail] = useState<string>("")

  useEffect(() => {
    const storedRole = localStorage.getItem("userRole") || "admin"
    const storedEmail = localStorage.getItem("userEmail") || ""
    setRole(storedRole)
    setEmail(storedEmail)

    let url = 'http://localhost:5000/api/reports/mentorwise'
    if (storedRole === 'mentor' && storedEmail) {
      url += `?email=${encodeURIComponent(storedEmail)}`
    }

    fetch(url)
      .then(r => r.json())
      .then(data => { setMentorData(data); setLoading(false) })
      .catch(() => { setLoading(false) })
  }, [])

  const handleDownloadPDF = () => {
    if (role === 'mentor' && email) {
      // Mentor downloads only their own mentee list
      window.open(`http://localhost:5000/api/reports/pdf/mentor-mentees?email=${encodeURIComponent(email)}`, '_blank')
    } else {
      // Admin downloads full mentor-wise report
      window.open('http://localhost:5000/api/reports/pdf/mentorwise', '_blank')
    }
  }

  const filteredMentors = mentorData.filter(m =>
    m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.department.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const totalInteractions = mentorData.reduce((sum, m) => sum + (m.total_interactions || 0), 0)
  const totalMentees = mentorData.reduce((sum, m) => sum + (m.mentee_count || 0), 0)

  const isMentorView = role === 'mentor'

  return (
    <div className="space-y-6">
      {/* Download button */}
      <div className="flex justify-end">
        <Button onClick={handleDownloadPDF} className="gap-2">
          <Download className="h-4 w-4" />
          {isMentorView ? "Download My Mentee List" : "Download PDF"}
        </Button>
      </div>

      {/* Summary Cards — context aware */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardDescription>{isMentorView ? "My Profile" : "Total Mentors"}</CardDescription>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{isMentorView ? "1" : mentorData.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardDescription>{isMentorView ? "My Mentees" : "Total Mentees"}</CardDescription>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{totalMentees}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardDescription>{isMentorView ? "My Interactions" : "Total Interactions"}</CardDescription>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{totalInteractions}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardDescription>Avg per Mentor</CardDescription>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {mentorData.length ? Math.round(totalInteractions / mentorData.length) : 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>{isMentorView ? "My Mentee Summary" : "Mentor Summary"}</CardTitle>
              <CardDescription>
                {isMentorView
                  ? "Your assigned mentees and interaction counts"
                  : "Overview of all mentors and their interaction counts"}
              </CardDescription>
            </div>
            {!isMentorView && (
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search mentors..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-secondary/50">
                  <TableHead>{isMentorView ? "Mentor Name" : "Mentor Name"}</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead className="text-center">Mentees</TableHead>
                  <TableHead className="text-center">Total Interactions</TableHead>
                  <TableHead>Last Active</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">Loading...</TableCell>
                  </TableRow>
                ) : filteredMentors.map((mentor) => (
                  <TableRow key={mentor.id}>
                    <TableCell className="font-medium">{mentor.name}</TableCell>
                    <TableCell className="text-muted-foreground">{mentor.department}</TableCell>
                    <TableCell className="text-center">{mentor.mentee_count}</TableCell>
                    <TableCell className="text-center font-medium">{mentor.total_interactions}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {mentor.last_active
                        ? new Date(mentor.last_active).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })
                        : 'No interactions'}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge className={mentor.total_interactions > 0
                        ? "bg-green-100 text-green-700 hover:bg-green-100"
                        : "bg-red-100 text-red-700 hover:bg-red-100"}>
                        {mentor.total_interactions > 0 ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            Showing {filteredMentors.length} of {mentorData.length} {isMentorView ? "entries" : "mentors"}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
