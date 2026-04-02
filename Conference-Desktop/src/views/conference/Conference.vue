<template>
  <div class="conference-container">
    <div class="content-header">
      <h2>会议管理</h2>
      <div class="header-actions">
        <el-button type="primary" @click="openCreateDialog">
          <el-icon><Plus /></el-icon>
          新建会议
        </el-button>
        <el-button>
          <el-icon><Download /></el-icon>
          导出数据
        </el-button>
      </div>
    </div>

    <!-- 会议列表表格 -->
    <div class="conferences-list">
      <el-table :data="conferenceList" border stripe>
        <!-- 会议名称 -->
        <el-table-column prop="title" label="会议名称" min-width="120" />

        <!-- 时间 -->
        <el-table-column prop="date" label="时间" min-width="120" />

        <!-- 地点 -->
        <el-table-column prop="location" label="地点" min-width="120" />

        <!-- H5下拉框 -->
        <el-table-column label="H5" width="200">
          <template #default="{ row }">
            <div class="h5-actions">
              <el-button link size="small" @click="handleH5View(row)" title="查看">
                <el-icon><View /></el-icon>
              </el-button>
              <el-button link type="primary" size="small" @click="handleH5Create(row)" title="创建">
                <el-icon><Plus /></el-icon>
              </el-button>
              <el-button link type="success" size="small" @click="handleH5Edit(row)" title="修改">
                <el-icon><Edit /></el-icon>
              </el-button>
              <el-button link type="danger" size="small" @click="handleH5Delete(row)" title="删除">
                <el-icon><Delete /></el-icon>
              </el-button>
            </div>
          </template>
        </el-table-column>

        <!-- 筹办事项下拉框 -->
        <el-table-column label="筹办事项" width="120">
          <template #default="{ row }">
            <el-dropdown>
              <el-button link type="primary" size="small">
                筹备项目
                <el-icon class="is-icon"><ArrowDown /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item @click="handlePlanItem(row, '议程')">议程</el-dropdown-item>
                  <el-dropdown-item @click="handlePlanItem(row, '酒店')">酒店</el-dropdown-item>
                  <el-dropdown-item @click="handlePlanItem(row, '搭建')">搭建</el-dropdown-item>
                  <el-dropdown-item @click="handlePlanItem(row, '物料')">物料</el-dropdown-item>
                  <el-dropdown-item @click="handlePlanItem(row, '嘉宾邀请')"
                    >嘉宾邀请</el-dropdown-item
                  >
                  <el-dropdown-item @click="handlePlanItem(row, '会议赞助')"
                    >会议赞助</el-dropdown-item
                  >
                  <el-dropdown-item @click="handlePlanItem(row, '座位排序')"
                    >座位排序</el-dropdown-item
                  >
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </template>
        </el-table-column>

        <!-- 会议状态选择框 -->
        <el-table-column label="会议状态" width="120">
          <template #default="{ row }">
            <el-select v-model="row.status" size="small" @change="handleStatusChange(row)">
              <el-option label="筹备中" value="preparing" />
              <el-option label="进行中" value="ongoing" />
              <el-option label="结束" value="finished" />
            </el-select>
          </template>
        </el-table-column>

        <!-- 报名清单 -->
        <el-table-column prop="registrations" label="报名清单" width="100" align="center">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="handleViewRegistrations(row)">
              查看({{ row.registrations }})
            </el-button>
          </template>
        </el-table-column>

        <!-- 收支 -->
        <el-table-column label="收支" width="100" align="center">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="handleViewFinancial(row)">
              详情
            </el-button>
          </template>
        </el-table-column>

        <!-- 操作列 -->
        <el-table-column label="操作" width="120" align="center" fixed="right">
          <template #default="{ row }">
            <el-button link type="success" size="small" @click="openEditDialog(row)">
              <el-icon><Edit /></el-icon>
            </el-button>
            <el-button link type="danger" size="small" @click="handleDelete(row)">
              <el-icon><Delete /></el-icon>
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 分页 -->
    <div class="pagination">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[10, 20, 50, 100]"
        :total="total"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>

    <!-- 会议编辑弹窗 -->
    <ConferenceEditDialog
      v-model:visible="showConferenceDialog"
      :mode="dialogMode"
      :conference-data="selectedConference"
      @save="handleConferenceSave"
    />

    <!-- H5编辑弹窗 -->
    <H5EditDialog
      v-model:visible="showH5Dialog"
      :mode="h5DialogMode"
      :h5-data="selectedH5Data"
      :conference-info="selectedConference"
      @save="handleH5Save"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Plus, Download, ArrowDown, Edit, Delete, View } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import ConferenceEditDialog from './ConferenceEdit.vue'
import H5EditDialog from './H5Edit.vue'
import { conferenceApi } from '@/api/conference'

// 弹窗状态
const showConferenceDialog = ref(false)
const showH5Dialog = ref(false)
const dialogMode = ref<'create' | 'edit'>('create')
const h5DialogMode = ref<'view' | 'create' | 'edit'>('view')

// 选中的数据
const selectedConference = ref<any>(null)
const selectedH5Data = ref<any>(null)

// 分页数据
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(12)

// 会议列表数据
const conferenceList = ref<any[]>([])

// 打开新建会议弹窗
const openCreateDialog = () => {
  dialogMode.value = 'create'
  selectedConference.value = {
    name: '',
    start_date: '',
    location: '',
    status: 'preparing',
    registrations: 0,
  }
  showConferenceDialog.value = true
}

// 打开编辑会议弹窗
const openEditDialog = (row: any) => {
  dialogMode.value = 'edit'
  selectedConference.value = { ...row }
  showConferenceDialog.value = true
}

