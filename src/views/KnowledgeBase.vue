<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  Plus, MoreFilled, Edit, Delete, View, Loading, FolderOpened,
  Collection, QuestionFilled, VideoPlay, Upload, ChatDotRound, Share,
  Document, Star, Lock, PriceTag, Check
} from '@element-plus/icons-vue'
import { KnowledgeBaseAPI, type KnowledgeBase, type CreateKnowledgeBaseData } from '@/api/modules/knowledge-base'
import { useRouter } from 'vue-router'

const router = useRouter()

const knowledgeBases = ref<KnowledgeBase[]>([])
const loading = ref(false)
const createDialogVisible = ref(false)
const editDialogVisible = ref(false)
const currentEditingKB = ref<KnowledgeBase | null>(null)

// 创建知识库表单数据
const createForm = ref<CreateKnowledgeBaseData>({
  name: '',
  description: '',
  is_public: false,
  public_description: '',
  tags: []
})

// 编辑知识库表单数据
const editForm = ref<CreateKnowledgeBaseData>({
  name: '',
  description: '',
  is_public: false,
  public_description: '',
  tags: []
})

// 标签输入字符串
const createTagsInput = ref('')
const editTagsInput = ref('')

// 标签颜色数组
const tagColors = ['primary', 'success', 'info', 'warning', 'danger']

onMounted(() => {
  loadKnowledgeBases()
})

// 加载知识库列表
const loadKnowledgeBases = async () => {
  try {
    loading.value = true
    const response = await KnowledgeBaseAPI.getList({ include_public: false })
    
    // 确保响应是数组
    if (Array.isArray(response)) {
      knowledgeBases.value = response
    } else {
      knowledgeBases.value = []
    }
    
  } catch (error: any) {
    console.error('加载知识库失败:', error)
    
    // 如果是401错误，可能是token问题
    if (error.response?.status === 401) {
      ElMessage.error('登录已过期，请重新登录')
    } else {
      ElMessage.error('加载知识库列表失败')
    }
    
    knowledgeBases.value = []
  } finally {
    loading.value = false
  }
}

// 创建知识库
const handleCreate = () => {
  createDialogVisible.value = true
  // 重置表单
  createForm.value = {
    name: '',
    description: '',
    is_public: false,
    public_description: '',
    tags: []
  }
  createTagsInput.value = ''
}

// 确认创建知识库
const confirmCreate = async () => {
  try {
    if (!createForm.value.name.trim()) {
      ElMessage.warning('请输入知识库名称')
      return
    }
    
    // 如果输入框中还有内容，先添加为标签
    if (createTagsInput.value.trim()) {
      addTag(createTagsInput.value, false)
    }
    
    await KnowledgeBaseAPI.create(createForm.value)
    ElMessage.success('知识库创建成功')
    createDialogVisible.value = false
    loadKnowledgeBases() // 重新加载列表
  } catch (error: any) {
    console.error('创建知识库失败:', error)
    const errorMessage = error.response?.data?.detail || error.message || '创建失败'
    ElMessage.error(errorMessage)
  }
}

// 编辑知识库
const handleEdit = (kb: KnowledgeBase) => {
  currentEditingKB.value = kb
  editForm.value = {
    name: kb.name,
    description: kb.description || '',
    is_public: kb.is_public,
    public_description: kb.public_description || '',
    tags: [...kb.tags]
  }
  editTagsInput.value = ''
  editDialogVisible.value = true
}

// 确认编辑知识库
const confirmEdit = async () => {
  try {
    if (!currentEditingKB.value) return
    
    if (!editForm.value.name.trim()) {
      ElMessage.warning('请输入知识库名称')
      return
    }
    
    // 如果输入框中还有内容，先添加为标签
    if (editTagsInput.value.trim()) {
      addTag(editTagsInput.value, true)
    }
    
    await KnowledgeBaseAPI.update(currentEditingKB.value.id, editForm.value)
    ElMessage.success('知识库更新成功')
    editDialogVisible.value = false
    loadKnowledgeBases() // 重新加载列表
  } catch (error: any) {
    console.error('更新知识库失败:', error)
    const errorMessage = error.response?.data?.detail || error.message || '更新失败'
    ElMessage.error(errorMessage)
  }
}

