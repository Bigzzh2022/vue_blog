<template>
  <div class="settings-manage">
    <NTabs type="line" animated>
      <!-- 基本设置 -->
      <NTabPane name="basic" tab="基本设置">
        <NForm
          ref="basicFormRef"
          :model="basicForm"
          :rules="basicRules"
          label-placement="left"
          label-width="100"
          require-mark-placement="right-hanging"
        >
          <NFormItem label="网站标题" path="siteTitle">
            <NInput v-model:value="basicForm.siteTitle" placeholder="请输入网站标题" />
          </NFormItem>
          
          <NFormItem label="网站描述" path="siteDescription">
            <NInput 
              v-model:value="basicForm.siteDescription" 
              type="textarea" 
              placeholder="请输入网站描述"
            />
          </NFormItem>
          
          <NFormItem label="网站Logo" path="siteLogo">
            <NUpload
              accept="image/*"
              :max="1"
              :default-file-list="basicForm.siteLogo ? [{
                id: 'logo',
                name: 'logo',
                status: 'finished',
                url: basicForm.siteLogo
              }] : []"
              @change="handleLogoUpload"
            >
              <NButton>上传Logo</NButton>
            </NUpload>
          </NFormItem>
          
          <NFormItem label="每页文章数" path="postsPerPage">
            <NInputNumber 
              v-model:value="basicForm.postsPerPage" 
              :min="1" 
              :max="50"
            />
          </NFormItem>
          
          <NFormItem label="默认主题" path="theme">
            <NSelect
              v-model:value="basicForm.theme"
              :options="themeOptions"
              placeholder="请选择默认主题"
            />
          </NFormItem>
          
          <NFormItem>
            <NButton type="primary" @click="handleBasicSubmit">保存设置</NButton>
          </NFormItem>
        </NForm>
      </NTabPane>

      <!-- 个人资料 -->
      <NTabPane name="profile" tab="个人资料">
        <NForm
          ref="profileFormRef"
          :model="profileForm"
          :rules="profileRules"
          label-placement="left"
          label-width="100"
          require-mark-placement="right-hanging"
        >
          <NFormItem label="头像" path="avatar">
            <NUpload
              accept="image/*"
              :max="1"
              :default-file-list="profileForm.avatar ? [{
                id: 'avatar',
                name: 'avatar',
                status: 'finished',
                url: profileForm.avatar
              }] : []"
              @change="handleAvatarUpload"
            >
              <NButton>上传头像</NButton>
            </NUpload>
          </NFormItem>
          
          <NFormItem label="昵称" path="nickname">
            <NInput v-model:value="profileForm.nickname" placeholder="请输入昵称" />
          </NFormItem>
          
          <NFormItem label="个人简介" path="bio">
            <NInput 
              v-model:value="profileForm.bio" 
              type="textarea" 
              placeholder="请输入个人简介"
            />
          </NFormItem>
          
          <NFormItem label="邮箱" path="email">
            <NInput v-model:value="profileForm.email" placeholder="请输入邮箱" />
          </NFormItem>
          
          <NFormItem label="社交链接" path="socialLinks">
            <NDynamicInput
              v-model:value="profileForm.socialLinks"
              :on-create="onCreateSocialLink"
              #="{ value }"
            >
              <NSpace vertical>
                <NInput v-model:value="value.name" placeholder="平台名称" />
                <NInput v-model:value="value.url" placeholder="链接地址" />
              </NSpace>
            </NDynamicInput>
          </NFormItem>
          
          <NFormItem>
            <NButton type="primary" @click="handleProfileSubmit">保存资料</NButton>
          </NFormItem>
        </NForm>
      </NTabPane>

      <!-- 安全设置 -->
      <NTabPane name="security" tab="安全设置">
        <NForm
          ref="securityFormRef"
          :model="securityForm"
          :rules="securityRules"
          label-placement="left"
          label-width="100"
          require-mark-placement="right-hanging"
        >
          <NFormItem label="原密码" path="oldPassword">
            <NInput
              v-model:value="securityForm.oldPassword"
              type="password"
              placeholder="请输入原密码"
              show-password-on="click"
            />
          </NFormItem>
          
          <NFormItem label="新密码" path="newPassword">
            <NInput
              v-model:value="securityForm.newPassword"
              type="password"
              placeholder="请输入新密码"
              show-password-on="click"
            />
          </NFormItem>
          
          <NFormItem label="确认密码" path="confirmPassword">
            <NInput
              v-model:value="securityForm.confirmPassword"
              type="password"
              placeholder="请再次输入新密码"
              show-password-on="click"
            />
          </NFormItem>
          
          <NFormItem>
            <NButton type="primary" @click="handleSecuritySubmit">修改密码</NButton>
          </NFormItem>
        </NForm>
      </NTabPane>
    </NTabs>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { 
  NTabs, 
  NTabPane,
  NForm,
  NFormItem,
  NInput,
  NInputNumber,
  NSelect,
  NUpload,
  NButton,
  NDynamicInput,
  NSpace,
  useMessage,
  type UploadFileInfo
} from 'naive-ui'
import type { FormInst } from 'naive-ui'

