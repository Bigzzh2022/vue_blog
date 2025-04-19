<template>
  <div class="login-form">
    <!-- 添加全局登录错误提示 -->
    <div v-if="loginError" class="login-error-alert">
      <font-awesome-icon :icon="['fas', 'exclamation-circle']" />
      <span>{{ loginError }}</span>
    </div>
    
    <form @submit.prevent="handleLogin">
      <div class="form-group">
        <label for="username">用户名</label>
        <input 
          id="username"
          type="text" 
          v-model="loginForm.username" 
          placeholder="请输入用户名"
          required
          :class="{ 'error': formErrors.username }"
          autocomplete="username"
        >
        <span class="error-message" v-if="formErrors.username">{{ formErrors.username }}</span>
      </div>
      
      <div class="form-group">
        <label for="password">密码</label>
        <input 
          id="password"
          type="password"
          v-model="loginForm.password" 
          placeholder="请输入密码"
          required
          :class="{ 'error': formErrors.password }"
          autocomplete="current-password"
        >
        <span class="error-message" v-if="formErrors.password">{{ formErrors.password }}</span>
      </div>
      
      <div class="form-options">
        <label class="remember-me">
          <input type="checkbox" v-model="loginForm.remember">
          <span>记住我</span>
        </label>
        <a href="#" class="forget-password">忘记密码？</a>
      </div>
      
      <button type="submit" class="submit-btn" :disabled="isSubmitting">
        <span v-if="isSubmitting">
          <font-awesome-icon :icon="['fas', 'spinner']" spin />
          登录中...
        </span>
        <span v-else>登录</span>
      </button>
      
      <div class="form-footer">
        <p>还没有账号？<router-link to="/register">立即注册</router-link></p>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useMessage } from 'naive-ui'
import { library } from '@fortawesome/fontawesome-svg-core'
import { faExclamationCircle, faSpinner } from '@fortawesome/free-solid-svg-icons'
import { useUserStore } from '@/stores/user'

library.add(faExclamationCircle, faSpinner)

const router = useRouter()
const message = useMessage()
const userStore = useUserStore() // 使用用户Store
const isSubmitting = ref(false)
const loginError = ref('')  // 添加登录错误提示

const loginForm = reactive({
  username: '',
  password: '',
  remember: false
})

const formErrors = reactive({
  username: '',
  password: ''
})

const validateForm = () => {
  let isValid = true
  
  // 重置错误
  formErrors.username = ''
  formErrors.password = ''
  loginError.value = ''  // 重置登录错误
  
  // 验证用户名
  if (!loginForm.username) {
    formErrors.username = '请输入用户名'
    isValid = false
  } else if (loginForm.username.length < 3) {
    formErrors.username = '用户名至少需要3个字符'
    isValid = false
  }
  
  // 验证密码
  if (!loginForm.password) {
    formErrors.password = '请输入密码'
    isValid = false
  }
  
  return isValid
}

const handleLogin = async () => {
  if (!validateForm()) return
  
  isSubmitting.value = true
  
  try {
    // 使用Store登录
    await userStore.login({
      username: loginForm.username,
      password: loginForm.password
    })
    
    // 如果记住登录，存储用户信息到本地存储
    if (loginForm.remember) {
      localStorage.setItem('rememberUser', loginForm.username)
    } else {
      localStorage.removeItem('rememberUser')
    }
    
    // 登录成功提示
    message.success('登录成功，欢迎回来！')
    
    // 登录成功后重定向到首页
    router.push('/')
  } catch (error) {
    // 登录失败处理
    console.error('登录失败:', error)
    loginError.value = error instanceof Error ? error.message : '登录失败，请检查网络连接'
    message.error(loginError.value)
  } finally {
    isSubmitting.value = false
  }
}

// 检查是否有记住的用户
const checkRememberedUser = () => {
  const rememberedUser = localStorage.getItem('rememberUser')
  if (rememberedUser) {
    loginForm.username = rememberedUser
    loginForm.remember = true
  }
}

// 在组件挂载时检查
checkRememberedUser()
</script>

<style scoped>
.login-form {
  width: 100%;
  padding: 0px 30px 30px; /* 调整顶部padding */
}

h2 {
  text-align: center;
  margin-bottom: 8px;
  color: #333;
  font-size: 24px;
  font-weight: 600;
}

.subtitle {
  text-align: center;
  color: #666;
  font-size: 14px;
  margin-bottom: 30px;
}

/* 登录错误提示样式 */
.login-error-alert {
  background-color: #fff2f0;
  border: 1px solid #ffccc7;
  color: #ff4d4f;
  padding: 12px 16px;
  border-radius: 8px;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  animation: shakeError 0.5s cubic-bezier(.36,.07,.19,.97) both;
}

@keyframes shakeError {
  0%, 100% { transform: translateX(0); }
  10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
  20%, 40%, 60%, 80% { transform: translateX(5px); }
}

.form-group {
  margin-bottom: 20px;
  position: relative;
}

.form-group label {
  display: block;
  margin-bottom: 6px;
  font-size: 14px;
  color: #333;
  font-weight: 500;
}

.form-group input {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.3s;
  background-color: #f9f9f9;
}

.form-group input:focus {
  border-color: #1e3c72;
  outline: none;
  box-shadow: 0 0 0 3px rgba(30, 60, 114, 0.15);
  background-color: #fff;
}

.form-group input.error {
  border-color: #ff4d4f;
  background-color: #fff1f0;
}

.error-message {
  display: block;
  color: #ff4d4f;
  font-size: 12px;
  margin-top: 4px;
}

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.remember-me {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #666;
  font-size: 14px;
  cursor: pointer;
}

.remember-me input[type="checkbox"] {
  width: 16px;
  height: 16px;
  cursor: pointer;
}

.forget-password {
  color: #1e3c72;
  text-decoration: none;
  font-size: 14px;
  transition: color 0.3s;
}

.forget-password:hover {
  color: #2a5298;
  text-decoration: underline;
}

.submit-btn {
  width: 100%;
  padding: 12px;
  background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 8px rgba(30, 60, 114, 0.15);
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  min-height: 46px;
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(30, 60, 114, 0.2);
}

.submit-btn:active:not(:disabled) {
  transform: translateY(0);
}

.submit-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.form-footer {
  margin-top: 24px;
  text-align: center;
  font-size: 14px;
  color: #666;
}

.form-footer a {
  color: #1e3c72;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.3s;
}

.form-footer a:hover {
  color: #2a5298;
  text-decoration: underline;
}
</style>