'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'

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
      const result = await signIn('credentials', { email, password, redirect: false })
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
        const result = await signIn('credentials', { email, password, redirect: false })
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
    <div className="min-h-screen bg-navy-800 flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-navy-900 via-navy-800 to-navy-900 flex-col justify-center items-center p-12 relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, rgba(71, 167, 191, 0.4) 1px, transparent 0)`,
            backgroundSize: '32px 32px',
          }} />
        </div>
        
        <div className="relative z-10 text-center">
          <Image 
            src="/leaseend-logo.webp" 
            alt="Lease End" 
            width={320} 
            height={74}
            className="mx-auto mb-8"
          />
          <div className="inline-flex items-center bg-navy-400 text-white px-8 py-3 rounded-2xl font-bold text-3xl mb-8 shadow-lg">
            🏀 MADNESS 2026
          </div>
          <p className="text-navy-300 text-xl max-w-md mx-auto leading-relaxed">
            Compete against 300+ coworkers for bragging rights and the legendary 
            <span className="text-white font-semibold"> $1,000,000 </span> 
            perfect bracket prize!
          </p>
          
          <div className="mt-12 flex items-center justify-center gap-8 text-navy-400">
            <div className="text-center">
              <div className="text-4xl font-bold text-white">64</div>
              <div className="text-sm">Competitors</div>
            </div>
            <div className="w-px h-12 bg-navy-600" />
            <div className="text-center">
              <div className="text-4xl font-bold text-white">6</div>
              <div className="text-sm">Rounds</div>
            </div>
            <div className="w-px h-12 bg-navy-600" />
            <div className="text-center">
              <div className="text-4xl font-bold text-white">1</div>
              <div className="text-sm">Champion</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-navy-50 dark:bg-navy-900">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <Image 
              src="/leaseend-logo.webp" 
              alt="Lease End" 
              width={200} 
              height={46}
              className="mx-auto mb-4"
            />
            <span className="inline-flex bg-navy-400 text-white px-4 py-1.5 rounded-lg font-bold text-lg">
              🏀 MADNESS
            </span>
          </div>

          <div className="card p-8">
            <h2 className="text-2xl font-bold text-navy-800 dark:text-white mb-2">
              {isRegistering ? 'Create your account' : 'Welcome back'}
            </h2>
            <p className="text-navy-500 dark:text-navy-400 mb-6">
              {isRegistering ? 'Join the competition!' : 'Sign in to manage your bracket'}
            </p>

            <form onSubmit={isRegistering ? handleRegister : handleSignIn} className="space-y-4">
              {isRegistering && (
                <div>
                  <label className="block text-sm font-semibold text-navy-700 dark:text-navy-200 mb-1.5">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    placeholder="John Doe"
                    className="input"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-navy-700 dark:text-navy-200 mb-1.5">
                  Company Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="you@leaseend.com"
                  className="input"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-navy-700 dark:text-navy-200 mb-1.5">
                  Password
                </label>
                <input
                  type="password"
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
                {loading ? 'Please wait...' : isRegistering ? 'Create Account' : 'Sign In'}
              </button>
            </form>

            <div className="mt-6 text-center">
              <button
                onClick={() => { setIsRegistering(!isRegistering); setMessage('') }}
                className="text-navy-500 dark:text-navy-400 hover:text-navy-700 dark:hover:text-navy-200 text-sm font-medium"
              >
                {isRegistering ? 'Already have an account? Sign In' : "Don't have an account? Register"}
              </button>
            </div>

            {message && (
              <div className={`mt-4 p-3 rounded-xl text-sm ${
                message.includes('success') || message.includes('created')
                  ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
                  : 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300'
              }`}>
                {message}
              </div>
            )}
          </div>

          <p className="mt-6 text-center text-sm text-navy-500 dark:text-navy-400">
            Only @leaseend.com emails allowed
          </p>
        </div>
      </div>
    </div>
  )
}
