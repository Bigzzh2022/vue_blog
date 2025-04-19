// 用户相关API服务

// 用户登录参数接口
export interface LoginParams {
  username: string;
  password: string;
}

// 用户注册参数接口
export interface RegisterParams {
  username: string;
  email: string;
  password: string;
}

// 用户信息接口
export interface UserInfo {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  role: string;
  createdAt: string;
}

// 用户登录响应
export interface LoginResponse {
  token: string;
  user: UserInfo;
}

// 简单的令牌存储
const TOKEN_KEY = 'user_token';
const USER_INFO_KEY = 'user_info';

/**
 * 用户服务类
 */
import http from '@/services/http'
import authService from '@/services/authService'

class UserService {
  /**
   * 用户登录
   * @param params 登录参数
   * @returns Promise<LoginResponse>
   */
  async login(params: LoginParams): Promise<LoginResponse> {
    try {
      // 使用authService进行登录
      const user = await authService.login(params.username, params.password);
      const token = authService.getToken() || '';
      
      // 构造返回对象
      const response: LoginResponse = {
        token,
        user: {
          id: user.id || '',
          username: user.username,
          email: user.email || '',
          avatar: user.avatar,
          role: user.role || 'user',
          createdAt: user.createdAt || new Date().toISOString()
        }
      };
      
      this.saveUserInfo(response.user);
      return response;
    } catch (error) {
      console.error('登录失败:', error);
      throw error instanceof Error ? error : new Error('登录请求失败');
    }
  }
  
  /**
   * 用户注册
   * @param params 注册参数
   * @returns Promise<UserInfo>
   */
  async register(params: RegisterParams): Promise<UserInfo> {
    try {
      // 使用与后端 API 一致的路径
      // 因为 http.ts 中的响应拦截器已经将 response.data 作为返回值
      // 所以这里直接得到的就是 UserInfo 对象
      // 使用 unknown 作为中间类型来解决 TypeScript 类型转换错误
      return await http.post<UserInfo>('/register', params) as unknown as UserInfo;
    } catch (error) {
      console.error('注册失败:', error);
      throw error instanceof Error ? error : new Error('注册请求失败');
    }
  }
  
  /**
   * 获取用户信息
   * @returns Promise<UserInfo | null>
   */
  async getUserInfo(): Promise<UserInfo | null> {
    try {
      // 使用authService获取用户信息
      const user = await authService.getCurrentUser();
      if (!user) {
        return null;
      }
      
      // 将用户信息转换为UserInfo格式
      const userInfo: UserInfo = {
        id: user.id || '',
        username: user.username,
        email: user.email || '',
        avatar: user.avatar,
        role: user.role || 'user',
        createdAt: user.createdAt || new Date().toISOString()
      };
      
      return userInfo;
    } catch (error) {
      console.error('获取用户信息失败:', error);
      return null;
    }
  }
  
  /**
   * 退出登录
   */
  logout(): void {
    // 使用authService退出登录
    authService.logout();
  }
  
  /**
   * 检查用户是否已登录
   * @returns boolean
   */
  isLoggedIn(): boolean {
    return !!authService.getToken();
  }
  
  /**
   * 保存令牌
   * @param token 令牌
   */
  saveToken(token: string): void {
    // 使用authService中的方法存储令牌
    localStorage.setItem(TOKEN_KEY, token);
    // 设置认证头
    authService.setAuthHeader(token);
  }
  
  /**
   * 获取令牌
   * @returns string | null
   */
  getToken(): string | null {
    return authService.getToken();
  }
  
  /**
   * 移除令牌
   */
  removeToken(): void {
    // 使用authService退出登录，它会清除令牌
    authService.logout();
  }
  
  /**
   * 保存用户信息到本地存储
   * @param userInfo 用户信息
   */
  private saveUserInfo(userInfo: UserInfo): void {
    localStorage.setItem(USER_INFO_KEY, JSON.stringify(userInfo));
  }
  
  /**
   * 从本地存储获取用户信息
   * @returns UserInfo | null
   */
  getSavedUserInfo(): UserInfo | null {
    const userInfoStr = localStorage.getItem(USER_INFO_KEY);
    if (!userInfoStr) {
      return null;
    }
    
    try {
      return JSON.parse(userInfoStr) as UserInfo;
    } catch (error) {
      console.error('解析用户信息失败:', error);
      return null;
    }
  }

  /**
   * 更新用户角色（管理员权限）
   * @param username 用户名
   * @param role 新角色 (admin, editor, user)
   * @returns Promise<{ message: string }>
   */
  async updateUserRole(username: string, role: string): Promise<{ message: string }> {
    // 使用与后端 API 一致的路径
    // 使用类型断言来处理响应拦截器的返回值
    // 使用 unknown 作为中间类型来解决 TypeScript 类型转换错误
    return http.put<{ message: string }>(`/users/${username}/role`, null, { params: { role } }) as unknown as Promise<{ message: string }>
  }
}

// 导出单例
export const userService = new UserService();