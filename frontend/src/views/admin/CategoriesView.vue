<template>
  <div class="categories-manage" role="main">
    <NSpace vertical>
      <!-- 顶部操作栏 -->
      <NSpace justify="space-between">
        <NSpace>
          <NButton type="primary" @click="showCreateModal = true">
            <template #icon>
              <NIcon><Add /></NIcon>
            </template>
            新建分类
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
          <NInput v-model:value="searchText" placeholder="搜索分类...">
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

      <!-- 分类列表 -->
      <NDataTable
        :columns="columns"
        :data="filteredCategories"
        :pagination="pagination"
        :bordered="false"
        :row-key="row => row.id"
        @update:checked-row-keys="handleCheck"
        :checked-row-keys="selectedRowKeys"
      />
    </NSpace>

    <!-- 创建/编辑分类模态框 -->
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
        <NFormItem label="分类名称" path="name">
          <NInput 
            v-model:value="formValue.name" 
            placeholder="请输入分类名称" 
            @update:value="handleNameChange"
            :autofocus="true"
          />
          <template #feedback>
            <span class="feedback-text">名称是它在您网站上的显示方式</span>
          </template>
        </NFormItem>
        
        <NFormItem label="分类别名" path="slug">
          <NInput 
            v-model:value="formValue.slug" 
            placeholder="请输入分类别名"
            @input="handleSlugInput"
            @blur="validateSlug"
          />
          <template #feedback>
            <span class="feedback-text">别名是在URL中使用的名称，仅支持小写字母、数字和连字符</span>
          </template>
        </NFormItem>

        <NFormItem label="父分类" path="parentId">
          <NSelect
            v-model:value="formValue.parentId"
            :options="parentOptions"
            placeholder="请选择父分类"
            clearable
          />
          <template #feedback>
            <span class="feedback-text">可以选择一个父分类，形成层级关系</span>
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
      type="category"
      :items="deletedCategories.map(category => ({ ...category, type: 'category' }))"
      @restore="restoreCategory"
      @restore-all="restoreAllCategories"
      @delete="permanentlyDeleteCategory"
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
  NPopconfirm,
  useMessage
} from 'naive-ui'
import type { DataTableColumns, FormInst } from 'naive-ui'
import { Add, Search, Create, TrashBin } from '@vicons/ionicons5'
import type { OnUpdateCheckedRowKeys, RowKey } from 'naive-ui/es/data-table/src/interface'
import RecycleBin from '@/components/RecycleBin.vue'
import type { RecycleBinItem } from '@/types/recycle-bin'
import type { SelectMixedOption } from 'naive-ui/es/select/src/interface'

interface Category {
  id: number
  name: string
  slug: string
  parentId: number | null
  count: number
  createTime: string
}

interface DeletedCategory extends Category {
  deleteTime: string
  type: 'category'
}

const message = useMessage()
const searchText = ref('')
const selectedRowKeys = ref<RowKey[]>([])
const showCreateModal = ref(false)
const formRef = ref<FormInst | null>(null)
const editingCategory = ref<Category | null>(null)

// 表单数据
const formValue = ref({
  name: '',
  slug: '',
  parentId: null as number | null
})

