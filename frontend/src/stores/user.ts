import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { userService, type UserInfo, type LoginParams, type RegisterParams } from '@/services/userService'

export const useUserStore = defineStore('user', () => {
  // 状态
  const currentUser = ref<UserInfo | null>(null)
  const token = ref<string | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  
  // 计算属性
  const isLoggedIn = computed(() => !!token.value)
  const isAdmin = computed(() => currentUser.value?.role === 'admin')
  
  // 操作方法
  
  /**
   * 登录
   * @param loginData 登录参数
   */
  async function login(loginData: LoginParams) {
    loading.value = true
    error.value = null
    
    try {
      const response = await userService.login(loginData)
      token.value = response.token
      currentUser.value = response.user
      return response
    } catch (err) {
      error.value = err instanceof Error ? err.message : '登录失败'
      throw err
    } finally {
      loading.value = false
    }
  }
  
  /**
   * 注册
   * @param registerData 注册参数
   */
  async function register(registerData: RegisterParams) {
    loading.value = true
    error.value = null
    
    try {
      const userInfo = await userService.register(registerData)
      return userInfo
    } catch (err) {
      error.value = err instanceof Error ? err.message : '注册失败'
      throw err
    } finally {
      loading.value = false
    }
  }
  
  /**
   * 退出登录
   */
  function logout() {
    userService.logout()
    token.value = null
    currentUser.value = null
  }
  
  /**
   * 初始化用户状态 - 从本地存储加载
   */
  async function init() {
    loading.value = true
    
    try {
      token.value = userService.getToken()
      
      if (token.value) {
        currentUser.value = await userService.getUserInfo()
        
        // 如果不能获取用户信息则登出
        if (!currentUser.value) {
          logout()
        }
      }
    } catch (err) {
      console.error('初始化用户状态失败:', err)
      logout()
    } finally {
      loading.value = false
    }
  }
  
  // 导出
  return {
    currentUser,
    token,
    loading,
    error,
    isLoggedIn,
    isAdmin,
    login,
    register,
    logout,
    init
  }
}) 