# 前端架构设计文档

## 🏗️ 总体架构

### 技术栈概览
```
┌─────────────────────────────────────────────────────────────┐
│                     前端应用架构                              │
├─────────────────────────────────────────────────────────────┤
│  Vue 3 + TypeScript + Composition API                      │
├─────────────────────────────────────────────────────────────┤
│  状态管理: Pinia                                              │
│  路由管理: Vue Router 4                                      │
│  UI框架: Element Plus + TailwindCSS                        │
│  构建工具: Vite 5                                            │
│  HTTP客户端: Axios                                           │
│  实时通信: Socket.io                                         │
│  图表库: Chart.js                                           │
├─────────────────────────────────────────────────────────────┤
│  开发工具: ESLint + Prettier + Husky                       │
│  测试框架: Vitest + Cypress                                │
│  类型检查: TypeScript                                       │
└─────────────────────────────────────────────────────────────┘
```

## 📁 目录结构设计

```
src/
├── main.ts                 # 应用入口文件
├── App.vue                 # 根组件
├── assets/                 # 静态资源
│   ├── images/            # 图片资源
│   ├── icons/             # 图标文件
│   └── fonts/             # 字体文件
├── components/            # 通用组件
│   ├── common/            # 公共组件
│   │   ├── AppHeader.vue
│   │   ├── AppSidebar.vue
│   │   ├── AppFooter.vue
│   │   ├── ThemeToggle.vue
│   │   └── LoadingSpinner.vue
│   ├── document/          # 文档相关组件
│   │   ├── DocumentUpload.vue
│   │   ├── DocumentList.vue
│   │   ├── DocumentCard.vue
│   │   └── DocumentViewer.vue
│   ├── chat/              # 聊天相关组件
│   │   ├── ChatWindow.vue
│   │   ├── MessageItem.vue
│   │   ├── MessageInput.vue
│   │   └── ConversationList.vue
│   ├── knowledge/         # 知识库组件
│   │   ├── KnowledgeCard.vue
│   │   ├── KnowledgeForm.vue
│   │   └── KnowledgeSearch.vue
│   ├── agent/             # AI分析组件
│   │   ├── AnalysisPanel.vue
│   │   ├── ResultDisplay.vue
│   │   └── AgentStatus.vue
│   └── monitor/           # 监控组件
│       ├── MetricChart.vue
│       ├── StatusCard.vue
│       ├── LogViewer.vue
│       └── SystemInfo.vue
├── views/                 # 页面组件
│   ├── Dashboard.vue      # 仪表板
│   ├── Documents.vue      # 文档管理
│   ├── KnowledgeBase.vue  # 知识库管理
│   ├── Chat.vue          # 智能对话
│   ├── Agent.vue         # AI分析
│   ├── Monitor.vue       # 系统监控
│   └── NotFound.vue      # 404页面
├── router/               # 路由配置
│   ├── index.ts          # 主路由文件
│   ├── guards.ts         # 路由守卫
│   └── routes.ts         # 路由定义
├── store/                # 状态管理
│   ├── index.ts          # Store入口
│   └── modules/          # 模块化Store
│       ├── app.ts        # 应用全局状态
│       ├── user.ts       # 用户状态
│       ├── document.ts   # 文档状态
│       ├── knowledge.ts  # 知识库状态
│       ├── chat.ts       # 对话状态
│       ├── agent.ts      # Agent状态
│       └── monitor.ts    # 监控状态
├── api/                  # API接口
│   ├── index.ts          # API入口
│   ├── request.ts        # 请求拦截器
│   └── modules/          # 接口模块
│       ├── document.ts   # 文档接口
│       ├── knowledge.ts  # 知识库接口
│       ├── chat.ts       # 对话接口
│       ├── agent.ts      # Agent接口
│       └── monitor.ts    # 监控接口
├── utils/                # 工具函数
│   ├── index.ts          # 工具函数入口
│   ├── format.ts         # 格式化工具
│   ├── validate.ts       # 验证工具
│   ├── storage.ts        # 存储工具
│   ├── file.ts           # 文件工具
│   ├── websocket.ts      # WebSocket工具
│   └── constants.ts      # 常量定义
├── types/                # TypeScript类型
│   ├── index.ts          # 类型入口
│   ├── api.ts            # API类型
│   ├── document.ts       # 文档类型
│   ├── knowledge.ts      # 知识库类型
│   ├── chat.ts           # 对话类型
│   ├── agent.ts          # Agent类型
│   └── monitor.ts        # 监控类型
├── styles/               # 样式文件
│   ├── index.scss        # 样式入口
│   ├── variables.scss    # 变量定义
│   ├── mixins.scss       # 混入函数
│   ├── components.scss   # 组件样式
│   ├── utilities.scss    # 工具类
│   └── themes/           # 主题样式
│       ├── light.scss    # 浅色主题
│       └── dark.scss     # 深色主题
├── composables/          # 组合式函数
│   ├── useTheme.ts       # 主题管理
│   ├── useWebSocket.ts   # WebSocket
│   ├── useUpload.ts      # 文件上传
│   ├── useChat.ts        # 聊天功能
│   ├── useAgent.ts       # Agent功能
│   └── useMonitor.ts     # 监控功能
└── plugins/              # Vue插件
    ├── element-plus.ts   # Element Plus配置
    ├── chart.ts          # Chart.js配置
    └── socket.ts         # Socket.io配置
```

