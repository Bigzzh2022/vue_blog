import request from './config'

export interface FriendData {
  name: string
  url: string
  icon: string
  description: string
  status: 'pending' | 'approved' | 'rejected'
}

export const friendApi = {
  // 获取友链列表
  getFriends(params?: { status?: string }) {
    return request.get('/friends', { params })
  },

  // 申请友链
  applyFriend(data: FriendData) {
    return request.post('/friends/apply', data)
  },

  // 更新友链状态（管理员）
  updateFriendStatus(id: number, status: string) {
    return request.put(`/friends/${id}/status`, { status })
  },

  // 删除友链（管理员）
  deleteFriend(id: number) {
    return request.delete(`/friends/${id}`)
  }
} 