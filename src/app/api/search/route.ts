import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import ZAI from 'z-ai-web-dev-sdk'
import { db } from '@/lib/db'

interface SearchResult {
  url: string
  name: string
  snippet: string
  host_name: string
  rank: number
  date: string
  favicon: string
}

// Parse company information from search results
function parseCompanyInfo(results: SearchResult[]) {
  const companies: Array<{
    name: string
    domain: string
    industry: string
    size: string
    revenue: string
    location: string
    website: string
    logo: string | null
    description: string
    technologies: string[]
  }> = []

  for (const result of results) {
    // Skip social media and generic sites
    if (result.host_name.includes('linkedin') || 
        result.host_name.includes('twitter') ||
        result.host_name.includes('facebook') ||
        result.host_name.includes('instagram') ||
        result.host_name.includes('crunchbase')) {
      continue
    }

    // Extract company info from snippet
    const name = result.name.replace(' - ', ' | ').split('|')[0].trim()
    const domain = result.host_name
    
    companies.push({
      name,
      domain,
      industry: 'Technology', // Default, would be enriched
      size: '50-200', // Default
      revenue: '$1M-$10M', // Default
      location: 'United States', // Default
      website: `https://${domain}`,
      logo: null,
      description: result.snippet,
      technologies: []
    })
  }

  return companies.slice(0, 10)
}

// Parse contact information from search results
function parseContactInfo(results: SearchResult[]) {
  const contacts: Array<{
    name: string
    title: string
    email: string | null
    phone: string | null
    linkedIn: string | null
    photo: string | null
    company: string
  }> = []

  for (const result of results) {
    if (result.host_name.includes('linkedin')) {
      // Extract name from LinkedIn result
      const titleParts = result.name.split(' - ')
      const name = titleParts[0].trim()
      const title = titleParts[1]?.split('|')[0].trim() || 'Professional'
      
      contacts.push({
        name,
        title,
        email: null,
        phone: null,
        linkedIn: result.url,
        photo: null,
        company: ''
      })
    }
  }

  return contacts.slice(0, 10)
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get('userId')?.value

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check user credits
    const user = await db.user.findUnique({
      where: { id: userId }
    })

    if (!user || user.credits <= 0) {
      return NextResponse.json(
        { error: 'Insufficient credits' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { type, query } = body

    if (!query) {
      return NextResponse.json({ error: 'Query required' }, { status: 400 })
    }

    const zai = await ZAI.create()
    let searchQuery = query

    // Enhance query based on search type
    if (type === 'companies') {
      searchQuery = `${query} company profile business`
    } else if (type === 'contacts') {
      searchQuery = `${query} CEO founder executive LinkedIn`
    }

    const searchResult = await zai.functions.invoke('web_search', {
      query: searchQuery,
      num: 15
    })

    // Deduct credits
    await db.user.update({
      where: { id: userId },
      data: { credits: { decrement: 2 } }
    })

    if (type === 'companies') {
      const companies = parseCompanyInfo(searchResult as SearchResult[])
      return NextResponse.json({
        companies,
        credits: user.credits - 2
      })
    } else if (type === 'contacts') {
      const contacts = parseContactInfo(searchResult as SearchResult[])
      return NextResponse.json({
        contacts,
        credits: user.credits - 2
      })
    }

    // Default: return raw results
    return NextResponse.json({
      results: searchResult,
      credits: user.credits - 2
    })
  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json(
      { error: 'Search failed' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const userId = cookieStore.get('userId')?.value

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')
    const type = searchParams.get('type') || 'companies'

    if (!query) {
      return NextResponse.json({ error: 'Query required' }, { status: 400 })
    }

    // Check user credits
    const user = await db.user.findUnique({
      where: { id: userId }
    })

    if (!user || user.credits <= 0) {
      return NextResponse.json(
        { error: 'Insufficient credits' },
        { status: 403 }
      )
    }

    const zai = await ZAI.create()
    let searchQuery = query

    if (type === 'companies') {
      searchQuery = `${query} company profile business`
    } else if (type === 'contacts') {
      searchQuery = `${query} CEO founder executive LinkedIn`
    }

    const searchResult = await zai.functions.invoke('web_search', {
      query: searchQuery,
      num: 15
    })

    // Deduct credits
    await db.user.update({
      where: { id: userId },
      data: { credits: { decrement: 2 } }
    })

    if (type === 'companies') {
      const companies = parseCompanyInfo(searchResult as SearchResult[])
      return NextResponse.json({
        companies,
        credits: user.credits - 2
      })
    } else if (type === 'contacts') {
      const contacts = parseContactInfo(searchResult as SearchResult[])
      return NextResponse.json({
        contacts,
        credits: user.credits - 2
      })
    }

    return NextResponse.json({
      results: searchResult,
      credits: user.credits - 2
    })
  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json(
      { error: 'Search failed' },
      { status: 500 }
    )
  }
}
