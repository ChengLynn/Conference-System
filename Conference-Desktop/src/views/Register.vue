<template>
  <div class="register-container">
    <!-- 科幻粒子背景 -->
    <div id="particles-js" class="particles-background"></div>

    <!-- 星空背景层 -->
    <div class="stars"></div>
    <div class="stars2"></div>
    <div class="stars3"></div>

    <!-- 流光背景 -->
    <div class="light-effect">
      <div class="light-line"></div>
      <div class="light-line"></div>
      <div class="light-line"></div>
    </div>

    <!-- 注册框 -->
    <div class="register-box sci-fi-box">
      <!-- 科技感标题 -->
      <div class="header-section">
        <div class="tech-icon">
          <div class="icon-circle">
            <div class="icon-pulse"></div>
          </div>
          <svg class="icon-svg" viewBox="0 0 24 24">
            <path
              d="M12,2L2,7L12,12L22,7L12,2Z M2,17L12,22L22,17M2,12L12,17L22,12"
              fill="none"
              stroke="#00f3ff"
              stroke-width="2"
            />
          </svg>
        </div>
        <h2 class="sci-fi-title">
          <span class="title-text">用户注册</span>
          <span class="title-sub">USER REGISTRATION</span>
        </h2>
        <div class="scan-line"></div>
      </div>

      <!-- 注册表单 -->
      <el-form
        ref="registerFormRef"
        :model="registerForm"
        :rules="registerRules"
        label-position="top"
        class="sci-fi-form"
      >
        <!-- 用户名输入 -->
        <div class="input-group">
          <div class="input-label">
            <span class="label-icon">
              <svg viewBox="0 0 24 24" width="18" height="18">
                <path
                  d="M12,4A4,4 0 0,1 16,8A4,4 0 0,1 12,12A4,4 0 0,1 8,8A4,4 0 0,1 12,4M12,14C16.42,14 20,15.79 20,18V20H4V18C4,15.79 7.58,14 12,14Z"
                  fill="#00f3ff"
                />
              </svg>
            </span>
            <span class="label-text">USER NAME</span>
          </div>
          <el-form-item prop="username" class="no-margin">
            <el-input
              v-model="registerForm.username"
              placeholder="请输入用户名(3-20个字符)"
              class="sci-fi-input"
              @focus="handleInputFocus('username')"
              @blur="handleInputBlur('username')"
            >
              <template #prefix>
                <div class="input-prefix">
                  <div :class="['input-dot', { active: inputActive.username }]"></div>
                  <span>NAME:</span>
                </div>
              </template>
            </el-input>
          </el-form-item>
          <div :class="['input-underline', { active: inputActive.username }]"></div>
        </div>

        <!-- 邮箱输入 -->
        <div class="input-group">
          <div class="input-label">
            <span class="label-icon">
              <svg viewBox="0 0 24 24" width="18" height="18">
                <path
                  d="M4,4H20A2,2 0 0,1 22,6V18A2,2 0 0,1 20,20H4C2.89,20 2,19.1 2,18V6C2,4.89 2.9,4 4,4M20,6L12,11L4,6H20M20,18V8L12,13L4,8V18H20Z"
                  fill="#00f3ff"
                />
              </svg>
            </span>
            <span class="label-text">EMAIL ADDRESS</span>
          </div>
          <el-form-item prop="email" class="no-margin">
            <el-input
              v-model="registerForm.email"
              placeholder="请输入邮箱地址"
              class="sci-fi-input"
              @focus="handleInputFocus('email')"
              @blur="handleInputBlur('email')"
            >
              <template #prefix>
                <div class="input-prefix">
                  <div :class="['input-dot', { active: inputActive.email }]"></div>
                  <span>MAIL:</span>
                </div>
              </template>
            </el-input>
          </el-form-item>
          <div :class="['input-underline', { active: inputActive.email }]"></div>
        </div>

        <!-- 密码输入 -->
        <div class="input-group">
          <div class="input-label">
            <span class="label-icon">
              <svg viewBox="0 0 24 24" width="18" height="18">
                <path
                  d="M12,17A2,2 0 0,0 14,15C14,13.89 13.1,13 12,13A2,2 0 0,0 10,15A2,2 0 0,0 12,17M18,8A2,2 0 0,1 20,10V20A2,2 0 0,1 18,22H6A2,2 0 0,1 4,20V10C4,8.89 4.9,8 6,8H7V6A5,5 0 0,1 12,1A5,5 0 0,1 17,6V8H18M12,3A3,3 0 0,0 9,6V8H15V6A3,3 0 0,0 12,3Z"
                  fill="#00f3ff"
                />
              </svg>
            </span>
            <span class="label-text">PASSWORD</span>
          </div>
          <el-form-item prop="password" class="no-margin">
            <el-input
              v-model="registerForm.password"
              type="password"
              placeholder="请输入密码(6-20个字符)"
              show-password
              class="sci-fi-input"
              @focus="handleInputFocus('password')"
              @blur="handleInputBlur('password')"
            >
              <template #prefix>
                <div class="input-prefix">
                  <div :class="['input-dot', { active: inputActive.password }]"></div>
                  <span>PWD:</span>
                </div>
              </template>
            </el-input>
          </el-form-item>
          <div :class="['input-underline', { active: inputActive.password }]"></div>
        </div>

        <!-- 确认密码输入 -->
        <div class="input-group">
          <div class="input-label">
            <span class="label-icon">
              <svg viewBox="0 0 24 24" width="18" height="18">
                <path
                  d="M12,17A2,2 0 0,0 14,15C14,13.89 13.1,13 12,13A2,2 0 0,0 10,15A2,2 0 0,0 12,17M18,8A2,2 0 0,1 20,10V20A2,2 0 0,1 18,22H6A2,2 0 0,1 4,20V10C4,8.89 4.9,8 6,8H7V6A5,5 0 0,1 12,1A5,5 0 0,1 17,6V8H18M12,3A3,3 0 0,0 9,6V8H15V6A3,3 0 0,0 12,3Z"
                  fill="#00f3ff"
                />
              </svg>
            </span>
            <span class="label-text">CONFIRM PASSWORD</span>
          </div>
          <el-form-item prop="confirmPassword" class="no-margin">
            <el-input
              v-model="registerForm.confirmPassword"
              type="password"
              placeholder="请再次输入密码"
              show-password
              class="sci-fi-input"
              @focus="handleInputFocus('confirmPassword')"
              @blur="handleInputBlur('confirmPassword')"
            >
              <template #prefix>
                <div class="input-prefix">
                  <div :class="['input-dot', { active: inputActive.confirmPassword }]"></div>
                  <span>CONFIRM:</span>
                </div>
              </template>
            </el-input>
          </el-form-item>
          <div :class="['input-underline', { active: inputActive.confirmPassword }]"></div>
        </div>

        <!-- 按钮组 -->
        <div class="button-group">
          <el-button
            type="primary"
            @click="handleRegister"
            :loading="loading"
            class="sci-fi-button register-btn"
          >
            <span class="btn-text">注册</span>
            <span class="btn-glow"></span>
            <span class="btn-pulse"></span>
          </el-button>

          <el-button @click="goToLogin" class="sci-fi-button back-btn">
            <span class="btn-text">返回登录</span>
            <span class="btn-glow"></span>
          </el-button>
        </div>
      </el-form>

      <!-- 底部信息 -->
      <div class="footer-info">
        <div class="version-info">
          <span>版本: V2.5.1</span>
          <span> | </span>
          <span>注册时间: {{ currentTime }}</span>
        </div>
      </div>

      <!-- 扫描线效果 -->
      <div class="scan-effect"></div>
    </div>

    <!-- 全息效果 -->
    <div class="hologram-effect">
      <div class="hologram-line"></div>
      <div class="hologram-line"></div>
      <div class="hologram-line"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'

