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
        
        <div v-if="loading" class="loading-state">
          <NSpin size="medium" />
          <p>加载分类中...</p>
        </div>
        <div v-else-if="error" class="error-state">
          <p>{{ error }}</p>
          <NButton @click="fetchCategories">重试</NButton>
        </div>
        <div v-else-if="categories.length === 0" class="empty-state">
          <NEmpty description="暂无分类" />
        </div>
        <div v-else class="category-grid">
          <NCard 
            v-for="category in categories" 
            :key="category.name"
            class="category-card"
            :class="{ active: currentCategory?.name === category.name }"
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
          <div v-if="articlesLoading" class="loading-state">
            <NSpin size="medium" />
            <p>加载文章中...</p>
          </div>
          <div v-else-if="articlesError" class="error-state">
            <p>{{ articlesError }}</p>
            <NButton @click="fetchArticlesByCategory">重试</NButton>
          </div>
          <div v-else-if="articles.length === 0" class="empty-state">
            <NEmpty description="暂无文章" />
          </div>
          <template v-else>
            <NCard 
              v-for="article in articles" 
              :key="article.id"
              class="article-card"
              hoverable
              @click="router.push(`/article/${article.id}`)"
            >
              <div class="article-content">
                <h3 class="article-title">{{ article.title }}</h3>
                <p class="article-desc">{{ article.description }}</p>
                <div class="article-meta">
                  <div class="meta-left">
                    <NSpace align="center" size="small">
                      <NIcon><CalendarOutlined /></NIcon>
                      <span>{{ formatDate(article.publishDate) }}</span>
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
          </template>
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
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { 
  NCard, 
  NSpace, 
  NIcon, 
  NTag, 
  NPagination,
  NSelect,
  NButton,
  NSpin,
  NEmpty
} from 'naive-ui'
import { 
  FolderOutlined,
  FileTextOutlined,
  CalendarOutlined,
  EyeOutlined,
  ArrowLeftOutlined
} from '@vicons/antd'
import { categoryService, type Category } from '@/services/categoryService'
import { articleService, type Post } from '@/services/articleService'

// 扩展分类接口，添加额外属性
interface CategoryWithMeta extends Category {
  slug: string
  count: number
}

// 使用后端的Post接口代替本地的Article接口

const router = useRouter()
const route = useRoute()
const slug = computed(() => route.params.slug as string)

// 状态变量
const loading = ref(false)
const error = ref<string | null>(null)
const categories = ref<CategoryWithMeta[]>([])
const articles = ref<Post[]>([])
const articlesLoading = ref(false)
const articlesError = ref<string | null>(null)
const totalArticles = ref(0)

const currentPage = ref(1)
const pageSize = ref(10)

// 添加排序选项
const sortBy = ref('newest')

// 跳转到具体分类页
const goToCategory = (category: Category) => {
  router.push(`/category/${category.slug}`)
}

// 根据 slug 获取当前分类
const currentCategory = computed(() => {
  if (!slug.value) return null
  return categories.value.find((c) => c.slug === slug.value) || null
})

// 获取所有分类
const fetchCategories = async () => {
  loading.value = true
  error.value = null
  
  try {
    const response = await categoryService.getCategories()
    
    // 将后端返回的分类数据转换为前端需要的格式
    categories.value = (Array.isArray(response) ? response : []).map((category: Category) => ({
      ...category,
      slug: category.name.toLowerCase().replace(/\s+/g, '-'), // 生成slug
      count: 0 // 初始化文章数量为0
    }))
    
    // 获取每个分类的文章数量
    await Promise.all(categories.value.map(async (category) => {
      try {
        const articles = await articleService.getPosts({ category: category.name, status: 'published' })
        category.count = Array.isArray(articles) ? articles.length : 0
      } catch (err) {
        console.error(`获取分类 ${category.name} 的文章数量失败:`, err)
      }
    }))
  } catch (err) {
    console.error('获取分类列表失败:', err)
    error.value = '获取分类列表失败，请稍后重试'
  } finally {
    loading.value = false
  }
}

// 获取分类下的文章
const fetchArticlesByCategory = async () => {
  if (!currentCategory.value) return
  
  articlesLoading.value = true
  articlesError.value = null
  
  try {
    // 调用API获取指定分类的文章
    const response = await articleService.getPosts({ 
      category: currentCategory.value.name,
      status: 'published',
      // 可以添加分页参数，如果后端支持的话
      // page: currentPage.value,
      // pageSize: pageSize.value
    })
    
    articles.value = Array.isArray(response) ? response : []
    totalArticles.value = articles.value.length
    
    // 根据排序选项排序文章
    sortArticles()
  } catch (err) {
    console.error('获取分类文章失败:', err)
    articlesError.value = '获取文章列表失败，请稍后重试'
  } finally {
    articlesLoading.value = false
  }
}

// 排序文章
const sortArticles = () => {
  const sortedArticles = [...articles.value]
  
  switch (sortBy.value) {
    case 'newest':
      sortedArticles.sort((a, b) => new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime())
      break
    case 'oldest':
      sortedArticles.sort((a, b) => new Date(a.publishDate).getTime() - new Date(b.publishDate).getTime())
      break
    case 'most-read':
      sortedArticles.sort((a, b) => b.views - a.views)
      break
  }
  
  articles.value = sortedArticles
}

// 监听排序变化
watch(sortBy, () => {
  sortArticles()
})

// 监听路由变化
watch(() => route.params.slug, () => {
  currentPage.value = 1
  if (slug.value) {
    fetchArticlesByCategory()
  }
}, { immediate: true })

// 格式化日期
const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

onMounted(() => {
  // 获取所有分类
  fetchCategories()
  
  // 如果有slug参数，获取该分类下的文章
  if (slug.value) {
    fetchArticlesByCategory()
  }
})

// 排序选项已在上方定义
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