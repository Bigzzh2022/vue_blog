<template>
  <div class="register-form">
    <h2>注册</h2>
    <form @submit.prevent="handleSubmit">
      <!-- 用户名输入框 -->
      <div class="input-group">
        <input
          v-model="username"
          type="text"
          placeholder="用户名"
          required
          @input="validateUsername"
        >
        <!-- 用户名错误提示 -->
        <div v-if="usernameError" class="error-message">
          {{ usernameError }}
        </div>
      </div>

      <!-- 邮箱输入框 -->
      <div class="input-group">
        <input
          v-model="email"
          type="email"
          placeholder="邮箱"
          required
          @input="validateEmail"
        >
        <!-- 邮箱错误提示 -->
        <div v-if="emailError" class="error-message">
          {{ emailError }}
        </div>
      </div>

      <!-- 密码输入框 -->
      <div class="input-group">
        <div class="password-input">
          <input
            v-model="password"
            :type="showPassword ? 'text' : 'password'"
            placeholder="密码"
            required
            @input="validatePassword"
          >
          <button
            type="button"
            class="toggle-password"
            @click="togglePasswordVisibility"
          >
            <div class="i-ic-baseline-remove-red-eye" />
          </button>
        </div>

        <!-- 密码强度提示 -->
        <div class="password-strength" v-if="password">
          <div class="strength-info">
            <span>密码强度：</span>
            <span :class="strengthClass">{{ strengthText }}</span>
          </div>
          <!-- 密码强度进度条 -->
          <div class="strength-progress">
            <div 
              class="strength-progress-bar" 
              :style="{ width: strengthProgress + '%' }"
              :class="strengthProgressClass"
            ></div>
          </div>
          <!-- 密码要求列表 -->
          <div class="password-requirements">
            <div 
              v-for="(requirement, index) in passwordRequirements" 
              :key="index"
              class="requirement-item"
              :class="{ 'satisfied': requirement.satisfied }"
            >
              <span class="requirement-icon">
                {{ requirement.satisfied ? '✓' : '✗' }}
              </span>
              <span>{{ requirement.text }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 确认密码输入框 -->
      <div class="input-group">
        <div class="password-input">
          <input
            v-model="confirmPassword"
            :type="showPassword ? 'text' : 'password'"
            placeholder="确认密码"
            required
            @input="validateConfirmPassword"
          >
          <button
            type="button"
            class="toggle-password"
            @click="togglePasswordVisibility"
          >
            <div class="i-ic-baseline-remove-red-eye" />
          </button>
        </div>
        <!-- 密码不匹配提示 -->
        <div v-if="showPasswordMismatch" class="error-message">
          两次输入的密码不一致
        </div>
      </div>

      <!-- 注册按钮 -->
      <button
        type="submit"
        class="submit-button"
        :disabled="!isFormValid"
      >
        注册
      </button>

      <!-- 登录链接 -->
      <div class="login-link">
        已有账号？
        <router-link to="/login">立即登录</router-link>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useMessage } from 'naive-ui'

const router = useRouter()
const message = useMessage()

const username = ref('')
const usernameError = ref('')
const email = ref('')
const emailError = ref('')
const password = ref('')
const confirmPassword = ref('')
const showPassword = ref(false)
const passwordErrors = ref<string[]>([])
const showPasswordMismatch = ref(false)

// 密码强度相关
const strengthLevel = ref(-1)
const strengthText = computed(() => {
  if (strengthLevel.value === -1) return ''
  if (strengthLevel.value === 0) return '弱'
  if (strengthLevel.value === 1) return '中'
  return '强'
})
const strengthClass = computed(() => {
  return {
    'text-red-500': strengthLevel.value === 0,
    'text-yellow-500': strengthLevel.value === 1,
    'text-green-500': strengthLevel.value === 2
  }
})

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
    !showPasswordMismatch.value
  )
})

// 切换密码可见性
const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value
}

// 密码要求列表
const passwordRequirements = ref([
  { text: '长度至少8位', satisfied: false },
  { text: '包含大写字母', satisfied: false },
  { text: '包含小写字母', satisfied: false },
  { text: '包含数字', satisfied: false },
  { text: '包含特殊字符', satisfied: false }
])

