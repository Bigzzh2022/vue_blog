<template>
  <div class="links-manage" role="main">
    <!-- 统计卡片 -->
    <div class="stats-row">
      <NStat label="友链总数" tabular-nums>
        <template #value>
          <span class="stat-value">{{ linkStore.linkCount.total }}</span>
        </template>
      </NStat>
      <NStat label="已发布" tabular-nums>
        <template #value>
          <span class="stat-value success">{{ linkStore.linkCount.approved }}</span>
        </template>
      </NStat>
      <NStat label="待审核" tabular-nums>
        <template #value>
          <span class="stat-value warning">{{ linkStore.linkCount.pending }}</span>
        </template>
      </NStat>
      <NStat label="已拒绝" tabular-nums>
        <template #value>
          <span class="stat-value error">{{ linkStore.linkCount.rejected }}</span>
        </template>
      </NStat>
    </div>
    
    <NDivider />
    
    <!-- 顶部操作栏 -->
    <NSpace justify="space-between" class="header-actions">
      <NSpace>
        <NButton type="primary" @click="showCreateModal = true">
          <template #icon>
            <NIcon><Add /></NIcon>
          </template>
          新建友链
        </NButton>
        <NButton @click="handleReset">重置数据</NButton>
      </NSpace>
      <NSpace>
        <NInput v-model:value="searchText" placeholder="搜索友链...">
          <template #prefix>
            <NIcon><Search /></NIcon>
          </template>
        </NInput>
      </NSpace>
    </NSpace>
    
    <!-- 标签页 -->
    <NTabs v-model:value="activeTab" type="line" class="links-tabs">
      <NTabPane name="all" tab="全部" />
      <NTabPane name="approved" tab="已发布" />
      <NTabPane name="pending" tab="待审核" />
      <NTabPane name="rejected" tab="已拒绝" />
    </NTabs>

    <!-- 友链列表 -->
    <NDataTable
      :columns="columns"
      :data="currentLinks"
      :pagination="pagination"
      :bordered="false"
      striped
    />

    <!-- 创建/编辑友链模态框 -->
    <NModal 
      v-model:show="showCreateModal" 
      :title="modalTitle"
      preset="dialog"
      :show-icon="false"
    >
      <NForm
        ref="formRef"
        :model="formValue"
        :rules="rules"
        label-placement="left"
        label-width="80"
      >
        <NFormItem label="网站名称" path="name">
          <NInput v-model:value="formValue.name" placeholder="请输入网站名称" />
        </NFormItem>
        
        <NFormItem label="网站链接" path="url">
          <NInput v-model:value="formValue.url" placeholder="请输入网站链接" />
        </NFormItem>

        <NFormItem label="网站图标" path="icon">
          <NInput v-model:value="formValue.icon" placeholder="请输入图标链接" />
        </NFormItem>

        <NFormItem label="网站描述" path="description">
          <NInput 
            v-model:value="formValue.description" 
            type="textarea" 
            placeholder="请输入网站描述" 
          />
        </NFormItem>

        <NFormItem label="状态" path="status">
          <NSelect
            v-model:value="formValue.status"
            :options="statusOptions"
            placeholder="请选择状态"
          />
        </NFormItem>
      </NForm>
      <template #action>
        <NSpace justify="end">
          <NButton @click="showCreateModal = false">取消</NButton>
          <NButton type="primary" @click="handleSubmit">确定</NButton>
        </NSpace>
      </template>
    </NModal>
  </div>
</template>

<script setup lang="ts">
import { h, ref, computed, onMounted } from 'vue'
import { 
  NSpace, 
  NButton, 
  NInput, 
  NIcon, 
  NDataTable,
  NModal,
  NForm,
  NFormItem,
  NPopconfirm,
  useMessage,
  NSelect,
  NTabs,
  NTabPane,
  NDivider,
} from 'naive-ui'
import NStat from '@/components/NStat.vue'
import { Add, Search, Create, TrashBin } from '@vicons/ionicons5'
import type { DataTableColumns, FormInst } from 'naive-ui'
import { useLinkStore, type FriendLink } from '@/stores/links'

