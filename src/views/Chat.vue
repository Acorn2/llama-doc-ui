<script setup lang="ts">
import { ref, onMounted, nextTick, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  ChatDotRound, Plus, Delete, Search, MoreFilled, 
  Document, Promotion, Service, User, ArrowLeft
} from '@element-plus/icons-vue'
import { KnowledgeBaseAPI, type KnowledgeBase } from '@/api/modules/knowledge-base'
import { ConversationAPI, type Conversation, type Message } from '@/api/modules/conversation'
import MarkdownRenderer from '@/components/MarkdownRenderer.vue'

const route = useRoute()
const router = useRouter()

// 响应式数据
const knowledgeBase = ref<KnowledgeBase | null>(null)
const conversations = ref<Conversation[]>([])
const messages = ref<Message[]>([])
const currentMessage = ref('')
const loading = ref(false)
const kbLoading = ref(false)
const conversationLoading = ref(false)

// 当前选中的对话
const selectedConversation = ref<Conversation | null>(null)

// UI状态
const messagesContainer = ref<HTMLElement>()
const sidebarCollapsed = ref(false)

// 搜索
const conversationSearchQuery = ref('')

// 过滤后的对话列表
const filteredConversations = computed(() => {
  if (!conversationSearchQuery.value) return conversations.value
  return conversations.value.filter(conv => 
    conv.title.toLowerCase().includes(conversationSearchQuery.value.toLowerCase())
  )
})

// 是否可以发送消息
const canSendMessage = computed(() => {
  return knowledgeBase.value && currentMessage.value.trim() && !loading.value
})

// 获取知识库ID
const kbId = computed(() => route.params.kbId as string)

onMounted(() => {
  if (kbId.value) {
    loadKnowledgeBase()
    loadConversations()
  } else {
    ElMessage.error('缺少知识库ID参数')
    router.push('/knowledge-base')
  }
})

// 监听对话选择变化
watch(selectedConversation, (newConv) => {
  if (newConv) {
    loadMessages()
  }
})

// 加载知识库信息
const loadKnowledgeBase = async () => {
  try {
    kbLoading.value = true
    knowledgeBase.value = await KnowledgeBaseAPI.getById(kbId.value)
    
    // 记录访问行为
    KnowledgeBaseAPI.recordAccess(kbId.value, {
      access_type: 'chat',
      access_metadata: {
        source: 'direct_access',
        page: 'chat_page'
      }
    }).catch(console.error)
    
  } catch (error: any) {
    console.error('加载知识库失败:', error)
    ElMessage.error('加载知识库信息失败')
    router.push('/knowledge-base')
  } finally {
    kbLoading.value = false
  }
}

// 加载对话列表
const loadConversations = async () => {
  if (!kbId.value) return
  
  try {
    conversationLoading.value = true
    
    const result = await ConversationAPI.getList({
      kb_id: kbId.value,
      limit: 50
    })
    
    // 处理不同的响应格式
    if (Array.isArray(result)) {
      conversations.value = result
    } else if (result && result.data && Array.isArray(result.data)) {
      conversations.value = result.data
    } else if (result && result.conversations && Array.isArray(result.conversations)) {
      conversations.value = result.conversations
    } else {
      conversations.value = []
    }
    
  } catch (error: any) {
    console.error('加载对话列表失败:', error)
    ElMessage.error('加载对话列表失败')
  } finally {
    conversationLoading.value = false
  }
}

// 加载消息列表
const loadMessages = async () => {
  if (!selectedConversation.value || !selectedConversation.value.id) {
    return
  }
  
  try {
    const loadedMessages = await ConversationAPI.getMessages(selectedConversation.value.id)
    
    messages.value = loadedMessages
    
    // 强制触发响应式更新
    nextTick(() => {
      scrollToBottom()
    })
  } catch (error: any) {
    console.error('加载消息失败:', error)
    ElMessage.error('加载消息失败')
  }
}

// 创建新对话
const createNewConversation = async () => {
  if (!kbId.value) {
    ElMessage.warning('知识库信息缺失')
    return
  }
  
  // 只清空当前对话和消息，不调用后端接口
  selectedConversation.value = null
  messages.value = []
  
  // 不显示成功消息，让用户直接开始输入
}

