<template>
  <div class="conference-navigation">
    <!-- 面包屑导航 -->
    <div class="breadcrumb-bar">
      <span>首页</span>
      <i class="sep">/</i>
      <span>会议筹备</span>
      <i class="sep">/</i>
      <span>{{ currentPage }}</span>
    </div>

    <!-- 会议信息头部栏 -->
    <div class="meeting-header">
      <div class="meeting-left">
        <span class="meeting-label">当前会议</span>
        <el-select
          v-model="selectedMeetingId"
          class="meeting-select"
          placeholder="请选择会议"
          @change="handleMeetingChange"
        >
          <el-option v-for="item in meetings" :key="item.id" :label="item.name" :value="item.id" />
        </el-select>
        <span class="link-text" @click="gotoMeetingManagement">
          <el-icon><CirclePlus /></el-icon>
          会议管理
        </span>
      </div>
      <div class="meeting-right">
        <el-tag :type="statusType(meetingStatus)" class="status-tag">{{ meetingStatus }}</el-tag>
        <el-icon><Timer /></el-icon>
        <span class="meeting-meta">{{ currentTime }}</span>
        <el-icon><Location /></el-icon>
        <span class="meeting-meta">{{ currentLocation }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'
import { CirclePlus, Timer, Location } from '@element-plus/icons-vue'

interface MeetingItem {
  id: number
  name: string
  status: '报名中' | '进行中' | '已结束'
}

interface Props {
  currentPage: string
  meetings: MeetingItem[]
}

interface Emits {
  (e: 'meeting-change', meetingId: number): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const selectedMeetingId = ref<number>(1)
const meetingStatus = ref<'报名中' | '进行中' | '已结束'>('报名中')
const currentTime = ref('')
const currentLocation = ref('中国·上海')

const updateMeetingStatus = (meetingId: number) => {
  const selected = props.meetings.find((m) => m.id === meetingId)
  if (selected) {
    meetingStatus.value = selected.status
  }
}

const handleMeetingChange = (meetingId: number) => {
  updateMeetingStatus(meetingId)
  emit('meeting-change', meetingId)
}

watch(
  () => props.meetings,
  (newMeetings) => {
    if (newMeetings.length > 0) {
      updateMeetingStatus(selectedMeetingId.value)
    }
  },
  { immediate: true },
)

const formatNow = () => {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const h = String(d.getHours()).padStart(2, '0')
  const min = String(d.getMinutes()).padStart(2, '0')
  const s = String(d.getSeconds()).padStart(2, '0')
  currentTime.value = `${y}年${m}月${day}日 ${h}:${min}:${s}`
}

let timer: number | null = null
onMounted(() => {
  formatNow()
  timer = window.setInterval(formatNow, 1000)

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude
        const lon = pos.coords.longitude
        try {
          const res = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=zh`,
          )
          if (res.ok) {
            const data = await res.json()
            currentLocation.value = `${data.city || data.locality || data.principalSubdivision || data.countryName}`
          } else {
            currentLocation.value = `经度 ${lon.toFixed(4)}，纬度 ${lat.toFixed(4)}`
          }
        } catch (err) {
          currentLocation.value = `经度 ${lon.toFixed(4)}，纬度 ${lat.toFixed(4)}`
        }
      },
      () => {
        currentLocation.value = '中国·上海'
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 10000 },
    )
  } else {
    currentLocation.value = '中国·上海'
  }
})

onUnmounted(() => {
  if (timer !== null) {
    window.clearInterval(timer)
    timer = null
  }
})

const statusType = (status: MeetingItem['status']) => {
  if (status === '报名中') return 'success'
  if (status === '进行中') return 'warning'
  if (status === '已结束') return 'info'
  return 'default'
}

const gotoMeetingManagement = () => {
  ElMessage.success('进入会议管理页面')
}
</script>

<style scoped>
/* 面包屑 */
.breadcrumb-bar {
  display: flex;
  align-items: center;
  padding: 14px 20px;
  font-size: 14px;
  color: #666;
  background: #fff;
  border-bottom: 1px solid #ebeef5;
}
.breadcrumb-bar .sep {
  margin: 0 8px;
  color: #999;
}

/* 会议头部栏 */
.meeting-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 20px;
  background: #e8f3ff;
  border-bottom: 1px solid #d1e7ff;
  flex-wrap: wrap;
  gap: 12px;
}
.meeting-left,
.meeting-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

/* 当前会议文字 */
.meeting-label {
  font-size: 14px;
  color: #0057b8;
}
.link-text {
  font-size: 14px;
  color: #0057b8;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
}
.meeting-select {
  width: 320px;
}

/* 状态标签 */
.status-tag {
  border-radius: 4px;
  font-size: 12px;
  padding: 2px 8px;
}
.meeting-meta {
  font-size: 14px;
  color: #333;
}
</style>
