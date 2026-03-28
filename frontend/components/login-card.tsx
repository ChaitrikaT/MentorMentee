"use client"

import { useState } from "react"
import { Mail, Lock, GraduationCap, Shield, Users } from "lucide-react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"

type Role = "admin" | "mentor"

export function LoginCard() {
  const [selectedRole, setSelectedRole] = useState<Role>("mentor")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Store role in localStorage
    localStorage.setItem('userRole', selectedRole)
    localStorage.setItem('userEmail', email)
    if (selectedRole === 'admin') {
      window.location.href = '/dashboard/consolidated-list'
    } else {
      window.location.href = '/dashboard/interactions'
    }
  }

  return (
    <Card className="w-full max-w-md shadow-lg border-0 shadow-primary/10">
      <CardHeader className="text-center pb-2 pt-8 gap-4">
        {/* College Logo/Icon */}
        <div className="mx-auto flex items-center justify-center w-16 h-16 rounded-full bg-primary/10">
          <GraduationCap className="w-8 h-8 text-primary" />
        </div>
        
        {/* App Name */}
        <div>
          <h1 className="text-2xl font-bold text-primary tracking-tight">
            MentorBridge
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Mentor-Mentee Management System
          </p>
        </div>
      </CardHeader>

      <CardContent className="pt-4 pb-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Role Selector */}
          <div className="space-y-2">
            <Label className="text-muted-foreground">Login as</Label>
            <div className="grid grid-cols-2 gap-2 p-1 bg-secondary rounded-lg">
              <button
                type="button"
                onClick={() => setSelectedRole("admin")}
                className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-md text-sm font-medium transition-all ${
                  selectedRole === "admin"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Shield className="w-4 h-4" />
                Admin
              </button>
              <button
                type="button"
                onClick={() => setSelectedRole("mentor")}
                className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-md text-sm font-medium transition-all ${
                  selectedRole === "mentor"
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Users className="w-4 h-4" />
                Mentor
              </button>
            </div>
          </div>

          {/* Email Field */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-muted-foreground">
              Email Address
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 h-11 bg-secondary/50 border-border focus:bg-card"
                required
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <Label htmlFor="password" className="text-muted-foreground">
              Password
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 h-11 bg-secondary/50 border-border focus:bg-card"
                required
              />
            </div>
          </div>

          {/* Login Button */}
          <Button
            type="submit"
            className="w-full h-11 text-base font-semibold shadow-md hover:shadow-lg transition-shadow"
          >
            Login
          </Button>

          {/* Forgot Password Link */}
          <p className="text-center text-sm text-muted-foreground">
            Forgot your password?{" "}
            <a href="#" className="text-primary font-medium hover:underline">
              Reset it here
            </a>
          </p>
        </form>
      </CardContent>
    </Card>
  )
}
