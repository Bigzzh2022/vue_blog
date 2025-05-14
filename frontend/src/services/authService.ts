import axios from 'axios'

// 创建axios实例
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api',
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: false
})

// 本地存储键名
const TOKEN_KEY = 'vue_blog_token'
const USER_KEY = 'vue_blog_user'

// 认证服务
export const authService = {
  // 用户登录
  async login(username: string, password: string) {
    try {
      const response = await apiClient.post('/login', { username, password })
      const { token, user } = response.data
      
      // 保存令牌和用户信息到本地存储
      localStorage.setItem(TOKEN_KEY, token)
      localStorage.setItem(USER_KEY, JSON.stringify(user))
      
      // 设置默认Authorization头
      this.setAuthHeader(token)
      
      return user
    } catch (error) {
      console.error('登录失败:', error)
      throw error
    }
  },
  
  // 用户注册
  async register(username: string, email: string, password: string) {
    try {
      const response = await apiClient.post('/register', { username, email, password })
      return response.data
    } catch (error) {
      console.error('注册失败:', error)
      throw error
    }
  },
  
  // 获取当前用户信息
  async getCurrentUser() {
    try {
      const token = this.getToken()
      if (!token) {
        return null
      }
      
      const response = await apiClient.get('/users/me')
      return response.data
    } catch (error) {
      console.error('获取用户信息失败:', error)
      this.logout() // 如果获取用户信息失败，可能是令牌过期，清除登录状态
      return null
    }
  },
  
  // 用户登出
  logout() {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    delete apiClient.defaults.headers.common['Authorization']
  },
  
  // 检查用户是否已登录
  isLoggedIn() {
    return !!this.getToken()
  },
  
  // 获取保存的令牌
  getToken() {
    return localStorage.getItem(TOKEN_KEY)
  },
  
  // 获取保存的用户信息
  getUser() {
    const userJson = localStorage.getItem(USER_KEY)
    return userJson ? JSON.parse(userJson) : null
  },
  
  // 设置认证头
  setAuthHeader(token: string) {
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`
  }
}

// 初始化时设置认证头
const token = authService.getToken()
if (token) {
  authService.setAuthHeader(token)
}

export default authService
