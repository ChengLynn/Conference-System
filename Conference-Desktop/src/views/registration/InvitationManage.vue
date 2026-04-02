<template>
  <div class="invitation-manage-container">
    <div class="page-header">
      <h1>邀约管理</h1>
      <p class="page-description">管理会议邀约流程和邀约数据</p>
    </div>

    <div class="content-card">
      <div class="placeholder-content">
        <el-empty description="邀约管理页面内容待开发" />
        <div class="placeholder-text">
          <p>这里将显示邀约管理的相关功能，包括：</p>
          <ul>
            <li>邀约名单管理</li>
            <li>邀约发送记录</li>
            <li>邀约状态跟踪</li>
            <li>邀约统计分析</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// 邀约管理页面逻辑
</script>

<style scoped>
.invitation-manage-container {
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