declare global {
  interface Window {
    pJSDom?: any[]
    particlesJS?: any
  }
}

const router = useRouter()
const userStore = useUserStore()

const registerFormRef = ref()
const loading = ref(false)
const currentTime = ref('')
const inputActive = reactive({
  username: false,
  email: false,
  password: false,
  confirmPassword: false,
})

const registerForm = reactive({
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
})

const validatePassword = (rule: any, value: string, callback: any) => {
  if (value === '') {
    callback(new Error('请再次输入密码'))
  } else if (value !== registerForm.password) {
    callback(new Error('两次输入密码不一致!'))
  } else {
    callback()
  }
}

const registerRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' },
  ],
  email: [
    { required: true, message: '请输入邮箱地址', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱地址', trigger: ['blur', 'change'] },
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '长度在 6 到 20 个字符', trigger: 'blur' },
  ],
  confirmPassword: [
    { required: true, message: '请再次输入密码', trigger: 'blur' },
    { validator: validatePassword, trigger: 'blur' },
  ],
}

// 初始化粒子效果
const initParticles = () => {
  if (window.pJSDom && window.pJSDom.length > 0) {
    window.pJSDom[0].pJS.fn.vendors.destroypJS()
    window.pJSDom = []
  }

  particlesJS('particles-js', {
    particles: {
      number: {
        value: 150,
        density: {
          enable: true,
          value_area: 800,
        },
      },
      color: {
        value: ['#00f3ff', '#0099ff', '#8a2be2'],
      },
      shape: {
        type: 'circle',
        stroke: {
          width: 0,
          color: '#000000',
        },
      },
      opacity: {
        value: 0.5,
        random: true,
        anim: {
          enable: true,
          speed: 1,
          opacity_min: 0.1,
          sync: false,
        },
      },
      size: {
        value: 3,
        random: true,
        anim: {
          enable: true,
          speed: 2,
          size_min: 0.1,
          sync: false,
        },
      },
      line_linked: {
        enable: true,
        distance: 150,
        color: '#00f3ff',
        opacity: 0.2,
        width: 1,
      },
      move: {
        enable: true,
        speed: 1.5,
        direction: 'none',
        random: true,
        straight: false,
        out_mode: 'out',
        bounce: false,
        attract: {
          enable: false,
          rotateX: 600,
          rotateY: 1200,
        },
      },
    },
    interactivity: {
      detect_on: 'canvas',
      events: {
        onhover: {
          enable: true,
          mode: 'grab',
        },
        onclick: {
          enable: true,
          mode: 'push',
        },
      },
    },
    retina_detect: true,
  })
}

