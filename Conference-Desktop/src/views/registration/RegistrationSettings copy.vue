<template>
  <div class="conference-signup-container">
    <div class="view-tabs">
      <div class="tab-item">会议报名 / 会议列表</div>
    </div>
    <!-- 头部：标题 + 操作按钮 (始终显示) -->

    <div class="page-header">
      <div class="header-left">
        <div class="header-actions" v-if="!showCreateForm">
          <div class="search-section">
            <div class="search-wrapper">
              <el-input
                v-model="searchKeyword"
                placeholder="请输入会议名称"
                :prefix-icon="Search"
                clearable
              />
            </div>
            <div class="date-picker-wrapper">
              <el-date-picker
                v-model="selectedDate"
                type="date"
                placeholder="选择日期"
                format="YYYY-MM-DD"
                value-format="YYYY-MM-DD"
                clearable
              />
            </div>
          </div>
        </div>
        <div class="form-actions" v-else>
          <div class="search-section">
            <div class="search-wrapper">
              <div class="label">会议名称</div>
              <el-input
                v-model="searchKeyword"
                placeholder="请输入会议名称"
                :prefix-icon="Search"
                clearable
              />
            </div>
            <div class="date-picker-wrapper">
              <div class="label">选择日期</div>
              <el-date-picker
                v-model="selectedDate"
                type="date"
                placeholder="选择日期"
                format="YYYY-MM-DD"
                value-format="YYYY-MM-DD"
                clearable
              />
            </div>
          </div>

          <div style="">
            <el-button @click="handlePreview">预览</el-button>
            <el-button type="primary" @click="handleSave">保存</el-button>
            <el-button @click="handleExit">退出</el-button>
          </div>
        </div>
      </div>
    </div>

    <!-- 内容区域：根据状态切换显示 -->
    <div class="content-card">
      <!-- 会议列表模式 -->
      <template v-if="!showCreateForm">
        <!-- 创建报名卡片 - 第一个框 -->
        <div class="create-card" @click="handleCreate">
          <div class="create-content">
            <el-button type="primary" circle>
              <el-icon class="plus-icon"><Plus /></el-icon>
            </el-button>
            <span>创建报名</span>
          </div>
        </div>

        <!-- 会议卡片列表 -->
        <div class="meeting-list">
          <MeetingCard
            v-for="meeting in meetingList"
            :key="meeting.id"
            :meeting="meeting"
            @edit="handleEdit"
            @data="handleData"
            @promote="handlePromote"
            @delete="handleDelete"
          />
        </div>
      </template>

      <ConferenceForm ref="conferenceFormRef" v-else :key="currentEditId || 'new'" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Plus } from '@element-plus/icons-vue'
import MeetingCard from './MeetingCard.vue'
import ConferenceForm from './ConferenceForm.vue'

// 添加 ConferenceForm 的引用
const conferenceFormRef = ref<InstanceType<typeof ConferenceForm> | null>(null)

// 搜索关键词
const searchKeyword = ref('')
// 选择的日期
const selectedDate = ref('')
// 是否显示创建表单
const showCreateForm = ref(false)
// 当前编辑的会议ID（用于编辑模式）
const currentEditId = ref<string | null>(null)

// 会议列表数据
const meetingList = ref([
  {
    id: '1',
    status: 'published' as const,
    title: '第六届上海国际船舶管理论坛',
    date: '2025-12-03',
    stats: { forms: 0, views: 0, visitors: 0 },
    pageImages: {} as Record<number, string>,
    coverPreviewUrl: '',
    formFields: null as any,
  },
  {
    id: '2',
    status: 'unpublished' as const,
    title: '2025世界油商大会',
    date: '2025-10-22',
    stats: { forms: 0, views: 0, visitors: 0 },
    pageImages: {} as Record<number, string>,
    coverPreviewUrl: '',
    formFields: null,
  },
  {
    id: '3',
    status: 'unpublished' as const,
    title: '2025国际航运峰会',
    date: '2025-11-15',
    stats: { forms: 0, views: 0, visitors: 0 },
    pageImages: {} as Record<number, string>,
    coverPreviewUrl: '',
    formFields: null,
  },
])

// 操作处理函数
const handleCreate = () => {
  currentEditId.value = null
  searchKeyword.value = ''
  selectedDate.value = ''
  showCreateForm.value = true
  // 重置表单
  setTimeout(() => {
    if (conferenceFormRef.value) {
      conferenceFormRef.value.resetForm()
    }
  }, 100)
}

const handleEdit = async (meeting: any) => {
  console.log('编辑会议:', meeting)

  currentEditId.value = meeting.id
  searchKeyword.value = meeting.title
  selectedDate.value = meeting.date
  showCreateForm.value = true

  await nextTick()

  // 等待组件渲染后加载数据
  const loadData = () => {
    if (conferenceFormRef.value) {
      conferenceFormRef.value.loadMeetingData(meeting)
    } else {
      setTimeout(loadData, 100)
    }
  }

  loadData()
}

