<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/store/modules/user'
import type { LoginCredentials } from '@/types/user'

const router = useRouter()
const userStore = useUserStore()

// 表单数据
const loginForm = reactive<LoginCredentials>({
  login_credential: '',
  password: ''
})

// 表单验证规则
const rules = {
  login_credential: [
    { required: true, message: '请输入邮箱或手机号', trigger: 'blur' },
    { 
      pattern: /^(\w+@\w+\.\w+)|(1[3-9]\d{9})$/, 
      message: '请输入有效的邮箱或手机号', 
      trigger: 'blur' 
    }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码至少6位', trigger: 'blur' }
  ]
}

const formRef = ref()
const loading = ref(false)

// 处理登录
const handleLogin = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    loading.value = true
    
    await userStore.login(loginForm)
    
    // 登录成功，跳转到仪表板
    const redirect = router.currentRoute.value.query.redirect as string
    router.push(redirect || '/dashboard')
    
  } catch (error) {
    console.error('登录失败:', error)
  } finally {
    loading.value = false
  }
}

// 跳转到注册页面
const goToRegister = () => {
  router.push('/register')
}
</script>

<template>
  <div class="login-container min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20 flex items-center justify-center p-4">
    <div class="login-card w-full max-w-md">
      <!-- Logo和标题 -->
      <div class="text-center mb-10">
        <div class="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 via-blue-600 to-purple-600 rounded-3xl mb-6 shadow-lg">
          <el-icon size="36" class="text-white">
            <Reading />
          </el-icon>
        </div>
        <h1 class="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-200 bg-clip-text text-transparent mb-3">
          PDF智能分析
        </h1>
        <p class="text-gray-600 dark:text-gray-400 text-lg">
          基于大语言模型的文献智能分析服务
        </p>
      </div>

      <!-- 登录表单 -->
      <el-card class="login-form-card backdrop-blur-sm">
        <template #header>
          <div class="text-center">
            <h2 class="text-2xl font-bold text-gray-800 dark:text-white mb-2">
              欢迎回来
            </h2>
            <p class="text-gray-600 dark:text-gray-400">
              请登录您的账号继续使用
            </p>
          </div>
        </template>

        <el-form
          ref="formRef"
          :model="loginForm"
          :rules="rules"
          size="large"
          class="login-form"
          @submit.prevent="handleLogin"
        >
          <el-form-item prop="login_credential" class="form-item-custom">
            <template #label>
              <span class="form-label">账号</span>
            </template>
            <el-input
              v-model="loginForm.login_credential"
              placeholder="请输入邮箱或手机号"
              :prefix-icon="User"
              clearable
              class="form-input-custom"
            />
          </el-form-item>

          <el-form-item prop="password" class="form-item-custom">
            <template #label>
              <span class="form-label">密码</span>
            </template>
            <el-input
              v-model="loginForm.password"
              type="password"
              placeholder="请输入密码"
              :prefix-icon="Lock"
              show-password
              clearable
              class="form-input-custom"
              @keyup.enter="handleLogin"
            />
          </el-form-item>

          <!-- 记住我和忘记密码 -->
          <div class="flex items-center justify-between mb-6">
            <el-checkbox size="small" class="remember-checkbox">
              记住我
            </el-checkbox>
            <el-button type="text" size="small" class="forgot-password">
              忘记密码？
            </el-button>
          </div>

          <el-form-item class="form-item-custom">
            <el-button
              type="primary"
              size="large"
              :loading="loading"
              @click="handleLogin"
              class="login-btn w-full"
            >
              <span v-if="!loading">
                <el-icon class="mr-2"><Right /></el-icon>
                立即登录
              </span>
              <span v-else>登录中...</span>
            </el-button>
          </el-form-item>
        </el-form>

        <!-- 分割线 -->
        <div class="flex items-center my-6">
          <div class="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent dark:via-gray-600"></div>
          <span class="px-4 text-sm text-gray-500 dark:text-gray-400">或</span>
          <div class="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent dark:via-gray-600"></div>
        </div>

        <!-- 注册链接 -->
        <div class="text-center">
          <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">
            还没有账号？
          </p>
          <el-button 
            @click="goToRegister" 
            class="register-link-btn w-full"
            size="large"
          >
            <el-icon class="mr-2"><Plus /></el-icon>
            创建新账号
          </el-button>
        </div>
      </el-card>

      <!-- 底部信息 -->
      <div class="text-center mt-8 text-sm text-gray-500 dark:text-gray-400 space-y-2">
        <div class="flex items-center justify-center space-x-4">
          <span>© 2024 PDF智能分析</span>
          <span>•</span>
          <span>安全可靠</span>
        </div>
        <p>基于大语言模型构建的智能文献分析平台</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.login-container {
  position: relative;
  animation: fadeIn 1s ease-out;
  background-attachment: fixed;
}

