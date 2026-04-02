import type {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from 'axios'
import { ElMessage } from 'element-plus' // 如果使用Element Plus
import axios from 'axios'
// 创建axios实例
const service: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000, // 请求超时时间
  headers: {
    'Content-Type': 'application/json;charset=UTF-8',
  },
})

// 请求拦截器
service.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // 在发送请求之前做些什么
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error: any) => {
    // 对请求错误做些什么
    return Promise.reject(error)
  },
)

// 响应拦截器
service.interceptors.response.use(
  (response: AxiosResponse) => {
    // 对响应数据做点什么
    const { data } = response

    // 根据后端返回的数据结构进行调整
    // 后端返回格式: { success: true/false, message: string, data: any }
    if (data.success === true) {
      return data.data || data
    } else {
      // 显示错误消息
      const errorMessage = data.message || '请求失败'
      // 对于401错误（未授权），不显示错误消息，因为这是正常情况
      if (response.status !== 401) {
        ElMessage.error(errorMessage)
      }
      return Promise.reject(new Error(errorMessage))
    }
  },
  (error: any) => {
    // 对响应错误做点什么
    let message = '请求失败'

    if (error.response) {
      switch (error.response.status) {
        case 401:
          message = '未授权，请重新登录'
          // 清除token并跳转到登录页
          localStorage.removeItem('token')
          localStorage.removeItem('refresh_token')
          localStorage.removeItem('userInfo')
          // 不跳转，让前端路由处理
          break
        case 403:
          message = '拒绝访问'
          break
        case 404:
          message = '请求地址出错'
          break
        case 500:
          message = '服务器内部错误'
          break
        default:
          message = error.response.data?.message || '请求失败'
      }
    } else if (error.request) {
      message = '网络连接异常'
    } else {
      message = error.message
    }

    ElMessage.error(message)
    return Promise.reject(error)
  },
)

// 封装GET请求
export const get = async <T = any>(
  url: string,
  params?: any,
  config?: AxiosRequestConfig,
): Promise<T> => {
  try {
    const response = await service.get(url, { params, ...config })
    return response as T
  } catch (error) {
    return Promise.reject(error)
  }
}

// 封装POST请求
export const post = async <T = any>(
  url: string,
  data?: any,
  config?: AxiosRequestConfig,
): Promise<T> => {
  try {
    const response = await service.post(url, data, config)
    return response as T
  } catch (error) {
    return Promise.reject(error)
  }
}

// 封装PUT请求
export const put = async <T = any>(
  url: string,
  data?: any,
  config?: AxiosRequestConfig,
): Promise<T> => {
  try {
    const response = await service.put(url, data, config)
    return response as T
  } catch (error) {
    return Promise.reject(error)
  }
}

// 封装DELETE请求
export const del = async <T = any>(
  url: string,
  params?: any,
  config?: AxiosRequestConfig,
): Promise<T> => {
  try {
    const response = await service.delete(url, { params, ...config })
    return response as T
  } catch (error) {
    return Promise.reject(error)
  }
}

// 导出axios实例
export default service
