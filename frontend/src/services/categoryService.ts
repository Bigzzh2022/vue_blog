import http from '@/services/http'

export interface Category {
  name: string
  slug?: string
  count?: number
}

export const categoryService = {
  // 获取所有分类
  getCategories: () => 
    http.get<Category[]>('/categories'),

  // 创建分类
  createCategory: (name: string) => 
    http.post<Category>('/categories', { name }),

  // 删除分类
  deleteCategory: (categoryName: string) => 
    http.delete(`/categories/${categoryName}`)
}