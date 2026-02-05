'use client'

import { signOut } from 'next-auth/react'
import Link from 'next/link'

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
    <nav className="bg-navy-900 dark:bg-navy-950 shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2">
              <span className="text-2xl font-light text-white tracking-tight">LEASE</span>
              <span className="text-2xl font-bold text-gold-400 tracking-tight">END</span>
              <span className="bg-gold-400 text-navy-900 text-xs font-bold px-2 py-0.5 rounded ml-2">
                MADNESS
              </span>
            </Link>
            
            {/* Nav Links */}
            <div className="hidden md:flex space-x-1">
              <Link 
                href="/" 
                className="text-navy-200 hover:text-white hover:bg-navy-800 px-4 py-2 rounded-lg font-medium transition-colors"
              >
                My Bracket
              </Link>
              <Link 
                href="/leaderboard" 
                className="text-navy-200 hover:text-white hover:bg-navy-800 px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Leaderboard
              </Link>
              <Link 
                href="/tv" 
                className="text-navy-200 hover:text-white hover:bg-navy-800 px-4 py-2 rounded-lg font-medium transition-colors"
              >
                TV Display
              </Link>
              {user.role === 'ADMIN' && (
                <Link 
                  href="/admin" 
                  className="text-gold-400 hover:text-gold-300 hover:bg-navy-800 px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  ⚙️ Admin
                </Link>
              )}
            </div>
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            <div className="text-right hidden sm:block">
              <div className="text-sm font-medium text-white">
                {user.name}
              </div>
              <div className="text-xs text-navy-300">
                {user.role === 'ADMIN' ? '👑 Admin' : '🏀 Player'}
              </div>
            </div>
            
            <button
              onClick={() => signOut()}
              className="bg-navy-700 hover:bg-navy-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}
