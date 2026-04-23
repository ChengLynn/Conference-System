<template>
  <!-- 通用导航组件 -->
  <ConferenceNavigation
    :currentPage="'座位排布'"
    :meetings="meetings"
    @meeting-change="handleMeetingChange"
  />
  <div class="design-container">
    <!-- 座位安排视图 -->
    <div class="content-card">
      <!-- 当前会议信息卡片 -->
      <div class="content-card-title">
        <div class="section-header">
          <div class="layout-controls">
            <span class="section-title">座位平面图</span>
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
          <div class="action-buttons">
            <el-button type="primary" size="small" @click="handleAutoSeating"> 自动排座 </el-button>
            <el-button type="success" size="small" @click="handleExportExcel">
              导出Excel
            </el-button>
            <el-button type="danger" size="small" plain @click="handleClearSeating">
              清空排座
            </el-button>
          </div>
        </div>
      </div>

      <!-- 座位排布主要内容 -->
      <div class="seating-main">
        <!-- 左侧：座位平面图 -->
        <div class="seating-chart-section" @dragover.prevent @drop="handleDropOnSeating($event)">
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
                  'drag-source': dragMode && dragSourceSeat === seat,
                }"
                @click="handleSeatClick($event, seat)"
                @dblclick.stop="handleSeatDoubleClick(seat)"
                @dragover.prevent
                @dragstart="handleSeatDragStart($event, seat)"
                @drop="handleDropOnSeat($event, seat, false, rowIdx, colIdx)"
                :draggable="dragMode && dragSourceSeat === seat"
              >
                <div v-if="seat.occupied" class="seat-content">
                  <span class="seat-name">{{ seat.guestName }}</span>
                  <span class="seat-company">{{ seat.guestCompany }}</span>
                  <span class="seat-position">{{ seat.guestPosition }}</span>
                </div>
                <div v-else-if="dragMode && dragTargetSeat === seat" class="drag-target-hint">
                  释放到此座位
                </div>
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
                    'drag-source': dragMode && dragSourceSeat === getSofaSeat(row, col),
                  }"
                  @click="handleSofaSeatClick($event, row, col)"
                  @dblclick.stop="handleSofaSeatDoubleClick(row, col)"
                  @dragover.prevent
                  @dragstart="handleSeatDragStart($event, getSofaSeat(row, col)!)"
                  @drop="handleDropOnSofaSeat($event, row, col)"
                  :draggable="dragMode && dragSourceSeat === getSofaSeat(row, col)"
                >
                  <div v-if="getSofaSeat(row, col)?.occupied" class="seat-content">
                    <span class="seat-name">{{ getSofaSeat(row, col)?.guestName }}</span>
                    <span class="seat-company">{{ getSofaSeat(row, col)?.guestCompany }}</span>
                    <span class="seat-position">{{ getSofaSeat(row, col)?.guestPosition }}</span>
                  </div>
                  <div
                    v-else-if="dragMode && dragTargetSeat === getSofaSeat(row, col)"
                    class="drag-target-hint"
                  >
                    释放到此座位
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 图例 -->
          <div class="legend">
            <div class="legend-item">
              <div class="legend-color sofa-legend"></div>
              <span>沙发区</span>
            </div>
            <div class="legend-item">
              <div class="legend-color occupied-legend"></div>
              <span>已安排</span>
            </div>
            <div class="legend-item">
              <div class="legend-color empty-legend"></div>
              <span>空位</span>
            </div>
            <!-- 座位统计 -->
            <div class="seating-stats">共{{ totalSeats }}座 / 已安排{{ occupiedSeats }}人</div>
          </div>

          <!-- 退出拖拽模式按钮 -->
          <div class="exit-drag-mode" v-if="dragMode">
            <el-button size="small" type="danger" plain @click="exitDragMode">
              退出拖拽模式
            </el-button>
          </div>
        </div>

        <!-- 右侧：待安排嘉宾列表 -->
        <div class="pending-guests-section">
          <div class="section-header">
            <span class="section-title">待安排嘉宾</span>
            <span class="pending-count">{{ pendingGuests.length }}人</span>
          </div>
          <div class="drag-mode-tip" v-if="dragMode">
            <el-alert title="拖拽模式已开启" type="info" :closable="false" show-icon>
              <template #default>
                当前选中：<strong>{{ dragSourceSeat?.guestName }}</strong
                >，点击空座位移动，或点击其他已占座交换
              </template>
            </el-alert>
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
              <div class="guest-order" v-if="guest.order !== undefined">序号:{{ guest.order }}</div>
            </div>
          </div>
          <div v-if="filteredPendingGuests.length === 0" class="empty-guests">暂无待安排嘉宾</div>
        </div>
      </div>
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
        <el-form-item label="手工序号">
          <el-input-number
            v-model="seatForm.guestOrder"
            :min="1"
            :max="999"
            placeholder="序号越小越靠前"
            style="width: 100%"
          />
          <div class="form-tip">序号越小越靠前，用于自动排座排序</div>
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
import { User } from '@element-plus/icons-vue'
import ConferenceNavigation from '@/components/ConferenceNavigation.vue'

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
  order?: number // 手工设置的序号，用于排序
}

