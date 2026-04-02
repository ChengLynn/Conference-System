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
        <!-- 系统标题 -->
        <div class="sidebar-header">
          <h2 class="system-title">MarineCircle</h2>
        </div>

        <el-menu
          :default-active="activeMenu"
          class="sidebar-menu"
          :unique-opened="true"
          @select="handleMenuSelect"
          router
        >
          <!-- 首页菜单项 -->
          <!-- <el-menu-item index="/dashboard/home">
            <el-icon><Odometer /></el-icon>
            <span>首页</span>
          </el-menu-item> -->

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
          <!-- 会议筹备组 -->
          <el-sub-menu index="/dashboard/meeting">
            <template #title>
              <el-icon><Calendar /></el-icon>
              <span>会议筹备</span>
            </template>
            <el-menu-item index="/dashboard/meeting/agenda">
              <span>议程安排</span>
            </el-menu-item>
            <el-menu-item index="/dashboard/meeting/hotel">
              <span>酒店事项</span>
            </el-menu-item>
            <el-menu-item index="/dashboard/meeting/photography">
              <span>搭建摄影</span>
            </el-menu-item>
            <el-menu-item index="/dashboard/meeting/design">
              <span>设计进度</span>
            </el-menu-item>
            <el-menu-item index="/dashboard/meeting/signup">
              <span>报名情况</span>
            </el-menu-item>
            <el-menu-item index="/dashboard/meeting/invitation">
              <span>嘉宾邀请</span>
            </el-menu-item>
            <el-menu-item index="/dashboard/meeting/seating">
              <span>座位安排</span>
            </el-menu-item>
            <el-menu-item index="/dashboard/meeting/sponsor">
              <span>会议赞助</span>
            </el-menu-item>
          </el-sub-menu>

          <!-- 报名管理 -->

          <el-sub-menu index="/dashboard/registration">
            <template #title>
              <el-icon><Document /></el-icon>
              <span>报名管理</span>
            </template>
            <el-menu-item index="/dashboard/registration/registration-settings">
              <span>报名设置</span>
            </el-menu-item>
            <el-menu-item index="/dashboard/registration/registration-checkin">
              <span>报名签到</span>
            </el-menu-item>
            <el-menu-item index="/dashboard/registration/conference-signup">
              <span>会议报名</span>
            </el-menu-item>
            <el-menu-item index="/dashboard/registration/invitation-manage">
              <span>邀约管理</span>
            </el-menu-item>
          </el-sub-menu>

          <!-- 物料设备 -->

          <el-sub-menu index="/materials">
            <template #title>
              <el-icon><Box /></el-icon>
              <span>物料设备</span>
            </template>
            <el-menu-item index="/materials/export">
              <span>物料设备1</span>
            </el-menu-item>
            <el-menu-item index="/materials/export">
              <span>物料设备2</span>
            </el-menu-item>
          </el-sub-menu>

          <!-- 信息资源 -->
          <el-sub-menu index="/resources">
            <template #title>
              <el-icon><Files /></el-icon>
              <span>信息资源</span>
            </template>
            <el-menu-item index="/resources/export">
              <span>信息资源1</span>
            </el-menu-item>
            <el-menu-item index="/resources/export">
              <span>信息资源2</span>
            </el-menu-item>
          </el-sub-menu>

          <!-- 收支管理 -->

          <el-sub-menu index="/finance">
            <template #title>
              <el-icon><Money /></el-icon>
              <span>收支管理</span>
            </template>
            <el-menu-item index="/finance/export">
              <span>收支明细</span>
            </el-menu-item>
            <el-menu-item index="/finance/export">
              <span>收支统计</span>
            </el-menu-item>
          </el-sub-menu>

          <!-- 晚宴抽奖 -->

          <el-sub-menu index="/lottery">
            <template #title>
              <el-icon><Trophy /></el-icon>
              <span>晚宴抽奖</span>
            </template>
            <el-menu-item index="/lottery/export">
              <span>抽奖明细</span>
            </el-menu-item>
            <el-menu-item index="/lottery/statistics">
              <span>抽奖统计</span>
            </el-menu-item>
          </el-sub-menu>

          <!-- 系统管理 -->

          <el-sub-menu index="/system">
            <template #title>
              <el-icon><Setting /></el-icon>
              <span>系统管理</span>
            </template>
            <el-menu-item index="/system/export">
              <span>系统设置</span>
            </el-menu-item>
            <el-menu-item index="/system/statistics">
              <span>系统统计</span>
            </el-menu-item>
          </el-sub-menu>
        </el-menu>
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
  Box,
  Files,
  Money,
  Trophy,
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

