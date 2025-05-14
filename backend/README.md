# Vue Blog 后端 API

这是一个使用 FastAPI 构建的博客后端 API，为 Vue 前端提供数据服务。

## 功能特性

- 用户认证（登录/注册）
- JWT 令牌认证
- 文章管理（创建/编辑/删除/查询）
- 分类管理
- 标签管理
- 评论功能（发表评论、回复评论）
- 文件上传（博客封面图片）
- 搜索功能（按标题、内容、分类、标签）
- 用户权限管理

## 安装步骤

1. 确保已安装 Python 3.8 或更高版本

2. 安装依赖包

```bash
pip install -r requirements.txt
```

## 运行服务器

```bash
cd backend
python main.py
```

或者使用 uvicorn 直接运行：

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8080
```

服务器将在 http://localhost:8080 上运行

## API 文档

启动服务器后，可以访问以下地址查看自动生成的 API 文档：

- Swagger UI: http://localhost:8080/docs
- ReDoc: http://localhost:8080/redoc

## 测试账户

系统预设了一个测试账户：

- 用户名: test
- 密码: password
- 角色: admin

## 前后端集成

前端已配置代理，API 请求会自动转发到后端服务器。确保后端服务器运行在 8080 端口。