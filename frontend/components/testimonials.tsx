"use client"

import { useEffect, useRef, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Star, ChevronLeft, ChevronRight, Quote } from "lucide-react"
import { Button } from "@/components/ui/button"

const testimonials = [
  {
    name: "Sarah Johnson",
    role: "Homeowner",
    content: "EasyHire made finding a reliable cleaning service so simple! The vendor was professional, on time, and did an amazing job. Highly recommend!",
    rating: 5,
    avatar: "SJ",
  },
  {
    name: "Michael Chen",
    role: "Business Owner",
    content: "I've used EasyHire for appliance repairs multiple times. The platform is intuitive, and the vendors are always skilled and trustworthy.",
    rating: 5,
    avatar: "MC",
  },
  {
    name: "Emily Rodriguez",
    role: "Working Mom",
    content: "The salon at home service is a game-changer for busy moms like me. Professional stylists come right to my door. Love it!",
    rating: 5,
    avatar: "ER",
  },
  {
    name: "David Park",
    role: "Apartment Renter",
    content: "Moved to a new city and needed pest control ASAP. Found a verified vendor within minutes. Fast, efficient, and affordable!",
    rating: 5,
    avatar: "DP",
  },
  {
    name: "Lisa Thompson",
    role: "Parent",
    content: "Found an excellent tutor for my kids through EasyHire. The booking process was seamless and the tutor is fantastic!",
    rating: 5,
    avatar: "LT",
  },
]

export function Testimonials() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)

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

  useEffect(() => {
    if (!isAutoPlaying) return

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [isAutoPlaying])

  const nextSlide = () => {
    setIsAutoPlaying(false)
    setCurrentIndex((prev) => (prev + 1) % testimonials.length)
  }

  const prevSlide = () => {
    setIsAutoPlaying(false)
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length)
  }

  return (
    <section id="testimonials" ref={sectionRef} className="py-24 bg-secondary/30">
      <div className="container mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-16">
          <span 
            className="fade-up inline-block px-4 py-1.5 bg-primary/10 text-primary text-sm font-semibold rounded-full mb-4 opacity-0 translate-y-8 transition-all duration-700 ease-out"
          >
            Testimonials
          </span>
          <h2 
            className="fade-up text-4xl md:text-5xl font-bold text-foreground mb-4 opacity-0 translate-y-8 transition-all duration-700 ease-out text-balance"
            style={{ transitionDelay: "100ms" }}
          >
            What our <span className="text-primary">customers</span> say
          </h2>
          <p 
            className="fade-up text-lg text-muted-foreground max-w-2xl mx-auto opacity-0 translate-y-8 transition-all duration-700 ease-out"
            style={{ transitionDelay: "200ms" }}
          >
            Don&apos;t just take our word for it. Here&apos;s what real customers have to say.
          </p>
        </div>

        {/* Testimonials Carousel */}
        <div className="fade-up relative max-w-4xl mx-auto opacity-0 translate-y-8 transition-all duration-700 ease-out" style={{ transitionDelay: "300ms" }}>
          <div className="overflow-hidden">
            <div 
              className="flex transition-transform duration-500 ease-out"
              style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
              {testimonials.map((testimonial, index) => (
                <div key={index} className="w-full flex-shrink-0 px-4">
                  <Card className="border-0 bg-card shadow-lg">
                    <CardContent className="p-8 md:p-12">
                      <Quote className="w-12 h-12 text-primary/20 mb-6" />
                      
                      {/* Rating */}
                      <div className="flex gap-1 mb-4">
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
                        ))}
                      </div>

                      {/* Content */}
                      <p className="text-lg md:text-xl text-card-foreground mb-8 leading-relaxed">
                        &quot;{testimonial.content}&quot;
                      </p>

                      {/* Author */}
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                          <span className="text-primary font-semibold">{testimonial.avatar}</span>
                        </div>
                        <div>
                          <p className="font-semibold text-card-foreground">{testimonial.name}</p>
                          <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-center gap-4 mt-8">
            <Button 
              variant="outline" 
              size="icon"
              onClick={prevSlide}
              className="rounded-full transition-all duration-300 hover:bg-primary hover:text-primary-foreground hover:border-primary bg-transparent"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            
            {/* Dots */}
            <div className="flex gap-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setIsAutoPlaying(false)
                    setCurrentIndex(index)
                  }}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    index === currentIndex 
                      ? "bg-primary w-8" 
                      : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
                  }`}
                />
              ))}
            </div>

            <Button 
              variant="outline" 
              size="icon"
              onClick={nextSlide}
              className="rounded-full transition-all duration-300 hover:bg-primary hover:text-primary-foreground hover:border-primary bg-transparent"
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
