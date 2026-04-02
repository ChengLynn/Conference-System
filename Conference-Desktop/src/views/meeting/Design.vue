<template>
  <div class="design-container">
    <!-- 视图切换 tabs -->
    <div class="view-tabs">
      <div class="tab-item" :class="{ active: currentView === 'list' }" @click="switchView('list')">
        会议列表
      </div>
      <div
        class="tab-item"
        :class="{ active: currentView === 'detail' }"
        @click="switchView('detail')"
      >
        设计进度
      </div>
    </div>

    <!-- 搜索和筛选区域 -->
    <div v-if="currentView === 'list'" class="content-card">
      <div class="search-section">
        <div class="search-row">
          <div class="search-item">
            <label>会议查询</label>
            <el-input
              v-model="searchKeyword"
              placeholder="请输入会议名称"
              clearable
              :style="{ width: '250px' }"
            />
          </div>
          <div class="search-item">
            <label>选择日期</label>
            <el-date-picker
              v-model="selectedDate"
              type="date"
              placeholder="请选择创建日期"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
            />
          </div>
        </div>
      </div>
      <!-- 表格区域 -->
      <div class="table-section">
        <el-table :data="tableData" style="width: 100%" border stripe>
          <el-table-column prop="name" label="会议名称" min-width="180" show-overflow-tooltip>
            <template #default="{ row }">
              <span class="conference-name">{{ row.name }}</span>
            </template>
          </el-table-column>

          <el-table-column prop="filePath" label="文件路径" min-width="180">
            <template #default="{ row }">
              <el-link
                v-if="row.filePath"
                :href="row.filePath"
                target="_blank"
                type="primary"
                :underline="false"
              >
                <el-icon><Link /></el-icon>
                <span class="link-text">{{ formatFileName(row.filePath) }}</span>
              </el-link>
              <span v-else class="placeholder">[ ]</span>
            </template>
          </el-table-column>

          <el-table-column label="内容对接" width="250">
            <template #default="{ row }">
              <div class="editors-container">
                <el-button link type="primary" size="medium" @click="handleEdit(row)">
                  <div class="editors-list">
                    <span v-for="editor in row.editors" :key="editor" class="editor-item">
                      {{ editor }}
                    </span>
                  </div>
                </el-button>
              </div>
            </template>
          </el-table-column>

          <el-table-column prop="designItems" label="设计事项" width="250">
            <template #default="{ row }">
              <div class="editors-container">
                <el-button link type="primary" size="medium" @click="handleEdit(row)">
                  <div class="editors-list">
                    <span class="editor-item">
                      {{ row.designItems }}
                    </span>
                  </div>
                </el-button>
              </div>
            </template>
          </el-table-column>

          <el-table-column label="操作" width="220" fixed="right">
            <template #default="{ row }">
              <el-tooltip content="编辑" placement="top">
                <el-button link type="primary" circle size="small" @click="handleEdit(row)">
                  <el-icon><Edit /></el-icon>
                </el-button>
              </el-tooltip>
              <el-tooltip content="删除" placement="top">
                <el-button link type="danger" circle size="small" @click="handleDelete(row)">
                  <el-icon><Delete /></el-icon>
                </el-button>
              </el-tooltip>
              <el-tooltip content="查看" placement="top">
                <el-button link type="primary" circle size="small" @click="handleView(row)">
                  <el-icon><View /></el-icon>
                </el-button>
              </el-tooltip>
              <el-tooltip content="打印" placement="top">
                <el-button link type="primary" circle size="small" @click="handlePrint(row)">
                  <el-icon><Printer /></el-icon>
                </el-button>
              </el-tooltip>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- 分页区域 -->
      <div class="table-footer">
        <!-- 添加表单按钮 -->
        <div class="add-form-button">
          <el-button type="primary" size="small" @click="handleAdd"> 添加表单 </el-button>
        </div>
        <div class="pagination-wrapper">
          <div class="pagination-info">共 {{ total }} 条 | 每页 {{ pageSize }} 条</div>
          <div class="pagination-controls">
            <el-pagination
              v-model:current-page="currentPage"
              v-model:page-size="pageSize"
              :total="total"
              :page-sizes="[10, 20, 50, 100]"
              layout="prev, pager, next, jumper"
              @current-change="handlePageChange"
              @size-change="handleSizeChange"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- 设计事项 -->
    <!-- 设计事项 -->
    <div v-if="currentView === 'detail'" class="content-card">
      <!-- 详情头部 -->
      <div class="detail-header">
        <h2 class="conference-title">{{ currentConferenceName }}</h2>
      </div>

      <!-- 物料分类导航 -->
      <div class="material-tabs">
        <div
          v-for="tab in materialTabs"
          :key="tab.value"
          class="tab-item"
          :class="{ active: currentMaterialTab === tab.value }"
          @click="switchMaterialTab(tab.value)"
        >
          {{ tab.label }}
        </div>
      </div>

      <!-- 表格区域 -->
      <div class="material-table">
        <el-table :data="filteredMaterialData" style="width: 100%" border stripe>
          <el-table-column
            prop="projectName"
            label="项目名称"
            min-width="150"
            show-overflow-tooltip
          />
          <el-table-column prop="specs" label="尺寸/规格" min-width="120" />
          <el-table-column prop="uploadTime" label="上传时间" width="200" />
          <el-table-column label="完成情况" width="300">
            <template #default="{ row }">
              <div class="progress-status">
                <el-radio-group v-model="row.status" size="small">
                  <el-radio-button label="未开始" value="未开始" />
                  <el-radio-button label="初稿" value="初稿" />
                  <el-radio-button label="审核中" value="审核中" />
                  <el-radio-button label="定稿" value="定稿" />
                </el-radio-group>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="220" fixed="right" align="center">
            <!-- <template #default="{ row }">
              <div class="action-buttons">
                <el-tooltip content="向左移动" placement="top">
                  <el-button link type="primary" size="small" @click="handleMoveLeft(row)">
                    <el-icon><ArrowLeft /></el-icon>
                  </el-button>
                </el-tooltip>
                <el-tooltip content="向右移动" placement="top">
                  <el-button link type="primary" size="small" @click="handleMoveRight(row)">
                    <el-icon><ArrowRight /></el-icon>
                  </el-button>
                </el-tooltip>
                <el-tooltip content="确认" placement="top">
                  <el-button link type="success" size="small" @click="handleConfirm(row)">
                    <el-icon><Check /></el-icon>
                  </el-button>
                </el-tooltip>
              </div>
            </template> -->
            <template #default="{ row }">
              <el-tooltip content="编辑" placement="top">
                <el-button link type="primary" circle size="small" @click="handleEditItem(row)">
                  <el-icon><Edit /></el-icon>
                </el-button>
              </el-tooltip>
              <el-tooltip content="查看">
                <el-button link type="primary" circle size="small" @click="handleViewItem(row)">
                  <el-icon><View /></el-icon>
                </el-button>
              </el-tooltip>
              <el-tooltip content="删除" placement="top">
                <el-button link type="danger" circle size="small" @click="handleDeleteItem(row)">
                  <el-icon><Delete /></el-icon>
                </el-button>
              </el-tooltip>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- 添加按钮 -->
      <div class="add-material-btn">
        <el-button type="primary" size="small" @click="handleAddMaterial"> 添加物料 </el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Edit, Delete, Plus, View, Printer, Link, Clock } from '@element-plus/icons-vue'

