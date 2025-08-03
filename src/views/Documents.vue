<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { DocumentAPI } from '@/api/modules/document'
import type { Document, DocumentQuery } from '@/types/document'
import { ElMessage } from 'element-plus'
import { isAuthenticated } from '@/utils/auth'

// 响应式数据
const documents = ref<Document[]>([])
const loading = ref(false)
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)

// 搜索和过滤条件
const searchForm = ref({
  filename: '',
  status: '',
  fileType: ''
})

// 状态选项
const statusOptions = [
  { label: '全部状态', value: '' },
  { label: '已完成', value: 'completed' },
  { label: '处理中', value: 'processing' },
  { label: '等待处理', value: 'pending' },
  { label: '处理失败', value: 'failed' }
]

// 文件类型选项
const fileTypeOptions = [
  { label: '全部类型', value: '' },
  { label: 'PDF', value: 'pdf' },
  { label: 'Word', value: 'doc' },
  { label: 'Text', value: 'txt' }
]

// 计算属性：分页信息
const paginationInfo = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value + 1
  const end = Math.min(currentPage.value * pageSize.value, total.value)
  return `显示第 ${start} 到 ${end} 条记录，共 ${total.value} 条`
})

onMounted(() => {
  loadDocuments()
})

// 检查用户是否已登录
const checkAuth = () => {
  if (!isAuthenticated()) {
    ElMessage.error('请先登录')
    return false
  }
  return true
}

