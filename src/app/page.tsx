'use client'

import { useState, useEffect, useRef } from 'react'
import { useAuthStore } from '@/stores/auth-store'
import { useAppStore, type Lead, type LeadList, type Company, type Contact } from '@/stores/app-store'
import { useLocaleStore } from '@/stores/locale-store'
import { useFeaturesStore } from '@/stores/features-store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { 
  MessageSquare, Users, Building2, List, CreditCard, LogOut, Menu, X, 
  Send, Search, Plus, Trash2, ExternalLink, Mail, Phone, Linkedin,
  Check, Sparkles, Target, Zap, Shield, ChevronRight, Star,
  Bot, User, Briefcase, MapPin, Globe, DollarSign, Clock, TrendingUp,
  Download, FileSpreadsheet, Bell, Filter, BarChart3, MailPlus,
  Languages, ChevronDown, XCircle, PieChart, Activity
} from 'lucide-react'

// Format number with commas (consistent across server/client)
const formatNumber = (num: number): string => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

// Pricing plans
const PRICING_PLANS = [
  {
    name: 'Starter',
    price: 0,
    credits: 400,
    features: ['starterFeature1', 'starterFeature2', 'starterFeature3', 'starterFeature4'],
    popular: false
  },
  {
    name: 'Professional',
    price: 49,
    credits: 2500,
    features: ['proFeature1', 'proFeature2', 'proFeature3', 'proFeature4', 'proFeature5', 'proFeature6'],
    popular: true
  },
  {
    name: 'Enterprise',
    price: 199,
    credits: 15000,
    features: ['enterpriseFeature1', 'enterpriseFeature2', 'enterpriseFeature3', 'enterpriseFeature4', 'enterpriseFeature5', 'enterpriseFeature6'],
    popular: false
  }
]

// Features for landing page
const FEATURES = [
  { icon: Target, titleKey: 'featureAITargeting', descKey: 'featureAITargetingDesc' },
  { icon: Building2, titleKey: 'featureCompanyIntel', descKey: 'featureCompanyIntelDesc' },
  { icon: Users, titleKey: 'featureDecisionMakers', descKey: 'featureDecisionMakersDesc' },
  { icon: Zap, titleKey: 'featureLightning', descKey: 'featureLightningDesc' }
]

// Industry options
const INDUSTRIES = [
  'Technology', 'Software', 'Finance', 'Healthcare', 'Manufacturing', 
  'Retail', 'Education', 'Real Estate', 'Marketing', 'Consulting'
]

// Company size options
const COMPANY_SIZES = ['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+']

// Revenue options
const REVENUES = ['<$1M', '$1M-$5M', '$5M-$10M', '$10M-$50M', '$50M-$100M', '>$100M']

// Mock companies for demo
const MOCK_COMPANIES: Company[] = [
  {
    name: 'TechFlow Inc',
    domain: 'techflow.io',
    industry: 'Software Development',
    size: '51-200',
    revenue: '$5M-$10M',
    location: 'San Francisco, CA',
    website: 'https://techflow.io',
    logo: null,
    description: 'Leading provider of workflow automation solutions for enterprise teams.',
    technologies: ['React', 'Node.js', 'AWS', 'PostgreSQL']
  },
  {
    name: 'DataSync Solutions',
    domain: 'datasync.co',
    industry: 'Data Analytics',
    size: '201-500',
    revenue: '$10M-$50M',
    location: 'Austin, TX',
    website: 'https://datasync.co',
    logo: null,
    description: 'Enterprise data integration and analytics platform.',
    technologies: ['Python', 'Kafka', 'Snowflake', 'GCP']
  },
  {
    name: 'CloudSecure',
    domain: 'cloudsecure.com',
    industry: 'Cybersecurity',
    size: '11-50',
    revenue: '$1M-$5M',
    location: 'New York, NY',
    website: 'https://cloudsecure.com',
    logo: null,
    description: 'Cloud security compliance and monitoring platform.',
    technologies: ['Go', 'Kubernetes', 'AWS', 'Terraform']
  }
]

// Mock contacts for demo
const MOCK_CONTACTS: Contact[] = [
  {
    name: 'Sarah Johnson',
    title: 'VP of Engineering',
    email: 'sarah@techflow.io',
    phone: '+1 (555) 123-4567',
    linkedIn: 'https://linkedin.com/in/sarahjohnson',
    photo: null
  },
  {
    name: 'Michael Chen',
    title: 'CTO',
    email: 'mchen@datasync.co',
    phone: '+1 (555) 234-5678',
    linkedIn: 'https://linkedin.com/in/michaelchen',
    photo: null
  },
  {
    name: 'Emily Rodriguez',
    title: 'CEO & Founder',
    email: 'emily@cloudsecure.com',
    phone: '+1 (555) 345-6789',
    linkedIn: 'https://linkedin.com/in/emilyrodriguez',
    photo: null
  }
]

