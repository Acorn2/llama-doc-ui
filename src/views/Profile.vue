<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useUserStore } from '@/store/modules/user'
import type { UpdateUserData } from '@/types/user'
import { ElMessage } from 'element-plus'

const userStore = useUserStore()

// 表单数据
const profileForm = reactive<UpdateUserData>({
  username: '',
  email: '',
  phone: '',
  full_name: '',
  avatar_url: ''
})

const passwordForm = reactive({
  password: '',
  confirmPassword: ''
})

// 验证规则
const profileRules = {
  username: [
    { min: 2, max: 20, message: '用户名长度为2-20个字符', trigger: 'blur' }
  ],
  email: [
    { pattern: /^\w+@\w+\.\w+$/, message: '请输入有效的邮箱地址', trigger: 'blur' }
  ],
  phone: [
    { pattern: /^1[3-9]\d{9}$/, message: '请输入有效的手机号', trigger: 'blur' }
  ],
  full_name: [
    { min: 2, max: 10, message: '姓名长度为2-10个字符', trigger: 'blur' }
  ]
}

const passwordRules = {
  password: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, max: 32, message: '密码长度为6-32位', trigger: 'blur' },
    { 
      pattern: /^(?=.*[a-zA-Z])(?=.*\d).+$/, 
      message: '密码必须包含字母和数字', 
      trigger: 'blur' 
    }
  ],
  confirmPassword: [
    { required: true, message: '请确认新密码', trigger: 'blur' },
    {
      validator: (rule: any, value: string, callback: any) => {
        if (value !== passwordForm.password) {
          callback(new Error('两次密码输入不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
}

const profileFormRef = ref()
const passwordFormRef = ref()
const profileLoading = ref(false)
const passwordLoading = ref(false)
const pageLoading = ref(true)
const userActivities = ref<any[]>([])
const activityStats = ref<any>(null)

// 初始化表单数据
const initializeForm = async () => {
  try {
    // 如果没有用户信息，先获取当前用户信息
    if (!userStore.user) {
      await userStore.getCurrentUser()
    }
    
    if (userStore.user) {
      const user = userStore.user
      profileForm.username = user.username || ''
      profileForm.email = user.email || ''
      profileForm.phone = user.phone || ''
      profileForm.full_name = user.full_name || ''
      profileForm.avatar_url = user.avatar_url || ''
    }
  } catch (error) {
    console.error('初始化用户信息失败:', error)
  }
}

// 更新个人信息
const updateProfile = async () => {
  if (!profileFormRef.value) return
  
  try {
    await profileFormRef.value.validate()
    profileLoading.value = true
    
    // 清理空字段
    const updateData: UpdateUserData = {}
    Object.keys(profileForm).forEach(key => {
      const value = profileForm[key as keyof UpdateUserData]
      if (value && value.trim()) {
        updateData[key as keyof UpdateUserData] = value.trim()
      }
    })
    
    if (Object.keys(updateData).length === 0) {
      ElMessage.warning('没有需要更新的信息')
      return
    }
    
    await userStore.updateUser(updateData)
    ElMessage.success('个人信息更新成功')
    
  } catch (error) {
    console.error('更新个人信息失败:', error)
    ElMessage.error('更新个人信息失败，请稍后重试')
  } finally {
    profileLoading.value = false
  }
}

// 修改密码
const updatePassword = async () => {
  if (!passwordFormRef.value) return
  
  try {
    await passwordFormRef.value.validate()
    passwordLoading.value = true
    
    await userStore.updateUser({ password: passwordForm.password })
    
    // 清空密码表单
    passwordForm.password = ''
    passwordForm.confirmPassword = ''
    passwordFormRef.value.resetFields()
    
    ElMessage.success('密码修改成功')
    
  } catch (error) {
    console.error('修改密码失败:', error)
    ElMessage.error('修改密码失败，请稍后重试')
  } finally {
    passwordLoading.value = false
  }
}

// 处理头像文件选择
const handleAvatarChange = (file: any) => {
  // 简单的文件预览，实际项目中需要上传到服务器
  const reader = new FileReader()
  reader.onload = (e) => {
    profileForm.avatar_url = e.target?.result as string
  }
  reader.readAsDataURL(file.raw)
}

// 加载用户活动记录
const loadUserActivities = async () => {
  try {
    const activities = await userStore.getUserActivities({ limit: 10 })
    userActivities.value = activities
  } catch (error) {
    console.error('加载用户活动失败:', error)
  }
}

// 加载活动统计
const loadActivityStats = async () => {
  try {
    const stats = await userStore.getUserActivityStats({ days: 30 })
    activityStats.value = stats.data
  } catch (error) {
    console.error('加载活动统计失败:', error)
  }
}

// 获取活动类型中文名称
const getActivityTypeName = (type: string): string => {
  const typeMap: Record<string, string> = {
    'user_login': '用户登录',
    'user_logout': '用户登出',
    'user_register': '用户注册',
    'document_upload': '文档上传',
    'document_delete': '文档删除',
    'document_view': '文档查看',
    'kb_create': '创建知识库',
    'kb_update': '更新知识库',
    'kb_delete': '删除知识库',
    'kb_view': '查看知识库',
    'kb_like': '点赞知识库',
    'conversation_create': '创建对话',
    'conversation_chat': '进行对话',
    'agent_chat': 'Agent对话',
    'agent_analyze': 'Agent分析',
    'agent_search': 'Agent搜索',
    'agent_summary': 'Agent摘要'
  }
  return typeMap[type] || type
}

// 刷新数据
const refreshData = async () => {
  try {
    pageLoading.value = true
    await Promise.all([
      initializeForm(),
      loadUserActivities(),
      loadActivityStats()
    ])
    ElMessage.success('数据刷新成功')
  } catch (error) {
    console.error('刷新数据失败:', error)
    ElMessage.error('刷新数据失败，请稍后重试')
  } finally {
    pageLoading.value = false
  }
}

onMounted(async () => {
  try {
    pageLoading.value = true
    await initializeForm()
    
    // 并行加载用户活动和统计数据
    await Promise.all([
      loadUserActivities(),
      loadActivityStats()
    ])
  } catch (error) {
    console.error('页面初始化失败:', error)
  } finally {
    pageLoading.value = false
  }
})
</script>

<template>
  <div class="profile p-6 space-y-6">
    <!-- 页面标题 -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
          个人资料
        </h1>
        <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
          管理您的个人信息和账户设置
        </p>
      </div>
      <el-button 
        @click="refreshData" 
        :loading="pageLoading"
        type="primary" 
        plain
      >
        {{ pageLoading ? '刷新中...' : '刷新数据' }}
      </el-button>
    </div>

    <!-- 页面加载状态 -->
    <div v-if="pageLoading" class="flex justify-center items-center py-12">
      <el-icon class="is-loading" size="32">
        <Loading />
      </el-icon>
      <span class="ml-2 text-gray-600 dark:text-gray-400">加载中...</span>
    </div>

    <div v-else class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- 基本信息 -->
      <el-card>
        <template #header>
          <div class="flex items-center space-x-2">
            <el-icon class="text-blue-500"><User /></el-icon>
            <span class="font-semibold">基本信息</span>
          </div>
        </template>

        <el-form
          ref="profileFormRef"
          :model="profileForm"
          :rules="profileRules"
          label-position="top"
          size="large"
        >
          <!-- 头像 -->
          <el-form-item label="头像">
            <div class="flex items-center space-x-4">
              <el-avatar
                :size="80"
                :src="profileForm.avatar_url"
                class="border-2 border-gray-200 dark:border-gray-600"
              >
                <el-icon size="32"><Avatar /></el-icon>
              </el-avatar>
              <div>
                <el-upload
                  action="#"
                  :auto-upload="false"
                  :show-file-list="false"
                  :on-change="handleAvatarChange"
                  accept="image/*"
                >
                  <el-button size="small">更换头像</el-button>
                </el-upload>
                <p class="text-xs text-gray-500 mt-1">支持 JPG、PNG 格式，不超过 2MB</p>
              </div>
            </div>
          </el-form-item>

          <!-- 用户名 -->
          <el-form-item label="用户名" prop="username">
            <el-input
              v-model="profileForm.username"
              placeholder="请输入用户名"
              clearable
            />
          </el-form-item>

          <!-- 真实姓名 -->
          <el-form-item label="真实姓名" prop="full_name">
            <el-input
              v-model="profileForm.full_name"
              placeholder="请输入真实姓名"
              clearable
            />
          </el-form-item>

          <!-- 邮箱 -->
          <el-form-item label="邮箱" prop="email">
            <el-input
              v-model="profileForm.email"
              placeholder="请输入邮箱地址"
              clearable
            />
          </el-form-item>

          <!-- 手机号 -->
          <el-form-item label="手机号" prop="phone">
            <el-input
              v-model="profileForm.phone"
              placeholder="请输入手机号"
              clearable
            />
          </el-form-item>

          <el-form-item>
            <el-button
              type="primary"
              :loading="profileLoading"
              @click="updateProfile"
            >
              {{ profileLoading ? '保存中...' : '保存更改' }}
            </el-button>
          </el-form-item>
        </el-form>
      </el-card>

      <!-- 安全设置 -->
      <div class="space-y-6">
        <!-- 修改密码 -->
        <el-card>
          <template #header>
            <div class="flex items-center space-x-2">
              <el-icon class="text-orange-500"><Lock /></el-icon>
              <span class="font-semibold">修改密码</span>
            </div>
          </template>

          <el-form
            ref="passwordFormRef"
            :model="passwordForm"
            :rules="passwordRules"
            label-position="top"
            size="large"
          >
            <el-form-item label="新密码" prop="password">
              <el-input
                v-model="passwordForm.password"
                type="password"
                placeholder="请输入新密码"
                show-password
                clearable
              />
            </el-form-item>

            <el-form-item label="确认新密码" prop="confirmPassword">
              <el-input
                v-model="passwordForm.confirmPassword"
                type="password"
                placeholder="请再次输入新密码"
                show-password
                clearable
              />
            </el-form-item>

            <el-form-item>
              <el-button
                type="warning"
                :loading="passwordLoading"
                @click="updatePassword"
              >
                {{ passwordLoading ? '修改中...' : '修改密码' }}
              </el-button>
            </el-form-item>
          </el-form>
        </el-card>

        <!-- 账户信息 -->
        <el-card>
          <template #header>
            <div class="flex items-center space-x-2">
              <el-icon class="text-green-500"><InfoFilled /></el-icon>
              <span class="font-semibold">账户信息</span>
            </div>
          </template>

          <div class="space-y-4" v-if="userStore.user">
            <div class="flex justify-between items-center">
              <span class="text-gray-600 dark:text-gray-400">用户ID:</span>
              <span class="font-mono text-sm">{{ userStore.user.id }}</span>
            </div>

            <div class="flex justify-between items-center">
              <span class="text-gray-600 dark:text-gray-400">注册时间:</span>
              <span>{{ new Date(userStore.user.create_time).toLocaleString() }}</span>
            </div>

            <div class="flex justify-between items-center" v-if="userStore.user.last_login_time">
              <span class="text-gray-600 dark:text-gray-400">最近登录:</span>
              <span>{{ new Date(userStore.user.last_login_time).toLocaleString() }}</span>
            </div>

            <div class="flex justify-between items-center">
              <span class="text-gray-600 dark:text-gray-400">账户状态:</span>
              <el-tag :type="userStore.user.is_active ? 'success' : 'danger'">
                {{ userStore.user.is_active ? '正常' : '已禁用' }}
              </el-tag>
            </div>

            <div class="flex justify-between items-center" v-if="userStore.user.is_superuser">
              <span class="text-gray-600 dark:text-gray-400">用户类型:</span>
              <el-tag type="warning">超级用户</el-tag>
            </div>
          </div>
        </el-card>

        <!-- 最近活动 -->
        <el-card>
          <template #header>
            <div class="flex items-center space-x-2">
              <el-icon class="text-purple-500"><Clock /></el-icon>
              <span class="font-semibold">最近活动</span>
            </div>
          </template>

          <div class="space-y-3">
            <div v-if="userActivities.length === 0" class="text-center py-4">
              <el-icon size="32" class="text-gray-400"><DocumentCopy /></el-icon>
              <p class="text-gray-500 dark:text-gray-400 mt-2">暂无活动记录</p>
            </div>
            
            <div v-else>
              <div 
                v-for="activity in userActivities.slice(0, 5)" 
                :key="activity.id"
                class="flex items-start space-x-3 py-2 border-b border-gray-100 dark:border-gray-700 last:border-b-0"
              >
                <div class="flex-shrink-0 mt-1">
                  <div class="w-2 h-2 bg-blue-500 rounded-full"></div>
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm text-gray-900 dark:text-white">
                    {{ activity.activity_description }}
                  </p>
                  <p class="text-xs text-gray-500 dark:text-gray-400">
                    {{ new Date(activity.create_time).toLocaleString() }}
                  </p>
                </div>
              </div>
              
              <div class="pt-3 text-center" v-if="userActivities.length > 5">
                <el-button size="small" text type="primary">
                  查看更多活动
                </el-button>
              </div>
            </div>
          </div>
        </el-card>

        <!-- 活动统计 -->
        <el-card v-if="activityStats">
          <template #header>
            <div class="flex items-center space-x-2">
              <el-icon class="text-green-500"><DataAnalysis /></el-icon>
              <span class="font-semibold">活动统计</span>
            </div>
          </template>

          <div class="space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <div class="text-center">
                <div class="text-2xl font-bold text-blue-600">
                  {{ activityStats.total_activities }}
                </div>
                <div class="text-sm text-gray-500">总活动数</div>
              </div>
              <div class="text-center">
                <div class="text-2xl font-bold text-green-600">
                  {{ activityStats.period_days }}
                </div>
                <div class="text-sm text-gray-500">统计天数</div>
              </div>
            </div>
            
            <div v-if="activityStats.activity_by_type" class="space-y-2">
              <h4 class="text-sm font-medium text-gray-900 dark:text-white">
                活动类型分布
              </h4>
              <div 
                v-for="(count, type) in activityStats.activity_by_type" 
                :key="type"
                class="flex justify-between items-center text-sm"
              >
                <span class="text-gray-600 dark:text-gray-400">{{ getActivityTypeName(type) }}</span>
                <span class="font-medium">{{ count }}</span>
              </div>
            </div>
          </div>
        </el-card>

        <!-- 危险操作 -->
        <el-card>
          <template #header>
            <div class="flex items-center space-x-2">
              <el-icon class="text-red-500"><WarningFilled /></el-icon>
              <span class="font-semibold">危险操作</span>
            </div>
          </template>

          <div class="space-y-4">
            <div>
              <h4 class="text-sm font-medium text-gray-900 dark:text-white mb-2">
                注销账户
              </h4>
              <p class="text-sm text-gray-600 dark:text-gray-400 mb-3">
                注销账户将永久删除您的所有数据，此操作不可恢复。
              </p>
              <el-button type="danger" plain size="small" disabled>
                申请注销账户
              </el-button>
            </div>
          </div>
        </el-card>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 响应式设计 */
@media (max-width: 1024px) {
  .grid-cols-1.lg\\:grid-cols-2 {
    grid-template-columns: 1fr;
  }
}
</style> 