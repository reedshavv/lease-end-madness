'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function SignInPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [isRegistering, setIsRegistering] = useState(false)
  const router = useRouter()

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setMessage(result.error)
      } else {
        router.push('/')
        router.refresh()
      }
    } catch (error) {
      setMessage('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name }),
      })

      const data = await res.json()

      if (!res.ok) {
        setMessage(data.error || 'Registration failed')
      } else {
        const result = await signIn('credentials', {
          email,
          password,
          redirect: false,
        })

        if (result?.error) {
          setMessage('Account created! Please sign in.')
          setIsRegistering(false)
        } else {
          router.push('/')
          router.refresh()
        }
      }
    } catch (error) {
      setMessage('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-navy-900 dark:bg-navy-950 flex items-center justify-center p-4">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      <div className="card p-8 w-full max-w-md relative z-10 bg-white dark:bg-navy-800 border-0">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <span className="text-3xl font-light text-navy-900 dark:text-white tracking-tight">LEASE</span>
            <span className="text-3xl font-bold text-gold-500 tracking-tight">END</span>
          </div>
          <div className="inline-flex items-center bg-gold-400 text-navy-900 px-4 py-1.5 rounded-full font-bold text-lg">
            🏀 MADNESS 🏀
          </div>
          <p className="text-navy-600 dark:text-navy-300 mt-4">
            {isRegistering
              ? 'Create an account to make your picks!'
              : 'Sign in to compete for the perfect bracket!'}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={isRegistering ? handleRegister : handleSignIn} className="space-y-4">
          {isRegistering && (
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-navy-700 dark:text-navy-200 mb-1">
                Full Name
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="John Doe"
                className="input"
              />
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-navy-700 dark:text-navy-200 mb-1">
              Company Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="your.name@leaseend.com"
              className="input"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-navy-700 dark:text-navy-200 mb-1">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              minLength={6}
              className="input"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full disabled:opacity-50"
          >
            {loading
              ? 'Please wait...'
              : isRegistering
              ? 'Create Account'
              : 'Sign In'}
          </button>
        </form>

        {/* Toggle */}
        <div className="mt-4 text-center">
          <button
            onClick={() => {
              setIsRegistering(!isRegistering)
              setMessage('')
            }}
            className="text-gold-600 dark:text-gold-400 hover:text-gold-500 text-sm font-medium"
          >
            {isRegistering
              ? 'Already have an account? Sign In'
              : "Don't have an account? Register"}
          </button>
        </div>

        {/* Message */}
        {message && (
          <div className={`mt-4 p-3 rounded-lg text-sm ${
            message.includes('success') || message.includes('created')
              ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
              : 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
          }`}>
            {message}
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 text-center">
          <div className="text-sm text-navy-500 dark:text-navy-400">
            <p className="mb-2 font-semibold text-gold-600 dark:text-gold-400">🏆 $1,000,000 Perfect Bracket Prize</p>
            <p>Only @leaseend.com emails allowed</p>
          </div>
          
          <div className="mt-4 pt-4 border-t border-navy-200 dark:border-navy-700">
            <Link 
              href="/tv" 
              className="text-gold-600 dark:text-gold-400 hover:text-gold-500 text-sm font-medium"
            >
              View TV Display →
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
