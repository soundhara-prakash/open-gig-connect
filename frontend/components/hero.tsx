"use client"

import React from "react"
import Link from "next/link"

import { useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { ArrowRight, MapPin, Star, Shield } from "lucide-react"

export function Hero() {
  const heroRef = useRef<HTMLDivElement>(null)

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

    const elements = heroRef.current?.querySelectorAll(".fade-up")
    elements?.forEach((el) => observer.observe(el))

    return () => observer.disconnect()
  }, [])

  return (
    <section
      ref={heroRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20"
    >
      {/* Background Elements */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent/5 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="container mx-auto px-6 py-20">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div
            className="fade-up inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary text-sm font-medium mb-8 opacity-0 translate-y-8 transition-all duration-700 ease-out"
            style={{ transitionDelay: "100ms" }}
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            Trusted by 10,000+ customers
          </div>

          {/* Heading */}
          <h1
            className="fade-up text-5xl md:text-7xl font-bold text-foreground leading-tight mb-6 opacity-0 translate-y-8 transition-all duration-700 ease-out text-balance"
            style={{ transitionDelay: "200ms" }}
          >
            Local services,{" "}
            <span className="text-primary relative">
              delivered
              <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 200 12" fill="none">
                <path
                  d="M2 10C50 2 150 2 198 10"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  className="animate-draw"
                />
              </svg>
            </span>{" "}
            with ease
          </h1>

          {/* Subtitle */}
          <p
            className="fade-up text-xl text-muted-foreground mb-10 max-w-2xl mx-auto opacity-0 translate-y-8 transition-all duration-700 ease-out text-pretty"
            style={{ transitionDelay: "300ms" }}
          >
            Book verified professionals for cleaning, repairs, salon services, tutoring, and more.
            Find trusted experts in your area within minutes.
          </p>

          {/* CTA Buttons */}
          <div
            className="fade-up flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 opacity-0 translate-y-8 transition-all duration-700 ease-out"
            style={{ transitionDelay: "400ms" }}
          >
            <Button
              size="lg"
              className="bg-primary text-primary-foreground px-8 py-6 text-lg font-semibold transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-primary/25 group"
              asChild
            >
              <Link href="/user/login">
                Book a Service
                <ArrowRight className="ml-2 w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="px-8 py-6 text-lg font-semibold border-2 transition-all duration-300 hover:bg-secondary bg-transparent"
              asChild
            >
              <Link href="/vendor/register">Become a Vendor</Link>
            </Button>
          </div>

          {/* Trust Badges */}
          <div
            className="fade-up flex flex-wrap items-center justify-center gap-8 opacity-0 translate-y-8 transition-all duration-700 ease-out"
            style={{ transitionDelay: "500ms" }}
          >
            <TrustBadge icon={<MapPin className="w-5 h-5" />} text="Location-based matching" />
            <TrustBadge icon={<Star className="w-5 h-5" />} text="5-star rated vendors" />
            <TrustBadge icon={<Shield className="w-5 h-5" />} text="Verified professionals" />
          </div>
        </div>
      </div>

      {/* Floating Cards Animation */}
      <FloatingCards />
    </section>
  )
}

function TrustBadge({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-center gap-2 text-muted-foreground">
      <span className="text-primary">{icon}</span>
      <span className="text-sm font-medium">{text}</span>
    </div>
  )
}

function FloatingCards() {
  return (
    <div className="absolute inset-0 -z-5 overflow-hidden pointer-events-none">
      {/* Card 1 */}
      <div className="absolute top-1/3 left-10 lg:left-20 bg-card rounded-xl shadow-lg p-4 animate-float opacity-60 hidden lg:block">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
            <span className="text-lg">🧹</span>
          </div>
          <div>
            <p className="font-semibold text-sm text-card-foreground">Cleaning Service</p>
            <p className="text-xs text-muted-foreground">Starting at $49</p>
          </div>
        </div>
      </div>

      {/* Card 2 */}
      <div className="absolute top-1/2 right-10 lg:right-20 bg-card rounded-xl shadow-lg p-4 animate-float-delayed opacity-60 hidden lg:block">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-accent/20 rounded-full flex items-center justify-center">
            <span className="text-lg">💇</span>
          </div>
          <div>
            <p className="font-semibold text-sm text-card-foreground">Salon at Home</p>
            <p className="text-xs text-muted-foreground">Booked just now</p>
          </div>
        </div>
      </div>

      {/* Card 3 */}
      <div className="absolute bottom-1/3 left-20 lg:left-40 bg-card rounded-xl shadow-lg p-4 animate-float-slow opacity-60 hidden lg:block">
        <div className="flex items-center gap-2">
          <div className="flex -space-x-2">
            <div className="w-8 h-8 bg-primary/30 rounded-full border-2 border-card" />
            <div className="w-8 h-8 bg-accent/30 rounded-full border-2 border-card" />
            <div className="w-8 h-8 bg-muted rounded-full border-2 border-card" />
          </div>
          <p className="text-xs font-medium text-card-foreground">150+ vendors online</p>
        </div>
      </div>
    </div>
  )
}
