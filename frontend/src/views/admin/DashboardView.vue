<template>
  <div class="dashboard">
    <n-spin :show="loading.stats">
      <n-grid :cols="4" :x-gap="12" :y-gap="12">
        <n-grid-item>
          <n-card title="文章总数">
            <n-statistic :value="statistics.posts" />
          </n-card>
        </n-grid-item>
        <n-grid-item>
          <n-card title="标签总数">
            <n-statistic :value="statistics.tags" />
          </n-card>
        </n-grid-item>
        <n-grid-item>
          <n-card title="分类总数">
            <n-statistic :value="statistics.categories" />
          </n-card>
        </n-grid-item>
        <n-grid-item>
          <n-card title="访问量">
            <n-statistic :value="statistics.visits" />
          </n-card>
        </n-grid-item>
      </n-grid>
    </n-spin>

    <n-grid :cols="2" :x-gap="12" :y-gap="12" class="mt-4">
      <n-grid-item>
        <n-card title="访问趋势">
          <n-spin :show="loading.visits">
            <div v-if="error.visits" class="error-message">
              <n-alert type="error">
                {{ error.visits }}
                <template #action>
                  <n-button text @click="loadVisitTrends">重试</n-button>
                </template>
              </n-alert>
            </div>
            <v-chart v-else class="chart" :option="visitOption" autoresize />
          </n-spin>
        </n-card>
      </n-grid-item>
      <n-grid-item>
        <n-card title="文章分类占比">
          <n-spin :show="loading.categories">
            <div v-if="error.categories" class="error-message">
              <n-alert type="error">
                {{ error.categories }}
                <template #action>
                  <n-button text @click="loadCategoryDistribution">重试</n-button>
                </template>
              </n-alert>
            </div>
            <v-chart v-else class="chart" :option="categoryOption" autoresize />
          </n-spin>
        </n-card>
      </n-grid-item>
    </n-grid>

    <n-grid :cols="2" :x-gap="12" :y-gap="12" class="mt-4">
      <n-grid-item>
        <n-card title="最近文章">
          <n-spin :show="loading.recentArticles">
            <div v-if="error.recentArticles" class="error-message">
              <n-alert type="error">
                {{ error.recentArticles }}
                <template #action>
                  <n-button text @click="loadRecentArticles">重试</n-button>
                </template>
              </n-alert>
            </div>
            <n-empty v-else-if="recentArticles.length === 0" description="暂无文章" />
            <n-list v-else>
              <n-list-item v-for="article in recentArticles" :key="article.id">
                <n-thing :title="article.title">
                  <template #description>
                    <n-space size="small" style="margin-top: 4px">
                      <n-tag size="small">{{ article.category }}</n-tag>
                      <span>{{ article.date }}</span>
                    </n-space>
                  </template>
                </n-thing>
              </n-list-item>
            </n-list>
          </n-spin>
        </n-card>
      </n-grid-item>
      <n-grid-item>
        <n-card title="热门标签">
          <n-spin :show="loading.hotTags">
            <div v-if="error.hotTags" class="error-message">
              <n-alert type="error">
                {{ error.hotTags }}
                <template #action>
                  <n-button text @click="loadHotTags">重试</n-button>
                </template>
              </n-alert>
            </div>
            <n-empty v-else-if="hotTags.length === 0" description="暂无标签" />
            <n-space v-else>
              <n-tag
                v-for="tag in hotTags"
                :key="tag.name"
                :type="tag.type"
                size="large"
                round
              >
                {{ tag.name }} ({{ tag.count }})
              </n-tag>
            </n-space>
          </n-spin>
        </n-card>
      </n-grid-item>
    </n-grid>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { LineChart, PieChart } from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent
} from 'echarts/components'
import VChart from 'vue-echarts'
import adminService from '@/services/adminService'
// Naive UI components are now registered globally in main.ts

// 定义接口
interface Article {
  id: number
  title: string
  category: string
  date: string
}

interface Tag {
  name: string
  count: number
  type: 'success' | 'info' | 'warning' | 'error' | 'primary'
}

interface CategoryData {
  name: string
  count: number
}

interface VisitData {
  dates: string[]
  counts: number[]
}

// 注册必须的组件
use([
  CanvasRenderer,
  LineChart,
  PieChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent
])

// 在Vue 3中，组件会自动注册，不需要额外的defineComponents调用
// 但我们需要确保所有组件都被正确导入

// 加载状态
const loading = ref({
  stats: false,
  visits: false,
  categories: false,
  recentArticles: false,
  hotTags: false
})

// 错误信息
const error = ref<{
  stats: string | null,
  visits: string | null,
  categories: string | null,
  recentArticles: string | null,
  hotTags: string | null
}>({
  stats: null,
  visits: null,
  categories: null,
  recentArticles: null,
  hotTags: null
})

