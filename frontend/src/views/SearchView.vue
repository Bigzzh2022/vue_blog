<template>
  <div class="search-view">
    <div class="search-header">
      <h1 class="search-title">搜索结果</h1>
      <p class="search-info">关键词: "{{ searchQuery }}"</p>
    </div>
    
    <div class="search-results" v-if="searchResults.length">
      <div v-for="result in searchResults" :key="result.id" class="search-item">
        <router-link :to="'/article/' + result.id" class="result-link">
          <h2 class="result-title">{{ result.title }}</h2>
          <p class="result-excerpt">{{ result.excerpt }}</p>
          <div class="result-meta">
            <span class="result-date">{{ formatDate(result.date) }}</span>
            <span class="result-category">{{ result.category }}</span>
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

interface SearchResult {
  id: number
  title: string
  excerpt: string
  date: Date
  category: string
}

const route = useRoute()
const searchQuery = ref('')
const searchResults = ref<SearchResult[]>([])

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
  // 这里添加实际的搜索逻辑
  // 示例数据
  searchResults.value = [
    {
      id: 1,
      title: '在Vue3中使用TypeScript的最佳实践',
      excerpt: 'TypeScript已经成为现代前端开发中不可或缺的工具。在Vue3项目中正确使用TypeScript不仅可以提高代码质量，还能获得更好的开发体验。',
      date: new Date('2024-01-15'),
      category: '前端开发'
    },
    // 更多搜索结果...
  ]
}

// 格式化日期
const formatDate = (date: Date) => {
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