// 座位类型
interface SeatItem {
  row: number
  col: number
  occupied: boolean
  guestId?: number
  guestName?: string
  guestCompany?: string
  guestPosition?: string
  sofa?: boolean
}

// 嘉宾类型权重映射
const guestTypeWeight: Record<string, number> = {
  重要嘉宾: 1,
  圆桌嘉宾: 2,
  演讲嘉宾: 3,
  主持人: 4,
  参会嘉宾: 5,
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
  {
    id: 1,
    name: '徐明远',
    company: '链轮技术科技',
    position: '首席战略官',
    type: '演讲嘉宾',
    order: 3,
  },
  {
    id: 2,
    name: '何思琪',
    company: '智洋环保科技',
    position: '董事会秘书',
    type: '重要嘉宾',
    order: 1,
  },
  {
    id: 3,
    name: '吴天宇',
    company: '智洋环保科技',
    position: '副总裁',
    type: '圆桌嘉宾',
    order: 2,
  },
  {
    id: 4,
    name: '陈越洋',
    company: '远洋航运集团',
    position: '执行总裁',
    type: '重要嘉宾',
    order: 4,
  },
  {
    id: 5,
    name: '李知行',
    company: '绿舟新能源研究院',
    position: '首席科学家',
    type: '演讲嘉宾',
    order: 5,
  },
  { id: 6, name: '张三', company: '华东航运', position: '市场经理', type: '参会嘉宾', order: 6 },
  { id: 7, name: '王五', company: '港口集团', position: '副总裁', type: '演讲嘉宾', order: 7 },
  {
    id: 8,
    name: '赵晨',
    company: '深蓝智航数字科技',
    position: '总经理',
    type: '主持人',
    order: 8,
  },
])

// 当前会议名称
const currentConferenceName = ref('2025第六届上海国际船舶管理论坛')

// 搜索嘉宾关键词
const guestSearchKeyword = ref('')

// 座位弹窗
const seatDialogVisible = ref(false)
const currentSeat = ref<{ row: number; col: number; sofa: boolean } | null>(null)
const seatForm = ref({ selectedGuestId: null as number | null, guestOrder: 999 })

// 拖拽相关（从右侧列表拖拽）
let dragGuest: GuestItem | null = null

// 座位间拖拽相关
const dragMode = ref(false) // 拖拽模式开关
const dragSourceSeat = ref<SeatItem | null>(null) // 正在拖拽的源座位
const dragTargetSeat = ref<SeatItem | null>(null) // 当前鼠标悬停的目标座位

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

// 获取所有空座位（按优先级排序：前排优先，中间优先）
const getEmptySeatsOrdered = (includeSofa: boolean = true) => {
  const emptySeats: {
    seat: SeatItem
    row: number
    col: number
    sofa: boolean
    priority: number
  }[] = []

  // 收集沙发区空座位
  if (includeSofa && sofaRows.value > 0 && sofaCols.value > 0) {
    for (let i = 0; i < sofaRows.value; i++) {
      for (let j = 0; j < sofaCols.value; j++) {
        const seat = sofaSeats.value[i]?.[j]
        if (seat && !seat.occupied) {
          // 沙发区优先级：前排优先，中间列优先
          const colCenter = (sofaCols.value - 1) / 2
          const colPriority = Math.abs(j - colCenter)
          emptySeats.push({
            seat,
            row: i,
            col: j,
            sofa: true,
            priority: i * 100 + colPriority,
          })
        }
      }
    }
  }

  // 收集普通区空座位
  for (let i = 0; i < normalRows.value.length; i++) {
    for (let j = 0; j < normalCols.value; j++) {
      const seat = normalSeats.value[i]?.[j]
      if (seat && !seat.occupied) {
        // 普通区优先级：前排优先，中间列优先
        const colCenter = (normalCols.value - 1) / 2
        const colPriority = Math.abs(j - colCenter)
        emptySeats.push({
          seat,
          row: i,
          col: j,
          sofa: false,
          priority: i * 100 + colPriority,
        })
      }
    }
  }

  // 按优先级排序
  emptySeats.sort((a, b) => a.priority - b.priority)
  return emptySeats
}

