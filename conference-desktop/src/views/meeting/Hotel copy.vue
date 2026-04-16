<template>
  <!-- 通用导航组件 -->
  <ConferenceNavigation
    :currentPage="'议程安排'"
    :meetings="meetings"
    @meeting-change="handleMeetingChange"
  />
  <div class="agenda-page">
    <!-- 会议信息栏 -->

    <!-- 酒店基础信息配置区 -->
    <div class="hotel-config-card">
      <div class="config-header">
        <div class="hotel-selector">
          <span class="label">预选酒店：</span>
          <el-select v-model="selectedHotel" placeholder="选择酒店" class="hotel-select">
            <el-option label="上海汤臣洲际大酒店" value="1" />
            <el-option label="上海浦东丽思卡尔顿" value="2" />
            <el-option label="上海金茂君悦大酒店" value="3" />
          </el-select>
          <el-button link class="import-btn" @click="handleImportHotel">
            <el-icon><Upload /></el-icon> 导入酒店
          </el-button>
          <el-button link class="remove-btn" @click="handleRemoveHotel">
            <el-icon><Delete /></el-icon> 移除
          </el-button>
        </div>
        <div class="hotel-status">
          <el-tag type="success" effect="plain" size="large">已确认使用</el-tag>
          <el-button link class="cancel-confirm-btn">取消确认</el-button>
        </div>
      </div>

      <div class="config-body">
        <div class="config-row">
          <div class="config-item">
            <span class="label">使用时间段</span>
            <el-date-picker
              v-model="usageTimeRange"
              type="datetimerange"
              range-separator="至"
              start-placeholder="开始时间"
              end-placeholder="结束时间"
              format="YYYY-MM-DD HH:mm:ss"
              value-format="YYYY-MM-DD HH:mm:ss"
              class="time-range-picker"
            />
          </div>
          <div class="config-item">
            <span class="label">对接负责人</span>
            <div class="contact-list">
              <el-tag
                v-for="(contact, idx) in contacts"
                :key="idx"
                closable
                @close="removeContact(idx)"
                class="contact-tag"
              >
                {{ contact }}
              </el-tag>
              <el-button link class="add-contact-btn" @click="addContact">
                <el-icon><Plus /></el-icon> 添加
              </el-button>
              <el-button link class="export-list-btn" @click="handleExportList">
                <el-icon><Download /></el-icon> 导出总清单
              </el-button>
            </div>
          </div>
        </div>

        <div class="hotel-detail-row">
          <div class="hotel-address">
            <el-icon><Location /></el-icon>
            <span>上海市浦东新区张杨路777号</span>
          </div>
          <div class="hotel-contact">
            <el-icon><Phone /></el-icon>
            <span>张经理 021-58356666</span>
          </div>
          <div class="hotel-rooms">
            <span>房间数：30</span>
            <span class="price-info">参考价：￥680/间</span>
            <span class="price-info contract-price">协议价：￥580/间</span>
          </div>
          <div class="total-cost">
            <span class="label">费用总计：</span>
            <span class="cost-value">￥185,100</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 功能标签栏 -->
    <div class="tabs-nav">
      <el-tabs v-model="activeTab" class="custom-tabs">
        <el-tab-pane label="报价清单" name="quote" />
        <el-tab-pane label="会议厅信息" name="hall" />
        <el-tab-pane label="菜单信息" name="menu" />
        <el-tab-pane label="服务方-设计" name="design" />
        <el-tab-pane label="服务方-搭建" name="build" />
        <el-tab-pane label="服务方-摄影" name="photo" />
        <el-tab-pane label="嘉宾入住" name="guestStay" />
        <el-tab-pane label="接送安排" name="transport" />
      </el-tabs>
    </div>

    <div class="tabs-content">
      <!-- 费用概览区 -->
      <div class="cost-overview">
        <div class="action-buttons">
          <div>
            <h2>酒店事项报价清单</h2>
          </div>
          <div>
            <el-button class="btn-import-excel" @click="handleImportExcel">
              <el-icon><Upload /></el-icon> 导入Excel
            </el-button>
            <el-button type="primary" class="btn-add-item" @click="handleAddItem">
              <el-icon><Plus /></el-icon> 添加项目
            </el-button>
            <el-button class="btn-delete-import" @click="handleDeleteImport">
              <el-icon><Delete /></el-icon> 删除导入
            </el-button>
          </div>
        </div>
        <div class="cost-cards">
          <div class="cost-card" v-for="item in costCategories" :key="item.name">
            <div class="card-info">
              <div class="card-name">{{ item.name }}</div>
              <div class="card-amount">￥{{ formatNumber(item.amount) }}</div>
            </div>
          </div>
          <div class="cost-card total-card">
            <div class="card-info">
              <div class="card-name">总价</div>
              <div class="card-amount total-amount">￥{{ formatNumber(totalAmount) }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 报价明细表格区 -->
      <div class="quote-table-wrapper">
        <el-table :data="quoteList" stripe border class="quote-table">
          <el-table-column type="index" label="#" width="60" align="center" />
          <el-table-column prop="category" label="类别" width="100">
            <template #default="{ row }">
              <el-tag :type="getCategoryTagType(row.category)" size="small">{{
                row.category
              }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="project" label="项目" min-width="150" />
          <el-table-column prop="spec" label="规格/说明" min-width="200" show-overflow-tooltip />
          <el-table-column prop="unit" label="单位" width="80" align="center" />
          <el-table-column prop="price" label="单价(元)" width="110" align="right">
            <template #default="{ row }">￥{{ formatNumber(row.price) }}</template>
          </el-table-column>
          <el-table-column prop="quantity" label="数量" width="80" align="center" />
          <el-table-column prop="total" label="合计(元)" width="120" align="right">
            <template #default="{ row }" class="total-column"
              >￥{{ formatNumber(row.total) }}</template
            >
          </el-table-column>
          <el-table-column prop="remark" label="备注" min-width="120" show-overflow-tooltip />
          <el-table-column label="操作" min-width="120" align="center" fixed="right">
            <template #default="{ row }">
              <el-button link class="btn-edit-table" @click="handleEditItem(row)">
                <el-icon><Edit /></el-icon> 编辑
              </el-button>
              <el-button link class="btn-delete-table" @click="handleDeleteItem(row)">
                <el-icon><Delete /></el-icon> 删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>

    <!-- 新增/编辑项目弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="600px"
      class="quote-dialog"
      @close="resetForm"
    >
      <el-form :model="formData" :rules="formRules" ref="formRef" label-width="100px">
        <el-form-item label="类别" prop="category">
          <el-select v-model="formData.category" placeholder="请选择类别" style="width: 100%">
            <el-option label="住宿" value="住宿" />
            <el-option label="会场" value="会场" />
            <el-option label="餐饮" value="餐饮" />
            <el-option label="设备" value="设备" />
            <el-option label="服务" value="服务" />
            <el-option label="其他" value="其他" />
          </el-select>
        </el-form-item>
        <el-form-item label="项目" prop="project">
          <el-input v-model="formData.project" placeholder="请输入项目名称" />
        </el-form-item>
        <el-form-item label="规格/说明" prop="spec">
          <el-input
            v-model="formData.spec"
            type="textarea"
            :rows="2"
            placeholder="请输入规格说明"
          />
        </el-form-item>
        <el-form-item label="单位" prop="unit">
          <el-input v-model="formData.unit" placeholder="如：间/晚、天、餐" />
        </el-form-item>
        <el-form-item label="单价(元)" prop="price">
          <el-input-number v-model="formData.price" :min="0" :precision="2" style="width: 100%" />
        </el-form-item>
        <el-form-item label="数量" prop="quantity">
          <el-input-number v-model="formData.quantity" :min="1" style="width: 100%" />
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="formData.remark" placeholder="如：4月17-18日" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSave">确定</el-button>
      </template>
    </el-dialog>

    <!-- 会议管理弹窗 -->
    <el-dialog v-model="showMeetingDialog" title="会议管理" width="800px">
      <el-table :data="meetings" stripe>
        <el-table-column prop="name" label="会议名称" />
        <el-table-column prop="time" label="会议时间" width="200" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">{{ row.status }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150">
          <template #default="{ row }">
            <el-button link @click="editMeeting(row)">编辑</el-button>
            <el-button link class="text-danger" @click="deleteMeeting(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <template #footer>
        <el-button @click="showMeetingDialog = false">关闭</el-button>
        <el-button type="primary" @click="addNewMeeting">新建会议</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Edit,
  Delete,
  DataAnalysis,
  Plus,
  Clock,
  Setting,
  Upload,
  Download,
  Location,
  Phone,
  Money,
  HomeFilled,
  OfficeBuilding,
  Food,
  Monitor,
  Service,
  More,
} from '@element-plus/icons-vue'
import ConferenceNavigation from '@/components/ConferenceNavigation.vue'

interface MeetingItem {
  id: number
  index: number
  name: string
  location: string
  time: string
  status: '报名中' | '进行中' | '已结束'
}

interface QuoteItem {
  id: number
  category: string
  project: string
  spec: string
  unit: string
  price: number
  quantity: number
  total: number
  remark: string
}

const currentMeetingId = ref<number>(1)
const selectedMeetingId = ref<number>(1)
const showAgendaView = ref(false)
const showMeetingDialog = ref(false)
const selectedHotel = ref('1')
const usageTimeRange = ref(['2025-12-04 07:00:00', '2025-12-04 21:00:00'])
const contacts = ref(['Evanx', 'Irisx'])
const activeTab = ref('quote')

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

// 报价列表数据
const quoteList = ref<QuoteItem[]>([
  {
    id: 1,
    category: '住宿',
    project: '标准大床房',
    spec: '含早餐/WiFi',
    unit: '间/晚',
    price: 680,
    quantity: 20,
    total: 13600,
    remark: '4月17-18日',
  },
  {
    id: 2,
    category: '住宿',
    project: '豪华套房',
    spec: '含早餐/行政酒廊',
    unit: '间/晚',
    price: 1500,
    quantity: 5,
    total: 7500,
    remark: '4月17-18日',
  },
  {
    id: 3,
    category: '会场',
    project: '主会议厅',
    spec: '可容纳300人/投影/音响',
    unit: '天',
    price: 25000,
    quantity: 1,
    total: 25000,
    remark: '4月17-18日',
  },
  {
    id: 4,
    category: '会场',
    project: '分会场A',
    spec: '可容纳80人',
    unit: '半天',
    price: 8000,
    quantity: 2,
    total: 16000,
    remark: '4月17-18日',
  },
  {
    id: 5,
    category: '餐饮',
    project: '午餐自助',
    spec: '中西式自助/200人份',
    unit: '餐',
    price: 15000,
    quantity: 1,
    total: 15000,
    remark: '4月17-18日',
  },
  {
    id: 6,
    category: '餐饮',
    project: '茶歇',
    spec: '咖啡/茶/点心',
    unit: '次',
    price: 5000,
    quantity: 2,
    total: 10000,
    remark: '4月17-18日',
  },
  {
    id: 7,
    category: '设备',
    project: 'LED屏租赁',
    spec: 'P3高清/4m×3m',
    unit: '套',
    price: 8000,
    quantity: 1,
    total: 8000,
    remark: '4月17-18日',
  },
  {
    id: 8,
    category: '会场',
    project: '翻页器',
    spec: '一拖二',
    unit: '个',
    price: 200,
    quantity: 1,
    total: 200,
    remark: '4月17-18日',
  },
  {
    id: 9,
    category: '会场',
    project: '拉绒地毯',
    spec: '蓝色或烟灰色待定',
    unit: '平方',
    price: 15,
    quantity: 80,
    total: 1200,
    remark: '4月17-18日',
  },
  {
    id: 10,
    category: '服务',
    project: '酒店礼仪',
    spec: '6人',
    unit: '人次',
    price: 300,
    quantity: 6,
    total: 1800,
    remark: '4月17-18日',
  },
])

// 计算属性
const selectedMeeting = computed(() => meetings.value.find((m) => m.id === selectedMeetingId.value))

// 费用分类汇总
const costCategories = computed(() => {
  const categories = ['住宿', '会场', '餐饮', '设备', '服务', '其他']
  const icons: Record<string, any> = {
    住宿: HomeFilled,
    会场: OfficeBuilding,
    餐饮: Food,
    设备: Monitor,
    服务: Service,
    其他: More,
  }
  const colors: Record<string, string> = {
    住宿: '#1890ff',
    会场: '#52c41a',
    餐饮: '#fa8c16',
    设备: '#722ed1',
    服务: '#eb2f96',
    其他: '#8c8c8c',
  }
  const bgColors: Record<string, string> = {
    住宿: '#e6f7ff',
    会场: '#f6ffed',
    餐饮: '#fff7e6',
    设备: '#f9f0ff',
    服务: '#fff0f6',
    其他: '#f5f5f5',
  }

  return categories.map((name) => {
    const amount = quoteList.value
      .filter((item) => item.category === name)
      .reduce((sum, item) => sum + item.total, 0)
    return { name, amount, icon: icons[name], color: colors[name], bgColor: bgColors[name] }
  })
})

const totalAmount = computed(() => {
  return quoteList.value.reduce((sum, item) => sum + item.total, 0)
})

// 弹窗相关
const dialogVisible = ref(false)
const dialogTitle = ref('新增项目')
const editingId = ref<number | null>(null)
const formRef = ref()
const formData = ref({
  category: '',
  project: '',
  spec: '',
  unit: '',
  price: 0,
  quantity: 1,
  remark: '',
})

const formRules = {
  category: [{ required: true, message: '请选择类别', trigger: 'change' }],
  project: [{ required: true, message: '请输入项目名称', trigger: 'blur' }],
  price: [{ required: true, message: '请输入单价', trigger: 'blur' }],
  quantity: [{ required: true, message: '请输入数量', trigger: 'blur' }],
}

// 辅助函数
const formatNumber = (num: number) => {
  return num.toLocaleString()
}

const getStatusType = (status: string) => {
  const types: Record<string, string> = {
    报名中: 'success',
    进行中: 'warning',
    已结束: 'info',
  }
  return types[status] || ''
}

const getCategoryTagType = (category: string) => {
  const types: Record<string, string> = {
    住宿: 'primary',
    会场: 'success',
    餐饮: 'warning',
    设备: 'danger',
    服务: 'info',
    其他: '',
  }
  return types[category] || ''
}

// 会议操作
const handleMeetingChange = (meetingId: number) => {
  selectedMeetingId.value = meetingId
  showAgendaView.value = false
}

const editMeeting = (row: MeetingItem) => {
  ElMessage.info(`编辑会议: ${row.name}`)
}

const deleteMeeting = (row: MeetingItem) => {
  ElMessageBox.confirm(`确定删除会议"${row.name}"吗？`, '提示', { type: 'warning' })
    .then(() => {
      const index = meetings.value.findIndex((m) => m.id === row.id)
      if (index !== -1) {
        meetings.value.splice(index, 1)
        ElMessage.success('删除成功')
      }
    })
    .catch(() => {})
}

const addNewMeeting = () => {
  ElMessage.info('新建会议功能开发中')
}

// 酒店配置操作
const handleImportHotel = () => {
  ElMessage.info('导入酒店功能开发中')
}

const handleRemoveHotel = () => {
  ElMessageBox.confirm('确定要移除当前酒店吗？', '提示', { type: 'warning' })
    .then(() => {
      ElMessage.success('已移除')
    })
    .catch(() => {})
}

const addContact = () => {
  ElMessageBox.prompt('请输入负责人姓名', '添加对接人', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
  })
    .then(({ value }) => {
      if (value) {
        contacts.value.push(value)
        ElMessage.success('添加成功')
      }
    })
    .catch(() => {})
}

