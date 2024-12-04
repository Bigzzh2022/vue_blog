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

    <div class="timeline-content">
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
            :time="post.date"
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
import { ref, computed } from 'vue'
import { 
  NTimeline, 
  NTimelineItem, 
  NSpace, 
  NIcon, 
  NTag 
} from 'naive-ui'
import { 
  ClockCircleOutlined,
  FolderOutlined
} from '@vicons/antd'

interface Post {
  id: number
  title: string
  description: string
  date: string
  category: string
  tags: string[]
  type: 'default' | 'success' | 'info' | 'warning' | 'error'
}

interface YearGroup {
  year: number
  posts: Post[]
}

// 模拟时间轴数据
const timelineData = ref<YearGroup[]>([
  {
    year: 2024,
    posts: [
      {
        id: 1,
        title: 'Vue3 组合式 API 最佳实践',
        description: '本文介绍了 Vue3 组合式 API 的使用技巧和最佳实践，帮助你更好地组织代码...',
        date: '2024-01-15',
        category: '技术',
        tags: ['Vue', 'TypeScript'],
        type: 'success'
      },
      {
        id: 2,
        title: 'TypeScript 高级技巧分享',
        description: '深入探讨 TypeScript 的高级特性，包括类型体操、泛型和装饰器等内容...',
        date: '2024-01-14',
        category: '技术',
        tags: ['TypeScript', 'JavaScript'],
        type: 'info'
      }
    ]
  },
  {
    year: 2023,
    posts: [
      {
        id: 3,
        title: '2023 年度总结',
        description: '回顾过去一年的收获，展望新的一年的目标和计划...',
        date: '2023-12-31',
        category: '生活',
        tags: ['随笔'],
        type: 'warning'
      }
    ]
  }
])

// 计算文章总数
const totalPosts = computed(() => 
  timelineData.value.reduce((sum, year) => sum + year.posts.length, 0)
)
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