<script setup lang="ts">
import { ref, onMounted } from 'vue'

// 临时数据，后续会替换为API调用
const documents = ref([
  {
    id: '1',
    filename: '机器学习基础.pdf',
    file_size: 2048576,
    status: 'completed',
    upload_time: '2024-01-20 10:30:00',
    file_type: 'pdf'
  },
  {
    id: '2', 
    filename: '深度学习进阶.pdf',
    file_size: 5242880,
    status: 'processing',
    upload_time: '2024-01-20 11:15:00',
    file_type: 'pdf'
  }
])

const loading = ref(false)

onMounted(() => {
  // 初始化页面数据
  console.log('Documents page mounted')
})

const handleUpload = () => {
  console.log('Handle upload')
}

const handleDelete = (id: string) => {
  console.log('Delete document:', id)
}
</script>

<template>
  <div class="documents-page p-6">
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

    <el-card>
      <el-table :data="documents" v-loading="loading">
        <el-table-column prop="filename" label="文件名" />
        <el-table-column prop="file_size" label="大小" :formatter="(row) => (row.file_size / 1024 / 1024).toFixed(2) + ' MB'" />
        <el-table-column prop="status" label="状态">
          <template #default="{ row }">
            <el-tag :type="row.status === 'completed' ? 'success' : 'warning'">
              {{ row.status === 'completed' ? '已完成' : '处理中' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="upload_time" label="上传时间" />
        <el-table-column label="操作">
          <template #default="{ row }">
            <el-button size="small" @click="handleDelete(row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template> 