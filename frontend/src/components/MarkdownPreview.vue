<template>
  <MdPreview
    :modelValue="content"
    :showCodeRowNumber="true"
    codeTheme="atom-one-dark"
    :style="previewStyle"
    :previewTheme="previewTheme"
    :noMermaid="false"
    :noKatex="false"
    :mdHeadingId="generateHeadingId"
    :sanitize="sanitizeHtml"
    :formatCopiedText="formatCopiedText"
    :codeStyleReverse="true"
    :noHighlight="false"
    :noImgZoomIn="false"
    @onGetCatalog="handleGetCatalog"
  />
</template>

<script setup lang="ts">
import { MdPreview } from 'md-editor-v3'
import 'md-editor-v3/lib/style.css'
import 'highlight.js/styles/atom-one-dark.css'

// Props 定义
interface Props {
  content: string
}

const emit = defineEmits<{
  'getCatalog': [catalog: Array<{ text: string; level: number; id: string }>]
}>()

withDefaults(defineProps<Props>(), {
  content: ''
})

// 预览样式配置
const previewStyle = {
  padding: 0,
  margin: 0,
  backgroundColor: 'transparent'
}

// 预览主题配置
const previewTheme = 'default'

// 标题ID生成函数
const generateHeadingId = (text: string, level: number, index: number) => {
  const prefix = 'heading-'
  const slug = text.toLowerCase().replace(/\s+/g, '-')
  return `${prefix}${level}-${index}-${slug}`
}

// HTML 净化配置
const sanitizeHtml = (html: string) => {
  // 可以使用 DOMPurify 等库进行 HTML 净化
  return html
}

// 格式化复制的文本
const formatCopiedText = (text: string) => {
  return text.trim()
}

// 获取目录结构
const handleGetCatalog = (catalog: Array<{ text: string; level: number; id: string }>) => {
  emit('getCatalog', catalog)
}
</script>

<!-- 样式部分保持不变 -->
<style>
/* ... 样式代码保持不变 ... */
</style>