import type { ConferenceItem } from '@/types/conference'
// 视图切换
const currentView = ref<'list' | 'detail'>('list')
// 搜索关键词
const searchKeyword = ref('')
// 选中的日期
const selectedDate = ref('')
// 当前页码
const currentPage = ref(1)
// 每页条数
const pageSize = ref(10)
// 总条数
const total = ref(800)
// 跳转页码
const gotoPage = ref(1)
// 分页大小变化
const handleSizeChange = (val: number) => {
  pageSize.value = val
  ElMessage.info(`每页显示 ${val} 条`)
}
// 计算总页数
const totalPages = computed(() => Math.ceil(total.value / pageSize.value))

// 表格数据
const tableData = ref<ConferenceItem[]>([
  {
    id: 1,
    name: '2025第六届上海国际船舶管理论坛',
    filePath: 'https://js.design/ti?c=2Ex2xMAR7WGNZP',
    editors: ['Iris'],
    designItems: 'karl',
    scale: 100,
    totalForms: 10,
    todaySubmit: 2,
    increase: 1,
  },
  {
    id: 2,
    name: '普陀区航运服务集聚区-暨港航物流',
    filePath: '',
    editors: ['Iris'],
    designItems: 'karl',
    scale: 80,
    totalForms: 8,
    todaySubmit: 1,
    increase: 0,
  },
  {
    id: 3,
    name: '2025世界海商大会',
    filePath: '',
    editors: ['Iris'],
    designItems: 'karl',
    scale: 90,
    totalForms: 12,
    todaySubmit: 3,
    increase: 2,
  },
  {
    id: 4,
    name: '2025散杂货船船舶投资和经营论坛',
    filePath: '',
    editors: ['Iris'],
    designItems: 'karl',
    scale: 70,
    totalForms: 7,
    todaySubmit: 0,
    increase: -1,
  },
])
// 视图切换
const switchView = (view: 'list' | 'detail') => {
  currentView.value = view
}

