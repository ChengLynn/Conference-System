<template>
  <div class="personnel-page">
    <div class="page-header">
      <h2>人员管理</h2>
      <p class="page-description">这里是人员管理页面，用于管理组织内的人员信息</p>
    </div>

    <div class="page-content">
      <el-card class="content-card">
        <template #header>
          <div class="card-header">
            <span>人员管理内容区域</span>
            <div class="card-actions">
              <el-button type="primary" size="small">
                <el-icon><Plus /></el-icon>
                添加人员
              </el-button>
            </div>
          </div>
        </template>

        <div class="placeholder-content">
          <el-empty description="人员管理功能待开发" :image-size="200">
            <template #description>
              <p>这里将展示人员列表、组织架构、权限管理等功能</p>
              <p>开发人员可以在此处添加具体功能</p>
            </template>
          </el-empty>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Plus } from '@element-plus/icons-vue'
</script>

<style scoped>
.personnel-page {
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

.placeholder-content {
  height: 400px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
</style>
