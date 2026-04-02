import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { cookies } from 'next/headers'

// GET - Get all leads or a specific lead
export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get('userId')?.value

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const leadId = searchParams.get('id')
    const listId = searchParams.get('listId')
    const status = searchParams.get('status')

    if (leadId) {
      const lead = await db.lead.findUnique({
        where: { id: leadId, userId }
      })

      if (!lead) {
        return NextResponse.json({ error: 'Lead not found' }, { status: 404 })
      }

      return NextResponse.json({ lead })
    }

    // Build where clause
    const where: Record<string, unknown> = { userId }
    if (listId) where.listId = listId
    if (status) where.status = status

    const leads = await db.lead.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ leads })
  } catch (error) {
    console.error('Get leads error:', error)
    return NextResponse.json(
      { error: 'Failed to get leads' },
      { status: 500 }
    )
  }
}

// POST - Create a new lead
export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get('userId')?.value

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      companyName,
      companyDomain,
      companyIndustry,
      companySize,
      companyRevenue,
      companyLocation,
      companyWebsite,
      companyLogo,
      companyTech,
      contactName,
      contactTitle,
      contactEmail,
      contactPhone,
      contactLinkedIn,
      contactPhoto,
      intent,
      notes,
      status,
      listId
    } = body

    const lead = await db.lead.create({
      data: {
        userId,
        companyName,
        companyDomain,
        companyIndustry,
        companySize,
        companyRevenue,
        companyLocation,
        companyWebsite,
        companyLogo,
        companyTech,
        contactName,
        contactTitle,
        contactEmail,
        contactPhone,
        contactLinkedIn,
        contactPhoto,
        intent,
        notes,
        status: status || 'new',
        listId
      }
    })

    return NextResponse.json({ lead })
  } catch (error) {
    console.error('Create lead error:', error)
    return NextResponse.json(
      { error: 'Failed to create lead' },
      { status: 500 }
    )
  }
}

// PUT - Update a lead
export async function PUT(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get('userId')?.value

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { id, ...updates } = body

    if (!id) {
      return NextResponse.json({ error: 'Lead ID required' }, { status: 400 })
    }

    const lead = await db.lead.update({
      where: { id, userId },
      data: updates
    })

    return NextResponse.json({ lead })
  } catch (error) {
    console.error('Update lead error:', error)
    return NextResponse.json(
      { error: 'Failed to update lead' },
      { status: 500 }
    )
  }
}

// DELETE - Delete a lead
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
      return NextResponse.json({ error: 'Lead ID required' }, { status: 400 })
    }

    await db.lead.delete({
      where: { id, userId }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete lead error:', error)
    return NextResponse.json(
      { error: 'Failed to delete lead' },
      { status: 500 }
    )
  }
}
