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
  // 新增字段
  document_name?: string
  document_id?: string
  chunk_index?: number
  file_type?: string
  upload_time?: string
  quality_score?: number
  keywords?: string[]
  summary?: string
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

// 解析搜索结果字符串
const parseSearchResults = (resultsText: string, query: string) => {
  const results = []
  
  // 按照 "结果：数字:" 的格式分割结果
  const resultPattern = /结果：(\d+):\s*(.*?)(?=结果：\d+:|$)/gs
  let match
  let index = 1
  
  while ((match = resultPattern.exec(resultsText)) !== null) {
    const [, resultNum, content] = match
    
    // 清理内容，移除多余的换行和空格
    const cleanContent = content.trim().replace(/\n+/g, '\n').replace(/\s+/g, ' ')
    
    results.push({
      id: `search-result-${index}`,
      title: `关于"${query}"的搜索结果 ${resultNum}`,
      content: cleanContent,
      relevance: Math.max(0.5, 1 - (index - 1) * 0.1), // 模拟相关度，第一个结果最高
      source: `知识库文档片段 ${resultNum}`
    })
    
    index++
  }
  
  // 如果没有匹配到标准格式，尝试其他可能的分割方式
  if (results.length === 0 && resultsText.trim()) {
    // 尝试按段落分割
    const paragraphs = resultsText.split(/\n\s*\n/).filter(p => p.trim())
    
    if (paragraphs.length > 1) {
      paragraphs.forEach((paragraph, idx) => {
        if (paragraph.trim()) {
          results.push({
            id: `search-result-${idx + 1}`,
            title: `关于"${query}"的搜索结果 ${idx + 1}`,
            content: paragraph.trim(),
            relevance: Math.max(0.5, 1 - idx * 0.1),
            source: `知识库文档片段 ${idx + 1}`
          })
        }
      })
    } else {
      // 将整个文本作为一个结果
      results.push({
        id: 'search-result-1',
        title: `关于"${query}"的搜索结果`,
        content: resultsText.trim(),
        relevance: 0.8,
        source: '知识库搜索结果'
      })
    }
  }
  
  return results
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
    
    // 根据新的数据结构处理搜索结果
    const searchData = response.data || response
    
    if (searchData.results && Array.isArray(searchData.results)) {
      // 处理新的数组格式数据
      searchResults.value = searchData.results.map((result, index) => ({
        id: `search-result-${index + 1}`,
        title: `搜索结果 ${result.index || index + 1}`,
        content: result.content || '',
        relevance: result.similarity_score || 0,
        source: result.source?.document_name || '未知来源',
        kb_name: selectedKBInfo.value?.name,
        // 新增字段
        document_name: result.source?.document_name || '',
        document_id: result.source?.document_id || '',
        chunk_index: result.source?.chunk_index || 0,
        file_type: result.source?.file_type || '',
        upload_time: result.source?.upload_time || '',
        quality_score: result.metadata?.quality_score || 0,
        keywords: result.metadata?.keywords || [],
        summary: result.metadata?.summary || ''
      }))
      
      if (searchResults.value.length === 0) {
        ElMessage.info('未找到相关内容，请尝试其他关键词')
      } else {
        ElMessage.success(`找到 ${searchResults.value.length} 个相关结果`)
      }
    } else if (searchData.results && typeof searchData.results === 'string') {
      // 兼容旧的字符串格式
      const resultsText = searchData.results
      const parsedResults = parseSearchResults(resultsText, searchData.query)
      
      searchResults.value = parsedResults.map(result => ({
        ...result,
        kb_name: selectedKBInfo.value?.name
      }))
      
      if (searchResults.value.length === 0) {
        ElMessage.info('未找到相关内容，请尝试其他关键词')
      } else {
        ElMessage.success(`找到 ${searchResults.value.length} 个相关结果`)
      }
    } else {
      searchResults.value = []
      ElMessage.info('未找到相关内容，请尝试其他关键词')
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

// 格式化上传时间
const formatUploadTime = (timeStr: string) => {
  try {
    const date = new Date(timeStr)
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  } catch {
    return '未知时间'
  }
}

// 根据相似度获取颜色
const getSimilarityColor = (score: number) => {
  if (score >= 0.8) return '#67c23a' // 绿色 - 高相关度
  if (score >= 0.6) return '#e6a23c' // 橙色 - 中等相关度
  if (score >= 0.4) return '#f56c6c' // 红色 - 低相关度
  return '#909399' // 灰色 - 很低相关度
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
    
    // 格式化摘要结果为Markdown格式
    let formattedSummary = `# 知识库"${selectedKBInfo.value?.name}"的AI智能摘要

## 📚 知识库概览
- **名称**：${selectedKBInfo.value?.name}
- **描述**：${selectedKBInfo.value?.description || '暂无描述'}
- **文档总数**：${summaryData.document_count || selectedKBInfo.value?.document_count || '未知'} 个
- **类型**：${selectedKBInfo.value?.is_public ? '公开知识库' : '私有知识库'}
- **摘要ID**：${summaryData.summary_id || '未知'}
- **处理时间**：${summaryData.processing_time ? (summaryData.processing_time * 1000).toFixed(0) + 'ms' : '未知'}

## 📖 AI生成的内容摘要

${summaryData.content || summaryData.summary || '暂无摘要内容'}

## 🏷️ 关键主题`
    
    if (summaryData.key_topics && summaryData.key_topics.length > 0) {
      formattedSummary += '\n'
      summaryData.key_topics.forEach((topic, index) => {
        formattedSummary += `\n- ${topic}`
      })
    } else {
      formattedSummary += '\n暂无关键主题信息'
    }
    
    formattedSummary += `

## 💡 使用建议
- 建议结合智能搜索功能深入探索特定主题
- 可使用智能分析功能获得更专业的见解
- 定期查看知识库更新以获取最新信息

*此摘要基于AI对知识库全部内容的理解和分析生成。*`
    
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
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-2">
            <el-icon class="text-purple-600"><Collection /></el-icon>
            <span class="font-semibold">选择知识库</span>
          </div>
          <el-button
            @click="loadKnowledgeBases"
            :loading="kbLoading"
            size="small"
            type="primary"
            :icon="kbLoading ? 'Loading' : 'Refresh'"
          >
            {{ kbLoading ? '加载中' : '刷新' }}
          </el-button>
        </div>
      </template>
      
      <div class="space-y-4">
        <el-select
          v-model="selectedKnowledgeBase"
          placeholder="请选择要分析的知识库..."
          size="large"
          :loading="kbLoading"
          @change="handleKnowledgeBaseChange"
          filterable
          style="width: 100%"
          :disabled="kbLoading || knowledgeBases.length === 0"
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
                <div class="text-sm text-gray-500">{{ kb.description || '暂无描述' }}</div>
              </div>
              <div class="text-sm text-gray-400 flex items-center space-x-2">
                <span>{{ kb.document_count }} 个文档</span>
                <el-tag v-if="kb.is_public" size="small" type="success">公开</el-tag>
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
                <el-card class="search-result-card">
                  <div class="result-header">
                    <div class="result-meta">
                      <div class="document-info">
                        <el-icon class="document-icon"><Document /></el-icon>
                        <span class="document-name">{{ result.document_name || result.source }}</span>
                        <el-tag v-if="result.file_type" size="small" type="info">{{ result.file_type.toUpperCase() }}</el-tag>
                      </div>
                      <div class="similarity-score">
                        <el-progress 
                          type="circle" 
                          :percentage="Math.round(result.relevance * 100)"
                          :width="45"
                          :show-text="false"
                          :color="getSimilarityColor(result.relevance)"
                        />
                        <span class="score-text">{{ Math.round(result.relevance * 100) }}%</span>
                      </div>
                    </div>
                  </div>
                  
                  <div class="result-content">
                    <div class="content-text">
                      <MarkdownRenderer :content="result.content" />
                    </div>
                  </div>
                  
                  <div class="result-footer">
                    <div class="footer-info">
                      <div class="info-item">
                        <el-icon><Collection /></el-icon>
                        <span>{{ result.kb_name }}</span>
                      </div>
                      <div class="info-item" v-if="result.chunk_index !== undefined">
                        <el-icon><Grid /></el-icon>
                        <span>片段 #{{ result.chunk_index + 1 }}</span>
                      </div>
                      <div class="info-item" v-if="result.quality_score">
                        <el-icon><Star /></el-icon>
                        <span>质量: {{ Math.round(result.quality_score * 100) }}%</span>
                      </div>
                      <div class="info-item" v-if="result.upload_time">
                        <el-icon><Clock /></el-icon>
                        <span>{{ formatUploadTime(result.upload_time) }}</span>
                      </div>
                    </div>
                    
                    <div class="keywords" v-if="result.keywords && result.keywords.length > 0">
                      <el-tag 
                        v-for="keyword in result.keywords.slice(0, 3)" 
                        :key="keyword" 
                        size="small" 
                        type="warning"
                        class="keyword-tag"
                      >
                        {{ keyword }}
                      </el-tag>
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
                <MarkdownRenderer :content="summaryResult" />
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

/* 基础样式优化 */
.agent-page :deep(.el-select .el-input__wrapper) {
  min-height: 48px;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.agent-page :deep(.el-select .el-input__wrapper:hover) {
  border-color: #3b82f6;
}

.agent-page :deep(.el-select .el-input__wrapper.is-focus) {
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
}

.agent-page :deep(.el-select .el-input__inner) {
  font-size: 15px;
  font-weight: 500;
}

/* 高级知识库选择器样式 */
.premium-kb-selector {
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  border: 1px solid #e2e8f0;
  border-radius: 20px;
  padding: 24px;
  box-shadow: 
    0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06),
    inset 0 1px 0 0 rgba(255, 255, 255, 0.1);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.premium-kb-selector::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(99, 102, 241, 0.3), transparent);
}

.premium-kb-selector:hover {
  transform: translateY(-2px);
  box-shadow: 
    0 10px 25px -3px rgba(0, 0, 0, 0.1),
    0 4px 6px -2px rgba(0, 0, 0, 0.05),
    inset 0 1px 0 0 rgba(255, 255, 255, 0.2);
}

/* 选择器头部 */
.selector-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.header-icon {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.header-icon .icon {
  font-size: 24px;
  color: white;
}

.header-text .title {
  font-size: 20px;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 4px 0;
  letter-spacing: -0.025em;
}

.header-text .subtitle {
  font-size: 14px;
  color: #64748b;
  margin: 0;
  font-weight: 500;
}

.header-actions {
  display: flex;
  gap: 8px;
}

.refresh-action-btn {
  width: 40px;
  height: 40px;
  border: 2px solid #e2e8f0;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
}

.refresh-action-btn:hover {
  border-color: #3b82f6;
  background: rgba(59, 130, 246, 0.1);
  transform: rotate(180deg);
}

/* 选择器主体 */
.selector-body {
  position: relative;
}

.custom-select-container {
  position: relative;
}

/* 自定义触发器 */
.custom-select-trigger {
  min-height: 80px;
  background: rgba(255, 255, 255, 0.9);
  border: 2px solid #e2e8f0;
  border-radius: 16px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  justify-content: space-between;
  backdrop-filter: blur(10px);
  position: relative;
  overflow: hidden;
}

.custom-select-trigger::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
  transition: left 0.5s ease;
}

.custom-select-trigger:hover::before {
  left: 100%;
}

.custom-select-trigger:hover {
  border-color: #3b82f6;
  box-shadow: 
    0 8px 25px -8px rgba(59, 130, 246, 0.3),
    0 0 0 3px rgba(59, 130, 246, 0.1);
  transform: translateY(-1px);
}

.custom-select-trigger.is-active {
  border-color: #3b82f6;
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(99, 102, 241, 0.05) 100%);
  box-shadow: 
    0 4px 12px -4px rgba(59, 130, 246, 0.3),
    inset 0 1px 0 0 rgba(255, 255, 255, 0.1);
}

.custom-select-trigger.is-disabled {
  cursor: not-allowed;
  opacity: 0.6;
  background: #f8fafc;
}

.trigger-content {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 16px;
}

/* 占位符内容 */
.placeholder-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.placeholder-icon {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #64748b;
  font-size: 18px;
}

.placeholder-text .main-text {
  display: block;
  font-size: 16px;
  font-weight: 600;
  color: #475569;
  margin-bottom: 2px;
}

.placeholder-text .sub-text {
  display: block;
  font-size: 13px;
  color: #94a3b8;
  font-weight: 500;
}

/* 已选择内容 */
.selected-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.selected-avatar {
  position: relative;
}

.avatar-bg {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #3b82f6 0%, #6366f1 100%);
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 20px;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
}

.selected-info {
  flex: 1;
}

.selected-name {
  font-size: 16px;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 4px;
  letter-spacing: -0.025em;
}

.selected-meta {
  display: flex;
  align-items: center;
  gap: 12px;
}

.doc-count {
  font-size: 13px;
  color: #64748b;
  font-weight: 500;
}

.public-badge {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  padding: 2px 8px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

/* 触发器箭头 */
.trigger-arrow {
  margin-left: 16px;
}

.arrow-icon {
  font-size: 16px;
  color: #94a3b8;
  transition: all 0.3s ease;
}

.arrow-icon.is-loading {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* 已选择知识库信息样式 */
.selected-kb-info {
  margin-top: 20px;
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
  border: 1px solid #bfdbfe;
  border-radius: 12px;
  padding: 16px;
  transition: all 0.3s ease;
}

.selected-kb-info:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
}

.info-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.info-icon {
  font-size: 20px;
  color: #3b82f6;
  flex-shrink: 0;
}

.info-text {
  flex: 1;
}

.info-title {
  font-size: 14px;
  font-weight: 600;
  color: #1e40af;
  margin-bottom: 2px;
}

.info-subtitle {
  font-size: 12px;
  color: #1d4ed8;
  opacity: 0.8;
}

/* 空状态知识库信息样式 */
.empty-kb-info {
  margin-top: 20px;
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  border: 1px solid #f59e0b;
  border-radius: 12px;
  padding: 16px;
  transition: all 0.3s ease;
}

.empty-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.empty-warning-icon {
  font-size: 20px;
  color: #d97706;
  flex-shrink: 0;
}

.empty-title {
  font-size: 14px;
  font-weight: 600;
  color: #92400e;
  margin-bottom: 2px;
}

.empty-subtitle {
  font-size: 12px;
  color: #a16207;
  opacity: 0.9;
}

/* 隐藏的选择器 */
.hidden-select {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  pointer-events: none;
}

.hidden-select :deep(.el-input) {
  height: 100%;
}

.hidden-select :deep(.el-input__wrapper) {
  background: transparent;
  border: none;
  box-shadow: none;
}

/* 高级下拉框样式 */
:deep(.premium-kb-dropdown) {
  border-radius: 20px;
  border: 1px solid #e2e8f0;
  box-shadow: 
    0 20px 25px -5px rgba(0, 0, 0, 0.1),
    0 10px 10px -5px rgba(0, 0, 0, 0.04);
  padding: 12px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  max-width: 500px;
  min-width: 400px;
}

:deep(.premium-kb-dropdown .el-scrollbar__view) {
  padding: 0;
}

/* 空状态 */
.empty-state {
  text-align: center;
  padding: 40px 20px;
}

.empty-icon {
  font-size: 48px;
  color: #cbd5e1;
  margin-bottom: 16px;
}

.empty-text {
  font-size: 16px;
  font-weight: 600;
  color: #475569;
  margin: 0 0 8px 0;
}

.empty-hint {
  font-size: 14px;
  color: #94a3b8;
  margin: 0;
}

/* 高级选项样式 */
:deep(.premium-option) {
  padding: 0 !important;
  margin-bottom: 8px;
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.2s ease;
}

:deep(.premium-option:last-child) {
  margin-bottom: 0;
}

:deep(.premium-option:hover) {
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%) !important;
  transform: translateX(4px);
}

:deep(.premium-option.selected) {
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%) !important;
  border: 1px solid #3b82f6;
}

