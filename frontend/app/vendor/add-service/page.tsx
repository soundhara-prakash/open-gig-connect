"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Upload, ArrowLeft, Plus, Sparkles, Image as ImageIcon } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { cn } from "@/lib/utils"

export default function AddServicePage() {
    const router = useRouter()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [user, setUser] = useState<any>(null)
    const [newService, setNewService] = useState({
        name: "",
        description: "",
        price: "",
        category: ""
    })
    const [serviceImage, setServiceImage] = useState<File | null>(null)
    const [isLoading, setIsLoading] = useState(false)

    useEffect(() => {
        const userData = localStorage.getItem("vendor_user")
        if (!userData) {
            router.push("/user/login")
            return
        }
        setUser(JSON.parse(userData))
    }, [router])

    const handleServiceSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            let imageUrl = ""
            if (serviceImage) {
                const imageFormData = new FormData()
                imageFormData.append("image", serviceImage)

                const uploadRes = await fetch('http://localhost:5000/image', {
                    method: 'POST',
                    body: imageFormData
                })
                const uploadData = await uploadRes.json()
                if (uploadData.success) {
                    imageUrl = uploadData.imageUrl
                }
            }

            const servicePayload = {
                ...newService,
                category: newService.category || user?.category || "General",
                image: imageUrl
            }

            const token = localStorage.getItem("vendor_token")
            const res = await fetch('http://localhost:5000/api/services', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(servicePayload)
            })

            const data = await res.json()
            if (data.success) {
                router.push("/vendor/dashboard")
            } else {
                alert("Failed to add service: " + data.message)
            }
        } catch (error) {
            console.error("Error adding service", error)
            alert("Error adding service")
        } finally {
            setIsLoading(false)
        }
    }

    if (!user) return (
        <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
            <div className="h-10 w-10 rounded-full border-t-2 border-primary animate-spin"></div>
        </div>
    )

    return (
        <div className="min-h-screen bg-[#F8FAFC] flex flex-col p-6 relative overflow-hidden">
            {/* Consistent Left-Aligned Header */}
            <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200/60 p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => router.back()} className="h-10 w-10 border shadow-sm bg-white rounded-xl">
                        <ArrowLeft className="w-5 h-5 text-slate-600" />
                    </Button>
                    <div className="flex flex-col">
                        <h1 className="font-black text-sm lg:text-base tracking-tight text-slate-900 truncate uppercase italic leading-none">
                            {user.serviceName || user.name}
                        </h1>
                        <p className="text-[8px] lg:text-[10px] font-black text-primary uppercase tracking-[0.2em] truncate mt-1">
                            {user.category || "Professional Partner"}
                        </p>
                    </div>
                </div>
            </header>

            {/* Background Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-full opacity-30 pointer-events-none mt-20">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary/20 blur-[120px] rounded-full" />
            </div>

            <div className="flex-1 flex items-center justify-center mt-20">
                <Card className="w-full max-w-2xl rounded-[32px] border-none shadow-[0_20px_60px_rgba(0,0,0,0.08)] bg-white/90 backdrop-blur-xl relative z-10 animate-in fade-in zoom-in-95 duration-500">
                    <CardHeader className="p-6 lg:p-10 pb-4 text-center">
                        <div className="flex items-center justify-center mb-6">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="absolute left-6 lg:left-8 top-6 lg:top-10 rounded-2xl hover:bg-slate-100 h-10 lg:h-12 w-10 lg:w-12 transition-all"
                                onClick={() => router.push("/vendor/dashboard")}
                            >
                                <ArrowLeft className="w-5 h-5 text-slate-900" />
                            </Button>
                            <div className="bg-primary/10 p-4 rounded-[24px] text-primary shadow-inner">
                                <Sparkles className="w-7 h-7 lg:w-8 lg:h-8" />
                            </div>
                        </div>
                        <CardTitle className="text-3xl lg:text-4xl font-black text-slate-900 tracking-tight mb-2 uppercase italic">Listing Creation</CardTitle>
                        <CardDescription className="text-sm lg:text-lg text-slate-500 font-black uppercase tracking-widest italic opacity-60">Add a premium service to your catalog.</CardDescription>
                    </CardHeader>

                    <CardContent className="p-10 pt-4">
                        <form onSubmit={handleServiceSubmit} className="space-y-8">
                            <div className="space-y-3 px-1 lg:px-0">
                                <Label className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] ml-2 italic">Service Intelligence</Label>
                                <Input
                                    value={newService.name}
                                    onChange={(e) => setNewService({ ...newService, name: e.target.value })}
                                    placeholder="Business Service Name"
                                    required
                                    className="h-14 rounded-2xl border-slate-100 bg-slate-50/50 focus:bg-white transition-all text-base lg:text-lg px-6 font-bold uppercase tracking-tight"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 px-1 lg:px-0">
                                <div className="space-y-3">
                                    <Label className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] ml-2 italic">Price Point</Label>
                                    <Input
                                        value={newService.price}
                                        onChange={(e) => setNewService({ ...newService, price: e.target.value })}
                                        placeholder="e.g. $120.00"
                                        required
                                        className="h-14 rounded-2xl border-slate-100 bg-slate-50/50 focus:bg-white transition-all text-base lg:text-lg px-6 font-bold uppercase tracking-tight"
                                    />
                                </div>
                                <div className="space-y-3">
                                    <Label className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] ml-2 italic">Domain/Category</Label>
                                    <Input
                                        value={newService.category}
                                        onChange={(e) => setNewService({ ...newService, category: e.target.value })}
                                        placeholder={user.category || "General"}
                                        className="h-14 rounded-2xl border-slate-100 bg-slate-50/50 focus:bg-white transition-all text-base lg:text-lg px-6 font-bold uppercase tracking-tight placeholder:opacity-30"
                                    />
                                </div>
                            </div>

                            <div className="space-y-3 px-1 lg:px-0">
                                <Label className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] ml-2 italic">Service Specifications</Label>
                                <Textarea
                                    value={newService.description}
                                    onChange={(e) => setNewService({ ...newService, description: e.target.value })}
                                    placeholder="Detail the scope of work and professional standards..."
                                    required
                                    className="min-h-[120px] lg:min-h-[140px] rounded-[24px] border-slate-100 bg-slate-50/50 focus:bg-white transition-all text-base lg:text-lg p-6 font-bold resize-none"
                                />
                            </div>

                            <div className="space-y-3 px-1 lg:px-0 text-left">
                                <Label className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] ml-2 italic text-left block">Visual Identity</Label>
                                <div className={cn(
                                    "relative border-2 border-dashed rounded-[28px] lg:rounded-[32px] p-6 lg:p-10 text-center cursor-pointer transition-all duration-300 group",
                                    serviceImage ? "bg-primary/5 border-primary/30" : "bg-slate-50/50 border-slate-100 hover:border-primary/40 hover:bg-slate-100"
                                )}>
                                    <Input
                                        type="file"
                                        className="hidden"
                                        id="service-image"
                                        accept="image/*"
                                        onChange={(e) => setServiceImage(e.target.files?.[0] || null)}
                                    />
                                    <Label htmlFor="service-image" className="cursor-pointer flex flex-col items-center">
                                        <div className={cn(
                                            "w-16 h-16 lg:w-20 lg:h-20 rounded-2xl lg:rounded-[24px] flex items-center justify-center mb-4 transition-all duration-500",
                                            serviceImage ? "bg-primary text-white shadow-lg shadow-primary/30 rotate-6" : "bg-white text-slate-400 shadow-sm group-hover:scale-110"
                                        )}>
                                            {serviceImage ? <ImageIcon className="w-8 h-8 lg:w-10 lg:h-10" /> : <Upload className="w-8 h-8 lg:w-10 lg:h-10" />}
                                        </div>
                                        <p className="text-lg lg:text-xl font-black text-slate-900 mb-1 truncate max-w-full">
                                            {serviceImage ? serviceImage.name : "High-Res Branding"}
                                        </p>
                                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest italic">
                                            {serviceImage ? "File selection locked" : "Supports JPEG & PNG"}
                                        </span>
                                    </Label>
                                </div>
                            </div>

                            <Button
                                type="submit"
                                disabled={isLoading}
                                className="w-full h-14 lg:h-16 rounded-2xl lg:rounded-[24px] text-lg lg:text-xl font-black shadow-2xl shadow-primary/30 transition-all active:scale-95 disabled:grayscale uppercase tracking-widest"
                            >
                                {isLoading ? (
                                    <div className="flex items-center gap-3">
                                        <div className="h-5 w-5 border-t-2 border-white animate-spin rounded-full" />
                                        <span>Compiling...</span>
                                    </div>
                                ) : (
                                    <span className="flex items-center gap-2">
                                        <Plus className="w-5 h-5 lg:w-6 lg:h-6" /> Publish Listing
                                    </span>
                                )}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
