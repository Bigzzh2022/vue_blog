<template>
  <div class="user-center-view">
    <div v-if="loading" class="loading-state">
      <n-spin size="large" />
      <p>加载用户数据中...</p>
    </div>
    <div v-else class="user-center-container">
      <div class="user-profile-section">
        <div class="user-avatar">
          <img v-if="userInfo?.avatar" :src="userInfo.avatar" :alt="userInfo?.username">
          <div v-else class="avatar-placeholder">{{ userInfo?.username ? userInfo.username.charAt(0).toUpperCase() : 'U' }}</div>
        </div>
        <div class="user-info">
          <h2>{{ userInfo?.username || '用户名' }}</h2>
          <p class="user-email">{{ userInfo?.email || 'email@example.com' }}</p>
          <p class="join-date">加入时间: {{ formatDate(userInfo?.createdAt) }}</p>
        </div>
      </div>
      
      <div class="user-tabs">
        <n-tabs type="line" animated>
          <n-tab-pane name="profile" tab="个人资料">
            <div class="profile-form">
              <div class="form-group">
                <label>用户名</label>
                <input type="text" v-model="profile.username" placeholder="用户名">
              </div>
              <div class="form-group">
                <label>邮箱</label>
                <input type="email" v-model="profile.email" placeholder="电子邮箱" disabled>
              </div>
              <div class="form-group">
                <label>个人简介</label>
                <textarea v-model="profile.bio" placeholder="介绍一下自己吧..."></textarea>
              </div>
              <div class="form-actions">
                <n-button type="primary" @click="updateProfile" :loading="profileLoading">保存更改</n-button>
              </div>
            </div>
          </n-tab-pane>
          
          <n-tab-pane name="security" tab="安全设置">
            <div class="security-form">
              <h3>修改密码</h3>
              <div class="form-group">
                <label>当前密码</label>
                <input type="password" v-model="security.currentPassword" placeholder="当前密码">
              </div>
              <div class="form-group">
                <label>新密码</label>
                <input type="password" v-model="security.newPassword" placeholder="新密码">
              </div>
              <div class="form-group">
                <label>确认新密码</label>
                <input type="password" v-model="security.confirmPassword" placeholder="确认新密码">
              </div>
              <div class="form-actions">
                <n-button type="primary" @click="updatePassword" :loading="passwordLoading">更新密码</n-button>
              </div>
            </div>
          </n-tab-pane>
          
          <n-tab-pane name="notifications" tab="通知设置">
            <div class="notification-settings">
              <div class="setting-item">
                <div class="setting-label">
                  <h4>电子邮件通知</h4>
                  <p>接收关于评论、回复等的电子邮件通知</p>
                </div>
                <n-switch v-model:value="notifications.email" />
              </div>
              
              <div class="setting-item">
                <div class="setting-label">
                  <h4>系统通知</h4>
                  <p>接收网站更新、维护等的系统通知</p>
                </div>
                <n-switch v-model:value="notifications.system" />
              </div>
              
              <div class="setting-item">
                <div class="setting-label">
                  <h4>评论通知</h4>
                  <p>有人评论你的文章时通知您</p>
                </div>
                <n-switch v-model:value="notifications.comments" />
              </div>
              
              <div class="form-actions">
                <n-button type="primary" @click="saveNotificationSettings" :loading="notificationLoading">保存设置</n-button>
              </div>
            </div>
          </n-tab-pane>
          
          <n-tab-pane name="history" tab="浏览历史">
            <div class="browsing-history">
              <div v-if="history.length > 0" class="history-list">
                <div v-for="(item, index) in history" :key="index" class="history-item">
                  <div class="history-content">
                    <router-link :to="`/article/${item.id}`" class="history-title">{{ item.title }}</router-link>
                    <span class="history-date">{{ formatDate(item.date) }}</span>
                  </div>
                  <n-button text type="error" @click="removeHistoryItem(index)">
                    删除
                  </n-button>
                </div>
              </div>
              <div v-else class="empty-state">
                <p>暂无浏览历史</p>
              </div>
              <div class="history-actions" v-if="history.length > 0">
                <n-button @click="clearHistory">清空浏览历史</n-button>
              </div>
            </div>
          </n-tab-pane>
        </n-tabs>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { NTabs, NTabPane, NButton, NSwitch, NSpin } from 'naive-ui'
