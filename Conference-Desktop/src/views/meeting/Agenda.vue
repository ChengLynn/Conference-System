<template>
  <div class="agenda-container">
    <!-- 视图切换 tabs -->
    <div class="view-tabs">
      <div class="tab-item" :class="{ active: currentView === 'list' }" @click="switchView('list')">
        议程列表
      </div>
      <div
        class="tab-item"
        :class="{ active: currentView === 'detail' }"
        @click="switchView('detail')"
      >
        议程详情
      </div>
    </div>

    <!-- 议程列表视图 -->
    <div v-if="currentView === 'list'" class="content-card">
      <!-- 查询区域 -->
      <div class="search-section">
        <div class="search-row">
          <div class="search-item">
            <label>请输入会议名称</label>
            <el-input
              :style="{ width: '250px' }"
              v-model="searchForm.meetingName"
              placeholder="请输入会议名称"
              clearable
            />
          </div>
          <div class="search-item">
            <label>城市</label>
            <el-select
              :style="{ width: '200px' }"
              v-model="searchForm.city"
              placeholder="选择城市"
              clearable
            >
              <el-option label="上海" value="上海" />
              <el-option label="舟山" value="舟山" />
              <el-option label="北京" value="北京" />
              <el-option label="广州" value="广州" />
            </el-select>
          </div>
          <div class="search-item">
            <label>请选择创建日期</label>
            <el-date-picker
              v-model="searchForm.createDate"
              type="date"
              placeholder="请选择创建日期"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
            />
          </div>
          <div class="search-item search-buttons">
            <el-button type="primary" @click="handleSearch">查询</el-button>
            <el-button @click="resetSearch">重置</el-button>
          </div>
        </div>
      </div>

      <!-- 会议列表表格 -->
      <div class="table-section">
        <el-table :data="meetingList" style="width: 100%" border>
          <el-table-column prop="name" label="会议名称" min-width="200" show-overflow-tooltip />
          <el-table-column prop="city" label="城市" width="200" />
          <el-table-column prop="date" label="时间" width="200" />
          <el-table-column label="议程编辑" width="200">
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

        <!-- 底部操作栏：添加表单按钮 + 分页 -->
        <div class="table-footer">
          <!-- 添加表单按钮 -->
          <div class="add-form-button">
            <el-button type="primary" size="small" @click="handleAdd">添加表单</el-button>
          </div>

          <!-- 分页组件 - 放在右侧 -->
          <div class="pagination-wrapper">
            <div class="pagination-info">共 {{ total }} 条 每页 {{ pageSize }} 条</div>
            <el-pagination
              v-model:current-page="currentPage"
              v-model:page-size="pageSize"
              :page-sizes="[10, 20, 30, 50]"
              layout="prev, pager, next, jumper"
              :total="total"
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- 议程详情视图 -->
    <div v-if="currentView === 'detail'" class="content-card">
      <div class="detail-header">
        <div class="header-title-row">
          <h1>会议议程-2025第六届上海国际船舶管理论坛</h1>
          <el-button type="primary" size="small" @click="openAddDialog">
            <el-icon><Plus /></el-icon>
            添加议程
          </el-button>
        </div>
      </div>

      <div class="agenda-detail">
        <div v-if="agendaItems.length === 0" class="empty-state">
          <p>暂无议程项，请添加新的议程</p>
        </div>

        <el-steps v-else direction="vertical" :space="80" finish-status="success">
          <el-step v-for="(item, index) in agendaItems" :key="index">
            <template #title>
              <div class="step-title-wrapper">
                <span class="step-time">{{ item.startTime }} - {{ item.endTime }}</span>
                <div class="step-actions">
                  <el-tooltip content="编辑" placement="top">
                    <el-button link type="primary" size="small" @click="openEditDialog(index)">
                      <el-icon><Edit /></el-icon>
                    </el-button>
                  </el-tooltip>
                  <el-tooltip content="删除" placement="top">
                    <el-button link type="danger" size="small" @click="deleteAgendaItem(index)">
                      <el-icon><Delete /></el-icon>
                    </el-button>
                  </el-tooltip>
                </div>
              </div>
            </template>
            <template #description>
              <div class="step-description">
                <div class="description-title">{{ item.stageName }}</div>
                <div v-if="item.content" class="agenda-content">
                  <!-- 根据类型显示不同的内容 -->
                  <template v-if="item.stageType === '主题演讲' || item.stageType === '主旨演讲'">
                    <div class="content-item">
                      <span class="content-label">演讲题目：</span>
                      <span class="content-value">{{ item.content.topic }}</span>
                    </div>
                    <div class="content-item">
                      <span class="content-label">演讲者：</span>
                      <span class="content-value">{{ item.content.speakerName }}</span>
                    </div>
                    <div class="content-item">
                      <span class="content-label">公司/职务：</span>
                      <span class="content-value"
                        >{{ item.content.speakerCompany }} /
                        {{ item.content.speakerPosition }}</span
                      >
                    </div>
                  </template>
                  <template v-else-if="item.stageType === '圆桌会议'">
                    <div class="content-item">
                      <span class="content-label">主题：</span>
                      <span class="content-value">{{ item.content.topic }}</span>
                    </div>
                    <div class="content-item">
                      <span class="content-label">主持人：</span>
                      <span class="content-value">{{ item.content.hostName }}</span>
                    </div>
                    <div class="content-item">
                      <span class="content-label">主持人身份：</span>
                      <span class="content-value"
                        >{{ item.content.hostCompany }} / {{ item.content.hostPosition }}</span
                      >
                    </div>
                  </template>
                  <template v-else-if="item.stageType === '开幕致辞'">
                    <ul
                      v-if="item.content.speeches && item.content.speeches.length > 0"
                      class="speech-list"
                    >
                      <li v-for="(speech, idx) in item.content.speeches" :key="idx">
                        {{ speech }}
                      </li>
                    </ul>
                  </template>
                  <template v-else>
                    <div v-if="item.content.description" class="content-item">
                      <span class="content-label">说明：</span>
                      <span class="content-value">{{ item.content.description }}</span>
                    </div>
                  </template>
                </div>
              </div>
            </template>
          </el-step>
        </el-steps>
      </div>

      <!-- 编辑对话框 -->
      <el-dialog
        v-model="dialogVisible"
        :title="editingIndex === null ? '添加议程' : '编辑议程'"
        width="700px"
        @close="resetForm"
      >
        <div class="form-container">
          <!-- 基础信息 -->
          <div class="form-section">
            <div class="form-row">
              <div class="form-group">
                <label>开始时间</label>
                <el-time-picker
                  v-model="formData.startTime"
                  format="HH:mm"
                  value-format="HH:mm"
                  placeholder="开始时间"
                />
              </div>
              <div class="form-group">
                <label>结束时间</label>
                <el-time-picker
                  v-model="formData.endTime"
                  format="HH:mm"
                  value-format="HH:mm"
                  placeholder="结束时间"
                />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group full-width">
                <label>阶段类型</label>
                <el-select
                  v-model="formData.stageType"
                  placeholder="选择阶段类型"
                  @change="onStageTypeChange"
                >
                  <el-option label="签到入场" value="签到入场" />
                  <el-option label="开幕致辞" value="开幕致辞" />
                  <el-option label="主旨演讲" value="主旨演讲" />
                  <el-option label="主题演讲" value="主题演讲" />
                  <el-option label="茶歇" value="茶歇" />
                  <el-option label="圆桌会议" value="圆桌会议" />
                  <el-option label="晚宴" value="晚宴" />
                  <el-option label="自定义" value="自定义" />
                </el-select>
              </div>
            </div>

            <!-- 自定义阶段名称 -->
            <div v-if="formData.stageType === '自定义'" class="form-row">
              <div class="form-group full-width">
                <label>自定义阶段名称</label>
                <el-input v-model="formData.stageName" placeholder="请输入自定义的阶段名称" />
              </div>
            </div>

            <!-- 动态表单字段 -->
            <div v-if="formData.stageType" class="form-row">
              <!-- 主题演讲 / 主旨演讲 -->
              <template
                v-if="formData.stageType === '主题演讲' || formData.stageType === '主旨演讲'"
              >
                <div class="form-group full-width">
                  <label>演讲题目</label>
                  <el-input v-model="formData.content.topic" placeholder="请输入演讲题目" />
                </div>
                <div class="form-group">
                  <label>演讲者姓名</label>
                  <el-input v-model="formData.content.speakerName" placeholder="姓名" />
                </div>
                <div class="form-group">
                  <label>所在公司</label>
                  <el-input v-model="formData.content.speakerCompany" placeholder="公司" />
                </div>
                <div class="form-group">
                  <label>职务</label>
                  <el-input v-model="formData.content.speakerPosition" placeholder="职务" />
                </div>
              </template>

              <!-- 圆桌会议 -->
              <template v-else-if="formData.stageType === '圆桌会议'">
                <div class="form-group full-width">
                  <label>圆桌主题</label>
                  <el-input v-model="formData.content.topic" placeholder="请输入圆桌主题" />
                </div>
                <div class="form-group">
                  <label>主持人姓名</label>
                  <el-input v-model="formData.content.hostName" placeholder="主持人姓名" />
                </div>
                <div class="form-group">
                  <label>主持人所在公司</label>
                  <el-input v-model="formData.content.hostCompany" placeholder="公司" />
                </div>
                <div class="form-group">
                  <label>主持人职务</label>
                  <el-input v-model="formData.content.hostPosition" placeholder="职务" />
                </div>
              </template>

              <!-- 开幕致辞 -->
              <template v-else-if="formData.stageType === '开幕致辞'">
                <div class="form-group full-width">
                  <label>致辞单位/人员</label>
                  <el-input
                    v-model="newSpeech"
                    placeholder="输入致辞单位/人员"
                    @keyup.enter="addSpeech"
                  />
                  <el-button type="primary" size="small" style="margin-top: 8px" @click="addSpeech">
                    添加
                  </el-button>
                </div>
                <div
                  v-if="formData.content.speeches && formData.content.speeches.length > 0"
                  class="speech-list-form"
                >
                  <div
                    v-for="(speech, idx) in formData.content.speeches"
                    :key="idx"
                    class="speech-item"
                  >
                    <span>{{ speech }}</span>
                    <el-button link type="danger" size="small" @click="removeSpeech(idx)">
                      删除
                    </el-button>
                  </div>
                </div>
              </template>
            </div>
          </div>
        </div>

        <template #footer>
          <div class="dialog-footer">
            <el-button @click="dialogVisible = false">取消</el-button>
            <el-button type="primary" @click="saveAgendaItem">保存</el-button>
          </div>
        </template>
      </el-dialog>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Edit, Delete, Plus, View, Printer } from '@element-plus/icons-vue'

