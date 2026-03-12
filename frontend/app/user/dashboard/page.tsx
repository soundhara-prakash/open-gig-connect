"use client"

import React, { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
    LayoutDashboard,
    Calendar,
    LogOut,
    Sparkles,
    ShieldCheck,
    ChevronRight,
    Search,
    Package,
    MapPin,
    History as HistoryIcon,
    CreditCard,
    User as UserIcon,
    Bell,
    Menu,
    X,
    Star,
    MessageSquare,
    CheckCircle2,
    Heart
} from "lucide-react"
import { cn } from "@/lib/utils"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
export default function UserDashboard() {
    const router = useRouter()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [user, setUser] = useState<any>(null)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [bookings, setBookings] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState("dashboard")
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const [favourites, setFavourites] = useState<any[]>([])
    const [favIds, setFavIds] = useState<string[]>([])

    // Review Modal State
    const [isReviewOpen, setIsReviewOpen] = useState(false)
    const [selectedBookingForReview, setSelectedBookingForReview] = useState<any>(null)
    const [reviewRating, setReviewRating] = useState(5)
    const [reviewComment, setReviewComment] = useState("")
    const [isSubmittingReview, setIsSubmittingReview] = useState(false)
    const [notifications, setNotifications] = useState<any[]>([])

    // Details Modal State
    const [isDetailsOpen, setIsDetailsOpen] = useState(false)
    const [selectedBookingForDetails, setSelectedBookingForDetails] = useState<any>(null)

    useEffect(() => {
        if (bookings.length > 0) {
            const completedUnreviewed = bookings.filter(b => b.status === 'completed' && !b.isReviewed)
            const notifs = completedUnreviewed.map(b => ({
                id: b._id,
                title: "Service Completed",
                message: `${b.vendorName || 'Provider'} has completed the ${b.serviceName} service. Please review and complete.`,
                booking: b,
                time: "Just now"
            }))
            setNotifications(notifs)
        }
    }, [bookings])

    const fetchFavourites = async () => {
        const token = JSON.parse(localStorage.getItem("user") || "{}").token
        if (!token) return
        try {
            // Get detailed favorites for the fav module
            const res = await fetch('http://localhost:5000/api/users/favorites?populate=true', {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            const data = await res.json()
            if (data.success) {
                setFavourites(data.favorites)
                setFavIds(data.favorites.map((f: any) => f._id))
            }
        } catch (e) {
            console.error("Failed to fetch favorites", e)
        }
    }

    const toggleFavourite = async (serviceId: string) => {
        const token = JSON.parse(localStorage.getItem("user") || "{}").token
        if (!token) return
        try {
            const res = await fetch('http://localhost:5000/api/users/favorites', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ serviceId })
            })
            const data = await res.json()
            if (data.success) {
                fetchFavourites()
            }
        } catch (e) {
            console.error("Failed to toggle favorite", e)
        }
    }

    useEffect(() => {
        fetchFavourites()
    }, [])

    useEffect(() => {
        const fetchUserData = async () => {
            const userData = localStorage.getItem("user")
            if (!userData) {
                router.push("/user/login")
                return
            }

            try {
                const parsedUser = JSON.parse(userData)
                setUser(parsedUser.user || parsedUser)

                // Fetch bookings
                const token = parsedUser.token
                const userId = (parsedUser.user?.id || parsedUser.user?._id || parsedUser.id || parsedUser._id)

                if (token) {
                    // Refresh profile to get latest district
                    try {
                        const profRes = await fetch(`http://localhost:5000/api/users/${userId}`, {
                            headers: { 'Authorization': `Bearer ${token}` }
                        })
                        const profData = await profRes.json()
                        if (profData.success) {
                            setUser(profData.user)
                            // Update localStorage to keep it in sync
                            const updatedUser = { ...parsedUser, user: profData.user }
                            localStorage.setItem("user", JSON.stringify(updatedUser))
                        }
                    } catch (e) {
                        console.error("Profile sync failed", e)
                    }

                    const res = await fetch('http://localhost:5000/api/user/bookings', {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    })
                    const data = await res.json()
                    if (data.success) {
                        setBookings(data.bookings)
                    }
                }
            } catch (error) {
                console.error("Failed to fetch data", error)
            } finally {
                setLoading(false)
            }
        }

        fetchUserData()
    }, [router])

    const handleLogout = () => {
        localStorage.removeItem("user")
        router.push("/")
    }

    const handleSubmitReview = async () => {
        if (!selectedBookingForReview) return
        setIsSubmittingReview(true)
        try {
            const userId = user.id || user._id
            const res = await fetch('http://localhost:5000/api/reviews/add', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    vendorId: selectedBookingForReview.vendorId || selectedBookingForReview.serviceId,
                    customerId: userId,
                    customerName: user.name,
                    rating: reviewRating,
                    comment: reviewComment,
                    bookingId: selectedBookingForReview._id
                })
            })
            const data = await res.json()
            if (data.success) {
                // Also update booking status to 'closed' or just leave it
                setIsReviewOpen(false)
                setReviewComment("")
                setReviewRating(5)
                // Refresh bookings
                const token = JSON.parse(localStorage.getItem("user") || "{}").token
                const bRes = await fetch('http://localhost:5000/api/user/bookings', {
                    headers: { 'Authorization': `Bearer ${token}` }
                })
                const bData = await bRes.json()
                if (bData.success) setBookings(bData.bookings)
            }
        } catch (e) {
            console.error("Review submission failed", e)
        } finally {
            setIsSubmittingReview(false)
        }
    }

    const StarRating = ({ rating, onRatingChange }: { rating: number, onRatingChange?: (r: number) => void }) => {
        return (
            <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                        key={s}
                        className={cn(
                            "w-6 h-6 cursor-pointer transition-all",
                            s <= rating ? "fill-amber-400 text-amber-400 scale-110" : "text-slate-200"
                        )}
                        onClick={() => onRatingChange && onRatingChange(s)}
                    />
                ))}
            </div>
        )
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
                <div className="relative">
                    <div className="h-24 w-24 rounded-full border-t-4 border-b-4 border-primary animate-spin"></div>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                        <UserIcon className="w-8 h-8 text-primary animate-pulse" />
                    </div>
                </div>
            </div>
        )
    }

    if (!user) return null

    const navItems = [
        { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
        { id: "history", label: "Booking History", icon: HistoryIcon },
        { id: "favourites", label: "Favourites", icon: Heart },
    ]

    return (
        <div className="min-h-screen bg-[#F8FAFC] flex font-sans selection:bg-primary/10 overflow-hidden">
            {/* Sidebar Navigation - Pro Grade */}
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
                    {navItems.map((item) => (
                        <Button
                            key={item.id}
                            variant="ghost"
                            className={cn(
                                "w-full justify-start gap-3 h-12 px-4 rounded-xl transition-all duration-300 group",
                                activeTab === item.id
                                    ? "bg-primary/10 text-primary shadow-[0_4px_12px_-4px_rgba(0,0,0,0.1)] font-semibold"
                                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                            )}
                            onClick={() => {
                                setActiveTab(item.id)
                                setIsMobileMenuOpen(false)
                            }}
                        >
                            <item.icon className={cn(
                                "w-5 h-5 transition-transform duration-300",
                                activeTab === item.id ? "scale-110" : "group-hover:scale-110"
                            )} />
                            {item.label}
                            {activeTab === item.id && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />}
                        </Button>
                    ))}
                </nav>

                <div className="p-4 mt-auto border-t border-slate-100 bg-slate-50/50">
                    <div className="bg-white p-4 rounded-2xl border border-slate-200/60 shadow-sm mb-4 text-left">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-white font-bold shadow-md">
                                {user.name?.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-bold text-sm text-slate-900 truncate">{user.name}</p>
                                <div className="flex items-center gap-1.5 mt-1">
                                    <MapPin className="w-2.5 h-2.5 text-primary" />
                                    <p className="text-[10px] text-slate-500 font-black truncate uppercase tracking-widest leading-none">
                                        District: <span className="text-primary">{user.location || user.district || "Not Selected"}</span>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-2">
                        <Button
                            onClick={() => router.push("/user/booking")}
                            className="w-full h-11 rounded-xl bg-slate-900 hover:bg-slate-800 text-white shadow-lg shadow-slate-200 transition-all duration-300 gap-2 mb-2"
                        >
                            <Calendar className="w-4 h-4" /> Book Now
                        </Button>
                        <Button
                            variant="ghost"
                            className="w-full h-11 rounded-xl text-slate-500 hover:text-red-600 hover:bg-red-50 transition-all duration-300 gap-2 border border-transparent hover:border-red-100"
                            onClick={handleLogout}
                        >
                            <LogOut className="w-4 h-4" />
                            Sign Out
                        </Button>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col h-screen overflow-y-auto relative">
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
                            EasyHire Dashboard
                        </h1>
                    </div>
                    <div className="flex items-center gap-2">
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-9 w-9 bg-slate-900 text-white rounded-lg shadow-sm border border-slate-900 flex items-center justify-center font-black text-[10px]">
                                    {user.name[0].toUpperCase()}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-64 p-0 rounded-2xl border-none shadow-2xl mr-2 mt-1 overflow-hidden bg-white">
                                <div className="p-4 bg-slate-900 text-white flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white font-black shadow-md">
                                        {user.name[0].toUpperCase()}
                                    </div>
                                    <div className="min-w-0">
                                        <h4 className="font-black text-xs tracking-tight truncate leading-none mb-1">{user.name}</h4>
                                        <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest truncate">{user.email}</p>
                                    </div>
                                </div>
                                <div className="p-2">
                                    <Button
                                        variant="ghost"
                                        className="w-full justify-start gap-3 h-10 rounded-lg text-red-600 hover:text-red-700 hover:bg-red-50 font-black text-[9px] uppercase tracking-widest"
                                        onClick={handleLogout}
                                    >
                                        <LogOut className="w-4 h-4" /> Log Out
                                    </Button>
                                </div>
                            </PopoverContent>
                        </Popover>
                        <Button variant="ghost" size="icon" className="h-9 w-9 border shadow-sm bg-white rounded-lg" onClick={() => setIsMobileMenuOpen(true)}>
                            <Menu className="w-5 h-5 text-slate-600" />
                        </Button>
                    </div>
                </header>

                {/* Desktop Header */}
                <header className="sticky top-0 z-30 bg-[#F8FAFC]/80 backdrop-blur-xl border-b border-slate-200/40 px-8 py-6 hidden lg:flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                            {navItems.find(i => i.id === activeTab)?.label}
                        </h2>
                        <div className="flex items-center gap-2 mt-1">
                            <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]" />
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">System Status: Online</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 lg:gap-6">
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant="ghost" size="icon" className="relative h-11 w-11 rounded-xl bg-white border border-slate-200/60 shadow-sm transition-all hover:scale-105 active:scale-95 group">
                                    <Bell className="w-5 h-5 text-slate-400 group-hover:text-primary transition-colors" />
                                    {notifications.length > 0 && (
                                        <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full animate-pulse" />
                                    )}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-80 p-0 rounded-3xl border-none shadow-2xl mr-4 mt-2 overflow-hidden bg-white/95 backdrop-blur-md">
                                <div className="p-6 border-b border-slate-50 bg-slate-50/50">
                                    <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest italic flex items-center gap-2">
                                        <Heart className="w-4 h-4 text-primary fill-current" />
                                        Activity Feed
                                    </h4>
                                </div>
                                <div className="max-h-[400px] overflow-y-auto">
                                    {notifications.length === 0 ? (
                                        <div className="p-12 text-center">
                                            <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4 opacity-40">
                                                <Bell className="w-6 h-6" />
                                            </div>
                                            <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">No new updates</p>
                                        </div>
                                    ) : (
                                        <div className="divide-y divide-slate-50">
                                            {notifications.map((n) => (
                                                <div
                                                    key={n.id}
                                                    className="p-5 hover:bg-slate-50 transition-colors cursor-pointer group"
                                                    onClick={() => {
                                                        setSelectedBookingForReview(n.booking)
                                                        setIsReviewOpen(true)
                                                    }}
                                                >
                                                    <div className="flex gap-4">
                                                        <div className="w-10 h-10 rounded-xl bg-primary/5 text-primary flex items-center justify-center shrink-0 border border-primary/10 group-hover:bg-primary group-hover:text-white transition-all">
                                                            <CheckCircle2 className="w-5 h-5" />
                                                        </div>
                                                        <div>
                                                            <h5 className="text-xs font-black text-slate-900 uppercase tracking-tight mb-1">{n.title}</h5>
                                                            <p className="text-[10px] text-slate-500 font-medium leading-relaxed">{n.message}</p>
                                                            <p className="text-[8px] font-black text-primary/40 uppercase tracking-widest mt-2">{n.time}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <div className="p-4 bg-slate-50/50 border-t border-slate-50 text-center">
                                    <Button
                                        variant="ghost"
                                        className="w-full text-[9px] font-black uppercase tracking-widest h-8 text-slate-400 hover:text-primary"
                                        onClick={() => setActiveTab('history')}
                                    >
                                        View All History
                                    </Button>
                                </div>
                            </PopoverContent>
                        </Popover>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant="ghost" className="p-0 h-11 w-11 rounded-xl bg-slate-900 border border-slate-900 shadow-lg shadow-slate-900/10 flex items-center justify-center text-white text-xs font-black transition-transform hover:rotate-12 hover:bg-slate-800">
                                    {user.name[0].toUpperCase()}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-64 p-0 rounded-3xl border-none shadow-2xl mr-4 mt-2 overflow-hidden bg-white">
                                <div className="p-6 bg-slate-900 text-white">
                                    <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center text-white font-black text-xl mb-4 shadow-lg shadow-primary/20">
                                        {user.name[0].toUpperCase()}
                                    </div>
                                    <h4 className="font-black text-lg tracking-tight truncate leading-none mb-2">{user.name}</h4>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest truncate">{user.email}</p>
                                </div>
                                <div className="p-4 space-y-1">
                                    <div className="flex items-center gap-3 p-3 text-slate-500">
                                        <MapPin className="w-4 h-4 text-primary" />
                                        <div className="flex flex-col">
                                            <span className="text-[8px] font-black uppercase tracking-widest text-slate-300">Location</span>
                                            <span className="text-[10px] font-bold text-slate-900 uppercase">{user.location || user.district || "Not Set"}</span>
                                        </div>
                                    </div>
                                    <div className="h-px bg-slate-50 mx-2 my-2" />
                                    <Button
                                        variant="ghost"
                                        className="w-full justify-start gap-3 h-11 rounded-xl text-red-600 hover:text-red-700 hover:bg-red-50 font-black text-[10px] uppercase tracking-widest transition-colors"
                                        onClick={handleLogout}
                                    >
                                        <LogOut className="w-4 h-4" /> Sign Out
                                    </Button>
                                </div>
                            </PopoverContent>
                        </Popover>
                    </div>
                </header>

                {/* Content Container */}
                <div className="p-6 lg:p-10 flex-1 z-10">
                    <div className="max-w-[1400px] mx-auto space-y-10">
                        {activeTab === 'dashboard' && (
                            <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
                                {/* Welcome Hero */}
                                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                                    <div className="max-w-xl">
                                        <h1 className="text-3xl lg:text-5xl font-black text-slate-900 tracking-tight leading-none mb-3">
                                            Hi, {user.name?.split(' ')[0]}!
                                        </h1>
                                        <p className="text-base lg:text-lg text-slate-500 font-medium leading-normal">
                                            Find and book the services you need in minutes.
                                        </p>
                                    </div>
                                    <Button
                                        onClick={() => router.push("/user/booking")}
                                        className="h-14 lg:h-16 px-8 lg:px-10 rounded-2xl lg:rounded-[28px] text-base lg:text-lg font-black shadow-[0_20px_40px_-10px_rgba(var(--primary-rgb),0.3)] hover:-translate-y-1 transition-all duration-300 group"
                                    >
                                        Book a Service
                                        <ChevronRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                    </Button>
                                </div>

                                {/* Quick Stats */}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                    <Card className="rounded-[32px] border-none shadow-[0_8px_30px_rgba(0,0,0,0.04)] bg-white group hover:shadow-xl transition-all duration-500">
                                        <CardHeader className="p-6 lg:p-8 pb-4 flex flex-row items-center justify-between">
                                            <div className="p-3 bg-primary/5 rounded-xl text-primary transition-colors duration-500">
                                                <Calendar className="w-5 h-5" />
                                            </div>
                                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-3 py-1 rounded-full">Bookings</span>
                                        </CardHeader>
                                        <CardContent className="p-6 lg:p-8 pt-0">
                                            <div className="text-3xl lg:text-5xl font-black text-slate-900 mb-1 truncate">{bookings.length}</div>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total Bookings</p>
                                        </CardContent>
                                    </Card>

                                    <Card className="rounded-[32px] border-none shadow-[0_8px_30px_rgba(0,0,0,0.04)] bg-white group hover:shadow-xl transition-all duration-500">
                                        <CardHeader className="p-6 lg:p-8 pb-4 flex flex-row items-center justify-between">
                                            <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600 transition-colors duration-500">
                                                <ShieldCheck className="w-5 h-5" />
                                            </div>
                                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-3 py-1 rounded-full">Safety</span>
                                        </CardHeader>
                                        <CardContent className="p-6 lg:p-8 pt-0">
                                            <div className="text-3xl lg:text-5xl font-black text-slate-900 mb-1 truncate">Elite</div>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Top Service Providers</p>
                                        </CardContent>
                                    </Card>

                                    <Card className="rounded-[32px] border-none shadow-[0_20px_40px_-10px_rgba(var(--primary-rgb),0.3)] bg-slate-900 text-white relative overflow-hidden group hover:scale-[1.02] transition-all duration-500">
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -mr-16 -mt-16" />
                                        <CardHeader className="p-6 lg:p-8 pb-4 flex flex-row items-center justify-between">
                                            <div className="p-3 bg-white/10 rounded-xl text-white">
                                                <CreditCard className="w-5 h-5" />
                                            </div>
                                            <Badge variant="secondary" className="bg-white/10 text-white border-0 text-[10px] tracking-widest uppercase py-1 px-3 rounded-full font-black">Secure</Badge>
                                        </CardHeader>
                                        <CardContent className="p-6 lg:p-8 pt-0">
                                            <div className="text-3xl lg:text-5xl font-black mb-1 truncate">Pay</div>
                                            <p className="text-[9px] text-white/50 font-black uppercase tracking-[0.2em]">Safe & Fast Checkout</p>
                                        </CardContent>
                                    </Card>
                                </div>

                                {/* Booking Grid */}
                                <div className="space-y-8">
                                    <div className="flex items-center justify-between px-2">
                                        <h3 className="text-2xl font-black text-slate-900 tracking-tight">My Bookings</h3>
                                        {bookings.length > 0 && (
                                            <Button variant="link" className="text-primary font-bold text-sm tracking-tight" onClick={() => setActiveTab("history")}>
                                                View all history
                                            </Button>
                                        )}
                                    </div>

                                    {bookings.filter(b => b.status !== 'completed' || !b.isReviewed).length === 0 ? (
                                        <div className="text-center py-20 lg:py-24 bg-white rounded-[32px] shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-slate-100">
                                            <div className="w-20 h-20 bg-slate-50 rounded-[32px] flex items-center justify-center mx-auto mb-8 grayscale opacity-50">
                                                <Package className="w-10 h-10 text-slate-900" />
                                            </div>
                                            <h3 className="text-2xl lg:text-3xl font-black text-slate-900 tracking-tight mb-3 uppercase italic">No active bookings</h3>
                                            <p className="text-slate-500 max-w-sm mx-auto mb-10 text-base lg:text-lg font-medium leading-relaxed px-6">Your scheduled services will appear here.</p>
                                            <Button
                                                onClick={() => router.push('/user/booking')}
                                                className="h-14 px-10 rounded-2xl text-lg font-black shadow-2xl shadow-primary/20 gap-3 group"
                                            >
                                                Book Now <Sparkles className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                            </Button>
                                        </div>
                                    ) : (
                                        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                                            {bookings.filter(b => b.status !== 'completed' || !b.isReviewed).map((booking, idx) => (
                                                <Card
                                                    key={booking._id}
                                                    className="rounded-[32px] border-none shadow-[10px_10px_40px_-15px_rgba(0,0,0,0.05)] bg-white overflow-hidden group hover:shadow-xl transition-all duration-500 animate-in fade-in slide-in-from-bottom-4"
                                                    style={{ animationDelay: `${idx * 100}ms` }}
                                                >
                                                    <CardHeader className="p-6 lg:p-8 pb-4">
                                                        <div className="flex justify-between items-start mb-6">
                                                            <div className="p-3 bg-primary/5 text-primary rounded-xl shadow-inner group-hover:bg-primary group-hover:text-white transition-colors duration-500">
                                                                <Package className="w-5 h-5" />
                                                            </div>
                                                            <Badge className={cn(
                                                                "h-8 px-4 rounded-full border-none font-black text-[9px] tracking-widest uppercase shadow-sm",
                                                                booking.status === 'confirmed' ? "bg-green-50 text-green-700" :
                                                                    booking.status === 'completed' ? "bg-blue-50 text-blue-700" :
                                                                        'bg-amber-50 text-amber-700'
                                                            )}>
                                                                {booking.status || 'Scheduled'}
                                                            </Badge>
                                                        </div>
                                                        <CardTitle className="text-xl font-black text-slate-900 tracking-tight leading-none mb-1 group-hover:text-primary transition-colors uppercase italic">{booking.serviceName}</CardTitle>
                                                        <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">{booking.vendorName || "Verified Partner"}</p>
                                                    </CardHeader>

                                                    <CardContent className="px-6 lg:px-8 pb-8 space-y-4 text-left">
                                                        <div className="space-y-3 pt-6 border-t border-slate-50">
                                                            <div className="flex items-center gap-3 text-slate-600">
                                                                <Calendar className="w-4 h-4 text-primary" />
                                                                <span className="font-black text-[11px] uppercase tracking-tighter">{new Date(booking.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                                                <span className="w-1 h-1 rounded-full bg-slate-300" />
                                                                <span className="font-bold text-[11px] text-slate-400 uppercase">{booking.time}</span>
                                                            </div>
                                                            {booking.address && (
                                                                <div className="flex items-start gap-3">
                                                                    <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                                                                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-tight line-clamp-2 leading-relaxed">{booking.address}</span>
                                                                </div>
                                                            )}
                                                        </div>

                                                        <div className="flex items-center justify-between pt-6 mt-4">
                                                            <div className="text-xl font-black text-slate-900 tracking-tighter leading-none">{booking.price}</div>
                                                            <div className="flex gap-2">
                                                                {booking.status === 'completed' ? (
                                                                    <Button
                                                                        className="rounded-xl h-9 px-6 font-black text-[10px] uppercase tracking-widest bg-primary text-white hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
                                                                        onClick={() => {
                                                                            setSelectedBookingForReview(booking)
                                                                            setIsReviewOpen(true)
                                                                        }}
                                                                    >
                                                                        Review Now
                                                                    </Button>
                                                                ) : (
                                                                    <Button
                                                                        variant="ghost"
                                                                        className="rounded-xl h-9 px-4 font-black text-[10px] uppercase tracking-widest text-slate-400 hover:text-primary hover:bg-primary/5 transition-all"
                                                                        onClick={() => {
                                                                            setSelectedBookingForDetails(booking)
                                                                            setIsDetailsOpen(true)
                                                                        }}
                                                                    >
                                                                        Details
                                                                    </Button>
                                                                )}
                                                                {/* Favorite icon removed from dashboard - only in history */}
                                                            </div>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* History View */}
                        {activeTab === 'history' && (
                            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
                                <Card className="rounded-[32px] border-none shadow-[0_8px_30px_rgba(0,0,0,0.04)] overflow-hidden bg-white">
                                    <div className="p-6 lg:p-10 border-b border-slate-50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                                        <div>
                                            <h3 className="text-2xl lg:text-3xl font-black text-slate-900 tracking-tight">Booking History</h3>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Review your past and recurring services.</p>
                                        </div>
                                    </div>
                                    {bookings.filter(b => b.status === 'completed' && b.isReviewed).length === 0 ? (
                                        <div className="p-20 lg:p-32 text-center grayscale opacity-40">
                                            <HistoryIcon className="w-16 h-16 mx-auto mb-6 opacity-20" />
                                            <h4 className="text-lg font-black text-slate-900 uppercase">Nothing to show yet</h4>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Your past and reviewed services will appear here.</p>
                                        </div>
                                    ) : (
                                        <div className="p-6 lg:p-10 divide-y divide-slate-50">
                                            {bookings.filter(b => b.status === 'completed' && b.isReviewed).map((booking) => (
                                                <div key={booking._id} className="py-6 flex flex-col md:flex-row md:items-center justify-between gap-4 group">
                                                    <div className="flex items-start gap-4">
                                                        <div className="p-3 bg-slate-50 rounded-2xl text-slate-400 group-hover:bg-primary group-hover:text-white transition-all duration-300 shadow-inner">
                                                            <Package className="w-5 h-5" />
                                                        </div>
                                                        <div className="flex-1">
                                                            <h4 className="font-black text-slate-900 uppercase tracking-tight italic group-hover:text-primary transition-colors">{booking.serviceName}</h4>
                                                            <div className="flex items-center gap-2 mt-1">
                                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{booking.vendorName || "Verified Provider"}</p>
                                                            </div>
                                                            <Badge className={cn(
                                                                "h-6 px-3 rounded-full border-none font-black text-[8px] tracking-widest uppercase mt-2",
                                                                "bg-blue-50 text-blue-700"
                                                            )}>
                                                                {booking.status || 'Completed'}
                                                            </Badge>
                                                        </div>
                                                    </div>

                                                    <div className="hidden md:block px-8 py-2 border-x border-slate-50">
                                                        <p className="text-[10px] font-black text-slate-900 uppercase tracking-tighter italic leading-none">{booking.date ? new Date(booking.date).toLocaleDateString() : 'Recent'}</p>
                                                        <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest mt-1">Scheduled Review</p>
                                                    </div>

                                                    <div className="flex items-center gap-3">
                                                        <Badge className="bg-green-50 text-green-700 h-10 px-6 border-none font-black text-[9px] tracking-widest uppercase shadow-none">
                                                            Reviewed
                                                        </Badge>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className={cn("h-10 w-10 rounded-xl transition-all", favIds.includes(booking.serviceId) ? "text-red-500 bg-red-50 border-red-100" : "text-slate-300 hover:text-red-400 hover:bg-red-50")}
                                                            onClick={() => toggleFavourite(booking.serviceId)}
                                                        >
                                                            <Heart className={cn("w-4 h-4", favIds.includes(booking.serviceId) && "fill-current")} />
                                                        </Button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </Card>
                            </div>
                        )}

                        {/* Favourites View */}
                        {activeTab === 'favourites' && (
                            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
                                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                                    <div>
                                        <h3 className="text-2xl font-black text-slate-900 tracking-tight uppercase italic">Your Favourites</h3>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Services you've bookmarked for quick access</p>
                                    </div>
                                </div>
                                {favourites.length === 0 ? (
                                    <div className="text-center py-20 lg:py-32 bg-white rounded-[40px] shadow-sm border border-slate-100">
                                        <div className="w-20 h-20 bg-slate-50 rounded-[32px] flex items-center justify-center mx-auto mb-8 grayscale opacity-30">
                                            <Heart className="w-10 h-10" />
                                        </div>
                                        <h4 className="text-xl font-black text-slate-900 uppercase italic">No saved services</h4>
                                        <p className="text-sm text-slate-500 max-w-sm mx-auto mt-2">Services you mark as favourite will appear here for one-tap booking.</p>
                                    </div>
                                ) : (
                                    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                                        {favourites.map((service) => (
                                            <Card key={service._id} className="rounded-[40px] border-none shadow-[10px_10px_40px_-15px_rgba(0,0,0,0.05)] bg-white overflow-hidden group hover:-translate-y-2 transition-all duration-500">
                                                <div className="h-48 bg-slate-100 relative">
                                                    {service.image ? (
                                                        <img src={service.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center opacity-10"><Package className="w-16 h-16" /></div>
                                                    )}
                                                    <div className="absolute top-4 right-4">
                                                        <Button
                                                            variant="secondary"
                                                            size="icon"
                                                            className="rounded-full bg-white/90 backdrop-blur-md shadow-lg text-red-500"
                                                            onClick={() => toggleFavourite(service._id)}
                                                        >
                                                            <Heart className="w-4 h-4 fill-current" />
                                                        </Button>
                                                    </div>
                                                </div>
                                                <div className="p-8">
                                                    <div className="flex justify-between items-start mb-4">
                                                        <div>
                                                            <h4 className="text-xl font-black text-slate-900 uppercase italic leading-none">{service.name}</h4>
                                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-2">{service.category}</p>
                                                        </div>
                                                        <div className="text-xl font-black text-primary tracking-tighter">{service.price}</div>
                                                    </div>
                                                    <Button
                                                        className="w-full h-12 rounded-2xl bg-slate-900 hover:bg-primary shadow-lg shadow-slate-200 transition-all font-black uppercase text-[10px] tracking-widest mt-4"
                                                        onClick={() => router.push(`/user/booking?serviceId=${service._id}&step=3`)}
                                                    >
                                                        Book Again
                                                    </Button>
                                                </div>
                                            </Card>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Review Modal */}
                <Dialog open={isReviewOpen} onOpenChange={setIsReviewOpen}>
                    <DialogContent className="sm:max-w-[480px] rounded-[40px] border-none p-0 overflow-hidden shadow-2xl">
                        <div className="bg-primary h-32 flex items-center justify-center relative">
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(255,255,255,0.2),transparent)]" />
                            <div className="w-20 h-20 bg-white rounded-[32px] shadow-xl flex items-center justify-center animate-bounce-subtle">
                                <Star className="w-10 h-10 text-primary fill-current" />
                            </div>
                        </div>
                        <div className="p-10 text-center">
                            <DialogHeader>
                                <DialogTitle className="text-3xl font-black text-slate-900 tracking-tight leading-none mb-2 italic uppercase">Rate the Service</DialogTitle>
                                <DialogDescription className="text-slate-500 font-medium">
                                    How was your experience with <span className="text-primary font-black uppercase">{selectedBookingForReview?.vendorName || "the provider"}</span>?
                                </DialogDescription>
                            </DialogHeader>

                            <div className="py-10 flex flex-col items-center gap-6">
                                <StarRating rating={reviewRating} onRatingChange={setReviewRating} />
                                <div className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">
                                    {reviewRating === 5 ? "Exceptional" : reviewRating === 4 ? "Great" : reviewRating === 3 ? "Good" : reviewRating === 2 ? "Fair" : "Poor"}
                                </div>
                            </div>

                            <div className="space-y-4 text-left">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Your Feedback</label>
                                <Textarea
                                    placeholder="Write a brief comment about the service..."
                                    className="min-h-[120px] rounded-3xl bg-slate-50 border-none font-medium p-5 focus:ring-2 focus:ring-primary/20"
                                    value={reviewComment}
                                    onChange={(e) => setReviewComment(e.target.value)}
                                />
                            </div>

                            <DialogFooter className="mt-10 sm:justify-center">
                                <Button
                                    className="h-16 px-12 rounded-[28px] text-lg font-black w-full shadow-xl shadow-primary/20"
                                    onClick={handleSubmitReview}
                                    disabled={isSubmittingReview}
                                >
                                    {isSubmittingReview ? "Submitting..." : "Complete Booking"}
                                </Button>
                            </DialogFooter>
                        </div>
                    </DialogContent>
                </Dialog>
            </main>
            {/* Booking Details Modal */}
            <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
                <DialogContent className="rounded-[40px] border-none shadow-2xl p-0 overflow-hidden bg-white max-w-md">
                    <DialogHeader className="p-8 pb-4 bg-slate-50/50">
                        <DialogTitle className="text-2xl font-black text-slate-900 tracking-tight uppercase italic flex items-center gap-3">
                            <div className="p-2 bg-primary rounded-xl text-white shadow-lg shadow-primary/20">
                                <Package className="w-5 h-5" />
                            </div>
                            Booking Details
                        </DialogTitle>
                        <DialogDescription className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
                            Reference: {selectedBookingForDetails?._id?.slice(-8).toUpperCase()}
                        </DialogDescription>
                    </DialogHeader>

                    {selectedBookingForDetails && (
                        <div className="p-8 space-y-6">
                            <div className="space-y-1">
                                <h4 className="text-xl font-black text-slate-900 uppercase italic leading-none">{selectedBookingForDetails.serviceName}</h4>
                                <p className="text-[10px] font-black text-primary uppercase tracking-widest">{selectedBookingForDetails.vendorName || "Verified Provider"}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                                        <Calendar className="w-3 h-3 text-primary" /> Schedule
                                    </p>
                                    <p className="text-sm font-black text-slate-900 leading-none italic">{new Date(selectedBookingForDetails.date).toLocaleDateString()}</p>
                                    <p className="text-[10px] font-bold text-slate-500 mt-1 uppercase tracking-tighter">{selectedBookingForDetails.time}</p>
                                </div>
                                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                                        <HistoryIcon className="w-3 h-3 text-primary" /> Status
                                    </p>
                                    <Badge className={cn(
                                        "h-6 px-3 rounded-full border-none font-black text-[8px] tracking-widest uppercase",
                                        selectedBookingForDetails.status === 'confirmed' ? "bg-green-100 text-green-700" :
                                            selectedBookingForDetails.status === 'completed' ? "bg-blue-100 text-blue-700" :
                                                "bg-amber-100 text-amber-700"
                                    )}>
                                        {selectedBookingForDetails.status || 'Active'}
                                    </Badge>
                                </div>
                            </div>

                            <div className="space-y-4 pt-4 border-t border-slate-50">
                                <div className="flex gap-4">
                                    <div className="p-3 bg-slate-50 rounded-xl text-slate-400">
                                        <MapPin className="w-5 h-5" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Service Location</p>
                                        <p className="text-xs font-bold text-slate-700 leading-relaxed uppercase tracking-tight">{selectedBookingForDetails.address}</p>
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    <div className="p-3 bg-slate-50 rounded-xl text-slate-400">
                                        <CreditCard className="w-5 h-5" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Payment Method</p>
                                        <p className="text-xs font-black text-slate-900 uppercase tracking-widest italic">{selectedBookingForDetails.paymentMethod || 'Credit Card'}</p>
                                        <p className="text-sm font-black text-primary mt-1">{selectedBookingForDetails.price}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    <DialogFooter className="p-8 pt-0 flex gap-3">
                        <Button
                            variant="ghost"
                            className="flex-1 rounded-2xl h-12 font-black text-[10px] uppercase tracking-widest text-slate-400 hover:text-primary hover:bg-slate-50"
                            onClick={() => setIsDetailsOpen(false)}
                        >
                            Close
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
