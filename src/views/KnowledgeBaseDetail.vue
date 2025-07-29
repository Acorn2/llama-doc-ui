<template>
  <div class="kb-detail-page p-6">
    <!-- 页面头部 -->
    <div class="page-header mb-4">
      <div class="header-nav mb-3">
        <el-button @click="goBack" type="text" class="back-btn">
          <el-icon class="mr-2"><ArrowLeft /></el-icon>
          返回知识库列表
        </el-button>
      </div>
      
      <div class="kb-info-card">
        <div v-if="loading" class="loading-skeleton">
          <el-skeleton :rows="2" animated />
        </div>
        
        <div v-else-if="knowledgeBase" class="kb-info-content">
          <div class="kb-header">
            <div class="kb-title-section">
              <div class="title-row">
                <h1 class="kb-title">{{ knowledgeBase.name }}</h1>
                <div class="kb-badges">
                  <el-tag v-if="knowledgeBase.is_public" type="success" size="small">公开</el-tag>
                  <el-tag v-else type="info" size="small">私有</el-tag>
                  <el-tag v-if="knowledgeBase.is_owner" type="warning" size="small">我的</el-tag>
                </div>
              </div>
              
              <!-- 紧凑的元信息展示 -->
              <div class="kb-meta-compact">
                <span class="meta-item-compact">
                  <el-icon><Document /></el-icon>
                  {{ knowledgeBase.document_count }} 个文档
                </span>
                <span class="meta-item-compact">
                  <el-icon><View /></el-icon>
                  {{ knowledgeBase.view_count }} 次浏览
                </span>
                <span v-if="knowledgeBase.is_public" class="meta-item-compact">
                  <el-icon><Star /></el-icon>
                  {{ knowledgeBase.like_count }} 个点赞
                </span>
                <span class="meta-item-compact">
                  <el-icon><Calendar /></el-icon>
                  {{ formatTime(knowledgeBase.create_time) }}
                </span>
              </div>
            </div>
            
            <div class="kb-actions">
              <!-- 聊天按钮 - 所有用户都可以使用 -->
              <el-button @click="startChat" type="success" size="small">
                <el-icon class="mr-1"><ChatDotRound /></el-icon>
                开始聊天
              </el-button>
              
              <!-- 管理按钮 - 仅所有者可见 -->
              <template v-if="knowledgeBase.is_owner">
                <el-button @click="showEditDialog = true" type="primary" plain size="small">
                  <el-icon class="mr-1"><Edit /></el-icon>
                  编辑
                </el-button>
                <el-button @click="openUploadDialog" type="success" plain size="small">
                  <el-icon class="mr-1"><Upload /></el-icon>
                  上传文档
                </el-button>
                <!-- 开发环境调试按钮 -->
                <el-button 
                  v-if="isDev" 
                  @click="testAPIConnection" 
                  type="warning" 
                  plain
                  size="small"
                >
                  测试API
                </el-button>
              </template>
            </div>
          </div>
          
          <!-- 简化的描述和标签展示 -->
          <div v-if="knowledgeBase.description || knowledgeBase.tags.length > 0" class="kb-extra-info">
            <div v-if="knowledgeBase.description" class="kb-description-compact">
              {{ knowledgeBase.description }}
            </div>
            <div v-if="knowledgeBase.tags.length > 0" class="kb-tags-compact">
              <el-tag 
                v-for="(tag, index) in knowledgeBase.tags.slice(0, 5)" 
                :key="tag" 
                :type="getTagColor(index)"
                size="small"
                class="tag-item-compact"
              >
                {{ tag }}
              </el-tag>
              <span v-if="knowledgeBase.tags.length > 5" class="more-tags">
                +{{ knowledgeBase.tags.length - 5 }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 文档列表 -->
    <div class="documents-section">
      <div class="section-header">
        <h2 class="section-title">文档列表</h2>
        <div class="section-actions">
          <el-input
            v-model="searchQuery"
            placeholder="搜索文档..."
            prefix-icon="Search"
            clearable
            class="search-input"
            @input="handleSearch"
          />
          <el-button v-if="knowledgeBase?.is_owner" @click="openUploadDialog" type="primary">
            <el-icon class="mr-1"><Plus /></el-icon>
            添加文档
          </el-button>
        </div>
      </div>

      <!-- 加载状态 -->
      <div v-if="documentsLoading" class="documents-loading">
        <el-skeleton :rows="5" animated />
      </div>

      <!-- 文档列表 - 表格形式 -->
      <div v-else-if="filteredDocuments.length > 0" class="documents-table">
        <el-table 
          :data="filteredDocuments" 
          style="width: 100%"
          :header-cell-style="{ background: '#f8fafc', color: '#374151', fontWeight: '600' }"
          :row-style="{ cursor: 'pointer' }"
          @row-click="handleRowClick"
        >
          <el-table-column width="60">
            <template #default>
              <div class="doc-icon-small">
                <el-icon><Document /></el-icon>
              </div>
            </template>
          </el-table-column>
          
          <el-table-column prop="filename" label="文档名称" min-width="300">
            <template #default="{ row }">
              <div class="doc-name-cell">
                <span class="doc-filename">{{ row.filename }}</span>
                <div class="doc-meta-row">
                  <span class="doc-type">{{ row.file_type?.toUpperCase() || 'TXT' }}</span>
                  <span class="separator">•</span>
                  <span class="doc-size">{{ formatFileSize(row.file_size || 0) }}</span>
                </div>
              </div>
            </template>
          </el-table-column>
          
          <el-table-column prop="status" label="状态" width="100">
            <template #default="{ row }">
              <el-tag 
                :type="getStatusType(row.status || 'completed')" 
                size="small"
              >
                {{ getStatusText(row.status || 'completed') }}
              </el-tag>
            </template>
          </el-table-column>
          
          <el-table-column prop="upload_time" label="上传时间" width="180">
            <template #default="{ row }">
              <span class="upload-time">{{ formatTime(row.upload_time || row.create_time) }}</span>
            </template>
          </el-table-column>
          
          <el-table-column v-if="knowledgeBase?.is_owner" label="操作" width="80" fixed="right">
            <template #default="{ row }">
              <el-dropdown @click.stop>
                <el-button type="text" class="action-btn">
                  <el-icon><MoreFilled /></el-icon>
                </el-button>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item @click="removeDocument(row)">
                      <el-icon><Delete /></el-icon>
                      移除
                    </el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- 空状态 -->
      <div v-else class="empty-documents">
        <div class="empty-content">
          <div class="empty-icon">
            <el-icon><FolderOpened /></el-icon>
          </div>
          <h3 class="empty-title">暂无文档</h3>
          <p class="empty-description">
            {{ knowledgeBase?.is_owner ? '开始上传文档来构建您的知识库' : '该知识库暂时没有文档' }}
          </p>
          <el-button 
            v-if="knowledgeBase?.is_owner" 
            @click="openUploadDialog" 
            type="primary" 
            class="upload-btn"
          >
            <el-icon class="mr-1"><Upload /></el-icon>
            上传第一个文档
          </el-button>
        </div>
      </div>
    </div>

    <!-- 上传文档对话框 -->
    <el-dialog
      v-model="showUploadDialog"
      width="600px"
      :close-on-click-modal="false"
      class="upload-dialog"
      align-center
    >
      <template #header>
        <div class="upload-dialog-header">
          <div class="header-icon">
            <el-icon><Upload /></el-icon>
          </div>
          <div class="header-content">
            <h3 class="dialog-title">上传文档到知识库</h3>
            <p class="dialog-subtitle">支持拖拽上传，文件将自动添加到当前知识库</p>
          </div>
        </div>
      </template>
      
      <div class="upload-dialog-body">
        <el-upload
          ref="uploadRef"
          :action="uploadAction"
          :headers="uploadHeaders"
          :data="uploadData"
          :before-upload="beforeUpload"
          :on-success="onUploadSuccess"
          :on-error="onUploadError"
          :on-progress="onUploadProgress"
          :file-list="fileList"
          :auto-upload="true"
          drag
          multiple
          accept=".pdf,.txt,.doc,.docx"
          class="upload-dragger-container"
        >
          <div class="upload-dragger-content">
            <div class="upload-icon-wrapper">
              <el-icon class="upload-icon"><UploadFilled /></el-icon>
            </div>
            <div class="upload-text-main">
              将文件拖拽到此处，或<span class="upload-link">点击选择文件</span>
            </div>
            <div class="upload-text-sub">
              支持 PDF、TXT、DOC、DOCX 格式，单个文件不超过 50MB
            </div>
            <div class="upload-features">
              <div class="feature-item">
                <el-icon><Document /></el-icon>
                <span>多格式支持</span>
              </div>
              <div class="feature-item">
                <el-icon><Lightning /></el-icon>
                <span>自动处理</span>
              </div>
              <div class="feature-item">
                <el-icon><Check /></el-icon>
                <span>智能解析</span>
              </div>
            </div>
          </div>
        </el-upload>
        
        <!-- 上传进度显示 -->
        <div v-if="uploadProgress.length > 0" class="upload-progress-section">
          <h4 class="progress-title">上传进度</h4>
          <div class="progress-list">
            <div 
              v-for="progress in uploadProgress" 
              :key="progress.uid" 
              class="progress-item"
            >
              <div class="progress-info">
                <el-icon class="file-icon"><Document /></el-icon>
                <div class="file-details">
                  <div class="file-name">{{ progress.name }}</div>
                  <div class="file-size">{{ formatFileSize(progress.size) }}</div>
                </div>
              </div>
              <div class="progress-bar-wrapper">
                <el-progress 
                  :percentage="progress.percentage" 
                  :status="progress.status"
                  :stroke-width="6"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <template #footer>
        <div class="upload-dialog-footer">
          <el-button @click="closeUploadDialog" size="large">
            {{ uploadProgress.length > 0 ? '完成' : '取消' }}
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 编辑知识库对话框 -->
    <el-dialog
      v-model="showEditDialog"
      title="编辑知识库"
      width="600px"
      :close-on-click-modal="false"
    >
      <el-form
        v-if="knowledgeBase"
        :model="editForm"
        label-width="100px"
      >
        <el-form-item label="知识库名称">
          <el-input v-model="editForm.name" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input
            v-model="editForm.description"
            type="textarea"
            :rows="3"
          />
        </el-form-item>
        <el-form-item label="可见性">
          <el-radio-group v-model="editForm.is_public">
            <el-radio :label="false">私有</el-radio>
            <el-radio :label="true">公开</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item v-if="editForm.is_public" label="公开描述">
          <el-input
            v-model="editForm.public_description"
            type="textarea"
            :rows="2"
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="showEditDialog = false">取消</el-button>
        <el-button type="primary" @click="handleEdit" :loading="editLoading">
          保存
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  ArrowLeft, Edit, Upload, Document, View, Star, Calendar, 
  Plus, Search, MoreFilled, Delete, FolderOpened, UploadFilled,
  Lightning, Check, ChatDotRound
} from '@element-plus/icons-vue'
import { KnowledgeBaseAPI, type KnowledgeBase } from '@/api/modules/knowledge-base'
import { DocumentAPI } from '@/api/modules/document'
import { getToken } from '@/utils/auth'

