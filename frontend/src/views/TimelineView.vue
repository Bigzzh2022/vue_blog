<template>
  <div class="timeline-view">
    <div class="timeline-header">
      <h2 class="section-title">
        <NIcon size="24" class="title-icon">
          <ClockCircleOutlined />
        </NIcon>
        时间轴
      </h2>
      <div class="timeline-stats">
        <span>共 {{ totalPosts }} 篇文章</span>
      </div>
    </div>

    <div v-if="loading" class="loading-state">
      <n-spin size="medium" />
      <p>加载文章中...</p>
    </div>
    
    <div v-else-if="error" class="error-state">
      <p>{{ error }}</p>
      <n-button @click="fetchPosts">重试</n-button>
    </div>
    
    <div v-else-if="timelineData.length === 0" class="empty-state">
      <n-empty description="暂无文章" />
    </div>
    
    <div v-else class="timeline-content">
      <div v-for="year in timelineData" :key="year.year" class="year-group">
        <div class="year-header">
          <h3>{{ year.year }}</h3>
          <span class="post-count">{{ year.posts.length }} 篇文章</span>
        </div>
        
        <NTimeline>
          <NTimelineItem
            v-for="post in year.posts"
            :key="post.id"
            :title="post.title"
            :time="formatDate(post.publishDate)"
            :type="post.type"
          >
            <template #content>
              <div class="post-content">
                <p class="post-desc">{{ post.description }}</p>
                <div class="post-meta">
                  <NSpace align="center" size="small">
                    <NIcon><FolderOutlined /></NIcon>
                    <span>{{ post.category }}</span>
                  </NSpace>
                  <NSpace>
                    <NTag 
                      v-for="tag in post.tags" 
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
            </template>
          </NTimelineItem>
        </NTimeline>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { 
  NTimeline, 
  NTimelineItem, 
  NSpace, 
  NIcon, 
  NTag,
  NSpin,
  NEmpty,
  NButton
} from 'naive-ui'
import { 
  ClockCircleOutlined,
  FolderOutlined
} from '@vicons/antd'
import { articleService, type Post as ApiPost } from '@/services/articleService'

// 扩展API返回的Post类型，添加时间轴显示类型
interface TimelinePost extends ApiPost {
  type: 'default' | 'success' | 'info' | 'warning' | 'error'
}

interface YearGroup {
  year: number
  posts: TimelinePost[]
}

// 状态变量
const loading = ref(false)
const error = ref<string | null>(null)
const timelineData = ref<YearGroup[]>([])

// 获取所有文章并按年份分组
const fetchPosts = async () => {
  loading.value = true
  error.value = null
  
  try {
    // 获取所有已发布的文章
    const response = await articleService.getPosts({ status: 'published' })
    console.log('文章接口返回数据', response);
    const posts = Array.isArray(response) ? response : []
    
    // 将文章按年份分组
    const postsByYear = new Map<number, TimelinePost[]>()
    
    posts.forEach(post => {
      // 从发布日期提取年份
      const publishDate = new Date(post.publishDate)
      const year = publishDate.getFullYear()
      
      // 根据分类决定显示类型
      let type: TimelinePost['type'] = 'default'
      switch (post.category.toLowerCase()) {
        case '技术':
          type = 'success'
          break
        case '生活':
          type = 'info'
          break
        case '随笔':
          type = 'warning'
          break
        default:
          type = 'default'
      }
      
      // 添加到对应年份的数组中
      const timelinePost: TimelinePost = { ...post, type }
      
      if (!postsByYear.has(year)) {
        postsByYear.set(year, [])
      }
      postsByYear.get(year)!.push(timelinePost)
    })
    
    // 将Map转换为数组并按年份降序排序
    const result: YearGroup[] = []
    
    // 将年份按降序排序
    const sortedYears = Array.from(postsByYear.keys()).sort((a, b) => b - a)
    
    for (const year of sortedYears) {
      const yearPosts = postsByYear.get(year)!
      // 在每个年份内按日期降序排序文章
      yearPosts.sort((a, b) => new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime())
      
      result.push({
        year,
        posts: yearPosts
      })
    }
    
    timelineData.value = result
  } catch (err) {
    console.error('获取文章列表失败:', err)
    error.value = '获取文章列表失败，请稍后重试'
  } finally {
    loading.value = false
  }
}

// 计算文章总数
const totalPosts = computed(() => 
  timelineData.value.reduce((sum, year) => sum + year.posts.length, 0)
)

// 格式化日期
const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

onMounted(() => {
  fetchPosts()
})
</script>

<style scoped>
.timeline-view {
  max-width: 800px;
  margin: 0 auto;
  padding: 80px 20px 40px;  /* 顶部内边距避免被导航栏遮挡 */
  min-height: 100vh;
}

.timeline-header {
  margin-bottom: 40px;
  text-align: center;
}

.section-title {
  font-size: 28px;
  color: #333;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.title-icon {
  color: #18a058;
}

.timeline-stats {
  color: #666;
  font-size: 16px;
}

.timeline-content {
  padding: 20px 0;
}

.year-group {
  margin-bottom: 40px;
}

.year-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
}

.year-header h3 {
  font-size: 24px;
  color: #333;
  margin: 0;
}

.post-count {
  color: #666;
  font-size: 14px;
}

.post-content {
  padding: 12px 0;
}

.post-desc {
  color: #666;
  margin: 0 0 12px;
  line-height: 1.6;
}

.post-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #999;
  font-size: 14px;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .timeline-view {
    padding: 60px 16px 24px;
  }

  .section-title {
    font-size: 24px;
  }

  .post-meta {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
}

:deep(.n-timeline) {
  padding-left: 20px;
}

:deep(.n-timeline-item-content) {
  margin-left: 20px;
}

:deep(.n-tag) {
  cursor: pointer;
}
</style> 