<template>
  <!-- 通用导航组件 -->
  <ConferenceNavigation
    :currentPage="'座位排布'"
    :meetings="meetings"
    @meeting-change="handleMeetingChange"
  />
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

    <!-- 座位安排视图 -->
    <div v-else class="content-card">
      <!-- 面包屑导航 -->
      <div class="breadcrumb">
        <span class="breadcrumb-item">首页</span>
        <span class="breadcrumb-separator">/</span>
        <span class="breadcrumb-item">会议筹备</span>
        <span class="breadcrumb-separator">/</span>
        <span class="breadcrumb-item active">座位排布</span>
      </div>

      <!-- 当前会议信息卡片 -->
      <div class="content-card">
        <div class="current-meeting-info">
          <div class="meeting-header">
            <div class="meeting-title-section">
              <h2 class="conference-title">{{ currentConferenceName }}</h2>
              <el-button link class="meeting-manage-btn" @click="handleMeetingManage">
                会议管理
              </el-button>
            </div>
            <div class="meeting-status">
              <el-tag type="warning" size="small">报名中</el-tag>
              <span class="meeting-time">2025年12月04日 7:00-21:00</span>
              <span class="meeting-location">上海汤臣洲际大酒店</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 座位排布主要内容 -->
      <div class="seating-main">
        <!-- 左侧：座位平面图 -->
        <div class="seating-chart-section">
          <div class="section-header">
            <span class="section-title">座位平面图</span>
            <div class="layout-controls">
              <span class="layout-label">总行数：{{ totalRows }}</span>
              <el-input-number
                v-model="totalRows"
                :min="1"
                :max="10"
                size="small"
                style="width: 80px"
                @change="updateSeatingLayout"
              />
              <span class="layout-label">普通区列数：{{ normalCols }}</span>
              <el-input-number
                v-model="normalCols"
                :min="1"
                :max="15"
                size="small"
                style="width: 80px"
                @change="updateSeatingLayout"
              />
              <span class="layout-label">沙发区行数：{{ sofaRows }}</span>
              <el-input-number
                v-model="sofaRows"
                :min="0"
                :max="3"
                size="small"
                style="width: 80px"
                @change="updateSeatingLayout"
              />
              <span class="layout-label">沙发区列数：{{ sofaCols }}</span>
              <el-input-number
                v-model="sofaCols"
                :min="0"
                :max="10"
                size="small"
                style="width: 80px"
                @change="updateSeatingLayout"
              />
            </div>
          </div>

          <!-- 舞台 -->
          <div class="stage">舞台</div>

          <!-- 普通座位区 -->
          <div class="seating-grid" v-if="normalRows.length > 0">
            <div class="grid-header">
              <div class="corner-placeholder"></div>
              <div class="col-label" v-for="col in normalCols" :key="'col' + col">
                第{{ col }}列
              </div>
            </div>
            <div v-for="(row, rowIdx) in normalRows" :key="'row' + rowIdx" class="grid-row">
              <div class="row-label">第{{ rowIdx + 1 }}排</div>
              <div
                v-for="(seat, colIdx) in row"
                :key="'seat' + rowIdx + '-' + colIdx"
                class="seat"
                :class="{
                  occupied: seat.occupied,
                  empty: !seat.occupied,
                  'sofa-seat': seat.sofa,
                }"
                @click="handleSeatClick(seat)"
              >
                <span v-if="seat.occupied" class="seat-name">{{ seat.guestName }}</span>
              </div>
            </div>
          </div>

          <!-- 沙发区 -->
          <div v-if="sofaRows > 0 && sofaCols > 0" class="sofa-section">
            <div class="sofa-title">沙发区</div>
            <div class="sofa-grid">
              <div v-for="row in sofaRows" :key="'sofa-row' + row" class="sofa-row">
                <div
                  v-for="col in sofaCols"
                  :key="'sofa' + row + '-' + col"
                  class="sofa-seat"
                  :class="{
                    occupied: getSofaSeat(row, col)?.occupied,
                    empty: !getSofaSeat(row, col)?.occupied,
                  }"
                  @click="handleSofaSeatClick(row, col)"
                >
                  <span v-if="getSofaSeat(row, col)?.occupied" class="seat-name">
                    {{ getSofaSeat(row, col)?.guestName }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- 座位统计 -->
          <div class="seating-stats">共{{ totalSeats }}座 / 已安排{{ occupiedSeats }}人</div>
        </div>

        <!-- 右侧：待安排嘉宾列表 -->
        <div class="pending-guests-section">
          <div class="section-header">
            <span class="section-title">待安排嘉宾</span>
            <span class="pending-count">{{ pendingGuests.length }}人</span>
          </div>
          <div class="search-guests">
            <el-input
              v-model="guestSearchKeyword"
              placeholder="搜索嘉宾"
              clearable
              size="small"
              prefix-icon="Search"
            />
          </div>
          <div class="guests-list">
            <div
              v-for="guest in filteredPendingGuests"
              :key="guest.id"
              class="guest-item"
              draggable="true"
              @dragstart="handleDragStart($event, guest)"
              @dragend="handleDragEnd"
            >
              <div class="guest-avatar">
                <el-icon><User /></el-icon>
              </div>
              <div class="guest-info">
                <div class="guest-name">{{ guest.name }}</div>
                <div class="guest-company">{{ guest.company }}</div>
                <div class="guest-position">{{ guest.position }}</div>
              </div>
            </div>
          </div>
          <div v-if="filteredPendingGuests.length === 0" class="empty-guests">暂无待安排嘉宾</div>
        </div>
      </div>

      <!-- 拖拽放置提示 -->
      <div class="drag-tip">提示：可将右侧嘉宾拖拽到左侧座位上进行安排</div>
    </div>

    <!-- 座位安排弹窗 -->
    <el-dialog v-model="seatDialogVisible" title="安排座位" width="400px">
      <el-form :model="seatForm">
        <el-form-item label="选择嘉宾">
          <el-select
            v-model="seatForm.selectedGuestId"
            placeholder="请选择嘉宾"
            filterable
            style="width: 100%"
          >
            <el-option
              v-for="guest in pendingGuests"
              :key="guest.id"
              :label="`${guest.name} - ${guest.company} ${guest.position}`"
              :value="guest.id"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="seatDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmAssignSeat">确认安排</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Edit, Delete, View, User } from '@element-plus/icons-vue'
