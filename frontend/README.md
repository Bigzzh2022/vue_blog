# Vue 博客前端

这是一个基于Vue 3和Vite构建的现代博客系统前端项目。

## 功能特性

- 响应式设计，适配各种设备屏幕尺寸
- 文章阅读、分类和标签浏览
- Markdown文章内容渲染
- 安全的外部链接处理
- 文章评论和分享功能
- 管理后台（文章、分类、标签和用户管理）
- 友链管理
- 时间线展示
- 暗色/亮色主题切换

## 技术栈

- Vue 3 - 渐进式JavaScript框架
- TypeScript - 添加静态类型的JavaScript超集
- Vite - 下一代前端构建工具
- Naive UI - 基于Vue 3的UI组件库
- Vue Router - Vue的官方路由
- Pinia - Vue的状态管理库
- Axios - 基于Promise的HTTP客户端

## 推荐IDE设置

[VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (并禁用Vetur).

## `.vue`导入的TypeScript类型支持

TypeScript默认无法处理`.vue`导入的类型信息，因此我们用`vue-tsc`替代`tsc`进行类型检查。在编辑器中，我们需要[Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar)来使TypeScript语言服务能够识别`.vue`类型。

## 自定义配置

请查看[Vite配置参考](https://vite.dev/config/)。

## 项目设置

```sh
npm install
```

### 开发环境编译和热重载

```sh
npm run dev
```

### 类型检查、编译和生产环境压缩

```sh
npm run build
```

## 项目结构

```
src/
├── assets/         # 静态资源
├── components/     # 可复用组件
├── directives/     # 自定义指令
├── router/         # 路由配置
├── stores/         # Pinia状态管理
├── utils/          # 工具函数
└── views/          # 页面组件
    └── admin/      # 管理后台页面
```
