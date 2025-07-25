<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/store/modules/user'
import type { RegisterData } from '@/types/user'

const router = useRouter()
const userStore = useUserStore()

// 表单数据
const registerForm = reactive<RegisterData & { confirmPassword: string }>({
  username: '',
  email: '',
  phone: '',
  password: '',
  confirmPassword: '',
  full_name: ''
})

// 自定义验证函数
const validateConfirmPassword = (rule: any, value: string, callback: any) => {
  if (value !== registerForm.password) {
    callback(new Error('两次密码输入不一致'))
  } else {
    callback()
  }
}

const validateEmailOrPhone = (rule: any, value: string, callback: any) => {
  if (!registerForm.email && !registerForm.phone) {
    callback(new Error('邮箱和手机号至少填写一个'))
  } else {
    callback()
  }
}

// 表单验证规则
const rules = {
  username: [
    { min: 2, max: 20, message: '用户名长度为2-20个字符', trigger: 'blur' }
  ],
  email: [
    { 
      pattern: /^\w+@\w+\.\w+$/, 
      message: '请输入有效的邮箱地址', 
      trigger: 'blur' 
    },
    { validator: validateEmailOrPhone, trigger: 'blur' }
  ],
  phone: [
    { 
      pattern: /^1[3-9]\d{9}$/, 
      message: '请输入有效的手机号', 
      trigger: 'blur' 
    },
    { validator: validateEmailOrPhone, trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 32, message: '密码长度为6-32位', trigger: 'blur' },
    { 
      pattern: /^(?=.*[a-zA-Z])(?=.*\d).+$/, 
      message: '密码必须包含字母和数字', 
      trigger: 'blur' 
    }
  ],
  confirmPassword: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    { validator: validateConfirmPassword, trigger: 'blur' }
  ],
  full_name: [
    { min: 2, max: 10, message: '姓名长度为2-10个字符', trigger: 'blur' }
  ]
}

const formRef = ref()
const loading = ref(false)
const agreed = ref(false)

// 处理注册
const handleRegister = async () => {
  if (!formRef.value) return
  
  if (!agreed.value) {
    ElMessage.warning('请先同意用户协议和隐私政策')
    return
  }
  
  try {
    await formRef.value.validate()
    loading.value = true
    
    // 准备注册数据
    const { confirmPassword, ...registerData } = registerForm
    
    // 清理空字段
    Object.keys(registerData).forEach(key => {
      if (!registerData[key as keyof typeof registerData]) {
        delete registerData[key as keyof typeof registerData]
      }
    })
    
    await userStore.register(registerData)
    
    // 注册成功，跳转到登录页面
    router.push('/login')
    
  } catch (error) {
    console.error('注册失败:', error)
  } finally {
    loading.value = false
  }
}

// 跳转到登录页面
const goToLogin = () => {
  router.push('/login')
}
</script>

