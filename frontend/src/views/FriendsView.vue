<template>
  <div class="friends-view">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2 class="section-title">
        <NIcon size="24" class="title-icon">
          <TeamOutlined />
        </NIcon>
        友情链接
      </h2>
      <p class="section-desc">链接成就价值，分享创造精彩</p>
    </div>

    <!-- 统计信息 -->
    <div class="stats-row">
      <NStat label="友链总数" tabular-nums>
        <template #value>
          <span class="stat-value">{{ linkStore.approvedLinks.length }}</span>
        </template>
      </NStat>
    </div>

    <!-- 申请说明 -->
    <div class="apply-info">
      <NAlert type="info" class="apply-alert">
        <template #icon>
          <NIcon><InformationOutline /></NIcon>
        </template>
        <template #header>
          申请说明
        </template>
        <div class="apply-content">
          <p>欢迎交换友链！请确保您的网站：</p>
          <ul>
            <li>网站内容健康向上</li>
            <li>网站稳定运行且支持 HTTPS</li>
            <li>网站已添加本站友链</li>
          </ul>
          <p>本站信息：</p>
          <ul>
            <li>名称：渐开线的小窝</li>
            <li>链接：https://example.com</li>
            <li>描述：给时光以生命，给岁月以文明</li>
            <li>头像：https://example.com/avatar.jpg</li>
          </ul>
        </div>
      </NAlert>
    </div>

    <!-- 友链列表 -->
    <div class="friends-grid">
      <NCard 
        v-for="friend in friends" 
        :key="friend.id"
        class="friend-card"
        hoverable
      >
        <div class="friend-content">
          <div class="friend-avatar">
            <img 
              :src="friend.icon" 
              :alt="friend.name"
              @error="handleImageError"
            >
          </div>
          <div class="friend-info">
            <h3 class="friend-name">
              <a :href="friend.url" target="_blank" rel="noopener noreferrer">
                {{ friend.name }}
              </a>
            </h3>
            <p class="friend-desc">{{ friend.description }}</p>
          </div>
        </div>
      </NCard>
    </div>

    <!-- 申请表单 -->
    <div class="apply-section">
      <h3 class="apply-title">申请友链</h3>
      <NForm
        ref="formRef"
        :model="formValue"
        :rules="rules"
        label-placement="left"
        label-width="80"
        require-mark-placement="right-hanging"
      >
        <NFormItem label="网站名称" path="name">
          <NInput v-model:value="formValue.name" placeholder="请输入您的网站名称" />
        </NFormItem>
        
        <NFormItem label="网站链接" path="url">
          <NInput v-model:value="formValue.url" placeholder="请输入您的网站链接" />
        </NFormItem>

        <NFormItem label="网站头像" path="icon">
          <NInput v-model:value="formValue.icon" placeholder="请输入您的网站头像链接" />
        </NFormItem>

        <NFormItem label="网站描述" path="description">
          <NInput 
            v-model:value="formValue.description" 
            type="textarea" 
            placeholder="请简单介绍您的网站" 
          />
        </NFormItem>

        <NFormItem>
          <NButton type="primary" @click="handleSubmit" :loading="submitting">
            提交申请
          </NButton>
        </NFormItem>
      </NForm>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { 
  NCard, 
  NSpace, 
  NIcon, 
  NAlert,
  NForm,
  NFormItem,
  NInput,
  NButton,
  NSelect,
  useMessage
} from 'naive-ui'
import NStat from '@/components/NStat.vue'
import type { FormInst } from 'naive-ui'
import { TeamOutlined, LinkOutlined } from '@vicons/antd'
import { InformationOutline } from '@vicons/ionicons5'
import { useLinkStore, type FriendLink } from '@/stores/links'

const message = useMessage()
const formRef = ref<FormInst | null>(null)
const submitting = ref(false)
const linkStore = useLinkStore()

// 加载友链数据
onMounted(async () => {
  if (!linkStore.loaded) {
    await linkStore.loadLinks()
  }
})

