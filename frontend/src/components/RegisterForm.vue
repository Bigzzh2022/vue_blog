<template>
  <div class="register-form">
    <form @submit.prevent="handleSubmit">
      <!-- 用户名输入框 -->
      <div class="form-group">
        <label for="username">用户名</label>
        <input
          id="username"
          v-model="username"
          type="text"
          placeholder="请输入用户名"
          required
          :class="{ 'error': usernameError }"
          @input="validateUsername"
          autocomplete="username"
        >
        <!-- 用户名错误提示 -->
        <span v-if="usernameError" class="error-message">
          {{ usernameError }}
        </span>
      </div>

      <!-- 邮箱输入框 -->
      <div class="form-group">
        <label for="email">邮箱</label>
        <input
          id="email"
          v-model="email"
          type="email"
          placeholder="请输入邮箱"
          required
          :class="{ 'error': emailError }"
          @input="validateEmail"
          autocomplete="email"
        >
        <!-- 邮箱错误提示 -->
        <span v-if="emailError" class="error-message">
          {{ emailError }}
        </span>
      </div>

      <!-- 密码输入框 -->
      <div class="form-group">
        <label for="password">密码</label>
        <input
          id="password"
          v-model="password"
          type="password"
          placeholder="请输入密码"
          required
          @input="validatePassword"
          autocomplete="new-password"
        >
      </div>

      <!-- 确认密码输入框 -->
      <div class="form-group">
        <label for="confirmPassword">确认密码</label>
        <input
          id="confirmPassword"
          v-model="confirmPassword"
          type="password"
          placeholder="请再次输入密码"
          required
          @input="validateConfirmPassword"
          autocomplete="new-password"
        >
        <!-- 密码不匹配提示 -->
        <span v-if="showPasswordMismatch" class="error-message">
          两次输入的密码不一致
        </span>
      </div>

      <!-- 注册协议勾选 -->
      <div class="form-group agreement-group">
        <label class="agreement-label">
          <input
            type="checkbox"
            v-model="agreeTerms"
          >
          <span>我已阅读并同意 <router-link to="/terms" target="_blank">使用条款</router-link> 和 <router-link to="/privacy" target="_blank">隐私政策</router-link></span>
        </label>
      </div>

      <!-- 注册按钮 -->
      <button
        type="submit"
        class="submit-btn"
        :disabled="!isFormValid || isSubmitting"
      >
        <span v-if="isSubmitting">
          <font-awesome-icon :icon="['fas', 'spinner']" spin />
          注册中...
        </span>
        <span v-else>创建账号</span>
      </button>

      <!-- 登录链接 -->
      <div class="form-footer">
        <p>已有账号？<router-link to="/login">立即登录</router-link></p>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useMessage } from 'naive-ui'
import { useUserStore } from '@/stores/user'
import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { 
  faCheck, 
  faTimes, 
  faSpinner 
} from '@fortawesome/free-solid-svg-icons'

// 添加 FontAwesome 图标到库
library.add(
  faCheck, 
  faTimes, 
  faSpinner
)

const router = useRouter()
const message = useMessage()
const userStore = useUserStore()

const username = ref('')
const usernameError = ref('')
const email = ref('')
const emailError = ref('')
const password = ref('')
const confirmPassword = ref('')
const passwordErrors = ref<string[]>([])
const showPasswordMismatch = ref(false)
const agreeTerms = ref(false)
const isSubmitting = ref(false)

// 表单验证
const isFormValid = computed(() => {
  return (
    username.value &&
    !usernameError.value &&
    email.value &&
    !emailError.value &&
    password.value &&
    confirmPassword.value &&
    passwordErrors.value.length === 0 &&
    !showPasswordMismatch.value &&
    agreeTerms.value
  )
})

// 简化验证密码函数，移除强度评估
const validatePassword = () => {
  const pwd = password.value
  const requirements = [
    { test: (p: string) => p.length >= 8, index: 0 },
    { test: (p: string) => /[A-Z]/.test(p), index: 1 },
    { test: (p: string) => /[a-z]/.test(p), index: 2 },
    { test: (p: string) => /\d/.test(p), index: 3 },
    { test: (p: string) => /[!@#$%^&*(),.?":{}|<>+\-_=\[\];'~`/\\]/.test(p), index: 4 }
  ]

  const errors: string[] = []
  
  requirements.forEach(req => {
    if (!req.test(pwd)) {
      // 仅收集错误信息，不再处理UI显示
      errors.push('')
    }
  })

  passwordErrors.value = errors

  if (confirmPassword.value) {
    validateConfirmPassword()
  }
}

// 保留其他验证函数
const validateConfirmPassword = () => {
  if (confirmPassword.value) {
    showPasswordMismatch.value = password.value !== confirmPassword.value
  } else {
    showPasswordMismatch.value = false
  }
}

// 提交表单
const handleSubmit = async () => {
  if (!isFormValid.value) return

  try {
    isSubmitting.value = true
    
    // 使用Store注册
    await userStore.register({
      username: username.value.trim(),
      email: email.value.trim(),
      password: password.value
    })
    
    // 注册成功提示
    message.success('注册成功，即将为您跳转到登录页面')
    
    // 延迟跳转，让用户看到成功消息
    setTimeout(() => {
      router.push('/login')
    }, 1500)
  } catch (error) {
    console.error('注册失败:', error)
    message.error(error instanceof Error ? error.message : '注册失败，请重试')
  } finally {
    isSubmitting.value = false
  }
}

// 邮箱验证正则表达式
const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/

// 常见邮箱域名列表
const commonEmailDomains = [
  'gmail.com',
  'outlook.com',
  'hotmail.com',
  'yahoo.com',
  'qq.com',
  '163.com',
  '126.com'
]

// 验证邮箱
const validateEmail = () => {
  const emailValue = email.value.trim()
  emailError.value = ''

  if (!emailValue) {
    emailError.value = '请输入邮箱地址'
    return
  }

  if (!emailRegex.test(emailValue)) {
    emailError.value = '请输入有效的邮箱地址'
    return
  }

  // 检查邮箱域名拼写
  const domain = emailValue.split('@')[1]
  const similarDomain = commonEmailDomains.find(d => 
    d.toLowerCase() === domain.toLowerCase() ||
    levenshteinDistance(d.toLowerCase(), domain.toLowerCase()) <= 2
  )

  if (similarDomain && domain !== similarDomain) {
    emailError.value = `您是不是要输入 ${emailValue.split('@')[0]}@${similarDomain}？`
    return
  }
}

// 计算字符串编辑距离（用于检查拼写错误）
const levenshteinDistance = (a: string, b: string): number => {
  if (a.length === 0) return b.length
  if (b.length === 0) return a.length

  const matrix = []

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i]
  }

  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1]
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        )
      }
    }
  }

  return matrix[b.length][a.length]
}

