import http from '@/services/http'

export interface UploadResult {
  filename: string
  filepath: string
}

export const uploadService = {
  // 上传文件
  uploadFile: (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    return http.post<UploadResult>('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  },
  // 获取文件列表（假设后端 GET /upload/list 返回 [{ filename, filepath, size, uploadTime, mimetype }]）
  listFiles: () => {
    return http.get('/upload/list')
  },
  // 删除文件
  deleteFile: (filename: string) => {
    return http.delete(`/upload/delete`, { params: { filename } })
  },
  // 重命名文件
  renameFile: (oldname: string, newname: string) => {
    return http.post(`/upload/rename`, { oldname, newname })
  }
}
