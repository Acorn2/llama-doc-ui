<script setup lang="ts">
import { ref, onMounted } from 'vue'

// 统计数据
const stats = ref([
  {
    title: '文档总数',
    value: '1,234',
    change: '+12%',
    changeType: 'increase',
    icon: 'Document',
    color: 'blue'
  },
  {
    title: '知识库数量',
    value: '56',
    change: '+8%',
    changeType: 'increase', 
    icon: 'Collection',
    color: 'green'
  },
  {
    title: '今日对话',
    value: '89',
    change: '+15%',
    changeType: 'increase',
    icon: 'ChatDotRound',
    color: 'purple'
  },
  {
    title: '处理任务',
    value: '23',
    change: '-5%',
    changeType: 'decrease',
    icon: 'Loading',
    color: 'orange'
  }
])

// 快捷操作
const quickActions = ref([
  {
    title: '上传文档',
    description: '上传新的PDF文档进行分析',
    icon: 'UploadFilled',
    action: 'upload',
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
const recentActivities = ref([
  {
    id: 1,
    type: 'upload',
    title: '上传了文档 "机器学习基础.pdf"',
    time: '2分钟前',
    status: 'completed'
  },
  {
    id: 2,
    type: 'chat',
    title: '与AI助手进行了对话',
    time: '5分钟前',
    status: 'completed'
  },
  {
    id: 3,
    type: 'analysis',
    title: '生成了文档摘要报告',
    time: '10分钟前',
    status: 'completed'
  },
  {
    id: 4,
    type: 'upload',
    title: '上传了文档 "深度学习进阶.pdf"',
    time: '15分钟前',
    status: 'processing'
  }
])

// 系统状态
const systemStatus = ref({
  overall: 'healthy',
  services: [
    { name: '文档处理服务', status: 'healthy' },
    { name: '向量数据库', status: 'healthy' },
    { name: 'LLM服务', status: 'healthy' },
    { name: '存储服务', status: 'warning' }
  ]
})

// 处理快捷操作点击
const handleQuickAction = (action: string) => {
  switch (action) {
    case 'upload':
      // 跳转到文档管理页面
      break
    case 'create-kb':
      // 跳转到知识库页面
      break
    case 'chat':
      // 跳转到聊天页面
      break
    case 'analysis':
      // 跳转到分析页面
      break
  }
}

// 获取状态颜色
const getStatusColor = (status: string) => {
  switch (status) {
    case 'healthy':
      return 'success'
    case 'warning':
      return 'warning'
    case 'error':
      return 'danger'
    default:
      return 'info'
  }
}

// 获取状态图标
const getStatusIcon = (status: string) => {
  switch (status) {
    case 'healthy':
      return 'CircleCheckFilled'
    case 'warning':
      return 'WarningFilled'
    case 'error':
      return 'CircleCloseFilled'
    default:
      return 'InfoFilled'
  }
}

onMounted(() => {
  // 初始化页面数据
  console.log('Dashboard mounted')
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
      <el-button type="primary" :icon="RefreshLeft">
        刷新数据
      </el-button>
    </div>

    <!-- 统计卡片 -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <el-card 
        v-for="stat in stats" 
        :key="stat.title"
        class="card-hover cursor-pointer"
        shadow="hover"
      >
        <div class="flex items-center">
          <div 
            :class="[
              'p-3 rounded-lg mr-4',
              stat.color === 'blue' ? 'bg-blue-100 dark:bg-blue-900/30' :
              stat.color === 'green' ? 'bg-green-100 dark:bg-green-900/30' :
              stat.color === 'purple' ? 'bg-purple-100 dark:bg-purple-900/30' :
              'bg-orange-100 dark:bg-orange-900/30'
            ]"
          >
            <el-icon 
              size="24"
              :class="[
                stat.color === 'blue' ? 'text-blue-600 dark:text-blue-400' :
                stat.color === 'green' ? 'text-green-600 dark:text-green-400' :
                stat.color === 'purple' ? 'text-purple-600 dark:text-purple-400' :
                'text-orange-600 dark:text-orange-400'
              ]"
            >
              <component :is="stat.icon" />
            </el-icon>
          </div>
          <div class="flex-1">
            <p class="text-sm text-gray-600 dark:text-gray-400">{{ stat.title }}</p>
            <div class="flex items-center space-x-2">
              <span class="text-2xl font-bold text-gray-900 dark:text-white">
                {{ stat.value }}
              </span>
              <span 
                :class="[
                  'text-xs px-2 py-1 rounded-full',
                  stat.changeType === 'increase' 
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                    : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                ]"
              >
                {{ stat.change }}
              </span>
            </div>
          </div>
        </div>
      </el-card>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- 快捷操作 -->
      <el-card title="快捷操作" shadow="hover">
        <template #header>
          <div class="flex items-center justify-between">
            <span class="font-semibold">快捷操作</span>
            <el-icon class="text-gray-400">
              <MoreFilled />
            </el-icon>
          </div>
        </template>
        
        <div class="grid grid-cols-2 gap-4">
          <div
            v-for="action in quickActions"
            :key="action.action"
            @click="handleQuickAction(action.action)"
            class="p-4 border border-gray-200 dark:border-gray-600 rounded-lg cursor-pointer hover:border-blue-300 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-200 group"
          >
            <div class="flex flex-col items-center text-center space-y-2">
              <div 
                :class="[
                  'p-3 rounded-lg transition-colors duration-200',
                  action.color === 'blue' ? 'bg-blue-100 dark:bg-blue-900/30 group-hover:bg-blue-200 dark:group-hover:bg-blue-900/50' :
                  action.color === 'green' ? 'bg-green-100 dark:bg-green-900/30 group-hover:bg-green-200 dark:group-hover:bg-green-900/50' :
                  action.color === 'purple' ? 'bg-purple-100 dark:bg-purple-900/30 group-hover:bg-purple-200 dark:group-hover:bg-purple-900/50' :
                  'bg-orange-100 dark:bg-orange-900/30 group-hover:bg-orange-200 dark:group-hover:bg-orange-900/50'
                ]"
              >
                <el-icon 
                  size="20"
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
                <h3 class="text-sm font-medium text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {{ action.title }}
                </h3>
                <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {{ action.description }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </el-card>

      <!-- 系统状态 -->
      <el-card title="系统状态" shadow="hover">
        <template #header>
          <div class="flex items-center justify-between">
            <span class="font-semibold">系统状态</span>
            <el-tag 
              :type="getStatusColor(systemStatus.overall)"
              size="small"
            >
              {{ systemStatus.overall === 'healthy' ? '正常' : '异常' }}
            </el-tag>
          </div>
        </template>
        
        <div class="space-y-3">
          <div 
            v-for="service in systemStatus.services"
            :key="service.name"
            class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
          >
            <div class="flex items-center space-x-3">
              <el-icon 
                :class="[
                  service.status === 'healthy' ? 'text-green-500' :
                  service.status === 'warning' ? 'text-yellow-500' :
                  'text-red-500'
                ]"
              >
                <component :is="getStatusIcon(service.status)" />
              </el-icon>
              <span class="text-sm font-medium text-gray-900 dark:text-white">
                {{ service.name }}
              </span>
            </div>
            <el-tag 
              :type="getStatusColor(service.status)"
              size="small"
            >
              {{
                service.status === 'healthy' ? '正常' :
                service.status === 'warning' ? '警告' : '错误'
              }}
            </el-tag>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 最近活动 -->
    <el-card title="最近活动" shadow="hover">
      <template #header>
        <div class="flex items-center justify-between">
          <span class="font-semibold">最近活动</span>
          <el-button type="text" size="small">
            查看全部
            <el-icon class="ml-1">
              <ArrowRight />
            </el-icon>
          </el-button>
        </div>
      </template>
      
      <div class="space-y-4">
        <div 
          v-for="activity in recentActivities"
          :key="activity.id"
          class="flex items-center space-x-4 p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg transition-colors duration-200"
        >
          <div 
            :class="[
              'w-10 h-10 rounded-full flex items-center justify-center',
              activity.type === 'upload' ? 'bg-blue-100 dark:bg-blue-900/30' :
              activity.type === 'chat' ? 'bg-purple-100 dark:bg-purple-900/30' :
              'bg-green-100 dark:bg-green-900/30'
            ]"
          >
            <el-icon 
              :class="[
                activity.type === 'upload' ? 'text-blue-600 dark:text-blue-400' :
                activity.type === 'chat' ? 'text-purple-600 dark:text-purple-400' :
                'text-green-600 dark:text-green-400'
              ]"
            >
              <UploadFilled v-if="activity.type === 'upload'" />
              <ChatDotRound v-else-if="activity.type === 'chat'" />
              <DataAnalysis v-else />
            </el-icon>
          </div>
          <div class="flex-1">
            <p class="text-sm font-medium text-gray-900 dark:text-white">
              {{ activity.title }}
            </p>
            <p class="text-xs text-gray-500 dark:text-gray-400">
              {{ activity.time }}
            </p>
          </div>
          <el-tag 
            :type="activity.status === 'completed' ? 'success' : 'warning'"
            size="small"
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

.card-hover {
  transition: all 0.3s ease;
}

.card-hover:hover {
  transform: translateY(-2px);
}
</style> 