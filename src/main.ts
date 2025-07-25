import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import 'element-plus/theme-chalk/dark/css-vars.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

import App from './App.vue'
import { routes } from './router/routes'
import { setupRouterGuards } from './router/guards'

// 样式导入
import './styles/index.scss'
import 'normalize.css'

// 创建应用实例
const app = createApp(App)

// 创建状态管理
const pinia = createPinia()

// 创建路由
const router = createRouter({
  history: createWebHistory(),
  routes
})

// 设置路由守卫
setupRouterGuards(router)

// 注册Element Plus图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

// 使用插件
app.use(pinia)
app.use(router)
app.use(ElementPlus)

// 挂载应用
app.mount('#app') 