import ConferenceNavigation from '@/components/ConferenceNavigation.vue'

import type { ConferenceItem } from '@/types/conference'

// 会议列表数据
interface MeetingItem {
  id: number
  index: number
  name: string
  location: string
  time: string
  status: '报名中' | '进行中' | '已结束'
}

// 嘉宾类型
interface GuestItem {
  id: number
  name: string
  company: string
  position: string
  type: string
}

// 座位类型
interface SeatItem {
  row: number
  col: number
  occupied: boolean
  guestId?: number
  guestName?: string
  sofa?: boolean
}

// 会议列表（用于导航组件）
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
    filePath: '',
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

// 座位布局配置
const totalRows = ref(4)
const normalCols = ref(10)
const sofaRows = ref(1)
const sofaCols = ref(8)

// 座位数据
const normalSeats = ref<SeatItem[][]>([])
const sofaSeats = ref<SeatItem[][]>([])

// 待安排嘉宾列表（基于图片数据）
const pendingGuests = ref<GuestItem[]>([
  { id: 1, name: '徐明远', company: '链轮技术科技', position: '首席战略官', type: '演讲嘉宾' },
  { id: 2, name: '何思琪', company: '智洋环保科技', position: '董事会秘书', type: '重要嘉宾' },
  { id: 3, name: '吴天宇', company: '智洋环保科技', position: '副总裁', type: '圆桌嘉宾' },
  { id: 4, name: '陈越洋', company: '远洋航运集团', position: '执行总裁', type: '重要嘉宾' },
  { id: 5, name: '李知行', company: '绿舟新能源研究院', position: '首席科学家', type: '演讲嘉宾' },
  { id: 6, name: '张三', company: '华东航运', position: '市场经理', type: '参会嘉宾' },
  { id: 7, name: '王五', company: '港口集团', position: '副总裁', type: '演讲嘉宾' },
  { id: 8, name: '赵晨', company: '深蓝智航数字科技', position: '总经理', type: '主持人' },
])