const message = useMessage()
const linkStore = useLinkStore()
const searchText = ref('')
const showCreateModal = ref(false)
const formRef = ref<FormInst | null>(null)
const editingLink = ref<FriendLink | null>(null)
const activeTab = ref('all')

// 初始加载友链数据
onMounted(async () => {
  if (!linkStore.loaded) {
    await linkStore.loadLinks()
  }
})

// 表单数据
const formValue = ref({
  name: '',
  url: '',
  icon: '',
  description: '',
  status: 'pending' as 'approved' | 'pending' | 'rejected'
})

// 表单验证规则
const rules = {
  name: {
    required: true,
    message: '请输入网站名称',
    trigger: 'blur'
  },
  url: {
    required: true,
    message: '请输入网站链接',
    trigger: 'blur',
    validator: (rule: any, value: string) => {
      try {
        new URL(value)
        return true
      } catch {
        return new Error('请输入有效的URL')
      }
    }
  },
  icon: {
    required: true,
    message: '请输入图标链接',
    trigger: 'blur',
  },
  description: {
    required: true,
    message: '请输入网站描述',
    trigger: 'blur'
  },
  status: {
    required: true,
    message: '请选择状态',
    trigger: 'change'
  }
}

// 模态框标题
const modalTitle = computed(() => editingLink.value ? '编辑友链' : '新建友链')

// 当前选中的数据
const currentLinks = computed(() => {
  let links: FriendLink[] = []
  
  switch (activeTab.value) {
    case 'all':
      links = linkStore.links
      break
    case 'approved':
      links = linkStore.approvedLinks
      break
    case 'pending':
      links = linkStore.pendingLinks
      break
    case 'rejected':
      links = linkStore.rejectedLinks
      break
    default:
      links = linkStore.links
  }
  
  return links.filter(link => 
    link.name.toLowerCase().includes(searchText.value.toLowerCase()) ||
    link.description.toLowerCase().includes(searchText.value.toLowerCase())
  )
})

// 表格列配置
const columns: DataTableColumns<FriendLink> = [
  {
    title: '网站名称',
    key: 'name',
    render: (row: FriendLink) => {
      return h('div', { style: 'display: flex; align-items: center; gap: 8px;' }, [
        h('img', {
          src: row.icon,
          style: 'width: 20px; height: 20px; border-radius: 50%;',
          onerror: (e: any) => {
            e.target.src = 'https://api.dicebear.com/7.x/adventurer/svg?seed=default'
          }
        }),
        row.name
      ])
    }
  },
  {
    title: '网站链接',
    key: 'url',
    render: (row: FriendLink) => {
      return h(
        'a',
        {
          href: row.url,
          target: '_blank',
          style: 'color: #18a058; text-decoration: none;'
        },
        row.url
      )
    }
  },
  {
    title: '网站描述',
    key: 'description',
    ellipsis: {
      tooltip: true
    }
  },
  {
    title: '创建时间',
    key: 'createTime',
    width: 100
  },
  {
    title: '状态',
    key: 'status',
    width: 100,
    render: (row: FriendLink) => {
      const statusMap = {
        approved: { text: '已发布', type: 'success' },
        pending: { text: '待审核', type: 'warning' },
        rejected: { text: '已拒绝', type: 'error' }
      }
      
      const status = statusMap[row.status] || { text: row.status, type: 'default' }
      
      return h(
        'div',
        {
          style: `
            padding: 2px 6px; 
            border-radius: 10px; 
            font-size: 12px; 
            display: inline-block;
            color: ${status.type === 'success' ? '#18a058' : 
                    status.type === 'warning' ? '#f0a020' : 
                    status.type === 'error' ? '#d03050' : '#666'};
            background: ${status.type === 'success' ? 'rgba(24, 160, 88, 0.1)' : 
                          status.type === 'warning' ? 'rgba(240, 160, 32, 0.1)' : 
                          status.type === 'error' ? 'rgba(208, 48, 80, 0.1)' : 'rgba(0, 0, 0, 0.06)'};
          `
        },
        status.text
      )
    }
  },
  {
    title: '操作',
    key: 'actions',
    width: 180,
    fixed: 'right',
    render: (row: FriendLink) => {
      const buttons = []
      
      // 审核按钮 - 只对待审核的链接显示
      if (row.status === 'pending') {
        buttons.push(
          h(NButton, 
            { 
              size: 'small',
              type: 'success',
              onClick: () => handleApprove(row.id),
              style: 'margin-right: 8px;'
            }, 
            { default: () => '批准' }
          )
        )
        
        buttons.push(
          h(NButton, 
            { 
              size: 'small',
              type: 'error',
              onClick: () => handleReject(row.id),
              style: 'margin-right: 8px;'
            }, 
            { default: () => '拒绝' }
          )
        )
      }
      
      // 编辑按钮
      buttons.push(
        h(NButton, 
          { 
            size: 'small',
            quaternary: true,
            onClick: () => handleEdit(row),
            style: 'margin-right: 8px;'
          }, 
          { 
            default: () => '编辑',
            icon: () => h(NIcon, null, { default: () => h(Create) })
          }
        )
      )
      
      // 删除按钮
      buttons.push(
        h(NPopconfirm,
          {
            onPositiveClick: () => handleDelete(row.id)
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
            default: () => '确认删除这个友链吗？'
          }
        )
      )
      
      return h('div', {}, buttons)
    }
  }
]

