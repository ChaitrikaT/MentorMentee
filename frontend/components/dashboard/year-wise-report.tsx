"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Bar, BarChart, XAxis, YAxis, CartesianGrid } from "recharts"
import { Download } from "lucide-react"

const chartConfig = {
  interactions: { label: "Interactions", color: "var(--primary)" },
}

export function YearWiseReport() {
  const [yearData, setYearData] = useState<{year: string, interactions: number}[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('http://localhost:5000/api/reports/yearwise')
      .then(r => r.json())
      .then(data => {
        setYearData(data.map((d: any) => ({
          year: d.academic_year,
          interactions: d.total_interactions
        })))
        setLoading(false)
      })
      .catch(() => {
        // Fallback sample data
        setYearData([
          { year: "1st Year", interactions: 12 },
          { year: "2nd Year", interactions: 18 },
          { year: "3rd Year", interactions: 15 },
          { year: "4th Year", interactions: 9 },
        ])
        setLoading(false)
      })
  }, [])

  const handleDownloadPDF = () => {
    window.open('http://localhost:5000/api/reports/pdf/yearwise', '_blank')
  }

  const totalInteractions = yearData.reduce((sum, item) => sum + item.interactions, 0)
  const avgInteractions = yearData.length ? Math.round(totalInteractions / yearData.length) : 0
  const maxYear = yearData.length ? yearData.reduce((max, item) => item.interactions > max.interactions ? item : max, yearData[0]) : null

  return (
    <div className="space-y-6">
      {/* Download button */}
      <div className="flex justify-end">
        <Button onClick={handleDownloadPDF} className="gap-2">
          <Download className="h-4 w-4" />
          Download PDF
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Interactions</CardDescription>
            <CardTitle className="text-3xl font-bold text-primary">{totalInteractions}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Across all academic years</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Average per Year</CardDescription>
            <CardTitle className="text-3xl font-bold text-primary">{avgInteractions}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Interactions per academic year</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Most Active Year</CardDescription>
            <CardTitle className="text-3xl font-bold text-primary">{maxYear?.year || '-'}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">{maxYear?.interactions || 0} interactions recorded</p>
          </CardContent>
        </Card>
      </div>

      {/* Bar Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Interactions by Academic Year</CardTitle>
          <CardDescription>Number of mentor-mentee interactions per year</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-center text-muted-foreground py-8">Loading chart...</p>
          ) : (
            <ChartContainer config={chartConfig} className="h-[350px] w-full">
              <BarChart data={yearData} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="year" tickLine={false} axisLine={false} tickMargin={10} />
                <YAxis tickLine={false} axisLine={false} tickMargin={10} />
                <ChartTooltip content={<ChartTooltipContent />} cursor={{ fill: "var(--secondary)", opacity: 0.5 }} />
                <Bar dataKey="interactions" fill="var(--primary)" radius={[4, 4, 0, 0]} maxBarSize={80} />
              </BarChart>
            </ChartContainer>
          )}
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Year-wise Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Academic Year</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Interactions</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">% of Total</th>
                </tr>
              </thead>
              <tbody>
                {yearData.map((item) => (
                  <tr key={item.year} className="border-b border-border last:border-0">
                    <td className="py-3 px-4 text-sm font-medium">{item.year}</td>
                    <td className="py-3 px-4 text-sm">{item.interactions}</td>
                    <td className="py-3 px-4 text-sm text-muted-foreground">
                      {totalInteractions ? ((item.interactions / totalInteractions) * 100).toFixed(1) : 0}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
