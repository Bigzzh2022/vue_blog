<template>
  <div class="article-view">
    <!-- 加载状态 -->
    <div v-if="loading" class="loading-state">
      <n-spin size="large" />
      <p>正在加载文章...</p>
    </div>
    
    <!-- 错误状态 -->
    <div v-else-if="error" class="error-state">
      <n-result status="error" title="加载失败" :description="error">
        <template #footer>
          <n-button @click="loadArticle(articleId)">重试</n-button>
        </template>
      </n-result>
    </div>
    
    <!-- 文章内容 -->
    <!-- 文章头部 -->
    <header class="article-header">
      <div class="article-meta">
        <h1 class="article-title">{{ article.title }}</h1>
        <div class="article-info">
          <span class="publish-date">
            <n-icon><CalendarOutline /></n-icon>
            {{ formatDate(article.publishDate) }}
          </span>
          <span class="view-count">
            <n-icon><EyeOutline /></n-icon>
            {{ article.views }} 阅读
          </span>
          <span class="category">
            <n-icon><FolderOutline /></n-icon>
            {{ article.category }}
          </span>
        </div>
        <div class="tags">
          <n-tag
            v-for="tag in article.tags"
            :key="tag"
            size="small"
            round
          >
            {{ tag }}
          </n-tag>
        </div>
      </div>
      <div class="article-cover" v-if="article.coverImage">
        <img :src="article.coverImage" :alt="article.title">
      </div>
    </header>

    <!-- 文章内容 -->
    <main class="article-content">
      <div class="markdown-body">
        <MarkdownPreview :content="article.content" />
      </div>
    </main>

    <!-- 文章底部 -->
    <footer class="article-footer">
      <!-- 上一篇/下一篇导航 -->
      <div class="article-nav">
        <div class="prev-article" v-if="prevArticle">
          <router-link :to="'/article/' + prevArticle.id">
            <span class="nav-label">上一篇</span>
            <span class="nav-title">{{ prevArticle.title }}</span>
          </router-link>
        </div>
        <div class="next-article" v-if="nextArticle">
          <router-link :to="'/article/' + nextArticle.id">
            <span class="nav-label">下一篇</span>
            <span class="nav-title">{{ nextArticle.title }}</span>
          </router-link>
        </div>
      </div>

      <!-- 分享按钮 -->
      <div class="share-buttons">
        <n-button-group>
          <n-button @click="shareToWeibo">
            <template #icon><WeiboOutlined /></template>
            微博
          </n-button>
          <n-button @click="shareToWechat">
            <template #icon><WechatOutlined /></template>
            微信
          </n-button>
          <n-button @click="copyLink">
            <template #icon><LinkOutlined /></template>
            复制链接
          </n-button>
        </n-button-group>
      </div>
    </footer>

    <!-- 评论区 -->
    <section class="comments-section">
      <h2>评论</h2>
      <CommentList :article-id="articleId" />
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { useMessage } from 'naive-ui'
import { CalendarOutline, EyeOutline, FolderOutline } from '@vicons/ionicons5'
import { WeiboOutlined, WechatOutlined, LinkOutlined } from '@vicons/antd'
import CommentList from '@/components/CommentList.vue'
import MarkdownPreview from '@/components/MarkdownPreview.vue'
import { useArticleStore } from '@/stores/article'
import { articleService, type Post } from '@/services/articleService'
import { NSpin, NResult, NButton } from 'naive-ui'

const route = useRoute()
const message = useMessage()
const articleStore = useArticleStore()
const articleId = route.params.id as string

// 文章数据
const article = ref<Post>({} as Post)
const loading = ref(true)
const error = ref<string | null>(null)

// 上一篇/下一篇文章
const prevArticle = ref<{ id: string, title: string } | null>(null)
const nextArticle = ref<{ id: string, title: string } | null>(null)

