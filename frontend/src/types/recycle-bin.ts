// 基础接口
export interface BaseItem {
  id: number
  deleteTime: string
  type: 'post' | 'tag' | 'category'
}

// 文章接口
export interface PostItem extends BaseItem {
  type: 'post'
  title: string
  category: string
  tags: string[]
  status: 'published' | 'draft' | 'private'
  createTime: string
  updateTime: string
  views: number
}

// 标签接口
export interface TagItem extends BaseItem {
  type: 'tag'
  name: string
  slug: string
  count: number
  createTime: string
}

// 分类接口
export interface CategoryItem extends BaseItem {
  type: 'category'
  name: string
  count: number
  createTime: string
}

// 回收站项目类型
export type RecycleBinItem = PostItem | TagItem | CategoryItem 