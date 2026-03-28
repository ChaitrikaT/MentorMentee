"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { 
  Users, 
  MessageSquare, 
  FileText, 
  Sparkles,
  GraduationCap,
  LogOut,
  List
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface SidebarProps {
  activeItem?: string
}

export function Sidebar({ activeItem = "Allocation" }: SidebarProps) {
  const [role, setRole] = useState<string>("mentor")
  const [email, setEmail] = useState<string>("")

  useEffect(() => {
    const storedRole = localStorage.getItem("userRole") || "mentor"
    const storedEmail = localStorage.getItem("userEmail") || ""
    setRole(storedRole)
    setEmail(storedEmail)
  }, [])

  const adminItems = [
    { name: "Allocation", icon: Users, href: "/dashboard" },
    { name: "Consolidated List", icon: List, href: "/dashboard/consolidated-list" },
    { name: "Reports", icon: FileText, href: "/dashboard/reports" },
    { name: "AI Insights", icon: Sparkles, href: "/dashboard/ai-insights" },
  ]

  const mentorItems = [
    { name: "Interactions", icon: MessageSquare, href: "/dashboard/interactions" },
    { name: "Reports", icon: FileText, href: "/dashboard/reports" },
  ]

  const navItems = role === "admin" ? adminItems : mentorItems

  const handleLogout = () => {
    localStorage.removeItem("userRole")
    localStorage.removeItem("userEmail")
    window.location.href = "/"
  }

  return (
    <aside className="flex h-full w-64 flex-col border-r border-border bg-card">
      {/* Logo - clicking goes home */}
      <Link href="/" className="flex items-center gap-3 border-b border-border px-6 py-5 hover:bg-secondary transition-colors">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
          <GraduationCap className="h-5 w-5 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-lg font-semibold text-foreground">MentorBridge</h1>
          <p className="text-xs text-muted-foreground capitalize">{role} Panel</p>
        </div>
      </Link>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = activeItem === item.name
            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  {item.name}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Footer with email + logout */}
      <div className="border-t border-border p-4 space-y-2">
        {email && (
          <p className="text-xs text-muted-foreground px-2 truncate">{email}</p>
        )}
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-muted-foreground hover:text-foreground"
          onClick={handleLogout}
        >
          <LogOut className="h-5 w-5" />
          Logout
        </Button>
      </div>
    </aside>
  )
}