// 已安排嘉宾（从座位数据中提取）
const assignedGuestIds = ref<number[]>([])

// 当前会议名称
const currentConferenceName = ref('2025第六届上海国际船舶管理论坛')

// 搜索嘉宾关键词
const guestSearchKeyword = ref('')

// 座位弹窗
const seatDialogVisible = ref(false)
const currentSeat = ref<{ row: number; col: number; sofa: boolean } | null>(null)
const seatForm = ref({ selectedGuestId: null as number | null })

// 拖拽相关
let dragGuest: GuestItem | null = null

// 计算属性
const normalRows = computed(() => normalSeats.value)

const filteredPendingGuests = computed(() => {
  if (!guestSearchKeyword.value) return pendingGuests.value
  return pendingGuests.value.filter(
    (guest) =>
      guest.name.includes(guestSearchKeyword.value) ||
      guest.company.includes(guestSearchKeyword.value),
  )
})

const totalSeats = computed(() => {
  let count = normalRows.value.reduce((sum, row) => sum + row.length, 0)
  if (sofaRows.value > 0 && sofaCols.value > 0) {
    count += sofaRows.value * sofaCols.value
  }
  return count
})

const occupiedSeats = computed(() => {
  let count = 0
  normalRows.value.forEach((row) => {
    row.forEach((seat) => {
      if (seat.occupied) count++
    })
  })
  if (sofaRows.value > 0 && sofaCols.value > 0) {
    sofaSeats.value.forEach((row) => {
      row.forEach((seat) => {
        if (seat.occupied) count++
      })
    })
  }
  return count
})

// 获取沙发区座位
const getSofaSeat = (row: number, col: number) => {
  if (sofaSeats.value[row - 1] && sofaSeats.value[row - 1][col - 1]) {
    return sofaSeats.value[row - 1][col - 1]
  }
  return null
}

// 初始化座位布局
const initSeatingLayout = () => {
  // 初始化普通座位
  const newNormalSeats: SeatItem[][] = []
  for (let i = 0; i < totalRows.value; i++) {
    const row: SeatItem[] = []
    for (let j = 0; j < normalCols.value; j++) {
      row.push({
        row: i,
        col: j,
        occupied: false,
        sofa: false,
      })
    }
    newNormalSeats.push(row)
  }
  normalSeats.value = newNormalSeats

  // 初始化沙发区座位
  const newSofaSeats: SeatItem[][] = []
  for (let i = 0; i < sofaRows.value; i++) {
    const row: SeatItem[] = []
    for (let j = 0; j < sofaCols.value; j++) {
      row.push({
        row: i,
        col: j,
        occupied: false,
        sofa: true,
      })
    }
    newSofaSeats.push(row)
  }
  sofaSeats.value = newSofaSeats

  // 添加示例已安排座位（基于图片数据）
  // 沙发区已安排座位
  if (sofaSeats.value[0]) {
    sofaSeats.value[0][0] = {
      ...sofaSeats.value[0][0],
      occupied: true,
      guestId: 4,
      guestName: '陈越洋',
    }
    sofaSeats.value[0][1] = {
      ...sofaSeats.value[0][1],
      occupied: true,
      guestId: 5,
      guestName: '李知行',
    }
    sofaSeats.value[0][2] = {
      ...sofaSeats.value[0][2],
      occupied: false,
      guestId: undefined,
      guestName: undefined,
    }
    sofaSeats.value[0][3] = {
      ...sofaSeats.value[0][3],
      occupied: false,
      guestId: undefined,
      guestName: undefined,
    }
    sofaSeats.value[0][4] = {
      ...sofaSeats.value[0][4],
      occupied: false,
      guestId: undefined,
      guestName: undefined,
    }
    sofaSeats.value[0][5] = {
      ...sofaSeats.value[0][5],
      occupied: false,
      guestId: undefined,
      guestName: undefined,
    }
    sofaSeats.value[0][6] = {
      ...sofaSeats.value[0][6],
      occupied: false,
      guestId: undefined,
      guestName: undefined,
    }
    sofaSeats.value[0][7] = {
      ...sofaSeats.value[0][7],
      occupied: false,
      guestId: undefined,
      guestName: undefined,
    }
  }

  // 普通区已安排座位
  if (normalSeats.value[0] && normalSeats.value[0][2]) {
    normalSeats.value[0][2] = {
      ...normalSeats.value[0][2],
      occupied: true,
      guestId: 6,
      guestName: '张三',
    }
  }
  if (normalSeats.value[0] && normalSeats.value[0][3]) {
    normalSeats.value[0][3] = {
      ...normalSeats.value[0][3],
      occupied: true,
      guestId: 7,
      guestName: '王五',
    }
  }
  if (normalSeats.value[1] && normalSeats.value[1][3]) {
    normalSeats.value[1][3] = {
      ...normalSeats.value[1][3],
      occupied: true,
      guestId: 8,
      guestName: '赵晨',
    }
  }
  if (normalSeats.value[1] && normalSeats.value[1][4]) {
    normalSeats.value[1][4] = {
      ...normalSeats.value[1][4],
      occupied: true,
      guestId: 8,
      guestName: '赵晨',
    }
  }
  if (normalSeats.value[1] && normalSeats.value[1][5]) {
    normalSeats.value[1][5] = {
      ...normalSeats.value[1][5],
      occupied: true,
      guestId: 5,
      guestName: '李知行',
    }
  }
}

