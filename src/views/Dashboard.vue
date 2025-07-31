<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
import { 
  Document, Collection, ChatDotRound, Refresh, Lightning, Clock, ArrowRight,
  DocumentCopy, FolderOpen, FolderAdd, ChatLineRound, DataAnalysis, UploadFilled
} from '@element-plus/icons-vue'
import { UserAPI } from '@/api/modules/user'
import { api } from '@/api'
import { isAuthenticated } from '@/utils/auth'

const router = useRouter()

// 统计数据
const stats = ref([
  {
    title: '文档总数',
    value: '0',
    icon: 'Document',
    color: 'blue'
  },
  {
    title: '知识库数量',
    value: '0',
    icon: 'Collection',
    color: 'green'
  },
  {
    title: '今日对话',
    value: '0',
    icon: 'ChatDotRound',
    color: 'purple'
  }
])

// 快捷操作
const quickActions = ref([
  {
    title: '文档管理',
    description: '管理和查看您的文档',
    icon: 'FolderOpen',
    action: 'documents',
    color: 'blue'
  },
  {
    title: '创建知识库',
    description: '创建新的知识库进行管理',
    icon: 'FolderAdd',
    action: 'create-kb',
    color: 'green'
  },
  {
    title: '开始对话',
    description: '与AI助手进行智能对话',
    icon: 'ChatLineRound',
    action: 'chat',
    color: 'purple'
  },
  {
    title: '分析报告',
    description: '查看智能分析和统计报告',
    icon: 'DataAnalysis',
    action: 'analysis',
    color: 'orange'
  }
])

// 最近活动
const recentActivities = ref([])

// 加载状态
const loading = ref(false)
const statsLoading = ref(false)
const activitiesLoading = ref(false)

// 获取仪表板统计数据
const fetchDashboardStats = async () => {
  if (!isAuthenticated()) {
    ElMessage.error('请先登录')
    return
  }
  
  try {
    statsLoading.value = true
    const response = await api.get('/api/v1/users/dashboard/stats')
    
    console.log('API完整响应:', response.data)
    
    // 根据API返回的嵌套结构访问数据
    const data = response.data.data || response.data
    
    console.log('提取的统计数据:', data)
    
    // 更新统计数据 - 根据实际API返回的数据结构
    stats.value[0] = {
      title: '文档总数',
      value: data.document_count?.toLocaleString() || '0',
      icon: 'Document',
      color: 'blue'
    }
    
    stats.value[1] = {
      title: '知识库数量',
      value: data.knowledge_base_count?.toLocaleString() || '0',
      icon: 'Collection',
      color: 'green'
    }
    
    stats.value[2] = {
      title: '今日对话',
      value: data.today_conversations?.toLocaleString() || '0',
      icon: 'ChatDotRound',
      color: 'purple'
    }
    
    console.log('更新后的stats:', stats.value)
    
  } catch (error: any) {
    console.error('获取仪表板统计数据失败:', error)
    const errorMessage = error.response?.data?.detail || error.message || '获取统计数据失败，请稍后重试'
    ElMessage.error(errorMessage)
  } finally {
    statsLoading.value = false
  }
}

// 获取最近活动数据
const fetchRecentActivities = async () => {
  if (!isAuthenticated()) {
    ElMessage.error('请先登录')
    return
  }
  
  try {
    activitiesLoading.value = true
    const activities = await UserAPI.getActivities({ limit: 10 })
    
    // 转换活动数据格式
    recentActivities.value = activities.map(activity => ({
      id: activity.id,
      type: getActivityDisplayType(activity.activity_type),
      title: activity.activity_description,
      time: formatTime(activity.create_time),
      status: 'completed' // 活动记录都是已完成的
    }))
  } catch (error: any) {
    console.error('获取最近活动失败:', error)
    const errorMessage = error.response?.data?.detail || error.message || '获取最近活动失败，请稍后重试'
    ElMessage.error(errorMessage)
  } finally {
    activitiesLoading.value = false
  }
}

// 转换活动类型为显示类型
const getActivityDisplayType = (activityType: string) => {
  if (activityType.includes('document') || activityType.includes('upload')) {
    return 'upload'
  } else if (activityType.includes('chat') || activityType.includes('conversation')) {
    return 'chat'
  } else if (activityType.includes('agent') || activityType.includes('analyze') || activityType.includes('summary')) {
    return 'analysis'
  } else if (activityType.includes('kb') || activityType.includes('knowledge')) {
    return 'knowledge'
  }
  return 'other'
}

// 格式化时间
const formatTime = (timeString: string) => {
  const now = new Date()
  const time = new Date(timeString)
  const diff = now.getTime() - time.getTime()
  
  const minutes = Math.floor(diff / (1000 * 60))
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  
  if (minutes < 1) {
    return '刚刚'
  } else if (minutes < 60) {
    return `${minutes}分钟前`
  } else if (hours < 24) {
    return `${hours}小时前`
  } else if (days < 7) {
    return `${days}天前`
  } else {
    return time.toLocaleDateString('zh-CN')
  }
}

