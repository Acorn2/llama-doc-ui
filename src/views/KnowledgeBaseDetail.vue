<template>
  <div class="kb-detail-page p-6">
    <!-- 页面头部 -->
    <div class="page-header mb-6">
      <div class="header-nav mb-4">
        <el-button @click="goBack" type="text" class="back-btn">
          <el-icon class="mr-2"><ArrowLeft /></el-icon>
          返回知识库列表
        </el-button>
      </div>
      
      <div class="kb-info-card">
        <div v-if="loading" class="loading-skeleton">
          <el-skeleton :rows="3" animated />
        </div>
        
        <div v-else-if="knowledgeBase" class="kb-info-content">
          <div class="kb-header">
            <div class="kb-title-section">
              <h1 class="kb-title">{{ knowledgeBase.name }}</h1>
              <div class="kb-badges">
                <el-tag v-if="knowledgeBase.is_public" type="success" size="large">公开</el-tag>
                <el-tag v-else type="info" size="large">私有</el-tag>
                <el-tag v-if="knowledgeBase.is_owner" type="warning" size="large">我的</el-tag>
              </div>
            </div>
            
            <div v-if="knowledgeBase.is_owner" class="kb-actions">
              <el-button @click="showEditDialog = true" type="primary" plain>
                <el-icon class="mr-1"><Edit /></el-icon>
                编辑
              </el-button>
              <el-button @click="openUploadDialog" type="success">
                <el-icon class="mr-1"><Upload /></el-icon>
                上传文档
              </el-button>
            </div>
          </div>
          
          <div class="kb-description" v-if="knowledgeBase.description">
            <p>{{ knowledgeBase.description }}</p>
          </div>
          
          <div class="kb-meta">
            <div class="meta-item">
              <el-icon><Document /></el-icon>
              <span>{{ knowledgeBase.document_count }} 个文档</span>
            </div>
            <div class="meta-item">
              <el-icon><View /></el-icon>
              <span>{{ knowledgeBase.view_count }} 次浏览</span>
            </div>
            <div v-if="knowledgeBase.is_public" class="meta-item">
              <el-icon><Star /></el-icon>
              <span>{{ knowledgeBase.like_count }} 个点赞</span>
            </div>
            <div class="meta-item">
              <el-icon><Calendar /></el-icon>
              <span>创建于 {{ formatTime(knowledgeBase.create_time) }}</span>
            </div>
          </div>
          
          <div v-if="knowledgeBase.tags.length > 0" class="kb-tags">
            <el-tag 
              v-for="(tag, index) in knowledgeBase.tags" 
              :key="tag" 
              :type="getTagColor(index)"
              class="tag-item"
            >
              {{ tag }}
            </el-tag>
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

      <!-- 文档列表 -->
      <div v-else-if="filteredDocuments.length > 0" class="documents-grid">
        <el-card 
          v-for="doc in filteredDocuments" 
          :key="doc.id" 
          class="document-card"
          shadow="hover"
        >
          <div class="doc-header">
            <div class="doc-icon">
              <el-icon><Document /></el-icon>
            </div>
            <div class="doc-info">
              <h3 class="doc-title">{{ doc.filename }}</h3>
              <p class="doc-meta">
                <span>{{ formatFileSize(doc.file_size) }}</span>
                <span class="separator">•</span>
                <span>{{ doc.file_type.toUpperCase() }}</span>
                <span class="separator">•</span>
                <span>{{ formatTime(doc.upload_time) }}</span>
              </p>
            </div>
            <div v-if="knowledgeBase?.is_owner" class="doc-actions">
              <el-dropdown>
                <el-button type="text" class="more-btn">
                  <el-icon><MoreFilled /></el-icon>
                </el-button>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item @click="removeDocument(doc)">
                      <el-icon><Delete /></el-icon>
                      从知识库移除
                    </el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
          </div>
          
          <div class="doc-status">
            <el-tag 
              :type="getStatusType(doc.status)" 
              size="small"
            >
              {{ getStatusText(doc.status) }}
            </el-tag>
          </div>
        </el-card>
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
  Lightning, Check
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