// 表单验证规则
const rules = {
  name: {
    required: true,
    message: '请输入分类名称',
    trigger: 'blur'
  },
  slug: {
    required: true,
    message: '请输入分类别名',
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
const modalTitle = computed(() => editingCategory.value ? '编辑分类' : '新建分类')

// 模拟分类数据
const categories = ref<Category[]>([
  {
    id: 1,
    name: '技术',
    slug: 'tech',
    parentId: null,
    count: 25,
    createTime: '2024-01-15'
  },
  {
    id: 2,
    name: '前端',
    slug: 'frontend',
    parentId: 1,
    count: 18,
    createTime: '2024-01-14'
  },
  {
    id: 3,
    name: '生活',
    slug: 'life',
    parentId: null,
    count: 15,
    createTime: '2024-01-13'
  }
])

// 父分类选项
const parentOptions = computed<SelectMixedOption[]>(() => {
  return [
    {
      label: '无',
      value: null,
      type: 'group'
    },
    ...categories.value
      .filter(category => !editingCategory.value || category.id !== editingCategory.value.id)
      .map(category => ({
        label: category.name,
        value: category.id,
        type: 'group'
      }))
  ]
})

// 表格列配置
const columns: DataTableColumns<Category> = [
  { type: 'selection' },
  {
    title: 'ID',
    key: 'id',
    width: 80,
    align: 'center'
  },
  {
    title: '分类名称',
    key: 'name'
  },
  {
    title: '分类别名',
    key: 'slug',
    width: 150
  },
  {
    title: '父分类',
    key: 'parentId',
    width: 150,
    render: (row: Category) => {
      const parent = categories.value.find(c => c.id === row.parentId)
      return parent ? parent.name : '无'  // 显示"无"而不是空白
    }
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
    render: (row: Category) => {
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
              default: () => '确认删除这个分类吗？'
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

// 过滤后的分类列表
const filteredCategories = computed(() => {
  return categories.value.filter(category => 
    category.name.toLowerCase().includes(searchText.value.toLowerCase())
  )
})

// 处理选中
const handleCheck: OnUpdateCheckedRowKeys = (keys: RowKey[]) => {
  selectedRowKeys.value = keys
}

// 处理编辑
const handleEdit = (category: Category) => {
  editingCategory.value = category
  formValue.value = {
    name: category.name,
    slug: category.slug,
    parentId: category.parentId
  }
  showCreateModal.value = true
}

// 处理删除
const handleDelete = (category: Category) => {
  if (category.count > 0) {
    message.warning('该分类下还有文章，不能直接删除')
    return
  }
  
  const deletedCategory: DeletedCategory = {
    ...category,
    type: 'category',
    deleteTime: new Date().toLocaleString()
  }
  categories.value = categories.value.filter(c => c.id !== category.id)
  deletedCategories.value.push(deletedCategory)
  message.success('分类已删除')
}

// 处理批量删除
const handleBatchDelete = () => {
  if (selectedRowKeys.value.length === 0) {
    message.warning('请选择要删除的分类')
    return
  }
  
  const hasArticles = categories.value.some(
    category => selectedRowKeys.value.includes(category.id.toString()) && category.count > 0
  )
  
  if (hasArticles) {
    message.warning('选中的分类中有包含文章的分类，不能删除')
    return
  }
  
  categories.value = categories.value.filter(
    category => !selectedRowKeys.value.includes(category.id.toString())
  )
  selectedRowKeys.value = []
  message.success(`已删除 ${selectedRowKeys.value.length} 个分类`)
}

// 处理表单提交
const handleSubmit = () => {
  formRef.value?.validate((errors) => {
    if (!errors) {
      if (editingCategory.value) {
        // 编辑分类
        const index = categories.value.findIndex(c => c.id === editingCategory.value!.id)
        if (index !== -1) {
          categories.value[index] = {
            ...editingCategory.value,
            name: formValue.value.name,
            slug: formValue.value.slug,
            parentId: formValue.value.parentId
          }
          message.success('分类已更新')
        }
      } else {
        // 创建新分类
        const newCategory: Category = {
          id: Math.max(...categories.value.map(c => c.id)) + 1,
          name: formValue.value.name,
          slug: formValue.value.slug,
          parentId: formValue.value.parentId,
          count: 0,
          createTime: new Date().toLocaleDateString()
        }
        categories.value.unshift(newCategory)
        message.success('分类已创建')
      }
      
      showCreateModal.value = false
      formValue.value = {
        name: '',
        slug: '',
        parentId: null
      }
      editingCategory.value = null
    }
  })
}

// 处理名称变化，自动生成别名
const handleNameChange = (value: string) => {
  if (!formValue.value.slug || formValue.value.slug === '') {
    const slug = value
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
    
    formValue.value.slug = slug
    
    const invalidChars = value.match(/[^a-z0-9\s-]/gi)
    if (invalidChars) {
      const chars = [...new Set(invalidChars)].join(' ')
      message.warning(`以下字符已被移除: ${chars}`)
    }
  }
}

// 处理别名输入
const handleSlugInput = (value: string) => {
  formValue.value.slug = value.toLowerCase()
}

// 验证别名格式
const validateSlug = () => {
  const value = formValue.value.slug
  if (!value) return

  const slugRegex = /^[a-z0-9-]+$/
  if (!slugRegex.test(value)) {
    const invalidChars = value.match(/[^a-z0-9-]/g)
    if (invalidChars) {
      const chars = [...new Set(invalidChars)].join(' ')
      message.error(`别名包含非法字符: ${chars}`)
    }
  }
}

// 添加取消处理函数
const handleCancel = () => {
  showCreateModal.value = false
  formValue.value = {
    name: '',
    slug: '',
    parentId: null
  }
  editingCategory.value = null
}

// 添加回收站相关状态和方法
const showRecycleBin = ref(false)
const deletedCategories = ref<DeletedCategory[]>([])

// 处理恢复
const restoreCategory = (item: RecycleBinItem) => {
  if (item.type !== 'category') return
  const category = item as DeletedCategory
  const { deleteTime, type, ...restCategory } = category
  categories.value.push(restCategory)
  deletedCategories.value = deletedCategories.value.filter(c => c.id !== category.id)
  message.success('分类已恢复')
}

// 处理恢复全部
const restoreAllCategories = () => {
  deletedCategories.value.forEach(category => {
    const { deleteTime, type, ...restCategory } = category
    categories.value.push(restCategory)
  })
  deletedCategories.value = []
  message.success('已恢复全部分类')
}

// 处理永久删除
const permanentlyDeleteCategory = (item: RecycleBinItem) => {
  if (item.type !== 'category') return
  const category = item as DeletedCategory
  deletedCategories.value = deletedCategories.value.filter(c => c.id !== category.id)
  message.success('分类已永久删除')
}

// 处理清空回收站
const clearRecycleBin = () => {
  deletedCategories.value = []
  message.success('回收站已清空')
}
</script>

<style scoped>
.categories-manage {
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
  text-transform: lowercase;
}
</style> 