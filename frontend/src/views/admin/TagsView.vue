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
      <NSpin :show="loading">
        <div v-if="error" class="error-message">
          <NAlert type="error">
            {{ error }}
            <template #action>
              <NButton text @click="loadTags">
                <template #icon>
                  <NIcon><RefreshOutline /></NIcon>
                </template>
                重试
              </NButton>
            </template>
          </NAlert>
        </div>
        <NEmpty v-else-if="filteredTags.length === 0 && !loading" description="暂无标签" />
        <NDataTable
          v-else
          :columns="columns"
          :data="filteredTags"
          :pagination="pagination"
          :bordered="false"
          :row-key="row => row.id"
          @update:checked-row-keys="handleCheck"
          :checked-row-keys="selectedRowKeys"
        />
      </NSpin>
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
      :items="deletedTags.map(tag => ({ ...(tag as any), type: 'tag' }))"
      @restore="restoreTag"
      @restore-all="restoreAllTags"
      @delete="permanentlyDeleteTag"
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
  NTag,
  NPopconfirm,
  useMessage,
  NSpin,
  NAlert,
  NEmpty
} from 'naive-ui'
import type { DataTableColumns, FormInst } from 'naive-ui'
import { Add, Search, Create, TrashBin, RefreshOutline } from '@vicons/ionicons5'
import type { OnUpdateCheckedRowKeys, RowKey } from 'naive-ui/es/data-table/src/interface'
import RecycleBin from '@/components/RecycleBin.vue'
import type { RecycleBinItem } from '@/types/recycle-bin'
import adminService from '@/services/adminService'

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

// 标签数据
const tags = ref<Tag[]>([])

// 加载状态
const loading = ref(false)

// 错误信息
const error = ref<string | null>(null)

// 加载标签数据
const loadTags = async () => {
  loading.value = true
  error.value = null
  try {
    const response = await adminService.getTags()
    // 先初始化标签数据
    tags.value = response.map((tag: any, index: number) => ({
      id: index + 1,
      name: tag.name,
      slug: tag.name.toLowerCase().replace(/\s+/g, '-'),
      count: 0, // 先初始化为0
      createTime: tag.createTime || new Date().toISOString().split('T')[0]
    }))
    // 前端统计每个标签下已发布文章数
    await Promise.all(tags.value.map(async (tag) => {
      try {
        // 只支持 category, 这里获取全部已发布文章后前端筛选包含该标签的
        const articles = await import('@/services/articleService').then(m => m.articleService.getPosts({ status: 'published' }))
        tag.count = Array.isArray(articles)
          ? articles.filter((a: any) => Array.isArray(a.tags) && a.tags.includes(tag.name)).length
          : 0
      } catch (err) {
        console.error(`获取标签 ${tag.name} 的文章数量失败:`, err)
      }
    }))
  } catch (err) {
    console.error('加载标签数据失败:', err)
    error.value = '加载标签数据失败，请稍后重试'
  } finally {
    loading.value = false
  }
}

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
const handleDelete = async (tag: Tag) => {
  try {
    loading.value = true
    await adminService.deleteTag(tag.name)
    
    const deletedTag: DeletedTag = {
      ...tag,
      type: 'tag',
      deleteTime: new Date().toLocaleString()
    }
    tags.value = tags.value.filter(t => t.id !== tag.id)
    deletedTags.value.push(deletedTag)
    message.success('标签已删除')
  } catch (err) {
    console.error('删除标签失败:', err)
    message.error('删除标签失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

// 处理批量删除
const handleBatchDelete = async () => {
  if (selectedRowKeys.value.length === 0) {
    message.warning('请选择要删除的标签')
    return
  }
  
  try {
    loading.value = true
    const selectedTags = tags.value.filter(tag => selectedRowKeys.value.includes(tag.id))
    
    // 并行删除所有选中的标签
    const deletePromises = selectedTags.map(tag => adminService.deleteTag(tag.name))
    await Promise.all(deletePromises)
    
    // 将删除的标签添加到回收站
    const deletedTagsToAdd = selectedTags.map(tag => ({
      ...tag,
      type: 'tag' as const,
      deleteTime: new Date().toLocaleString()
    }))
    deletedTags.value.push(...deletedTagsToAdd)
    
    // 从列表中移除
    tags.value = tags.value.filter(tag => !selectedRowKeys.value.includes(tag.id))
    
    const count = selectedRowKeys.value.length
    selectedRowKeys.value = []
    message.success(`已删除 ${count} 个标签`)
  } catch (err) {
    console.error('批量删除标签失败:', err)
    message.error('批量删除标签失败，请稍后重试')
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
        
        if (editingTag.value) {
          // 编辑标签 - 先删除旧标签，再创建新标签
          await adminService.deleteTag(editingTag.value.name)
          await adminService.createTag({ name: formValue.value.name })
          
          const index = tags.value.findIndex(t => t.id === editingTag.value!.id)
          if (index !== -1) {
            tags.value[index] = {
              ...editingTag.value,
              name: formValue.value.name,
              slug: formValue.value.slug
            }
          }
          message.success('标签已更新')
        } else {
          // 创建新标签
          await adminService.createTag({ name: formValue.value.name })
          
          // 重新加载标签列表以获取最新数据
          await loadTags()
          message.success('标签已创建')
        }
        
        showCreateModal.value = false
        formValue.value = {
          name: '',
          slug: ''
        }
        editingTag.value = null
      } catch (err) {
        console.error('保存标签失败:', err)
        message.error('保存标签失败，请稍后重试')
      } finally {
        loading.value = false
      }
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
const restoreTag = async (item: RecycleBinItem) => {
  if (item.type !== 'tag') return
  
  try {
    loading.value = true
    const tag = item as DeletedTag
    
    // 创建标签
    await adminService.createTag({ name: tag.name })
    
    // 从回收站移除并添加回列表
    const { deleteTime, type, ...restTag } = tag
    tags.value.push(restTag)
    deletedTags.value = deletedTags.value.filter(t => t.id !== tag.id)
    
    message.success('标签已恢复')
  } catch (err) {
    console.error('恢复标签失败:', err)
    message.error('恢复标签失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

// 处理恢复全部
const restoreAllTags = async () => {
  try {
    loading.value = true
    
    // 并行创建所有标签
    const createPromises = deletedTags.value.map(tag => 
      adminService.createTag({ name: tag.name })
    )
    await Promise.all(createPromises)
    
    // 将所有标签添加回标签列表
    const restoredTags = deletedTags.value.map((tag) => {
  // 移除 deleteTime 和 type 字段，保留其他属性
  const { deleteTime, type, ...restTag } = tag
  return restTag as Tag
})
    tags.value = [...tags.value, ...restoredTags]
    
    // 清空删除列表
    deletedTags.value = []
    
    message.success('所有标签已恢复')
  } catch (err) {
    console.error('恢复所有标签失败:', err)
    message.error('恢复所有标签失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

// 处理永久删除
const permanentlyDeleteTag = async (item: RecycleBinItem) => {
  if (item.type !== 'tag') return
  
  try {
    const tag = item as DeletedTag
    deletedTags.value = deletedTags.value.filter(t => t.id !== tag.id)
    message.success('标签已永久删除')
  } catch (err) {
    console.error('永久删除标签失败:', err)
    message.error('永久删除标签失败，请稍后重试')
  }
}

// 处理清空回收站
const clearRecycleBin = () => {
  // 清空删除列表
  deletedTags.value = []
  message.success('回收站已清空')
}

// 页面加载时获取标签数据
onMounted(() => {
  loadTags()
})
</script>

<style scoped>
.tags-manage {
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