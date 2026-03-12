"use client"

import { useEffect, useRef } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Sparkles } from "lucide-react"

export function CTA() {
  const sectionRef = useRef<HTMLDivElement>(null)

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
  }, [])

  return (
    <section id="contact" ref={sectionRef} className="py-24 bg-background relative overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div
            className="fade-up inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary text-sm font-medium mb-8 opacity-0 translate-y-8 transition-all duration-700 ease-out"
          >
            <Sparkles className="w-4 h-4" />
            Limited Time Offer
          </div>

          {/* Heading */}
          <h2
            className="fade-up text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 opacity-0 translate-y-8 transition-all duration-700 ease-out text-balance"
            style={{ transitionDelay: "100ms" }}
          >
            Ready to get started?
          </h2>

          {/* Description */}
          <p
            className="fade-up text-xl text-muted-foreground mb-10 max-w-2xl mx-auto opacity-0 translate-y-8 transition-all duration-700 ease-out"
            style={{ transitionDelay: "200ms" }}
          >
            Join thousands of happy customers who trust EasyHire for their local service needs.
            Book your first service today!
          </p>

          {/* CTA Buttons */}
          <div
            className="fade-up flex flex-col sm:flex-row items-center justify-center gap-4 opacity-0 translate-y-8 transition-all duration-700 ease-out"
            style={{ transitionDelay: "300ms" }}
          >
            <Button
              size="lg"
              className="bg-primary text-primary-foreground px-8 py-6 text-lg font-semibold transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-primary/25 group"
              asChild
            >
              <Link href="/user/login">
                Book Your First Service
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

          {/* Trust Text */}
          <p
            className="fade-up mt-8 text-sm text-muted-foreground opacity-0 translate-y-8 transition-all duration-700 ease-out"
            style={{ transitionDelay: "400ms" }}
          >
            No credit card required. Cancel anytime.
          </p>
        </div>
      </div>
    </section>
  )
}
