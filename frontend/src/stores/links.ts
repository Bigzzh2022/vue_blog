import { defineStore } from 'pinia'
import linkService from '@/services/linkService'

export interface FriendLink {
  id: string
  name: string
  url: string
  icon: string
  description: string
  status: 'approved' | 'pending' | 'rejected'
  created_at?: string
}

export const useLinkStore = defineStore('links', {
  state: () => ({
    links: [] as FriendLink[],
    loaded: false,
    loading: false,
    error: null as string | null
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
      this.loading = true
      this.error = null
      try {
        const links = await linkService.getLinks()
        this.links = links
        this.loaded = true
      } catch (error) {
        console.error('加载友链失败:', error)
        this.error = '加载友链失败，请稍后重试'
      } finally {
        this.loading = false
      }
    },
    
    // 加载已批准的友链
    async loadApprovedLinks() {
      this.loading = true
      this.error = null
      try {
        const approvedLinks = await linkService.getApprovedLinks()
        const otherLinks = this.links.filter(link => link.status !== 'approved')
        this.links = [...approvedLinks, ...otherLinks]
      } catch (error) {
        console.error('加载已批准友链失败:', error)
        this.error = '加载已批准友链失败，请稍后重试'
      } finally {
        this.loading = false
      }
    },
    
    // 添加友链申请
    async addLink(link: Omit<FriendLink, 'id' | 'createTime'>) {
      try {
        const newLink = await linkService.addLink(link)
        this.links.push(newLink)
        return true
      } catch (error) {
        console.error('添加友链申请失败:', error)
        return false
      }
    },
    
    // 更新友链状态
    async updateLinkStatus(id: string, status: 'approved' | 'pending' | 'rejected') {
      try {
        const updatedLink = await linkService.updateLinkStatus(id, status)
        const index = this.links.findIndex(l => l.id === id)
        if (index !== -1) {
          this.links[index] = updatedLink
        }
        return true
      } catch (error) {
        console.error('更新友链状态失败:', error)
        return false
      }
    },
    
    // 更新友链信息
    async updateLink(id: string, updateData: Partial<Omit<FriendLink, 'id' | 'created_at'>>) {
      try {
        const updatedLink = await linkService.updateLink(id, updateData)
        const index = this.links.findIndex(l => l.id === id)
        if (index !== -1) {
          this.links[index] = updatedLink
        }
        return true
      } catch (error) {
        console.error('更新友链信息失败:', error)
        return false
      }
    },
    
    // 删除友链
    async deleteLink(id: string) {
      try {
        await linkService.deleteLink(id)
        this.links = this.links.filter(l => l.id !== id)
        return true
      } catch (error) {
        console.error('删除友链失败:', error)
        return false
      }
    }
  }
})