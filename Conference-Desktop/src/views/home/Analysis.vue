<template>
  <div class="analysis-page">
    <div class="page-header">
      <h2>分析页</h2>
      <p class="page-description">这里是分析页，用于展示数据分析和统计信息</p>
    </div>

    <div class="page-content">
      <el-card class="content-card">
        <template #header>
          <div class="card-header">
            <span>分析页内容区域</span>
          </div>
        </template>

        <div class="placeholder-content">
          <el-empty description="分析页内容待开发" :image-size="200">
            <template #description>
              <p>这里将展示数据分析图表、统计报表等内容</p>
              <p>开发人员可以在此处添加具体功能</p>
            </template>
          </el-empty>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
// 分析页组件
</script>

<style scoped>
.analysis-page {
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
