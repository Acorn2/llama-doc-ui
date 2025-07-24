<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

// 系统状态数据
const systemHealth = ref({
  status: 'healthy',
  timestamp: new Date().toLocaleString(),
  services: {
    database: 'connected',
    vector_store: 'ready',
    llm: 'ready'
  }
})

const systemInfo = ref({
  cpu_percent: 45.6,
  memory_percent: 62.3,
  disk_percent: 78.1,
  load_average: [1.2, 1.5, 1.8],
  uptime: 86400,
  response_time: '120ms'
})

const processingStatus = ref({
  is_running: true,
  processing_count: 3,
  processing_documents: ['doc1.pdf', 'doc2.pdf', 'doc3.pdf']
})

const errorLogs = ref([
  {
    id: '1',
    level: 'warning',
    message: '文档处理队列较长，建议增加处理节点',
    timestamp: '2024-01-20 14:30:15',
    source: 'DocumentProcessor',
    count: 1
  },
  {
    id: '2',
    level: 'info',
    message: '新文档上传完成',
    timestamp: '2024-01-20 14:25:30',
    source: 'UploadService',
    count: 5
  }
])

let refreshTimer: NodeJS.Timeout | null = null

onMounted(() => {
  console.log('Monitor page mounted')
  startAutoRefresh()
})

onUnmounted(() => {
  if (refreshTimer) {
    clearInterval(refreshTimer)
  }
})

const startAutoRefresh = () => {
  refreshTimer = setInterval(() => {
    refreshData()
  }, 5000) // 每5秒刷新一次
}

const refreshData = () => {
  // 模拟数据更新
  systemInfo.value.cpu_percent = Math.random() * 100
  systemInfo.value.memory_percent = Math.random() * 100
  systemInfo.value.response_time = Math.floor(Math.random() * 200 + 50) + 'ms'
  systemHealth.value.timestamp = new Date().toLocaleString()
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'healthy':
    case 'connected':
    case 'ready':
      return 'success'
    case 'warning':
      return 'warning'
    case 'error':
    case 'disconnected':
    case 'not_ready':
      return 'danger'
    default:
      return 'info'
  }
}

const getLogLevelColor = (level: string) => {
  switch (level) {
    case 'error':
      return 'danger'
    case 'warning':
      return 'warning'
    case 'info':
      return 'info'
    default:
      return 'primary'
  }
}

