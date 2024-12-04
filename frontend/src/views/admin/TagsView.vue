<template>
  <div class="tags-manage" role="main">
    <NSpace vertical>
      <!-- 顶部操作栏 -->
      <NSpace justify="space-between">
        <NSpace>
          <NButton type="primary" @click="showCreateModal = true">
            <template #icon>
              <NIcon><Add /></NIcon>
            </template>
            新建标签
          </NButton>
          <NButton 
            type="error" 
            :disabled="!selectedRowKeys.length"
            @click="handleBatchDelete"
          >
            批量删除 ({{ selectedRowKeys.length }})
          </NButton>
        </NSpace>
        <NSpace>
          <NInput v-model:value="searchText" placeholder="搜索标签...">
            <template #prefix>
              <NIcon><Search /></NIcon>
            </template>
          </NInput>
          <NButton type="error" @click="showRecycleBin = true">
            <template #icon>
              <NIcon><TrashBin /></NIcon>
            </template>
            回收站
          </NButton>
        </NSpace>
      </NSpace>

      <!-- 标签列表 -->
      <NDataTable
        :columns="columns"
        :data="filteredTags"
        :pagination="pagination"
        :bordered="false"
        :row-key="row => row.id"
        @update:checked-row-keys="handleCheck"
        :checked-row-keys="selectedRowKeys"
      />
    </NSpace>

    <!-- 创建/编辑标签模态框 -->
    <NModal 
      v-model:show="showCreateModal" 
      :title="modalTitle"
      :auto-focus="false"
      :trap-focus="true"
      style="width: 500px"
      preset="dialog"
      :show-icon="false"
    >
      <NForm
        ref="formRef"
        :model="formValue"
        :rules="rules"
        label-placement="left"
        label-width="80"
        require-mark-placement="right-hanging"
      >
        <NFormItem label="标签名称" path="name">
          <NInput 
            v-model:value="formValue.name" 
            placeholder="请输入标签名称" 
            @update:value="handleNameChange"
            :autofocus="true"
          />
          <template #feedback>
            <span class="feedback-text">名称是它在您网站上的显示方式</span>
          </template>
        </NFormItem>
        
        <NFormItem label="标签别名" path="slug">
          <NInput 
            v-model:value="formValue.slug" 
            placeholder="请输入标签别名"
            @input="handleSlugInput"
            @blur="validateSlug"
          />
          <template #feedback>
            <span class="feedback-text">别名是在URL中使用的名称，仅支持小写字母、数字和连字符</span>
          </template>
        </NFormItem>
      </NForm>
      <template #action>
        <NSpace justify="end">
          <NButton @click="handleCancel">取消</NButton>
          <NButton type="primary" @click="handleSubmit">确定</NButton>
        </NSpace>
      </template>
    </NModal>

    <!-- 使用回收站组件 -->
    <RecycleBin
      :show="showRecycleBin"
      @update:show="showRecycleBin = $event"
      type="tag"
      :items="deletedTags.map(tag => ({ ...tag, type: 'tag' }))"
      @restore="restoreTag"
      @restore-all="restoreAllTags"
      @delete="permanentlyDeleteTag"
      @clear="clearRecycleBin"
    />
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
  NSelect,
  NTag,
  NPopconfirm,
  useMessage
} from 'naive-ui'
import type { DataTableColumns, FormInst } from 'naive-ui'
import { Add, Search, Create, TrashBin } from '@vicons/ionicons5'
import type { OnUpdateCheckedRowKeys, RowKey } from 'naive-ui/es/data-table/src/interface'
import RecycleBin from '@/components/RecycleBin.vue'
import type { RecycleBinItem } from '@/types/recycle-bin'

interface Tag {
  id: number
  name: string
  slug: string
  count: number
  createTime: string
}

interface DeletedTag extends Tag {
  deleteTime: string
  type: 'tag'
}

const message = useMessage()
const searchText = ref('')
const selectedRowKeys = ref<RowKey[]>([])
const showCreateModal = ref(false)
const formRef = ref<FormInst | null>(null)
const editingTag = ref<Tag | null>(null)

