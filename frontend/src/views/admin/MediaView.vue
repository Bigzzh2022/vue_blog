<template>
  <div class="media-manage" role="main">
    <NSpace vertical>
      <!-- 顶部操作栏 -->
      <NSpace justify="space-between">
        <NSpace>
          <NUpload
            multiple
            directory-dnd
            :max-size="10485760"
            @change="handleUpload"
          >
            <NButton type="primary">
              <template #icon>
                <NIcon><UploadOutlined /></NIcon>
              </template>
              上传文件
            </NButton>
          </NUpload>
        </NSpace>
        <NSpace>
          <NInput v-model:value="searchText" placeholder="搜索文件...">
            <template #prefix>
              <NIcon><SearchOutlined /></NIcon>
            </template>
          </NInput>
          <NSelect
            v-model:value="filterType"
            :options="typeOptions"
            placeholder="文件类型"
            clearable
            style="width: 120px"
            @update:value="handleFilterChange"
          />
        </NSpace>
      </NSpace>

      <!-- 媒体库网格 -->
      <NGrid :cols="4" :x-gap="12" :y-gap="12">
        <NGridItem v-for="file in filteredFiles" :key="file.id">
          <NCard hoverable>
            <template #cover>
              <div class="media-preview">
                <img v-if="file.type === 'image'" :src="file.url" :alt="file.name">
                <NIcon v-else size="48"><FileOutlined /></NIcon>
              </div>
            </template>
            <template #header>
              <NEllipsis>{{ file.name }}</NEllipsis>
            </template>
            <template #header-extra>
              <NDropdown :options="fileOptions" @select="handleFileAction($event, file)">
                <NButton quaternary circle>
                  <template #icon>
                    <NIcon><EllipsisOutlined /></NIcon>
                  </template>
                </NButton>
              </NDropdown>
            </template>
            <NSpace vertical size="small">
              <span class="text-gray">{{ formatFileSize(file.size) }}</span>
              <span class="text-gray">{{ file.uploadTime }}</span>
            </NSpace>
          </NCard>
        </NGridItem>
      </NGrid>
    </NSpace>

    <!-- 预览对话框 -->
    <NModal v-model:show="previewVisible" preset="card" style="width: 600px">
      <template #header>
        <NEllipsis>{{ selectedFile?.name }}</NEllipsis>
      </template>
      <div class="preview-content">
        <img v-if="selectedFile?.type === 'image'" :src="selectedFile?.url" :alt="selectedFile?.name">
        <NIcon v-else size="48"><FileOutlined /></NIcon>
      </div>
      <template #footer>
        <NSpace justify="end">
          <NButton @click="previewVisible = false">关闭</NButton>
          <NButton type="primary" @click="copyFileUrl">复制链接</NButton>
        </NSpace>
      </template>
    </NModal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { 
  NSpace, 
  NButton, 
  NInput, 
  NSelect,
  NUpload,
  NCard,
  NGrid,
  NGridItem,
  NIcon,
  NDropdown,
  NModal,
  NEllipsis,
  useMessage
} from 'naive-ui'
import { 
  UploadOutlined,
  SearchOutlined,
  FileOutlined,
  EllipsisOutlined
} from '@vicons/antd'

interface MediaFile {
  id: number
  name: string
  type: 'image' | 'document' | 'other'
  size: number
  url: string
  uploadTime: string
}

const message = useMessage()
const searchText = ref('')
const filterType = ref<string | null>(null)
const previewVisible = ref(false)
const selectedFile = ref<MediaFile | null>(null)

// 文件类型选项
const typeOptions = [
  { label: '图片', value: 'image' },
  { label: '文档', value: 'document' },
  { label: '其他', value: 'other' }
]

// 文件操作选项
const fileOptions = [
  { label: '预览', key: 'preview' },
  { label: '复制链接', key: 'copy' },
  { label: '删除', key: 'delete' }
]

// 模拟文件数据
const files = ref<MediaFile[]>([
  {
    id: 1,
    name: 'example.jpg',
    type: 'image',
    size: 1024 * 1024,
    url: 'https://example.com/image.jpg',
    uploadTime: '2024-01-15'
  }
])

// 过滤后的文件列表
const filteredFiles = computed(() => {
  return files.value.filter(file => {
    const matchSearch = file.name.toLowerCase().includes(searchText.value.toLowerCase())
    const matchType = !filterType.value || file.type === filterType.value
    return matchSearch && matchType
  })
})

// 处理文件上传
const handleUpload = (options: any) => {
  console.log('Upload:', options)
  message.success('文件上传成功')
}

// 处理文件操作
const handleFileAction = (key: string, file: MediaFile) => {
  switch (key) {
    case 'preview':
      selectedFile.value = file
      previewVisible.value = true
      break
    case 'copy':
      copyFileUrl()
      break
    case 'delete':
      files.value = files.value.filter(f => f.id !== file.id)
      message.success('文件已删除')
      break
  }
}

// 复制文件链接
const copyFileUrl = () => {
  if (selectedFile.value) {
    navigator.clipboard.writeText(selectedFile.value.url)
    message.success('链接已复制')
  }
}

// 格式化文件大小
const formatFileSize = (size: number) => {
  if (size < 1024) return size + ' B'
  if (size < 1024 * 1024) return (size / 1024).toFixed(2) + ' KB'
  return (size / (1024 * 1024)).toFixed(2) + ' MB'
}

// 添加过滤器变化处理函数
const handleFilterChange = (value: string | null) => {
  filterType.value = value
}
</script>

<style scoped>
.media-manage {
  width: 100%;
}

.media-preview {
  height: 160px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
}

.media-preview img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.preview-content {
  max-height: 400px;
  overflow: auto;
  display: flex;
  align-items: center;
  justify-content: center;
}

.preview-content img {
  max-width: 100%;
  height: auto;
}

.text-gray {
  color: #999;
  font-size: 14px;
}
</style> 