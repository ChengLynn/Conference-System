<template>
  <div class="admin-container">
    <!-- 粒子背景 -->
    <vue-particles
      id="particles-js"
      class="particles"
      :particles-init="particlesInit"
      :particles-loaded="particlesLoaded"
      :options="particlesOptions"
    />

    <!-- 主要内容区域 -->
    <div class="main-content">
      <!-- 左侧导航栏 -->
      <div class="left-sidebar">
        <el-menu
          :default-active="activeMenu"
          class="sidebar-menu"
          @select="handleMenuSelect"
          router
        >
          <el-sub-menu index="/dashboard">
            <template #title>
              <el-icon><Odometer /></el-icon>
              <span>首页</span>
            </template>
            <el-menu-item index="/dashboard/home">
              <span>分析页</span>
            </el-menu-item>
            <el-menu-item index="/dashboard/home/personnel">
              <span>人员管理</span>
            </el-menu-item>
            <el-menu-item index="/dashboard/home/color-custom">
              <span>颜色自定义</span>
            </el-menu-item>
            <el-menu-item index="/dashboard/home/activity">
              <span>活动管理</span>
            </el-menu-item>
          </el-sub-menu>

          <el-menu-item index="/dashboard/conferences">
            <el-icon><Calendar /></el-icon>
            <span>会议管理</span>
          </el-menu-item>

          <el-menu-item index="/dashboard/users">
            <el-icon><User /></el-icon>
            <span>用户管理</span>
          </el-menu-item>

          <el-menu-item index="/dashboard/documents">
            <el-icon><Document /></el-icon>
            <span>资源管理</span>
          </el-menu-item>

          <el-menu-item index="/dashboard/messages">
            <el-icon><ChatDotRound /></el-icon>
            <span>消息中心</span>
          </el-menu-item>

          <el-menu-item index="/dashboard/statistics">
            <el-icon><DataAnalysis /></el-icon>
            <span>统计报表</span>
          </el-menu-item>

          <el-menu-item index="/dashboard/approval">
            <el-icon><Finished /></el-icon>
            <span>角色管理</span>
          </el-menu-item>

          <el-menu-item index="/dashboard/settings">
            <el-icon><Setting /></el-icon>
            <span>系统设置</span>
          </el-menu-item>
        </el-menu>

        <!-- 底部操作按钮 -->
        <!-- <div class="sidebar-footer">
          <el-button type="primary" class="create-conference-btn" @click="handleCreateConference">
            <el-icon><Plus /></el-icon>
            创建会议并生成H5页面
          </el-button>
        </div> -->
      </div>

      <!-- 右侧内容区域 -->
      <div class="right-content">
        <div class="header">
          <div class="header-left">
            <div class="logo">
              <el-icon :size="28" color="#409EFF">
                <Platform />
              </el-icon>
              <span class="logo-text">海运圈会务管理系统</span>
            </div>

            <!-- 搜索框 -->
            <div class="search-box">
              <el-input
                v-model="searchQuery"
                placeholder="搜索会议名称、编号或关键词..."
                clearable
                @keyup.enter="handleSearch"
              >
                <template #append>
                  <el-button @click="handleSearch">
                    <el-icon><Search /></el-icon>
                    搜索
                  </el-button>
                </template>
              </el-input>
            </div>
          </div>

          <div class="header-right">
            <div class="user-actions">
              <el-dropdown trigger="click">
                <span class="user-info">
                  <el-avatar :size="36" :src="userInfo.avatar" />
                  <span class="username">{{ userInfo.username }}</span>
                  <el-icon><ArrowDown /></el-icon>
                </span>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item @click="handleProfile">
                      <el-icon><User /></el-icon>
                      个人中心
                    </el-dropdown-item>
                    <el-dropdown-item @click="handleSettings">
                      <el-icon><Setting /></el-icon>
                      系统设置
                    </el-dropdown-item>
                    <el-dropdown-item divided @click="handleLogout">
                      <el-icon><SwitchButton /></el-icon>
                      退出登录
                    </el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
          </div>
        </div>
        <!-- 路由出口，显示子路由组件 -->
        <router-view></router-view>
      </div>
    </div>

    <!-- 底部信息栏 -->
    <div class="footer">
      <div class="footer-content">
        <span>海运圈会务系统（MarineCircle）© 2026</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user'
import {
  Search,
  User,
  Setting,
  SwitchButton,
  ArrowDown,
  Calendar,
  Document,
  ChatDotRound,
  Odometer,
  DataAnalysis,
  Finished,
  Plus,
  Platform,
  Menu,
} from '@element-plus/icons-vue'

const userStore = useUserStore()
const router = useRouter()
const route = useRoute()

// 计算当前激活的菜单
const activeMenu = computed(() => {
  return route.path
})

// 解决粒子效果组件问题
const particlesInit = async (engine: any) => {
  // 可选：这里可以初始化particles.js
}

const particlesLoaded = async (container: any) => {
  // 可选：粒子加载完成后的回调
  console.log('粒子效果已加载')
}

