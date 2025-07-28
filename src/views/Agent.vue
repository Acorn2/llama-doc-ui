<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { KnowledgeBaseAPI, type KnowledgeBase } from '@/api/modules/knowledge-base'
import { ElMessage } from 'element-plus'

const activeTab = ref('analysis')
const loading = ref(false)
const analysisQuery = ref('')
const analysisResult = ref('')
const searchQuery = ref('')
const searchResults = ref<Array<{
  id: string
  title: string
  content: string
  relevance: number
  source: string
  kb_name?: string
}>>([])
const summaryResult = ref('')

// 知识库相关
const knowledgeBases = ref<KnowledgeBase[]>([])
const selectedKnowledgeBase = ref('')
const kbLoading = ref(false)

// 计算属性：是否已选择知识库
const hasSelectedKB = computed(() => !!selectedKnowledgeBase.value)

// 获取选中的知识库信息
const selectedKBInfo = computed(() => {
  return knowledgeBases.value.find(kb => kb.id === selectedKnowledgeBase.value)
})

onMounted(() => {
  console.log('Agent page mounted')
  loadKnowledgeBases()
})

// 加载知识库列表
const loadKnowledgeBases = async () => {
  try {
    kbLoading.value = true
    const response = await KnowledgeBaseAPI.getList({ include_public: true })
    knowledgeBases.value = response
  } catch (error) {
    console.error('加载知识库失败:', error)
    ElMessage.error('加载知识库列表失败')
    // 使用模拟数据
    knowledgeBases.value = [
      {
        id: 'kb-001',
        name: '机器学习研究',
        description: '机器学习相关文档和研究',
        is_public: false,
        user_id: 'user1',
        document_count: 15,
        create_time: '2024-01-15T09:00:00Z'
      },
      {
        id: 'kb-002', 
        name: '深度学习技术',
        description: '深度学习技术文档集合',
        is_public: true,
        user_id: 'user2', 
        document_count: 8,
        create_time: '2024-01-18T14:30:00Z'
      },
      {
        id: 'kb-003',
        name: '自然语言处理',
        description: 'NLP相关技术和论文',
        is_public: true,
        user_id: 'user3',
        document_count: 12,
        create_time: '2024-01-20T10:15:00Z'
      }
    ]
  } finally {
    kbLoading.value = false
  }
}

// 知识库选择改变
const handleKnowledgeBaseChange = () => {
  // 清空之前的结果
  analysisResult.value = ''
  searchResults.value = []
  summaryResult.value = ''
  analysisQuery.value = ''
  searchQuery.value = ''
}

// 智能分析
const handleAnalysis = () => {
  if (!hasSelectedKB.value) {
    ElMessage.warning('请先选择知识库')
    return
  }
  
  if (!analysisQuery.value.trim()) {
    ElMessage.warning('请输入分析内容')
    return
  }
  
  loading.value = true
  
  // 模拟分析过程
  setTimeout(() => {
    analysisResult.value = `基于知识库"${selectedKBInfo.value?.name}"中的内容，对您的查询"${analysisQuery.value}"进行AI分析：

这是一个针对所选知识库的智能分析结果。分析过程包括：

1. 知识库内容扫描与理解
   - 已分析 ${selectedKBInfo.value?.document_count} 个文档
   - 提取关键概念和主题
   - 建立知识关联图谱

2. 查询意图识别
   - 理解您的具体需求
   - 匹配相关知识点
   - 确定分析方向

3. 深度分析结果
   • 核心概念解析：${analysisQuery.value}涉及的主要理论框架
   • 技术关联性：与知识库中其他概念的关系
   • 应用场景：实际应用中的案例和最佳实践
   • 发展趋势：基于现有文献的未来发展预测

4. 参考文献
   - 来源：知识库"${selectedKBInfo.value?.name}"
   - 相关文档：已从${selectedKBInfo.value?.document_count}个文档中筛选出最相关的内容
   - 可信度：基于权威文献的分析结果

建议：根据分析结果，您可以进一步探索相关主题或进行更深入的研究。`
    
    loading.value = false
  }, 2000)
}

// 智能搜索
const handleSearch = () => {
  if (!hasSelectedKB.value) {
    ElMessage.warning('请先选择知识库')
    return
  }
  
  if (!searchQuery.value.trim()) {
    ElMessage.warning('请输入搜索内容')
    return
  }
  
  loading.value = true
  
  // 模拟搜索过程
  setTimeout(() => {
    searchResults.value = [
      {
        id: '1',
        title: `${searchQuery.value} - 基础理论`,
        content: `在知识库"${selectedKBInfo.value?.name}"中发现的相关内容：这里包含了关于${searchQuery.value}的核心理论和基础概念...`,
        relevance: 0.95,
        source: `${selectedKBInfo.value?.name} - 文档1.pdf`,
        kb_name: selectedKBInfo.value?.name
      },
      {
        id: '2', 
        title: `${searchQuery.value} - 实际应用`,
        content: `基于知识库"${selectedKBInfo.value?.name}"的内容：这部分详细介绍了${searchQuery.value}在实际项目中的应用案例和实现方法...`,
        relevance: 0.87,
        source: `${selectedKBInfo.value?.name} - 文档2.pdf`,
        kb_name: selectedKBInfo.value?.name
      },
      {
        id: '3',
        title: `${searchQuery.value} - 最新发展`,
        content: `来自知识库"${selectedKBInfo.value?.name}"的最新研究：这里汇总了${searchQuery.value}领域的最新研究进展和技术突破...`,
        relevance: 0.83,
        source: `${selectedKBInfo.value?.name} - 文档3.pdf`,
        kb_name: selectedKBInfo.value?.name
      }
    ]
    loading.value = false
  }, 1500)
}

