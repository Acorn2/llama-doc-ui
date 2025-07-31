<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Search, RefreshLeft, Document, Star, StarFilled } from '@element-plus/icons-vue'
import { KnowledgeBaseAPI, type KnowledgeBase, type PublicKnowledgeBaseQuery } from '@/api/modules/knowledge-base'
import { useUserStore } from '@/store/modules/user'

const router = useRouter()
const userStore = useUserStore()

// 数据状态
const knowledgeBases = ref<KnowledgeBase[]>([])
const loading = ref(false)
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(12)

// 搜索和过滤
const searchQuery = ref('')

// 分页信息
const totalPages = computed(() => Math.ceil(total.value / pageSize.value))

// 加载公开知识库列表
const loadKnowledgeBases = async () => {
  try {
    loading.value = true
    
    const query: PublicKnowledgeBaseQuery = {
      page: currentPage.value,
      page_size: pageSize.value,
      sort_by: 'create_time',
      sort_order: 'desc'
    }
    
    if (searchQuery.value.trim()) {
      query.search = searchQuery.value.trim()
    }
    
    const response = await KnowledgeBaseAPI.getPublicList(query)
    
    knowledgeBases.value = response.data.items
    total.value = response.data.total
    
  } catch (error) {
    console.error('加载公开知识库失败:', error)
    ElMessage.error('加载知识库列表失败')
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  currentPage.value = 1
  loadKnowledgeBases()
}

// 清空搜索
const clearSearch = () => {
  searchQuery.value = ''
  currentPage.value = 1
  loadKnowledgeBases()
}

// 页码变化
const handlePageChange = (page: number) => {
  currentPage.value = page
  loadKnowledgeBases()
}

// 点赞知识库
const handleLike = async (kb: KnowledgeBase) => {
  if (!userStore.isAuthenticated) {
    ElMessage.warning('请先登录')
    router.push('/login')
    return
  }
  
  try {
    const response = await KnowledgeBaseAPI.toggleLike(kb.id)
    
    // 更新本地状态
    const index = knowledgeBases.value.findIndex(item => item.id === kb.id)
    if (index !== -1) {
      knowledgeBases.value[index].is_liked = response.is_liked
      knowledgeBases.value[index].like_count = response.like_count
    }
    
    ElMessage.success(response.message)
  } catch (error) {
    console.error('点赞操作失败:', error)
    ElMessage.error('操作失败')
  }
}

// 查看知识库详情
const viewKnowledgeBase = async (kb: KnowledgeBase) => {
  if (userStore.isAuthenticated) {
    // 记录访问行为
    try {
      await KnowledgeBaseAPI.recordAccess(kb.id, {
        access_type: 'view',
        access_metadata: {
          source: 'public_list',
          page: 'public_knowledge_base'
        }
      })
    } catch (error) {
      console.warn('记录访问失败:', error)
    }
  }
  
  // 跳转到知识库详情页（这里暂时跳转到对话页面）
  router.push(`/chat?kb_id=${kb.id}`)
}

// 格式化数量显示
const formatCount = (count: number): string => {
  if (count >= 1000) {
    return `${Math.floor(count / 100) / 10}k`
  }
  return count.toString()
}

onMounted(() => {
  loadKnowledgeBases()
})
</script>

<template>
  <div class="public-knowledge-base p-6 space-y-6">
    <!-- 页面标题 -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
          公开知识库
        </h1>
        <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
          发现和使用社区分享的优质知识库
        </p>
      </div>
      
      <div class="flex items-center space-x-2">
        <el-tag>共 {{ total }} 个知识库</el-tag>
      </div>
    </div>

    <!-- 搜索 -->
    <el-card>
      <div class="flex gap-4">
        <!-- 搜索框 -->
        <div class="flex-1">
          <el-input
            v-model="searchQuery"
            placeholder="搜索知识库名称或描述..."
            :prefix-icon="Search"
            clearable
            @keyup.enter="handleSearch"
            @clear="clearSearch"
          >
            <template #append>
              <el-button @click="handleSearch" :icon="Search">搜索</el-button>
            </template>
          </el-input>
        </div>

        <el-button @click="clearSearch" :icon="RefreshLeft">清空</el-button>
      </div>
    </el-card>

    <!-- 知识库网格 -->
    <div v-loading="loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      <el-card
        v-for="kb in knowledgeBases"
        :key="kb.id"
        class="knowledge-base-card hover:shadow-lg transition-all duration-300 cursor-pointer"
        shadow="hover"
        @click="viewKnowledgeBase(kb)"
      >
        <!-- 知识库头部 -->
        <div class="flex items-start justify-between mb-3">
          <div class="flex-1 min-w-0">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white truncate">
              {{ kb.name }}
            </h3>
            <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
              by {{ kb.owner_name }}
            </p>
          </div>
          
          <!-- 点赞按钮 -->
          <el-button
            :type="kb.is_liked ? 'primary' : 'default'"
            size="small"
            circle
            @click.stop="handleLike(kb)"
          >
            <el-icon>
              <StarFilled v-if="kb.is_liked" />
              <Star v-else />
            </el-icon>
          </el-button>
        </div>

        <!-- 描述 -->
        <p class="text-sm text-gray-700 dark:text-gray-300 mb-4 line-clamp-3">
          {{ kb.public_description || kb.description || '暂无描述' }}
        </p>

        <!-- 标签 -->
        <div class="flex flex-wrap gap-1 mb-4" v-if="kb.tags.length > 0">
          <el-tag
            v-for="tag in kb.tags.slice(0, 3)"
            :key="tag"
            size="small"
            type="info"
            effect="plain"
          >
            {{ tag }}
          </el-tag>
          <el-tag
            v-if="kb.tags.length > 3"
            size="small"
            type="info"
            effect="plain"
          >
            +{{ kb.tags.length - 3 }}
          </el-tag>
        </div>

        <!-- 统计信息 -->
        <div class="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
          <div class="flex items-center space-x-4">
            <span class="flex items-center space-x-1">
              <el-icon><Document /></el-icon>
              <span>{{ kb.document_count }}</span>
            </span>
            <span class="flex items-center space-x-1">
              <el-icon><Star /></el-icon>
              <span>{{ formatCount(kb.like_count) }}</span>
            </span>
          </div>
          
          <span class="text-xs">
            {{ new Date(kb.create_time).toLocaleDateString() }}
          </span>
        </div>
      </el-card>
    </div>

    <!-- 空状态 -->
    <el-empty v-if="!loading && knowledgeBases.length === 0" description="暂无公开知识库" />

    <!-- 分页 -->
    <div class="flex justify-center" v-if="totalPages > 1">
      <el-pagination
        v-model:current-page="currentPage"
        :page-size="pageSize"
        :total="total"
        :page-count="totalPages"
        layout="prev, pager, next, total"
        @current-change="handlePageChange"
      />
    </div>
  </div>
</template>

<style scoped>
.knowledge-base-card:hover {
  transform: translateY(-2px);
}

.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style> 