"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ShieldCheck } from "lucide-react"

export default function AdminRegisterPage() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        secretKey: "" // Optional for now
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        try {
            const res = await fetch('http://localhost:5000/api/admin/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.message || 'Registration failed')
            }

            // Store admin token and redirect
            localStorage.setItem('admin_token', data.token)
            localStorage.setItem('admin_user', JSON.stringify(data.user))
            alert("Admin Account Created!")
            router.push('/admin/dashboard')

        } catch (error) {
            console.error(error)
            alert((error as Error).message)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-1">
                    <div className="flex justify-center mb-4">
                        <div className="p-3 bg-primary/10 rounded-full">
                            <ShieldCheck className="w-6 h-6 text-primary" />
                        </div>
                    </div>
                    <CardTitle className="text-2xl text-center">Create Admin Access</CardTitle>
                    <CardDescription className="text-center">
                        Set up a new administrator account
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Full Name</Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="admin@example.com"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="secret">Secret Key (Optional)</Label>
                            <Input
                                id="secret"
                                type="password"
                                placeholder="For verification"
                                value={formData.secretKey}
                                onChange={(e) => setFormData({ ...formData, secretKey: e.target.value })}
                            />
                        </div>
                        <Button className="w-full" type="submit" disabled={isLoading}>
                            {isLoading ? "Creating Account..." : "Register Admin"}
                        </Button>
                        <div className="text-center text-sm">
                            <Link href="/admin/login" className="text-primary hover:underline">
                                Back to Login
                            </Link>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
