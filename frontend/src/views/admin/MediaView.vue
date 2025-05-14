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
  { label: '重命名', key: 'rename' },
  { label: '删除', key: 'delete' }
]

// 文件数据，初始为空
const files = ref<MediaFile[]>([])

// 后端基础URL（请根据实际后端端口修改）
const backendUrl = 'http://localhost:8080'

// 获取真实文件列表（假设有 uploadService.listFiles 方法）
const loadFiles = async () => {
  try {
    // 假设后端返回 [{ filename, filepath, size, uploadTime, mimetype }]
    const res = await (uploadService.listFiles?.() ?? Promise.resolve([]))
    const arr = (res.data ?? res) as any[]
    files.value = arr.map((f, idx) => ({
      id: idx + 1,
      name: f.filename,
      type: f.mimetype?.startsWith('image') ? 'image' : (f.mimetype?.includes('pdf') || f.mimetype?.includes('doc') ? 'document' : 'other'),
      size: f.size,
      url: backendUrl + f.filepath,
      uploadTime: f.uploadTime || new Date().toISOString().slice(0, 10)
    }))
  } catch (err) {
    files.value = []
  }
}

import { onMounted } from 'vue'
onMounted(() => {
  loadFiles()
})

// 过滤后的文件列表
const filteredFiles = computed(() => {
  return files.value.filter(file => {
    const matchSearch = file.name.toLowerCase().includes(searchText.value.toLowerCase())
    const matchType = !filterType.value || file.type === filterType.value
    return matchSearch && matchType
  })
})

// 处理文件上传
import { uploadService } from '@/services/uploadService'

const handleUpload = async (options: any) => {
  // 兼容 NUpload 的文件格式
  const file = options.file?.file ?? options.file
  if (!file) {
    message.error('未获取到文件')
    return
  }
  try {
    const res = await uploadService.uploadFile(file)
    // Naive axios 封装，需取 res.data
    const result = res.data ?? res
    files.value.push({
      id: Date.now(),
      name: result.filename,
      type: file.type.startsWith('image') ? 'image' : (file.type.includes('pdf') || file.type.includes('doc') ? 'document' : 'other'),
      size: file.size,
      url: backendUrl + result.filepath,
      uploadTime: new Date().toISOString().slice(0, 10)
    })
    message.success('文件上传成功')
  } catch (err) {
    console.error('上传失败', err)
    message.error('文件上传失败')
  }
}

// 处理文件操作
import { h } from 'vue'
// NInput 只在顶部导入一次
// import { NInput } from 'naive-ui' // 已在顶部导入
import { useDialog } from 'naive-ui'
const dialog = useDialog()

const handleFileAction = (action: string, file: MediaFile) => {
  if (action === 'copy') {
    navigator.clipboard.writeText(file.url)
    message.success('链接已复制')
  } else if (action === 'preview') {
    selectedFile.value = file
    previewVisible.value = true
  } else if (action === 'delete') {
    dialog.warning({
      title: '删除文件',
      content: `确定要删除 ${file.name} 吗？`,
      positiveText: '删除',
      negativeText: '取消',
      onPositiveClick: async () => {
        try {
          await uploadService.deleteFile(file.name)
          message.success('删除成功')
          loadFiles()
        } catch (err) {
          message.error('删除失败')
        }
      }
    })
  } else if (action === 'rename') {
    let newFileName = file.name
    dialog.create({
      title: '重命名文件',
      content: () => h(NInput, {
        value: newFileName,
        onUpdateValue: (v: string) => { newFileName = v }
      }),
      positiveText: '确定',
      negativeText: '取消',
      onPositiveClick: async () => {
        if (!newFileName || newFileName === file.name) {
          message.warning('请输入新文件名')
          return
        }
        try {
          await uploadService.renameFile(file.name, newFileName)
          message.success('重命名成功')
          loadFiles()
        } catch (err) {
          message.error('重命名失败')
        }
      }
    })
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