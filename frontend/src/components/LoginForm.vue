<template>
  <div class="login-form">
    <h2>登录</h2>
    <form @submit.prevent="handleLogin">
      <div class="form-group">
        <input 
          type="text" 
          v-model="loginForm.username" 
          placeholder="用户名"
          required
        >
      </div>
      <div class="form-group">
        <input 
          type="password" 
          v-model="loginForm.password" 
          placeholder="密码"
          required
        >
      </div>
      <div class="form-options">
        <label class="remember-me">
          <input type="checkbox" v-model="loginForm.remember">
          <span>记住我</span>
        </label>
        <a href="#" class="forget-password">忘记密码？</a>
      </div>
      <button type="submit" class="submit-btn">登录</button>
      <div class="form-footer">
        <p>还没有账号？<router-link to="/register">立即注册</router-link></p>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue'

const loginForm = reactive({
  username: '',
  password: '',
  remember: false
})

const handleLogin = () => {
  // 处理登录逻辑
  console.log('登录表单提交:', loginForm)
}
</script>

<style scoped>
.login-form {
  width: 100%;
  padding: 30px;
}

h2 {
  text-align: center;
  margin-bottom: 30px;
  color: #333;
  font-size: 24px;
  font-weight: 500;
}

.form-group {
  margin-bottom: 20px;
}

.form-group input {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  transition: all 0.3s;
}

.form-group input:focus {
  border-color: #1e3c72;
  outline: none;
  box-shadow: 0 0 0 2px rgba(30, 60, 114, 0.1);
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
}

.forget-password:hover {
  text-decoration: underline;
}

.submit-btn {
  width: 100%;
  padding: 12px;
  background: #1e3c72;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.3s;
}

.submit-btn:hover {
  background: #2a5298;
}

.form-footer {
  margin-top: 20px;
  text-align: center;
  font-size: 14px;
  color: #666;
}

.form-footer a {
  color: #1e3c72;
  text-decoration: none;
  font-weight: 500;
}

.form-footer a:hover {
  text-decoration: underline;
}
</style> 