const particlesOptions = {
  background: {
    color: {
      value: 'transparent',
    },
  },
  fpsLimit: 120,
  interactivity: {
    events: {
      onClick: {
        enable: true,
        mode: 'push',
      },
      onHover: {
        enable: true,
        mode: 'grab',
      },
      resize: true,
    },
    modes: {
      push: {
        quantity: 4,
      },
      grab: {
        distance: 200,
        lineLinked: {
          opacity: 1,
        },
      },
    },
  },
  particles: {
    color: {
      value: '#409EFF',
    },
    links: {
      color: '#409EFF',
      distance: 150,
      enable: true,
      opacity: 0.5,
      width: 1,
    },
    collisions: {
      enable: true,
    },
    move: {
      direction: 'none',
      enable: true,
      outMode: 'bounce',
      random: false,
      speed: 1,
      straight: false,
    },
    number: {
      density: {
        enable: true,
        area: 800,
      },
      value: 80,
    },
    opacity: {
      value: 0.5,
    },
    shape: {
      type: 'circle',
    },
    size: {
      random: true,
      value: 5,
    },
  },
  detectRetina: true,
}

// 用户信息
const userInfo = reactive({
  username: '管理员',
  email: 'admin@bho.com',
  avatar: 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png',
})

// 搜索查询
const searchQuery = ref('')

// 方法
const handleSearch = () => {
  console.log('搜索:', searchQuery.value)
}

const handleMenuSelect = (index: string) => {
  console.log('选择菜单:', index)
  router.push(index)
}

const handleCreateConference = () => {
  console.log('创建会议')
  // 这里可以跳转到创建会议页面
  router.push('/dashboard/conferences?action=create')
}

const handleProfile = () => {
  console.log('个人中心')
}

const handleSettings = () => {
  console.log('系统设置')
}

const handleLogout = () => {
  console.log('退出登录')
  userStore.logout()
  router.push('/login')
}
</script>

<style scoped>
.admin-container {
  position: relative;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.particles {
  position: fixed;
  width: 100%;
  height: 100%;
  z-index: 1;
}

/* 顶部导航栏样式 */
.header {
  position: relative;
  z-index: 100;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 30px;
  height: 70px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  box-shadow: 0 2px 20px rgba(0, 0, 0, 0.1);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 40px;
}

.logo {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo-text {
  left: 233px;
  top: 11px;
  width: 234px;
  height: 35px;
  opacity: 1;
  /** 文本1 */
  font-size: 24px;
  font-weight: 700;
  letter-spacing: 2px;
  line-height: 34.75px;
  color: rgba(0, 88, 162, 1);
  text-align: center;
  vertical-align: top;
}

.search-box {
  width: 400px;
}

.search-box :deep(.el-input-group__append) {
  background-color: #409eff;
  border-color: #409eff;
}

.search-box :deep(.el-input-group__append .el-button) {
  color: white;
}

.search-box :deep(.el-input-group__append .el-button:hover) {
  background-color: #66b1ff;
}

.header-right .user-actions .user-info {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 20px;
  transition: all 0.3s;
}

.header-right .user-actions .user-info:hover {
  background-color: #f5f5f5;
}

.header-right .user-actions .user-info .username {
  font-weight: 400;
  color: #333;
}

/* 主要内容区域 */
.main-content {
  position: relative;
  z-index: 2;
  flex: 1;
  display: flex;
  margin: 1px;
  gap: 1px;
}

/* 左侧导航栏 */
.left-sidebar {
  background: rgba(0, 88, 162, 1);
}

.sidebar-menu {
  flex: 1;
  border-right: none;
  background: transparent;
}

.sidebar-menu :deep(.el-menu-item) {
  height: 56px;
  line-height: 56px;
  margin: 4px 12px;
  border-radius: 8px;
  /* color: white; */

  /** 文本1 */
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 0px;
  line-height: 22px;
  color: rgba(255, 255, 255, 1);
  text-align: left;
  vertical-align: top;
}

.sidebar-menu :deep(.el-menu-item.is-active) {
  background: linear-gradient(45deg, #409eff, #b37feb);

  /* color: red; */
  color: white;
}

.sidebar-menu :deep(.el-menu-item.is-active .el-icon) {
  color: white;
}

.sidebar-menu :deep(.el-menu-item:hover) {
  background-color: rgba(64, 158, 255, 0.1);
}

.sidebar-footer {
  padding: 20px;
  border-top: 1px solid #eee;
}

.sidebar-footer .create-conference-btn {
  width: 100%;
  height: 45px;
  background: linear-gradient(45deg, #409eff, #b37feb);
  border: none;
  /* border-radius: 8px; */
  font-weight: bold;
}

.sidebar-footer .create-conference-btn:hover {
  opacity: 0.9;
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(64, 158, 255, 0.3);
}

/* 右侧内容区域 */
.right-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  /* border-radius: 12px; */
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
  padding: 1px;
  overflow: hidden;
}

/* 底部信息栏 */
.footer {
  position: relative;
  z-index: 100;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  padding: 16px 30px;
  box-shadow: 0 -2px 20px rgba(0, 0, 0, 0.1);
}

.footer .footer-content {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  color: #666;
  font-size: 14px;
}

.footer .footer-content span {
  padding: 0 10px;
}

/* 滚动条样式 */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb {
  background: linear-gradient(45deg, #409eff, #b37feb);
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(45deg, #66b1ff, #c4a5f3);
}
</style>
