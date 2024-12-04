<template>
  <div class="comment-list">
    <!-- 评论输入框 -->
    <div class="comment-input">
      <n-input
        v-model:value="commentContent"
        type="textarea"
        placeholder="写下你的评论..."
        :autosize="{ minRows: 3, maxRows: 6 }"
      />
      <div class="comment-actions">
        <n-button type="primary" @click="submitComment" :loading="submitting">
          发表评论
        </n-button>
      </div>
    </div>

    <!-- 评论列表 -->
    <div class="comments">
      <template v-if="comments.length">
        <div v-for="comment in comments" :key="comment.id" class="comment-item">
          <div class="comment-avatar">
            <img :src="comment.avatar" :alt="comment.username">
          </div>
          <div class="comment-content">
            <div class="comment-header">
              <span class="username">{{ comment.username }}</span>
              <span class="time">{{ formatTime(comment.time) }}</span>
            </div>
            <div class="comment-text">{{ comment.content }}</div>
            <div class="comment-footer">
              <n-button text size="small" @click="replyTo(comment)">
                <template #icon>
                  <n-icon><MessageOutlined /></n-icon>
                </template>
                回复
              </n-button>
              <n-button text size="small" @click="likeComment(comment)">
                <template #icon>
                  <n-icon><ThumbsUpOutline /></n-icon>
                </template>
                {{ comment.likes }}
              </n-button>
            </div>
          </div>
        </div>
      </template>
      <div v-else class="no-comments">
        暂无评论，快来抢沙发吧！
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useMessage } from 'naive-ui'
import { MessageOutlined } from '@vicons/antd'
import { ThumbsUpOutline } from '@vicons/ionicons5'

const props = defineProps<{
  articleId: string
}>()

const message = useMessage()
const commentContent = ref('')
const submitting = ref(false)

// 示例评论数据
const comments = ref([
  {
    id: 1,
    username: '张三',
    avatar: 'https://picsum.photos/50/50',
    content: '写得很好，学习了！',
    time: new Date('2024-01-15T10:30:00'),
    likes: 5
  },
  {
    id: 2,
    username: '李四',
    avatar: 'https://picsum.photos/51/51',
    content: '这篇文章对我帮助很大。',
    time: new Date('2024-01-15T11:20:00'),
    likes: 3
  }
])

// 格式化时间
const formatTime = (date: Date) => {
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const minute = 60 * 1000
  const hour = minute * 60
  const day = hour * 24

  if (diff < minute) {
    return '刚刚'
  } else if (diff < hour) {
    return `${Math.floor(diff / minute)}分钟前`
  } else if (diff < day) {
    return `${Math.floor(diff / hour)}小时前`
  } else {
    return date.toLocaleDateString('zh-CN', {
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric'
    })
  }
}

// 提交评论
const submitComment = async () => {
  if (!commentContent.value.trim()) {
    message.warning('请输入评论内容')
    return
  }

  submitting.value = true
  try {
    // 这里应该调用后端 API
    // await submitCommentApi(props.articleId, commentContent.value)
    
    // 模拟提交成功
    setTimeout(() => {
      comments.value.unshift({
        id: Date.now(),
        username: '当前用户',
        avatar: 'https://picsum.photos/52/52',
        content: commentContent.value,
        time: new Date(),
        likes: 0
      })
      commentContent.value = ''
      message.success('评论成功')
      submitting.value = false
    }, 1000)
  } catch (error) {
    message.error('评论失败，请重试')
    submitting.value = false
  }
}

// 回复评论
const replyTo = (comment: any) => {
  commentContent.value = `@${comment.username} `
}

// 点赞评论
const likeComment = (comment: any) => {
  comment.likes++
  message.success('点赞成功')
}
</script>

<style scoped>
.comment-list {
  margin-top: 20px;
}

.comment-input {
  margin-bottom: 24px;
}

.comment-actions {
  margin-top: 12px;
  display: flex;
  justify-content: flex-end;
}

.comments {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.comment-item {
  display: flex;
  gap: 16px;
  padding: 16px;
  background: var(--card-color);
  border-radius: 8px;
}

.comment-avatar img {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
}

.comment-content {
  flex: 1;
}

.comment-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.username {
  font-weight: 500;
  color: var(--text-color-1);
}

.time {
  font-size: 0.9em;
  color: var(--text-color-3);
}

.comment-text {
  line-height: 1.6;
  color: var(--text-color-2);
  margin-bottom: 8px;
}

.comment-footer {
  display: flex;
  gap: 16px;
}

.no-comments {
  text-align: center;
  color: var(--text-color-3);
  padding: 32px 0;
}

@media (max-width: 768px) {
  .comment-item {
    padding: 12px;
  }

  .comment-avatar img {
    width: 32px;
    height: 32px;
  }
}
</style> 