// 会议保存
const handleConferenceSave = (conferenceData: any) => {
  if (dialogMode.value === 'create') {
    // 添加新会议
    const newId = conferenceList.value.length + 1
    conferenceList.value.push({
      id: newId,
      ...conferenceData,
      registrations: 0,
    })
    ElMessage.success('会议创建成功')
  } else {
    // 更新会议
    const index = conferenceList.value.findIndex((m) => m.id === conferenceData.id)
    if (index > -1) {
      conferenceList.value[index] = { ...conferenceList.value[index], ...conferenceData }
    }
    ElMessage.success('会议更新成功')
  }
  showConferenceDialog.value = false
}

// H5相关操作
const handleH5View = (row: any) => {
  h5DialogMode.value = 'view'
  selectedConference.value = row
  selectedH5Data.value = row.h5Data || {
    title: row.name,
    banner: '',
    content: '',
    qrCode: '',
  }
  showH5Dialog.value = true
}

const handleH5Create = (row: any) => {
  h5DialogMode.value = 'create'
  selectedConference.value = row
  selectedH5Data.value = {
    title: row.name,
    banner: '',
    content: '',
    qrCode: '',
  }
  showH5Dialog.value = true
}

const handleH5Edit = (row: any) => {
  h5DialogMode.value = 'edit'
  selectedConference.value = row
  selectedH5Data.value = row.h5Data || {
    title: row.name,
    banner: '',
    content: '',
    qrCode: '',
  }
  showH5Dialog.value = true
}

const handleH5Delete = (row: any) => {
  ElMessageBox.confirm(`确定删除 "${row.name}" 的H5页面吗?`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(() => {
      row.h5Data = null
      ElMessage.success('H5页面已删除')
    })
    .catch(() => {
      ElMessage.info('已取消删除')
    })
}

// H5保存
const handleH5Save = (h5Data: any) => {
  const index = conferenceList.value.findIndex((m) => m.id === selectedConference.value.id)
  if (index > -1) {
    if (h5DialogMode.value === 'create' || h5DialogMode.value === 'edit') {
      conferenceList.value[index].h5Data = h5Data
      ElMessage.success('H5页面保存成功')
    }
  }
  showH5Dialog.value = false
}

// 筹办事项
const handlePlanItem = (row: any, item: string) => {
  // 跳转到筹办事项页面
  window.open(`/prepare/${row.id}?item=${item}`, '_blank')
}

// 会议状态变更
const handleStatusChange = (row: any) => {
  const statusMap: Record<string, string> = {
    preparing: '筹备中',
    ongoing: '进行中',
    finished: '结束',
  }
  ElMessage.success(`会议状态已改为 "${statusMap[row.status]}"`)
}

// 报名清单
const handleViewRegistrations = (row: any) => {
  ElMessage.info(`查看 "${row.name}" 的报名清单，共 ${row.registrations} 人`)
}

// 收支详情
const handleViewFinancial = (row: any) => {
  ElMessage.info(`查看 "${row.name}" 的收支详情`)
}

// 删除会议
const handleDelete = (row: any) => {
  ElMessageBox.confirm(`确定删除会议 "${row.name}" 吗?`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(() => {
      const index = conferenceList.value.findIndex((m) => m.id === row.id)
      if (index > -1) {
        conferenceList.value.splice(index, 1)
        total.value--
      }
      ElMessage.success('会议已删除')
    })
    .catch(() => {
      ElMessage.info('已取消删除')
    })
}

// 分页处理
const handleSizeChange = (size: number) => {
  pageSize.value = size
}

const handleCurrentChange = (page: number) => {
  currentPage.value = page
}

// 获取会议列表函数
const getList = async () => {
  try {
    console.log('开始获取会议列表...')
    const params = {
      page: currentPage.value,
      limit: pageSize.value,
      // 移除status参数，因为后端数据中没有'preparing'状态
      // status: 'preparing',
    }

    const response = await conferenceApi.getConferences(params)
    console.log('会议列表获取成功:', response)

    // 打印到控制台
    console.log('会议数据:', response.data)
    console.log('分页信息:', response.pagination)

    // 更新会议列表数据
    conferenceList.value = response.data.map((item) => ({
      id: item.id,
      title: item.title,
      start_date: item.start_date,
      location: item.location,
      status: item.status,
      registrations: item.current_participants || 0,
      h5Data: null, // 这里可以根据需要添加H5数据
    }))

    // 更新分页总数
    total.value = response.pagination.total

    console.log('会议列表已更新，共', conferenceList.value.length, '条数据')
  } catch (error) {
    console.error('获取会议列表失败:', error)
    ElMessage.error('获取会议列表失败')
  }
}

// 页面载入成功后运行getList函数
onMounted(() => {
  console.log('Conference.vue 页面已加载，开始获取会议列表...')
  getList()
})
</script>

<style scoped>
.conference-container {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.content-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.content-header h2 {
  margin: 0;
  font-size: 24px;
  color: #333;
}

.content-header .header-actions {
  display: flex;
  gap: 12px;
}

.conferences-list {
  flex: 1;
  overflow-y: auto;
  padding-right: 8px;
  display: flex;
  margin-top: 24px;
  justify-content: center;
}

.conferences-list :deep(.el-table td),
.conferences-list :deep(.el-table th) {
  text-align: center;
}

.pagination {
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid #eee;
  display: flex;
  justify-content: center;
}

/* H5操作按钮 */
.h5-actions {
  display: flex;
  gap: 8px;
  justify-content: center;
  align-items: center;
}

.h5-actions .el-button {
  margin: 0;
}
</style>
