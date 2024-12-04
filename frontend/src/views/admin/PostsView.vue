<template>
  <div class="posts-manage">
    <NSpace vertical>
      <NSpace justify="space-between">
        <NSpace>
          <NButton type="primary" @click="createPost">
            <template #icon>
              <NIcon><DocumentAdd /></NIcon>
            </template>
            <span>新建文章</span>
          </NButton>
          <NSelect
            v-model:value="statusFilter"
            :options="statusOptions"
            placeholder="文章状态"
            style="width: 120px"
          />
          <NSpace>
            <NButton 
              type="primary" 
              size="small" 
              @click="batchPublish"
              :disabled="!selectedRowKeys.length"
            >
              批量发布 ({{ selectedRowKeys.length }})
            </NButton>
            <NButton 
              type="warning" 
              size="small" 
              @click="batchDraft"
              :disabled="!selectedRowKeys.length"
            >
              批量转为草稿 ({{ selectedRowKeys.length }})
            </NButton>
          </NSpace>
        </NSpace>
        <NSpace>
          <NInputGroup>
            <NInput v-model:value="searchText" placeholder="搜索文章...">
              <template #prefix>
                <NIcon><Search /></NIcon>
              </template>
            </NInput>
            <NButton type="primary">搜索</NButton>
          </NInputGroup>
          <NSelect
            v-model:value="filterCategory"
            :options="categoryOptions"
            placeholder="选择分类"
            clearable
            style="width: 120px"
          />
          <NButton type="error" @click="showRecycleBin = true">
            <template #icon>
              <NIcon><TrashBin /></NIcon>
            </template>
            回收站
          </NButton>
        </NSpace>
      </NSpace>

      <NDataTable
        :columns="columns"
        :data="filteredPosts"
        :pagination="pagination"
        :bordered="false"
        :single-line="false"
        :row-key="row => row.id"
        @update:checked-row-keys="handleCheck"
        :checked-row-keys="selectedRowKeys"
      />
    </NSpace>

    <!-- 使用回收站组件 -->
    <RecycleBin
      :show="showRecycleBin"
      @update:show="showRecycleBin = $event"
      type="post"
      :items="deletedPosts.map(post => ({ ...post, type: 'post' }))"
      @restore="restorePost"
      @restore-all="restoreAllPosts"
      @delete="permanentlyDeletePost"
      @clear="clearRecycleBin"
    />
  </div>
</template>

