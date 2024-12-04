import request from './config'

export interface DoubanItem {
  id: number
  title: string
  cover: string
  rating: number
  pubdate: string
  type: 'book' | 'movie' | 'music'
  status: 'reading' | 'read' | 'wish' | 'watching' | 'watched' | 'listening' | 'listened'
  tags: string[]
  comment: string
  updated_at: string
  douban_id: string
  douban_url: string
  // 书籍特有字段
  author?: string[]
  publisher?: string
  price?: string
  // 电影特有字段
  director?: string[]
  actors?: string[]
  duration?: string
  // 音乐特有字段
  artist?: string[]
  album?: string
}

interface ApiResponse<T> {
  data: T
  code: number
  message: string
}

export const syncDoubanData = () => {
  return request<ApiResponse<void>>({
    url: '/douban/sync',
    method: 'POST'
  })
}

export const getDoubanItems = (params: {
  type?: 'book' | 'movie' | 'music'
  status?: string
  tag?: string
  page?: number
  pageSize?: number
}) => {
  return request<ApiResponse<{
    items: DoubanItem[]
    total: number
  }>>({
    url: '/douban/items',
    method: 'GET',
    params
  }).then(res => res.data.data)
}

export const updateDoubanItem = (id: number, data: Partial<DoubanItem>) => {
  return request<ApiResponse<void>>({
    url: `/douban/items/${id}`,
    method: 'PUT',
    data
  })
}

export const addDoubanItem = (data: Omit<DoubanItem, 'id'>) => {
  return request<ApiResponse<DoubanItem>>({
    url: '/douban/items',
    method: 'POST',
    data
  }).then(res => res.data.data)
}

export const deleteDoubanItem = (id: number) => {
  return request<ApiResponse<void>>({
    url: `/douban/items/${id}`,
    method: 'DELETE'
  })
}