// 自动排座
const handleAutoSeating = () => {
  if (pendingGuests.value.length === 0) {
    ElMessage.warning('没有待安排的嘉宾')
    return
  }

  // 1. 清空所有已安排座位
  clearAllSeats()

  // 2. 获取所有待安排嘉宾并按规则排序
  const sortedGuests = [...pendingGuests.value].sort((a, b) => {
    // 按嘉宾类型权重升序（权重越小越靠前）
    const weightA = guestTypeWeight[a.type] || 999
    const weightB = guestTypeWeight[b.type] || 999
    if (weightA !== weightB) {
      return weightA - weightB
    }
    // 同权重时，按手工序号升序（序号越小越靠前）
    const orderA = a.order ?? 999
    const orderB = b.order ?? 999
    return orderA - orderB
  })

  // 3. 分离可以进沙发区的嘉宾（重要嘉宾、圆桌嘉宾）
  const sofaEligibleGuests = sortedGuests.filter(
    (guest) => guest.type === '重要嘉宾' || guest.type === '圆桌嘉宾',
  )
  const otherGuests = sortedGuests.filter(
    (guest) => guest.type !== '重要嘉宾' && guest.type !== '圆桌嘉宾',
  )

  // 4. 获取沙发区空座位
  const sofaEmptySeats = getEmptySeatsOrdered(true).filter((item) => item.sofa)

  // 5. 先安排沙发区
  const remainingSofaGuests: GuestItem[] = []
  for (let i = 0; i < sofaEligibleGuests.length; i++) {
    const guest = sofaEligibleGuests[i]
    if (i < sofaEmptySeats.length) {
      // 有沙发区空位，安排到沙发区
      const targetSeat = sofaEmptySeats[i].seat
      assignGuestToSeatDirect(guest, targetSeat)
    } else {
      // 沙发区已满，溢出到普通区
      remainingSofaGuests.push(guest)
    }
  }

  // 6. 获取普通区空座位（按优先级排序）
  const normalEmptySeats = getEmptySeatsOrdered(true).filter((item) => !item.sofa)

  // 7. 安排剩余嘉宾（溢出嘉宾 + 其他嘉宾）到普通区
  const allRemainingGuests = [...remainingSofaGuests, ...otherGuests]
  for (let i = 0; i < allRemainingGuests.length; i++) {
    const guest = allRemainingGuests[i]
    if (i < normalEmptySeats.length) {
      const targetSeat = normalEmptySeats[i].seat
      assignGuestToSeatDirect(guest, targetSeat)
    } else {
      ElMessage.warning(`座位不足，无法安排 ${guest.name}`)
    }
  }

  ElMessage.success(`自动排座完成，已安排 ${occupiedSeats.value} 人`)
}

// 直接安排嘉宾到座位（不经过弹窗）
const assignGuestToSeatDirect = (guest: GuestItem, seat: SeatItem) => {
  if (seat.occupied) return false

  seat.occupied = true
  seat.guestId = guest.id
  seat.guestName = guest.name
  seat.guestCompany = guest.company
  seat.guestPosition = guest.position

  // 从待安排列表中移除
  const idx = pendingGuests.value.findIndex((g) => g.id === guest.id)
  if (idx !== -1) {
    pendingGuests.value.splice(idx, 1)
  }
  return true
}

// 清空所有座位
const clearAllSeats = () => {
  // 收集所有已安排的嘉宾
  const assignedGuests: GuestItem[] = []

  // 遍历普通区
  normalRows.value.forEach((row) => {
    row.forEach((seat) => {
      if (seat.occupied && seat.guestId) {
        assignedGuests.push({
          id: seat.guestId,
          name: seat.guestName!,
          company: seat.guestCompany!,
          position: seat.guestPosition!,
          type: '',
        })
        seat.occupied = false
        seat.guestId = undefined
        seat.guestName = undefined
        seat.guestCompany = undefined
        seat.guestPosition = undefined
      }
    })
  })

  // 遍历沙发区
  if (sofaRows.value > 0 && sofaCols.value > 0) {
    sofaSeats.value.forEach((row) => {
      row.forEach((seat) => {
        if (seat.occupied && seat.guestId) {
          assignedGuests.push({
            id: seat.guestId,
            name: seat.guestName!,
            company: seat.guestCompany!,
            position: seat.guestPosition!,
            type: '',
          })
          seat.occupied = false
          seat.guestId = undefined
          seat.guestName = undefined
          seat.guestCompany = undefined
          seat.guestPosition = undefined
        }
      })
    })
  }

  // 将嘉宾加回待安排列表（保持原有类型信息）
  assignedGuests.forEach((guest) => {
    const originalGuest = pendingGuestsOriginal.value.find((g) => g.id === guest.id)
    if (originalGuest && !pendingGuests.value.some((g) => g.id === guest.id)) {
      pendingGuests.value.push({ ...originalGuest })
    }
  })
}

