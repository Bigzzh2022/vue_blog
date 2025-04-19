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
      <NSpin :show="loading">
        <div v-if="error" class="error-message">
          <NAlert type="error">
            {{ error }}
            <template #action>
              <NButton text @click="loadCategories">
                <template #icon>
                  <NIcon><RefreshOutline /></NIcon>
                </template>
                重试
              </NButton>
            </template>
          </NAlert>
        </div>
        <NEmpty v-else-if="filteredCategories.length === 0 && !loading" description="暂无分类" />
        <NDataTable
          v-else
          :columns="columns"
          :data="filteredCategories"
          :pagination="pagination"
          :bordered="false"
          :row-key="row => row.id"
          @update:checked-row-keys="handleCheck"
          :checked-row-keys="selectedRowKeys"
        />
      </NSpin>
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
  NSelect,
  NPopconfirm,
  useMessage,
  NSpin,
  NAlert,
  NEmpty
} from 'naive-ui'
import type { DataTableColumns, FormInst } from 'naive-ui'
import { Add, Search, Create, TrashBin } from '@vicons/ionicons5'
import type { OnUpdateCheckedRowKeys, RowKey } from 'naive-ui/es/data-table/src/interface'
import RecycleBin from '@/components/RecycleBin.vue'
import type { RecycleBinItem } from '@/types/recycle-bin'
import type { SelectMixedOption } from 'naive-ui/es/select/src/interface'
import { RefreshOutline } from '@vicons/ionicons5'
import { adminService } from '@/services/adminService'

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

// 分类数据
const categories = ref<Category[]>([])

// 加载状态
const loading = ref(false)

// 错误信息
const error = ref<string | null>(null)

// 加载分类数据
const loadCategories = async () => {
  loading.value = true
  error.value = null
  try {
    const response = await adminService.getCategories()
    // 先初始化分类数据
    categories.value = response.map((category: any, index: number) => ({
      id: index + 1,
      name: category.name,
      slug: category.slug || category.name.toLowerCase().replace(/\s+/g, '-'),
      parentId: category.parentId || null,
      count: 0, // 先初始化为0
      createTime: category.createTime || new Date().toISOString().split('T')[0]
    }))
    // 前端统计每个分类下已发布文章数
    await Promise.all(categories.value.map(async (category) => {
      try {
        const articles = await import('@/services/articleService').then(m => m.articleService.getPosts({ category: category.name, status: 'published' }))
        category.count = Array.isArray(articles) ? articles.length : 0
      } catch (err) {
        console.error(`获取分类 ${category.name} 的文章数量失败:`, err)
      }
    }))
  } catch (err) {
    console.error('加载分类数据失败:', err)
    error.value = '加载分类数据失败，请稍后重试'
  } finally {
    loading.value = false
  }
}

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

// 页面加载时获取分类数据
onMounted(() => {
  loadCategories()
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
const handleDelete = async (category: Category) => {
  try {
    loading.value = true
    await adminService.deleteCategory(category.name)
    
    // 将删除的分类添加到回收站
    const deletedCategory: DeletedCategory = {
      ...category,
      type: 'category',
      deleteTime: new Date().toLocaleString()
    }
    categories.value = categories.value.filter(c => c.id !== category.id)
    deletedCategories.value.push(deletedCategory)
    message.success('分类已删除')
  } catch (err) {
    console.error('删除分类失败:', err)
    message.error('删除分类失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

// 处理批量删除
const handleBatchDelete = async () => {
  if (selectedRowKeys.value.length === 0) {
    message.warning('请选择要删除的分类')
    return
  }
  
  try {
    loading.value = true
    const selectedCategories = categories.value.filter(category => selectedRowKeys.value.includes(category.id))
    
    // 并行删除所有选中的分类
    const deletePromises = selectedCategories.map(category => adminService.deleteCategory(category.name))
    await Promise.all(deletePromises)
    
    // 将删除的分类添加到回收站
    const deletedCategoriesToAdd = selectedCategories.map(category => ({
      ...category,
      type: 'category' as const,
      deleteTime: new Date().toLocaleString()
    }))
    deletedCategories.value.push(...deletedCategoriesToAdd)
    
    // 从列表中移除
    categories.value = categories.value.filter(category => !selectedRowKeys.value.includes(category.id))
    
    const count = selectedRowKeys.value.length
    selectedRowKeys.value = []
    message.success(`已删除 ${count} 个分类`)
  } catch (err) {
    console.error('批量删除分类失败:', err)
    message.error('批量删除分类失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

// 处理表单提交
const handleSubmit = async () => {
  formRef.value?.validate(async (errors) => {
    if (!errors) {
      try {
        loading.value = true
        
        if (editingCategory.value) {
          // 编辑分类 - 先删除旧分类，再创建新分类
          await adminService.deleteCategory(editingCategory.value.name)
          await adminService.createCategory({ 
            name: formValue.value.name,
            parentId: formValue.value.parentId
          })
          
          const index = categories.value.findIndex(c => c.id === editingCategory.value!.id)
          if (index !== -1) {
            categories.value[index] = {
              ...editingCategory.value,
              name: formValue.value.name,
              slug: formValue.value.slug,
              parentId: formValue.value.parentId
            }
          }
          message.success('分类已更新')
        } else {
          // 创建新分类
          await adminService.createCategory({ 
            name: formValue.value.name,
            parentId: formValue.value.parentId
          })
          
          // 重新加载分类列表以获取最新数据
          await loadCategories()
          message.success('分类已创建')
        }
        
        showCreateModal.value = false
        formValue.value = {
          name: '',
          slug: '',
          parentId: null
        }
        editingCategory.value = null
      } catch (err) {
        console.error('保存分类失败:', err)
        message.error('保存分类失败，请稍后重试')
      } finally {
        loading.value = false
      }
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
const restoreCategory = async (item: RecycleBinItem) => {
  if (item.type !== 'category') return
  
  try {
    loading.value = true
    const category = item as DeletedCategory
    
    // 创建分类
    await adminService.createCategory({ 
      name: category.name,
      parentId: category.parentId
    })
    
    // 从回收站移除并添加回列表
    const { deleteTime, type, ...restCategory } = category
    categories.value.push(restCategory)
    deletedCategories.value = deletedCategories.value.filter(c => c.id !== category.id)
    
    message.success('分类已恢复')
  } catch (err) {
    console.error('恢复分类失败:', err)
    message.error('恢复分类失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

// 处理恢复全部
const restoreAllCategories = async () => {
  try {
    loading.value = true
    
    // 并行创建所有分类
    const createPromises = deletedCategories.value.map(category => 
      adminService.createCategory({ 
        name: category.name,
        parentId: category.parentId
      })
    )
    await Promise.all(createPromises)
    
    // 将所有分类添加回分类列表
    const restoredCategories = deletedCategories.value.map(({ deleteTime, type, ...restCategory }) => restCategory)
    categories.value = [...categories.value, ...restoredCategories]
    
    // 清空删除列表
    deletedCategories.value = []
    
    message.success('所有分类已恢复')
  } catch (err) {
    console.error('恢复所有分类失败:', err)
    message.error('恢复所有分类失败，请稍后重试')
  } finally {
    loading.value = false
  }
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

.error-message {
  margin-bottom: 16px;
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