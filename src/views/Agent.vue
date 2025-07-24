<script setup lang="ts">
import { ref, onMounted } from 'vue'

const activeTab = ref('analysis')
const loading = ref(false)
const analysisQuery = ref('')
const analysisResult = ref('')
const searchQuery = ref('')
const searchResults = ref([])

onMounted(() => {
  console.log('Agent page mounted')
})

const handleAnalysis = () => {
  if (!analysisQuery.value.trim()) return
  
  loading.value = true
  // 模拟分析过程
  setTimeout(() => {
    analysisResult.value = `基于您的查询"${analysisQuery.value}"，以下是AI分析结果：

这是一个模拟的智能分析结果。在实际应用中，这里会：
1. 调用后端AI分析接口
2. 对知识库内容进行深度分析
3. 生成详细的分析报告
4. 提供相关的参考文献和数据支持

分析要点：
• 关键概念提取
• 相关性分析  
• 趋势预测
• 建议方案`
    
    loading.value = false
  }, 2000)
}

const handleSearch = () => {
  if (!searchQuery.value.trim()) return
  
  loading.value = true
  // 模拟搜索过程
  setTimeout(() => {
    searchResults.value = [
      {
        id: '1',
        title: '机器学习基础理论',
        content: '机器学习是人工智能的一个重要分支，主要研究如何让计算机从数据中学习...',
        relevance: 0.95,
        source: '机器学习教程.pdf'
      },
      {
        id: '2', 
        title: '深度学习应用',
        content: '深度学习在图像识别、自然语言处理等领域有着广泛的应用...',
        relevance: 0.87,
        source: '深度学习实战.pdf'
      }
    ]
    loading.value = false
  }, 1500)
}

const generateSummary = () => {
  loading.value = true
  setTimeout(() => {
    // 模拟生成摘要
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
            <el-input
              v-model="analysisQuery"
              type="textarea"
              :rows="3"
              placeholder="请输入您想要分析的问题或主题..."
              :disabled="loading"
            />
            
            <div class="flex justify-between items-center">
              <span class="text-sm text-gray-500">输入您的分析需求，AI将为您提供深度分析</span>
              <el-button 
                type="primary" 
                @click="handleAnalysis"
                :loading="loading"
                :disabled="!analysisQuery.trim()"
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
            <el-input
              v-model="searchQuery"
              placeholder="输入搜索关键词..."
              :disabled="loading"
            >
              <template #append>
                <el-button 
                  @click="handleSearch"
                  :loading="loading"
                  :disabled="!searchQuery.trim()"
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

          <div class="text-center py-12">
            <el-icon size="64" class="text-gray-400 mb-4"><Document /></el-icon>
            <p class="text-gray-500 dark:text-gray-400 mb-6">选择知识库生成智能摘要</p>
            
            <el-button 
              type="primary" 
              @click="generateSummary"
              :loading="loading"
            >
              生成知识库摘要
            </el-button>
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

.analysis-result {
  background: linear-gradient(135deg, #f6f9fc 0%, #f1f5f9 100%);
}

.analysis-result.dark {
  background: linear-gradient(135deg, #1f2937 0%, #111827 100%);
}

.result-item {
  transition: all 0.3s ease;
}

.result-item:hover {
  transform: translateY(-2px);
}
</style> 