// 加载文档列表
const loadDocuments = async () => {
  // 检查认证状态
  if (!checkAuth()) {
    return
  }
  
  try {
    loading.value = true
    
    const params: DocumentQuery = {
      skip: (currentPage.value - 1) * pageSize.value,
      limit: pageSize.value
    }
    
    // 添加搜索条件
    if (searchForm.value.filename) {
      params.filename = searchForm.value.filename
    }
    if (searchForm.value.status) {
      params.status = searchForm.value.status
    }
    if (searchForm.value.fileType) {
      params.file_type = searchForm.value.fileType
    }
    
    const response = await DocumentAPI.getList(params)
    
    // 根据新的API响应结构处理数据
    documents.value = response.items || []
    total.value = response.total || 0
    
  } catch (error: any) {
    console.error('加载文档列表失败:', error)
    
    // 如果是401错误，提示用户重新登录
    if (error.response?.status === 401) {
      ElMessage.error('登录已过期，请重新登录')
      localStorage.removeItem('access_token')
      localStorage.removeItem('user_info')
      return
    }
    
    // 其他错误显示通用错误信息
    const errorMessage = error.response?.data?.detail || error.message || '加载文档列表失败'
    ElMessage.error(errorMessage)
    
    // 清空列表
    documents.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
}

// 搜索处理
const handleSearch = () => {
  currentPage.value = 1 // 重置到第一页
  loadDocuments()
}

// 重置搜索
const handleReset = () => {
  searchForm.value = {
    filename: '',
    status: '',
    fileType: ''
  }
  currentPage.value = 1
  loadDocuments()
}

// 分页改变
const handlePageChange = (page: number) => {
  currentPage.value = page
  loadDocuments()
}

// 每页条数改变
const handleSizeChange = (size: number) => {
  pageSize.value = size
  currentPage.value = 1
  loadDocuments()
}



// 删除文档
const handleDelete = async (documentId: string) => {
  try {
    await DocumentAPI.delete(documentId)
    ElMessage.success('删除成功')
    loadDocuments() // 重新加载列表
  } catch (error) {
    console.error('删除文档失败:', error)
    ElMessage.error('删除失败')
  }
}

// 格式化文件大小
const formatFileSize = (bytes: number) => {
  return (bytes / 1024 / 1024).toFixed(2) + ' MB'
}

// 获取状态标签类型
const getStatusTagType = (status: string) => {
  switch (status) {
    case 'completed': return 'success'
    case 'processing': return 'warning'
    case 'pending': return 'info'
    case 'failed': return 'danger'
    default: return 'info'
  }
}

// 获取状态文本
const getStatusText = (status: string) => {
  switch (status) {
    case 'completed': return '已完成'
    case 'processing': return '处理中'
    case 'pending': return '等待处理'
    case 'failed': return '处理失败'
    default: return '未知'
  }
}

// 格式化时间显示（只显示到时分秒）
const formatDateTime = (dateTime: string) => {
  if (!dateTime) return '-'
  
  try {
    const date = new Date(dateTime)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    const seconds = String(date.getSeconds()).padStart(2, '0')
    
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
  } catch (error) {
    return dateTime
  }
}
</script>

<template>
  <div class="documents-page p-6">
    <!-- 页面标题 -->
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">文档管理</h1>
      <p class="text-gray-600 dark:text-gray-400 mt-1">管理您的PDF文档</p>
    </div>

    <!-- 搜索过滤区域 -->
    <el-card class="mb-6 search-card">
      <template #header>
        <div class="flex items-center space-x-2">
          <el-icon class="text-blue-600"><Search /></el-icon>
          <span class="font-semibold">搜索过滤</span>
        </div>
      </template>
      
      <div class="search-container">
        <div class="search-row">
          <div class="search-item">
            <label class="search-label">文件名</label>
            <el-input
              v-model="searchForm.filename"
              placeholder="请输入文件名"
              clearable
              class="search-input"
              @keyup.enter="handleSearch"
            />
          </div>
          
          <div class="search-item">
            <label class="search-label">状态</label>
            <el-select
              v-model="searchForm.status"
              placeholder="选择状态"
              class="search-select"
            >
              <el-option
                v-for="option in statusOptions"
                :key="option.value"
                :label="option.label"
                :value="option.value"
              />
            </el-select>
          </div>
          
          <div class="search-item">
            <label class="search-label">文件类型</label>
            <el-select
              v-model="searchForm.fileType"
              placeholder="选择类型"
              class="search-select"
            >
              <el-option
                v-for="option in fileTypeOptions"
                :key="option.value"
                :label="option.label"
                :value="option.value"
              />
            </el-select>
          </div>
          
          <div class="search-actions">
            <el-button type="primary" @click="handleSearch" :loading="loading" class="search-btn">
              <el-icon class="mr-1"><Search /></el-icon>
              搜索
            </el-button>
            <el-button @click="handleReset" class="reset-btn">
              <el-icon class="mr-1"><Refresh /></el-icon>
              重置
            </el-button>
          </div>
        </div>
      </div>
    </el-card>

    <!-- 文档列表 -->
    <el-card>
      <template #header>
        <div class="flex justify-between items-center">
          <span class="font-semibold">文档列表</span>
          <span class="text-sm text-gray-500">{{ paginationInfo }}</span>
        </div>
      </template>
      
      <el-table :data="documents" v-loading="loading" stripe>
        <el-table-column prop="filename" label="文件名" min-width="200">
          <template #default="{ row }">
            <div class="flex items-center space-x-2">
              <el-icon class="text-red-500"><Document /></el-icon>
              <span class="text-blue-600 hover:text-blue-800 cursor-pointer">
                {{ row.filename }}
              </span>
            </div>
          </template>
        </el-table-column>
        
        <el-table-column prop="file_size" label="文件大小" width="120">
          <template #default="{ row }">
            {{ formatFileSize(row.file_size) }}
          </template>
        </el-table-column>
        
        <el-table-column prop="status" label="状态" width="120">
          <template #default="{ row }">
            <el-tag :type="getStatusTagType(row.status)" size="small">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        
        <el-table-column prop="file_type" label="类型" width="80">
          <template #default="{ row }">
            <el-tag type="info" size="small">
              {{ row.file_type?.toUpperCase() }}
            </el-tag>
          </template>
        </el-table-column>
        
        <el-table-column prop="upload_time" label="上传时间" width="160">
          <template #default="{ row }">
            {{ formatDateTime(row.upload_time) }}
          </template>
        </el-table-column>
        
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button 
              size="small" 
              type="success" 
              link
              :disabled="row.status !== 'completed'"
            >
              下载
            </el-button>
            <el-popconfirm
              title="确定要删除这个文档吗？"
              @confirm="handleDelete(row.document_id)"
            >
              <template #reference>
                <el-button size="small" type="danger" link>
                  删除
                </el-button>
              </template>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>

      <!-- 简洁分页组件 -->
      <div class="simple-pagination" v-if="total > 0">
        <div class="pagination-info">
          共 {{ total }} 条记录
        </div>
        
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="total"
          :pager-count="5"
          layout="sizes, prev, pager, next"
          @size-change="handleSizeChange"
          @current-change="handlePageChange"
          class="clean-pagination"
        />
      </div>
    </el-card>
  </div>
</template>

<style scoped>
/* 搜索区域样式优化 */
.search-card {
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  overflow: hidden;
}

.search-container {
  padding: 4px 0;
}

.search-row {
  display: flex;
  align-items: center;
  gap: 24px;
  flex-wrap: wrap;
}

.search-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.search-label {
  font-size: 14px;
  color: #606266;
  font-weight: 500;
  white-space: nowrap;
  min-width: 60px;
  text-align: right;
}

.search-input {
  width: 200px;
}

.search-select {
  width: 150px;
}

.search-actions {
  display: flex;
  gap: 12px;
  margin-left: auto;
}

.search-btn,
.reset-btn {
  height: 32px;
  border-radius: 6px;
  font-size: 14px;
  padding: 0 16px;
}

.search-btn {
  background: #409eff;
  border-color: #409eff;
}

.search-btn:hover {
  background: #66b1ff;
  border-color: #66b1ff;
}

.reset-btn {
  background: #f5f7fa;
  border-color: #dcdfe6;
  color: #606266;
}

.reset-btn:hover {
  background: #ecf5ff;
  border-color: #b3d8ff;
  color: #409eff;
}

/* 确保输入框和选择框高度一致 */
.search-input :deep(.el-input__wrapper),
.search-select :deep(.el-select__wrapper) {
  height: 32px;
  border-radius: 6px;
  border: 1px solid #dcdfe6;
  transition: all 0.2s;
}

.search-input :deep(.el-input__wrapper:hover),
.search-select :deep(.el-select__wrapper:hover) {
  border-color: #409eff;
}

.search-input :deep(.el-input__wrapper.is-focus),
.search-select :deep(.el-select__wrapper.is-focus) {
  border-color: #409eff;
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.1);
}

