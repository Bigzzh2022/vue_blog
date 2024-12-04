<template>
  <div class="post-edit">
    <NCard title="编辑文章">
      <NForm
        ref="formRef"
        :model="formValue"
        :rules="rules"
        label-placement="left"
        label-width="100"
        require-mark-placement="right-hanging"
      >
        <NFormItem label="文章状态" path="status">
          <NSelect
            v-model:value="formValue.status"
            :options="statusOptions"
            placeholder="请选择文章状态"
          />
        </NFormItem>
        
        <NFormItem label="文章标题" path="title">
          <NInput v-model:value="formValue.title" placeholder="请输入文章标题" />
        </NFormItem>
        
        <NFormItem label="文章分类" path="category">
          <NSelect
            v-model:value="formValue.category"
            :options="categoryOptions"
            placeholder="请选择文章分类"
          />
        </NFormItem>
        
        <NFormItem label="文章标签" path="tags">
          <NSelect
            v-model:value="formValue.tags"
            multiple
            filterable
            tag
            :options="tagOptions"
            placeholder="请选择或输入文章标签"
            :consistent-menu-width="false"
            @create="handleCreateTag"
            @keydown="handleTagInputKeydown"
            :show-create-when-filtering="false"
          >
            <template #empty>
              输入标签名称后按回车创建
            </template>
          </NSelect>
        </NFormItem>

        <NFormItem label="编辑器类型" path="editorType">
          <NRadioGroup v-model:value="editorType" name="editorType" @update:value="handleEditorTypeChange">
            <NRadioButton value="rich">富文本编辑器</NRadioButton>
            <NRadioButton value="markdown">Markdown编辑器</NRadioButton>
          </NRadioGroup>
        </NFormItem>

        <!-- 富文本编辑器 -->
        <NFormItem v-if="editorType === 'rich'" label="文章内容" path="content">
          <div style="border: 1px solid #ccc">
            <Toolbar
              style="border-bottom: 1px solid #ccc"
              :editor="richEditorRef"
              :defaultConfig="toolbarConfig"
              mode="default"
            />
            <Editor
              style="height: 500px"
              v-model="formValue.content"
              :defaultConfig="editorConfig"
              mode="default"
              @onCreated="handleCreated"
            />
          </div>
        </NFormItem>

        <!-- Markdown编辑器 -->
        <NFormItem v-else label="文章内容" path="content">
          <MdEditor
            ref="mdEditorRef"
            v-model="formValue.content"
            style="height: 500px"
            :toolbars="markdownToolbars"
            preview-theme="github"
            :preview="true"
            class="custom-md-editor"
          />
        </NFormItem>

        <NFormItem>
          <NSpace>
            <NButton type="primary" @click="handleSubmit">
              {{ submitButtonText }}
            </NButton>
            <NButton @click="handleCancel">取消</NButton>
          </NSpace>
        </NFormItem>
      </NForm>
    </NCard>
  </div>
</template>

