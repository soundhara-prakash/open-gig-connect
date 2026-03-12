"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import {
  ArrowRight,
  CheckCircle2,
  Briefcase,
  DollarSign,
  Calendar,
  Users,
  Shield,
  Star,
  TrendingUp,
  Clock,
  MapPin,
  Phone,
  Mail,
  Building,
  FileText,
  Upload,
  Sparkles,
  Wrench,
  Bug,
  Scissors,
  Truck,
  Palette,
  GraduationCap,
  Flower2,
  ShoppingBag
} from "lucide-react"
import { cn } from "@/lib/utils"
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
  { icon: DollarSign, title: "Earn More", desc: "Set your own rates and keep up to 85% of your earnings" },
  { icon: Calendar, title: "Flexible Schedule", desc: "Work when you want, accept jobs that fit your schedule" },
  { icon: Users, title: "Grow Your Business", desc: "Access thousands of customers looking for your services" },
  { icon: Shield, title: "Secure Payments", desc: "Get paid on time with our secure payment system" },
]

const stats = [
  { value: "10K+", label: "Active Vendors" },
  { value: "$5M+", label: "Paid to Vendors" },
  { value: "4.9", label: "Avg. Rating" },
  { value: "24hrs", label: "Avg. First Job" },
]

const serviceCategories = [
  { icon: Sparkles, title: "Cleaning Service" },
  { icon: Wrench, title: "Appliance Repair" },
  { icon: Bug, title: "Pest Control" },
  { icon: Scissors, title: "Salon at Home" },
  { icon: Truck, title: "Moving & Packing" },
  { icon: Palette, title: "Wall Art & Decor" },
  { icon: GraduationCap, title: "Home Tutoring" },
  { icon: ShoppingBag, title: "Grocery Pickup" },
  { icon: Flower2, title: "Gardening" },
]

