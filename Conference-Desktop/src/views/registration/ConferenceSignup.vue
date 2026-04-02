<template>
  <div class="conference-signup-container">
    <div class="page-header">
      <h1>会议报名</h1>
      <p class="page-description">管理会议报名流程和报名数据</p>
    </div>

    <div class="content-card">
      <div class="placeholder-content">
        <el-empty description="会议报名页面内容待开发" />
        <div class="placeholder-text">
          <p>这里将显示会议报名的相关功能，包括：</p>
          <ul>
            <li>报名表单管理</li>
            <li>报名数据录入</li>
            <li>报名审核流程</li>
            <li>报名统计报表</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// 会议报名页面逻辑
</script>

<style scoped>
.conference-signup-container {
  padding: 20px;
}

.page-header {
  margin-bottom: 24px;
}

.page-header h1 {
  font-size: 24px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 8px 0;
}

.page-description {
  font-size: 14px;
  color: #909399;
  margin: 0;
}

.content-card {
  background: #ffffff;
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.placeholder-content {
  text-align: center;
  padding: 40px 0;
}

.placeholder-text {
  margin-top: 20px;
  text-align: left;
  max-width: 600px;
  margin: 20px auto 0;
}

.placeholder-text p {
  font-size: 16px;
  color: #606266;
  margin-bottom: 12px;
}

.placeholder-text ul {
  padding-left: 20px;
  color: #606266;
}

.placeholder-text li {
  margin-bottom: 8px;
  font-size: 14px;
}
</style>
