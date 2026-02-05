import { getServerSession } from 'next-auth/next'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { BracketView } from '@/components/bracket/bracket-view'
import { Navbar } from '@/components/layout/navbar'
import { isLocked, getLockCountdown } from '@/lib/bracket-utils'
import Image from 'next/image'

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
    <div className="min-h-screen bg-navy-50 dark:bg-navy-950">
      <Navbar user={session.user} />
      
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-navy-900 via-navy-800 to-navy-900 relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, rgba(71, 167, 191, 0.5) 1px, transparent 0)`,
            backgroundSize: '24px 24px',
          }} />
        </div>
        
        <div className="container mx-auto px-4 py-8 relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-6">
              <Image 
                src="/leaseend-logo.webp" 
                alt="Lease End" 
                width={200} 
                height={46}
                className="h-12 w-auto"
              />
              <div className="hidden sm:block w-px h-12 bg-navy-600" />
              <div className="bg-navy-400 text-white px-5 py-2 rounded-xl font-bold text-xl shadow-lg">
                🏀 MADNESS 2026
              </div>
            </div>
            
            <div className="flex items-center gap-6">
              {settings?.lockDatetime && (
                <div className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm ${
                  locked 
                    ? 'bg-rose-500/20 text-rose-200 border border-rose-400/30' 
                    : 'bg-navy-700 text-navy-200 border border-navy-600'
                }`}>
                  {locked ? '🔒 Brackets Locked' : `⏰ ${getLockCountdown(settings.lockDatetime)}`}
                </div>
              )}
              <div className="text-right text-white">
                <div className="text-sm text-navy-300">Perfect Bracket Prize</div>
                <div className="text-2xl font-bold text-navy-400">$1,000,000</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-4 py-6">
        <BracketView 
          bracketId={bracket.id} 
          isLocked={locked}
          isAdmin={session.user.role === 'ADMIN'}
        />
      </main>
    </div>
  )
}
