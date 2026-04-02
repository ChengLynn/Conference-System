// router/index.ts
import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/dashboard',
      meta: { requiresAuth: true },
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/Login.vue'),
      meta: { requiresAuth: false },
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('@/views/Register.vue'),
      meta: { requiresAuth: false },
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: () => import('@/views/dashboard/Dashboard.vue'),
      meta: { requiresAuth: true },
      children: [
        {
          path: '',
          redirect: '/dashboard/home',
        },
        {
          path: 'home',
          name: 'dashboard-home',
          component: () => import('@/views/home/Home.vue'),
        },
        {
          path: 'home/analysis',
          name: 'dashboard-home-analysis',
          component: () => import('@/views/home/Analysis.vue'),
        },
        {
          path: 'home/personnel',
          name: 'dashboard-home-personnel',
          component: () => import('@/views/home/Personnel.vue'),
        },
        {
          path: 'home/color-custom',
          name: 'dashboard-home-color-custom',
          component: () => import('@/views/home/ColorCustom.vue'),
        },
        {
          path: 'home/activity',
          name: 'dashboard-home-activity',
          component: () => import('@/views/home/Activity.vue'),
        },

        {
          path: 'conferences',
          name: 'dashboard-conferences',
          component: () => import('@/views/conference/Conference.vue'),
        },
        {
          path: 'users',
          name: 'dashboard-users',
          component: () => import('@/views/user/User.vue'),
        },
        {
          path: 'documents',
          name: 'dashboard-documents',
          component: () => import('@/views/documents/Documents.vue'),
        },
        {
          path: 'messages',
          name: 'dashboard-messages',
          component: () => import('@/views/messages/Messages.vue'),
        },
        {
          path: 'statistics',
          name: 'dashboard-statistics',
          component: () => import('@/views/statistics/Statistics.vue'),
        },
        {
          path: 'approval',
          name: 'dashboard-approval',
          component: () => import('@/views/approval/Approval.vue'),
        },
        {
          path: 'settings',
          name: 'dashboard-settings',
          component: () => import('@/views/settings/Settings.vue'),
        },
        // 会议筹备相关路由
        {
          path: 'meeting/agenda',
          name: 'dashboard-meeting-agenda',
          component: () => import('@/views/meeting/Agenda.vue'),
        },
        {
          path: 'meeting/hotel',
          name: 'dashboard-meeting-hotel',
          component: () => import('@/views/meeting/Hotel.vue'),
        },
        {
          path: 'meeting/photography',
          name: 'dashboard-meeting-photography',
          component: () => import('@/views/meeting/Photography.vue'),
        },
        {
          path: 'meeting/design',
          name: 'dashboard-meeting-design',
          component: () => import('@/views/meeting/Design.vue'),
        },
        {
          path: 'meeting/signup',
          name: 'dashboard-meeting-signup',
          component: () => import('@/views/meeting/Signup.vue'),
        },
        {
          path: 'meeting/invitation',
          name: 'dashboard-meeting-invitation',
          component: () => import('@/views/meeting/Invitation.vue'),
        },
        {
          path: 'meeting/seating',
          name: 'dashboard-meeting-seating',
          component: () => import('@/views/meeting/Seating.vue'),
        },
        {
          path: 'meeting/sponsor',
          name: 'dashboard-meeting-sponsor',
          component: () => import('@/views/meeting/Sponsor.vue'),
        },
        // 报名管理相关路由
        {
          path: 'registration/registration-settings',
          name: 'dashboard-registration-settings',
          component: () => import('@/views/registration/RegistrationSettings.vue'),
        },
        {
          path: 'registration/registration-checkin',
          name: 'dashboard-registration-checkin',
          component: () => import('@/views/registration/RegistrationCheckin.vue'),
        },
        {
          path: 'registration/invitation-manage',
          name: 'dashboard-registration-invitation-manage',
          component: () => import('@/views/registration/InvitationManage.vue'),
        },
        {
          path: 'registration/conference-signup',
          name: 'dashboard-registration-conference-signup',
          component: () => import('@/views/registration/ConferenceSignup.vue'),
        },
      ],
    },
  ],
})

// 路由守卫（如果需要）
router.beforeEach((to, from, next) => {
  // 权限检查逻辑
  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth)
  const isAuthenticated = true // 这里应该检查实际登录状态

  if (requiresAuth && !isAuthenticated) {
    next('/login')
  } else {
    next()
  }
})

// 确保这里导出默认的 router
export default router // ← 这是关键！
