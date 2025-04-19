import http from '@/services/http'

export interface Tag {
  name: string
}

export const tagService = {
  // 获取所有标签
  getTags: () => 
    http.get<Tag[]>('/tags'),

  // 创建标签
  createTag: (name: string) => 
    http.post<Tag>('/tags', { name }),

  // 删除标签
  deleteTag: (tagName: string) => 
    http.delete(`/tags/${tagName}`)
}