// 更新时间
const updateTime = () => {
  const now = new Date()
  currentTime.value = now
    .toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    })
    .replace(/\//g, '-')
}

const handleInputFocus = (field: 'username' | 'email' | 'password' | 'confirmPassword') => {
  inputActive[field] = true
}

const handleInputBlur = (field: 'username' | 'email' | 'password' | 'confirmPassword') => {
  inputActive[field] = false
}

const handleRegister = async () => {
  try {
    await registerFormRef.value.validate()
    loading.value = true

    // 添加注册动画效果
    const btn = document.querySelector('.register-btn')
    if (btn) {
      btn.classList.add('loading')
    }

    // 模拟网络延迟
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const success = await userStore.register(
      registerForm.username,
      registerForm.email,
      registerForm.password,
    )

    if (success) {
      // 注册成功效果
      const successEffect = document.createElement('div')
      successEffect.className = 'register-success'
      successEffect.innerHTML = '✓ 注册成功'
      document.querySelector('.register-box')?.appendChild(successEffect)

      setTimeout(() => {
        router.push('/login')
      }, 1500)
    }
  } catch (error) {
    console.error('注册失败:', error)
    // 注册失败效果
    const errorEffect = document.createElement('div')
    errorEffect.className = 'register-error'
    errorEffect.innerHTML = '✗ 注册失败'
    document.querySelector('.register-box')?.appendChild(errorEffect)
    setTimeout(() => errorEffect.remove(), 2000)
  } finally {
    loading.value = false
    const btn = document.querySelector('.register-btn')
    if (btn) {
      btn.classList.remove('loading')
    }
  }
}

const goToLogin = async () => {
  console.log('返回登录页面')
  console.log('当前登录状态:', userStore.isLoggedIn)

  userStore.logout()
  console.log('注销后登录状态:', userStore.isLoggedIn)

  await router.push('/login')
  console.log('导航完成')
}

onMounted(() => {
  // 初始化时间
  updateTime()
  const timeInterval = setInterval(updateTime, 1000)

  // 加载粒子效果库
  const script = document.createElement('script')
  script.src = 'https://cdn.jsdelivr.net/particles.js/2.0.0/particles.min.js'
  script.onload = () => {
    setTimeout(initParticles, 100)
  }
  document.head.appendChild(script)

  // 添加键盘快捷键
  const handleKeyPress = (e: KeyboardEvent) => {
    if (e.key === 'Enter' && !loading.value) {
      handleRegister()
    }
  }
  window.addEventListener('keypress', handleKeyPress)

  onUnmounted(() => {
    clearInterval(timeInterval)
    window.removeEventListener('keypress', handleKeyPress)
  })
})
</script>

<style scoped>
.register-container {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #0a0e17 0%, #1a1f2e 100%);
  overflow: hidden;
  font-family: 'Arial', sans-serif;
}

/* 粒子背景 */
.particles-background {
  position: fixed;
  width: 100%;
  height: 100%;
  z-index: 1;
}