// 加载文章数据
const loadArticle = async (id: string) => {
  loading.value = true
  error.value = null
  
  try {
    // 使用 articleService 获取文章数据
    // http.ts 中的响应拦截器会自动返回 response.data
    article.value = await articleService.getPost(id)
    
    // 设置文章标题
    articleStore.setTitle(article.value.title)
    
    // 加载上一篇/下一篇文章
    // 注意：这里假设后端有相应接口，实际实现可能需要调整
    // 如果后端没有相应接口，可以先不实现这个功能
    // const navResponse = await articleService.getArticleNavigation(id)
    // prevArticle.value = navResponse.prev
    // nextArticle.value = navResponse.next
    
    // 处理文章中的外部链接
    nextTick(() => {
      processExternalLinks()
    })
  } catch (err) {
    console.error('加载文章失败:', err)
    error.value = err instanceof Error ? err.message : '加载文章失败'
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

// 监听路由变化
watch(() => route.params.id, async (newId) => {
  if (newId) {
    // 调用加载文章函数
    await loadArticle(newId as string)
  }
}, { immediate: true })

// 检查链接是否为外部链接
const isExternalLink = (href: string): boolean => {
  // 如果是以http://或https://开头的链接，并且不是指向当前域名
  return /^https?:\/\//.test(href) && !href.includes(window.location.hostname)
}

// 处理文章中的外部链接
const processExternalLinks = () => {
  // 等待DOM更新后处理链接
  nextTick(() => {
    // 获取文章内容中的所有链接
    const articleLinks = document.querySelectorAll('.article-content a[href]')
    
    articleLinks.forEach(link => {
      const anchorElement = link as HTMLAnchorElement
      const href = anchorElement.getAttribute('href')
      if (href && isExternalLink(href)) {
        // 添加v-safe-link属性标记
        anchorElement.setAttribute('v-safe-link', '')
        
        // 添加点击事件处理
        anchorElement.addEventListener('click', (e: MouseEvent) => {
          e.preventDefault()
          // 获取链接URL
          const url = anchorElement.getAttribute('href') || ''
          // 触发安全链接提示
          window.dispatchEvent(new CustomEvent('external-link-click', { 
            detail: { url } 
          }))
        })
      }
    })
  })
}

onMounted(() => {
  // 从 API 获取文章数据
  if (articleId) {
    loadArticle(articleId)
  }
})

onUnmounted(() => {
  articleStore.clearTitle()
})

// 分享功能
const shareToWeibo = () => {
  const url = encodeURIComponent(window.location.href)
  const title = encodeURIComponent(article.value.title)
  window.open(`http://service.weibo.com/share/share.php?url=${url}&title=${title}`)
}

const shareToWechat = () => {
  message.info('请截图分享到微信')
}

const copyLink = async () => {
  try {
    await navigator.clipboard.writeText(window.location.href)
    message.success('链接已复制')
  } catch (err) {
    message.error('复制失败')
  }
}

// 监听文章数据变化
watch(() => article.value.title, (newTitle) => {
  if (newTitle) {
    console.log('Setting article title:', newTitle)
    articleStore.setTitle(newTitle)
  }
}, { immediate: true })

// 监听文章数据变化
watch(() => article.value.content, () => {
  // 当文章内容变化时，重新处理外部链接
  processExternalLinks()
})

// 组件卸载时清除标题
onUnmounted(() => {
  articleStore.clearTitle()
})
</script>

<style scoped>
.article-view {
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;
  background-color: #ffffff;
}

.article-header {
  margin-bottom: 40px;
  padding: 24px;
  background: #f8f9fa;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.article-title {
  font-size: 2.5em;
  font-weight: 800;
  margin-bottom: 20px;
  color: #1a1a1a;
  line-height: 1.3;
}

.article-info {
  display: flex;
  gap: 20px;
  color: #4a5568;
  margin-bottom: 16px;
  font-weight: 500;
}

.article-info span {
  display: flex;
  align-items: center;
  gap: 6px;
  background: #edf2f7;
  padding: 4px 12px;
  border-radius: 20px;
}

.tags {
  margin-top: 16px;
  display: flex;
  gap: 8px;
}

:deep(.n-tag) {
  background: #2d3748 !important;
  color: #ffffff !important;
  font-weight: 500;
}

.article-cover {
  margin-top: 24px;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.article-cover img {
  width: 100%;
  height: auto;
  object-fit: cover;
}

.article-content {
  margin-bottom: 60px;
}

.markdown-body {
  padding: 32px;
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.article-footer {
  margin-bottom: 40px;
  padding: 24px;
  background: #f8f9fa;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.article-nav {
  display: flex;
  justify-content: space-between;
  margin-bottom: 30px;
}

.prev-article,
.next-article {
  max-width: 45%;
}

.nav-label {
  display: block;
  font-size: 0.9em;
  color: #4a5568;
  font-weight: 500;
}

.nav-title {
  color: #1a1a1a;
  font-weight: 600;
}

.share-buttons {
  display: flex;
  justify-content: center;
  margin-top: 30px;
}

:deep(.n-button) {
  font-weight: 500;
}

.comments-section {
  padding: 32px;
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.comments-section h2 {
  margin-bottom: 24px;
  font-size: 1.8em;
  font-weight: 700;
  color: #1a1a1a;
}

@media (max-width: 768px) {
  .article-view {
    padding: 16px;
  }

  .article-title {
    font-size: 1.8em;
  }

  .article-info {
    flex-wrap: wrap;
    gap: 12px;
  }

  .article-nav {
    flex-direction: column;
    gap: 16px;
  }

  .prev-article,
  .next-article {
    max-width: 100%;
  }

  .markdown-body {
    padding: 20px;
  }
}
</style> 