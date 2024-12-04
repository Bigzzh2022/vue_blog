<template>
  <n-layout has-sider class="admin-layout">
    <n-layout-sider
      bordered
      collapse-mode="width"
      :collapsed-width="64"
      :width="240"
      :collapsed="collapsed"
      show-trigger
      @collapse="collapsed = true"
      @expand="collapsed = false"
      class="admin-sider"
    >
      <div class="logo">
        <h2 v-if="!collapsed">后台管理</h2>
        <h2 v-else>后台</h2>
      </div>
      <n-menu
        :collapsed="collapsed"
        :collapsed-width="64"
        :collapsed-icon-size="22"
        :options="menuOptions"
        :value="activeKey"
        class="admin-menu"
      />
    </n-layout-sider>
    <n-layout class="admin-content">
      <n-layout-header bordered class="admin-header">
        <div class="header-container">
          <div class="header-left">
            <n-breadcrumb>
              <n-breadcrumb-item>后台管理</n-breadcrumb-item>
              <n-breadcrumb-item>{{ currentRoute }}</n-breadcrumb-item>
            </n-breadcrumb>
          </div>
          <div class="header-right">
            <n-space>
              <n-avatar
                round
                size="small"
                src="https://07akioni.oss-cn-beijing.aliyuncs.com/07akioni.jpeg"
              />
              <n-dropdown :options="userOptions" trigger="click">
                <n-button text>
                  管理员
                  <n-icon size="14" style="margin-left: 4px">
                    <chevron-down />
                  </n-icon>
                </n-button>
              </n-dropdown>
            </n-space>
          </div>
        </div>
      </n-layout-header>
      <n-layout-content class="admin-main">
        <div class="content-container">
          <router-view></router-view>
        </div>
      </n-layout-content>
    </n-layout>
  </n-layout>
</template>

<script setup lang="ts">
import { h, ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import {
  NLayout,
  NLayoutSider,
  NLayoutHeader,
  NLayoutContent,
  NMenu,
  NBreadcrumb,
  NBreadcrumbItem,
  NButton,
  NSpace,
  NAvatar,
  NDropdown,
  NIcon
} from 'naive-ui'
import {
  DashboardOutlined,
  FileTextOutlined,
  TagsOutlined,
  FolderOutlined,
  SettingOutlined,
  PictureOutlined,
  LinkOutlined
} from '@vicons/antd'
import { ChevronDown } from '@vicons/ionicons5'

const router = useRouter()
const route = useRoute()
const collapsed = ref(false)

const activeKey = computed(() => route.name as string)

const currentRoute = computed(() => {
  const routeMap: Record<string, string> = {
    dashboard: '仪表盘',
    posts: '文章管理',
    tags: '标签管理',
    categories: '分类管理',
    settings: '系统设置'
  }
  return routeMap[route.name as string] || ''
})

const userOptions = [
  {
    label: '个人设置',
    key: 'settings'
  },
  {
    label: '退出登录',
    key: 'logout'
  }
]

const menuOptions = [
  {
    label: '仪表盘',
    key: 'dashboard',
    icon: renderIcon(DashboardOutlined),
    onClick: () => router.push('/admin/dashboard')
  },
  {
    label: '文章管理',
    key: 'posts',
    icon: renderIcon(FileTextOutlined),
    onClick: () => router.push('/admin/posts')
  },
  {
    label: '标签管理',
    key: 'tags',
    icon: renderIcon(TagsOutlined),
    onClick: () => router.push('/admin/tags')
  },
  {
    label: '分类管理',
    key: 'categories',
    icon: renderIcon(FolderOutlined),
    onClick: () => router.push('/admin/categories')
  },
  {
    label: '媒体库',
    key: 'media',
    icon: renderIcon(PictureOutlined),
    onClick: () => router.push('/admin/media')
  },
  {
    label: '友链管理',
    key: 'links',
    icon: renderIcon(LinkOutlined),
    onClick: () => router.push('/admin/links')
  },
  {
    label: '系统设置',
    key: 'settings',
    icon: renderIcon(SettingOutlined),
    onClick: () => router.push('/admin/settings')
  }
]

function renderIcon(icon: any) {
  return () => h(icon)
}

const logout = () => {
  router.push('/login')
}
</script>

<style scoped>
.admin-layout {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  height: 100%;
}

.admin-sider {
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  height: 100vh;
  background: #fff;
  border-right: 1px solid #f0f0f0;
  z-index: 1000;
}

.logo {
  height: 64px;
  padding: 0 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-bottom: 1px solid #f0f0f0;
  background: #fff;
}

.logo h2 {
  color: #333;
  font-size: 18px;
  font-weight: 600;
  white-space: nowrap;
}

.admin-menu {
  height: calc(100vh - 64px);
  overflow-y: auto;
}

.admin-content {
  position: relative;
  margin-left: v-bind('collapsed ? "64px" : "240px"');
  min-height: 100vh;
  transition: margin-left 0.2s;
}

.admin-header {
  position: fixed;
  top: 0;
  right: 0;
  left: v-bind('collapsed ? "64px" : "240px"');
  height: 64px;
  padding: 0;
  background: #fff;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
  z-index: 999;
  transition: left 0.2s;
}

.header-container {
  height: 100%;
  padding: 0 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.admin-main {
  padding: 88px 24px 24px;
  background: #f5f7f9;
  min-height: 100vh;
}

.content-container {
  background: #fff;
  padding: 24px;
  border-radius: 8px;
  height: 100%;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
}

:deep(.n-menu) {
  background: #fff;
}

:deep(.n-menu .n-menu-item) {
  height: 50px;
  color: #666;
}

:deep(.n-layout-sider .n-layout-toggle-button) {
  background: #f5f7f9;
  border: 1px solid #f0f0f0;
  &:hover {
    background: #e6e8eb;
  }
}

:deep(.n-menu .n-menu-item:not(.n-menu-item--disabled):focus:not(.n-menu-item--child-active):not(.n-menu-item--active):not(:hover), 
.n-menu .n-menu-item:not(.n-menu-item--disabled):hover:not(.n-menu-item--child-active):not(.n-menu-item--active)) {
  background: #f5f7f9;
}

:deep(.n-menu .n-menu-item.n-menu-item--selected) {
  color: #18a058;
  background: #e8f7ed;
}

:deep(.n-menu::-webkit-scrollbar) {
  width: 6px;
}

:deep(.n-menu::-webkit-scrollbar-thumb) {
  background: #e8e8e8;
  border-radius: 3px;
}

:deep(.n-menu::-webkit-scrollbar-track) {
  background: transparent;
}
</style> 