// 议程项数据类型
interface AgendaItem {
  startTime: string
  endTime: string
  stageType: string
  stageName: string
  content: any
}

// 视图切换
const currentView = ref<'list' | 'detail'>('list')

// 搜索表单
const searchForm = reactive({
  meetingName: '',
  city: '',
  date: [],
  createDate: '',
})

// 议程项列表
const agendaItems = ref<AgendaItem[]>([
  {
    startTime: '08:30',
    endTime: '09:00',
    stageType: '签到入场',
    stageName: '签到入场',
    content: {},
  },
  {
    startTime: '09:15',
    endTime: '09:50',
    stageType: '开幕致辞',
    stageName: '开幕致辞',
    content: {
      speeches: ['上海国际航运发展促进会协会领导致欢迎辞', '上海市交通委领导致辞'],
    },
  },
  {
    startTime: '09:50',
    endTime: '10:20',
    stageType: '主旨演讲',
    stageName: '主旨演讲：航海文化在船舶管理中的功能与实践',
    content: {
      topic: '航海文化在船舶管理中的功能与实践',
      speakerName: '徐祖远',
      speakerCompany: '交通运输部',
      speakerPosition: '原副部长',
    },
  },
])

// 表格数据
const meetingList = ref([
  {
    id: 1,
    name: '2025第六届上海国际船舶管理论坛',
    city: '上海',
    date: '2025-12-04',
    editors: ['Mac', 'Evan', 'Iris'],
  },
  {
    id: 2,
    name: '普陀区航运服务集聚区-暨港航物流和海事服务产业链合作交流会',
    city: '舟山',
    date: '2025-12-04',
    editors: ['Mac', 'Evan', 'Iris'],
  },
  {
    id: 3,
    name: '2025世界油商大会',
    city: '舟山',
    date: '2025-11-21',
    editors: ['Mac', 'Evan', 'Iris'],
  },
  {
    id: 4,
    name: '2025散杂货船舶投资和经营论坛',
    city: '上海',
    date: '2025-09-25',
    editors: ['Mac', 'Evan', 'Iris'],
  },
])