import { useMessage } from 'naive-ui'
import { useUserStore } from '@/stores/user'
import { userService, type UserInfo } from '@/services/userService'

const userStore = useUserStore()
const message = useMessage()

// 用户信息
const userInfo = ref<UserInfo | null>(null)

// 个人资料表单
const profile = reactive({
  username: '',
  email: '',
  bio: '',
})

// 安全设置
const security = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
})

// 通知设置
const notifications = reactive({
  email: true,
  system: true,
  comments: true,
})

// 浏览历史
const history = ref<{ id: string, title: string, date: string }[]>([])

// 加载状态
const loading = ref(false)
const profileLoading = ref(false)
const passwordLoading = ref(false)
const notificationLoading = ref(false)

// 格式化日期
const formatDate = (dateString?: string) => {
  if (!dateString) return '未知日期'
  return new Date(dateString).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

// 更新个人资料
const updateProfile = async () => {
  if (!userInfo.value) {
    message.error('用户未登录')
    return
  }
  
  profileLoading.value = true
  
  try {
    // 这里应该调用后端更新用户资料的API
    // 如果后端没有相应的API，可以模拟成功响应
    // const updatedUser = await userService.updateProfile(profile)
    // userStore.currentUser = updatedUser
    
    // 模拟成功响应
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // 更新存储中的用户信息
    if (userInfo.value) {
      userInfo.value.username = profile.username
      // 其他字段更新...
    }
    
    message.success('个人资料更新成功')
  } catch (error) {
    console.error('更新个人资料失败:', error)
    message.error('更新个人资料失败')
  } finally {
    profileLoading.value = false
  }
}

// 更新密码
const updatePassword = async () => {
  if (!userInfo.value) {
    message.error('用户未登录')
    return
  }
  
  if (security.newPassword !== security.confirmPassword) {
    message.error('两次输入的密码不一致')
    return
  }
  
  if (!security.currentPassword || !security.newPassword) {
    message.error('请填写完整的密码信息')
    return
  }
  
  passwordLoading.value = true
  
  try {
    // 这里应该调用后端更新密码的API
    // 如果后端没有相应的API，可以模拟成功响应
    // await userService.updatePassword({
    //   currentPassword: security.currentPassword,
    //   newPassword: security.newPassword
    // })
    
    // 模拟成功响应
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    message.success('密码更新成功')
    security.currentPassword = ''
    security.newPassword = ''
    security.confirmPassword = ''
  } catch (error) {
    console.error('更新密码失败:', error)
    message.error('更新密码失败')
  } finally {
    passwordLoading.value = false
  }
}

// 保存通知设置
const saveNotificationSettings = async () => {
  if (!userInfo.value) {
    message.error('用户未登录')
    return
  }
  
  notificationLoading.value = true
  
  try {
    // 这里应该调用后端保存通知设置的API
    // 如果后端没有相应的API，可以模拟成功响应
    // await userService.updateNotificationSettings(notifications)
    
    // 模拟成功响应
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    message.success('通知设置已保存')
  } catch (error) {
    console.error('保存通知设置失败:', error)
    message.error('保存通知设置失败')
  } finally {
    notificationLoading.value = false
  }
}

// 移除历史记录项
const removeHistoryItem = async (index: number) => {
  try {
    // 这里应该调用后端删除历史记录的API
    // 如果后端没有相应的API，可以直接修改前端数据
    const itemToRemove = history.value[index]
    // await userService.removeHistoryItem(itemToRemove.id)
    
    // 从前端列表中移除
    history.value.splice(index, 1)
    
    // 如果使用localStorage存储，可以更新localStorage
    localStorage.setItem('browsing_history', JSON.stringify(history.value))
    
    message.success('已移除浏览记录')
  } catch (error) {
    console.error('移除浏览记录失败:', error)
    message.error('移除浏览记录失败')
  }
}

// 清空历史记录
const clearHistory = async () => {
  try {
    // 这里应该调用后端清空历史记录的API
    // 如果后端没有相应的API，可以直接修改前端数据
    // await userService.clearHistory()
    
    // 清空前端列表
    history.value = []
    
    // 如果使用localStorage存储，可以清空相应的数据
    localStorage.removeItem('browsing_history')
    
    message.success('已清空浏览历史')
  } catch (error) {
    console.error('清空浏览历史失败:', error)
    message.error('清空浏览历史失败')
  }
}

// 加载用户数据
onMounted(async () => {
  loading.value = true
  
  try {
    // 如果用户已登录，获取用户信息
    if (userStore.isLoggedIn) {
      // 尝试从后端获取最新的用户信息
      try {
        const freshUserInfo = await userService.getUserInfo()
        if (freshUserInfo) {
          userInfo.value = freshUserInfo
        } else {
          // 如果后端获取失败，使用存储中的用户信息
          userInfo.value = userStore.currentUser
        }
      } catch (error) {
        console.error('获取用户信息失败:', error)
        userInfo.value = userStore.currentUser
      }
      
      // 填充表单数据
      if (userInfo.value) {
        profile.username = userInfo.value.username
        profile.email = userInfo.value.email
        // 如果有其他字段，也可以填充
      }
      
      // 加载浏览历史
      const savedHistory = localStorage.getItem('browsing_history')
      if (savedHistory) {
        try {
          history.value = JSON.parse(savedHistory)
        } catch (error) {
          console.error('解析浏览历史失败:', error)
          history.value = []
        }
      }
    }
  } catch (error) {
    console.error('初始化用户中心失败:', error)
    message.error('加载用户数据失败')
  } finally {
    loading.value = false
  }
  // 可以在这里加载用户数据
  console.log('用户中心页面已加载')
})
</script>

<style scoped>
.user-center-view {
  max-width: 1000px;
  margin: 40px auto;
  padding: 0 20px;
}

.user-center-container {
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.user-profile-section {
  padding: 40px;
  background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
  color: white;
  display: flex;
  align-items: center;
  gap: 30px;
}

.user-avatar {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  overflow: hidden;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
  flex-shrink: 0;
}

.user-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  background-color: #4a5568;
  color: white;
  font-size: 36px;
  font-weight: bold;
}

.user-info h2 {
  margin: 0 0 8px;
  font-size: 28px;
  font-weight: 600;
}

.user-email {
  margin: 0 0 4px;
  opacity: 0.9;
  font-size: 16px;
}

.join-date {
  margin: 0;
  opacity: 0.7;
  font-size: 14px;
}

.user-tabs {
  padding: 30px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #333;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
}

.form-group textarea {
  min-height: 120px;
  resize: vertical;
}

.form-actions {
  margin-top: 30px;
}

.security-form h3 {
  margin-top: 0;
  margin-bottom: 24px;
  font-size: 18px;
  color: #333;
}

.notification-settings {
  padding: 10px 0;
}

.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 0;
  border-bottom: 1px solid #eee;
}

.setting-item:last-child {
  border-bottom: none;
}

.setting-label {
  flex: 1;
}

.setting-label h4 {
  margin: 0 0 6px;
  font-size: 16px;
  color: #333;
}

.setting-label p {
  margin: 0;
  font-size: 14px;
  color: #666;
}

.browsing-history {
  padding: 10px 0;
}

.history-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 0;
  border-bottom: 1px solid #eee;
}

.history-content {
  flex: 1;
}

.history-title {
  display: block;
  font-size: 16px;
  margin-bottom: 6px;
  color: #1e3c72;
  text-decoration: none;
}

.history-title:hover {
  text-decoration: underline;
}

.history-date {
  font-size: 14px;
  color: #666;
}

.empty-state {
  padding: 40px 0;
  text-align: center;
  color: #666;
}

.history-actions {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

@media (max-width: 768px) {
  .user-profile-section {
    flex-direction: column;
    text-align: center;
    padding: 30px 20px;
  }
  
  .user-tabs {
    padding: 20px;
  }
}
</style> 