// 发送消息
const sendMessage = async () => {
  if (!canSendMessage.value || loading.value) return
  
  // 防止重复调用
  if (loading.value) {
    return
  }
  
  const messageContent = currentMessage.value.trim()
  currentMessage.value = ''
  
  // 添加用户消息到界面
  const userMessage: Message = {
    id: Date.now().toString(),
    conversation_id: selectedConversation.value?.id || '',
    role: 'user',
    content: messageContent,
    create_time: new Date().toISOString()
  }
  messages.value.push(userMessage)
  scrollToBottom()
  
  try {
    loading.value = true
    
    // 如果没有选中对话，先创建一个
    let conversationId = selectedConversation.value?.id
    if (!conversationId) {
      const newConversation = await ConversationAPI.create({
        kb_id: kbId.value,
        title: messageContent.slice(0, 20) + '...'
      })
      
      // 验证新对话的ID
      if (!newConversation || !newConversation.id) {
        throw new Error('创建对话失败')
      }
      
      // 确保响应式更新
      conversations.value = [newConversation, ...conversations.value]
      selectedConversation.value = newConversation
      conversationId = newConversation.id
      userMessage.conversation_id = conversationId
      
      // 强制触发响应式更新
      nextTick(() => {
      })
    }
    
    // 创建AI回复消息占位符
    const aiMessage: Message = {
      id: `temp-${Date.now()}`,
      conversation_id: conversationId,
      role: 'assistant',
      content: '',
      create_time: new Date().toISOString()
    }
    messages.value.push(aiMessage)
    scrollToBottom()
    
    // 使用流式对话接口
    // 确保conversationId不为空
    if (!conversationId) {
      throw new Error('对话ID缺失')
    }
    
    const stream = await ConversationAPI.chatStream({
      conversation_id: conversationId,
      kb_id: kbId.value,
      message: messageContent,
      use_agent: false
    })
    
    // 处理流式响应
    const reader = stream.getReader()
    const decoder = new TextDecoder()
    let buffer = ''
    
    try {
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        
        // 将新数据添加到缓冲区
        buffer += decoder.decode(value, { stream: true })
        
        // 按行分割处理
        const lines = buffer.split('\n')
        // 保留最后一个可能不完整的行
        buffer = lines.pop() || ''
        
        for (const line of lines) {
          const trimmedLine = line.trim()
          if (!trimmedLine) continue
          
          if (trimmedLine.startsWith('data: ')) {
            const data = trimmedLine.slice(6).trim()
            
            // 检查是否是结束标志
            if (data === '[DONE]') {
              break
            }
            
            // 跳过空数据
            if (!data) continue
            
            try {
              const parsed = JSON.parse(data)
              
              // 确保AI消息仍然存在于消息列表中
              const aiMessageIndex = messages.value.findIndex(msg => msg.id === aiMessage.id)
              if (aiMessageIndex === -1) {
                messages.value.push(aiMessage)
              }
              
              // 处理增量内容
              if (parsed.content) {
                aiMessage.content += parsed.content
                // 使用nextTick确保DOM更新
                nextTick(() => {
                  // 触发响应式更新，但保持引用稳定
                  const currentMessages = [...messages.value]
                  const targetIndex = currentMessages.findIndex(msg => msg.id === aiMessage.id)
                  if (targetIndex !== -1) {
                    currentMessages[targetIndex] = { ...aiMessage }
                    messages.value = currentMessages
                  }
                  scrollToBottom()
                })
              }
              
              // 处理完整消息信息
              if (parsed.message_id && parsed.message_id !== aiMessage.id) {
                aiMessage.id = parsed.message_id
              }
              
              if (parsed.create_time) {
                aiMessage.create_time = parsed.create_time
              }
              
              // 处理完整响应（非流式情况的兼容）
              if (parsed.response && !aiMessage.content) {
                aiMessage.content = parsed.response
                if (parsed.message_id) aiMessage.id = parsed.message_id
                if (parsed.create_time) aiMessage.create_time = parsed.create_time
                nextTick(() => {
                  const currentMessages = [...messages.value]
                  const targetIndex = currentMessages.findIndex(msg => msg.id === aiMessage.id)
                  if (targetIndex !== -1) {
                    currentMessages[targetIndex] = { ...aiMessage }
                    messages.value = currentMessages
                  }
                  scrollToBottom()
                })
              }
              
            } catch (parseError) {
              // 解析失败，跳过这条数据
            }
          }
        }
      }
      
      // 处理缓冲区中剩余的数据
      if (buffer.trim()) {
        const trimmedBuffer = buffer.trim()
        if (trimmedBuffer.startsWith('data: ')) {
          const data = trimmedBuffer.slice(6).trim()
          if (data && data !== '[DONE]') {
            try {
              const parsed = JSON.parse(data)
              if (parsed.content) {
                aiMessage.content += parsed.content
                nextTick(() => {
                  const currentMessages = [...messages.value]
                  const targetIndex = currentMessages.findIndex(msg => msg.id === aiMessage.id)
                  if (targetIndex !== -1) {
                    currentMessages[targetIndex] = { ...aiMessage }
                    messages.value = currentMessages
                  }
                  scrollToBottom()
                })
              }
            } catch (parseError) {
              // 解析失败，跳过
            }
          }
        }
      }
      
    } finally {
      reader.releaseLock()
    }
    
    // 如果AI消息为空，显示错误信息
    if (!aiMessage.content.trim()) {
      aiMessage.content = '抱歉，AI助手暂时无法回复，请稍后重试。'
      nextTick(() => {
        const currentMessages = [...messages.value]
        const targetIndex = currentMessages.findIndex(msg => msg.id === aiMessage.id)
        if (targetIndex !== -1) {
          currentMessages[targetIndex] = { ...aiMessage }
          messages.value = currentMessages
        }
      })
    }
    
    // 流式对话完成后，不需要重新加载消息列表，因为我们已经在本地维护了消息
    
  } catch (error: any) {
    
    // 根据错误类型提供不同的处理
    if (error.message && error.message.includes('创建对话失败')) {
      ElMessage.error('创建对话失败：' + error.message)
      
      // 移除用户消息（因为对话创建失败）
      messages.value.pop()
      return
    }
    
    // 如果是流式对话失败，尝试使用普通聊天接口作为备用
    if (selectedConversation.value?.id) {
      try {
        const response = await ConversationAPI.chat({
          conversation_id: selectedConversation.value.id,
          kb_id: kbId.value,
          message: messageContent,
          use_agent: false
        })
        
        // 找到最后一个AI消息并更新（避免重复）
        const aiMessageIndex = messages.value.length - 1
        if (aiMessageIndex >= 0 && messages.value[aiMessageIndex].role === 'assistant') {
          // 使用nextTick确保DOM更新稳定
          nextTick(() => {
            const currentMessages = [...messages.value]
            currentMessages[aiMessageIndex] = {
              ...currentMessages[aiMessageIndex],
              id: response.message_id,
              content: response.content,
              create_time: response.create_time
            }
            messages.value = currentMessages
            scrollToBottom()
          })
          
          ElMessage.success('消息发送成功（使用备用接口）')
          return
        } else {
          // 如果没有找到AI消息占位符，创建一个新的
          const newAiMessage: Message = {
            id: response.message_id,
            conversation_id: selectedConversation.value.id,
            role: 'assistant',
            content: response.content,
            create_time: response.create_time
          }
          nextTick(() => {
            messages.value = [...messages.value, newAiMessage]
            scrollToBottom()
          })
          ElMessage.success('消息发送成功（使用备用接口）')
          return
        }
        
      } catch (fallbackError: any) {
        ElMessage.error('发送消息失败：' + (fallbackError.message || '网络连接异常'))
        
        // 备用接口也失败了，移除用户消息和AI消息占位符
        nextTick(() => {
          const currentMessages = [...messages.value]
          currentMessages.pop() // 移除AI消息
          currentMessages.pop() // 移除用户消息
          messages.value = currentMessages
        })
      }
    } else {
      ElMessage.error('发送消息失败：' + (error.message || '请检查网络连接'))
      
      // 没有有效的对话ID，移除用户消息和AI消息占位符
      nextTick(() => {
        const currentMessages = [...messages.value]
        currentMessages.pop() // 移除AI消息
        currentMessages.pop() // 移除用户消息
        messages.value = currentMessages
      })
    }
  } finally {
    loading.value = false
  }
}

