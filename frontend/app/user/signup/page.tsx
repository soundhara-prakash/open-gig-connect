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
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  Phone,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Shield,
  Zap,
  Heart,
  MapPin
} from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const TAMILNADU_DISTRICTS = [
  "Ariyalur", "Chengalpattu", "Chennai", "Coimbatore", "Cuddalore", "Dharmapuri", "Dindigul", "Erode", "Kallakurichi", "Kancheepuram", "Karur", "Krishnagiri", "Madurai", "Mayiladuthurai", "Nagapattinam", "Namakkal", "Nilgiris", "Perambalur", "Pudukkottai", "Ramanathapuram", "Ranipet", "Salem", "Sivaganga", "Tenkasi", "Thanjavur", "Theni", "Thoothukudi", "Tiruchirappalli", "Tirunelveli", "Tirupathur", "Tiruppur", "Tiruvallur", "Tiruvannamalai", "Tiruvarur", "Vellore", "Viluppuram", "Virudhunagar"
];

const benefits = [
  { icon: Shield, title: "Verified Providers", desc: "All professionals are background-checked" },
  { icon: Zap, title: "Instant Booking", desc: "Book services in under 2 minutes" },
  { icon: Heart, title: "Satisfaction Guaranteed", desc: "100% money-back guarantee" },
]

