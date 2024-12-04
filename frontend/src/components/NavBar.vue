<template>
  <div class="nav-wrapper">
    <nav class="nav-container" :class="{ 'dark-mode': isDarkMode }">
      <div class="nav-content">
        <Transition name="fade-scale">
          <div v-if="showDynamicIsland" class="dynamic-island">
            <Transition name="fade" mode="out-in">
              <div v-if="!isSearchActive && currentTitle" class="title-content" key="title">
                <div class="pill-left">
                  <div class="icon-wrapper">
                    <font-awesome-icon :icon="['fas', 'book-open']" />
                  </div>
                </div>
                <div class="pill-center">
                  <span class="title-text">{{ currentTitle }}</span>
                  <span class="subtitle">正在阅读</span>
                </div>
                <div class="pill-right">
                  <div class="search-trigger" @click="activateSearch">
                    <font-awesome-icon :icon="['fas', 'search']" />
                  </div>
                </div>
              </div>
              <div v-else class="search-content" key="search">
                <div class="pill-left">
                  <div class="icon-wrapper search">
                    <font-awesome-icon :icon="['fas', 'search']" />
                  </div>
                </div>
                <div class="pill-center">
                  <input 
                    ref="searchInput"
                    v-model="searchQuery" 
                    class="search-input"
                    placeholder="搜索文章..."
                    @keyup.enter="handleSearch"
                    @keyup.esc="deactivateSearch"
                  />
                </div>
                <div class="pill-right">
                  <div class="close-button" @click="deactivateSearch">
                    <font-awesome-icon :icon="['fas', 'xmark']" />
                  </div>
                </div>
              </div>
            </Transition>
          </div>
        </Transition>
        <Transition name="fade">
          <div v-if="!showDynamicIsland" class="nav-menu">
            <div 
              v-for="item in navItems" 
              :key="item.path"
              class="nav-item"
              :class="{ 'is-active': isActive(item.path) }"
              @click="router.push(item.path)"
            >
              <font-awesome-icon :icon="item.icon" />
              {{ item.text }}
            </div>
            <div class="nav-item search-btn" @click="activateSearch">
              <font-awesome-icon :icon="['fas', 'search']" />
            </div>
          </div>
        </Transition>
      </div>
    </nav>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useArticleStore } from '@/stores/article'
import { storeToRefs } from 'pinia'
import { library } from '@fortawesome/fontawesome-svg-core'
import { 
  faHouse, 
  faBook, 
  faStar, 
  faPen, 
  faDesktop, 
  faLink,
  faClock,
  faList,
  faUser,
  faSearch,
  faBookOpen,
  faXmark
} from '@fortawesome/free-solid-svg-icons'

library.add(
  faHouse, 
  faBook, 
  faStar, 
  faPen, 
  faDesktop, 
  faLink,
  faClock,
  faList,
  faUser,
  faSearch,
  faBookOpen,
  faXmark
)

// 监听暗色模式
const isDarkMode = ref(false)
const updateTheme = () => {
  isDarkMode.value = document.documentElement.classList.contains('dark-theme')
}

// 监听主题变化
const observer = new MutationObserver(updateTheme)

const route = useRoute()
const router = useRouter()
const articleStore = useArticleStore()
const { currentTitle } = storeToRefs(articleStore)

// 搜索相关状态
const isSearchActive = ref(false)
const searchQuery = ref('')
const searchInput = ref<HTMLInputElement | null>(null)

// 计算是否显示动态岛
const showDynamicIsland = computed(() => {
  console.log('动态岛状态:', {
    isSearchActive: isSearchActive.value,
    currentTitle: currentTitle.value,
    isDarkMode: isDarkMode.value
  })
  return isSearchActive.value || Boolean(currentTitle.value)
})

// 监听路由变化
watch(() => route.path, () => {
  console.log('路由变化, 当前标题:', currentTitle.value)
}, { immediate: true })

// 激活搜索
const activateSearch = () => {
  console.log('激活搜索')
  isSearchActive.value = true
  // 等待 DOM 更新后聚焦输入框
  setTimeout(() => {
    console.log('尝试聚焦搜索框:', searchInput.value)
    searchInput.value?.focus()
  }, 50)
}

// 关闭搜索
const deactivateSearch = () => {
  console.log('关闭搜索')
  isSearchActive.value = false
  searchQuery.value = ''
}

// 处理搜索
const handleSearch = () => {
  console.log('执行搜索:', searchQuery.value)
  if (searchQuery.value.trim()) {
    router.push({
      path: '/search',
      query: { q: searchQuery.value }
    })
    deactivateSearch()
  }
}

// 监听 ESC 键
const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Escape' && isSearchActive.value) {
    deactivateSearch()
  }
}

