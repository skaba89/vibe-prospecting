import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Language, translations, type Translations } from '@/lib/i18n/translations'

interface LocaleState {
  language: Language
  t: Translations
  setLanguage: (lang: Language) => void
}

export const useLocaleStore = create<LocaleState>()(
  persist(
    (set) => ({
      language: 'fr', // Default to French
      t: translations.fr,
      setLanguage: (lang) => set({ 
        language: lang, 
        t: translations[lang] 
      })
    }),
    {
      name: 'vibe-locale-storage',
      partialize: (state) => ({ 
        language: state.language 
      }),
      onRehydrateStorage: () => (state) => {
        // On rehydration, update the translations based on saved language
        if (state) {
          state.t = translations[state.language]
        }
      }
    }
  )
)