// 删除对话
const deleteConversation = async (conversation: Conversation) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除对话"${conversation.title}"吗？`,
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )
    
    await ConversationAPI.delete(conversation.id)
    
    // 从列表中移除
    const index = conversations.value.findIndex(c => c.id === conversation.id)
    if (index > -1) {
      conversations.value.splice(index, 1)
    }
    
    // 如果删除的是当前选中的对话，清空消息
    if (selectedConversation.value?.id === conversation.id) {
      selectedConversation.value = null
      messages.value = []
    }
    
    ElMessage.success('对话删除成功')
  } catch (error: any) {
    if (error === 'cancel') return
    console.error('删除对话失败:', error)
    ElMessage.error('删除对话失败')
  }
}

// 滚动到底部
const scrollToBottom = () => {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  })
}

// 处理键盘事件
const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Enter' && !event.shiftKey && !loading.value) {
    event.preventDefault()
    sendMessage()
  }
}

// 格式化时间
const formatTime = (timeStr: string) => {
  if (!timeStr) return '刚刚'
  
  const date = new Date(timeStr)
  // 检查日期是否有效
  if (isNaN(date.getTime())) return '刚刚'
  
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  
  if (diff < 60000) return '刚刚'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`
  if (diff < 604800000) return `${Math.floor(diff / 86400000)}天前`
  
  return date.toLocaleDateString('zh-CN', {
    month: 'short',
    day: 'numeric'
  })
}

// 格式化消息时间
const formatMessageTime = (timeStr: string) => {
  return new Date(timeStr).toLocaleTimeString('zh-CN', { 
    hour: '2-digit', 
    minute: '2-digit' 
  })
}

// 返回知识库
const goBackToKnowledgeBase = () => {
  router.push('/knowledge-base')
}

// 测试流式连接（开发环境使用）
const testStreamConnection = async () => {
  if (!selectedConversation.value) {
    ElMessage.warning('请先选择或创建一个对话')
    return
  }
  
  try {
    const stream = await ConversationAPI.chatStream({
      conversation_id: selectedConversation.value.id,
      kb_id: kbId.value,
      message: '测试连接',
      use_agent: false
    })
    
    const reader = stream.getReader()
    const decoder = new TextDecoder()
    let testContent = ''
    
    try {
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        
        const chunk = decoder.decode(value, { stream: true })
        testContent += chunk
      }
      
      ElMessage.success('流式连接测试成功')
    } finally {
      reader.releaseLock()
    }
    
  } catch (error) {
    ElMessage.error('流式连接测试失败')
  }
}

// 测试消息加载（开发环境使用）
const testLoadMessages = async () => {
  if (!selectedConversation.value) {
    ElMessage.warning('请先选择一个对话')
    return
  }
  
  try {
    const testMessages = await ConversationAPI.getMessages(selectedConversation.value.id)
    ElMessage.success(`成功加载 ${testMessages.length} 条消息`)
  } catch (error) {
    ElMessage.error('测试加载消息失败')
  }
}

// 测试创建对话（开发环境使用）
const testCreateConversation = async () => {
  if (!kbId.value) {
    ElMessage.warning('知识库ID缺失')
    return
  }
  
  try {
    const testConversation = await ConversationAPI.create({
      kb_id: kbId.value,
      title: '测试对话'
    })
    
    ElMessage.success(`创建对话成功，ID: ${testConversation.id}`)
  } catch (error) {
    ElMessage.error('测试创建对话失败: ' + error.message)
  }
}

// 开发环境标志
const isDev = import.meta.env.DEV
</script>

