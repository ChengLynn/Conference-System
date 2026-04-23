<template>
  <!-- 通用导航组件 -->
  <ConferenceNavigation
    :currentPage="'会议赞助'"
    :meetings="meetings"
    @meeting-change="handleMeetingChange"
  />
  <div class="design-container">
    <!-- 二级导航栏 -->
    <div class="sub-tabs">
      <div
        class="sub-tab-item"
        :class="{ active: activeTab === 'sponsor' }"
        @click="activeTab = 'sponsor'"
      >
        赞助商管理
      </div>
      <div
        class="sub-tab-item"
        :class="{ active: activeTab === 'project' }"
        @click="activeTab = 'project'"
      >
        赞助项目
      </div>
    </div>

    <!-- 赞助商管理视图 -->
    <div v-if="activeTab === 'sponsor'" class="sponsor-main">
      <div class="sponsor-list-section">
        <div class="section-header">
          <span class="section-title">赞助商管理</span>
          <el-button type="primary" size="small" @click="handleAddSponsor"> +新增赞助商 </el-button>
        </div>

        <!-- 统计卡片 -->
        <div class="stats-cards">
          <div class="stat-card">
            <div class="stat-value">{{ sponsorStats.total }}</div>
            <div class="stat-label">赞助商总数</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">¥{{ formatNumber(sponsorStats.totalAmount) }}</div>
            <div class="stat-label">赞助总额</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">{{ sponsorStats.confirmed }}</div>
            <div class="stat-label">已确认赞助</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">{{ sponsorStats.projectCount }}</div>
            <div class="stat-label">关联项目数</div>
          </div>
        </div>

        <!-- 赞助商表格 -->
        <div class="table-wrapper">
          <el-table :data="filteredSponsorList" stripe border style="width: 100%">
            <el-table-column type="index" label="#" width="60" align="center" />
            <el-table-column prop="name" label="赞助商名称" min-width="150" show-overflow-tooltip />
            <el-table-column prop="sponsorCount" label="赞助次数" width="100" align="center" />
            <el-table-column prop="projects" label="赞助项目" min-width="180">
              <template #default="{ row }">
                <div class="project-tags">
                  <el-tag
                    v-for="(proj, idx) in row.projects"
                    :key="idx"
                    size="small"
                    :type="proj.status === '已售' ? 'success' : 'warning'"
                    style="margin: 2px"
                  >
                    {{ proj.name }}
                  </el-tag>
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="tradeStatus" label="交易状态" width="100" align="center">
              <template #default="{ row }">
                <el-tag :type="row.tradeStatus === '已售' ? 'success' : 'warning'" size="small">
                  {{ row.tradeStatus }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="amount" label="赞助金额（元）" width="140" align="right">
              <template #default="{ row }"> ¥{{ formatNumber(row.amount) }} </template>
            </el-table-column>
            <el-table-column prop="contactPerson" label="联系人" width="120" />
            <el-table-column prop="contactPhone" label="电话" width="130" />
            <el-table-column prop="projectContact" label="项目对接" width="120" />
            <el-table-column label="操作" min-width="120" align="center" fixed="right">
              <template #default="{ row }">
                <el-button link type="primary" size="small" @click="handleEditSponsor(row)">
                  <el-icon><Edit /></el-icon> 编辑
                </el-button>
                <el-button link type="danger" size="small" @click="handleDeleteSponsor(row)">
                  <el-icon><Delete /></el-icon> 删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>

        <!-- 分页 -->
        <div class="pagination-wrapper">
          <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :total="filteredSponsorList.length"
            :page-sizes="[10, 20, 50, 100]"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
      </div>
    </div>

    <!-- 赞助项目视图 -->
    <div v-if="activeTab === 'project'" class="project-main">
      <div class="sponsor-project-section">
        <div class="section-header">
          <span class="section-title">赞助项目</span>
          <div class="project-stats">
            <span class="stat-badge">已售 {{ soldCount }}/{{ totalProjects }}</span>
            <span class="stat-badge">项目总金额 ¥{{ formatNumber(totalProjectAmount) }}</span>
            <el-button type="primary" size="small" @click="handleAddProject"> +新增项目 </el-button>
          </div>
        </div>

        <!-- 赞助项目列表 - 卡片式布局（按照图片样式） -->
        <div class="project-list">
          <div
            v-for="project in projectList"
            :key="project.id"
            class="project-card"
            :class="{
              'sold-out': project.status === '已售',
              negotiating: project.status === '洽谈中',
            }"
          >
            <div class="project-header">
              <div class="project-title">
                <span class="project-name">{{ project.name }}</span>
                <span class="project-exclusive" v-if="project.exclusive">独家</span>
              </div>
              <div class="project-status">
                <el-tag :type="project.status === '已售' ? 'success' : 'warning'" size="small">
                  {{ project.status }}
                </el-tag>
              </div>
            </div>
            <div class="project-price">¥{{ formatNumber(project.price) }}</div>

            <!-- 赞助商信息 -->
            <div class="project-sponsors" v-if="project.sponsors && project.sponsors.length > 0">
              <div v-for="sponsor in project.sponsors" :key="sponsor.id" class="sponsor-item">
                <span class="sponsor-name">{{ sponsor.name }}</span>
                <span class="sponsor-status" :class="sponsor.status">
                  {{ sponsor.status }}
                </span>
              </div>
            </div>

            <!-- 权益明细 -->
            <div class="project-benefits">
              <div class="benefits-title">权益明细</div>
              <ul class="benefits-list">
                <li v-for="(benefit, idx) in project.benefits" :key="idx">{{ benefit }}</li>
              </ul>
            </div>

            <div class="project-actions">
              <el-button link type="primary" size="small" @click="handleEditProject(project)">
                <el-icon><Edit /></el-icon> 编辑
              </el-button>
              <el-button link type="danger" size="small" @click="handleDeleteProject(project)">
                <el-icon><Delete /></el-icon> 删除
              </el-button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 新增/编辑赞助商弹窗 -->
    <el-dialog v-model="sponsorDialogVisible" :title="sponsorDialogTitle" width="700px">
      <el-form :model="sponsorForm" :rules="sponsorRules" ref="sponsorFormRef" label-width="120px">
        <el-form-item label="赞助企业名称" prop="name">
          <el-select
            v-model="sponsorForm.name"
            placeholder="可选择历史赞助商"
            filterable
            allow-create
            style="width: 100%"
          >
            <el-option v-for="item in historySponsors" :key="item" :label="item" :value="item" />
          </el-select>
          <div class="form-tip">支持输入新名称</div>
        </el-form-item>

        <el-form-item label="赞助金额（元）" prop="amount">
          <el-input-number
            v-model="sponsorForm.amount"
            :min="0"
            :precision="2"
            style="width: 100%"
          />
        </el-form-item>

        <el-form-item label="联系人" prop="contactPerson">
          <el-input v-model="sponsorForm.contactPerson" placeholder="请输入赞助企业联系人" />
        </el-form-item>

        <el-form-item label="电话" prop="contactPhone">
          <el-input v-model="sponsorForm.contactPhone" placeholder="请输入赞助企业联系人电话" />
        </el-form-item>

        <el-form-item label="项目对接人" prop="projectContact">
          <el-input v-model="sponsorForm.projectContact" placeholder="请输入公司对接人员" />
        </el-form-item>

        <!-- 赞助项目 - 多选 -->
        <el-form-item label="赞助项目" prop="projectIds">
          <el-select
            v-model="sponsorForm.projectIds"
            multiple
            placeholder="请选择赞助项目"
            style="width: 100%"
            @change="handleProjectChange"
          >
            <el-option
              v-for="project in availableProjects"
              :key="project.id"
              :label="project.name"
              :value="project.id"
            />
          </el-select>
        </el-form-item>

        <!-- 交易状态 - 根据选择的赞助项目动态显示 -->
        <el-form-item
          label="交易状态"
          prop="projectStatuses"
          v-if="sponsorForm.projectIds.length > 0"
        >
          <div class="project-status-list">
            <div
              v-for="projectId in sponsorForm.projectIds"
              :key="projectId"
              class="project-status-item"
            >
              <span class="project-name-label">{{ getProjectName(projectId) }}</span>
              <el-select
                v-model="sponsorForm.projectStatuses[projectId]"
                placeholder="请选择出售状态"
                style="width: 200px"
                @change="handleProjectStatusChange"
              >
                <el-option label="已售" value="已售" />
                <el-option label="洽谈中" value="洽谈中" />
              </el-select>
            </div>
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="sponsorDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmSaveSponsor">确定</el-button>
      </template>
    </el-dialog>

    <!-- 新增/编辑赞助项目弹窗 -->
    <el-dialog v-model="projectDialogVisible" :title="projectDialogTitle" width="700px">
      <el-form :model="projectForm" :rules="projectRules" ref="projectFormRef" label-width="120px">
        <el-form-item label="项目名称" prop="name">
          <el-input v-model="projectForm.name" placeholder="请输入项目名称" />
        </el-form-item>
        <el-form-item label="项目金额（元）" prop="price">
          <el-input-number
            v-model="projectForm.price"
            :min="0"
            :precision="2"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="是否独家" prop="exclusive">
          <el-switch v-model="projectForm.exclusive" active-text="独家" inactive-text="非独家" />
        </el-form-item>
        <el-form-item label="项目状态" prop="status">
          <el-select v-model="projectForm.status" placeholder="请选择项目状态" style="width: 100%">
            <el-option label="已售" value="已售" />
            <el-option label="洽谈中" value="洽谈中" />
          </el-select>
        </el-form-item>
        <el-form-item label="权益明细" prop="benefits">
          <div class="benefits-editor">
            <div v-for="(benefit, idx) in projectForm.benefits" :key="idx" class="benefit-item">
              <el-input
                v-model="projectForm.benefits[idx]"
                placeholder="请输入权益内容"
                style="width: 90%"
              />
              <el-button link type="danger" @click="removeBenefit(idx)" style="margin-left: 8px">
                <el-icon><Delete /></el-icon>
              </el-button>
            </div>
            <el-button type="primary" link @click="addBenefit">
              <el-icon><Plus /></el-icon> 添加权益
            </el-button>
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="projectDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmSaveProject">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Edit, Delete, Plus } from '@element-plus/icons-vue'
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

