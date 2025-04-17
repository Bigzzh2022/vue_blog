import { defineStore } from 'pinia'

export interface FriendLink {
  id: number
  name: string
  url: string
  icon: string
  description: string
  status: 'approved' | 'pending' | 'rejected'
  createTime?: string
}

export const useLinkStore = defineStore('links', {
  state: () => ({
    links: [] as FriendLink[],
    loaded: false,
    // 示例数据，实际使用时可以从后端API获取
    defaultLinks: [
      {
        id: 1,
        name: '示例博客',
        url: 'https://example.com',
        icon: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Felix',
        description: '这是一个示例博客',
        status: 'approved',
        createTime: '2024-01-15'
      },
      {
        id: 2,
        name: '小明的博客',
        url: 'https://example.com',
        icon: 'https://api.dicebear.com/7.x/adventurer/svg?seed=John',
        description: '记录生活，分享技术',
        status: 'approved',
        createTime: '2024-01-16'
      },
      {
        id: 3,
        name: '小红的空间',
        url: 'https://example.com',
        icon: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Lucy',
        description: '分享是一种快乐',
        status: 'approved',
        createTime: '2024-01-17'
      },
      {
        id: 4,
        name: '科技前沿',
        url: 'https://example.com',
        icon: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Tech',
        description: '探索前沿科技，分享科技见闻',
        status: 'approved',
        createTime: '2024-01-18'
      },
      {
        id: 5,
        name: '艺术空间',
        url: 'https://example.com',
        icon: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Art',
        description: '艺术创作与审美分享',
        status: 'approved',
        createTime: '2024-01-19'
      },
      {
        id: 6,
        name: '旅行日记',
        url: 'https://example.com',
        icon: 'https://api.dicebear.com/7.x/adventurer/svg?seed=Travel',
        description: '环游世界，记录美好时光',
        status: 'approved',
        createTime: '2024-01-20'
      }
    ] as FriendLink[]
  }),
  
  getters: {
    // 获取已批准的友链
    approvedLinks: (state) => {
      return state.links.filter(link => link.status === 'approved')
    },
    
    // 获取待审核的友链
    pendingLinks: (state) => {
      return state.links.filter(link => link.status === 'pending')
    },
    
    // 获取被拒绝的友链
    rejectedLinks: (state) => {
      return state.links.filter(link => link.status === 'rejected')
    },
    
    // 获取友链数量
    linkCount: (state) => {
      return {
        total: state.links.length,
        approved: state.links.filter(link => link.status === 'approved').length,
        pending: state.links.filter(link => link.status === 'pending').length,
        rejected: state.links.filter(link => link.status === 'rejected').length
      }
    }
  },
  
  actions: {
    // 加载友链数据
    async loadLinks() {
      try {
        // 先从本地存储获取
        const storedLinks = localStorage.getItem('friendLinks')
        if (storedLinks) {
          this.links = JSON.parse(storedLinks)
        } else {
          // 如果本地没有，使用默认数据
          this.links = [...this.defaultLinks]
          // 保存到本地存储
          localStorage.setItem('friendLinks', JSON.stringify(this.links))
        }
        this.loaded = true
      } catch (error) {
        console.error('加载友链失败:', error)
      }
    },
    
    // 添加友链申请
    async addLink(link: Omit<FriendLink, 'id' | 'createTime'>) {
      try {
        // 生成新ID和创建时间
        const newId = this.links.length > 0 
          ? Math.max(...this.links.map(l => l.id)) + 1 
          : 1
        
        const newLink: FriendLink = {
          ...link,
          id: newId,
          createTime: new Date().toISOString().split('T')[0]
        }
        
        // 添加到列表
        this.links.push(newLink)
        
        // 保存到本地存储
        localStorage.setItem('friendLinks', JSON.stringify(this.links))
        
        return true
      } catch (error) {
        console.error('添加友链申请失败:', error)
        return false
      }
    },
    
    // 更新友链状态
    async updateLinkStatus(id: number, status: 'approved' | 'pending' | 'rejected') {
      try {
        const link = this.links.find(l => l.id === id)
        if (link) {
          link.status = status
          
          // 保存到本地存储
          localStorage.setItem('friendLinks', JSON.stringify(this.links))
          return true
        }
        return false
      } catch (error) {
        console.error('更新友链状态失败:', error)
        return false
      }
    },
    
    // 更新友链信息
    async updateLink(id: number, updateData: Partial<Omit<FriendLink, 'id' | 'createTime'>>) {
      try {
        const link = this.links.find(l => l.id === id)
        if (link) {
          Object.assign(link, updateData)
          
          // 保存到本地存储
          localStorage.setItem('friendLinks', JSON.stringify(this.links))
          return true
        }
        return false
      } catch (error) {
        console.error('更新友链信息失败:', error)
        return false
      }
    },
    
    // 删除友链
    async deleteLink(id: number) {
      try {
        this.links = this.links.filter(l => l.id !== id)
        
        // 保存到本地存储
        localStorage.setItem('friendLinks', JSON.stringify(this.links))
        return true
      } catch (error) {
        console.error('删除友链失败:', error)
        return false
      }
    },
    
    // 清空本地存储中的友链数据
    clearLinks() {
      localStorage.removeItem('friendLinks')
      this.links = []
      this.loaded = false
    },
    
    // 重置为默认友链数据
    resetToDefault() {
      this.links = [...this.defaultLinks]
      localStorage.setItem('friendLinks', JSON.stringify(this.links))
    }
  }
}) 