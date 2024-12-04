import request from './config'

export interface FavoriteFolder {
  id: number
  title: string
  cover: string
  media_count: number
  description: string
  public: boolean
  created_at: string
  updated_at: string
}

export interface FavoriteItem {
  id: number
  title: string
  cover: string
  intro: string
  page_url: string
  up_name: string
  up_mid: number
  created_at: string
  type: 'video' | 'article' | 'note'
}

interface ApiResponse<T> {
  data: T
  code: number
  message: string
}

export const syncBiliFavorites = () => {
  return request<ApiResponse<void>>({
    url: '/favorites/sync',
    method: 'POST'
  })
}

export const getFavoriteFolders = () => {
  return request<ApiResponse<FavoriteFolder[]>>({
    url: '/favorites/folders',
    method: 'GET'
  }).then(res => res.data.data)
}

export const getFavoriteItems = (folderId: number) => {
  return request<ApiResponse<FavoriteItem[]>>({
    url: `/favorites/items/${folderId}`,
    method: 'GET'
  }).then(res => res.data.data)
}
