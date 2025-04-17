<template>
  <div class="static-page-view">
    <template v-if="currentPage">
      <StaticPageRenderer :page="currentPage" />
    </template>
    <template v-else>
      <div class="page-not-found">
        <h1>页面未找到</h1>
        <p>抱歉，您请求的页面不存在或已被删除。</p>
        <router-link to="/" class="home-link">返回首页</router-link>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { usePagesStore } from '@/stores/pages'
import StaticPageRenderer from '@/components/StaticPageRenderer.vue'

const route = useRoute()
const pagesStore = usePagesStore()

// 初始加载页面数据
onMounted(async () => {
  if (!pagesStore.loaded) {
    await pagesStore.loadPages()
  }
})

// 获取当前页面
const currentPage = computed(() => {
  // 获取URL上的slug
  const slug = route.params.slug as string
  
  if (slug) {
    // 根据slug查找页面
    return pagesStore.getPageBySlug(slug)
  }
  
  return null
})
</script>

<style scoped>
.static-page-view {
  width: 100%;
  min-height: 80vh;
}

.page-not-found {
  max-width: 600px;
  margin: 100px auto;
  text-align: center;
  padding: 40px 20px;
}

.page-not-found h1 {
  font-size: 36px;
  color: #333;
  margin-bottom: 20px;
}

.page-not-found p {
  font-size: 18px;
  color: #666;
  margin-bottom: 30px;
}

.home-link {
  display: inline-block;
  background: #18a058;
  color: white;
  padding: 10px 20px;
  border-radius: 4px;
  text-decoration: none;
  transition: background 0.3s;
}

.home-link:hover {
  background: #0e7a41;
}
</style> 