.option-content {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 16px;
}

.option-avatar {
  flex-shrink: 0;
}

.avatar-circle {
  width: 44px;
  height: 44px;
  background: linear-gradient(135deg, #64748b 0%, #475569 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 18px;
}

.avatar-circle.is-public {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
}

.option-info {
  flex: 1;
  min-width: 0;
}

.option-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 6px;
}

.option-name {
  font-size: 15px;
  font-weight: 700;
  color: #1e293b;
  letter-spacing: -0.025em;
}

.option-badges {
  display: flex;
  gap: 6px;
  align-items: center;
}

.doc-badge {
  background: #f1f5f9;
  color: #475569;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
}

.option-description {
  font-size: 13px;
  color: #64748b;
  line-height: 1.4;
  margin-bottom: 8px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.option-stats {
  display: flex;
  gap: 16px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #94a3b8;
  font-weight: 500;
}

.stat-icon {
  font-size: 12px;
}

/* 搜索结果样式优化 */
.search-result-card {
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  transition: all 0.3s ease;
  overflow: hidden;
}

.search-result-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  border-color: #3b82f6;
}

.result-header {
  padding: 16px 20px 12px;
  border-bottom: 1px solid #f3f4f6;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
}

.result-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.document-info {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
}

.document-icon {
  color: #6b7280;
  font-size: 16px;
}

