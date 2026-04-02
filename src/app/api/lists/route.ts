import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { cookies } from 'next/headers'

// GET - Get all lists or a specific list
export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get('userId')?.value

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const listId = searchParams.get('id')

    if (listId) {
      const list = await db.leadList.findUnique({
        where: { id: listId, userId },
        include: {
          leads: {
            orderBy: { createdAt: 'desc' }
          }
        }
      })

      if (!list) {
        return NextResponse.json({ error: 'List not found' }, { status: 404 })
      }

      return NextResponse.json({ list })
    }

    const lists = await db.leadList.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        leads: {
          select: { id: true }
        }
      }
    })

    return NextResponse.json({ lists })
  } catch (error) {
    console.error('Get lists error:', error)
    return NextResponse.json(
      { error: 'Failed to get lists' },
      { status: 500 }
    )
  }
}

// POST - Create a new list
export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get('userId')?.value

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, description } = body

    if (!name) {
      return NextResponse.json({ error: 'List name required' }, { status: 400 })
    }

    const list = await db.leadList.create({
      data: {
        userId,
        name,
        description
      },
      include: {
        leads: true
      }
    })

    return NextResponse.json({ list })
  } catch (error) {
    console.error('Create list error:', error)
    return NextResponse.json(
      { error: 'Failed to create list' },
      { status: 500 }
    )
  }
}

// PUT - Update a list
export async function PUT(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get('userId')?.value

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { id, name, description } = body

    if (!id) {
      return NextResponse.json({ error: 'List ID required' }, { status: 400 })
    }

    const list = await db.leadList.update({
      where: { id, userId },
      data: { name, description }
    })

    return NextResponse.json({ list })
  } catch (error) {
    console.error('Update list error:', error)
    return NextResponse.json(
      { error: 'Failed to update list' },
      { status: 500 }
    )
  }
}

// DELETE - Delete a list
export async function DELETE(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get('userId')?.value

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'List ID required' }, { status: 400 })
    }

    // First update all leads to remove list association
    await db.lead.updateMany({
      where: { listId: id, userId },
      data: { listId: null }
    })

    // Then delete the list
    await db.leadList.delete({
      where: { id, userId }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete list error:', error)
    return NextResponse.json(
      { error: 'Failed to delete list' },
      { status: 500 }
    )
  }
}
