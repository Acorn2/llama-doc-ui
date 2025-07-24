<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import AppHeader from './AppHeader.vue'
import AppSidebar from './AppSidebar.vue'

const route = useRoute()
const isCollapsed = ref(false)
const windowWidth = ref(0)

// 根据屏幕大小自动折叠侧边栏
const handleResize = () => {
  if (typeof window !== 'undefined') {
    windowWidth.value = window.innerWidth
    if (window.innerWidth < 1024) {
      isCollapsed.value = true
    }
  }
}

// 初始化和清理
onMounted(() => {
  if (typeof window !== 'undefined') {
    handleResize() // 初始化时执行一次
    window.addEventListener('resize', handleResize)
  }
})

onUnmounted(() => {
  if (typeof window !== 'undefined') {
    window.removeEventListener('resize', handleResize)
  }
})

const toggleSidebar = () => {
  isCollapsed.value = !isCollapsed.value
}

const pageTitle = computed(() => {
  return route.meta?.title || '仪表板'
})

// 计算属性用于安全地检查窗口大小
const isMobile = computed(() => {
  return windowWidth.value > 0 && windowWidth.value < 1024
})
</script>

<template>
  <div class="app-layout min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
    <!-- 侧边栏 -->
    <app-sidebar 
      :collapsed="isCollapsed"
      @toggle="toggleSidebar"
      class="fixed top-0 left-0 z-40 h-full transition-transform duration-300 ease-in-out lg:translate-x-0"
      :class="{ '-translate-x-full': isCollapsed && isMobile }"
    />
    
    <!-- 遮罩层 (移动端) -->
    <div 
      v-show="!isCollapsed && isMobile"
      class="fixed inset-0 z-30 bg-black bg-opacity-50 lg:hidden"
      @click="toggleSidebar"
    />
    
    <!-- 主内容区域 -->
    <div 
      class="transition-all duration-300 ease-in-out"
      :class="[
        isCollapsed ? 'lg:ml-16' : 'lg:ml-64',
        'min-h-screen'
      ]"
    >
      <!-- 顶部导航 -->
      <app-header 
        :title="pageTitle"
        :sidebar-collapsed="isCollapsed"
        @toggle-sidebar="toggleSidebar"
        class="sticky top-0 z-20 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700"
      />
      
      <!-- 页面内容 -->
      <main class="p-4 lg:p-6">
        <div class="max-w-7xl mx-auto">
          <router-view v-slot="{ Component }">
            <transition
              name="fade"
              mode="out-in"
              appear
            >
              <component :is="Component" />
            </transition>
          </router-view>
        </div>
      </main>
    </div>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* 确保移动端侧边栏正确显示 */
@media (max-width: 1023px) {
  .app-layout {
    overflow-x: hidden;
  }
}
</style> 