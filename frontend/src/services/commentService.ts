import http from '@/services/http'

export interface Comment {
  id: string
  content: string
  postId: string
  author: string
  createdAt: string
  parentId?: string | null
}

export const commentService = {
  // 获取文章评论
  getComments: (postId: string) =>
    http.get<Comment[]>(`/posts/${postId}/comments`),

  // 创建评论
  createComment: (data: { content: string; postId: string }) =>
    http.post<Comment>('/comments', data),

  // 回复评论
  replyComment: (commentId: string, data: { content: string; postId: string }) =>
    http.post<Comment>(`/comments/${commentId}/reply`, data),

  // 删除评论
  deleteComment: (commentId: string) =>
    http.delete(`/comments/${commentId}`)
}