const route = useRoute()
const router = useRouter()

// 响应式数据
const knowledgeBase = ref<KnowledgeBase | null>(null)
const documents = ref<any[]>([])
const loading = ref(false)
const documentsLoading = ref(false)
const showUploadDialog = ref(false)
const showEditDialog = ref(false)
const uploading = ref(false)
const editLoading = ref(false)
const searchQuery = ref('')
const fileList = ref([])
const uploadRef = ref()

// 上传进度类型定义
interface UploadProgressItem {
  uid: string
  name: string
  size: number
  percentage: number
  status: 'success' | 'exception' | 'warning' | ''
}

const uploadProgress = ref<UploadProgressItem[]>([])

// 编辑表单
const editForm = reactive({
  name: '',
  description: '',
  is_public: false,
  public_description: ''
})

// 标签颜色
const tagColors = ['primary', 'success', 'info', 'warning', 'danger']

// 开发环境判断
const isDev = import.meta.env.DEV

// 上传配置 - 使用完整的 API 地址
const uploadAction = `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}/api/v1/documents/upload`
const uploadHeaders = computed(() => ({
  'Authorization': `Bearer ${getToken()}`
}))
// 上传文档接口不需要额外参数，文档会自动关联到当前用户
const uploadData = computed(() => ({}))

