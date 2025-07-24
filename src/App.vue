<script setup lang="ts">
import { onMounted } from 'vue'

// 初始化应用
onMounted(() => {
  // 设置主题
  const savedTheme = localStorage.getItem('theme')
  if (savedTheme) {
    document.documentElement.setAttribute('data-theme', savedTheme)
    // 为 Tailwind 添加 dark 类
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  } else if (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    document.documentElement.setAttribute('data-theme', 'dark')
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.setAttribute('data-theme', 'light')
    document.documentElement.classList.remove('dark')
  }
})
</script>

<template>
  <div id="app" class="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
    <router-view />
  </div>
</template>

<style scoped>
#app {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
</style> 