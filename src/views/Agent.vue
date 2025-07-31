<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { KnowledgeBaseAPI, type KnowledgeBase } from '@/api/modules/knowledge-base'
import { AgentAPI, type AnalysisRequest, type SearchRequest, type SummaryRequest } from '@/api/modules/agent'
import { ElMessage } from 'element-plus'
import MarkdownRenderer from '@/components/MarkdownRenderer.vue'

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
    
    if (knowledgeBases.value.length === 0) {
      ElMessage.info('暂无可用的知识库，请先创建或访问公开知识库')
    }
  } catch (error) {
    console.error('加载知识库失败:', error)
    ElMessage.error('加载知识库列表失败，请检查网络连接或稍后重试')
    knowledgeBases.value = []
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
  
  console.log('已选择知识库:', selectedKBInfo.value?.name)
}

// 清空分析结果
const clearAnalysisResult = () => {
  analysisResult.value = ''
  analysisQuery.value = ''
}

// 清空搜索结果
const clearSearchResults = () => {
  searchResults.value = []
  searchQuery.value = ''
}

// 清空摘要结果
const clearSummaryResult = () => {
  summaryResult.value = ''
}

// 智能分析
const handleAnalysis = async () => {
  if (!hasSelectedKB.value) {
    ElMessage.warning('请先选择知识库')
    return
  }
  
  if (!analysisQuery.value.trim()) {
    ElMessage.warning('请输入分析内容')
    return
  }
  
  loading.value = true
  
  try {
    // 显示长时间操作提示
    ElMessage.info('AI分析正在进行中，这可能需要1-3分钟，请耐心等待...')
    
    const analysisRequest: AnalysisRequest = {
      kb_id: selectedKnowledgeBase.value,
      query: analysisQuery.value.trim(),
      analysis_type: 'concept' // 默认使用概念分析
    }
    
    const response = await AgentAPI.analyze(analysisRequest)
    
    console.log('API返回的分析数据:', response)
    
    // 根据实际返回的数据结构处理
    const analysisData = response.data || response
    
    // 直接使用后端返回的Markdown内容，添加一些元信息
    let formattedResult = `# 基于知识库"${selectedKBInfo.value?.name}"的AI智能分析结果

## 📊 分析概览
- **查询内容**: ${analysisData.query || analysisQuery.value}
- **处理时间**: ${analysisData.processing_time ? (analysisData.processing_time * 1000).toFixed(0) + 'ms' : '未知'}
- **分析状态**: ${analysisData.error ? '部分成功' : '成功'}

## 📝 分析内容

${analysisData.analysis || analysisData.result || '暂无分析结果'}`

    if (analysisData.error) {
      formattedResult += `\n\n## ⚠️ 注意事项\n${analysisData.error}`
    }
    
    // 如果有来源信息
    if (analysisData.sources && analysisData.sources.length > 0) {
      formattedResult += '\n\n## 📚 参考来源\n'
      analysisData.sources.forEach((source, index) => {
        formattedResult += `${index + 1}. **${source.title}** (相关度: ${(source.relevance * 100).toFixed(1)}%)\n`
      })
    }
    
    analysisResult.value = formattedResult
    ElMessage.success('分析完成')
    
  } catch (error: any) {
    console.error('智能分析失败:', error)
    
    // 检查是否是超时错误
    if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      ElMessage.error('分析超时，请尝试简化查询内容或稍后重试')
    } else {
      const errorMessage = error.response?.data?.detail || error.message || '分析失败，请稍后重试'
      ElMessage.error(errorMessage)
    }
    
    analysisResult.value = ''
  } finally {
    loading.value = false
  }
}

// 智能搜索
const handleSearch = async () => {
  if (!hasSelectedKB.value) {
    ElMessage.warning('请先选择知识库')
    return
  }
  
  if (!searchQuery.value.trim()) {
    ElMessage.warning('请输入搜索内容')
    return
  }
  
  loading.value = true
  
  try {
    ElMessage.info('AI搜索正在进行中，请稍候...')
    
    const searchRequest: SearchRequest = {
      kb_id: selectedKnowledgeBase.value,
      query: searchQuery.value.trim(),
      limit: 10, // 限制返回结果数量
      threshold: 0.5 // 相关度阈值
    }
    
    const response = await AgentAPI.search(searchRequest)
    
    console.log('API返回的搜索数据:', response)
    
    // 根据实际返回的数据结构处理
    const searchData = response.data || response
    const results = searchData.results || []
    
    // 为搜索结果添加知识库名称
    searchResults.value = results.map(result => ({
      ...result,
      kb_name: selectedKBInfo.value?.name
    }))
    
    if (searchResults.value.length === 0) {
      ElMessage.info('未找到相关内容，请尝试其他关键词')
    } else {
      ElMessage.success(`找到 ${searchData.total || results.length} 个相关结果`)
    }
    
  } catch (error: any) {
    console.error('智能搜索失败:', error)
    
    if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      ElMessage.error('搜索超时，请尝试简化搜索词或稍后重试')
    } else {
      const errorMessage = error.response?.data?.detail || error.message || '搜索失败，请稍后重试'
      ElMessage.error(errorMessage)
    }
    
    searchResults.value = []
  } finally {
    loading.value = false
  }
}