<template>
  <div class="chat-page h-full flex">
    <!-- 左侧边栏 - 对话历史 -->
    <div :class="['sidebar', sidebarCollapsed ? 'w-16' : 'w-80']">
      <!-- 侧边栏头部 -->
      <div class="sidebar-header">
        <div v-if="!sidebarCollapsed" class="flex items-center justify-between">
          <div class="flex items-center space-x-3">
            <el-button @click="goBackToKnowledgeBase" type="text" size="small" class="back-btn">
              <el-icon><ArrowLeft /></el-icon>
            </el-button>
            <div class="header-info">
              <h2 class="sidebar-title">对话</h2>
            </div>
          </div>
          <el-button @click="sidebarCollapsed = true" type="text" size="small" class="collapse-btn">
            <el-icon><MoreFilled /></el-icon>
          </el-button>
        </div>
        <div v-else class="flex justify-center">
          <el-button @click="sidebarCollapsed = false" type="text" size="small" class="expand-btn">
            <el-icon><ChatDotRound /></el-icon>
          </el-button>
        </div>
      </div>

      <div v-if="!sidebarCollapsed" class="sidebar-content">
        <!-- 新建对话按钮 -->
        <div class="conversation-actions">
          <el-button 
            @click="createNewConversation" 
            type="primary" 
            class="new-chat-btn"
            :disabled="!knowledgeBase"
            plain
          >
            <el-icon class="mr-2"><Plus /></el-icon>
            新建对话
          </el-button>
        </div>

        <!-- 对话搜索 -->
        <div v-if="conversations.length > 0" class="conversation-search">
          <el-input
            v-model="conversationSearchQuery"
            placeholder="搜索对话..."
            prefix-icon="Search"
            clearable
            size="small"
          />
        </div>

        <!-- 对话列表 -->
        <div class="conversation-list">
          <div v-if="conversationLoading" class="loading-state">
            <el-skeleton :rows="3" animated />
          </div>
          
          <div v-else-if="filteredConversations.length === 0" class="empty-state">
            <div class="empty-content">
              <div class="empty-icon">
                <el-icon><ChatDotRound /></el-icon>
              </div>
              <p class="empty-text">暂无对话</p>
              <p class="empty-hint">开始新对话探索知识库</p>
            </div>
          </div>
          
          <div v-else class="conversation-items">
            <div
              v-for="conversation in filteredConversations"
              :key="conversation.id"
              :class="['conversation-item', { active: selectedConversation?.id === conversation.id }]"
              @click="selectedConversation = conversation"
            >
              <div class="conversation-content">
                <div class="conversation-title">{{ conversation.title }}</div>
                <div class="conversation-time">{{ formatTime(conversation.update_time || conversation.create_time) }}</div>
              </div>
              <el-dropdown @click.stop>
                <el-button type="text" size="small" class="conversation-menu">
                  <el-icon><MoreFilled /></el-icon>
                </el-button>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item @click="deleteConversation(conversation)">
                      <el-icon><Delete /></el-icon>
                      删除
                    </el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 主聊天区域 -->
    <div class="chat-main">
      <!-- 聊天头部 -->
      <div class="chat-header">
        <div class="flex items-center">
          <div v-if="knowledgeBase" class="kb-info">
            <h3 class="kb-name">{{ knowledgeBase.name }}</h3>
            <p class="kb-desc">{{ selectedConversation?.title || '选择或创建对话开始聊天' }}</p>
          </div>
          <div v-else class="no-kb-info">
            <h3 class="kb-name">智能对话</h3>
            <p class="kb-desc">正在加载知识库信息...</p>
          </div>
        </div>
        
        <div class="chat-actions">
          <el-button v-if="isDev" @click="loadConversations" type="text" size="small">
            <el-icon class="mr-1"><ChatDotRound /></el-icon>
            重新加载对话
          </el-button>
          <el-button v-if="isDev" @click="testCreateConversation" type="text" size="small">
            <el-icon class="mr-1"><Plus /></el-icon>
            测试创建对话
          </el-button>
          <el-button v-if="isDev && selectedConversation" @click="testLoadMessages" type="text" size="small">
            <el-icon class="mr-1"><Document /></el-icon>
            测试加载消息
          </el-button>
          <el-button v-if="isDev && selectedConversation" @click="testStreamConnection" type="text" size="small">
            <el-icon class="mr-1"><Service /></el-icon>
            测试流式连接
          </el-button>
          <el-button v-if="selectedConversation" @click="messages = []" type="text" size="small">
            <el-icon class="mr-1"><Delete /></el-icon>
            清空消息
          </el-button>
        </div>
      </div>

      <!-- 消息区域 -->
      <div 
        ref="messagesContainer"
        class="messages-container"
      >
        <!-- 加载知识库状态 -->
        <div v-if="kbLoading" class="welcome-state">
          <div class="welcome-content">
            <div class="welcome-icon">
              <el-icon class="loading-icon"><Service /></el-icon>
            </div>
            <h3 class="welcome-title">正在加载知识库</h3>
            <p class="welcome-desc">请稍候...</p>
          </div>
        </div>

        <!-- 欢迎状态 -->
        <div v-else-if="knowledgeBase && messages.length === 0 && !selectedConversation" class="welcome-state">
          <div class="welcome-content">
            <div class="welcome-icon">
              <el-icon><Service /></el-icon>
            </div>
            <h3 class="welcome-title">开始智能对话</h3>
            <p class="welcome-desc">基于"{{ knowledgeBase.name }}"知识库，获取精准答案</p>
            <div class="welcome-features">
              <div class="feature-item">
                <el-icon><Document /></el-icon>
                <span>知识库问答</span>
              </div>
              <div class="feature-item">
                <el-icon><Service /></el-icon>
                <span>AI智能助手</span>
              </div>
              <div class="feature-item">
                <el-icon><ChatDotRound /></el-icon>
                <span>上下文记忆</span>
              </div>
            </div>
            <div class="welcome-action">
              <p class="welcome-hint">在下方输入框中输入您的问题，开始智能对话</p>
            </div>
          </div>
        </div>

        <!-- 消息列表 -->
        <div v-if="messages.length > 0" class="messages-list">
          <div 
            v-for="message in messages" 
            :key="message.id"
            :class="['message-item', message.role]"
          >
            <div class="message-avatar">
              <el-icon v-if="message.role === 'user'"><User /></el-icon>
              <el-icon v-else><Service /></el-icon>
            </div>
            <div class="message-content">
              <div class="message-text">
                <div v-if="message.role === 'user'" class="user-message">
                  {{ message.content }}
                </div>
                <!-- AI消息：如果有内容则渲染Markdown，否则显示加载状态 -->
                <div v-else-if="message.content.trim()" class="ai-message">
                  <MarkdownRenderer :content="message.content" />
                </div>
                <!-- AI消息加载状态 -->
                <div v-else class="typing-indicator">
                  <div class="typing-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                  <span class="typing-text">AI正在回复...</span>
                </div>
              </div>
              <div v-if="message.content.trim()" class="message-time">{{ formatMessageTime(message.create_time) }}</div>
            </div>
          </div>


        </div>

        <!-- 空对话状态 -->
        <div v-else class="empty-chat-state">
          <div class="empty-chat-content">
            <div class="empty-chat-icon">
              <el-icon><ChatDotRound /></el-icon>
            </div>
            <h3 class="empty-chat-title">选择对话开始聊天</h3>
            <p class="empty-chat-desc">从左侧选择一个对话，或创建新对话开始与AI助手交流</p>
          </div>
        </div>
      </div>

      <!-- 输入区域 -->
      <div class="chat-input">
        <div class="input-wrapper">
          <div class="input-container">
            <div class="input-box">
              <el-input
                v-model="currentMessage"
                type="textarea"
                :rows="1"
                :autosize="{ minRows: 1, maxRows: 4 }"
                placeholder="输入您的问题..."
                @keydown="handleKeydown"
                :disabled="!knowledgeBase || loading"
                class="message-input"
              />
              <el-button 
                type="primary" 
                @click="sendMessage"
                :disabled="!canSendMessage || loading"
                class="send-button"
                :loading="loading"
              >
                <el-icon v-if="!loading"><Promotion /></el-icon>
              </el-button>
            </div>
            
            <div class="input-footer">
              <span class="input-hint">
                <el-icon class="hint-icon"><ChatDotRound /></el-icon>
                按 Enter 发送，Shift + Enter 换行
              </span>
              <span class="char-count" :class="{ 'char-limit': currentMessage.length > 1800 }">
                {{ currentMessage.length }}/2000
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 整体布局 */
.chat-page {
  height: calc(100vh - 64px);
  background: #f8fafc;
}

