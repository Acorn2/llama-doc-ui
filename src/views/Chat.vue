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
    conversations.value = await ConversationAPI.getList({
      kb_id: kbId.value,
      limit: 50
    })
  } catch (error: any) {
    console.error('加载对话列表失败:', error)
    ElMessage.error('加载对话列表失败')
  } finally {
    conversationLoading.value = false
  }
}

// 加载消息列表
const loadMessages = async () => {
  if (!selectedConversation.value) return
  
  try {
    messages.value = await ConversationAPI.getMessages(selectedConversation.value.id)
    scrollToBottom()
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
  
  try {
    const title = `新对话 ${new Date().toLocaleString()}`
    const newConversation = await ConversationAPI.create({
      kb_id: kbId.value,
      title
    })
    
    conversations.value.unshift(newConversation)
    selectedConversation.value = newConversation
    messages.value = []
    
    ElMessage.success('创建新对话成功')
  } catch (error: any) {
    console.error('创建对话失败:', error)
    ElMessage.error('创建对话失败')
  }
}

// 发送消息
const sendMessage = async () => {
  if (!canSendMessage.value) return
  
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
      conversations.value.unshift(newConversation)
      selectedConversation.value = newConversation
      conversationId = newConversation.id
      userMessage.conversation_id = conversationId
    }
    
    // 发送消息到后端
    const response = await ConversationAPI.chat({
      conversation_id: conversationId,
      kb_id: kbId.value,
      message: messageContent,
      use_agent: false
    })
    
    // 添加AI回复到界面
    const aiMessage: Message = {
      id: response.message_id,
      conversation_id: conversationId,
      role: 'assistant',
      content: response.content,
      create_time: response.create_time
    }
    messages.value.push(aiMessage)
    scrollToBottom()
    
  } catch (error: any) {
    console.error('发送消息失败:', error)
    ElMessage.error('发送消息失败')
    
    // 移除用户消息（因为发送失败）
    messages.value.pop()
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
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault()
    sendMessage()
  }
}

