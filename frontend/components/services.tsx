"use client"

import Link from "next/link"
import { useEffect, useRef, useState, useMemo } from "react"
import { Card, CardContent } from "@/components/ui/card"
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
  ArrowRight,
  Briefcase
} from "lucide-react"

// Mapping for icons based on keywords in title or category
const getServiceIcon = (name: string, category: string) => {
  const lowerName = name.toLowerCase() + " " + category.toLowerCase()
  if (lowerName.includes("clean")) return { icon: Sparkles, color: "bg-emerald-500/10 text-emerald-600" }
  if (lowerName.includes("repair") || lowerName.includes("fix")) return { icon: Wrench, color: "bg-blue-500/10 text-blue-600" }
  if (lowerName.includes("pest") || lowerName.includes("control")) return { icon: Bug, color: "bg-red-500/10 text-red-600" }
  if (lowerName.includes("beauty") || lowerName.includes("salon") || lowerName.includes("hair")) return { icon: Scissors, color: "bg-pink-500/10 text-pink-600" }
  if (lowerName.includes("move") || lowerName.includes("pack")) return { icon: Truck, color: "bg-amber-500/10 text-amber-600" }
  if (lowerName.includes("decor") || lowerName.includes("art") || lowerName.includes("paint")) return { icon: Palette, color: "bg-indigo-500/10 text-indigo-600" }
  if (lowerName.includes("tutor") || lowerName.includes("teach")) return { icon: GraduationCap, color: "bg-cyan-500/10 text-cyan-600" }
  if (lowerName.includes("food") || lowerName.includes("grocery")) return { icon: ShoppingBag, color: "bg-orange-500/10 text-orange-600" }
  if (lowerName.includes("garden") || lowerName.includes("lawn")) return { icon: Flower2, color: "bg-green-500/10 text-green-600" }

  return { icon: Briefcase, color: "bg-purple-500/10 text-purple-600" }
}

export function Services() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const [services, setServices] = useState<any[]>([])

  // Core 9 Service Categories as requested by user
  const categories = [
    { name: "Cleaning", desc: "Expert home and office cleaning services.", slug: "cleaning" },
    { name: "Appliance Repair", desc: "Fast and reliable repair for all home appliances.", slug: "appliance-repair" },
    { name: "Pest Control", desc: "Safe and effective pest management solutions.", slug: "pest-control" },
    { name: "Salon at Home", desc: "Professional beauty and grooming services at your doorstep.", slug: "salon" },
    { name: "Moving & Packing", desc: "Hassle-free relocation and packing services.", slug: "moving" },
    { name: "Wall Art & Decor", desc: "Transform your spaces with expert wall art and decor.", slug: "decor" },
    { name: "Home Tutoring", desc: "Quality home education and tutoring for all subjects.", slug: "tutor" },
    { name: "Grocery Pickup", desc: "Convenient grocery shopping and delivery services.", slug: "grocery" },
    { name: "Gardening", desc: "Complete garden maintenance and landscaping services.", slug: "garden" }
  ]

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/services')
        const data = await res.json()
        if (data.success) {
          setServices(data.services)
        }
      } catch (error) {
        console.error("Failed to fetch services", error)
      }
    }

    fetchServices()
  }, [])

  useEffect(() => {
    if (services.length === 0) return

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
  }, [services])

  return (
    <section id="services" ref={sectionRef} className="py-24 bg-secondary/30">
      <div className="container mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span
            className="fade-up inline-block px-4 py-1.5 bg-primary/10 text-primary text-sm font-semibold rounded-full mb-4 opacity-0 translate-y-8 transition-all duration-700 ease-out"
          >
            Our Services
          </span>
          <h2
            className="fade-up text-4xl md:text-5xl font-bold text-foreground mb-4 opacity-0 translate-y-8 transition-all duration-700 ease-out text-balance"
            style={{ transitionDelay: "100ms" }}
          >
            Everything you need,{" "}
            <span className="text-primary">one platform</span>
          </h2>
          <p
            className="fade-up text-lg text-muted-foreground max-w-2xl mx-auto opacity-0 translate-y-8 transition-all duration-700 ease-out"
            style={{ transitionDelay: "200ms" }}
          >
            From cleaning to tutoring, find trusted professionals for all your needs
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((service, index) => {
            const { icon: Icon, color } = getServiceIcon(service.name, "")
            return (
              <Link key={service.name} href="/user/booking">
                <Card
                  className="fade-up group cursor-pointer border-0 bg-card shadow-sm hover:shadow-xl transition-all duration-500 ease-out opacity-0 translate-y-8 overflow-hidden h-full"
                  style={{ transitionDelay: `${(index % 3 + 1) * 100}ms` }}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-xl ${color} transition-transform duration-300 group-hover:scale-110`}>
                          <Icon className="w-6 h-6" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg text-card-foreground group-hover:text-primary transition-colors duration-300">
                            {service.name}
                          </h3>
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                            {service.desc}
                          </p>
                        </div>
                      </div>
                      <ArrowRight className="w-5 h-5 text-muted-foreground opacity-0 -translate-x-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0 group-hover:text-primary" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )
          })}

          {services.length === 0 && (
            <div className="col-span-full text-center py-10 text-muted-foreground">
              No services available at the moment.
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
