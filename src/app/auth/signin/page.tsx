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
        // Auto sign in after registration
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-4xl mb-4">🏀</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Lease End Madness
          </h1>
          <p className="text-gray-600">
            {isRegistering
              ? 'Create an account to make your picks!'
              : 'Sign in to make your picks and compete for the perfect bracket prize!'}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={isRegistering ? handleRegister : handleSignIn} className="space-y-4">
          {isRegistering && (
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="John Doe"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
              />
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Company Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="your.name@leaseend.com"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
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
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold py-3 px-4 rounded-lg transition duration-200"
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
            className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
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
              ? 'bg-green-50 text-green-700 border border-green-200'
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}>
            {message}
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 text-center">
          <div className="text-sm text-gray-500">
            <p className="mb-2">🏆 $1,000,000 Perfect Bracket Prize</p>
            <p>Only @leaseend.com email addresses are allowed</p>
          </div>
          
          <div className="mt-4 pt-4 border-t border-gray-200">
            <Link 
              href="/tv" 
              className="text-indigo-600 hover:text-indigo-800 text-sm"
            >
              View TV Display →
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
