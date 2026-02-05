'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

type Tab = 'entrants' | 'results'

interface Entrant {
  id: string
  displayName: string
  region: string
  seed: number
  department?: string
  title?: string
}

interface Match {
  id: string
  round: string
  region: string | null
  matchNumber: number
  leftEntrant: Entrant | null
  rightEntrant: Entrant | null
  winnerEntrant: Entrant | null
}

const REGION_LABELS: Record<string, string> = {
  IADVISORS: 'iAdvisors',
  XADVISORS: 'xAdvisors',
  FINANCIAL_SPECIALISTS: 'Financial Specialists',
  WADVISORS: 'wAdvisors',
}

const ROUNDS = ['R64', 'R32', 'S16', 'E8', 'F4', 'CHAMP']
const ROUND_LABELS: Record<string, string> = {
  R64: 'Round of 64', R32: 'Round of 32', S16: 'Sweet 16',
  E8: 'Elite 8', F4: 'Final Four', CHAMP: 'Championship',
}

export function AdminPanel() {
  const [tab, setTab] = useState<Tab>('entrants')

  return (
    <div>
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setTab('entrants')}
          className={`px-6 py-2 rounded-lg font-semibold ${tab === 'entrants' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
        >
          👥 Manage Entrants
        </button>
        <button
          onClick={() => setTab('results')}
          className={`px-6 py-2 rounded-lg font-semibold ${tab === 'results' ? 'bg-green-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
        >
          🏀 Enter Results
        </button>
      </div>

      {tab === 'entrants' && <EntrantsManager />}
      {tab === 'results' && <ResultsManager />}
    </div>
  )
}

// --- Entrants Manager with Drag & Drop ---
function EntrantsManager() {
  const [entrants, setEntrants] = useState<Entrant[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [filterRegion, setFilterRegion] = useState<string>('all')

  useEffect(() => {
    fetch('/api/admin/entrants')
      .then(r => r.json())
      .then(d => { setEntrants(d.entrants); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const startEdit = (e: Entrant) => {
    setEditingId(e.id)
    setEditName(e.displayName)
  }

  const saveEdit = async (id: string) => {
    const res = await fetch('/api/admin/entrants', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, displayName: editName }),
    })
    if (res.ok) {
      const data = await res.json()
      setEntrants(prev => prev.map(e => e.id === id ? { ...e, ...data.entrant } : e))
      setEditingId(null)
    }
  }

  // Drag & drop reorder within a region
  const handleReorder = async (region: string, draggedId: string, targetSeed: number) => {
    setSaving(true)
    const regionEntrants = entrants
      .filter(e => e.region === region)
      .sort((a, b) => a.seed - b.seed)

    const draggedIdx = regionEntrants.findIndex(e => e.id === draggedId)
    if (draggedIdx === -1) { setSaving(false); return }

    const dragged = regionEntrants[draggedIdx]
    const targetIdx = targetSeed - 1

    if (draggedIdx === targetIdx) { setSaving(false); return }

    // Remove dragged and insert at target position
    const reordered = [...regionEntrants]
    reordered.splice(draggedIdx, 1)
    reordered.splice(targetIdx, 0, dragged)

    // Assign new seeds 1-16
    const updates = reordered.map((e, i) => ({ id: e.id, seed: i + 1 }))

    // Optimistic update
    setEntrants(prev => {
      const updated = [...prev]
      for (const u of updates) {
        const idx = updated.findIndex(e => e.id === u.id)
        if (idx >= 0) updated[idx] = { ...updated[idx], seed: u.seed }
      }
      return updated
    })

    // Save to backend
    try {
      const res = await fetch('/api/admin/entrants', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reorder: updates }),
      })
      if (!res.ok) throw new Error('Save failed')
    } catch {
      // Revert on error
      const data = await fetch('/api/admin/entrants').then(r => r.json())
      setEntrants(data.entrants)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="text-center py-8 text-gray-500">Loading entrants...</div>

  const regions = filterRegion === 'all'
    ? Object.keys(REGION_LABELS)
    : [filterRegion]

  return (
    <div>
      {saving && (
        <div className="fixed top-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg z-50">Saving...</div>
      )}

      <div className="mb-4 flex gap-2 flex-wrap">
        <button onClick={() => setFilterRegion('all')} className={`px-3 py-1 rounded text-sm ${filterRegion === 'all' ? 'bg-gray-800 text-white' : 'bg-white'}`}>All Regions</button>
        {Object.entries(REGION_LABELS).map(([k, v]) => (
          <button key={k} onClick={() => setFilterRegion(k)} className={`px-3 py-1 rounded text-sm ${filterRegion === k ? 'bg-gray-800 text-white' : 'bg-white'}`}>{v}</button>
        ))}
      </div>

      <p className="text-sm text-gray-500 mb-4">💡 Drag and drop entrants to reorder their seed within a region. Click the name to edit it.</p>

      {regions.map(region => {
        const regionEntrants = entrants
          .filter(e => e.region === region)
          .sort((a, b) => a.seed - b.seed)

        return (
          <div key={region} className="mb-6">
            <h4 className="font-bold text-lg mb-2">{REGION_LABELS[region]}</h4>
            <DraggableList
              entrants={regionEntrants}
              region={region}
              editingId={editingId}
              editName={editName}
              setEditName={setEditName}
              onStartEdit={startEdit}
              onSaveEdit={saveEdit}
              onCancelEdit={() => setEditingId(null)}
              onReorder={handleReorder}
            />
          </div>
        )
      })}
    </div>
  )
}

// --- Draggable List ---
function DraggableList({
  entrants,
  region,
  editingId,
  editName,
  setEditName,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  onReorder,
}: {
  entrants: Entrant[]
  region: string
  editingId: string | null
  editName: string
  setEditName: (n: string) => void
  onStartEdit: (e: Entrant) => void
  onSaveEdit: (id: string) => void
  onCancelEdit: () => void
  onReorder: (region: string, draggedId: string, targetSeed: number) => void
}) {
  const [draggedId, setDraggedId] = useState<string | null>(null)
  const [dragOverSeed, setDragOverSeed] = useState<number | null>(null)

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedId(id)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', id)
  }

  const handleDragOver = (e: React.DragEvent, seed: number) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDragOverSeed(seed)
  }

  const handleDragLeave = () => {
    setDragOverSeed(null)
  }

  const handleDrop = (e: React.DragEvent, targetSeed: number) => {
    e.preventDefault()
    const id = e.dataTransfer.getData('text/plain')
    if (id) {
      onReorder(region, id, targetSeed)
    }
    setDraggedId(null)
    setDragOverSeed(null)
  }

  const handleDragEnd = () => {
    setDraggedId(null)
    setDragOverSeed(null)
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      {entrants.map(entrant => {
        const isDragging = draggedId === entrant.id
        const isDragOver = dragOverSeed === entrant.seed
        const isEditing = editingId === entrant.id

        return (
          <div
            key={entrant.id}
            draggable={!isEditing}
            onDragStart={(e) => handleDragStart(e, entrant.id)}
            onDragOver={(e) => handleDragOver(e, entrant.seed)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, entrant.seed)}
            onDragEnd={handleDragEnd}
            className={`
              flex items-center gap-3 px-4 py-3 border-b border-gray-100 transition-all
              ${isDragging ? 'opacity-40 bg-gray-100' : ''}
              ${isDragOver && !isDragging ? 'border-t-2 border-t-blue-500 bg-blue-50' : ''}
              ${!isEditing ? 'cursor-grab active:cursor-grabbing' : ''}
            `}
          >
            {/* Drag handle */}
            <div className="text-gray-300 select-none shrink-0">⠿</div>

            {/* Seed badge */}
            <div className="bg-gray-800 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0">
              {entrant.seed}
            </div>

            {/* Name */}
            {isEditing ? (
              <div className="flex-1 flex items-center gap-2">
                <input
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && onSaveEdit(entrant.id)}
                  className="border rounded px-2 py-1 flex-1 text-gray-900"
                  autoFocus
                />
                <button onClick={() => onSaveEdit(entrant.id)} className="bg-green-600 text-white px-3 py-1 rounded text-xs">Save</button>
                <button onClick={onCancelEdit} className="bg-gray-400 text-white px-3 py-1 rounded text-xs">Cancel</button>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-between">
                <span className="font-medium text-gray-900">{entrant.displayName}</span>
                <button
                  onClick={(e) => { e.stopPropagation(); onStartEdit(entrant) }}
                  className="text-blue-600 hover:text-blue-800 text-xs font-medium px-2 py-1 rounded hover:bg-blue-50"
                >
                  ✏️ Edit
                </button>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

// --- Results Manager ---
function ResultsManager() {
  const [selectedRound, setSelectedRound] = useState('R64')
  const [matches, setMatches] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    fetch(`/api/admin/results?round=${selectedRound}`)
      .then(r => r.json())
      .then(d => { setMatches(d.matches); setLoading(false) })
      .catch(() => setLoading(false))
  }, [selectedRound])

  const setWinner = async (matchId: string, winnerEntrantId: string) => {
    if (!confirm('Set this entrant as the winner? This will advance them to the next round.')) return

    const res = await fetch('/api/admin/results', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ matchId, winnerEntrantId }),
    })

    if (res.ok) {
      const data = await fetch(`/api/admin/results?round=${selectedRound}`).then(r => r.json())
      setMatches(data.matches)
    }
  }

  return (
    <div>
      <div className="mb-4 flex gap-2 flex-wrap">
        {ROUNDS.map(r => (
          <button
            key={r}
            onClick={() => setSelectedRound(r)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold ${selectedRound === r ? 'bg-green-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
          >
            {ROUND_LABELS[r]}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-8 text-gray-500">Loading matches...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {matches.map(match => (
            <div key={match.id} className="bg-white rounded-lg shadow p-4">
              <div className="text-xs text-gray-500 mb-2">
                {match.region ? REGION_LABELS[match.region] : 'Cross-Region'} • Match #{match.matchNumber}
                {match.winnerEntrant && <span className="ml-2 text-green-600 font-semibold">✅ Complete</span>}
              </div>

              {!match.leftEntrant && !match.rightEntrant ? (
                <div className="text-gray-400 italic text-sm">Waiting for previous round results</div>
              ) : (
                <div className="space-y-2">
                  {match.leftEntrant && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="bg-gray-200 px-2 py-0.5 rounded text-xs font-bold">{match.leftEntrant.seed}</span>
                        <span className={match.winnerEntrant?.id === match.leftEntrant.id ? 'font-bold text-green-700' : ''}>{match.leftEntrant.displayName}</span>
                        {match.winnerEntrant?.id === match.leftEntrant.id && <span>🏆</span>}
                      </div>
                      {!match.winnerEntrant && (
                        <button onClick={() => setWinner(match.id, match.leftEntrant!.id)} className="bg-green-600 text-white px-3 py-1 rounded text-xs">Winner</button>
                      )}
                    </div>
                  )}
                  <div className="text-center text-xs text-gray-400">vs</div>
                  {match.rightEntrant && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="bg-gray-200 px-2 py-0.5 rounded text-xs font-bold">{match.rightEntrant.seed}</span>
                        <span className={match.winnerEntrant?.id === match.rightEntrant.id ? 'font-bold text-green-700' : ''}>{match.rightEntrant.displayName}</span>
                        {match.winnerEntrant?.id === match.rightEntrant.id && <span>🏆</span>}
                      </div>
                      {!match.winnerEntrant && (
                        <button onClick={() => setWinner(match.id, match.rightEntrant!.id)} className="bg-green-600 text-white px-3 py-1 rounded text-xs">Winner</button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
