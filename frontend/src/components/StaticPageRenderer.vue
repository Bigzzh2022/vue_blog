<template>
  <div class="static-page" :class="{ 'full-width': page.template === 'full-width' }">
    <div class="page-container" :class="{ 'has-sidebar': page.template === 'sidebar' }">
      <template v-if="page.template === 'sidebar'">
        <div class="sidebar">
          <div class="sidebar-content">
            <h2>导航</h2>
            <ul class="sidebar-nav">
              <li v-for="navItem in sidebarLinks" :key="navItem.slug">
                <router-link :to="'/' + navItem.slug">{{ navItem.title }}</router-link>
              </li>
            </ul>
          </div>
        </div>
      </template>
      
      <div class="page-content">
        <div class="content-renderer" ref="contentRef"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, watchEffect, computed } from 'vue'
import { usePagesStore, type StaticPage } from '@/stores/pages'
import { useRoute } from 'vue-router'

const props = defineProps<{
  page: StaticPage
}>()

const contentRef = ref<HTMLElement | null>(null)
const pagesStore = usePagesStore()
const route = useRoute()

// 侧边栏导航链接
const sidebarLinks = computed(() => {
  return pagesStore.publishedPages.filter(page => 
    // 不显示当前页面
    page.id !== props.page.id
  )
})

// 渲染页面内容
const renderPageContent = () => {
  if (!contentRef.value) return
  
  // 将HTML内容注入到页面中
  contentRef.value.innerHTML = props.page.content
  
  // 创建并添加CSS样式
  if (props.page.css) {
    const styleTag = document.createElement('style')
    styleTag.textContent = props.page.css
    styleTag.setAttribute('data-page-styles', `page-${props.page.id}`)
    
    // 移除旧的样式标签（如果存在）
    const oldStyle = document.head.querySelector(`[data-page-styles="page-${props.page.id}"]`)
    if (oldStyle) {
      document.head.removeChild(oldStyle)
    }
    
    document.head.appendChild(styleTag)
  }
  
  // 添加JavaScript代码
  if (props.page.javascript) {
    try {
      // 使用安全的方式执行JavaScript
      const scriptFunc = new Function(props.page.javascript)
      scriptFunc()
    } catch (error) {
      console.error('执行页面脚本时出错:', error)
    }
  }
}

// 监视页面数据变化，重新渲染内容
watch(() => props.page, () => {
  renderPageContent()
}, { deep: true })

// 在组件挂载后渲染内容
onMounted(() => {
  renderPageContent()
})

// 在组件卸载时清理样式
onUnmounted(() => {
  const styleTag = document.head.querySelector(`[data-page-styles="page-${props.page.id}"]`)
  if (styleTag) {
    document.head.removeChild(styleTag)
  }
})
</script>

<style scoped>
.static-page {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
}

.static-page.full-width {
  max-width: 100%;
  padding: 0;
}

.page-container {
  width: 100%;
}

.page-container.has-sidebar {
  display: grid;
  grid-template-columns: 250px 1fr;
  grid-gap: 30px;
}

.sidebar {
  border-right: 1px solid #eee;
  padding-right: 20px;
}

.sidebar-content {
  position: sticky;
  top: 80px;
}

.sidebar-nav {
  list-style: none;
  padding: 0;
  margin: 0;
}

.sidebar-nav li {
  margin-bottom: 10px;
}

.sidebar-nav a {
  display: block;
  color: #666;
  text-decoration: none;
  padding: 8px 0;
  border-radius: 4px;
  transition: color 0.3s;
}

.sidebar-nav a:hover,
.sidebar-nav a.router-link-active {
  color: #18a058;
}

.page-content {
  width: 100%;
}

@media (max-width: 768px) {
  .page-container.has-sidebar {
    grid-template-columns: 1fr;
  }
  
  .sidebar {
    border-right: none;
    border-bottom: 1px solid #eee;
    padding-right: 0;
    padding-bottom: 20px;
    margin-bottom: 20px;
  }
  
  .sidebar-content {
    position: static;
  }
}
</style> 