// 分页配置
const pagination = {
  pageSize: 10
}

// 批准友链
const handleApprove = async (id: number) => {
  const success = await linkStore.updateLinkStatus(id, 'approved')
  if (success) {
    message.success('友链已批准')
  } else {
    message.error('操作失败')
  }
}

// 拒绝友链
const handleReject = async (id: number) => {
  const success = await linkStore.updateLinkStatus(id, 'rejected')
  if (success) {
    message.success('友链已拒绝')
  } else {
    message.error('操作失败')
  }
}

// 处理编辑
const handleEdit = (link: FriendLink) => {
  editingLink.value = link
  formValue.value = {
    name: link.name,
    url: link.url,
    icon: link.icon,
    description: link.description,
    status: link.status
  }
  showCreateModal.value = true
}

// 处理删除
const handleDelete = async (id: number) => {
  const success = await linkStore.deleteLink(id)
  if (success) {
    message.success('友链已删除')
  } else {
    message.error('删除失败')
  }
}

// 处理表单提交
const handleSubmit = () => {
  formRef.value?.validate(async (errors) => {
    if (!errors) {
      let success = false
      
      if (editingLink.value) {
        // 编辑友链
        success = await linkStore.updateLink(editingLink.value.id, formValue.value)
        if (success) {
          message.success('友链已更新')
        }
      } else {
        // 创建新友链
        success = await linkStore.addLink(formValue.value)
        if (success) {
          message.success('友链已创建')
        }
      }
      
      if (success) {
        showCreateModal.value = false
        formValue.value = {
          name: '',
          url: '',
          icon: '',
          description: '',
          status: 'pending'
        }
        editingLink.value = null
      } else {
        message.error('操作失败')
      }
    }
  })
}

// 重置友链数据
const handleReset = () => {
  linkStore.resetToDefault()
  message.success('友链数据已重置')
}

// 添加状态选项
const statusOptions = [
  { label: '已发布', value: 'approved' },
  { label: '待审核', value: 'pending' },
  { label: '已拒绝', value: 'rejected' }
]
</script>

<style scoped>
.links-manage {
  width: 100%;
}

.stats-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

.stat-value {
  font-size: 24px;
  font-weight: 600;
}

.success {
  color: #18a058;
}

.warning {
  color: #f0a020;
}

.error {
  color: #d03050;
}

.header-actions {
  margin-bottom: 16px;
}

.links-tabs {
  margin-bottom: 16px;
}

:deep(.n-data-table .n-data-table-td) {
  padding: 12px;
}

:deep(.n-button.n-button--quaternary) {
  padding: 0 8px;
}

:deep(.n-stat-value) {
  font-size: inherit;
}

@media (max-width: 768px) {
  .stats-row {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style> 