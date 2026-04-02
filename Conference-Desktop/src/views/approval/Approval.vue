<!-- src/views/role/role.vue -->
<template>
  <div class="role-container">
    <div class="content-header">
      <h2>角色管理</h2>
      <div class="header-actions">
        <el-button type="primary" @click="handleCreaterole">
          <el-icon><Plus /></el-icon>
          新建角色
        </el-button>
        <el-button>
          <el-icon><Download /></el-icon>
          导出数据
        </el-button>
      </div>
    </div>

    <!-- 角色列表 -->
    <div class="roles-list">
      <el-empty description="这里是角色管理内容区域" />
    </div>

    <!-- 分页 -->
    <div class="pagination">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[10, 20, 50, 100]"
        :total="total"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Plus, Download } from '@element-plus/icons-vue'

// 分页数据
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

// 方法
const handleCreaterole = () => {
  console.log('创建角色')
}

const handleSizeChange = (size: number) => {
  pageSize.value = size
  console.log('每页大小改变:', size)
}

const handleCurrentChange = (page: number) => {
  currentPage.value = page
  console.log('当前页改变:', page)
}
</script>

<style scoped>
.role-container {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.content-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.content-header h2 {
  margin: 0;
  font-size: 24px;
  color: #333;
}

.content-header .header-actions {
  display: flex;
  gap: 12px;
}

.roles-list {
  flex: 1;
  overflow-y: auto;
  padding-right: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.pagination {
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid #eee;
  display: flex;
  justify-content: center;
}
</style>
