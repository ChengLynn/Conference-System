<template>
  <div class="invitation-container">
    <div class="page-header">
      <h1>嘉宾邀请</h1>
      <p class="page-description">管理会议嘉宾邀请和接待安排</p>
    </div>

    <div class="content-card">
      <div class="placeholder-content">
        <el-empty description="嘉宾邀请页面内容待开发" />
        <div class="placeholder-text">
          <p>这里将显示会议嘉宾邀请的相关功能，包括：</p>
          <ul>
            <li>嘉宾名单管理</li>
            <li>邀请函发送</li>
            <li>嘉宾接待安排</li>
            <li>嘉宾行程管理</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// 嘉宾邀请页面逻辑
</script>

<style scoped>
.invitation-container {
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
