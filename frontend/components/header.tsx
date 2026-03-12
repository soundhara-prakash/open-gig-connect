"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"
import { cn } from "@/lib/utils"

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-out",
        isScrolled
          ? "bg-background/80 backdrop-blur-xl border-b border-border shadow-sm"
          : "bg-transparent"
      )}
    >
      <nav className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link
            href="/"
            className="text-2xl font-bold text-foreground transition-transform duration-300 hover:scale-105"
          >
            Easy<span className="text-primary">Hire</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <NavLinks />
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-4">
            <Button
              variant="ghost"
              className="font-medium transition-all duration-300 hover:text-primary"
              asChild
            >
              <Link href="/user/login">Log in</Link>
            </Button>
            <Button
              className="bg-primary text-primary-foreground font-medium px-6 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-primary/25"
              asChild
            >
              <Link href="/user/signup">Get Started</Link>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-foreground transition-transform duration-300 hover:scale-110"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        <div
          className={cn(
            "md:hidden overflow-hidden transition-all duration-500 ease-out",
            isMobileMenuOpen ? "max-h-96 opacity-100 mt-4" : "max-h-0 opacity-0"
          )}
        >
          <div className="flex flex-col gap-4 py-4 border-t border-border">
            <NavLinks mobile />
            <div className="flex flex-col gap-2 pt-4">
              <Link href="/user/login">Log in</Link>
              <Button className="bg-primary text-primary-foreground" asChild>
                <Link href="/user/signup">Get Started</Link>
              </Button>
            </div>
          </div>
        </div>
      </nav>
    </header>
  )
}

function NavLinks({ mobile = false }: { mobile?: boolean }) {
  const links = [
    { href: "/user/booking", label: "Book Service" },
    { href: "/vendor/register", label: "Become a Vendor" },
    { href: "#how-it-works", label: "How it Works" },
    { href: "#testimonials", label: "Testimonials" },
  ]

  return (
    <>
      {links.map((link, index) => (
        <Link
          key={link.href}
          href={link.href}
          className={cn(
            "text-muted-foreground font-medium transition-all duration-300 hover:text-primary relative group",
            mobile && "py-2"
          )}
          style={{ animationDelay: `${index * 100}ms` }}
        >
          {link.label}
          <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full" />
        </Link>
      ))}
    </>
  )
}