// 删除知识库
const handleDelete = async (kb: KnowledgeBase) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除知识库"${kb.name}"吗？此操作不可恢复。`,
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )
    
    await KnowledgeBaseAPI.delete(kb.id)
    ElMessage.success('知识库删除成功')
    loadKnowledgeBases() // 重新加载列表
  } catch (error: any) {
    if (error === 'cancel') return // 用户取消删除
    
    console.error('删除知识库失败:', error)
    const errorMessage = error.response?.data?.detail || error.message || '删除失败'
    ElMessage.error(errorMessage)
  }
}

// 进入知识库详情
const enterKnowledgeBase = (kb: KnowledgeBase) => {
  // 记录访问行为
  KnowledgeBaseAPI.recordAccess(kb.id, {
    access_type: 'view',
    access_metadata: {
      source: 'knowledge_base_list',
      page: 'knowledge_base_management'
    }
  }).catch(console.error)
  
  // 跳转到知识库详情页面
  router.push(`/knowledge-bases/${kb.id}`)
}

// 格式化时间显示
const formatTime = (timeStr: string) => {
  return new Date(timeStr).toLocaleString('zh-CN')
}

// 添加标签
const addTag = (input: string, isEdit = false) => {
  const tag = input.trim()
  if (!tag) return
  
  const targetForm = isEdit ? editForm.value : createForm.value
  
  // 检查标签是否已存在
  if (targetForm.tags.includes(tag)) {
    ElMessage.warning('标签已存在')
    return
  }
  
  // 添加标签
  targetForm.tags.push(tag)
  
  // 清空输入框
  if (isEdit) {
    editTagsInput.value = ''
  } else {
    createTagsInput.value = ''
  }
}

// 删除标签
const removeTag = (index: number, isEdit = false) => {
  const targetForm = isEdit ? editForm.value : createForm.value
  targetForm.tags.splice(index, 1)
}

// 处理回车键
const handleTagKeydown = (event: KeyboardEvent, isEdit = false) => {
  if (event.key === 'Enter') {
    event.preventDefault()
    const input = isEdit ? editTagsInput.value : createTagsInput.value
    addTag(input, isEdit)
  }
}

// 获取标签颜色
const getTagColor = (index: number) => {
  return tagColors[index % tagColors.length]
}

// 将标签数组转换为字符串
const tagsToString = (tags: string[]) => {
  return tags.join(', ')
}
</script>

<template>
  <div class="knowledge-base-page p-6">
    <div class="page-header">
      <div class="header-content">
        <div>
          <h1 class="page-title">知识库管理</h1>
          <p class="page-subtitle">创建和管理您的知识库</p>
        </div>
        <el-button type="primary" @click="handleCreate" class="create-header-btn">
          <el-icon class="mr-2"><Plus /></el-icon>
          创建知识库
        </el-button>
      </div>
      <div v-if="knowledgeBases.length > 0" class="quick-stats">
        <div class="quick-stat">
          <span class="quick-stat-value">{{ knowledgeBases.length }}</span>
          <span class="quick-stat-label">个知识库</span>
        </div>
        <div class="quick-stat">
          <span class="quick-stat-value">{{ knowledgeBases.reduce((sum, kb) => sum + kb.document_count, 0) }}</span>
          <span class="quick-stat-label">个文档</span>
        </div>
        <div class="quick-stat">
          <span class="quick-stat-value">{{ knowledgeBases.filter(kb => kb.is_public).length }}</span>
          <span class="quick-stat-label">个公开</span>
        </div>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-state">
      <div class="loading-content">
        <div class="loading-spinner">
          <el-icon class="spinner-icon"><Loading /></el-icon>
        </div>
        <p class="loading-text">正在加载知识库...</p>
        <div class="loading-dots">
          <span class="dot"></span>
          <span class="dot"></span>
          <span class="dot"></span>
        </div>
      </div>
    </div>

    <!-- 知识库列表 -->
    <div v-else-if="knowledgeBases.length > 0" class="kb-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <el-card v-for="(kb, index) in knowledgeBases" :key="kb.id" class="kb-card" :style="{ animationDelay: `${index * 0.1}s` }">
        <template #header>
          <div class="flex justify-between items-center kb-card-header">
            <div class="flex items-center space-x-2">
              <h3 class="text-lg font-semibold">{{ kb.name }}</h3>
              <el-tag v-if="kb.is_public" type="success" size="small">公开</el-tag>
              <el-tag v-else type="info" size="small">私有</el-tag>
            </div>
            <el-dropdown>
              <el-button type="text" class="more-btn">
                <el-icon><MoreFilled /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item @click="handleEdit(kb)">
                    <el-icon><Edit /></el-icon>
                    编辑
                  </el-dropdown-item>
                  <el-dropdown-item @click="handleDelete(kb)" divided>
                    <el-icon><Delete /></el-icon>
                    删除
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </template>

        <div class="kb-card-content">
          <p class="text-gray-600 dark:text-gray-400 text-sm line-clamp-2">
            {{ kb.description || '暂无描述' }}
          </p>
          
          <!-- 标签 -->
          <div v-if="kb.tags.length > 0" class="flex flex-wrap gap-1">
            <el-tag v-for="tag in kb.tags.slice(0, 3)" :key="tag" size="small" type="info">
              {{ tag }}
            </el-tag>
            <el-tag v-if="kb.tags.length > 3" size="small" type="info">
              +{{ kb.tags.length - 3 }}
            </el-tag>
          </div>
          
          <div class="kb-stats">
            <div class="stat-item">
              <div class="stat-icon">
                <el-icon><Document /></el-icon>
              </div>
              <div class="stat-content">
                <span class="stat-value">{{ kb.document_count }}</span>
                <span class="stat-label">文档</span>
              </div>
            </div>
            <div class="stat-item">
              <div class="stat-icon">
                <el-icon><View /></el-icon>
              </div>
              <div class="stat-content">
                <span class="stat-value">{{ kb.view_count }}</span>
                <span class="stat-label">浏览</span>
              </div>
            </div>
            <div class="stat-item" v-if="kb.is_public">
              <div class="stat-icon">
                <el-icon><Star /></el-icon>
              </div>
              <div class="stat-content">
                <span class="stat-value">{{ kb.like_count }}</span>
                <span class="stat-label">点赞</span>
              </div>
            </div>
          </div>
          
          <div class="flex items-center justify-between text-sm">
            <span class="text-gray-500">创建时间</span>
            <span class="text-gray-700 dark:text-gray-300">{{ formatTime(kb.create_time) }}</span>
          </div>

          <div class="pt-4">
            <el-button type="primary" size="default" class="w-full enter-kb-btn" @click="enterKnowledgeBase(kb)">
              <el-icon class="mr-1"><View /></el-icon>
              进入知识库
            </el-button>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 空状态 -->
    <div v-else class="empty-state">
      <div class="empty-content">
        <!-- 插画背景 -->
        <div class="empty-illustration">
          <div class="illustration-bg">
            <div class="floating-shapes">
              <div class="shape shape-1"></div>
              <div class="shape shape-2"></div>
              <div class="shape shape-3"></div>
            </div>
            <div class="main-icon">
              <el-icon class="icon-large"><Collection /></el-icon>
            </div>
          </div>
        </div>
        
        <!-- 文字内容 -->
        <div class="empty-text">
          <h3 class="empty-title">开始构建您的知识库</h3>
          <p class="empty-description">
            创建知识库，上传文档，开启智能问答体验
          </p>
        </div>
        
        <!-- 操作按钮 -->
        <div class="empty-actions">
          <el-button type="primary" size="large" @click="handleCreate" class="create-btn">
            <el-icon class="mr-2"><Plus /></el-icon>
            创建第一个知识库
          </el-button>
          <p class="action-hint">
            开始您的智能文档管理之旅
          </p>
        </div>
        
        <!-- 功能特性 -->
        <div class="feature-highlights">
          <div class="feature-item">
            <div class="feature-icon">
              <el-icon><Upload /></el-icon>
            </div>
            <div class="feature-text">
              <h4>文档上传</h4>
              <p>支持PDF、Word等多种格式</p>
            </div>
          </div>
          <div class="feature-item">
            <div class="feature-icon">
              <el-icon><ChatDotRound /></el-icon>
            </div>
            <div class="feature-text">
              <h4>智能问答</h4>
              <p>基于文档内容的AI对话</p>
            </div>
          </div>
          <div class="feature-item">
            <div class="feature-icon">
              <el-icon><Share /></el-icon>
            </div>
            <div class="feature-text">
              <h4>知识分享</h4>
              <p>支持公开分享给其他用户</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 创建知识库对话框 -->
    <el-dialog
      v-model="createDialogVisible"
      width="600px"
      :close-on-click-modal="false"
      class="create-kb-dialog"
      align-center
    >
      <template #header>
        <div class="dialog-header">
          <div class="header-icon">
            <el-icon><Plus /></el-icon>
          </div>
          <div class="header-content">
            <h3 class="dialog-title">创建知识库</h3>
            <p class="dialog-subtitle">构建您的专属知识空间</p>
          </div>
        </div>
      </template>
      
      <div class="dialog-body">
        <el-form :model="createForm" label-position="top" class="create-form">
          <div class="form-section">
            <el-form-item label="知识库名称" required class="form-item">
              <el-input 
                v-model="createForm.name" 
                placeholder="为您的知识库起个名字"
                size="large"
                class="form-input"
              >
                <template #prefix>
                  <el-icon><Collection /></el-icon>
                </template>
              </el-input>
            </el-form-item>
            
            <el-form-item label="知识库描述" class="form-item">
              <el-input
                v-model="createForm.description"
                type="textarea"
                :rows="3"
                placeholder="简单描述一下这个知识库的用途和内容..."
                class="form-textarea"
                resize="none"
              />
            </el-form-item>
          </div>

          <div class="form-section">
            <div class="visibility-section">
              <div class="section-header">
                <h4 class="section-title">可见性设置</h4>
                <p class="section-desc">选择谁可以访问这个知识库</p>
              </div>
              
              <div class="visibility-options">
                <div 
                  class="visibility-option" 
                  :class="{ active: !createForm.is_public }"
                  @click="createForm.is_public = false"
                >
                  <div class="option-icon">
                    <el-icon><Lock /></el-icon>
                  </div>
                  <div class="option-content">
                    <h5>私有</h5>
                    <p>只有您可以访问</p>
                  </div>
                  <div class="option-radio">
                    <el-radio v-model="createForm.is_public" :label="false" />
                  </div>
                </div>
                
                <div 
                  class="visibility-option" 
                  :class="{ active: createForm.is_public }"
                  @click="createForm.is_public = true"
                >
                  <div class="option-icon">
                    <el-icon><Share /></el-icon>
                  </div>
                  <div class="option-content">
                    <h5>公开</h5>
                    <p>所有用户都可以查看和使用</p>
                  </div>
                  <div class="option-radio">
                    <el-radio v-model="createForm.is_public" :label="true" />
                  </div>
                </div>
              </div>
            </div>
            
            <el-form-item 
              v-if="createForm.is_public" 
              label="公开描述" 
              class="form-item public-desc"
            >
              <el-input
                v-model="createForm.public_description"
                type="textarea"
                :rows="2"
                placeholder="向其他用户介绍这个知识库..."
                class="form-textarea"
                resize="none"
              />
            </el-form-item>
          </div>

          <div class="form-section">
            <el-form-item label="标签" class="form-item">
              <div class="tags-input-wrapper">
                <el-input
                  v-model="createTagsInput"
                  placeholder="输入标签后按回车键添加，如：机器学习"
                  size="large"
                  class="form-input"
                  @keydown="handleTagKeydown($event, false)"
                >
                  <template #prefix>
                    <el-icon><PriceTag /></el-icon>
                  </template>
                  <template #suffix>
                    <el-button 
                      v-if="createTagsInput.trim()"
                      type="text" 
                      size="small"
                      @click="addTag(createTagsInput, false)"
                      class="add-tag-btn"
                    >
                      <el-icon><Plus /></el-icon>
                    </el-button>
                  </template>
                </el-input>
                <div v-if="createForm.tags.length > 0" class="tags-display">
                  <transition-group name="tag" tag="div" class="tags-container">
                    <div
                      v-for="(tag, index) in createForm.tags"
                      :key="tag"
                      class="tag-wrapper"
                    >
                      <el-tag 
                        :type="getTagColor(index)"
                        size="default"
                        closable
                        class="tag-item"
                        @close="removeTag(index, false)"
                      >
                        {{ tag }}
                      </el-tag>
                    </div>
                  </transition-group>
                </div>
              </div>
            </el-form-item>
          </div>
        </el-form>
      </div>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="createDialogVisible = false" size="large" class="cancel-btn">
            取消
          </el-button>
          <el-button type="primary" @click="confirmCreate" size="large" class="confirm-btn">
            <el-icon class="mr-1"><Check /></el-icon>
            创建知识库
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 编辑知识库对话框 -->
    <el-dialog
      v-model="editDialogVisible"
      width="600px"
      :close-on-click-modal="false"
      class="create-kb-dialog"
      align-center
    >
      <template #header>
        <div class="dialog-header">
          <div class="header-icon">
            <el-icon><Edit /></el-icon>
          </div>
          <div class="header-content">
            <h3 class="dialog-title">编辑知识库</h3>
            <p class="dialog-subtitle">修改知识库信息</p>
          </div>
        </div>
      </template>
      
      <div class="dialog-body">
        <el-form :model="editForm" label-position="top" class="create-form">
          <div class="form-section">
            <el-form-item label="知识库名称" required class="form-item">
              <el-input 
                v-model="editForm.name" 
                placeholder="为您的知识库起个名字"
                size="large"
                class="form-input"
              >
                <template #prefix>
                  <el-icon><Collection /></el-icon>
                </template>
              </el-input>
            </el-form-item>
            
            <el-form-item label="知识库描述" class="form-item">
              <el-input
                v-model="editForm.description"
                type="textarea"
                :rows="3"
                placeholder="简单描述一下这个知识库的用途和内容..."
                class="form-textarea"
                resize="none"
              />
            </el-form-item>
          </div>

          <div class="form-section">
            <div class="visibility-section">
              <div class="section-header">
                <h4 class="section-title">可见性设置</h4>
                <p class="section-desc">选择谁可以访问这个知识库</p>
              </div>
              
              <div class="visibility-options">
                <div 
                  class="visibility-option" 
                  :class="{ active: !editForm.is_public }"
                  @click="editForm.is_public = false"
                >
                  <div class="option-icon">
                    <el-icon><Lock /></el-icon>
                  </div>
                  <div class="option-content">
                    <h5>私有</h5>
                    <p>只有您可以访问</p>
                  </div>
                  <div class="option-radio">
                    <el-radio v-model="editForm.is_public" :label="false" />
                  </div>
                </div>
                
                <div 
                  class="visibility-option" 
                  :class="{ active: editForm.is_public }"
                  @click="editForm.is_public = true"
                >
                  <div class="option-icon">
                    <el-icon><Share /></el-icon>
                  </div>
                  <div class="option-content">
                    <h5>公开</h5>
                    <p>所有用户都可以查看和使用</p>
                  </div>
                  <div class="option-radio">
                    <el-radio v-model="editForm.is_public" :label="true" />
                  </div>
                </div>
              </div>
            </div>
            
            <el-form-item 
              v-if="editForm.is_public" 
              label="公开描述" 
              class="form-item public-desc"
            >
              <el-input
                v-model="editForm.public_description"
                type="textarea"
                :rows="2"
                placeholder="向其他用户介绍这个知识库..."
                class="form-textarea"
                resize="none"
              />
            </el-form-item>
          </div>

          <div class="form-section">
            <el-form-item label="标签" class="form-item">
              <div class="tags-input-wrapper">
                <el-input
                  v-model="editTagsInput"
                  placeholder="输入标签后按回车键添加，如：机器学习"
                  size="large"
                  class="form-input"
                  @keydown="handleTagKeydown($event, true)"
                >
                  <template #prefix>
                    <el-icon><PriceTag /></el-icon>
                  </template>
                  <template #suffix>
                    <el-button 
                      v-if="editTagsInput.trim()"
                      type="text" 
                      size="small"
                      @click="addTag(editTagsInput, true)"
                      class="add-tag-btn"
                    >
                      <el-icon><Plus /></el-icon>
                    </el-button>
                  </template>
                </el-input>
                <div v-if="editForm.tags.length > 0" class="tags-display">
                  <transition-group name="tag" tag="div" class="tags-container">
                    <div
                      v-for="(tag, index) in editForm.tags"
                      :key="tag"
                      class="tag-wrapper"
                    >
                      <el-tag 
                        :type="getTagColor(index)"
                        size="default"
                        closable
                        class="tag-item"
                        @close="removeTag(index, true)"
                      >
                        {{ tag }}
                      </el-tag>
                    </div>
                  </transition-group>
                </div>
              </div>
            </el-form-item>
          </div>
        </el-form>
      </div>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="editDialogVisible = false" size="large" class="cancel-btn">
            取消
          </el-button>
          <el-button type="primary" @click="confirmEdit" size="large" class="confirm-btn">
            <el-icon class="mr-1"><Check /></el-icon>
            保存更改
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
/* 页面头部样式 */
.page-header {
  margin-bottom: 2rem;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.page-title {
  font-size: 1.875rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 0.25rem;
}

.dark .page-title {
  color: #f9fafb;
}

.page-subtitle {
  color: #6b7280;
  font-size: 1rem;
}

.dark .page-subtitle {
  color: #9ca3af;
}

.create-header-btn {
  padding: 10px 24px;
  font-weight: 600;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.2);
  transition: all 0.3s ease;
}

.create-header-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.quick-stats {
  display: flex;
  gap: 2rem;
  padding: 1rem 0;
  border-top: 1px solid #e5e7eb;
}

.dark .quick-stats {
  border-color: #374151;
}

.quick-stat {
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
}

.quick-stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #667eea;
}

.quick-stat-label {
  font-size: 0.875rem;
  color: #6b7280;
}

.dark .quick-stat-label {
  color: #9ca3af;
}

.kb-card {
  transition: all 0.3s ease;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  overflow: hidden;
}

.dark .kb-card {
  border-color: #374151;
  background: #1f2937;
}

.kb-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 32px -8px rgba(0, 0, 0, 0.15);
  border-color: #667eea;
}

.dark .kb-card:hover {
  border-color: #667eea;
  box-shadow: 0 12px 32px -8px rgba(102, 126, 234, 0.3);
}

/* 知识库统计样式 */
.kb-stats {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.75rem;
  background: #f8fafc;
  border-radius: 8px;
  margin: 0.75rem 0;
}

.dark .kb-stats {
  background: #374151;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex: 1;
  justify-content: center;
}

.stat-icon {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(102, 126, 234, 0.1);
  border-radius: 6px;
  color: #667eea;
  font-size: 0.875rem;
}

.stat-content {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-value {
  font-size: 0.875rem;
  font-weight: 600;
  color: #1f2937;
  line-height: 1;
}

.dark .stat-value {
  color: #f9fafb;
}

.stat-label {
  font-size: 0.75rem;
  color: #6b7280;
  line-height: 1;
}

.dark .stat-label {
  color: #9ca3af;
}

/* 卡片按钮优化 */
.more-btn {
  min-width: 32px !important;
  height: 32px !important;
  padding: 0 !important;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  transition: all 0.3s ease;
}

.more-btn:hover {
  background-color: #f3f4f6;
  transform: scale(1.05);
}

.dark .more-btn:hover {
  background-color: #4b5563;
}

.enter-kb-btn {
  height: 40px !important;
  font-weight: 500;
  border-radius: 8px;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(102, 126, 234, 0.2);
}

.enter-kb-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(102, 126, 234, 0.3);
}

/* 卡片内容布局优化 */
.kb-card-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 0.5rem 0;
}

.kb-card-content > * {
  margin: 0;
}

/* 卡片头部样式 */
.kb-card-header {
  padding: 0.25rem 0;
  min-height: 40px;
}

.kb-card-header h3 {
  margin: 0;
  line-height: 1.4;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* 空状态样式 */
.empty-state {
  min-height: 65vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.03) 0%, rgba(118, 75, 162, 0.03) 100%);
  border-radius: 16px;
  margin: 1rem 0;
}

.empty-content {
  max-width: 700px;
  text-align: center;
}

/* 插画背景 */
.empty-illustration {
  margin-bottom: 2rem;
  position: relative;
}

.illustration-bg {
  position: relative;
  width: 200px;
  height: 200px;
  margin: 0 auto;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.floating-shapes {
  position: absolute;
  width: 100%;
  height: 100%;
}

.shape {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  animation: float 6s ease-in-out infinite;
}

.shape-1 {
  width: 20px;
  height: 20px;
  top: 20%;
  left: 20%;
  animation-delay: 0s;
}

.shape-2 {
  width: 30px;
  height: 30px;
  top: 60%;
  right: 20%;
  animation-delay: 2s;
}

.shape-3 {
  width: 15px;
  height: 15px;
  bottom: 30%;
  left: 70%;
  animation-delay: 4s;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0px) rotate(0deg);
    opacity: 0.7;
  }
  50% {
    transform: translateY(-20px) rotate(180deg);
    opacity: 1;
  }
}

.main-icon {
  z-index: 2;
  position: relative;
}

.icon-large {
  font-size: 4rem;
  color: white;
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.1));
}

/* 文字内容 */
.empty-text {
  margin-bottom: 2rem;
}

.empty-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 0.75rem;
}

.dark .empty-title {
  color: #f9fafb;
}

.empty-description {
  font-size: 1rem;
  color: #6b7280;
  line-height: 1.6;
  margin-bottom: 0;
}

.dark .empty-description {
  color: #9ca3af;
}

/* 操作按钮 */
.empty-actions {
  margin-bottom: 3rem;
}

.create-btn {
  padding: 14px 40px;
  font-size: 1.1rem;
  font-weight: 600;
  border-radius: 12px;
  margin-bottom: 1rem;
  box-shadow: 0 4px 16px rgba(102, 126, 234, 0.3);
  transition: all 0.3s ease;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
}

.create-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
  background: linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%);
}

.action-hint {
  font-size: 0.9rem;
  color: #8b5cf6;
  margin-top: 0.5rem;
  font-weight: 500;
}

.dark .action-hint {
  color: #a78bfa;
}

/* 功能特性 */
.feature-highlights {
  display: flex;
  justify-content: center;
  gap: 2rem;
  margin-top: 2.5rem;
  flex-wrap: wrap;
}

.feature-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem 1.5rem;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 16px;
  transition: all 0.3s ease;
  border: 1px solid rgba(102, 126, 234, 0.1);
  backdrop-filter: blur(10px);
  min-width: 180px;
  flex: 0 0 auto;
}

.dark .feature-item {
  background: rgba(55, 65, 81, 0.8);
  border-color: rgba(102, 126, 234, 0.2);
}

.feature-item:hover {
  transform: translateY(-6px);
  box-shadow: 0 12px 40px -8px rgba(102, 126, 234, 0.25);
  border-color: rgba(102, 126, 234, 0.3);
}

.feature-icon {
  width: 56px;
  height: 56px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;
  color: white;
  font-size: 1.5rem;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.feature-text h4 {
  font-size: 1rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 0.5rem;
  text-align: center;
}

.dark .feature-text h4 {
  color: #f9fafb;
}

.feature-text p {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0;
  line-height: 1.5;
  text-align: center;
}

.dark .feature-text p {
  color: #9ca3af;
}

/* 加载状态样式 */
.loading-state {
  min-height: 40vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.loading-content {
  text-align: center;
}

.loading-spinner {
  margin-bottom: 1rem;
}

.spinner-icon {
  font-size: 2.5rem;
  color: #667eea;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.loading-text {
  font-size: 1rem;
  color: #6b7280;
  margin-bottom: 1rem;
}

.dark .loading-text {
  color: #9ca3af;
}

.loading-dots {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
}

.dot {
  width: 8px;
  height: 8px;
  background: #667eea;
  border-radius: 50%;
  animation: bounce 1.4s ease-in-out infinite both;
}

.dot:nth-child(1) {
  animation-delay: -0.32s;
}

.dot:nth-child(2) {
  animation-delay: -0.16s;
}

@keyframes bounce {
  0%, 80%, 100% {
    transform: scale(0);
  }
  40% {
    transform: scale(1);
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }
  
  .create-header-btn {
    width: 100%;
    justify-content: center;
  }
  
  .quick-stats {
    justify-content: space-around;
    gap: 1rem;
  }
  
  .empty-state {
    padding: 1rem;
    min-height: 50vh;
  }
  
  .illustration-bg {
    width: 150px;
    height: 150px;
  }
  
  .icon-large {
    font-size: 3rem;
  }
  
  .empty-title {
    font-size: 1.25rem;
  }
  
  .create-btn {
    padding: 12px 32px;
    font-size: 1rem;
  }
  
  .feature-highlights {
    flex-direction: column;
    gap: 1.5rem;
    align-items: center;
  }
  
  .feature-item {
    padding: 1.5rem 1rem;
    min-width: 280px;
    max-width: 320px;
  }
  
  .kb-stats {
    gap: 0.5rem;
  }
  
  .stat-item {
    gap: 0.25rem;
  }
}

@media (max-width: 480px) {
  .feature-highlights {
    gap: 1rem;
  }
  
  .feature-item {
    min-width: 260px;
    padding: 1.25rem 0.75rem;
  }
  
  .feature-icon {
    width: 48px;
    height: 48px;
    font-size: 1.25rem;
  }
}

/* 页面动画 */
.kb-grid {
  animation: fadeInUp 0.6s ease-out;
}

.kb-card {
  animation: slideInUp 0.6s ease-out both;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.empty-content {
  animation: fadeInUp 0.8s ease-out;
}

/* 弹窗样式 */
.create-kb-dialog :deep(.el-dialog) {
  border-radius: 16px;
  overflow: hidden;
}

.create-kb-dialog :deep(.el-dialog__header) {
  padding: 0;
  margin: 0;
}

.create-kb-dialog :deep(.el-dialog__body) {
  padding: 0;
}

.create-kb-dialog :deep(.el-dialog__footer) {
  padding: 0;
}

.dialog-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 2rem 2rem 1rem 2rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.header-icon {
  width: 48px;
  height: 48px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
}

.header-content {
  flex: 1;
}

.dialog-title {
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0 0 0.25rem 0;
}

.dialog-subtitle {
  font-size: 0.875rem;
  opacity: 0.9;
  margin: 0;
}

.dialog-body {
  padding: 2rem;
  max-height: 60vh;
  overflow-y: auto;
}

.create-form {
  margin: 0;
}

.form-section {
  margin-bottom: 2rem;
}

.form-section:last-child {
  margin-bottom: 0;
}

.form-item {
  margin-bottom: 1.5rem;
}

.form-item:last-child {
  margin-bottom: 0;
}

.form-item :deep(.el-form-item__label) {
  font-weight: 600;
  color: #374151;
  font-size: 0.875rem;
  margin-bottom: 0.5rem;
}

.dark .form-item :deep(.el-form-item__label) {
  color: #f3f4f6;
}

.form-input {
  border-radius: 8px;
}

.form-input :deep(.el-input__wrapper) {
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.form-input :deep(.el-input__wrapper:hover) {
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.15);
}

.form-input :deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.2);
}

.form-textarea :deep(.el-textarea__inner) {
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.form-textarea :deep(.el-textarea__inner:hover) {
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.15);
}

.form-textarea :deep(.el-textarea__inner:focus) {
  box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.2);
}

/* 可见性设置样式 */
.visibility-section {
  background: #f8fafc;
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid #e2e8f0;
}

.dark .visibility-section {
  background: #374151;
  border-color: #4b5563;
}

.section-header {
  margin-bottom: 1rem;
}

.section-title {
  font-size: 1rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 0.25rem 0;
}

.dark .section-title {
  color: #f9fafb;
}

.section-desc {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0;
}

.dark .section-desc {
  color: #9ca3af;
}

.visibility-options {
  display: flex;
  gap: 1rem;
}

.visibility-option {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  background: white;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.dark .visibility-option {
  background: #1f2937;
  border-color: #374151;
}

.visibility-option:hover {
  border-color: #667eea;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.1);
}

.visibility-option.active {
  border-color: #667eea;
  background: rgba(102, 126, 234, 0.05);
}

.dark .visibility-option.active {
  background: rgba(102, 126, 234, 0.1);
}

.option-icon {
  width: 32px;
  height: 32px;
  background: #f3f4f6;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6b7280;
  font-size: 1rem;
}

.dark .option-icon {
  background: #4b5563;
  color: #9ca3af;
}

.visibility-option.active .option-icon {
  background: #667eea;
  color: white;
}

.option-content {
  flex: 1;
}

.option-content h5 {
  font-size: 0.875rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 0.25rem 0;
}

.dark .option-content h5 {
  color: #f9fafb;
}

.option-content p {
  font-size: 0.75rem;
  color: #6b7280;
  margin: 0;
}

.dark .option-content p {
  color: #9ca3af;
}

.option-radio :deep(.el-radio__input) {
  display: none;
}

.public-desc {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #e5e7eb;
}

.dark .public-desc {
  border-color: #4b5563;
}

/* 标签输入样式 */
.tags-input-wrapper {
  width: 100%;
}

.add-tag-btn {
  color: #667eea;
  padding: 0;
  margin-right: 8px;
}

.add-tag-btn:hover {
  color: #5a6fd8;
}

.tags-display {
  margin-top: 0.75rem;
  padding: 1rem;
  background: #f8fafc;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  min-height: 60px;
}

.dark .tags-display {
  background: #374151;
  border-color: #4b5563;
}

.tags-container {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  align-items: center;
}

.tag-wrapper {
  display: inline-block;
}

.tag-item {
  font-size: 0.875rem;
  padding: 6px 12px;
  border-radius: 20px;
  font-weight: 500;
  cursor: default;
  transition: all 0.3s ease;
}

.tag-item:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.tag-item :deep(.el-tag__close) {
  margin-left: 6px;
  font-size: 12px;
  transition: all 0.2s ease;
}

.tag-item :deep(.el-tag__close:hover) {
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
}

/* 标签动画 */
.tag-enter-active {
  transition: all 0.3s ease;
}

.tag-leave-active {
  transition: all 0.3s ease;
}

.tag-enter-from {
  opacity: 0;
  transform: scale(0.8) translateY(-10px);
}

.tag-leave-to {
  opacity: 0;
  transform: scale(0.8) translateY(-10px);
}

.tag-move {
  transition: transform 0.3s ease;
}

/* 弹窗底部样式 */
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding: 1.5rem 2rem 2rem 2rem;
  background: #f8fafc;
  border-top: 1px solid #e5e7eb;
}

.dark .dialog-footer {
  background: #374151;
  border-color: #4b5563;
}

.cancel-btn {
  border-radius: 8px;
  font-weight: 500;
}

.confirm-btn {
  border-radius: 8px;
  font-weight: 600;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
  transition: all 0.3s ease;
}

.confirm-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
  background: linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%);
}

/* 响应式弹窗 */
@media (max-width: 768px) {
  .create-kb-dialog :deep(.el-dialog) {
    width: 95vw !important;
    margin: 0;
  }
  
  .dialog-header {
    padding: 1.5rem 1.5rem 1rem 1.5rem;
  }
  
  .dialog-body {
    padding: 1.5rem;
  }
  
  .dialog-footer {
    padding: 1rem 1.5rem 1.5rem 1.5rem;
    flex-direction: column;
  }
  
  .visibility-options {
    flex-direction: column;
  }
  
  .tags-display {
    padding: 0.75rem;
    min-height: 50px;
  }
  
  .tags-container {
    gap: 0.5rem;
  }
  
  .tag-item {
    font-size: 0.8rem;
    padding: 4px 8px;
  }
}
</style> 