// 表单数据
const formValue = ref({
  name: '',
  url: '',
  icon: '',
  description: '',
  status: 'pending'
})

// 表单验证规则
const rules = {
  name: {
    required: true,
    message: '请输入网站名称',
    trigger: 'blur'
  },
  url: {
    required: true,
    message: '请输入网站链接',
    trigger: 'blur',
    validator: (rule: any, value: string) => {
      try {
        new URL(value)
        return true
      } catch {
        return new Error('请输入有效的URL')
      }
    }
  },
  icon: {
    required: true,
    message: '请输入头像链接',
    trigger: 'blur',
    validator: (rule: any, value: string) => {
      try {
        new URL(value)
        return true
      } catch {
        return new Error('请输入有效的URL')
      }
    }
  },
  description: {
    required: true,
    message: '请输入网站描述',
    trigger: 'blur'
  }
}

// 获取已批准的友链
const friends = computed(() => linkStore.approvedLinks)

// 处理图片加载错误
const handleImageError = (e: Event) => {
  const target = e.target as HTMLImageElement
  target.src = 'https://api.dicebear.com/7.x/adventurer/svg?seed=default' // 设置默认头像
}

// 处理表单提交
const handleSubmit = () => {
  formRef.value?.validate(async (errors) => {
    if (!errors) {
      submitting.value = true
      try {
        const result = await linkStore.addLink({
          name: formValue.value.name,
          url: formValue.value.url,
          icon: formValue.value.icon,
          description: formValue.value.description,
          status: 'pending'
        })
        
        if (result) {
          message.success('申请已提交，请等待审核')
          // 重置表单
          formValue.value = {
            name: '',
            url: '',
            icon: '',
            description: '',
            status: 'pending'
          }
        } else {
          message.error('提交失败，请稍后重试')
        }
      } catch (error) {
        message.error('提交失败，请稍后重试')
      } finally {
        submitting.value = false
      }
    }
  })
}
</script>

<style scoped>
.friends-view {
  max-width: 1200px;
  margin: 0 auto;
  padding: 80px 20px 40px;
  min-height: 100vh;
}

.page-header {
  text-align: center;
  margin-bottom: 40px;
}

.section-title {
  font-size: 28px;
  color: #333;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.title-icon {
  color: #18a058;
}

.section-desc {
  color: #666;
  font-size: 16px;
}

.stats-row {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
  margin-bottom: 24px;
}

.stat-value {
  font-size: 24px;
  font-weight: 600;
  color: #18a058;
}

.apply-info {
  margin-bottom: 40px;
}

.apply-content {
  font-size: 14px;
  line-height: 1.6;
}

.apply-content ul {
  margin: 8px 0;
  padding-left: 20px;
}

.friends-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  margin-bottom: 60px;
}

.friend-card {
  transition: all 0.3s ease;
}

.friend-card:hover {
  transform: translateY(-4px);
}

.friend-content {
  display: flex;
  gap: 16px;
}

.friend-avatar {
  flex-shrink: 0;
}

.friend-avatar img {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  object-fit: cover;
}

.friend-info {
  flex-grow: 1;
  min-width: 0;
}

.friend-name {
  margin: 0 0 8px;
  font-size: 16px;
}

.friend-name a {
  color: #333;
  text-decoration: none;
  transition: color 0.3s;
}

.friend-name a:hover {
  color: #18a058;
}

.friend-desc {
  margin: 0;
  color: #666;
  font-size: 14px;
  line-height: 1.6;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  display: flex;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  box-orient: vertical;
  max-height: 3.2em;
}

.apply-section {
  max-width: 600px;
  margin: 0 auto;
  padding: 40px;
  background: #f9f9f9;
  border-radius: 8px;
}

.apply-title {
  font-size: 20px;
  color: #333;
  margin-bottom: 24px;
  text-align: center;
}

@media (max-width: 768px) {
  .friends-view {
    padding: 60px 16px 24px;
  }

  .section-title {
    font-size: 24px;
  }

  .friends-grid {
    grid-template-columns: 1fr;
  }

  .apply-section {
    padding: 20px;
  }
}
</style> 