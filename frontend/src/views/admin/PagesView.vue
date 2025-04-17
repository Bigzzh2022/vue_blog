<template>
  <div class="pages-manage">
    <!-- 顶部操作栏 -->
    <NSpace justify="space-between" class="header-actions">
      <NSpace>
        <NButton type="primary" @click="showCreateModal = true">
          <template #icon>
            <NIcon><Add /></NIcon>
          </template>
          新建页面
        </NButton>
        <NButton @click="handleReset">重置数据</NButton>
      </NSpace>
      <NSpace>
        <NInput v-model:value="searchText" placeholder="搜索页面...">
          <template #prefix>
            <NIcon><Search /></NIcon>
          </template>
        </NInput>
      </NSpace>
    </NSpace>
    
    <!-- 标签页 -->
    <NTabs v-model:value="activeTab" type="line" class="pages-tabs">
      <NTabPane name="all" tab="全部" />
      <NTabPane name="published" tab="已发布" />
      <NTabPane name="draft" tab="草稿" />
    </NTabs>

    <!-- 页面列表 -->
    <NDataTable
      :columns="columns"
      :data="filteredPages"
      :pagination="pagination"
      :bordered="false"
      striped
    />

    <!-- 创建/编辑页面模态框 -->
    <NModal 
      v-model:show="showCreateModal"
      preset="card"
      :title="modalTitle"
      style="width: 90%; max-width: 1200px;"
      :bordered="false"
      size="huge"
    >
      <NForm
        ref="formRef"
        :model="formValue"
        :rules="rules"
        label-placement="left"
        label-width="100"
        class="page-form"
        require-mark-placement="right-hanging"
      >
        <NGrid :cols="24" :x-gap="24">
          <NGridItem :span="24">
            <NFormItem label="页面标题" path="title">
              <NInput v-model:value="formValue.title" placeholder="请输入页面标题" />
            </NFormItem>
          </NGridItem>
          
          <NGridItem :span="12">
            <NFormItem label="页面路径" path="slug">
              <NInput v-model:value="formValue.slug" placeholder="请输入页面路径，例如: about" />
            </NFormItem>
          </NGridItem>
          
          <NGridItem :span="12">
            <NFormItem label="页面模板" path="template">
              <NSelect 
                v-model:value="formValue.template" 
                :options="templateOptions"
              />
            </NFormItem>
          </NGridItem>
          
          <NGridItem :span="12">
            <NFormItem label="页面描述" path="description">
              <NInput 
                v-model:value="formValue.description" 
                type="textarea" 
                placeholder="请输入页面描述"
              />
            </NFormItem>
          </NGridItem>
          
          <NGridItem :span="12">
            <NFormItem label="页面关键词" path="keywords">
              <NInput 
                v-model:value="formValue.keywords" 
                placeholder="请输入页面关键词，用逗号分隔"
              />
            </NFormItem>
          </NGridItem>
          
          <NGridItem :span="12">
            <NFormItem label="状态" path="status">
              <NSelect
                v-model:value="formValue.status"
                :options="statusOptions"
              />
            </NFormItem>
          </NGridItem>
          
          <NGridItem :span="12">
            <NFormItem label="设为首页" path="isHome">
              <NSwitch v-model:value="formValue.isHome" />
            </NFormItem>
          </NGridItem>
          
          <NGridItem :span="24">
            <NTabs type="segment">
              <NTabPane name="content" tab="HTML">
                <div class="editor-container">
                  <NFormItem label="HTML内容" path="content">
                    <NInput 
                      v-model:value="formValue.content" 
                      type="textarea" 
                      class="code-editor"
                      :autosize="{ minRows: 10, maxRows: 20 }"
                      placeholder="请输入HTML内容"
                    />
                  </NFormItem>
                </div>
              </NTabPane>
              
              <NTabPane name="css" tab="CSS">
                <div class="editor-container">
                  <NFormItem label="CSS样式" path="css">
                    <NInput 
                      v-model:value="formValue.css" 
                      type="textarea" 
                      class="code-editor"
                      :autosize="{ minRows: 10, maxRows: 20 }"
                      placeholder="请输入CSS样式"
                    />
                  </NFormItem>
                </div>
              </NTabPane>
              
              <NTabPane name="javascript" tab="JavaScript">
                <div class="editor-container">
                  <NFormItem label="JavaScript代码" path="javascript">
                    <NInput 
                      v-model:value="formValue.javascript" 
                      type="textarea" 
                      class="code-editor"
                      :autosize="{ minRows: 10, maxRows: 20 }"
                      placeholder="请输入JavaScript代码"
                    />
                  </NFormItem>
                </div>
              </NTabPane>
              <!-- 移除预览标签页 -->
              <!-- <NTabPane name="preview" tab="预览">
                <div class="preview-container">
                  <div class="preview-header">
                    <h3>页面预览</h3>
                    <NButton size="small" @click="refreshPreview">刷新预览</NButton>
                  </div>
                  <iframe 
                    ref="previewFrame" 
                    class="page-preview" 
                    sandbox="allow-scripts allow-same-origin" 
                    title="页面预览"
                  ></iframe>
                </div>
              </NTabPane> -->
            </NTabs>
          </NGridItem>
        </NGrid>
      </NForm>
      
      <template #footer>
        <NSpace justify="end">
          <NButton @click="showCreateModal = false">取消</NButton>
          <NButton type="primary" @click="handleSubmit">保存</NButton>
        </NSpace>
      </template>
    </NModal>
  </div>
