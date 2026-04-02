<template>
  <div class="activity-page">
    <div class="page-header">
      <h2>活动管理</h2>
      <p class="page-description">这里是活动管理页面，用于管理系统内的各种活动</p>
    </div>

    <div class="page-content">
      <el-card class="content-card">
        <template #header>
          <div class="card-header">
            <span>活动管理内容区域</span>
            <div class="card-actions">
              <el-button type="primary" size="small">
                <el-icon><Plus /></el-icon>
                创建活动
              </el-button>
              <el-button type="success" size="small">
                <el-icon><Refresh /></el-icon>
                刷新列表
              </el-button>
            </div>
          </div>
        </template>

        <div class="placeholder-content">
          <el-empty description="活动管理功能待开发" :image-size="200">
            <template #description>
              <p>这里将展示活动列表、活动创建、活动统计等功能</p>
              <p>开发人员可以在此处添加具体功能</p>
            </template>
          </el-empty>

          <div class="activity-stats">
            <el-row :gutter="20">
              <el-col :span="6">
                <el-statistic title="进行中活动" :value="12" />
              </el-col>
              <el-col :span="6">
                <el-statistic title="已结束活动" :value="45" />
              </el-col>
              <el-col :span="6">
                <el-statistic title="参与人数" :value="1234" />
              </el-col>
              <el-col :span="6">
                <el-statistic title="活动总数" :value="57" />
              </el-col>
            </el-row>
          </div>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Plus, Refresh } from '@element-plus/icons-vue'
</script>

<style scoped>
.activity-page {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.page-header {
  margin-bottom: 24px;
}

.page-header h2 {
  margin: 0;
  font-size: 24px;
  color: #333;
}

.page-description {
  margin: 8px 0 0;
  color: #666;
  font-size: 14px;
}

.page-content {
  flex: 1;
}

.content-card {
  height: 100%;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-actions {
  display: flex;
  gap: 8px;
}

.placeholder-content {
  height: 400px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 24px;
}

.activity-stats {
  width: 100%;
  max-width: 800px;
  margin-top: 24px;
}
</style>
