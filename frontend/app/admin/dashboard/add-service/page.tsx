"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, PlusCircle } from "lucide-react"

export default function AddServicePage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [newService, setNewService] = useState({
        name: "",
        description: "",
        price: "",
        category: "General",
        image: ""
    })

    const handleAddService = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        try {
            const res = await fetch('http://localhost:5000/api/services', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newService),
            })
            const data = await res.json()
            if (data.success) {
                toast.success("Service added successfully!")
                router.push('/admin/dashboard')
            } else {
                toast.error("Failed to add service")
            }
        } catch (error) {
            console.error(error)
            toast.error("Error adding service")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mx-auto">
                <Button
                    variant="ghost"
                    onClick={() => router.back()}
                    className="mb-6 gap-2 hover:bg-white"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Dashboard
                </Button>

                <Card className="shadow-xl border-t-4 border-t-primary">
                    <CardHeader className="space-y-1">
                        <div className="flex items-center gap-3">
                            <PlusCircle className="w-8 h-8 text-primary" />
                            <CardTitle className="text-3xl font-bold">Add New Service</CardTitle>
                        </div>
                        <CardDescription className="text-lg">
                            Create a new service offering for your platform.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleAddService} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="name" className="text-base font-semibold">Service Name</Label>
                                <Input
                                    id="name"
                                    placeholder="e.g. Premium House Cleaning"
                                    className="h-12 text-lg"
                                    value={newService.name}
                                    onChange={(e) => setNewService({ ...newService, name: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="category" className="text-base font-semibold">Category</Label>
                                <Input
                                    id="category"
                                    placeholder="e.g. Cleaning, Plumbing, Electrical"
                                    className="h-12 text-lg"
                                    value={newService.category}
                                    onChange={(e) => setNewService({ ...newService, category: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="price" className="text-base font-semibold">Price (Starting from)</Label>
                                <Input
                                    id="price"
                                    placeholder="e.g. $50 or 500 INR"
                                    className="h-12 text-lg"
                                    value={newService.price}
                                    onChange={(e) => setNewService({ ...newService, price: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="desc" className="text-base font-semibold">Description</Label>
                                <Textarea
                                    id="desc"
                                    placeholder="Describe the service details, what's included, etc."
                                    className="min-h-[150px] text-lg resize-none"
                                    value={newService.description}
                                    onChange={(e) => setNewService({ ...newService, description: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="image" className="text-base font-semibold">Image URL (Optional)</Label>
                                <Input
                                    id="image"
                                    placeholder="https://example.com/image.jpg"
                                    className="h-12 text-lg"
                                    value={newService.image}
                                    onChange={(e) => setNewService({ ...newService, image: e.target.value })}
                                />
                            </div>

                            <Button
                                type="submit"
                                className="w-full h-14 text-xl font-bold shadow-lg shadow-primary/20 hover:scale-[1.01] transition-all"
                                disabled={loading}
                            >
                                {loading ? "Adding Service..." : "Create Service"}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
