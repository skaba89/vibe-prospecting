import { create } from 'zustand'

export interface EmailTemplate {
  id: string
  name: string
  subject: string
  body: string
  variables: string[]
  createdAt: string
}

export interface Notification {
  id: string
  type: 'info' | 'success' | 'warning' | 'error'
  title: string
  message: string
  read: boolean
  createdAt: string
}

export interface AnalyticsData {
  totalLeads: number
  newLeads: number
  contactedLeads: number
  qualifiedLeads: number
  conversionRate: number
  leadsByIndustry: { industry: string; count: number }[]
  leadsByMonth: { month: string; count: number }[]
  recentActivity: { date: string; action: string; count: number }[]
}

interface FeaturesState {
  // Email Templates
  emailTemplates: EmailTemplate[]
  templatesLoading: boolean
  setEmailTemplates: (templates: EmailTemplate[]) => void
  addEmailTemplate: (template: EmailTemplate) => void
  updateEmailTemplate: (id: string, updates: Partial<EmailTemplate>) => void
  deleteEmailTemplate: (id: string) => void
  setTemplatesLoading: (loading: boolean) => void
  
  // Notifications
  notifications: Notification[]
  unreadCount: number
  addNotification: (notification: Omit<Notification, 'id' | 'read' | 'createdAt'>) => void
  markNotificationRead: (id: string) => void
  markAllNotificationsRead: () => void
  clearNotifications: () => void
  
  // Analytics
  analytics: AnalyticsData | null
  analyticsLoading: boolean
  setAnalytics: (data: AnalyticsData) => void
  setAnalyticsLoading: (loading: boolean) => void
  
  // Filters
  filters: {
    industry: string
    companySize: string
    revenue: string
    location: string
    technology: string
  }
  setFilters: (filters: Partial<FeaturesState['filters']>) => void
  clearFilters: () => void
  
  // Show notifications panel
  showNotifications: boolean
  setShowNotifications: (show: boolean) => void
}

export const useFeaturesStore = create<FeaturesState>((set) => ({
  // Email Templates
  emailTemplates: [],
  templatesLoading: false,
  setEmailTemplates: (templates) => set({ emailTemplates: templates }),
  addEmailTemplate: (template) => set((state) => ({ 
    emailTemplates: [template, ...state.emailTemplates] 
  })),
  updateEmailTemplate: (id, updates) => set((state) => ({
    emailTemplates: state.emailTemplates.map((t) =>
      t.id === id ? { ...t, ...updates } : t
    )
  })),
  deleteEmailTemplate: (id) => set((state) => ({
    emailTemplates: state.emailTemplates.filter((t) => t.id !== id)
  })),
  setTemplatesLoading: (loading) => set({ templatesLoading: loading }),

  // Notifications
  notifications: [
    {
      id: '1',
      type: 'info',
      title: 'Nouveau prospect trouvé',
      message: '5 nouveaux prospects correspondent à vos critères',
      read: false,
      createdAt: new Date().toISOString()
    },
    {
      id: '2',
      type: 'success',
      title: 'Export terminé',
      message: 'Votre export CSV est prêt',
      read: false,
      createdAt: new Date(Date.now() - 3600000).toISOString()
    }
  ],
  unreadCount: 2,
  addNotification: (notification) => set((state) => ({
    notifications: [
      {
        ...notification,
        id: Math.random().toString(36).substring(7),
        read: false,
        createdAt: new Date().toISOString()
      },
      ...state.notifications
    ],
    unreadCount: state.unreadCount + 1
  })),
  markNotificationRead: (id) => set((state) => ({
    notifications: state.notifications.map((n) =>
      n.id === id ? { ...n, read: true } : n
    ),
    unreadCount: Math.max(0, state.unreadCount - 1)
  })),
  markAllNotificationsRead: () => set((state) => ({
    notifications: state.notifications.map((n) => ({ ...n, read: true })),
    unreadCount: 0
  })),
  clearNotifications: () => set({ notifications: [], unreadCount: 0 }),

  // Analytics
  analytics: null,
  analyticsLoading: false,
  setAnalytics: (data) => set({ analytics: data }),
  setAnalyticsLoading: (loading) => set({ analyticsLoading: loading }),

  // Filters
  filters: {
    industry: '',
    companySize: '',
    revenue: '',
    location: '',
    technology: ''
  },
  setFilters: (filters) => set((state) => ({
    filters: { ...state.filters, ...filters }
  })),
  clearFilters: () => set({
    filters: {
      industry: '',
      companySize: '',
      revenue: '',
      location: '',
      technology: ''
    }
  }),

  // Show notifications
  showNotifications: false,
  setShowNotifications: (show) => set({ showNotifications: show })
}))
