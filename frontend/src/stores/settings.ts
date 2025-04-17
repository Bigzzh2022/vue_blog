import { defineStore } from 'pinia'

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
    getBasicSettings(): BasicSettings {
      // 未来可以从本地存储或后端加载设置
      return this.basicSettings
    },
    
    // 保存基本设置
    saveBasicSettings(settings: Partial<BasicSettings>) {
      this.basicSettings = { ...this.basicSettings, ...settings }
      // 未来可以保存到本地存储或后端
      localStorage.setItem('basicSettings', JSON.stringify(this.basicSettings))
      return true
    },
    
    // 获取个人资料设置
    getProfileSettings(): ProfileSettings {
      return this.profileSettings
    },
    
    // 保存个人资料设置
    saveProfileSettings(settings: Partial<ProfileSettings>) {
      this.profileSettings = { ...this.profileSettings, ...settings }
      localStorage.setItem('profileSettings', JSON.stringify(this.profileSettings))
      return true
    },
    
    // 获取高级设置
    getAdvancedSettings(): AdvancedSettings {
      return this.advancedSettings
    },
    
    // 保存高级设置
    saveAdvancedSettings(settings: Partial<AdvancedSettings>) {
      this.advancedSettings = { ...this.advancedSettings, ...settings }
      localStorage.setItem('advancedSettings', JSON.stringify(this.advancedSettings))
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