// 保存原始嘉宾列表（用于清空后排座恢复）
const pendingGuestsOriginal = ref<GuestItem[]>([...pendingGuests.value])

// 清空排座
const handleClearSeating = () => {
  ElMessageBox.confirm('确定要清空所有座位安排吗？清空后所有嘉宾将回到待安排列表。', '提示', {
    confirmButtonText: '确认清空',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(() => {
      clearAllSeats()
      ElMessage.success('已清空所有座位安排')
    })
    .catch(() => {})
}

// 导出Excel
const handleExportExcel = () => {
  // 构建导出数据
  const exportData: any[] = []

  // 导出沙发区
  if (sofaRows.value > 0 && sofaCols.value > 0) {
    for (let i = 0; i < sofaRows.value; i++) {
      for (let j = 0; j < sofaCols.value; j++) {
        const seat = sofaSeats.value[i]?.[j]
        if (seat?.occupied) {
          exportData.push({
            区域: '沙发区',
            位置: `第${i + 1}排第${j + 1}列`,
            姓名: seat.guestName,
            公司: seat.guestCompany,
            职位: seat.guestPosition,
          })
        }
      }
    }
  }

  // 导出普通区
  for (let i = 0; i < normalRows.value.length; i++) {
    for (let j = 0; j < normalCols.value; j++) {
      const seat = normalSeats.value[i]?.[j]
      if (seat?.occupied) {
        exportData.push({
          区域: '普通区',
          位置: `第${i + 1}排第${j + 1}列`,
          姓名: seat.guestName,
          公司: seat.guestCompany,
          职位: seat.guestPosition,
        })
      }
    }
  }

  // 导出待安排嘉宾
  pendingGuests.value.forEach((guest) => {
    exportData.push({
      区域: '待安排',
      位置: '-',
      姓名: guest.name,
      公司: guest.company,
      职位: guest.position,
    })
  })

  // 转换为CSV并下载
  if (exportData.length === 0) {
    ElMessage.warning('暂无数据可导出')
    return
  }

  const headers = Object.keys(exportData[0])
  const csvRows = [headers.join(',')]
  for (const row of exportData) {
    const values = headers.map((header) => `"${row[header] || ''}"`)
    csvRows.push(values.join(','))
  }

  const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.href = url
  link.setAttribute('download', `座位排布_${new Date().toLocaleDateString()}.csv`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)

  ElMessage.success('导出成功')
}

// 安排嘉宾到座位
const assignGuestToSeat = (guest: GuestItem, seat: SeatItem) => {
  if (seat.occupied) {
    ElMessage.warning('该座位已被占用')
    return false
  }
  seat.occupied = true
  seat.guestId = guest.id
  seat.guestName = guest.name
  seat.guestCompany = guest.company
  seat.guestPosition = guest.position

  // 从待安排列表中移除
  const idx = pendingGuests.value.findIndex((g) => g.id === guest.id)
  if (idx !== -1) {
    pendingGuests.value.splice(idx, 1)
  }
  return true
}

// 取消座位安排（将嘉宾放回待安排列表）
const unassignGuestFromSeat = (seat: SeatItem) => {
  if (!seat.occupied) return

  // 将嘉宾加回待安排列表
  const guest: GuestItem = {
    id: seat.guestId!,
    name: seat.guestName!,
    company: seat.guestCompany!,
    position: seat.guestPosition!,
    type: '',
  }
  if (!pendingGuests.value.some((g) => g.id === guest.id)) {
    pendingGuests.value.push(guest)
  }

  seat.occupied = false
  seat.guestId = undefined
  seat.guestName = undefined
  seat.guestCompany = undefined
  seat.guestPosition = undefined
}

// 交换两个座位的嘉宾信息
const swapSeats = (sourceSeat: SeatItem, targetSeat: SeatItem) => {
  if (!sourceSeat.occupied) {
    ElMessage.warning('源座位没有嘉宾')
    return false
  }

  // 保存源座位信息
  const sourceGuest = {
    guestId: sourceSeat.guestId,
    guestName: sourceSeat.guestName,
    guestCompany: sourceSeat.guestCompany,
    guestPosition: sourceSeat.guestPosition,
  }

  if (targetSeat.occupied) {
    // 如果目标座位已有嘉宾，则交换
    const targetGuest = {
      guestId: targetSeat.guestId,
      guestName: targetSeat.guestName,
      guestCompany: targetSeat.guestCompany,
      guestPosition: targetSeat.guestPosition,
    }

    targetSeat.guestId = sourceGuest.guestId
    targetSeat.guestName = sourceGuest.guestName
    targetSeat.guestCompany = sourceGuest.guestCompany
    targetSeat.guestPosition = sourceGuest.guestPosition

    sourceSeat.guestId = targetGuest.guestId
    sourceSeat.guestName = targetGuest.guestName
    sourceSeat.guestCompany = targetGuest.guestCompany
    sourceSeat.guestPosition = targetGuest.guestPosition

    ElMessage.success(`已将 ${sourceGuest.guestName} 与 ${targetGuest.guestName} 交换座位`)
  } else {
    // 目标座位为空，直接移动
    targetSeat.occupied = true
    targetSeat.guestId = sourceGuest.guestId
    targetSeat.guestName = sourceGuest.guestName
    targetSeat.guestCompany = sourceGuest.guestCompany
    targetSeat.guestPosition = sourceGuest.guestPosition

    sourceSeat.occupied = false
    sourceSeat.guestId = undefined
    sourceSeat.guestName = undefined
    sourceSeat.guestCompany = undefined
    sourceSeat.guestPosition = undefined

    ElMessage.success(`已将 ${targetSeat.guestName} 移动到新座位`)
  }
  return true
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
    const guest4 = {
      id: 4,
      name: '陈越洋',
      company: '远洋航运集团',
      position: '执行总裁',
      type: '重要嘉宾',
    }
    const guest5 = {
      id: 5,
      name: '李知行',
      company: '绿舟新能源研究院',
      position: '首席科学家',
      type: '演讲嘉宾',
    }
    assignGuestToSeat(guest4, sofaSeats.value[0][0])
    assignGuestToSeat(guest5, sofaSeats.value[0][1])
  }

  // 普通区已安排座位
  if (normalSeats.value[0] && normalSeats.value[0][2]) {
    const guest6 = {
      id: 6,
      name: '张三',
      company: '华东航运',
      position: '市场经理',
      type: '参会嘉宾',
    }
    assignGuestToSeat(guest6, normalSeats.value[0][2])
  }
  if (normalSeats.value[0] && normalSeats.value[0][3]) {
    const guest7 = {
      id: 7,
      name: '王五',
      company: '港口集团',
      position: '副总裁',
      type: '演讲嘉宾',
    }
    assignGuestToSeat(guest7, normalSeats.value[0][3])
  }
  if (normalSeats.value[1] && normalSeats.value[1][3]) {
    const guest8 = {
      id: 8,
      name: '赵晨',
      company: '深蓝智航数字科技',
      position: '总经理',
      type: '主持人',
    }
    assignGuestToSeat(guest8, normalSeats.value[1][3])
  }
  if (normalSeats.value[1] && normalSeats.value[1][4]) {
    const guest8 = {
      id: 8,
      name: '赵晨',
      company: '深蓝智航数字科技',
      position: '总经理',
      type: '主持人',
    }
    assignGuestToSeat(guest8, normalSeats.value[1][4])
  }
  if (normalSeats.value[1] && normalSeats.value[1][5]) {
    const guest5 = {
      id: 5,
      name: '李知行',
      company: '绿舟新能源研究院',
      position: '首席科学家',
      type: '演讲嘉宾',
    }
    assignGuestToSeat(guest5, normalSeats.value[1][5])
  }
}

// 更新座位布局
const updateSeatingLayout = () => {
  exitDragMode()
  initSeatingLayout()
}

// 进入拖拽模式
const enterDragMode = (seat: SeatItem) => {
  if (!seat.occupied) {
    ElMessage.warning('空座位无法拖拽，请先安排嘉宾')
    return false
  }
  dragMode.value = true
  dragSourceSeat.value = seat
  ElMessage.info(
    `已选中 ${seat.guestName}（${seat.guestCompany}），点击空座位移动，或点击其他已占座交换座位`,
  )
  return true
}

// 退出拖拽模式
const exitDragMode = () => {
  dragMode.value = false
  dragSourceSeat.value = null
  dragTargetSeat.value = null
}

// 点击座位（普通座位）
const handleSeatClick = (event: MouseEvent, seat: SeatItem) => {
  // 阻止事件冒泡，避免与双击冲突
  event.stopPropagation()

  // 拖拽模式下的处理
  if (dragMode.value && dragSourceSeat.value) {
    if (dragSourceSeat.value === seat) {
      // 点击的是同一个座位，退出拖拽模式
      exitDragMode()
      ElMessage.info('已退出拖拽模式')
    } else if (!seat.occupied) {
      // 目标座位为空，移动
      swapSeats(dragSourceSeat.value, seat)
      exitDragMode()
    } else if (seat.occupied) {
      // 目标座位有嘉宾，交换
      swapSeats(dragSourceSeat.value, seat)
      exitDragMode()
    }
    return
  }

  // 非拖拽模式下的正常点击
  if (seat.occupied) {
    ElMessageBox.confirm(`是否取消 ${seat.guestName}（${seat.guestCompany}）的座位安排？`, '提示', {
      confirmButtonText: '确认取消',
      cancelButtonText: '取消',
      type: 'warning',
    })
      .then(() => {
        unassignGuestFromSeat(seat)
        ElMessage.success('已取消座位安排')
      })
      .catch(() => {})
  } else {
    // 空座位，打开安排弹窗
    currentSeat.value = { row: seat.row, col: seat.col, sofa: false }
    seatForm.value.selectedGuestId = null
    seatForm.value.guestOrder = 999
    seatDialogVisible.value = true
  }
}

// 双击座位（普通座位）- 进入拖拽模式
const handleSeatDoubleClick = (seat: SeatItem) => {
  if (!seat.occupied) {
    ElMessage.warning('空座位无法拖拽，请先安排嘉宾')
    return
  }
  enterDragMode(seat)
}

// 点击沙发区座位
const handleSofaSeatClick = (event: MouseEvent, row: number, col: number) => {
  event.stopPropagation()
  const seat = getSofaSeat(row, col)
  if (!seat) return

  // 拖拽模式下的处理
  if (dragMode.value && dragSourceSeat.value) {
    if (dragSourceSeat.value === seat) {
      exitDragMode()
      ElMessage.info('已退出拖拽模式')
    } else if (!seat.occupied) {
      swapSeats(dragSourceSeat.value, seat)
      exitDragMode()
    } else if (seat.occupied) {
      swapSeats(dragSourceSeat.value, seat)
      exitDragMode()
    }
    return
  }

  if (seat.occupied) {
    ElMessageBox.confirm(`是否取消 ${seat.guestName}（${seat.guestCompany}）的座位安排？`, '提示', {
      confirmButtonText: '确认取消',
      cancelButtonText: '取消',
      type: 'warning',
    })
      .then(() => {
        unassignGuestFromSeat(seat)
        ElMessage.success('已取消座位安排')
      })
      .catch(() => {})
  } else {
    currentSeat.value = { row, col, sofa: true }
    seatForm.value.selectedGuestId = null
    seatForm.value.guestOrder = 999
    seatDialogVisible.value = true
  }
}

// 双击沙发区座位 - 进入拖拽模式
const handleSofaSeatDoubleClick = (row: number, col: number) => {
  const seat = getSofaSeat(row, col)
  if (!seat?.occupied) {
    ElMessage.warning('空座位无法拖拽，请先安排嘉宾')
    return
  }
  enterDragMode(seat)
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

  // 更新嘉宾的序号
  if (seatForm.value.guestOrder !== undefined && seatForm.value.guestOrder !== 999) {
    guest.order = seatForm.value.guestOrder
  }

  if (currentSeat.value) {
    if (currentSeat.value.sofa) {
      const seat = getSofaSeat(currentSeat.value.row, currentSeat.value.col)
      if (seat && !seat.occupied) {
        assignGuestToSeat(guest, seat)
        ElMessage.success(`已将 ${guest.name} 安排到座位`)
      } else if (seat?.occupied) {
        ElMessage.warning('该座位已被占用')
      }
    } else {
      const seat = normalSeats.value[currentSeat.value.row]?.[currentSeat.value.col]
      if (seat && !seat.occupied) {
        assignGuestToSeat(guest, seat)
        ElMessage.success(`已将 ${guest.name} 安排到座位`)
      } else if (seat?.occupied) {
        ElMessage.warning('该座位已被占用')
      }
    }
  }
  seatDialogVisible.value = false
}

// 拖拽开始（从右侧列表）
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

// 座位拖拽开始（用于原生HTML5拖拽）
const handleSeatDragStart = (event: DragEvent, seat: SeatItem) => {
  if (!dragMode.value || !seat.occupied || dragSourceSeat.value !== seat) {
    event.preventDefault()
    return false
  }
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData(
      'text/plain',
      JSON.stringify({
        type: 'seat',
        row: seat.row,
        col: seat.col,
        sofa: seat.sofa,
      }),
    )
  }
  return true
}

