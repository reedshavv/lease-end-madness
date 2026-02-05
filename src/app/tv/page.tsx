'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { getCurrentTournamentRound, getRoundDisplayName } from '@/lib/bracket-utils'

interface LeaderboardEntry {
  id: string
  name: string
  totalPoints: number
  possibleRemainingPoints: number
  isPerfect: boolean
  rank: number
}

interface RecentResult {
  id: string
  matchDescription: string
  winner: string
  timestamp: Date
}

export default function TVDisplayPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [recentResults, setRecentResults] = useState<RecentResult[]>([])
  const [perfectBrackets, setPerfectBrackets] = useState(0)
  const [currentView, setCurrentView] = useState('leaderboard')
  const [currentRound, setCurrentRound] = useState('')
  const [lockInfo, setLockInfo] = useState<string>('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTVData()
    const interval = setInterval(fetchTVData, 30000)
    const viewRotation = setInterval(() => {
      setCurrentView(prev => {
        switch (prev) {
          case 'leaderboard': return 'results'
          case 'results': return 'leaderboard'
          default: return 'leaderboard'
        }
      })
    }, 20000)

    return () => {
      clearInterval(interval)
      clearInterval(viewRotation)
    }
  }, [])

  const fetchTVData = async () => {
    try {
      const response = await fetch('/api/tv-data')
      if (response.ok) {
        const data = await response.json()
        setLeaderboard(data.leaderboard || [])
        setRecentResults(data.recentResults || [])
        setPerfectBrackets(data.perfectBrackets || 0)
        setLockInfo(data.lockInfo || '')
      }
    } catch (error) {
      console.error('Error fetching TV data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    setCurrentRound(getRoundDisplayName(getCurrentTournamentRound()))
  }, [])

  if (loading) {
    return (
      <div className="h-screen bg-navy-900 flex items-center justify-center">
        <div className="text-center">
          <Image 
            src="/leaseend-logo.webp" 
            alt="Lease End" 
            width={320} 
            height={74}
            className="mx-auto mb-6"
          />
          <div className="w-8 h-8 border-4 border-navy-600 border-t-navy-400 rounded-full animate-spin mx-auto" />
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen bg-navy-900 text-white flex flex-col">
      {/* Header */}
      <div className="bg-navy-800 border-b border-navy-700 px-8 py-5">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-6">
            <Image 
              src="/leaseend-logo.webp" 
              alt="Lease End" 
              width={200} 
              height={46}
              className="h-12 w-auto"
            />
            <div className="w-px h-10 bg-navy-600" />
            <div className="bg-navy-400 text-white px-5 py-2 rounded-xl font-bold text-2xl">
              🏀 MADNESS 2026
            </div>
          </div>
          
          <div className="flex items-center gap-8">
            <div className="text-right">
              <div className="text-sm text-navy-400">Current Round</div>
              <div className="text-xl font-bold text-navy-300">{currentRound}</div>
            </div>
            <div className="text-right">
              <div className="text-sm text-navy-400">Perfect Brackets</div>
              <div className="text-3xl font-bold text-navy-400">{perfectBrackets}</div>
            </div>
            <div className="text-right">
              <div className="text-sm text-navy-400">Grand Prize</div>
              <div className="text-3xl font-bold text-emerald-400">$1M</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8 overflow-hidden">
        {currentView === 'leaderboard' ? (
          <LeaderboardView leaderboard={leaderboard} />
        ) : (
          <ResultsView results={recentResults} />
        )}
      </div>

      {/* Footer */}
      <div className="bg-navy-800 border-t border-navy-700 px-8 py-3">
        <div className="flex justify-between items-center text-sm">
          <div className="text-navy-400">{lockInfo}</div>
          <div className="text-navy-500">
            Auto-refreshing • {new Date().toLocaleTimeString()}
          </div>
        </div>
      </div>
    </div>
  )
}

function LeaderboardView({ leaderboard }: { leaderboard: LeaderboardEntry[] }) {
  return (
    <div className="h-full flex flex-col">
      <h2 className="text-3xl font-bold mb-6 text-center text-white">
        🏆 Leaderboard
      </h2>
      
      <div className="flex-1 bg-navy-800 rounded-2xl overflow-hidden">
        <div className="grid grid-cols-5 gap-4 px-6 py-4 bg-navy-700 text-navy-300 font-semibold text-sm">
          <div>Rank</div>
          <div className="col-span-2">Player</div>
          <div className="text-right">Points</div>
          <div className="text-right">Status</div>
        </div>
        
        <div className="divide-y divide-navy-700">
          {leaderboard.length > 0 ? leaderboard.slice(0, 12).map((entry, i) => (
            <div key={entry.id} className={`grid grid-cols-5 gap-4 px-6 py-4 ${i < 3 ? 'bg-navy-700/50' : ''}`}>
              <div className={`font-bold text-2xl ${i === 0 ? 'text-amber-400' : i === 1 ? 'text-slate-300' : i === 2 ? 'text-amber-600' : 'text-navy-400'}`}>
                #{entry.rank}
              </div>
              <div className="col-span-2 text-lg font-medium truncate">{entry.name}</div>
              <div className="text-right text-xl font-bold">{entry.totalPoints}</div>
              <div className="text-right">
                {entry.isPerfect ? (
                  <span className="bg-emerald-500 text-white px-3 py-1 rounded-full text-xs font-bold">PERFECT</span>
                ) : (
                  <span className="text-navy-400 text-sm">+{entry.possibleRemainingPoints} possible</span>
                )}
              </div>
            </div>
          )) : (
            <div className="text-center py-16 text-navy-500 text-xl">
              No brackets submitted yet
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function ResultsView({ results }: { results: RecentResult[] }) {
  return (
    <div className="h-full flex flex-col">
      <h2 className="text-3xl font-bold mb-6 text-center text-white">
        🚨 Recent Results
      </h2>
      
      <div className="flex-1 bg-navy-800 rounded-2xl p-6">
        {results.length > 0 ? (
          <div className="grid grid-cols-2 gap-4">
            {results.slice(0, 8).map((result) => (
              <div key={result.id} className="bg-navy-700 rounded-xl p-5 border-l-4 border-l-navy-400">
                <div className="text-lg font-medium text-white mb-2">{result.matchDescription}</div>
                <div className="text-emerald-400 font-bold text-xl">Winner: {result.winner}</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-navy-500 text-xl">
            No results yet — tournament hasn't started
          </div>
        )}
      </div>
    </div>
  )
}