/* 顶部导航栏样式 - 保持不变 */
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
  /* margin: 1px; */
  gap: 1px;
}

/* ===== 左侧导航栏 - 完全按照图片样式修改 ===== */
.left-sidebar {
  width: 240px;
  background: rgba(1, 81, 145, 1);
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}

/* 侧边栏头部 */
.sidebar-header {
  padding: 20px 16px 16px 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.system-title {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: white;
  line-height: 1.4;
  letter-spacing: 1px;
}

.system-subtitle {
  margin: 4px 0 0 0;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
  line-height: 1.4;
}

/* 侧边栏菜单 */
.sidebar-menu {
  flex: 1;
  border-right: none;
  background: transparent;
  /* padding: 8px 0; */
}

/* 菜单项样式 */
.sidebar-menu :deep(.el-menu-item) {
  height: 48px;
  line-height: 48px;
  padding: 0 16px;
  margin: 4px 0;
  background: transparent;
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
  font-weight: 400;
  border-left: 3px solid transparent;
  transition: all 0.3s;
}

/* 菜单图标样式 */
.sidebar-menu :deep(.el-menu-item .el-icon) {
  color: rgba(255, 255, 255, 0.6);
  font-size: 18px;
  margin-right: 12px;
  width: 20px;
  text-align: center;
}

/* 悬停效果 */
.sidebar-menu :deep(.el-menu-item:hover) {
  background-color: rgba(255, 255, 255, 0.08);
  color: white;
}

.sidebar-menu :deep(.el-menu-item:hover .el-icon) {
  color: white;
}

/* 激活状态 */
.sidebar-menu :deep(.el-menu-item.is-active) {
  background: linear-gradient(90deg, rgba(64, 158, 255, 0.2) 0%, transparent 100%);
  color: #409eff;
  border-left-color: #409eff;
}

.sidebar-menu :deep(.el-menu-item.is-active .el-icon) {
  color: #409eff;
}

/* 子菜单标题样式 */
.sidebar-menu :deep(.el-sub-menu__title) {
  height: 48px;
  line-height: 48px;
  padding: 0 16px;
  background: transparent;
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
  font-weight: 400;
  border-left: 3px solid transparent;
}

.sidebar-menu :deep(.el-sub-menu__title .el-icon) {
  color: rgba(255, 255, 255, 0.6);
  font-size: 18px;
  margin-right: 12px;
  width: 20px;
  text-align: center;
}

.sidebar-menu :deep(.el-sub-menu__title:hover) {
  background-color: rgba(255, 255, 255, 0.08);
  color: white;
}

.sidebar-menu :deep(.el-sub-menu__title:hover .el-icon) {
  color: white;
}

/* 子菜单项样式 */
.sidebar-menu :deep(.el-menu--inline) {
  background: rgba(0, 0, 0, 0.3);
}

.sidebar-menu :deep(.el-menu--inline .el-menu-item) {
  padding-left: 52px !important;
  font-size: 13px;
  height: 40px;
  line-height: 40px;
  margin: 2px 0;
}

/* 子菜单激活状态 */
.sidebar-menu :deep(.el-menu--inline .el-menu-item.is-active) {
  background: rgba(64, 158, 255, 0.1);
  color: #409eff;
}

/* 展开/折叠图标 */
.sidebar-menu :deep(.el-sub-menu .el-sub-menu__icon-arrow) {
  color: rgba(255, 255, 255, 0.5);
  font-size: 14px;
  right: 16px;
}

.sidebar-menu :deep(.el-sub-menu.is-active .el-sub-menu__title) {
  color: white;
}

.sidebar-menu :deep(.el-sub-menu.is-active .el-sub-menu__title .el-icon) {
  color: #409eff;
}

/* 自定义左侧导航栏滚动条 */
.left-sidebar::-webkit-scrollbar {
  width: 4px;
}

.left-sidebar::-webkit-scrollbar-track {
  background: #001529;
}

.left-sidebar::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 2px;
}

.left-sidebar::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.3);
}

/* 右侧内容区域 - 保持不变 */
.right-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
  padding: 1px;
  overflow: hidden;
}

/* 底部信息栏 - 保持不变 */
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

/* 滚动条样式 - 保持不变 */
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
