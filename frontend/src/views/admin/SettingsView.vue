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
          
          <NFormItem label="轮播图设置" path="carouselConfig">
            <div class="carousel-config">
              <NSwitch v-model:value="basicForm.carouselEnabled" />
              <span class="switch-label">{{ basicForm.carouselEnabled ? '启用' : '禁用' }}轮播图</span>
            </div>
            
            <div v-if="basicForm.carouselEnabled" class="mt-3">
              <NFormItem label="API地址" path="carouselApiUrl">
                <NInput 
                  v-model:value="basicForm.carouselApiUrl" 
                  placeholder="请输入图片API地址"
                />
              </NFormItem>
              
              <NFormItem label="图片数量" path="carouselImageCount">
                <NInputNumber 
                  v-model:value="basicForm.carouselImageCount" 
                  :min="1" 
                  :max="10"
                />
              </NFormItem>
              
              <NFormItem label="切换间隔(秒)" path="carouselInterval">
                <NInputNumber 
                  v-model:value="basicForm.carouselInterval" 
                  :min="2" 
                  :max="10"
                  :step="0.5"
                />
              </NFormItem>
            </div>
          </NFormItem>
          
          <NFormItem label="备案号" path="icp">
            <NInput v-model:value="basicForm.icp" placeholder="请输入备案号" />
          </NFormItem>
          
          <NFormItem label="建站年份" path="startYear">
            <NInputNumber v-model:value="basicForm.startYear" :min="2000" :max="2099" />
          </NFormItem>
          
          <NFormItem label="底部文本" path="footerText">
            <NInput v-model:value="basicForm.footerText" placeholder="请输入底部文本" />
          </NFormItem>
          
          <NFormItem label="底部链接" path="footerLinks">
            <NDynamicInput
              v-model:value="basicForm.footerLinks"
              :on-create="() => ({ name: '', url: '' })"
              #="{ value }"
            >
              <NSpace vertical>
                <NInput v-model:value="value.name" placeholder="链接名称" />
                <NInput v-model:value="value.url" placeholder="链接地址" />
              </NSpace>
            </NDynamicInput>
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
                <NSelect
                  v-model:value="value.icon"
                  :options="iconOptions"
                  placeholder="选择图标"
                />
              </NSpace>
            </NDynamicInput>
          </NFormItem>
          
          <NFormItem>
            <NButton type="primary" @click="handleProfileSubmit">保存资料</NButton>
          </NFormItem>
        </NForm>
      </NTabPane>
      
      <!-- 高级设置 -->
      <NTabPane name="advanced" tab="高级设置">
        <NForm
          ref="advancedFormRef"
          :model="advancedForm"
          label-placement="left"
          label-width="100"
          require-mark-placement="right-hanging"
        >
          <h3 class="setting-section-title">统计分析</h3>
          <NFormItem label="启用统计" path="analytics.enabled">
            <NSwitch v-model:value="advancedForm.analytics.enabled" />
          </NFormItem>
          
          <div v-if="advancedForm.analytics.enabled">
            <NFormItem label="统计类型" path="analytics.type">
              <NSelect
                v-model:value="advancedForm.analytics.type"
                :options="analyticsOptions"
              />
            </NFormItem>
            
            <NFormItem label="统计ID" path="analytics.id">
              <NInput v-model:value="advancedForm.analytics.id" placeholder="请输入统计ID" />
            </NFormItem>
            
            <NFormItem v-if="advancedForm.analytics.type === 'custom'" label="自定义脚本" path="analytics.script">
              <NInput 
                v-model:value="advancedForm.analytics.script" 
                type="textarea" 
                placeholder="请输入统计脚本"
              />
            </NFormItem>
          </div>
          
          <h3 class="setting-section-title">SEO设置</h3>
          <NFormItem label="关键词" path="seo.keywords">
            <NInput v-model:value="advancedForm.seo.keywords" placeholder="请输入网站关键词，用逗号分隔" />
          </NFormItem>
          
          <NFormItem label="描述" path="seo.description">
            <NInput 
              v-model:value="advancedForm.seo.description" 
              type="textarea"
              placeholder="请输入网站描述" 
            />
          </NFormItem>
          
          <NFormItem label="Robots" path="seo.robots">
            <NInput v-model:value="advancedForm.seo.robots" placeholder="例如：index,follow" />
          </NFormItem>
          
          <h3 class="setting-section-title">CDN设置</h3>
          <NFormItem label="启用CDN" path="cdn.enabled">
            <NSwitch v-model:value="advancedForm.cdn.enabled" />
          </NFormItem>
          
          <NFormItem v-if="advancedForm.cdn.enabled" label="CDN地址" path="cdn.url">
            <NInput v-model:value="advancedForm.cdn.url" placeholder="请输入CDN地址" />
          </NFormItem>
          
          <h3 class="setting-section-title">自定义代码</h3>
          <NFormItem label="头部代码" path="customHead">
            <NInput 
              v-model:value="advancedForm.customHead" 
              type="textarea" 
              placeholder="将被插入到<head>标签内"
            />
          </NFormItem>
          
          <NFormItem label="底部代码" path="customFooter">
            <NInput 
              v-model:value="advancedForm.customFooter" 
              type="textarea" 
              placeholder="将被插入到</body>标签前"
            />
          </NFormItem>
          
          <NFormItem>
            <NButton type="primary" @click="handleAdvancedSubmit">保存设置</NButton>
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
import { ref, onMounted } from 'vue'
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
  type UploadFileInfo,
  NSwitch
} from 'naive-ui'
import type { FormInst } from 'naive-ui'
import { useSettingsStore } from '@/stores/settings'