.search-input :deep(.el-input__inner),
.search-select :deep(.el-select__selected-item) {
  height: 30px;
  line-height: 30px;
  font-size: 14px;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .search-row {
    gap: 16px;
  }
  
  .search-input {
    width: 180px;
  }
  
  .search-select {
    width: 130px;
  }
}

@media (max-width: 768px) {
  .search-row {
    flex-direction: column;
    align-items: stretch;
    gap: 16px;
  }
  
  .search-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 6px;
  }
  
  .search-label {
    text-align: left;
    min-width: auto;
  }
  
  .search-input,
  .search-select {
    width: 100%;
  }
  
  .search-actions {
    margin-left: 0;
    justify-content: center;
  }
}

/* 暗色主题适配 */
.dark .search-card {
  border-color: #4c4d4f;
  background: #1d1e1f;
}

.dark .search-label {
  color: #e5eaf3;
}

.dark .search-input :deep(.el-input__wrapper),
.dark .search-select :deep(.el-select__wrapper) {
  background: #141414;
  border-color: #4c4d4f;
  color: #e5eaf3;
}

.dark .search-input :deep(.el-input__wrapper:hover),
.dark .search-select :deep(.el-select__wrapper:hover) {
  border-color: #409eff;
}

.dark .reset-btn {
  background: #2d2d2d;
  border-color: #4c4d4f;
  color: #e5eaf3;
}

