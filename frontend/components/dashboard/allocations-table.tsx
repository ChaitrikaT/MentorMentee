"use client"

import { useState, useEffect } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { AddAllocationModal } from "./add-allocation-modal"

type Allocation = {
  id: string
  mentorName: string
  department: string
  menteeName: string
  year: string
  status: "Active" | "Inactive"
}

const statusStyles: Record<string, string> = {
  Active: "bg-emerald-100 text-emerald-700 border-emerald-200",
  Inactive: "bg-red-100 text-red-700 border-red-200",
}

export function AllocationsTable() {
  const [allocations, setAllocations] = useState<Allocation[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  const fetchAllocations = () => {
    fetch('http://localhost:5000/api/allocations')
      .then(r => r.json())
      .then(data => {
        setAllocations(data.map((a: any) => ({
          id: String(a.id),
          mentorName: a.mentor_name,
          department: a.department,
          menteeName: a.mentee_name,
          year: a.academic_year,
          status: a.status
        })))
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }

  useEffect(() => { fetchAllocations() }, [])

  const handleAddAllocation = async (mentorId: string, menteeId: string) => {
    try {
      await fetch('http://localhost:5000/api/allocations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mentor_id: mentorId, mentee_id: menteeId })
      })
      fetchAllocations() // Refresh table from Flask
    } catch {
      alert("Could not save allocation. Make sure Flask is running.")
    }
    setIsModalOpen(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Mentor-Mentee Allocations</h2>
          <p className="mt-1 text-sm text-muted-foreground">Manage and view all mentor-mentee assignments</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Allocation
        </Button>
      </div>

      <div className="rounded-lg border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow className="bg-secondary/50 hover:bg-secondary/50">
              <TableHead className="font-semibold">Mentor Name</TableHead>
              <TableHead className="font-semibold">Department</TableHead>
              <TableHead className="font-semibold">Mentee Name</TableHead>
              <TableHead className="font-semibold">Year</TableHead>
              <TableHead className="font-semibold">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">Loading...</TableCell>
              </TableRow>
            ) : allocations.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">No allocations yet.</TableCell>
              </TableRow>
            ) : allocations.map((allocation) => (
              <TableRow key={allocation.id}>
                <TableCell className="font-medium">{allocation.mentorName}</TableCell>
                <TableCell>{allocation.department}</TableCell>
                <TableCell>{allocation.menteeName}</TableCell>
                <TableCell>{allocation.year}</TableCell>
                <TableCell>
                  <Badge variant="outline" className={statusStyles[allocation.status] || statusStyles.Active}>
                    {allocation.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <AddAllocationModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onAdd={handleAddAllocation}
      />
    </div>
  )
}
