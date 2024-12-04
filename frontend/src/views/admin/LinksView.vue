<template>
  <div class="links-manage" role="main">
    <NSpace vertical>
      <!-- 顶部操作栏 -->
      <NSpace justify="space-between">
        <NSpace>
          <NButton type="primary" @click="showCreateModal = true">
            <template #icon>
              <NIcon><Add /></NIcon>
            </template>
            新建友链
          </NButton>
        </NSpace>
        <NSpace>
          <NInput v-model:value="searchText" placeholder="搜索友链...">
            <template #prefix>
              <NIcon><Search /></NIcon>
            </template>
          </NInput>
        </NSpace>
      </NSpace>

      <!-- 友链列表 -->
      <NDataTable
        :columns="columns"
        :data="filteredLinks"
        :pagination="pagination"
        :bordered="false"
      />
    </NSpace>

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
            @update:value="handleStatusChange"
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
import { h, ref, computed } from 'vue'
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
  NSelect
} from 'naive-ui'
import { Add, Search, Create, TrashBin } from '@vicons/ionicons5'
import type { DataTableColumns, FormInst } from 'naive-ui'

interface FriendLink {
  id: number
  name: string
  url: string
  icon: string
  description: string
  createTime: string
  status: string
}

const message = useMessage()
const searchText = ref('')
const showCreateModal = ref(false)
const formRef = ref<FormInst | null>(null)
const editingLink = ref<FriendLink | null>(null)

// 表单数据
const formValue = ref({
  name: '',
  url: '',
  icon: '',
  description: '',
  status: ''
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
  }
}

// 模态框标题
const modalTitle = computed(() => editingLink.value ? '编辑友链' : '新建友链')

// 模拟友链数据
const links = ref<FriendLink[]>([
  {
    id: 1,
    name: '示例网站',
    url: 'https://example.com',
    icon: 'https://example.com/favicon.ico',
    description: '这是一个示例网站',
    createTime: '2024-01-15',
    status: '已发布'
  }
])

// 表格列配置
const columns: DataTableColumns<FriendLink> = [
  {
    title: '网站名称',
    key: 'name',
    render: (row: FriendLink) => {
      return h('div', { style: 'display: flex; align-items: center; gap: 8px;' }, [
        h('img', {
          src: row.icon,
          style: 'width: 20px; height: 20px;',
          onerror: (e: any) => {
            e.target.src = '/favicon.ico' // 默认图标
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
    key: 'description'
  },
  {
    title: '创建时间',
    key: 'createTime',
    width: 150
  },
  {
    title: '操作',
    key: 'actions',
    width: 150,
    render: (row: FriendLink) => {
      return h(NSpace, { size: 'small' }, {
        default: () => [
          h(NButton, 
            { 
              size: 'small',
              quaternary: true,
              onClick: () => handleEdit(row)
            }, 
            { 
              default: () => '编辑',
              icon: () => h(NIcon, null, { default: () => h(Create) })
            }
          ),
          h(NPopconfirm,
            {
              onPositiveClick: () => handleDelete(row)
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
        ]
      })
    }
  }
]

// 分页配置
const pagination = {
  pageSize: 10
}

// 过滤后的友链列表
const filteredLinks = computed(() => {
  return links.value.filter(link => 
    link.name.toLowerCase().includes(searchText.value.toLowerCase()) ||
    link.description.toLowerCase().includes(searchText.value.toLowerCase())
  )
})

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
const handleDelete = (link: FriendLink) => {
  links.value = links.value.filter(l => l.id !== link.id)
  message.success('友链已删除')
}

// 处理表单提交
const handleSubmit = () => {
  formRef.value?.validate((errors) => {
    if (!errors) {
      if (editingLink.value) {
        // 编辑友链
        const index = links.value.findIndex(l => l.id === editingLink.value!.id)
        if (index !== -1) {
          links.value[index] = {
            ...editingLink.value,
            ...formValue.value
          }
          message.success('友链已更新')
        }
      } else {
        // 创建新友链
        const newLink: FriendLink = {
          id: Math.max(...links.value.map(l => l.id)) + 1,
          ...formValue.value,
          createTime: new Date().toLocaleDateString()
        }
        links.value.unshift(newLink)
        message.success('友链已创建')
      }
      
      showCreateModal.value = false
      formValue.value = {
        name: '',
        url: '',
        icon: '',
        description: '',
        status: ''
      }
      editingLink.value = null
    }
  })
}

// 添加状态变化处理函数
const handleStatusChange = (value: string) => {
  formValue.value.status = value
}

// 添加状态选项
const statusOptions = [
  { label: '已发布', value: 'published' },
  { label: '待审核', value: 'pending' },
  { label: '已拒绝', value: 'rejected' }
]
</script>

<style scoped>
.links-manage {
  width: 100%;
}

:deep(.n-data-table .n-data-table-td) {
  padding: 12px;
}

:deep(.n-button.n-button--quaternary) {
  padding: 0 8px;
}
</style> 