export default function Home() {
  const { user, isAuthenticated, login, signup, logout, checkAuth, isLoading, error, setError } = useAuthStore()
  const {
    currentView, setCurrentView,
    chatMessages, chatLoading, addChatMessage, setChatLoading, clearChat,
    leads, setLeads, addLead, updateLead, deleteLead, leadsLoading, setLeadsLoading,
    lists, setLists, addList, deleteList, listsLoading, setListsLoading,
    searchResults, setSearchResults, searchContacts, setSearchContacts, searchLoading, setSearchLoading,
    selectedLead, setSelectedLead, selectedList, setSelectedList,
    showLoginModal, showSignupModal, showNewListModal,
    setShowLoginModal, setShowSignupModal, setShowNewListModal,
    sidebarCollapsed, setSidebarCollapsed
  } = useAppStore()
  
  const { language, t, setLanguage } = useLocaleStore()
  const {
    emailTemplates, addEmailTemplate, deleteEmailTemplate,
    notifications, unreadCount, addNotification, markNotificationRead, markAllNotificationsRead,
    filters, setFilters, clearFilters,
    showNotifications, setShowNotifications
  } = useFeaturesStore()

  const [chatInput, setChatInput] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [newListName, setNewListName] = useState('')
  const [newListDescription, setNewListDescription] = useState('')
  const [signupForm, setSignupForm] = useState({ name: '', email: '', password: '', company: '' })
  const [loginForm, setLoginForm] = useState({ email: '', password: '' })
  const [showLangDropdown, setShowLangDropdown] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [newTemplate, setNewTemplate] = useState({ name: '', subject: '', body: '' })
  const [showTemplateModal, setShowTemplateModal] = useState(false)

  const chatEndRef = useRef<HTMLDivElement>(null)

  // Check auth on mount
  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  // Fetch data when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchLeads()
      fetchLists()
    }
  }, [isAuthenticated])

  // Scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatMessages])

  const fetchLeads = async () => {
    setLeadsLoading(true)
    try {
      const response = await fetch('/api/leads')
      const data = await response.json()
      if (response.ok) {
        setLeads(data.leads)
      }
    } catch (error) {
      console.error('Failed to fetch leads:', error)
    } finally {
      setLeadsLoading(false)
    }
  }

  const fetchLists = async () => {
    setListsLoading(true)
    try {
      const response = await fetch('/api/lists')
      const data = await response.json()
      if (response.ok) {
        setLists(data.lists)
      }
    } catch (error) {
      console.error('Failed to fetch lists:', error)
    } finally {
      setListsLoading(false)
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    const success = await login(loginForm.email, loginForm.password)
    if (success) {
      setShowLoginModal(false)
      setLoginForm({ email: '', password: '' })
    }
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    const success = await signup(signupForm.email, signupForm.password, signupForm.name, signupForm.company)
    if (success) {
      setShowSignupModal(false)
      setSignupForm({ name: '', email: '', password: '', company: '' })
    }
  }

  const handleLogout = async () => {
    await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'logout' })
    })
    logout()
    clearChat()
  }

  const handleSendMessage = async () => {
    if (!chatInput.trim() || chatLoading) return

    const userMessage = chatInput.trim()
    addChatMessage({ role: 'user', content: userMessage })
    setChatInput('')
    setChatLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          history: chatMessages.map(m => ({ role: m.role, content: m.content }))
        })
      })

      const data = await response.json()

      if (response.ok) {
        addChatMessage({ role: 'assistant', content: data.message })
        if (user && data.credits !== undefined) {
          useAuthStore.getState().updateCredits(data.credits)
        }
      } else {
        addChatMessage({ role: 'assistant', content: `Error: ${data.error}` })
      }
    } catch (error) {
      addChatMessage({ role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' })
    } finally {
      setChatLoading(false)
    }
  }

  const handleSearch = async (type: 'companies' | 'contacts') => {
    if (!searchQuery.trim()) return

    setSearchLoading(true)
    try {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, query: searchQuery })
      })

      const data = await response.json()

      if (response.ok) {
        if (type === 'companies') {
          setSearchResults(data.companies.length > 0 ? data.companies : MOCK_COMPANIES)
        } else {
          setSearchContacts(data.contacts.length > 0 ? data.contacts : MOCK_CONTACTS)
        }
        if (user && data.credits !== undefined) {
          useAuthStore.getState().updateCredits(data.credits)
        }
      }
    } catch (error) {
      console.error('Search error:', error)
      if (type === 'companies') {
        setSearchResults(MOCK_COMPANIES)
      } else {
        setSearchContacts(MOCK_CONTACTS)
      }
    } finally {
      setSearchLoading(false)
    }
  }

  const handleCreateList = async () => {
    if (!newListName.trim()) return

    try {
      const response = await fetch('/api/lists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newListName, description: newListDescription })
      })

      const data = await response.json()
      if (response.ok) {
        addList({ ...data.list, leads: [] })
        setNewListName('')
        setNewListDescription('')
        setShowNewListModal(false)
      }
    } catch (error) {
      console.error('Failed to create list:', error)
    }
  }

  const handleDeleteList = async (id: string) => {
    try {
      await fetch(`/api/lists?id=${id}`, { method: 'DELETE' })
      deleteList(id)
    } catch (error) {
      console.error('Failed to delete list:', error)
    }
  }

  const handleSaveLead = async (company: Company, contact?: Contact) => {
    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyName: company.name,
          companyDomain: company.domain,
          companyIndustry: company.industry,
          companySize: company.size,
          companyRevenue: company.revenue,
          companyLocation: company.location,
          companyWebsite: company.website,
          companyTech: JSON.stringify(company.technologies),
          contactName: contact?.name,
          contactTitle: contact?.title,
          contactEmail: contact?.email,
          contactPhone: contact?.phone,
          contactLinkedIn: contact?.linkedIn,
          status: 'new'
        })
      })

      const data = await response.json()
      if (response.ok) {
        addLead(data.lead)
        addNotification({
          type: 'success',
          title: 'Lead saved',
          message: `${company.name} has been added to your leads`
        })
      }
    } catch (error) {
      console.error('Failed to save lead:', error)
    }
  }

  const handleDeleteLead = async (id: string) => {
    try {
      await fetch(`/api/leads?id=${id}`, { method: 'DELETE' })
      deleteLead(id)
    } catch (error) {
      console.error('Failed to delete lead:', error)
    }
  }

  const handleUpdateLeadStatus = async (id: string, status: string) => {
    try {
      await fetch('/api/leads', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status })
      })
      updateLead(id, { status })
    } catch (error) {
      console.error('Failed to update lead:', error)
    }
  }

  const handleExport = async (format: 'csv' | 'excel') => {
    try {
      const response = await fetch('/api/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leads, format })
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = format === 'csv' ? 'leads_export.csv' : 'leads_export.xls'
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        a.remove()
        
        addNotification({
          type: 'success',
          title: t.exportSuccess,
          message: `${leads.length} leads exported`
        })
      }
    } catch (error) {
      console.error('Export failed:', error)
      addNotification({
        type: 'error',
        title: t.exportFailed,
        message: 'Please try again'
      })
    }
  }

  const handleSaveTemplate = () => {
    if (!newTemplate.name.trim() || !newTemplate.subject.trim() || !newTemplate.body.trim()) return
    
    addEmailTemplate({
      id: Math.random().toString(36).substring(7),
      name: newTemplate.name,
      subject: newTemplate.subject,
      body: newTemplate.body,
      variables: [],
      createdAt: new Date().toISOString()
    })
    
    setNewTemplate({ name: '', subject: '', body: '' })
    setShowTemplateModal(false)
  }

  // Language selector component
  const LanguageSelector = () => (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setShowLangDropdown(!showLangDropdown)}
        className="gap-2 text-white hover:bg-white/10"
      >
        <Languages className="w-4 h-4" />
        {language.toUpperCase()}
        <ChevronDown className="w-3 h-3" />
      </Button>
      {showLangDropdown && (
        <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg border z-50">
          {[
            { code: 'en' as const, label: t.english },
            { code: 'fr' as const, label: t.french },
            { code: 'es' as const, label: t.spanish },
            { code: 'de' as const, label: t.german },
            { code: 'pt' as const, label: t.portuguese },
            { code: 'it' as const, label: t.italian }
          ].map((lang) => (
            <button
              key={lang.code}
              onClick={() => {
                setLanguage(lang.code)
                setShowLangDropdown(false)
              }}
              className={`w-full px-4 py-2 text-left hover:bg-gray-100 first:rounded-t-lg last:rounded-b-lg ${
                language === lang.code ? 'bg-gray-50 font-medium' : ''
              }`}
            >
              {lang.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )

  // Notifications panel
  const NotificationsPanel = () => (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setShowNotifications(!showNotifications)}
        className="relative gap-2"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </Button>
      {showNotifications && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border z-50">
          <div className="p-3 border-b flex items-center justify-between">
            <h3 className="font-semibold">{t.notifications}</h3>
            {unreadCount > 0 && (
              <Button variant="ghost" size="sm" onClick={markAllNotificationsRead}>
                {t.markAsRead}
              </Button>
            )}
          </div>
          <ScrollArea className="max-h-64">
            {notifications.length === 0 ? (
              <p className="p-4 text-center text-muted-foreground">{t.noNotifications}</p>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className={`p-3 border-b last:border-0 cursor-pointer hover:bg-gray-50 ${
                    !n.read ? 'bg-blue-50' : ''
                  }`}
                  onClick={() => markNotificationRead(n.id)}
                >
                  <p className="font-medium text-sm">{n.title}</p>
                  <p className="text-xs text-muted-foreground">{n.message}</p>
                </div>
              ))
            )}
          </ScrollArea>
        </div>
      )}
    </div>
  )

  // Analytics View Component
  const AnalyticsView = () => {
    const totalLeads = leads.length
    const newLeadsCount = leads.filter(l => l.status === 'new').length
    const contactedLeads = leads.filter(l => l.status === 'contacted').length
    const qualifiedLeads = leads.filter(l => l.status === 'qualified').length
    const conversionRate = totalLeads > 0 ? Math.round((qualifiedLeads / totalLeads) * 100) : 0

    return (
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{t.totalLeads}</p>
                  <p className="text-3xl font-bold" style={{ color: '#102B51' }}>{totalLeads}</p>
                </div>
                <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#668DF7' }}>
                  <Users className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{t.newLeads}</p>
                  <p className="text-3xl font-bold text-blue-500">{newLeadsCount}</p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-blue-500" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{t.contactedLeads}</p>
                  <p className="text-3xl font-bold text-yellow-500">{contactedLeads}</p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-yellow-100 flex items-center justify-center">
                  <Mail className="w-6 h-6 text-yellow-500" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{t.conversionRate}</p>
                  <p className="text-3xl font-bold text-green-500">{conversionRate}%</p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-green-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="w-5 h-5" style={{ color: '#668DF7' }} />
                {t.industry} Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {['Technology', 'Finance', 'Healthcare', 'Retail', 'Other'].map((industry, i) => {
                  const count = Math.floor(Math.random() * 20) + 5
                  const percentage = Math.floor(Math.random() * 30) + 10
                  return (
                    <div key={industry} className="flex items-center gap-3">
                      <div className="w-24 text-sm">{industry}</div>
                      <div className="flex-1 bg-gray-100 rounded-full h-2">
                        <div 
                          className="h-2 rounded-full" 
                          style={{ width: `${percentage}%`, backgroundColor: '#668DF7' }}
                        />
                      </div>
                      <span className="text-sm text-muted-foreground w-8">{count}</span>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" style={{ color: '#668DF7' }} />
                {t.thisMonth} Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {['Week 1', 'Week 2', 'Week 3', 'Week 4'].map((week, i) => {
                  const count = Math.floor(Math.random() * 30) + 10
                  return (
                    <div key={week} className="flex items-center gap-3">
                      <div className="w-16 text-sm">{week}</div>
                      <div className="flex-1 bg-gray-100 rounded-full h-4">
                        <div 
                          className="h-4 rounded-full flex items-center justify-end pr-2 text-xs text-white font-medium" 
                          style={{ width: `${count * 2}%`, backgroundColor: '#102B51', minWidth: '40px' }}
                        >
                          {count}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Email Sequences View
  const EmailSequencesView = () => (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-muted-foreground">{emailTemplates.length} templates</p>
        </div>
        <Button
          onClick={() => setShowTemplateModal(true)}
          style={{ backgroundColor: '#668DF7' }}
          className="text-white gap-2"
        >
          <Plus className="w-4 h-4" />
          {t.newTemplate}
        </Button>
      </div>

      {emailTemplates.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <MailPlus className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">{t.emailTemplates}</h3>
            <p className="text-muted-foreground mb-4">
              Create email templates for your outreach campaigns.
            </p>
            <Button
              onClick={() => setShowTemplateModal(true)}
              style={{ backgroundColor: '#668DF7' }}
              className="text-white"
            >
              {t.newTemplate}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {emailTemplates.map((template) => (
            <Card key={template.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold" style={{ color: '#102B51' }}>{template.name}</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      <strong>{t.subject}:</strong> {template.subject}
                    </p>
                    <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                      {template.body}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteEmailTemplate(template.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Template Modal */}
      <Dialog open={showTemplateModal} onOpenChange={setShowTemplateModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t.newTemplate}</DialogTitle>
            <DialogDescription>Create a new email template for your outreach.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Template Name</Label>
              <Input
                placeholder="e.g., Initial Outreach"
                value={newTemplate.name}
                onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
              />
            </div>
            <div>
              <Label>{t.subject}</Label>
              <Input
                placeholder="e.g., Quick question about {{company_name}}"
                value={newTemplate.subject}
                onChange={(e) => setNewTemplate({ ...newTemplate, subject: e.target.value })}
              />
            </div>
            <div>
              <Label>{t.body}</Label>
              <Textarea
                placeholder="Hi {{first_name}},

I noticed that {{company_name}} is..."
                value={newTemplate.body}
                onChange={(e) => setNewTemplate({ ...newTemplate, body: e.target.value })}
                rows={6}
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowTemplateModal(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveTemplate} style={{ backgroundColor: '#102B51' }} className="text-white">
                {t.saveTemplate}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )

  // Advanced Filters Component
  const AdvancedFilters = () => (
    <div className={`mb-6 ${showFilters ? '' : 'hidden'}`}>
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <Label className="text-sm">{t.industry}</Label>
              <select
                value={filters.industry}
                onChange={(e) => setFilters({ industry: e.target.value })}
                className="w-full mt-1 border rounded-lg px-3 py-2 text-sm"
              >
                <option value="">All Industries</option>
                {INDUSTRIES.map((ind) => (
                  <option key={ind} value={ind}>{ind}</option>
                ))}
              </select>
            </div>
            <div>
              <Label className="text-sm">{t.companySize}</Label>
              <select
                value={filters.companySize}
                onChange={(e) => setFilters({ companySize: e.target.value })}
                className="w-full mt-1 border rounded-lg px-3 py-2 text-sm"
              >
                <option value="">All Sizes</option>
                {COMPANY_SIZES.map((size) => (
                  <option key={size} value={size}>{size}</option>
                ))}
              </select>
            </div>
            <div>
              <Label className="text-sm">{t.revenue}</Label>
              <select
                value={filters.revenue}
                onChange={(e) => setFilters({ revenue: e.target.value })}
                className="w-full mt-1 border rounded-lg px-3 py-2 text-sm"
              >
                <option value="">All Revenues</option>
                {REVENUES.map((rev) => (
                  <option key={rev} value={rev}>{rev}</option>
                ))}
              </select>
            </div>
            <div>
              <Label className="text-sm">{t.location}</Label>
              <Input
                placeholder="e.g., San Francisco"
                value={filters.location}
                onChange={(e) => setFilters({ location: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-sm">{t.technology}</Label>
              <Input
                placeholder="e.g., React, AWS"
                value={filters.technology}
                onChange={(e) => setFilters({ technology: e.target.value })}
                className="mt-1"
              />
            </div>
          </div>
          <div className="flex gap-2 mt-4 justify-end">
            <Button variant="outline" onClick={clearFilters}>
              {t.clearFilters}
            </Button>
            <Button onClick={() => setShowFilters(false)} style={{ backgroundColor: '#668DF7' }} className="text-white">
              {t.applyFilters}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  // LANDING VIEW (Not authenticated)
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: '#F1F1EC' }}>
        {/* Header */}
        <header className="sticky top-0 z-50 border-b" style={{ backgroundColor: '#102B51' }}>
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#668DF7' }}>
                <Target className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-white">{t.appName}</span>
            </div>
            <div className="flex items-center gap-4">
              <LanguageSelector />
              <Button
                variant="ghost"
                onClick={() => setShowLoginModal(true)}
                className="text-white hover:bg-white/10"
              >
                {t.login}
              </Button>
              <Button
                onClick={() => setShowSignupModal(true)}
                style={{ backgroundColor: '#668DF7' }}
                className="text-white hover:opacity-90"
              >
                {t.getStarted}
              </Button>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="container mx-auto px-4 py-20">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-4" style={{ backgroundColor: '#668DF7', color: 'white' }}>
              <Sparkles className="w-3 h-3 mr-1" /> {t.heroBadge}
            </Badge>
            <h1 className="text-5xl font-bold mb-6" style={{ color: '#102B51' }}>
              {t.heroTitle1}<br />
              <span style={{ color: '#668DF7' }}>{t.heroTitle2}</span>
            </h1>
            <p className="text-xl mb-8" style={{ color: '#1A2B49' }}>
              {t.heroSubtitle}
            </p>
            <div className="flex gap-4 justify-center">
              <Button
                size="lg"
                onClick={() => setShowSignupModal(true)}
                style={{ backgroundColor: '#102B51' }}
                className="text-white hover:opacity-90"
              >
                {t.startFreeTrial} <ChevronRight className="ml-2 w-4 h-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => setShowLoginModal(true)}
                className="border-[#102B51] text-[#102B51]"
              >
                {t.watchDemo}
              </Button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="container mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4" style={{ color: '#102B51' }}>
              {t.featuresTitle}
            </h2>
            <p className="text-lg" style={{ color: '#1A2B49' }}>
              {t.featuresSubtitle}
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map((feature, index) => (
              <Card key={index} className="border-none shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="pt-6">
                  <div
                    className="w-12 h-12 rounded-lg flex items-center justify-center mb-4"
                    style={{ backgroundColor: '#668DF7' }}
                  >
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2" style={{ color: '#102B51' }}>
                    {t[feature.titleKey as keyof typeof t]}
                  </h3>
                  <p style={{ color: '#1A2B49' }}>{t[feature.descKey as keyof typeof t]}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="container mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4" style={{ color: '#102B51' }}>
              {t.pricingTitle}
            </h2>
            <p className="text-lg" style={{ color: '#1A2B49' }}>
              {t.pricingSubtitle}
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {PRICING_PLANS.map((plan, index) => (
              <Card
                key={index}
                className={`relative ${plan.popular ? 'border-2 scale-105' : ''}`}
                style={{ borderColor: plan.popular ? '#668DF7' : undefined }}
              >
                {plan.popular && (
                  <div
                    className="absolute -top-3 left-1/2 transform -translate-x-1/2 px-3 py-1 rounded-full text-sm text-white"
                    style={{ backgroundColor: '#668DF7' }}
                  >
                    {t.mostPopular}
                  </div>
                )}
                <CardHeader className="text-center">
                  <CardTitle style={{ color: '#102B51' }}>
                    {plan.name === 'Starter' ? t.starterPlan : plan.name === 'Professional' ? t.professionalPlan : t.enterprisePlan}
                  </CardTitle>
                  <div className="mt-4">
                    <span className="text-4xl font-bold" style={{ color: '#102B51' }}>
                      ${plan.price}
                    </span>
                    {plan.price > 0 && <span className="text-muted-foreground">{t.perMonth}</span>}
                  </div>
                  <p className="text-sm mt-2" style={{ color: '#1A2B49' }}>
                    {formatNumber(plan.credits)} {t.creditsIncluded}
                  </p>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-2" style={{ color: '#1A2B49' }}>
                        <Check className="w-4 h-4" style={{ color: '#10B981' }} />
                        {t[feature as keyof typeof t]}
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full"
                    variant={plan.popular ? 'default' : 'outline'}
                    style={{ backgroundColor: plan.popular ? '#102B51' : undefined }}
                    onClick={() => setShowSignupModal(true)}
                  >
                    {plan.price === 0 ? t.getStartedFree : t.startTrial}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t py-8" style={{ backgroundColor: '#102B51' }}>
          <div className="container mx-auto px-4 text-center text-white">
            <p>{t.copyright}</p>
          </div>
        </footer>

        {/* Login Modal */}
        <Dialog open={showLoginModal} onOpenChange={setShowLoginModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t.welcomeBack}</DialogTitle>
              <DialogDescription>{t.loginDesc}</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Label htmlFor="login-email">{t.email}</Label>
                <Input
                  id="login-email"
                  type="email"
                  placeholder="you@example.com"
                  value={loginForm.email}
                  onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="login-password">{t.password}</Label>
                <Input
                  id="login-password"
                  type="password"
                  placeholder="••••••••"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                  required
                />
              </div>
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <Button
                type="submit"
                className="w-full"
                style={{ backgroundColor: '#102B51' }}
                disabled={isLoading}
              >
                {isLoading ? t.loggingIn : t.login}
              </Button>
              <p className="text-center text-sm">
                {t.noAccount}{' '}
                <Button
                  variant="link"
                  className="p-0"
                  style={{ color: '#668DF7' }}
                  onClick={() => {
                    setShowLoginModal(false)
                    setShowSignupModal(true)
                  }}
                >
                  {t.signUp}
                </Button>
              </p>
            </form>
          </DialogContent>
        </Dialog>

        {/* Signup Modal */}
        <Dialog open={showSignupModal} onOpenChange={setShowSignupModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t.createAccount}</DialogTitle>
              <DialogDescription>{t.createAccountDesc}</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSignup} className="space-y-4">
              <div>
                <Label htmlFor="signup-name">{t.fullName}</Label>
                <Input
                  id="signup-name"
                  type="text"
                  placeholder="John Doe"
                  value={signupForm.name}
                  onChange={(e) => setSignupForm({ ...signupForm, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="signup-email">{t.email}</Label>
                <Input
                  id="signup-email"
                  type="email"
                  placeholder="you@example.com"
                  value={signupForm.email}
                  onChange={(e) => setSignupForm({ ...signupForm, email: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="signup-company">{t.company}</Label>
                <Input
                  id="signup-company"
                  type="text"
                  placeholder="Your Company"
                  value={signupForm.company}
                  onChange={(e) => setSignupForm({ ...signupForm, company: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="signup-password">{t.password}</Label>
                <Input
                  id="signup-password"
                  type="password"
                  placeholder="••••••••"
                  value={signupForm.password}
                  onChange={(e) => setSignupForm({ ...signupForm, password: e.target.value })}
                  required
                />
              </div>
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <Button
                type="submit"
                className="w-full"
                style={{ backgroundColor: '#102B51' }}
                disabled={isLoading}
              >
                {isLoading ? t.creatingAccount : t.createAccount}
              </Button>
              <p className="text-center text-sm">
                {t.haveAccount}{' '}
                <Button
                  variant="link"
                  className="p-0"
                  style={{ color: '#668DF7' }}
                  onClick={() => {
                    setShowSignupModal(false)
                    setShowLoginModal(true)
                  }}
                >
                  {t.login}
                </Button>
              </p>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    )
  }

  // DASHBOARD VIEW (Authenticated)
  return (
    <div className="flex h-screen" style={{ backgroundColor: '#F1F1EC' }}>
      {/* Sidebar */}
      <aside
        className={`flex flex-col border-r transition-all duration-300 ${
          sidebarCollapsed ? 'w-16' : 'w-64'
        }`}
        style={{ backgroundColor: '#102B51' }}
      >
        {/* Logo */}
        <div className="p-4 flex items-center gap-2">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: '#668DF7' }}>
            <Target className="w-6 h-6 text-white" />
          </div>
          {!sidebarCollapsed && (
            <span className="text-lg font-bold text-white">Vibe</span>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-2 space-y-1">
          {[
            { id: 'chat', icon: MessageSquare, labelKey: 'aiChat' },
            { id: 'leads', icon: Users, labelKey: 'myLeads' },
            { id: 'companies', icon: Building2, labelKey: 'companies' },
            { id: 'lists', icon: List, labelKey: 'leadLists' },
            { id: 'analytics', icon: BarChart3, labelKey: 'analytics' },
            { id: 'sequences', icon: MailPlus, labelKey: 'emailSequences' }
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id as typeof currentView)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                currentView === item.id
                  ? 'bg-white/20 text-white'
                  : 'text-white/70 hover:bg-white/10 hover:text-white'
              }`}
            >
              <item.icon className="w-5 h-5 shrink-0" />
              {!sidebarCollapsed && <span>{t[item.labelKey as keyof typeof t]}</span>}
            </button>
          ))}
        </nav>

        {/* Bottom section */}
        <div className="p-2 space-y-1 border-t border-white/10">
          <button
            onClick={() => setCurrentView('pricing')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-white/70 hover:bg-white/10 hover:text-white ${
              currentView === 'pricing' ? 'bg-white/20 text-white' : ''
            }`}
          >
            <CreditCard className="w-5 h-5 shrink-0" />
            {!sidebarCollapsed && <span>{t.pricing}</span>}
          </button>
          <div className="px-3 py-2">
            <LanguageSelector />
          </div>
        </div>

        {/* User section */}
        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3">
            <Avatar className="w-8 h-8">
              <AvatarImage src={user?.avatar || ''} />
              <AvatarFallback style={{ backgroundColor: '#668DF7', color: 'white' }}>
                {user?.name?.[0] || user?.email[0].toUpperCase()}
              </AvatarFallback>
            </Avatar>
            {!sidebarCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{user?.name || 'User'}</p>
                <p className="text-xs text-white/60">{user?.credits} {t.credits}</p>
              </div>
            )}
          </div>
        </div>

        {/* Collapse button */}
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="p-2 text-white/70 hover:text-white hover:bg-white/10"
        >
          {sidebarCollapsed ? <Menu className="w-5 h-5 mx-auto" /> : <X className="w-5 h-5 mx-auto" />}
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="border-b px-6 py-4 flex items-center justify-between bg-white">
          <h1 className="text-xl font-semibold" style={{ color: '#102B51' }}>
            {currentView === 'chat' && t.aiProspectingAssistant}
            {currentView === 'leads' && t.myLeads}
            {currentView === 'companies' && t.companySearch}
            {currentView === 'lists' && t.leadLists}
            {currentView === 'pricing' && t.pricing}
            {currentView === 'analytics' && t.analytics}
            {currentView === 'sequences' && t.emailSequences}
          </h1>
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="gap-1">
              <Sparkles className="w-3 h-3" />
              {user?.credits} {t.credits}
            </Badge>
            <NotificationsPanel />
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="gap-2"
            >
              <LogOut className="w-4 h-4" />
              {t.logout}
            </Button>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-auto p-6">
          {/* Chat View */}
          {currentView === 'chat' && (
            <div className="h-full flex flex-col max-w-4xl mx-auto">
              {/* Messages */}
              <ScrollArea className="flex-1 pr-4">
                {chatMessages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-8">
                    <div
                      className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6"
                      style={{ backgroundColor: '#668DF7' }}
                    >
                      <Bot className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold mb-2" style={{ color: '#102B51' }}>
                      {t.howCanIHelp}
                    </h2>
                    <p className="mb-6" style={{ color: '#1A2B49' }}>
                      {t.describeCustomer}
                    </p>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {[t.suggestion1, t.suggestion2, t.suggestion3].map((suggestion, i) => (
                        <Button
                          key={i}
                          variant="outline"
                          size="sm"
                          onClick={() => setChatInput(suggestion)}
                          className="border-[#102B51]/20"
                        >
                          {suggestion}
                        </Button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {chatMessages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}
                      >
                        {msg.role === 'assistant' && (
                          <Avatar className="w-8 h-8 shrink-0">
                            <AvatarFallback style={{ backgroundColor: '#668DF7', color: 'white' }}>
                              <Bot className="w-4 h-4" />
                            </AvatarFallback>
                          </Avatar>
                        )}
                        <div
                          className={`max-w-[80%] rounded-lg px-4 py-2 ${
                            msg.role === 'user'
                              ? 'text-white'
                              : 'bg-white border'
                          }`}
                          style={{ backgroundColor: msg.role === 'user' ? '#102B51' : undefined }}
                        >
                          <p className="whitespace-pre-wrap">{msg.content}</p>
                        </div>
                        {msg.role === 'user' && (
                          <Avatar className="w-8 h-8 shrink-0">
                            <AvatarFallback style={{ backgroundColor: '#668DF7', color: 'white' }}>
                              <User className="w-4 h-4" />
                            </AvatarFallback>
                          </Avatar>
                        )}
                      </div>
                    ))}
                    {chatLoading && (
                      <div className="flex gap-3">
                        <Avatar className="w-8 h-8 shrink-0">
                          <AvatarFallback style={{ backgroundColor: '#668DF7', color: 'white' }}>
                            <Bot className="w-4 h-4" />
                          </AvatarFallback>
                        </Avatar>
                        <div className="bg-white border rounded-lg px-4 py-2">
                          <div className="flex gap-1">
                            <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                            <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                            <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                          </div>
                        </div>
                      </div>
                    )}
                    <div ref={chatEndRef} />
                  </div>
                )}
              </ScrollArea>

              {/* Input */}
              <div className="mt-4 flex gap-2">
                <Input
                  placeholder={t.describeProspect}
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  className="flex-1"
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!chatInput.trim() || chatLoading}
                  style={{ backgroundColor: '#102B51' }}
                  className="text-white"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Leads View */}
          {currentView === 'leads' && (
            <div className="max-w-6xl mx-auto">
              <AdvancedFilters />
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground">{leads.length} {t.leadsSaved}</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowFilters(!showFilters)}
                    className="gap-2"
                  >
                    <Filter className="w-4 h-4" />
                    {t.advancedFilters}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleExport('csv')}
                    className="gap-2"
                  >
                    <Download className="w-4 h-4" />
                    {t.exportCSV}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleExport('excel')}
                    className="gap-2"
                  >
                    <FileSpreadsheet className="w-4 h-4" />
                    {t.exportExcel}
                  </Button>
                </div>
              </div>

              {leads.length === 0 ? (
                <Card className="border-dashed">
                  <CardContent className="py-12 text-center">
                    <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-semibold mb-2">{t.noLeadsYet}</h3>
                    <p className="text-muted-foreground mb-4">
                      {t.noLeadsDesc}
                    </p>
                    <Button
                      onClick={() => setCurrentView('companies')}
                      style={{ backgroundColor: '#668DF7' }}
                      className="text-white"
                    >
                      {t.searchCompanies}
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4">
                  {leads.map((lead) => (
                    <Card key={lead.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-4">
                            <div
                              className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-semibold"
                              style={{ backgroundColor: '#668DF7' }}
                            >
                              {lead.companyName?.[0] || '?'}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="font-semibold" style={{ color: '#102B51' }}>
                                  {lead.companyName}
                                </h3>
                                <Badge
                                  variant="outline"
                                  className={
                                    lead.status === 'new' ? 'border-blue-500 text-blue-500' :
                                    lead.status === 'contacted' ? 'border-yellow-500 text-yellow-500' :
                                    lead.status === 'qualified' ? 'border-green-500 text-green-500' :
                                    'border-gray-500 text-gray-500'
                                  }
                                >
                                  {lead.status === 'new' ? t.new : lead.status === 'contacted' ? t.contacted : lead.status === 'qualified' ? t.qualified : t.lost}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                                {lead.companyIndustry && (
                                  <span className="flex items-center gap-1">
                                    <Briefcase className="w-3 h-3" />
                                    {lead.companyIndustry}
                                  </span>
                                )}
                                {lead.companyLocation && (
                                  <span className="flex items-center gap-1">
                                    <MapPin className="w-3 h-3" />
                                    {lead.companyLocation}
                                  </span>
                                )}
                                {lead.companySize && (
                                  <span className="flex items-center gap-1">
                                    <Users className="w-3 h-3" />
                                    {lead.companySize} {t.employees}
                                  </span>
                                )}
                              </div>
                              {lead.contactName && (
                                <div className="mt-2 pt-2 border-t">
                                  <p className="text-sm">
                                    <span className="font-medium">{lead.contactName}</span>
                                    {lead.contactTitle && <span className="text-muted-foreground"> • {lead.contactTitle}</span>}
                                  </p>
                                  {lead.contactEmail && (
                                    <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                                      <Mail className="w-3 h-3" />
                                      {lead.contactEmail}
                                    </p>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <select
                              value={lead.status}
                              onChange={(e) => handleUpdateLeadStatus(lead.id, e.target.value)}
                              className="text-sm border rounded px-2 py-1"
                            >
                              <option value="new">{t.new}</option>
                              <option value="contacted">{t.contacted}</option>
                              <option value="qualified">{t.qualified}</option>
                              <option value="lost">{t.lost}</option>
                            </select>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteLead(lead.id)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Companies View */}
          {currentView === 'companies' && (
            <div className="max-w-6xl mx-auto">
              <AdvancedFilters />
              <div className="mb-6 flex gap-2">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder={t.searchCompanies}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch('companies')}
                    className="pl-10"
                  />
                </div>
                <Button
                  onClick={() => handleSearch('companies')}
                  disabled={searchLoading}
                  style={{ backgroundColor: '#102B51' }}
                  className="text-white"
                >
                  {searchLoading ? 'Searching...' : t.searchCompanies}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowFilters(!showFilters)}
                  className="gap-2"
                >
                  <Filter className="w-4 h-4" />
                </Button>
              </div>

              <Tabs defaultValue="companies" className="w-full">
                <TabsList className="grid w-full max-w-md grid-cols-2">
                  <TabsTrigger value="companies">{t.companies}</TabsTrigger>
                  <TabsTrigger value="contacts">{t.myLeads}</TabsTrigger>
                </TabsList>
                <TabsContent value="companies" className="mt-6">
                  {searchResults.length === 0 ? (
                    <Card className="border-dashed">
                      <CardContent className="py-12 text-center">
                        <Building2 className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                        <h3 className="text-lg font-semibold mb-2">{t.searchCompanies}</h3>
                        <p className="text-muted-foreground">
                          Enter a search query to find companies
                        </p>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="grid gap-4">
                      {searchResults.map((company, i) => (
                        <Card key={i} className="hover:shadow-md transition-shadow">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex items-start gap-4">
                                <div
                                  className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-semibold"
                                  style={{ backgroundColor: '#668DF7' }}
                                >
                                  {company.name[0]}
                                </div>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <h3 className="font-semibold" style={{ color: '#102B51' }}>
                                      {company.name}
                                    </h3>
                                    <a
                                      href={company.website}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-muted-foreground hover:text-primary"
                                    >
                                      <ExternalLink className="w-4 h-4" />
                                    </a>
                                  </div>
                                  <p className="text-sm text-muted-foreground">{company.description}</p>
                                  <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                                    <span className="flex items-center gap-1">
                                      <Briefcase className="w-3 h-3" />
                                      {company.industry}
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <MapPin className="w-3 h-3" />
                                      {company.location}
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <Users className="w-3 h-3" />
                                      {company.size}
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <DollarSign className="w-3 h-3" />
                                      {company.revenue}
                                    </span>
                                  </div>
                                  <div className="flex gap-1 mt-2 flex-wrap">
                                    {company.technologies.map((tech) => (
                                      <Badge key={tech} variant="secondary" className="text-xs">
                                        {tech}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              </div>
                              <Button
                                onClick={() => handleSaveLead(company)}
                                size="sm"
                                style={{ backgroundColor: '#668DF7' }}
                                className="text-white"
                              >
                                <Plus className="w-4 h-4 mr-1" />
                                {t.myLeads}
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </TabsContent>
                <TabsContent value="contacts" className="mt-6">
                  {searchContacts.length === 0 ? (
                    <Card className="border-dashed">
                      <CardContent className="py-12 text-center">
                        <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                        <h3 className="text-lg font-semibold mb-2">Search Contacts</h3>
                        <p className="text-muted-foreground">
                          Enter a search query to find contacts
                        </p>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="grid gap-4">
                      {searchContacts.map((contact, i) => (
                        <Card key={i} className="hover:shadow-md transition-shadow">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex items-start gap-4">
                                <Avatar className="w-12 h-12">
                                  <AvatarFallback style={{ backgroundColor: '#668DF7', color: 'white' }}>
                                    {contact.name.split(' ').map(n => n[0]).join('')}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <h3 className="font-semibold" style={{ color: '#102B51' }}>
                                    {contact.name}
                                  </h3>
                                  <p className="text-sm text-muted-foreground">{contact.title}</p>
                                  <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                                    {contact.email && (
                                      <a href={`mailto:${contact.email}`} className="flex items-center gap-1 hover:text-primary">
                                        <Mail className="w-3 h-3" />
                                        {contact.email}
                                      </a>
                                    )}
                                    {contact.phone && (
                                      <span className="flex items-center gap-1">
                                        <Phone className="w-3 h-3" />
                                        {contact.phone}
                                      </span>
                                    )}
                                    {contact.linkedIn && (
                                      <a
                                        href={contact.linkedIn}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-1 hover:text-primary"
                                      >
                                        <Linkedin className="w-3 h-3" />
                                        LinkedIn
                                      </a>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <Button
                                onClick={() => handleSaveLead(MOCK_COMPANIES[i % MOCK_COMPANIES.length], contact)}
                                size="sm"
                                style={{ backgroundColor: '#668DF7' }}
                                className="text-white"
                              >
                                <Plus className="w-4 h-4 mr-1" />
                                {t.myLeads}
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          )}

          {/* Lists View */}
          {currentView === 'lists' && (
            <div className="max-w-4xl mx-auto">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground">{lists.length} lists</p>
                </div>
                <Button
                  onClick={() => setShowNewListModal(true)}
                  style={{ backgroundColor: '#668DF7' }}
                  className="text-white gap-2"
                >
                  <Plus className="w-4 h-4" />
                  New List
                </Button>
              </div>

              {lists.length === 0 ? (
                <Card className="border-dashed">
                  <CardContent className="py-12 text-center">
                    <List className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-semibold mb-2">No lists yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Create lists to organize your leads by campaign, industry, or any criteria.
                    </p>
                    <Button
                      onClick={() => setShowNewListModal(true)}
                      style={{ backgroundColor: '#668DF7' }}
                      className="text-white"
                    >
                      Create First List
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4">
                  {lists.map((list) => (
                    <Card key={list.id} className="hover:shadow-md transition-shadow cursor-pointer">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold" style={{ color: '#102B51' }}>{list.name}</h3>
                            {list.description && (
                              <p className="text-sm text-muted-foreground mt-1">{list.description}</p>
                            )}
                            <p className="text-sm text-muted-foreground mt-2">
                              {list.leads?.length || 0} leads
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteList(list.id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {/* New List Modal */}
              <Dialog open={showNewListModal} onOpenChange={setShowNewListModal}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New List</DialogTitle>
                    <DialogDescription>Organize your leads into custom lists.</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>List Name</Label>
                      <Input
                        placeholder="e.g., Q1 Outreach Campaign"
                        value={newListName}
                        onChange={(e) => setNewListName(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Description (Optional)</Label>
                      <Input
                        placeholder="Brief description of this list"
                        value={newListDescription}
                        onChange={(e) => setNewListDescription(e.target.value)}
                      />
                    </div>
                    <div className="flex gap-2 justify-end">
                      <Button variant="outline" onClick={() => setShowNewListModal(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleCreateList} style={{ backgroundColor: '#102B51' }} className="text-white">
                        Create List
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          )}

          {/* Analytics View */}
          {currentView === 'analytics' && <AnalyticsView />}

          {/* Email Sequences View */}
          {currentView === 'sequences' && <EmailSequencesView />}

          {/* Pricing View */}
          {currentView === 'pricing' && (
            <div className="max-w-5xl mx-auto">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold mb-4" style={{ color: '#102B51' }}>
                  {t.pricingTitle}
                </h2>
                <p className="text-lg" style={{ color: '#1A2B49' }}>
                  {t.pricingSubtitle}
                </p>
              </div>
              <div className="grid md:grid-cols-3 gap-6">
                {PRICING_PLANS.map((plan, index) => (
                  <Card
                    key={index}
                    className={`relative ${plan.popular ? 'border-2' : ''}`}
                    style={{ borderColor: plan.popular ? '#668DF7' : undefined }}
                  >
                    {plan.popular && (
                      <div
                        className="absolute -top-3 left-1/2 transform -translate-x-1/2 px-3 py-1 rounded-full text-sm text-white"
                        style={{ backgroundColor: '#668DF7' }}
                      >
                        {t.mostPopular}
                      </div>
                    )}
                    <CardHeader className="text-center">
                      <CardTitle style={{ color: '#102B51' }}>
                        {plan.name === 'Starter' ? t.starterPlan : plan.name === 'Professional' ? t.professionalPlan : t.enterprisePlan}
                      </CardTitle>
                      <div className="mt-4">
                        <span className="text-4xl font-bold" style={{ color: '#102B51' }}>
                          ${plan.price}
                        </span>
                        {plan.price > 0 && <span className="text-muted-foreground">{t.perMonth}</span>}
                      </div>
                      <p className="text-sm mt-2" style={{ color: '#1A2B49' }}>
                        {formatNumber(plan.credits)} {t.creditsIncluded}
                      </p>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-3">
                        {plan.features.map((feature, i) => (
                          <li key={i} className="flex items-center gap-2" style={{ color: '#1A2B49' }}>
                            <Check className="w-4 h-4" style={{ color: '#10B981' }} />
                            {t[feature as keyof typeof t]}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                    <CardFooter>
                      <Button
                        className="w-full"
                        variant={plan.popular ? 'default' : 'outline'}
                        style={{ backgroundColor: plan.popular ? '#102B51' : undefined }}
                      >
                        {plan.price === 0 ? 'Current Plan' : 'Upgrade'}
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Click outside to close dropdowns */}
      {(showLangDropdown || showNotifications) && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => {
            setShowLangDropdown(false)
            setShowNotifications(false)
          }}
        />
      )}
    </div>
  )
}