// 拖拽到座位区域（空白区域）
const handleDropOnSeating = (event: DragEvent) => {
  event.preventDefault()
  // 不做任何操作，只是防止页面跳转
}

// 拖拽到普通座位
const handleDropOnSeat = (
  event: DragEvent,
  seat: SeatItem,
  isSofa: boolean,
  rowIdx: number,
  colIdx: number,
) => {
  event.preventDefault()

  // 如果是拖拽模式下的座位移动
  if (dragMode.value && dragSourceSeat.value) {
    if (dragSourceSeat.value === seat) {
      return
    }
    if (!seat.occupied) {
      swapSeats(dragSourceSeat.value, seat)
      exitDragMode()
    } else {
      swapSeats(dragSourceSeat.value, seat)
      exitDragMode()
    }
    return
  }

  // 从右侧列表拖拽嘉宾
  if (!dragGuest) {
    try {
      const data = event.dataTransfer?.getData('text/plain')
      if (data) {
        const parsed = JSON.parse(data)
        if (parsed.type === 'seat') {
          // 是从座位拖拽过来的
          const sourceSeat = parsed.sofa
            ? getSofaSeat(parsed.row + 1, parsed.col + 1)
            : normalSeats.value[parsed.row]?.[parsed.col]
          if (sourceSeat && sourceSeat.occupied && !seat.occupied) {
            swapSeats(sourceSeat, seat)
            exitDragMode()
          } else if (seat.occupied) {
            ElMessage.warning('目标座位已被占用')
          }
        } else {
          // 是从嘉宾列表拖拽过来的
          const guest = parsed as GuestItem
          if (guest && guest.id && !seat.occupied) {
            assignGuestToSeat(guest, seat)
            ElMessage.success(`已将 ${guest.name} 安排到座位`)
          } else if (seat.occupied) {
            ElMessage.warning('该座位已被占用')
          }
        }
      }
    } catch (e) {
      console.error('解析拖拽数据失败', e)
    }
    return
  }

  if (!seat.occupied) {
    assignGuestToSeat(dragGuest, seat)
    ElMessage.success(`已将 ${dragGuest.name} 拖拽安排到座位`)
  } else {
    ElMessage.warning('该座位已被占用')
  }
  dragGuest = null
}