// 计算密码强度进度
const strengthProgress = computed(() => {
  if (strengthLevel.value === -1) return 0
  return (strengthLevel.value + 1) * 33.33
})

// 进度条样式
const strengthProgressClass = computed(() => {
  return {
    'progress-weak': strengthLevel.value === 0,
    'progress-medium': strengthLevel.value === 1,
    'progress-strong': strengthLevel.value === 2
  }
})

// 修改验证密码强度函数
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
  let satisfiedCount = 0
  
  requirements.forEach(req => {
    const satisfied = req.test(pwd)
    passwordRequirements.value[req.index].satisfied = satisfied
    if (!satisfied) {
      errors.push(passwordRequirements.value[req.index].text)
    } else {
      satisfiedCount++
    }
  })

  passwordErrors.value = errors

  // 更合理的密码强度判断
  if (satisfiedCount === 0) {
    strengthLevel.value = -1 // 未输入
  } else if (satisfiedCount <= 2) {
    strengthLevel.value = 0  // 弱
  } else if (satisfiedCount <= 4) {
    strengthLevel.value = 1  // 中
  } else {
    strengthLevel.value = 2  // 强
  }

  if (confirmPassword.value) {
    validateConfirmPassword()
  }
}

// 验证确认密码
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
    // TODO: 实现注册逻辑
    const userData = {
      username: username.value.trim(),
      email: email.value.trim(),
      password: password.value
    }
    console.log('注册数据：', userData)
    message.success('注册成功')
    router.push('/login')
  } catch (error) {
    message.error('注册失败，请重试')
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
.register-container {
  min-height: 100vh;
  padding-top: 80px;
  background-color: #f5f7fa;
}

.register-form {
  max-width: 400px;
  margin: 0 auto;
  padding: 30px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

h2 {
  text-align: center;
  margin-bottom: 30px;
  font-size: 24px;
  font-weight: bold;
  color: #2c3e50;
}

.input-group {
  margin-bottom: 20px;
}

input {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
}

input:focus {
  outline: none;
  border-color: #4a90e2;
}

.password-input {
  position: relative;
}

.toggle-password {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  color: #666;
}

.password-strength {
  margin-top: 8px;
  font-size: 14px;
}

.error-message {
  color: #ff4d4f;
  font-size: 14px;
  margin-top: 4px;
  transition: all 0.3s ease;
}

.submit-button {
  width: 100%;
  padding: 12px;
  background-color: #4a90e2;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
}

.submit-button:hover {
  background-color: #357abd;
}

.submit-button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.login-link {
  text-align: center;
  margin-top: 16px;
  font-size: 14px;
}

.login-link a {
  color: #4a90e2;
  text-decoration: none;
}

.login-link a:hover {
  text-decoration: underline;
}

.text-red-500 {
  color: #ff4d4f;
}

.text-yellow-500 {
  color: #faad14;
}

.text-green-500 {
  color: #52c41a;
}

.strength-info {
  margin-bottom: 8px;
}

.strength-progress {
  height: 4px;
  background-color: #f0f0f0;
  border-radius: 2px;
  margin-bottom: 12px;
}

.strength-progress-bar {
  height: 100%;
  border-radius: 2px;
  transition: all 0.3s ease;
}

.progress-weak {
  background-color: #ff4d4f;
}

.progress-medium {
  background-color: #faad14;
}

.progress-strong {
  background-color: #52c41a;
}

.password-requirements {
  margin-top: 8px;
}

.requirement-item {
  display: flex;
  align-items: center;
  margin-bottom: 4px;
  font-size: 14px;
  color: #ff4d4f;
}

.requirement-item.satisfied {
  color: #52c41a;
}

.requirement-icon {
  margin-right: 8px;
  font-weight: bold;
}

.requirement-item.satisfied .requirement-icon {
  color: #52c41a;
}

/* 添加输入框错误状态样式 */
input.error {
  border-color: #ff4d4f;
}

input.error:focus {
  border-color: #ff4d4f;
  box-shadow: 0 0 0 2px rgba(255, 77, 79, 0.2);
}


</style>
