<template>
  <div class="search-view">
    <div class="search-header">
      <h1 class="search-title">搜索结果</h1>
      <p class="search-info">关键词: "{{ searchQuery }}"</p>
    </div>
    
    <div v-if="loading" class="loading-state">
      <n-spin size="medium" />
      <p>搜索中...</p>
    </div>
    
    <div v-else-if="error" class="error-state">
      <p>{{ error }}</p>
      <n-button @click="performSearch">重试</n-button>
    </div>
    
    <div class="search-results" v-else-if="searchResults.length">
      <div v-for="result in searchResults" :key="result.id" class="search-item">
        <router-link :to="'/article/' + result.id" class="result-link">
          <h2 class="result-title">{{ result.title }}</h2>
          <p class="result-excerpt">{{ result.description }}</p>
          <div class="result-meta">
            <span class="result-date">{{ formatDate(result.publishDate) }}</span>
            <span class="result-category">{{ result.category }}</span>
            <span class="result-views">阅读量: {{ result.views }}</span>
          </div>
        </router-link>
      </div>
    </div>
    
    <div class="no-results" v-else>
      <n-empty description="暂无搜索结果">
        <template #extra>
          <n-button @click="$router.push('/')">返回首页</n-button>
        </template>
      </n-empty>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { searchService } from '@/services/searchService'
import type { Post } from '@/services/articleService'
import { NEmpty, NButton, NSpin } from 'naive-ui'

// 使用后端的Post接口代替本地的SearchResult接口

const route = useRoute()
const searchQuery = ref('')
const searchResults = ref<Post[]>([])
const loading = ref(false)
const error = ref<string | null>(null)

// 监听路由参数变化
watch(
  () => route.query.q,
  (newQuery) => {
    if (newQuery) {
      searchQuery.value = newQuery as string
      performSearch()
    }
  },
  { immediate: true }
)

// 执行搜索
const performSearch = async () => {
  if (!searchQuery.value) return
  
  loading.value = true
  error.value = null
  searchResults.value = []
  
  try {
    // 调用搜索服务
    const response = await searchService.searchPosts({ q: searchQuery.value })
    searchResults.value = Array.isArray(response) ? response : []
  } catch (err) {
    console.error('搜索失败:', err)
    error.value = '搜索失败，请稍后重试'
  } finally {
    loading.value = false
  }
}

// 格式化日期
const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}
</script>

<style scoped>
.search-view {
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;
}

.search-header {
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

.search-title {
  font-size: 24px;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 8px;
}

.search-info {
  font-size: 14px;
  color: #666;
}

.search-results {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.search-item {
  padding: 20px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.search-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.result-link {
  text-decoration: none;
  color: inherit;
}

.result-title {
  font-size: 18px;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 8px;
}

.result-excerpt {
  font-size: 14px;
  color: #666;
  margin-bottom: 12px;
  line-height: 1.6;
}

.result-meta {
  display: flex;
  gap: 16px;
  font-size: 12px;
  color: #999;
}

.no-results {
  padding: 40px 0;
  text-align: center;
}

/* 暗色模式 */
:root.dark-theme {
  .search-title {
    color: #e5e5e5;
  }

  .search-info {
    color: #999;
  }

  .search-item {
    background: #1a1a1a;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  }

  .result-title {
    color: #e5e5e5;
  }

  .result-excerpt {
    color: #999;
  }

  .result-meta {
    color: #666;
  }
}
</style>