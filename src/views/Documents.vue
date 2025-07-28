<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { DocumentAPI } from '@/api/modules/document'
import type { Document, DocumentQuery } from '@/types'
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
    
    // 根据接口文档，直接返回文档数组
    if (Array.isArray(response)) {
      documents.value = response
      total.value = response.length
    } else if (response.data) {
      documents.value = response.data.items || response.data
      total.value = response.data.total || response.data.length
    } else {
      documents.value = response
      total.value = response.length
    }
    
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

// 上传文档
const handleUpload = () => {
  console.log('Handle upload')
  // TODO: 实现文档上传功能
}

// 删除文档
const handleDelete = async (id: string) => {
  try {
    await DocumentAPI.delete(id)
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
</script>

<template>
  <div class="documents-page p-6">
    <!-- 页面标题 -->
    <div class="flex justify-between items-center mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">文档管理</h1>
        <p class="text-gray-600 dark:text-gray-400 mt-1">管理您的PDF文档</p>
      </div>
      <el-button type="primary" @click="handleUpload">
        <el-icon class="mr-2"><Upload /></el-icon>
        上传文档
      </el-button>
    </div>

    <!-- 搜索过滤区域 -->
    <el-card class="mb-6">
      <template #header>
        <div class="flex items-center space-x-2">
          <el-icon class="text-blue-600"><Search /></el-icon>
          <span class="font-semibold">搜索过滤</span>
        </div>
      </template>
      
      <el-form :model="searchForm" inline class="search-form">
        <el-form-item label="文件名">
          <el-input
            v-model="searchForm.filename"
            placeholder="请输入文件名"
            clearable
            style="width: 200px"
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        
        <el-form-item label="状态">
          <el-select
            v-model="searchForm.status"
            placeholder="选择状态"
            style="width: 150px"
          >
            <el-option
              v-for="option in statusOptions"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            />
          </el-select>
        </el-form-item>
        
        <el-form-item label="文件类型">
          <el-select
            v-model="searchForm.fileType"
            placeholder="选择类型"
            style="width: 150px"
          >
            <el-option
              v-for="option in fileTypeOptions"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            />
          </el-select>
        </el-form-item>
        
        <el-form-item>
          <el-button type="primary" @click="handleSearch" :loading="loading">
            <el-icon class="mr-1"><Search /></el-icon>
            搜索
          </el-button>
          <el-button @click="handleReset">
            <el-icon class="mr-1"><Refresh /></el-icon>
            重置
          </el-button>
        </el-form-item>
      </el-form>
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
        
        <el-table-column prop="upload_time" label="上传时间" width="160" />
        
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button 
              size="small" 
              type="primary" 
              link
              :disabled="row.status !== 'completed'"
            >
              查看
            </el-button>
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
              @confirm="handleDelete(row.id)"
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

      <!-- 分页组件 -->
      <div class="flex justify-center mt-6" v-if="total > 0">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handlePageChange"
        />
      </div>
    </el-card>
  </div>
</template>

<style scoped>
.search-form {
  margin: 0;
}

.search-form .el-form-item {
  margin-bottom: 0;
}

.documents-page :deep(.el-card__header) {
  padding: 16px 20px;
  border-bottom: 1px solid var(--el-border-color-light);
}

.documents-page :deep(.el-table) {
  --el-table-border-color: var(--el-border-color-lighter);
}

.documents-page :deep(.el-pagination) {
  --el-pagination-font-size: 14px;
}
</style> 