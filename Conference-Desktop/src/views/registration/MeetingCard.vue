<template>
  <div class="meeting-card">
    <div class="card-image">
      <div class="status-tag" :class="meeting.status">
        {{ meeting.status === 'published' ? '已发布' : '未发布' }}
      </div>
      <div class="image-placeholder">
        <!-- 如果有封面图则显示封面图 -->
        <img
          v-if="meeting.coverPreviewUrl"
          :src="meeting.coverPreviewUrl"
          class="cover-image"
          alt="封面"
        />
        <!-- 否则显示渐变背景 -->
        <div v-else class="gradient-bg"></div>
        <div v-if="meeting.badge" class="image-badge">
          {{ meeting.badge }}
        </div>
      </div>
    </div>

    <div class="card-content">
      <span class="meeting-title">{{ meeting.title }}</span>
      <div class="meeting-date">{{ meeting.date }}</div>
      <div class="action-buttons">
        <el-button plain size="small" @click="$emit('edit', meeting)">编辑</el-button>
        <el-button plain size="small" @click="$emit('data', meeting)">数据</el-button>
        <el-button plain size="small" @click="$emit('promote', meeting)">推广</el-button>
        <el-button plain size="small" @click="$emit('delete', meeting)">删除</el-button>
      </div>
      <div class="stats">
        <span class="label">{{ meeting.stats.forms }} </span>
        <span class="value">表单</span>
        <span class="label">{{ meeting.stats.views }} </span>
        <span class="value">浏览</span>
        <span class="label">{{ meeting.stats.visitors }} </span>
        <span class="value">访客</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  meeting: {
    id: string
    status: 'published' | 'unpublished'
    badge?: string
    title: string
    date: string
    stats: {
      forms: number
      views: number
      visitors: number
    }
    coverPreviewUrl?: string
    pageImages?: Record<number, string>
    formFields?: any
  }
}>()

defineEmits<{
  (e: 'edit', meeting: any): void
  (e: 'data', meeting: any): void
  (e: 'promote', meeting: any): void
  (e: 'delete', meeting: any): void
}>()
</script>

<style scoped>
.meeting-card {
  width: 220px;
  height: 300px;
  border: 2px dashed #dcdfe6;
  border-radius: 8px;
  margin-right: 10px;
  overflow: hidden;
  transition: all 0.3s ease;
  background-color: #fff;
}

.meeting-card:hover {
  box-shadow: 0 4px 16px 0 rgba(0, 0, 0, 0.08);
  border-color: #dcdfe6;
}

/* 图片区域 */
.card-image {
  width: 220px;
  position: relative;
  flex-shrink: 0;
}

.image-placeholder {
  height: 200px;
  width: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  /* position: relative; */
}

/* 图片上的badge (如 IMSCS 招商船级社) */
.image-badge {
  position: absolute;
  top: 12px;
  left: 12px;
  background-color: rgba(0, 0, 0, 0.6);
  color: #fff;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  z-index: 2;
}

/* 状态标签 - 悬浮在图片左上角 */
.status-tag {
  position: absolute;
  top: 12px;
  left: 12px;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  z-index: 3;
}

.status-tag.published {
  background-color: #ecf5ff;
  color: #409eff;
}

.status-tag.unpublished {
  background-color: #f0f9eb;
  color: #67c23a;
}

/* 内容区域 */
.card-content {
  flex: 1;
  margin-left: 5px;
  /* padding: 16px; */
  display: flex;
  flex-direction: column;
}

.meeting-title {
  padding-top: 4px;
  padding-bottom: 8px;
  font-size: 13px;
  font-weight: 500;
  letter-spacing: 0px;
  line-height: 14px;
  color: rgba(113, 128, 150, 1);
  text-align: left;
  vertical-align: top;
}

.meeting-date {
  font-size: 12px;
  font-weight: 400;
  letter-spacing: 0px;
  line-height: 14px;
  color: rgba(166, 166, 166, 1);
  text-align: left;
  vertical-align: top;
  margin-bottom: 8px;
}

.action-buttons {
  display: flex;
  /* gap: 16px; */
  margin-bottom: 10px;
}

.action-buttons .el-button {
  font-weight: 400;
  font-size: 10px;
  letter-spacing: 0px;
  line-height: 11.72px;
  padding: 0 6px;
  color: rgba(54, 134, 255, 1);
  text-align: left;
  vertical-align: top;
}

.stats {
  display: flex;
  gap: 12px;

  /* left: 699px;
  top: 515px;
  width: 34px;
  height: 14px;
  opacity: 1; */
}
.stats .label {
  font-size: 12px;
  font-weight: 400;
  letter-spacing: 0px;
  line-height: 14px;
  color: rgba(54, 134, 255, 1);
}
.stats .value {
  font-size: 12px;
  font-weight: 400;
  letter-spacing: 0px;
  line-height: 14px;
  color: rgba(166, 166, 166, 1);
  text-align: left;
  vertical-align: top;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .meeting-card {
    flex-direction: column;
  }

  .card-image {
    width: 100%;
    height: 160px;
  }

  .search-section {
    flex-direction: column;
    align-items: stretch;
  }

  .search-wrapper,
  .date-picker-wrapper {
    width: 100%;
  }
}
.cover-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.gradient-bg {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.image-placeholder {
  height: 200px;
  width: 100%;
  position: relative;
  overflow: hidden;
}
</style>
