import request from './config'

export interface CategoryData {
  name: string
  slug: string
  description?: string
}

export const categoryApi = {
  // 获取所有分类
  getCategories() {
    return request.get('/categories')
  },

  // 获取分类详情
  getCategory(id: number) {
    return request.get(`/categories/${id}`)
  },

  // 创建分类
  createCategory(data: CategoryData) {
    return request.post('/categories', data)
  },

  // 更新分类
  updateCategory(id: number, data: CategoryData) {
    return request.put(`/categories/${id}`, data)
  },

  // 删除分类
  deleteCategory(id: number) {
    return request.delete(`/categories/${id}`)
  }
} 