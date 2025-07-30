<template>
  <div class="markdown-content" v-html="renderedContent"></div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { marked } from 'marked'
import hljs from 'highlight.js'

interface Props {
  content: string
}

const props = defineProps<Props>()

// 配置marked
marked.setOptions({
  highlight: function(code, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return hljs.highlight(code, { language: lang }).value
      } catch (err) {
        console.warn('代码高亮失败:', err)
      }
    }
    return hljs.highlightAuto(code).value
  },
  breaks: true, // 支持换行
  gfm: true, // 支持GitHub风格的Markdown
})

const renderedContent = computed(() => {
  if (!props.content) return ''
  
  try {
    return marked(props.content)
  } catch (error) {
    console.error('Markdown渲染失败:', error)
    return props.content
  }
})
</script>

<style scoped>
.markdown-content {
  line-height: 1.6;
  color: #374151;
  word-wrap: break-word;
}

.dark .markdown-content {
  color: #f3f4f6;
}

/* 标题样式 */
.markdown-content :deep(h1),
.markdown-content :deep(h2),
.markdown-content :deep(h3),
.markdown-content :deep(h4),
.markdown-content :deep(h5),
.markdown-content :deep(h6) {
  margin: 1.5em 0 0.5em 0;
  font-weight: 600;
  line-height: 1.3;
}

.markdown-content :deep(h1) {
  font-size: 1.5em;
  color: #1f2937;
  border-bottom: 2px solid #e5e7eb;
  padding-bottom: 0.3em;
}

.markdown-content :deep(h2) {
  font-size: 1.3em;
  color: #374151;
  border-bottom: 1px solid #e5e7eb;
  padding-bottom: 0.2em;
}

.markdown-content :deep(h3) {
  font-size: 1.2em;
  color: #4b5563;
}

.markdown-content :deep(h4),
.markdown-content :deep(h5),
.markdown-content :deep(h6) {
  font-size: 1.1em;
  color: #6b7280;
}

.dark .markdown-content :deep(h1) {
  color: #f9fafb;
  border-color: #374151;
}

.dark .markdown-content :deep(h2) {
  color: #f3f4f6;
  border-color: #374151;
}

.dark .markdown-content :deep(h3) {
  color: #e5e7eb;
}

.dark .markdown-content :deep(h4),
.dark .markdown-content :deep(h5),
.dark .markdown-content :deep(h6) {
  color: #d1d5db;
}

/* 段落样式 */
.markdown-content :deep(p) {
  margin: 0.8em 0;
  line-height: 1.7;
}

/* 列表样式 */
.markdown-content :deep(ul),
.markdown-content :deep(ol) {
  margin: 0.8em 0;
  padding-left: 2em;
}

.markdown-content :deep(li) {
  margin: 0.3em 0;
  line-height: 1.6;
}

.markdown-content :deep(ul li) {
  list-style-type: disc;
}

.markdown-content :deep(ol li) {
  list-style-type: decimal;
}

/* 代码样式 */
.markdown-content :deep(code) {
  background-color: #f3f4f6;
  color: #e11d48;
  padding: 0.2em 0.4em;
  border-radius: 3px;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 0.9em;
}

.dark .markdown-content :deep(code) {
  background-color: #374151;
  color: #fbbf24;
}

.markdown-content :deep(pre) {
  background-color: #f8fafc;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  padding: 1em;
  margin: 1em 0;
  overflow-x: auto;
  line-height: 1.4;
}

.dark .markdown-content :deep(pre) {
  background-color: #1f2937;
  border-color: #374151;
}

.markdown-content :deep(pre code) {
  background: none;
  color: inherit;
  padding: 0;
  border-radius: 0;
  font-size: 0.85em;
}

/* 引用样式 */
.markdown-content :deep(blockquote) {
  border-left: 4px solid #667eea;
  background-color: #f8fafc;
  margin: 1em 0;
  padding: 0.8em 1.2em;
  color: #4b5563;
  font-style: italic;
}

.dark .markdown-content :deep(blockquote) {
  background-color: #1f2937;
  color: #d1d5db;
  border-color: #667eea;
}

/* 表格样式 */
.markdown-content :deep(table) {
  border-collapse: collapse;
  width: 100%;
  margin: 1em 0;
  font-size: 0.9em;
}

.markdown-content :deep(th),
.markdown-content :deep(td) {
  border: 1px solid #e5e7eb;
  padding: 0.6em 1em;
  text-align: left;
}

.markdown-content :deep(th) {
  background-color: #f9fafb;
  font-weight: 600;
  color: #374151;
}

.dark .markdown-content :deep(th) {
  background-color: #374151;
  color: #f3f4f6;
  border-color: #4b5563;
}

.dark .markdown-content :deep(td) {
  border-color: #4b5563;
}

/* 链接样式 */
.markdown-content :deep(a) {
  color: #667eea;
  text-decoration: none;
  border-bottom: 1px solid transparent;
  transition: all 0.2s ease;
}

.markdown-content :deep(a:hover) {
  color: #5a67d8;
  border-bottom-color: #5a67d8;
}

.dark .markdown-content :deep(a) {
  color: #818cf8;
}

.dark .markdown-content :deep(a:hover) {
  color: #a5b4fc;
  border-bottom-color: #a5b4fc;
}

/* 分割线样式 */
.markdown-content :deep(hr) {
  border: none;
  height: 1px;
  background-color: #e5e7eb;
  margin: 2em 0;
}

.dark .markdown-content :deep(hr) {
  background-color: #374151;
}

/* 强调样式 */
.markdown-content :deep(strong) {
  font-weight: 600;
  color: #1f2937;
}

.dark .markdown-content :deep(strong) {
  color: #f9fafb;
}

.markdown-content :deep(em) {
  font-style: italic;
  color: #4b5563;
}

.dark .markdown-content :deep(em) {
  color: #d1d5db;
}

/* 删除线样式 */
.markdown-content :deep(del) {
  text-decoration: line-through;
  color: #9ca3af;
}

/* 图片样式 */
.markdown-content :deep(img) {
  max-width: 100%;
  height: auto;
  border-radius: 6px;
  margin: 0.5em 0;
}
</style>