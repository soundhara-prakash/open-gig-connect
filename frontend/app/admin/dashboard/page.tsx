"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
    Sparkles,
    Wrench,
    Bug,
    Scissors,
    Truck,
    Palette,
    GraduationCap,
    ShoppingBag,
    Flower2,
    Briefcase,
    FolderPlus,
    LogOut,
    Search,
    ChevronRight,
    Trash2,
    Building2,
    Calendar,
    Mail,
    Phone,
    CheckCircle,
    XCircle,
    User,
    ExternalLink,
    Eye
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { Menu, X } from "lucide-react"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

export default function AdminDashboard() {
    const router = useRouter()
    const [services, setServices] = useState<any[]>([])
    const [vendors, setVendors] = useState<any[]>([])
    const [activeVendors, setActiveVendors] = useState<any[]>([])
    const [bookings, setBookings] = useState<any[]>([])
    const [searchTerm, setSearchTerm] = useState("")
    const [selectedService, setSelectedService] = useState<string | null>(null)
    const [selectedActiveVendorService, setSelectedActiveVendorService] = useState<string | null>(null)
    const [confirmDelete, setConfirmDelete] = useState<{ id: string, type: 'vendor' | 'service' } | null>(null)
    const [isAddModalOpen, setIsAddModalOpen] = useState(false)
    const [selectedProofUrl, setSelectedProofUrl] = useState<string | null>(null)
    const [addLoading, setAddLoading] = useState(false)
    const [newService, setNewService] = useState({
        name: "",
        description: "",
        price: "Starting from ₹499",
        category: "Cleaning",
        image: ""
    })

    // Icon mapping for service categories (same as landing page)
    const getServiceIcon = (name: string) => {
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

    // Derived unique service types from the database (Master Categories only)
    const uniqueServiceTypes = useMemo(() => {
        const unique: any[] = []
        const seenNames = new Set()

        services.forEach(s => {
            const name = s.name?.toLowerCase().trim()
            // We only care about Admin-created services (no vendorId) as the master categories
            if (!s.vendorId && name && !seenNames.has(name)) {
                seenNames.add(name)
                unique.push(s)
            }
        })

        const filtered = unique.filter(s =>
            s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (s.category && s.category.toLowerCase().includes(searchTerm.toLowerCase()))
        )

        return filtered
    }, [services, searchTerm])

    useEffect(() => {
        const token = localStorage.getItem('admin_token')
        if (!token) {
            router.push('/admin/login')
            return
        }

        fetchData()

        // Set up polling interval for real-time updates (every 30 seconds)
        const interval = setInterval(() => {
            fetchData()
        }, 30000)

        return () => clearInterval(interval)
    }, [])

    const fetchData = () => {
        fetchServices()
        fetchVendors()
        fetchActiveVendors()
        fetchBookings()
    }

    const fetchServices = async () => {
        try {
            const res = await fetch('http://localhost:5000/api/services')
            const data = await res.json()
            if (data.success) setServices(data.services)
        } catch (error) { console.error(error) }
    }

    const fetchVendors = async () => {
        try {
            const res = await fetch('http://localhost:5000/api/admin/vendors', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('admin_token')}` }
            })
            const data = await res.json()
            if (data.success) setVendors(data.vendors)
        } catch (error) { console.error(error) }
    }

    const fetchActiveVendors = async () => {
        try {
            const res = await fetch('http://localhost:5000/api/admin/vendors/active', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('admin_token')}` }
            })
            const data = await res.json()
            if (data.success) setActiveVendors(data.vendors)
        } catch (error) { console.error(error) }
    }

    const fetchBookings = async () => {
        try {
            const res = await fetch('http://localhost:5000/api/admin/bookings', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('admin_token')}` }
            })
            const data = await res.json()
            if (data.success) setBookings(data.bookings)
        } catch (error) { console.error(error) }
    }

    const handleDeleteVendor = async (vendorId: string) => {
        try {
            const res = await fetch(`http://localhost:5000/api/admin/vendor/${vendorId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${localStorage.getItem('admin_token')}` }
            })
            const data = await res.json()
            if (data.success) {
                toast.success("Vendor deleted successfully")
                fetchData()
            } else {
                toast.error(data.message || "Failed to delete vendor")
            }
        } catch (error) {
            console.error(error)
            toast.error("An error occurred")
        }
    }

    const handleDeleteServiceType = async (serviceName: string) => {
        try {
            // Find all services with this name to delete them
            const servicesToDelete = services.filter(s => s.name.toLowerCase() === serviceName.toLowerCase())

            for (const s of servicesToDelete) {
                await fetch(`http://localhost:5000/api/admin/service/${s._id}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('admin_token')}` }
                })
            }

            toast.success(`All "${serviceName}" services deleted successfully`)
            fetchServices()
        } catch (error) {
            console.error(error)
            toast.error("Failed to delete services")
        }
    }

    const handleUpdatePayment = async (bookingId: string, status: string) => {
        try {
            const res = await fetch(`http://localhost:5000/api/admin/booking/${bookingId}/payment`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('admin_token')}`
                },
                body: JSON.stringify({ paymentStatus: status })
            })
            const data = await res.json()
            if (data.success) {
                toast.success(`Payment status updated to ${status}`)
                fetchBookings()
            } else {
                toast.error(data.message || "Failed to update payment")
            }
        } catch (error) {
            console.error(error)
            toast.error("An error occurred")
        }
    }

    const handleVerifyVendor = async (id: string, action: string) => {
        try {
            const res = await fetch(`http://localhost:5000/api/admin/verify-vendor/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('admin_token')}`
                },
                body: JSON.stringify({ action })
            })
            const data = await res.json()
            if (data.success) {
                toast.success(`Vendor ${action === 'approve' ? 'approved' : 'rejected'} successfully`)
                fetchData()
            }
            else toast.error(data.message || "Failed to verify vendor")
        } catch (error) {
            console.error(error)
            toast.error("An error occurred")
        }
    }

    const handleLogout = () => {
        localStorage.removeItem('admin_token')
        localStorage.removeItem('admin_user')
        router.push('/admin/login')
    }

    const handleAddService = async (e: React.FormEvent) => {
        e.preventDefault()
        setAddLoading(true)
        try {
            const res = await fetch('http://localhost:5000/api/services', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newService),
            })
            const data = await res.json()
            if (data.success) {
                toast.success("New Master Category added!")
                setIsAddModalOpen(false)
                fetchServices()
                setNewService({ name: "", description: "", price: "Starting from ₹499", category: "Cleaning", image: "" })
            } else {
                toast.error("Failed to add service")
            }
        } catch (error) {
            console.error(error)
            toast.error("Error adding service")
        } finally {
            setAddLoading(false)
        }
    }

    const [activeTab, setActiveTab] = useState("services")
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

    return (
        <div className="flex min-h-screen bg-gray-50/50">
            {/* Sidebar Navigation */}
            <aside className={cn(
                "fixed inset-y-0 left-0 w-72 bg-white border-r flex flex-col z-50 shadow-[4px_0_24px_rgba(0,0,0,0.02)] transition-transform duration-300 lg:sticky lg:translate-x-0 lg:h-screen",
                isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                <div className="p-6 pb-4">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3 group cursor-pointer">
                            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 transition-transform group-hover:scale-105">
                                <Building2 className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-xl font-extrabold text-gray-900 tracking-tight">EasyHire</h1>
                                <p className="text-[10px] font-bold text-primary uppercase tracking-widest">Administrator</p>
                            </div>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="lg:hidden rounded-xl"
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            <X className="w-5 h-5 text-gray-500" />
                        </Button>
                    </div>

                    <nav className="space-y-1.5">
                        {[
                            { id: 'services', label: 'Service Library', icon: Sparkles },
                            { id: 'vendors-pending', label: 'Pending Vetting', icon: Bug },
                            { id: 'vendors-active', label: 'Active Partners', icon: CheckCircle },
                            { id: 'bookings', label: 'Revenue & Bookings', icon: Briefcase },
                        ].map((item) => (
                            <button
                                key={item.id}
                                onClick={() => {
                                    setActiveTab(item.id)
                                    setIsMobileMenuOpen(false)
                                }}
                                className={cn(
                                    "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 font-bold text-sm tracking-tight",
                                    activeTab === item.id
                                        ? "bg-primary text-white shadow-lg shadow-primary/20"
                                        : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                                )}
                            >
                                <item.icon className={cn("w-5 h-5", activeTab === item.id ? "text-white" : "text-gray-400")} />
                                {item.label}
                                {item.id === 'vendors-pending' && vendors.length > 0 && (
                                    <span className="ml-auto bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full">
                                        {vendors.length}
                                    </span>
                                )}
                            </button>
                        ))}
                    </nav>
                </div>

                <div className="mt-auto p-6 pt-4 border-t bg-gray-50/30">
                    <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                        <DialogTrigger asChild>
                            <Button
                                variant="default"
                                className="w-full gap-2 bg-gray-900 hover:bg-black text-white rounded-xl h-12 shadow-md mb-4 font-bold"
                            >
                                <FolderPlus className="w-4 h-4" />
                                Create Service
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[500px] rounded-3xl">
                            <DialogHeader>
                                <DialogTitle>Add New Master Category</DialogTitle>
                                <DialogDescription>
                                    Create a new high-level service category for the platform.
                                </DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleAddService} className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Category Name</Label>
                                    <Input
                                        id="name"
                                        placeholder="e.g. Pet Grooming"
                                        value={newService.name}
                                        onChange={(e) => setNewService({ ...newService, name: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="category">Internal Tag</Label>
                                        <Input
                                            id="category"
                                            value={newService.category}
                                            onChange={(e) => setNewService({ ...newService, category: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="price">Base Pricing</Label>
                                        <Input
                                            id="price"
                                            value={newService.price}
                                            onChange={(e) => setNewService({ ...newService, price: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="description">Description</Label>
                                    <Textarea
                                        id="description"
                                        placeholder="Expert pet care and grooming services..."
                                        value={newService.description}
                                        onChange={(e) => setNewService({ ...newService, description: e.target.value })}
                                        required
                                    />
                                </div>
                                <DialogFooter>
                                    <Button type="submit" disabled={addLoading} className="w-full">
                                        {addLoading ? "Saving..." : "Create Category"}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>

                    <Button
                        variant="ghost"
                        onClick={handleLogout}
                        className="w-full text-red-600 hover:bg-red-50 hover:text-red-700 gap-2 font-black uppercase tracking-tighter rounded-xl h-12"
                    >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                    </Button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 overflow-y-auto h-screen relative">
                {/* Mobile Menu Backdrop */}
                {isMobileMenuOpen && (
                    <div
                        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
                        onClick={() => setIsMobileMenuOpen(false)}
                    />
                )}

                <div className="max-w-7xl mx-auto p-6 lg:p-10">
                    <header className="mb-8 lg:mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6 animate-in fade-in slide-in-from-top-4 duration-700">
                        <div className="flex items-center justify-between w-full md:w-auto">
                            <div className="flex lg:hidden items-center gap-3">
                                <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
                                    <Building2 className="w-6 h-6 text-white" />
                                </div>
                                <h1 className="text-xl font-extrabold text-gray-900 tracking-tight">Admin</h1>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="lg:hidden rounded-xl border bg-white shadow-sm"
                                onClick={() => setIsMobileMenuOpen(true)}
                            >
                                <Menu className="w-6 h-6 text-gray-700" />
                            </Button>
                        </div>

                        <div>
                            <h2 className="text-3xl lg:text-4xl font-black text-gray-900 tracking-tight mb-2">
                                {activeTab === 'services' && "Service Architecture"}
                                {activeTab === 'vendors-pending' && "Awaiting Approval"}
                                {activeTab === 'vendors-active' && "Partner Ecosystem"}
                                {activeTab === 'bookings' && "Revenue Command"}
                            </h2>
                            <p className="text-gray-500 font-medium text-sm lg:text-lg italic">
                                {activeTab === 'services' && "Defining core offerings."}
                                {activeTab === 'vendors-pending' && "Vetting service providers."}
                                {activeTab === 'vendors-active' && "Managing authorized partners."}
                                {activeTab === 'bookings' && "Real-time oversight."}
                            </p>
                        </div>
                        <div className="hidden md:flex items-center gap-3 px-5 py-2.5 bg-white rounded-xl border shadow-sm group transition-all hover:border-primary/20">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
                            <span className="text-[10px] font-black text-gray-700 uppercase tracking-widest">Status: Nominal</span>
                        </div>
                    </header>

                    <div className="animate-in fade-in zoom-in-95 duration-500">
                        {/* Service Groups Management */}
                        {activeTab === 'services' && (
                            <div className="space-y-8">
                                <div className="flex flex-col sm:flex-row justify-between items-center bg-white p-5 rounded-2xl border shadow-sm gap-4">
                                    <h3 className="text-sm font-black text-gray-900 tracking-tight flex items-center gap-3">
                                        <span className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500">{uniqueServiceTypes.length}</span>
                                        MASTER CATEGORIES
                                    </h3>
                                    <div className="relative w-full sm:w-72">
                                        <Search className="absolute left-4 top-3 h-4 w-4 text-gray-400" />
                                        <Input
                                            placeholder="Search..."
                                            className="pl-11 bg-gray-50 border-0 h-10 rounded-xl font-bold text-sm"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                                    {uniqueServiceTypes.map((service, idx) => {
                                        const Icon = getServiceIcon(service.name)
                                        return (
                                            <div key={service._id} className="animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: `${idx * 50}ms` }}>
                                                <Card
                                                    className="relative group transition-all duration-500 hover:shadow-2xl border-0 aspect-square flex flex-col items-center justify-center text-center p-6 bg-white overflow-hidden rounded-[32px] shadow-[0_8px_30px_rgba(0,0,0,0.04)]"
                                                >
                                                    <div className="p-5 bg-gray-50 rounded-[24px] mb-4 group-hover:bg-primary/10 transition-colors duration-700">
                                                        <Icon className="w-10 h-10 text-gray-400 group-hover:text-primary transition-all duration-700 group-hover:scale-110" />
                                                    </div>
                                                    <h3 className="text-sm font-black text-gray-900 leading-tight px-2 uppercase tracking-wide">{service.name}</h3>

                                                    {/* Action Overlay */}
                                                    <div className="absolute inset-0 bg-white/95 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 p-6 backdrop-blur-md">
                                                        <Badge variant="secondary" className="mb-4 py-1 px-3 text-[9px] font-black uppercase tracking-[0.2em] bg-gray-100 text-gray-500 rounded-lg">{service.category}</Badge>
                                                        <Button
                                                            variant={confirmDelete?.id === service.name ? "default" : "destructive"}
                                                            size="sm"
                                                            className="w-full text-[10px] font-black h-10 rounded-xl transition-all shadow-md"
                                                            onClick={(e) => {
                                                                e.stopPropagation()
                                                                if (confirmDelete?.id === service.name) {
                                                                    handleDeleteServiceType(service.name)
                                                                    setConfirmDelete(null)
                                                                } else {
                                                                    setConfirmDelete({ id: service.name, type: 'service' })
                                                                    setTimeout(() => setConfirmDelete(null), 3000)
                                                                }
                                                            }}
                                                        >
                                                            {confirmDelete?.id === service.name ? "CONFIRM NOW" : <><Trash2 className="w-4 h-4 mr-2" /> WIPE GROUP</>}
                                                        </Button>
                                                    </div>
                                                </Card>
                                            </div>
                                        )
                                    })}
                                    {uniqueServiceTypes.length === 0 && (
                                        <div className="col-span-full py-24 bg-white rounded-[32px] border-2 border-dashed border-gray-100 text-center">
                                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                                <Search className="w-6 h-6 text-gray-300" />
                                            </div>
                                            <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">No Results Found</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Pending Verification */}
                        {activeTab === 'vendors-pending' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {vendors.map((vendor, idx) => (
                                    <div key={vendor._id} className="animate-in fade-in slide-in-from-bottom-6 duration-700" style={{ animationDelay: `${idx * 100}ms` }}>
                                        <Card className="overflow-hidden border-0 shadow-[0_8px_30px_rgba(0,0,0,0.04)] hover:shadow-xl transition-all duration-500 rounded-[32px] bg-white group">
                                            <CardHeader className="bg-yellow-50/20 pb-6 p-6 lg:p-8 border-b border-yellow-100/30">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <CardTitle className="text-xl font-black text-gray-900 tracking-tighter mb-1">{vendor.name}</CardTitle>
                                                        <CardDescription className="font-bold text-gray-400 text-[10px] italic">{vendor.email}</CardDescription>
                                                    </div>
                                                    <Badge className="bg-yellow-400 text-yellow-900 border-0 font-black text-[9px] uppercase tracking-widest px-3 py-1 rounded-full shadow-md">Reviewing</Badge>
                                                </div>
                                            </CardHeader>
                                            <CardContent className="space-y-6 p-6 lg:p-8 pt-6">
                                                <div className="grid grid-cols-2 gap-8">
                                                    <div className="space-y-1">
                                                        <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest">Vertical</p>
                                                        <p className="font-black text-base text-gray-800">{vendor.serviceName}</p>
                                                    </div>
                                                    <div className="space-y-1">
                                                        <p className="text-[9px] font-black text-gray-300 uppercase tracking-widest">Contact</p>
                                                        <p className="font-black text-base text-gray-800">{vendor.phone}</p>
                                                    </div>
                                                </div>

                                                {vendor.documentUrl && (
                                                    <div className="bg-gray-50/50 p-4 rounded-2xl border border-gray-100 transition-all duration-300">
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-10 h-10 bg-gray-900 rounded-xl flex items-center justify-center">
                                                                    <Eye className="w-4 h-4 text-white" />
                                                                </div>
                                                                <div>
                                                                    <span className="text-[10px] font-black text-gray-900 uppercase tracking-widest block">ID Evidence</span>
                                                                    <span className="text-[9px] text-gray-400 font-bold">Image</span>
                                                                </div>
                                                            </div>
                                                            <button
                                                                onClick={() => setSelectedProofUrl(vendor.documentUrl)}
                                                                className="px-4 py-2 bg-white border border-gray-900 rounded-lg text-gray-900 hover:text-white hover:bg-gray-900 transition-all text-[10px] font-black uppercase tracking-wider"
                                                            >
                                                                View
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}

                                                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                                                    <Button className="flex-1 bg-green-500 hover:bg-green-600 text-white shadow-md h-12 rounded-xl font-black uppercase tracking-widest text-[10px]" onClick={() => handleVerifyVendor(vendor._id, 'approve')}>Onboard</Button>
                                                    <Button variant="outline" className="flex-1 border-gray-100 text-red-500 hover:bg-red-50 h-12 rounded-xl font-black uppercase tracking-widest text-[10px]" onClick={() => handleVerifyVendor(vendor._id, 'reject')}>Decline</Button>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>
                                ))}
                                {vendors.length === 0 && (
                                    <div className="col-span-full py-24 bg-white rounded-[32px] border shadow-sm text-center">
                                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <CheckCircle className="w-6 h-6 text-green-400" />
                                        </div>
                                        <h3 className="text-lg font-black text-gray-900 mb-1">Queue Empty</h3>
                                        <p className="text-gray-400 font-medium">All vendor applications have been processed.</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Active Vendors */}
                        {activeTab === 'vendors-active' && (
                            <div className="space-y-8">
                                {!selectedActiveVendorService ? (
                                    <>
                                        <div className="flex flex-col sm:flex-row justify-between items-center bg-white p-5 rounded-2xl border shadow-sm gap-4">
                                            <h3 className="text-sm font-black text-gray-900 tracking-tight">EXPLORE BY DOMAIN</h3>
                                            <div className="relative w-full sm:w-72">
                                                <Search className="absolute left-4 top-3 h-4 w-4 text-gray-400" />
                                                <Input
                                                    placeholder="Filter..."
                                                    className="pl-11 bg-gray-50 border-0 h-10 rounded-xl font-bold text-sm"
                                                    value={searchTerm}
                                                    onChange={(e) => setSearchTerm(e.target.value)}
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                                            {uniqueServiceTypes.map((service, idx) => {
                                                const Icon = getServiceIcon(service.name)
                                                const vendorCount = activeVendors.filter(v => v.serviceName?.toLowerCase().includes(service.name.toLowerCase())).length

                                                return (
                                                    <div key={service._id} className="animate-in fade-in slide-in-from-bottom-2 duration-500" style={{ animationDelay: `${idx * 50}ms` }}>
                                                        <Card
                                                            className="cursor-pointer group transition-all duration-500 hover:shadow-xl border-0 aspect-square flex flex-col items-center justify-center text-center p-6 bg-white overflow-hidden rounded-[32px] shadow-[0_8px_30px_rgba(0,0,0,0.04)]"
                                                            onClick={() => {
                                                                setSelectedActiveVendorService(service.name)
                                                                window.scrollTo({ top: 0, behavior: 'smooth' })
                                                            }}
                                                        >
                                                            <div className="p-5 bg-gray-50 rounded-[24px] mb-4 group-hover:bg-primary/10 transition-colors duration-700">
                                                                <Icon className="w-10 h-10 text-gray-400 group-hover:text-primary transition-all duration-700 group-hover:scale-110" />
                                                            </div>
                                                            <h3 className="text-sm font-black text-gray-900 leading-tight px-2 uppercase tracking-wide">{service.name}</h3>
                                                            <Badge variant="secondary" className="mt-4 px-4 py-1.5 rounded-full font-black text-[9px] tracking-widest bg-primary/10 text-primary border-0">
                                                                {vendorCount} PARTNERS
                                                            </Badge>
                                                        </Card>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </>
                                ) : (
                                    <div className="animate-in slide-in-from-right-8 duration-700">
                                        <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-8 p-6 lg:p-10 bg-white rounded-[32px] shadow-sm border gap-6">
                                            <div className="flex items-center gap-5">
                                                <div className="p-4 bg-primary/10 rounded-2xl shadow-lg shadow-primary/5 shrink-0">
                                                    {(() => {
                                                        const Icon = getServiceIcon(selectedActiveVendorService)
                                                        return <Icon className="w-8 h-8 text-primary" />
                                                    })()}
                                                </div>
                                                <div>
                                                    <h3 className="text-2xl font-black text-gray-900 tracking-tighter uppercase">{selectedActiveVendorService}</h3>
                                                    <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px] mt-1">Authorized Provider Roster</p>
                                                </div>
                                            </div>
                                            <Button
                                                variant="outline"
                                                onClick={() => setSelectedActiveVendorService(null)}
                                                className="w-full lg:w-auto px-6 h-12 rounded-xl border-2 font-black uppercase tracking-widest hover:bg-gray-900 hover:text-white transition-all gap-2 text-xs"
                                            >
                                                <ChevronRight className="w-4 h-4 rotate-180" /> Change Realm
                                            </Button>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                                            {activeVendors
                                                .filter(v => v.serviceName?.toLowerCase().includes(selectedActiveVendorService.toLowerCase()))
                                                .filter(v => v.name.toLowerCase().includes(searchTerm.toLowerCase()))
                                                .map((vendor, idx) => (
                                                    <div key={vendor._id} className="animate-in fade-in slide-in-from-bottom-8 duration-700" style={{ animationDelay: `${idx * 100}ms` }}>
                                                        <Card className="hover:shadow-xl transition-all duration-700 rounded-[32px] border-0 shadow-[0_8px_30px_rgba(0,0,0,0.04)] bg-white overflow-hidden group">
                                                            <CardContent className="p-6 lg:p-8">
                                                                <div className="flex items-center gap-5 mb-8">
                                                                    <div className="w-16 h-16 rounded-2xl bg-gray-900 shadow-xl shadow-gray-200 flex items-center justify-center text-white text-2xl font-black transition-transform group-hover:scale-105 duration-500 shrink-0">
                                                                        {(vendor.name || 'V')[0].toUpperCase()}
                                                                    </div>
                                                                    <div>
                                                                        <h4 className="font-black text-xl text-gray-900 tracking-tighter mb-1 leading-none">{vendor.name}</h4>
                                                                        <div className="flex items-center gap-1.5 text-[9px] text-green-600 font-black uppercase tracking-widest bg-green-50 px-2.5 py-1 rounded-full w-fit">
                                                                            <div className="w-1 h-1 bg-green-500 rounded-full" /> Verified
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div className="space-y-3.5 text-xs text-gray-600 mb-8 bg-gray-50/50 p-5 lg:p-6 rounded-2xl border border-gray-100">
                                                                    <div className="flex items-center gap-3">
                                                                        <div className="w-7 h-7 rounded-lg bg-white flex items-center justify-center shadow-sm shrink-0">
                                                                            <Mail className="w-3 h-3 text-primary" />
                                                                        </div>
                                                                        <span className="truncate font-black text-gray-800 tracking-tight">{vendor.email}</span>
                                                                    </div>
                                                                    <div className="flex items-center gap-3">
                                                                        <div className="w-7 h-7 rounded-lg bg-white flex items-center justify-center shadow-sm shrink-0">
                                                                            <Phone className="w-3 h-3 text-primary" />
                                                                        </div>
                                                                        <span className="font-black text-gray-800">{vendor.phone}</span>
                                                                    </div>
                                                                </div>
                                                                <Button
                                                                    variant={confirmDelete?.id === vendor._id ? "default" : "outline"}
                                                                    className={cn(
                                                                        "w-full h-12 rounded-xl font-black uppercase tracking-widest transition-all duration-500 text-[10px]",
                                                                        confirmDelete?.id === vendor._id
                                                                            ? "bg-red-500 text-white hover:bg-red-600"
                                                                            : "text-red-500 border-gray-100 hover:bg-red-50"
                                                                    )}
                                                                    onClick={() => {
                                                                        if (confirmDelete?.id === vendor._id) {
                                                                            handleDeleteVendor(vendor._id)
                                                                            setConfirmDelete(null)
                                                                        } else {
                                                                            setConfirmDelete({ id: vendor._id, type: 'vendor' })
                                                                            setTimeout(() => setConfirmDelete(null), 3000)
                                                                        }
                                                                    }}
                                                                >
                                                                    {confirmDelete?.id === vendor._id ? (
                                                                        "Kill Connection"
                                                                    ) : (
                                                                        <>
                                                                            <Trash2 className="w-4 h-4 mr-3" />
                                                                            Revoke Access
                                                                        </>
                                                                    )}
                                                                </Button>
                                                            </CardContent>
                                                        </Card>
                                                    </div>
                                                ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Bookings Management */}
                        {activeTab === 'bookings' && (
                            <Card className="rounded-[32px] shadow-[0_8px_30px_rgba(0,0,0,0.04)] border-0 overflow-hidden bg-white">
                                <CardHeader className="bg-gray-50/20 p-6 lg:p-10 border-b">
                                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                                        <div className="flex items-center gap-5">
                                            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center shadow-lg shadow-primary/5 shrink-0">
                                                <Briefcase className="w-8 h-8 text-primary" />
                                            </div>
                                            <div>
                                                <CardTitle className="text-2xl lg:text-3xl font-black text-gray-900 tracking-tighter mb-1">Ledger Console</CardTitle>
                                                <CardDescription className="font-bold text-gray-400 uppercase tracking-widest text-[9px]">Platform Live Stream</CardDescription>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-3 lg:gap-4">
                                            <div className="bg-white p-3 lg:p-4 rounded-xl border shadow-sm text-center min-w-[120px]">
                                                <p className="text-[9px] font-black text-gray-300 uppercase mb-1">Flow</p>
                                                <p className="text-xl font-black text-gray-900 tracking-tighter">₹ {bookings.reduce((acc, curr) => acc + parseInt(curr.price?.replace(/\D/g, '') || '0'), 0).toLocaleString()}</p>
                                            </div>
                                            <div className="bg-white p-3 lg:p-4 rounded-xl border shadow-sm text-center min-w-[120px]">
                                                <p className="text-[9px] font-black text-gray-300 uppercase mb-1">Sessions</p>
                                                <p className="text-xl font-black text-gray-900 tracking-tighter">{bookings.length}</p>
                                            </div>
                                        </div>
                                    </div>
                                </CardHeader>
                                <div className="overflow-x-auto p-4">
                                    <Table>
                                        <TableHeader className="bg-transparent">
                                            <TableRow className="hover:bg-transparent border-0">
                                                <TableHead className="font-black text-gray-300 uppercase tracking-widest text-[10px] p-8">Vertical</TableHead>
                                                <TableHead className="font-black text-gray-300 uppercase tracking-widest text-[10px]">Client</TableHead>
                                                <TableHead className="font-black text-gray-300 uppercase tracking-widest text-[10px]">Timeframe</TableHead>
                                                <TableHead className="font-black text-gray-300 uppercase tracking-widest text-[10px]">Settlement</TableHead>
                                                <TableHead className="font-black text-gray-300 uppercase tracking-widest text-[10px] text-center">Status</TableHead>
                                                <TableHead className="font-black text-gray-300 uppercase tracking-widest text-[10px] text-right p-8">Operations</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {bookings.map((booking) => (
                                                <TableRow key={booking._id} className="hover:bg-gray-50/50 transition-colors border-b border-gray-50">
                                                    <TableCell className="p-6 shrink-0">
                                                        <span className="font-black text-primary text-[10px] uppercase tracking-widest px-3 py-1 bg-primary/5 rounded-lg border border-primary/10 block w-fit whitespace-nowrap">{booking.serviceName}</span>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="font-black text-gray-900 text-sm">{booking.userName}</div>
                                                        <div className="text-[9px] font-bold text-gray-400 italic truncate max-w-[120px]">{booking.userEmail}</div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="text-xs font-black text-gray-800">{booking.date}</div>
                                                        <div className="text-[9px] font-bold text-gray-400 mt-0.5">{booking.time}</div>
                                                    </TableCell>
                                                    <TableCell className="font-black text-gray-900 text-sm whitespace-nowrap">{booking.price}</TableCell>
                                                    <TableCell className="text-center">
                                                        <Badge
                                                            className={`font-black text-[8px] uppercase tracking-widest px-3 py-1 rounded-full border-0 shadow-sm ${booking.paymentStatus === 'paid' ? 'bg-green-500 text-white' :
                                                                booking.paymentStatus === 'failed' ? 'bg-red-500 text-white' :
                                                                    'bg-gray-200 text-gray-500'
                                                                }`}
                                                        >
                                                            {booking.paymentStatus || 'Pending'}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="p-6">
                                                        <div className="flex justify-end gap-2">
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                className="h-8 px-3 text-[9px] font-black uppercase tracking-widest border-green-100 text-green-600 hover:bg-green-500 hover:text-white rounded-lg transition-all"
                                                                onClick={() => handleUpdatePayment(booking._id, 'paid')}
                                                            >
                                                                Paid
                                                            </Button>
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                className="h-8 px-3 text-[9px] font-black uppercase tracking-widest border-red-100 text-red-500 hover:bg-red-500 hover:text-white rounded-lg transition-all"
                                                                onClick={() => handleUpdatePayment(booking._id, 'failed')}
                                                            >
                                                                Void
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            </Card>
                        )}
                    </div>
                </div>
            </main>

            {/* Proof View Popup */}
            <Dialog open={!!selectedProofUrl} onOpenChange={(open) => !open && setSelectedProofUrl(null)}>
                <DialogContent className="sm:max-w-[800px] p-0 overflow-hidden bg-black/95 border-0 rounded-[32px] shadow-2xl">
                    <DialogHeader className="p-8 bg-white border-b relative">
                        <DialogTitle className="text-2xl font-black text-gray-900 tracking-tighter uppercase">Factual Verification</DialogTitle>
                        <DialogDescription className="font-bold text-gray-400 text-xs">
                            Scrutinizing original document submitted by partner.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex items-center justify-center p-4 bg-gray-900 min-h-[500px]">
                        {selectedProofUrl && (
                            <img
                                src={selectedProofUrl}
                                alt="Vendor Proof Evidence"
                                className="max-w-full max-h-[70vh] object-contain shadow-[0_0_60px_rgba(0,0,0,0.5)] rounded-2xl animate-in fade-in zoom-in-95 duration-500"
                            />
                        )}
                    </div>
                    <div className="p-8 bg-white border-t flex justify-end">
                        <Button
                            onClick={() => setSelectedProofUrl(null)}
                            className="bg-gray-900 hover:bg-black text-white px-10 h-14 rounded-2xl font-black uppercase tracking-widest"
                        >
                            Complete Review
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}
