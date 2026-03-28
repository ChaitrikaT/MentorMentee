"use client"

import { useState, useEffect } from "react"
import { RefreshCw, AlertTriangle, AlertCircle, CheckCircle, Sparkles, Calendar, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type StudentStatus = "at-risk" | "needs-attention" | "on-track"

interface StudentInsight {
  id: string
  menteeName: string
  mentorName: string
  lastInteractionDate: string
  daysSinceInteraction: number
  status: StudentStatus
  aiSuggestion: string
}

const statusConfig = {
  "at-risk": {
    label: "At Risk",
    bgColor: "bg-red-50 border-red-200",
    headerBg: "bg-red-100",
    textColor: "text-red-700",
    icon: AlertTriangle,
    iconColor: "text-red-500"
  },
  "needs-attention": {
    label: "Needs Attention",
    bgColor: "bg-amber-50 border-amber-200",
    headerBg: "bg-amber-100",
    textColor: "text-amber-700",
    icon: AlertCircle,
    iconColor: "text-amber-500"
  },
  "on-track": {
    label: "On Track",
    bgColor: "bg-green-50 border-green-200",
    headerBg: "bg-green-100",
    textColor: "text-green-700",
    icon: CheckCircle,
    iconColor: "text-green-500"
  }
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric"
  })
}

export function AIInsightsGrid() {
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [insights, setInsights] = useState<StudentInsight[]>([])
  const [error, setError] = useState<string | null>(null)

  const handleRefresh = async () => {
    setIsRefreshing(true)
    setError(null)
    try {
      const response = await fetch('http://localhost:5000/api/ai/insights')
      const data = await response.json()
      setInsights(data.map((item: any) => ({
        id: String(item.id || Math.random()),
        menteeName: item.mentee_name,
        mentorName: item.mentor_name,
        lastInteractionDate: item.last_interaction || '2026-01-01',
        daysSinceInteraction: Math.floor(
          (new Date().getTime() - new Date(item.last_interaction || '2026-01-01').getTime())
          / (1000 * 60 * 60 * 24)
        ),
        status: item.status === 'At Risk' 
          ? 'at-risk' 
          : item.status === 'Needs Attention' 
          ? 'needs-attention' 
          : 'on-track',
        aiSuggestion: item.suggestion
      })))
    } catch (error) {
      setError("Could not connect to server. Showing sample data.")
      console.error('Failed to fetch insights')
    }
    setIsRefreshing(false)
  }

  // Load on page open
  useEffect(() => {
    handleRefresh()
  }, [])

  const sortedInsights = [...insights].sort((a, b) => {
    const priority = { "at-risk": 0, "needs-attention": 1, "on-track": 2 }
    return priority[a.status] - priority[b.status]
  })

  const atRiskCount = insights.filter(i => i.status === "at-risk").length
  const needsAttentionCount = insights.filter(i => i.status === "needs-attention").length
  const onTrackCount = insights.filter(i => i.status === "on-track").length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">AI Insights</h1>
          <p className="text-muted-foreground">AI-powered analysis of mentor-mentee engagement</p>
        </div>
        <Button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="gap-2"
        >
          <RefreshCw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
          {isRefreshing ? "Refreshing..." : "Refresh Insights"}
        </Button>
      </div>

      {/* Error banner */}
      {error && (
        <div className="rounded-lg bg-yellow-50 border border-yellow-200 px-4 py-3 text-sm text-yellow-800">
          {error}
        </div>
      )}

      {/* Loading state */}
      {isRefreshing && insights.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          Loading AI insights...
        </div>
      )}

      {/* Summary Stats */}
      {insights.length > 0 && (
        <>
          <div className="grid grid-cols-3 gap-4">
            <div className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-red-700">{atRiskCount}</p>
                <p className="text-sm text-red-600">At Risk</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100">
                <AlertCircle className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-amber-700">{needsAttentionCount}</p>
                <p className="text-sm text-amber-600">Needs Attention</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-green-700">{onTrackCount}</p>
                <p className="text-sm text-green-600">On Track</p>
              </div>
            </div>
          </div>

          {/* Student Cards Grid */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {sortedInsights.map((insight) => {
              const config = statusConfig[insight.status]
              const StatusIcon = config.icon
              return (
                <div
                  key={insight.id}
                  className={cn(
                    "overflow-hidden rounded-xl border transition-shadow hover:shadow-md",
                    config.bgColor
                  )}
                >
                  <div className={cn("flex items-center justify-between px-4 py-3", config.headerBg)}>
                    <div className="flex items-center gap-2">
                      <StatusIcon className={cn("h-4 w-4", config.iconColor)} />
                      <span className={cn("text-sm font-medium", config.textColor)}>
                        {config.label}
                      </span>
                    </div>
                    <span className={cn("text-xs", config.textColor)}>
                      {insight.daysSinceInteraction} days ago
                    </span>
                  </div>
                  <div className="space-y-3 p-4">
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">{insight.menteeName}</h3>
                      <div className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                        <User className="h-3.5 w-3.5" />
                        <span>Mentor: {insight.mentorName}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>Last Interaction: {formatDate(insight.lastInteractionDate)}</span>
                    </div>
                    <div className="rounded-lg bg-white/60 p-3">
                      <div className="mb-1.5 flex items-center gap-1.5">
                        <Sparkles className="h-3.5 w-3.5 text-primary" />
                        <span className="text-xs font-medium text-primary">AI Suggestion</span>
                      </div>
                      <p className="text-sm italic text-muted-foreground leading-relaxed">
                        {insight.aiSuggestion}
                      </p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
