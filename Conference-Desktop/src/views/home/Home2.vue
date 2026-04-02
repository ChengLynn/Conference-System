<template>
  <div class="home-container">
    <div class="content-header">
      <h2>上海船舶XXX会议</h2>
      <div class="header-actions">
        <el-button type="primary">
          <el-icon><Plus /></el-icon>
          快速操作
        </el-button>
      </div>
    </div>

    <div class="home-content">
      <!-- 四模块布局 -->
      <div class="dashboard-grid">
        <!-- 左上：收支饼图 -->
        <div class="dashboard-card">
          <el-card class="chart-card">
            <template #header>
              <div class="card-header">
                <span>收支比例分布</span>
                <div class="card-header-extra">
                  <el-select v-model="incomePeriod" size="small" style="width: 100px">
                    <el-option label="本月" value="month" />
                    <el-option label="本季度" value="quarter" />
                    <el-option label="本年度" value="year" />
                  </el-select>
                </div>
              </div>
            </template>
            <div class="chart-container">
              <div ref="incomeChartRef" style="width: 100%; height: 300px"></div>
            </div>
            <div class="chart-summary">
              <div class="summary-item">
                <span class="label">总收入</span>
                <span class="value">¥ {{ formatNumber(totalIncome) }}</span>
              </div>
              <div class="summary-item">
                <span class="label">总支出</span>
                <span class="value">¥ {{ formatNumber(totalExpense) }}</span>
              </div>
            </div>
          </el-card>
        </div>

        <!-- 右上：行业人员数据柱形图 -->
        <div class="dashboard-card">
          <el-card class="chart-card">
            <template #header>
              <div class="card-header">
                <span>行业人员分布</span>
                <div class="card-header-extra">
                  <el-select v-model="personnelType" size="small" style="width: 120px">
                    <el-option label="参会人员" value="participants" />
                    <el-option label="演讲嘉宾" value="speakers" />
                    <el-option label="赞助商" value="sponsors" />
                  </el-select>
                </div>
              </div>
            </template>
            <div class="chart-container">
              <div ref="personnelChartRef" style="width: 100%; height: 300px"></div>
            </div>
            <div class="chart-legend">
              <div class="legend-item" v-for="item in personnelLegend" :key="item.name">
                <span class="legend-color" :style="{ backgroundColor: item.color }"></span>
                <span class="legend-text">{{ item.name }}</span>
              </div>
            </div>
          </el-card>
        </div>

        <!-- 左下：会议赞助列表 -->
        <div class="dashboard-card">
          <el-card>
            <template #header>
              <div class="card-header">
                <span>会议赞助列表</span>
                <el-button type="primary" size="small" @click="handleAddSponsor">
                  <el-icon><Plus /></el-icon>
                  添加赞助
                </el-button>
              </div>
            </template>
            <div class="list-container">
              <el-table :data="sponsorList" style="width: 100%" max-height="100%">
                <el-table-column prop="name" label="赞助商" min-width="100">
                  <template #default="{ row }">
                    <div class="sponsor-cell">
                      <!-- <el-avatar :size="32" :src="row.logo" class="sponsor-logo" /> -->
                      <span class="sponsor-name">{{ row.name }}</span>
                    </div>
                  </template>
                </el-table-column>
                <el-table-column prop="level" label="赞助事项" width="100">
                  <template #default="{ row }">
                    <el-tag :type="getSponsorLevelType(row.level)" size="small">
                      {{ row.level }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column prop="amount" label="金额" width="100">
                  <template #default="{ row }"> ¥ {{ formatNumber(row.amount) }} </template>
                </el-table-column>
                <el-table-column prop="status" label="状态" width="80">
                  <template #default="{ row }">
                    <el-tag :type="row.status === '已支付' ? 'success' : 'warning'" size="small">
                      {{ row.status }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column prop="contact" label="联系人" width="120" />
                <el-table-column label="操作" width="80">
                  <template #default="{ row }">
                    <el-button type="text" size="small" @click="handleViewSponsor(row)"
                      >查看</el-button
                    >
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </el-card>
        </div>

        <!-- 右下：演讲嘉宾议题列表 -->
        <div class="dashboard-card">
          <el-card>
            <template #header>
              <div class="card-header">
                <span>演讲嘉宾议题</span>
                <el-button type="primary" size="small" @click="handleAddSpeaker">
                  <el-icon><Plus /></el-icon>
                  添加嘉宾
                </el-button>
              </div>
            </template>
            <div class="list-container">
              <el-table :data="speakerList" style="width: 100%" max-height="100%">
                <el-table-column prop="name" label="嘉宾姓名" width="100" />
                <el-table-column prop="title" label="职称" width="120" />
                <el-table-column prop="company" label="公司/机构" width="150" />
                <el-table-column prop="topic" label="演讲议题" min-width="180">
                  <template #default="{ row }">
                    <div class="topic-cell">
                      <span class="topic-title">{{ row.topic }}</span>
                      <span class="topic-time">{{ row.time }}</span>
                    </div>
                  </template>
                </el-table-column>
                <el-table-column prop="status" label="状态" width="80">
                  <template #default="{ row }">
                    <el-tag :type="getSpeakerStatusType(row.status)" size="small">
                      {{ row.status }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column label="操作" width="80">
                  <template #default="{ row }">
                    <el-button type="text" size="small" @click="handleViewSpeaker(row)"
                      >详情</el-button
                    >
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </el-card>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted, nextTick } from 'vue'
import { Plus } from '@element-plus/icons-vue'
import * as echarts from 'echarts'

// 图表相关
const incomeChartRef = ref<HTMLElement>()
const personnelChartRef = ref<HTMLElement>()
let incomeChart: echarts.ECharts | null = null
let personnelChart: echarts.ECharts | null = null

// 收支饼图数据
const incomePeriod = ref('month')
const incomeData = reactive([
  { name: '会议注册费', value: 150000, color: '#5470c6' },
  { name: '赞助费', value: 280000, color: '#91cc75' },
  { name: '广告费', value: 80000, color: '#fac858' },
  { name: '其他收入', value: 30000, color: '#ee6666' },
  { name: '场地租赁', value: 120000, color: '#73c0de' },
  { name: '人员成本', value: 180000, color: '#3ba272' },
  { name: '物料制作', value: 60000, color: '#fc8452' },
  { name: '宣传费用', value: 40000, color: '#9a60b4' },
])

// 计算总额
const totalIncome = incomeData.slice(0, 4).reduce((sum, item) => sum + item.value, 0)
const totalExpense = incomeData.slice(4).reduce((sum, item) => sum + item.value, 0)

// 行业人员数据
const personnelType = ref('participants')
const personnelData = reactive({
  participants: [
    { industry: '船运公司', count: 320, color: '#5470c6' },
    { industry: '港口码头', count: 180, color: '#91cc75' },
    { industry: '货代物流', count: 240, color: '#fac858' },
    { industry: '船舶制造', count: 120, color: '#ee6666' },
    { industry: '金融服务', count: 90, color: '#73c0de' },
    { industry: '科研院校', count: 60, color: '#3ba272' },
  ],
  speakers: [
    { industry: '船运公司', count: 15, color: '#5470c6' },
    { industry: '港口码头', count: 8, color: '#91cc75' },
    { industry: '货代物流', count: 10, color: '#fac858' },
    { industry: '船舶制造', count: 6, color: '#ee6666' },
    { industry: '金融服务', count: 5, color: '#73c0de' },
    { industry: '科研院校', count: 4, color: '#3ba272' },
  ],
  sponsors: [
    { industry: '船运公司', count: 8, color: '#5470c6' },
    { industry: '港口码头', count: 5, color: '#91cc75' },
    { industry: '货代物流', count: 6, color: '#fac858' },
    { industry: '船舶制造', count: 3, color: '#ee6666' },
    { industry: '金融服务', count: 4, color: '#73c0de' },
    { industry: '其他', count: 2, color: '#3ba272' },
  ],
})

// 图例数据
const personnelLegend = computed(() => {
  return personnelData[personnelType.value].map((item) => ({
    name: item.industry,
    color: item.color,
  }))
})

// 会议赞助列表数据
const sponsorList = ref([
  {
    id: 1,
    name: '中国远洋海运',
    logo: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
    level: '场地赞助',
    amount: 500000,
    status: '已支付',
    contact: '张经理',
  },
  {
    id: 2,
    name: '招商轮船',
    logo: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
    level: '摄影赞助',
    amount: 300000,
    status: '已支付',
    contact: '李总监',
  },
  {
    id: 3,
    name: '中远海运港口',
    logo: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
    level: '礼品赞助',
    amount: 200000,
    status: '已支付',
    contact: '王总',
  },
  {
    id: 4,
    name: '中外运航运',
    logo: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
    level: '酒赞助',
    amount: 100000,
    status: '待支付',
    contact: '赵经理',
  },
  {
    id: 5,
    name: '宁波舟山港',
    logo: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
    level: '广告赞助',
    amount: 100000,
    status: '已支付',
    contact: '钱主任',
  },
  {
    id: 6,
    name: '上海港务集团',
    logo: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
    level: '接待赞助',
    amount: 50000,
    status: '已支付',
    contact: '孙主管',
  },
])

// 演讲嘉宾议题列表数据
const speakerList = ref([
  {
    id: 1,
    name: '张伟',
    title: '董事长',
    company: '中国远洋海运集团',
    topic: '智慧航运与数字化转型',
    time: '09:00-09:45',
    status: '已确认',
  },
  {
    id: 2,
    name: '李明',
    title: '总裁',
    company: '招商局轮船股份',
    topic: '绿色航运发展路径',
    time: '10:00-10:45',
    status: '已确认',
  },
  {
    id: 3,
    name: '王芳',
    title: '副总经理',
    company: '中远海运港口',
    topic: '智能化港口建设实践',
    time: '11:00-11:45',
    status: '待确认',
  },
  {
    id: 4,
    name: '赵强',
    title: '技术总监',
    company: '上海船舶研究设计院',
    topic: '船舶设计创新与节能',
    time: '13:30-14:15',
    status: '已确认',
  },
  {
    id: 5,
    name: '刘洋',
    title: '教授',
    company: '大连海事大学',
    topic: '海事人才培养新模式',
    time: '14:30-15:15',
    status: '已确认',
  },
  {
    id: 6,
    name: '陈静',
    title: '市场总监',
    company: '马士基航运',
    topic: '国际航运市场趋势分析',
    time: '15:30-16:15',
    status: '待确认',
  },
  {
    id: 7,
    name: '周涛',
    title: 'CEO',
    company: '顺丰海运',
    topic: '跨境电商物流解决方案',
    time: '16:30-17:15',
    status: '已确认',
  },
])

// 初始化图表
const initCharts = () => {
  if (incomeChartRef.value) {
    incomeChart = echarts.init(incomeChartRef.value)

    const incomeOption = {
      tooltip: {
        trigger: 'item',
        formatter: '{a} <br/>{b}: ¥{c} ({d}%)',
      },
      legend: {
        orient: 'vertical',
        right: 10,
        top: 'center',
        formatter: (name: string) => {
          const item = incomeData.find((d) => d.name === name)
          return `${name}: ¥${formatNumber(item?.value || 0)}`
        },
      },
      series: [
        {
          name: '收支分布',
          type: 'pie',
          radius: ['40%', '70%'],
          center: ['35%', '50%'],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 10,
            borderColor: '#fff',
            borderWidth: 2,
          },
          label: {
            show: false,
            position: 'center',
          },
          emphasis: {
            label: {
              show: true,
              fontSize: 16,
              fontWeight: 'bold',
            },
          },
          labelLine: {
            show: false,
          },
          data: incomeData.map((item) => ({
            ...item,
            itemStyle: { color: item.color },
          })),
        },
      ],
    }

    incomeChart.setOption(incomeOption)
  }

  if (personnelChartRef.value) {
    personnelChart = echarts.init(personnelChartRef.value)
    updatePersonnelChart()
  }
}

// 更新人员分布图表
const updatePersonnelChart = () => {
  if (!personnelChart) return

  const data = personnelData[personnelType.value]
  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow',
      },
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '15%',
      top: '10%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: data.map((item) => item.industry),
      axisLabel: {
        interval: 0,
        rotate: 30,
      },
    },
    yAxis: {
      type: 'value',
      name: '人数',
    },
    series: [
      {
        name: '人数',
        type: 'bar',
        barWidth: '60%',
        data: data.map((item, index) => ({
          value: item.count,
          itemStyle: {
            color: item.color,
            borderRadius: [5, 5, 0, 0],
          },
        })),
        label: {
          show: true,
          position: 'top',
          formatter: '{c}',
        },
      },
    ],
  }

  personnelChart.setOption(option)
}

