<script setup lang="ts">
import { ref, onMounted } from 'vue'

const knowledgeBases = ref([
  {
    id: '1',
    name: '机器学习知识库',
    description: '包含机器学习相关的文档和资料',
    document_count: 15,
    create_time: '2024-01-15 09:00:00',
    status: 'active'
  },
  {
    id: '2',
    name: '深度学习知识库', 
    description: '深度学习技术文档集合',
    document_count: 8,
    create_time: '2024-01-18 14:30:00',
    status: 'active'
  }
])

const loading = ref(false)

onMounted(() => {
  console.log('KnowledgeBase page mounted')
})

const handleCreate = () => {
  console.log('Create knowledge base')
}

const handleEdit = (id: string) => {
  console.log('Edit knowledge base:', id)
}

const handleDelete = (id: string) => {
  console.log('Delete knowledge base:', id)
}
</script>

<template>
  <div class="knowledge-base-page p-6">
    <div class="flex justify-between items-center mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">知识库管理</h1>
        <p class="text-gray-600 dark:text-gray-400 mt-1">创建和管理您的知识库</p>
      </div>
      <el-button type="primary" @click="handleCreate">
        <el-icon class="mr-2"><Plus /></el-icon>
        创建知识库
      </el-button>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <el-card v-for="kb in knowledgeBases" :key="kb.id" class="kb-card">
        <template #header>
          <div class="flex justify-between items-center">
            <h3 class="text-lg font-semibold">{{ kb.name }}</h3>
            <el-dropdown>
              <el-button type="text">
                <el-icon><MoreFilled /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item @click="handleEdit(kb.id)">编辑</el-dropdown-item>
                  <el-dropdown-item @click="handleDelete(kb.id)">删除</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </template>

        <div class="space-y-3">
          <p class="text-gray-600 dark:text-gray-400 text-sm">{{ kb.description }}</p>
          
          <div class="flex items-center justify-between">
            <span class="text-sm text-gray-500">文档数量</span>
            <span class="text-lg font-semibold text-blue-600">{{ kb.document_count }}</span>
          </div>
          
          <div class="flex items-center justify-between">
            <span class="text-sm text-gray-500">创建时间</span>
            <span class="text-sm">{{ kb.create_time }}</span>
          </div>

          <div class="pt-3">
            <el-button type="primary" size="small" class="w-full">
              进入知识库
            </el-button>
          </div>
        </div>
      </el-card>
    </div>
  </div>
</template>

<style scoped>
.kb-card {
  transition: all 0.3s ease;
}

.kb-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px -8px rgba(0, 0, 0, 0.1);
}
</style> 