<template>
  <div class="register-container min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-pink-900/20 flex items-center justify-center p-4">
    <div class="register-card w-full max-w-lg">
      <!-- Logo和标题 -->
      <div class="text-center mb-10">
        <div class="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-500 via-pink-500 to-rose-500 rounded-3xl mb-6 shadow-lg">
          <el-icon size="36" class="text-white">
            <UserFilled />
          </el-icon>
        </div>
        <h1 class="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-200 bg-clip-text text-transparent mb-3">
          创建账号
        </h1>
        <p class="text-gray-600 dark:text-gray-400 text-lg">
          加入PDF智能分析服务，开启智能文献分析之旅
        </p>
      </div>

      <!-- 注册表单 -->
      <el-card class="register-form-card backdrop-blur-sm">
        <template #header>
          <div class="text-center">
            <h2 class="text-2xl font-bold text-gray-800 dark:text-white mb-2">
              注册新账号
            </h2>
            <p class="text-gray-600 dark:text-gray-400">
              请填写以下信息完成注册
            </p>
          </div>
        </template>

        <el-form
          ref="formRef"
          :model="registerForm"
          :rules="rules"
          size="large"
          class="register-form"
          label-position="top"
          @submit.prevent="handleRegister"
        >
          <!-- 用户名 -->
          <el-form-item prop="username" class="form-item-custom">
            <template #label>
              <span class="form-label">用户名 <span class="text-gray-400">(可选)</span></span>
            </template>
            <el-input
              v-model="registerForm.username"
              placeholder="请输入用户名"
              :prefix-icon="User"
              clearable
              class="form-input-custom"
            />
          </el-form-item>

          <!-- 邮箱和手机号 -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <el-form-item prop="email" class="form-item-custom">
              <template #label>
                <span class="form-label">邮箱</span>
              </template>
              <el-input
                v-model="registerForm.email"
                placeholder="请输入邮箱"
                :prefix-icon="Message"
                clearable
                class="form-input-custom"
              />
            </el-form-item>

            <el-form-item prop="phone" class="form-item-custom">
              <template #label>
                <span class="form-label">手机号</span>
              </template>
              <el-input
                v-model="registerForm.phone"
                placeholder="请输入手机号"
                :prefix-icon="Phone"
                clearable
                class="form-input-custom"
              />
            </el-form-item>
          </div>

          <div class="text-xs text-orange-600 dark:text-orange-400 -mt-3 mb-4 bg-orange-50 dark:bg-orange-900/20 p-3 rounded-lg border border-orange-200 dark:border-orange-800">
            <el-icon class="mr-1"><InfoFilled /></el-icon>
            邮箱和手机号至少填写一个，用于账号登录和找回密码
          </div>

          <!-- 密码 -->
          <el-form-item prop="password" class="form-item-custom">
            <template #label>
              <span class="form-label">密码</span>
            </template>
            <el-input
              v-model="registerForm.password"
              type="password"
              placeholder="请输入密码（至少6位，包含字母和数字）"
              :prefix-icon="Lock"
              show-password
              clearable
              class="form-input-custom"
            />
          </el-form-item>

          <!-- 确认密码 -->
          <el-form-item prop="confirmPassword" class="form-item-custom">
            <template #label>
              <span class="form-label">确认密码</span>
            </template>
            <el-input
              v-model="registerForm.confirmPassword"
              type="password"
              placeholder="请再次输入密码"
              :prefix-icon="Lock"
              show-password
              clearable
              class="form-input-custom"
            />
          </el-form-item>

          <!-- 真实姓名 -->
          <el-form-item prop="full_name" class="form-item-custom">
            <template #label>
              <span class="form-label">真实姓名 <span class="text-gray-400">(可选)</span></span>
            </template>
            <el-input
              v-model="registerForm.full_name"
              placeholder="请输入真实姓名"
              :prefix-icon="Avatar"
              clearable
              class="form-input-custom"
            />
          </el-form-item>

          <!-- 协议同意 -->
          <el-form-item class="form-item-custom">
            <el-checkbox v-model="agreed" class="agreement-checkbox">
              <span class="text-sm">
                我已阅读并同意
                <el-button type="text" class="agreement-link">《用户协议》</el-button>
                和
                <el-button type="text" class="agreement-link">《隐私政策》</el-button>
              </span>
            </el-checkbox>
          </el-form-item>

          <!-- 注册按钮 -->
          <el-form-item class="form-item-custom">
            <el-button
              type="primary"
              size="large"
              :loading="loading"
              @click="handleRegister"
              class="register-btn w-full"
            >
              <span v-if="!loading">
                <el-icon class="mr-2"><CircleCheckFilled /></el-icon>
                立即注册
              </span>
              <span v-else>注册中...</span>
            </el-button>
          </el-form-item>
        </el-form>

        <!-- 分割线 -->
        <div class="flex items-center my-6">
          <div class="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent dark:via-gray-600"></div>
          <span class="px-4 text-sm text-gray-500 dark:text-gray-400">已有账号？</span>
          <div class="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent dark:via-gray-600"></div>
        </div>

        <!-- 登录链接 -->
        <div class="text-center">
          <el-button 
            @click="goToLogin" 
            class="login-link-btn w-full"
            size="large"
          >
            <el-icon class="mr-2"><Right /></el-icon>
            直接登录
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
        <p>注册即表示您同意我们的服务条款</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.register-container {
  position: relative;
  animation: fadeIn 1s ease-out;
  background-attachment: fixed;
}

