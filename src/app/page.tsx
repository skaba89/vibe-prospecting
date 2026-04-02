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
  Check, Sparkles, Target, Zap, ChevronRight, Star,
  Bot, User, Briefcase, MapPin, Globe, DollarSign, Clock, TrendingUp,
  Download, FileSpreadsheet, Bell, Filter, BarChart3, MailPlus,
  Languages, ChevronDown, XCircle, PieChart, Activity, Landmark,
  Flag, Building, FileText, Handshake
} from 'lucide-react'
import { 
  AFRICAN_COUNTRIES, 
  AFRICAN_INDUSTRIES, 
  GOVERNMENT_CONTACTS,
  AFRICAN_COMMUNITIES,
  GOVERNMENT_STRUCTURES
} from '@/lib/african-data'
import { 
  AFRICAN_COMPANIES_EXTENDED,
  AFRICAN_CONTACTS_EXTENDED,
  AFRICAN_ORGANIZATIONS,
  AFRICAN_STARTUPS
} from '@/lib/african-companies'

// Format number with commas
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

export default function Home() {
  const { user, isAuthenticated, login, signup, logout, checkAuth, isLoading, error, setError } = useAuthStore()
  const {
    currentView, setCurrentView,
    chatMessages, chatLoading, addChatMessage, setChatLoading, clearChat,
    leads, setLeads, addLead, updateLead, deleteLead, leadsLoading, setLeadsLoading,
    lists, setLists, addList, deleteList, listsLoading, setListsLoading,
    searchResults, setSearchResults, searchContacts, setSearchContacts, searchLoading, setSearchLoading,
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
  
  // African market filters
  const [selectedCountry, setSelectedCountry] = useState<string>('')
  const [selectedSector, setSelectedSector] = useState<string>('')
  const [selectedIndustry, setSelectedIndustry] = useState<string>('')
  const [searchType, setSearchType] = useState<'companies' | 'government' | 'ministries' | 'contacts'>('companies')

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

  const handleAfricanSearch = () => {
    setSearchLoading(true)
    
    let results: any[] = []
    
    // Combine all data sources
    const allCompanies = [...AFRICAN_COMPANIES_EXTENDED, ...AFRICAN_STARTUPS]
    const allContacts = AFRICAN_CONTACTS_EXTENDED
    const allOrganizations = AFRICAN_ORGANIZATIONS
    
    if (searchType === 'companies') {
      results = allCompanies.filter(company => {
        const matchCountry = !selectedCountry || company.country === selectedCountry
        const matchIndustry = !selectedIndustry || company.industry?.includes(selectedIndustry)
        const matchSector = !selectedSector || company.sector?.includes(selectedSector)
        const matchQuery = !searchQuery || 
          company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          company.industry?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          company.sector?.toLowerCase().includes(searchQuery.toLowerCase())
        return matchCountry && matchIndustry && matchSector && matchQuery
      })
      setSearchResults(results)
    } else if (searchType === 'government' || searchType === 'ministries') {
      // Combine government contacts and organizations
      const govResults = [...GOVERNMENT_CONTACTS, ...allOrganizations].filter(contact => {
        const matchCountry = !selectedCountry || contact.country === selectedCountry
        const matchType = searchType === 'government' 
          ? (contact.type === 'government' || contact.type === 'organization')
          : searchType === 'ministries' 
            ? contact.type === 'ministry'
            : true
        const matchQuery = !searchQuery || 
          contact.name.toLowerCase().includes(searchQuery.toLowerCase())
        return matchCountry && matchType && matchQuery
      })
      setSearchResults(govResults)
    } else if (searchType === 'contacts') {
      const contactResults = allContacts.filter(contact => {
        const matchCountry = !selectedCountry || contact.country === selectedCountry
        const matchQuery = !searchQuery || 
          contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          contact.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
          contact.title?.toLowerCase().includes(searchQuery.toLowerCase())
        return matchCountry && matchQuery
      })
      setSearchContacts(contactResults.map(c => ({
        name: c.name,
        title: c.title,
        email: c.email,
        phone: c.phone,
        linkedIn: c.linkedIn,
        photo: null
      })))
    }
    
    setTimeout(() => setSearchLoading(false), 500)
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

  const handleSaveAfricanCompany = async (company: typeof AFRICAN_COMPANIES[0]) => {
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
          status: 'new'
        })
      })

      const data = await response.json()
      if (response.ok) {
        addLead(data.lead)
        addNotification({
          type: 'success',
          title: 'Lead sauvegardé',
          message: `${company.name} a été ajouté à vos prospects`
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
          message: `${leads.length} leads exportés`
        })
      }
    } catch (error) {
      console.error('Export failed:', error)
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

  // Get industries for selected sector
  const getIndustriesForSector = (sectorKey: string) => {
    const sector = AFRICAN_INDUSTRIES[sectorKey as keyof typeof AFRICAN_INDUSTRIES]
    return sector ? sector.subsectors : []
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
            { code: 'en' as const, label: 'English' },
            { code: 'fr' as const, label: 'Français' },
            { code: 'es' as const, label: 'Español' },
            { code: 'de' as const, label: 'Deutsch' },
            { code: 'pt' as const, label: 'Português' },
            { code: 'it' as const, label: 'Italiano' }
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

  // African Market View
  const AfricanMarketView = () => (
    <div className="max-w-7xl mx-auto">
      {/* Search Type Tabs */}
      <div className="mb-6">
        <Tabs value={searchType} onValueChange={(v) => setSearchType(v as typeof searchType)}>
          <TabsList className="grid w-full max-w-2xl grid-cols-4">
            <TabsTrigger value="companies" className="gap-2">
              <Building2 className="w-4 h-4" />
              Entreprises
            </TabsTrigger>
            <TabsTrigger value="government" className="gap-2">
              <Landmark className="w-4 h-4" />
              Gouvernements
            </TabsTrigger>
            <TabsTrigger value="ministries" className="gap-2">
              <Building className="w-4 h-4" />
              Ministères
            </TabsTrigger>
            <TabsTrigger value="contacts" className="gap-2">
              <Users className="w-4 h-4" />
              Contacts
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label className="text-sm flex items-center gap-2">
                <Flag className="w-4 h-4" />
                Pays
              </Label>
              <select
                value={selectedCountry}
                onChange={(e) => setSelectedCountry(e.target.value)}
                className="w-full mt-1 border rounded-lg px-3 py-2 text-sm"
              >
                <option value="">Tous les pays</option>
                {AFRICAN_COUNTRIES.map((country) => (
                  <option key={country.code} value={country.code}>
                    {country.flag} {country.name}
                  </option>
                ))}
              </select>
            </div>
            
            {searchType === 'companies' && (
              <>
                <div>
                  <Label className="text-sm flex items-center gap-2">
                    <Briefcase className="w-4 h-4" />
                    Secteur
                  </Label>
                  <select
                    value={selectedSector}
                    onChange={(e) => {
                      setSelectedSector(e.target.value)
                      setSelectedIndustry('')
                    }}
                    className="w-full mt-1 border rounded-lg px-3 py-2 text-sm"
                  >
                    <option value="">Tous les secteurs</option>
                    {Object.entries(AFRICAN_INDUSTRIES).map(([key, sector]) => (
                      <option key={key} value={key}>{sector.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label className="text-sm">Industrie</Label>
                  <select
                    value={selectedIndustry}
                    onChange={(e) => setSelectedIndustry(e.target.value)}
                    className="w-full mt-1 border rounded-lg px-3 py-2 text-sm"
                    disabled={!selectedSector}
                  >
                    <option value="">Toutes les industries</option>
                    {selectedSector && getIndustriesForSector(selectedSector).map((ind) => (
                      <option key={ind} value={ind}>{ind}</option>
                    ))}
                  </select>
                </div>
              </>
            )}
            
            <div>
              <Label className="text-sm flex items-center gap-2">
                <Search className="w-4 h-4" />
                Recherche
              </Label>
              <Input
                placeholder="Nom, mot-clé..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAfricanSearch()}
                className="mt-1"
              />
            </div>
          </div>
          
          <div className="flex gap-2 mt-4 justify-end">
            <Button 
              variant="outline" 
              onClick={() => {
                setSelectedCountry('')
                setSelectedSector('')
                setSelectedIndustry('')
                setSearchQuery('')
                setSearchResults([])
                setSearchContacts([])
              }}
            >
              Réinitialiser
            </Button>
            <Button 
              onClick={handleAfricanSearch}
              disabled={searchLoading}
              style={{ backgroundColor: '#102B51' }}
              className="text-white"
            >
              {searchLoading ? 'Recherche...' : 'Rechercher'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {searchType === 'companies' && (
        <div className="grid gap-4">
          {searchResults.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="py-12 text-center">
                <Building2 className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">Recherchez des entreprises africaines</h3>
                <p className="text-muted-foreground">
                  Utilisez les filtres pour trouver des entreprises par pays, secteur et industrie
                </p>
              </CardContent>
            </Card>
          ) : (
            searchResults.map((company, i) => (
              <Card key={i} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div
                        className="w-14 h-14 rounded-lg flex items-center justify-center text-white font-semibold text-lg"
                        style={{ backgroundColor: '#668DF7' }}
                      >
                        {AFRICAN_COUNTRIES.find(c => c.code === company.country)?.flag || '🌍'}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-lg" style={{ color: '#102B51' }}>
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
                        <p className="text-sm text-muted-foreground mt-1">{company.description}</p>
                        <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground flex-wrap">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {company.location}
                          </span>
                          <span className="flex items-center gap-1">
                            <Briefcase className="w-3 h-3" />
                            {company.industry} - {company.sector}
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
                          {company.technologies?.map((tech: string) => (
                            <Badge key={tech} variant="secondary" className="text-xs">
                              {tech}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                    <Button
                      onClick={() => handleSaveAfricanCompany(company)}
                      size="sm"
                      style={{ backgroundColor: '#668DF7' }}
                      className="text-white shrink-0"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Ajouter
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {searchType === 'government' && (
        <div className="grid gap-4">
          {searchResults.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="py-12 text-center">
                <Landmark className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">Institutions gouvernementales africaines</h3>
                <p className="text-muted-foreground">
                  Trouvez les institutions gouvernementales par pays
                </p>
              </CardContent>
            </Card>
          ) : (
            searchResults.map((gov, i) => (
              <Card key={i} className="hover:shadow-md transition-shadow border-l-4 border-l-blue-500">
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-lg bg-blue-100 flex items-center justify-center">
                      <Landmark className="w-7 h-7 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-lg" style={{ color: '#102B51' }}>{gov.name}</h3>
                        <Badge variant="outline" className="bg-blue-50">{gov.category}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{gov.description}</p>
                      <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground flex-wrap">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {gov.address}
                        </span>
                        {gov.phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            {gov.phone}
                          </span>
                        )}
                        {gov.email && (
                          <span className="flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            <a href={`mailto:${gov.email}`} className="hover:text-primary">{gov.email}</a>
                          </span>
                        )}
                      </div>
                      {gov.website && (
                        <a 
                          href={gov.website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 mt-2 text-sm text-blue-600 hover:underline"
                        >
                          <Globe className="w-3 h-3" />
                          {gov.website}
                        </a>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {searchType === 'ministries' && (
        <div className="grid gap-4">
          {searchResults.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="py-12 text-center">
                <Building className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">Ministères africains</h3>
                <p className="text-muted-foreground">
                  Accédez aux différents ministères par pays
                </p>
              </CardContent>
            </Card>
          ) : (
            searchResults.map((ministry, i) => (
              <Card key={i} className="hover:shadow-md transition-shadow border-l-4 border-l-green-500">
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-lg bg-green-100 flex items-center justify-center">
                      <Building className="w-7 h-7 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-lg" style={{ color: '#102B51' }}>{ministry.name}</h3>
                        <Badge variant="outline" className="bg-green-50">{ministry.category}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{ministry.description}</p>
                      <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground flex-wrap">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {ministry.address}
                        </span>
                        {ministry.phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            {ministry.phone}
                          </span>
                        )}
                        {ministry.email && (
                          <span className="flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            <a href={`mailto:${ministry.email}`} className="hover:text-primary">{ministry.email}</a>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {searchType === 'contacts' && (
        <div className="grid gap-4 md:grid-cols-2">
          {searchContacts.length === 0 ? (
            <Card className="border-dashed col-span-2">
              <CardContent className="py-12 text-center">
                <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">Contacts professionnels africains</h3>
                <p className="text-muted-foreground">
                  Trouvez des décideurs et contacts clés en Afrique
                </p>
              </CardContent>
            </Card>
          ) : (
            searchContacts.map((contact, i) => (
              <Card key={i} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <Avatar className="w-14 h-14">
                      <AvatarFallback style={{ backgroundColor: '#668DF7', color: 'white' }} className="text-lg">
                        {contact.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h3 className="font-semibold" style={{ color: '#102B51' }}>{contact.name}</h3>
                      <p className="text-sm text-muted-foreground">{contact.title}</p>
                      <p className="text-sm font-medium mt-1">{AFRICAN_CONTACTS[i]?.company}</p>
                      <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground">
                        {contact.email && (
                          <a href={`mailto:${contact.email}`} className="flex items-center gap-1 hover:text-primary">
                            <Mail className="w-3 h-3" />
                            {contact.email}
                          </a>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                        {contact.phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            {contact.phone}
                          </span>
                        )}
                        {contact.linkedIn && (
                          <a href={contact.linkedIn} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-primary">
                            <Linkedin className="w-3 h-3" />
                            LinkedIn
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Regional Communities */}
      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-4" style={{ color: '#102B51' }}>
          <Handshake className="w-5 h-5 inline mr-2" />
          Communautés Économiques Régionales
        </h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {AFRICAN_COMMUNITIES.map((community) => (
            <Card key={community.name} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-4">
                <h4 className="font-semibold" style={{ color: '#102B51' }}>{community.name}</h4>
                <p className="text-xs text-muted-foreground mt-1">{community.fullName}</p>
                <div className="mt-2 text-sm">
                  <span className="text-muted-foreground">Siège: </span>
                  {community.headquarters}
                </div>
                <div className="mt-2">
                  <span className="text-xs text-muted-foreground">Membres: </span>
                  <span className="text-xs">
                    {community.members === 'all' 
                      ? 'Tous les pays africains'
                      : `${community.members.length} pays`
                    }
                  </span>
                </div>
                <a 
                  href={community.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 mt-2 text-sm text-blue-600 hover:underline"
                >
                  <Globe className="w-3 h-3" />
                  Site web
                </a>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
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

        {/* African Market Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Flag className="w-5 h-5" style={{ color: '#668DF7' }} />
                Répartition par Pays
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {['Guinée', 'Sénégal', 'Côte d\'Ivoire', 'Nigeria', 'Ghana', 'Autres'].map((country, i) => {
                  const percentage = [30, 20, 15, 15, 10, 10][i]
                  return (
                    <div key={country} className="flex items-center gap-3">
                      <div className="w-24 text-sm">{country}</div>
                      <div className="flex-1 bg-gray-100 rounded-full h-2">
                        <div 
                          className="h-2 rounded-full" 
                          style={{ width: `${percentage}%`, backgroundColor: '#668DF7' }}
                        />
                      </div>
                      <span className="text-sm text-muted-foreground w-10">{percentage}%</span>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="w-5 h-5" style={{ color: '#668DF7' }} />
                Secteurs les plus prospectés
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {['Mines', 'Télécoms', 'Banque', 'Énergie', 'Agriculture'].map((sector, i) => {
                  const count = [45, 32, 28, 22, 18][i]
                  const maxCount = 45
                  return (
                    <div key={sector} className="flex items-center gap-3">
                      <div className="w-24 text-sm">{sector}</div>
                      <div className="flex-1 bg-gray-100 rounded-full h-4">
                        <div 
                          className="h-4 rounded-full flex items-center justify-end pr-2 text-xs text-white font-medium" 
                          style={{ width: `${(count/maxCount)*100}%`, backgroundColor: '#102B51', minWidth: '40px' }}
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
              Créez des modèles d'emails pour vos campagnes de prospection.
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
            <DialogDescription>Créez un nouveau modèle d'email pour votre prospection.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Nom du template</Label>
              <Input
                placeholder="Ex: Premier contact gouvernement"
                value={newTemplate.name}
                onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
              />
            </div>
            <div>
              <Label>{t.subject}</Label>
              <Input
                placeholder="Ex: Opportunité de partenariat - {{company_name}}"
                value={newTemplate.subject}
                onChange={(e) => setNewTemplate({ ...newTemplate, subject: e.target.value })}
              />
            </div>
            <div>
              <Label>{t.body}</Label>
              <Textarea
                placeholder="Excellence Monsieur le Ministre,

Je suis..."
                value={newTemplate.body}
                onChange={(e) => setNewTemplate({ ...newTemplate, body: e.target.value })}
                rows={6}
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowTemplateModal(false)}>
                Annuler
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

  // Leads View
  const LeadsView = () => (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-muted-foreground">{leads.length} {t.leadsSaved}</p>
        </div>
        <div className="flex gap-2">
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
              onClick={() => setCurrentView('africa')}
              style={{ backgroundColor: '#668DF7' }}
              className="text-white"
            >
              Explorer le marché africain
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
              <Badge className="ml-2 bg-green-500 text-white text-xs">Afrique</Badge>
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
        <section className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex justify-center gap-2 mb-4">
              <Badge style={{ backgroundColor: '#668DF7', color: 'white' }}>
                <Sparkles className="w-3 h-3 mr-1" /> {t.heroBadge}
              </Badge>
              <Badge className="bg-green-500 text-white">
                🌍 Marché Africain
              </Badge>
            </div>
            <h1 className="text-5xl font-bold mb-6" style={{ color: '#102B51' }}>
              Prospectez le Marché Africain<br />
              <span style={{ color: '#668DF7' }}>Avec l'IA</span>
            </h1>
            <p className="text-xl mb-8" style={{ color: '#1A2B49' }}>
              Trouvez des entreprises, gouvernements et ministères à travers toute l'Afrique.
              De la Guinée au Nigeria, du Sénégal à l'Afrique du Sud.
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

        {/* African Markets Section */}
        <section className="container mx-auto px-4 py-12">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4" style={{ color: '#102B51' }}>
              Couverture du Marché Africain
            </h2>
            <p className="text-lg" style={{ color: '#1A2B49' }}>
              Accédez à des milliers d'entreprises et institutions dans 30+ pays africains
            </p>
          </div>
          
          <div className="grid md:grid-cols-5 gap-4 mb-8">
            <Card className="text-center">
              <CardContent className="pt-6">
                <p className="text-4xl font-bold" style={{ color: '#668DF7' }}>30+</p>
                <p className="text-muted-foreground">Pays couverts</p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="pt-6">
                <p className="text-4xl font-bold" style={{ color: '#668DF7' }}>200+</p>
                <p className="text-muted-foreground">Entreprises</p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="pt-6">
                <p className="text-4xl font-bold" style={{ color: '#668DF7' }}>50+</p>
                <p className="text-muted-foreground">Startups Tech</p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="pt-6">
                <p className="text-4xl font-bold" style={{ color: '#668DF7' }}>500+</p>
                <p className="text-muted-foreground">Ministères</p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="pt-6">
                <p className="text-4xl font-bold" style={{ color: '#668DF7' }}>20+</p>
                <p className="text-muted-foreground">Secteurs</p>
              </CardContent>
            </Card>
          </div>

          <div className="flex flex-wrap gap-2 justify-center">
            {AFRICAN_COUNTRIES.slice(0, 15).map((country) => (
              <Badge key={country.code} variant="outline" className="text-sm py-1 px-3">
                {country.flag} {country.name}
              </Badge>
            ))}
            <Badge variant="secondary" className="text-sm py-1 px-3">
              +15 autres pays
            </Badge>
          </div>
        </section>

        {/* Sectors Section */}
        <section className="container mx-auto px-4 py-12 bg-white rounded-xl">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4" style={{ color: '#102B51' }}>
              Tous les Secteurs d'Activité
            </h2>
            <p className="text-lg" style={{ color: '#1A2B49' }}>
              Des mines aux télécoms, de l'agriculture à la finance
            </p>
          </div>
          
          <div className="grid md:grid-cols-4 gap-4">
            {Object.entries(AFRICAN_INDUSTRIES).slice(0, 12).map(([key, sector]) => (
              <Card key={key} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-4">
                  <h3 className="font-semibold" style={{ color: '#102B51' }}>{sector.name}</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    {sector.subsectors.length} sous-secteurs
                  </p>
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
            <p className="text-sm mt-2 text-white/60">Spécialisé pour le marché africain 🌍</p>
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
            <div className="flex items-center gap-1">
              <span className="text-lg font-bold text-white">Vibe</span>
              <Badge className="bg-green-500 text-white text-xs">Africa</Badge>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-2 space-y-1">
          {[
            { id: 'africa', icon: Globe, labelKey: 'Marché Africain' },
            { id: 'chat', icon: MessageSquare, labelKey: t.aiChat },
            { id: 'leads', icon: Users, labelKey: t.myLeads },
            { id: 'lists', icon: List, labelKey: t.leadLists },
            { id: 'analytics', icon: BarChart3, labelKey: t.analytics },
            { id: 'sequences', icon: MailPlus, labelKey: t.emailSequences }
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
              {!sidebarCollapsed && <span>{item.labelKey}</span>}
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
            {currentView === 'africa' && '🌍 Marché Africain'}
            {currentView === 'chat' && t.aiProspectingAssistant}
            {currentView === 'leads' && t.myLeads}
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
          {currentView === 'africa' && <AfricanMarketView />}
          {currentView === 'chat' && (
            <div className="h-full flex flex-col max-w-4xl mx-auto">
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
                      {[
                        'Entreprises minières en Guinée',
                        'Ministères des finances en Afrique de l\'Ouest',
                        'Startups tech au Nigeria'
                      ].map((suggestion, i) => (
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
          {currentView === 'leads' && <LeadsView />}
          {currentView === 'lists' && (
            <div className="max-w-4xl mx-auto">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground">{lists.length} listes</p>
                </div>
                <Button
                  onClick={() => setShowNewListModal(true)}
                  style={{ backgroundColor: '#668DF7' }}
                  className="text-white gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Nouvelle Liste
                </Button>
              </div>
              {lists.length === 0 ? (
                <Card className="border-dashed">
                  <CardContent className="py-12 text-center">
                    <List className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-semibold mb-2">Pas encore de listes</h3>
                    <p className="text-muted-foreground mb-4">
                      Créez des listes pour organiser vos prospects.
                    </p>
                    <Button
                      onClick={() => setShowNewListModal(true)}
                      style={{ backgroundColor: '#668DF7' }}
                      className="text-white"
                    >
                      Créer une liste
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4">
                  {lists.map((list) => (
                    <Card key={list.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold" style={{ color: '#102B51' }}>{list.name}</h3>
                            {list.description && (
                              <p className="text-sm text-muted-foreground mt-1">{list.description}</p>
                            )}
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
              <Dialog open={showNewListModal} onOpenChange={setShowNewListModal}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Créer une nouvelle liste</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>Nom de la liste</Label>
                      <Input
                        placeholder="Ex: Prospects Guinée Mines"
                        value={newListName}
                        onChange={(e) => setNewListName(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Description</Label>
                      <Input
                        placeholder="Description optionnelle"
                        value={newListDescription}
                        onChange={(e) => setNewListDescription(e.target.value)}
                      />
                    </div>
                    <div className="flex gap-2 justify-end">
                      <Button variant="outline" onClick={() => setShowNewListModal(false)}>
                        Annuler
                      </Button>
                      <Button onClick={handleCreateList} style={{ backgroundColor: '#102B51' }} className="text-white">
                        Créer
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          )}
          {currentView === 'analytics' && <AnalyticsView />}
          {currentView === 'sequences' && <EmailSequencesView />}
          {currentView === 'pricing' && (
            <div className="max-w-5xl mx-auto">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold mb-4" style={{ color: '#102B51' }}>
                  {t.pricingTitle}
                </h2>
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
                    <CardFooter>
                      <Button
                        className="w-full"
                        variant={plan.popular ? 'default' : 'outline'}
                        style={{ backgroundColor: plan.popular ? '#102B51' : undefined }}
                      >
                        {plan.price === 0 ? 'Plan actuel' : 'Évoluer'}
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
