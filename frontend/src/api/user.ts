import request from './config'

export interface LoginData {
  email: string
  password: string
}

export interface RegisterData {
  username: string
  email: string
  password: string
}

export const userApi = {
  // 登录
  login(data: LoginData) {
    return request.post('/auth/login', data)
  },

  // 注册
  register(data: RegisterData) {
    return request.post('/auth/register', data)
  },

  // 获取用户信息
  getUserInfo() {
    return request.get('/user/info')
  },

  // 更新用户信息
  updateUserInfo(data: any) {
    return request.put('/user/info', data)
  },

  // 修改密码
  changePassword(data: { oldPassword: string; newPassword: string }) {
    return request.put('/user/password', data)
  }
} 