## 🔧 核心模块设计

### 1. 状态管理架构 (Pinia)

```typescript
// store/modules/document.ts
export const useDocumentStore = defineStore('document', {
  state: (): DocumentState => ({
    documents: [],
    currentDocument: null,
    uploadProgress: {},
    processingQueue: [],
    filters: {
      status: 'all',
      type: 'all',
      keyword: ''
    },
    pagination: {
      page: 1,
      size: 20,
      total: 0
    }
  }),

  getters: {
    filteredDocuments: (state) => {
      return state.documents.filter(doc => {
        // 过滤逻辑
      })
    },
    
    processingCount: (state) => {
      return state.documents.filter(doc => doc.status === 'processing').length
    }
  },

  actions: {
    async uploadDocument(file: File) {
      // 上传逻辑
    },
    
    async fetchDocuments(params?: QueryParams) {
      // 获取文档列表
    },
    
    async deleteDocument(id: string) {
      // 删除文档
    },
    
    updateUploadProgress(fileId: string, progress: number) {
      this.uploadProgress[fileId] = progress
    }
  }
})
```

### 2. API接口设计

```typescript
// api/modules/document.ts
export class DocumentAPI {
  // 上传文档
  static async upload(
    file: File, 
    onProgress?: (progress: number) => void
  ): Promise<UploadResponse> {
    const formData = new FormData()
    formData.append('file', file)
    
    return request.post('/api/v1/documents/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (progressEvent) => {
        const progress = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        )
        onProgress?.(progress)
      }
    })
  }

  // 获取文档状态
  static async getStatus(documentId: string): Promise<DocumentStatus> {
    return request.get(`/api/v1/documents/${documentId}/status`)
  }

  // 获取文档列表
  static async getList(params: DocumentQuery): Promise<DocumentListResponse> {
    return request.get('/api/v1/documents', { params })
  }

  // 删除文档
  static async delete(documentId: string): Promise<void> {
    return request.delete(`/api/v1/documents/${documentId}`)
  }

  // 下载文档
  static async getDownloadUrl(documentId: string): Promise<DownloadResponse> {
    return request.get(`/api/v1/documents/${documentId}/download`)
  }
}
```

### 3. 组件设计原则

#### 3.1 原子组件 (Atoms)
```vue
<!-- components/common/LoadingSpinner.vue -->
<template>
  <div class="loading-spinner" :class="sizeClass">
    <div class="spinner" :style="{ borderColor: color }"></div>
    <span v-if="text" class="loading-text">{{ text }}</span>
  </div>
</template>

<script setup lang="ts">
interface Props {
  size?: 'small' | 'medium' | 'large'
  color?: string
  text?: string
}

const props = withDefaults(defineProps<Props>(), {
  size: 'medium',
  color: '#3b82f6'
})

const sizeClass = computed(() => `loading-spinner--${props.size}`)
</script>
```