// 表单数据
const formValue = ref({
  name: '',
  slug: ''
})

// 表单验证规则
const rules = {
  name: {
    required: true,
    message: '请输入标签名称',
    trigger: 'blur'
  },
  slug: {
    required: true,
    message: '请输入标签别名',
    trigger: ['blur', 'input'],
    validator: (rule: any, value: string) => {
      if (!value) return true
      const slugRegex = /^[a-z0-9-]+$/
      if (!slugRegex.test(value)) {
        return new Error('别名只能包含小写字母、数字和连字符')
      }
      return true
    }
  }
}

// 模态框标题
const modalTitle = computed(() => editingTag.value ? '编辑标签' : '新建标签')

// 模拟标签数据
const tags = ref<Tag[]>([
  {
    id: 1,
    name: 'Vue',
    slug: 'vue',
    count: 25,
    createTime: '2024-01-15'
  },
  {
    id: 2,
    name: 'React',
    slug: 'react',
    count: 18,
    createTime: '2024-01-14'
  },
  {
    id: 3,
    name: 'TypeScript',
    slug: 'typescript',
    count: 15,
    createTime: '2024-01-13'
  }
])

// 表格列配置
const columns: DataTableColumns<Tag> = [
  { type: 'selection' },
  {
    title: 'ID',
    key: 'id',
    width: 80,
    align: 'center'
  },
  {
    title: '标签名称',
    key: 'name'
  },
  {
    title: '标签别名',
    key: 'slug',
    width: 150
  },
  {
    title: '文章数量',
    key: 'count',
    width: 100,
    align: 'center'
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
    render: (row: Tag) => {
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
              default: () => '确认删除这个标签吗？'
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

// 过滤后的标签列表
const filteredTags = computed(() => {
  return tags.value.filter(tag => 
    tag.name.toLowerCase().includes(searchText.value.toLowerCase())
  )
})

// 处理选中
const handleCheck: OnUpdateCheckedRowKeys = (keys: RowKey[]) => {
  selectedRowKeys.value = keys
}

// 处理编辑
const handleEdit = (tag: Tag) => {
  editingTag.value = tag
  formValue.value = {
    name: tag.name,
    slug: tag.slug
  }
  showCreateModal.value = true
}

// 处理删除
const handleDelete = (tag: Tag) => {
  const deletedTag: DeletedTag = {
    ...tag,
    type: 'tag',
    deleteTime: new Date().toLocaleString()
  }
  tags.value = tags.value.filter(t => t.id !== tag.id)
  deletedTags.value.push(deletedTag)
  message.success('标签已删除')
}

// 处理批量删除
const handleBatchDelete = () => {
  if (selectedRowKeys.value.length === 0) {
    message.warning('请选择要删除的标签')
    return
  }
  
  tags.value = tags.value.filter(tag => !selectedRowKeys.value.includes(tag.id.toString()))
  selectedRowKeys.value = []
  message.success(`已删除 ${selectedRowKeys.value.length} 个标签`)
}

// 处理表单提交
const handleSubmit = () => {
  formRef.value?.validate((errors) => {
    if (!errors) {
      if (editingTag.value) {
        // 编辑标签
        const index = tags.value.findIndex(t => t.id === editingTag.value!.id)
        if (index !== -1) {
          tags.value[index] = {
            ...editingTag.value,
            name: formValue.value.name,
            slug: formValue.value.slug
          }
          message.success('标签已更新')
        }
      } else {
        // 创建新标签
        const newTag: Tag = {
          id: Math.max(...tags.value.map(t => t.id)) + 1,
          name: formValue.value.name,
          slug: formValue.value.slug,
          count: 0,
          createTime: new Date().toLocaleDateString()
        }
        tags.value.unshift(newTag)
        message.success('标签已创建')
      }
      
      showCreateModal.value = false
      formValue.value = {
        name: '',
        slug: ''
      }
      editingTag.value = null
    }
  })
}

// 处理名称变化，自动生成别名
const handleNameChange = (value: string) => {
  if (!formValue.value.slug || formValue.value.slug === '') {
    // 将名称转换为别名格式：小写，替换空格和特殊字符为连字符
    const slug = value
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')  // 替换空格为连字符
      .replace(/[^a-z0-9-]/g, '')  // 移除非法字符
      .replace(/-+/g, '-')  // 替换多个连字符为单个
      .replace(/^-|-$/g, '')  // 移除首尾的连字符
    
    formValue.value.slug = slug
    
    // 如果有非法字符被移除，显示提示
    const invalidChars = value.match(/[^a-z0-9\s-]/gi)
    if (invalidChars) {
      const chars = [...new Set(invalidChars)].join(' ')
      message.warning(`以下字符已被移除: ${chars}`)
    }
  }
}

// 添加取消处理函数
const handleCancel = () => {
  showCreateModal.value = false
  formValue.value = {
    name: '',
    slug: ''
  }
  editingTag.value = null
}

// 处理别名输入
const handleSlugInput = (value: string) => {
  // 自动转换为小写
  formValue.value.slug = value.toLowerCase()
}

// 验证别名格式
const validateSlug = () => {
  const value = formValue.value.slug
  if (!value) return

  const slugRegex = /^[a-z0-9-]+$/
  if (!slugRegex.test(value)) {
    // 找出所有非法字符
    const invalidChars = value.match(/[^a-z0-9-]/g)
    if (invalidChars) {
      const chars = [...new Set(invalidChars)].join(' ')
      message.error(`别名包含非法字符: ${chars}`)
    }
  }
}

// 添加回收站相关状态和方法
const showRecycleBin = ref(false)
const deletedTags = ref<(Tag & { deleteTime: string })[]>([])

// 处理恢复
const restoreTag = (item: RecycleBinItem) => {
  if (item.type !== 'tag') return
  const tag = item as DeletedTag
  const { deleteTime, type, ...restTag } = tag
  tags.value.push(restTag)
  deletedTags.value = deletedTags.value.filter(t => t.id !== tag.id)
}

// 处理恢复全部
const restoreAllTags = () => {
  // 将所有标签添加回标签列表
  tags.value = [...tags.value, ...deletedTags.value]
  // 清空删除列表
  deletedTags.value = []
}

// 处理永久删除
const permanentlyDeleteTag = (item: RecycleBinItem) => {
  if (item.type !== 'tag') return
  const tag = item as DeletedTag
  deletedTags.value = deletedTags.value.filter(t => t.id !== tag.id)
  message.success('标签已永久删除')
}

// 处理清空回收站
const clearRecycleBin = () => {
  // 清空删除列表
  deletedTags.value = []
}
</script>

<style scoped>
.tags-manage {
  width: 100%;
}

:deep(.n-data-table .n-data-table-td) {
  padding: 12px;
}

:deep(.n-button.n-button--quaternary) {
  padding: 0 8px;
}

:deep(.n-modal) {
  width: 500px !important;
}

:deep(.n-modal-body) {
  padding: 24px !important;
}

:deep(.n-form-item .n-form-item-feedback-wrapper) {
  min-height: 22px;
}

:deep(.n-form-item) {
  margin-bottom: 24px;
}

:deep(.n-form-item:last-child) {
  margin-bottom: 0;
}

.feedback-text {
  color: #666;
  font-size: 13px;
}

:deep(.n-tag) {
  max-width: none;
}

:deep(.n-select) {
  width: 100%;
}

:deep(.n-input) {
  width: 100%;
}

:deep(.n-modal-action) {
  padding: 12px 24px;
  border-top: 1px solid #eee;
}

:deep(.n-space) {
  justify-content: flex-end;
}

:deep(.n-input-wrapper) {
  position: relative;
}

:deep(.n-input-wrapper input) {
  text-transform: lowercase;  /* 输入框中的文字始终显示为小写 */
}
</style> 