.register-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: 
    radial-gradient(circle at 20% 20%, rgba(147, 51, 234, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 80% 80%, rgba(236, 72, 153, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 40% 60%, rgba(251, 113, 133, 0.05) 0%, transparent 50%);
  pointer-events: none;
}

.register-card {
  position: relative;
  z-index: 1;
  animation: slideUp 0.8s ease-out;
}

.register-form-card {
  background: rgba(255, 255, 255, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 
    0 25px 50px -12px rgba(0, 0, 0, 0.1),
    0 0 0 1px rgba(255, 255, 255, 0.05);
}

[data-theme="dark"] .register-form-card {
  background: rgba(31, 41, 55, 0.95);
  border: 1px solid rgba(75, 85, 99, 0.2);
  box-shadow: 
    0 25px 50px -12px rgba(0, 0, 0, 0.3),
    0 0 0 1px rgba(75, 85, 99, 0.1);
}

.register-form .form-item-custom {
  margin-bottom: 24px;
}

.register-form .form-label {
  font-size: 14px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  display: block;
  margin-bottom: 8px;
}

.register-btn {
  height: 56px;
  font-size: 16px;
  font-weight: 600;
  background: linear-gradient(135deg, #9333ea 0%, #c026d3 50%, #e91e63 100%);
  border: none;
  box-shadow: 0 4px 20px rgba(147, 51, 234, 0.3);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.register-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(147, 51, 234, 0.4);
  background: linear-gradient(135deg, #7c3aed 0%, #a21caf 50%, #be185d 100%);
}

.register-btn:active {
  transform: translateY(0);
}

.login-link-btn {
  height: 48px;
  background: transparent;
  border: 2px solid var(--el-color-primary);
  color: var(--el-color-primary);
  font-weight: 600;
  transition: all 0.3s ease;
}

.login-link-btn:hover {
  background: var(--el-color-primary);
  color: white;
  transform: translateY(-1px);
  box-shadow: 0 4px 15px rgba(147, 51, 234, 0.3);
}

.agreement-checkbox :deep(.el-checkbox__label) {
  color: var(--el-text-color-regular);
  font-size: 14px;
  line-height: 1.6;
}

.agreement-link {
  color: var(--el-color-primary);
  font-size: 14px;
  padding: 0 2px;
  text-decoration: none;
  font-weight: 600;
}

.agreement-link:hover {
  color: var(--el-color-primary-dark-2);
  text-decoration: underline;
}

/* 提示信息样式 */
.info-tip {
  background: linear-gradient(135deg, rgba(251, 146, 60, 0.1) 0%, rgba(251, 113, 133, 0.1) 100%);
  border: 1px solid rgba(251, 146, 60, 0.2);
}

[data-theme="dark"] .info-tip {
  background: linear-gradient(135deg, rgba(251, 146, 60, 0.15) 0%, rgba(251, 113, 133, 0.15) 100%);
  border-color: rgba(251, 146, 60, 0.3);
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
@media (max-width: 768px) {
  .register-container {
    padding: 1rem;
  }
  
  .register-card {
    max-width: 100%;
  }
  
  .register-form-card :deep(.el-card__body) {
    padding: 24px 20px;
  }
  
  .register-form-card :deep(.el-card__header) {
    padding: 24px 20px 0;
  }
  
  .grid-cols-1.md\\:grid-cols-2 {
    grid-template-columns: 1fr;
    gap: 0;
  }
  
  .register-btn {
    height: 50px;
    font-size: 15px;
  }
  
  .login-link-btn {
    height: 44px;
  }
}

@media (max-width: 480px) {
  .register-container {
    padding: 0.5rem;
  }
  
  .register-form .form-item-custom {
    margin-bottom: 20px;
  }
}

/* 高对比度模式支持 */
@media (prefers-contrast: high) {
  .register-form-card {
    border-width: 2px;
    border-color: var(--el-border-color);
  }
  
  .register-btn {
    border: 2px solid #9333ea;
  }
  
  .agreement-link {
    text-decoration: underline;
  }
}

/* 减少动画的偏好设置 */
@media (prefers-reduced-motion: reduce) {
  .register-container,
  .register-card,
  .register-btn,
  .login-link-btn {
    animation: none;
    transition: none;
  }
}
</style> 