import http from '@/services/http'

export interface Post {
  id: string
  title: string
  content: string
  description: string
  category: string
  tags: string[]
  status: string
  author: string
  views: number
  publishDate: string
  updateTime: string
  coverImage: string
  commentCount: number
}

export const articleService = {
  // 获取文章列表
  getPosts: (params?: { status?: string; category?: string }) => 
    http.get<Post[]>('/posts', { params }),

  // 获取单篇文章
  getPost: async (postId: string): Promise<Post> => {
    try {
      // 注意：http.ts 中已经配置了 baseURL 为 'http://localhost:8080/api'
      // 所以这里不需要再加 /api 前缀
      // 使用 unknown 作为中间类型来解决 TypeScript 类型转换错误
      // http.ts 中的响应拦截器已经将 response.data 作为返回值
      return http.get(`/posts/${postId}`) as unknown as Post
    } catch (error) {
      console.error(`获取文章 ${postId} 失败:`, error)
      throw error
    }
  },

  // 创建文章
  createPost: (data: {
    title: string
    content: string
    description: string
    category: string
    tags: string[]
    status: string
  }) => http.post<Post>('/posts', data),

  // 更新文章
  updatePost: (postId: string, data: {
    title: string
    content: string
    description: string
    category: string
    tags: string[]
    status: string
  }) => http.put<Post>(`/posts/${postId}`, data),

  // 删除文章
  deletePost: (postId: string) => 
    http.delete(`/posts/${postId}`),

  // 上传封面
  uploadCover: (postId: string, file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    return http.post<Post>(`/posts/${postId}/cover`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  }
}