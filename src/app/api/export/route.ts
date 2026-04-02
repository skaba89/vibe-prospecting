import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { leads, format } = body

    if (!leads || !Array.isArray(leads)) {
      return NextResponse.json({ error: 'No leads provided' }, { status: 400 })
    }

    if (format === 'csv') {
      const headers = [
        'Company Name',
        'Domain',
        'Industry',
        'Size',
        'Revenue',
        'Location',
        'Website',
        'Contact Name',
        'Contact Title',
        'Contact Email',
        'Contact Phone',
        'Contact LinkedIn',
        'Status',
        'Created At'
      ]

      const rows = leads.map((lead: any) => [
        lead.companyName || '',
        lead.companyDomain || '',
        lead.companyIndustry || '',
        lead.companySize || '',
        lead.companyRevenue || '',
        lead.companyLocation || '',
        lead.companyWebsite || '',
        lead.contactName || '',
        lead.contactTitle || '',
        lead.contactEmail || '',
        lead.contactPhone || '',
        lead.contactLinkedIn || '',
        lead.status || '',
        lead.createdAt || ''
      ])

      const csv = [
        headers.join(','),
        ...rows.map((row: string[]) => 
          row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')
        )
      ].join('\n')

      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': 'attachment; filename="leads_export.csv"'
        }
      })
    }

    if (format === 'excel') {
      const headers = [
        'Company Name',
        'Domain',
        'Industry',
        'Size',
        'Revenue',
        'Location',
        'Website',
        'Contact Name',
        'Contact Title',
        'Contact Email',
        'Contact Phone',
        'Contact LinkedIn',
        'Status',
        'Created At'
      ]

      const rows = leads.map((lead: any) => [
        lead.companyName || '',
        lead.companyDomain || '',
        lead.companyIndustry || '',
        lead.companySize || '',
        lead.companyRevenue || '',
        lead.companyLocation || '',
        lead.companyWebsite || '',
        lead.contactName || '',
        lead.contactTitle || '',
        lead.contactEmail || '',
        lead.contactPhone || '',
        lead.contactLinkedIn || '',
        lead.status || '',
        lead.createdAt || ''
      ])

      const tsv = [
        headers.join('\t'),
        ...rows.map((row: string[]) => 
          row.map(cell => String(cell).replace(/\t/g, ' ')).join('\t')
        )
      ].join('\n')

      return new NextResponse(tsv, {
        headers: {
          'Content-Type': 'application/vnd.ms-excel',
          'Content-Disposition': 'attachment; filename="leads_export.xls"'
        }
      })
    }

    return NextResponse.json({ error: 'Invalid format' }, { status: 400 })
  } catch (error) {
    console.error('Export error:', error)
    return NextResponse.json({ error: 'Export failed' }, { status: 500 })
  }
}