// 格式化文件名（从URL中提取最后一部分）
const formatFileName = (url: string) => {
  if (!url) return ''
  try {
    const urlObj = new URL(url)
    const pathSegments = urlObj.pathname.split('/')
    return pathSegments[pathSegments.length - 1] || url
  } catch {
    return url
  }
}

// 处理编辑
const handleEdit = (row: ConferenceItem) => {
  console.log('编辑会议:', row)
  // TODO: 实现编辑逻辑
}

// 处理删除
const handleDelete = (row: ConferenceItem) => {
  console.log('删除会议:', row)
  // TODO: 实现删除逻辑
}
// 查看
const handleView = (row: any) => {
  ElMessage.info(`查看会议详情: ${row.name}`)
  switchView('detail')
}

// 打印
const handlePrint = (row: any) => {
  ElMessage.info(`打印议程: ${row.name}`)
}
// 处理添加
const handleAdd = () => {
  console.log('添加表单')
  // TODO: 实现添加逻辑
}

// 处理页码变化
const handlePageChange = (page: number) => {
  currentPage.value = page
  gotoPage.value = page
  // TODO: 加载对应页的数据
  console.log('切换到第', page, '页')
}

// 当前会议名称
const currentConferenceName = ref('2025第六届上海国际船舶管理论坛')

// 物料分类选项卡
const materialTabs = [
  { label: '搭建物料', value: 'build' },
  { label: '定制物料', value: 'custom' },
  { label: '电子屏幕', value: 'screen' },
  { label: '摄影宣传', value: 'photo' },
]

// 当前选中的物料分类
const currentMaterialTab = ref('build')

// 物料数据
const materialData = ref({
  build: [
    {
      id: 1,
      projectName: '签到墙',
      specs: '5*2.5m',
      uploadTime: '2025-12-04 16:30',
      status: '未开始',
    },
    {
      id: 2,
      projectName: '背景墙',
      specs: '5*2.5m',
      uploadTime: '2025-12-04 16:30',
      status: '审核中',
    },
    {
      id: 3,
      projectName: '指引牌',
      specs: '0.8*1.2m',
      uploadTime: '2025-12-05 09:15',
      status: '初稿',
    },
    {
      id: 4,
      projectName: '舞台搭建',
      specs: '10*5m',
      uploadTime: '2025-12-03 14:20',
      status: '定稿',
    },
  ],
  custom: [
    {
      id: 101,
      projectName: '会议手册',
      specs: 'A4 20P',
      uploadTime: '2025-12-04 10:30',
      status: '审核中',
    },
    {
      id: 102,
      projectName: '胸牌',
      specs: '7*10cm',
      uploadTime: '2025-12-05 11:20',
      status: '初稿',
    },
    {
      id: 103,
      projectName: '手提袋',
      specs: '35*40*10cm',
      uploadTime: '2025-12-02 16:45',
      status: '定稿',
    },
  ],
  screen: [
    {
      id: 201,
      projectName: '主屏幕背景',
      specs: '1920*1080',
      uploadTime: '2025-12-05 13:30',
      status: '未开始',
    },
    {
      id: 202,
      projectName: '议程显示',
      specs: '1080*1920',
      uploadTime: '2025-12-04 09:10',
      status: '审核中',
    },
  ],
  photo: [
    {
      id: 301,
      projectName: '摄影师安排',
      specs: '2名',
      uploadTime: '2025-12-03 15:20',
      status: '定稿',
    },
    {
      id: 302,
      projectName: '宣传海报',
      specs: 'A1',
      uploadTime: '2025-12-05 10:00',
      status: '初稿',
    },
    {
      id: 303,
      projectName: '邀请函设计',
      specs: 'A5',
      uploadTime: '2025-12-04 14:30',
      status: '审核中',
    },
  ],
})

// 根据当前选中的分类过滤数据
const filteredMaterialData = computed(() => {
  return materialData.value[currentMaterialTab.value] || []
})

// 切换物料分类
const switchMaterialTab = (tab: string) => {
  currentMaterialTab.value = tab
}

// 编辑操作
const handleEditItem = (row: any) => {}

// 查看
const handleViewItem = (row: any) => {}

// 删除物料操作
const handleDeleteItem = (row: any) => {}

// 添加物料
const handleAddMaterial = () => {
  ElMessage.info('添加新物料')
  // TODO: 弹出添加表单
}
</script>