// 用户名验证规则
const usernameRules = {
  minLength: 3,
  maxLength: 20,
  pattern: /^[a-zA-Z0-9_\u4e00-\u9fa5]+$/
}

// 敏感词列表
const sensitiveWords = [
  'admin', 'administrator', 'root', 'system',
  'superuser', 'moderator', 'official', 'staff',
  '管理员', '系统', '官方', '版主',
  // 不文明用语
  'fuck', 'shit', '傻逼', '狗屎',
  // 特殊字符组合
  '666', '777', '888', '999',
  // 可以继续添加其他敏感词
]

// 检查敏感词的函数
const containsSensitiveWord = (text: string): string | null => {
  const lowerText = text.toLowerCase()
  for (const word of sensitiveWords) {
    if (lowerText.includes(word.toLowerCase())) {
      return word
    }
  }
  return null
}

// 修改验证用户名函数
const validateUsername = () => {
  const value = username.value.trim()
  usernameError.value = ''

  if (!value) {
    usernameError.value = '请输入用户名'
    return
  }

  if (value.length < usernameRules.minLength) {
    usernameError.value = `用户名至少需要 ${usernameRules.minLength} 个字符`
    return
  }

  if (value.length > usernameRules.maxLength) {
    usernameError.value = `用户名不能超过 ${usernameRules.maxLength} 个字符`
    return
  }

  if (!usernameRules.pattern.test(value)) {
    usernameError.value = '用户名只能包含字母、数字、下划线和中文'
    return
  }

  // 敏感词检测
  const sensitiveWord = containsSensitiveWord(value)
  if (sensitiveWord) {
    usernameError.value = '用户名包含不适当的词语，请修改'
    return
  }

  // 连续字符检测
  if (/(.)\1{4,}/.test(value)) {
    usernameError.value = '用户名不能包含过多重复字符'
    return
  }

  // 纯数字检测
  if (/^\d+$/.test(value)) {
    usernameError.value = '用户名不能为纯数字'
    return
  }

  // 特殊组合检测
  if (/^[_\d]/.test(value)) {
    usernameError.value = '用户名不能以下划线或数字开头'
    return
  }

  // 空格检测
  if (/\s/.test(value)) {
    usernameError.value = '用户名不能包含空格'
    return
  }
}
</script>

<style scoped>
.register-form {
  max-width: 100%;
  padding: 0px 30px 30px;
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

input {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.3s;
  background-color: #f9f9f9;
  box-sizing: border-box;
  color: #333;
}

input:focus {
  border-color: #1e3c72;
  outline: none;
  box-shadow: 0 0 0 3px rgba(30, 60, 114, 0.15);
  background-color: #fff;
}

input.error {
  border-color: #ff4d4f;
  background-color: #fff1f0;
}

.error-message {
  color: #ff4d4f;
  font-size: 12px;
  margin-top: 4px;
  display: block;
}

.password-input-wrapper {
  position: relative;
}

.password-toggle {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  color: #666;
  transition: color 0.3s;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}

.password-toggle:hover {
  color: #1e3c72;
  background-color: rgba(0, 0, 0, 0.04);
}

.password-toggle:focus {
  outline: none;
}

.agreement-group {
  margin-top: 10px;
  margin-bottom: 10px;
}

.agreement-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 14px;
  color: #666;
}

.agreement-label input[type="checkbox"] {
  width: 18px;
  height: 18px;
  margin: 0;
  cursor: pointer;
  accent-color: #1e3c72;
  flex-shrink: 0;
}

.agreement-label span {
  font-size: 14px;
  color: #666;
  line-height: 18px;
}

.agreement-label a {
  color: #1e3c72;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s;
}

.agreement-label a:hover {
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
  margin-top: 15px;
  box-shadow: 0 4px 8px rgba(30, 60, 114, 0.15);
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  height: 46px;
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
  background: linear-gradient(135deg, #5a6d91 0%, #6f83b1 100%);
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
}

.form-footer a:hover {
  color: #2a5298;
  text-decoration: underline;
}

@media (max-width: 480px) {
  .register-form {
    padding: 20px;
  }
}
</style>
