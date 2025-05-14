<template>
  <n-message-provider>
    <n-dialog-provider>
      <n-config-provider :theme="theme">
        <NavBar v-if="!isAdminRoute && route?.path !== '/404'" />
        <router-view></router-view>
        <!-- 外部链接安全提示 -->
      </n-config-provider>
    </n-dialog-provider>
  </n-message-provider>
</template>

<script lang="ts" setup>
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { NMessageProvider, NConfigProvider, NDialogProvider, darkTheme } from 'naive-ui'
import NavBar from './components/NavBar.vue'
import ExternalLinkAlert from './components/ExternalLinkAlert.vue'
import { registerSafeLink, setGlobalSafeLinkOptions } from './directives/safeLink'
import { useUserStore } from './stores/user'

const route = useRoute()
const userStore = useUserStore()
const isAdminRoute = computed(() => {
  return route?.path?.startsWith('/admin') || false
})
const theme = ref(null)

// 外部链接提示状态
const showExternalLinkAlert = ref(false)
const externalLinkUrl = ref('')

// 处理外部链接点击
const handleExternalLink = (url: string) => {
  externalLinkUrl.value = url
  showExternalLinkAlert.value = true
}

// 处理确认访问外部链接
const handleExternalLinkProceed = () => {
  // 可以在这里添加记录或其他操作
  console.log('用户确认访问外部链接:', externalLinkUrl.value)
}

// 设置外部链接处理选项
onMounted(() => {
  // 初始化用户状态
  userStore.init()
  
  // 设置全局选项
  setGlobalSafeLinkOptions({
    showAlert: handleExternalLink
  })
  
  // 获取所有外部链接并应用指令
  const allLinks = document.querySelectorAll('a[href^="http"]')
  allLinks.forEach(link => {
    if (!link.hasAttribute('v-safe-link')) {
      link.setAttribute('v-safe-link', '')
    }
  })
  
  // 添加对external-link-click事件的监听
  window.addEventListener('external-link-click', handleExternalLinkEvent)
})

// 在组件卸载时移除事件监听器
onUnmounted(() => {
  window.removeEventListener('external-link-click', handleExternalLinkEvent)
})

// 处理external-link-click事件
const handleExternalLinkEvent = (event: Event) => {
  if (event instanceof CustomEvent && event.detail && event.detail.url) {
    handleExternalLink(event.detail.url)
  }
}
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body {
  height: 100%;
}

#app {
  min-height: 100vh;
}

/* 为非管理页面添加顶部内边距 */
body:not([data-admin]) #app > :not(nav):not(.min-h-screen) {
  padding-top: 64px;  /* 导航栏高度 */
}

/* 管理页面不需要顶部内边距 */
body[data-admin] #app {
  padding-top: 0;
}
</style>
