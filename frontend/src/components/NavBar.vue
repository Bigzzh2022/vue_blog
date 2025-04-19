<template>
  <div class="nav-wrapper">
    <nav class="nav-container" :class="{ 'dark-mode': isDarkMode, 'island-active': showDynamicIsland }">
      <div class="nav-content">
        <div v-if="showDynamicIsland" class="dynamic-island-wrapper">
          <Transition name="fade-scale" mode="out-in">
            <div class="dynamic-island">
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
        </div>
        <Transition name="fade">
          <div v-if="!showDynamicIsland" class="nav-menu">
            <div class="menu-left">
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
            </div>
            <div class="menu-right">
              <!-- 用户下拉菜单 -->
              <div v-if="isLoggedIn && !isAdmin" class="nav-item user-dropdown" ref="userDropdownRef">
                <div class="user-icon" @click="toggleUserDropdown">
                  <font-awesome-icon :icon="['fas', 'user']" />
                </div>
                <div v-if="showUserDropdown" class="dropdown-menu">
                  <div class="dropdown-item" @click="router.push('/profile')">
                    <font-awesome-icon :icon="['fas', 'user-circle']" />
                    个人资料
                  </div>
                  <div class="dropdown-item" @click="handleLogout">
                    <font-awesome-icon :icon="['fas', 'sign-out-alt']" />
                    退出登录
                  </div>
                </div>
              </div>
              <div class="nav-item search-btn" @click="activateSearch">
                <font-awesome-icon :icon="['fas', 'search']" />
              </div>
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
import { useUserStore } from '@/stores/user'
import { storeToRefs } from 'pinia'
import { library } from '@fortawesome/fontawesome-svg-core'
import { 
  faHouse, 
  faLink,
  faClock,
  faList,
  faUser,
  faSearch,
  faBookOpen,
  faXmark,
  faGear,
  faUserCircle,
  faSignOutAlt
} from '@fortawesome/free-solid-svg-icons'

library.add(
  faHouse, 
  faLink,
  faClock,
  faList,
  faUser,
  faSearch,
  faBookOpen,
  faXmark,
  faGear,
  faUserCircle,
  faSignOutAlt
)

// 监听暗色模式
const isDarkMode = ref(false)
const updateTheme = () => {
  isDarkMode.value = document.documentElement.classList.contains('dark-theme')
}

// 响应式窗口宽度
const windowWidth = ref(window.innerWidth)
const updateWindowWidth = () => {
  windowWidth.value = window.innerWidth
}

// 监听主题变化
const observer = new MutationObserver(updateTheme)

const route = useRoute()
const router = useRouter()
const articleStore = useArticleStore()
const userStore = useUserStore()
const { currentTitle } = storeToRefs(articleStore)
const { isLoggedIn, isAdmin } = storeToRefs(userStore)

// 搜索相关状态
const isSearchActive = ref(false)

// 用户下拉菜单状态
const showUserDropdown = ref(false)
const userDropdownRef = ref<HTMLElement | null>(null)

// 切换用户下拉菜单
const toggleUserDropdown = () => {
  showUserDropdown.value = !showUserDropdown.value
}

// 处理退出登录
const handleLogout = () => {
  userStore.logout()
  router.push('/login')
  showUserDropdown.value = false
}

// 点击外部关闭下拉菜单
const handleClickOutside = (event: MouseEvent) => {
  if (userDropdownRef.value && !userDropdownRef.value.contains(event.target as Node)) {
    showUserDropdown.value = false
  }
}

// 添加和移除点击外部关闭下拉菜单的事件监听
onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
const searchQuery = ref('')
const searchInput = ref<HTMLInputElement | null>(null)

// 判断是否为文章页面
const isArticlePage = computed(() => {
  // 假设文章路径是以 /article 或 /post 开头
  return route.path.startsWith('/article') || route.path.startsWith('/post')
})

// 计算是否显示动态岛
const showDynamicIsland = computed(() => {
  console.log('动态岛状态:', {
    isArticlePage: isArticlePage.value,
    isSearchActive: isSearchActive.value,
    currentTitle: currentTitle.value,
    isDarkMode: isDarkMode.value
  })
  // 只有在文章页面且有标题或者搜索激活时才显示灵动岛
  return (isArticlePage.value && Boolean(currentTitle.value)) || isSearchActive.value
})

// 监听路由变化，在路由变化时重置搜索状态
watch(() => route.path, () => {
  console.log('路由变化, 当前标题:', currentTitle.value)
  // 如果不是从文章页面切换到文章页面，则关闭搜索
  if (!isArticlePage.value) {
    isSearchActive.value = false
  }
}, { immediate: true })

