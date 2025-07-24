# PDF文献智能分析服务 - 前端项目

![项目状态](https://img.shields.io/badge/状态-开发中-green.svg)
![技术栈](https://img.shields.io/badge/技术栈-Vue3+TypeScript-blue.svg)
![UI框架](https://img.shields.io/badge/UI-Element%20Plus-409eff.svg)

基于大语言模型的PDF文献智能分析服务前端应用，提供现代化的用户界面用于文档管理、知识库构建、智能对话和AI分析。

## 📋 目录结构

```
llama-doc-ui/
├── README.md                 # 项目说明文档
├── .gitignore               # Git忽略配置
├── design/                  # UI原型设计 (已完成)
│   ├── index.html          # 导航主页
│   ├── dashboard.html      # 仪表板
│   ├── documents.html      # 文档管理
│   ├── knowledge-base.html # 知识库管理  
│   ├── chat.html          # 智能对话
│   ├── agent.html         # AI智能分析
│   └── monitor.html       # 系统监控
├── docs/                   # 项目文档
│   └── 后端服务完整接口文档-前端开发版.md
└── src/                    # 源代码目录 (待开发)
    ├── main.ts            # 应用入口
    ├── App.vue            # 根组件
    ├── assets/            # 静态资源
    ├── components/        # 通用组件
    ├── views/             # 页面组件
    ├── router/            # 路由配置
    ├── store/             # 状态管理
    ├── api/               # API接口
    ├── utils/             # 工具函数
    ├── types/             # TypeScript类型
    └── styles/            # 样式文件
```

## 🏗️ 前端架构设计

### 技术选型

| 技术栈 | 版本 | 用途 |
|--------|------|------|
| **Vue 3** | ^3.4.0 | 渐进式前端框架 |
| **TypeScript** | ^5.0.0 | 类型安全的JavaScript |
| **Vite** | ^5.0.0 | 快速构建工具 |
| **Vue Router** | ^4.2.0 | 单页面路由管理 |
| **Pinia** | ^2.1.0 | 状态管理 |
| **Element Plus** | ^2.4.0 | Vue 3 UI组件库 |
| **Axios** | ^1.6.0 | HTTP客户端 |
| **Chart.js** | ^4.4.0 | 数据可视化 |
| **Socket.io Client** | ^4.7.0 | WebSocket通信 |
| **TailwindCSS** | ^3.3.0 | 原子化CSS框架 |

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

### 1. 路由架构 (`/src/router/`)

```typescript
// router/index.ts
const routes = [
  {
    path: '/',
    name: 'Dashboard',
    component: () => import('@/views/Dashboard.vue'),
    meta: { title: '仪表板', icon: 'dashboard' }
  },
  {
    path: '/documents',
    name: 'Documents',
    component: () => import('@/views/Documents.vue'),
    meta: { title: '文档管理', icon: 'document' }
  },
  {
    path: '/knowledge-base',
    name: 'KnowledgeBase',
    component: () => import('@/views/KnowledgeBase.vue'),
    meta: { title: '知识库', icon: 'database' }
  },
  {
    path: '/chat',
    name: 'Chat',
    component: () => import('@/views/Chat.vue'),
    meta: { title: '智能对话', icon: 'chat' }
  },
  {
    path: '/agent',
    name: 'Agent',
    component: () => import('@/views/Agent.vue'),
    meta: { title: 'AI分析', icon: 'robot' }
  },
  {
    path: '/monitor',
    name: 'Monitor',
    component: () => import('@/views/Monitor.vue'),
    meta: { title: '系统监控', icon: 'monitor' }
  }
]
```

### 2. 状态管理 (`/src/store/`)

```typescript
// store/modules/document.ts
export const useDocumentStore = defineStore('document', {
  state: () => ({
    documents: [] as Document[],
    currentDocument: null as Document | null,
    uploadProgress: {} as Record<string, number>,
    processingQueue: [] as ProcessingTask[]
  }),
  
  actions: {
    async uploadDocument(file: File) { /* ... */ },
    async getDocuments() { /* ... */ },
    async deleteDocument(id: string) { /* ... */ }
  }
})

// store/modules/knowledgeBase.ts
export const useKnowledgeBaseStore = defineStore('knowledgeBase', {
  state: () => ({
    knowledgeBases: [] as KnowledgeBase[],
    currentKB: null as KnowledgeBase | null,
    searchResults: [] as SearchResult[]
  }),
  
  actions: {
    async createKnowledgeBase(data: CreateKBRequest) { /* ... */ },
    async searchKnowledge(query: string) { /* ... */ }
  }
})
```

### 3. API接口层 (`/src/api/`)

```typescript
// api/document.ts
export class DocumentAPI {
  static async upload(file: File): Promise<UploadResponse> {
    const formData = new FormData()
    formData.append('file', file)
    
    return await request.post('/api/v1/documents/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  }
  
  static async getStatus(documentId: string): Promise<DocumentStatus> {
    return await request.get(`/api/v1/documents/${documentId}/status`)
  }
}

// api/chat.ts
export class ChatAPI {
  static async sendMessage(data: ChatRequest): Promise<ChatResponse> {
    return await request.post('/api/v1/conversations/chat', data)
  }
  
  static streamChat(data: ChatRequest): EventSource {
    return new EventSource(`/api/v1/conversations/chat/stream?${qs.stringify(data)}`)
  }
}
```

### 4. 组件设计 (`/src/components/`)

```
components/
├── common/                 # 通用组件
│   ├── AppHeader.vue      # 应用头部
│   ├── AppSidebar.vue     # 侧边栏导航
│   ├── ThemeToggle.vue    # 主题切换
│   └── LoadingSpinner.vue # 加载动画
├── document/              # 文档相关组件
│   ├── DocumentUpload.vue # 文档上传
│   ├── DocumentList.vue   # 文档列表
│   └── DocumentCard.vue   # 文档卡片
├── chat/                  # 对话相关组件
│   ├── ChatWindow.vue     # 聊天窗口
│   ├── MessageItem.vue    # 消息条目
│   └── MessageInput.vue   # 消息输入
└── monitor/               # 监控相关组件
    ├── MetricChart.vue    # 指标图表
    ├── StatusCard.vue     # 状态卡片
    └── LogViewer.vue      # 日志查看器
```

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

## 🔧 开发配置

### 环境配置

```typescript
// .env.development
VITE_API_BASE_URL=http://localhost:8000
VITE_WS_URL=ws://localhost:8000/ws
VITE_UPLOAD_MAX_SIZE=52428800

// .env.production  
VITE_API_BASE_URL=https://api.yourdomain.com
VITE_WS_URL=wss://api.yourdomain.com/ws
VITE_UPLOAD_MAX_SIZE=52428800
```

### 构建配置

```typescript
// vite.config.ts
export default defineConfig({
  plugins: [
    vue(),
    Components({
      resolvers: [ElementPlusResolver()],
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['vue', 'vue-router', 'pinia'],
          ui: ['element-plus'],
          charts: ['chart.js'],
        },
      },
    },
  },
})
```

## 📱 响应式设计策略

### 断点设计
```scss
// styles/breakpoints.scss
$breakpoints: (
  'mobile': 320px,
  'tablet': 768px,
  'desktop': 1024px,
  'wide': 1440px
);

// 组件响应式示例
.document-grid {
  @apply grid gap-4;
  
  @screen mobile {
    @apply grid-cols-1;
  }
  
  @screen tablet {
    @apply grid-cols-2;
  }
  
  @screen desktop {
    @apply grid-cols-3;
  }
}
```

## 🎨 主题系统

### CSS变量定义
```scss
// styles/themes.scss
:root {
  // 浅色主题
  --color-primary: #3b82f6;
  --color-bg: #ffffff;
  --color-text: #1f2937;
  --color-border: #e5e7eb;
}

[data-theme="dark"] {
  // 深色主题
  --color-primary: #60a5fa;
  --color-bg: #111827;
  --color-text: #f9fafb;
  --color-border: #374151;
}
```

## 🚦 开发流程

### 1. 初始化项目
```bash
# 创建Vue 3 + TypeScript项目
npm create vue@latest .
cd llama-doc-ui
npm install

# 安装UI框架和工具库
npm install element-plus @element-plus/icons-vue
npm install axios pinia vue-router@4
npm install chart.js vue-chartjs
npm install socket.io-client
npm install tailwindcss @tailwindcss/typography
```

### 2. 开发规范
- **代码规范**: ESLint + Prettier
- **提交规范**: Conventional Commits
- **类型检查**: TypeScript strict模式
- **测试覆盖**: Jest + Vue Test Utils

### 3. 部署策略
- **开发环境**: Vite dev server
- **测试环境**: Docker容器化部署
- **生产环境**: Nginx + CDN加速

## 📈 性能优化

### 1. 包体积优化
- Tree shaking减少无用代码
- 按需导入UI组件
- 图片资源压缩和WebP格式

### 2. 运行时优化
- 虚拟滚动处理大数据列表
- 防抖节流优化用户交互
- Web Worker处理CPU密集任务

### 3. 网络优化
- HTTP/2服务器推送
- 资源预加载和预连接
- ServiceWorker离线缓存

## 🔒 安全考虑

- XSS防护: 内容安全策略
- CSRF防护: Token验证
- 文件上传安全: 类型和大小限制
- API安全: 请求签名和速率限制

## 🧪 测试策略

```typescript
// tests/unit/DocumentUpload.spec.ts
describe('DocumentUpload', () => {
  it('should upload file successfully', async () => {
    const wrapper = mount(DocumentUpload)
    const file = new File(['test'], 'test.pdf', { type: 'application/pdf' })
    
    await wrapper.vm.handleUpload(file)
    
    expect(wrapper.emitted('success')).toBeTruthy()
  })
})
```

## 📊 项目规划

### Phase 1: 基础架构 (2周)
- [x] UI原型设计
- [ ] 项目初始化和基础配置
- [ ] 路由和状态管理搭建
- [ ] 通用组件开发

### Phase 2: 核心功能 (4周)
- [ ] 文档管理模块
- [ ] 知识库管理模块
- [ ] 智能对话模块
- [ ] API接口集成

### Phase 3: 高级功能 (3周)
- [ ] AI分析模块
- [ ] 系统监控模块
- [ ] 性能优化
- [ ] 测试和部署

## 🤝 贡献指南

1. Fork项目仓库
2. 创建功能分支: `git checkout -b feature/new-feature`
3. 提交更改: `git commit -m 'Add new feature'`
4. 推送到分支: `git push origin feature/new-feature`
5. 创建Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

---

**注**: 本文档会随着项目进展持续更新。如有问题或建议，请提交Issue或联系项目维护者。 