<style scoped>
.design-container {
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

.tab-item {
  font-size: 16px;
  font-weight: 500;
  color: #606266;
  cursor: pointer;
  padding: 8px 0;
  position: relative;
  transition: color 0.3s;
}
.tab-item:hover {
  color: #409eff;
}

.tab-item.active {
  color: #409eff;
}

.tab-item.active::after {
  content: '';
  position: absolute;
  bottom: -11px;
  left: 0;
  right: 0;
  height: 2px;
  background: #409eff;
}

/* 筛选区域 */
.content-card {
  background: white;
  border-radius: 8px;
  padding: 14px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}
/* 搜索区域样式 */
.search-section {
  margin-bottom: 30px;
  background: white;
  border-radius: 8px;
}

.search-row {
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  align-items: flex-end;
  gap: 20px;
}

.search-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.search-item label {
  font-size: 14px;
  color: #606266;
  font-weight: 500;
}

/* 表格区域 */
.table-section {
  margin-top: 20px;
  display: flex;
  flex-direction: column;
}
.el-table {
  margin-bottom: 16px;
}
.conference-name {
  font-size: 14px;
  color: #303133;
}

.placeholder {
  color: #909399;
  font-family: monospace;
}

.link-text {
  margin-left: 4px;
  font-size: 14px;
}
/* 编辑者名字样式 */
.editors-container {
  display: flex;
  align-items: center;
}

.editors-list {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.editor-item {
  padding: 2px 8px;
  border-radius: 4px;
  border: 1px solid rgba(54, 134, 255, 1);
  font-size: 12px;
  color: rgba(54, 134, 255, 1);
  background-color: rgba(54, 134, 255, 0.1);
  white-space: nowrap;
}

/* 添加表单按钮 */
.add-form-button {
  flex-shrink: 0;
}

/* 分页区域 */
.table-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 16px;
  padding: 8px 0;
}
.pagination-wrapper {
  display: flex;
  align-items: center;
  gap: 16px;
}
.pagination-info {
  font-size: 14px;
  color: #606266;
  white-space: nowrap;
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: 20px;
}

.pagination-text {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #606266;
}

.goto-input {
  width: 80px;
}

:deep(.el-table .cell) {
  line-height: 1.5;
}

:deep(.el-checkbox) {
  height: auto;
}

:deep(.el-link) {
  font-size: 14px;
  display: inline-flex;
  align-items: center;
}

/* 详情头部 */
.detail-header {
  margin-bottom: 24px;
}

.breadcrumb {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  font-size: 14px;
}

.breadcrumb-item {
  color: #909399;
  cursor: pointer;
  transition: color 0.3s;
}

.breadcrumb-item:hover {
  color: #409eff;
}

.breadcrumb-item.active {
  color: #303133;
  font-weight: 500;
  cursor: default;
}

.breadcrumb-separator {
  color: #c0c4cc;
}

.conference-title {
  font-size: 18px;
  font-weight: 500;
  letter-spacing: 0px;
  line-height: 14px;
  color: rgba(54, 134, 255, 1);
  text-align: left;
  vertical-align: top;
}

/* 物料分类导航 */
.material-tabs {
  display: flex;
  gap: 32px;
  margin-bottom: 24px;
  border-bottom: 1px solid #e4e7ed;
  padding-bottom: 12px;
}

.material-tabs .tab-item {
  font-size: 15px;
  font-weight: 500;
  color: #606266;
  cursor: pointer;
  padding: 4px 0;
  position: relative;
  transition: all 0.3s;
}

.material-tabs .tab-item:hover {
  color: #409eff;
}

.material-tabs .tab-item.active {
  color: #409eff;
}

.material-tabs .tab-item.active::after {
  content: '';
  position: absolute;
  bottom: -13px;
  left: 0;
  right: 0;
  height: 2px;
  background: #409eff;
  border-radius: 2px;
}

/* 物料表格 */
.material-table {
  margin-bottom: 24px;
}

.progress-status {
  display: flex;
  justify-content: flex-start;
}

:deep(.el-radio-group) {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

:deep(.el-radio-button__inner) {
  padding: 8px 12px;
  font-size: 12px;
  border-color: #dcdfe6;
}

:deep(.el-radio-button__original-radio:checked + .el-radio-button__inner) {
  background-color: #409eff;
  border-color: #409eff;
  color: white;
}

/* 操作按钮 */
.action-buttons {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 4px;
}

.action-buttons .el-button {
  font-size: 16px;
  padding: 4px;
}

/* 添加物料按钮 */
.add-material-btn {
  flex-shrink: 0;
  /* display: flex;
  justify-content: flex-start; */
}

.add-material-btn .el-button {
  padding: 8px 24px;
}
</style>