<script setup lang="ts">
import { h, ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import type { DataTableColumns } from 'naive-ui'
import type { OnUpdateCheckedRowKeys, RowKey } from 'naive-ui/es/data-table/src/interface'
import { 
  NButton, 
  NSpace, 
  NPopconfirm, 
  NTag, 
  NIcon, 
  NInput, 
  NInputGroup,
  NSelect,
  NDataTable,
  useMessage,
  NDrawer, 
  NDrawerContent, 
  NList, 
  NListItem, 
  NThing, 
  NDivider,
  NAlert
} from 'naive-ui'
import { 
  Add as DocumentAdd, 
  Search, 
  PencilSharp as Edit, 
  TrashBin,
  Refresh
} from '@vicons/ionicons5'
import RecycleBin from '@/components/RecycleBin.vue'
import type { RecycleBinItem } from '@/types/recycle-bin'

interface Post {
  id: number
  title: string
  category: string
  tags: string[]
  status: 'published' | 'draft' | 'private'
  createTime: string
  updateTime: string
  views: number
}

interface DeletedPost extends Post {
  deleteTime: string
  type: 'post'
}

const router = useRouter()
const message = useMessage()

const searchText = ref('')
const filterCategory = ref(null)

// 定义状态类型
type PostStatus = 'published' | 'draft' | 'private' | 'all'

// 添加状态过滤器
const statusFilter = ref<PostStatus>('all')

// 添加状态选项
const statusOptions = [
  { label: '全部', value: 'all' },
  { label: '已发布', value: 'published' },
  { label: '草稿', value: 'draft' },
  { label: '私密', value: 'private' }
]

// 模拟文章数据
const posts = ref<Post[]>([
  {
    id: 1,
    title: 'Vue3 组合式 API 最佳实践',
    category: '技术',
    tags: ['Vue', 'TypeScript'],
    status: 'published',
    createTime: '2024-01-15',
    updateTime: '2024-01-15',
    views: 156
  },
  {
    id: 2,
    title: 'TypeScript 高级技巧分享',
    category: '技术',
    tags: ['TypeScript', 'JavaScript'],
    status: 'draft',
    createTime: '2024-01-14',
    updateTime: '2024-01-14',
    views: 89
  },
  {
    id: 3,
    title: '2024 年度计划',
    category: '生活',
    tags: ['随笔'],
    status: 'published',
    createTime: '2024-01-13',
    updateTime: '2024-01-13',
    views: 245
  }
])

// 分类选项
const categoryOptions = [
  { label: '技术', value: '技术' },
  { label: '生活', value: '生活' },
  { label: '随笔', value: '随笔' }
]

// 状态标签渲染
const renderStatus = (status: string) => {
  const statusMap: Record<string, { type: 'success' | 'warning' | 'default'; text: string }> = {
    published: { type: 'success', text: '已发布' },
    draft: { type: 'warning', text: '草稿' }
  }
  const { type, text } = statusMap[status] || { type: 'default', text: '未知' }
  return h(NTag, { type, size: 'small' }, { default: () => text })
}

// 修改选中行的状态类型
const selectedRowKeys = ref<RowKey[]>([])

// 修改处理选中事件的类型
const handleCheck: OnUpdateCheckedRowKeys = (keys: RowKey[]) => {
  selectedRowKeys.value = keys
}

// 修改表格列配置，添加 ID 列和选择列
const columns: DataTableColumns<Post> = [
  {
    type: 'selection'
  },
  {
    title: 'ID',
    key: 'id',
    width: 80,
    align: 'center'
  },
  {
    title: '标题',
    key: 'title',
    width: 250
  },
  {
    title: '分类',
    key: 'category',
    width: 100,
    render: (row: any) => h(NTag, { size: 'small' }, { default: () => row.category })
  },
  {
    title: '标签',
    key: 'tags',
    width: 200,
    render: (row: any) => {
      return h(NSpace, { size: 'small' }, {
        default: () => row.tags.map((tag: string) => 
          h(NTag, { size: 'small', round: true }, { default: () => tag })
        )
      })
    }
  },
  {
    title: '状态',
    key: 'status',
    width: 150,
    render: (row: Post) => {
      return h(NSpace, { size: 'small' }, {
        default: () => [
          renderStatus(row.status),
          h(
            NSelect,
            {
              size: 'small',
              value: row.status,
              options: [
                { label: '发布', value: 'published' },
                { label: '草稿', value: 'draft' },
                { label: '私密', value: 'private' }
              ],
              style: 'width: 80px;',
              onChange: (value) => updatePostStatus(row, value)
            }
          )
        ]
      })
    }
  },
  {
    title: '浏览量',
    key: 'views',
    width: 100
  },
  {
    title: '创建时间',
    key: 'createTime',
    width: 150
  },
  {
    title: '更新时间',
    key: 'updateTime',
    width: 150
  },
  {
    title: '操作',
    key: 'actions',
    width: 150,
    render: (row: any) => {
      return h(NSpace, { size: 'small' }, {
        default: () => [
          h(NButton, 
            { 
              size: 'small',
              quaternary: true,
              onClick: () => editPost(row)
            }, 
            { 
              default: () => '编辑',
              icon: () => h(NIcon, null, { default: () => h(Edit) })
            }
          ),
          h(NPopconfirm,
            {
              onPositiveClick: () => deletePost(row)
            },
            {
              trigger: () => h(NButton,
                { 
                  size: 'small',
                  quaternary: true,
                  type: 'error'
                },
                { 
                  default: () => '删除',
                  icon: () => h(NIcon, null, { default: () => h(TrashBin) })
                }
              ),
              default: () => '确认删除这篇文章吗？'
            }
          )
        ]
      })
    }
  }
]

// 分页配置
const pagination = {
  pageSize: 10,
  showSizePicker: true,
  pageSizes: [10, 20, 30, 40],
  showQuickJumper: true,
  prefix: ({ itemCount }: any) => `共 ${itemCount} 篇文章`
}

// 过滤后的文章列表
const filteredPosts = computed(() => {
  return posts.value.filter(post => {
    const matchSearch = post.title.toLowerCase().includes(searchText.value.toLowerCase())
    const matchCategory = !filterCategory.value || post.category === filterCategory.value
    const matchStatus = statusFilter.value === 'all' || post.status === statusFilter.value
    return matchSearch && matchCategory && matchStatus
  })
})

// 创建文章
const createPost = () => {
  router.push({ name: 'post-edit' })
}

// 编辑文章
const editPost = (row: any) => {
  router.push({
    name: 'post-edit-id',
    params: { id: row.id }
  })
}

// 回收站相关
const showRecycleBin = ref(false)
const deletedPosts = ref<DeletedPost[]>([])

// 删除文章（移到回收站）
const deletePost = (row: Post) => {
  if (row.status === 'published') {
    message.warning('已发布的文章不能直接删除，请先改为草稿状态')
    return
  }
  
  posts.value = posts.value.filter(post => post.id !== row.id)
  deletedPosts.value.unshift({
    ...row,
    deleteTime: new Date().toLocaleString(),
    type: 'post'
  })
  message.success('文章已移至回收站')
}

// 恢复文章
const restorePost = (item: RecycleBinItem) => {
  if (item.type !== 'post') return
  const post = item as DeletedPost
  deletedPosts.value = deletedPosts.value.filter(p => p.id !== post.id)
  const { deleteTime, type, ...restPost } = post
  posts.value.unshift({
    ...restPost,
    status: 'draft',
    updateTime: new Date().toLocaleString()
  })
  message.success('文章已恢复为草稿状态')
}

// 永久删除文章
const permanentlyDeletePost = (item: RecycleBinItem) => {
  if (item.type !== 'post') return
  const post = item as DeletedPost
  deletedPosts.value = deletedPosts.value.filter(p => p.id !== post.id)
  message.success('文章已永久删除')
}

// 恢复所有文章
const restoreAllPosts = () => {
  deletedPosts.value.forEach(post => {
    const { deleteTime, type, ...restPost } = post
    posts.value.unshift(restPost)
  })
  deletedPosts.value = []
  message.success('已恢复全部文章')
}

// 清空回收站
const clearRecycleBin = () => {
  deletedPosts.value = []
  message.success('回收站已清空')
}

// 更新文章状态
const updatePostStatus = (post: Post, status: Post['status']) => {
  const targetPost = posts.value.find(p => p.id === post.id)
  if (targetPost) {
    targetPost.status = status
    targetPost.updateTime = new Date().toLocaleString()
    
    // 根据不同状态显示不同的提示
    const statusMessages = {
      published: '文章已发布',
      draft: '文章已保存为草稿',
      private: '文章已设为私密'
    }
    message.success(statusMessages[status])
  }
}

// 修改批量操作函数，使用正确的类型
const batchPublish = () => {
  if (selectedRowKeys.value.length === 0) {
    message.warning('请选择要发布的文章')
    return
  }
  
  const draftPosts = posts.value.filter(
    post => selectedRowKeys.value.includes(post.id.toString()) && post.status === 'draft'
  )
  
  if (draftPosts.length === 0) {
    message.warning('选中的文章中没有可发布的草稿')
    return
  }
  
  draftPosts.forEach(post => {
    post.status = 'published'
    post.updateTime = new Date().toLocaleString()
  })
  
  message.success(`已发布 ${draftPosts.length} 篇文章`)
  selectedRowKeys.value = [] // 清空选择
}

// 批量转为草稿
const batchDraft = () => {
  if (selectedRowKeys.value.length === 0) {
    message.warning('请选择要转为草稿的文章')
    return
  }
  
  const publishedPosts = posts.value.filter(
    post => selectedRowKeys.value.includes(post.id.toString()) && post.status === 'published'
  )
  
  if (publishedPosts.length === 0) {
    message.warning('选中的文章中没有已发布的文章')
    return
  }
  
  publishedPosts.forEach(post => {
    post.status = 'draft'
    post.updateTime = new Date().toLocaleString()
  })
  
  message.success(`已将 ${publishedPosts.length} 篇文章转为草稿`)
  selectedRowKeys.value = [] // 清空选择
}
</script>

<style scoped>
.posts-manage {
  width: 100%;
}

:deep(.n-data-table .n-data-table-td) {
  padding: 12px;
}

:deep(.n-button.n-button--quaternary) {
  padding: 0 8px;
}

.text-gray {
  color: #999;
  font-size: 14px;
}
</style> 