/* 星空背景 */
.stars,
.stars2,
.stars3 {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.stars:after,
.stars2:after,
.stars3:after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: transparent;
  background-image:
    radial-gradient(2px 2px at 20px 30px, #eee, transparent),
    radial-gradient(2px 2px at 40px 70px, #fff, transparent),
    radial-gradient(1px 1px at 90px 40px, #fff, transparent),
    radial-gradient(1px 1px at 130px 80px, #fff, transparent),
    radial-gradient(2px 2px at 160px 120px, #ddd, transparent);
  background-repeat: repeat;
  background-size: 200px 200px;
  animation: stars 100s linear infinite;
  opacity: 0.5;
}

.stars2:after {
  background-image:
    radial-gradient(1px 1px at 50px 160px, #fff, transparent),
    radial-gradient(1px 1px at 90px 200px, #fff, transparent),
    radial-gradient(2px 2px at 120px 80px, #ddd, transparent);
  animation: stars 120s linear infinite;
  opacity: 0.4;
}

.stars3:after {
  background-image:
    radial-gradient(1px 1px at 190px 50px, #fff, transparent),
    radial-gradient(1px 1px at 150px 100px, #fff, transparent);
  animation: stars 150s linear infinite;
  opacity: 0.3;
}

/* 流光效果 */
.light-effect {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 2;
}

.light-line {
  position: absolute;
  width: 100%;
  height: 1px;
  background: linear-gradient(90deg, transparent, #00f3ff, transparent);
  opacity: 0.3;
  animation: lightMove 8s linear infinite;
}

.light-line:nth-child(2) {
  top: 30%;
  animation-delay: -2s;
}

.light-line:nth-child(3) {
  top: 70%;
  animation-delay: -4s;
}

/* 注册框样式 */
.register-box {
  position: relative;
  width: 480px;
  padding: 40px 35px;
  background: rgba(10, 14, 23, 0.85);
  border-radius: 12px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(0, 243, 255, 0.2);
  box-shadow:
    0 0 50px rgba(0, 243, 255, 0.1),
    inset 0 0 20px rgba(0, 243, 255, 0.05);
  z-index: 3;
  overflow: hidden;
}

.register-box:before {
  content: '';
  position: absolute;
  top: -2px;
  left: -2px;
  right: -2px;
  bottom: -2px;
  background: linear-gradient(45deg, #00f3ff, #0099ff, #8a2be2, #00f3ff);
  background-size: 400% 400%;
  border-radius: 14px;
  z-index: -1;
  animation: borderGlow 3s ease-in-out infinite;
  opacity: 0.5;
}

/* 头部样式 */
.header-section {
  text-align: center;
  margin-bottom: 40px;
  position: relative;
}

.tech-icon {
  position: relative;
  width: 80px;
  height: 80px;
  margin: 0 auto 20px;
}

.icon-circle {
  position: absolute;
  width: 100%;
  height: 100%;
  border: 2px solid rgba(0, 243, 255, 0.3);
  border-radius: 50%;
  animation: rotate 10s linear infinite;
}

.icon-pulse {
  position: absolute;
  width: 100%;
  height: 100%;
  border: 2px solid #00f3ff;
  border-radius: 50%;
  animation: pulse 2s ease-in-out infinite;
}

.icon-svg {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 40px;
  height: 40px;
}

.sci-fi-title {
  color: #fff;
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 2px;
}

.title-text {
  display: block;
  font-size: 24px;
  font-weight: bold;
  background: linear-gradient(45deg, #00f3ff, #0099ff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 5px;
}

.title-sub {
  display: block;
  font-size: 12px;
  color: rgba(0, 243, 255, 0.7);
  letter-spacing: 4px;
}

.scan-line {
  position: absolute;
  bottom: -15px;
  left: 0;
  width: 100%;
  height: 1px;
  background: linear-gradient(90deg, transparent, #00f3ff, transparent);
  animation: scan 3s linear infinite;
}

/* 表单样式 */
.sci-fi-form {
  margin: 30px 0;
}

.input-group {
  margin-bottom: 30px;
  position: relative;
}

.input-label {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
  color: rgba(0, 243, 255, 0.9);
  font-size: 12px;
  letter-spacing: 1px;
  text-transform: uppercase;
}

.label-icon {
  margin-right: 8px;
  display: flex;
  align-items: center;
}

.label-text {
  font-weight: bold;
}

.no-margin {
  margin-bottom: 0;
}

.sci-fi-input {
  :deep(.el-input__wrapper) {
    background: rgba(0, 20, 30, 0.6);
    border: 1px solid rgba(0, 243, 255, 0.3);
    border-radius: 4px;
    box-shadow: 0 0 10px rgba(0, 243, 255, 0.1) inset;
    padding: 0 15px;
  }

  :deep(.el-input__inner) {
    color: #00f3ff;
    font-family: 'Courier New', monospace;
    background: transparent;
  }

  :deep(.el-input__prefix) {
    color: rgba(0, 243, 255, 0.7);
    margin-right: 10px;
  }
}

.input-prefix {
  display: flex;
  align-items: center;
  gap: 8px;
}

.input-dot {
  width: 8px;
  height: 8px;
  background: rgba(0, 243, 255, 0.3);
  border-radius: 50%;
  transition: all 0.3s;
}

.input-dot.active {
  background: #00f3ff;
  box-shadow: 0 0 10px #00f3ff;
  animation: blink 1s infinite;
}

.input-underline {
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 0;
  height: 2px;
  background: linear-gradient(90deg, #00f3ff, #0099ff);
  transition: width 0.3s ease;
  opacity: 0;
}

.input-underline.active {
  width: 100%;
  opacity: 1;
}

/* 按钮样式 */
.button-group {
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-top: 40px;
}

.sci-fi-button {
  position: relative;
  height: 45px;
  border: none;
  border-radius: 4px;
  font-weight: bold;
  text-transform: uppercase;
  letter-spacing: 2px;
  overflow: hidden;
  transition: all 0.3s;
}

.sci-fi-button .btn-text {
  position: relative;
  z-index: 2;
}

.register-btn {
  background: linear-gradient(45deg, #0066ff, #00aaff);
  color: white;
}

.register-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 20px rgba(0, 102, 255, 0.4);
}

.back-btn {
  background: rgba(255, 255, 255, 0.1);
  color: rgba(0, 243, 255, 0.9);
  border: 1px solid rgba(0, 243, 255, 0.3);
}

.back-btn:hover {
  background: rgba(0, 243, 255, 0.1);
  border-color: #00f3ff;
}

.btn-glow {
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  transition: left 0.5s;
}

.sci-fi-button:hover .btn-glow {
  left: 100%;
}

.btn-pulse {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 0;
  height: 0;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.3);
  animation: none;
}

.register-btn.loading .btn-pulse {
  animation: buttonPulse 1s ease-out;
}

/* 底部信息 */
.footer-info {
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid rgba(0, 243, 255, 0.2);
  color: rgba(255, 255, 255, 0.6);
  font-size: 12px;
}

.status-text {
  color: rgba(255, 255, 255, 0.8);
}

/* 扫描效果 */
.scan-effect {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    to bottom,
    transparent 0%,
    rgba(0, 243, 255, 0.1) 50%,
    transparent 100%
  );
  animation: verticalScan 5s linear infinite;
  pointer-events: none;
  z-index: -1;
}

/* 全息效果 */
.hologram-effect {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 2;
  opacity: 0.1;
}

.hologram-line {
  position: absolute;
  width: 100%;
  height: 1px;
  background: linear-gradient(90deg, transparent, #00f3ff, transparent);
  opacity: 0.2;
}

.hologram-line:nth-child(1) {
  top: 20%;
  animation: hologram 10s linear infinite;
}

.hologram-line:nth-child(2) {
  top: 50%;
  animation: hologram 15s linear infinite;
  animation-delay: -5s;
}

.hologram-line:nth-child(3) {
  top: 80%;
  animation: hologram 20s linear infinite;
  animation-delay: -10s;
}

/* 动画定义 */
@keyframes stars {
  from {
    transform: translateY(0px);
  }
  to {
    transform: translateY(-200px);
  }
}

@keyframes lightMove {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

@keyframes borderGlow {
  0%,
  100% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@keyframes pulse {
  0%,
  100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.05);
    opacity: 0.7;
  }
}

@keyframes scan {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

@keyframes blink {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

@keyframes buttonPulse {
  0% {
    width: 0;
    height: 0;
    opacity: 1;
  }
  100% {
    width: 200px;
    height: 200px;
    opacity: 0;
  }
}

@keyframes verticalScan {
  0% {
    transform: translateY(-100%);
  }
  100% {
    transform: translateY(100%);
  }
}

@keyframes hologram {
  0% {
    transform: translateY(-100px) rotate(0deg);
  }
  100% {
    transform: translateY(100vh) rotate(360deg);
  }
}

/* 注册成功/失败效果 */
.register-success,
.register-error {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  padding: 15px 30px;
  border-radius: 4px;
  font-weight: bold;
  text-transform: uppercase;
  letter-spacing: 2px;
  z-index: 100;
  animation: fadeIn 0.5s;
}

.register-success {
  background: rgba(0, 255, 0, 0.2);
  color: #00ff00;
  border: 1px solid #00ff00;
}

.register-error {
  background: rgba(255, 0, 0, 0.2);
  color: #ff0000;
  border: 1px solid #ff0000;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0.8);
  }
  to {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1);
  }
}
</style>