#### 3.2 分子组件 (Molecules)
```vue
<!-- components/document/DocumentCard.vue -->
<template>
  <div class="document-card" :class="statusClass">
    <div class="document-header">
      <file-icon :type="document.fileType" />
      <h3 class="document-title">{{ document.filename }}</h3>
      <document-status :status="document.status" />
    </div>
    
    <div class="document-meta">
      <span class="document-size">{{ formatFileSize(document.fileSize) }}</span>
      <span class="document-date">{{ formatDate(document.uploadTime) }}</span>
    </div>
    
    <div class="document-actions">
      <el-button @click="onView" :disabled="!canView">
        <eye-icon />
        查看
      </el-button>
      <el-button @click="onDownload" :disabled="!canDownload">
        <download-icon />
        下载
      </el-button>
      <el-button @click="onDelete" type="danger" :disabled="!canDelete">
        <delete-icon />
        删除
      </el-button>
    </div>
  </div>
</template>
```

### 4. 路由架构

```typescript
// router/routes.ts
export const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Layout',
    component: () => import('@/components/common/AppLayout.vue'),
    redirect: '/dashboard',
    children: [
      {
        path: '/dashboard',
        name: 'Dashboard',
        component: () => import('@/views/Dashboard.vue'),
        meta: {
          title: '仪表板',
          icon: 'dashboard',
          keepAlive: true
        }
      },
      {
        path: '/documents',
        name: 'Documents',
        component: () => import('@/views/Documents.vue'),
        meta: {
          title: '文档管理',
          icon: 'document',
          keepAlive: true
        }
      },
      // ... 其他路由
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/NotFound.vue')
  }
]
```

### 5. 组合式函数设计

```typescript
// composables/useUpload.ts
export function useUpload() {
  const uploadProgress = ref<Record<string, number>>({})
  const uploadQueue = ref<File[]>([])
  const isUploading = ref(false)

  const uploadFile = async (file: File) => {
    const fileId = generateFileId(file)
    uploadProgress.value[fileId] = 0
    isUploading.value = true

    try {
      const response = await DocumentAPI.upload(file, (progress) => {
        uploadProgress.value[fileId] = progress
      })
      
      ElMessage.success('文件上传成功')
      return response
    } catch (error) {
      ElMessage.error('文件上传失败')
      throw error
    } finally {
      isUploading.value = false
      delete uploadProgress.value[fileId]
    }
  }

  const uploadMultiple = async (files: File[]) => {
    uploadQueue.value = [...files]
    const results = []
    
    for (const file of files) {
      try {
        const result = await uploadFile(file)
        results.push(result)
      } catch (error) {
        console.error('Upload failed:', error)
      }
    }
    
    uploadQueue.value = []
    return results
  }

  return {
    uploadProgress: readonly(uploadProgress),
    uploadQueue: readonly(uploadQueue),
    isUploading: readonly(isUploading),
    uploadFile,
    uploadMultiple
  }
}
```

## 🎨 主题系统设计

### CSS变量架构
```scss
// styles/themes/light.scss
:root {
  // 基础颜色
  --color-primary: #3b82f6;
  --color-secondary: #8b5cf6;
  --color-success: #22c55e;
  --color-warning: #f59e0b;
  --color-error: #ef4444;
  
  // 背景颜色
  --color-bg-primary: #ffffff;
  --color-bg-secondary: #f8fafc;
  --color-bg-tertiary: #f1f5f9;
  
  // 文本颜色
  --color-text-primary: #1f2937;
  --color-text-secondary: #6b7280;
  --color-text-tertiary: #9ca3af;
  
  // 边框颜色
  --color-border-primary: #e5e7eb;
  --color-border-secondary: #d1d5db;
  
  // 阴影
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}
```

### 主题切换逻辑
```typescript
// composables/useTheme.ts
export function useTheme() {
  const theme = ref<'light' | 'dark'>('light')
  const systemTheme = ref<'light' | 'dark'>('light')

  const toggleTheme = () => {
    theme.value = theme.value === 'light' ? 'dark' : 'light'
    updateTheme()
  }

  const updateTheme = () => {
    document.documentElement.setAttribute('data-theme', theme.value)
    localStorage.setItem('theme', theme.value)
  }

  const initTheme = () => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    
    systemTheme.value = prefersDark ? 'dark' : 'light'
    theme.value = savedTheme || systemTheme.value
    
    updateTheme()
  }

  return {
    theme: readonly(theme),
    systemTheme: readonly(systemTheme),
    toggleTheme,
    initTheme
  }
}
```

