import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

async function requireAdmin() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== 'ADMIN') return null
  return session
}

// GET - list all entrants
export async function GET() {
  const session = await requireAdmin()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const entrants = await prisma.entrant.findMany({
    orderBy: [{ region: 'asc' }, { seed: 'asc' }]
  })
  return NextResponse.json({ entrants })
}

// PUT - update entrant(s)
export async function PUT(request: NextRequest) {
  const session = await requireAdmin()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()

  // Bulk reorder: { reorder: [{ id, seed }, ...] }
  if (body.reorder && Array.isArray(body.reorder)) {
    // Need to handle unique constraint on (region, seed)
    // Strategy: set all to temporary high seeds first, then assign final seeds
    const updates = body.reorder as { id: string; seed: number }[]

    // First pass: set temporary seeds (offset by 1000 to avoid conflicts)
    for (const u of updates) {
      await prisma.entrant.update({
        where: { id: u.id },
        data: { seed: u.seed + 1000 }
      })
    }

    // Second pass: set final seeds
    for (const u of updates) {
      await prisma.entrant.update({
        where: { id: u.id },
        data: { seed: u.seed }
      })
    }

    await prisma.adminActionLog.create({
      data: {
        adminUserId: session.user.id,
        actionType: 'REORDER_ENTRANTS',
        payloadJson: JSON.stringify({ reorder: updates })
      }
    })

    return NextResponse.json({ success: true })
  }

  // Single entrant update: { id, displayName?, seed?, department?, title? }
  const { id, displayName, seed, department, title } = body

  if (!id) {
    return NextResponse.json({ error: 'Missing entrant id' }, { status: 400 })
  }

  const entrant = await prisma.entrant.update({
    where: { id },
    data: {
      ...(displayName !== undefined && { displayName }),
      ...(seed !== undefined && { seed }),
      ...(department !== undefined && { department }),
      ...(title !== undefined && { title }),
    }
  })

  await prisma.adminActionLog.create({
    data: {
      adminUserId: session.user.id,
      actionType: 'UPDATE_ENTRANT',
      payloadJson: JSON.stringify({ id, displayName, seed })
    }
  })

  return NextResponse.json({ entrant })
}
