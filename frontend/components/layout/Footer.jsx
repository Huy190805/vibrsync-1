"use client";

import Link from "next/link";
import { Facebook, Twitter, Instagram } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-black text-gray-400 px-6 py-10 border-t border-neutral-800">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-5 gap-8 text-sm">
        {/* Column 1: Company */}
        <div>
          <h3 className="text-white font-bold mb-3">Company</h3>
          <ul className="space-y-2">
            <li><Link href="/" className="hover:text-white">About</Link></li>
            <li><Link href="/" className="hover:text-white">Careers</Link></li>
            <li><Link href="/" className="hover:text-white">For the Record</Link></li>
          </ul>
        </div>

        {/* Column 2: Community */}
        <div>
          <h3 className="text-white font-bold mb-3">Community</h3>
          <ul className="space-y-2">
            <li><Link href="/" className="hover:text-white">For Artists</Link></li>
            <li><Link href="/" className="hover:text-white">Developers</Link></li>
            <li><Link href="/" className="hover:text-white">Advertising</Link></li>
            <li><Link href="/" className="hover:text-white">Investors</Link></li>
            <li><Link href="/" className="hover:text-white">Suppliers</Link></li>
          </ul>
        </div>

        {/* Column 3: Useful Links */}
        <div>
          <h3 className="text-white font-bold mb-3">Useful Links</h3>
          <ul className="space-y-2">
            <li><Link href="/" className="hover:text-white">Support</Link></li>
            <li><Link href="/" className="hover:text-white">Free Mobile App</Link></li>
            <li><Link href="/" className="hover:text-white">Global Access</Link></li>
          </ul>
        </div>

        {/* Column 4: VibeSync Plans */}
        <div>
          <h3 className="text-white font-bold mb-3">VibeSync Plans</h3>
          <ul className="space-y-2">
            <li><Link href="/" className="hover:text-white">Premium Individual</Link></li>
            <li><Link href="/" className="hover:text-white">Premium Student</Link></li>
            <li><Link href="/" className="hover:text-white">VibeSync Free</Link></li>
          </ul>
        </div>

        {/* Column 5: Social Media */}
        <div className="flex md:justify-end gap-4 items-start">
          <a href="/" className="w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center hover:bg-neutral-700">
            <Instagram size={20} />
          </a>
          <a href="/" className="w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center hover:bg-neutral-700">
            <Twitter size={20} />
          </a>
          <a href="/" className="w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center hover:bg-neutral-700">
            <Facebook size={20} />
          </a>
        </div>
      </div>

      {/* Bottom Line */}
      <div className="border-t border-neutral-800 mt-8 pt-4 text-xs text-center text-neutral-500">
        <div className="flex flex-wrap justify-center gap-4 mb-2">
          <Link href="/" className="hover:underline">Legal</Link>
          <Link href="/" className="hover:underline">Safety & Privacy Center</Link>
          <Link href="/" className="hover:underline">Privacy Policy</Link>
          <Link href="/" className="hover:underline">Cookies</Link>
          <Link href="/" className="hover:underline">About Ads</Link>
          <Link href="/" className="hover:underline">Accessibility</Link>
        </div>
        &copy; {new Date().getFullYear()} VibeSync AB. All rights reserved.
      </div>
    </footer>
  );
}