// 上传配置 - 使用完整的 API 地址
const uploadAction = `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}/api/v1/documents/upload`
const uploadHeaders = computed(() => ({
  'Authorization': `Bearer ${getToken()}`
}))
const uploadData = computed(() => ({
  kb_id: route.params.id
}))

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
    documents.value = await KnowledgeBaseAPI.getDocuments(kbId)
  } catch (error: any) {
    console.error('加载文档列表失败:', error)
    ElMessage.error('加载文档列表失败')
  } finally {
    documentsLoading.value = false
  }
}

// 返回上一页
const goBack = () => {
  router.push('/knowledge-base')
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

// 上传前检查
const beforeUpload = (file: File) => {
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
  
  ElMessage.success(`文档 "${file.name}" 上传成功`)
  
  // 如果上传成功，将文档添加到知识库
  if (response.document_id) {
    try {
      const kbId = route.params.id as string
      await KnowledgeBaseAPI.addDocument(kbId, response.document_id)
    } catch (error) {
      console.error('添加文档到知识库失败:', error)
      ElMessage.warning('文档上传成功，但添加到知识库失败')
    }
  }
  
  // 延迟重新加载，让用户看到成功状态
  setTimeout(() => {
    loadDocuments() // 重新加载文档列表
    loadKnowledgeBase() // 重新加载知识库信息（更新文档数量）
  }, 1000)
}

// 上传失败
const onUploadError = (error: any, file: any) => {
  const progress = uploadProgress.value.find(p => p.uid === file.uid)
  if (progress) {
    progress.status = 'exception'
  }
  
  console.error('上传失败:', error)
  ElMessage.error(`文档 "${file.name}" 上传失败`)
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
</script><style scop
ed>
/* 页面头部样式 */
.page-header {
  margin-bottom: 2rem;
}

.header-nav {
  margin-bottom: 1rem;
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

/* 知识库信息卡片 */
.kb-info-card {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid #e5e7eb;
}

.dark .kb-info-card {
  background: #1f2937;
  border-color: #374151;
}

.loading-skeleton {
  padding: 1rem 0;
}

.kb-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.5rem;
}

.kb-title-section {
  flex: 1;
}

.kb-title {
  font-size: 2rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 1rem 0;
  line-height: 1.2;
}

.dark .kb-title {
  color: #f9fafb;
}

.kb-badges {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.kb-actions {
  display: flex;
  gap: 0.75rem;
  flex-shrink: 0;
}

.kb-description {
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: #f8fafc;
  border-radius: 8px;
  border-left: 4px solid #667eea;
}

.dark .kb-description {
  background: #374151;
}

.kb-description p {
  margin: 0;
  color: #4b5563;
  line-height: 1.6;
}

.dark .kb-description p {
  color: #d1d5db;
}

.kb-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
  padding: 1rem 0;
  border-top: 1px solid #e5e7eb;
  border-bottom: 1px solid #e5e7eb;
}

.dark .kb-meta {
  border-color: #374151;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #6b7280;
  font-size: 0.875rem;
}

.dark .meta-item {
  color: #9ca3af;
}

.meta-item .el-icon {
  color: #667eea;
}

.kb-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.tag-item {
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

/* 文档网格 */
.documents-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
}

.document-card {
  transition: all 0.3s ease;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
}

.dark .document-card {
  border-color: #374151;
  background: #374151;
}

.document-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  border-color: #667eea;
}

.doc-header {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 1rem;
}

.doc-icon {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.25rem;
  flex-shrink: 0;
}

.doc-info {
  flex: 1;
  min-width: 0;
}

.doc-title {
  font-size: 1rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 0.5rem 0;
  line-height: 1.4;
  word-break: break-all;
}

.dark .doc-title {
  color: #f9fafb;
}

.doc-meta {
  font-size: 0.75rem;
  color: #6b7280;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.dark .doc-meta {
  color: #9ca3af;
}

.separator {
  color: #d1d5db;
}

.doc-actions {
  flex-shrink: 0;
}

.more-btn {
  min-width: 32px !important;
  height: 32px !important;
  padding: 0 !important;
  border-radius: 6px;
}

.doc-status {
  display: flex;
  justify-content: flex-end;
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
  
  .documents-grid {
    grid-template-columns: 1fr;
  }
  
  .kb-meta {
    flex-direction: column;
    gap: 0.75rem;
  }
  
  .kb-badges {
    margin-top: 0.5rem;
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