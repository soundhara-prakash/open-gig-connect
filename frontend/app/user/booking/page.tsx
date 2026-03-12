"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Calendar,
  Clock,
  MapPin,
  Sparkles,
  Wrench,
  Bug,
  Scissors,
  Truck,
  Palette,
  GraduationCap,
  ShoppingBag,
  Flower2,
  Search,
  CreditCard,
  Briefcase,
  Shield,
  Phone,
  Star,
  LayoutDashboard,
  History,
  LogOut,
  Building2,
  Package,
  Menu,
  X
} from "lucide-react"
import { cn } from "@/lib/utils"

// Helper to get icon and color (reused)
const getServiceConfig = (name: string, category: string) => {
  const lowerName = (name + " " + category).toLowerCase()
  if (lowerName.includes("clean")) return { icon: Sparkles, color: "bg-emerald-50 text-emerald-600 border-emerald-100" }
  if (lowerName.includes("repair") || lowerName.includes("fix")) return { icon: Wrench, color: "bg-blue-50 text-blue-600 border-blue-100" }
  if (lowerName.includes("pest") || lowerName.includes("control")) return { icon: Bug, color: "bg-red-50 text-red-600 border-red-100" }
  if (lowerName.includes("beauty") || lowerName.includes("salon") || lowerName.includes("hair")) return { icon: Scissors, color: "bg-pink-50 text-pink-600 border-pink-100" }
  if (lowerName.includes("move") || lowerName.includes("pack")) return { icon: Truck, color: "bg-amber-50 text-amber-600 border-amber-100" }
  if (lowerName.includes("decor") || lowerName.includes("art") || lowerName.includes("paint")) return { icon: Palette, color: "bg-indigo-50 text-indigo-600 border-indigo-100" }
  if (lowerName.includes("tutor") || lowerName.includes("teach")) return { icon: GraduationCap, color: "bg-cyan-50 text-cyan-600 border-cyan-100" }
  if (lowerName.includes("food") || lowerName.includes("grocery")) return { icon: ShoppingBag, color: "bg-orange-50 text-orange-600 border-orange-100" }
  if (lowerName.includes("garden") || lowerName.includes("lawn")) return { icon: Flower2, color: "bg-green-50 text-green-600 border-green-100" }

  return { icon: Briefcase, color: "bg-purple-50 text-purple-600 border-purple-100" }
}

const timeSlots = [
  "9:00 AM", "10:00 AM", "11:00 AM", "12:00 PM",
  "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM"
]