// 生成摘要
const generateSummary = () => {
  if (!hasSelectedKB.value) {
    ElMessage.warning('请先选择知识库')
    return
  }
  
  loading.value = true
  
  setTimeout(() => {
    summaryResult.value = `知识库"${selectedKBInfo.value?.name}"的智能摘要

📚 知识库概览
• 名称：${selectedKBInfo.value?.name}
• 描述：${selectedKBInfo.value?.description}
• 文档总数：${selectedKBInfo.value?.document_count} 个
• 类型：${selectedKBInfo.value?.is_public ? '公开知识库' : '私有知识库'}

📖 内容分析
基于对该知识库中所有文档的深度分析，主要内容包括：

1. 核心主题领域
   - 基础理论与概念
   - 实际应用案例
   - 技术实现方法
   - 研究进展与趋势

2. 知识结构
   - 文档类型分布：理论文献、实践指南、案例研究
   - 知识深度：从入门到高级的完整覆盖
   - 更新频率：持续更新的知识内容

3. 应用价值
   - 适用于研究学习
   - 可指导实际项目开发
   - 提供行业最佳实践参考

💡 使用建议
• 建议结合智能搜索功能深入探索特定主题
• 可使用智能分析功能获得更专业的见解
• 定期查看知识库更新以获取最新信息

此摘要基于AI对知识库全部内容的理解和分析生成，为您提供快速了解知识库价值的参考。`
    
    loading.value = false
  }, 1000)
}
</script>

