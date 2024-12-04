<template>
  <div class="category-view">
    <!-- 分类列表页 -->
    <template v-if="!slug">
      <div class="category-list">
        <h2 class="section-title">
          <NIcon size="24" class="title-icon">
            <FolderOutlined />
          </NIcon>
          分类
        </h2>
        
        <div class="category-grid">
          <NCard 
            v-for="category in categories" 
            :key="category.id"
            class="category-card"
            :class="{ active: currentCategory?.id === category.id }"
            hoverable
            @click="goToCategory(category)"
          >
            <div class="category-content">
              <div class="category-info">
                <h3>{{ category.name }}</h3>
                <div class="category-meta">
                  <NIcon size="16"><FileTextOutlined /></NIcon>
                  <span>{{ category.count }} 篇文章</span>
                </div>
              </div>
              <div class="category-icon">
                <NIcon size="24">
                  <FolderOutlined />
                </NIcon>
              </div>
            </div>
          </NCard>
        </div>
      </div>
    </template>

    <!-- 具体分类页 -->
    <template v-else>
      <div class="category-detail">
        <div class="category-header">
          <NSpace align="center" justify="space-between">
            <NSpace align="center">
              <NButton quaternary circle @click="router.push('/categories')">
                <template #icon>
                  <NIcon><ArrowLeftOutlined /></NIcon>
                </template>
              </NButton>
              <h1>{{ currentCategory?.name }}</h1>
              <NTag size="small" round>{{ currentCategory?.count }} 篇文章</NTag>
            </NSpace>
            <NSelect
              v-model:value="sortBy"
              :options="sortOptions"
              size="small"
              class="sort-select"
            />
          </NSpace>
        </div>

        <div class="article-list">
          <NCard 
            v-for="article in articles" 
            :key="article.id"
            class="article-card"
            hoverable
          >
            <div class="article-content">
              <h3 class="article-title">{{ article.title }}</h3>
              <p class="article-desc">{{ article.description }}</p>
              <div class="article-meta">
                <div class="meta-left">
                  <NSpace align="center" size="small">
                    <NIcon><CalendarOutlined /></NIcon>
                    <span>{{ article.createTime }}</span>
                  </NSpace>
                  <NSpace align="center" size="small">
                    <NIcon><EyeOutlined /></NIcon>
                    <span>{{ article.views }} 阅读</span>
                  </NSpace>
                </div>
                <div class="meta-right">
                  <NSpace>
                    <NTag 
                      v-for="tag in article.tags" 
                      :key="tag"
                      size="small"
                      round
                      :bordered="false"
                      type="success"
                    >
                      {{ tag }}
                    </NTag>
                  </NSpace>
                </div>
              </div>
            </div>
          </NCard>
        </div>

        <div class="pagination">
          <NPagination
            v-model:page="currentPage"
            :page-size="pageSize"
            :item-count="currentCategory?.count || 0"
            :page-slot="5"
            show-size-picker
            :page-sizes="[10, 20, 30, 40]"
            show-quick-jumper
          />
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { 
  NCard, 
  NSpace, 
  NIcon, 
  NTag, 
  NPagination,
  NSelect,
  NButton
} from 'naive-ui'
import { 
  FolderOutlined,
  FileTextOutlined,
  CalendarOutlined,
  EyeOutlined,
  ArrowLeftOutlined
} from '@vicons/antd'

// 定义分类接口
interface Category {
  id: number
  name: string
  slug: string
  count: number
}

// 定义文章接口
interface Article {
  id: number
  title: string
  description: string
  createTime: string
  views: number
  tags: string[]
}

const router = useRouter()
const route = useRoute()
const slug = computed(() => route.params.slug as string)

// 模拟分类数据
const categories = ref<Category[]>([
  {
    id: 1,
    name: '技术',
    slug: 'tech',
    count: 25
  },
  {
    id: 2,
    name: '生活',
    slug: 'life',
    count: 18
  },
  {
    id: 3,
    name: '随笔',
    slug: 'essay',
    count: 15
  },
  {
    id: 4,
    name: '阅读',
    slug: 'reading',
    count: 12
  }
])

