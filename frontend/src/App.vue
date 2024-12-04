<template>
  <n-message-provider>
    <n-config-provider :theme="theme">
      <NavBar v-if="!isAdminRoute && route?.path !== '/404'" />
      <router-view></router-view>
    </n-config-provider>
  </n-message-provider>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { NMessageProvider, NConfigProvider, darkTheme } from 'naive-ui'
import NavBar from './components/NavBar.vue'

const route = useRoute()
const isAdminRoute = computed(() => {
  return route?.path?.startsWith('/admin') || false
})
const theme = ref(null)
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