// 生成摘要
const generateSummary = async () => {
  if (!hasSelectedKB.value) {
    ElMessage.warning('请先选择知识库')
    return
  }
  
  loading.value = true
  
  try {
    ElMessage.info('AI摘要生成中，这可能需要1-2分钟，请稍候...')
    
    const summaryRequest: SummaryRequest = {
      kb_id: selectedKnowledgeBase.value,
      summary_type: 'overview' // 使用概览类型摘要
    }
    
    const response = await AgentAPI.generateSummary(summaryRequest)
    
    console.log('API返回的摘要数据:', response)
    
    // 根据实际返回的数据结构处理
    const summaryData = response.data || response
    
    // 格式化摘要结果
    let formattedSummary = `知识库"${selectedKBInfo.value?.name}"的AI智能摘要

📚 知识库概览
• 名称：${selectedKBInfo.value?.name}
• 描述：${selectedKBInfo.value?.description || '暂无描述'}
• 文档总数：${summaryData.document_count || selectedKBInfo.value?.document_count || '未知'} 个
• 类型：${selectedKBInfo.value?.is_public ? '公开知识库' : '私有知识库'}
• 摘要ID：${summaryData.summary_id || '未知'}
• 处理时间：${summaryData.processing_time ? (summaryData.processing_time * 1000).toFixed(0) + 'ms' : '未知'}

📖 AI生成的内容摘要
${summaryData.content || summaryData.summary || '暂无摘要内容'}

🏷️ 关键主题`
    
    if (summaryData.key_topics && summaryData.key_topics.length > 0) {
      formattedSummary += '\n'
      summaryData.key_topics.forEach((topic, index) => {
        formattedSummary += `\n• ${topic}`
      })
    } else {
      formattedSummary += '\n暂无关键主题信息'
    }
    
    formattedSummary += `

💡 使用建议
• 建议结合智能搜索功能深入探索特定主题
• 可使用智能分析功能获得更专业的见解
• 定期查看知识库更新以获取最新信息

此摘要基于AI对知识库全部内容的理解和分析生成。`
    
    summaryResult.value = formattedSummary
    ElMessage.success('摘要生成完成')
    
  } catch (error: any) {
    console.error('生成摘要失败:', error)
    
    if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      ElMessage.error('摘要生成超时，请稍后重试')
    } else {
      const errorMessage = error.response?.data?.detail || error.message || '摘要生成失败，请稍后重试'
      ElMessage.error(errorMessage)
    }
    
    summaryResult.value = ''
  } finally {
    loading.value = false
  }
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
        <div class="flex space-x-2">
          <el-select
            v-model="selectedKnowledgeBase"
            placeholder="请选择要分析的知识库..."
            size="large"
            style="flex: 1"
            :loading="kbLoading"
            @change="handleKnowledgeBaseChange"
            filterable
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
          
          <el-button
            @click="loadKnowledgeBases"
            :loading="kbLoading"
            size="large"
            type="primary"
            plain
          >
            {{ kbLoading ? '加载中...' : '刷新' }}
          </el-button>
        </div>
        
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
        
        <!-- 无知识库时的提示 -->
        <div v-if="!kbLoading && knowledgeBases.length === 0" class="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
          <div class="flex items-center space-x-3">
            <el-icon class="text-yellow-600"><Warning /></el-icon>
            <div>
              <div class="font-medium text-yellow-900 dark:text-yellow-100">
                暂无可用的知识库
              </div>
              <div class="text-sm text-yellow-700 dark:text-yellow-300">
                请先创建知识库或访问公开知识库，然后刷新页面
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
                {{ loading ? 'AI分析中，请耐心等待...' : '开始分析' }}
              </el-button>
            </div>

            <!-- 分析进行中的提示 -->
            <el-alert
              v-if="loading && activeTab === 'analysis'"
              title="AI分析正在进行中"
              type="info"
              description="复杂的AI分析可能需要1-3分钟时间，请耐心等待，不要关闭页面"
              show-icon
              :closable="false"
              class="mt-4"
            />

            <div v-if="analysisResult" class="mt-6">
              <div class="flex justify-between items-center mb-3">
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white">分析结果</h3>
                <el-button 
                  size="small" 
                  type="info" 
                  plain
                  @click="clearAnalysisResult"
                >
                  清空结果
                </el-button>
              </div>
              <el-card class="analysis-result">
                <MarkdownRenderer :content="analysisResult" />
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
                  {{ loading ? 'AI搜索中...' : '搜索' }}
                </el-button>
              </template>
            </el-input>

            <!-- 搜索进行中的提示 -->
            <el-alert
              v-if="loading && activeTab === 'search'"
              title="AI搜索正在进行中"
              type="info"
              description="正在智能搜索知识库内容，请稍候..."
              show-icon
              :closable="false"
              class="mt-4"
            />

            <div v-if="searchResults.length > 0" class="search-results space-y-4">
              <div class="flex justify-between items-center">
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                  搜索结果 ({{ searchResults.length }} 条)
                </h3>
                <el-button 
                  size="small" 
                  type="info" 
                  plain
                  @click="clearSearchResults"
                >
                  清空结果
                </el-button>
              </div>
              
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
                {{ loading ? 'AI摘要生成中...' : '生成知识库摘要' }}
              </el-button>
            </div>

            <!-- 摘要生成中的提示 -->
            <el-alert
              v-if="loading && activeTab === 'summary' && !summaryResult"
              title="AI摘要生成中"
              type="info"
              description="正在分析知识库内容并生成智能摘要，这可能需要1-2分钟，请耐心等待..."
              show-icon
              :closable="false"
              class="mt-4"
            />

            <!-- 摘要结果 -->
            <div v-if="summaryResult" class="mt-6">
              <div class="flex justify-between items-center mb-3">
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white">摘要结果</h3>
                <el-button 
                  size="small"
                  @click="generateSummary"
                  :loading="loading"
                >
                  {{ loading ? '生成中...' : '重新生成' }}
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