.dark .chat-page {
  background: #111827;
}

/* 侧边栏样式 */
.sidebar {
  background: white;
  border-right: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
  transition: width 0.3s ease;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.05);
}

.dark .sidebar {
  background: #1f2937;
  border-color: #374151;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.2);
}

.sidebar-header {
  padding: 1.25rem;
  border-bottom: 1px solid #e5e7eb;
  flex-shrink: 0;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
}

.dark .sidebar-header {
  border-color: #374151;
  background: linear-gradient(135deg, #1f2937 0%, #111827 100%);
}

.header-info {
  flex: 1;
}

.sidebar-title {
  font-size: 1.125rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
  letter-spacing: -0.025em;
}

.dark .sidebar-title {
  color: #f9fafb;
}

.back-btn {
  min-width: 36px !important;
  height: 36px !important;
  padding: 0 !important;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  transition: all 0.3s ease;
  background: rgba(102, 126, 234, 0.1);
  color: #667eea;
  border: 1px solid rgba(102, 126, 234, 0.2);
}

.back-btn:hover {
  background: rgba(102, 126, 234, 0.2);
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(102, 126, 234, 0.2);
}

.dark .back-btn {
  background: rgba(102, 126, 234, 0.2);
  border-color: rgba(102, 126, 234, 0.3);
}

.dark .back-btn:hover {
  background: rgba(102, 126, 234, 0.3);
}

.collapse-btn,
.expand-btn {
  min-width: 32px !important;
  height: 32px !important;
  padding: 0 !important;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  transition: all 0.3s ease;
  color: #6b7280;
}

.collapse-btn:hover,
.expand-btn:hover {
  background-color: #f3f4f6;
  color: #374151;
  transform: scale(1.05);
}

.dark .collapse-btn:hover,
.dark .expand-btn:hover {
  background-color: #4b5563;
  color: #f3f4f6;
}

.loading-icon {
  animation: spin 2s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.sidebar-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* 知识库选择器 */
.kb-selector {
  padding: 1rem;
  border-bottom: 1px solid #e5e7eb;
  flex-shrink: 0;
}

.dark .kb-selector {
  border-color: #374151;
}

.section-title {
  font-size: 0.875rem;
  font-weight: 500;
  color: #6b7280;
  margin-bottom: 0.75rem;
}

.dark .section-title {
  color: #9ca3af;
}

/* 对话操作 */
.conversation-actions {
  padding: 1rem;
  border-bottom: 1px solid #e5e7eb;
  flex-shrink: 0;
}

.dark .conversation-actions {
  border-color: #374151;
}

.new-chat-btn {
  width: 100%;
  height: 44px !important;
  border-radius: 12px !important;
  font-weight: 600;
  font-size: 0.875rem;
  border: 2px solid #667eea !important;
  color: #667eea !important;
  background: transparent !important;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.new-chat-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(102, 126, 234, 0.1), transparent);
  transition: left 0.5s ease;
}

.new-chat-btn:hover::before {
  left: 100%;
}

.new-chat-btn:hover {
  background: #667eea !important;
  color: white !important;
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
}

.new-chat-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none !important;
  box-shadow: none !important;
}

