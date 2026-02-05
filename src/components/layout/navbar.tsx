'use client'

import { signOut } from 'next-auth/react'
import Link from 'next/link'
import Image from 'next/image'

interface User {
  id: string
  name: string
  email: string
  role: string
}

interface NavbarProps {
  user: User
}

export function Navbar({ user }: NavbarProps) {
  return (
    <nav className="bg-navy-900 shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-14">
          <div className="flex items-center gap-8">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3">
              <Image 
                src="/leaseend-logo.webp" 
                alt="Lease End" 
                width={120} 
                height={28}
                className="h-7 w-auto"
              />
            </Link>
            
            {/* Nav Links */}
            <div className="hidden md:flex items-center gap-1">
              <Link 
                href="/" 
                className="text-navy-300 hover:text-white hover:bg-navy-800 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
              >
                Bracket
              </Link>
              <Link 
                href="/leaderboard" 
                className="text-navy-300 hover:text-white hover:bg-navy-800 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
              >
                Leaderboard
              </Link>
              <Link 
                href="/tv" 
                className="text-navy-300 hover:text-white hover:bg-navy-800 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
              >
                TV
              </Link>
              {user.role === 'ADMIN' && (
                <Link 
                  href="/admin" 
                  className="text-navy-300 hover:text-white hover:bg-navy-800 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                >
                  Admin
                </Link>
              )}
            </div>
          </div>

          {/* User Menu */}
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <div className="text-sm font-medium text-white leading-tight">{user.name}</div>
              <div className="text-xs text-navy-400">
                {user.role === 'ADMIN' ? 'Admin' : 'Player'}
              </div>
            </div>
            
            <button
              onClick={() => signOut()}
              className="bg-navy-800 hover:bg-navy-700 text-navy-300 hover:text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}