const handleData = (meeting: any) => {
  ElMessage.info(`查看数据: ${meeting.title}`)
}

const handlePromote = (meeting: any) => {
  ElMessage.info(`推广: ${meeting.title}`)
}

const handleDelete = (meeting: any) => {
  ElMessageBox.confirm(`确定要删除会议"${meeting.title}"吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(() => {
    meetingList.value = meetingList.value.filter((m) => m.id !== meeting.id)
    ElMessage.success('删除成功')
  })
}

// 预览功能 - 获取 ConferenceForm 中的页面数据并生成新链接
// 替代 window.open 的方法，创建一个新的 iframe 来显示预览
const handlePreview = () => {
  const formComponent = conferenceFormRef.value

  if (!formComponent) {
    ElMessage.warning('无法获取表单数据')
    return
  }

  const pageImages = formComponent.pageImages

  const hasContent = Object.values(pageImages).some((img) => img && img !== '')
  if (!hasContent) {
    ElMessage.warning('暂无页面内容，请先添加页面图片')
    return
  }

  // 创建预览内容 HTML
  const previewHtml = generatePreviewHtml(pageImages)

  // 创建新窗口并写入内容
  const previewWindow = window.open('', '_blank')
  if (previewWindow) {
    previewWindow.document.write(previewHtml)
    previewWindow.document.close()
  } else {
    ElMessage.error('无法打开预览窗口，请检查浏览器弹窗设置')
  }
}

// 生成预览 HTML
const generatePreviewHtml = (pageImages: Record<number, string>) => {
  const pages = Object.keys(pageImages)
    .map(Number)
    .sort((a, b) => a - b)

  const pagesHtml = pages
    .map(
      (page) => `
    <div class="page-item">
      <div class="page-image">
        ${
          pageImages[page]
            ? `<img src="${pageImages[page]}" alt="第${page}页" />`
            : `<div class="empty-page">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"></rect>
                <circle cx="8.5" cy="8.5" r="1.5"></circle>
                <polyline points="21 15 16 10 5 21"></polyline>
              </svg>
              <p>暂无内容</p>
            </div>`
        }
      </div>
    </div>
  `,
    )
    .join('')

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover">
      <meta name="apple-mobile-web-app-capable" content="yes">
      <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
      <title>会议报名</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
          -webkit-tap-highlight-color: transparent;
        }
        
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif;
          background: #f5f7fa;
          min-height: 100vh;
          overflow-x: hidden;
        }
        
        /* 手机H5容器 */
        .preview-header {
          background: #ffffff;
          box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
          position: sticky;
          top: 0;
          z-index: 100;
          backdrop-filter: blur(10px);
          background: rgba(255, 255, 255, 0.98);
        }
        
        .header-content {
          max-width: 450px;
          margin: 0 auto;
          padding: 12px 16px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .header-content h1 {
          font-size: 18px;
          font-weight: 600;
          color: #303133;
          margin: 0;
          letter-spacing: -0.3px;
        }
        
        .close-btn {
          padding: 6px 16px;
          background: #409eff;
          color: white;
          border: none;
          border-radius: 20px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
          transition: all 0.3s;
          -webkit-tap-highlight-color: transparent;
        }
        
        .close-btn:active {
          transform: scale(0.96);
          background: #66b1ff;
        }
        
        .preview-content {
          max-width: 450px;
          margin: 0 auto;
          padding: 0 12px 20px 12px;
        }
        
        .pages-container {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        
        .page-item {
          background: #ffffff;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
          transition: transform 0.2s, box-shadow 0.2s;
        }
        
        .page-item:active {
          transform: scale(0.99);
        }
        
       
        
        .page-image {
          padding: 20px 16px;
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 400px;
          background: #ffffff;
        }
        
        .page-image img {
          max-width: 100%;
          height: auto;
          border-radius: 12px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          display: block;
        }
        
        .empty-page {
          text-align: center;
          color: #909399;
          padding: 60px 20px;
        }
        
        .empty-page svg {
          margin-bottom: 16px;
          color: #dcdfe6;
        }
        
        .empty-page p {
          font-size: 14px;
          margin: 0;
          color: #c0c4cc;
        }
        
        /* 滚动条样式优化 */
        ::-webkit-scrollbar {
          width: 4px;
          height: 4px;
        }
        
        ::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 2px;
        }
        
        ::-webkit-scrollbar-thumb {
          background: #c1c1c1;
          border-radius: 2px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: #a8a8a8;
        }
        
        /* 加载动画 */
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .page-item {
          animation: fadeIn 0.4s ease-out;
        }
        
        /* 手机触摸优化 */
        .close-btn,
        .page-item {
          cursor: pointer;
          -webkit-tap-highlight-color: transparent;
        }
        
        /* 响应式调整 */
        @media (max-width: 480px) {
          .header-content h1 {
            font-size: 16px;
          }
          
          .close-btn {
            padding: 5px 14px;
            font-size: 13px;
          }
          
          .page-image {
            padding: 16px 12px;
            min-height: 350px;
          }
          
          
        }
        
        /* 防止图片溢出 */
        .page-image img {
          max-width: 100%;
          height: auto;
          object-fit: contain;
        }
      </style>
    </head>
    <body>
      <div class="preview-header">
        <div class="header-content">
          <h1>📝 会议报名</h1>
          <button class="close-btn" onclick="window.close()">关闭</button>
        </div>
      </div>
      <div class="preview-content">
        <div class="pages-container">
          ${pagesHtml}
        </div>
      </div>
    </body>
    </html>
  `
}

// 保存功能 - 将 ConferenceForm 中的数据保存到会议列表
const handleSave = () => {
  const formComponent = conferenceFormRef.value

  if (!formComponent) {
    ElMessage.warning('无法获取表单数据')
    return
  }

  // 获取表单数据
  const pageImages = formComponent.pageImages
  const coverPreviewUrl = formComponent.coverPreviewUrl
  const formFields = formComponent.formFields

  // 检查是否有内容
  const hasContent = Object.values(pageImages).some((img) => img && img !== '')
  if (!hasContent) {
    ElMessage.warning('暂无页面内容，请先添加页面图片')
    return
  }

  // 验证会议名称
  if (!searchKeyword.value.trim()) {
    ElMessage.warning('请输入会议名称')
    return
  }

  // 验证会议日期
  if (!selectedDate.value) {
    ElMessage.warning('请选择会议日期')
    return
  }

  // 计算有内容的页面数量
  const validPagesCount = Object.values(pageImages).filter((img) => img && img !== '').length

  if (currentEditId.value) {
    // 编辑模式：更新现有会议
    const index = meetingList.value.findIndex((m) => m.id === currentEditId.value)
    if (index !== -1) {
      meetingList.value[index] = {
        ...meetingList.value[index],
        title: searchKeyword.value,
        date: selectedDate.value,
        pageImages: { ...pageImages },
        coverPreviewUrl: coverPreviewUrl,
        formFields: formFields ? { ...formFields } : null,
        stats: {
          ...meetingList.value[index].stats,
          forms: validPagesCount,
        },
      }
      ElMessage.success('会议更新成功')
    }
  } else {
    // 新增模式：创建新会议
    const newId = String(Date.now())
    const newMeeting = {
      id: newId,
      status: 'unpublished' as const,
      title: searchKeyword.value,
      date: selectedDate.value,
      stats: {
        forms: validPagesCount,
        views: 0,
        visitors: 0,
      },
      pageImages: { ...pageImages },
      coverPreviewUrl: coverPreviewUrl,
      formFields: formFields ? { ...formFields } : null,
    }
    meetingList.value.unshift(newMeeting)
    ElMessage.success('会议创建成功')
  }

  // 保存后返回列表
  showCreateForm.value = false
  // 清空搜索条件
  searchKeyword.value = ''
  selectedDate.value = ''
  currentEditId.value = null
}

const handleExit = () => {
  ElMessageBox.confirm('确定要退出编辑吗？未保存的内容将丢失', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(() => {
    showCreateForm.value = false
    currentEditId.value = null
  })
}
</script>

<style scoped>
.conference-signup-container {
  padding: 10px;
  background-color: white;
  height: 100%;
}
.view-tabs {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
  border-bottom: 1px solid #e4e7ed;
  padding-bottom: 10px;
}
.page-header {
  margin-bottom: 20px;
  background: #ffffff;
  border-radius: 8px;
  padding: 16px 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.header-left {
}

.page-header h1 {
  font-size: 24px;
  font-weight: 600;
  color: #303133;
  margin: 0;
  min-width: 200px;
}

.search-section {
  display: flex;
  gap: 16px;
  align-items: center;
}

.search-wrapper {
  display: flex;
  justify-content: flex-start;
  flex-direction: row;
}
.search-wrapper .label {
  margin-right: 10px;
  width: 100px;
  display: flex;
  align-items: center;
}
.date-picker-wrapper {
  display: flex;
  justify-content: flex-start;
  flex-direction: row;
}
.date-picker-wrapper .label {
  margin-right: 10px;
  display: flex;
  align-items: center;
}

.form-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 24px;
}

.content-card {
  background: #ffffff;
  border-radius: 12px;
  padding: 14px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
  min-height: calc(100vh - 200px);
}

/* 会议列表模式样式 */
.create-card {
  width: 220px;
  height: 300px;
  border: 2px dashed #dcdfe6;
  border-radius: 8px;
  margin-right: 26px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background-color: #fafafa;
  vertical-align: top;
}

.create-card:hover {
  border-color: #409eff;
  background-color: #ecf5ff;
}

.create-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  color: #909399;
}

.plus-icon {
  font-size: 24px;
}

.create-content span {
  font-size: 16px;
}

.meeting-list {
  display: inline-flex;
  gap: 16px;
  flex-wrap: wrap;
}
</style>
