<template>
  <NDrawer :show="show" :width="500" @update:show="handleUpdateShow">
    <NDrawerContent :title="title">
      <NSpace vertical>
        <NAlert type="warning" v-if="items.length === 0">
          回收站是空的
        </NAlert>
        <NList v-else>
          <NListItem v-for="item in items" :key="item.id">
            <NThing :title="getItemTitle(item)">
              <template #description>
                <NSpace vertical size="small">
                  <NSpace>
                    <NTag v-if="isPostItem(item)">{{ item.category }}</NTag>
                    <span class="text-gray">删除时间：{{ item.deleteTime }}</span>
                  </NSpace>
                  <NSpace>
                    <NButton size="small" type="primary" @click="handleRestore(item)">
                      <template #icon>
                        <NIcon><Refresh /></NIcon>
                      </template>
                      恢复
                    </NButton>
                    <NPopconfirm @positive-click="handleDelete(item)">
                      <template #trigger>
                        <NButton size="small" type="error">
                          <template #icon>
                            <NIcon><TrashBin /></NIcon>
                          </template>
                          永久删除
                        </NButton>
                      </template>
                      {{ deleteConfirmText }}
                    </NPopconfirm>
                  </NSpace>
                </NSpace>
              </template>
            </NThing>
          </NListItem>
        </NList>
        <NDivider v-if="items.length > 0" />
        <NSpace justify="space-between" v-if="items.length > 0">
          <NButton type="primary" @click="handleRestoreAll">
            恢复全部
          </NButton>
          <NPopconfirm @positive-click="handleClear">
            <template #trigger>
              <NButton type="error">清空回收站</NButton>
            </template>
            确定要清空回收站吗？此操作不可恢复。
          </NPopconfirm>
        </NSpace>
      </NSpace>
    </NDrawerContent>
  </NDrawer>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { 
  NDrawer, 
  NDrawerContent, 
  NSpace, 
  NList, 
  NListItem, 
  NThing, 
  NButton, 
  NIcon, 
  NPopconfirm, 
  NDivider, 
  NAlert,
  NTag
} from 'naive-ui'
import { Refresh, TrashBin } from '@vicons/ionicons5'

interface BaseItem {
  id: number
  deleteTime: string
  type: 'post' | 'tag' | 'category'
}

interface PostItem extends BaseItem {
  type: 'post'
  title: string
  category: string
  tags: string[]
  status: 'published' | 'draft' | 'private'
  createTime: string
  updateTime: string
  views: number
}

interface TagItem extends BaseItem {
  type: 'tag'
  name: string
  slug: string
  count: number
  createTime: string
}

interface CategoryItem extends BaseItem {
  type: 'category'
  name: string
  count: number
  createTime: string
}

type RecycleBinItem = PostItem | TagItem | CategoryItem

const props = defineProps<{
  show: boolean
  type: 'post' | 'tag' | 'category'
  items: RecycleBinItem[]
}>()

const emits = defineEmits<{
  'update:show': [value: boolean]
  'restore': [item: RecycleBinItem]
  'restore-all': []
  'delete': [item: RecycleBinItem]
  'clear': []
}>()

// 计算标题
const title = computed(() => {
  const titles = {
    post: '文章回收站',
    tag: '标签回收站',
    category: '分类回收站'
  }
  return titles[props.type]
})

// 计算删除确认文本
const deleteConfirmText = computed(() => {
  const texts = {
    post: '确定要永久删除这篇文章吗？',
    tag: '确定要永久删除这个标签吗？',
    category: '确定要永久删除这个分类吗？'
  }
  return texts[props.type] + '此操作不可恢复。'
})

// 获取项目标题
const getItemTitle = (item: RecycleBinItem) => {
  switch (item.type) {
    case 'post':
      return item.title
    case 'tag':
    case 'category':
      return item.name
  }
}

// 处理恢复
const handleRestore = (item: RecycleBinItem) => {
  emits('restore', item)
}

// 处理恢复全部
const handleRestoreAll = () => {
  emits('restore-all')
}

// 处理永久删除
const handleDelete = (item: RecycleBinItem) => {
  emits('delete', item)
}

// 处理清空回收站
const handleClear = () => {
  emits('clear')
}

// 添加处理显示状态更新的方法
const handleUpdateShow = (value: boolean) => {
  emits('update:show', value)
}

// 添加类型守卫函数
const isPostItem = (item: RecycleBinItem): item is PostItem => {
  return item.type === 'post'
}
</script>

<style scoped>
.text-gray {
  color: #999;
  font-size: 14px;
}
</style> 