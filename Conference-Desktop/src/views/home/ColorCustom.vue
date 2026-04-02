<template>
  <div class="color-custom-page">
    <div class="page-header">
      <h2>颜色自定义</h2>
      <p class="page-description">这里是颜色自定义页面，用于自定义系统主题颜色</p>
    </div>

    <div class="page-content">
      <el-card class="content-card">
        <template #header>
          <div class="card-header">
            <span>颜色自定义内容区域</span>
          </div>
        </template>

        <div class="placeholder-content">
          <el-empty description="颜色自定义功能待开发" :image-size="200">
            <template #description>
              <p>这里将提供颜色选择器、主题切换、样式配置等功能</p>
              <p>开发人员可以在此处添加具体功能</p>
            </template>
          </el-empty>

          <div class="color-preview">
            <div class="color-item" style="background-color: #409eff">
              <span>主色调</span>
            </div>
            <div class="color-item" style="background-color: #67c23a">
              <span>成功色</span>
            </div>
            <div class="color-item" style="background-color: #e6a23c">
              <span>警告色</span>
            </div>
            <div class="color-item" style="background-color: #f56c6c">
              <span>错误色</span>
            </div>
          </div>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
// 颜色自定义组件
</script>

<style scoped>
.color-custom-page {
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
  gap: 24px;
}

.color-preview {
  display: flex;
  gap: 16px;
  margin-top: 24px;
}

.color-item {
  width: 80px;
  height: 80px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}
</style>