<template>
  <div class="agent-page p-6">
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">AI智能分析</h1>
      <p class="text-gray-600 dark:text-gray-400 mt-1">利用AI助手进行智能分析和搜索</p>
    </div>

    <!-- 知识库选择器 -->
    <el-card class="mb-6">
      <template #header>
        <div class="flex items-center space-x-2">
          <el-icon class="text-purple-600"><Collection /></el-icon>
          <span class="font-semibold">选择知识库</span>
        </div>
      </template>
      
      <div class="space-y-4">
        <el-select
          v-model="selectedKnowledgeBase"
          placeholder="请选择要分析的知识库..."
          size="large"
          style="width: 100%"
          :loading="kbLoading"
          @change="handleKnowledgeBaseChange"
        >
          <el-option
            v-for="kb in knowledgeBases"
            :key="kb.id"
            :label="kb.name"
            :value="kb.id"
          >
            <div class="flex justify-between items-center">
              <div>
                <div class="font-medium">{{ kb.name }}</div>
                <div class="text-sm text-gray-500">{{ kb.description }}</div>
              </div>
              <div class="text-sm text-gray-400">
                {{ kb.document_count }} 个文档
              </div>
            </div>
          </el-option>
        </el-select>
        
        <!-- 已选择的知识库信息 -->
        <div v-if="hasSelectedKB" class="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
          <div class="flex items-center space-x-3">
            <el-icon class="text-blue-600"><InfoFilled /></el-icon>
            <div>
              <div class="font-medium text-blue-900 dark:text-blue-100">
                已选择：{{ selectedKBInfo?.name }}
              </div>
              <div class="text-sm text-blue-700 dark:text-blue-300">
                {{ selectedKBInfo?.description }} • {{ selectedKBInfo?.document_count }} 个文档
              </div>
            </div>
          </div>
        </div>
      </div>
    </el-card>

    <el-tabs v-model="activeTab" class="agent-tabs">
      <!-- 智能分析 -->
      <el-tab-pane label="智能分析" name="analysis">
        <el-card>
          <template #header>
            <div class="flex items-center space-x-2">
              <el-icon class="text-blue-600"><DataAnalysis /></el-icon>
              <span class="font-semibold">智能分析</span>
            </div>
          </template>

          <div class="space-y-4">
            <!-- 提示信息 -->
            <el-alert
              v-if="!hasSelectedKB"
              title="请先选择知识库"
              type="warning"
              description="需要选择一个知识库才能进行智能分析"
              show-icon
              :closable="false"
            />
            
            <el-input
              v-model="analysisQuery"
              type="textarea"
              :rows="3"
              placeholder="请输入您想要分析的问题或主题..."
              :disabled="loading || !hasSelectedKB"
            />
            
            <div class="flex justify-between items-center">
              <span class="text-sm text-gray-500">
                {{ hasSelectedKB ? `基于知识库"${selectedKBInfo?.name}"进行分析` : '请先选择知识库' }}
              </span>
              <el-button 
                type="primary" 
                @click="handleAnalysis"
                :loading="loading"
                :disabled="!hasSelectedKB || !analysisQuery.trim()"
              >
                开始分析
              </el-button>
            </div>

            <div v-if="analysisResult" class="mt-6">
              <h3 class="text-lg font-semibold mb-3 text-gray-900 dark:text-white">分析结果</h3>
              <el-card class="analysis-result">
                <pre class="whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300">{{ analysisResult }}</pre>
              </el-card>
            </div>
          </div>
        </el-card>
      </el-tab-pane>

      <!-- 智能搜索 -->
      <el-tab-pane label="智能搜索" name="search">
        <el-card>
          <template #header>
            <div class="flex items-center space-x-2">
              <el-icon class="text-green-600"><Search /></el-icon>
              <span class="font-semibold">智能搜索</span>
            </div>
          </template>

          <div class="space-y-4">
            <!-- 提示信息 -->
            <el-alert
              v-if="!hasSelectedKB"
              title="请先选择知识库"
              type="warning"
              description="需要选择一个知识库才能进行智能搜索"
              show-icon
              :closable="false"
            />
            
            <el-input
              v-model="searchQuery"
              placeholder="输入搜索关键词..."
              :disabled="loading || !hasSelectedKB"
            >
              <template #append>
                <el-button 
                  @click="handleSearch"
                  :loading="loading"
                  :disabled="!hasSelectedKB || !searchQuery.trim()"
                >
                  搜索
                </el-button>
              </template>
            </el-input>

            <div v-if="searchResults.length > 0" class="search-results space-y-4">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white">搜索结果</h3>
              
              <div v-for="result in searchResults" :key="result.id" class="result-item">
                <el-card>
                  <div class="flex justify-between items-start">
                    <div class="flex-1">
                      <h4 class="text-md font-semibold text-gray-900 dark:text-white mb-2">
                        {{ result.title }}
                      </h4>
                      <p class="text-sm text-gray-600 dark:text-gray-400 mb-3">
                        {{ result.content }}
                      </p>
                      <div class="flex items-center space-x-4 text-xs text-gray-500">
                        <span>来源: {{ result.source }}</span>
                        <span>知识库: {{ result.kb_name }}</span>
                        <span>相关度: {{ (result.relevance * 100).toFixed(0) }}%</span>
                      </div>
                    </div>
                    <div class="ml-4">
                      <el-progress 
                        type="circle" 
                        :percentage="result.relevance * 100"
                        :width="50"
                        :show-text="false"
                      />
                    </div>
                  </div>
                </el-card>
              </div>
            </div>
          </div>
        </el-card>
      </el-tab-pane>

      <!-- 摘要生成 -->
      <el-tab-pane label="摘要生成" name="summary">
        <el-card>
          <template #header>
            <div class="flex items-center space-x-2">
              <el-icon class="text-purple-600"><Document /></el-icon>
              <span class="font-semibold">摘要生成</span>
            </div>
          </template>

          <div class="space-y-4">
            <!-- 提示信息 -->
            <el-alert
              v-if="!hasSelectedKB"
              title="请先选择知识库"
              type="warning"
              description="需要选择一个知识库才能生成摘要"
              show-icon
              :closable="false"
            />
            
            <div v-if="!summaryResult && hasSelectedKB" class="text-center py-12">
              <el-icon size="64" class="text-gray-400 mb-4"><Document /></el-icon>
              <p class="text-gray-500 dark:text-gray-400 mb-6">
                为知识库"{{ selectedKBInfo?.name }}"生成智能摘要
              </p>
              
              <el-button 
                type="primary" 
                @click="generateSummary"
                :loading="loading"
                :disabled="!hasSelectedKB"
              >
                生成知识库摘要
              </el-button>
            </div>

            <!-- 摘要结果 -->
            <div v-if="summaryResult" class="mt-6">
              <div class="flex justify-between items-center mb-3">
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white">摘要结果</h3>
                <el-button 
                  size="small"
                  @click="generateSummary"
                  :loading="loading"
                >
                  重新生成
                </el-button>
              </div>
              <el-card class="summary-result">
                <pre class="whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300">{{ summaryResult }}</pre>
              </el-card>
            </div>
          </div>
        </el-card>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<style scoped>
.agent-tabs :deep(.el-tabs__content) {
  margin-top: 20px;
}

.analysis-result,
.summary-result {
  background: linear-gradient(135deg, #f6f9fc 0%, #f1f5f9 100%);
}

.analysis-result.dark,
.summary-result.dark {
  background: linear-gradient(135deg, #1f2937 0%, #111827 100%);
}

.result-item {
  transition: all 0.3s ease;
}

.result-item:hover {
  transform: translateY(-2px);
}

.agent-page :deep(.el-card__header) {
  padding: 16px 20px;
  border-bottom: 1px solid var(--el-border-color-light);
}

.agent-page :deep(.el-select .el-input__wrapper) {
  padding: 12px 16px;
}
</style> 