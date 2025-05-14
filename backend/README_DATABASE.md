# Vue Blog 数据库设置指南

本文档提供了Vue Blog项目MySQL数据库的设置和使用说明。

## 数据库结构

该项目使用MySQL数据库，包含以下表：

- `users` - 用户信息
- `categories` - 文章分类
- `tags` - 文章标签
- `posts` - 博客文章
- `post_tags` - 文章和标签的多对多关系
- `comments` - 文章评论
- `friend_links` - 友情链接
- `recycle_bin` - 回收站

## 环境要求

- MySQL 5.7+
- Python 3.8+

## 设置步骤

### 1. 安装MySQL

请确保您已安装MySQL数据库服务器。

### 2. 配置环境变量

在`.env`文件中配置您的数据库连接信息：

```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_PORT=3306
DB_NAME=vue_blog
```

### 3. 安装依赖

```bash
pip install -r requirements.txt
```

### 4. 初始化数据库

有两种方式初始化数据库：

#### 方式一：使用SQL脚本

```bash
mysql -u root -p < database.sql
```

#### 方式二：使用Python脚本

```bash
python db_init.py
```

## 数据库模型

项目使用SQLAlchemy ORM进行数据库操作，数据模型定义在`database.py`文件中。

## 从假数据库迁移

项目最初使用内存中的假数据库进行开发。现在已经实现了MySQL数据库支持，但需要修改`main.py`文件中的API实现，将其从使用假数据库改为使用MySQL数据库。

## 数据库备份

可以使用以下命令备份数据库：

```bash
mysqldump -u root -p vue_blog > backup.sql
```

## 数据库恢复

可以使用以下命令恢复数据库：

```bash
mysql -u root -p vue_blog < backup.sql
```