</template>

<script setup lang="ts">
import { h, ref, computed, onMounted, nextTick } from 'vue'
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
  NSelect,
  NSwitch,
  NTabs,
  NTabPane,
  NGrid,
  NGridItem,
  useMessage,
  type FormInst,
  type DataTableColumns
} from 'naive-ui'
import { Add, Search, Create, TrashBin, Eye } from '@vicons/ionicons5'
import { usePagesStore, type StaticPage } from '@/stores/pages'

const message = useMessage()
const pagesStore = usePagesStore()
const searchText = ref('')
const showCreateModal = ref(false)
const formRef = ref<FormInst | null>(null)
const editingPage = ref<StaticPage | null>(null)
const activeTab = ref('all')
// 移除预览框架引用

// @ts-ignore 忽略模板中方法未定义的TypeScript错误
// 在Vue 3 <script setup>中，所有顶层函数自动可用于模板

// 初始加载页面数据
onMounted(async () => {
  if (!pagesStore.loaded) {
    await pagesStore.loadPages()
  }
  
  // 初始化完成
})

// 表单数据
const formValue = ref({
  title: '',
  slug: '',
  content: '',
  css: '',
  javascript: '',
  description: '',
  keywords: '',
  status: 'published' as 'published' | 'draft',
  isHome: false,
  template: 'default'
})

// 模板选项
const templateOptions = [
  { label: '默认模板', value: 'default' },
  { label: '全宽模板', value: 'full-width' },
  { label: '侧边栏模板', value: 'sidebar' }
]

// 状态选项
const statusOptions = [
  { label: '已发布', value: 'published' },
  { label: '草稿', value: 'draft' }
]

// 表单验证规则
const rules = {
  title: {
    required: true,
    message: '请输入页面标题',
    trigger: 'blur'
  },
  slug: {
    required: true,
    message: '请输入页面路径',
    trigger: 'blur',
    validator: (rule: any, value: string) => {
      if (!/^[a-z0-9-]+$/.test(value)) {
        return new Error('页面路径只能包含小写字母、数字和连字符')
      }
      return true
    }
  },
  content: {
    required: true,
    message: '请输入页面内容',
    trigger: 'blur'
  }
}

// 模态框标题
const modalTitle = computed(() => editingPage.value ? '编辑页面' : '新建页面')

// 根据标签页和搜索条件过滤页面
const filteredPages = computed(() => {
  let pages: StaticPage[] = []
  
  switch (activeTab.value) {
    case 'all':
      pages = pagesStore.pages
      break
    case 'published':
      pages = pagesStore.publishedPages
      break
    case 'draft':
      pages = pagesStore.draftPages
      break
    default:
      pages = pagesStore.pages
  }
  
  return pages.filter(page => 
    page.title.toLowerCase().includes(searchText.value.toLowerCase()) ||
    page.slug.toLowerCase().includes(searchText.value.toLowerCase()) ||
    page.description.toLowerCase().includes(searchText.value.toLowerCase())
  )
})

