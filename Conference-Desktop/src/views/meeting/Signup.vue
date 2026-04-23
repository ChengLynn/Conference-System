<template>
  <!-- 通用导航组件 -->
  <ConferenceNavigation
    :currentPage="'议程安排'"
    :meetings="meetings"
    @meeting-change="handleMeetingChange"
  />
  <div class="design-container">
    <!-- 参会人员概况卡片 -->
    <div class="overview-card">
      <div class="overview-header">
        <span class="overview-title">参会人员概况</span>
        <el-button type="primary" plain size="small" @click="handleExportExcel">
          <el-icon><Download /></el-icon> 导出Excel
        </el-button>
      </div>
      <div class="stats-grid">
        <div class="stat-item">
          <div class="stat-icon">
            <el-icon><User /></el-icon>
          </div>
          <div>
            <div class="stat-value">{{ stats.total }}</div>
            <div class="stat-label">报名总数</div>
          </div>
        </div>
        <div class="stat-item">
          <div class="stat-icon" style="color: rgba(255, 141, 26, 1)">
            <el-icon><Plus /></el-icon>
          </div>
          <div>
            <div class="stat-value" style="color: rgba(255, 141, 26, 1)">{{ stats.todayNew }}</div>
            <div class="stat-label">今日新增</div>
          </div>
        </div>
        <div class="stat-item">
          <div class="stat-icon" style="color: rgba(67, 207, 124, 1)">
            <el-icon><CircleCheck /></el-icon>
          </div>
          <div>
            <div class="stat-value" style="color: rgba(67, 207, 124, 1)">{{ stats.signedIn }}</div>
            <div class="stat-label">已签到</div>
          </div>
        </div>
        <div class="stat-item">
          <div class="stat-icon" style="color: rgba(212, 48, 48, 1)">
            <el-icon><Clock /></el-icon>
          </div>
          <div>
            <div class="stat-value" style="color: rgba(212, 48, 48, 1)">{{ stats.notSigned }}</div>
            <div class="stat-label">未签到</div>
          </div>
        </div>
        <div class="stat-item">
          <div class="stat-icon" style="color: rgba(230, 162, 60, 1)">
            <el-icon><Star /></el-icon>
          </div>
          <div>
            <div class="stat-value" style="color: rgba(230, 162, 60, 1)">
              {{ stats.specialGuests }}
            </div>
            <div class="stat-label">特邀嘉宾</div>
          </div>
        </div>
        <div class="stat-item">
          <div class="stat-icon" style="color: rgba(0, 186, 173, 1)">
            <el-icon><List /></el-icon>
          </div>
          <div>
            <div class="stat-value" style="color: rgba(0, 186, 173, 1)">
              {{ stats.pendingSeat }}
            </div>
            <div class="stat-label">待排座</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 每日新增趋势 + 报名情况 -->
    <div class="trend-and-stats">
      <!-- 每日新增趋势图表 -->
      <div class="trend-card">
        <div class="trend-header">
          <span class="trend-title">每日新增趋势</span>
          <span class="trend-subtitle">近7天</span>
        </div>
        <div class="trend-chart">
          <div class="chart-bars">
            <div v-for="(item, idx) in dailyTrend" :key="idx" class="bar-item">
              <div class="bar" :style="{ height: item.height + '%' }"></div>
              <div class="bar-label">{{ item.day }}</div>
              <div class="bar-value">{{ item.count }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 标签页切换 -->
    <div class="tabs-wrapper">
      <el-tabs v-model="activeTab" class="custom-tabs">
        <el-tab-pane label="报名情况" name="signup" />
        <el-tab-pane label="特邀嘉宾" name="specialGuest" />
      </el-tabs>
    </div>

    <!-- 筛选栏 + 统计卡片（在同一行） -->
    <div class="filter-bar">
      <div class="filter-left">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索姓名/公司"
          clearable
          style="width: 200px"
          @clear="handleSearch"
          @keyup.enter="handleSearch"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        <el-select v-model="signupType" placeholder="报名方式" clearable style="width: 120px">
          <el-option label="小程序" value="小程序" />
          <el-option label="特邀" value="特邀" />
        </el-select>
        <el-select v-model="guestType" placeholder="嘉宾类型" clearable style="width: 120px">
          <el-option label="参会嘉宾" value="参会嘉宾" />
          <el-option label="演讲嘉宾" value="演讲嘉宾" />
          <el-option label="特邀嘉宾" value="特邀嘉宾" />
          <el-option label="主持人" value="主持人" />
          <el-option label="圆桌嘉宾" value="圆桌嘉宾" />
          <el-option label="重要嘉宾" value="重要嘉宾" />
        </el-select>
        <el-select v-model="signStatus" placeholder="签到状态" clearable style="width: 120px">
          <el-option label="已签到" value="已签到" />
          <el-option label="未签到" value="未签到" />
        </el-select>
        <el-select v-model="mealType" placeholder="就餐类型" clearable style="width: 140px">
          <el-option label="午餐" value="午餐" />
          <el-option label="晚餐" value="晚餐" />
          <el-option label="午餐+晚餐" value="午餐+晚餐" />
        </el-select>
        <el-button type="primary" @click="handleSearch">
          <el-icon><Search /></el-icon> 搜索
        </el-button>
        <el-button @click="resetFilters">重置</el-button>
      </div>
      <!-- 报名情况统计卡片 - 放在筛选栏右侧 -->
      <div class="stats-cards">
        <div class="stat-card">
          <div class="stat-card-label">午餐</div>
          <div class="stat-card-value">{{ stats.lunchCount }}</div>
        </div>
        <div class="stat-card">
          <div class="stat-card-label">晚餐</div>
          <div class="stat-card-value">{{ stats.dinnerCount }}</div>
        </div>
        <div class="stat-card">
          <div class="stat-card-label">午餐+晚餐</div>
          <div class="stat-card-value">{{ stats.lunchDinnerCount }}</div>
        </div>
        <div class="stat-card">
          <div class="stat-card-label" style="color: rgba(0, 186, 173, 1)">小程序报名</div>
          <div class="stat-card-value" style="color: rgba(0, 186, 173, 1)">
            {{ stats.miniProgramCount }}
          </div>
          <div class="stat-card-label" style="color: rgba(0, 186, 173, 1); margin-left: 10px">
            / 特邀
          </div>
          <div class="stat-card-value" style="color: rgba(0, 186, 173, 1)">
            {{ stats.invitedCount }}
          </div>
        </div>
      </div>
    </div>

    <!-- 报名情况表格 -->
    <div v-if="activeTab === 'signup'" class="table-wrapper">
      <el-table :data="filteredSignupList" stripe border style="width: 100%" v-loading="loading">
        <el-table-column type="index" label="#" width="60" align="center" />
        <el-table-column prop="name" label="姓名" width="100" />
        <el-table-column prop="company" label="公司" min-width="150" show-overflow-tooltip />
        <el-table-column prop="position" label="职务" width="120" show-overflow-tooltip />
        <el-table-column prop="phone" label="手机" width="130" />
        <el-table-column prop="signupMethod" label="报名方式" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="row.signupMethod === '特邀' ? 'warning' : 'success'" size="small">
              {{ row.signupMethod }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="guestType" label="嘉宾类型" width="110">
          <template #default="{ row }">
            <el-tag :type="getGuestTypeTag(row.guestType)" size="small">
              {{ row.guestType }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="mealType" label="就餐类型" width="110" />
        <el-table-column prop="receiptStatus" label="回执状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.receiptStatus === '已回执' ? 'success' : 'warning'" size="small">
              {{ row.receiptStatus }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="pptStatus" label="PPT收集" width="90">
          <template #default="{ row }">
            <span :style="{ color: row.pptStatus === '已收集' ? '#67c23a' : '#e6a23c' }">
              {{ row.pptStatus || '-' }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="signTime" label="报名时间" width="160" />
        <el-table-column prop="signStatus" label="签到状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.signStatus === '已签到' ? 'success' : 'info'" size="small">
              {{ row.signStatus }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="seatStatus" label="排座状态" width="90">
          <template #default="{ row }">
            <span :style="{ color: row.seatStatus === '已排座' ? '#67c23a' : '#f56c6c' }">
              {{ row.seatStatus }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="操作" min-width="80" align="center">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="handleViewDetail(row)">
              <el-icon><View /></el-icon>
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="totalSignupCount"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>

    <!-- 特邀嘉宾表格 -->
    <div v-if="activeTab === 'specialGuest'" class="table-wrapper">
      <el-table
        :data="filteredSpecialGuestList"
        stripe
        border
        style="width: 100%"
        v-loading="loading"
      >
        <el-table-column type="index" label="#" width="60" align="center" />
        <el-table-column prop="name" label="姓名" width="100" />
        <el-table-column prop="company" label="公司" min-width="150" show-overflow-tooltip />
        <el-table-column prop="position" label="职务" width="120" show-overflow-tooltip />
        <el-table-column prop="guestType" label="嘉宾类型" width="110">
          <template #default="{ row }">
            <el-tag :type="getGuestTypeTag(row.guestType)" size="small">
              {{ row.guestType }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="inviter" label="邀请人员" width="100" />
        <el-table-column prop="contactPerson" label="对接人员" width="100" />
        <el-table-column prop="invitationStatus" label="邀请函" width="100">
          <template #default="{ row }">
            <el-tag :type="row.invitationStatus === '已发送' ? 'success' : 'danger'" size="small">
              {{ row.invitationStatus }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="receiptStatus" label="回执情况" width="100">
          <template #default="{ row }">
            <el-tag :type="row.receiptStatus === '已回执' ? 'success' : 'warning'" size="small">
              {{ row.receiptStatus }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="pptStatus" label="PPT收集" width="90">
          <template #default="{ row }">
            <span :style="{ color: row.pptStatus === '已收集' ? '#67c23a' : '#e6a23c' }">
              {{ row.pptStatus || '-' }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="mealType" label="就餐类型" width="110" />
        <el-table-column prop="signStatus" label="签到状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.signStatus === '已签到' ? 'success' : 'info'" size="small">
              {{ row.signStatus }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="seatStatus" label="排座状态" width="90">
          <template #default="{ row }">
            <span :style="{ color: row.seatStatus === '已排座' ? '#67c23a' : '#f56c6c' }">
              {{ row.seatStatus }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="操作" min-width="60px" align="center">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="handleViewDetail(row)">
              <el-icon><View /></el-icon>
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="specialCurrentPage"
          v-model:page-size="specialPageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="totalSpecialGuestCount"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSpecialSizeChange"
          @current-change="handleSpecialCurrentChange"
        />
      </div>
    </div>

    <!-- 详情弹窗 -->
    <el-dialog v-model="detailDialogVisible" title="参会人员详情" width="600px">
      <el-descriptions :column="2" border>
        <el-descriptions-item label="姓名">{{ detailData.name }}</el-descriptions-item>
        <el-descriptions-item label="公司">{{ detailData.company }}</el-descriptions-item>
        <el-descriptions-item label="职务">{{ detailData.position }}</el-descriptions-item>
        <el-descriptions-item label="手机">{{ detailData.phone }}</el-descriptions-item>
        <el-descriptions-item label="报名方式">{{ detailData.signupMethod }}</el-descriptions-item>
        <el-descriptions-item label="嘉宾类型">{{ detailData.guestType }}</el-descriptions-item>
        <el-descriptions-item label="就餐类型">{{ detailData.mealType }}</el-descriptions-item>
        <el-descriptions-item label="回执状态">{{ detailData.receiptStatus }}</el-descriptions-item>
        <el-descriptions-item label="PPT收集">{{
          detailData.pptStatus || '-'
        }}</el-descriptions-item>
        <el-descriptions-item label="报名时间">{{ detailData.signTime }}</el-descriptions-item>
        <el-descriptions-item label="签到状态">{{ detailData.signStatus }}</el-descriptions-item>
        <el-descriptions-item label="排座状态">{{ detailData.seatStatus }}</el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <el-button @click="detailDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import ConferenceNavigation from '@/components/ConferenceNavigation.vue'
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import {
  Download,
  Search,
  View,
  User,
  Plus,
  CircleCheck,
  Clock,
  Star,
  List,
} from '@element-plus/icons-vue'

interface MeetingItem {
  id: number
  index: number
  name: string
  location: string
  time: string
  status: '报名中' | '进行中' | '已结束'
}

interface SignupItem {
  id: number
  name: string
  company: string
  position: string
  phone: string
  signupMethod: string
  guestType: string
  mealType: string
  receiptStatus: string
  pptStatus: string
  signTime: string
  signStatus: string
  seatStatus: string
  inviter?: string
  contactPerson?: string
  invitationStatus?: string
}

// 会议列表
const meetings = ref<MeetingItem[]>([
  {
    id: 1,
    index: 1,
    name: '2025第六届上海国际船舶管理论坛',
    location: '中国·上海',
    time: '2025年12月04日 7:00-21:00',
    status: '报名中',
  },
  {
    id: 2,
    index: 2,
    name: '普陀区航运服务集聚区 - 暨港航物流和海事服务产业链合作交流会',
    location: '中国·舟山',
    time: '2025年12月04日 7:00-21:00',
    status: '进行中',
  },
  {
    id: 3,
    index: 3,
    name: '2025世界油商大会',
    location: '中国·舟山',
    time: '2025年12月04日 7:00-21:00',
    status: '已结束',
  },
  {
    id: 4,
    index: 4,
    name: '2025散杂货船舶投资和经营论坛',
    location: '中国·青岛',
    time: '2025年12月04日 7:00-21:00',
    status: '已结束',
  },
])

// 统计数据
const stats = ref({
  total: 6,
  todayNew: 0,
  signedIn: 5,
  notSigned: 4,
  specialGuests: 5,
  pendingSeat: 4,
  lunchCount: 200,
  dinnerCount: 100,
  lunchDinnerCount: 150,
  miniProgramCount: 170,
  invitedCount: 20,
})

// 每日新增趋势数据
const dailyTrend = ref([
  { day: '12/08', count: 12, height: 60 },
  { day: '12/09', count: 8, height: 40 },
  { day: '12/10', count: 15, height: 75 },
  { day: '12/11', count: 10, height: 50 },
  { day: '12/12', count: 6, height: 30 },
  { day: '12/13', count: 18, height: 90 },
  { day: '12/14', count: 20, height: 100 },
])

// 报名情况列表数据（基于图片一）
const signupList = ref<SignupItem[]>([
  {
    id: 1,
    name: '张三',
    company: '华东航运',
    position: '市场经理',
    phone: '13900001111',
    signupMethod: '小程序',
    guestType: '参会嘉宾',
    mealType: '午餐+晚餐',
    receiptStatus: '已回执',
    pptStatus: '-',
    signTime: '2025-11-24 16:00',
    signStatus: '未签到',
    seatStatus: '无需',
  },
  {
    id: 2,
    name: '李四',
    company: '远洋物流',
    position: '业务主管',
    phone: '13900001111',
    signupMethod: '小程序',
    guestType: '参会嘉宾',
    mealType: '午餐',
    receiptStatus: '已回执',
    pptStatus: '-',
    signTime: '2025-11-24 16:00',
    signStatus: '已签到',
    seatStatus: '无需',
  },
  {
    id: 3,
    name: '王五',
    company: '港口集团',
    position: '副总裁',
    phone: '13900001111',
    signupMethod: '特邀',
    guestType: '演讲嘉宾',
    mealType: '午餐+晚餐',
    receiptStatus: '待回执',
    pptStatus: '未收集',
    signTime: '2025-11-24 16:00',
    signStatus: '未签到',
    seatStatus: '待排座',
  },
  {
    id: 4,
    name: '陈越洋',
    company: '远洋航运集团',
    position: '执行总裁',
    phone: '13900001111',
    signupMethod: '特邀',
    guestType: '重要嘉宾',
    mealType: '午餐+晚餐',
    receiptStatus: '已回执',
    pptStatus: '-',
    signTime: '2025-11-24 16:00',
    signStatus: '已签到',
    seatStatus: '待排座',
  },
  {
    id: 5,
    name: '李知行',
    company: '绿舟新能源研究院',
    position: '首席科学家',
    phone: '13900001111',
    signupMethod: '特邀',
    guestType: '演讲嘉宾',
    mealType: '午餐+晚餐',
    receiptStatus: '待回执',
    pptStatus: '已收集',
    signTime: '2025-11-24 16:00',
    signStatus: '已签到',
    seatStatus: '待排座',
  },
  {
    id: 6,
    name: '赵晨',
    company: '深蓝智航数字科技',
    position: '总经理',
    phone: '13900001111',
    signupMethod: '特邀',
    guestType: '主持人',
    mealType: '午餐+晚餐',
    receiptStatus: '已回执',
    pptStatus: '-',
    signTime: '2025-11-24 16:00',
    signStatus: '未签到',
    seatStatus: '待排座',
  },
  {
    id: 7,
    name: '王五',
    company: '港口集团',
    position: '副总裁',
    phone: '13900001111',
    signupMethod: '特邀',
    guestType: '圆桌嘉宾',
    mealType: '午餐+晚餐',
    receiptStatus: '待回执',
    pptStatus: '-',
    signTime: '2025-11-24 16:00',
    signStatus: '已签到',
    seatStatus: '待排座',
  },
  {
    id: 8,
    name: '王五',
    company: '港口集团',
    position: '副总裁',
    phone: '13900001111',
    signupMethod: '特邀',
    guestType: '参会嘉宾',
    mealType: '午餐+晚餐',
    receiptStatus: '已回执',
    pptStatus: '-',
    signTime: '2025-11-24 16:00',
    signStatus: '已签到',
    seatStatus: '待排座',
  },
  {
    id: 9,
    name: '王五',
    company: '港口集团',
    position: '副总裁',
    phone: '13900001111',
    signupMethod: '特邀',
    guestType: '参会嘉宾',
    mealType: '午餐+晚餐',
    receiptStatus: '待回执',
    pptStatus: '-',
    signTime: '2025-11-24 16:00',
    signStatus: '未签到',
    seatStatus: '待排座',
  },
])

// 特邀嘉宾列表数据
const specialGuestList = ref<SignupItem[]>([
  {
    id: 1,
    name: '张三',
    company: '华东航运',
    position: '市场经理',
    phone: '13900001111',
    signupMethod: '特邀',
    guestType: '演讲嘉宾',
    mealType: '午餐+晚餐',
    receiptStatus: '已回执',
    pptStatus: '-',
    signTime: '2025-11-24 16:00',
    signStatus: '未签到',
    seatStatus: '待排座',
    inviter: 'Mac',
    contactPerson: 'Evan',
    invitationStatus: '已发送',
  },
  {
    id: 2,
    name: '李四',
    company: '远洋物流',
    position: '业务主管',
    phone: '13900001111',
    signupMethod: '特邀',
    guestType: '重要嘉宾',
    mealType: '午餐',
    receiptStatus: '已回执',
    pptStatus: '-',
    signTime: '2025-11-24 16:00',
    signStatus: '已签到',
    seatStatus: '待排座',
    inviter: 'Mac',
    contactPerson: 'Iris',
    invitationStatus: '已发送',
  },
  {
    id: 3,
    name: '王五',
    company: '港口集团',
    position: '副总裁',
    phone: '13900001111',
    signupMethod: '特邀',
    guestType: '演讲嘉宾',
    mealType: '午餐+晚餐',
    receiptStatus: '待回执',
    pptStatus: '未收集',
    signTime: '2025-11-24 16:00',
    signStatus: '未签到',
    seatStatus: '待排座',
    inviter: 'Mac',
    contactPerson: 'Evan',
    invitationStatus: '已发送',
  },
  {
    id: 4,
    name: '陈越洋',
    company: '远洋航运集团',
    position: '执行总裁',
    phone: '13900001111',
    signupMethod: '特邀',
    guestType: '重要嘉宾',
    mealType: '午餐+晚餐',
    receiptStatus: '已回执',
    pptStatus: '-',
    signTime: '2025-11-24 16:00',
    signStatus: '已签到',
    seatStatus: '待排座',
    inviter: 'Mac',
    contactPerson: 'Iris',
    invitationStatus: '待发送',
  },
  {
    id: 5,
    name: '李知行',
    company: '绿舟新能源研究院',
    position: '首席科学家',
    phone: '13900001111',
    signupMethod: '特邀',
    guestType: '演讲嘉宾',
    mealType: '午餐+晚餐',
    receiptStatus: '已回执',
    pptStatus: '已收集',
    signTime: '2025-11-24 16:00',
    signStatus: '已签到',
    seatStatus: '待排座',
    inviter: 'Mac',
    contactPerson: 'Evan',
    invitationStatus: '已发送',
  },
  {
    id: 6,
    name: '赵晨',
    company: '深蓝智航数字科技',
    position: '总经理',
    phone: '13900001111',
    signupMethod: '特邀',
    guestType: '主持人',
    mealType: '午餐+晚餐',
    receiptStatus: '已回执',
    pptStatus: '-',
    signTime: '2025-11-24 16:00',
    signStatus: '未签到',
    seatStatus: '待排座',
    inviter: 'Mac',
    contactPerson: 'Iris',
    invitationStatus: '已发送',
  },
])

// 筛选相关
const activeTab = ref('signup')
const searchKeyword = ref('')
const signupType = ref('')
const guestType = ref('')
const signStatus = ref('')
const mealType = ref('')
const loading = ref(false)

// 分页
const currentPage = ref(1)
const pageSize = ref(10)
const specialCurrentPage = ref(1)
const specialPageSize = ref(10)

// 详情弹窗
const detailDialogVisible = ref(false)
const detailData = ref<SignupItem>({} as SignupItem)

// 筛选后的报名列表
const filteredSignupList = computed(() => {
  let list = [...signupList.value]

  if (searchKeyword.value) {
    list = list.filter(
      (item) =>
        item.name.includes(searchKeyword.value) || item.company.includes(searchKeyword.value),
    )
  }
  if (signupType.value) {
    list = list.filter((item) => item.signupMethod === signupType.value)
  }
  if (guestType.value) {
    list = list.filter((item) => item.guestType === guestType.value)
  }
  if (signStatus.value) {
    list = list.filter((item) => item.signStatus === signStatus.value)
  }
  if (mealType.value) {
    list = list.filter((item) => item.mealType === mealType.value)
  }

  return list
})

// 分页后的报名列表
const paginatedSignupList = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredSignupList.value.slice(start, end)
})

// 总报名数
const totalSignupCount = computed(() => filteredSignupList.value.length)

// 筛选后的特邀嘉宾列表
const filteredSpecialGuestList = computed(() => {
  let list = [...specialGuestList.value]

  if (searchKeyword.value) {
    list = list.filter(
      (item) =>
        item.name.includes(searchKeyword.value) || item.company.includes(searchKeyword.value),
    )
  }
  if (guestType.value) {
    list = list.filter((item) => item.guestType === guestType.value)
  }
  if (signStatus.value) {
    list = list.filter((item) => item.signStatus === signStatus.value)
  }
  if (mealType.value) {
    list = list.filter((item) => item.mealType === mealType.value)
  }

  return list
})

// 分页后的特邀嘉宾列表
const paginatedSpecialGuestList = computed(() => {
  const start = (specialCurrentPage.value - 1) * specialPageSize.value
  const end = start + specialPageSize.value
  return filteredSpecialGuestList.value.slice(start, end)
})

// 总特邀嘉宾数
const totalSpecialGuestCount = computed(() => filteredSpecialGuestList.value.length)

// 获取嘉宾类型标签样式
const getGuestTypeTag = (type: string) => {
  const map: Record<string, string> = {
    参会嘉宾: 'info',
    演讲嘉宾: 'warning',
    特邀嘉宾: 'danger',
    主持人: 'success',
    圆桌嘉宾: 'primary',
    重要嘉宾: 'danger',
  }
  return map[type] || 'info'
}

// 会议操作
const handleMeetingChange = (meetingId: number) => {
  console.log('会议切换', meetingId)
}

// 导出Excel
const handleExportExcel = () => {
  ElMessage.success('导出功能开发中')
}

// 搜索
const handleSearch = () => {
  currentPage.value = 1
  specialCurrentPage.value = 1
}

// 重置筛选
const resetFilters = () => {
  searchKeyword.value = ''
  signupType.value = ''
  guestType.value = ''
  signStatus.value = ''
  mealType.value = ''
  handleSearch()
}

// 分页处理
const handleSizeChange = (val: number) => {
  pageSize.value = val
  currentPage.value = 1
}

const handleCurrentChange = (val: number) => {
  currentPage.value = val
}

const handleSpecialSizeChange = (val: number) => {
  specialPageSize.value = val
  specialCurrentPage.value = 1
}

const handleSpecialCurrentChange = (val: number) => {
  specialCurrentPage.value = val
}

// 查看详情
const handleViewDetail = (row: SignupItem) => {
  detailData.value = row
  detailDialogVisible.value = true
}
</script>

<style scoped>
.design-container {
  padding: 10px;
  background-color: #f5f7fa;
  min-height: calc(100vh - 80px);
}

/* 概况卡片 */
.overview-card {
  background: white;
  border-radius: 12px;
  padding: 8px;
  margin-bottom: 10px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
}

.overview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.overview-title {
  font-size: 16px;
  font-weight: 600;
  color: #1a1a1a;
}

.stats-grid {
  display: flex;
  gap: 40px;
  /* flex-wrap: wrap; */
  display: flex;
  justify-content: space-between;
}

.stat-item {
  display: flex;
  text-align: center;
  width: 184px;
  /* height: 67px; */
  border-radius: 4px;
  border: 0.5px solid rgba(221, 224, 231, 1);
  padding: 4px;
  padding-right: 40px;
}

.stat-icon {
  font-size: 24px;
  color: #1890ff;
  width: 51px;
  height: 45px;
  background-color: rgba(232, 244, 253, 1);
  padding-right: 10px;
  padding-left: 10px;
  margin-right: 10px;
  display: flex;
  align-items: center;
  /* margin-bottom: 8px; */
}

.stat-value {
  font-size: 20px;
  font-weight: 600;
  color: #1890ff;
}

.stat-label {
  font-size: 13px;
  color: #999;
  margin-top: 2px;
}

/* 趋势卡片 */
.trend-and-stats {
  display: flex;
  gap: 20px;
  margin-bottom: 10px;
  flex-wrap: wrap;
}

.trend-card {
  flex: 1;
  background: white;
  border-radius: 12px;
  padding: 10px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
}

.trend-header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  /* margin-bottom: 10px; */
}

.trend-title {
  font-size: 14px;
  font-weight: 500;
  color: #333;
}

.trend-subtitle {
  font-size: 12px;
  color: #999;
}

.chart-bars {
  display: flex;
  justify-content: space-around;
  align-items: flex-end;
  height: 100px;
}

.bar-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 50px;
}

.bar {
  width: 30px;
  background: linear-gradient(180deg, #1890ff, #69c0ff);
  border-radius: 4px 4px 0 0;
  transition: height 0.3s;
  min-height: 4px;
}

.bar-label {
  font-size: 11px;
  color: #999;
  margin-top: 8px;
}

.bar-value {
  font-size: 11px;
  color: #666;
  margin-top: 4px;
}

/* 标签页 */
.tabs-wrapper {
  background: white;
  border-radius: 12px;
  margin-bottom: 10px;
  padding: 0 10px;
}

.custom-tabs :deep(.el-tabs__header) {
  margin: 0;
}

.custom-tabs :deep(.el-tabs__active-bar) {
  background-color: #1890ff;
}

.custom-tabs :deep(.el-tabs__item.is-active) {
  color: #1890ff;
}

/* 筛选栏 + 统计卡片 */
.filter-bar {
  background: white;
  border-radius: 12px;
  padding: 6px 10px;
  margin-bottom: 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: nowrap;
  gap: 16px;
}

.filter-left {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  align-items: center;
}

.stats-cards {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.stat-card {
  /* min-width: 70px; */
  display: flex;
  justify-content: start;
  background: #f5f7fa;
  border-radius: 8px;
  padding: 4px 12px;
  text-align: center;
}

.stat-card-value {
  font-size: 12px;
  /* font-weight: 600; */
  color: rgba(42, 130, 228, 1);
  text-align: center;
}

.stat-card-label {
  font-size: 11px;
  margin-right: 6px;
  color: rgba(42, 130, 228, 1);
}

/* 表格容器 */
.table-wrapper {
  background: white;
  border-radius: 12px;
  padding: 0;
  overflow-x: auto;
}

/* 分页 */
.pagination-wrapper {
  padding: 16px 20px;
  display: flex;
  justify-content: flex-end;
  border-top: 1px solid #f0f0f0;
}
</style>
