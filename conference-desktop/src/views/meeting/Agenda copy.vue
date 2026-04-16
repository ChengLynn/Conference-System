<template>
  <div class="agenda-page">
    <!-- 通用导航组件 -->
    <ConferenceNavigation
      :currentPage="'议程安排'"
      :meetings="meetings"
      @meeting-change="handleMeetingChange"
    />

    <div class="content-card">
      <!-- 会议管理列表区域（初始显示） -->
      <div v-if="!showAgendaView" class="table-section">
        <div class="section-header">
          <span class="section-title">会议管理</span>
        </div>
        <el-table :data="meetings" stripe border class="meeting-table">
          <el-table-column prop="index" label="#" width="60" align="center" />
          <el-table-column prop="name" label="会议名称" min-width="260" />
          <el-table-column prop="location" label="地点" width="140" />
          <el-table-column prop="time" label="会议时间" width="220" />
          <el-table-column label="状态" width="120">
            <template #default="{ row }">
              <el-tag class="status-tag-table" :class="row.status">{{ row.status }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="320" align="center">
            <template #default="{ row }">
              <el-button link size="small" class="btn-edit" @click="handleEdit(row)">
                <el-icon><Edit /></el-icon> 编辑
              </el-button>
              <el-button link size="small" class="btn-switch" @click="handleToggle(row)">
                <el-icon><DataAnalysis /></el-icon> 切换
              </el-button>
              <el-button link size="small" class="btn-delete" @click="handleDelete(row)">
                <el-icon><Delete /></el-icon> 删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- 议程安排界面（点击编辑后显示） -->
      <div v-else class="agenda-section">
        <!-- 议程头部操作栏 -->
        <div class="agenda-header">
          <span class="agenda-title">议程安排</span>
          <div class="agenda-actions">
            <el-button class="btn-export-pdf" @click="handleExportPDF">
              <el-icon><Plus /></el-icon> 导出PDF
            </el-button>
            <el-button class="btn-new-meeting" @click="handleAddAgenda">
              <el-icon><Plus /></el-icon> 新建会议
            </el-button>
          </div>
        </div>

        <!-- 垂直时间轴布局 - 卡片式 -->
        <div class="vertical-timeline-wrapper">
          <!-- 议程列表 -->
          <div class="timeline-items">
            <div v-for="(item, index) in agendaList" :key="index" class="timeline-row">
              <!-- 左侧圆点连线区域 -->
              <div class="timeline-left">
                <div class="timeline-dot" :class="getDotClass(item.stage)"></div>
                <div class="timeline-line" v-if="index < agendaList.length - 1"></div>
              </div>

              <!-- 议程卡片 -->
              <div class="agenda-card">
                <!-- 卡片顶部：时间 -->
                <div class="card-time">{{ item.startTime }} - {{ item.endTime }}</div>

                <div class="card-header">
                  <div class="card-header-left">
                    <span class="stage-tag" :class="getTagClass(item.stage)">
                      {{ item.stage }}
                    </span>
                    <span class="card-title">{{ item.topic }}</span>
                  </div>
                  <div class="card-actions">
                    <el-button
                      type="text"
                      size="small"
                      class="action-edit"
                      @click="handleEditAgenda(item)"
                    >
                      <el-icon><Edit /></el-icon> 编辑
                    </el-button>
                    <el-button
                      type="text"
                      size="small"
                      class="action-delete"
                      @click="handleDeleteAgenda(item)"
                    >
                      <el-icon><Delete /></el-icon> 删除
                    </el-button>
                  </div>
                </div>

                <div class="card-content">
                  <!-- 致辞嘉宾（开幕致辞） -->
                  <template
                    v-if="
                      item.speakerDetails && item.speakerDetails.length && item.stage === '开幕致辞'
                    "
                  >
                    <div
                      v-for="(detail, idx) in item.speakerDetails"
                      :key="idx"
                      class="content-line"
                    >
                      <span class="content-text">{{ detail }}</span>
                    </div>
                  </template>

                  <!-- 演讲嘉宾（主题演讲/专题演讲） -->
                  <template v-if="item.speakers && item.speakers.length">
                    <div class="content-line">
                      <span class="content-label">演讲嘉宾：</span>
                      <span class="content-text">{{ item.speakers.join('；') }}</span>
                    </div>
                  </template>

                  <!-- 主持人 -->
                  <template v-if="item.host">
                    <div class="content-line">
                      <span class="content-label">主持人：</span>
                      <span class="content-text">{{ item.host }}</span>
                    </div>
                  </template>

                  <!-- 对话嘉宾（圆桌讨论） -->
                  <template v-if="item.guests && item.guests.length">
                    <div class="content-line">
                      <span class="content-label">对话嘉宾：</span>
                      <span class="content-text">{{ formatGuests(item.guests) }}</span>
                    </div>
                  </template>
                </div>
              </div>
            </div>
          </div>

          <!-- 空状态 -->
          <div v-if="agendaList.length === 0" class="empty-agenda">
            <el-empty description="暂无议程，请点击新建会议" :image-size="80" />
          </div>
        </div>
      </div>
    </div>

    <!-- 新增/编辑议程弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="760px"
      class="agenda-dialog"
      :close-on-click-modal="false"
    >
      <div class="dialog-content">
        <div class="form-section">
          <div class="form-row two-columns">
            <div class="form-item required">
              <div class="form-label">开始时间</div>
              <el-time-picker
                v-model="agendaForm.startTime"
                format="HH:mm"
                value-format="HH:mm"
                placeholder="开始时间"
                size="medium"
                class="form-input time-picker"
                prefix-icon="Clock"
              />
            </div>
            <div class="form-item required">
              <div class="form-label">结束时间</div>
              <el-time-picker
                size="medium"
                v-model="agendaForm.endTime"
                format="HH:mm"
                value-format="HH:mm"
                placeholder="结束时间"
                class="form-input time-picker"
                prefix-icon="Clock"
              />
            </div>
          </div>

          <div class="form-row">
            <div class="form-item required full-width">
              <div class="form-label">议程阶段</div>
              <el-select
                v-model="agendaForm.stage"
                placeholder="选择或输出自定义阶段"
                allow-create
                filterable
                class="form-input"
                @change="handleStageChange"
              >
                <el-option label="签到入场" value="签到入场" />
                <el-option label="开幕致辞" value="开幕致辞" />
                <el-option label="主题演讲" value="主题演讲" />
                <el-option label="圆桌讨论" value="圆桌讨论" />
                <el-option label="午餐休息" value="午餐休息" />
                <el-option label="专题论坛" value="专题论坛" />
                <el-option label="闭幕式" value="闭幕式" />
              </el-select>
            </div>
          </div>

          <!-- 议题输入框 - 只在特定阶段显示 -->
          <div class="form-row" v-if="shouldShowTopicInput">
            <div class="form-item full-width">
              <div class="form-label">议题</div>
              <el-input
                v-model="agendaForm.topic"
                type="textarea"
                :rows="2"
                class="form-input"
                placeholder="输入议题内容/演讲题目"
              />
            </div>
          </div>
        </div>

        <div class="guest-section">
          <div class="guest-header">
            <span class="guest-title">{{ guestLabel }}</span>
            <el-button type="primary" link class="add-guest-btn" @click="addGuest">
              <el-icon><Plus /></el-icon> 添加人物
            </el-button>
          </div>

          <!-- 开幕致辞：致辞嘉宾列表（文本形式） -->
          <div v-if="agendaForm.stage === '开幕致辞'" class="speaker-details-section">
            <div
              v-for="(detail, detailIdx) in agendaForm.speakerDetails"
              :key="detailIdx"
              class="speaker-detail-item"
            >
              <div class="speaker-detail-row">
                <el-input
                  v-model="agendaForm.speakerDetails[detailIdx]"
                  placeholder="例如：王远航（海港能源科技有限公司/董事长）"
                  class="speaker-detail-input"
                />
                <el-button
                  type="danger"
                  link
                  class="remove-detail-btn"
                  @click="removeSpeakerDetail(detailIdx)"
                >
                  <el-icon><Delete /></el-icon>
                </el-button>
              </div>
            </div>
            <el-button type="primary" link class="add-detail-btn" @click="addSpeakerDetail">
              <el-icon><Plus /></el-icon> 添加致辞嘉宾
            </el-button>
          </div>

          <!-- 主题演讲/专题论坛：演讲嘉宾 -->
          <div
            v-else-if="agendaForm.stage === '主题演讲' || agendaForm.stage === '专题论坛'"
            class="speaker-section"
          >
            <div
              v-for="(speaker, speakerIdx) in agendaForm.speakers"
              :key="speakerIdx"
              class="speaker-item"
            >
              <div class="speaker-row">
                <el-input
                  v-model="agendaForm.speakers[speakerIdx]"
                  placeholder="例如：徐祖远（交通运输部原副部长）"
                  class="speaker-input"
                />
                <el-button
                  type="danger"
                  link
                  class="remove-speaker-btn"
                  @click="removeSpeaker(speakerIdx)"
                >
                  <el-icon><Delete /></el-icon>
                </el-button>
              </div>
            </div>
            <el-button type="primary" link class="add-speaker-btn" @click="addSpeaker">
              <el-icon><Plus /></el-icon> 添加演讲嘉宾
            </el-button>
          </div>

          <!-- 圆桌讨论：对话嘉宾（带公司/职务） -->
          <div v-else-if="agendaForm.stage === '圆桌讨论'">
            <div v-for="(guest, guestIdx) in agendaForm.guests" :key="guestIdx" class="guest-card">
              <div class="guest-card-header">
                <el-input v-model="guest.name" placeholder="姓名" class="guest-name-input" />
                <el-button
                  type="danger"
                  link
                  class="remove-guest-btn"
                  @click="removeGuest(guestIdx)"
                >
                  <el-icon><Delete /></el-icon> 移除
                </el-button>
              </div>

              <div class="guest-company-list">
                <div
                  v-for="(company, compIdx) in guest.companies"
                  :key="compIdx"
                  class="guest-company-item"
                >
                  <div class="company-row two-columns">
                    <el-input
                      v-model="company.department"
                      placeholder="公司部门"
                      class="company-input"
                    />
                    <div class="position-wrapper">
                      <el-input
                        v-model="company.position"
                        placeholder="职务"
                        class="position-input"
                      />
                      <el-button
                        type="danger"
                        link
                        class="remove-company-btn"
                        @click="removeCompany(guestIdx, compIdx)"
                      >
                        <el-icon><Delete /></el-icon>
                      </el-button>
                    </div>
                  </div>
                </div>
                <el-button
                  type="primary"
                  link
                  class="add-company-btn"
                  @click="addCompany(guestIdx)"
                >
                  <el-icon><Plus /></el-icon> 添加公司/职务
                </el-button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <el-button class="btn-cancel" @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" class="btn-confirm" @click="saveAgenda">确定</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Edit, Delete, DataAnalysis, Plus, Clock } from '@element-plus/icons-vue'
import ConferenceNavigation from '@/components/ConferenceNavigation.vue'

interface MeetingItem {
  id: number
  index: number
  name: string
  location: string
  time: string
  status: '报名中' | '进行中' | '已结束'
}

interface CompanyItem {
  department: string
  position: string
}

interface Guest {
  name: string
  companies: CompanyItem[]
}

interface AgendaItem {
  id: number
  startTime: string
  endTime: string
  stage: string
  topic: string
  speakers?: string[]
  host?: string
  guests?: Guest[]
  speakerDetails?: string[]
}

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

const agendaList = ref<AgendaItem[]>([
  {
    id: 1,
    startTime: '08:30',
    endTime: '09:00',
    stage: '签到入场',
    topic: '签到入场',
    speakers: [],
  },
  {
    id: 2,
    startTime: '09:15',
    endTime: '09:50',
    stage: '开幕致辞',
    topic: '开幕致辞',
    speakerDetails: [
      '致辞嘉宾：王远航（海港能源科技有限公司/董事长）',
      '待定（上海国际航运发展促进协会领导致欢迎辞/处长）',
      '待定（上海组合港管理委员会办公室领导致辞）',
      '待定（中国船东协会会长致辞/会长）',
      '待定（浦东新区商务委（航运办）领导致辞）',
    ],
  },
  {
    id: 3,
    startTime: '09:50',
    endTime: '10:20',
    stage: '主题演讲',
    topic: '航海文化在船舶管理中的功能与实践',
    speakers: ['徐祖远（交通运输部原副部长、中国科协决策咨询首席专家）'],
  },
  {
    id: 4,
    startTime: '10:20',
    endTime: '10:40',
    stage: '圆桌讨论',
    topic: '航运减排路径探讨',
    host: '陈越洋（远洋航运集团副总裁）',
    guests: [
      {
        name: '王远航',
        companies: [{ department: '海港能源科技有限公司', position: '董事长' }],
      },
      {
        name: '李知行',
        companies: [{ department: '绿舟新能源研究院', position: '首席科学家' }],
      },
    ],
  },
])

// 判断是否需要显示议题输入框的阶段
const stagesWithTopic = ['主题演讲', '圆桌讨论', '专题论坛']

// 计算属性：是否显示议题输入框
const shouldShowTopicInput = computed(() => {
  return stagesWithTopic.includes(agendaForm.value.stage)
})

// 计算属性：嘉宾标签文字
const guestLabel = computed(() => {
  const labelMap: Record<string, string> = {
    开幕致辞: '致辞嘉宾',
    主题演讲: '演讲嘉宾',
    专题论坛: '演讲嘉宾',
    圆桌讨论: '对话嘉宾',
  }
  return labelMap[agendaForm.value.stage] || '嘉宾'
})

const getDotClass = (stage: string) => {
  const map: Record<string, string> = {
    签到入场: 'dot-gray',
    开幕致辞: 'dot-orange',
    主题演讲: 'dot-blue',
    圆桌讨论: 'dot-green',
  }
  return map[stage] || 'dot-gray'
}

const getTagClass = (stage: string) => {
  const map: Record<string, string> = {
    签到入场: 'tag-gray',
    开幕致辞: 'tag-orange',
    主题演讲: 'tag-blue',
    圆桌讨论: 'tag-green',
  }
  return map[stage] || 'tag-gray'
}

const selectedMeetingId = ref<number>(1)
const showAgendaView = ref(false)
const currentMeetingName = ref('')

const dialogVisible = ref(false)
const dialogTitle = ref('新增议程')
const editingAgendaId = ref<number | null>(null)

// 扩展表单数据结构
const agendaForm = ref({
  startTime: '',
  endTime: '',
  stage: '',
  topic: '',
  speakers: [] as string[],
  speakerDetails: [] as string[],
  host: '',
  guests: [] as Guest[],
})

// 阶段变更时的处理
const handleStageChange = (value: string) => {
  // 清空相关数据
  if (!stagesWithTopic.includes(value)) {
    agendaForm.value.topic = ''
  }

  // 根据阶段重置嘉宾数据结构
  if (value === '开幕致辞') {
    if (!agendaForm.value.speakerDetails.length) {
      agendaForm.value.speakerDetails = ['']
    }
    agendaForm.value.speakers = []
    agendaForm.value.guests = []
    agendaForm.value.host = ''
  } else if (value === '主题演讲' || value === '专题论坛') {
    if (!agendaForm.value.speakers.length) {
      agendaForm.value.speakers = ['']
    }
    agendaForm.value.speakerDetails = []
    agendaForm.value.guests = []
    agendaForm.value.host = ''
  } else if (value === '圆桌讨论') {
    if (!agendaForm.value.guests.length) {
      agendaForm.value.guests = [{ name: '', companies: [{ department: '', position: '' }] }]
    }
    agendaForm.value.speakers = []
    agendaForm.value.speakerDetails = []
  } else {
    // 其他阶段清空所有嘉宾数据
    agendaForm.value.speakers = []
    agendaForm.value.speakerDetails = []
    agendaForm.value.guests = []
    agendaForm.value.host = ''
  }
}

const handleMeetingChange = (meetingId: number) => {
  selectedMeetingId.value = meetingId
  showAgendaView.value = false
}

const handleEdit = (row: MeetingItem) => {
  currentMeetingName.value = row.name
  showAgendaView.value = true
}

const handleToggle = (row: MeetingItem) => {
  if (row.status === '报名中') {
    row.status = '进行中'
  } else if (row.status === '进行中') {
    row.status = '已结束'
  } else {
    row.status = '报名中'
  }
  ElMessage.success(`已切换“${row.name}”状态为 ${row.status}`)
}

const handleDelete = (row: MeetingItem) => {
  ElMessageBox.confirm(`确定删除会议“${row.name}”吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(() => {
      const index = meetings.value.findIndex((m) => m.id === row.id)
      if (index !== -1) {
        meetings.value.splice(index, 1)
        ElMessage.success('删除成功')
      }
    })
    .catch(() => {})
}

const formatGuests = (guests: Guest[]) => {
  return guests
    .map((g) => {
      const companyStrs = g.companies.map((c) => `${c.department}/${c.position}`).join('、')
      return `${g.name}（${companyStrs}）`
    })
    .join('；')
}

const handleExportPDF = () => {
  ElMessage.info('导出PDF功能开发中')
}

const handleAddAgenda = () => {
  dialogTitle.value = '新增议程'
  editingAgendaId.value = null
  agendaForm.value = {
    startTime: '',
    endTime: '',
    stage: '',
    topic: '',
    speakers: [],
    speakerDetails: [],
    host: '',
    guests: [],
  }
  dialogVisible.value = true
}

const handleEditAgenda = (item: AgendaItem) => {
  dialogTitle.value = '编辑议程'
  editingAgendaId.value = item.id

  agendaForm.value = {
    startTime: item.startTime,
    endTime: item.endTime,
    stage: item.stage,
    topic: item.topic || '',
    speakers: item.speakers ? [...item.speakers] : [],
    speakerDetails: item.speakerDetails ? [...item.speakerDetails] : [],
    host: item.host || '',
    guests: item.guests ? JSON.parse(JSON.stringify(item.guests)) : [],
  }

  // 确保每个阶段有至少一个输入框
  if (agendaForm.value.stage === '开幕致辞' && agendaForm.value.speakerDetails.length === 0) {
    agendaForm.value.speakerDetails = ['']
  }
  if (
    (agendaForm.value.stage === '主题演讲' || agendaForm.value.stage === '专题论坛') &&
    agendaForm.value.speakers.length === 0
  ) {
    agendaForm.value.speakers = ['']
  }
  if (agendaForm.value.stage === '圆桌讨论' && agendaForm.value.guests.length === 0) {
    agendaForm.value.guests = [{ name: '', companies: [{ department: '', position: '' }] }]
  }

  dialogVisible.value = true
}

const handleDeleteAgenda = (item: AgendaItem) => {
  ElMessageBox.confirm(`确定删除议程“${item.topic}”吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(() => {
      const index = agendaList.value.findIndex((a) => a.id === item.id)
      if (index !== -1) {
        agendaList.value.splice(index, 1)
        ElMessage.success('删除成功')
      }
    })
    .catch(() => {})
}

// 致辞嘉宾相关方法
const addSpeakerDetail = () => {
  agendaForm.value.speakerDetails.push('')
}

const removeSpeakerDetail = (index: number) => {
  agendaForm.value.speakerDetails.splice(index, 1)
}

// 演讲嘉宾相关方法
const addSpeaker = () => {
  agendaForm.value.speakers.push('')
}

const removeSpeaker = (index: number) => {
  agendaForm.value.speakers.splice(index, 1)
}

// 对话嘉宾相关方法
const addGuest = () => {
  agendaForm.value.guests.push({ name: '', companies: [{ department: '', position: '' }] })
}

const removeGuest = (index: number) => {
  agendaForm.value.guests.splice(index, 1)
}

const addCompany = (guestIndex: number) => {
  agendaForm.value.guests[guestIndex].companies.push({ department: '', position: '' })
}

const removeCompany = (guestIndex: number, companyIndex: number) => {
  agendaForm.value.guests[guestIndex].companies.splice(companyIndex, 1)
  if (agendaForm.value.guests[guestIndex].companies.length === 0) {
    agendaForm.value.guests[guestIndex].companies.push({ department: '', position: '' })
  }
}

const saveAgenda = () => {
  // 验证必填项
  if (!agendaForm.value.startTime || !agendaForm.value.endTime) {
    ElMessage.warning('请填写开始时间和结束时间')
    return
  }

  if (!agendaForm.value.stage) {
    ElMessage.warning('请选择议程阶段')
    return
  }

  // 如果需要显示议题输入框，则验证议题是否填写
  if (shouldShowTopicInput.value && !agendaForm.value.topic) {
    ElMessage.warning('请填写议题内容')
    return
  }

  // 验证嘉宾数据
  if (agendaForm.value.stage === '开幕致辞') {
    const validDetails = agendaForm.value.speakerDetails.filter((d) => d.trim())
    if (validDetails.length === 0) {
      ElMessage.warning('请至少填写一位致辞嘉宾')
      return
    }
  } else if (agendaForm.value.stage === '主题演讲' || agendaForm.value.stage === '专题论坛') {
    const validSpeakers = agendaForm.value.speakers.filter((s) => s.trim())
    if (validSpeakers.length === 0) {
      ElMessage.warning('请至少填写一位演讲嘉宾')
      return
    }
  } else if (agendaForm.value.stage === '圆桌讨论') {
    const validGuests = agendaForm.value.guests.filter((g) => g.name.trim())
    if (validGuests.length === 0) {
      ElMessage.warning('请至少填写一位对话嘉宾')
      return
    }
  }

  const newAgendaItem: AgendaItem = {
    id: editingAgendaId.value || Math.max(...agendaList.value.map((a) => a.id), 0) + 1,
    startTime: agendaForm.value.startTime,
    endTime: agendaForm.value.endTime,
    stage: agendaForm.value.stage,
    topic: agendaForm.value.topic,
    speakers: agendaForm.value.speakers.filter((s) => s.trim()),
    speakerDetails: agendaForm.value.speakerDetails.filter((d) => d.trim()),
    host: agendaForm.value.host,
    guests: agendaForm.value.guests.filter((g) => g.name.trim()),
  }

  if (editingAgendaId.value) {
    const index = agendaList.value.findIndex((a) => a.id === editingAgendaId.value)
    if (index !== -1) {
      agendaList.value[index] = newAgendaItem
      ElMessage.success('编辑成功')
    }
  } else {
    agendaList.value.push(newAgendaItem)
    ElMessage.success('新增成功')
  }
  dialogVisible.value = false
}
</script>

<style scoped>
.agenda-page {
  min-height: 100vh;
  background: #f5f7fa;
}

.content-card {
  padding: 10px;
  border-radius: 8px;
  box-shadow: none;
  overflow: hidden;
}

.table-section {
  background: #ffffff;
  padding: 20px;
}

.section-header {
  margin-bottom: 16px;
}

.section-title {
  font-size: 16px;
  font-weight: 500;
  color: #333;
}

.meeting-table {
  --el-table-header-text-color: #333;
  --el-table-header-bg-color: #f0f7ff;
}
.meeting-table :deep(.el-table__header th) {
  background: #f0f7ff !important;
  color: #333 !important;
  font-weight: 500;
}

.status-tag-table {
  border: none;
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 4px;
}
.status-tag-table.报名中 {
  background-color: #e6f7ef;
  color: #00b42a;
}
.status-tag-table.进行中 {
  background-color: #fff5e6;
  color: #ff7d00;
}
.status-tag-table.已结束 {
  background-color: #f5f7fa;
  color: #909399;
}

.btn-edit {
  color: #0057b8;
}
.btn-switch {
  color: #00b42a;
}
.btn-delete {
  color: #f53f3f;
}

/* ========== 议程安排样式 - 卡片式时间轴 ========== */
.agenda-section {
  background: #ffffff;
}

.agenda-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 24px;
  border-bottom: 1px solid #e5e7eb;
}

.agenda-title {
  font-size: 16px;
  font-weight: 400;
  color: #1a2c3e;
}

.agenda-actions {
  display: flex;
  gap: 12px;
}

.btn-export-pdf {
  background: #4ade80;
  border: none;
  border-radius: 20px;
  padding: 8px 16px;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.btn-export-pdf:hover {
  background: #22c55e;
  color: #14532d;
}

.btn-new-meeting {
  background: #1e40af;
  border: none;
  color: #ffffff;
  border-radius: 20px;
  padding: 8px 16px;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.btn-new-meeting:hover {
  background: #1e3a8a;
  color: #ffffff;
}

/* 垂直时间轴布局 */
.vertical-timeline-wrapper {
  padding: 24px 24px 32px 24px;
  display: flex;
  justify-content: center;
}

.timeline-items {
  max-width: 1000px;
  margin: 0;
}

.timeline-row {
  display: flex;
  margin-bottom: 32px;
}

.timeline-row:last-child {
  margin-bottom: 0;
}

/* 左侧圆点连线区域 */
.timeline-left {
  width: 40px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
}

.timeline-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #9ca3af;
  border: 2px solid #ffffff;
  box-shadow: 0 0 0 2px #e5e7eb;
  z-index: 2;
  margin-top: 8px;
}

.timeline-line {
  position: absolute;
  top: 24px;
  width: 2px;
  height: calc(100% + 8px);
  background: #e5e7eb;
  z-index: 1;
}

.dot-gray {
  background: #9ca3af;
}
.dot-orange {
  background: #f97316;
}
.dot-blue {
  background: #3b82f6;
}
.dot-green {
  background: #22c55e;
}

/* 议程卡片 */
.agenda-card {
  flex: 1;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 20px 24px;
  transition: box-shadow 0.2s;
  position: relative;
  min-width: 900px;
}

.agenda-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.card-time {
  font-size: 14px;
  font-weight: 500;
  color: #6b7280;
  margin-bottom: 14px;
  padding-bottom: 10px;
  border-bottom: 1px dashed #e5e7eb;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 14px;
}

.card-header-left {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
}

.stage-tag {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.tag-gray {
  background: #f3f4f6;
  color: #6b7280;
}
.tag-orange {
  background: #fff7ed;
  color: #f97316;
}
.tag-blue {
  background: #eff6ff;
  color: #3b82f6;
}
.tag-green {
  background: #f0fdf4;
  color: #22c55e;
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
}

.card-actions {
  display: flex;
  gap: 12px;
  flex-shrink: 0;
}

.action-edit {
  color: #2563eb;
  padding: 0;
  font-size: 13px;
}

.action-edit:hover {
  color: #1d4ed8;
}

.action-delete {
  color: #ef4444;
  padding: 0;
  font-size: 13px;
}

.action-delete:hover {
  color: #dc2626;
}

.card-content {
  font-size: 14px;
  color: #6b7280;
  line-height: 1.7;
}

.content-line {
  margin-top: 8px;
}

.content-line:first-child {
  margin-top: 0;
}

.content-label {
  color: #6b7280;
}

.content-text {
  color: #4b5563;
}

.empty-agenda {
  padding: 60px 0;
  text-align: center;
}

/* ========== 弹窗样式 ========== */
.agenda-dialog :deep(.el-dialog) {
  border-radius: 12px;
  background: #f5f7fa;
}

.agenda-dialog :deep(.el-dialog__header) {
  background: #ffffff;
  border-bottom: 1px solid #eef2f6;
  padding: 20px 24px;
  border-radius: 12px 12px 0 0;
}

.agenda-dialog :deep(.el-dialog__title) {
  font-size: 18px;
  font-weight: 600;
  color: #1a2c3e;
}

.agenda-dialog :deep(.el-dialog__body) {
  padding: 0;
  background: #f5f7fa;
}

.agenda-dialog :deep(.el-dialog__footer) {
  background: #ffffff;
  border-top: 1px solid #eef2f6;
  padding: 16px 24px;
  border-radius: 0 0 12px 12px;
}

.dialog-content {
  background: #f5f7fa;
  padding: 20px 24px;
}

.form-section {
  background: #ffffff;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 16px;
}

.form-row {
  margin-bottom: 20px;
}

.form-row:last-child {
  margin-bottom: 0;
}

.form-row.two-columns {
  display: flex;
  gap: 16px;
}

.form-row.two-columns .form-item {
  flex: 1;
}

.form-item {
  margin-bottom: 0;
  display: flex;
  flex-wrap: nowrap;
  align-items: center;
}

.form-item.full-width {
  width: 100%;
}

.form-label {
  font-size: 14px;
  font-weight: 500;
  width: 80px;
  color: #1f2937;
  margin-bottom: 8px;
  margin-right: 8px;
  display: block;
}

.form-item.required .form-label::before {
  content: '*';
  color: #ef4444;
  margin-right: 4px;
}

.form-input {
  width: 100%;
}

.time-picker {
  width: 100%;
}

.time-picker :deep(.el-input__wrapper) {
  width: 100%;
}

.form-input :deep(.el-input__wrapper),
.form-input :deep(.el-textarea__inner),
.form-input :deep(.el-select .el-input__wrapper) {
  border-radius: 8px;
  border-color: #e5e7eb;
  box-shadow: none;
}

.form-input :deep(.el-input__wrapper:hover),
.form-input :deep(.el-textarea__inner:hover) {
  border-color: #cbd5e1;
}

.form-input :deep(.el-input__wrapper.is-focus),
.form-input :deep(.el-textarea__inner:focus) {
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
}

.guest-section {
  background: #ffffff;
  border-radius: 12px;
  padding: 20px;
}

.guest-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 16px;
  margin-bottom: 16px;
  border-bottom: 1px solid #eef2f6;
}

.guest-title {
  font-size: 15px;
  font-weight: 600;
  color: #1f2937;
}

.add-guest-btn {
  font-size: 14px;
  color: #3b82f6;
  padding: 0;
}

.add-guest-btn:hover {
  color: #2563eb;
}

/* 致辞嘉宾样式 */
.speaker-details-section {
  margin-top: 8px;
}

.speaker-detail-item {
  margin-bottom: 12px;
}

.speaker-detail-row {
  display: flex;
  gap: 12px;
  align-items: center;
}

.speaker-detail-input {
  flex: 1;
}

.speaker-detail-input :deep(.el-input__wrapper) {
  border-radius: 8px;
  background: #ffffff;
}

.remove-detail-btn {
  padding: 0;
  font-size: 16px;
  color: #ef4444;
  flex-shrink: 0;
}

.remove-detail-btn:hover {
  color: #dc2626;
}

.add-detail-btn {
  font-size: 13px;
  color: #3b82f6;
  padding: 8px 0 0 0;
  margin-top: 8px;
}

.add-detail-btn:hover {
  color: #2563eb;
}

/* 演讲嘉宾样式 */
.speaker-section {
  margin-top: 8px;
}

.speaker-item {
  margin-bottom: 12px;
}

.speaker-row {
  display: flex;
  gap: 12px;
  align-items: center;
}

.speaker-input {
  flex: 1;
}

.speaker-input :deep(.el-input__wrapper) {
  border-radius: 8px;
  background: #ffffff;
}

.remove-speaker-btn {
  padding: 0;
  font-size: 16px;
  color: #ef4444;
  flex-shrink: 0;
}

.remove-speaker-btn:hover {
  color: #dc2626;
}

.add-speaker-btn {
  font-size: 13px;
  color: #3b82f6;
  padding: 8px 0 0 0;
  margin-top: 8px;
}

.add-speaker-btn:hover {
  color: #2563eb;
}

/* 对话嘉宾样式 */
.guest-card {
  background: #f8fafc;
  border-radius: 10px;
  padding: 16px;
  margin-bottom: 16px;
}

.guest-card:last-child {
  margin-bottom: 0;
}

.guest-card-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.guest-name-input {
  flex: 1;
}

.guest-name-input :deep(.el-input__wrapper) {
  border-radius: 8px;
  background: #ffffff;
}

.remove-guest-btn {
  font-size: 14px;
  color: #ef4444;
  padding: 0;
}

.remove-guest-btn:hover {
  color: #dc2626;
}

.guest-company-list {
  padding-left: 0;
}

.guest-company-item {
  margin-bottom: 12px;
}

.guest-company-item:last-child {
  margin-bottom: 0;
}

.company-row.two-columns {
  display: flex;
  gap: 12px;
  align-items: center;
}

.company-input {
  flex: 1;
}

.company-input :deep(.el-input__wrapper) {
  border-radius: 8px;
  background: #ffffff;
}

.position-wrapper {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 8px;
}

.position-input {
  flex: 1;
}

.position-input :deep(.el-input__wrapper) {
  border-radius: 8px;
  background: #ffffff;
}

.remove-company-btn {
  padding: 0;
  font-size: 16px;
  color: #ef4444;
  flex-shrink: 0;
}

.remove-company-btn:hover {
  color: #dc2626;
}

.add-company-btn {
  font-size: 13px;
  color: #3b82f6;
  padding: 8px 0 0 0;
  margin-top: 8px;
}

.add-company-btn:hover {
  color: #2563eb;
}

.dialog-footer {
  display: flex;
  justify-content: center;
  gap: 16px;
}

.btn-cancel {
  min-width: 100px;
  border-radius: 8px;
  border-color: #3b82f6;
  color: #3b82f6;
  background: #ffffff;
}

.btn-cancel:hover {
  border-color: #2563eb;
  color: #2563eb;
  background: #eff6ff;
}

.btn-confirm {
  min-width: 100px;
  border-radius: 8px;
  background: #3b82f6;
  border-color: #3b82f6;
}

.btn-confirm:hover {
  background: #2563eb;
  border-color: #2563eb;
}
</style>
