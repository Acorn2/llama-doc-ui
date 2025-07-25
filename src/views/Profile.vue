<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useUserStore } from '@/store/modules/user'
import type { UpdateUserData } from '@/types/user'

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

// 初始化表单数据
const initializeForm = () => {
  if (userStore.user) {
    const user = userStore.user
    profileForm.username = user.username || ''
    profileForm.email = user.email || ''
    profileForm.phone = user.phone || ''
    profileForm.full_name = user.full_name || ''
    profileForm.avatar_url = user.avatar_url || ''
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
    
    await userStore.updateUser(updateData)
    
  } catch (error) {
    console.error('更新个人信息失败:', error)
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
    
  } catch (error) {
    console.error('修改密码失败:', error)
  } finally {
    passwordLoading.value = false
  }
}

// 处理头像上传
const handleAvatarUpload = (response: any) => {
  // 这里处理头像上传的响应
  if (response.url) {
    profileForm.avatar_url = response.url
  }
}

onMounted(() => {
  initializeForm()
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
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                  :action="`${$api.baseURL}/api/v1/upload/avatar`"
                  :headers="{ Authorization: `Bearer ${userStore.token}` }"
                  :show-file-list="false"
                  :on-success="handleAvatarUpload"
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