// 格式化时间
const formatTime = (timeStr: string) => {
  const date = new Date(timeStr)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  
  if (diff < 60000) return '刚刚'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`
  return date.toLocaleDateString()
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
</script>

<template>
  <div class="chat-page h-full flex">
    <!-- 左侧边栏 - 对话历史 -->
    <div :class="['sidebar', sidebarCollapsed ? 'w-16' : 'w-80']">
      <!-- 侧边栏头部 -->
      <div class="sidebar-header">
        <div v-if="!sidebarCollapsed" class="flex items-center justify-between">
          <div class="flex items-center space-x-2">
            <el-button @click="goBackToKnowledgeBase" type="text" size="small" class="back-btn">
              <el-icon><ArrowLeft /></el-icon>
            </el-button>
            <div>
              <h2 class="sidebar-title">对话历史</h2>
              <p v-if="knowledgeBase" class="kb-name">{{ knowledgeBase.name }}</p>
            </div>
          </div>
          <el-button @click="sidebarCollapsed = true" type="text" size="small">
            <el-icon><MoreFilled /></el-icon>
          </el-button>
        </div>
        <div v-else class="flex justify-center">
          <el-button @click="sidebarCollapsed = false" type="text" size="small">
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
            class="w-full"
            :disabled="!knowledgeBase"
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
              <el-icon class="empty-icon"><ChatDotRound /></el-icon>
              <p class="empty-text">暂无对话记录</p>
              <p class="empty-hint">创建新对话开始聊天</p>
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
                <div class="conversation-time">{{ formatTime(conversation.update_time) }}</div>
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
            <h3 class="welcome-title">欢迎使用智能对话</h3>
            <p class="welcome-desc">基于"{{ knowledgeBase.name }}"知识库与AI助手对话</p>
            <div class="welcome-features">
              <div class="feature-item">
                <el-icon><Document /></el-icon>
                <span>基于知识库内容回答</span>
              </div>
              <div class="feature-item">
                <el-icon><Service /></el-icon>
                <span>智能AI助手</span>
              </div>
              <div class="feature-item">
                <el-icon><ChatDotRound /></el-icon>
                <span>上下文记忆</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 消息列表 -->
        <div v-else-if="messages.length > 0" class="messages-list">
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
              <div class="message-text">{{ message.content }}</div>
              <div class="message-time">{{ formatMessageTime(message.create_time) }}</div>
            </div>
          </div>

          <!-- AI回复加载状态 -->
          <div v-if="loading" class="message-item assistant">
            <div class="message-avatar">
              <el-icon><Service /></el-icon>
            </div>
            <div class="message-content">
              <div class="typing-indicator">
                <div class="typing-dots">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
                <span class="typing-text">AI正在思考...</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 空对话状态 -->
        <div v-else class="empty-chat-state">
          <div class="empty-chat-content">
            <div class="empty-chat-icon">
              <el-icon><ChatDotRound /></el-icon>
            </div>
            <h3 class="empty-chat-title">开始新对话</h3>
            <p class="empty-chat-desc">向AI助手提问，获取基于知识库的智能回答</p>
          </div>
        </div>
      </div>

      <!-- 输入区域 -->
      <div class="chat-input">
        <div class="input-container">
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
            :disabled="!canSendMessage"
            class="send-button"
          >
            <el-icon><Promotion /></el-icon>
          </el-button>
        </div>
        
        <div class="input-footer">
          <span class="input-hint">按 Enter 发送，Shift + Enter 换行</span>
          <span class="char-count">{{ currentMessage.length }}/2000</span>
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
}

.dark .sidebar {
  background: #1f2937;
  border-color: #374151;
}

.sidebar-header {
  padding: 1rem;
  border-bottom: 1px solid #e5e7eb;
  flex-shrink: 0;
}

.dark .sidebar-header {
  border-color: #374151;
}

.sidebar-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.dark .sidebar-title {
  color: #f9fafb;
}

.kb-name {
  font-size: 0.75rem;
  color: #6b7280;
  margin: 0;
  line-height: 1.2;
}

.dark .kb-name {
  color: #9ca3af;
}

.back-btn {
  min-width: 28px !important;
  height: 28px !important;
  padding: 0 !important;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  transition: all 0.3s ease;
}

.back-btn:hover {
  background-color: #f3f4f6;
  transform: scale(1.05);
}

.dark .back-btn:hover {
  background-color: #4b5563;
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
  padding: 0 1rem 1rem;
  border-bottom: 1px solid #e5e7eb;
  flex-shrink: 0;
}

.dark .conversation-actions {
  border-color: #374151;
}

/* 对话搜索 */
.conversation-search {
  padding: 1rem;
  border-bottom: 1px solid #e5e7eb;
  flex-shrink: 0;
}

.dark .conversation-search {
  border-color: #374151;
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
  font-size: 3rem;
  color: #9ca3af;
  margin-bottom: 1rem;
}

.empty-text {
  font-size: 1rem;
  font-weight: 500;
  color: #6b7280;
  margin: 0 0 0.5rem 0;
}

.dark .empty-text {
  color: #9ca3af;
}

.empty-hint {
  font-size: 0.875rem;
  color: #9ca3af;
  margin: 0;
}

.dark .empty-hint {
  color: #6b7280;
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
  transition: background-color 0.2s ease;
  border-left: 3px solid transparent;
}

.conversation-item:hover {
  background-color: #f3f4f6;
}

.dark .conversation-item:hover {
  background-color: #374151;
}

.conversation-item.active {
  background-color: rgba(102, 126, 234, 0.1);
  border-left-color: #667eea;
}

.dark .conversation-item.active {
  background-color: rgba(102, 126, 234, 0.2);
}

.conversation-content {
  flex: 1;
  min-width: 0;
}

.conversation-title {
  font-size: 0.875rem;
  font-weight: 500;
  color: #1f2937;
  margin-bottom: 0.25rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.dark .conversation-title {
  color: #f9fafb;
}

.conversation-time {
  font-size: 0.75rem;
  color: #6b7280;
}

.dark .conversation-time {
  color: #9ca3af;
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

/* 打字指示器 */
.typing-indicator {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 0.75rem 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
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
  background: white;
  flex-shrink: 0;
}

.dark .chat-input {
  border-color: #374151;
  background: #1f2937;
}

.input-container {
  display: flex;
  gap: 0.75rem;
  align-items: flex-end;
}

.message-input {
  flex: 1;
}

.send-button {
  flex-shrink: 0;
  height: 40px;
  width: 40px;
  border-radius: 8px;
}

.input-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 0.5rem;
  font-size: 0.75rem;
  color: #9ca3af;
}

.dark .input-footer {
  color: #6b7280;
}

.input-hint {
  flex: 1;
}

.char-count {
  flex-shrink: 0;
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