// 工具函数
const formatNumber = (num: number) => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

const getSponsorLevelType = (level: string) => {
  const types: Record<string, string> = {
    钻石: 'danger',
    白金: 'warning',
    黄金: '',
    白银: 'info',
    青铜: 'success',
  }
  return types[level] || ''
}

const getSpeakerStatusType = (status: string) => {
  return status === '已确认' ? 'success' : 'warning'
}

// 事件处理
const handleAddSponsor = () => {
  console.log('添加赞助')
}

const handleViewSponsor = (sponsor: any) => {
  console.log('查看赞助商:', sponsor)
}

const handleAddSpeaker = () => {
  console.log('添加嘉宾')
}

const handleViewSpeaker = (speaker: any) => {
  console.log('查看嘉宾:', speaker)
}

// 生命周期
onMounted(() => {
  nextTick(() => {
    initCharts()
  })
})

onUnmounted(() => {
  if (incomeChart) {
    incomeChart.dispose()
  }
  if (personnelChart) {
    personnelChart.dispose()
  }
})

// 监听数据变化
watch(incomePeriod, () => {
  // 这里可以添加根据时间段更新数据的逻辑
})

watch(personnelType, () => {
  updatePersonnelChart()
})

// 响应式调整图表大小
const handleResize = () => {
  if (incomeChart) {
    incomeChart.resize()
  }
  if (personnelChart) {
    personnelChart.resize()
  }
}

