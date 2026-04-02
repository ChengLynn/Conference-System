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
        报名情况
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
          <el-table-column prop="name" label="会议名称" min-width="220" show-overflow-tooltip>
            <template #default="{ row }">
              <span class="conference-name">{{ row.name }}</span>
            </template>
          </el-table-column>

          <el-table-column prop="scale" label="会议规模" width="200" align="center">
            <template #default="{ row }">
              <span>{{ row.scale }}</span>
            </template>
          </el-table-column>

          <el-table-column prop="totalForms" label="表单总数" width="200" align="center">
            <template #default="{ row }">
              <span>{{ row.totalForms }}</span>
            </template>
          </el-table-column>

          <el-table-column prop="todaySubmit" label="今日提交" width="200" align="center">
            <template #default="{ row }">
              <span>{{ row.todaySubmit }}</span>
            </template>
          </el-table-column>

          <el-table-column prop="increase" label="增加数量" width="200" align="center">
            <template #default="{ row }">
              <span>{{ row.increase }}</span>
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

    <!-- 报名事项 -->
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
                <div class="stat-icon-label">会议规模</div>
                <div class="stat-icon-value">200人</div>
              </div>
            </div>
          </div>
          <div class="stat-icons">
            <div class="stat-icon-item">
              <div class="stat-icon stat-icon-green">
                <el-icon><Document /></el-icon>
              </div>
              <div class="stat-icon-content">
                <div class="stat-icon-label">表单总数</div>
                <div class="stat-icon-value">200份</div>
              </div>
            </div>
          </div>
          <div class="stat-icons">
            <div class="stat-icon-item">
              <div class="stat-icon stat-icon-orange">
                <el-icon><Clock /></el-icon>
              </div>
              <div class="stat-icon-content">
                <div class="stat-icon-label">今日提交</div>
                <div class="stat-icon-value">50份</div>
              </div>
            </div>
          </div>
          <div class="stat-icons">
            <div class="stat-icon-item">
              <div class="stat-icon stat-icon-purple">
                <el-icon><TrendCharts /></el-icon>
              </div>
              <div class="stat-icon-content">
                <div class="stat-icon-label">较昨日新增</div>
                <div class="stat-icon-value">25份</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="content-card-signup" style="margin-top: 20px">
        <!-- 日期筛选 - 调整为单范围选择器 -->
        <div class="date-filter">
          <div style="margin-left: 20px">
            <el-date-picker
              v-model="dateRange"
              type="datetimerange"
              size="large"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
              class="date-picker"
            />
          </div>

          <div class="" style="margin-right: 20px">
            <span style="margin-right: 20px">刷新</span>
            <span style="margin-right: 20px">导出</span>
            <span>删除</span>
          </div>
        </div>

        <!-- 表格区域 -->
        <div class="table-section">
          <el-table :data="registrationData" style="width: 100%" stripe tooltip-effect="dark">
            <el-table-column type="selection" width="55"> </el-table-column>
            <el-table-column prop="name" label="姓名" min-width="100" show-overflow-tooltip />
            <el-table-column prop="company" label="单位" min-width="220" show-overflow-tooltip />
            <el-table-column prop="position" label="职务" min-width="120" show-overflow-tooltip />
            <el-table-column prop="phone" label="联系电话" width="150" />
            <el-table-column prop="email" label="邮箱" min-width="220" show-overflow-tooltip />
            <el-table-column
              prop="mealType"
              label="就餐类型"
              min-width="180"
              show-overflow-tooltip
            />
            <el-table-column prop="submitTime" label="提交时间" width="180" />
          </el-table>
        </div>

        <!-- 分页区域 - 完全按照图片样式 -->
        <div class="pagination-container">
          <div class="pagination-info">共 800 条 每页 10 条</div>
          <div class="pagination-controls">
            <span class="pagination-arrow">&lt;</span>
            <span class="pagination-number">1</span>
            <span class="pagination-number">2</span>
            <span class="pagination-number">3</span>
            <span class="pagination-number">4</span>
            <span class="pagination-number">5</span>
            <span class="pagination-ellipsis">...</span>
            <span class="pagination-number">23</span>
            <span class="pagination-arrow">&gt;</span>
            <span class="pagination-goto">前往</span>
            <el-input-number
              v-model="gotoPage"
              :min="1"
              :max="100"
              size="small"
              controls-position="right"
              class="goto-input"
            />
            <span class="pagination-goto">页</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Edit,
  Delete,
  Plus,
  View,
  User,
  Document,
  Clock,
  TrendCharts,
} from '@element-plus/icons-vue'

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
    scale: 200,
    totalForms: 50,
    todaySubmit: 25,
    increase: 25,
    filePath: 'https://js.design/ti?c=2Ex2xMAR7WGNZP',
    editors: ['Iris'],
    designItems: 'karl',
  },
  {
    id: 2,
    name: '普陀区航运服务集聚区-暨港航物流..',
    scale: 150,
    totalForms: 35,
    todaySubmit: 12,
    increase: 8,
    filePath: '',
    editors: ['Iris'],
    designItems: 'karl',
  },
  {
    id: 3,
    name: '2025世界油商大会',
    scale: 300,
    totalForms: 80,
    todaySubmit: 30,
    increase: 15,
    filePath: '',
    editors: ['Iris'],
    designItems: 'karl',
  },
  {
    id: 4,
    name: '2025散杂货船舶投资和经营论坛',
    scale: 180,
    totalForms: 42,
    todaySubmit: 18,
    increase: 10,
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

// 报名详情相关数据
const dateRange = ref<string[]>([])

// 报名表格数据
const registrationData = ref([
  {
    id: 1,
    name: '刘先生',
    company: '上海莫瑞斯柯信息技术有限公司',
    position: '主编',
    phone: '15900000000',
    email: 'marinecircle@mail.com',
    mealType: '自助午餐、晚餐',
    submitTime: '2025/12/01 16:19:15',
  },
  {
    id: 2,
    name: '张女士',
    company: '上海国际航运研究中心',
    position: '研究员',
    phone: '13800000001',
    email: 'zhang@shipping.com',
    mealType: '自助午餐',
    submitTime: '2025/12/01 14:30:22',
  },
  {
    id: 3,
    name: '王先生',
    company: '中国船舶工业行业协会',
    position: '秘书长',
    phone: '13900000002',
    email: 'wang@cansi.org.cn',
    mealType: '自助晚餐',
    submitTime: '2025/12/01 11:45:08',
  },
  {
    id: 4,
    name: '李女士',
    company: '海事大学',
    position: '教授',
    phone: '13700000003',
    email: 'li@maritime.edu',
    mealType: '自助午餐、晚餐',
    submitTime: '2025/12/01 09:20:33',
  },
])
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
  /* margin-bottom: 20px;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  overflow: hidden; */
}
.el-table {
  margin-bottom: 16px;
}
.conference-name {
  font-size: 14px;
  color: #303133;
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

.goto-input {
  width: 80px;
}

:deep(.el-table .cell) {
  line-height: 1.5;
}

:deep(.el-checkbox) {
  height: auto;
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
  padding: 0;
  flex-wrap: wrap;
  left: 231px;
  top: 182px;
  height: 57px;
  opacity: 1;
  background: rgba(75, 156, 227, 0.7);
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
</style>
