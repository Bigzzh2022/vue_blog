import axios from 'axios'
import authService from './authService'

// 创建axios实例
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api',
  headers: {
    'Content-Type': 'application/json'
  },
  // 由于后端的CORS设置使用了通配符*，不能同时使用withCredentials
  // 如果需要带凭证，后端需要将Access-Control-Allow-Origin设置为具体的域名
  withCredentials: false
})

// 添加请求拦截器，自动添加认证令牌
apiClient.interceptors.request.use(
  config => {
    const token = authService.getToken()
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`
    }
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

// 管理员服务
export const adminService = {
  // 获取仪表盘统计数据
  async getDashboardStats() {
    try {
      // 使用模拟数据，因为API文档中没有仪表盘统计API
      // 实际项目中应该使用真实API
      // const response = await apiClient.get('/stats')
      return {
        posts: 125,
        tags: 48,
        categories: 12,
        visits: 45678
      }
    } catch (error) {
      console.error('获取仪表盘统计数据失败:', error)
      throw error
    }
  },

  // 获取访问趋势数据
  async getVisitTrends() {
    try {
      // 使用模拟数据，因为API文档中没有访问趋势API
      // 实际项目中应该使用真实API
      // const response = await apiClient.get('/stats/visits')
      return {
        dates: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
        counts: [820, 932, 901, 934, 1290, 1330, 1320]
      }
    } catch (error) {
      console.error('获取访问趋势数据失败:', error)
      throw error
    }
  },

  // 获取分类占比数据
  async getCategoryDistribution() {
    try {
      // 获取所有分类，然后计算每个分类的文章数量
      const categories = await this.getCategories()
      // 如果API没有返回文章数量，使用模拟数据
      return [
        { name: '技术', count: 1048 },
        { name: '生活', count: 735 },
        { name: '随笔', count: 580 },
        { name: '阅读', count: 484 }
      ]
    } catch (error) {
      console.error('获取分类占比数据失败:', error)
      throw error
    }
  },

  // 获取最近文章
  async getRecentArticles() {
    try {
      // 获取所有文章，然后取最近的几篇
      const posts = await this.getPosts({ limit: 3 })
      return posts.map((post: any) => ({
        id: post.id,
        title: post.title,
        category: post.category,
        date: post.publishDate || post.updateTime
      }))
    } catch (error) {
      console.error('获取最近文章失败:', error)
      throw error
    }
  },

  // 获取热门标签
  async getHotTags() {
    try {
      // 获取所有标签，然后模拟热门标签数据
      const tags = await this.getTags()
      return [
        { name: 'Vue', count: 25 },
        { name: 'TypeScript', count: 18 },
        { name: 'JavaScript', count: 15 },
        { name: 'CSS', count: 12 },
        { name: '生活', count: 10 }
      ]
    } catch (error) {
      console.error('获取热门标签失败:', error)
      throw error
    }
  },

  // 获取所有文章
  async getPosts(params: any = {}) {
    try {
      const response = await apiClient.get('/posts', { params })
      return response.data
    } catch (error) {
      console.error('获取文章列表失败:', error)
      throw error
    }
  },

  // 获取单篇文章
  async getPost(id: number) {
    try {
      const response = await apiClient.get(`/posts/${id}`)
      return response.data
    } catch (error) {
      console.error(`获取文章ID=${id}失败:`, error)
      throw error
    }
  },

  // 创建文章
  async createPost(postData: any) {
    try {
      const response = await apiClient.post('/posts', postData)
      return response.data
    } catch (error) {
      console.error('创建文章失败:', error)
      throw error
    }
  },

  // 更新文章
  async updatePost(id: number, postData: any) {
    try {
      const response = await apiClient.put(`/posts/${id}`, postData)
      return response.data
    } catch (error) {
      console.error(`更新文章ID=${id}失败:`, error)
      throw error
    }
  },

  // 删除文章
  async deletePost(id: number) {
    try {
      await apiClient.delete(`/posts/${id}`)
      return true
    } catch (error) {
      console.error(`删除文章ID=${id}失败:`, error)
      throw error
    }
  },

  // 批量更新文章状态
  async batchUpdatePostStatus(ids: number[], status: string) {
    try {
      // API文档中没有批量更新API，这里模拟一个
      // 实际项目中应该使用真实API
      // 如果需要，可以使用多个单独的请求来更新每篇文章
      const updatePromises = ids.map(id => this.updatePost(id, { status }))
      await Promise.all(updatePromises)
      return { success: true }
    } catch (error) {
      console.error('批量更新文章状态失败:', error)
      throw error
    }
  },

  // 获取所有分类
  async getCategories(params: any = {}) {
    try {
      const response = await apiClient.get('/categories', { params })
      return response.data
    } catch (error) {
      console.error('获取分类列表失败:', error)
      throw error
    }
  },

  // 创建分类
  async createCategory(categoryData: any) {
    try {
      const response = await apiClient.post('/categories', categoryData)
      return response.data
    } catch (error) {
      console.error('创建分类失败:', error)
      throw error
    }
  },

  // 更新分类
  async updateCategory(name: string, categoryData: any) {
    try {
      // API文档中没有更新分类的API，这里模拟一个
      // 实际项目中应该使用真实API
      // 可能需要先删除旧分类，然后创建新分类
      await this.deleteCategory(name)
      const response = await this.createCategory(categoryData)
      return response
    } catch (error) {
      console.error(`更新分类失败:`, error)
      throw error
    }
  },

  // 删除分类
  async deleteCategory(name: string) {
    try {
      await apiClient.delete(`/categories/${name}`)
      return true
    } catch (error) {
      console.error(`删除分类${name}失败:`, error)
      throw error
    }
  },

  // 获取所有标签
  async getTags(params: any = {}) {
    try {
      const response = await apiClient.get('/tags', { params })
      return response.data
    } catch (error) {
      console.error('获取标签列表失败:', error)
      throw error
    }
  },

  // 创建标签
  async createTag(tagData: any) {
    try {
      const response = await apiClient.post('/tags', tagData)
      return response.data
    } catch (error) {
      console.error('创建标签失败:', error)
      throw error
    }
  },

  // 更新标签
  async updateTag(name: string, tagData: any) {
    try {
      // API文档中没有更新标签的API，这里模拟一个
      // 实际项目中应该使用真实API
      // 可能需要先删除旧标签，然后创建新标签
      await this.deleteTag(name)
      const response = await this.createTag(tagData)
      return response
    } catch (error) {
      console.error(`更新标签${name}失败:`, error)
      throw error
    }
  },

  // 删除标签
  async deleteTag(name: string) {
    try {
      await apiClient.delete(`/tags/${name}`)
      return true
    } catch (error) {
      console.error(`删除标签${name}失败:`, error)
      throw error
    }
  },

  // 获取所有友链
  async getLinks(params: any = {}) {
    try {
      const response = await apiClient.get('/links', { params })
      return response.data
    } catch (error) {
      console.error('获取友链列表失败:', error)
      throw error
    }
  },

  // 更新友链状态
  async updateLinkStatus(id: number, status: string) {
    try {
      // API文档中没有更新友链状态的API，这里模拟一个
      // 实际项目中应该使用真实API
      return { id, status }
    } catch (error) {
      console.error(`更新友链ID=${id}状态失败:`, error)
      throw error
    }
  },

  // 删除友链
  async deleteLink(id: number) {
    try {
      // API文档中没有删除友链的API，这里模拟一个
      // 实际项目中应该使用真实API
      return true
    } catch (error) {
      console.error(`删除友链ID=${id}失败:`, error)
      throw error
    }
  },

  // 获取网站设置
  async getSettings() {
    try {
      // API文档中没有获取网站设置的API，这里模拟一个
      // 实际项目中应该使用真实API
      return {
        siteName: '渐开线的小窝',
        siteDescription: '给时光以生命，给岁月以文明',
        siteKeywords: '博客,技术,生活',
        siteUrl: 'https://example.com',
        siteLogo: 'https://example.com/logo.png',
        siteFooter: '© 2024 渐开线的小窝 All Rights Reserved.',
        socialLinks: {
          github: 'https://github.com',
          twitter: 'https://twitter.com',
          weibo: 'https://weibo.com'
        }
      }
    } catch (error) {
      console.error('获取网站设置失败:', error)
      throw error
    }
  },

  // 更新网站设置
  async updateSettings(settingsData: any) {
    try {
      // API文档中没有更新网站设置的API，这里模拟一个
      // 实际项目中应该使用真实API
      return settingsData
    } catch (error) {
      console.error('更新网站设置失败:', error)
      throw error
    }
  },

  // 获取媒体文件列表
  async getMedia(params: any = {}) {
    try {
      // API文档中没有获取媒体文件列表的API，这里模拟一个
      // 实际项目中应该使用真实API
      return []
    } catch (error) {
      console.error('获取媒体文件列表失败:', error)
      throw error
    }
  },

  // 上传媒体文件
  async uploadMedia(formData: FormData) {
    try {
      // 使用文件上传API
      const response = await apiClient.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      return response.data
    } catch (error) {
      console.error('上传媒体文件失败:', error)
      throw error
    }
  },

  // 删除媒体文件
  async deleteMedia(id: number) {
    try {
      // API文档中没有删除媒体文件的API，这里模拟一个
      // 实际项目中应该使用真实API
      return true
    } catch (error) {
      console.error(`删除媒体文件ID=${id}失败:`, error)
      throw error
    }
  }
}

export default adminService