const navItems = [
  { path: '/', text: '主页', icon: ['fas', 'house'] },
  { path: '/chase', text: '追番', icon: ['fas', 'book'] },
  { path: '/favorites', text: '收藏', icon: ['fas', 'star'] },
  { path: '/notes', text: '记录', icon: ['fas', 'pen'] },
  { path: '/monitor', text: '监控', icon: ['fas', 'desktop'] },
  { path: '/friends', text: '友链', icon: ['fas', 'link'] },
  { path: '/timeline', text: '时光轴', icon: ['fas', 'clock'] },
  { path: '/categories', text: '分类', icon: ['fas', 'list'] },
  { path: '/login', text: '登录', icon: ['fas', 'user'] }
]

const isActive = (path: string) => {
  // 如果是根路径，则不激活任何导航项
  if (route.path === '/') {
    return false;
  }
  // 其他路径正常匹配
  return route.path === path;
}

onMounted(() => {
  updateTheme()
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class']
  })
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  observer.disconnect()
  window.removeEventListener('keydown', handleKeydown)
})
</script>

<style scoped>
.nav-wrapper {
  width: 100%;
  display: flex;
  justify-content: center;
  position: fixed;
  top: 15px;
  left: 0;
  right: 0;
  z-index: 100;
  padding: 0 20px;
}

.nav-container {
  background-color: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-radius: 50px;
  padding: 5px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin: 0 auto;
  max-width: 800px;
  width: 100%;
  transition: all 0.3s ease;
}

.nav-container.dark-mode {
  background-color: rgba(40, 44, 52, 0.8);
}

.nav-content {
  position: relative;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 10px;
}

.nav-menu {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 5px;
  width: 100%;
}

.nav-item {
  padding: 0 12px;
  color: #666;
  text-decoration: none;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  height: 30px;
  border-radius: 15px;
  white-space: nowrap;
  user-select: none;
}

.nav-item.is-active {
  color: #1890ff;
  background-color: rgba(24, 144, 255, 0.1);
}

.dark-mode .nav-item.is-active {
  color: #40a9ff;
  background-color: rgba(64, 169, 255, 0.1);
}

.dark-mode .nav-item {
  color: #bbb;
}

.nav-item:hover {
  color: #1890ff;
  background-color: rgba(24, 144, 255, 0.1);
  transform: translateY(-1px);
}

.dark-mode .nav-item:hover {
  color: #40a9ff;
  background-color: rgba(64, 169, 255, 0.1);
}

.dynamic-island {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  background: rgba(0, 0, 0, 0.95);
  color: white;
  border-radius: 44px;
  font-size: 14px;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  width: min(500px, 85%);
  height: 44px;
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  z-index: 10;
}

.dark-mode .dynamic-island {
  background: rgba(0, 0, 0, 0.9);
}

.title-content,
.search-content {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 14px;
  width: 100%;
  height: 100%;
}

.pill-left,
.pill-right {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 32px;
  height: 100%;
}

.pill-center {
  flex: 1;
  display: flex;
  min-width: 0;
  height: 100%;
  min-height: 32px;
  align-items: center;
}

.title-content .pill-center {
  flex-direction: column;
  justify-content: center;
  gap: 4px;
  align-items: flex-start;
  padding: 4px 0;
  height: 100%;
  max-height: 40px;
  overflow: hidden;
}

.search-content .pill-center {
  flex-direction: row;
  align-items: center;
}

.icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: linear-gradient(135deg, #22c55e, #16a34a);
}

.icon-wrapper.search {
  background: linear-gradient(135deg, #0ea5e9, #0284c7);
}

.search-input {
  width: 100%;
  background: transparent;
  border: none;
  outline: none;
  color: white;
  font-size: 14px;
  padding: 0;
  font-weight: 500;
  height: 100%;
}

.search-input::placeholder {
  color: rgba(255, 255, 255, 0.5);
}

.close-button,
.search-trigger {
  cursor: pointer;
  opacity: 0.7;
  transition: all 0.2s ease;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}

.close-button:hover,
.search-trigger:hover {
  opacity: 1;
  background: rgba(255, 255, 255, 0.1);
}

.title-text {
  font-size: 14px;
  font-weight: 600;
  color: #ffffff;
  opacity: 0.95;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 300px;
  line-height: 1.2;
  display: block;
  height: auto;
}

.subtitle {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
  font-weight: 500;
  line-height: 1;
  display: block;
}

/* 过渡动画 */
.fade-enter-active,
.fade-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.fade-scale-enter-active,
.fade-scale-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.fade-scale-enter-from,
.fade-scale-leave-to {
  opacity: 0;
  transform: translate(-50%, -50%) scale(0.95);
}

/* 响应式布局 */
@media screen and (max-width: 768px) {
  .nav-container {
    width: 92%;
  }
  
  .dynamic-island {
    width: 92%;
  }

  .nav-menu {
    gap: 4px;
  }

  .nav-item {
    padding: 0 8px;
    font-size: 13px;
  }

  .title-content,
  .search-content {
    padding: 6px 12px;
    gap: 10px;
  }

  .icon-wrapper {
    width: 26px;
    height: 26px;
    font-size: 12px;
  }

  .search-input {
    font-size: 13px;
  }
}
</style> 