// 赞助项目类型
interface ProjectItem {
  id: number
  name: string
  price: number
  exclusive: boolean
  status: '已售' | '洽谈中'
  benefits: string[]
  sponsors?: SponsorSimple[]
}

// 赞助商简单类型
interface SponsorSimple {
  id: number
  name: string
  status: string
}

// 赞助商类型
interface SponsorItem {
  id: number
  name: string
  sponsorCount: number
  projects: { id: number; name: string; status: string }[]
  tradeStatus: string
  amount: number
  contactPerson: string
  contactPhone: string
  projectContact: string
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

// 当前激活的标签页
const activeTab = ref<'sponsor' | 'project'>('sponsor')

// 当前会议名称
const currentConferenceName = ref('2025第六届上海国际船舶管理论坛')

// 赞助项目列表（基于图片数据）
const projectList = ref<ProjectItem[]>([
  {
    id: 1,
    name: '特别赞助',
    price: 50000,
    exclusive: true,
    status: '已售',
    benefits: [
      '主背景板LOGO展示（最大尺寸）',
      '开幕致辞环节口播鸣谢',
      '参会资料袋内广告位',
      '展台位置×2（优先选择）',
      '官网/小程序Banner展示',
      'VIP晚宴嘉宾席位×2',
    ],
    sponsors: [{ id: 1, name: '海港能源科技有限公司', status: '已售' }],
  },
  {
    id: 2,
    name: '晚宴赞助',
    price: 30000,
    exclusive: true,
    status: '洽谈中',
    benefits: [
      '晚宴现场背景板LOGO展示',
      '晚宴主持人口播鸣谢',
      '餐桌桌卡品牌LOGO展示',
      '每桌桌卡品牌LOGO展示',
      'VIP晚宴嘉宾席位×4',
    ],
    sponsors: [],
  },
  {
    id: 3,
    name: '自助午餐赞助',
    price: 20000,
    exclusive: true,
    status: '已售',
    benefits: ['午餐区域LOGO展示易拉宝×2', '参会资料袋内广告位', '展台位置×1'],
    sponsors: [{ id: 1, name: '海港能源科技有限公司', status: '已售' }],
  },
  {
    id: 4,
    name: '茶歇赞助',
    price: 15000,
    exclusive: true,
    status: '已售',
    benefits: ['茶歇区域LOGO展示易拉宝×2', '茶歇台桌卡品牌LOGO展示', '展台位置×1'],
    sponsors: [],
  },
  {
    id: 5,
    name: '展台赞助',
    price: 2000,
    exclusive: false,
    status: '已售',
    benefits: [
      '标准展台位置×1（3m×3m）',
      '展位电源/网络接口',
      '参会资料袋内传单',
      '官网合作伙伴LOGO展示',
    ],
    sponsors: [
      { id: 1, name: '海港能源科技有限公司', status: '已售' },
      { id: 2, name: '远洋航运集团', status: '洽谈中' },
    ],
  },
])

// 赞助商列表（基于图片数据）
const sponsorList = ref<SponsorItem[]>([
  {
    id: 1,
    name: '华东航运',
    sponsorCount: 1,
    projects: [
      { id: 1, name: '特别赞助', status: '已售' },
      { id: 5, name: '展台赞助', status: '已售' },
    ],
    tradeStatus: '已售',
    amount: 50000,
    contactPerson: '王远航',
    contactPhone: '13800001111',
    projectContact: '王助理',
  },
  {
    id: 2,
    name: '远洋物流',
    sponsorCount: 2,
    projects: [{ id: 4, name: '茶歇赞助', status: '已售' }],
    tradeStatus: '已售',
    amount: 20000,
    contactPerson: '孙启航',
    contactPhone: '13800001111',
    projectContact: '赵助理',
  },
  {
    id: 3,
    name: '港口集团',
    sponsorCount: 3,
    projects: [{ id: 5, name: '展台赞助', status: '已售' }],
    tradeStatus: '已售',
    amount: 1000,
    contactPerson: '陈越洋',
    contactPhone: '13800001111',
    projectContact: '孙助理',
  },
  {
    id: 4,
    name: '远洋航运集团',
    sponsorCount: 0,
    projects: [{ id: 5, name: '展台赞助', status: '洽谈中' }],
    tradeStatus: '洽谈中',
    amount: 1000,
    contactPerson: '林海峰',
    contactPhone: '13800001111',
    projectContact: '王助理',
  },
  {
    id: 5,
    name: '绿舟新能源研究院',
    sponsorCount: 0,
    projects: [],
    tradeStatus: '洽谈中',
    amount: 0,
    contactPerson: '韩冰洋',
    contactPhone: '13800001111',
    projectContact: '',
  },
  {
    id: 6,
    name: '深蓝智航数字科技',
    sponsorCount: 0,
    projects: [],
    tradeStatus: '洽谈中',
    amount: 0,
    contactPerson: '杨帆',
    contactPhone: '13800001111',
    projectContact: '',
  },
  {
    id: 7,
    name: '海港能源科技有限公司',
    sponsorCount: 3,
    projects: [
      { id: 1, name: '特别赞助', status: '已售' },
      { id: 3, name: '自助午餐赞助', status: '已售' },
      { id: 5, name: '展台赞助', status: '已售' },
    ],
    tradeStatus: '已售',
    amount: 72000,
    contactPerson: '王远航',
    contactPhone: '13800001111',
    projectContact: '王助理',
  },
])

// 历史赞助商列表
const historySponsors = ref([
  '海港能源科技有限公司',
  '华东航运',
  '远洋物流',
  '港口集团',
  '远洋航运集团',
  '绿舟新能源研究院',
  '深蓝智航数字科技',
])

// 计算属性
const totalProjects = computed(() => projectList.value.length)
const soldCount = computed(() => projectList.value.filter((p) => p.status === '已售').length)
const totalProjectAmount = computed(() => projectList.value.reduce((sum, p) => sum + p.price, 0))

const sponsorStats = computed(() => ({
  total: sponsorList.value.length,
  totalAmount: sponsorList.value.reduce((sum, s) => sum + s.amount, 0),
  confirmed: sponsorList.value.filter((s) => s.tradeStatus === '已售').length,
  projectCount: sponsorList.value.reduce((sum, s) => sum + s.projects.length, 0),
}))

const availableProjects = computed(() => projectList.value)

// 筛选和分页
const searchKeyword = ref('')
const currentPage = ref(1)
const pageSize = ref(10)

const filteredSponsorList = computed(() => {
  let list = [...sponsorList.value]
  if (searchKeyword.value) {
    list = list.filter((s) => s.name.includes(searchKeyword.value))
  }
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return list.slice(start, end)
})

// 赞助商弹窗
const sponsorDialogVisible = ref(false)
const sponsorDialogTitle = ref('新增赞助商')
const editingSponsorId = ref<number | null>(null)
const sponsorFormRef = ref()
const sponsorForm = ref({
  name: '',
  amount: 0,
  contactPerson: '',
  contactPhone: '',
  projectContact: '',
  projectIds: [] as number[], // 选中的项目ID列表
  projectStatuses: {} as Record<number, string>, // 每个项目的交易状态
})

const sponsorRules = {
  name: [{ required: true, message: '请输入赞助企业名称' }],
  amount: [{ required: true, message: '请输入赞助金额' }],
  contactPerson: [{ required: true, message: '请输入联系人' }],
  contactPhone: [{ required: true, message: '请输入联系电话' }],
}
// 获取项目名称
const getProjectName = (projectId: number) => {
  const project = projectList.value.find((p) => p.id === projectId)
  return project?.name || ''
}

// 处理赞助项目变化
const handleProjectChange = (selectedIds: number[]) => {
  // 初始化新选中项目的状态
  const newStatuses: Record<number, string> = {}
  selectedIds.forEach((id) => {
    // 如果已有状态则保留，否则默认为'洽谈中'
    newStatuses[id] = sponsorForm.value.projectStatuses[id] || '洽谈中'
  })
  sponsorForm.value.projectStatuses = newStatuses
}

// 处理项目状态变化
const handleProjectStatusChange = () => {
  // 可以在这里添加额外的逻辑，比如更新总金额等
  console.log('项目状态已更新')
}
// 赞助项目弹窗
const projectDialogVisible = ref(false)
const projectDialogTitle = ref('新增赞助项目')
const editingProjectId = ref<number | null>(null)
const projectFormRef = ref()
const projectForm = ref({
  name: '',
  price: 0,
  exclusive: false,
  status: '洽谈中' as '已售' | '洽谈中',
  benefits: [] as string[],
})

const projectRules = {
  name: [{ required: true, message: '请输入项目名称' }],
  price: [{ required: true, message: '请输入项目金额' }],
}

// 格式化数字
const formatNumber = (num: number) => {
  return num.toLocaleString()
}

// 会议操作
const handleMeetingChange = (meetingId: number) => {
  console.log('会议切换', meetingId)
  const meeting = meetings.value.find((m) => m.id === meetingId)
  if (meeting) {
    currentConferenceName.value = meeting.name
  }
}

const handleMeetingManage = () => {
  ElMessage.info('会议管理功能开发中')
}

// 新增赞助商时重置表单
const handleAddSponsor = () => {
  sponsorDialogTitle.value = '新增赞助商'
  editingSponsorId.value = null
  sponsorForm.value = {
    name: '',
    amount: 0,
    contactPerson: '',
    contactPhone: '',
    projectContact: '',
    projectIds: [],
    projectStatuses: {},
  }
  sponsorDialogVisible.value = true
}

// 编辑赞助商时初始化表单
const handleEditSponsor = (row: SponsorItem) => {
  sponsorDialogTitle.value = '编辑赞助商'
  editingSponsorId.value = row.id

  // 构建 projectIds 和 projectStatuses
  const projectIds = row.projects.map((p) => p.id)
  const projectStatuses: Record<number, string> = {}
  row.projects.forEach((p) => {
    projectStatuses[p.id] = p.status
  })

  sponsorForm.value = {
    name: row.name,
    amount: row.amount,
    contactPerson: row.contactPerson,
    contactPhone: row.contactPhone,
    projectContact: row.projectContact,
    projectIds: projectIds,
    projectStatuses: projectStatuses,
  }
  sponsorDialogVisible.value = true
}

const handleDeleteSponsor = (row: SponsorItem) => {
  ElMessageBox.confirm(`确定删除赞助商"${row.name}"吗？`, '提示', { type: 'warning' })
    .then(() => {
      const idx = sponsorList.value.findIndex((s) => s.id === row.id)
      if (idx !== -1) sponsorList.value.splice(idx, 1)
      ElMessage.success('删除成功')
    })
    .catch(() => {})
}

const confirmSaveSponsor = async () => {
  if (!sponsorFormRef.value) return
  await sponsorFormRef.value.validate((valid: boolean) => {
    if (valid) {
      // 构建项目列表，包含每个项目的状态
      const selectedProjects = sponsorForm.value.projectIds.map((id) => {
        const project = projectList.value.find((p) => p.id === id)
        return {
          id: id,
          name: project?.name || '',
          status: sponsorForm.value.projectStatuses[id] || '洽谈中',
        }
      })

      // 计算总赞助金额（各项目金额之和）
      const totalAmount = selectedProjects.reduce((sum, p) => {
        const project = projectList.value.find((proj) => proj.id === p.id)
        return sum + (project?.price || 0)
      }, 0)

      // 判断整体交易状态：如果所有项目都是已售，则整体为已售；否则为洽谈中
      const allSold =
        selectedProjects.length > 0 && selectedProjects.every((p) => p.status === '已售')
      const overallTradeStatus = allSold ? '已售' : '洽谈中'

      const newSponsor: SponsorItem = {
        id: editingSponsorId.value || Math.max(...sponsorList.value.map((s) => s.id), 0) + 1,
        name: sponsorForm.value.name,
        sponsorCount: selectedProjects.length,
        projects: selectedProjects,
        tradeStatus: overallTradeStatus,
        amount: sponsorForm.value.amount > 0 ? sponsorForm.value.amount : totalAmount,
        contactPerson: sponsorForm.value.contactPerson,
        contactPhone: sponsorForm.value.contactPhone,
        projectContact: sponsorForm.value.projectContact,
      }

      if (editingSponsorId.value) {
        const idx = sponsorList.value.findIndex((s) => s.id === editingSponsorId.value)
        if (idx !== -1) sponsorList.value[idx] = newSponsor
        ElMessage.success('编辑成功')
      } else {
        sponsorList.value.push(newSponsor)
        if (!historySponsors.value.includes(sponsorForm.value.name)) {
          historySponsors.value.push(sponsorForm.value.name)
        }
        ElMessage.success('新增成功')
      }
      sponsorDialogVisible.value = false
    }
  })
}

// 赞助项目操作
const handleAddProject = () => {
  projectDialogTitle.value = '新增赞助项目'
  editingProjectId.value = null
  projectForm.value = {
    name: '',
    price: 0,
    exclusive: false,
    status: '洽谈中',
    benefits: [],
  }
  projectDialogVisible.value = true
}

const handleEditProject = (row: ProjectItem) => {
  projectDialogTitle.value = '编辑赞助项目'
  editingProjectId.value = row.id
  projectForm.value = {
    name: row.name,
    price: row.price,
    exclusive: row.exclusive,
    status: row.status,
    benefits: [...row.benefits],
  }
  projectDialogVisible.value = true
}

const handleDeleteProject = (row: ProjectItem) => {
  ElMessageBox.confirm(`确定删除赞助项目"${row.name}"吗？`, '提示', { type: 'warning' })
    .then(() => {
      const idx = projectList.value.findIndex((p) => p.id === row.id)
      if (idx !== -1) projectList.value.splice(idx, 1)
      ElMessage.success('删除成功')
    })
    .catch(() => {})
}

const addBenefit = () => {
  projectForm.value.benefits.push('')
}

const removeBenefit = (idx: number) => {
  projectForm.value.benefits.splice(idx, 1)
}

const confirmSaveProject = async () => {
  if (!projectFormRef.value) return
  await projectFormRef.value.validate((valid: boolean) => {
    if (valid) {
      const newProject: ProjectItem = {
        id: editingProjectId.value || Math.max(...projectList.value.map((p) => p.id), 0) + 1,
        name: projectForm.value.name,
        price: projectForm.value.price,
        exclusive: projectForm.value.exclusive,
        status: projectForm.value.status,
        benefits: projectForm.value.benefits.filter((b) => b.trim()),
        sponsors: [],
      }

      if (editingProjectId.value) {
        const idx = projectList.value.findIndex((p) => p.id === editingProjectId.value)
        if (idx !== -1) projectList.value[idx] = newProject
        ElMessage.success('编辑成功')
      } else {
        projectList.value.push(newProject)
        ElMessage.success('新增成功')
      }
      projectDialogVisible.value = false
    }
  })
}

// 分页处理
const handleSizeChange = (val: number) => {
  pageSize.value = val
  currentPage.value = 1
}

const handleCurrentChange = (val: number) => {
  currentPage.value = val
}
</script>

<style scoped>
.design-container {
  padding: 10px;
  background-color: #f5f7fa;
  min-height: calc(100vh - 80px);
}

/* 二级导航栏 */
.sub-tabs {
  display: flex;
  gap: 32px;
  margin-bottom: 20px;
  background: white;
  padding: 0 20px;
  border-radius: 12px;
  height: 50px;
  align-items: center;
}

.sub-tab-item {
  font-size: 15px;
  font-weight: 500;
  color: #606266;
  cursor: pointer;
  padding: 8px 0;
  position: relative;
  transition: color 0.3s;
}

.sub-tab-item:hover {
  color: #409eff;
}

.sub-tab-item.active {
  color: #409eff;
}

.sub-tab-item.active::after {
  content: '';
  position: absolute;
  bottom: -13px;
  left: 0;
  right: 0;
  height: 2px;
  background: #409eff;
}

/* 赞助商管理主布局 */
.sponsor-main {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
}

.project-main {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
}

.sponsor-project-section {
  width: 100%;
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

.project-stats {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.stat-badge {
  font-size: 13px;
  color: #666;
  background: #f5f7fa;
  padding: 4px 12px;
  border-radius: 16px;
}

/* 项目列表 */
.project-list {
  display: flex;
  /* flex-direction: column; */
  min-width: 600px;
  min-height: 253px;
  gap: 16px;
  /* max-height: 600px; */
  /* overflow-y: auto; */
}

.project-card {
  border: 1px solid #e8e8e8;
  border-radius: 12px;
  padding: 16px;
  transition: all 0.2s;
}

.project-card:hover {
  border-color: #1890ff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.project-card.sold-out {
  border-left: 4px solid #67c23a;
}

.project-card.negotiating {
  border-left: 4px solid #e6a23c;
}

.project-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.project-title {
  display: flex;
  align-items: center;
  gap: 8px;
}

.project-name {
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.project-exclusive {
  font-size: 11px;
  color: #fa8c16;
  background: #fff7e6;
  padding: 2px 6px;
  border-radius: 10px;
}

.project-price {
  font-size: 20px;
  font-weight: 600;
  color: #fa8c16;
  margin-bottom: 12px;
}

.project-sponsors {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 12px;
}

.sponsor-item {
  display: flex;
  align-items: center;
  gap: 6px;
  background: #f5f7fa;
  padding: 4px 10px;
  border-radius: 16px;
  font-size: 12px;
}

.sponsor-name {
  color: #333;
}

.sponsor-status {
  font-size: 11px;
}

.sponsor-status.已售 {
  color: #67c23a;
}

.sponsor-status.洽谈中 {
  color: #e6a23c;
}

.project-benefits {
  margin: 12px 0;
  padding: 12px;
  background: #fafafa;
  border-radius: 8px;
}

.benefits-title {
  font-size: 12px;
  font-weight: 500;
  color: #666;
  margin-bottom: 8px;
}

.benefits-list {
  margin: 0;
  padding-left: 20px;
  font-size: 12px;
  color: #999;
  line-height: 1.8;
}

.project-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 8px;
  border-top: 1px solid #f0f0f0;
}

/* 统计卡片 */
.stats-cards {
  display: flex;
  gap: 16px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.stat-card {
  flex: 1;
  min-width: 100px;
  background: #f5f7fa;
  border-radius: 12px;
  padding: 16px;
  text-align: center;
}

.stat-value {
  font-size: 24px;
  font-weight: 600;
  color: #1890ff;
}

.stat-label {
  font-size: 12px;
  color: #999;
  margin-top: 8px;
}

/* 表格容器 */
.table-wrapper {
  overflow-x: auto;
}

.project-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

/* 分页 */
.pagination-wrapper {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
}

/* 表单提示 */
.form-tip {
  font-size: 12px;
  color: #999;
  margin-top: 4px;
}

/* 权益编辑器 */
.benefits-editor {
  width: 100%;
}

.benefit-item {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}
/* 项目状态列表 */
.project-status-list {
  width: 100%;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  padding: 8px;
  background: #f5f7fa;
}

.project-status-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  border-bottom: 1px solid #ebeef5;
}

.project-status-item:last-child {
  border-bottom: none;
}

.project-name-label {
  font-size: 14px;
  font-weight: 500;
  color: #333;
  min-width: 120px;
}
</style>
