<template>
  <div class="chase-container">
    <div class="header">
      <h1>追番列表</h1>
      <n-button type="primary" @click="handleSync" :loading="syncing">
        同步追番记录
      </n-button>
    </div>

    <n-tabs v-model:value="currentTab" type="line">
      <n-tab-pane name="watching" tab="在看">
        <n-grid :x-gap="16" :y-gap="16" cols="1 s:2 m:3 l:4 xl:5" responsive="screen">
          <n-grid-item v-for="item in watchingList" :key="item.id">
            <n-card hoverable>
              <template #cover>
                <img :src="item.cover" :alt="item.title" class="bangumi-cover">
              </template>
              <h3 class="bangumi-title">{{ item.title }}</h3>
              <div class="bangumi-progress">
                进度：{{ item.watched_episodes }}/{{ item.total_episodes }}
              </div>
              <div class="bangumi-score" v-if="item.score > 0">
                评分：{{ item.score }}
              </div>
            </n-card>
          </n-grid-item>
        </n-grid>
      </n-tab-pane>

      <n-tab-pane name="completed" tab="看完">
        <n-grid :x-gap="16" :y-gap="16" cols="1 s:2 m:3 l:4 xl:5" responsive="screen">
          <n-grid-item v-for="item in completedList" :key="item.id">
            <n-card hoverable>
              <template #cover>
                <img :src="item.cover" :alt="item.title" class="bangumi-cover">
              </template>
              <h3 class="bangumi-title">{{ item.title }}</h3>
              <div class="bangumi-progress">
                进度：{{ item.watched_episodes }}/{{ item.total_episodes }}
              </div>
              <div class="bangumi-score" v-if="item.score > 0">
                评分：{{ item.score }}
              </div>
            </n-card>
          </n-grid-item>
        </n-grid>
      </n-tab-pane>

      <n-tab-pane name="planning" tab="想看">
        <n-grid :x-gap="16" :y-gap="16" cols="1 s:2 m:3 l:4 xl:5" responsive="screen">
          <n-grid-item v-for="item in planningList" :key="item.id">
            <n-card hoverable>
              <template #cover>
                <img :src="item.cover" :alt="item.title" class="bangumi-cover">
              </template>
              <h3 class="bangumi-title">{{ item.title }}</h3>
              <div class="bangumi-score" v-if="item.score > 0">
                评分：{{ item.score }}
              </div>
            </n-card>
          </n-grid-item>
        </n-grid>
      </n-tab-pane>
    </n-tabs>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useMessage } from 'naive-ui'
import type { BangumiInfo } from '@/api/bangumi'
import { syncBiliBangumi, getBangumiList } from '@/api/bangumi'

const message = useMessage()
const currentTab = ref('watching')
const syncing = ref(false)
const bangumiList = ref<BangumiInfo[]>([])

const watchingList = computed(() => 
  bangumiList.value.filter(item => item.status === 1)
)

const completedList = computed(() => 
  bangumiList.value.filter(item => item.status === 2)
)

const planningList = computed(() => 
  bangumiList.value.filter(item => item.status === 0)
)

const fetchBangumiList = async () => {
  try {
    const response = await getBangumiList()
    bangumiList.value = response.data
  } catch (error) {
    message.error('获取追番列表失败')
  }
}

const handleSync = async () => {
  if (syncing.value) return
  syncing.value = true
  try {
    await syncBiliBangumi()
    message.success('同步成功')
    await fetchBangumiList()
  } catch (error) {
    message.error('同步失败')
  } finally {
    syncing.value = false
  }
}

onMounted(() => {
  fetchBangumiList()
})
</script>

<style scoped>
.chase-container {
  padding: 20px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.bangumi-cover {
  width: 100%;
  height: 200px;
  object-fit: cover;
}

.bangumi-title {
  margin: 8px 0;
  font-size: 16px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  display: -moz-box;
  -moz-box-orient: vertical;
  -moz-line-clamp: 2;
  display: box;
  box-orient: vertical;
  line-clamp: 2;
  max-height: 3em;
  line-height: 1.5;
}

.bangumi-progress,
.bangumi-score {
  font-size: 14px;
  color: #666;
  margin: 4px 0;
}
</style>