// 刷新数据
const refreshData = async () => {
  loading.value = true
  try {
    await Promise.all([
      fetchDashboardStats(),
      fetchRecentActivities()
    ])
    ElMessage.success('数据刷新成功')
  } catch (error) {
    console.error('刷新数据失败:', error)
    ElMessage.error('刷新数据失败')
  } finally {
    loading.value = false
  }
}

// 处理快捷操作点击
const handleQuickAction = (action: string) => {
  switch (action) {
    case 'documents':
      // 跳转到文档管理页面
      router.push('/documents')
      break
    case 'create-kb':
      // 跳转到知识库页面
      router.push('/knowledge-base')
      break
    case 'chat':
      // 跳转到知识库页面（开始对话）
      router.push('/knowledge-base')
      break
    case 'analysis':
      // 跳转到分析页面
      router.push('/agent')
      break
  }
}

onMounted(() => {
  // 初始化页面数据
  refreshData()
})
</script>

<template>
  <div class="dashboard p-6 space-y-6">
    <!-- 页面标题 -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
          仪表板
        </h1>
        <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
          欢迎回来！这里是您的PDF文献智能分析服务概览
        </p>
      </div>
      <el-button 
        type="primary" 
        :loading="loading"
        @click="refreshData"
      >
        <el-icon class="mr-1">
          <Refresh />
        </el-icon>
        刷新数据
      </el-button>
    </div>

    <!-- 统计卡片 -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
      <el-card 
        v-for="stat in stats" 
        :key="stat.title"
        class="stat-card cursor-pointer"
        shadow="hover"
        :body-style="{ padding: '24px' }"
        v-loading="statsLoading"
      >
        <div class="flex items-center justify-between">
          <div class="flex-1">
            <div class="flex items-center space-x-3 mb-3">
              <div 
                :class="[
                  'p-2 rounded-xl',
                  stat.color === 'blue' ? 'bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/30' :
                  stat.color === 'green' ? 'bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/30' :
                  'bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/30'
                ]"
              >
                <el-icon 
                  size="20"
                  :class="[
                    stat.color === 'blue' ? 'text-blue-600 dark:text-blue-400' :
                    stat.color === 'green' ? 'text-green-600 dark:text-green-400' :
                    'text-purple-600 dark:text-purple-400'
                  ]"
                >
                  <component :is="stat.icon" />
                </el-icon>
              </div>
              <h3 class="text-sm font-medium text-gray-600 dark:text-gray-400">{{ stat.title }}</h3>
            </div>
            <div class="flex items-end">
              <span class="text-3xl font-bold text-gray-900 dark:text-white">
                {{ stat.value }}
              </span>
            </div>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 快捷操作 -->
    <el-card shadow="hover" :body-style="{ padding: '32px' }">
      <template #header>
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-2">
            <el-icon class="text-blue-600 dark:text-blue-400">
              <Lightning />
            </el-icon>
            <span class="text-lg font-semibold text-gray-900 dark:text-white">快捷操作</span>
          </div>
        </div>
      </template>
      
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div
          v-for="action in quickActions"
          :key="action.action"
          @click="handleQuickAction(action.action)"
          class="action-card p-6 border-2 border-gray-100 dark:border-gray-700 rounded-xl cursor-pointer transition-all duration-300 group hover:shadow-lg"
          :class="[
            action.color === 'blue' ? 'hover:border-blue-300 dark:hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-900/10' :
            action.color === 'green' ? 'hover:border-green-300 dark:hover:border-green-500 hover:bg-green-50/50 dark:hover:bg-green-900/10' :
            action.color === 'purple' ? 'hover:border-purple-300 dark:hover:border-purple-500 hover:bg-purple-50/50 dark:hover:bg-purple-900/10' :
            'hover:border-orange-300 dark:hover:border-orange-500 hover:bg-orange-50/50 dark:hover:bg-orange-900/10'
          ]"
        >
          <div class="flex flex-col items-center text-center space-y-4">
            <div 
              :class="[
                'p-4 rounded-2xl transition-all duration-300 group-hover:scale-110',
                action.color === 'blue' ? 'bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/40' :
                action.color === 'green' ? 'bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900/30 dark:to-green-800/40' :
                action.color === 'purple' ? 'bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900/30 dark:to-purple-800/40' :
                'bg-gradient-to-br from-orange-100 to-orange-200 dark:from-orange-900/30 dark:to-orange-800/40'
              ]"
            >
              <el-icon 
                size="24"
                :class="[
                  action.color === 'blue' ? 'text-blue-600 dark:text-blue-400' :
                  action.color === 'green' ? 'text-green-600 dark:text-green-400' :
                  action.color === 'purple' ? 'text-purple-600 dark:text-purple-400' :
                  'text-orange-600 dark:text-orange-400'
                ]"
              >
                <component :is="action.icon" />
              </el-icon>
            </div>
            <div>
              <h3 class="text-base font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {{ action.title }}
              </h3>
              <p class="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                {{ action.description }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </el-card>

    <!-- 最近活动 -->
    <el-card shadow="hover" :body-style="{ padding: '32px' }">
      <template #header>
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-2">
            <el-icon class="text-green-600 dark:text-green-400">
              <Clock />
            </el-icon>
            <span class="text-lg font-semibold text-gray-900 dark:text-white">最近活动</span>
          </div>
          <el-button type="primary" text size="small" class="hover:bg-blue-50 dark:hover:bg-blue-900/20">
            查看全部
            <el-icon class="ml-1">
              <ArrowRight />
            </el-icon>
          </el-button>
        </div>
      </template>
      
      <div class="space-y-4" v-loading="activitiesLoading">
        <div 
          v-if="recentActivities.length === 0 && !activitiesLoading"
          class="text-center py-8 text-gray-500 dark:text-gray-400"
        >
          <el-icon size="48" class="mb-4">
            <DocumentCopy />
          </el-icon>
          <p>暂无最近活动</p>
        </div>
        <div 
          v-for="activity in recentActivities"
          :key="activity.id"
          class="activity-item flex items-center space-x-4 p-4 hover:bg-gray-50 dark:hover:bg-gray-700/30 rounded-xl transition-all duration-200 group"
        >
          <div 
            :class="[
              'w-12 h-12 rounded-xl flex items-center justify-center transition-transform duration-200 group-hover:scale-110',
              activity.type === 'upload' ? 'bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/40' :
              activity.type === 'chat' ? 'bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900/30 dark:to-purple-800/40' :
              activity.type === 'knowledge' ? 'bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900/30 dark:to-green-800/40' :
              activity.type === 'analysis' ? 'bg-gradient-to-br from-orange-100 to-orange-200 dark:from-orange-900/30 dark:to-orange-800/40' :
              'bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-900/30 dark:to-gray-800/40'
            ]"
          >
            <el-icon 
              size="18"
              :class="[
                activity.type === 'upload' ? 'text-blue-600 dark:text-blue-400' :
                activity.type === 'chat' ? 'text-purple-600 dark:text-purple-400' :
                activity.type === 'knowledge' ? 'text-green-600 dark:text-green-400' :
                activity.type === 'analysis' ? 'text-orange-600 dark:text-orange-400' :
                'text-gray-600 dark:text-gray-400'
              ]"
            >
              <UploadFilled v-if="activity.type === 'upload'" />
              <ChatDotRound v-else-if="activity.type === 'chat'" />
              <Collection v-else-if="activity.type === 'knowledge'" />
              <DataAnalysis v-else-if="activity.type === 'analysis'" />
              <Document v-else />
            </el-icon>
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium text-gray-900 dark:text-white truncate">
              {{ activity.title }}
            </p>
            <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {{ activity.time }}
            </p>
          </div>
          <el-tag 
            :type="activity.status === 'completed' ? 'success' : 'warning'"
            size="small"
            round
          >
            {{ activity.status === 'completed' ? '已完成' : '处理中' }}
          </el-tag>
        </div>
      </div>
    </el-card>
  </div>