<script setup lang="ts">
import { ref, shallowRef, onBeforeUnmount, nextTick, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { 
  NCard, 
  NForm, 
  NFormItem, 
  NInput, 
  NSelect, 
  NRadioGroup, 
  NRadioButton, 
  NSpace, 
  NButton,
  useMessage
} from 'naive-ui'
import type { FormInst, SelectOption } from 'naive-ui'
import type { FormValidationError } from 'naive-ui/es/form/src/interface'
import { Editor, Toolbar } from '@wangeditor/editor-for-vue'
import { MdEditor } from 'md-editor-v3'
import type { IDomEditor } from '@wangeditor/editor'
import type { ToolbarNames } from 'md-editor-v3'
import '@wangeditor/editor/dist/css/style.css'
import 'md-editor-v3/lib/style.css'

const router = useRouter()
const route = useRoute()
const richEditorRef = shallowRef<IDomEditor | null>(null)
const mdEditorRef = ref<InstanceType<typeof MdEditor> | null>(null)
const editorType = ref('rich')
const formRef = ref<FormInst | null>(null)

const message = useMessage()

// 修改表单数据接口
interface FormState {
  title: string
  category: string | null
  tags: string[]
  content: string
  status: 'published' | 'draft' | 'private'
}

// 表单数据
const formValue = ref<FormState>({
  title: '',
  category: null,
  tags: [],
  content: '',
  status: 'draft' // 默认为草稿状态
})

// 状态选项
const statusOptions = [
  { label: '发布', value: 'published' },
  { label: '草稿', value: 'draft' },
  { label: '私密', value: 'private' }
]

// 提交按钮文本
const submitButtonText = computed(() => {
  const textMap = {
    published: '发布文章',
    draft: '保存草稿',
    private: '私密发布'
  }
  return textMap[formValue.value.status]
})

// 表单验规则
const rules = {
  title: {
    required: true,
    message: '请输入文章标题',
    trigger: 'blur'
  },
  category: {
    required: true,
    message: '请选择文章分类',
    trigger: ['blur', 'change']
  },
  content: {
    required: true,
    message: '请输入文章内容',
    trigger: 'blur'
  },
  status: {
    required: true,
    message: '请选择文章状态',
    trigger: ['blur', 'change']
  }
}

// 分类选项
const categoryOptions = [
  { label: '技术', value: 'tech' },
  { label: '生活', value: 'life' },
  { label: '随笔', value: 'essay' }
]

// 修改标签选项的类型
interface TagOption {
  label: string
  value: string
  type?: 'success' | 'info' | 'warning' | 'error'
}

// 标签选项
const tagOptions = ref<TagOption[]>([
  { label: 'Vue', value: 'vue', type: 'success' },
  { label: 'React', value: 'react', type: 'info' },
  { label: 'TypeScript', value: 'typescript', type: 'warning' },
  { label: '生活', value: 'life', type: 'error' }
])

// wangEditor 配置
const toolbarConfig = {
  excludeKeys: []
}

const editorConfig = {
  placeholder: '请输入内容...',
  autoFocus: false
}

// markdown 工具栏配置
const markdownToolbars: ToolbarNames[] = [
  'bold',
  'underline',
  'italic',
  '-',
  'strikeThrough',
  'title',
  'sub',
  'sup',
  'quote',
  'unorderedList',
  'orderedList',
  'task',
  '-',
  'codeRow',
  'code',
  'link',
  'image',
  'table',
  'mermaid',
  'katex',
  '-',
  'revoke',
  'next',
  'save',
  '=',
  'pageFullscreen',
  'fullscreen',
  'preview',
  'htmlPreview',
  'catalog',
  'github'
] as ToolbarNames[]

// 处理编辑器类型切换
const handleEditorTypeChange = (value: string) => {
  // 保存当前内容
  const currentContent = formValue.value.content
  
  // 如果是从富文本切换到 Markdown
  if (value === 'markdown' && richEditorRef.value) {
    // 销毁富文本编辑器
    richEditorRef.value.destroy()
    richEditorRef.value = null
  }
  
  // 切换编辑器类型
  editorType.value = value
  
  // 使用 nextTick 确保 DOM 更新后再设置容
  nextTick(() => {
    formValue.value.content = currentContent
  })
}

// 创建富文本编辑器
const handleCreated = (editor: IDomEditor) => {
  richEditorRef.value = editor
}

// 提交表单
const handleSubmit = () => {
  formRef.value?.validate((errors: Array<FormValidationError> | undefined) => {
    if (!errors) {
      const statusMessages = {
        published: '文章已发布',
        draft: '草稿已保存',
        private: '文章已私密发布'
      }
      console.log('表单数据：', formValue.value)
      message.success(statusMessages[formValue.value.status])
      router.push('/admin/posts')
    }
  })
}

// 取消编辑
const handleCancel = () => {
  router.push('/admin/posts')
}

// 组件销毁时清理编辑器
onBeforeUnmount(() => {
  if (richEditorRef.value) {
    richEditorRef.value.destroy()
    richEditorRef.value = null
  }
})

// 修改处理创建标签的回调
const handleCreateTag = (label: string): SelectOption => {
  // 不再设置 tempTagInput
  return { label, value: label } // 返回一个临时选项，阻止默认创建行为
}

// 修改标签输入框键盘事件处理
const handleTagInputKeydown = (e: KeyboardEvent) => {
  const target = e.target as HTMLInputElement
  const value = target.value.trim()
  
  if (e.key === 'Enter' && value) {
    e.preventDefault() // 阻止默认行为
    e.stopPropagation() // 阻止事件冒泡
    
    // 检查标签是否已存在
    const exists = tagOptions.value.some(
      tag => tag.label.toLowerCase() === value.toLowerCase()
    )
    
    if (exists) {
      message.warning('该标签已存在')
      return
    }

    // 生成唯一的value
    const tagValue = value.toLowerCase().replace(/\s+/g, '-')
    
    // 随机选择一个标签类型
    const types: TagOption['type'][] = ['success', 'info', 'warning', 'error']
    const type = types[Math.floor(Math.random() * types.length)]
    
    // 创建新标签
    const newTag: TagOption = {
      label: value,
      value: tagValue,
      type
    }
    
    // 添加到选项中
    tagOptions.value.push(newTag)
    
    // 选中新创建的标签
    formValue.value.tags = [...formValue.value.tags, tagValue]
    
    message.success(`已创建标签: ${value}`)
    
    // 清空输入框
    target.value = ''
  }
}
</script>

<style>
.post-edit {
  width: 100%;
}

.w-e-text-container {
  background-color: #fff !important;
}

/* Markdown 编辑器样式自定义 */
.md-editor {
  border: 1px solid #eee !important;
  /* 工具栏容器 */
  --md-toolbar-height: 50px !important;  /* 增加工具栏高度 */
}

.md-editor .md-editor-toolbar {
  padding: 6px 12px !important;
  gap: 8px !important;
}

/* 工具栏图标和按钮 */
.md-editor .md-editor-toolbar svg {
  width: 22px !important;
  height: 22px !important;
}

.md-editor .md-editor-toolbar i {
  font-size: 22px !important;
}

.md-editor .md-toolbar-item,
.md-editor .md-editor-toolbar button {
  min-width: 36px !important;
  height: 36px !important;
  padding: 7px !important;
  margin: 0 2px !important;
  border-radius: 4px !important;
}

/* 工具栏分组 */
.md-editor .md-toolbar-group {
  padding: 0 4px !important;
}

/* 分隔符 */
.md-editor .md-toolbar-divider {
  height: 36px !important;
  margin: 0 8px !important;
}

/* 下拉菜单按钮 */
.md-editor .md-toolbar-item.menu-button {
  padding: 7px 12px !important;
}

/* 工具栏悬停效果 */
.md-editor .md-toolbar-item:hover,
.md-editor .md-editor-toolbar button:hover {
  background-color: rgba(0, 0, 0, 0.06) !important;
}

/* 激活状态 */
.md-editor .md-toolbar-item.active,
.md-editor .md-editor-toolbar button.active {
  color: var(--md-color) !important;
  background-color: rgba(var(--md-color-rgb), 0.1) !important;
}

/* 编辑器内容区域 */
.md-editor .md-editor-content {
  font-size: 16px !important;
}

/* 预览区域 */
.md-editor .md-editor-preview {
  font-size: 16px !important;
  padding: 16px 24px !important;
}

/* 下拉菜单 */
.md-editor .md-extend-menu {
  padding: 4px !important;
  border: 1px solid #e5e7eb !important;
  border-radius: 8px !important;
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1) !important;
}

.md-editor .md-extend-menu-button {
  padding: 8px 12px !important;
  font-size: 14px !important;
  border-radius: 4px !important;
}

.md-editor .md-extend-menu-button:hover {
  background-color: #f3f4f6 !important;
  color: #1d4ed8 !important;
}

/* 富文本编辑器样式 */
.w-e-text-container {
  background-color: #fff !important;
}

/* 编辑器切换过渡效果 */
.editor-enter-active,
.editor-leave-active {
  transition: opacity 0.3s ease;
}

.editor-enter-from,
.editor-leave-to {
  opacity: 0;
}

/* Select 组件样式 */
.n-select .n-tag {
  max-width: 160px;
}

.n-select-menu .n-empty {
  padding: 12px;
  text-align: center;
  color: #666;
  font-size: 14px;
}

.n-select .n-input__input-el {
  font-size: 14px;
}
</style> 