.dark .reset-btn:hover {
  background: #404040;
  border-color: #409eff;
  color: #409eff;
}

.documents-page :deep(.el-card__header) {
  padding: 16px 20px;
  border-bottom: 1px solid var(--el-border-color-light);
}

.documents-page :deep(.el-table) {
  --el-table-border-color: var(--el-border-color-lighter);
}

/* 简洁分页组件样式 */
.simple-pagination {
  @apply mt-6 flex items-center justify-between;
  padding: 20px 0;
}

.pagination-info {
  color: #666;
  font-size: 14px;
}

/* Element Plus 分页组件简洁样式 */
.clean-pagination :deep(.el-pagination) {
  --el-pagination-font-size: 14px;
  --el-pagination-bg-color: transparent;
  --el-pagination-text-color: #666;
}

.clean-pagination :deep(.el-pagination .btn-prev),
.clean-pagination :deep(.el-pagination .btn-next) {
  background: transparent;
  border: 1px solid #ddd;
  border-radius: 6px;
  color: #666;
  min-width: 32px;
  height: 32px;
  transition: all 0.2s;
}

.clean-pagination :deep(.el-pagination .btn-prev:hover),
.clean-pagination :deep(.el-pagination .btn-next:hover) {
  border-color: #409eff;
  color: #409eff;
}

.clean-pagination :deep(.el-pagination .btn-prev:disabled),
.clean-pagination :deep(.el-pagination .btn-next:disabled) {
  background: #f5f5f5;
  border-color: #e4e4e4;
  color: #ccc;
}

.clean-pagination :deep(.el-pagination .el-pager li) {
  background: transparent;
  border: 1px solid #ddd;
  border-radius: 6px;
  color: #666;
  min-width: 32px;
  height: 32px;
  margin: 0 2px;
  transition: all 0.2s;
}

.clean-pagination :deep(.el-pagination .el-pager li:hover) {
  border-color: #409eff;
  color: #409eff;
}

.clean-pagination :deep(.el-pagination .el-pager li.is-active) {
  background: #409eff;
  border-color: #409eff;
  color: white;
}

.clean-pagination :deep(.el-select .el-select__wrapper) {
  border-radius: 6px;
  height: 32px;
  border-color: #ddd;
}

.clean-pagination :deep(.el-select .el-select__wrapper:hover) {
  border-color: #409eff;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .simple-pagination {
    flex-direction: column;
    gap: 16px;
    text-align: center;
  }
  
  .clean-pagination :deep(.el-pagination) {
    flex-wrap: wrap;
    justify-content: center;
  }
}

/* 暗色主题适配 */
.dark .pagination-info {
  color: #ccc;
}

.dark .clean-pagination :deep(.el-pagination .btn-prev),
.dark .clean-pagination :deep(.el-pagination .btn-next),
.dark .clean-pagination :deep(.el-pagination .el-pager li) {
  border-color: #444;
  color: #ccc;
  background: transparent;
}

.dark .clean-pagination :deep(.el-pagination .btn-prev:hover),
.dark .clean-pagination :deep(.el-pagination .btn-next:hover),
.dark .clean-pagination :deep(.el-pagination .el-pager li:hover) {
  border-color: #409eff;
  color: #409eff;
}

.dark .clean-pagination :deep(.el-pagination .btn-prev:disabled),
.dark .clean-pagination :deep(.el-pagination .btn-next:disabled) {
  background: #333;
  border-color: #444;
  color: #666;
}

.dark .clean-pagination :deep(.el-select .el-select__wrapper) {
  border-color: #444;
  background: transparent;
}
</style> 