// 更新座位布局
const updateSeatingLayout = () => {
  initSeatingLayout()
}

// 点击座位
const handleSeatClick = (seat: SeatItem) => {
  if (seat.occupied) {
    // 已占座，询问是否取消
    ElMessageBox.confirm(`是否取消 ${seat.guestName} 的座位安排？`, '提示', {
      confirmButtonText: '确认取消',
      cancelButtonText: '取消',
      type: 'warning',
    })
      .then(() => {
        // 将嘉宾加回待安排列表
        const guest = pendingGuests.value.find((g) => g.name === seat.guestName)
        if (guest && !pendingGuests.value.some((g) => g.id === guest.id)) {
          pendingGuests.value.push(guest)
        }
        seat.occupied = false
        seat.guestId = undefined
        seat.guestName = undefined
        ElMessage.success('已取消座位安排')
      })
      .catch(() => {})
  } else {
    // 空座位，打开安排弹窗
    currentSeat.value = { row: seat.row, col: seat.col, sofa: false }
    seatForm.value.selectedGuestId = null
    seatDialogVisible.value = true
  }
}

// 点击沙发区座位
const handleSofaSeatClick = (row: number, col: number) => {
  const seat = getSofaSeat(row, col)
  if (seat?.occupied) {
    ElMessageBox.confirm(`是否取消 ${seat.guestName} 的座位安排？`, '提示', {
      confirmButtonText: '确认取消',
      cancelButtonText: '取消',
      type: 'warning',
    })
      .then(() => {
        const guest = pendingGuests.value.find((g) => g.name === seat.guestName)
        if (guest && !pendingGuests.value.some((g) => g.id === guest.id)) {
          pendingGuests.value.push(guest)
        }
        seat.occupied = false
        seat.guestId = undefined
        seat.guestName = undefined
        ElMessage.success('已取消座位安排')
      })
      .catch(() => {})
  } else {
    currentSeat.value = { row, col, sofa: true }
    seatForm.value.selectedGuestId = null
    seatDialogVisible.value = true
  }
}

// 确认安排座位
const confirmAssignSeat = () => {
  if (!seatForm.value.selectedGuestId) {
    ElMessage.warning('请选择嘉宾')
    return
  }
  const guest = pendingGuests.value.find((g) => g.id === seatForm.value.selectedGuestId)
  if (!guest) {
    ElMessage.error('嘉宾不存在')
    return
  }
  if (currentSeat.value) {
    if (currentSeat.value.sofa) {
      const seat = getSofaSeat(currentSeat.value.row, currentSeat.value.col)
      if (seat && !seat.occupied) {
        seat.occupied = true
        seat.guestId = guest.id
        seat.guestName = guest.name
        // 从待安排列表中移除
        const idx = pendingGuests.value.findIndex((g) => g.id === guest.id)
        if (idx !== -1) pendingGuests.value.splice(idx, 1)
        ElMessage.success(`已将 ${guest.name} 安排到座位`)
      }
    } else {
      const seat = normalSeats.value[currentSeat.value.row]?.[currentSeat.value.col]
      if (seat && !seat.occupied) {
        seat.occupied = true
        seat.guestId = guest.id
        seat.guestName = guest.name
        const idx = pendingGuests.value.findIndex((g) => g.id === guest.id)
        if (idx !== -1) pendingGuests.value.splice(idx, 1)
        ElMessage.success(`已将 ${guest.name} 安排到座位`)
      }
    }
  }
  seatDialogVisible.value = false
}