// 过滤后的文档列表
const filteredDocuments = computed(() => {
  if (!searchQuery.value) return documents.value
  return documents.value.filter(doc => 
    doc.filename.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})

onMounted(() => {
  loadKnowledgeBase()
  loadDocuments()
})

// 加载知识库信息
const loadKnowledgeBase = async () => {
  try {
    loading.value = true
    const kbId = route.params.id as string
    knowledgeBase.value = await KnowledgeBaseAPI.getById(kbId)
    
    // 初始化编辑表单
    if (knowledgeBase.value) {
      Object.assign(editForm, {
        name: knowledgeBase.value.name,
        description: knowledgeBase.value.description || '',
        is_public: knowledgeBase.value.is_public,
        public_description: knowledgeBase.value.public_description || ''
      })
    }
  } catch (error: any) {
    console.error('加载知识库失败:', error)
    ElMessage.error('加载知识库信息失败')
    router.push('/knowledge-base')
  } finally {
    loading.value = false
  }
}

// 加载文档列表
const loadDocuments = async () => {
  try {
    documentsLoading.value = true
    const kbId = route.params.id as string
    const result = await KnowledgeBaseAPI.getDocuments(kbId)
    
    // 确保结果是数组
    if (Array.isArray(result)) {
      documents.value = result
    } else {
      console.warn('文档列表API返回了非数组数据:', result)
      documents.value = []
    }
    
    console.log(`成功加载 ${documents.value.length} 个文档`)
  } catch (error: any) {
    console.error('加载文档列表失败:', error)
    const errorMessage = error.response?.data?.detail || error.message || '加载文档列表失败'
    ElMessage.error(errorMessage)
    documents.value = []
  } finally {
    documentsLoading.value = false
  }
}

// 返回上一页
const goBack = () => {
  router.push('/knowledge-base')
}

// 开始聊天
const startChat = () => {
  if (!knowledgeBase.value) {
    ElMessage.warning('知识库信息缺失')
    return
  }
  
  // 记录聊天访问行为
  KnowledgeBaseAPI.recordAccess(knowledgeBase.value.id, {
    access_type: 'chat',
    access_metadata: {
      source: 'knowledge_base_detail',
      page: 'knowledge_base_detail'
    }
  }).catch(console.error)
  
  // 跳转到对话页面
  router.push(`/chat/${knowledgeBase.value.id}`)
}

// 格式化时间
const formatTime = (timeStr: string) => {
  return new Date(timeStr).toLocaleString('zh-CN')
}

// 格式化文件大小
const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// 获取标签颜色
const getTagColor = (index: number) => {
  return tagColors[index % tagColors.length]
}

// 获取状态类型
const getStatusType = (status: string) => {
  const statusMap: Record<string, string> = {
    'pending': 'warning',
    'processing': 'info',
    'completed': 'success',
    'failed': 'danger'
  }
  return statusMap[status] || 'info'
}

// 获取状态文本
const getStatusText = (status: string) => {
  const statusMap: Record<string, string> = {
    'pending': '等待处理',
    'processing': '处理中',
    'completed': '已完成',
    'failed': '处理失败'
  }
  return statusMap[status] || status
}

// 搜索处理
const handleSearch = () => {
  // 搜索逻辑已通过计算属性实现
}

// 处理表格行点击
const handleRowClick = (row: any) => {
  // 可以在这里添加文档预览或详情查看功能
  console.log('点击文档:', row.filename)
}

// 上传前检查
const beforeUpload = (file: File) => {
  console.log('准备上传文件:', file.name, file.type, file.size)
  
  const isValidType = ['application/pdf', 'text/plain', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(file.type)
  const isLt50M = file.size / 1024 / 1024 < 50

  if (!isValidType) {
    ElMessage.error('只支持 PDF、TXT、DOC、DOCX 格式的文件!')
    return false
  }
  if (!isLt50M) {
    ElMessage.error('文件大小不能超过 50MB!')
    return false
  }
  
  // 检查是否有权限上传到此知识库
  if (!knowledgeBase.value?.is_owner) {
    ElMessage.error('只有知识库创建者可以上传文档!')
    return false
  }
  
  return true
}

// 上传进度处理
const onUploadProgress = (event: any, file: any) => {
  const progress = uploadProgress.value.find(p => p.uid === file.uid)
  if (progress) {
    progress.percentage = Math.round((event.loaded * 100) / event.total)
  } else {
    uploadProgress.value.push({
      uid: file.uid,
      name: file.name,
      size: file.size,
      percentage: Math.round((event.loaded * 100) / event.total),
      status: ''
    })
  }
}

// 上传成功
const onUploadSuccess = async (response: any, file: any) => {
  const progress = uploadProgress.value.find(p => p.uid === file.uid)
  if (progress) {
    progress.percentage = 100
    progress.status = 'success'
  }
  
  console.log('上传响应:', response)
  
  // 检查响应中是否包含文档ID
  if (response && response.document_id) {
    try {
      const kbId = route.params.id as string
      console.log(`正在将文档 ${response.document_id} 添加到知识库 ${kbId}`)
      
      // 添加文档到知识库
      await KnowledgeBaseAPI.addDocument(kbId, response.document_id)
      console.log('文档成功添加到知识库')
      
      ElMessage.success(`文档 "${file.name}" 上传并添加到知识库成功`)
      
      // 立即重新加载数据
      await Promise.all([
        loadDocuments(), // 重新加载文档列表
        loadKnowledgeBase() // 重新加载知识库信息（更新文档数量）
      ])
      
    } catch (error: any) {
      console.error('添加文档到知识库失败:', error)
      const errorMessage = error.response?.data?.detail || error.message || '添加到知识库失败'
      ElMessage.error(`文档上传成功，但添加到知识库失败: ${errorMessage}`)
    }
  } else {
    console.error('上传响应中缺少 document_id:', response)
    ElMessage.warning(`文档 "${file.name}" 上传成功，但响应格式异常，请手动刷新页面`)
  }
}

// 上传失败
const onUploadError = (error: any, file: any) => {
  const progress = uploadProgress.value.find(p => p.uid === file.uid)
  if (progress) {
    progress.status = 'exception'
  }
  
  console.error('上传失败:', error)
  
  // 尝试解析错误信息
  let errorMessage = `文档 "${file.name}" 上传失败`
  if (error && error.response) {
    const responseData = error.response.data
    if (responseData && responseData.detail) {
      errorMessage += `: ${responseData.detail}`
    } else if (error.response.status) {
      errorMessage += `: HTTP ${error.response.status}`
    }
  } else if (error && error.message) {
    errorMessage += `: ${error.message}`
  }
  
  ElMessage.error(errorMessage)
}

// 打开上传对话框
const openUploadDialog = () => {
  // 清空之前的状态
  uploadProgress.value = []
  fileList.value = []
  showUploadDialog.value = true
}

// 关闭上传对话框
const closeUploadDialog = () => {
  showUploadDialog.value = false
  // 清空上传进度
  setTimeout(() => {
    uploadProgress.value = []
    fileList.value = []
  }, 300)
}

// 编辑知识库
const handleEdit = async () => {
  try {
    editLoading.value = true
    const kbId = route.params.id as string
    await KnowledgeBaseAPI.update(kbId, editForm)
    ElMessage.success('知识库更新成功')
    showEditDialog.value = false
    loadKnowledgeBase() // 重新加载知识库信息
  } catch (error: any) {
    console.error('更新知识库失败:', error)
    ElMessage.error('更新知识库失败')
  } finally {
    editLoading.value = false
  }
}

// 移除文档
const removeDocument = async (doc: any) => {
  try {
    await ElMessageBox.confirm(
      `确定要从知识库中移除文档"${doc.filename}"吗？`,
      '确认移除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )
    
    const kbId = route.params.id as string
    await KnowledgeBaseAPI.removeDocument(kbId, doc.id)
    ElMessage.success('文档移除成功')
    loadDocuments() // 重新加载文档列表
    loadKnowledgeBase() // 重新加载知识库信息（更新文档数量）
  } catch (error: any) {
    if (error === 'cancel') return
    console.error('移除文档失败:', error)
    ElMessage.error('移除文档失败')
  }
}

// 测试API连接（仅开发环境）
const testAPIConnection = async () => {
  try {
    const kbId = route.params.id as string
    console.log('测试API连接，知识库ID:', kbId)
    
    // 测试获取知识库信息
    const kbInfo = await KnowledgeBaseAPI.getById(kbId)
    console.log('知识库信息:', kbInfo)
    
    // 测试获取文档列表
    const docs = await KnowledgeBaseAPI.getDocuments(kbId)
    console.log('文档列表:', docs)
    
    ElMessage.success(`API连接正常，知识库有 ${docs.length} 个文档`)
  } catch (error: any) {
    console.error('API连接测试失败:', error)
    ElMessage.error('API连接测试失败')
  }
}
</script><style scop
ed>
/* 页面头部样式 */
.page-header {
  margin-bottom: 1rem;
}

.header-nav {
  margin-bottom: 0.75rem;
}

.back-btn {
  color: #667eea;
  font-weight: 500;
  padding: 8px 0;
  transition: all 0.3s ease;
}

.back-btn:hover {
  color: #5a6fd8;
  transform: translateX(-2px);
}

/* 知识库信息卡片 - 紧凑版 */
.kb-info-card {
  background: white;
  border-radius: 12px;
  padding: 1.25rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  border: 1px solid #e5e7eb;
}

.dark .kb-info-card {
  background: #1f2937;
  border-color: #374151;
}

.loading-skeleton {
  padding: 0.5rem 0;
}

.kb-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0;
}

.kb-title-section {
  flex: 1;
}

.title-row {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 0.75rem;
}

.kb-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
  line-height: 1.2;
}

.dark .kb-title {
  color: #f9fafb;
}

.kb-badges {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.kb-actions {
  display: flex;
  gap: 0.5rem;
  flex-shrink: 0;
}

/* 紧凑的元信息展示 */
.kb-meta-compact {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  font-size: 0.875rem;
  color: #6b7280;
}

.dark .kb-meta-compact {
  color: #9ca3af;
}

.meta-item-compact {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.meta-item-compact .el-icon {
  color: #667eea;
  font-size: 0.875rem;
}

/* 额外信息区域 */
.kb-extra-info {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #e5e7eb;
}

.dark .kb-extra-info {
  border-color: #374151;
}

.kb-description-compact {
  font-size: 0.875rem;
  color: #6b7280;
  line-height: 1.5;
  margin-bottom: 0.75rem;
}

.dark .kb-description-compact {
  color: #9ca3af;
}

.kb-tags-compact {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  align-items: center;
}

.tag-item-compact {
  font-weight: 500;
}

.more-tags {
  font-size: 0.75rem;
  color: #6b7280;
  font-weight: 500;
}

/* 文档区域样式 */
.documents-section {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid #e5e7eb;
}

.dark .documents-section {
  background: #1f2937;
  border-color: #374151;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e5e7eb;
}

.dark .section-header {
  border-color: #374151;
}

.section-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.dark .section-title {
  color: #f9fafb;
}

.section-actions {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.search-input {
  width: 300px;
}

/* 文档表格样式 */
.documents-table {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #e5e7eb;
}

.dark .documents-table {
  background: #1f2937;
  border-color: #374151;
}

.documents-table :deep(.el-table) {
  background: transparent;
}

.documents-table :deep(.el-table__body-wrapper) {
  background: transparent;
}

.documents-table :deep(.el-table tr) {
  background: transparent;
  transition: background-color 0.2s ease;
}

.documents-table :deep(.el-table tr:hover) {
  background-color: rgba(102, 126, 234, 0.05) !important;
}

.dark .documents-table :deep(.el-table tr:hover) {
  background-color: rgba(102, 126, 234, 0.1) !important;
}

.documents-table :deep(.el-table td) {
  border-bottom: 1px solid #f3f4f6;
  padding: 12px 16px;
}

.dark .documents-table :deep(.el-table td) {
  border-bottom-color: #374151;
}

.documents-table :deep(.el-table th) {
  border-bottom: 1px solid #e5e7eb;
  padding: 12px 16px;
}

.dark .documents-table :deep(.el-table th) {
  border-bottom-color: #4b5563;
  background: #374151 !important;
  color: #f3f4f6 !important;
}

/* 文档图标 */
.doc-icon-small {
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1rem;
}

/* 文档名称单元格 */
.doc-name-cell {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.doc-filename {
  font-weight: 500;
  color: #1f2937;
  line-height: 1.4;
  word-break: break-all;
}

.dark .doc-filename {
  color: #f9fafb;
}

.doc-meta-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.75rem;
  color: #6b7280;
}

.dark .doc-meta-row {
  color: #9ca3af;
}

.doc-type {
  background: #f3f4f6;
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: 500;
  font-size: 0.7rem;
  text-transform: uppercase;
}

.dark .doc-type {
  background: #4b5563;
  color: #d1d5db;
}

.doc-size {
  font-weight: 500;
}

.separator {
  color: #d1d5db;
}

.upload-time {
  font-size: 0.875rem;
  color: #6b7280;
}

.dark .upload-time {
  color: #9ca3af;
}

.action-btn {
  min-width: 28px !important;
  height: 28px !important;
  padding: 0 !important;
  border-radius: 4px;
  color: #6b7280;
}

.action-btn:hover {
  background-color: #f3f4f6;
  color: #374151;
}

.dark .action-btn:hover {
  background-color: #4b5563;
  color: #f3f4f6;
}

/* 空状态样式 */
.empty-documents {
  min-height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.empty-content {
  text-align: center;
  max-width: 400px;
}

.empty-icon {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.5rem;
  color: white;
  font-size: 2rem;
}

.empty-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 0.75rem 0;
}

.dark .empty-title {
  color: #f9fafb;
}

.empty-description {
  color: #6b7280;
  margin: 0 0 1.5rem 0;
  line-height: 1.6;
}

.dark .empty-description {
  color: #9ca3af;
}

.upload-btn {
  padding: 12px 24px;
  font-weight: 600;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.2);
}

.upload-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

/* 加载状态 */
.documents-loading {
  padding: 2rem 0;
}

/* 上传对话框样式 */
.upload-dialog :deep(.el-dialog) {
  border-radius: 16px;
  overflow: hidden;
}

.upload-dialog :deep(.el-dialog__header) {
  padding: 0;
  margin: 0;
}

.upload-dialog :deep(.el-dialog__body) {
  padding: 0;
}

.upload-dialog :deep(.el-dialog__footer) {
  padding: 0;
}

.upload-dialog-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 2rem 2rem 1rem 2rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.header-icon {
  width: 48px;
  height: 48px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
}

.header-content {
  flex: 1;
}

.dialog-title {
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0 0 0.25rem 0;
}

.dialog-subtitle {
  font-size: 0.875rem;
  opacity: 0.9;
  margin: 0;
}

.upload-dialog-body {
  padding: 2rem;
}

.upload-dragger-container {
  width: 100%;
}

.upload-dragger-container :deep(.el-upload-dragger) {
  width: 100%;
  height: auto;
  min-height: 280px;
  border-radius: 16px;
  border: 2px dashed #d1d5db;
  background: #f9fafb;
  transition: all 0.3s ease;
  padding: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.upload-dragger-container :deep(.el-upload-dragger:hover) {
  border-color: #667eea;
  background: rgba(102, 126, 234, 0.05);
}

.upload-dragger-content {
  text-align: center;
  width: 100%;
}

.upload-icon-wrapper {
  margin-bottom: 1.5rem;
}

.upload-icon {
  font-size: 4rem;
  color: #667eea;
  filter: drop-shadow(0 4px 8px rgba(102, 126, 234, 0.2));
}

.upload-text-main {
  font-size: 1.125rem;
  color: #374151;
  margin-bottom: 0.75rem;
  font-weight: 500;
}

.upload-link {
  color: #667eea;
  font-weight: 600;
  cursor: pointer;
}

.upload-text-sub {
  font-size: 0.875rem;
  color: #6b7280;
  margin-bottom: 2rem;
}

.upload-features {
  display: flex;
  justify-content: center;
  gap: 2rem;
  margin-top: 1.5rem;
}

.feature-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  color: #6b7280;
  font-size: 0.875rem;
}

.feature-item .el-icon {
  font-size: 1.5rem;
  color: #667eea;
}

/* 上传进度样式 */
.upload-progress-section {
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid #e5e7eb;
}

.progress-title {
  font-size: 1rem;
  font-weight: 600;
  color: #374151;
  margin: 0 0 1rem 0;
}

.progress-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.progress-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}

.progress-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  min-width: 200px;
}

.file-icon {
  font-size: 1.5rem;
  color: #667eea;
}

.file-details {
  flex: 1;
}

.file-name {
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  margin-bottom: 0.25rem;
}

.file-size {
  font-size: 0.75rem;
  color: #6b7280;
}

.progress-bar-wrapper {
  flex: 1;
}

.upload-dialog-footer {
  display: flex;
  justify-content: center;
  padding: 1.5rem 2rem 2rem 2rem;
  background: #f8fafc;
  border-top: 1px solid #e5e7eb;
}

.dark .upload-dialog-footer {
  background: #374151;
  border-color: #4b5563;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .kb-header {
    flex-direction: column;
    gap: 1rem;
  }
  
  .title-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .kb-actions {
    width: 100%;
    justify-content: flex-start;
  }
  
  .section-header {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }
  
  .section-actions {
    flex-direction: column;
    gap: 0.75rem;
  }
  
  .search-input {
    width: 100%;
  }
  
  .kb-meta-compact {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .kb-badges {
    margin-top: 0.5rem;
  }
  
  /* 表格在移动端的优化 */
  .documents-table :deep(.el-table td),
  .documents-table :deep(.el-table th) {
    padding: 8px 12px;
  }
  
  .doc-filename {
    font-size: 0.875rem;
  }
  
  .doc-meta-row {
    font-size: 0.7rem;
  }
  
  .upload-dialog :deep(.el-dialog) {
    width: 95vw !important;
    margin: 0;
  }
  
  .upload-dialog-header {
    padding: 1.5rem 1.5rem 1rem 1.5rem;
  }
  
  .upload-dialog-body {
    padding: 1.5rem;
  }
  
  .upload-features {
    flex-direction: column;
    gap: 1rem;
  }
  
  .progress-item {
    flex-direction: column;
    align-items: stretch;
    gap: 0.75rem;
  }
  
  .progress-info {
    min-width: auto;
  }
}

@media (max-width: 480px) {
  .kb-info-card,
  .documents-section {
    padding: 1.5rem;
  }
  
  .kb-title {
    font-size: 1.5rem;
  }
  
  .section-title {
    font-size: 1.25rem;
  }
  
  .doc-header {
    gap: 0.75rem;
  }
  
  .doc-icon {
    width: 40px;
    height: 40px;
    font-size: 1rem;
  }
}

/* 页面动画 */
.kb-detail-page {
  animation: fadeInUp 0.6s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.document-card {
  animation: slideInUp 0.6s ease-out both;
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>