onMounted(() => {
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})
</script>

<script lang="ts">
import { computed, watch } from 'vue'
export default {
  name: 'HomePage',
}
</script>

<style scoped>
.home-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.content-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.content-header h2 {
  margin: 0;
  font-size: 24px;
  color: #333;
}

.home-content {
  flex: 1;
  overflow-y: auto;
}

/* 四模块网格布局 */
.dashboard-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr 1fr;
  gap: 20px;
  height: 100%;
  min-height: 700px;
}

.dashboard-card {
  display: flex;
  flex-direction: column;
}

.dashboard-card .el-card {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.dashboard-card .el-card__body {
  flex: 1;
  display: flex;
  flex-direction: column;
}

/* 卡片头部样式 */
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 16px;
  font-weight: bold;
}

.card-header-extra {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* 图表容器 */
.chart-card .chart-container {
  flex: 1;
  min-height: 200px;
}

/* 图表摘要 */
.chart-summary {
  display: flex;
  justify-content: space-around;
  padding: 8px 0;
  border-top: 1px solid #eee;
  margin-top: 10px;
}

.summary-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.summary-item .label {
  font-size: 12px;
  color: #666;
}

.summary-item .value {
  font-size: 18px;
  font-weight: bold;
  color: #333;
}

/* 图例样式 */
.chart-legend {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  justify-content: center;
  padding: 12px 0;
  margin-top: 8px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
}

.legend-color {
  width: 12px;
  height: 12px;
  border-radius: 2px;
}

.legend-text {
  font-size: 12px;
  color: #666;
}

/* 列表样式 */
.list-container {
  flex: 1;
  overflow: hidden;
}

/* 赞助商单元格 */
.sponsor-cell {
  display: flex;
  align-items: center;
  gap: 12px;
}

.sponsor-logo {
  flex-shrink: 0;
}

.sponsor-name {
  font-weight: 500;
}

/* 议题单元格 */
.topic-cell {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.topic-title {
  font-weight: 500;
  color: #333;
}

.topic-time {
  font-size: 12px;
  color: #666;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .dashboard-grid {
    grid-template-columns: 1fr;
    grid-template-rows: repeat(4, auto);
    min-height: auto;
  }
}

/* 滚动条样式 */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb {
  background: linear-gradient(45deg, #409eff, #b37feb);
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(45deg, #66b1ff, #c4a5f3);
}
</style>
