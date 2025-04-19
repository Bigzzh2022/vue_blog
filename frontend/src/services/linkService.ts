import http from '@/services/http'
import type { FriendLink } from '@/stores/links'

// 友链服务
export const linkService = {
  // 获取所有友链
  async getLinks() {
    return await http.get<FriendLink[]>('/friend-links')
  },

  // 获取已批准的友链（前端过滤）
  async getApprovedLinks() {
    const links = await this.getLinks()
    return links.filter((link: FriendLink) => link.status === 'approved')
  },

  // 新增友链
  async addLink(link: Omit<FriendLink, 'id' | 'created_at'>) {
    return await http.post<FriendLink>('/friend-links', link)
  },

  // 更新友链信息
  async updateLink(id: string, updateData: Partial<Omit<FriendLink, 'id' | 'created_at'>>) {
    return await http.put<FriendLink>(`/friend-links/${id}`, updateData)
  },

  // 更新友链状态
  async updateLinkStatus(id: string, status: 'approved' | 'pending' | 'rejected') {
    return await http.put<FriendLink>(`/friend-links/${id}`, { status })
  },

  // 删除友链
  async deleteLink(id: string) {
    return await http.delete(`/friend-links/${id}`)
  }
}

export default linkService
