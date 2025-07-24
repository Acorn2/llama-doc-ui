<script setup lang="ts">
import { ref, onMounted } from 'vue'

const isDark = ref(false)

// 切换主题
const toggleTheme = () => {
  isDark.value = !isDark.value
  const theme = isDark.value ? 'dark' : 'light'
  
  // 更新DOM
  document.documentElement.setAttribute('data-theme', theme)
  
  // 保存到本地存储
  localStorage.setItem('theme', theme)
  
  // 同时更新Element Plus的暗色模式
  if (isDark.value) {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
}

// 初始化主题
const initTheme = () => {
  // 检查本地存储的主题设置
  const savedTheme = localStorage.getItem('theme')
  
  if (savedTheme) {
    isDark.value = savedTheme === 'dark'
  } else {
    // 如果没有保存的设置，则根据系统偏好设置
    isDark.value = window.matchMedia('(prefers-color-scheme: dark)').matches
  }
  
  // 应用主题
  const theme = isDark.value ? 'dark' : 'light'
  document.documentElement.setAttribute('data-theme', theme)
  
  if (isDark.value) {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
}

// 监听系统主题变化
const watchSystemTheme = () => {
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
  
  mediaQuery.addEventListener('change', (e) => {
    // 只有在用户没有手动设置主题时才跟随系统
    if (!localStorage.getItem('theme')) {
      isDark.value = e.matches
      const theme = isDark.value ? 'dark' : 'light'
      document.documentElement.setAttribute('data-theme', theme)
      
      if (isDark.value) {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
    }
  })
}

onMounted(() => {
  initTheme()
  watchSystemTheme()
})
</script>

<template>
  <el-button
    type="text"
    @click="toggleTheme"
    class="!p-2 transition-all duration-300 ease-in-out"
    :title="isDark ? '切换到浅色模式' : '切换到深色模式'"
  >
    <transition name="theme-fade" mode="out-in">
      <el-icon 
        v-if="isDark" 
        key="sun"
        size="18" 
        class="text-yellow-500 hover:text-yellow-400 transition-colors duration-200"
      >
        <Sunny />
      </el-icon>
      <el-icon 
        v-else 
        key="moon"
        size="18" 
        class="text-blue-600 hover:text-blue-500 transition-colors duration-200"
      >
        <Moon />
      </el-icon>
    </transition>
  </el-button>
</template>

<style scoped>
.theme-fade-enter-active,
.theme-fade-leave-active {
  transition: all 0.3s ease;
}

.theme-fade-enter-from {
  opacity: 0;
  transform: rotate(-90deg) scale(0.8);
}

.theme-fade-leave-to {
  opacity: 0;
  transform: rotate(90deg) scale(0.8);
}

/* 按钮悬停效果 */
.el-button:hover {
  background-color: var(--color-menu-hover);
  transform: scale(1.05);
}
</style> 