// 激活搜索
const activateSearch = () => {
  console.log('激活搜索')
  
  // 直接设置搜索状态并延迟聚焦，简化逻辑
  isSearchActive.value = true
  
  // 使用较长延迟确保过渡动画完成后再聚焦
  setTimeout(() => {
    searchInput.value?.focus()
  }, 400)
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

// 根据登录状态和角色动态生成导航项
const navItems = computed(() => {
  const items = [
    { path: '/', text: '主页', icon: ['fas', 'house'] },
    { path: '/friends', text: '友链', icon: ['fas', 'link'] },
    { path: '/timeline', text: '时光轴', icon: ['fas', 'clock'] },
    { path: '/categories', text: '分类', icon: ['fas', 'list'] },
  ]
  
  // 根据用户角色显示不同按钮
  if (!isLoggedIn.value) {
    // 未登录用户显示“登录”按钮
    items.push({ path: '/login', text: '登录', icon: ['fas', 'user'] })
  } else if (isAdmin.value) {
    // 管理员显示“后台”按钮
    items.push({ path: '/admin/dashboard', text: '后台', icon: ['fas', 'gear'] })
  }
  // 普通用户不添加额外按钮，而是在右侧显示用户图标和下拉菜单
  
  return items
})

// 计算菜单项所需宽度
const menuWidth = computed(() => {
  // 基础宽度 + 每个菜单项的平均宽度 * 菜单项数量
  // 每个菜单项平均宽度约为 75px (调整为更精确的值)
  const baseWidth = 60 // 增加基础内边距，为搜索按钮预留空间
  const itemWidth = 78 // 略微增加每个菜单项平均宽度
  const itemCount = navItems.value.length // 将navItems改为computed
  
  // 额外添加搜索按钮所需的宽度
  const searchBtnWidth = 50 // 增加搜索按钮宽度以确保足够空间
  
  return Math.min(850, Math.max(450, baseWidth + itemWidth * itemCount + searchBtnWidth))
})

// 计算导航容器宽度
const navContainerWidth = computed(() => {
  // 在移动设备上
  if (windowWidth.value <= 768) {
    // 移动设备上使用百分比宽度，但至少有足够空间容纳所有菜单项
    const minRequiredWidth = Math.min(menuWidth.value + 20, windowWidth.value * 0.95)
    return `${minRequiredWidth}px`
  } else {
    // 桌面设备上菜单模式下导航容器宽度与菜单宽度匹配
    return `${menuWidth.value}px`
  }
})

const isActive = (path: string) => {
  // 如果是根路径，则不激活任何导航项
  if (route.path === '/') {
    return false;
  }
  // 其他路径正常匹配
  return route.path === path;
}

// 计算灵动岛宽度
const islandWidth = computed(() => {
  if (isSearchActive.value) {
    // 搜索模式下宽度
    return windowWidth.value <= 768 ? "92%" : "min(500px, 85%)"
  } else if (currentTitle.value) {
    // 标题模式下的宽度，至少要能显示标题
    const titleLength = currentTitle.value.length
    // 根据标题长度计算宽度，每个字符约10px，加上左右icon和padding约80px
    const titleWidth = Math.min(500, Math.max(250, titleLength * 10 + 80))
    return windowWidth.value <= 768 
      ? `${Math.min(titleWidth, windowWidth.value * 0.9)}px` 
      : `${titleWidth}px`
  } else {
    // 默认菜单模式下的宽度
    return windowWidth.value <= 768 
      ? `${Math.min(menuWidth.value, windowWidth.value * 0.9)}px` 
      : `${menuWidth.value}px`
  }
})

onMounted(() => {
  // 确保用户状态已加载
  userStore.init()
  
  updateTheme()
  updateWindowWidth() // 初始化窗口宽度
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class']
  })
  window.addEventListener('keydown', handleKeydown)
  window.addEventListener('resize', updateWindowWidth) // 监听窗口大小变化
})

onUnmounted(() => {
  observer.disconnect()
  window.removeEventListener('keydown', handleKeydown)
  window.removeEventListener('resize', updateWindowWidth) // 移除窗口大小变化监听
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
  padding: 5px 12px; /* 调整水平内边距 */
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin: 0 auto;
  max-width: v-bind("navContainerWidth");
  width: v-bind("navContainerWidth");
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1); /* 增加过渡时间 */
  position: relative;
  overflow: visible;
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box; /* 确保内边距不会增加元素总宽度 */
}