// 拖拽开始
const handleDragStart = (event: DragEvent, guest: GuestItem) => {
  dragGuest = guest
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'copy'
    event.dataTransfer.setData('text/plain', JSON.stringify(guest))
  }
}

// 拖拽结束
const handleDragEnd = () => {
  dragGuest = null
}

// 视图切换
const switchView = (view: 'list' | 'detail') => {
  currentView.value = view
}

// 会议操作
const handleMeetingChange = (meetingId: number) => {
  console.log('会议切换', meetingId)
  // 根据选中的会议更新当前会议名称
  const meeting = meetings.value.find((m) => m.id === meetingId)
  if (meeting) {
    currentConferenceName.value = meeting.name
  }
}

const handleMeetingManage = () => {
  ElMessage.info('会议管理功能开发中')
}

// 处理编辑
const handleEdit = (row: ConferenceItem) => {
  console.log('编辑会议:', row)
}

// 处理删除
const handleDelete = (row: ConferenceItem) => {
  console.log('删除会议:', row)
}

// 查看
const handleView = (row: ConferenceItem) => {
  ElMessage.info(`查看会议详情: ${row.name}`)
  switchView('detail')
}

// 处理添加
const handleAdd = () => {
  console.log('添加表单')
}

// 分页处理
const handlePageChange = (page: number) => {
  currentPage.value = page
}

const handleSizeChange = (val: number) => {
  pageSize.value = val
  ElMessage.info(`每页显示 ${val} 条`)
}

// 初始化
onMounted(() => {
  initSeatingLayout()
})
</script>

<style scoped>
.design-container {
  padding: 10px;
  background-color: #f5f7fa;
  min-height: calc(100vh - 80px);
}

/* 视图切换 tabs */
.view-tabs {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
  background: white;
  padding: 0 20px;
  border-radius: 12px;
  height: 50px;
  align-items: center;
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
  bottom: -13px;
  left: 0;
  right: 0;
  height: 2px;
  background: #409eff;
}

/* 面包屑导航 */
.breadcrumb {
  margin-bottom: 20px;
  font-size: 14px;
  color: #666;
}

.breadcrumb-item {
  color: #666;
}

.breadcrumb-item.active {
  color: #1890ff;
}

.breadcrumb-separator {
  margin: 0 8px;
  color: #ccc;
}

/* 内容卡片 */
.content-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
}

/* 当前会议信息 */
.current-meeting-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
}

.meeting-header {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.meeting-title-section {
  display: flex;
  align-items: center;
  gap: 12px;
}

.conference-title {
  font-size: 18px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0;
}

.meeting-manage-btn {
  color: #1890ff;
}

.meeting-status {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.meeting-time {
  font-size: 14px;
  color: #666;
}

.meeting-location {
  font-size: 14px;
  color: #666;
}

/* 搜索区域 */
.search-section {
  margin-bottom: 20px;
}

.search-row {
  display: flex;
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
  overflow-x: auto;
}

.table-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
}

.pagination-wrapper {
  display: flex;
  align-items: center;
  gap: 16px;
}

.pagination-info {
  font-size: 14px;
  color: #606266;
}

/* 座位排布主布局 */
.seating-main {
  display: flex;
  gap: 24px;
}

.seating-chart-section {
  flex: 3;
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
}

.pending-guests-section {
  flex: 1;
  min-width: 280px;
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
}

/* 区域头部 */
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 12px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #1a1a1a;
}