export default function BookServicePage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [services, setServices] = useState<any[]>([])
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [selectedService, setSelectedService] = useState<any | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedDate, setSelectedDate] = useState("")
  const [selectedTime, setSelectedTime] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const sectionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const userData = localStorage.getItem("user")
    if (userData) {
      setUser(JSON.parse(userData).user || JSON.parse(userData))
    }

    const fetchServices = async () => {
      try {
        let url = 'http://localhost:5000/api/services';
        if (userData) {
          const parsed = JSON.parse(userData);
          const userLoc = parsed.user?.location;
          if (userLoc) url += `?location=${encodeURIComponent(userLoc)}`;
        }

        const res = await fetch(url)
        const data = await res.json()
        if (data.success) {
          setServices(data.services)

          // Check for query params after fetching services
          const searchParams = new URLSearchParams(window.location.search)
          const serviceId = searchParams.get("serviceId")
          const requestedStep = searchParams.get("step")

          if (serviceId && data.services) {
            const found = data.services.find((s: any) => s._id === serviceId)
            if (found) {
              setSelectedService(found)
              setSelectedCategory(found.category)
              if (requestedStep) setStep(parseInt(requestedStep))
            }
          }
        }
      } catch (error) {
        console.error("Failed to fetch services", error)
      }
    }
    fetchServices()
  }, [])

  const categoryServices = services.filter(s => {
    const dBCategory = (s.category || "").toLowerCase();
    const selected = (selectedCategory || "").toLowerCase();
    const categoryMatch = dBCategory.includes(selected) || selected.includes(dBCategory) ||
      (selected === 'beauty' && dBCategory.includes('salon')) ||
      (selected === 'painting' && dBCategory.includes('decor')) ||
      (selected === 'delivery' && dBCategory.includes('grocery'));

    return categoryMatch && !!s.vendorId;
  })

  const [addressData, setAddressData] = useState({
    street: "", apt: "", city: "", zip: "", instructions: ""
  })

  const handleSubmit = async () => {
    setIsLoading(true)
    try {
      const userData = localStorage.getItem("user")
      if (!userData) {
        router.push("/user/login")
        return
      }
      const parsed = JSON.parse(userData)
      const token = parsed.token
      const currentUser = parsed.user || parsed

      const bookingPayload = {
        serviceId: selectedService._id,
        serviceName: selectedService.name,
        vendorId: selectedService.vendorId,
        vendorName: selectedService.vendorName || "Verified Partner",
        date: selectedDate,
        time: selectedTime,
        userEmail: currentUser.email,
        userName: currentUser.name,
        address: `${addressData.street}, ${addressData.apt ? addressData.apt + ', ' : ''}${addressData.city} ${addressData.zip}`,
        paymentMethod: "Credit Card",
        price: selectedService.price,
        instructions: addressData.instructions
      }

      const res = await fetch('http://localhost:5000/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(bookingPayload)
      })

      const data = await res.json()
      if (data.success) {
        setStep(5)
      } else {
        alert("Booking failed: " + data.message)
      }
    } catch (error) {
      console.error("Booking error", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setAddressData(prev => ({ ...prev, [name]: value }))
  }

  const getAvailableDates = () => {
    const dates = []
    for (let i = 1; i <= 14; i++) {
      const date = new Date()
      date.setDate(date.getDate() + i)
      dates.push({
        value: date.toISOString().split("T")[0],
        display: date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }),
      })
    }
    return dates
  }

  const handleLogout = () => {
    localStorage.removeItem("user")
    router.push("/")
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex font-sans selection:bg-primary/10 overflow-hidden">
      {/* Sidebar Navigation - Shared Pro Look */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-[280px] bg-white border-r border-slate-200/60 transition-transform duration-500 ease-in-out lg:relative lg:translate-x-0 flex flex-col h-screen",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-8 pb-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="bg-primary p-2 rounded-2xl shadow-lg shadow-primary/20 transition-transform hover:scale-110">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-black tracking-tight text-slate-900">
                Easy<span className="text-primary">Hire</span>
              </h1>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden rounded-xl"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-11">Customer Portal</p>
        </div>

        <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto mt-6">
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 h-12 px-4 rounded-xl transition-all duration-300 group text-slate-500 hover:bg-slate-50 hover:text-slate-900"
            onClick={() => router.push("/user/dashboard")}
          >
            <LayoutDashboard className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" />
            Home Hub
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 h-12 px-4 rounded-xl transition-all duration-300 group bg-primary/10 text-primary shadow-[0_4px_12px_-4px_rgba(0,0,0,0.1)] font-semibold"
          >
            <Calendar className="w-5 h-5 scale-110" />
            New Booking
            <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
          </Button>
        </nav>

        <div className="p-4 mt-auto border-t border-slate-100 bg-slate-50/50">
          {user && (
            <div className="bg-white p-4 rounded-2xl border border-slate-200/60 shadow-sm mb-4 text-left">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-white font-bold shadow-md">
                  {user.name?.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm text-slate-900 truncate">{user.name}</p>
                  <p className="text-[10px] text-slate-500 font-medium truncate uppercase tracking-widest leading-none mt-1">DIAMOND MEMBER</p>
                </div>
              </div>
            </div>
          )}
          <Button
            variant="ghost"
            className="w-full h-11 rounded-xl text-slate-500 hover:text-red-600 hover:bg-red-50 transition-all duration-300 gap-2 border border-transparent hover:border-red-100"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-y-auto relative overflow-x-hidden">
        {/* Global Blur background */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(var(--primary-rgb),0.03),transparent_50%)] pointer-events-none" />

        {/* Mobile Menu Backdrop */}
        {isMobileMenuOpen && (
          <div
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        {/* Mobile Header */}
        <header className="lg:hidden bg-white/80 backdrop-blur-md border-b p-4 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-2">
            <div className="bg-primary p-1.5 rounded-lg">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <h1 className="font-bold text-sm tracking-tight text-slate-900 truncate max-w-[150px]">
              EasyHire <span className="text-primary">Dashboard</span>
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="h-9 w-9 border shadow-sm bg-white rounded-lg" onClick={() => setIsMobileMenuOpen(true)}>
              <Menu className="w-5 h-5 text-slate-600" />
            </Button>
          </div>
        </header>

        {/* Desktop Header */}
        <header className="sticky top-0 z-20 bg-[#F8FAFC]/80 backdrop-blur-xl border-b border-slate-200/40 px-8 py-6 hidden lg:flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Reservation Station</h2>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                <Shield className="w-3 h-3 text-indigo-500" /> Professional Grade Vetting
              </p>
            </div>
          </div>
          <Button variant="outline" className="rounded-xl h-10 border-slate-200 gap-2" onClick={() => router.push("/user/dashboard")}>
            <ArrowLeft className="w-4 h-4" /> Cancel Booking
          </Button>
        </header>

        <div className="p-6 lg:p-10 flex-1 z-10">
          <div className="max-w-[1000px] mx-auto space-y-12">

            {/* Ultra Modern Step Indicators */}
            <div className="flex items-center justify-between bg-white p-3 lg:p-4 rounded-2xl lg:rounded-[32px] shadow-sm border border-slate-100 animate-in fade-in duration-700">
              {["Domain", "Expert", "Slot", "Spec", "Status"].map((label, i) => (
                <div key={label} className="flex items-center flex-1 last:flex-none">
                  <div className="flex flex-col items-center">
                    <div className={cn(
                      "w-10 h-10 lg:w-12 lg:h-12 rounded-xl lg:rounded-2xl flex items-center justify-center font-black text-xs lg:text-base transition-all duration-500",
                      step > i + 1 ? "bg-primary text-white shadow-lg shadow-primary/20" :
                        step === i + 1 ? "bg-slate-900 text-white scale-110 shadow-xl shadow-slate-200" : "bg-slate-50 text-slate-400"
                    )}>
                      {step > i + 1 ? <CheckCircle2 className="w-5 h-5 lg:w-6 lg:h-6" /> : (i + 1)}
                    </div>
                    <span className={cn(
                      "text-[8px] lg:text-[10px] font-black uppercase tracking-widest mt-2 lg:mt-3 transition-colors",
                      step >= i + 1 ? "text-slate-900" : "text-slate-300"
                    )}>{label}</span>
                  </div>
                  {i < 4 && (
                    <div className={cn(
                      "flex-1 h-0.5 lg:h-1 mx-2 lg:mx-4 rounded-full transition-all duration-700",
                      step > i + 1 ? "bg-primary" : "bg-slate-100"
                    )} />
                  )}
                </div>
              ))}
            </div>

            {/* Step 1: Services Grid */}
            {step === 1 && (
              <div className="space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
                <div className="text-center px-4">
                  <h1 className="text-3xl lg:text-5xl font-black text-slate-900 tracking-tight mb-3">Choose your domain</h1>
                  <p className="text-base lg:text-lg text-slate-500 font-medium max-w-md mx-auto">Select a service category to discover verified professionals.</p>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
                  {["Cleaning", "Appliance Repair", "Pest Control", "Beauty", "Moving", "Painting", "Tutoring", "Delivery", "Gardening"].map((cat, idx) => {
                    const { icon: Icon, color } = getServiceConfig("", cat)
                    return (
                      <Card
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={cn(
                          "rounded-[32px] lg:rounded-[44px] border-none shadow-[0_8px_30px_rgba(0,0,0,0.04)] bg-white p-6 lg:p-8 flex flex-col items-center text-center gap-4 lg:gap-6 cursor-pointer transition-all duration-500 hover:-translate-y-2 group animate-in fade-in slide-in-from-bottom-4",
                          selectedCategory === cat ? "bg-primary text-white shadow-2xl shadow-primary/30" : ""
                        )}
                        style={{ animationDelay: `${idx * 50}ms` }}
                      >
                        <div className={cn(
                          "w-16 h-16 lg:w-20 lg:h-20 rounded-2xl lg:rounded-[28px] flex items-center justify-center transition-all duration-500 shadow-inner group-hover:scale-110",
                          selectedCategory === cat ? "bg-white text-primary" : color
                        )}>
                          <Icon className="w-8 h-8 lg:w-10 lg:h-10" />
                        </div>
                        <div>
                          <h3 className={cn("text-lg lg:text-xl font-black tracking-tight transition-colors", selectedCategory === cat ? "text-white" : "text-slate-900 group-hover:text-primary")}>{cat}</h3>
                          <p className={cn("text-[9px] font-black uppercase tracking-widest mt-1", selectedCategory === cat ? "text-white/60" : "text-slate-400")}>Verified</p>
                        </div>
                      </Card>
                    )
                  })}
                </div>

                <div className="flex justify-center pt-8">
                  <Button
                    size="lg"
                    disabled={!selectedCategory}
                    onClick={() => setStep(2)}
                    className="h-14 lg:h-16 px-10 lg:px-12 rounded-2xl lg:rounded-[28px] text-lg lg:text-xl font-black shadow-2xl shadow-primary/30 gap-3 group"
                  >
                    Continue <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>
              </div>
            )}

            {/* Step 2: Professional Selection */}
            {step === 2 && (
              <div className="space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
                <div className="text-center">
                  <h1 className="text-4xl font-black text-slate-900 tracking-tight">Available Experts</h1>
                  <p className="text-lg text-slate-500 font-medium">Top-rated providers in <span className="text-primary font-bold">{selectedCategory}</span>.</p>
                </div>

                <div className="grid gap-8">
                  {categoryServices.length === 0 ? (
                    <div className="text-center py-20 lg:py-32 bg-white rounded-[32px] lg:rounded-[60px] shadow-sm border border-slate-100 px-6">
                      <Search className="w-12 h-12 lg:w-16 lg:h-16 mx-auto mb-6 text-slate-200" />
                      <h3 className="text-xl lg:text-2xl font-black text-slate-400 uppercase tracking-widest italic">No experts found locally</h3>
                      <p className="text-slate-300 mt-2 font-black text-[10px] uppercase tracking-[0.2em]">Please select another domain.</p>
                    </div>
                  ) : (
                    categoryServices.map((service, idx) => (
                      <Card
                        key={service._id}
                        onClick={() => setSelectedService(service)}
                        className={cn(
                          "rounded-[32px] border-none shadow-[10px_10px_40px_-15px_rgba(0,0,0,0.05)] bg-white overflow-hidden flex flex-col md:flex-row cursor-pointer group transition-all duration-500 hover:shadow-xl",
                          selectedService?._id === service._id ? "bg-slate-50 ring-2 ring-primary" : ""
                        )}
                      >
                        <div className="md:w-[320px] h-64 md:h-auto bg-slate-100 relative overflow-hidden">
                          {service.image ? (
                            <img src={service.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt="" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-300"><ImageIcon className="w-16 h-16 opacity-10" /></div>
                          )}
                          <div className="absolute top-6 left-6 bg-white/90 backdrop-blur-xl px-4 h-9 rounded-2xl flex items-center gap-2 shadow-lg">
                            <Shield className="w-4 h-4 text-primary" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-900">Elite Verified</span>
                          </div>
                        </div>
                        <div className="flex-1 p-10 flex flex-col justify-between">
                          <div>
                            <div className="flex justify-between items-start mb-6">
                              <div>
                                <h3 className="text-3xl font-black text-slate-900 tracking-tight mb-2 group-hover:text-primary transition-colors">{service.name}</h3>
                                <div className="flex items-center gap-2">
                                  <div className="w-2 h-2 rounded-full bg-green-500" />
                                  <span className="text-sm font-bold text-slate-500 uppercase tracking-widest">{service.vendorName}</span>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-3xl font-black text-primary tracking-tighter">{service.price}</div>
                                <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Full Package</div>
                              </div>
                            </div>
                            <div className="flex items-center gap-1 mb-6">
                              {[1, 2, 3, 4].map(i => <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />)}
                              <Star className="w-4 h-4 text-amber-200" />
                              <span className="text-sm font-bold text-slate-400 ml-2">4.9 Excellence Score</span>
                            </div>
                            <p className="text-slate-500 leading-relaxed font-normal mb-8 line-clamp-2">{service.description || "Top-tier professional quality guaranteed for all domestic and commercial requirements."}</p>
                          </div>
                          <div className="flex flex-wrap gap-3 items-center">
                            <Badge variant="secondary" className="bg-slate-100 text-slate-600 border-none px-4 h-7 rounded-full font-black text-[9px] uppercase tracking-widest">{service.vendorLocation || "Global Access"}</Badge>
                            <Badge variant="secondary" className="bg-green-50 text-green-600 border-none px-4 h-7 rounded-full font-black text-[9px] uppercase tracking-widest">Available Now</Badge>
                          </div>
                        </div>
                      </Card>
                    ))
                  )}
                </div>

                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-10">
                  <Button variant="ghost" className="rounded-xl px-8 h-12 font-bold text-slate-400 w-full sm:w-auto order-2 sm:order-1" onClick={() => setStep(1)}>
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back to Domains
                  </Button>
                  <Button size="lg" disabled={!selectedService} onClick={() => setStep(3)} className="h-16 px-12 rounded-2xl lg:rounded-[28px] text-xl font-black shadow-xl w-full sm:w-auto order-1 sm:order-2">
                    Next Step <ArrowRight className="w-6 h-6 ml-2" />
                  </Button>
                </div>
              </div>
            )}

            {/* Step 3: Schedule View */}
            {step === 3 && (
              <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
                <div className="text-center">
                  <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-4">Reserve your window</h1>
                  <p className="text-lg text-slate-500 font-medium">Select your preferred slot for the engagement.</p>
                </div>

                <div className="grid lg:grid-cols-2 gap-10">
                  <Card className="rounded-[32px] lg:rounded-[44px] border-none shadow-[20px_20px_60px_-15px_rgba(0,0,0,0.05)] bg-white p-6 lg:p-10">
                    <div className="flex items-center gap-4 mb-8">
                      <div className="p-3 lg:p-4 bg-indigo-50 rounded-xl lg:rounded-[24px] text-indigo-600 shadow-inner">
                        <Calendar className="w-6 h-6 lg:w-8 lg:h-8" />
                      </div>
                      <h3 className="text-xl lg:text-2xl font-black text-slate-900 tracking-tight uppercase italic underline decoration-primary/20">Timeline</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-3 lg:gap-4">
                      {getAvailableDates().map((date) => (
                        <button
                          key={date.value}
                          onClick={() => setSelectedDate(date.value)}
                          className={cn(
                            "h-14 lg:h-16 rounded-xl lg:rounded-[24px] border-none shadow-sm text-[10px] lg:text-sm font-black uppercase tracking-widest transition-all duration-300",
                            selectedDate === date.value ? "bg-primary text-white shadow-xl scale-105" : "bg-slate-50 text-slate-400 hover:bg-slate-100"
                          )}
                        >
                          {date.display}
                        </button>
                      ))}
                    </div>
                  </Card>

                  <Card className="rounded-[32px] lg:rounded-[44px] border-none shadow-[20px_20px_60px_-15px_rgba(0,0,0,0.05)] bg-white p-6 lg:p-10">
                    <div className="flex items-center gap-4 mb-8">
                      <div className="p-3 lg:p-4 bg-amber-50 rounded-xl lg:rounded-[24px] text-amber-600 shadow-inner">
                        <Clock className="w-6 h-6 lg:w-8 lg:h-8" />
                      </div>
                      <h3 className="text-xl lg:text-2xl font-black text-slate-900 tracking-tight uppercase italic underline decoration-primary/20">Deployment</h3>
                    </div>
                    <div className="grid grid-cols-3 gap-3 lg:gap-4">
                      {timeSlots.map((time) => (
                        <button
                          key={time}
                          onClick={() => setSelectedTime(time)}
                          className={cn(
                            "h-14 lg:h-16 rounded-xl lg:rounded-[24px] border-none shadow-sm text-[10px] lg:text-sm font-black uppercase tracking-widest transition-all duration-300",
                            selectedTime === time ? "bg-slate-900 text-white shadow-xl scale-105" : "bg-slate-50 text-slate-400 hover:bg-slate-100"
                          )}
                        >
                          {time}
                        </button>
                      ))}
                    </div>
                  </Card>
                </div>

                <div className="flex justify-between items-center pt-10">
                  <Button variant="ghost" className="rounded-[20px] px-8 h-12 font-bold text-slate-400" onClick={() => setStep(2)}>
                    <ArrowLeft className="w-4 h-4 mr-2" /> Change Vendor
                  </Button>
                  <Button size="lg" disabled={!selectedDate || !selectedTime} onClick={() => setStep(4)} className="h-16 px-12 rounded-[28px] text-xl font-black shadow-xl">
                    Final Specs <ArrowRight className="w-6 h-6 ml-2" />
                  </Button>
                </div>
              </div>
            )}

            {/* Step 4: Final Review & Checkout */}
            {step === 4 && (
              <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
                <div className="text-center">
                  <h1 className="text-4xl font-black text-slate-900 tracking-tight">Final Intelligence</h1>
                  <p className="text-lg text-slate-500 font-medium">Verify deployment zone and finalize reservation.</p>
                </div>

                <div className="grid lg:grid-cols-3 gap-10">
                  <div className="lg:col-span-2 space-y-8">
                    <Card className="rounded-[32px] lg:rounded-[44px] border-none shadow-[0_8px_30px_rgba(0,0,0,0.04)] bg-white p-6 lg:p-10 text-left">
                      <h3 className="text-lg lg:text-xl font-black text-slate-900 uppercase tracking-widest mb-8 ml-2 italic">Deployment Zone</h3>
                      <div className="grid grid-cols-2 gap-4 lg:gap-6 text-left">
                        <div className="space-y-2 col-span-2 md:col-span-1">
                          <Label className="text-[9px] font-black uppercase tracking-widest text-slate-300 ml-2">Street Address</Label>
                          <Input name="street" value={addressData.street} onChange={handleAddressChange} className="h-12 lg:h-14 rounded-xl lg:rounded-2xl bg-slate-50 border-none font-bold" />
                        </div>
                        <div className="space-y-2 col-span-2 md:col-span-1">
                          <Label className="text-[9px] font-black uppercase tracking-widest text-slate-300 ml-2">City / Sector</Label>
                          <Input name="city" value={addressData.city} onChange={handleAddressChange} className="h-12 lg:h-14 rounded-xl lg:rounded-2xl bg-slate-50 border-none font-bold" />
                        </div>
                        <div className="space-y-2 col-span-2">
                          <Label className="text-[9px] font-black uppercase tracking-widest text-slate-300 ml-2">Access Code / Zip</Label>
                          <Input name="zip" value={addressData.zip} onChange={handleAddressChange} className="h-12 lg:h-14 rounded-xl lg:rounded-2xl bg-slate-50 border-none font-bold" />
                        </div>
                      </div>
                      <div className="space-y-2 mt-8">
                        <Label className="text-[9px] font-black uppercase tracking-widest text-slate-300 ml-2">Special Directives</Label>
                        <Textarea name="instructions" value={addressData.instructions} onChange={handleAddressChange} className="min-h-[120px] rounded-2xl lg:rounded-3xl bg-slate-50 border-none font-bold p-5" />
                      </div>
                    </Card>

                    <Card className="rounded-[32px] lg:rounded-[44px] border-none shadow-[20px_20px_60px_-15px_rgba(0,0,0,0.05)] bg-white p-6 lg:p-10">
                      <div className="flex items-center justify-between mb-8">
                        <h3 className="text-lg lg:text-xl font-black text-slate-900 uppercase tracking-widest ml-2 italic">Secured Payment</h3>
                        <CreditCard className="w-7 h-7 lg:w-8 lg:h-8 text-primary" />
                      </div>
                      <div className="p-6 lg:p-8 bg-slate-900 rounded-[28px] lg:rounded-[32px] text-white relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 blur-3xl -mr-16 -mt-16" />
                        <div className="flex justify-between items-start mb-8 lg:mb-12 text-left">
                          <div className="text-[8px] lg:text-xs font-black tracking-[0.3em] opacity-40 uppercase">Member Reserve Card</div>
                          <Shield className="w-6 h-6 lg:w-8 lg:h-8 opacity-20" />
                        </div>
                        <div className="text-xl lg:text-2xl font-mono tracking-[0.2em] mb-6 lg:mb-8 text-left">**** **** **** 4242</div>
                        <div className="flex justify-between text-[8px] lg:text-[10px] font-black tracking-widest opacity-60">
                          <span>{user?.name?.toUpperCase()}</span>
                          <span>12 / 28</span>
                        </div>
                      </div>
                    </Card>
                  </div>

                  <div className="lg:col-span-1">
                    <Card className="rounded-[32px] lg:rounded-[44px] border-none shadow-[0_20px_40px_rgba(0,0,0,0.08)] bg-white p-6 lg:p-8 sticky top-32 overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl rounded-full" />
                      <h3 className="text-lg lg:text-xl font-black text-slate-900 uppercase tracking-[0.2em] mb-8 text-center underline decoration-primary/20 italic">Summary</h3>
                      <div className="space-y-6">
                        <div className="p-5 lg:p-6 bg-slate-50 rounded-[28px] lg:rounded-[32px] text-center border border-slate-100">
                          <p className="text-xl lg:text-2xl font-black text-slate-900 tracking-tight leading-none mb-2 italic">{selectedService?.name}</p>
                          <Badge variant="secondary" className="bg-white border-none shadow-sm font-black text-[9px] lg:text-[10px] uppercase tracking-widest mb-6 px-4">{selectedService?.category}</Badge>
                          <p className="text-3xl lg:text-4xl font-black text-primary tracking-tighter">{selectedService?.price}</p>
                        </div>

                        <div className="flex flex-col gap-3 px-2 text-left">
                          <div className="flex justify-between items-center text-sm font-medium"><span className="text-slate-300 uppercase tracking-widest text-[9px] font-black">Date</span> <span className="text-slate-900 font-black text-xs uppercase tracking-tighter">{selectedDate}</span></div>
                          <div className="flex justify-between items-center text-sm font-medium"><span className="text-slate-300 uppercase tracking-widest text-[9px] font-black">Time</span> <span className="text-slate-900 font-black text-xs uppercase tracking-tighter">{selectedTime}</span></div>
                        </div>

                        <div className="pt-6 mt-6 border-t border-slate-100">
                          <div className="flex justify-between items-center mb-8">
                            <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Grand Total</span>
                            <span className="text-2xl lg:text-3xl font-black text-slate-900 tracking-tighter">{selectedService?.price}</span>
                          </div>
                          <Button
                            size="lg"
                            className="w-full h-14 lg:h-16 rounded-xl lg:rounded-[24px] text-lg lg:text-xl font-black shadow-2xl shadow-primary/30 active:scale-95 disabled:grayscale uppercase tracking-[0.1em]"
                            onClick={handleSubmit}
                            disabled={isLoading}
                          >
                            {isLoading ? "Validating..." : "Execute Order"}
                          </Button>
                        </div>
                      </div>
                    </Card>
                  </div>
                </div>
              </div>
            )}

            {/* Step 5: Success State */}
            {step === 5 && (
              <div className="max-w-2xl mx-auto py-20 text-center animate-in zoom-in-95 duration-1000">
                <div className="w-32 h-32 bg-green-500 rounded-[48px] flex items-center justify-center mx-auto mb-10 shadow-3xl shadow-green-200 rotate-6 animate-pulse">
                  <CheckCircle2 className="w-16 h-16 text-white" />
                </div>
                <h2 className="text-5xl font-black text-slate-900 tracking-tighter mb-4">Engagement Confirmed</h2>
                <p className="text-xl text-slate-500 font-medium max-w-lg mx-auto mb-16 leading-relaxed">
                  Your professional expert has been deployed. Check your dashboard for real-time tracking and updates.
                </p>
                <div className="flex flex-col md:flex-row gap-6 justify-center">
                  <Button size="lg" className="h-16 px-12 rounded-[28px] text-xl font-black" asChild>
                    <Link href="/user/dashboard">Go to Workspace</Link>
                  </Button>
                  <Button variant="ghost" className="h-16 px-12 rounded-[28px] text-xl font-black text-slate-400 hover:text-slate-900" onClick={() => {
                    setStep(1); setSelectedService(null); setSelectedCategory(null);
                  }}>Book Another Domain</Button>
                </div>
              </div>
            )}

          </div>
        </div>
      </main>
    </div>
  )
}

const ImageIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <rect width="18" height="18" x="3" y="3" rx="2" ry="2" strokeWidth="2" />
    <circle cx="9" cy="9" r="2" strokeWidth="2" />
    <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" strokeWidth="2" />
  </svg>
)