.nav-container.island-active {
  background-color: transparent;
  backdrop-filter: none;
  -webkit-backdrop-filter: none;
  box-shadow: none;
  padding: 0;
  max-width: 100%;
  width: 100%;
  /* 当显示灵动岛时，延迟背景色变化，确保动画平滑 */
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1) 0.1s; /* 明确设置所有属性的过渡 */
}

.nav-container.dark-mode {
  background-color: rgba(40, 44, 52, 0.8);
}

.nav-container.dark-mode.island-active {
  background-color: transparent;
}

.nav-content {
  position: relative;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
}

.nav-menu {
  display: flex;
  align-items: center;
  width: 100%;
  padding: 0;
  margin: 0;
  justify-content: space-between; /* 使用space-between更好地分配空间 */
}

.menu-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.menu-right {
  display: flex;
  align-items: center;
}

.nav-item {
  padding: 0 12px; /* 增加内边距 */
  color: #666;
  text-decoration: none;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 6px; /* 增加图标和文字间距 */
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  height: 30px;
  border-radius: 15px;
  white-space: nowrap;
  user-select: none;
  flex-shrink: 0; /* 防止菜单项缩小 */
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

.nav-item.search-btn {
  color: #666;
  background-color: transparent;
  padding: 0 12px; /* 增加内边距确保搜索图标有足够空间 */
  min-width: 36px; /* 增加最小宽度 */
  display: flex;
  justify-content: center;
  align-items: center;
  flex-shrink: 0; /* 防止搜索按钮缩小 */
  height: 30px; /* 确保与其他菜单项高度一致 */
  margin-right: 4px; /* 添加右边距，避免贴近容器边缘 */
}

.dark-mode .nav-item.search-btn {
  color: #bbb;
  background-color: transparent;
}

.nav-item.search-btn:hover {
  color: #1890ff;
  background-color: rgba(24, 144, 255, 0.1);
}

.dark-mode .nav-item.search-btn:hover {
  color: #40a9ff;
  background-color: rgba(64, 169, 255, 0.1);
}

.dynamic-island-wrapper {
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
}

.dynamic-island {
  position: relative;
  background: rgba(0, 0, 0, 0.95);
  color: white;
  border-radius: 44px;
  font-size: 14px;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  width: v-bind("islandWidth");
  height: 44px;
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: width 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  z-index: 20;
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
  max-width: calc(100% - 20px);
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
  transition: opacity 0.5s cubic-bezier(0.4, 0, 0.2, 1), transform 0.5s cubic-bezier(0.4, 0, 0.2, 1); /* 增加过渡时间 */
  position: absolute;
  width: 100%;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-5px);
}

.fade-scale-enter-active,
.fade-scale-leave-active {
  transition: opacity 0.5s cubic-bezier(0.4, 0, 0.2, 1), transform 0.5s cubic-bezier(0.4, 0, 0.2, 1); /* 增加过渡时间 */
}

.fade-scale-enter-from,
.fade-scale-leave-to {
  opacity: 0;
  transform: scale(0.98); /* 简化变换 */
}

/* 用户下拉菜单样式 */
.user-dropdown {
  position: relative;
}

.user-icon {
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  right: 0;
  min-width: 150px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  padding: 8px 0;
  z-index: 100;
  margin-top: 8px;
  overflow: hidden;
}

.dark-mode .dropdown-menu {
  background: #1f2937;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  cursor: pointer;
  transition: background 0.2s ease;
  color: #333;
  font-size: 14px;
}

.dark-mode .dropdown-item {
  color: rgba(255, 255, 255, 0.9);
}

.dropdown-item:hover {
  background: rgba(0, 0, 0, 0.05);
}

.dark-mode .dropdown-item:hover {
  background: rgba(255, 255, 255, 0.05);
}

/* 修改响应式布局 */
@media screen and (max-width: 768px) {
  .nav-wrapper {
    padding: 0 10px;
  }
  
  .nav-container {
    width: v-bind("navContainerWidth");
    padding: 5px 10px; /* 调整移动设备上的内边距 */
  }
  
  .nav-content {
    height: 36px; /* 减小高度以适应移动设备 */
  }
  
  .menu-left {
    gap: 4px;
  }

  .nav-item {
    padding: 0 8px; /* 调整内边距 */
    font-size: 13px;
    gap: 3px;
    height: 28px; /* 减小高度 */
  }
  
  .nav-item.search-btn {
    padding: 0 8px;
    min-width: 30px;
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