export default function BecomeVendorPage() {
  // State for form data
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    businessName: "",
    location: "",
    yearsOfExperience: "",
    description: "",
  })
  const [file, setFile] = useState<File | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [checking, setChecking] = useState({ email: false, phone: false })

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

  const [step, setStep] = useState(0) // 0 = landing, 1-3 = form steps, 4 = success
  const [isLoading, setIsLoading] = useState(false)
  const [selectedServices, setSelectedServices] = useState<string[]>([])
  const [dynamicServices, setDynamicServices] = useState<any[]>([])
  const sectionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/services')
        const data = await res.json()
        if (data.success) {
          const unique: any[] = []
          const seen = new Set()
          data.services.forEach((s: any) => {
            const name = s.name?.toLowerCase().trim()
            if (!s.vendorId && name && !seen.has(name)) {
              seen.add(name)
              unique.push(s)
            }
          })
          setDynamicServices(unique)
        }
      } catch (error) {
        console.error("Failed to fetch services for vendor registration", error)
      }
    }
    fetchServices()
  }, [])

  const getSvcIcon = (name: string) => {
    const lowerName = name.toLowerCase()
    if (lowerName.includes("clean")) return Sparkles
    if (lowerName.includes("repair") || lowerName.includes("fix")) return Wrench
    if (lowerName.includes("pest")) return Bug
    if (lowerName.includes("salon") || lowerName.includes("hair")) return Scissors
    if (lowerName.includes("move") || lowerName.includes("pack")) return Truck
    if (lowerName.includes("decor") || lowerName.includes("art") || lowerName.includes("paint")) return Palette
    if (lowerName.includes("tutor") || lowerName.includes("teach")) return GraduationCap
    if (lowerName.includes("food") || lowerName.includes("grocery")) return ShoppingBag
    if (lowerName.includes("garden") || lowerName.includes("lawn")) return Flower2
    return Briefcase
  }

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("animate-in")
          }
        })
      },
      { threshold: 0.1 }
    )

    const elements = sectionRef.current?.querySelectorAll(".fade-up")
    elements?.forEach((el) => observer.observe(el))

    return () => observer.disconnect()
  }, [step])

  const toggleService = (title: string) => {
    setSelectedServices((prev) =>
      prev.includes(title) ? prev.filter((s) => s !== title) : [...prev, title]
    )
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target

    if (name === "phone") {
      // Only allow numbers and max 10 digits
      const phoneValue = value.replace(/\D/g, '').slice(0, 10)
      setFormData((prev) => ({ ...prev, [name]: phoneValue }))
      if (errors[name]) setErrors(prev => ({ ...prev, [name]: "" }))
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }))
      if (errors[name]) setErrors(prev => ({ ...prev, [name]: "" }))
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

  const validateStep2 = async () => {
    const newErrors: Record<string, string> = {}
    let isValid = true

    if (!formData.firstName) newErrors.firstName = "First name is required"
    if (!formData.lastName) newErrors.lastName = "Last name is required"
    if (!formData.email) newErrors.email = "Email is required"
    if (!formData.phone) newErrors.phone = "Phone is required"
    if (!formData.password) newErrors.password = "Password is required"
    if (!formData.location) newErrors.location = "Location is required"

    if (formData.phone && formData.phone.length !== 10) {
      newErrors.phone = "Phone number must be exactly 10 digits"
    }

    if (formData.password && formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters long"
    }

    // If we have local errors, show them and stop
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return false
    }

    // Rely on previous onBlur checks or re-run if needed
    if (errors.email || errors.phone) return false

    // Final definitive check before proceeding (in case user skipped onBlur)
    const isEmailValid = await validateEmail(formData.email)
    if (!isEmailValid) return false

    const isPhoneValid = await validatePhone(formData.phone)
    if (!isPhoneValid) return false

    return true
  }

  const handleNextStep = async () => {
    if (step === 2) {
      setIsLoading(true)
      const isValid = await validateStep2()
      setIsLoading(false)
      if (isValid) setStep(3)
    } else {
      setStep((prev) => prev + 1)
    }
  }

  const handleSubmit = async () => {
    if (!file) {
      alert("Please upload an ID document.")
      return
    }

    setIsLoading(true)

    try {
      const data = new FormData()
      data.append("name", `${formData.firstName} ${formData.lastName}`)
      data.append("email", formData.email)
      data.append("phone", formData.phone)
      data.append("password", formData.password)
      // Use Business Name if provided, otherwise use the selected categories as the Service Name
      // User requested "no business name ok service name ok like clean"
      const serviceName = formData.businessName || selectedServices.join(", ")
      data.append("serviceName", serviceName)
      data.append("category", selectedServices.join(", "))
      data.append("location", formData.location)
      data.append("document", file)
      // Additional data can be handled if backend supports it, mainly description/experience/area
      // For now, these might just be stored or ignored if backend schema isn't fully matching, 
      // but user asked not to alter existing structure too much.
      // The backend 'vendors/register' expects: name, email, phone, password, serviceName, category, document.

      const res = await fetch("http://localhost:5000/api/vendors/register", {
        method: "POST",
        body: data,
      })

      const result = await res.json()

      if (result.success) {
        setStep(4)
      } else {
        alert(result.message || "Registration failed")
      }
    } catch (error) {
      console.error("Registration error", error)
      alert("An error occurred during registration.")
    } finally {
      setIsLoading(false)
    }
  }

  if (step === 0) {
    return (
      <main ref={sectionRef} className="min-h-screen bg-background">
        {/* Header */}
        <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <Link href="/" className="text-2xl font-bold text-foreground">
                Easy<span className="text-primary">Hire</span>
              </Link>
              <div className="flex items-center gap-4">
                <Button asChild>
                  <Link href="/">Back to Home</Link>
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="relative py-24 overflow-hidden">
          {/* Background */}
          <div className="absolute inset-0 bg-primary/5" />
          <div className="absolute top-20 right-20 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-20 left-20 w-72 h-72 bg-primary/5 rounded-full blur-3xl animate-float-delayed" />

          <div className="container mx-auto px-6 relative">
            <div className="max-w-3xl mx-auto text-center">
              <span className="fade-up inline-block px-4 py-1.5 bg-primary/10 text-primary text-sm font-semibold rounded-full mb-6 opacity-0 translate-y-8 transition-all duration-700">
                Join Our Network
              </span>
              <h1 className="fade-up text-4xl md:text-6xl font-bold text-foreground mb-6 opacity-0 translate-y-8 transition-all duration-700 delay-100 text-balance">
                Turn your skills into a{" "}
                <span className="text-primary">thriving business</span>
              </h1>
              <p className="fade-up text-xl text-muted-foreground mb-10 max-w-2xl mx-auto opacity-0 translate-y-8 transition-all duration-700 delay-200">
                Join thousands of service professionals earning on their own terms.
                Set your schedule, set your rates, and grow your customer base.
              </p>
              <div className="fade-up flex flex-col sm:flex-row gap-4 justify-center opacity-0 translate-y-8 transition-all duration-700 delay-300">
                <Button
                  size="lg"
                  className="h-14 px-8 text-lg font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-primary/25"
                  onClick={() => setStep(1)}
                >
                  Start Your Application
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>

              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 border-y border-border bg-card">
          <div className="container mx-auto px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, i) => (
                <div
                  key={stat.label}
                  className="fade-up text-center opacity-0 translate-y-8 transition-all duration-700"
                  style={{ transitionDelay: `${(i + 4) * 100}ms` }}
                >
                  <div className="text-4xl md:text-5xl font-bold text-primary mb-2">{stat.value}</div>
                  <div className="text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-24">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <span className="fade-up inline-block px-4 py-1.5 bg-primary/10 text-primary text-sm font-semibold rounded-full mb-4 opacity-0 translate-y-8 transition-all duration-700">
                Why Join Us
              </span>
              <h2 className="fade-up text-3xl md:text-4xl font-bold text-foreground mb-4 opacity-0 translate-y-8 transition-all duration-700 delay-100">
                Benefits of becoming a vendor
              </h2>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {benefits.map((benefit, i) => (
                <Card
                  key={benefit.title}
                  className="fade-up border-0 shadow-lg opacity-0 translate-y-8 transition-all duration-700 hover:shadow-xl hover:-translate-y-1"
                  style={{ transitionDelay: `${(i + 2) * 100}ms` }}
                >
                  <CardContent className="p-6 text-center">
                    <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <benefit.icon className="w-7 h-7 text-primary" />
                    </div>
                    <h3 className="font-semibold text-lg text-foreground mb-2">{benefit.title}</h3>
                    <p className="text-sm text-muted-foreground">{benefit.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-24 bg-secondary/30">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <span className="fade-up inline-block px-4 py-1.5 bg-primary/10 text-primary text-sm font-semibold rounded-full mb-4 opacity-0 translate-y-8 transition-all duration-700">
                Simple Process
              </span>
              <h2 className="fade-up text-3xl md:text-4xl font-bold text-foreground mb-4 opacity-0 translate-y-8 transition-all duration-700 delay-100">
                How to get started
              </h2>
            </div>

            <div className="max-w-4xl mx-auto">
              <div className="grid md:grid-cols-3 gap-8">
                {[
                  { step: "01", title: "Apply Online", desc: "Fill out your application with your skills and experience" },
                  { step: "02", title: "Get Verified", desc: "Complete our verification process (takes 24-48 hours)" },
                  { step: "03", title: "Start Earning", desc: "Accept jobs and start earning on your own schedule" },
                ].map((item, i) => (
                  <div
                    key={item.step}
                    className="fade-up text-center opacity-0 translate-y-8 transition-all duration-700"
                    style={{ transitionDelay: `${(i + 2) * 100}ms` }}
                  >
                    <div className="text-6xl font-bold text-primary/20 mb-4">{item.step}</div>
                    <h3 className="font-semibold text-xl text-foreground mb-2">{item.title}</h3>
                    <p className="text-muted-foreground">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 bg-primary relative overflow-hidden">
          <div className="absolute inset-0">
            <div className="absolute top-10 left-10 w-64 h-64 bg-primary-foreground/10 rounded-full blur-3xl" />
            <div className="absolute bottom-10 right-10 w-96 h-96 bg-primary-foreground/5 rounded-full blur-3xl" />
          </div>
          <div className="container mx-auto px-6 relative">
            <div className="max-w-2xl mx-auto text-center text-primary-foreground">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to grow your business?</h2>
              <p className="text-lg text-primary-foreground/80 mb-8">
                Join thousands of successful vendors and start earning today.
              </p>
              <Button
                size="lg"
                variant="secondary"
                className="h-14 px-8 text-lg font-semibold transition-all duration-300 hover:scale-105"
                onClick={() => setStep(1)}
              >
                Apply Now
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-8 border-t">
          <div className="container mx-auto px-6 text-center text-muted-foreground text-sm">
            2024 EasyHire. All rights reserved.
          </div>
        </footer>
      </main>
    )
  }

  // Application Form Steps
  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold text-foreground">
              Easy<span className="text-primary">Hire</span>
            </Link>
            <Button variant="ghost" onClick={() => setStep(0)}>
              Back to Overview
            </Button>
          </div>
        </div>
      </header>

      <div ref={sectionRef} className="container mx-auto px-6 py-12">
        {step < 4 && (
          <>
            {/* Progress */}
            <div className="max-w-2xl mx-auto mb-12">
              <div className="flex items-center justify-between">
                {["Your Services", "Personal Info", "Review"].map((label, i) => (
                  <div key={label} className="flex items-center">
                    <div className="flex flex-col items-center">
                      <div
                        className={cn(
                          "w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-500",
                          step > i
                            ? "bg-primary text-primary-foreground"
                            : step === i + 1
                              ? "bg-primary text-primary-foreground scale-110 shadow-lg shadow-primary/25"
                              : "bg-muted text-muted-foreground"
                        )}
                      >
                        {step > i + 1 ? <CheckCircle2 className="w-5 h-5" /> : i + 1}
                      </div>
                      <span className={cn(
                        "text-xs mt-2 font-medium transition-colors",
                        step >= i + 1 ? "text-foreground" : "text-muted-foreground"
                      )}>
                        {label}
                      </span>
                    </div>
                    {i < 2 && (
                      <div className={cn(
                        "w-20 md:w-32 h-1 mx-2 rounded transition-all duration-500",
                        step > i + 1 ? "bg-primary" : "bg-muted"
                      )} />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        <div className="max-w-2xl mx-auto">
          {step === 1 && (
            <Card className="border-0 shadow-xl">
              <CardContent className="p-8">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold text-foreground mb-2">What services do you offer?</h2>
                  <p className="text-muted-foreground">Select all that apply</p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                  {(dynamicServices.length > 0 ? dynamicServices : serviceCategories).map((service) => {
                    const SvcIcon = service.icon || getSvcIcon(service.name || service.title)
                    const title = service.name || service.title
                    return (
                      <button
                        key={title}
                        type="button"
                        onClick={() => toggleService(title)}
                        className={cn(
                          "p-4 rounded-xl border-2 transition-all duration-300 hover:scale-105",
                          selectedServices.includes(title)
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                        )}
                      >
                        <SvcIcon className={cn(
                          "w-8 h-8 mx-auto mb-2 transition-colors",
                          selectedServices.includes(title) ? "text-primary" : "text-muted-foreground"
                        )} />
                        <span className="text-sm font-medium">{title}</span>
                      </button>
                    )
                  })}
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Years of Experience</Label>
                    <Input
                      name="yearsOfExperience"
                      value={formData.yearsOfExperience}
                      onChange={handleInputChange}
                      placeholder="e.g., 5 years"
                      className="h-12 bg-secondary/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Brief Description of Your Services</Label>
                    <Textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder="Tell us about your experience and what makes you great at what you do..."
                      className="min-h-[100px] bg-secondary/50"
                    />
                  </div>
                </div>

                <Button
                  className="w-full h-12 mt-8 font-semibold transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-primary/25"
                  disabled={selectedServices.length === 0}
                  onClick={() => setStep(2)}
                >
                  Continue
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </CardContent>
            </Card>
          )}

          {step === 2 && (
            <Card className="border-0 shadow-xl">
              <CardContent className="p-8">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold text-foreground mb-2">Your Information</h2>
                  <p className="text-muted-foreground">We need some details to verify your identity</p>
                </div>

                <div className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>First Name</Label>
                      <Input name="firstName" value={formData.firstName} onChange={handleInputChange} placeholder="John" className={cn("h-12 bg-secondary/50", errors.firstName && "border-red-500")} />
                      {errors.firstName && <p className="text-red-500 text-sm">{errors.firstName}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label>Last Name</Label>
                      <Input name="lastName" value={formData.lastName} onChange={handleInputChange} placeholder="Doe" className={cn("h-12 bg-secondary/50", errors.lastName && "border-red-500")} />
                      {errors.lastName && <p className="text-red-500 text-sm">{errors.lastName}</p>}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        onBlur={(e) => validateEmail(e.target.value)}
                        placeholder="you@example.com"
                        className={cn("h-12 pl-10 bg-secondary/50", errors.email && "border-red-500")}
                      />
                    </div>
                    {checking.email && <p className="text-muted-foreground text-xs mt-1">Checking availability...</p>}
                    {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label>Phone Number</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        onBlur={(e) => validatePhone(e.target.value)}
                        placeholder="+1 (555) 000-0000"
                        className={cn("h-12 pl-10 bg-secondary/50", errors.phone && "border-red-500")}
                      />
                    </div>
                    {checking.phone && <p className="text-muted-foreground text-xs mt-1">Checking number...</p>}
                    {errors.phone && <p className="text-red-500 text-sm">{errors.phone}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label>Password</Label>
                    <div className="relative">
                      <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        name="password"
                        type="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        placeholder="Min 8 characters"
                        className={cn("h-12 pl-10 bg-secondary/50", errors.password && "border-red-500")}
                      />
                    </div>
                    {errors.password && <p className="text-red-500 text-sm">{errors.password}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label>Business Name (Optional)</Label>
                    <div className="relative">
                      <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input name="businessName" value={formData.businessName} onChange={handleInputChange} placeholder="Your Business LLC" className="h-12 pl-10 bg-secondary/50" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>District / Location</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground z-10" />
                      <Select
                        value={formData.location}
                        onValueChange={(value) => {
                          setFormData(prev => ({ ...prev, location: value }))
                          if (errors.location) setErrors(prev => ({ ...prev, location: "" }))
                        }}
                      >
                        <SelectTrigger className={cn("pl-10 h-12 bg-secondary/50", errors.location && "border-red-500")}>
                          <SelectValue placeholder="Select District" />
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
                    {errors.location && <p className="text-red-500 text-sm">{errors.location}</p>}
                  </div>
                </div>

                <div className="flex gap-4 mt-8">
                  <Button
                    variant="outline"
                    className="flex-1 h-12 transition-all duration-300 hover:scale-[1.02] bg-transparent"
                    onClick={() => setStep(1)}
                  >
                    Back
                  </Button>
                  <Button
                    className="flex-1 h-12 font-semibold transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-primary/25"
                    onClick={handleNextStep}
                    disabled={isLoading}
                  >
                    {isLoading ? "Checking..." : (
                      <>
                        Continue
                        <ArrowRight className="w-5 h-5 ml-2" />
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {step === 3 && (
            <Card className="border-0 shadow-xl">
              <CardContent className="p-8">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold text-foreground mb-2">Review & Submit</h2>
                  <p className="text-muted-foreground">Almost there! Review your information and submit</p>
                </div>

                <div className="space-y-6">
                  <div className="bg-secondary/50 rounded-xl p-6 space-y-4">
                    <h3 className="font-semibold flex items-center gap-2">
                      <Briefcase className="w-5 h-5 text-primary" />
                      Services Offered
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedServices.map((service) => (
                        <span key={service} className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
                          {service}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Upload ID Document</Label>
                    <div className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary/50 transition-colors cursor-pointer relative">
                      <input
                        type="file"
                        onChange={handleFileChange}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                        accept="image/*"
                      />
                      {file ? (
                        <div className="text-primary font-medium flex flex-col items-center">
                          <CheckCircle2 className="w-8 h-8 mb-2" />
                          {file.name}
                        </div>
                      ) : (
                        <>
                          <Upload className="w-10 h-10 text-muted-foreground mx-auto mb-4" />
                          <p className="text-sm text-muted-foreground">
                            Drag and drop your ID or{" "}
                            <span className="text-primary font-medium">browse files</span>
                          </p>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <Checkbox id="terms" />
                    <Label htmlFor="terms" className="text-sm text-muted-foreground cursor-pointer leading-relaxed">
                      I agree to the{" "}
                      <Link href="#" className="text-primary hover:underline">Vendor Terms of Service</Link>
                      {" "}and{" "}
                      <Link href="#" className="text-primary hover:underline">Community Guidelines</Link>
                    </Label>
                  </div>

                  <div className="flex items-start gap-2">
                    <Checkbox id="background" />
                    <Label htmlFor="background" className="text-sm text-muted-foreground cursor-pointer leading-relaxed">
                      I consent to a background check as part of the verification process
                    </Label>
                  </div>
                </div>

                <div className="flex gap-4 mt-8">
                  <Button
                    variant="outline"
                    className="flex-1 h-12 transition-all duration-300 hover:scale-[1.02] bg-transparent"
                    onClick={() => setStep(2)}
                  >
                    Back
                  </Button>
                  <Button
                    className="flex-1 h-12 font-semibold transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-primary/25"
                    onClick={handleSubmit}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <span className="flex items-center gap-2">
                        <span className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                        Submitting...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        Submit Application
                        <ArrowRight className="w-5 h-5" />
                      </span>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {step === 4 && (
            <Card className="border-0 shadow-2xl">
              <CardContent className="p-12 text-center">
                <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-8 animate-in zoom-in duration-500">
                  <CheckCircle2 className="w-12 h-12 text-primary" />
                </div>
                <h2 className="text-3xl font-bold text-foreground mb-4">Application Submitted!</h2>
                <p className="text-muted-foreground mb-8 max-w-md mx-auto leading-relaxed">
                  Thank you for applying to become a vendor. Our team will review your application
                  and get back to you within 24-48 hours.
                </p>

                <div className="bg-secondary/50 rounded-xl p-6 mb-8 text-left max-w-sm mx-auto">
                  <h3 className="font-semibold mb-4">What happens next?</h3>
                  <ul className="space-y-3 text-sm text-muted-foreground">
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                      <span>Application review (24-48 hours)</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
                      <span>Background verification</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
                      <span>Account activation email</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
                      <span>Start accepting jobs!</span>
                    </li>
                  </ul>
                </div>

                <div className="flex flex-col gap-3">
                  <Button
                    size="lg"
                    className="h-14 font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-primary/25"
                    asChild
                  >
                    <Link href="/user/login">
                      Login to Check Status
                    </Link>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    asChild
                  >
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
