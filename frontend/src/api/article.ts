import request from './config'

export interface ArticleData {
  title: string
  content: string
  category: string
  tags: string[]
  status: 'published' | 'draft' | 'private'
}

export const articleApi = {
  // 获取文章列表
  getArticles(params: {
    page: number
    size: number
    category?: string
    tag?: string
    status?: string
  }) {
    return request.get('/articles', { params })
  },

  // 获取文章详情
  getArticle(id: number) {
    return request.get(`/articles/${id}`)
  },

  // 创建文章
  createArticle(data: ArticleData) {
    return request.post('/articles', data)
  },

  // 更新文章
  updateArticle(id: number, data: ArticleData) {
    return request.put(`/articles/${id}`, data)
  },

  // 删除文章
  deleteArticle(id: number) {
    return request.delete(`/articles/${id}`)
  }
} 