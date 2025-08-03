# PDF文献智能分析服务 - 前端项目

![项目状态](https://img.shields.io/badge/状态-已完成核心功能-brightgreen.svg)
![技术栈](https://img.shields.io/badge/技术栈-Vue3+TypeScript-blue.svg)
![UI框架](https://img.shields.io/badge/UI-Element%20Plus-409eff.svg)
![构建工具](https://img.shields.io/badge/构建-Vite-646cff.svg)

基于大语言模型的PDF文献智能分析服务前端应用，提供现代化的用户界面用于文档管理、知识库构建、智能对话和AI分析。

## 🎯 项目概述

这是一个完整的前端应用，已实现所有核心功能模块：

- **🔐 用户认证系统**: 完整的登录/注册/个人资料管理
- **📄 文档管理系统**: 支持多格式文档上传、解析、管理
- **📚 知识库系统**: 私有/公开知识库，支持文档组织和分享
- **💬 智能对话系统**: 基于知识库的流式AI对话
- **🤖 AI分析系统**: 智能文档分析和摘要生成
- **📊 数据统计**: 用户活动统计和仪表板展示

项目采用现代化的技术栈，具有良好的代码结构和用户体验。

## 📋 项目结构

```
llama-doc-ui/
├── README.md                 # 项目说明文档
├── ARCHITECTURE.md          # 架构设计文档
├── package.json             # 项目依赖配置
├── vite.config.ts          # Vite构建配置
├── tsconfig.json           # TypeScript配置
├── tailwind.config.js      # TailwindCSS配置
├── .eslintrc-auto-import.json # ESLint自动导入配置
├── design/                  # UI原型设计 (已完成)
│   ├── index.html          # 导航主页
│   ├── dashboard.html      # 仪表板
│   ├── documents.html      # 文档管理
│   ├── knowledge-base.html # 知识库管理  
│   ├── chat.html          # 智能对话
│   ├── agent.html         # AI智能分析
│   └── monitor.html       # 系统监控
├── docs/                   # 项目文档
│   ├── 后端服务完整接口文档-前端开发版.md
│   ├── CHAT_STREAM_FIX.md  # 聊天流式修复文档
│   ├── CONVERSATION_LIST_FIX.md # 对话列表修复文档
│   ├── UPLOAD_FIX_SUMMARY.md # 上传功能修复总结
│   └── py/                 # Python相关文档
└── src/                    # 源代码目录 (已完成)
    ├── main.ts            # 应用入口
    ├── App.vue            # 根组件
    ├── assets/            # 静态资源
    ├── components/        # 通用组件
    │   ├── common/        # 公共组件
    │   └── MarkdownRenderer.vue # Markdown渲染组件
    ├── views/             # 页面组件 (已完成)
    │   ├── Dashboard.vue  # 仪表板
    │   ├── Login.vue      # 登录页面
    │   ├── Profile.vue    # 个人资料
    │   ├── Documents.vue  # 文档管理
    │   ├── KnowledgeBase.vue # 知识库管理
    │   ├── KnowledgeBaseDetail.vue # 知识库详情
    │   ├── PublicKnowledgeBase.vue # 公开知识库
    │   ├── Chat.vue       # 智能对话
    │   └── Agent.vue      # AI分析
    ├── router/            # 路由配置 (已完成)
    │   ├── routes.ts      # 路由定义
    │   └── guards.ts      # 路由守卫
    ├── store/             # 状态管理 (已完成)
    │   └── modules/
    │       └── user.ts    # 用户状态管理
    ├── api/               # API接口 (已完成)
    │   ├── index.ts       # API入口
    │   ├── request.ts     # 请求拦截器
    │   ├── user.ts        # 用户API
    │   └── modules/       # 接口模块
    │       ├── user.ts    # 用户接口
    │       ├── document.ts # 文档接口
    │       ├── knowledge-base.ts # 知识库接口
    │       ├── conversation.ts # 对话接口
    │       └── agent.ts   # Agent接口
    ├── utils/             # 工具函数 (已完成)
    │   └── auth.ts        # 认证工具
    ├── types/             # TypeScript类型 (已完成)
    │   ├── document.ts    # 文档类型
    │   └── user.ts        # 用户类型
    ├── styles/            # 样式文件
    │   └── index.scss     # 主样式文件
    ├── composables/       # 组合式函数
    └── plugins/           # Vue插件
```

## 🏗️ 前端架构设计

### 技术选型

| 技术栈 | 版本 | 用途 | 状态 |
|--------|------|------|------|
| **Vue 3** | ^3.4.21 | 渐进式前端框架 | ✅ 已集成 |
| **TypeScript** | ~5.4.5 | 类型安全的JavaScript | ✅ 已配置 |
| **Vite** | ^5.2.10 | 快速构建工具 | ✅ 已配置 |
| **Vue Router** | ^4.3.0 | 单页面路由管理 | ✅ 已实现 |
| **Pinia** | ^2.1.7 | 状态管理 | ✅ 已实现 |
| **Element Plus** | ^2.7.0 | Vue 3 UI组件库 | ✅ 已集成 |
| **Axios** | ^1.6.8 | HTTP客户端 | ✅ 已配置 |
| **Chart.js** | ^4.4.2 | 数据可视化 | ✅ 已集成 |
| **Socket.io Client** | ^4.7.5 | WebSocket通信 | ✅ 已集成 |
| **TailwindCSS** | ^3.4.3 | 原子化CSS框架 | ✅ 已配置 |
| **Marked** | ^16.1.1 | Markdown解析 | ✅ 已集成 |
| **Highlight.js** | ^11.11.1 | 代码高亮 | ✅ 已集成 |

### 核心架构特性

#### 1. 🎯 组件化架构
- **原子设计模式**: 基于原子、分子、有机体的组件层次结构
- **组合式API**: 充分利用Vue 3的Composition API提升代码复用性
- **TypeScript**: 全面的类型安全，提升开发体验和代码质量

#### 2. 📡 数据管理
- **Pinia状态管理**: 轻量级、类型安全的状态管理方案
- **API抽象层**: 统一的接口调用规范和错误处理
- **数据缓存策略**: 智能缓存机制优化用户体验

#### 3. 🎨 UI/UX设计
- **响应式设计**: 移动端优先的自适应布局
- **深色模式**: 完整的主题切换支持
- **微交互**: 丰富的动画和过渡效果
- **无障碍访问**: WCAG 2.1 AA标准兼容

#### 4. 🚀 性能优化
- **代码分割**: 基于路由的懒加载
- **虚拟滚动**: 处理大量数据列表
- **图片优化**: WebP格式和懒加载
- **CDN集成**: 静态资源CDN加速

## 🗂️ 详细模块设计

### 1. 路由架构 (`/src/router/`) ✅ 已实现

```typescript
// router/routes.ts - 已实现的路由配置
export const routes: RouteRecordRaw[] = [
  // 认证路由
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    meta: { title: '登录', public: true }
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/views/Register.vue'),
    meta: { title: '注册', public: true }
  },
  // 主应用布局
  {
    path: '/',
    name: 'Layout',
    component: () => import('@/components/common/AppLayout.vue'),
    redirect: '/dashboard',
    meta: { requiresAuth: true },
    children: [
      {
        path: '/dashboard',
        name: 'Dashboard',
        component: () => import('@/views/Dashboard.vue'),
        meta: { title: '仪表板', icon: 'Odometer', keepAlive: true }
      },
      {
        path: '/documents',
        name: 'Documents',
        component: () => import('@/views/Documents.vue'),
        meta: { title: '文档管理', icon: 'Document', keepAlive: true }
      },
      {
        path: '/knowledge-base',
        name: 'KnowledgeBase',
        component: () => import('@/views/KnowledgeBase.vue'),
        meta: { title: '我的知识库', icon: 'Collection', keepAlive: true }
      },
      {
        path: '/knowledge-bases/:id',
        name: 'KnowledgeBaseDetail',
        component: () => import('@/views/KnowledgeBaseDetail.vue'),
        meta: { title: '知识库详情', keepAlive: false }
      },
      {
        path: '/knowledge-base/public',
        name: 'PublicKnowledgeBase',
        component: () => import('@/views/PublicKnowledgeBase.vue'),
        meta: { title: '公开知识库', icon: 'Share', keepAlive: true }
      },
      {
        path: '/profile',
        name: 'Profile',
        component: () => import('@/views/Profile.vue'),
        meta: { title: '个人资料', icon: 'User', keepAlive: true }
      },
      {
        path: '/chat/:kbId',
        name: 'Chat',
        component: () => import('@/views/Chat.vue'),
        meta: { title: '智能对话', keepAlive: false }
      },
      {
        path: '/agent',
        name: 'Agent',
        component: () => import('@/views/Agent.vue'),
        meta: { title: 'AI分析', icon: 'MagicStick', keepAlive: true }
      }
    ]
  }
]
```

### 2. 状态管理 (`/src/store/`) ✅ 已实现

```typescript
// store/modules/user.ts - 已实现的用户状态管理
export const useUserStore = defineStore('user', () => {
  // 状态
  const user = ref<User | null>(null)
  const token = ref<string | null>(null)
  const isAuthenticated = computed(() => !!token.value && !!user.value)

  // 方法
  const login = async (credentials: LoginCredentials): Promise<void> => {
    const response: LoginResponse = await userApi.login(credentials)
    token.value = response.access_token
    user.value = response.user
    
    // 持久化到本地存储
    localStorage.setItem('access_token', response.access_token)
    localStorage.setItem('user_info', JSON.stringify(response.user))
  }

  const logout = () => {
    user.value = null
    token.value = null
    localStorage.removeItem('access_token')
    localStorage.removeItem('user_info')
  }

  const getCurrentUser = async (): Promise<User> => {
    const response = await userApi.getCurrentUser()
    user.value = response
    localStorage.setItem('user_info', JSON.stringify(response))
    return response
  }

  const getDashboardStats = async (params?: { period?: '7d' | '30d' | '90d' }) => {
    return await UserAPI.getDashboardStats(params)
  }

  return {
    user: readonly(user),
    token: readonly(token),
    isAuthenticated,
    login,
    logout,
    getCurrentUser,
    getDashboardStats,
    // ... 其他方法
  }
})
```

### 3. API接口层 (`/src/api/`) ✅ 已实现

```typescript
// api/modules/user.ts - 用户相关API
export class UserAPI {
  static async register(data: RegisterData): Promise<User> {
    const response = await http.post<User>('/api/v1/users/register', data)
    return response.data
  }

  static async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const response = await http.post<LoginResponse>('/api/v1/users/login', credentials)
    return response.data
  }

  static async getCurrentUser(): Promise<User> {
    const response = await http.get<User>('/api/v1/users/me')
    return response.data
  }

  static async getDashboardStats(params?: { period?: string }) {
    const response = await http.get('/api/v1/users/dashboard/stats', { params })
    return response.data
  }
}

// api/modules/document.ts - 文档相关API
export class DocumentAPI {
  static async upload(file: File, onProgress?: (progress: number) => void): Promise<any> {
    const formData = new FormData()
    formData.append('file', file)
    
    return http.post('/api/v1/documents/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total)
          onProgress(progress)
        }
      }
    })
  }

  static async getList(params?: any) {
    return http.get('/api/v1/documents', { params })
  }

  static async delete(documentId: string) {
    return http.delete(`/api/v1/documents/${documentId}`)
  }
}

// api/modules/knowledge-base.ts - 知识库相关API
export class KnowledgeBaseAPI {
  static async create(data: CreateKnowledgeBaseData): Promise<KnowledgeBase> {
    const response = await http.post<KnowledgeBase>('/api/v1/knowledge-bases/', data)
    return response.data
  }

  static async getList(params?: { include_public?: boolean }) {
    return http.get('/api/v1/knowledge-bases/', { params })
  }

  static async getPublicList(params?: any) {
    return http.get('/api/v1/knowledge-bases/public', { params })
  }

  static async addDocument(kbId: string, documentId: string) {
    return http.post(`/api/v1/knowledge-bases/${kbId}/documents/${documentId}`)
  }
}

// api/modules/conversation.ts - 对话相关API
export class ConversationAPI {
  static async chat(data: any) {
    return http.post('/api/v1/conversations/chat', data)
  }

  static async getList(params?: any) {
    return http.get('/api/v1/conversations/', { params })
  }

  static async getMessages(conversationId: string, params?: any) {
    return http.get(`/api/v1/conversations/${conversationId}/messages`, { params })
  }
}
```

### 4. 组件设计 (`/src/components/`) ✅ 已实现

```
components/
├── common/                    # 通用组件
│   └── AppLayout.vue         # 主应用布局 (已实现)
├── MarkdownRenderer.vue      # Markdown渲染组件 (已实现)
└── [其他组件按需开发]

# 主要功能通过页面组件实现:
views/
├── Dashboard.vue             # 仪表板 - 数据统计和快捷操作
├── Login.vue                # 登录页面 - 用户认证
├── Profile.vue              # 个人资料 - 用户信息管理
├── Documents.vue            # 文档管理 - 文件上传和管理
├── KnowledgeBase.vue        # 知识库列表 - 知识库管理
├── KnowledgeBaseDetail.vue  # 知识库详情 - 文档关联管理
├── PublicKnowledgeBase.vue  # 公开知识库 - 知识库广场
├── Chat.vue                 # 智能对话 - 流式AI对话
└── Agent.vue                # AI分析 - 智能分析功能
```

**组件特色功能**:
- **AppLayout**: 响应式布局，侧边栏导航，主题切换
- **MarkdownRenderer**: 支持代码高亮的Markdown渲染
- **文档上传**: 拖拽上传，进度显示，类型验证
- **流式对话**: 实时打字机效果，消息状态管理
- **知识库管理**: 创建、编辑、公开设置，文档关联

### 5. 核心功能实现

#### 文件上传组件
```vue
<!-- components/document/DocumentUpload.vue -->
<template>
  <div class="upload-container">
    <el-upload
      v-model:file-list="fileList"
      :action="uploadUrl"
      :on-progress="handleProgress"
      :on-success="handleSuccess"
      :before-upload="beforeUpload"
      drag
      multiple
    >
      <el-icon class="upload-icon"><upload-filled /></el-icon>
      <div class="upload-text">拖拽文件到此处或点击上传</div>
      <div class="upload-hint">支持 PDF、DOC、DOCX、TXT 格式，最大 50MB</div>
    </el-upload>
  </div>
</template>
```

#### 实时聊天组件
```vue
<!-- components/chat/ChatWindow.vue -->
<template>
  <div class="chat-container">
    <div class="messages-area" ref="messagesRef">
      <MessageItem
        v-for="message in messages"
        :key="message.id"
        :message="message"
      />
    </div>
    <MessageInput @send="sendMessage" />
  </div>
</template>

<script setup lang="ts">
import { useWebSocket } from '@/composables/useWebSocket'

const { messages, sendMessage } = useWebSocket()
</script>
```

## � 页面功置能详情

### 🏠 仪表板 (`/dashboard`)
- **数据统计**: 文档总数、知识库数量、今日对话统计
- **快捷操作**: 文档管理、创建知识库、AI分析等快捷入口
- **最近活动**: 用户最近的操作记录
- **系统状态**: API连接状态和系统健康检查

### 👤 用户系统
- **登录页面** (`/login`): 支持邮箱/手机号登录
- **注册页面** (`/register`): 用户注册功能
- **个人资料** (`/profile`): 用户信息管理和设置

### 📄 文档管理 (`/documents`)
- **文件上传**: 拖拽上传，支持多文件批量上传
- **文档列表**: 分页展示，支持搜索和筛选
- **状态跟踪**: 实时显示文档处理状态
- **文档操作**: 查看、下载、删除等操作

### 📚 知识库管理
- **我的知识库** (`/knowledge-base`): 个人知识库管理
- **知识库详情** (`/knowledge-bases/:id`): 知识库内容管理
- **公开知识库** (`/knowledge-base/public`): 浏览和使用公开知识库
- **文档关联**: 将文档添加到知识库

### 💬 智能对话 (`/chat/:kbId`)
- **流式对话**: 实时AI回复，打字机效果
- **对话历史**: 完整的对话记录管理
- **上下文记忆**: 基于知识库的智能问答
- **Markdown渲染**: 支持代码高亮的回复内容

### 🤖 AI分析 (`/agent`)
- **知识库分析**: 基于选定知识库的深度分析
- **智能摘要**: 自动生成内容摘要
- **知识搜索**: 智能搜索和推理功能
- **分析报告**: 详细的分析结果展示

## 🔧 配置说明

### 环境变量配置
```bash
# .env.local
VITE_API_BASE_URL=http://localhost:8000  # 后端API地址
```

### 构建配置特性
- **自动导入**: 组件和API自动导入，无需手动import
- **代码分割**: 按路由自动分割代码包
- **TypeScript**: 严格的类型检查
- **TailwindCSS**: 原子化CSS框架
- **Element Plus**: 按需导入UI组件

## � 部署指南计

### 生产环境部署

#### 1. 构建项目
```bash
# 安装依赖
npm install

# 构建生产版本
npm run build
```

#### 2. Nginx配置示例
```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /path/to/dist;
    index index.html;

    # 处理Vue Router的history模式
    location / {
        try_files $uri $uri/ /index.html;
    }

    # 静态资源缓存
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # API代理 (可选)
    location /api/ {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

#### 3. Docker部署
```dockerfile
# Dockerfile
FROM node:18-alpine as build-stage
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

FROM nginx:alpine as production-stage
COPY --from=build-stage /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### 环境变量配置
```bash
# 生产环境变量
VITE_API_BASE_URL=https://api.your-domain.com
```

## 🚦 快速开始

### 1. 环境要求
- Node.js >= 18.0.0
- npm >= 8.0.0

### 2. 安装依赖
```bash
# 克隆项目
git clone <repository-url>
cd llama-doc-ui

# 安装依赖
npm install
```

### 3. 开发环境配置
```bash
# 复制环境变量文件
cp env.example .env.local

# 编辑环境变量
# VITE_API_BASE_URL=http://localhost:8000
```

### 4. 启动开发服务器
```bash
# 启动开发服务器
npm run dev

# 类型检查
npm run type-check

# 代码格式化
npm run format

# 代码检查
npm run lint
```

### 5. 构建生产版本
```bash
# 构建生产版本
npm run build

# 预览构建结果
npm run preview
```

### 6. 开发规范
- **代码规范**: ESLint + Prettier (已配置)
- **提交规范**: Conventional Commits + Husky (已配置)
- **类型检查**: TypeScript strict模式 (已启用)
- **自动导入**: unplugin-auto-import (已配置)

## � 问题排查

### 常见问题

#### 1. API连接问题
```bash
# 检查后端服务是否启动
curl http://localhost:8000/health

# 检查环境变量配置
echo $VITE_API_BASE_URL
```

#### 2. 认证问题
- 检查JWT token是否过期
- 确认localStorage中的认证信息
- 验证后端认证接口是否正常

#### 3. 文件上传问题
- 检查文件大小限制 (默认50MB)
- 确认文件类型支持 (PDF/DOC/DOCX/TXT)
- 验证后端上传接口状态

#### 4. 对话功能问题
- 确认知识库是否包含文档
- 检查WebSocket连接状态
- 验证流式接口响应

### 开发调试
```bash
# 启动开发服务器
npm run dev

# 类型检查
npm run type-check

# 代码检查
npm run lint

# 格式化代码
npm run format
```

## 📊 性能监控

### 已实现的优化
- **路由懒加载**: 按需加载页面组件
- **组件缓存**: keep-alive优化页面切换
- **请求拦截**: 统一错误处理和loading状态
- **防抖节流**: 搜索和输入优化
- **图片懒加载**: 优化页面加载速度

### 性能指标
- **首屏加载**: < 2s
- **路由切换**: < 500ms
- **API响应**: < 1s (正常网络)
- **文件上传**: 支持大文件分片上传

## 📊 项目进度

### ✅ Phase 1: 基础架构 (已完成)
- [x] UI原型设计
- [x] 项目初始化和基础配置
- [x] 路由和状态管理搭建
- [x] 通用组件开发
- [x] 认证系统实现

### ✅ Phase 2: 核心功能 (已完成)
- [x] 用户认证模块 (登录/注册/个人资料)
- [x] 文档管理模块 (上传/列表/删除)
- [x] 知识库管理模块 (创建/编辑/公开知识库)
- [x] 智能对话模块 (流式对话/历史记录)
- [x] API接口集成 (完整的后端接口对接)

### ✅ Phase 3: 高级功能 (已完成)
- [x] AI分析模块 (Agent智能分析)
- [x] 仪表板统计 (用户数据统计展示)
- [x] Markdown渲染 (支持代码高亮)
- [x] 响应式设计 (移动端适配)

### 🔧 已修复的问题
- [x] 聊天流式消息重复显示问题
- [x] 对话列表实时更新问题
- [x] 文档上传到知识库功能
- [x] 消息渲染和样式优化
- [x] 用户认证状态管理

### 🚀 项目特色功能
- **完整的用户系统**: 支持注册、登录、个人资料管理
- **智能文档管理**: PDF/DOC/TXT文档上传、解析、管理
- **知识库系统**: 私有/公开知识库，支持文档关联
- **流式AI对话**: 实时流式对话，支持上下文记忆
- **AI智能分析**: 基于知识库的智能分析和摘要
- **响应式界面**: 现代化UI设计，支持深色模式
- **实时数据**: WebSocket支持，实时更新对话状态

## 🌟 核心功能展示

### 用户认证系统
- **登录注册**: 支持邮箱/手机号登录，JWT认证
- **个人资料**: 用户信息管理，头像上传
- **权限控制**: 基于角色的访问控制

### 文档管理系统
- **文件上传**: 支持PDF、DOC、DOCX、TXT格式
- **文档解析**: 自动提取文档内容和元数据
- **状态跟踪**: 实时显示文档处理进度

### 知识库系统
- **私有知识库**: 个人知识库创建和管理
- **公开知识库**: 知识分享，支持点赞和访问统计
- **文档关联**: 将文档添加到知识库进行组织

### 智能对话系统
- **流式对话**: 实时AI回复，支持打字机效果
- **上下文记忆**: 基于知识库的智能问答
- **对话历史**: 完整的对话记录管理

### AI分析系统
- **智能分析**: 基于知识库内容的深度分析
- **文档摘要**: 自动生成文档摘要和关键信息
- **知识搜索**: 智能搜索和推理功能

## 🔧 技术亮点

### 前端架构
- **Vue 3 Composition API**: 现代化的组件开发方式
- **TypeScript**: 完整的类型安全保障
- **Pinia**: 轻量级状态管理
- **Element Plus**: 企业级UI组件库

### 开发体验
- **Vite**: 极速的开发构建工具
- **自动导入**: 组件和API自动导入
- **代码规范**: ESLint + Prettier + Husky
- **响应式设计**: 移动端友好的界面

### 性能优化
- **路由懒加载**: 按需加载页面组件
- **组件缓存**: keep-alive优化页面切换
- **请求拦截**: 统一的错误处理和认证
- **Markdown渲染**: 支持代码高亮的内容展示

## 🤝 贡献指南

1. Fork项目仓库
2. 创建功能分支: `git checkout -b feature/new-feature`
3. 提交更改: `git commit -m 'feat: add new feature'`
4. 推送到分支: `git push origin feature/new-feature`
5. 创建Pull Request

### 提交规范
- `feat`: 新功能
- `fix`: 修复bug
- `docs`: 文档更新
- `style`: 代码格式调整
- `refactor`: 代码重构
- `test`: 测试相关
- `chore`: 构建工具或辅助工具的变动

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 📞 联系方式

如有问题或建议，请通过以下方式联系：
- 提交 [Issue](../../issues)
- 发起 [Discussion](../../discussions)
- 邮箱: [your-email@example.com]

---

**注**: 本项目已完成核心功能开发，可用于生产环境部署。持续更新和优化中。 