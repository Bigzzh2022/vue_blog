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

      <NSpin :show="loading">
        <div v-if="error" class="error-message">
          <NAlert type="error">
            {{ error }}
            <template #action>
              <NButton text @click="loadPosts">重试</NButton>
            </template>
          </NAlert>
        </div>
        <NEmpty v-else-if="filteredPosts.length === 0 && !loading" description="暂无文章" />
        <NDataTable
          v-else
          :columns="columns"
          :data="filteredPosts"
          :pagination="pagination"
          :bordered="false"
          :single-line="false"
          :row-key="row => row.id"
          @update:checked-row-keys="handleCheck"
          :checked-row-keys="selectedRowKeys"
        />
      </NSpin>
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
import { h, ref, computed, onMounted } from 'vue'
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
  NAlert,
  NSpin,
  NEmpty
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
import adminService from '@/services/adminService'

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

// 文章数据
const posts = ref<Post[]>([])

// 加载状态
const loading = ref(false)

// 错误信息
const error = ref<string | null>(null)

// 加载文章数据
const loadPosts = async () => {
  loading.value = true
  error.value = null
  try {
    const data = await adminService.getPosts({
      status: statusFilter.value !== 'all' ? statusFilter.value : undefined,
      category: filterCategory.value || undefined,
      search: searchText.value || undefined
    })
    posts.value = data
    // 打印每篇文章的status字段
    if (Array.isArray(data)) {
      data.forEach(post => console.log('文章ID:', post.id, 'status:', post.status))
    }
  } catch (err) {
    console.error('加载文章列表失败:', err)
    error.value = '加载文章列表失败，请稍后重试'
  } finally {
    loading.value = false
  }
}

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
const deletePost = async (id: number) => {
  try {
    await adminService.deletePost(id)
    const index = posts.value.findIndex(post => post.id === id)
    if (index !== -1) {
      const post = posts.value[index]
      // 将文章移到回收站
      deletedPosts.value.push({
        ...post,
        deleteTime: new Date().toISOString().split('T')[0],
        type: 'post'
      })
      // 从文章列表中移除
      posts.value.splice(index, 1)
      message.success('文章已移入回收站')
    }
  } catch (err) {
    console.error('删除文章失败:', err)
    message.error('删除文章失败，请稍后重试')
  }
}

// 从回收站恢复文章
const restorePost = async (item: RecycleBinItem) => {
  if (item.type === 'post') {
    try {
      // 调用后端恢复文章API（假设有这个API）
      // await adminService.restorePost(item.id)
      
      const post = item as DeletedPost
      // 将文章添加回文章列表
      const { deleteTime, type, ...postData } = post
      posts.value.push(postData)
      // 从删除列表中移除
      const index = deletedPosts.value.findIndex(p => p.id === post.id)
      if (index !== -1) {
        deletedPosts.value.splice(index, 1)
      }
      message.success('文章已恢复')
      // 重新加载文章列表
      await loadPosts()
    } catch (err) {
      console.error('恢复文章失败:', err)
      message.error('恢复文章失败，请稍后重试')
    }
  }
}

// 恢复所有文章
const restoreAllPosts = async () => {
  try {
    // 调用后端恢复所有文章API（假设有这个API）
    // await adminService.restoreAllPosts()
    
    deletedPosts.value.forEach(post => {
      if (post.type === 'post') {
        const { deleteTime, type, ...postData } = post
        posts.value.push(postData)
      }
    })
    deletedPosts.value = []
    message.success('所有文章已恢复')
    // 重新加载文章列表
    await loadPosts()
  } catch (err) {
    console.error('恢复所有文章失败:', err)
    message.error('恢复所有文章失败，请稍后重试')
  }
}

// 永久删除文章
const permanentlyDeletePost = async (item: RecycleBinItem) => {
  if (item.type === 'post') {
    try {
      // 调用后端永久删除文章API（假设有这个API）
      // await adminService.permanentlyDeletePost(item.id)
      
      const index = deletedPosts.value.findIndex(p => p.id === item.id)
      if (index !== -1) {
        deletedPosts.value.splice(index, 1)
        message.success('文章已永久删除')
      }
    } catch (err) {
      console.error('永久删除文章失败:', err)
      message.error('永久删除文章失败，请稍后重试')
    }
  }
}

// 清空回收站
const clearRecycleBin = async () => {
  try {
    // 调用后端清空回收站API（假设有这个API）
    // await adminService.clearRecycleBin('post')
    
    deletedPosts.value = []
    message.success('回收站已清空')
  } catch (err) {
    console.error('清空回收站失败:', err)
    message.error('清空回收站失败，请稍后重试')
  }
}

// 更新文章状态
const updatePostStatus = async (post: Post, status: Post['status']) => {
  try {
    await adminService.updatePost(post.id, { ...post, status });
    const targetPost = posts.value.find(p => p.id === post.id);
    if (targetPost) {
      targetPost.status = status;
      targetPost.updateTime = new Date().toISOString().split('T')[0];
    }
    const statusMessages = {
      published: '文章已发布',
      draft: '文章已保存为草稿',
      private: '文章已设为私密'
    };
    message.success(statusMessages[status]);
  } catch (err) {
    message.error('更新文章状态失败，请稍后重试');
  }
}


// 批量发布
const batchPublish = async () => {
  try {
    await adminService.batchUpdatePostStatus(selectedRowKeys.value as unknown as number[], 'published')
    await loadPosts()
    message.success(`已将 ${selectedRowKeys.value.length} 篇文章发布`)
    selectedRowKeys.value = []
  } catch (err) {
    console.error('批量发布文章失败:', err)
    message.error('批量发布文章失败，请稍后重试')
  }
}

// 批量转为草稿
const batchDraft = async () => {
  try {
    await adminService.batchUpdatePostStatus(selectedRowKeys.value as unknown as number[], 'draft')
    await loadPosts()
    message.success(`已将 ${selectedRowKeys.value.length} 篇文章转为草稿`)
    selectedRowKeys.value = []
  } catch (err) {
    console.error('批量转为草稿失败:', err)
    message.error('批量转为草稿失败，请稍后重试')
  }
}

onMounted(async () => {
  await loadPosts()
})
</script>

<style scoped>
.posts-manage {
  width: 100%;
}

.error-message {
  margin-bottom: 16px;
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