// 表格列配置
const columns: DataTableColumns<StaticPage> = [
  {
    title: '标题',
    key: 'title',
    sorter: 'default'
  },
  {
    title: '路径',
    key: 'slug',
    render: (row: StaticPage) => {
      return h(
        'span',
        {
          style: 'font-family: monospace; background: #f5f5f5; padding: 2px 6px; border-radius: 4px;'
        },
        `/${row.slug}`
      )
    }
  },
  {
    title: '模板',
    key: 'template',
    render: (row: StaticPage) => {
      const templateLabels: Record<string, string> = {
        'default': '默认模板',
        'full-width': '全宽模板',
        'sidebar': '侧边栏模板'
      }
      return templateLabels[row.template] || row.template
    }
  },
  {
    title: '首页',
    key: 'isHome',
    width: 80,
    render: (row: StaticPage) => {
      return row.isHome ? '是' : '否'
    }
  },
  {
    title: '更新时间',
    key: 'updateTime',
    sorter: (a, b) => new Date(a.updateTime).getTime() - new Date(b.updateTime).getTime(),
    render: (row: StaticPage) => {
      return new Date(row.updateTime).toLocaleString()
    }
  },
  {
    title: '状态',
    key: 'status',
    width: 100,
    render: (row: StaticPage) => {
      const statusMap = {
        published: { text: '已发布', type: 'success' },
        draft: { text: '草稿', type: 'warning' }
      }
      
      const status = statusMap[row.status]
      
      return h(
        'div',
        {
          style: `
            padding: 2px 6px; 
            border-radius: 10px; 
            font-size: 12px; 
            display: inline-block;
            color: ${status.type === 'success' ? '#18a058' : '#f0a020'};
            background: ${status.type === 'success' ? 'rgba(24, 160, 88, 0.1)' : 'rgba(240, 160, 32, 0.1)'};
          `
        },
        status.text
      )
    }
  },
  {
    title: '操作',
    key: 'actions',
    width: 220,
    fixed: 'right',
    render: (row: StaticPage) => {
      const buttons = []
      
      // 查看按钮
      buttons.push(
        h(NButton, 
          { 
            size: 'small',
            quaternary: true,
            onClick: () => handlePreview(row),
            style: 'margin-right: 8px;'
          }, 
          { 
            default: () => '查看',
            icon: () => h(NIcon, null, { default: () => h(Eye) })
          }
        )
      )
      
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
      
      // 删除按钮 (不显示在首页上)
      if (!row.isHome) {
        const handleDeleteWrapper = () => handleDelete(row.id);
        buttons.push(
          h(NPopconfirm,
            {
              onPositiveClick: handleDeleteWrapper
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
              default: () => '确认删除这个页面吗？'
            }
          )
        )
      }
      
      return h('div', {}, buttons)
    }
  }
]

// 分页配置
const pagination = {
  pageSize: 10
}

// 处理编辑
const handleEdit = (page: StaticPage) => {
  editingPage.value = page
  formValue.value = {
    title: page.title,
    slug: page.slug,
    content: page.content,
    css: page.css,
    javascript: page.javascript,
    description: page.description,
    keywords: page.keywords,
    status: page.status,
    isHome: page.isHome,
    template: page.template
  }
  showCreateModal.value = true
}

// 处理预览 - 直接打开编辑模式
const handlePreview = (page: StaticPage) => {
  handleEdit(page);
}

// 处理删除
const handleDelete = async (id: number) => {
  await pagesStore.deletePage(id)
  message.success('删除成功')
  await pagesStore.loadPages()
}

// 处理表单提交
const handleSubmit = () => {
  formRef.value?.validate(async (errors) => {
    if (!errors) {
      let success = false
      
      if (editingPage.value) {
        // 编辑页面
        success = await pagesStore.updatePage(editingPage.value.id, formValue.value)
        if (success) {
          message.success('页面已更新')
        }
      } else {
        // 创建新页面
        const newPage = await pagesStore.addPage(formValue.value)
        success = !!newPage
        if (success) {
          message.success('页面已创建')
        }
      }
      
      if (success) {
        showCreateModal.value = false
        // 重置表单
        formValue.value = {
          title: '',
          slug: '',
          content: '',
          css: '',
          javascript: '',
          description: '',
          keywords: '',
          status: 'published',
          isHome: false,
          template: 'default'
        }
        editingPage.value = null
      } else {
        message.error('操作失败')
      }
    }
  })
}


// 重置页面数据
const handleReset = () => {
  pagesStore.resetToDefault()
  message.success('页面数据已重置')
}
</script>

<style scoped>
.pages-manage {
  width: 100%;
}

.header-actions {
  margin-bottom: 16px;
}

.pages-tabs {
  margin-bottom: 16px;
}

.page-form {
  margin-top: 16px;
}

.editor-container {
  margin-top: 16px;
}

.code-editor {
  font-family: 'Courier New', Courier, monospace;
}

/* 移除预览相关样式 */

:deep(.n-data-table .n-data-table-td) {
  padding: 12px;
}

:deep(.n-button.n-button--quaternary) {
  padding: 0 8px;
}

:deep(.n-modal-body) {
  padding: 0;
}
</style>