const removeContact = (idx: number) => {
  contacts.value.splice(idx, 1)
}

const handleExportList = () => {
  ElMessage.success('导出成功')
}

// 报价清单操作
const handleImportExcel = () => {
  ElMessage.info('导入Excel功能开发中')
}

const handleAddItem = () => {
  dialogTitle.value = '新增项目'
  editingId.value = null
  resetForm()
  dialogVisible.value = true
}

const handleEditItem = (row: QuoteItem) => {
  dialogTitle.value = '编辑项目'
  editingId.value = row.id
  formData.value = { ...row }
  dialogVisible.value = true
}

const handleDeleteItem = (row: QuoteItem) => {
  ElMessageBox.confirm(`确定删除项目"${row.project}"吗？`, '提示', { type: 'warning' })
    .then(() => {
      const index = quoteList.value.findIndex((item) => item.id === row.id)
      if (index !== -1) {
        quoteList.value.splice(index, 1)
        ElMessage.success('删除成功')
      }
    })
    .catch(() => {})
}

const handleDeleteImport = () => {
  ElMessageBox.confirm('确定删除所有导入的项目吗？', '提示', { type: 'warning' })
    .then(() => {
      // 保留原始数据，删除新增的
      quoteList.value = quoteList.value.filter((item) => item.id <= 10)
      ElMessage.success('已删除导入项目')
    })
    .catch(() => {})
}

