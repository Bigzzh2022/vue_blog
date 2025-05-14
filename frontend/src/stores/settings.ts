import { defineStore } from 'pinia'
import { settingsService } from '@/services/settingsService'

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
  icp: string              // 备案号
  startYear: number        // 网站创建年份（用于版权年份计算）
  footerText: string       // 底部文本信息
  footerLinks: Array<{ name: string; url: string }> // 底部链接
}

interface ProfileSettings {
  avatar: string
  nickname: string
  bio: string
  email: string
  socialLinks: Array<{ name: string; url: string; icon: string }> // 添加图标字段
}

interface AdvancedSettings {
  analytics: {
    enabled: boolean
    type: string  // 'baidu' | 'google' | 'cnzz' | 'custom'
    id: string
    script: string
  }
  customHead: string // 自定义head代码
  customFooter: string // 自定义底部代码
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

export const useSettingsStore = defineStore('settings', {
  state: () => ({
    basicSettings: {
      siteTitle: '渐开线的小窝',
      siteDescription: '给时光以生命，给岁月以文明',
      siteLogo: '',
      postsPerPage: 10,
      theme: 'light',
      carouselEnabled: false,
      carouselApiUrl: 'https://api.yimian.xyz/img?type=wallpaper',
      carouselImageCount: 5,
      carouselInterval: 5,
      icp: '京ICP备XXXXXXXX号',
      startYear: 2023,
      footerText: '感谢您的访问',
      footerLinks: [
        { name: '关于我', url: '/about' },
        { name: '隐私政策', url: '/privacy' }
      ]
    } as BasicSettings,
    
    profileSettings: {
      avatar: '',
      nickname: '渐开线',
      bio: '千万不要因为走得太久，而忘记了我们为什么出发',
      email: 'example@example.com',
      socialLinks: [
        { name: '微信', url: '#', icon: 'wechat' },
        { name: 'GitHub', url: 'https://github.com', icon: 'github' },
        { name: '哔哩哔哩', url: 'https://bilibili.com', icon: 'bilibili' },
        { name: '知乎', url: 'https://zhihu.com', icon: 'zhihu' }
      ]
    } as ProfileSettings,
    
    advancedSettings: {
      analytics: {
        enabled: false,
        type: 'google',
        id: '',
        script: ''
      },
      customHead: '',
      customFooter: '',
      seo: {
        keywords: '博客,技术,生活',
        description: '一个分享技术和生活的个人博客',
        robots: 'index,follow'
      },
      cdn: {
        enabled: false,
        url: ''
      }
    } as AdvancedSettings,
    
    // 设置是否已经从后端加载
    loaded: false
  }),
  
  actions: {
    // 获取基本设置
    async getBasicSettings(): Promise<BasicSettings> {
      const settings = await settingsService.getBasicSettings()
      this.basicSettings = { ...this.basicSettings, ...settings }
      return this.basicSettings
    },
    
    // 保存基本设置
    async saveBasicSettings(settings: Partial<BasicSettings>) {
      const updated = await settingsService.saveBasicSettings(settings)
      this.basicSettings = { ...this.basicSettings, ...updated }
      return true
    },
    
    // 获取个人资料设置
    async getProfileSettings(): Promise<ProfileSettings> {
      const settings = await settingsService.getProfileSettings()
      this.profileSettings = { ...this.profileSettings, ...settings }
      return this.profileSettings
    },
    
    // 保存个人资料设置
    async saveProfileSettings(settings: Partial<ProfileSettings>) {
      const updated = await settingsService.saveProfileSettings(settings)
      this.profileSettings = { ...this.profileSettings, ...updated }
      return true
    },
    
    // 获取高级设置
    async getAdvancedSettings(): Promise<AdvancedSettings> {
      const settings = await settingsService.getAdvancedSettings()
      this.advancedSettings = { ...this.advancedSettings, ...settings }
      return this.advancedSettings
    },
    
    // 保存高级设置
    async saveAdvancedSettings(settings: Partial<AdvancedSettings>) {
      const updated = await settingsService.saveAdvancedSettings(settings)
      this.advancedSettings = { ...this.advancedSettings, ...updated }
      return true
    },
    
    // 从本地存储加载设置
    loadSettingsFromStorage() {
      try {
        const basicSettingsStr = localStorage.getItem('basicSettings')
        if (basicSettingsStr) {
          this.basicSettings = { ...this.basicSettings, ...JSON.parse(basicSettingsStr) }
        }
        
        const profileSettingsStr = localStorage.getItem('profileSettings')
        if (profileSettingsStr) {
          this.profileSettings = { ...this.profileSettings, ...JSON.parse(profileSettingsStr) }
        }
        
        const advancedSettingsStr = localStorage.getItem('advancedSettings')
        if (advancedSettingsStr) {
          this.advancedSettings = { ...this.advancedSettings, ...JSON.parse(advancedSettingsStr) }
        }
        
        this.loaded = true
      } catch (error) {
        console.error('Failed to load settings from storage:', error)
      }
    }
  }
}) 