const formatUptime = (seconds: number) => {
  const days = Math.floor(seconds / 86400)
  const hours = Math.floor((seconds % 86400) / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  return `${days}天 ${hours}时 ${minutes}分`
}
</script>

<template>
  <div class="monitor-page p-6">
    <div class="flex justify-between items-center mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">系统监控</h1>
        <p class="text-gray-600 dark:text-gray-400 mt-1">实时监控系统状态和性能指标</p>
      </div>
      <div class="flex items-center space-x-3">
        <span class="text-sm text-gray-500">最后更新: {{ systemHealth.timestamp }}</span>
        <el-button @click="refreshData" size="small">
          <el-icon class="mr-1"><Refresh /></el-icon>
          刷新
        </el-button>
      </div>
    </div>

    <!-- 系统健康状态 -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
      <el-card>
        <template #header>
          <div class="flex items-center justify-between">
            <span class="font-semibold">系统健康状态</span>
            <el-tag :type="getStatusColor(systemHealth.status)">
              {{ systemHealth.status === 'healthy' ? '正常' : '异常' }}
            </el-tag>
          </div>
        </template>
        
        <div class="space-y-3">
          <div v-for="(status, service) in systemHealth.services" :key="service" 
               class="flex items-center justify-between">
            <span class="text-sm">{{ 
              service === 'database' ? '数据库' :
              service === 'vector_store' ? '向量库' :
              service === 'llm' ? 'LLM服务' : service
            }}</span>
            <el-tag :type="getStatusColor(status)" size="small">
              {{ 
                status === 'connected' ? '已连接' :
                status === 'ready' ? '就绪' :
                status === 'disconnected' ? '未连接' : '未就绪'
              }}
            </el-tag>
          </div>
        </div>
      </el-card>

      <el-card>
        <template #header>
          <span class="font-semibold">处理状态</span>
        </template>
        
        <div class="space-y-3">
          <div class="flex items-center justify-between">
            <span class="text-sm">处理状态</span>
            <el-tag :type="processingStatus.is_running ? 'success' : 'danger'" size="small">
              {{ processingStatus.is_running ? '运行中' : '已停止' }}
            </el-tag>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-sm">处理中文档</span>
            <span class="font-semibold">{{ processingStatus.processing_count }}</span>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-sm">响应时间</span>
            <span class="font-semibold">{{ systemInfo.response_time }}</span>
          </div>
        </div>
      </el-card>

      <el-card>
        <template #header>
          <span class="font-semibold">系统运行时间</span>
        </template>
        
        <div class="text-center">
          <div class="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {{ formatUptime(systemInfo.uptime) }}
          </div>
          <div class="text-sm text-gray-500 mt-1">
            负载: {{ systemInfo.load_average.join(', ') }}
          </div>
        </div>
      </el-card>
    </div>

    <!-- 性能指标 -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
      <el-card>
        <template #header>
          <div class="flex items-center space-x-2">
            <el-icon class="text-red-500"><Cpu /></el-icon>
            <span class="font-semibold">CPU使用率</span>
          </div>
        </template>
        
        <div class="text-center">
          <el-progress 
            type="circle" 
            :percentage="systemInfo.cpu_percent"
            :color="[
              { color: '#5cb87a', percentage: 20 },
              { color: '#e6a23c', percentage: 80 },
              { color: '#f56c6c', percentage: 100 }
            ]"
          />
          <div class="mt-2 text-sm text-gray-500">
            {{ systemInfo.cpu_percent.toFixed(1) }}%
          </div>
        </div>
      </el-card>

      <el-card>
        <template #header>
          <div class="flex items-center space-x-2">
            <el-icon class="text-blue-500"><MemoryCard /></el-icon>
            <span class="font-semibold">内存使用率</span>
          </div>
        </template>
        
        <div class="text-center">
          <el-progress 
            type="circle" 
            :percentage="systemInfo.memory_percent"
            :color="[
              { color: '#5cb87a', percentage: 20 },
              { color: '#e6a23c', percentage: 80 },
              { color: '#f56c6c', percentage: 100 }
            ]"
          />
          <div class="mt-2 text-sm text-gray-500">
            {{ systemInfo.memory_percent.toFixed(1) }}%
          </div>
        </div>
      </el-card>

      <el-card>
        <template #header>
          <div class="flex items-center space-x-2">
            <el-icon class="text-green-500"><FolderOpened /></el-icon>
            <span class="font-semibold">磁盘使用率</span>
          </div>
        </template>
        
        <div class="text-center">
          <el-progress 
            type="circle" 
            :percentage="systemInfo.disk_percent"
            :color="[
              { color: '#5cb87a', percentage: 20 },
              { color: '#e6a23c', percentage: 80 },
              { color: '#f56c6c', percentage: 100 }
            ]"
          />
          <div class="mt-2 text-sm text-gray-500">
            {{ systemInfo.disk_percent.toFixed(1) }}%
          </div>
        </div>
      </el-card>
    </div>

    <!-- 处理中的文档 -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <el-card>
        <template #header>
          <div class="flex items-center justify-between">
            <span class="font-semibold">处理中的文档</span>
            <el-badge :value="processingStatus.processing_count" class="item">
              <el-button size="small">查看详情</el-button>
            </el-badge>
          </div>
        </template>
        
        <div class="space-y-2">
          <div v-for="doc in processingStatus.processing_documents" :key="doc"
               class="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded">
            <span class="text-sm">{{ doc }}</span>
            <el-progress :percentage="Math.floor(Math.random() * 80 + 10)" 
                        :show-text="false" 
                        class="w-20" />
          </div>
        </div>
      </el-card>

      <el-card>
        <template #header>
          <div class="flex items-center justify-between">
            <span class="font-semibold">系统日志</span>
            <el-button size="small">查看全部</el-button>
          </div>
        </template>
        
        <div class="space-y-3">
          <div v-for="log in errorLogs" :key="log.id"
               class="flex items-start space-x-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded">
            <el-tag :type="getLogLevelColor(log.level)" size="small">
              {{ log.level }}
            </el-tag>
            <div class="flex-1">
              <p class="text-sm text-gray-900 dark:text-white">{{ log.message }}</p>
              <div class="flex items-center space-x-2 text-xs text-gray-500 mt-1">
                <span>{{ log.timestamp }}</span>
                <span>{{ log.source }}</span>
                <span v-if="log.count > 1">({{ log.count }}次)</span>
              </div>
            </div>
          </div>
        </div>
      </el-card>
    </div>
  </div>
</template>

<style scoped>
.monitor-page {
  animation: fadeIn 0.5s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style> 