.new-chat-btn:disabled:hover {
  background: transparent !important;
  color: #667eea !important;
}

.dark .new-chat-btn {
  border-color: #667eea !important;
  color: #667eea !important;
}

.dark .new-chat-btn:hover {
  background: #667eea !important;
  color: white !important;
}

/* 对话搜索 */
.conversation-search {
  padding: 0 1rem 1rem;
  border-bottom: 1px solid #e5e7eb;
  flex-shrink: 0;
}

.dark .conversation-search {
  border-color: #374151;
}

.conversation-search :deep(.el-input__wrapper) {
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  transition: all 0.3s ease;
  background: #f8fafc;
}

.conversation-search :deep(.el-input__wrapper:hover) {
  border-color: #d1d5db;
  background: #f3f4f6;
}

.conversation-search :deep(.el-input__wrapper.is-focus) {
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  background: white;
}

.dark .conversation-search :deep(.el-input__wrapper) {
  background: #374151;
  border-color: #4b5563;
}

.dark .conversation-search :deep(.el-input__wrapper:hover) {
  border-color: #6b7280;
  background: #4b5563;
}

.dark .conversation-search :deep(.el-input__wrapper.is-focus) {
  background: #374151;
}

/* 对话列表 */
.conversation-list {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.loading-state {
  padding: 1rem;
}

.empty-state,
.no-kb-selected {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem 1rem;
}

.empty-content {
  text-align: center;
}

.empty-icon {
  width: 64px;
  height: 64px;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(102, 126, 234, 0.05) 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.5rem;
  color: #667eea;
  font-size: 1.5rem;
  border: 2px solid rgba(102, 126, 234, 0.1);
}

.dark .empty-icon {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.2) 0%, rgba(102, 126, 234, 0.1) 100%);
  border-color: rgba(102, 126, 234, 0.2);
}

.empty-text {
  font-size: 1rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 0.5rem 0;
}

.dark .empty-text {
  color: #f9fafb;
}

.empty-hint {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0;
  line-height: 1.5;
}

.dark .empty-hint {
  color: #9ca3af;
}



.conversation-items {
  flex: 1;
  overflow-y: auto;
  padding: 0.5rem 0;
}

.conversation-item {
  display: flex;
  align-items: center;
  padding: 0.75rem 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  border-left: 3px solid transparent;
  border-radius: 0 12px 12px 0;
  margin: 0 0.5rem 0.25rem 0;
  position: relative;
  min-height: 48px;
}

.conversation-item::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  background: transparent;
  border-radius: 0 12px 12px 0;
  transition: all 0.3s ease;
  z-index: -1;
}

.conversation-item:hover::before {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.08) 0%, rgba(102, 126, 234, 0.04) 100%);
}

.conversation-item:hover {
  transform: translateX(6px);
}

.dark .conversation-item:hover::before {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.15) 0%, rgba(102, 126, 234, 0.08) 100%);
}

.conversation-item.active {
  border-left-color: #667eea;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.12) 0%, rgba(102, 126, 234, 0.06) 100%);
  transform: translateX(6px);
}

.dark .conversation-item.active {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.25) 0%, rgba(102, 126, 234, 0.12) 100%);
}

.conversation-content {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.conversation-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: #1f2937;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.4;
  margin: 0;
}

.conversation-time {
  font-size: 0.75rem;
  color: #9ca3af;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.dark .conversation-title {
  color: #f9fafb;
}

.conversation-item.active .conversation-title {
  color: #667eea;
  font-weight: 700;
}

.conversation-menu {
  opacity: 0;
  transition: opacity 0.2s ease;
}

.conversation-item:hover .conversation-menu {
  opacity: 1;
}

/* 主聊天区域 */
.chat-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: white;
}

.dark .chat-main {
  background: #1f2937;
}

/* 聊天头部 */
.chat-header {
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
}

.dark .chat-header {
  border-color: #374151;
}

.kb-info,
.no-kb-info {
  flex: 1;
}

.kb-name {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 0.25rem 0;
}

.dark .kb-name {
  color: #f9fafb;
}

.kb-desc {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0;
}

.dark .kb-desc {
  color: #9ca3af;
}

.chat-actions {
  display: flex;
  gap: 0.5rem;
}

/* 消息容器 */
.messages-container {
  flex: 1;
  overflow-y: auto;
  background: #f8fafc;
  display: flex;
  flex-direction: column;
}

.dark .messages-container {
  background: #111827;
}

/* 欢迎状态 */
.welcome-state {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.welcome-content {
  text-align: center;
  max-width: 400px;
}

.welcome-icon {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.5rem;
  color: white;
  font-size: 2rem;
}

.welcome-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 1rem 0;
}

.dark .welcome-title {
  color: #f9fafb;
}

.welcome-desc {
  color: #6b7280;
  margin: 0 0 2rem 0;
  line-height: 1.6;
}

.dark .welcome-desc {
  color: #9ca3af;
}

.welcome-features {
  display: flex;
  justify-content: center;
  gap: 2rem;
  flex-wrap: wrap;
  margin-bottom: 2rem;
}

