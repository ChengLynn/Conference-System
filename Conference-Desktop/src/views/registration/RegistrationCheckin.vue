<template>
  <div class="registration-checkin-container">
    <div class="content-card">
      <h2>报名签到</h2>
      <p>这里是报名签到页面，可以查看和管理参会人员的签到状态。</p>

      <div class="search-section">
        <div class="search-row">
          <div class="search-item">
            <label>参会人查询</label>
            <el-input
              v-model="searchKeyword"
              placeholder="请输入姓名、手机号或公司"
              clearable
              :style="{ width: '300px' }"
            />
          </div>
          <div class="search-item">
            <label>签到状态</label>
            <el-select v-model="checkinStatus" placeholder="请选择签到状态" clearable>
              <el-option label="全部" value="" />
              <el-option label="已签到" value="checked-in" />
              <el-option label="未签到" value="not-checked-in" />
            </el-select>
          </div>
          <div class="search-item">
            <el-button type="primary" @click="search">查询</el-button>
            <el-button @click="resetSearch">重置</el-button>
          </div>
        </div>
      </div>

      <div class="table-section">
        <el-table :data="checkinData" style="width: 100%" border stripe>
          <el-table-column prop="name" label="姓名" width="120" />
          <el-table-column prop="phone" label="手机号" width="150" />
          <el-table-column prop="company" label="公司" min-width="200" show-overflow-tooltip />
          <el-table-column prop="position" label="职务" width="120" />
          <el-table-column prop="checkinTime" label="签到时间" width="180">
            <template #default="{ row }">
              <span v-if="row.checkinTime">{{ row.checkinTime }}</span>
              <span v-else class="not-checked-in">未签到</span>
            </template>
          </el-table-column>
          <el-table-column prop="checkinMethod" label="签到方式" width="120">
            <template #default="{ row }">
              <el-tag v-if="row.checkinMethod" :type="getCheckinMethodTag(row.checkinMethod)">
                {{ row.checkinMethod }}
              </el-tag>
              <span v-else>-</span>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="200" fixed="right" align="center">
            <template #default="{ row }">
              <el-button
                v-if="!row.checkinTime"
                type="success"
                size="small"
                @click="handleCheckin(row)"
              >
                签到
              </el-button>
              <el-button v-else type="warning" size="small" @click="handleCancelCheckin(row)">
                取消签到
              </el-button>
              <el-button link type="primary" size="small" @click="viewDetails(row)">
                详情
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <div class="statistics-section">
        <h3>签到统计</h3>
        <div class="stat-cards">
          <div class="stat-card">
            <div class="stat-card-title">总报名人数</div>
            <div class="stat-card-value">{{ totalParticipants }}</div>
          </div>
          <div class="stat-card">
            <div class="stat-card-title">已签到人数</div>
            <div class="stat-card-value checked-in">{{ checkedInCount }}</div>
          </div>
          <div class="stat-card">
            <div class="stat-card-title">未签到人数</div>
            <div class="stat-card-value not-checked-in">{{ notCheckedInCount }}</div>
          </div>
          <div class="stat-card">
            <div class="stat-card-title">签到率</div>
            <div class="stat-card-value">{{ checkinRate }}%</div>
          </div>
        </div>
      </div>

      <div class="quick-checkin-section">
        <h3>快速签到</h3>
        <div class="quick-checkin-form">
          <el-input
            v-model="quickCheckinInput"
            placeholder="请输入手机号或扫描二维码"
            style="width: 300px; margin-right: 10px"
            @keyup.enter="quickCheckin"
          />
          <el-button type="primary" @click="quickCheckin">快速签到</el-button>
          <el-button @click="openQRScanner">扫描二维码</el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// 搜索关键词
const searchKeyword = ref('')
// 签到状态筛选
const checkinStatus = ref('')

// 签到数据
const checkinData = ref([
  {
    id: 1,
    name: '刘先生',
    phone: '15900000000',
    company: '上海莫瑞斯柯信息技术有限公司',
    position: '主编',
    checkinTime: '2025/12/01 09:15:30',
    checkinMethod: '二维码',
  },
  {
    id: 2,
    name: '张女士',
    phone: '13800000001',
    company: '上海国际航运研究中心',
    position: '研究员',
    checkinTime: '2025/12/01 10:20:15',
    checkinMethod: '手动',
  },
  {
    id: 3,
    name: '王先生',
    phone: '13900000002',
    company: '中国船舶工业行业协会',
    position: '秘书长',
    checkinTime: '',
    checkinMethod: '',
  },
  {
    id: 4,
    name: '李女士',
    phone: '13700000003',
    company: '海事大学',
    position: '教授',
    checkinTime: '2025/12/01 08:45:22',
    checkinMethod: '二维码',
  },
  {
    id: 5,
    name: '陈先生',
    phone: '13600000004',
    company: '航运公司',
    position: '总经理',
    checkinTime: '',
    checkinMethod: '',
  },
  {
    id: 6,
    name: '赵女士',
    phone: '13500000005',
    company: '物流公司',
    position: '总监',
    checkinTime: '2025/12/01 11:30:45',
    checkinMethod: '手动',
  },
])

