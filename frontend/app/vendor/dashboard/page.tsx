"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    LayoutDashboard,
    Calendar,
    Briefcase,
    LogOut,
    Plus,
    CheckCircle2,
    Clock,
    AlertCircle,
    RefreshCw,
    TrendingUp,
    DollarSign,
    MapPin,
    Building2,
    Sparkles,
    ShieldCheck,
    Search,
    Package,
    Menu,
    X,
    Wrench,
    Bug,
    Scissors,
    Truck,
    Palette,
    GraduationCap,
    ShoppingBag,
    Flower2,
    MessageSquare,
    Star,
    Bell
} from "lucide-react"
import { cn } from "@/lib/utils"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"

export default function VendorDashboard() {
    const router = useRouter()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [user, setUser] = useState<any>(null)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [bookings, setBookings] = useState<any[]>([])
    const [isRefreshing, setIsRefreshing] = useState(false)
    const [activeTab, setActiveTab] = useState("dashboard")
    const [myServices, setMyServices] = useState<any[]>([])
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const [reviews, setReviews] = useState<any[]>([])
    const [averageRating, setAverageRating] = useState(0)
    const [notifications, setNotifications] = useState<any[]>([])

    useEffect(() => {
        if (bookings.length > 0) {
            const pendingBookings = bookings.filter(b => b.status === 'pending')
            const pendingNotifs = pendingBookings.map(b => ({
                id: b._id,
                title: "New Booking Request",
                message: `${b.userName} has requested a ${b.serviceName} service for ${new Date(b.date).toLocaleDateString()}.`,
                time: "New",
                type: 'booking'
            }))

            const reviewedBookings = bookings.filter(b => b.status === 'reviewed')
            const reviewNotifs = reviewedBookings.map(b => ({
                id: b._id,
                title: "Feedback Shared",
                message: `${b.userName} has reviewed your ${b.serviceName} service.`,
                time: "Feedback",
                type: 'review'
            }))

            setNotifications([...pendingNotifs, ...reviewNotifs])
        }
    }, [bookings])

    useEffect(() => {
        const userData = localStorage.getItem("vendor_user")
        if (!userData) {
            router.push("/user/login")
            return
        }
        const parsedUser = JSON.parse(userData)
        setUser(parsedUser)

        // Fetch latest status
        refreshUserStatus(parsedUser.id || parsedUser._id)
    }, [router])

    useEffect(() => {
        if (user && user.status === 'active') {
            fetchBookings()
            fetchMyServices()
            fetchReviews()
        }
    }, [user?.status, user?.id, user?._id])

    const fetchReviews = async () => {
        const userId = user?.id || user?._id
        if (!userId) return
        try {
            const res = await fetch(`http://localhost:5000/api/reviews/vendor/${userId}`)
            const data = await res.json()
            if (data.success) {
                setReviews(data.reviews)
                setAverageRating(data.averageRating)
            }
        } catch (error) {
            console.error("Failed to fetch reviews", error)
        }
    }

    const refreshUserStatus = async (userId: string) => {
        if (!userId) return
        setIsRefreshing(true)
        try {
            const res = await fetch(`http://localhost:5000/api/users/${userId}`)
            const data = await res.json()
            if (data.success) {
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const updatedUser = { ...user, ...data.user }
                setUser(data.user)
                localStorage.setItem("vendor_user", JSON.stringify(data.user))
            }
        } catch (error) {
            console.error("Failed to refresh status", error)
        } finally {
            setIsRefreshing(false)
        }
    }

    const fetchBookings = async () => {
        try {
            const token = localStorage.getItem("vendor_token")
            const res = await fetch('http://localhost:5000/api/vendor/bookings', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            const data = await res.json()
            if (data.success) {
                setBookings(data.bookings)
            }
        } catch (error) {
            console.error("Failed to fetch bookings", error)
        }
    }

    const fetchMyServices = async () => {
        try {
            const token = localStorage.getItem("vendor_token")
            const res = await fetch('http://localhost:5000/api/vendor/services', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            const data = await res.json()
            if (data.success) {
                setMyServices(data.services)
                // If user category is missing but we have services, try to infer it
                if (!user?.category && data.services.length > 0) {
                    const firstService = data.services[0]
                    const inferredCategory = firstService.category || firstService.name
                    const updatedUser = { ...user, category: inferredCategory }
                    setUser(updatedUser)
                    localStorage.setItem("vendor_user", JSON.stringify(updatedUser))
                }
            }
        } catch (error) {
            console.error("Failed to fetch services", error)
        }
    }

    const handleLogout = () => {
        localStorage.removeItem("vendor_token")
        localStorage.removeItem("vendor_user")
        router.push("/")
    }

    if (!user) return (
        <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
            <div className="relative">
                <div className="h-24 w-24 rounded-full border-t-4 border-b-4 border-primary animate-spin"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                    <Sparkles className="w-8 h-8 text-primary animate-pulse" />
                </div>
            </div>
        </div>
    )

    const navItems = [
        { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
        { id: "services", label: "My Services", icon: Package, disabled: user.status !== 'active' },
        { id: "bookings", label: "My Bookings", icon: Calendar, disabled: user.status !== 'active' },
        { id: "feedback", label: "Reviews", icon: MessageSquare, disabled: user.status !== 'active' },
    ]

    const getCategoryIcon = (category: string) => {
        const lower = (category || "").toLowerCase()
        if (lower.includes("clean")) return Sparkles
        if (lower.includes("repair") || lower.includes("fix") || lower.includes("appliance")) return Wrench
        if (lower.includes("pest")) return Bug
        if (lower.includes("salon") || lower.includes("beauty")) return Scissors
        if (lower.includes("move") || lower.includes("pack")) return Truck
        if (lower.includes("decor") || lower.includes("art")) return Palette
        if (lower.includes("tutor") || lower.includes("teach")) return GraduationCap
        if (lower.includes("food") || lower.includes("grocery")) return ShoppingBag
        if (lower.includes("garden") || lower.includes("lawn")) return Flower2
        return Building2
    }

    const CategoryIcon = getCategoryIcon(user.category)

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
                            <div className="bg-primary p-2 rounded-2xl shadow-lg shadow-primary/20">
                                <Building2 className="w-6 h-6 text-white" />
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
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-11">Vendor Portal</p>
                </div>

                <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto mt-6">
                    {navItems.map((item) => (
                        <Button
                            key={item.id}
                            variant="ghost"
                            disabled={item.disabled}
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
                    <div className="bg-white p-4 rounded-2xl border border-slate-200/60 shadow-sm mb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-white font-bold shadow-md">
                                {(user.name || 'V').charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-black text-sm text-slate-900 truncate uppercase italic tracking-tight">{user.serviceName || user.name}</p>
                                <p className="text-[9px] text-primary font-black truncate uppercase tracking-[0.15em] mt-0.5">{user.category || (user.serviceName?.includes(' ') ? user.serviceName.split(' ').pop() : 'Service')}</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-2">
                        {user.status === 'active' && (
                            <Button
                                onClick={() => router.push("/vendor/add-service")}
                                className="w-full h-11 rounded-xl bg-slate-900 hover:bg-slate-800 text-white shadow-lg shadow-slate-200 transition-all duration-300 gap-2 mb-2"
                            >
                                <Plus className="w-4 h-4" /> Add Service
                            </Button>
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
                    <div className="flex items-center gap-3 min-w-0 px-1">
                        <div className="bg-primary p-2 rounded-xl shrink-0">
                            <CategoryIcon className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex flex-col min-w-0">
                            <h1 className="font-black text-sm tracking-tight text-slate-900 truncate uppercase italic leading-none">
                                {user.serviceName || user.name}
                            </h1>
                            <p className="text-[9px] font-black text-primary uppercase tracking-[0.2em] truncate mt-1">
                                {user.category || "Professional Partner"}
                            </p>
                        </div>
                    </div>
                    <Button variant="ghost" size="icon" className="h-9 w-9 border shadow-sm bg-white rounded-lg" onClick={() => setIsMobileMenuOpen(true)}>
                        <Menu className="w-5 h-5 text-slate-600" />
                    </Button>
                </header>

                {/* Desktop Header */}
                <header className="sticky top-0 z-30 bg-[#F8FAFC]/80 backdrop-blur-xl border-b border-slate-200/40 px-8 py-6 hidden lg:flex items-center justify-between">
                    <div className="flex items-center gap-5">
                        <div className="p-3 bg-primary rounded-2xl shadow-lg shadow-primary/20 border-0">
                            <CategoryIcon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3 uppercase italic leading-none">
                                {user.serviceName || user.name}
                            </h2>
                            <div className="flex items-center gap-2 mt-2">
                                <Badge variant="secondary" className="bg-primary/10 text-primary border-0 rounded-lg text-[10px] font-black uppercase tracking-[0.15em] px-3 py-1 shadow-sm">
                                    {user.category || (user.serviceName?.includes(' ') ? user.serviceName.split(' ').pop() : user.serviceName) || 'Service Expert'}
                                </Badge>
                                <div className="h-1 w-1 rounded-full bg-slate-300 mx-1" />
                                <div className="flex items-center gap-1.5">
                                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{navItems.find(i => i.id === activeTab)?.label}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
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
                                        <Sparkles className="w-4 h-4 text-primary" />
                                        Vendor Alerts
                                    </h4>
                                </div>
                                <div className="max-h-[400px] overflow-y-auto">
                                    {notifications.length === 0 ? (
                                        <div className="p-12 text-center">
                                            <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4 opacity-40">
                                                <Bell className="w-6 h-6" />
                                            </div>
                                            <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Everything caught up</p>
                                        </div>
                                    ) : (
                                        <div className="divide-y divide-slate-50">
                                            {notifications.map((n) => (
                                                <div
                                                    key={n.id}
                                                    className="p-5 hover:bg-slate-50 transition-colors cursor-pointer group"
                                                    onClick={() => setActiveTab(n.type === 'review' ? 'feedback' : 'bookings')}
                                                >
                                                    <div className="flex gap-4">
                                                        <div className={cn(
                                                            "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border transition-all group-hover:bg-primary group-hover:text-white",
                                                            n.type === 'review' ? "bg-indigo-50 text-indigo-600 border-indigo-100" : "bg-amber-50 text-amber-600 border-amber-100"
                                                        )}>
                                                            {n.type === 'review' ? <MessageSquare className="w-5 h-5" /> : <Calendar className="w-5 h-5" />}
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
                                        onClick={() => setActiveTab('bookings')}
                                    >
                                        Manage Bookings
                                    </Button>
                                </div>
                            </PopoverContent>
                        </Popover>
                        <Badge
                            variant="outline"
                            className={cn(
                                "h-11 px-6 rounded-xl border-0 shadow-sm font-black text-[10px] tracking-widest flex items-center gap-2",
                                user.status === 'active' ? "bg-green-500 text-white" : "bg-amber-100 text-amber-700"
                            )}
                        >
                            {user.status === 'active' ? <ShieldCheck className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                            {(user.status || 'pending').toUpperCase()}
                        </Badge>
                    </div>
                </header>

                {/* Content Container */}
                <div className="p-6 lg:p-10 flex-1 z-10">
                    <div className="max-w-[1400px] mx-auto space-y-10">
                        {/* Status Guard Views */}
                        {(user.status === 'pending' || user.status === 'rejected' || user.status === 'removed') && activeTab === 'dashboard' && (
                            <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
                                {user.status === 'pending' && (
                                    <div className="grid gap-8">
                                        <Card className="rounded-[32px] border-none shadow-[20px_20px_60px_-15px_rgba(0,0,0,0.05)] overflow-hidden bg-white group">
                                            <div className="absolute top-0 left-0 w-2 h-full bg-amber-400" />
                                            <CardHeader className="p-6 lg:p-10">
                                                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 mb-6">
                                                    <div className="p-4 bg-amber-50 rounded-2xl text-amber-600 shadow-inner">
                                                        <Clock className="w-8 h-8 animate-pulse" />
                                                    </div>
                                                    <div>
                                                        <CardTitle className="text-3xl font-black text-slate-900 tracking-tight">Application Under Review</CardTitle>
                                                        <CardDescription className="text-lg text-slate-500 mt-2">
                                                            Our verification team is currently validating your credentials and business documents.
                                                        </CardDescription>
                                                    </div>
                                                </div>
                                                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 italic text-slate-600 text-sm">
                                                    "This typically takes 24-48 hours. Keep an eye on your inbox for the official welcome email."
                                                </div>
                                            </CardHeader>
                                        </Card>

                                        <Card className="rounded-[32px] border-none shadow-[20px_20px_60px_-15px_rgba(0,0,0,0.05)] bg-white overflow-hidden">
                                            <CardHeader className="px-6 lg:px-10 pt-10 pb-4">
                                                <CardTitle className="text-sm font-black text-slate-400 uppercase tracking-[0.2em]">Verification Timeline</CardTitle>
                                            </CardHeader>
                                            <CardContent className="px-6 lg:px-10 pb-12">
                                                <div className="relative flex flex-col md:flex-row justify-between gap-10 mt-6">
                                                    <div className="hidden md:block absolute top-[26px] left-0 right-0 h-1 bg-slate-100 -z-10" />

                                                    {/* Step 1 */}
                                                    <div className="flex-1 flex flex-col items-center text-center space-y-4">
                                                        <div className="w-14 h-14 rounded-2xl bg-green-500 text-white flex items-center justify-center shadow-lg shadow-green-200">
                                                            <CheckCircle2 className="w-7 h-7" />
                                                        </div>
                                                        <div>
                                                            <h4 className="font-black text-slate-900">Submitted</h4>
                                                            <p className="text-xs text-slate-500 font-medium px-4">Application received and logged</p>
                                                        </div>
                                                    </div>

                                                    {/* Step 2 */}
                                                    <div className="flex-1 flex flex-col items-center text-center space-y-4">
                                                        <div className="w-14 h-14 rounded-2xl bg-amber-400 text-white flex items-center justify-center shadow-lg shadow-amber-200 animate-bounce">
                                                            <Clock className="w-7 h-7" />
                                                        </div>
                                                        <div>
                                                            <h4 className="font-black text-amber-600">Vetting Process</h4>
                                                            <p className="text-xs text-slate-500 font-medium px-4">Document & background check in progress</p>
                                                        </div>
                                                    </div>

                                                    {/* Step 3 */}
                                                    <div className="flex-1 flex flex-col items-center text-center space-y-4 opacity-40 grayscale">
                                                        <div className="w-14 h-14 rounded-2xl bg-slate-200 text-slate-800 flex items-center justify-center">
                                                            <Sparkles className="w-7 h-7" />
                                                        </div>
                                                        <div>
                                                            <h4 className="font-black text-slate-900">Live Status</h4>
                                                            <p className="text-xs text-slate-500 font-medium px-4">Account activation complete</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>
                                )}

                                {user.status === 'rejected' && (
                                    <Card className="rounded-[32px] border-none shadow-2xl bg-white overflow-hidden text-center p-8 lg:p-16">
                                        <div className="w-20 h-20 bg-red-50 rounded-3xl flex items-center justify-center mx-auto mb-8 text-red-600">
                                            <AlertCircle className="w-10 h-10" />
                                        </div>
                                        <h2 className="text-3xl lg:text-4xl font-black text-slate-900 tracking-tighter mb-4">Registration Denied</h2>
                                        <p className="text-xl text-slate-500 max-w-2xl mx-auto mb-10">
                                            Unfortunately, we couldn't verify your business at this time. Please contact our Support team for more details.
                                        </p>
                                        <Button className="h-14 px-10 rounded-[20px] bg-slate-900 hover:bg-slate-800 transition-all text-lg font-bold">
                                            Support Messenger
                                        </Button>
                                    </Card>
                                )}
                            </div>
                        )}

                        {/* Active Dashboard - Ultra Premium Section */}
                        {user.status === 'active' && activeTab === 'dashboard' && (
                            <div className="space-y-10 animate-in fade-in zoom-in-95 duration-700">
                                {/* Welcome Hero */}
                                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                                    <div>
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="px-3 py-1 bg-primary text-white text-[10px] font-black uppercase tracking-widest rounded-lg shadow-sm">
                                                {user.category || (user.serviceName?.includes(' ') ? user.serviceName.split(' ').pop() : 'Authorized Partner')}
                                            </div>
                                            <div className="h-px w-8 bg-slate-200" />
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Verified Account</span>
                                        </div>
                                        <h1 className="text-3xl lg:text-5xl font-black text-slate-900 tracking-tight leading-none mb-3">
                                            Hello, {user.name.split(' ')[0]}!
                                        </h1>
                                        <p className="text-base lg:text-lg text-slate-500 max-w-md font-medium">
                                            Your <span className="text-primary font-bold uppercase">{user.category || 'Expert'}</span> business is active. You have <span className="text-primary font-bold">{bookings.length} active bookings</span>.
                                        </p>
                                    </div>
                                    <div className="flex bg-white p-2 rounded-[24px] shadow-sm border border-slate-200/60 self-start md:self-auto">
                                        <div className="px-6 py-2 border-r border-slate-100 text-center">
                                            <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.2em] mb-1">Health</p>
                                            <div className="flex items-center gap-1.5 text-green-600 font-black text-sm">
                                                <TrendingUp className="w-4 h-4" /> 100%
                                            </div>
                                        </div>
                                        <div className="px-6 py-2 text-center">
                                            <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.2em] mb-1">Status</p>
                                            <div className="flex items-center gap-1.5 text-blue-600 font-black text-sm uppercase">
                                                Online
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Stats Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                    <Card className="rounded-[32px] border-none shadow-[0_8px_30px_rgba(0,0,0,0.04)] bg-white group hover:shadow-xl transition-all duration-500">
                                        <CardHeader className="p-6 lg:p-8 pb-4 flex flex-row items-center justify-between">
                                            <div className="p-3 bg-primary/5 rounded-xl text-primary group-hover:bg-primary group-hover:text-white transition-colors duration-500">
                                                <Calendar className="w-5 h-5" />
                                            </div>
                                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-3 py-1 rounded-full">Bookings</span>
                                        </CardHeader>
                                        <CardContent className="p-6 lg:p-8 pt-0">
                                            <div className="text-3xl lg:text-5xl font-black text-slate-900 mb-1 truncate">{bookings.length}</div>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total Active Jobs</p>
                                        </CardContent>
                                    </Card>

                                    <Card className="rounded-[32px] border-none shadow-[0_8px_30px_rgba(0,0,0,0.04)] bg-white group hover:shadow-xl transition-all duration-500">
                                        <CardHeader className="p-6 lg:p-8 pb-4 flex flex-row items-center justify-between">
                                            <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-500">
                                                <Briefcase className="w-5 h-5" />
                                            </div>
                                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-3 py-1 rounded-full">Services</span>
                                        </CardHeader>
                                        <CardContent className="p-6 lg:p-8 pt-0">
                                            <div className="text-3xl lg:text-5xl font-black text-slate-900 mb-1 truncate">{myServices.length + (user.serviceName ? 1 : 0)}</div>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Your Total Services</p>
                                        </CardContent>
                                    </Card>

                                    <Card className="rounded-[32px] border-none shadow-[0_20px_40px_-10px_rgba(var(--primary-rgb),0.3)] bg-slate-900 text-white group hover:scale-[1.02] transition-all duration-500 relative overflow-hidden">
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -mr-16 -mt-16" />
                                        <CardHeader className="p-6 lg:p-8 pb-4 flex flex-row items-center justify-between">
                                            <div className="p-3 bg-white/10 rounded-xl text-white">
                                                <DollarSign className="w-5 h-5" />
                                            </div>
                                            <div className="flex items-center gap-1.5 bg-green-500/20 text-green-400 text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-tighter">
                                                <TrendingUp className="w-3 h-3" /> 12% UP
                                            </div>
                                        </CardHeader>
                                        <CardContent className="p-6 lg:p-8 pt-0">
                                            <div className="text-3xl lg:text-5xl font-black mb-1 truncate">
                                                ${bookings.reduce((acc, curr) => acc + (parseFloat(curr.price?.replace(/[^0-9.]/g, '') || 0)), 0).toFixed(0)}
                                            </div>
                                            <p className="text-[10px] text-white/50 font-bold uppercase tracking-[0.2em]">Estimated Earnings</p>
                                        </CardContent>
                                    </Card>
                                </div>

                                {/* Quick Actions Area */}
                                <div className="grid lg:grid-cols-2 gap-8">
                                    <div className="space-y-6">
                                        <h3 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                                            <Sparkles className="w-5 h-5 text-primary" /> Active System Status
                                        </h3>
                                        <Card className="rounded-[32px] border-none bg-white shadow-sm p-2 overflow-hidden">
                                            <div className="flex items-center gap-4 p-5 bg-green-50 rounded-[28px] border border-green-100/50">
                                                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-green-600 shadow-sm border border-green-200/50 shrink-0">
                                                    <ShieldCheck className="w-7 h-7" />
                                                </div>
                                                <div>
                                                    <h4 className="font-black text-green-800 text-sm">Verified Business</h4>
                                                    <p className="text-[11px] text-green-600 font-bold leading-tight mt-0.5">Your account is active and ready for bookings.</p>
                                                </div>
                                            </div>
                                        </Card>
                                    </div>

                                    <div className="space-y-6">
                                        <h3 className="text-xl font-black text-slate-900 tracking-tight">Channel Performance</h3>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="bg-white p-5 lg:p-6 rounded-[32px] shadow-sm border border-slate-100">
                                                <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1">Success Rate</p>
                                                <p className="text-xl font-black text-slate-900 tracking-tighter">98.4%</p>
                                            </div>
                                            <div className="bg-white p-5 lg:p-6 rounded-[32px] shadow-sm border border-slate-100 flex items-center justify-between">
                                                <div>
                                                    <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1">Rating</p>
                                                    <p className="text-xl font-black text-slate-900 tracking-tighter">{averageRating || user.rating || '4.9'}/5</p>
                                                </div>
                                                <div className="flex gap-0.5">
                                                    {[1, 2, 3, 4, 5].map((s) => (
                                                        <Star key={s} className={cn("w-3 h-3", s <= Math.round(averageRating || 5) ? "text-amber-400 fill-amber-400" : "text-slate-200")} />
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Services List - Premium Grid */}
                        {activeTab === 'services' && (
                            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                    <div className="relative flex-1 max-w-md">
                                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <input
                                            type="text"
                                            placeholder="Search services..."
                                            className="w-full h-12 pl-12 pr-4 rounded-[20px] bg-white border-none shadow-sm text-sm font-medium focus:ring-2 focus:ring-primary/20 transition-all font-sans"
                                        />
                                    </div>
                                    <Button onClick={() => router.push("/vendor/add-service")} className="h-12 px-8 rounded-[20px] gap-2 shadow-lg shadow-primary/20">
                                        <Plus className="w-5 h-5" /> Add New Service
                                    </Button>
                                </div>

                                {myServices.length === 0 && !user.serviceName ? (
                                    <div className="text-center py-20 lg:py-32 bg-white rounded-[32px] shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-slate-100">
                                        <div className="w-20 h-20 bg-slate-50 rounded-[32px] flex items-center justify-center mx-auto mb-8 grayscale opacity-50">
                                            <Package className="w-10 h-10 text-slate-900" />
                                        </div>
                                        <h3 className="text-2xl lg:text-3xl font-black text-slate-900 tracking-tight mb-3">No services published</h3>
                                        <p className="text-slate-500 max-w-sm mx-auto mb-10 text-base lg:text-lg font-medium px-6">Your business catalog is currently empty. Start reaching customers today.</p>
                                        <Button onClick={() => router.push("/vendor/add-service")} className="h-14 px-10 rounded-2xl text-lg font-bold shadow-xl shadow-primary/20">
                                            Add Your First Service
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                                        {/* Primary App Service */}
                                        {user.serviceName && (
                                            <Card className="rounded-[32px] border-none bg-primary/5 shadow-none overflow-hidden group">
                                                <div className="p-6 lg:p-8">
                                                    <div className="flex justify-between items-start mb-6">
                                                        <div className="p-3 bg-primary text-white rounded-xl shadow-lg shadow-primary/30">
                                                            <ShieldCheck className="w-5 h-5" />
                                                        </div>
                                                        <Badge className="bg-white text-primary rounded-full px-4 h-8 border-none font-black shadow-sm tracking-widest uppercase text-[9px]">Primary Entity</Badge>
                                                    </div>
                                                    <h3 className="text-xl font-black text-slate-900 tracking-tight mb-2 uppercase">{user.serviceName}</h3>
                                                    <p className="text-slate-500 text-[11px] font-bold uppercase tracking-wide mb-8">Main Service Provider</p>
                                                    <div className="flex items-center gap-3 pt-6 border-t border-primary/10">
                                                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                                        <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Active & Ready</span>
                                                    </div>
                                                </div>
                                            </Card>
                                        )}

                                        {myServices.map((service, idx) => (
                                            <Card key={service._id || idx} className="rounded-[32px] border-none shadow-[10px_10px_40px_-15px_rgba(0,0,0,0.05)] bg-white overflow-hidden group hover:-translate-y-3 transition-all duration-500">
                                                <div className="aspect-[16/10] w-full bg-slate-100 relative overflow-hidden">
                                                    {service.image ? (
                                                        // eslint-disable-next-line @next/next/no-img-element
                                                        <img
                                                            src={service.image}
                                                            alt={service.name}
                                                            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                                                        />
                                                    ) : (
                                                        <div className="h-full w-full flex items-center justify-center text-slate-300">
                                                            <Package className="w-16 h-16 opacity-20" />
                                                        </div>
                                                    )}
                                                    <div className="absolute top-4 right-4 sm:top-6 sm:right-6">
                                                        <Badge className="bg-white/90 backdrop-blur-xl text-slate-900 h-9 sm:h-10 px-4 sm:px-5 rounded-full font-black shadow-lg border-none text-[9px] uppercase tracking-widest">
                                                            {service.category}
                                                        </Badge>
                                                    </div>
                                                </div>
                                                <div className="p-6 lg:p-8">
                                                    <div className="flex justify-between items-start gap-4 mb-4">
                                                        <h3 className="text-lg font-black text-slate-900 group-hover:text-primary transition-colors tracking-tighter uppercase">{service.name}</h3>
                                                        <p className="text-xl font-black text-primary tracking-tighter leading-none">{service.price}</p>
                                                    </div>
                                                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider line-clamp-2 min-h-[32px]">{service.description}</p>

                                                    <div className="flex items-center gap-2 mt-8 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-500">
                                                        <Button variant="outline" className="flex-1 h-11 rounded-xl border-slate-200 font-black uppercase text-[10px] tracking-widest hover:bg-slate-50">Optimize</Button>
                                                        <Button variant="ghost" size="icon" className="h-11 w-11 rounded-xl text-red-500 hover:bg-red-50 hover:text-red-600" title="Manage Service">
                                                            <AlertCircle className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            </Card>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Appointments - High Fidelity Table */}
                        {activeTab === 'bookings' && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
                                <Card className="rounded-[32px] border-none shadow-[0_8px_30px_rgba(0,0,0,0.04)] bg-white overflow-hidden">
                                    <div className="p-6 lg:p-10 border-b border-slate-50">
                                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                                            <div>
                                                <h3 className="text-xl lg:text-2xl font-black text-slate-900 tracking-tight">Booking List</h3>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Your recent service requests</p>
                                            </div>
                                            <div className="flex bg-slate-50 p-1 rounded-xl border border-slate-100 w-fit">
                                                <Button size="sm" className="h-9 px-4 lg:px-6 rounded-lg bg-white text-slate-900 hover:bg-white shadow-sm font-black text-[10px] uppercase tracking-widest border-none transition-none">Active</Button>
                                                <Button size="sm" variant="ghost" className="h-9 px-4 lg:px-6 rounded-lg text-slate-500 hover:text-slate-900 font-black text-[10px] uppercase tracking-widest">History</Button>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-0">
                                        {bookings.length === 0 ? (
                                            <div className="p-16 lg:p-32 text-center">
                                                <div className="w-16 h-16 lg:w-20 lg:h-20 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-6 grayscale opacity-50">
                                                    <Calendar className="w-8 h-8 lg:w-10 lg:h-10 text-slate-900" />
                                                </div>
                                                <h3 className="text-xl lg:text-2xl font-black text-slate-900 tracking-tight mb-2 uppercase">No bookings yet</h3>
                                                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Waiting for new requests</p>
                                            </div>
                                        ) : (
                                            <div className="overflow-x-auto">
                                                <Table>
                                                    <TableHeader className="bg-slate-50/50">
                                                        <TableRow className="hover:bg-transparent border-none">
                                                            <TableHead className="h-16 font-bold text-slate-400 uppercase tracking-widest text-[10px]">Customer</TableHead>
                                                            <TableHead className="h-16 font-bold text-slate-400 uppercase tracking-widest text-[10px]">Location</TableHead>
                                                            <TableHead className="h-16 font-bold text-slate-400 uppercase tracking-widest text-[10px]">Date & Time</TableHead>
                                                            <TableHead className="h-16 font-bold text-slate-400 uppercase tracking-widest text-[10px]">Status</TableHead>
                                                            <TableHead className="px-10 h-16 font-bold text-slate-400 uppercase tracking-widest text-[10px] text-right">Actions</TableHead>
                                                        </TableRow>
                                                    </TableHeader>
                                                    <TableBody>
                                                        {bookings.map((booking) => (
                                                            <TableRow key={booking._id} className="group hover:bg-slate-50/80 transition-all duration-300 border-b border-slate-50/50">
                                                                <TableCell className="px-6 lg:px-10 py-6 lg:py-8 whitespace-nowrap">
                                                                    <div className="flex items-center gap-3">
                                                                        <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center text-xs font-black shadow-sm border border-indigo-100 shrink-0 uppercase">
                                                                            {booking.userName?.charAt(0) || "U"}
                                                                        </div>
                                                                        <div>
                                                                            <p className="font-black text-slate-900 text-sm tracking-tight">{booking.userName}</p>
                                                                            <p className="text-[10px] text-slate-400 font-bold italic lowercase truncate max-w-[120px]">{booking.userEmail}</p>
                                                                        </div>
                                                                    </div>
                                                                </TableCell>
                                                                <TableCell className="max-w-[200px]">
                                                                    <div className="flex items-start gap-2 group-hover:translate-x-1 transition-transform">
                                                                        <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                                                                        <span className="text-sm text-slate-500 font-medium leading-relaxed">{booking.address}</span>
                                                                    </div>
                                                                </TableCell>
                                                                <TableCell>
                                                                    <div className="flex flex-col gap-1">
                                                                        <div className="flex items-center gap-2 text-[11px] font-black text-slate-900">
                                                                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                                                            {new Date(booking.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                                                        </div>
                                                                        <div className="text-[10px] font-bold text-slate-400 ml-5 uppercase tracking-widest">{booking.time}</div>
                                                                    </div>
                                                                </TableCell>
                                                                <TableCell>
                                                                    <Badge
                                                                        className={cn(
                                                                            "capitalize h-7 px-3 rounded-lg border-none font-black text-[8px] tracking-widest shadow-sm",
                                                                            booking.status === 'pending' && "bg-amber-100 text-amber-700",
                                                                            booking.status === 'confirmed' && "bg-green-100 text-green-700",
                                                                            booking.status === 'completed' && "bg-blue-100 text-blue-700"
                                                                        )}
                                                                    >
                                                                        {booking.status}
                                                                        {booking.isReviewed && <span className="ml-1 text-[7px] opacity-60">(Reviewed)</span>}
                                                                    </Badge>
                                                                </TableCell>
                                                                <TableCell className="text-right px-6 lg:px-10">
                                                                    {booking.status !== 'completed' && (
                                                                        <Button
                                                                            size="sm"
                                                                            className="h-8 rounded-lg bg-green-600 hover:bg-green-700 text-white font-bold text-[10px] uppercase tracking-widest"
                                                                            onClick={async () => {
                                                                                try {
                                                                                    const token = localStorage.getItem("vendor_token")
                                                                                    const res = await fetch(`http://localhost:5000/api/bookings/${booking._id}/status`, {
                                                                                        method: 'PUT',
                                                                                        headers: {
                                                                                            'Content-Type': 'application/json',
                                                                                            'Authorization': `Bearer ${token}`
                                                                                        },
                                                                                        body: JSON.stringify({ status: 'completed' })
                                                                                    })
                                                                                    const data = await res.json()
                                                                                    if (data.success) {
                                                                                        fetchBookings()
                                                                                    }
                                                                                } catch (e) {
                                                                                    console.error("Failed to complete booking", e)
                                                                                }
                                                                            }}
                                                                        >
                                                                            Complete Task
                                                                        </Button>
                                                                    )}
                                                                </TableCell>
                                                            </TableRow>
                                                        ))}
                                                    </TableBody>
                                                </Table>
                                            </div>
                                        )}
                                    </div>
                                </Card>
                            </div>
                        )}

                        {/* Feedback - Customer Intelligence Feed */}
                        {activeTab === 'feedback' && (
                            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
                                <div className="grid gap-8">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                        <div>
                                            <h3 className="text-2xl font-black text-slate-900 tracking-tight uppercase italic">Customer Reviews</h3>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">What your clients are saying about you</p>
                                        </div>
                                        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-6">
                                            <div className="text-center px-4 border-r border-slate-100">
                                                <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1">Average Rating</p>
                                                <p className="text-2xl font-black text-primary italic leading-none">{averageRating || user.rating || '4.9'}</p>
                                            </div>
                                            <div className="text-center px-4">
                                                <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1">Total Reviews</p>
                                                <p className="text-2xl font-black text-slate-900 italic leading-none">{reviews.length}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {reviews.length === 0 ? (
                                        <Card className="rounded-[32px] border-none shadow-sm bg-white p-20 text-center">
                                            <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-6 grayscale opacity-30">
                                                <MessageSquare className="w-10 h-10" />
                                            </div>
                                            <h4 className="text-xl font-black text-slate-900 uppercase italic">No Reviews Yet</h4>
                                            <p className="text-sm text-slate-500 max-w-sm mx-auto mt-2">Complete your bookings to start receiving feedback from your customers.</p>
                                        </Card>
                                    ) : (
                                        <div className="grid gap-6">
                                            {reviews.map((review, i) => (
                                                <Card key={review._id || i} className="rounded-[28px] border-none shadow-sm bg-white overflow-hidden group hover:shadow-md transition-all duration-300">
                                                    <div className="p-6 lg:p-8 flex items-start gap-6">
                                                        <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center shrink-0 border border-slate-100 group-hover:border-primary/20 transition-colors">
                                                            <div className="text-xl font-black text-slate-300 group-hover:text-primary transition-colors">
                                                                {(review.userName || "C")[0].toUpperCase()}
                                                            </div>
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center justify-between mb-2">
                                                                <h4 className="font-black text-slate-900 text-lg tracking-tight truncate uppercase italic">{review.userName || 'Verified Client'}</h4>
                                                                <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 rounded-full">
                                                                    <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                                                                    <span className="text-xs font-black text-amber-700">{review.rating}</span>
                                                                </div>
                                                            </div>
                                                            <p className="text-slate-500 text-sm leading-relaxed font-medium italic">"{review.comment || 'No specific feedback provided for this deployment.'}"</p>
                                                            <div className="flex items-center gap-2 mt-6">
                                                                <Clock className="w-3.5 h-3.5 text-slate-300" />
                                                                <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">
                                                                    {new Date(review.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </Card>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    )
}
