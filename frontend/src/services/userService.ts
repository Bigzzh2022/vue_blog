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
class UserService {
  /**
   * 用户登录
   * @param params 登录参数
   * @returns Promise<LoginResponse>
   */
  async login(params: LoginParams): Promise<LoginResponse> {
    try {
      // TODO: 替换为实际的API调用
      console.log('登录请求参数:', params);
      
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 模拟测试账户
      if (params.username === 'test' && params.password === 'password') {
        const mockResponse: LoginResponse = {
          token: 'mock_token_' + Date.now(),
          user: {
            id: '1',
            username: 'test',
            email: 'test@example.com',
            avatar: 'https://via.placeholder.com/150',
            role: 'admin',
            createdAt: new Date().toISOString(),
          }
        };
        
        // 保存令牌和用户信息
        this.saveToken(mockResponse.token);
        this.saveUserInfo(mockResponse.user);
        
        return mockResponse;
      }
      
      // 模拟登录失败
      throw new Error('用户名或密码错误');
    } catch (error) {
      console.error('登录失败:', error);
      throw error;
    }
  }
  
  /**
   * 用户注册
   * @param params 注册参数
   * @returns Promise<UserInfo>
   */
  async register(params: RegisterParams): Promise<UserInfo> {
    try {
      // TODO: 替换为实际的API调用
      console.log('注册请求参数:', params);
      
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // 模拟注册成功
      const mockUser: UserInfo = {
        id: 'new_' + Date.now(),
        username: params.username,
        email: params.email,
        role: 'user',
        createdAt: new Date().toISOString(),
      };
      
      return mockUser;
    } catch (error) {
      console.error('注册失败:', error);
      throw error;
    }
  }
  
  /**
   * 获取用户信息
   * @returns Promise<UserInfo | null>
   */
  async getUserInfo(): Promise<UserInfo | null> {
    try {
      const token = this.getToken();
      if (!token) {
        return null;
      }
      
      // 从本地存储获取用户信息
      const userInfo = this.getSavedUserInfo();
      if (userInfo) {
        return userInfo;
      }
      
      // TODO: 如果本地没有，则调用API获取
      // const response = await fetch('/api/user/info', {
      //   headers: { Authorization: `Bearer ${token}` }
      // });
      // const data = await response.json();
      // return data.user;
      
      return null;
    } catch (error) {
      console.error('获取用户信息失败:', error);
      return null;
    }
  }
  
  /**
   * 退出登录
   */
  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_INFO_KEY);
  }
  
  /**
   * 检查用户是否已登录
   * @returns boolean
   */
  isLoggedIn(): boolean {
    return !!this.getToken();
  }
  
  /**
   * 保存令牌到本地存储
   * @param token 令牌
   */
  private saveToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
  }
  
  /**
   * 获取令牌
   * @returns string | null
   */
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
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
}

// 导出单例
export const userService = new UserService(); 