// 拖拽到沙发座位
const handleDropOnSofaSeat = (event: DragEvent, row: number, col: number) => {
  event.preventDefault()
  const seat = getSofaSeat(row, col)
  if (!seat) return

  // 如果是拖拽模式下的座位移动
  if (dragMode.value && dragSourceSeat.value) {
    if (dragSourceSeat.value === seat) return
    if (!seat.occupied) {
      swapSeats(dragSourceSeat.value, seat)
      exitDragMode()
    } else {
      swapSeats(dragSourceSeat.value, seat)
      exitDragMode()
    }
    return
  }

  if (!dragGuest) {
    try {
      const data = event.dataTransfer?.getData('text/plain')
      if (data) {
        const parsed = JSON.parse(data)
        if (parsed.type === 'seat') {
          const sourceSeat = parsed.sofa
            ? getSofaSeat(parsed.row + 1, parsed.col + 1)
            : normalSeats.value[parsed.row]?.[parsed.col]
          if (sourceSeat && sourceSeat.occupied && !seat.occupied) {
            swapSeats(sourceSeat, seat)
            exitDragMode()
          } else if (seat.occupied) {
            ElMessage.warning('目标座位已被占用')
          }
        } else {
          const guest = parsed as GuestItem
          if (guest && guest.id && !seat.occupied) {
            assignGuestToSeat(guest, seat)
            ElMessage.success(`已将 ${guest.name} 安排到沙发区座位`)
          } else if (seat.occupied) {
            ElMessage.warning('该座位已被占用')
          }
        }
      }
    } catch (e) {
      console.error('解析拖拽数据失败', e)
    }
    return
  }

  if (!seat.occupied) {
    assignGuestToSeat(dragGuest, seat)
    ElMessage.success(`已将 ${dragGuest.name} 拖拽安排到沙发区座位`)
  } else {
    ElMessage.warning('该座位已被占用')
  }
  dragGuest = null
}