// 快速签到输入
const quickCheckinInput = ref('')

// 获取签到方式标签
const getCheckinMethodTag = (method: string) => {
  const methodMap: Record<string, string> = {
    二维码: 'success',
    手动: 'primary',
    自动: 'warning',
  }
  return methodMap[method] || ''
}

// 统计计算
const totalParticipants = computed(() => checkinData.value.length)
const checkedInCount = computed(() => checkinData.value.filter((item) => item.checkinTime).length)
const notCheckedInCount = computed(() => totalParticipants.value - checkedInCount.value)
const checkinRate = computed(() => {
  if (totalParticipants.value === 0) return 0
  return Math.round((checkedInCount.value / totalParticipants.value) * 100)
})

// 查询
const search = () => {
  ElMessage.info('执行查询')
  console.log('搜索关键词:', searchKeyword.value)
  console.log('签到状态:', checkinStatus.value)
}

// 重置查询
const resetSearch = () => {
  searchKeyword.value = ''
  checkinStatus.value = ''
  ElMessage.info('查询条件已重置')
}

// 处理签到
const handleCheckin = (row: any) => {
  ElMessageBox.confirm(`确认为 ${row.name} 签到吗？`, '签到确认', {
    confirmButtonText: '确认签到',
    cancelButtonText: '取消',
    type: 'info',
  })
    .then(() => {
      const now = new Date()
      const checkinTime = `${now.getFullYear()}/${now.getMonth() + 1}/${now.getDate()} ${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`
      row.checkinTime = checkinTime
      row.checkinMethod = '手动'
      ElMessage.success(`已为 ${row.name} 完成签到`)
    })
    .catch(() => {})
}

// 处理取消签到
const handleCancelCheckin = (row: any) => {
  ElMessageBox.confirm(`确认取消 ${row.name} 的签到吗？`, '取消签到确认', {
    confirmButtonText: '确认取消',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(() => {
      row.checkinTime = ''
      row.checkinMethod = ''
      ElMessage.success(`已取消 ${row.name} 的签到`)
    })
    .catch(() => {})
}

// 查看详情
const viewDetails = (row: any) => {
  ElMessage.info(`查看 ${row.name} 的详细信息`)
  // TODO: 实现查看详情逻辑
}

// 快速签到
const quickCheckin = () => {
  if (!quickCheckinInput.value.trim()) {
    ElMessage.warning('请输入手机号')
    return
  }

  const phone = quickCheckinInput.value.trim()
  const participant = checkinData.value.find((item) => item.phone === phone)

  if (!participant) {
    ElMessage.error('未找到该手机号对应的报名信息')
    return
  }

  if (participant.checkinTime) {
    ElMessage.warning(`${participant.name} 已经签到过了`)
    return
  }

  const now = new Date()
  const checkinTime = `${now.getFullYear()}/${now.getMonth() + 1}/${now.getDate()} ${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`
  participant.checkinTime = checkinTime
  participant.checkinMethod = '快速签到'

  ElMessage.success(`已为 ${participant.name} 完成快速签到`)
  quickCheckinInput.value = ''
}

// 打开二维码扫描器
const openQRScanner = () => {
  ElMessage.info('打开二维码扫描器')
  // TODO: 实现二维码扫描功能
}
</script>

<style scoped>
.registration-checkin-container {
  padding: 10px;
  background-color: white;
  height: 100%;
}

.content-card {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

h2 {
  margin-bottom: 20px;
  color: #303133;
}

h3 {
  margin: 30px 0 20px 0;
  color: #606266;
  border-bottom: 1px solid #e4e7ed;
  padding-bottom: 10px;
}

/* 搜索区域 */
.search-section {
  margin-bottom: 30px;
  background: white;
  border-radius: 8px;
}

.search-row {
  display: flex;
  justify-content: flex-start;
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
  white-space: nowrap;
}

/* 表格区域 */
.table-section {
  margin-bottom: 30px;
}

.not-checked-in {
  color: #f56c6c;
  font-weight: 500;
}

/* 统计卡片 */
.statistics-section {
  margin-bottom: 30px;
}

.stat-cards {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
}

.stat-card {
  flex: 1;
  min-width: 200px;
  background: #f5f7fa;
  border-radius: 8px;
  padding: 20px;
  text-align: center;
  border: 1px solid #ebeef5;
}

.stat-card-title {
  font-size: 14px;
  color: #909399;
  margin-bottom: 10px;
}

.stat-card-value {
  font-size: 24px;
  font-weight: bold;
  color: #303133;
}

.stat-card-value.checked-in {
  color: #67c23a;
}

.stat-card-value.not-checked-in {
  color: #f56c6c;
}

/* 快速签到区域 */
.quick-checkin-section {
  margin-top: 30px;
}

.quick-checkin-form {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}
</style>