// 统计数据
const statistics = ref({
  posts: 0,
  tags: 0,
  categories: 0,
  visits: 0
})

// 访问趋势图表配置
const visitOption = ref({
  tooltip: {
    trigger: 'axis'
  },
  xAxis: {
    type: 'category',
    data: [] as string[]
  },
  yAxis: {
    type: 'value'
  },
  series: [
    {
      data: [] as number[],
      type: 'line',
      smooth: true,
      areaStyle: {
        opacity: 0.3
      }
    }
  ]
})

// 分类占比图表配置
const categoryOption = ref({
  tooltip: {
    trigger: 'item'
  },
  legend: {
    orient: 'vertical',
    left: 'left'
  },
  series: [
    {
      type: 'pie',
      radius: '50%',
      data: [] as Array<{ value: number; name: string }>,
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowColor: 'rgba(0, 0, 0, 0.5)'
        }
      }
    }
  ]
})

// 最近文章数据
const recentArticles = ref<Article[]>([])

// 热门标签数据
const hotTags = ref<Tag[]>([])

// 加载统计数据
const loadStats = async () => {
  loading.value.stats = true
  error.value.stats = null
  try {
    // 1. 获取所有文章
    const posts = await import('@/services/articleService').then(m => m.articleService.getPosts())
    // 2. 获取所有标签
    const tags = await import('@/services/tagService').then(m => m.tagService.getTags())
    // 3. 获取所有分类
    const categories = await import('@/services/categoryService').then(m => m.categoryService.getCategories())
    // 4. 统计访问量（如有本地缓存/模拟数据可用，否则为0）
    let visits = 0
    try {
      const v = localStorage.getItem('dashboard_visits')
      visits = v ? parseInt(v) : 0
    } catch {}
    statistics.value = {
      posts: Array.isArray(posts) ? posts.length : 0,
      tags: Array.isArray(tags) ? tags.length : 0,
      categories: Array.isArray(categories) ? categories.length : 0,
      visits
    }
  } catch (err) {
    console.error('加载统计数据失败:', err)
    error.value.stats = '加载统计数据失败，请稍后重试'
  } finally {
    loading.value.stats = false
  }
}

// 加载访问趋势数据
const loadVisitTrends = async () => {
  loading.value.visits = true
  error.value.visits = null
  try {
    const data = await adminService.getVisitTrends() as VisitData
    visitOption.value.xAxis.data = data.dates
    visitOption.value.series[0].data = data.counts
  } catch (err) {
    console.error('加载访问趋势数据失败:', err)
    error.value.visits = '加载访问趋势数据失败，请稍后重试'
  } finally {
    loading.value.visits = false
  }
}

// 加载分类占比数据
const loadCategoryDistribution = async () => {
  loading.value.categories = true
  error.value.categories = null
  try {
    const data = await adminService.getCategoryDistribution() as CategoryData[]
    categoryOption.value.series[0].data = data.map((item) => ({
      value: item.count,
      name: item.name
    }))
  } catch (err) {
    console.error('加载分类占比数据失败:', err)
    error.value.categories = '加载分类占比数据失败，请稍后重试'
  } finally {
    loading.value.categories = false
  }
}

// 加载最近文章数据
const loadRecentArticles = async () => {
  loading.value.recentArticles = true
  error.value.recentArticles = null
  try {
    const data = await adminService.getRecentArticles() as Article[]
    recentArticles.value = data
  } catch (err) {
    console.error('加载最近文章数据失败:', err)
    error.value.recentArticles = '加载最近文章数据失败，请稍后重试'
  } finally {
    loading.value.recentArticles = false
  }
}

// 加载热门标签数据
const loadHotTags = async () => {
  loading.value.hotTags = true
  error.value.hotTags = null
  try {
    const data = await adminService.getHotTags() as Omit<Tag, 'type'>[]
    // 为标签分配不同的类型
    const types = ['success', 'info', 'warning', 'error', 'primary'] as const
    hotTags.value = data.map((tag, index: number) => ({
      ...tag,
      type: types[index % types.length]
    }))
  } catch (err) {
    console.error('加载热门标签数据失败:', err)
    error.value.hotTags = '加载热门标签数据失败，请稍后重试'
  } finally {
    loading.value.hotTags = false
  }
}

// 加载所有数据
const loadAllData = () => {
  loadStats()
  loadVisitTrends()
  loadCategoryDistribution()
  loadRecentArticles()
  loadHotTags()
}

onMounted(() => {
  loadAllData()
})
</script>

<style scoped>
.dashboard {
  width: 100%;
}

.mt-4 {
  margin-top: 16px;
}

.chart {
  height: 300px;
}

.error-message {
  margin: 10px 0;
}

:deep(.n-card) {
  height: 100%;
}

:deep(.n-statistic-value) {
  font-size: 24px;
  font-weight: bold;
  color: #18a058;
}
</style> 