.login-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: 
    radial-gradient(circle at 20% 20%, rgba(59, 130, 246, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 80% 80%, rgba(147, 51, 234, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 40% 60%, rgba(99, 102, 241, 0.05) 0%, transparent 50%);
  pointer-events: none;
}

.login-card {
  position: relative;
  z-index: 1;
  animation: slideUp 0.8s ease-out;
}

.login-form-card {
  background: rgba(255, 255, 255, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 
    0 25px 50px -12px rgba(0, 0, 0, 0.1),
    0 0 0 1px rgba(255, 255, 255, 0.05);
}

[data-theme="dark"] .login-form-card {
  background: rgba(31, 41, 55, 0.95);
  border: 1px solid rgba(75, 85, 99, 0.2);
  box-shadow: 
    0 25px 50px -12px rgba(0, 0, 0, 0.3),
    0 0 0 1px rgba(75, 85, 99, 0.1);
}

.login-form .form-item-custom {
  margin-bottom: 28px;
}

.login-form .form-label {
  font-size: 14px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  display: block;
  margin-bottom: 8px;
}

.login-btn {
  height: 56px;
  font-size: 16px;
  font-weight: 600;
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 50%, #1e40af 100%);
  border: none;
  box-shadow: 0 4px 20px rgba(59, 130, 246, 0.3);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.login-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(59, 130, 246, 0.4);
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 50%, #1e3a8a 100%);
}

.login-btn:active {
  transform: translateY(0);
}

.register-link-btn {
  height: 48px;
  background: transparent;
  border: 2px solid var(--el-color-primary);
  color: var(--el-color-primary);
  font-weight: 600;
  transition: all 0.3s ease;
}

.register-link-btn:hover {
  background: var(--el-color-primary);
  color: white;
  transform: translateY(-1px);
  box-shadow: 0 4px 15px rgba(59, 130, 246, 0.3);
}

.remember-checkbox :deep(.el-checkbox__label) {
  color: var(--el-text-color-regular);
  font-size: 14px;
}

.forgot-password {
  color: var(--el-color-primary);
  font-size: 14px;
  padding: 0;
}

.forgot-password:hover {
  color: var(--el-color-primary-dark-2);
  text-decoration: underline;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(40px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* 响应式设计 */
@media (max-width: 640px) {
  .login-container {
    padding: 1rem;
  }
  
  .login-card {
    max-width: 100%;
  }
  
  .login-form-card :deep(.el-card__body) {
    padding: 24px 20px;
  }
  
  .login-form-card :deep(.el-card__header) {
    padding: 24px 20px 0;
  }
  
  .login-btn {
    height: 50px;
    font-size: 15px;
  }
  
  .register-link-btn {
    height: 44px;
  }
}

@media (max-width: 480px) {
  .login-container {
    padding: 0.5rem;
  }
}

/* 高对比度模式支持 */
@media (prefers-contrast: high) {
  .login-form-card {
    border-width: 2px;
    border-color: var(--el-border-color);
  }
  
  .login-btn {
    border: 2px solid #1d4ed8;
  }
}
</style> 