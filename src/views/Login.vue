<template>
  <div class="login-page min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
    <div class="max-w-md w-full space-y-8">
      <div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
          登录到您的账户
        </h2>
        <p class="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
          PDF文献智能分析服务
        </p>
      </div>
      
      <el-card class="login-card" shadow="hover">
        <el-form
          ref="loginFormRef"
          :model="loginForm"
          :rules="loginRules"
          label-width="0"
          size="large"
        >
          <el-form-item prop="login_credential">
            <el-input
              v-model="loginForm.login_credential"
              placeholder="请输入邮箱或手机号"
              prefix-icon="User"
              clearable
            />
          </el-form-item>
          
          <el-form-item prop="password">
            <el-input
              v-model="loginForm.password"
              type="password"
              placeholder="请输入密码"
              prefix-icon="Lock"
              show-password
              clearable
              @keyup.enter="handleLogin"
            />
          </el-form-item>
          
          <el-form-item>
            <el-button
              type="primary"
              size="large"
              :loading="loading"
              @click="handleLogin"
              class="w-full"
            >
              登录
            </el-button>
          </el-form-item>
        </el-form>
        
        <div class="text-center mt-4">
          <el-link type="primary" @click="showRegister = true">
            还没有账户？立即注册
          </el-link>
        </div>
      </el-card>
    </div>
    
    <!-- 注册对话框 -->
    <el-dialog
      v-model="showRegister"
      title="用户注册"
      width="400px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="registerFormRef"
        :model="registerForm"
        :rules="registerRules"
        label-width="80px"
      >
        <el-form-item label="用户名" prop="username">
          <el-input v-model="registerForm.username" placeholder="请输入用户名" />
        </el-form-item>
        
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="registerForm.email" placeholder="请输入邮箱" />
        </el-form-item>
        
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="registerForm.phone" placeholder="请输入手机号" />
        </el-form-item>
        
        <el-form-item label="密码" prop="password">
          <el-input
            v-model="registerForm.password"
            type="password"
            placeholder="请输入密码"
            show-password
          />
        </el-form-item>
        
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input
            v-model="registerForm.confirmPassword"
            type="password"
            placeholder="请确认密码"
            show-password
          />
        </el-form-item>
        
        <el-form-item label="全名" prop="full_name">
          <el-input v-model="registerForm.full_name" placeholder="请输入全名（可选）" />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="showRegister = false">取消</el-button>
        <el-button type="primary" :loading="registerLoading" @click="handleRegister">
          注册
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElMessage, ElForm } from 'element-plus'
import { UserAPI, type LoginRequest, type RegisterRequest } from '@/api/modules/user'
import { setToken, setUserInfo } from '@/utils/auth'

// 表单引用
const loginFormRef = ref<InstanceType<typeof ElForm>>()
const registerFormRef = ref<InstanceType<typeof ElForm>>()

// 加载状态
const loading = ref(false)
const registerLoading = ref(false)
const showRegister = ref(false)

// 登录表单
const loginForm = reactive<LoginRequest>({
  login_credential: '',
  password: ''
})

// 注册表单
const registerForm = reactive<RegisterRequest & { confirmPassword: string }>({
  username: '',
  email: '',
  phone: '',
  password: '',
  confirmPassword: '',
  full_name: ''
})

// 登录表单验证规则
const loginRules = {
  login_credential: [
    { required: true, message: '请输入邮箱或手机号', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度至少6位', trigger: 'blur' }
  ]
}

// 注册表单验证规则
const registerRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' }
  ],
  email: [
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ],
  phone: [
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度至少6位', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    {
      validator: (rule: any, value: string, callback: Function) => {
        if (value !== registerForm.password) {
          callback(new Error('两次输入的密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
}

// 处理登录
const handleLogin = async () => {
  if (!loginFormRef.value) return
  
  try {
    const valid = await loginFormRef.value.validate()
    if (!valid) return
    
    loading.value = true
    const response = await UserAPI.login(loginForm)
    
    // 保存token和用户信息
    setToken(response.access_token)
    setUserInfo(response.user)
    
    ElMessage.success('登录成功')
    
    // 跳转到仪表板
    window.location.href = '/dashboard'
    
  } catch (error: any) {
    console.error('登录失败:', error)
    const errorMessage = error.response?.data?.detail || error.message || '登录失败'
    ElMessage.error(errorMessage)
  } finally {
    loading.value = false
  }
}

// 处理注册
const handleRegister = async () => {
  if (!registerFormRef.value) return
  
  try {
    const valid = await registerFormRef.value.validate()
    if (!valid) return
    
    // 检查邮箱和手机号至少填一个
    if (!registerForm.email && !registerForm.phone) {
      ElMessage.error('邮箱和手机号至少填写一个')
      return
    }
    
    registerLoading.value = true
    
    // 准备注册数据
    const registerData: RegisterRequest = {
      username: registerForm.username,
      password: registerForm.password,
      full_name: registerForm.full_name || undefined
    }
    
    if (registerForm.email) {
      registerData.email = registerForm.email
    }
    if (registerForm.phone) {
      registerData.phone = registerForm.phone
    }
    
    await UserAPI.register(registerData)
    
    ElMessage.success('注册成功，请登录')
    showRegister.value = false
    
    // 清空注册表单
    Object.assign(registerForm, {
      username: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
      full_name: ''
    })
    
  } catch (error: any) {
    console.error('注册失败:', error)
    const errorMessage = error.response?.data?.detail || error.message || '注册失败'
    ElMessage.error(errorMessage)
  } finally {
    registerLoading.value = false
  }
}
</script>

<style scoped>
.login-page {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.login-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
}

.dark .login-card {
  background: rgba(31, 41, 55, 0.95);
}

.login-card :deep(.el-card__body) {
  padding: 40px;
}
</style>