import http from '@/services/http'
import type { Post } from './articleService'

export const searchService = {
  // 搜索文章
  searchPosts: (params: { q: string; category?: string; tag?: string }) =>
    http.get<Post[]>('/search', { params })
}
