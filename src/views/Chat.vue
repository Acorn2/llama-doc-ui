<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'

const messages = ref([
  {
    id: '1',
    role: 'user',
    content: '请帮我总结机器学习的基本概念',
    create_time: '2024-01-20 10:30:00'
  },
  {
    id: '2',
    role: 'assistant', 
    content: '机器学习是人工智能的一个分支，它使计算机能够在没有明确编程的情况下学习和做出决策。主要包括监督学习、无监督学习和强化学习三大类型...',
    create_time: '2024-01-20 10:30:15'
  }
])

const currentMessage = ref('')
const loading = ref(false)
const messagesContainer = ref<HTMLElement>()

onMounted(() => {
  console.log('Chat page mounted')
  scrollToBottom()
})

const scrollToBottom = () => {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  })
}

const sendMessage = () => {
  if (!currentMessage.value.trim()) return
  
  const userMessage = {
    id: Date.now().toString(),
    role: 'user' as const,
    content: currentMessage.value,
    create_time: new Date().toLocaleString()
  }
  
  messages.value.push(userMessage)
  currentMessage.value = ''
  
  // 模拟AI回复
  loading.value = true
  setTimeout(() => {
    const aiMessage = {
      id: (Date.now() + 1).toString(),
      role: 'assistant' as const,
      content: '这是一个模拟的AI回复。在实际应用中，这里会调用后端API获取真实的AI响应。',
      create_time: new Date().toLocaleString()
    }
    messages.value.push(aiMessage)
    loading.value = false
    scrollToBottom()
  }, 1000)
  
  scrollToBottom()
}

const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault()
    sendMessage()
  }
}
</script>

<template>
  <div class="chat-page h-full flex flex-col">
    <!-- 聊天头部 -->
    <div class="chat-header p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-xl font-semibold text-gray-900 dark:text-white">智能对话</h1>
          <p class="text-sm text-gray-500 dark:text-gray-400">与AI助手进行智能对话</p>
        </div>
        <el-button size="small">
          <el-icon class="mr-1"><Delete /></el-icon>
          清空对话
        </el-button>
      </div>
    </div>

    <!-- 消息区域 -->
    <div 
      ref="messagesContainer"
      class="messages-container flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900"
    >
      <div 
        v-for="message in messages" 
        :key="message.id"
        :class="[
          'flex',
          message.role === 'user' ? 'justify-end' : 'justify-start'
        ]"
      >
        <div 
          :class="[
            'max-w-xs lg:max-w-md xl:max-w-lg px-4 py-3 rounded-lg',
            message.role === 'user' 
              ? 'bg-blue-600 text-white' 
              : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700'
          ]"
        >
          <div class="text-sm">{{ message.content }}</div>
          <div 
            :class="[
              'text-xs mt-2 opacity-70',
              message.role === 'user' ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'
            ]"
          >
            {{ message.create_time }}
          </div>
        </div>
      </div>

      <!-- AI回复加载状态 -->
      <div v-if="loading" class="flex justify-start">
        <div class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-3">
          <div class="flex items-center space-x-2">
            <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <span class="text-sm text-gray-500 dark:text-gray-400">AI正在思考...</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 输入区域 -->
    <div class="chat-input p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
      <div class="flex items-end space-x-3">
        <div class="flex-1">
          <el-input
            v-model="currentMessage"
            type="textarea"
            :rows="1"
            :autosize="{ minRows: 1, maxRows: 4 }"
            placeholder="输入您的问题..."
            @keydown="handleKeydown"
            :disabled="loading"
          />
        </div>
        <el-button 
          type="primary" 
          @click="sendMessage"
          :disabled="!currentMessage.trim() || loading"
        >
          <el-icon><Promotion /></el-icon>
        </el-button>
      </div>
      
      <div class="flex items-center justify-between mt-2 text-xs text-gray-500 dark:text-gray-400">
        <span>按 Enter 发送，Shift + Enter 换行</span>
        <span>{{ currentMessage.length }}/2000</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.chat-page {
  height: calc(100vh - 64px); /* 减去header高度 */
}

.messages-container {
  scrollbar-width: thin;
  scrollbar-color: #cbd5e0 transparent;
}

.messages-container::-webkit-scrollbar {
  width: 6px;
}

.messages-container::-webkit-scrollbar-track {
  background: transparent;
}

.messages-container::-webkit-scrollbar-thumb {
  background-color: #cbd5e0;
  border-radius: 3px;
}

.messages-container::-webkit-scrollbar-thumb:hover {
  background-color: #a0aec0;
}
</style> 