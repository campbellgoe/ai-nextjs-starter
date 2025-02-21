"use client";
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import clsx from "clsx"
import { useState } from 'react';
import { Input } from './ui/input';
import { useAppContext } from '@/contexts/PersistentAppContext';

export default function Navigation() {
  const pathname = usePathname()
 const { logoTextValue, setLogoTextValue } = useAppContext()
  return (
    <nav className="bg-background shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              {/* You can add a logo here */}
              <span className="text-2xl font-bold text-primary">
                <Input className="h-[48px]" value={logoTextValue} onChange={(e: any) => setLogoTextValue(e.target.value)}/>
              </span>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <NavLink href="/" active={pathname === "/"}>
                Home
              </NavLink>
              <NavLink href="/chat" active={pathname === "/chat"}>
                Chat
              </NavLink>
              <NavLink href="/code-challenges" active={pathname === "/code-challenges"}>
                Challenges
              </NavLink>
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            {/* You can add user menu or other items here */}
          </div>
          <div className="-mr-2 flex items-center sm:hidden">
            {/* Add a mobile menu button here if needed */}
          </div>
        </div>
      </div>

      {/* Mobile menu, show/hide based on menu state */}
      <div className="sm:hidden">
        <div className="pt-2 pb-3 space-y-1">
          <MobileNavLink href="/" active={pathname === "/"}>
            Home
          </MobileNavLink>
          <MobileNavLink href="/chat" active={pathname === "/chat"}>
            Chat
          </MobileNavLink>
          <MobileNavLink href="/code-challenges" active={pathname === "/code-challenges"}>
            Challenges
          </MobileNavLink>
        </div>
      </div>
    </nav>
  )
}

function NavLink({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className={clsx(
        "inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium",
        active
          ? "border-primary text-primary"
          : "border-transparent text-muted-foreground hover:border-gray-300 hover:text-foreground"
      )}
    >
      {children}
    </Link>
  )
}

function MobileNavLink({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className={clsx(
        "block pl-3 pr-4 py-2 border-l-4 text-base font-medium",
        active
          ? "bg-primary/10 border-primary text-primary"
          : "border-transparent text-muted-foreground hover:bg-gray-50 hover:border-gray-300 hover:text-foreground"
      )}
    >
      {children}
    </Link>
  )
}
