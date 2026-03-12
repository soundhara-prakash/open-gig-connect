"use client"

import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Mail,
  MapPin,
  Phone,
  ArrowRight
} from "lucide-react"

const footerLinks = {
  services: [
    { label: "Cleaning Service", href: "#" },
    { label: "Appliance Repair", href: "#" },
    { label: "Pest Control", href: "#" },
    { label: "Salon at Home", href: "#" },
    { label: "Home Tutoring", href: "#" },
  ],
  company: [
    { label: "About Us", href: "#" },
    { label: "Careers", href: "#" },
    { label: "Press", href: "#" },
    { label: "Blog", href: "#" },
    { label: "Contact", href: "#" },
  ],
  support: [
    { label: "Help Center", href: "#" },
    { label: "Safety", href: "#" },
    { label: "Terms of Service", href: "#" },
    { label: "Privacy Policy", href: "#" },
    { label: "Cookie Policy", href: "#" },
  ],
}

const socialLinks = [
  { icon: Facebook, href: "#", label: "Facebook" },
  { icon: Twitter, href: "#", label: "Twitter" },
  { icon: Instagram, href: "#", label: "Instagram" },
  { icon: Linkedin, href: "#", label: "LinkedIn" },
]

export function Footer() {
  return (
    <footer className="bg-foreground text-background pt-16 pb-8">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-12">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <Link href="/" className="text-2xl font-bold text-background inline-block mb-4">
              Easy<span className="text-primary">Hire</span>
            </Link>
            <p className="text-background/70 mb-6 max-w-sm">
              Your trusted platform for booking verified local service providers.
              Making home services easy since 2024.
            </p>

            {/* Newsletter */}
            <div className="mb-6">
              <p className="text-sm font-medium text-background mb-3">Subscribe to our newsletter</p>
              <div className="flex gap-2">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  className="bg-background/10 border-background/20 text-background placeholder:text-background/50 focus:border-primary"
                />
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-300 hover:scale-105">
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Social Links Removed */}
            <div className="flex gap-4">
              {/* Social icons removed as per request */}
            </div>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-semibold text-background mb-4">Services</h4>
            <ul className="space-y-3">
              {footerLinks.services.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-background/70 hover:text-primary transition-colors duration-300"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-semibold text-background mb-4">Company</h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-background/70 hover:text-primary transition-colors duration-300"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold text-background mb-4">Support</h4>
            <ul className="space-y-3">
              {footerLinks.support.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-background/70 hover:text-primary transition-colors duration-300"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Contact Info */}
        <div className="border-t border-background/10 pt-8 mb-8">
          <div className="flex flex-wrap gap-8 justify-center md:justify-start">
            <div className="flex items-center gap-2 text-background/70">
              <MapPin className="w-4 h-4 text-primary" />
              <span className="text-sm">123 Service Street, City, State 12345</span>
            </div>
            <div className="flex items-center gap-2 text-background/70">
              <Phone className="w-4 h-4 text-primary" />
              <span className="text-sm">+1 (555) 123-4567</span>
            </div>
            <div className="flex items-center gap-2 text-background/70">
              <Mail className="w-4 h-4 text-primary" />
              <span className="text-sm">support@easyhire.com</span>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-background/10 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-background/50 text-sm">
              2024 EasyHire. All rights reserved.
            </p>
            <div className="flex gap-6">
              <Link href="#" className="text-background/50 text-sm hover:text-primary transition-colors duration-300">
                Terms
              </Link>
              <Link href="#" className="text-background/50 text-sm hover:text-primary transition-colors duration-300">
                Privacy
              </Link>
              <Link href="#" className="text-background/50 text-sm hover:text-primary transition-colors duration-300">
                Cookies
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
