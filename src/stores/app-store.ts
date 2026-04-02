import { create } from 'zustand'

export type ViewType = 'chat' | 'leads' | 'companies' | 'lists' | 'pricing'

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export interface Lead {
  id: string
  companyName: string | null
  companyDomain: string | null
  companyIndustry: string | null
  companySize: string | null
  companyRevenue: string | null
  companyLocation: string | null
  companyWebsite: string | null
  companyLogo: string | null
  companyTech: string | null
  contactName: string | null
  contactTitle: string | null
  contactEmail: string | null
  contactPhone: string | null
  contactLinkedIn: string | null
  contactPhoto: string | null
  intent: string | null
  notes: string | null
  status: string
  listId: string | null
  createdAt: string
}

export interface LeadList {
  id: string
  name: string
  description: string | null
  leads: Lead[]
  createdAt: string
}

export interface Company {
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
}

export interface Contact {
  name: string
  title: string
  email: string | null
  phone: string | null
  linkedIn: string | null
  photo: string | null
}

interface AppState {
  // Navigation
  currentView: ViewType
  setCurrentView: (view: ViewType) => void
  
  // Chat
  chatMessages: ChatMessage[]
  chatLoading: boolean
  currentChatId: string | null
  addChatMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => void
  setChatLoading: (loading: boolean) => void
  setCurrentChatId: (id: string | null) => void
  clearChat: () => void
  
  // Leads
  leads: Lead[]
  leadsLoading: boolean
  setLeads: (leads: Lead[]) => void
  addLead: (lead: Lead) => void
  updateLead: (id: string, updates: Partial<Lead>) => void
  deleteLead: (id: string) => void
  setLeadsLoading: (loading: boolean) => void
  
  // Lists
  lists: LeadList[]
  listsLoading: boolean
  setLists: (lists: LeadList[]) => void
  addList: (list: LeadList) => void
  updateList: (id: string, updates: Partial<LeadList>) => void
  deleteList: (id: string) => void
  setListsLoading: (loading: boolean) => void
  
  // Search Results
  searchResults: Company[]
  searchContacts: Contact[]
  searchLoading: boolean
  setSearchResults: (results: Company[]) => void
  setSearchContacts: (contacts: Contact[]) => void
  setSearchLoading: (loading: boolean) => void
  
  // Selected items
  selectedLead: Lead | null
  selectedList: LeadList | null
  setSelectedLead: (lead: Lead | null) => void
  setSelectedList: (list: LeadList | null) => void
  
  // Modals
  showLoginModal: boolean
  showSignupModal: boolean
  showNewListModal: boolean
  setShowLoginModal: (show: boolean) => void
  setShowSignupModal: (show: boolean) => void
  setShowNewListModal: (show: boolean) => void
  
  // Sidebar
  sidebarCollapsed: boolean
  setSidebarCollapsed: (collapsed: boolean) => void
}

export const useAppStore = create<AppState>((set) => ({
  // Navigation
  currentView: 'chat',
  setCurrentView: (view) => set({ currentView: view }),

  // Chat
  chatMessages: [],
  chatLoading: false,
  currentChatId: null,
  addChatMessage: (message) => set((state) => ({
    chatMessages: [
      ...state.chatMessages,
      {
        ...message,
        id: Math.random().toString(36).substring(7),
        timestamp: new Date()
      }
    ]
  })),
  setChatLoading: (loading) => set({ chatLoading: loading }),
  setCurrentChatId: (id) => set({ currentChatId: id }),
  clearChat: () => set({ chatMessages: [], currentChatId: null }),

  // Leads
  leads: [],
  leadsLoading: false,
  setLeads: (leads) => set({ leads }),
  addLead: (lead) => set((state) => ({ leads: [lead, ...state.leads] })),
  updateLead: (id, updates) => set((state) => ({
    leads: state.leads.map((lead) =>
      lead.id === id ? { ...lead, ...updates } : lead
    )
  })),
  deleteLead: (id) => set((state) => ({
    leads: state.leads.filter((lead) => lead.id !== id)
  })),
  setLeadsLoading: (loading) => set({ leadsLoading: loading }),

  // Lists
  lists: [],
  listsLoading: false,
  setLists: (lists) => set({ lists }),
  addList: (list) => set((state) => ({ lists: [list, ...state.lists] })),
  updateList: (id, updates) => set((state) => ({
    lists: state.lists.map((list) =>
      list.id === id ? { ...list, ...updates } : list
    )
  })),
  deleteList: (id) => set((state) => ({
    lists: state.lists.filter((list) => list.id !== id)
  })),
  setListsLoading: (loading) => set({ listsLoading: loading }),

  // Search Results
  searchResults: [],
  searchContacts: [],
  searchLoading: false,
  setSearchResults: (results) => set({ searchResults: results }),
  setSearchContacts: (contacts) => set({ searchContacts: contacts }),
  setSearchLoading: (loading) => set({ searchLoading: loading }),

  // Selected items
  selectedLead: null,
  selectedList: null,
  setSelectedLead: (lead) => set({ selectedLead: lead }),
  setSelectedList: (list) => set({ selectedList: list }),

  // Modals
  showLoginModal: false,
  showSignupModal: false,
  showNewListModal: false,
  setShowLoginModal: (show) => set({ showLoginModal: show, showSignupModal: false }),
  setShowSignupModal: (show) => set({ showSignupModal: show, showLoginModal: false }),
  setShowNewListModal: (show) => set({ showNewListModal: show }),

  // Sidebar
  sidebarCollapsed: false,
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed })
}))
