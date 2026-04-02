<template>
  <div class="login-container">
    <div class="login-wrapper">
      <div class="login-card">
        <!-- 左侧品牌展示 -->
        <div class="brand-panel">
          <div class="brand-inner">
            <img src="/海运圈logo.png" alt="海运圈logo" class="logo" />
            <!-- <div class="brand-cn">海运圈会务管理系统</div> -->
            <!-- <img src="/Group 18.png" alt="Group 18" class="" /> -->
            <div class="brand-ch">致力于IT技术在海运上的解决方案</div>
            <div class="brand-sub">Focus on IT solutions in shipping</div>
          </div>
        </div>

        <!-- 右侧表单 -->
        <div class="form-panel">
          <img src="/marinecircle.png" alt="MarineCircle" class="brand-logo" />
          <div class="brand-tit">海运圈会务管理系统</div>
          <div class="brand-cn">MarineCircle Conference Management System</div>
          <el-form
            ref="loginFormRef"
            :model="loginForm"
            :rules="loginRules"
            label-position="top"
            class="marine-form"
          >
            <!-- 用户名输入 -->
            <div class="input-group">
              <el-form-item prop="username" class="no-margin">
                <el-input
                  v-model="loginForm.username"
                  placeholder="请输入账号"
                  class="marine-input"
                  @focus="handleInputFocus('username')"
                  @blur="handleInputBlur('username')"
                >
                  <template #suffix>
                    <div class="input-prefix">
                      <svg viewBox="0 0 24 24" width="16" height="16">
                        <path
                          d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"
                          fill="#0099ff"
                        />
                      </svg>
                    </div>
                  </template>
                </el-input>
              </el-form-item>
            </div>

            <!-- 密码输入 -->
            <div class="input-group">
              <el-form-item prop="password" class="no-margin">
                <el-input
                  v-model="loginForm.password"
                  type="password"
                  placeholder="请输入密码"
                  show-password
                  class="marine-input"
                  @focus="handleInputFocus('password')"
                  @blur="handleInputBlur('password')"
                >
                  <template #suffix>
                    <div class="input-prefix">
                      <!-- <svg viewBox="0 0 24 24" width="16" height="16">
                      <path
                        d="M18 8h-1V6c0-2.76-2.24-5-5-5s-5 2.24-5 5v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"
                        fill="#0099ff"
                      />
                    </svg> -->
                    </div>
                  </template>
                </el-input>
              </el-form-item>
            </div>

            <!-- 记住我 -->
            <!-- <div class="remember-group"  >
              <el-checkbox v-model="rememberMe" class="remember-checkbox">
                <span class="remember-text">记住登录状态</span>
              </el-checkbox>
              <a href="#" class="forgot-password" @click.prevent="handleForgotPassword">
                忘记密码?
              </a>
            </div> -->

            <!-- 登录按钮 -->
            <div class="button-group">
              <el-button type="primary" @click="handleLogin" :loading="loading" class="login-btn">
                <span class="btn-text">立即登录</span>
                <svg class="btn-icon" viewBox="0 0 24 24" width="20" height="20">
                  <path d="M10,17L15,12L10,7V17Z" fill="white" />
                </svg>
              </el-button>
            </div>

            <!-- 注册提示 -->
            <div class="register-tip">
              还没有账号？
              <a href="#" class="register-link" @click.prevent="goToRegister">立即注册</a>
            </div>
          </el-form>

          <!-- <div class="footer-info">
            <div class="slogan">致力于IT技术在海运上的解决方案</div>
            <div class="slogan-en">Focus on IT solutions in shipping</div>
          </div> -->
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()

const loginFormRef = ref()
const loading = ref(false)
const rememberMe = ref(false)

const loginForm = reactive({
  username: '',
  password: '',
})

const loginRules = {
  username: [
    { required: true, message: '请输入账号', trigger: 'blur' },
    { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' },
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '长度在 6 到 20 个字符', trigger: 'blur' },
  ],
}

const handleInputFocus = (field: 'username' | 'password') => {
  const input = document.querySelector(
    `.marine-input input[type="${field === 'password' ? 'password' : 'text'}"]`,
  )
  if (input) {
    input.parentElement?.parentElement?.classList.add('focused')
  }
}

const handleInputBlur = (field: 'username' | 'password') => {
  const input = document.querySelector(
    `.marine-input input[type="${field === 'password' ? 'password' : 'text'}"]`,
  )
  if (input) {
    input.parentElement?.parentElement?.classList.remove('focused')
  }
}

const handleLogin = async () => {
  try {
    // 验证表单
    await loginFormRef.value.validate()
    loading.value = true

    // 调用用户存储的登录方法
    const success = await userStore.login(loginForm.username, loginForm.password)

    if (success) {
      // 登录成功，跳转到仪表板
      router.push('/dashboard')
    }
    // 如果登录失败，错误消息已经在userStore.login中显示
  } catch (error: any) {
    console.error('登录失败:', error)

    // 处理表单验证错误或其他错误
    if (error.name === 'ValidationError' || error.message?.includes('验证')) {
      // 表单验证错误已经在界面上显示，不需要额外处理
    } else if (error.message === 'Network Error') {
      ElMessage.error('网络连接失败，请检查网络设置')
    } else {
      ElMessage.error('登录失败，请稍后重试')
    }
  } finally {
    loading.value = false
  }
}