const handleSave = async () => {
  if (!formRef.value) return
  await formRef.value.validate((valid: boolean) => {
    if (valid) {
      const newItem: QuoteItem = {
        ...formData.value,
        id: editingId.value || Math.max(...quoteList.value.map((i) => i.id), 0) + 1,
        total: formData.value.price * formData.value.quantity,
      }
      if (editingId.value) {
        const index = quoteList.value.findIndex((i) => i.id === editingId.value)
        if (index !== -1) {
          quoteList.value[index] = newItem
          ElMessage.success('编辑成功')
        }
      } else {
        quoteList.value.push(newItem)
        ElMessage.success('新增成功')
      }
      dialogVisible.value = false
    }
  })
}

const resetForm = () => {
  formData.value = {
    category: '',
    project: '',
    spec: '',
    unit: '',
    price: 0,
    quantity: 1,
    remark: '',
  }
  formRef.value?.clearValidate()
}
</script>

<style scoped>
.agenda-page {
  min-height: 100vh;
  background: #f5f7fa;
  padding: 10px;
}

/* 会议信息栏 */
.meeting-info-bar {
  background: linear-gradient(135deg, #1890ff 0%, #096dd9 100%);
  border-radius: 16px;
  padding: 20px 24px;
  margin-bottom: 20px;
}

.meeting-selector-area {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.current-meeting {
  display: flex;
  align-items: center;
  gap: 16px;
}

.current-meeting .label {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.9);
}

.meeting-select {
  width: 320px;
}

.meeting-select :deep(.el-input__wrapper) {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  box-shadow: none;
}

.meeting-select :deep(.el-input__inner) {
  color: white;
}

.meeting-select :deep(.el-input__suffix) {
  color: white;
}

.btn-meeting-mgr {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
}

.btn-meeting-mgr:hover {
  background: rgba(255, 255, 255, 0.3);
  color: white;
}

.meeting-info {
  display: flex;
  align-items: center;
  gap: 20px;
}

.status-tag {
  background: #52c41a;
  border: none;
  color: white;
}

.meeting-info .time,
.meeting-info .location {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.9);
}