.layout-controls {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.layout-label {
  font-size: 13px;
  color: #666;
}

.pending-count {
  font-size: 14px;
  color: #1890ff;
  font-weight: 500;
}

/* 舞台样式 */
.stage {
  width: 280px;
  height: 70px;
  background: linear-gradient(180deg, #4a90e2 0%, #2b6bcb 100%);
  border-radius: 35px 35px 8px 8px;
  margin: 0 auto 32px auto;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 22px;
  font-weight: 600;
  letter-spacing: 8px;
}

/* 座位网格 */
.seating-grid {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 24px;
  overflow-x: auto;
}

.grid-header {
  display: flex;
  margin-bottom: 8px;
  padding-left: 80px;
}

.corner-placeholder {
  width: 0;
  flex-shrink: 0;
}

.col-label {
  flex: 1;
  text-align: center;
  font-size: 13px;
  font-weight: 600;
  color: #2c3e50;
  background: #f8fafd;
  padding: 8px 0;
  border-radius: 6px;
  margin: 0 2px;
  min-width: 60px;
}

.grid-row {
  display: flex;
  align-items: center;
  gap: 4px;
}

.row-label {
  width: 80px;
  flex-shrink: 0;
  font-size: 13px;
  font-weight: 600;
  color: #2c3e50;
  background: #f8fafd;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  margin-right: 4px;
}

.seat {
  flex: 1;
  height: 50px;
  min-width: 60px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  cursor: pointer;
}

.seat.occupied {
  background: linear-gradient(145deg, #e8f0fe, #d1e0fd);
  border: 2px solid #2b6bcb;
}

.seat.empty {
  background: #f5f7fa;
  border: 2px dashed #d0d7e2;
}

.seat.empty:hover {
  background: #edf2f7;
  border-color: #a0b8d4;
}

.seat-name {
  font-size: 12px;
  font-weight: 600;
  color: #2b6bcb;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  padding: 0 4px;
}

/* 沙发区 */
.sofa-section {
  margin: 20px 0;
}

.sofa-title {
  font-size: 14px;
  font-weight: 600;
  color: #fa8c16;
  margin-bottom: 12px;
  padding-left: 8px;
  border-left: 3px solid #fa8c16;
}

.sofa-grid {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.sofa-row {
  display: flex;
  gap: 8px;
  justify-content: center;
}

.sofa-seat {
  width: 80px;
  height: 60px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  cursor: pointer;
}

.sofa-seat.occupied {
  background: linear-gradient(145deg, #fff7e6, #ffe7ba);
  border: 2px solid #fa8c16;
}

.sofa-seat.empty {
  background: #f5f7fa;
  border: 2px dashed #d0d7e2;
}

.sofa-seat.empty:hover {
  background: #edf2f7;
}

/* 座位统计 */
.seating-stats {
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
  text-align: right;
  font-size: 14px;
  color: #666;
}

/* 待安排嘉宾列表 */
.search-guests {
  margin-bottom: 16px;
}

.guests-list {
  max-height: 500px;
  overflow-y: auto;
}

.guest-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-bottom: 1px solid #f0f0f0;
  cursor: grab;
  transition: background 0.2s;
}

.guest-item:hover {
  background: #f5f7fa;
}

.guest-item:active {
  cursor: grabbing;
}

.guest-avatar {
  width: 40px;
  height: 40px;
  background: #e6f7ff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #1890ff;
  font-size: 20px;
}

.guest-info {
  flex: 1;
}

.guest-name {
  font-size: 14px;
  font-weight: 500;
  color: #333;
}

.guest-company {
  font-size: 12px;
  color: #999;
}

.guest-position {
  font-size: 12px;
  color: #1890ff;
}

.empty-guests {
  text-align: center;
  padding: 40px;
  color: #999;
}

/* 拖拽提示 */
.drag-tip {
  margin-top: 16px;
  text-align: center;
  font-size: 12px;
  color: #999;
}

/* 响应式调整 */
@media (max-width: 900px) {
  .seating-main {
    flex-direction: column;
  }

  .stage {
    width: 220px;
    height: 60px;
    font-size: 18px;
    letter-spacing: 4px;
  }

  .row-label {
    width: 60px;
    height: 45px;
    font-size: 12px;
  }

  .grid-header {
    padding-left: 60px;
  }

  .seat {
    min-width: 45px;
    height: 45px;
  }

  .sofa-seat {
    width: 60px;
    height: 50px;
  }
}
</style>
