<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

const goBack = () => {
  router.go(-1)
}

const goHome = () => {
  router.push('/dashboard')
}
</script>

<template>
  <div class="not-found min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
    <div class="text-center">
      <div class="mb-8">
        <h1 class="text-9xl font-bold text-blue-600 dark:text-blue-400">404</h1>
        <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mt-4">
          页面未找到
        </h2>
        <p class="text-gray-600 dark:text-gray-400 mt-2">
          抱歉，您访问的页面不存在或已被移动
        </p>
      </div>
      
      <div class="space-x-4">
        <el-button @click="goBack">
          <el-icon class="mr-2">
            <ArrowLeft />
          </el-icon>
          返回上页
        </el-button>
        <el-button type="primary" @click="goHome">
          <el-icon class="mr-2">
            <HomeFilled />
          </el-icon>
          回到首页
        </el-button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.not-found {
  animation: fadeIn 0.5s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
</style> 