const message = useMessage()

// 基本设置表单
const basicFormRef = ref<FormInst | null>(null)
const basicForm = ref({
  siteTitle: '',
  siteDescription: '',
  siteLogo: '',
  postsPerPage: 10,
  theme: 'light',
  carouselEnabled: false,
  carouselApiUrl: '',
  carouselImageCount: 5,
  carouselInterval: 5,
  icp: '',
  startYear: new Date().getFullYear(),
  footerText: '',
  footerLinks: [] as Array<{ name: string; url: string }>
})

const themeOptions = [
  { label: '浅色主题', value: 'light' },
  { label: '深色主题', value: 'dark' },
  { label: '跟随系统', value: 'auto' }
]

// 从设置存储加载设置
const settingsStore = useSettingsStore()

onMounted(() => {
  // 从存储加载设置
  settingsStore.loadSettingsFromStorage()
  
  // 加载基本设置
  const settings = settingsStore.getBasicSettings()
  basicForm.value = { ...basicForm.value, ...settings }
  
  // 加载个人资料设置
  const profile = settingsStore.getProfileSettings()
  profileForm.value = { ...profileForm.value, ...profile }
  
  // 加载高级设置
  const advanced = settingsStore.getAdvancedSettings()
  advancedForm.value = { ...advancedForm.value, ...advanced }
})

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
  socialLinks: [] as Array<{ name: string; url: string; icon: string }>
})

// 社交媒体图标选项
const iconOptions = [
  { label: '微信', value: 'wechat' },
  { label: 'GitHub', value: 'github' },
  { label: '哔哩哔哩', value: 'bilibili' },
  { label: '知乎', value: 'zhihu' },
  { label: '微博', value: 'weibo' },
  { label: 'QQ', value: 'qq' },
  { label: '邮箱', value: 'email' },
  { label: '推特', value: 'twitter' },
  { label: 'Facebook', value: 'facebook' },
  { label: 'Instagram', value: 'instagram' },
  { label: 'YouTube', value: 'youtube' },
  { label: '掘金', value: 'juejin' },
  { label: 'Linkedin', value: 'linkedin' }
]

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

// 高级设置表单
const advancedFormRef = ref<FormInst | null>(null)
const advancedForm = ref({
  analytics: {
    enabled: false,
    type: 'google',
    id: '',
    script: ''
  },
  customHead: '',
  customFooter: '',
  seo: {
    keywords: '',
    description: '',
    robots: 'index,follow'
  },
  cdn: {
    enabled: false,
    url: ''
  }
})

// 统计分析类型选项
const analyticsOptions = [
  { label: 'Google Analytics', value: 'google' },
  { label: '百度统计', value: 'baidu' },
  { label: 'CNZZ统计', value: 'cnzz' },
  { label: '自定义统计', value: 'custom' }
]

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

// 处理头像上传
const handleAvatarUpload = (options: { file: UploadFileInfo, fileList: UploadFileInfo[] }) => {
  if (options.file.url) {
    profileForm.value.avatar = options.file.url
  }
}

// 处理Logo上传
const handleLogoUpload = (options: { file: UploadFileInfo, fileList: UploadFileInfo[] }) => {
  if (options.file.url) {
    basicForm.value.siteLogo = options.file.url
  }
}

// 创建社交链接项
const onCreateSocialLink = () => {
  return {
    name: '',
    url: '',
    icon: 'github'
  }
}

// 提交基本设置
const handleBasicSubmit = () => {
  basicFormRef.value?.validate(async (errors) => {
    if (!errors) {
      try {
        await settingsStore.saveBasicSettings(basicForm.value)
        message.success('基本设置保存成功')
      } catch (error) {
        message.error('保存设置失败')
      }
    }
  })
}

// 提交个人资料设置
const handleProfileSubmit = () => {
  profileFormRef.value?.validate(async (errors) => {
    if (!errors) {
      try {
        await settingsStore.saveProfileSettings(profileForm.value)
        message.success('个人资料保存成功')
      } catch (error) {
        message.error('保存资料失败')
      }
    }
  })
}

// 提交高级设置
const handleAdvancedSubmit = () => {
  try {
    settingsStore.saveAdvancedSettings(advancedForm.value)
    message.success('高级设置保存成功')
  } catch (error) {
    message.error('保存设置失败')
  }
}

// 提交安全设置
const handleSecuritySubmit = () => {
  securityFormRef.value?.validate((errors) => {
    if (!errors) {
      // 检查确认密码是否匹配
      if (securityForm.value.newPassword !== securityForm.value.confirmPassword) {
        message.error('两次输入的密码不一致')
        return
      }
      
      // 模拟修改密码请求
      message.success('密码修改成功')
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

.carousel-config {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
}

.switch-label {
  margin-left: 8px;
}

.setting-section-title {
  font-size: 18px;
  color: #333;
  margin-top: 30px;
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 1px solid #eee;
}
</style> 