.feature-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  color: #6b7280;
  font-size: 0.875rem;
}

.dark .feature-item {
  color: #9ca3af;
}

.feature-item .el-icon {
  font-size: 1.5rem;
  color: #667eea;
}

.welcome-action {
  text-align: center;
}

.welcome-hint {
  color: #667eea;
  font-size: 0.875rem;
  font-weight: 500;
  margin: 0;
  padding: 1rem 2rem;
  background: rgba(102, 126, 234, 0.1);
  border-radius: 12px;
  border: 1px solid rgba(102, 126, 234, 0.2);
  display: inline-block;
}

.dark .welcome-hint {
  background: rgba(102, 126, 234, 0.2);
  border-color: rgba(102, 126, 234, 0.3);
}

/* 消息列表 */
.messages-list {
  flex: 1;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.message-item {
  display: flex;
  gap: 0.75rem;
  max-width: 80%;
}

.message-item.user {
  align-self: flex-end;
  flex-direction: row-reverse;
}

.message-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-size: 1rem;
}

.message-item.user .message-avatar {
  background: #667eea;
  color: white;
}

.message-item.assistant .message-avatar {
  background: #f3f4f6;
  color: #6b7280;
}

.dark .message-item.assistant .message-avatar {
  background: #374151;
  color: #9ca3af;
}

.message-content {
  flex: 1;
  min-width: 0;
}

.message-text {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 0.75rem 1rem;
  color: #1f2937;
  line-height: 1.5;
  word-wrap: break-word;
}

.message-item.user .message-text {
  background: #667eea;
  border-color: #667eea;
  color: white;
}

.dark .message-text {
  background: #374151;
  border-color: #4b5563;
  color: #f9fafb;
}

.dark .message-item.user .message-text {
  background: #667eea;
  border-color: #667eea;
}

.message-time {
  font-size: 0.75rem;
  color: #9ca3af;
  margin-top: 0.25rem;
  text-align: right;
}

.message-item.user .message-time {
  text-align: left;
}

/* 用户消息样式 */
.user-message {
  color: inherit;
  line-height: 1.6;
}

/* AI消息的Markdown渲染区域样式调整 */
.message-item.assistant .message-text {
  padding: 1.25rem 1.5rem;
}

.message-item.assistant .markdown-content {
  color: inherit;
}

.message-item.assistant .markdown-content :deep(p:first-child) {
  margin-top: 0;
}

.message-item.assistant .markdown-content :deep(p:last-child) {
  margin-bottom: 0;
}

/* 在AI消息中的代码块样式优化 */
.message-item.assistant .markdown-content :deep(pre) {
  background-color: #1e293b !important;
  border: 1px solid #334155 !important;
  margin: 0.8em 0;
  border-radius: 8px;
}

.dark .message-item.assistant .markdown-content :deep(pre) {
  background-color: #0f172a !important;
  border-color: #1e293b !important;
}

.message-item.assistant .markdown-content :deep(code) {
  background-color: #e2e8f0 !important;
  color: #1e293b !important;
}

.dark .message-item.assistant .markdown-content :deep(code) {
  background-color: #334155 !important;
  color: #e2e8f0 !important;
}

/* AI消息中的列表样式优化 */
.message-item.assistant .markdown-content :deep(ul),
.message-item.assistant .markdown-content :deep(ol) {
  margin: 0.5em 0;
  padding-left: 1.5em;
}

.message-item.assistant .markdown-content :deep(li) {
  margin: 0.2em 0;
}

/* AI消息中的标题样式优化 */
.message-item.assistant .markdown-content :deep(h1),
.message-item.assistant .markdown-content :deep(h2),
.message-item.assistant .markdown-content :deep(h3),
.message-item.assistant .markdown-content :deep(h4),
.message-item.assistant .markdown-content :deep(h5),
.message-item.assistant .markdown-content :deep(h6) {
  margin: 1em 0 0.5em 0;
  color: inherit;
}

.message-item.assistant .markdown-content :deep(h1) {
  border-bottom: 1px solid #e5e7eb;
  padding-bottom: 0.2em;
}

.dark .message-item.assistant .markdown-content :deep(h1) {
  border-color: #374151;
}

/* AI消息中的引用样式优化 */
.message-item.assistant .markdown-content :deep(blockquote) {
  border-left: 3px solid #667eea;
  background-color: rgba(102, 126, 234, 0.05);
  margin: 0.8em 0;
  padding: 0.6em 1em;
  border-radius: 0 6px 6px 0;
}

.dark .message-item.assistant .markdown-content :deep(blockquote) {
  background-color: rgba(102, 126, 234, 0.1);
}

/* 打字指示器 */
.typing-indicator {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0;
}

/* 在消息气泡中的打字指示器样式 */
.message-text .typing-indicator {
  padding: 0.75rem 1rem;
  background: transparent;
  border: none;
  border-radius: 0;
}

.dark .typing-indicator {
  background: #374151;
  border-color: #4b5563;
}

.typing-dots {
  display: flex;
  gap: 0.25rem;
}

.typing-dots span {
  width: 6px;
  height: 6px;
  background: #9ca3af;
  border-radius: 50%;
  animation: typing 1.4s infinite ease-in-out;
}

.typing-dots span:nth-child(1) {
  animation-delay: -0.32s;
}

.typing-dots span:nth-child(2) {
  animation-delay: -0.16s;
}

@keyframes typing {
  0%, 80%, 100% {
    transform: scale(0);
  }
  40% {
    transform: scale(1);
  }
}

.typing-text {
  font-size: 0.875rem;
  color: #6b7280;
}

