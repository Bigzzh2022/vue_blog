<template>
  <div class="dashboard">
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

    <n-grid :cols="2" :x-gap="12" :y-gap="12" class="mt-4">
      <n-grid-item>
        <n-card title="访问趋势">
          <v-chart class="chart" :option="visitOption" autoresize />
        </n-card>
      </n-grid-item>
      <n-grid-item>
        <n-card title="文章分类占比">
          <v-chart class="chart" :option="categoryOption" autoresize />
        </n-card>
      </n-grid-item>
    </n-grid>

    <n-grid :cols="2" :x-gap="12" :y-gap="12" class="mt-4">
      <n-grid-item>
        <n-card title="最近文章">
          <n-list>
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
        </n-card>
      </n-grid-item>
      <n-grid-item>
        <n-card title="热门标签">
          <n-space>
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

const statistics = ref({
  posts: 125,
  tags: 48,
  categories: 12,
  visits: 45678
})

// 访问趋势图表配置
const visitOption = ref({
  tooltip: {
    trigger: 'axis'
  },
  xAxis: {
    type: 'category',
    data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  },
  yAxis: {
    type: 'value'
  },
  series: [
    {
      data: [820, 932, 901, 934, 1290, 1330, 1320],
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
      data: [
        { value: 1048, name: '技术' },
        { value: 735, name: '生活' },
        { value: 580, name: '随笔' },
        { value: 484, name: '阅读' }
      ],
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
const recentArticles = ref([
  {
    id: 1,
    title: 'Vue3 组合式 API 最佳实践',
    category: '技术',
    date: '2024-01-15'
  },
  {
    id: 2,
    title: 'TypeScript 高级技巧分享',
    category: '技术',
    date: '2024-01-14'
  },
  {
    id: 3,
    title: '2024 年度计划',
    category: '生活',
    date: '2024-01-13'
  }
])

// 热门标签数据
const hotTags = ref([
  { name: 'Vue', count: 25, type: 'success' },
  { name: 'TypeScript', count: 18, type: 'info' },
  { name: 'JavaScript', count: 15, type: 'warning' },
  { name: 'CSS', count: 12, type: 'error' },
  { name: '生活', count: 10, type: 'primary' }
])

onMounted(() => {
  // 这里可以添加数据获取逻辑
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

:deep(.n-card) {
  height: 100%;
}

:deep(.n-statistic-value) {
  font-size: 24px;
  font-weight: bold;
  color: #18a058;
}
</style> 