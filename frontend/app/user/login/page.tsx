"use client"

import React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Eye, EyeOff, Mail, Lock, ArrowRight, Sparkles } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const res = await fetch('http://localhost:5000/api/users/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.message || 'Something went wrong')
      }

      console.log('Login successful:', data)

      const role = data.user.role

      // Store data based on role for existing dashboards compatibility
      if (role === 'admin') {
        localStorage.setItem('admin_token', data.token)
        localStorage.setItem('admin_user', JSON.stringify(data.user))
        router.push('/admin/dashboard')
      } else if (role === 'vendor') {
        localStorage.setItem('vendor_token', data.token)
        localStorage.setItem('vendor_user', JSON.stringify(data.user))
        router.push('/vendor/dashboard')
      } else {
        // Default user
        localStorage.setItem('user', JSON.stringify(data))
        router.push('/user/dashboard')
      }
    } catch (error) {
      console.error(error)
      alert('Login failed: ' + (error as Error).message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-background flex">
      {/* Left Side - Decorative */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary relative overflow-hidden">
        {/* Animated Background Pattern */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-72 h-72 bg-primary-foreground/10 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-primary-foreground/5 rounded-full blur-3xl animate-float-delayed" />
          <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-primary-foreground/10 rounded-full blur-3xl animate-float-slow" />
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center px-16 text-primary-foreground">
          <Link href="/" className="text-3xl font-bold mb-8">
            Easy<span className="opacity-80">Hire</span>
          </Link>

          <h1 className="text-4xl font-bold mb-4 text-balance">
            Welcome back to your trusted service partner
          </h1>
          <p className="text-lg text-primary-foreground/80 mb-8 max-w-md">
            Access your bookings, track service providers, and manage your account all in one place.
          </p>

          {/* Feature Pills */}
          <div className="flex flex-wrap gap-3">
            {["Quick Booking", "Verified Pros", "24/7 Support"].map((feature, i) => (
              <span
                key={feature}
                className="px-4 py-2 bg-primary-foreground/10 rounded-full text-sm font-medium backdrop-blur-sm"
                style={{ animationDelay: `${i * 150}ms` }}
              >
                {feature}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <Link href="/" className="lg:hidden text-2xl font-bold text-foreground block mb-8 text-center">
            Easy<span className="text-primary">Hire</span>
          </Link>

          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-foreground mb-2">Sign in to your account</h2>
            <p className="text-muted-foreground">
              {"Don't have an account? "}
              <Link href="/user/signup" className="text-primary font-medium hover:underline">
                Get started
              </Link>
            </p>
          </div>

          <Card className="border-0 shadow-xl">
            <CardContent className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Email Field */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-foreground font-medium">
                    Email address
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      className="pl-10 h-12 bg-secondary/50 border-border focus:border-primary transition-colors"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-foreground font-medium">
                      Password
                    </Label>
                    <Link href="#" className="text-sm text-primary hover:underline">
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      className="pl-10 pr-10 h-12 bg-secondary/50 border-border focus:border-primary transition-colors"
                      required
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Remember Me */}
                <div className="flex items-center gap-2">
                  <Checkbox id="remember" />
                  <Label htmlFor="remember" className="text-sm text-muted-foreground cursor-pointer">
                    Remember me for 30 days
                  </Label>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full h-12 bg-primary text-primary-foreground font-semibold text-base transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-primary/25"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <span className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                      Signing in...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      Sign in
                      <ArrowRight className="w-5 h-5" />
                    </span>
                  )}
                </Button>
              </form>

              {/* Divider and Social Login Removed */}
            </CardContent>
          </Card>

          {/* Terms */}
          <p className="text-center text-sm text-muted-foreground mt-6">
            By signing in, you agree to our{" "}
            <Link href="#" className="text-primary hover:underline">Terms of Service</Link>
            {" "}and{" "}
            <Link href="#" className="text-primary hover:underline">Privacy Policy</Link>
          </p>
        </div>
      </div>
    </main>
  )
}