.dark .typing-text {
  color: #9ca3af;
}

/* 空对话状态 */
.empty-chat-state {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.empty-chat-content {
  text-align: center;
}

.empty-chat-icon {
  width: 64px;
  height: 64px;
  background: #f3f4f6;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1rem;
  color: #9ca3af;
  font-size: 1.5rem;
}

.dark .empty-chat-icon {
  background: #374151;
}

.empty-chat-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 0.5rem 0;
}

.dark .empty-chat-title {
  color: #f9fafb;
}

.empty-chat-desc {
  color: #6b7280;
  margin: 0;
}

.dark .empty-chat-desc {
  color: #9ca3af;
}

/* 输入区域 */
.chat-input {
  padding: 1rem 1.5rem;
  border-top: 1px solid #e5e7eb;
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  flex-shrink: 0;
}

.dark .chat-input {
  border-color: #374151;
  background: linear-gradient(135deg, #1f2937 0%, #111827 100%);
}

.input-wrapper {
  max-width: 1000px;
  margin: 0 auto;
}

.input-container {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.input-box {
  display: flex;
  gap: 0.75rem;
  align-items: center;
  background: white;
  border: 2px solid #e5e7eb;
  border-radius: 16px;
  padding: 1rem;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  min-height: 56px;
}

.input-box:hover {
  border-color: #d1d5db;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08);
}

.input-box:focus-within {
  border-color: #667eea;
  box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1), 0 6px 20px rgba(102, 126, 234, 0.15);
}

.dark .input-box {
  background: #374151;
  border-color: #4b5563;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.dark .input-box:hover {
  border-color: #6b7280;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.25);
}

.dark .input-box:focus-within {
  border-color: #667eea;
  box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.2), 0 6px 20px rgba(102, 126, 234, 0.25);
}

.message-input {
  flex: 1;
  display: flex;
  align-items: center;
}

.message-input :deep(.el-textarea) {
  width: 100%;
  display: flex;
  align-items: center;
}

.message-input :deep(.el-textarea__inner) {
  border: none !important;
  background: transparent !important;
  box-shadow: none !important;
  padding: 0 !important;
  margin: 0 !important;
  font-size: 0.9375rem;
  line-height: 1.6;
  resize: none;
  color: #1f2937;
  min-height: 24px !important;
  overflow-y: hidden;
}

.dark .message-input :deep(.el-textarea__inner) {
  color: #f9fafb;
}

.message-input :deep(.el-textarea__inner::placeholder) {
  color: #9ca3af;
  font-weight: 400;
}

.dark .message-input :deep(.el-textarea__inner::placeholder) {
  color: #6b7280;
}

.send-button {
  flex-shrink: 0;
  height: 44px !important;
  width: 44px !important;
  border-radius: 12px !important;
  font-size: 1.125rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
  border: none !important;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.send-button::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s ease;
}

.send-button:hover::before {
  left: 100%;
}

.send-button:hover {
  transform: translateY(-2px) scale(1.05);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
}

.send-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none !important;
  box-shadow: none !important;
  background: #d1d5db !important;
}

.send-button:disabled::before {
  display: none;
}

.dark .send-button:disabled {
  background: #4b5563 !important;
}

.input-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.8125rem;
  color: #6b7280;
  padding: 0 0.5rem;
}

.dark .input-footer {
  color: #9ca3af;
}

.input-hint {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex: 1;
}

.hint-icon {
  color: #667eea;
  font-size: 0.875rem;
}

.char-count {
  flex-shrink: 0;
  font-weight: 600;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  background: rgba(102, 126, 234, 0.1);
  color: #667eea;
  transition: all 0.3s ease;
  font-size: 0.75rem;
  min-width: 60px;
  text-align: center;
}

.char-count.char-limit {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

.dark .char-count {
  background: rgba(102, 126, 234, 0.2);
}

.dark .char-count.char-limit {
  background: rgba(239, 68, 68, 0.2);
}

/* 滚动条样式 */
.conversation-items::-webkit-scrollbar,
.messages-container::-webkit-scrollbar {
  width: 6px;
}

.conversation-items::-webkit-scrollbar-track,
.messages-container::-webkit-scrollbar-track {
  background: transparent;
}

.conversation-items::-webkit-scrollbar-thumb,
.messages-container::-webkit-scrollbar-thumb {
  background-color: #cbd5e0;
  border-radius: 3px;
}

.conversation-items::-webkit-scrollbar-thumb:hover,
.messages-container::-webkit-scrollbar-thumb:hover {
  background-color: #a0aec0;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .sidebar {
    position: absolute;
    left: 0;
    top: 0;
    height: 100%;
    z-index: 10;
    transform: translateX(-100%);
    transition: transform 0.3s ease;
  }
  
  .sidebar.show {
    transform: translateX(0);
  }
  
  .welcome-features {
    flex-direction: column;
    gap: 1rem;
  }
  
  .message-item {
    max-width: 90%;
  }
  
  .chat-header {
    padding: 1rem;
  }
  
  .chat-input {
    padding: 1rem;
  }
  
  .input-box {
    padding: 0.75rem;
    border-radius: 12px;
    min-height: 52px;
  }
  
  .send-button {
    height: 40px !important;
    width: 40px !important;
  }
  
  .input-footer {
    font-size: 0.75rem;
    gap: 0.5rem;
  }
  
  .input-hint .hint-icon {
    display: none;
  }
}

/* 页面动画 */
.chat-page {
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.message-item {
  animation: slideInUp 0.3s ease-out;
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>