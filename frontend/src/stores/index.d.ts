declare module '@/stores/settings' {
  interface BasicSettings {
    siteTitle: string
    siteDescription: string
    siteLogo: string
    postsPerPage: number
    theme: string
    carouselEnabled: boolean
    carouselApiUrl: string
    carouselImageCount: number
    carouselInterval: number
    icp: string
    startYear: number
    footerText: string
    footerLinks: Array<{ name: string; url: string }>
  }

  interface ProfileSettings {
    avatar: string
    nickname: string
    bio: string
    email: string
    socialLinks: Array<{ name: string; url: string; icon: string }>
  }

  interface AdvancedSettings {
    analytics: {
      enabled: boolean
      type: string
      id: string
      script: string
    }
    customHead: string
    customFooter: string
    seo: {
      keywords: string
      description: string
      robots: string
    }
    cdn: {
      enabled: boolean
      url: string
    }
  }

  export function useSettingsStore(): {
    basicSettings: BasicSettings
    profileSettings: ProfileSettings
    advancedSettings: AdvancedSettings
    loaded: boolean
    getBasicSettings(): BasicSettings
    saveBasicSettings(settings: Partial<BasicSettings>): boolean
    getProfileSettings(): ProfileSettings
    saveProfileSettings(settings: Partial<ProfileSettings>): boolean
    getAdvancedSettings(): AdvancedSettings
    saveAdvancedSettings(settings: Partial<AdvancedSettings>): boolean
    loadSettingsFromStorage(): void
  }
} 