// 分页
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(800)

// 对话框
const dialogVisible = ref(false)
const editingIndex = ref<number | null>(null)
const newSpeech = ref('')

// 表单数据
const formData = reactive<AgendaItem>({
  startTime: '',
  endTime: '',
  stageType: '',
  stageName: '',
  content: {},
})

// 视图切换
const switchView = (view: 'list' | 'detail') => {
  currentView.value = view
}

// 搜索
const handleSearch = () => {
  ElMessage.success('搜索功能开发中')
  console.log('搜索条件:', searchForm)
}

// 重置搜索
const resetSearch = () => {
  searchForm.meetingName = ''
  searchForm.city = ''
  searchForm.createDate = ''
  ElMessage.success('已重置')
}

// 新增会议
const handleAdd = () => {
  ElMessage.info('新增会议功能开发中')
}

// 编辑
const handleEdit = (row: any) => {
  ElMessage.info(`编辑会议: ${row.name}`)
}

// 删除
const handleDelete = (row: any) => {
  ElMessageBox.confirm(`确认删除会议"${row.name}"吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(() => {
      ElMessage.success('删除成功')
    })
    .catch(() => {})
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

// 分页大小变化
const handleSizeChange = (val: number) => {
  pageSize.value = val
  ElMessage.info(`每页显示 ${val} 条`)
}

// 当前页变化
const handleCurrentChange = (val: number) => {
  currentPage.value = val
  ElMessage.info(`跳转到第 ${val} 页`)
}

// 打开添加对话框
const openAddDialog = () => {
  editingIndex.value = null
  resetForm()
  dialogVisible.value = true
}

// 打开编辑对话框
const openEditDialog = (index: number) => {
  editingIndex.value = index
  const item = agendaItems.value[index]
  Object.assign(formData, JSON.parse(JSON.stringify(item)))
  newSpeech.value = ''
  dialogVisible.value = true
}

// 重置表单
const resetForm = () => {
  formData.startTime = ''
  formData.endTime = ''
  formData.stageType = ''
  formData.stageName = ''
  formData.content = {}
  newSpeech.value = ''
}

// 处理阶段类型变更
const onStageTypeChange = () => {
  formData.content = {}
  newSpeech.value = ''

  if (formData.stageType !== '自定义') {
    formData.stageName = formData.stageType
  }

  // 初始化对应类型的内容结构
  if (formData.stageType === '主题演讲' || formData.stageType === '主旨演讲') {
    formData.content = {
      topic: '',
      speakerName: '',
      speakerCompany: '',
      speakerPosition: '',
    }
  } else if (formData.stageType === '圆桌会议') {
    formData.content = {
      topic: '',
      hostName: '',
      hostCompany: '',
      hostPosition: '',
    }
  } else if (formData.stageType === '开幕致辞') {
    formData.content = {
      speeches: [],
    }
  }
}

// 添加致辞
const addSpeech = () => {
  if (!newSpeech.value.trim()) {
    ElMessage.warning('请输入致辞单位/人员')
    return
  }
  if (!formData.content.speeches) {
    formData.content.speeches = []
  }
  formData.content.speeches.push(newSpeech.value)
  newSpeech.value = ''
}

// 删除致辞
const removeSpeech = (idx: number) => {
  formData.content.speeches.splice(idx, 1)
}

// 验证时间顺序
const validateTimeOrder = (newItem: AgendaItem): boolean => {
  const newStartMinutes = timeToMinutes(newItem.startTime)
  const newEndMinutes = timeToMinutes(newItem.endTime)

  // 检查开始时间和结束时间
  if (newStartMinutes >= newEndMinutes) {
    ElMessage.error('开始时间必须早于结束时间')
    return false
  }

  // 检查与其他项目的时间顺序
  for (let i = 0; i < agendaItems.value.length; i++) {
    if (editingIndex.value !== null && i === editingIndex.value) {
      continue
    }

    const item = agendaItems.value[i]
    const itemStartMinutes = timeToMinutes(item.startTime)
    const itemEndMinutes = timeToMinutes(item.endTime)

    // 检查是否有重叠或违反顺序
    if (newStartMinutes < itemEndMinutes && newEndMinutes > itemStartMinutes) {
      ElMessage.error(
        `新增的议程与 "${item.stageName}" (${item.startTime}-${item.endTime}) 时间冲突`,
      )
      return false
    }
  }

  return true
}

// 时间字符串转分钟
const timeToMinutes = (timeStr: string): number => {
  const [hours, minutes] = timeStr.split(':').map(Number)
  return hours * 60 + minutes
}

// 保存议程项
const saveAgendaItem = () => {
  // 验证基础字段
  if (!formData.startTime || !formData.endTime) {
    ElMessage.error('请选择开始和结束时间')
    return
  }

  if (!formData.stageType) {
    ElMessage.error('请选择阶段类型')
    return
  }

  if (formData.stageType === '自定义' && !formData.stageName) {
    ElMessage.error('请输入自定义阶段名称')
    return
  }

  // 验证类型特定的字段
  if (formData.stageType === '主题演讲' || formData.stageType === '主旨演讲') {
    if (!formData.content.topic) {
      ElMessage.error('请输入演讲题目')
      return
    }
    if (!formData.content.speakerName) {
      ElMessage.error('请输入演讲者姓名')
      return
    }
  } else if (formData.stageType === '圆桌会议') {
    if (!formData.content.topic) {
      ElMessage.error('请输入圆桌主题')
      return
    }
    if (!formData.content.hostName) {
      ElMessage.error('请输入主持人姓名')
      return
    }
  }

  // 验证时间顺序
  if (!validateTimeOrder(formData)) {
    return
  }

  // 保存或更新
  if (editingIndex.value !== null) {
    agendaItems.value[editingIndex.value] = JSON.parse(JSON.stringify(formData))
    ElMessage.success('议程已更新')
  } else {
    agendaItems.value.push(JSON.parse(JSON.stringify(formData)))
    ElMessage.success('议程已添加')
  }

  // 按开始时间排序
  agendaItems.value.sort((a, b) => {
    return timeToMinutes(a.startTime) - timeToMinutes(b.startTime)
  })

  dialogVisible.value = false
  resetForm()
}

// 删除议程项
const deleteAgendaItem = (index: number) => {
  const item = agendaItems.value[index]
  ElMessageBox.confirm(`确认删除议程"${item.stageName}"吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(() => {
      agendaItems.value.splice(index, 1)
      ElMessage.success('议程已删除')
    })
    .catch(() => {})
}
</script>

<style scoped>
.agenda-container {
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

.content-card {
  background: white;
  border-radius: 8px;
  padding: 14px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.detail-header {
  margin-bottom: 20px;
}

.header-title-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.header-title-row h1 {
  margin: 0;
  font-size: 24px;
  color: #2c3e50;
}

/* 搜索区域样式 */
.search-section {
  margin-bottom: 30px;
  background: white;
  border-radius: 8px;
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

.search-buttons {
  display: flex;
  flex-direction: row;
  gap: 10px;
  margin-left: auto;
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

.table-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 16px;
  padding: 8px 0;
}

.add-form-button {
  flex-shrink: 0;
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

:deep(.el-pagination) {
  font-weight: normal;
  white-space: nowrap;
}

:deep(.el-pagination .btn-prev),
:deep(.el-pagination .btn-next) {
  background-color: transparent;
}

:deep(.el-pagination .el-pager li) {
  background-color: transparent;
  min-width: 32px;
}

:deep(.el-pagination .el-pagination__jump) {
  margin-left: 8px;
}

/* 议程详情样式 */
.agenda-detail {
  padding: 20px;
  max-width: 100%;
  margin: 0;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  background-color: #ffffff;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
}

.empty-state {
  text-align: center;
  padding: 40px;
  color: #909399;
}

:deep(.el-steps) {
  background-color: transparent;
  width: 100%;
}

:deep(.el-step.is-vertical) {
  position: relative;
  text-align: left;
}

:deep(.el-step.is-vertical .el-step__head) {
  width: 24px;
  margin-top: 4px;
  float: left;
}

:deep(.el-step.is-vertical .el-step__main) {
  margin-left: 30px;
  padding-left: 0;
  text-align: left;
  width: auto;
  float: none;
  clear: none;
}

:deep(.el-step__title) {
  text-align: left;
  float: none;
  display: block;
  width: 100%;
}

:deep(.el-step__description) {
  text-align: left;
  float: none;
  display: block;
  width: 100%;
  padding-right: 0;
  margin-right: 0;
}

.step-time {
  font-weight: 600;
  color: #409eff;
  display: block;
  margin-bottom: 4px;
  text-align: left;
  width: 100%;
}

.step-description {
  padding-bottom: 24px;
  text-align: left;
  width: 100%;
}

.description-title {
  font-size: 16px;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 6px 0;
  text-align: left;
  line-height: 1.4;
}

.description-text {
  font-size: 15px;
  color: #2c3e50;
  display: block;
  margin: 0;
  text-align: left;
  font-weight: normal;
}

.description-speaker {
  font-size: 14px;
  color: #606266;
  font-style: italic;
  margin: 4px 0 0 0;
  text-align: left;
}

.speech-list {
  margin: 6px 0 0 0;
  padding-left: 20px;
  color: #2c3e50;
  text-align: left;
}

.speech-list li {
  margin-bottom: 4px;
  font-size: 14px;
  line-height: 1.5;
  text-align: left;
}

.speech-list li:last-child {
  margin-bottom: 0;
}

.step-title-wrapper {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding-right: 20px;
}

.step-actions {
  display: flex;
  gap: 4px;
  opacity: 0.6;
  transition: opacity 0.2s;
}

.step-actions:hover {
  opacity: 1;
}

.agenda-content {
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid #f0f0f0;
}

.content-item {
  margin: 8px 0;
  font-size: 14px;
  display: flex;
  align-items: flex-start;
  gap: 8px;
}

.content-label {
  font-weight: 600;
  color: #606266;
  min-width: 80px;
  flex-shrink: 0;
}

.content-value {
  color: #2c3e50;
  flex: 1;
  word-break: break-word;
}

/* 编辑对话框样式 */
.form-container {
  padding: 10px 0;
}

.form-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-row {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.form-group {
  flex: 1;
  min-width: 200px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-group.full-width {
  min-width: 100%;
  flex: 1 1 100%;
}

.form-group label {
  font-weight: 600;
  color: #606266;
  font-size: 14px;
}

.speech-list-form {
  margin-top: 12px;
  padding: 12px;
  background: #f5f7fa;
  border-radius: 4px;
  max-height: 250px;
  overflow-y: auto;
}

.speech-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #dcdfe6;
}

.speech-item:last-child {
  border-bottom: none;
}

.speech-item span {
  flex: 1;
  color: #2c3e50;
  font-size: 14px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
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

/* 响应式调整 */
@media (max-width: 768px) {
  .header-title-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .step-title-wrapper {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .step-actions {
    margin-left: 0;
  }

  .form-row {
    flex-direction: column;
  }

  .form-group {
    min-width: 100%;
    flex: 1 1 100%;
  }

  .table-footer {
    flex-direction: column;
    gap: 16px;
    align-items: flex-start;
  }

  .pagination-wrapper {
    flex-wrap: wrap;
  }

  .search-item {
    width: 100%;
  }

  .search-buttons {
    width: 100%;
    margin-left: 0;
  }
}
</style>