/* 酒店配置卡片 */
.hotel-config-card {
  background: white;
  border-radius: 16px;
  margin-bottom: 10px;

  overflow: hidden;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
}

.config-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 20px;
  border-bottom: 1px solid #f0f0f0;
}

.hotel-selector {
  display: flex;
  align-items: center;
  gap: 12px;
}

.hotel-selector .label {
  font-size: 14px;
  color: #666;
}

.hotel-select {
  width: 240px;
}

.import-btn {
  color: #1890ff;
}

.remove-btn {
  color: #ff4d4f;
}

.hotel-status {
  display: flex;
  align-items: center;
  gap: 12px;
}

.cancel-confirm-btn {
  color: #999;
}

.config-body {
  padding: 10px;
}

.config-row {
  display: flex;
  gap: 40px;
  margin-bottom: 4px;
  flex-wrap: wrap;
}

.config-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.config-item .label {
  font-size: 14px;
  color: #666;
  white-space: nowrap;
}

.time-range-picker {
  width: 380px;
}

.contact-list {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}

.contact-tag {
  background: #f5f5f5;
  border: none;
  color: #333;
}

.add-contact-btn {
  color: #1890ff;
}

.export-list-btn {
  color: #52c41a;
}

.hotel-detail-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 32px;
}

.hotel-address,
.hotel-contact {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #666;
  font-size: 14px;
}