// 会议操作
const handleMeetingChange = (meetingId: number) => {
  console.log('会议切换', meetingId)
  const meeting = meetings.value.find((m) => m.id === meetingId)
  if (meeting) {
    currentConferenceName.value = meeting.name
    // 切换会议时重置座位布局和嘉宾列表
    exitDragMode()
    initSeatingLayout()
  }
}

// 初始化
onMounted(() => {
  initSeatingLayout()
  pendingGuestsOriginal.value = JSON.parse(JSON.stringify(pendingGuests.value))
})
</script>

<style scoped>
.design-container {
  padding: 10px;
  background-color: #f5f7fa;
  min-height: calc(100vh - 80px);
}

/* 内容卡片 */
.content-card-title {
  background: white;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
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
  position: relative;
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

.action-buttons {
  display: flex;
  gap: 8px;
}

.pending-count {
  font-size: 14px;
  color: #1890ff;
  font-weight: 500;
}

/* 拖拽模式提示 */
.drag-mode-tip {
  margin-bottom: 16px;
}

/* 退出拖拽模式按钮 */
.exit-drag-mode {
  margin-top: 16px;
  text-align: center;
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

/* 图例样式 */
.legend {
  display: flex;
  justify-content: center;
  gap: 24px;
  margin: 20px 0;
  padding-top: 20px;
  border-top: 1px solid #f0f0f0;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: #666;
}

.legend-color {
  width: 20px;
  height: 20px;
  border-radius: 4px;
}

.sofa-legend {
  background: linear-gradient(145deg, #fff7e6, #ffe7ba);
  border: 1px solid #fa8c16;
}

.occupied-legend {
  background: linear-gradient(145deg, #e8f0fe, #d1e0fd);
  border: 1px solid #2b6bcb;
}

.empty-legend {
  background: #f5f7fa;
  border: 1px dashed #d0d7e2;
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
  min-width: 80px;
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
  height: 70px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  margin-right: 4px;
}

.seat {
  flex: 1;
  height: 70px;
  min-width: 80px;
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
  cursor: grab;
}

.seat.occupied.drag-source {
  background: linear-gradient(145deg, #d1e0fd, #b8ccee);
  border: 2px solid #ff4d4f;
  box-shadow: 0 0 8px rgba(255, 77, 79, 0.5);
}

.seat.empty {
  background: #f5f7fa;
  border: 2px dashed #d0d7e2;
}

.seat.empty:hover {
  background: #edf2f7;
  border-color: #a0b8d4;
}

.seat-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  width: 100%;
  padding: 4px;
}

.seat-name {
  font-size: 13px;
  font-weight: 600;
  color: #2b6bcb;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.seat-company {
  font-size: 10px;
  color: #666;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-top: 2px;
}

.seat-position {
  font-size: 9px;
  color: #999;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-top: 2px;
}

.drag-target-hint {
  font-size: 11px;
  color: #1890ff;
  background: rgba(24, 144, 255, 0.1);
  padding: 4px 8px;
  border-radius: 4px;
  white-space: nowrap;
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
  width: 100px;
  height: 80px;
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
  cursor: grab;
}

.sofa-seat.occupied.drag-source {
  background: linear-gradient(145deg, #ffe7ba, #ffd966);
  border: 2px solid #ff4d4f;
  box-shadow: 0 0 8px rgba(255, 77, 79, 0.5);
}

.sofa-seat.empty {
  background: #f5f7fa;
  border: 2px dashed #d0d7e2;
}

.sofa-seat.empty:hover {
  background: #edf2f7;
}

.sofa-seat .seat-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  width: 100%;
  padding: 4px;
}

.sofa-seat .seat-name {
  font-size: 12px;
  font-weight: 600;
  color: #fa8c16;
}

.sofa-seat .seat-company {
  font-size: 10px;
  color: #999;
}

/* 座位统计 */
.seating-stats {
  /* margin-top: 24px;
  padding-top: 16px; */
  /* border-top: 1px solid #f0f0f0; */
  text-align: right;
  font-size: 14px;
  color: #666;
}

/* 待安排嘉宾列表 */
.search-guests {
  margin-bottom: 16px;
  margin-top: 16px;
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

.guest-order {
  font-size: 11px;
  color: #fa8c16;
  background: #fff7e6;
  padding: 2px 6px;
  border-radius: 10px;
}

.empty-guests {
  text-align: center;
  padding: 40px;
  color: #999;
}

.form-tip {
  font-size: 12px;
  color: #999;
  margin-top: 4px;
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
    height: 60px;
    font-size: 12px;
  }

  .grid-header {
    padding-left: 60px;
  }

  .col-label {
    min-width: 60px;
    font-size: 11px;
  }

  .seat {
    min-width: 60px;
    height: 60px;
  }

  .seat-name {
    font-size: 11px;
  }

  .seat-company {
    font-size: 9px;
  }

  .sofa-seat {
    width: 80px;
    height: 70px;
  }
}
</style>
