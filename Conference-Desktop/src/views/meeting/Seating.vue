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
        座位安排
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
        <el-table :data="tableData" style="width: 100%" stripe>
          <el-table-column prop="name" label="会议名称" min-width="220" show-overflow-tooltip>
            <template #default="{ row }">
              <span class="conference-name">{{ row.name }}</span>
            </template>
          </el-table-column>

          <el-table-column prop="host" label="主持人" width="250" align="center">
            <template #default="{ row }">
              <span>{{ row.host }}</span>
            </template>
          </el-table-column>

          <el-table-column prop="speakers" label="演讲嘉宾" width="150" align="center">
            <template #default="{ row }">
              <span>{{ row.speakers }}</span>
            </template>
          </el-table-column>

          <el-table-column prop="roundtableGuests" label="圆桌嘉宾" width="120" align="center">
            <template #default="{ row }">
              <span>{{ row.roundtableGuests }}</span>
            </template>
          </el-table-column>

          <el-table-column prop="importantGuests" label="重要嘉宾" width="150" align="center">
            <template #default="{ row }">
              <span>{{ row.importantGuests }}</span>
            </template>
          </el-table-column>

          <el-table-column prop="otherGuests" label="其他嘉宾" width="150" align="center">
            <template #default="{ row }">
              <span>{{ row.otherGuests }}</span>
            </template>
          </el-table-column>

          <el-table-column prop="totalAttendees" label="总人数" width="120" align="center">
            <template #default="{ row }">
              <span>{{ row.totalAttendees }}</span>
            </template>
          </el-table-column>

          <el-table-column label="操作" width="250" fixed="right" align="center">
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

    <!-- 座位事项 -->
    <div v-if="currentView === 'detail'">
      <!-- 会议信息和统计卡片在同一行 -->
      <div class="content-card">
        <div class="header-row">
          <h2 class="conference-title">{{ currentConferenceName }}</h2>
          <div class="stat-icons">
            <div class="stat-icon-item">
              <div class="stat-icon stat-icon-blue">
                <el-icon><User /></el-icon>
              </div>
              <div class="stat-icon-content">
                <div class="stat-icon-label">主持人</div>
                <div class="stat-icon-value">2人</div>
              </div>
            </div>
          </div>
          <div class="stat-icons">
            <div class="stat-icon-item">
              <div class="stat-icon stat-icon-green">
                <el-icon><User /></el-icon>
              </div>
              <div class="stat-icon-content">
                <div class="stat-icon-label">演讲嘉宾</div>
                <div class="stat-icon-value">10人</div>
              </div>
            </div>
          </div>
          <div class="stat-icons">
            <div class="stat-icon-item">
              <div class="stat-icon stat-icon-orange">
                <el-icon><User /></el-icon>
              </div>
              <div class="stat-icon-content">
                <div class="stat-icon-label">圆桌嘉宾</div>
                <div class="stat-icon-value">10人</div>
              </div>
            </div>
          </div>
          <div class="stat-icons">
            <div class="stat-icon-item">
              <div class="stat-icon stat-icon-orange">
                <el-icon><User /></el-icon>
              </div>
              <div class="stat-icon-content">
                <div class="stat-icon-label">重要嘉宾</div>
                <div class="stat-icon-value">20人</div>
              </div>
            </div>
          </div>
          <div class="stat-icons">
            <div class="stat-icon-item">
              <div class="stat-icon stat-icon-orange">
                <el-icon><User /></el-icon>
              </div>
              <div class="stat-icon-content">
                <div class="stat-icon-label">其他嘉宾</div>
                <div class="stat-icon-value">150人</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 座位安排视图 (主要修改点：填充 content-card-signup) -->
      <div v-if="currentView === 'detail'">
        <!-- 座位安排卡片 - 填充图片中的座位内容 -->
        <div class="content-card-signup" style="margin-top: 20px">
          <!-- 操作按钮行: 新建席位 重置席位 设置布局 导出文档 -->

          <div class="seating-chart">
            <div class="seat-action-bar">
              <div>
                <el-button type="primary" size="small" plain>新建席位</el-button>
                <el-button size="small" plain>重置席位</el-button>
              </div>
              <div>
                <el-button size="small" plain>设置布局</el-button>
                <el-button size="small" plain>导出文档</el-button>
              </div>
            </div>
            <!-- 舞台 -->
            <div class="stage">舞台</div>

            <!-- 座位表 -->
            <div class="seating-grid">
              <!-- 列标题：第1列 ~ 第10列 -->
              <div class="grid-header">
                <div class="corner-placeholder"></div>
                <div class="col-label" v-for="col in 10" :key="'col' + col">第{{ col }}列</div>
              </div>

              <!-- 第1排 -->
              <div class="grid-row">
                <div class="row-label">第1排</div>
                <!-- 第1排第1列 - 嘉宾甲 -->
                <div class="seat occupied">
                  <span class="seat-name">嘉宾甲</span>
                </div>
                <!-- 第1排第2-10列 - 空座位 -->
                <div class="seat empty" v-for="col in 9" :key="'row1-col' + (col + 1)"></div>
              </div>

              <!-- 第2排 -->
              <div class="grid-row">
                <div class="row-label">第2排</div>
                <div class="seat empty" v-for="col in 10" :key="'row2-col' + col"></div>
              </div>

              <!-- 第3排 -->
              <div class="grid-row">
                <div class="row-label">第3排</div>
                <div class="seat empty" v-for="col in 10" :key="'row3-col' + col"></div>
              </div>

              <!-- 第4排 -->
              <div class="grid-row">
                <div class="row-label">第4排</div>
                <div class="seat empty" v-for="col in 10" :key="'row4-col' + col"></div>
              </div>

              <!-- 第5排 -->
              <div class="grid-row">
                <div class="row-label">第5排</div>
                <div class="seat empty" v-for="col in 10" :key="'row5-col' + col"></div>
              </div>
            </div>

            <!-- 图例说明 -->
            <div class="legend">
              <div class="legend-item">
                <div class="seat-sample occupied"></div>
                <span>已占座</span>
              </div>
              <div class="legend-item">
                <div class="seat-sample empty"></div>
                <span>空座位</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Edit, Delete, View, User } from '@element-plus/icons-vue'

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
    host: '张明',
    speakers: '5人',
    roundtableGuests: '8人',
    importantGuests: '12人',
    otherGuests: '175人',
    totalAttendees: 200,
    filePath: 'https://js.design/ti?c=2Ex2xMAR7WGNZP',
    editors: ['Iris'],
    designItems: 'karl',
  },
  {
    id: 2,
    name: '普陀区航运服务集聚区-暨港航物流..',
    host: '李华',
    speakers: '3人',
    roundtableGuests: '6人',
    importantGuests: '10人',
    otherGuests: '131人',
    totalAttendees: 150,
    filePath: '',
    editors: ['Iris'],
    designItems: 'karl',
  },
  {
    id: 3,
    name: '2025世界油商大会',
    host: '王强',
    speakers: '8人',
    roundtableGuests: '10人',
    importantGuests: '15人',
    otherGuests: '267人',
    totalAttendees: 300,
    filePath: '',
    editors: ['Iris'],
    designItems: 'karl',
  },
  {
    id: 4,
    name: '2025散杂货船舶投资和经营论坛',
    host: '赵敏',
    speakers: '4人',
    roundtableGuests: '7人',
    importantGuests: '9人',
    otherGuests: '160人',
    totalAttendees: 180,
    filePath: '',
    editors: ['Iris'],
    designItems: 'karl',
  },
])
// 视图切换
const switchView = (view: 'list' | 'detail') => {
  currentView.value = view
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
.content-card-signup {
  background: white;
  border-radius: 8px;
  /* padding: 14px; */
  padding-bottom: 14px;
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
  padding-left: 14px;
  padding-right: 14px;
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

.conference-title {
  font-size: 18px;
  font-weight: 500;
  letter-spacing: 0px;
  line-height: 14px;
  color: rgba(56, 56, 56, 1);
  text-align: left;
  vertical-align: top;
}

/* 头部行 - 会议标题和统计图标在同一行 */
.header-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-right: 100px;
  flex-wrap: wrap;
  gap: 16px;
}

/* 统计图标组 */
.stat-icons {
  display: flex;
  align-items: center;
  gap: 32px;
  flex-wrap: wrap;
}

.stat-icon-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.stat-icon {
  width: 32px;
  height: 32px;
  background-color: #f0f7ff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #3686ff;
  font-size: 16px;
}

.stat-icon-content {
  display: flex;
  flex-direction: column;
}

.stat-icon-label {
  font-size: 14px;
  font-weight: 500;
  letter-spacing: 0px;
  line-height: 16.41px;
  color: rgba(51, 51, 51, 1);
  text-align: left;
  vertical-align: top;
}

.stat-icon-value {
  font-size: 12px;
  font-weight: 400;
  letter-spacing: 0px;
  line-height: 14.06px;
  color: rgba(24, 109, 245, 1);
  text-align: left;
  vertical-align: top;
}
/* 统计图标颜色 */
.stat-icon-blue {
  background-color: #e6f7ff;
  color: #13c2c2;
}

.stat-icon-green {
  background-color: #f6ffed;
  color: #52c41a;
}

.stat-icon-orange {
  background-color: #fff7e6;
  color: #fa8c16;
}

.stat-icon-purple {
  background-color: #f9f0ff;
  color: #722ed1;
}

/* 日期筛选 */
.date-filter {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  /* margin-bottom: 24px; */
  padding: 0;
  flex-wrap: wrap;
  left: 231px;
  top: 182px;
  height: 57px;
  opacity: 1;
  background: rgba(75, 156, 227, 0.7);
}

.date-label {
  font-size: 14px;
  color: #606266;
  white-space: nowrap;
}

.date-separator {
  font-size: 14px;
  color: #909399;
  margin: 0 4px;
}

.date-picker {
  width: 240px;
}

.date-picker :deep(.el-input__wrapper) {
  border-radius: 4px;
}

/* 表格区域 */
.table-section {
  margin-bottom: 24px;
}

/* 分页容器 - 完全按照图片样式 */
.pagination-container {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 24px;
  margin-top: 20px;
  padding: 0;
}

.pagination-info {
  font-size: 14px;
  color: #606266;
  white-space: nowrap;
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.pagination-arrow {
  font-size: 14px;
  color: #606266;
  cursor: pointer;
  padding: 0 4px;
}

.pagination-arrow:hover {
  color: #409eff;
}

.pagination-number {
  font-size: 14px;
  color: #606266;
  cursor: pointer;
  padding: 0 4px;
  min-width: 24px;
  text-align: center;
}

.pagination-number:hover {
  color: #409eff;
}

.pagination-number.active {
  color: #409eff;
  font-weight: 500;
}

.pagination-ellipsis {
  font-size: 14px;
  color: #909399;
  padding: 0 4px;
}

.pagination-goto {
  font-size: 14px;
  color: #606266;
  margin-left: 8px;
}

.goto-input {
  width: 70px;
  margin-left: 4px;
}

.goto-input :deep(.el-input__wrapper) {
  border-radius: 4px;
}

.goto-input :deep(.el-input__inner) {
  text-align: center;
}

/* ----- 新增座位安排样式 (与图片一致) ----- */
.seat-action-bar {
  display: flex;
  justify-content: space-between;
}
.seating-chart {
  padding: 24px;
  background-color: #fff;
  border-radius: 12px;
  max-width: 1200px;
  margin: 0 auto;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
}

/* 舞台样式 */
.stage {
  width: 280px;
  height: 70px;
  background: linear-gradient(180deg, #4a90e2 0%, #2b6bcb 100%);
  border-radius: 35px 35px 8px 8px;
  margin: 0 auto 48px auto;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 22px;
  font-weight: 600;
  letter-spacing: 8px;
  box-shadow: 0 6px 12px rgba(43, 107, 203, 0.3);
  position: relative;
}

.stage::after {
  content: '';
  position: absolute;
  bottom: -8px;
  left: 10%;
  width: 80%;
  height: 4px;
  background: rgba(0, 0, 0, 0.1);
  border-radius: 2px;
}

/* 座位网格 */
.seating-grid {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 32px;
}

/* 表头行 */
.grid-header {
  display: flex;
  margin-bottom: 8px;
  padding-left: 80px; /* 与row-label宽度对齐 */
}

.corner-placeholder {
  width: 0px;
  flex-shrink: 0;
}

.col-label {
  flex: 1;
  text-align: center;
  font-size: 15px;
  font-weight: 600;
  color: #2c3e50;
  background: #f8fafd;
  padding: 10px 0;
  border-radius: 8px 8px 0 0;
  margin: 0 2px;
}

/* 每一行 */
.grid-row {
  display: flex;
  align-items: center;
  gap: 4px;
}

/* 行号标签 */
.row-label {
  width: 80px;
  flex-shrink: 0;
  font-size: 15px;
  font-weight: 600;
  color: #2c3e50;
  background: #f8fafd;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  margin-right: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.02);
}

/* 座位通用样式 */
.seat {
  flex: 1;
  height: 60px;
  min-width: 70px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  cursor: default;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

/* 已占座样式 */
.seat.occupied {
  background: linear-gradient(145deg, #e8f0fe, #d1e0fd);
  border: 2px solid #2b6bcb;
  color: #2b6bcb;
}

.seat-name {
  font-size: 14px;
  font-weight: 600;
  color: #2b6bcb;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  padding: 0 6px;
}

/* 空座位样式 */
.seat.empty {
  background: #f5f7fa;
  border: 2px dashed #d0d7e2;
  opacity: 0.8;
}

.seat.empty:hover {
  background: #edf2f7;
  border-color: #a0b8d4;
  opacity: 1;
}

/* 图例 */
.legend {
  display: flex;
  gap: 24px;
  justify-content: flex-end;
  margin-top: 24px;
  padding-top: 20px;
  border-top: 2px solid #edf2f7;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #4a5568;
}

.seat-sample {
  width: 30px;
  height: 30px;
  border-radius: 8px;
}

.seat-sample.occupied {
  background: linear-gradient(145deg, #e8f0fe, #d1e0fd);
  border: 2px solid #2b6bcb;
}

.seat-sample.empty {
  background: #f5f7fa;
  border: 2px dashed #d0d7e2;
}

/* 响应式调整 */
@media (max-width: 900px) {
  .seating-chart {
    padding: 16px;
  }

  .stage {
    width: 220px;
    height: 60px;
    font-size: 18px;
    letter-spacing: 4px;
  }

  .row-label {
    width: 60px;
    height: 50px;
    font-size: 13px;
  }

  .grid-header {
    padding-left: 60px;
  }

  .seat {
    min-width: 50px;
    height: 50px;
  }

  .seat-name {
    font-size: 12px;
  }
}

@media (max-width: 600px) {
  .grid-row {
    flex-wrap: wrap;
  }

  .row-label {
    width: 100%;
    margin-bottom: 4px;
  }

  .grid-header {
    display: none;
  }
}
</style>
