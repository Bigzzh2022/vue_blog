<template>
  <div class="article-view">
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
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useMessage } from 'naive-ui'
import { CalendarOutline, EyeOutline, FolderOutline } from '@vicons/ionicons5'
import { WeiboOutlined, WechatOutlined, LinkOutlined } from '@vicons/antd'
import CommentList from '@/components/CommentList.vue'
import MarkdownPreview from '@/components/MarkdownPreview.vue'
import { useArticleStore } from '@/stores/article'

const route = useRoute()
const message = useMessage()
const articleStore = useArticleStore()
const articleId = route.params.id as string

// 文章数据
const article = ref({
  id: articleId,
  title: '在Vue3中使用TypeScript的最佳实践',
  content: `# 在Vue3中使用TypeScript的最佳实践

## 引言
TypeScript已经成为现代前端开发中不可或缺的工具。在Vue3项目中正确使用TypeScript不仅可以提高代码质量，还能获得更好的开发体验。

## 为什么要在Vue3中使用TypeScript？
1. 好的类型检查
2. 更好的IDE支持
3. 更容易重构
4. 更好的团队协作

## 代码示例

### 1. 组件Props的类型定义

\`\`\`typescript
interface Props {
  message: string
  count?: number
  isVisible?: boolean
}

defineProps<Props>()
\`\`\`

### 2. 响应式数据的类型定义

\`\`\`typescript
interface User {
  id: number
  name: string
  email: string
}

const userExample = ref<User>({
  id: 1,
  name: 'John Doe',
  email: 'john@example.com'
})
\`\`\`

### 3. 计算属性的类型推导

\`\`\`typescript
const fullNameExample = computed(() => {
  return \`\${userExample.value.name} (\${userExample.value.email})\`
})
\`\`\`

## 最佳实践

1. 始终为props定义类型
2. 使用类型断言要谨慎
3. 善用工具类型
4. 保持类型定义的一致性

## 常见陷阱

1. any的过度使用
2. 类型断言的滥用
3. 忽略null和undefined检查

## 总结

TypeScript能够显著提升Vue3项目的开发体验和代码质量，但需要遵循一些最佳实践才能充分发挥其优势。

## 参考资料

1. [Vue3官方文档](https://vuejs.org/)
2. [TypeScript官方文档](https://www.typescriptlang.org/)
3. [Vue3 + TypeScript最佳实践指南](https://example.com)`,
  publishDate: new Date('2024-01-15'),
  views: 1234,
  category: '前端开发',
  tags: ['Vue3', 'TypeScript', '最佳实践', '前端开发'],
  coverImage: 'https://picsum.photos/800/400'
})

const prevArticle = ref({
  id: 'prev-article',
  title: 'Vue3组件设计模式解析'
})

const nextArticle = ref({
  id: 'next-article',
  title: 'Vue3性能优化指南'
})

// 格式化日期
const formatDate = (date: Date) => {
  return new Date(date).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

// 监听路由变化
watch(() => route.params.id, async (newId) => {
  if (newId) {
    // 这里应该调用API获取新文章数据
    // const response = await fetch(`/api/articles/${newId}`)
    // article.value = await response.json()
    
    // 更新文章标题
    console.log('Setting title on route change:', article.value.title)
    articleStore.setTitle(article.value.title)
  }
}, { immediate: true })

onMounted(() => {
  // 假设这里从API获取文章数据
  const articleTitle = '在Vue3中使用TypeScript的最佳实践'
  articleStore.setTitle(articleTitle)
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