.document-name {
  font-weight: 600;
  color: #1f2937;
  font-size: 14px;
  max-width: 300px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.similarity-score {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.score-text {
  font-size: 11px;
  font-weight: 600;
  color: #4b5563;
}

.result-content {
  padding: 16px 20px;
}

.content-text {
  font-size: 14px;
  line-height: 1.6;
  color: #374151;
}

.content-text :deep(.markdown-content) {
  font-size: 14px;
  line-height: 1.6;
}

.content-text :deep(.markdown-content p) {
  margin: 0.5em 0;
}

.content-text :deep(.markdown-content h1),
.content-text :deep(.markdown-content h2),
.content-text :deep(.markdown-content h3) {
  margin: 0.5em 0 0.3em 0;
  font-size: 1em;
  font-weight: 600;
}

.result-footer {
  padding: 12px 20px 16px;
  background: #f9fafb;
  border-top: 1px solid #f3f4f6;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
}

.footer-info {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #6b7280;
  font-weight: 500;
}

.info-item .el-icon {
  font-size: 12px;
}

.keywords {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.keyword-tag {
  font-size: 11px;
  padding: 2px 6px;
  border-radius: 4px;
}

.result-item {
  transition: all 0.3s ease;
}

/* 暗色主题适配 */
.dark .search-result-card {
  border-color: #374151;
  background: #1f2937;
}

.dark .search-result-card:hover {
  border-color: #3b82f6;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
}

.dark .result-header {
  background: linear-gradient(135deg, #374151 0%, #1f2937 100%);
  border-bottom-color: #374151;
}

.dark .document-name {
  color: #f9fafb;
}

.dark .document-icon {
  color: #9ca3af;
}

.dark .score-text {
  color: #d1d5db;
}

.dark .content-text {
  color: #e5e7eb;
}

.dark .result-footer {
  background: #374151;
  border-top-color: #4b5563;
}

.dark .info-item {
  color: #9ca3af;
}

.agent-page :deep(.el-card__header) {
  padding: 16px 20px;
  border-bottom: 1px solid var(--el-border-color-light);
}

/* 暗色主题适配 */
.dark .premium-kb-selector {
  background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
  border-color: #334155;
}

.dark .premium-kb-selector::before {
  background: linear-gradient(90deg, transparent, rgba(99, 102, 241, 0.5), transparent);
}

.dark .header-text .title {
  color: #f1f5f9;
}

.dark .header-text .subtitle {
  color: #94a3b8;
}

.dark .refresh-action-btn {
  background: rgba(30, 41, 59, 0.8);
  border-color: #475569;
  color: #cbd5e1;
}

.dark .refresh-action-btn:hover {
  background: rgba(59, 130, 246, 0.2);
  border-color: #3b82f6;
}

.dark .custom-select-trigger {
  background: rgba(30, 41, 59, 0.9);
  border-color: #475569;
}

.dark .custom-select-trigger:hover {
  border-color: #3b82f6;
  box-shadow: 
    0 8px 25px -8px rgba(59, 130, 246, 0.4),
    0 0 0 3px rgba(59, 130, 246, 0.2);
}

.dark .custom-select-trigger.is-active {
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(99, 102, 241, 0.1) 100%);
}

.dark .placeholder-icon {
  background: linear-gradient(135deg, #334155 0%, #475569 100%);
  color: #94a3b8;
}

.dark .placeholder-text .main-text {
  color: #cbd5e1;
}

.dark .placeholder-text .sub-text {
  color: #64748b;
}

.dark .selected-name {
  color: #f1f5f9;
}

.dark .doc-count {
  color: #94a3b8;
}

.dark .arrow-icon {
  color: #64748b;
}

.dark :deep(.premium-kb-dropdown) {
  background: rgba(30, 41, 59, 0.95);
  border-color: #475569;
}

.dark .empty-icon {
  color: #475569;
}

.dark .empty-text {
  color: #cbd5e1;
}

.dark .empty-hint {
  color: #64748b;
}

.dark :deep(.premium-option:hover) {
  background: linear-gradient(135deg, #334155 0%, #475569 100%) !important;
}

.dark :deep(.premium-option.selected) {
  background: linear-gradient(135deg, #1e40af 0%, #1d4ed8 100%) !important;
  border-color: #3b82f6;
}

.dark .option-name {
  color: #f1f5f9;
}

.dark .doc-badge {
  background: #334155;
  color: #cbd5e1;
}

.dark .option-description {
  color: #94a3b8;
}

.dark .stat-item {
  color: #64748b;
}

/* 暗色主题 - 已选择知识库信息 */
.dark .selected-kb-info {
  background: linear-gradient(135deg, #1e40af 0%, #1d4ed8 100%);
  border-color: #3b82f6;
}

.dark .info-title {
  color: #dbeafe;
}

.dark .info-subtitle {
  color: #bfdbfe;
}

.dark .info-icon {
  color: #60a5fa;
}

/* 暗色主题 - 空状态知识库信息 */
.dark .empty-kb-info {
  background: linear-gradient(135deg, #92400e 0%, #a16207 100%);
  border-color: #d97706;
}

.dark .empty-title {
  color: #fde68a;
}

.dark .empty-subtitle {
  color: #fef3c7;
}

.dark .empty-warning-icon {
  color: #fbbf24;
}
</style>