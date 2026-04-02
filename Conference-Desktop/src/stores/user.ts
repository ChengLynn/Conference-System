import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { userApi } from '@/api/user'
import { ElMessage } from 'element-plus'

interface UserInfo {
  id: number
  username: string
  email: string
  role: string
  last_login: string
  avatar?: string
}

export const useUserStore = defineStore('user', () => {
  // 状态
  const token = ref<string>(localStorage.getItem('token') || '')
  const refreshTokenValue = ref<string>(localStorage.getItem('refresh_token') || '')
  const userInfo = ref<UserInfo | null>(null)
  const isLoggedIn = computed(() => !!token.value)

  // 登录方法
  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const response = await userApi.login({
        username,
        password,
      })

      // 注意：响应拦截器已经提取了data字段，所以response直接是data对象
      // response结构: { access_token, refresh_token, expires_in, admin }

      // 更新token和用户信息
      token.value = response.access_token
      refreshTokenValue.value = response.refresh_token

      // 转换后端返回的admin数据为前端UserInfo格式
      userInfo.value = {
        id: response.admin.id,
        username: response.admin.username,
        email: response.admin.email,
        role: response.admin.role,
        last_login: response.admin.last_login,
      }

      // 存储到localStorage
      localStorage.setItem('token', response.access_token)
      localStorage.setItem('refresh_token', response.refresh_token)
      localStorage.setItem('userInfo', JSON.stringify(userInfo.value))

      ElMessage.success('登录成功')
      return true
    } catch (error: any) {
      console.error('登录失败:', error)

      // 根据错误类型显示不同的消息
      if (error.response?.status === 401) {
        ElMessage.error('用户名或密码错误')
      } else if (error.response?.status === 400) {
        ElMessage.error('请求参数错误')
      } else if (error.response?.status === 500) {
        ElMessage.error('服务器内部错误，请稍后重试')
      } else if (error.message === 'Network Error') {
        ElMessage.error('网络连接失败，请检查网络设置')
      } else {
        ElMessage.error(error.message || '登录失败，请稍后重试')
      }

      return false
    }
  }

  // 注册方法（仅限超级管理员）
  const register = async (
    username: string,
    email: string,
    password: string,
    role: string = 'admin',
  ): Promise<boolean> => {
    try {
      const response = await userApi.register({
        username,
        email,
        password,
        role,
      })

      ElMessage.success(response.message || '注册成功')
      return true
    } catch (error: any) {
      console.error('注册失败:', error)

      if (error.response?.status === 403) {
        ElMessage.error('权限不足，只有超级管理员可以注册新用户')
      } else if (error.response?.status === 409) {
        ElMessage.error('用户名已存在')
      } else {
        ElMessage.error(error.message || '注册失败')
      }

      return false
    }
  }

  // 登出方法
  const logout = async (): Promise<void> => {
    try {
      await userApi.logout()
    } catch (error) {
      console.error('退出登录API调用失败:', error)
    } finally {
      token.value = ''
      refreshTokenValue.value = ''
      userInfo.value = null
      localStorage.removeItem('token')
      localStorage.removeItem('refresh_token')
      localStorage.removeItem('userInfo')
      ElMessage.success('已退出登录')
    }
  }

  // 初始化用户信息
  const initUserInfo = (): void => {
    const storedUserInfo = localStorage.getItem('userInfo')
    if (storedUserInfo) {
      try {
        userInfo.value = JSON.parse(storedUserInfo)
      } catch (error) {
        console.error('解析用户信息失败:', error)
      }
    }
  }

  // 获取用户信息
  const getUserInfo = async (): Promise<void> => {
    if (!token.value) return

    try {
      const response = await userApi.getCurrentUser()

      userInfo.value = {
        id: response.id,
        username: response.username,
        email: response.email,
        role: response.role,
        last_login: response.last_login,
      }

      localStorage.setItem('userInfo', JSON.stringify(userInfo.value))
    } catch (error) {
      console.error('获取用户信息失败:', error)
    }
  }

  // 刷新令牌方法
  const refreshTokenMethod = async (): Promise<boolean> => {
    if (!refreshTokenValue.value) return false

    try {
      const response = await userApi.refreshToken({
        refresh_token: refreshTokenValue.value,
      })

      token.value = response.access_token
      localStorage.setItem('token', response.access_token)

      return true
    } catch (error) {
      console.error('刷新令牌失败:', error)
      return false
    }
  }

  // 初始化
  if (token.value) {
    initUserInfo()
    getUserInfo()
  }

  return {
    token,
    refreshToken: refreshTokenValue,
    userInfo,
    isLoggedIn,
    login,
    register,
    logout,
    getUserInfo,
    refreshTokenMethod,
  }
})