const handleForgotPassword = () => {
  ElMessage.info('请联系管理员重置密码')
}

const goToRegister = () => {
  router.push('/register')
}

onMounted(() => {
  const waves = document.querySelectorAll('.wave')
  waves.forEach((wave, index) => {
    ;(wave as HTMLElement).style.animationDelay = `${index * 0.5}s`
  })
})
</script>

<style scoped lang="scss">
.login-container {
  // background: url('/Group 18.png') center/cover;
  width: 100%;
  height: 100%;
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f6f7;
  font-family: 'Microsoft YaHei', 'PingFang SC', sans-serif;
  overflow: hidden;
}

.login-wrapper {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: stretch;
  justify-content: center;
  padding: 0;
  box-sizing: border-box;
}

.login-card {
  display: flex;
  width: 100%;
  height: 100%;
  background: white;
  border-radius: 0;
  overflow: hidden;
  box-shadow: none;
  border: none;
}

.brand-panel {
  width: 48%;
  height: 100%;
  background: linear-gradient(180deg, #f4f9fd 0%, #eef6ff 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 48px 32px;
  box-sizing: border-box;
}

.brand-inner {
  text-align: center;
}

.logo {
  width: 100%;
  max-width: 320px;
  min-width: 140px;
  height: auto;
  display: block;
}
.brand-logo {
  width: 100%;
  max-width: 320px;
  min-width: 140px;
  height: auto;
  display: block;
  margin: 0 auto 18px;
}

.brand-ch {
  font-size: 15px;
  color: #2b7dbf;
  font-weight: 400;
  margin-bottom: 8px;
  text-align: center;
  color: rgba(0, 88, 162, 1);
}
.brand-cn {
  font-size: 15px;
  color: #2b7dbf;
  font-weight: 400;
  margin-bottom: 30px;
  text-align: center;
  color: rgba(0, 88, 162, 1);
}

.brand-tit {
  display: block;
  font-size: 32px;
  text-align: center;
  color: rgba(0, 88, 162, 1);
  font-weight: 700;
}
.brand-sub {
  font-size: 14px;
  color: #8899a6;
}

.form-panel {
  width: 52%;
  height: 100%;
  padding: 48px 44px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  box-sizing: border-box;
}

.form-inner {
  width: 100%;
  max-width: 420px;
  margin: 0 auto;
}

/* hide duplicate logo on right side and center text/form */
// .form-panel > .brand-logo {
//   display: none;
// }
// .form-panel > .brand-cn,
// .form-panel > .brand-tit {
//   text-align: center;
// }

.marine-form {
  width: 100%;
}

/* Center inputs and set specified size/style */
.marine-form .input-group {
  display: flex;
  justify-content: center;
}

.marine-form .input-group .no-margin,
.marine-form .input-group .el-form-item {
  width: 240px;
  margin: 0 auto;
  margin: 10px;
}

.marine-form :deep(.el-input__wrapper) {
  width: 240px;
  background: #ffffff;
  border: 1px solid rgba(220, 223, 230, 1);
  border-radius: 4px;
  padding: 0 12px;
  opacity: 1;
  box-sizing: border-box;
}

.marine-form :deep(.el-input__inner) {
  height: 40px;
  font-size: 14px;
}

:deep(.el-input__wrapper) {
  background: #ffffff;
  border: 1px solid #e6eef8;
  border-radius: 6px;
  padding: 0 12px;
}

:deep(.el-input__inner) {
  height: 40px;
  font-size: 14px;
}

:deep(.el-input__wrapper.is-focus) {
  border-color: #2b7dbf;
  box-shadow: 0 6px 18px rgba(43, 125, 191, 0.12);
}

// .remember-group {
//   display: flex;
//   justify-content: space-between;
//   align-items: center;
//   margin: 18px 0 12px;
// }

.button-group {
  margin-top: 14px;
  display: flex;
  justify-content: center;
}

.login-btn {
  width: 240px;
  height: 42px;
  border-radius: 4px;
  background: linear-gradient(90deg, #2b7dbf, #2ea0ff);
  border: none;
  color: #fff;
}

.register-tip {
  text-align: center;
  margin-top: 14px;
  color: #8b96a0;
}

// .footer-info {
//   margin-top: 18px;
//   text-align: center;
//   color: #9aa7b3;
//   font-size: 12px;
// }

@media (max-width: 1100px) {
  .login-card {
    max-width: 920px;
    height: 78vh;
  }
}

@media (max-width: 900px) {
  .login-wrapper {
    padding: 12px;
  }
  .login-card {
    flex-direction: column;
    height: 100vh;
    max-width: 100%;
    border-radius: 0;
  }
  .brand-panel,
  .form-panel {
    width: 100%;
    height: 50%;
  }
  .brand-panel {
    padding: 28px 18px;
  }
  .form-panel {
    padding: 28px 18px;
  }
}

@media (max-height: 640px) {
  .login-card {
    height: 86vh;
  }
}
</style>