const message = useMessage()

// 基本设置表单
const basicFormRef = ref<FormInst | null>(null)
const basicForm = ref({
  siteTitle: '',
  siteDescription: '',
  siteLogo: '',
  postsPerPage: 10,
  theme: 'light'
})

const themeOptions = [
  { label: '浅色主题', value: 'light' },
  { label: '深色主题', value: 'dark' },
  { label: '跟随系统', value: 'auto' }
]

const basicRules = {
  siteTitle: {
    required: true,
    message: '请输入网站标题',
    trigger: 'blur'
  },
  siteDescription: {
    required: true,
    message: '请输入网站描述',
    trigger: 'blur'
  }
}

// 个人资料表单
const profileFormRef = ref<FormInst | null>(null)
const profileForm = ref({
  avatar: '',
  nickname: '',
  bio: '',
  email: '',
  socialLinks: [] as { name: string; url: string }[]
})

const profileRules = {
  nickname: {
    required: true,
    message: '请输入昵称',
    trigger: 'blur'
  },
  email: {
    required: true,
    message: '请输入邮箱',
    trigger: 'blur',
    validator: (rule: any, value: string) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(value)) {
        return new Error('请输入有效的邮箱地址')
      }
      return true
    }
  }
}

// 安全设置表单
const securityFormRef = ref<FormInst | null>(null)
const securityForm = ref({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const securityRules = {
  oldPassword: {
    required: true,
    message: '请输入原密码',
    trigger: 'blur'
  },
  newPassword: {
    required: true,
    message: '请输入新密码',
    trigger: 'blur',
    validator: (rule: any, value: string) => {
      if (value.length < 6) {
        return new Error('密码长度不能小于6位')
      }
      return true
    }
  },
  confirmPassword: {
    required: true,
    message: '请再次输入新密码',
    trigger: 'blur',
    validator: (rule: any, value: string) => {
      if (value !== securityForm.value.newPassword) {
        return new Error('两次输入的密码不一致')
      }
      return true
    }
  }
}

// 处理Logo上传
const handleLogoUpload = ({ file }: { file: UploadFileInfo }) => {
  console.log('Logo upload:', file)
  // 实际项目中这里需要处理文件上传
  basicForm.value.siteLogo = URL.createObjectURL(file.file as File)
  message.success('Logo上传成功')
}

// 处理头像上传
const handleAvatarUpload = ({ file }: { file: UploadFileInfo }) => {
  console.log('Avatar upload:', file)
  // 实际项目中这里需要处理文件上传
  profileForm.value.avatar = URL.createObjectURL(file.file as File)
  message.success('头像上传成功')
}

// 创建社交链接
const onCreateSocialLink = () => {
  return {
    name: '',
    url: ''
  }
}

// 提交基本设置
const handleBasicSubmit = () => {
  basicFormRef.value?.validate((errors) => {
    if (!errors) {
      console.log('Basic settings:', basicForm.value)
      message.success('基本设置已保存')
    }
  })
}

// 提交个人资料
const handleProfileSubmit = () => {
  profileFormRef.value?.validate((errors) => {
    if (!errors) {
      console.log('Profile:', profileForm.value)
      message.success('个人资料已保存')
    }
  })
}

// 提交安全设置
const handleSecuritySubmit = () => {
  securityFormRef.value?.validate((errors) => {
    if (!errors) {
      console.log('Security:', securityForm.value)
      message.success('密码已修改')
      // 清空表单
      securityForm.value = {
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
      }
    }
  })
}
</script>

<style scoped>
.settings-manage {
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
}

:deep(.n-form) {
  max-width: 600px;
}

:deep(.n-upload) {
  width: 100%;
}

:deep(.n-input-number) {
  width: 160px;
}

:deep(.n-dynamic-input-item) {
  width: 100%;
}

:deep(.n-space) {
  width: 100%;
}

:deep(.n-input) {
  width: 100%;
}

:deep(.n-select) {
  width: 160px;
}

:deep(.n-tab-pane) {
  padding: 24px 0;
}
</style> 