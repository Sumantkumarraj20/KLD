"use client";

import React from "react";

interface FooterProps {
  className?: string;
}

export const Footer: React.FC<FooterProps> = ({ className = "" }) => {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      className={`relative mt-16 border-t border-neutral-800 bg-gradient-to-b from-neutral-900 to-neutral-950 text-neutral-300 ${className}`}
    >
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        {/* Top Section */}
        <div className="grid gap-10 sm:grid-cols-2 md:grid-cols-3">
          {/* Brand / About */}
          <div>
            <h3 className="mb-3 flex items-center gap-2 text-lg font-semibold text-white">
              <span className="text-2xl">🎯</span>
              <span>Kids Points</span>
            </h3>
            <p className="max-w-sm text-sm leading-relaxed text-neutral-400">
              A family-friendly learning and reward system that motivates kids
              and makes everyday progress fun and meaningful.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="mb-3 text-sm font-semibold uppercase tracking-wide text-white/90">
              Quick Links
            </h4>
            <ul className="space-y-2 text-sm">
              {[
                { label: "Home", href: "/" },
                { label: "Kids Dashboard", href: "/kids" },
                { label: "Parent Portal", href: "/parent" },
              ].map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="inline-flex items-center gap-1 text-neutral-400 transition-colors hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Features */}
          <div>
            <h4 className="mb-3 text-sm font-semibold uppercase tracking-wide text-white/90">
              Features
            </h4>
            <ul className="space-y-2 text-sm text-neutral-400">
              <li className="flex items-center gap-2">
                ✨ Earn & Track Points
              </li>
              <li className="flex items-center gap-2">🎁 Reward System</li>
              <li className="flex items-center gap-2">📊 Progress Analytics</li>
              <li className="flex items-center gap-2">🎮 Gamified Learning</li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-12 border-t border-neutral-800 pt-6">
          <div className="flex flex-col items-center justify-between gap-3 text-center sm:flex-row">
            <p className="text-xs text-neutral-500">
              © {currentYear} Kids Points System. All rights reserved.
            </p>

            <div className="flex items-center gap-3 text-xs text-neutral-600">
              <span className="rounded-full bg-neutral-800 px-2 py-0.5">
                v2.5.0
              </span>
              <span className="hidden sm:inline">•</span>
              <span>Made with ❤️ for families</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
