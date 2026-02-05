import { getServerSession } from 'next-auth/next'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { BracketView } from '@/components/bracket/bracket-view'
import { Navbar } from '@/components/layout/navbar'
import { isLocked, formatLockTime, getLockCountdown } from '@/lib/bracket-utils'

export default async function HomePage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/auth/signin')
  }

  const settings = await prisma.settings.findFirst()
  const locked = isLocked(settings?.lockDatetime)

  let bracket = await prisma.bracket.findFirst({
    where: { userId: session.user.id }
  })

  if (!bracket) {
    bracket = await prisma.bracket.create({
      data: { userId: session.user.id }
    })
  }

  return (
    <div className="min-h-screen bg-[hsl(var(--background))]">
      <Navbar user={session.user} />
      
      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <span className="text-4xl md:text-5xl font-light text-navy-900 dark:text-white tracking-tight">LEASE</span>
            <span className="text-4xl md:text-5xl font-bold text-gold-500 tracking-tight">END</span>
          </div>
          <div className="inline-flex items-center bg-gold-400 text-navy-900 px-6 py-2 rounded-full font-bold text-xl mb-4">
            🏀 MADNESS 2026 🏀
          </div>
          <p className="text-navy-600 dark:text-navy-300 text-lg">
            Own Your Picks • $1,000,000 Perfect Bracket Prize
          </p>
          
          {/* Lock Status */}
          {settings?.lockDatetime && (
            <div className={`inline-flex items-center mt-4 px-6 py-3 rounded-xl font-semibold ${
              locked 
                ? 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800' 
                : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
            }`}>
              {locked ? (
                <span>🔒 Brackets Locked</span>
              ) : (
                <span>⏰ Locks: {getLockCountdown(settings.lockDatetime)}</span>
              )}
            </div>
          )}
        </div>

        <BracketView 
          bracketId={bracket.id} 
          isLocked={locked}
          isAdmin={session.user.role === 'ADMIN'}
        />
      </main>
    </div>
  )
}
