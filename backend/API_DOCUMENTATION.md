# Vue Blog API 接口文档

本文档详细描述了Vue Blog后端API的所有接口，包括请求方法、URL、参数和响应格式，方便前端开发人员进行接口测试和集成。

## 目录

- [认证相关](#认证相关)
  - [用户登录](#用户登录)
  - [用户注册](#用户注册)
  - [获取当前用户信息](#获取当前用户信息)
- [文章相关](#文章相关)
  - [获取文章列表](#获取文章列表)
  - [获取单篇文章](#获取单篇文章)
  - [创建文章](#创建文章)
  - [更新文章](#更新文章)
  - [删除文章](#删除文章)
  - [上传文章封面](#上传文章封面)
- [分类相关](#分类相关)
  - [获取所有分类](#获取所有分类)
  - [创建分类](#创建分类)
  - [删除分类](#删除分类)
- [标签相关](#标签相关)
  - [获取所有标签](#获取所有标签)
  - [创建标签](#创建标签)
  - [删除标签](#删除标签)
- [评论相关](#评论相关)
  - [获取文章评论](#获取文章评论)
  - [创建评论](#创建评论)
  - [回复评论](#回复评论)
  - [删除评论](#删除评论)
- [文件上传](#文件上传)
  - [上传文件](#上传文件)
  - [获取文件列表](#获取文件列表)
  - [删除文件](#删除文件)
  - [重命名文件](#重命名文件)
- [设置相关](#设置相关)
  - [获取基本设置](#获取基本设置)
  - [更新基本设置](#更新基本设置)
  - [获取个人资料设置](#获取个人资料设置)
  - [更新个人资料设置](#更新个人资料设置)
  - [获取高级设置](#获取高级设置)
  - [更新高级设置](#更新高级设置)
- [友情链接](#友情链接)
  - [获取友情链接列表](#获取友情链接列表)
  - [创建友情链接](#创建友情链接)
  - [更新友情链接](#更新友情链接)
  - [删除友情链接](#删除友情链接)
- [搜索功能](#搜索功能)
  - [搜索文章](#搜索文章)
- [用户管理](#用户管理)
  - [更新用户角色](#更新用户角色)

## 认证相关

### 用户登录

- **URL**: `/api/login`
- **方法**: `POST`
- **描述**: 用户登录并获取访问令牌

**请求参数**:

```json
{
  "username": "string",
  "password": "string"
}
```

**响应**:

```json
{
  "token": "string",
  "user": {
    "id": "string",
    "username": "string",
    "email": "string",
    "role": "string",
    "avatar": "string",
    "createdAt": "string"
  }
}
```

### 用户注册

- **URL**: `/api/register`
- **方法**: `POST`
- **描述**: 注册新用户

**请求参数**:

```json
{
  "username": "string",
  "email": "string",
  "password": "string"
}
```

**响应**:

```json
{
  "id": "string",
  "username": "string",
  "email": "string",
  "role": "string",
  "avatar": "string",
  "createdAt": "string"
}
```

### 获取当前用户信息

- **URL**: `/api/users/me`
- **方法**: `GET`
- **描述**: 获取当前登录用户的信息
- **认证**: 需要Bearer Token

**响应**:

```json
{
  "id": "string",
  "username": "string",
  "email": "string",
  "role": "string",
  "avatar": "string",
  "createdAt": "string"
}
```

## 文章相关

### 获取文章列表

- **URL**: `/api/posts`
- **方法**: `GET`
- **描述**: 获取文章列表，可以根据状态和分类进行筛选

**查询参数**:

- `status` (可选): 文章状态 (draft, published, private)
- `category` (可选): 文章分类名称

**响应**:

```json
[
  {
    "id": "string",
    "title": "string",
    "content": "string",
    "description": "string",
    "category": "string",
    "tags": ["string"],
    "status": "string",
    "author": "string",
    "views": 0,
    "publishDate": "string",
    "updateTime": "string",
    "coverImage": "string",
    "commentCount": 0
  }
]
```

### 获取单篇文章

- **URL**: `/api/posts/{post_id}`
- **方法**: `GET`
- **描述**: 获取指定ID的文章详情

**路径参数**:

- `post_id`: 文章ID

**响应**:

```json
{
  "id": "string",
  "title": "string",
  "content": "string",
  "description": "string",
  "category": "string",
  "tags": ["string"],
  "status": "string",
  "author": "string",
  "views": 0,
  "publishDate": "string",
  "updateTime": "string",
  "coverImage": "string",
  "commentCount": 0
}
```

### 创建文章

- **URL**: `/api/posts`
- **方法**: `POST`
- **描述**: 创建新文章
- **认证**: 需要Bearer Token

**请求参数**:

```json
{
  "title": "string",
  "content": "string",
  "description": "string",
  "category": "string",
  "tags": ["string"],
  "status": "string"
}
```

**响应**:

```json
{
  "id": "string",
  "title": "string",
  "content": "string",
  "description": "string",
  "category": "string",
  "tags": ["string"],
  "status": "string",
  "author": "string",
  "views": 0,
  "publishDate": "string",
  "updateTime": "string",
  "coverImage": "string",
  "commentCount": 0
}
```

### 更新文章

- **URL**: `/api/posts/{post_id}`
- **方法**: `PUT`
- **描述**: 更新指定ID的文章
- **认证**: 需要Bearer Token

**路径参数**:

- `post_id`: 文章ID

**请求参数**:

```json
{
  "title": "string",
  "content": "string",
  "description": "string",
  "category": "string",
  "tags": ["string"],
  "status": "string"
}
```

**响应**:

```json
{
  "id": "string",
  "title": "string",
  "content": "string",
  "description": "string",
  "category": "string",
  "tags": ["string"],
  "status": "string",
  "author": "string",
  "views": 0,
  "publishDate": "string",
  "updateTime": "string",
  "coverImage": "string",
  "commentCount": 0
}
```

### 删除文章

- **URL**: `/api/posts/{post_id}`
- **方法**: `DELETE`
- **描述**: 删除指定ID的文章
- **认证**: 需要Bearer Token

**路径参数**:

- `post_id`: 文章ID

**响应**:

```json
{
  "message": "Post deleted successfully"
}
```

### 上传文章封面

- **URL**: `/api/posts/{post_id}/cover`
- **方法**: `POST`
- **描述**: 为指定文章上传封面图片
- **认证**: 需要Bearer Token

**路径参数**:

- `post_id`: 文章ID

**请求参数**:

- `file`: 文件对象 (multipart/form-data)

**响应**:

```json
{
  "id": "string",
  "title": "string",
  "content": "string",
  "description": "string",
  "category": "string",
  "tags": ["string"],
  "status": "string",
  "author": "string",
  "views": 0,
  "publishDate": "string",
  "updateTime": "string",
  "coverImage": "string",
  "commentCount": 0
}
```

## 分类相关

### 获取所有分类

- **URL**: `/api/categories`
- **方法**: `GET`
- **描述**: 获取所有文章分类

**响应**:

```json
[
  {
    "name": "string"
  }
]
```

### 创建分类

- **URL**: `/api/categories`
- **方法**: `POST`
- **描述**: 创建新分类
- **认证**: 需要Bearer Token (管理员权限)

**请求参数**:

```json
{
  "name": "string"
}
```

**响应**:

```json
{
  "name": "string"
}
```

### 删除分类

- **URL**: `/api/categories/{category_name}`
- **方法**: `DELETE`
- **描述**: 删除指定名称的分类
- **认证**: 需要Bearer Token (管理员权限)

**路径参数**:

- `category_name`: 分类名称

**响应**:

```json
{
  "message": "Category deleted successfully"
}
```

## 标签相关

### 获取所有标签

- **URL**: `/api/tags`
- **方法**: `GET`
- **描述**: 获取所有文章标签

**响应**:

```json
[
  {
    "name": "string"
  }
]
```

### 创建标签

- **URL**: `/api/tags`
- **方法**: `POST`
- **描述**: 创建新标签
- **认证**: 需要Bearer Token

**请求参数**:

```json
{
  "name": "string"
}
```

**响应**:

```json
{
  "name": "string"
}
```

### 删除标签

- **URL**: `/api/tags/{tag_name}`
- **方法**: `DELETE`
- **描述**: 删除指定名称的标签
- **认证**: 需要Bearer Token (管理员权限)

**路径参数**:

- `tag_name`: 标签名称

**响应**:

```json
{
  "message": "Tag deleted successfully"
}
```

## 评论相关

### 获取文章评论

- **URL**: `/api/posts/{post_id}/comments`
- **方法**: `GET`
- **描述**: 获取指定文章的所有评论

**路径参数**:

- `post_id`: 文章ID

**响应**:

```json
[
  {
    "id": "string",
    "content": "string",
    "postId": "string",
    "author": "string",
    "createdAt": "string",
    "parentId": "string"
  }
]
```

### 创建评论

- **URL**: `/api/comments`
- **方法**: `POST`
- **描述**: 创建新评论
- **认证**: 需要Bearer Token

**请求参数**:

```json
{
  "content": "string",
  "postId": "string"
}
```

**响应**:

```json
{
  "id": "string",
  "content": "string",
  "postId": "string",
  "author": "string",
  "createdAt": "string",
  "parentId": null
}
```

### 回复评论

- **URL**: `/api/comments/{comment_id}/reply`
- **方法**: `POST`
- **描述**: 回复指定评论
- **认证**: 需要Bearer Token

**路径参数**:

- `comment_id`: 评论ID

**请求参数**:

```json
{
  "content": "string",
  "postId": "string"
}
```

**响应**:

```json
{
  "id": "string",
  "content": "string",
  "postId": "string",
  "author": "string",
  "createdAt": "string",
  "parentId": "string"
}
```

### 删除评论

- **URL**: `/api/comments/{comment_id}`
- **方法**: `DELETE`
- **描述**: 删除指定评论及其所有回复
- **认证**: 需要Bearer Token

**路径参数**:

- `comment_id`: 评论ID

**响应**:

```json
{
  "message": "Comment deleted successfully"
}
```

## 文件上传

### 上传文件

- **URL**: `/api/upload`
- **方法**: `POST`
- **描述**: 上传文件
- **认证**: 需要Bearer Token

**请求参数**:

- `file`: 文件对象 (multipart/form-data)

**响应**:

```json
{
  "filename": "string",
  "filepath": "string"
}
```

### 获取文件列表

- **URL**: `/api/upload/list`
- **方法**: `GET`
- **描述**: 获取已上传的文件列表
- **认证**: 需要Bearer Token

**响应**:

```json
[
  {
    "filename": "string",
    "filepath": "string",
    "size": 0,
    "uploadTime": "string",
    "mimetype": "string"
  }
]
```

### 删除文件

- **URL**: `/api/upload/delete`
- **方法**: `DELETE`
- **描述**: 删除已上传的文件
- **认证**: 需要Bearer Token

**查询参数**:

- `filename`: 要删除的文件名

**响应**:

```json
{
  "success": true,
  "msg": "文件已删除"
}
```

### 重命名文件

- **URL**: `/api/upload/rename`
- **方法**: `POST`
- **描述**: 重命名已上传的文件
- **认证**: 需要Bearer Token

**请求参数**:

```json
{
  "oldname": "string",
  "newname": "string"
}
```

**响应**:

```json
{
  "success": true,
  "msg": "文件已重命名"
}
```

## 设置相关

### 获取基本设置

- **URL**: `/api/settings/basic`
- **方法**: `GET`
- **描述**: 获取网站基本设置
- **认证**: 需要Bearer Token (管理员权限)

**响应**:

```json
{
  "siteTitle": "string",
  "siteDescription": "string",
  "siteLogo": "string",
  "postsPerPage": 10,
  "theme": "light",
  "carouselEnabled": false,
  "carouselApiUrl": "string",
  "carouselImageCount": 5,
  "carouselInterval": 5,
  "icp": "string",
  "startYear": 2023,
  "footerText": "string",
  "footerLinks": []
}
```

### 更新基本设置

- **URL**: `/api/settings/basic`
- **方法**: `PUT`
- **描述**: 更新网站基本设置
- **认证**: 需要Bearer Token (管理员权限)

**请求参数**:

```json
{
  "siteTitle": "string",
  "siteDescription": "string",
  "siteLogo": "string",
  "postsPerPage": 10,
  "theme": "light",
  "carouselEnabled": false,
  "carouselApiUrl": "string",
  "carouselImageCount": 5,
  "carouselInterval": 5,
  "icp": "string",
  "startYear": 2023,
  "footerText": "string",
  "footerLinks": []
}
```

**响应**:
与请求参数相同的JSON对象

### 获取个人资料设置

- **URL**: `/api/settings/profile`
- **方法**: `GET`
- **描述**: 获取个人资料设置
- **认证**: 需要Bearer Token

**响应**:

```json
{
  "avatar": "string",
  "nickname": "string",
  "bio": "string",
  "email": "string",
  "socialLinks": []
}
```

### 更新个人资料设置

- **URL**: `/api/settings/profile`
- **方法**: `PUT`
- **描述**: 更新个人资料设置
- **认证**: 需要Bearer Token

**请求参数**:

```json
{
  "avatar": "string",
  "nickname": "string",
  "bio": "string",
  "email": "string",
  "socialLinks": []
}
```

**响应**:
与请求参数相同的JSON对象

### 获取高级设置

- **URL**: `/api/settings/advanced`
- **方法**: `GET`
- **描述**: 获取网站高级设置
- **认证**: 需要Bearer Token (管理员权限)

**响应**:

```json
{
  "analytics": {},
  "customHead": "string",
  "customFooter": "string",
  "seo": {},
  "cdn": {}
}
```

### 更新高级设置

- **URL**: `/api/settings/advanced`
- **方法**: `PUT`
- **描述**: 更新网站高级设置
- **认证**: 需要Bearer Token (管理员权限)

**请求参数**:

```json
{
  "analytics": {},
  "customHead": "string",
  "customFooter": "string",
  "seo": {},
  "cdn": {}
}
```

**响应**:
与请求参数相同的JSON对象

## 友情链接

### 获取友情链接列表

- **URL**: `/api/friend-links`
- **方法**: `GET`
- **描述**: 获取所有友情链接

**响应**:

```json
[
  {
    "id": "string",
    "name": "string",
    "url": "string",
    "icon": "string",
    "description": "string",
    "status": "string",
    "created_at": "string"
  }
]
```

### 创建友情链接

- **URL**: `/api/friend-links`
- **方法**: `POST`
- **描述**: 创建新的友情链接
- **认证**: 需要Bearer Token (管理员权限)

**请求参数**:

```json
{
  "name": "string",
  "url": "string",
  "icon": "string",
  "description": "string"
}
```

**响应**:

```json
{
  "id": "string",
  "name": "string",
  "url": "string",
  "icon": "string",
  "description": "string",
  "status": "string",
  "created_at": "string"
}
```

### 更新友情链接

- **URL**: `/api/friend-links/{link_id}`
- **方法**: `PUT`
- **描述**: 更新指定ID的友情链接
- **认证**: 需要Bearer Token (管理员权限)

**路径参数**:

- `link_id`: 友情链接ID

**请求参数**:

```json
{
  "name": "string",
  "url": "string",
  "icon": "string",
  "description": "string",
  "status": "string"
}
```

**响应**:

```json
{
  "id": "string",
  "name": "string",
  "url": "string",
  "icon": "string",
  "description": "string",
  "status": "string",
  "created_at": "string"
}
```

### 删除友情链接

- **URL**: `/api/friend-links/{link_id}`
- **方法**: `DELETE`
- **描述**: 删除指定ID的友情链接
- **认证**: 需要Bearer Token (管理员权限)

**路径参数**:

- `link_id`: 友情链接ID

**响应**:

```json
{
  "message": "删除成功"
}
```

## 搜索功能

### 搜索文章

- **URL**: `/api/search`
- **方法**: `GET`
- **描述**: 搜索文章

**查询参数**:

- `q`: 搜索关键词 (必填)
- `category` (可选): 按分类筛选
- `tag` (可选): 按标签筛选

**响应**:

```json
[
  {
    "id": "string",
    "title": "string",
    "content": "string",
    "description": "string",
    "category": "string",
    "tags": ["string"],
    "status": "string",
    "author": "string",
    "views": 0,
    "publishDate": "string",
    "updateTime": "string",
    "coverImage": "string",
    "commentCount": 0
  }
]
```

## 用户管理

### 更新用户角色

- **URL**: `/api/users/{username}/role`
- **方法**: `PUT`
- **描述**: 更新指定用户的角色
- **认证**: 需要Bearer Token (管理员权限)

**路径参数**:

- `username`: 用户名

**查询参数**:

- `role`: 新角色 (admin, editor, user)

**响应**:

```json
{
  "message": "User role updated to {role}"
}
```

## 认证说明

需要认证的API请求应在HTTP头部包含以下认证信息：

```
Authorization: Bearer {token}
```

其中`{token}`是通过登录API获取的访问令牌。

## 错误响应

当API请求失败时，将返回相应的HTTP状态码和错误信息：

```json
{
  "detail": "错误描述信息"
}
```

常见HTTP状态码：

- `400 Bad Request`: 请求参数错误
- `401 Unauthorized`: 未认证或认证失败
- `403 Forbidden`: 权限不足
- `404 Not Found`: 资源不存在
- `500 Internal Server Error`: 服务器内部错误

## 权限说明

系统定义了三种用户角色，每种角色拥有不同的权限：

- `admin`: 管理员，拥有所有权限
  - 创建/编辑/删除文章
  - 管理用户
  - 管理分类和标签
  - 点赞和评论
  - 更新个人资料
  - 管理系统设置
  - 管理友情链接

- `editor`: 编辑，拥有内容管理权限
  - 创建/编辑文章
  - 点赞和评论
  - 更新个人资料

- `user`: 普通用户，拥有基本交互权限
  - 点赞和评论
  - 更新个人资料

## 测试账号

系统初始化时会创建一个默认管理员账号：

- 用户名: test
- 密码: password
- 角色: admin

可以使用此账号进行API测试。