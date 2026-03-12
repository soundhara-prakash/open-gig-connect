"use client"

import { useEffect, useRef } from "react"
import { Search, UserCheck, Calendar, CheckCircle2 } from "lucide-react"

const steps = [
  {
    icon: Search,
    step: "01",
    title: "Choose a Service",
    description: "Browse our wide range of services and select what you need",
  },
  {
    icon: UserCheck,
    step: "02",
    title: "Pick a Vendor",
    description: "View verified vendors in your area sorted by ratings",
  },
  {
    icon: Calendar,
    step: "03",
    title: "Book a Slot",
    description: "Select an available time slot that works for you",
  },
  {
    icon: CheckCircle2,
    step: "04",
    title: "Get it Done",
    description: "Sit back while our professional handles the job",
  },
]

export function HowItWorks() {
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
    <section id="how-it-works" ref={sectionRef} className="py-24 bg-background">
      <div className="container mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span
            className="fade-up inline-block px-4 py-1.5 bg-primary/10 text-primary text-sm font-semibold rounded-full mb-4 opacity-0 translate-y-8 transition-all duration-700 ease-out"
          >
            How it Works
          </span>
          <h2
            className="fade-up text-4xl md:text-5xl font-bold text-foreground mb-4 opacity-0 translate-y-8 transition-all duration-700 ease-out text-balance"
            style={{ transitionDelay: "100ms" }}
          >
            Book in <span className="text-primary">4 simple steps</span>
          </h2>
          <p
            className="fade-up text-lg text-muted-foreground max-w-2xl mx-auto opacity-0 translate-y-8 transition-all duration-700 ease-out"
            style={{ transitionDelay: "200ms" }}
          >
            Getting help has never been easier. Follow these simple steps to book your service.
          </p>
        </div>

        {/* Steps */}
        <div className="relative">
          {/* Connection Line removed */}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-4">
            {steps.map((step, index) => (
              <div
                key={step.step}
                className="fade-up relative flex flex-col items-center text-center opacity-0 translate-y-8 transition-all duration-700 ease-out"
                style={{ transitionDelay: `${(index + 3) * 150}ms` }}
              >
                {/* Step Number Circle */}
                <div className="relative mb-6">
                  <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center group hover:bg-primary transition-all duration-500 cursor-pointer">
                    <step.icon className="w-8 h-8 text-primary group-hover:text-primary-foreground group-hover:scale-110 transition-all duration-300" />
                  </div>
                  <span className="absolute -top-2 -right-2 w-8 h-8 bg-primary text-primary-foreground text-sm font-bold rounded-full flex items-center justify-center shadow-lg">
                    {step.step}
                  </span>
                </div>

                {/* Content */}
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  {step.title}
                </h3>
                <p className="text-muted-foreground max-w-xs">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
