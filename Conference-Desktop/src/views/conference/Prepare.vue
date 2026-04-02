<!-- src/views/meeting/Prepare.vue -->
<template>
  <div class="prepare-container">
    <div class="prepare-header">
      <h2>{{ getPageTitle }}</h2>
      <el-button @click="$router.back()">
        <el-icon><Back /></el-icon>
        返回
      </el-button>
    </div>

    <div class="prepare-content">
      <el-tabs v-model="activeTab" type="card">
        <el-tab-pane v-for="item in prepareItems" :key="item.value" :label="item.label">
          <component :is="getComponent(item.value)" :meeting-id="meetingId" />
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { Back } from '@element-plus/icons-vue'

const route = useRoute()
const meetingId = ref(0)
const itemType = ref('')
const activeTab = ref('agenda')

// 筹办事项列表
const prepareItems = [
  { label: '议程', value: 'agenda' },
  { label: '酒店', value: 'hotel' },
  { label: '搭建', value: 'setup' },
  { label: '物料', value: 'material' },
  { label: '嘉宾邀请', value: 'invitation' },
  { label: '会议赞助', value: 'sponsor' },
  { label: '座位排序', value: 'seating' },
]

// 页面标题
const getPageTitle = computed(() => {
  const meeting = meetingList.find((m) => m.id === meetingId.value)
  const item = prepareItems.find((i) => i.value === itemType.value)
  return `${meeting?.name || ''} - ${item?.label || ''}管理`
})

// 动态加载组件
const getComponent = (type: string) => {
  return () => import(`./prepare/${type}.vue`)
}

// 模拟数据
const meetingList = [
  { id: 1, name: '2026年中国航运业发展论坛' },
  { id: 2, name: '海事数字化转型研讨会' },
  // ... 其他会议
]

onMounted(() => {
  meetingId.value = parseInt(route.params.id as string)
  itemType.value = (route.query.item as string) || 'agenda'
  activeTab.value = itemType.value
})
</script>

<style scoped>
.prepare-container {
  padding: 24px;
  background: #f5f5f5;
  min-height: 100vh;
}

.prepare-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding: 24px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.prepare-header h2 {
  margin: 0;
  color: #333;
}

.prepare-content {
  background: white;
  padding: 24px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
</style>