export default function GetStartedPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    location: "",
    agreeTerms: false,
  })
  const [errors, setErrors] = useState({
    email: "",
    phone: "",
    password: "",
    general: ""
  })
  const [checking, setChecking] = useState({
    email: false,
    phone: false
  })

  const validateEmail = async (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setErrors(prev => ({ ...prev, email: "Please enter a valid email address" }))
      return false
    }

    setChecking(prev => ({ ...prev, email: true }))
    try {
      const res = await fetch(`http://localhost:5000/api/users/check-email?email=${email}`)
      const data = await res.json()
      if (data.exists) {
        setErrors(prev => ({ ...prev, email: "Email already registered" }))
        return false
      }
      setErrors(prev => ({ ...prev, email: "" }))
      return true
    } catch (error) {
      console.error(error)
      return false
    } finally {
      setChecking(prev => ({ ...prev, email: false }))
    }
  }

  const validatePhone = async (phone: string) => {
    const cleanPhone = phone.replace(/\D/g, '')
    if (cleanPhone.length !== 10) {
      setErrors(prev => ({ ...prev, phone: "Phone number must be exactly 10 digits" }))
      return false
    }

    setChecking(prev => ({ ...prev, phone: true }))
    try {
      const res = await fetch(`http://localhost:5000/api/users/check-phone?phone=${cleanPhone}`)
      const data = await res.json()
      if (data.exists) {
        setErrors(prev => ({ ...prev, phone: "Phone number already registered" }))
        return false
      }
      setErrors(prev => ({ ...prev, phone: "" }))
      return true
    } catch (error) {
      console.error(error)
      return false
    } finally {
      setChecking(prev => ({ ...prev, phone: false }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({ email: "", phone: "", password: "", general: "" })

    // Step 1: Validate Email
    if (step === 1) {
      if (!formData.firstName || !formData.lastName || !formData.email) {
        setErrors(prev => ({ ...prev, general: "Please fill in all fields" }))
        return
      }
      if (errors.email) return

      const isValid = await validateEmail(formData.email)
      if (isValid) setStep(2)
      return
    }

    // Step 2: Validate Phone & Password
    if (!formData.phone || !formData.password || !formData.location) {
      setErrors(prev => ({ ...prev, general: "Please fill in all fields including valid phone, password and location" }))
      return
    }

    if (formData.password.length < 8) {
      setErrors(prev => ({ ...prev, password: "Password must be at least 8 characters" }))
      return
    }

    if (errors.phone) return

    // Final re-check on submit
    const isPhoneValid = await validatePhone(formData.phone)
    if (!isPhoneValid) return

    try {
      const res = await fetch('http://localhost:5000/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: `${formData.firstName} ${formData.lastName}`,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
          location: formData.location,
          role: 'customer'
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.message || 'Something went wrong')
      }

      // Store token/user and redirect to dashboard
      console.log('User registered:', data)
      localStorage.setItem('user', JSON.stringify(data))
      router.push('/user/dashboard')

    } catch (error) {
      console.error(error)
      setErrors(prev => ({ ...prev, general: error instanceof Error ? error.message : "Registration failed" }))
    } finally {
      setIsLoading(false)
    }
  }


  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '')
    if (value.length <= 10) {
      setFormData({ ...formData, phone: value })
    }
  }

  return (
    <main className="min-h-screen bg-background flex">
      {/* Left Side - Decorative */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-72 h-72 bg-primary-foreground/10 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-primary-foreground/5 rounded-full blur-3xl animate-float-delayed" />
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center px-16 text-primary-foreground">
          <Link href="/" className="text-3xl font-bold mb-8">
            Easy<span className="opacity-80">Hire</span>
          </Link>

          <h1 className="text-4xl font-bold mb-4 text-balance">
            Join thousands of happy customers
          </h1>
          <p className="text-lg text-primary-foreground/80 mb-12 max-w-md">
            Create your free account and get instant access to verified local service providers.
          </p>

          {/* Benefits */}
          <div className="space-y-6">
            {benefits.map((benefit, i) => (
              <div
                key={benefit.title}
                className="flex items-start gap-4 animate-in"
                style={{ animationDelay: `${i * 150}ms` }}
              >
                <div className="p-2 bg-primary-foreground/10 rounded-lg backdrop-blur-sm">
                  <benefit.icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold">{benefit.title}</h3>
                  <p className="text-sm text-primary-foreground/70">{benefit.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Side - Signup Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <Link href="/" className="lg:hidden text-2xl font-bold text-foreground block mb-8 text-center">
            Easy<span className="text-primary">Hire</span>
          </Link>

          {/* Progress Indicator */}
          <div className="flex items-center justify-center gap-2 mb-8">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300 ${step >= s
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                    }`}
                >
                  {step > s ? <CheckCircle2 className="w-5 h-5" /> : s}
                </div>
                {s < 3 && (
                  <div className={`w-12 h-1 mx-1 rounded transition-all duration-300 ${step > s ? "bg-primary" : "bg-muted"
                    }`} />
                )}
              </div>
            ))}
          </div>

          {step < 3 ? (
            <>
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-foreground mb-2">
                  {step === 1 ? "Create your account" : "Almost there!"}
                </h2>
                <p className="text-muted-foreground">
                  {step === 1
                    ? "Already have an account? "
                    : "Complete your profile to get started"
                  }
                  {step === 1 && (
                    <Link href="/user/login" className="text-primary font-medium hover:underline">
                      Sign in
                    </Link>
                  )}
                </p>
              </div>

              <Card className="border-0 shadow-xl">
                <CardContent className="p-8">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {step === 1 ? (
                      <>
                        {/* Name Fields */}
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="firstName" className="text-foreground font-medium">
                              First name
                            </Label>
                            <div className="relative">
                              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                              <Input
                                id="firstName"
                                placeholder="John"
                                className="pl-10 h-12 bg-secondary/50 border-border focus:border-primary transition-colors"
                                value={formData.firstName}
                                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                required
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="lastName" className="text-foreground font-medium">
                              Last name
                            </Label>
                            <Input
                              id="lastName"
                              placeholder="Doe"
                              className="h-12 bg-secondary/50 border-border focus:border-primary transition-colors"
                              value={formData.lastName}
                              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                              required
                            />
                          </div>
                        </div>

                        {/* Email Field */}
                        <div className="space-y-2">
                          <Label htmlFor="email" className="text-foreground font-medium">
                            Email address
                          </Label>
                          <div>
                            <div className="relative">
                              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                              <Input
                                id="email"
                                type="email"
                                placeholder="you@example.com"
                                className={`pl-10 h-12 bg-secondary/50 border-border focus:border-primary transition-colors ${errors.email ? "border-red-500" : ""}`}
                                value={formData.email}
                                onChange={(e) => {
                                  setFormData({ ...formData, email: e.target.value })
                                  if (errors.email) setErrors({ ...errors, email: "" })
                                }}
                                onBlur={(e) => validateEmail(e.target.value)}
                                required
                              />
                            </div>
                            {checking.email && <p className="text-muted-foreground text-xs mt-1 ml-1">Checking availability...</p>}
                            {errors.email && <p className="text-red-500 text-sm mt-1 ml-1">{errors.email}</p>}
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        {/* Phone Field */}
                        <div className="space-y-2">
                          <Label htmlFor="phone" className="text-foreground font-medium">
                            Phone number
                          </Label>
                          <div>
                            <div className="relative">
                              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                              <Input
                                id="phone"
                                type="tel"
                                placeholder="+1 (555) 000-0000"
                                className={`pl-10 h-12 bg-secondary/50 border-border focus:border-primary transition-colors ${errors.phone ? "border-red-500" : ""}`}
                                value={formData.phone}
                                onChange={(e) => {
                                  handlePhoneChange(e)
                                  if (errors.phone) setErrors({ ...errors, phone: "" })
                                }}
                                onBlur={(e) => validatePhone(e.target.value)}
                                maxLength={10}
                                required
                              />
                            </div>
                            {checking.phone && <p className="text-muted-foreground text-xs mt-1 ml-1">Checking number...</p>}
                            {errors.phone && <p className="text-red-500 text-sm mt-1 ml-1">{errors.phone}</p>}
                          </div>
                        </div>

                        {/* Password Field */}
                        <div className="space-y-2">
                          <Label htmlFor="password" className="text-foreground font-medium">
                            Create password
                          </Label>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                            <Input
                              id="password"
                              type={showPassword ? "text" : "password"}
                              placeholder="Min. 8 characters"
                              className="pl-10 pr-10 h-12 bg-secondary/50 border-border focus:border-primary transition-colors"
                              value={formData.password}
                              onChange={(e) => {
                                setFormData({ ...formData, password: e.target.value })
                                if (e.target.value.length >= 8) setErrors(prev => ({ ...prev, password: "" }))
                              }}
                              required
                              minLength={8}
                            />
                            {errors.password && <p className="text-red-500 text-sm mt-1 ml-1">{errors.password}</p>}
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                            >
                              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                          </div>
                          {errors.password && <p className="text-red-500 text-sm mt-1 ml-1">{errors.password}</p>}
                        </div>

                        {/* Location Field */}
                        <div className="space-y-2">
                          <Label htmlFor="location" className="text-foreground font-medium">
                            District / Location
                          </Label>
                          <div className="relative">
                            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground z-10" />
                            <Select
                              value={formData.location}
                              onValueChange={(value) => setFormData({ ...formData, location: value })}
                              required
                            >
                              <SelectTrigger className="pl-10 h-12 bg-secondary/50 border-border focus:border-primary transition-colors w-full">
                                <SelectValue placeholder="Select your district" />
                              </SelectTrigger>
                              <SelectContent>
                                {TAMILNADU_DISTRICTS.map((district) => (
                                  <SelectItem key={district} value={district}>
                                    {district}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        {/* Terms Checkbox */}
                        <div className="flex items-start gap-2">
                          <Checkbox
                            id="terms"
                            checked={formData.agreeTerms}
                            onCheckedChange={(checked) => setFormData({ ...formData, agreeTerms: checked as boolean })}
                            required
                          />
                          <Label htmlFor="terms" className="text-sm text-muted-foreground cursor-pointer leading-relaxed">
                            I agree to the{" "}
                            <Link href="#" className="text-primary hover:underline">Terms of Service</Link>
                            {" "}and{" "}
                            <Link href="#" className="text-primary hover:underline">Privacy Policy</Link>
                          </Label>
                        </div>
                      </>
                    )}

                    {/* General Errors */}
                    {errors.general && (
                      <div className="p-3 text-sm text-red-500 bg-red-50 rounded-md border border-red-200 text-center animate-in fade-in slide-in-from-top-1">
                        {errors.general}
                      </div>
                    )}

                    {/* Buttons */}
                    <div className="flex gap-4">
                      {step === 2 && (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setStep(1)}
                          className="h-12 px-6 transition-all duration-300 hover:scale-[1.02]"
                        >
                          <ArrowLeft className="w-5 h-5 mr-2" />
                          Back
                        </Button>
                      )}
                      <Button
                        type="submit"
                        className="flex-1 h-12 bg-primary text-primary-foreground font-semibold text-base transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-primary/25"
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <span className="flex items-center gap-2">
                            <span className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                            Creating account...
                          </span>
                        ) : (
                          <span className="flex items-center gap-2">
                            {step === 1 ? "Continue" : "Create account"}
                            <ArrowRight className="w-5 h-5" />
                          </span>
                        )}
                      </Button>
                    </div>
                  </form>

                  {/* Divider and Social Signup Removed */}
                </CardContent>
              </Card>
            </>
          ) : (
            /* Success State */
            <Card className="border-0 shadow-xl">
              <CardContent className="p-12 text-center">
                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 animate-in zoom-in duration-500">
                  <CheckCircle2 className="w-10 h-10 text-primary" />
                </div>
                <h2 className="text-2xl font-bold text-foreground mb-2">Welcome to EasyHire!</h2>
                <p className="text-muted-foreground mb-8">
                  Your account has been created successfully. You can now book services and manage your bookings.
                </p>
                <div className="flex flex-col gap-3">
                  <Button
                    asChild
                    className="h-12 bg-primary text-primary-foreground font-semibold transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-primary/25"
                  >
                    <Link href="/user/booking">
                      Book Your First Service
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Link>
                  </Button>
                  <Button variant="outline" asChild className="h-12 transition-all duration-300 hover:scale-[1.02] bg-transparent">
                    <Link href="/">
                      Back to Home
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </main>
  )
}
