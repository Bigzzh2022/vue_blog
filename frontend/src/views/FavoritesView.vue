<template>
  <div class="favorites-container">
    <div class="header">
      <h1>收藏夹</h1>
      <n-button type="primary" @click="handleSync" :loading="syncing">
        同步收藏夹
      </n-button>
    </div>

    <n-spin :show="loading">
      <div class="folders-section" v-if="folders.length > 0">
        <n-tabs
          v-model:value="currentFolderId"
          type="line"
          :tabs-padding="20"
        >
          <n-tab-pane
            v-for="folder in folders"
            :key="folder.id"
            :name="folder.id"
            :tab="folder.title"
          >
            <div class="folder-info" v-if="folder">
              <div class="folder-header">
                <img :src="folder.cover" :alt="folder.title" class="folder-cover" />
                <div class="folder-meta">
                  <h3>{{ folder.title }}</h3>
                  <p class="description">{{ folder.description || '暂无描述' }}</p>
                  <p class="stats">
                    <span>{{ folder.media_count }} 个内容</span>
                    <span>{{ folder.public ? '公开' : '私密' }}</span>
                    <span>更新于 {{ formatDate(folder.updated_at) }}</span>
                  </p>
                </div>
              </div>
            </div>

            <n-grid :x-gap="16" :y-gap="16" cols="1 s:2 m:3 l:4 xl:5" responsive="screen">
              <n-grid-item v-for="item in currentItems" :key="item.id">
                <n-card hoverable class="favorite-card">
                  <template #cover>
                    <div class="card-cover">
                      <img :src="item.cover" :alt="item.title">
                      <div class="item-type">
                        <n-tag :type="getTypeColor(item.type)" size="small">
                          {{ getTypeLabel(item.type) }}
                        </n-tag>
                      </div>
                    </div>
                  </template>
                  <div class="card-content">
                    <h4 class="item-title" :title="item.title">{{ item.title }}</h4>
                    <p class="item-intro" :title="item.intro">{{ item.intro }}</p>
                    <div class="item-meta">
                      <span class="up-name">UP: {{ item.up_name }}</span>
                      <span class="created-time">{{ formatDate(item.created_at, 'MM-DD') }}</span>
                    </div>
                  </div>
                  <template #footer>
                    <n-button
                      text
                      tag="a"
                      :href="item.page_url"
                      target="_blank"
                      class="view-btn"
                    >
                      查看详情
                    </n-button>
                  </template>
                </n-card>
              </n-grid-item>
            </n-grid>
          </n-tab-pane>
        </n-tabs>
      </div>

      <div v-else class="empty-state">
        <n-empty description="暂无收藏夹">
          <template #extra>
            <n-button @click="handleSync">
              同步收藏夹
            </n-button>
          </template>
        </n-empty>
      </div>
    </n-spin>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useMessage } from 'naive-ui'
import type { FavoriteFolder, FavoriteItem } from '@/api/favorites'
import { syncBiliFavorites, getFavoriteFolders, getFavoriteItems } from '@/api/favorites'

const message = useMessage()
const loading = ref(false)
const syncing = ref(false)
const folders = ref<FavoriteFolder[]>([])
const currentFolderId = ref<number | null>(null)
const currentItems = ref<FavoriteItem[]>([])

// 简单的日期格式化函数
const formatDate = (dateStr: string, format: string = 'YYYY-MM-DD') => {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  
  if (format === 'MM-DD') {
    return `${month}-${day}`
  }
  return `${year}-${month}-${day}`
}

const getTypeLabel = (type: string) => {
  const types: Record<string, string> = {
    video: '视频',
    article: '专栏',
    note: '笔记'
  }
  return types[type] || '未知'
}

const getTypeColor = (type: string) => {
  const colors: Record<string, 'success' | 'info' | 'warning' | 'default'> = {
    video: 'success',
    article: 'info',
    note: 'warning'
  }
  return colors[type] || 'default'
}

const fetchFolders = async () => {
  try {
    loading.value = true
    const data = await getFavoriteFolders()
    folders.value = data
    if (data.length > 0 && !currentFolderId.value) {
      currentFolderId.value = data[0].id
    }
  } catch (error) {
    message.error('获取收藏夹列表失败')
  } finally {
    loading.value = false
  }
}

const fetchItems = async (folderId: number) => {
  if (!folderId) return
  try {
    loading.value = true
    const data = await getFavoriteItems(folderId)
    currentItems.value = data
  } catch (error) {
    message.error('获取收藏内容失败')
  } finally {
    loading.value = false
  }
}

const handleSync = async () => {
  if (syncing.value) return
  syncing.value = true
  try {
    await syncBiliFavorites()
    message.success('同步成功')
    await fetchFolders()
  } catch (error) {
    message.error('同步失败')
  } finally {
    syncing.value = false
  }
}

watch(currentFolderId, (newId) => {
  if (newId) {
    fetchItems(newId)
  }
})

onMounted(() => {
  fetchFolders()
})
</script>

<style scoped>
.favorites-container {
  padding: 20px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.folder-info {
  margin-bottom: 24px;
}

.folder-header {
  display: flex;
  gap: 20px;
  padding: 16px;
  background: rgba(0, 0, 0, 0.02);
  border-radius: 8px;
}

.folder-cover {
  width: 120px;
  height: 120px;
  object-fit: cover;
  border-radius: 8px;
}

.folder-meta {
  flex: 1;
}

.folder-meta h3 {
  margin: 0 0 8px 0;
  font-size: 18px;
}

.description {
  color: #666;
  margin: 8px 0;
  font-size: 14px;
}

.stats {
  display: flex;
  gap: 16px;
  color: #999;
  font-size: 13px;
}

.favorite-card {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.card-cover {
  position: relative;
  padding-top: 56.25%; /* 16:9 比例 */
  overflow: hidden;
}

.card-cover img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.item-type {
  position: absolute;
  top: 8px;
  right: 8px;
}

.card-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.item-title {
  margin: 8px 0;
  font-size: 14px;
  font-weight: 500;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  display: box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  box-orient: vertical;
  -webkit-box-pack: start;
  box-pack: start;
}

.item-intro {
  color: #666;
  font-size: 12px;
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  display: box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  box-orient: vertical;
  -webkit-box-pack: start;
  box-pack: start;
}

.item-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: #999;
  margin-top: auto;
}

.view-btn {
  width: 100%;
  text-align: center;
}

.empty-state {
  margin-top: 40px;
}

@media (max-width: 768px) {
  .folder-header {
    flex-direction: column;
    gap: 12px;
  }

  .folder-cover {
    width: 100%;
    height: 200px;
  }

  .stats {
    flex-direction: column;
    gap: 4px;
  }
}
</style>