## 🔄 数据流架构

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│    View     │───▶│   Action    │───▶│   API Call  │
│             │    │             │    │             │
└─────────────┘    └─────────────┘    └─────────────┘
        ▲                                      │
        │                                      ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  Component  │◀───│    Store    │◀───│  Response   │
│   Update    │    │   Mutation  │    │             │
└─────────────┘    └─────────────┘    └─────────────┘
```

## 🚀 性能优化策略

### 1. 代码分割
```typescript
// 路由懒加载
const routes = [
  {
    path: '/documents',
    component: () => import('@/views/Documents.vue')
  }
]

// 组件懒加载
const AsyncComponent = defineAsyncComponent(() => import('@/components/HeavyComponent.vue'))
```

### 2. 虚拟滚动
```vue
<template>
  <virtual-list
    :data-key="'id'"
    :data-sources="documents"
    :data-component="DocumentItem"
    :estimate-size="80"
    class="document-list"
  />
</template>
```

### 3. 图片优化
```vue
<template>
  <img
    :src="imageSrc"
    :alt="imageAlt"
    loading="lazy"
    @load="onImageLoad"
    @error="onImageError"
  />
</template>
```

## 🧪 测试策略

### 1. 单元测试
```typescript
// tests/unit/DocumentUpload.spec.ts
describe('DocumentUpload', () => {
  it('should validate file type', () => {
    const wrapper = mount(DocumentUpload)
    const file = new File(['content'], 'test.txt', { type: 'text/plain' })
    
    expect(wrapper.vm.validateFile(file)).toBe(true)
  })
  
  it('should show error for invalid file', () => {
    const wrapper = mount(DocumentUpload)
    const file = new File(['content'], 'test.exe', { type: 'application/exe' })
    
    expect(wrapper.vm.validateFile(file)).toBe(false)
  })
})
```

### 2. 集成测试
```typescript
// tests/e2e/document-upload.cy.ts
describe('Document Upload', () => {
  it('should upload file successfully', () => {
    cy.visit('/documents')
    cy.get('[data-cy=upload-area]').selectFile('test.pdf')
    cy.get('[data-cy=upload-progress]').should('be.visible')
    cy.get('[data-cy=success-message]').should('contain', '上传成功')
  })
})
```

## 📊 监控和调试

### 1. 错误监控
```typescript
// utils/error-handler.ts
export function setupErrorHandler() {
  window.addEventListener('error', (event) => {
    console.error('Global error:', event.error)
    // 发送错误到监控平台
  })
  
  window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason)
    // 发送错误到监控平台
  })
}
```

### 2. 性能监控
```typescript
// utils/performance.ts
export function measurePerformance(name: string, fn: () => void) {
  const start = performance.now()
  fn()
  const end = performance.now()
  console.log(`${name} took ${end - start} milliseconds`)
}
```

## 🔄 开发工作流

### 1. 分支策略
- `main`: 生产分支
- `develop`: 开发分支
- `feature/*`: 功能分支
- `hotfix/*`: 热修复分支

### 2. 提交规范
```
feat: 新功能
fix: 修复bug
docs: 文档更新
style: 代码格式调整
refactor: 代码重构
test: 测试相关
chore: 构建工具或辅助工具的变动
```

### 3. CI/CD流程
```yaml
# .github/workflows/ci.yml
name: CI/CD Pipeline
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run lint
      - run: npm run test
      - run: npm run build
```

## 📋 下一步开发计划

### Phase 1: 基础架构搭建 (1-2周)
1. ✅ 创建项目配置文件
2. ⏳ 初始化Vue 3项目
3. ⏳ 配置开发环境
4. ⏳ 搭建基础组件库

### Phase 2: 核心功能开发 (3-4周)
1. ⏳ 实现文档管理模块
2. ⏳ 实现知识库管理模块
3. ⏳ 实现智能对话模块
4. ⏳ 集成后端API

### Phase 3: 高级功能和优化 (2-3周)
1. ⏳ 实现AI分析模块
2. ⏳ 实现系统监控模块
3. ⏳ 性能优化和测试
4. ⏳ 部署配置

---

这个架构设计为前端项目提供了完整的技术选型、代码组织、开发规范和实施计划。可以根据具体需求调整和优化。 