.hotel-rooms {
  display: flex;
  gap: 16px;
  color: #666;
  font-size: 14px;
}

.price-info {
  color: #fa8c16;
}

.contract-price {
  color: #52c41a;
  font-weight: 500;
}

.total-cost {
  margin-left: auto;
}

.total-cost .label {
  font-size: 14px;
  color: #666;
}

.total-cost .cost-value {
  font-size: 20px;
  font-weight: 600;
  color: #fa8c16;
}

/* 标签栏 */
.tabs-nav {
  background: white;
  border-radius: 16px;
  margin-bottom: 20px;
  padding: 0 20px;
}

.custom-tabs :deep(.el-tabs__header) {
  margin: 0;
}

.custom-tabs :deep(.el-tabs__nav-wrap::after) {
  display: none;
}

.custom-tabs :deep(.el-tabs__item.is-active) {
  color: #1890ff;
}

.custom-tabs :deep(.el-tabs__active-bar) {
  background-color: #1890ff;
}
/* 内容区 */
.tabs-content {
  background: white;
  padding: 10px;
}
/* 费用概览区 */
.cost-overview {
  margin-bottom: 10px;
}

.cost-cards {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.cost-card {
  flex: 1;
  min-width: 120px;
  border-radius: 8px;
  padding: 6px;
  display: flex;
  align-items: center;
  gap: 12px;
  /* box-shadow: 0 1px 0px rgba(9, 9, 9, 0.03); */
  border: 1px solid #e5e7eb; /* 添加边框 */
  transition: all 0.3s;
}

.cost-card:hover {
  border-color: #1890ff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.card-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.card-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.card-name {
  font-size: 13px;
  color: #999;
  margin-bottom: 4px;
}

.card-amount {
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.total-card .card-amount {
  color: #fa8c16;
  font-size: 20px;
}

.action-buttons {
  display: flex;
  padding: 10px;
  justify-content: space-between;
  gap: 12px;
}

.btn-import-excel,
.btn-delete-import {
  border-color: #d9d9d9;
}

.btn-add-item {
  background: #1890ff;
  border-color: #1890ff;
}

/* 报价表格 */
.quote-table-wrapper {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
}

.quote-table {
  width: 100%;
}

.btn-edit-table {
  color: #1890ff;
}

.btn-delete-table {
  color: #ff4d4f;
}

.text-danger {
  color: #ff4d4f;
}
</style>