</template>

<style scoped>
.dashboard {
  animation: fadeInUp 0.8s ease-out;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  min-height: 100vh;
}

.dark .dashboard {
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.stat-card {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid transparent;
  background: linear-gradient(145deg, #ffffff 0%, #f8fafc 100%);
}

.dark .stat-card {
  background: linear-gradient(145deg, #1e293b 0%, #334155 100%);
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  border-color: #e2e8f0;
}

.dark .stat-card:hover {
  border-color: #475569;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.2);
}

.action-card {
  background: linear-gradient(145deg, #ffffff 0%, #f8fafc 100%);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.dark .action-card {
  background: linear-gradient(145deg, #1e293b 0%, #334155 100%);
}

.action-card:hover {
  transform: translateY(-2px);
}

.activity-item {
  border-left: 3px solid transparent;
  transition: all 0.2s ease;
}

.activity-item:hover {
  border-left-color: #3b82f6;
  background: linear-gradient(90deg, rgba(59, 130, 246, 0.05) 0%, transparent 100%);
}

.dark .activity-item:hover {
  background: linear-gradient(90deg, rgba(59, 130, 246, 0.1) 0%, transparent 100%);
}

/* 卡片渐入动画 */
.stat-card,
.action-card {
  animation: slideInUp 0.6s ease-out forwards;
}

.stat-card:nth-child(1) { animation-delay: 0.1s; }
.stat-card:nth-child(2) { animation-delay: 0.2s; }
.stat-card:nth-child(3) { animation-delay: 0.3s; }

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style> 