// 模拟文章数据
const articles = ref<Article[]>([
  {
    id: 1,
    title: 'Vue3 组合式 API 最佳实践',
    description: '本文介绍了 Vue3 组合式 API 的使用技巧和最佳实践，帮助你更好地组织代码...',
    createTime: '2024-01-15',
    views: 156,
    tags: ['Vue', 'TypeScript']
  },
  {
    id: 2,
    title: 'TypeScript 高级技巧分享',
    description: '深入探讨 TypeScript 的高级特性，包括类型体操、泛型和装饰器等内容...',
    createTime: '2024-01-14',
    views: 89,
    tags: ['TypeScript', 'JavaScript']
  },
  {
    id: 3,
    title: '2024 年度计划',
    description: '回顾过去一年的收获，展望新的一年的目标和计划...',
    createTime: '2024-01-13',
    views: 245,
    tags: ['随笔']
  }
])

const currentPage = ref(1)
const pageSize = ref(10)

// 跳转到具体分类页
const goToCategory = (category: Category) => {
  router.push(`/category/${category.slug}`)
}

// 根据 slug 获取当前分类
const currentCategory = computed(() => {
  if (!slug.value) return null
  return categories.value.find((c: Category) => c.slug === slug.value) || null
})

// 监听路由变化，重置页码
onMounted(() => {
  currentPage.value = 1
})

// 添加排序选项
const sortBy = ref('newest')
const sortOptions = [
  { label: '最新发布', value: 'newest' },
  { label: '最多阅读', value: 'most-read' },
  { label: '最早发布', value: 'oldest' }
]
</script>

<style scoped>
.category-view {
  max-width: 1200px;
  margin: 0 auto;
  padding: 80px 20px 40px;
  min-height: 100vh;
}

.section-title {
  font-size: 24px;
  margin-bottom: 24px;
  color: #333;
  display: flex;
  align-items: center;
  gap: 8px;
}

.title-icon {
  color: #18a058;
}

.category-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 40px;
}

.category-card {
  cursor: pointer;
  transition: all 0.3s ease;
}

.category-card.active {
  border-color: #18a058;
  background-color: #e8f7ed;
}

.category-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.category-info h3 {
  margin: 0 0 8px;
  font-size: 18px;
  color: #333;
}

.category-meta {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #666;
  font-size: 14px;
}

.category-icon {
  color: #999;
}

.active .category-icon {
  color: #18a058;
}

.list-header {
  margin-bottom: 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-info h2 {
  font-size: 24px;
  margin: 0 0 8px;
  color: #333;
}

.header-meta {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #666;
  font-size: 14px;
}

.article-cards {
  width: 100%;
}

.article-card {
  transition: transform 0.3s ease;
  border: 1px solid #eee;
}

.article-card:hover {
  transform: translateY(-4px);
}

.article-title {
  font-size: 18px;
  margin: 0 0 12px;
  color: #333;
}

.article-desc {
  color: #666;
  margin: 0 0 16px;
  line-height: 1.6;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  max-height: 3.2em;
}

.article-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #999;
  font-size: 14px;
}

.meta-left {
  display: flex;
  gap: 16px;
}

.pagination {
  margin-top: 40px;
  display: flex;
  justify-content: center;
}

.empty-state {
  padding: 60px 0;
  text-align: center;
  background: #fff;
  border-radius: 8px;
  margin-top: 24px;
}

/* 添加具体分类页样式 */
.category-header {
  margin-bottom: 24px;
  padding-bottom: 24px;
  border-bottom: 1px solid #eee;
}

.category-header h1 {
  font-size: 28px;
  margin: 0;
  color: #333;
}

.sort-select {
  width: 120px;
}

.article-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-bottom: 40px;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .category-view {
    padding: 60px 16px 24px;
  }

  .category-header {
    margin-bottom: 16px;
    padding-bottom: 16px;
  }

  .category-header h1 {
    font-size: 24px;
  }

  .article-meta {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
}
</style> 