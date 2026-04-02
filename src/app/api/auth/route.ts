import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { cookies } from 'next/headers'

// Simple hash function for demo (in production use bcrypt)
function simpleHash(password: string): string {
  let hash = 0
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  return hash.toString(16)
}

// GET - Check authentication status
export async function GET() {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get('userId')?.value

    if (!userId) {
      return NextResponse.json({ user: null }, { status: 200 })
    }

    const user = await db.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        company: true,
        avatar: true,
        credits: true,
        plan: true
      }
    })

    if (!user) {
      return NextResponse.json({ user: null }, { status: 200 })
    }

    return NextResponse.json({ user }, { status: 200 })
  } catch (error) {
    console.error('Auth check error:', error)
    return NextResponse.json({ user: null }, { status: 200 })
  }
}

// POST - Login or Signup
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, email, password, name, company } = body

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    if (action === 'signup') {
      // Check if user exists
      const existingUser = await db.user.findUnique({
        where: { email }
      })

      if (existingUser) {
        return NextResponse.json(
          { error: 'Email already registered' },
          { status: 400 }
        )
      }

      // Create new user
      const hashedPassword = simpleHash(password)
      const newUser = await db.user.create({
        data: {
          email,
          password: hashedPassword,
          name: name || null,
          company: company || null,
          credits: 400, // Free tier credits
          plan: 'free'
        }
      })

      // Set cookie
      const cookieStore = await cookies()
      cookieStore.set('userId', newUser.id, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7 // 1 week
      })

      return NextResponse.json({
        user: {
          id: newUser.id,
          email: newUser.email,
          name: newUser.name,
          company: newUser.company,
          avatar: newUser.avatar,
          credits: newUser.credits,
          plan: newUser.plan
        }
      })
    } else if (action === 'login') {
      // Find user
      const user = await db.user.findUnique({
        where: { email }
      })

      if (!user) {
        return NextResponse.json(
          { error: 'Invalid email or password' },
          { status: 401 }
        )
      }

      // Check password
      const hashedPassword = simpleHash(password)
      if (user.password !== hashedPassword) {
        return NextResponse.json(
          { error: 'Invalid email or password' },
          { status: 401 }
        )
      }

      // Set cookie
      const cookieStore = await cookies()
      cookieStore.set('userId', user.id, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7 // 1 week
      })

      return NextResponse.json({
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          company: user.company,
          avatar: user.avatar,
          credits: user.credits,
          plan: user.plan
        }
      })
    } else if (action === 'logout') {
      // Clear cookie
      const cookieStore = await cookies()
      cookieStore.delete('userId')

      return NextResponse.json({ success: true })
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Auth error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
