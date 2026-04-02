<template>
  <div class="conference-form">
    <!-- 主要内容区域：三个卡片并排 -->
    <div class="cards-container">
      <!-- 卡片1: 编辑预览 -->
      <div class="card">
        <div class="card-header">
          <span>编辑预览</span>
        </div>
        <div class="card-content preview-content">
          <!-- 显示上传图片区域（立即报名模式 - 不显示表单） -->
          <div v-if="!showFormPreview" class="upload-section">
            <div
              class="upload-box"
              @click="triggerFileUpload"
              @dragover.prevent
              @drop.prevent="handleFileDrop"
              :class="{ 'no-border': currentPageImage || tempImageUrl }"
            >
              <!-- 显示上传中的临时预览（优先级最高） -->
              <div
                v-if="tempImageUrl"
                class="file-preview"
                :class="{ 'with-overlay-btn': isImmediateMode }"
              >
                <img :src="tempImageUrl" alt="临时预览" />
                <div class="file-info" v-if="!isImmediateMode">
                  <p>{{ tempFileName }}</p>
                  <div class="file-actions">
                    <el-button type="success" link @click.stop="savePageImage">保存</el-button>
                    <el-button type="info" link @click.stop="cancelUpload">取消</el-button>
                  </div>
                </div>
                <!-- 如果是立即报名模式，显示悬浮按钮 -->
                <div v-if="isImmediateMode" class="overlay-btn">
                  <button class="floating-btn">立即报名</button>
                </div>
              </div>

              <!-- 显示当前页面的图片（如果没有临时预览） -->
              <div
                v-else-if="currentPageImage"
                class="file-preview"
                :class="{ 'with-overlay-btn': isImmediateMode }"
              >
                <img :src="currentPageImage" alt="页面预览" />
                <div class="file-info" v-if="!isImmediateMode">
                  <p>{{ getPageImageName(currentEditPage) }}</p>
                  <div class="file-actions">
                    <el-button type="primary" link @click="triggerFileUpload">更换</el-button>
                  </div>
                </div>
                <!-- 如果是立即报名模式，显示悬浮按钮 -->
                <div v-if="isImmediateMode" class="overlay-btn">
                  <button class="floating-btn">立即报名</button>
                </div>
              </div>

              <!-- 默认显示上传界面 -->
              <div v-else class="upload-placeholder">
                <el-icon class="upload-icon"><Picture /></el-icon>
                <p class="upload-text">
                  将图像拖到此处，或选择<span class="highlight-text">“点击本地上传”</span>
                </p>
                <p class="upload-hint">图像格式为jpg、jpeg、png，</p>
                <p class="upload-hint">建议750*1624像素比例的图片，且>5M大小</p>
              </div>
            </div>

            <!-- 立即报名模式下的保存和取消按钮 -->
            <div
              v-if="isImmediateMode && (tempImageUrl || currentPageImage)"
              class="immediate-mode-footer"
            >
              <el-button type="success" @click="saveImmediatePage">保存</el-button>
              <el-button @click="cancelImmediateMode">取消</el-button>
            </div>

            <input
              ref="fileInput"
              type="file"
              accept="image/jpeg,image/png"
              style="display: none"
              @change="handleFileSelect"
            />
          </div>

          <!-- 显示表单预览区域（提交报名模式 - 显示表单供选择） -->
          <div v-else class="form-preview-wrapper">
            <!-- 编辑模式：显示带保存取消按钮的表单 -->
            <div class="form-preview-section">
              <!-- 活动封面预览 -->
              <div v-if="coverPreviewUrl" class="preview-cover">
                <img :src="coverPreviewUrl" alt="活动封面" />
              </div>

              <!-- 表单预览 -->
              <div class="preview-form-container">
                <h3 class="preview-title">报名信息</h3>

                <!-- 姓名（必填） -->
                <div class="preview-field">
                  <label class="required">姓名*</label>
                  <div class="preview-input">请输入您的姓名</div>
                </div>

                <!-- 公司/单位名称 -->
                <div v-if="formFields.company" class="preview-field">
                  <label class="required">公司/单位名称*</label>
                  <div class="preview-input">请输入公司/单位名称</div>
                </div>

                <!-- 职务 -->
                <div v-if="formFields.position" class="preview-field">
                  <label class="required">职务*</label>
                  <div class="preview-input">请输入您的职务</div>
                </div>

                <!-- 联系电话 -->
                <div v-if="formFields.phone" class="preview-field">
                  <label class="required">联系电话*</label>
                  <div class="preview-input">请输入您的联系电话</div>
                </div>

                <!-- 邮箱 -->
                <div v-if="formFields.email" class="preview-field">
                  <label>邮箱</label>
                  <div class="preview-input">请输入您的邮箱</div>
                </div>

                <!-- 自助午餐 -->
                <div v-if="formFields.lunch" class="preview-field">
                  <label class="required">自助午餐*</label>
                  <div class="preview-radio-group">
                    <span class="radio-option">是</span>
                    <span class="radio-option">否</span>
                  </div>
                </div>

                <!-- 晚宴 -->
                <div v-if="formFields.dinner" class="preview-field">
                  <label class="required">晚宴*</label>
                  <div class="preview-radio-group">
                    <span class="radio-option">是</span>
                    <span class="radio-option">否</span>
                  </div>
                </div>

                <!-- 名片上传 -->
                <div class="preview-field">
                  <label>名片上传（身份验证+邀约功能使用）</label>
                  <div class="preview-upload-area">
                    <div class="preview-upload-placeholder">将文件拖到此处，或点击上传</div>
                  </div>
                </div>

                <!-- 按钮区域 - 提交报名模式只显示提交报名按钮 -->
                <div class="preview-buttons">
                  <button class="preview-btn secondary">提交报名</button>
                </div>
              </div>

              <!-- 表单预览底部的保存和取消按钮 -->
              <div class="form-preview-footer">
                <el-button type="success" @click="saveFormPreview">保存</el-button>
                <el-button @click="cancelFormPreview">取消</el-button>
              </div>
            </div>

            <!-- 隐藏的截图区域：用于生成纯净的表单图片（不含保存取消按钮） -->
            <div
              class="form-preview-capture"
              style="position: fixed; left: -9999px; top: 0; z-index: -1"
            >
              <div class="form-preview-section-capture">
                <!-- 活动封面预览 -->
                <div v-if="coverPreviewUrl" class="preview-cover">
                  <img :src="coverPreviewUrl" alt="活动封面" />
                </div>

                <!-- 表单预览 -->
                <div class="preview-form-container">
                  <h3 class="preview-title">报名信息</h3>

                  <!-- 姓名（必填） -->
                  <div class="preview-field">
                    <label class="required">姓名*</label>
                    <div class="preview-input">请输入您的姓名</div>
                  </div>

                  <!-- 公司/单位名称 -->
                  <div v-if="formFields.company" class="preview-field">
                    <label class="required">公司/单位名称*</label>
                    <div class="preview-input">请输入公司/单位名称</div>
                  </div>

                  <!-- 职务 -->
                  <div v-if="formFields.position" class="preview-field">
                    <label class="required">职务*</label>
                    <div class="preview-input">请输入您的职务</div>
                  </div>

                  <!-- 联系电话 -->
                  <div v-if="formFields.phone" class="preview-field">
                    <label class="required">联系电话*</label>
                    <div class="preview-input">请输入您的联系电话</div>
                  </div>

                  <!-- 邮箱 -->
                  <div v-if="formFields.email" class="preview-field">
                    <label>邮箱</label>
                    <div class="preview-input">请输入您的邮箱</div>
                  </div>

                  <!-- 自助午餐 -->
                  <div v-if="formFields.lunch" class="preview-field">
                    <label class="required">自助午餐*</label>
                    <div class="preview-radio-group">
                      <span class="radio-option">是</span>
                      <span class="radio-option">否</span>
                    </div>
                  </div>

                  <!-- 晚宴 -->
                  <div v-if="formFields.dinner" class="preview-field">
                    <label class="required">晚宴*</label>
                    <div class="preview-radio-group">
                      <span class="radio-option">是</span>
                      <span class="radio-option">否</span>
                    </div>
                  </div>

                  <!-- 名片上传 -->
                  <div class="preview-field">
                    <label>名片上传（身份验证+邀约功能使用）</label>
                    <div class="preview-upload-area">
                      <div class="preview-upload-placeholder">将文件拖到此处，或点击上传</div>
                    </div>
                  </div>

                  <!-- 按钮区域 - 提交报名模式只显示提交报名按钮 -->
                  <div class="preview-buttons">
                    <button class="preview-btn secondary" type="button">提交报名</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 卡片2: 列表显示 -->
      <div class="card">
        <div class="card-header">
          <span>列表显示</span>
        </div>
        <div class="card-content list-content">
          <div class="list-items">
            <template v-for="(pageNum, index) in sortedPages" :key="pageNum">
              <!-- 页面项容器，包含列表项和添加按钮 -->
              <div
                class="page-item-wrapper"
                @mouseenter="hoveredPage = pageNum"
                @mouseleave="handleMouseLeave(pageNum)"
              >
                <!-- 页面列表项 -->
                <div class="list-item" :class="{ active: currentEditPage === pageNum }">
                  <div class="item-left">
                    <span class="page-number">第{{ pageNum }}页</span>
                  </div>
                  <div class="item-center" @click="editPage(pageNum)">
                    <div class="page-thumbnail">
                      <img
                        v-if="pageImages[pageNum]"
                        :src="pageImages[pageNum]"
                        :alt="'第' + pageNum + '页'"
                        class="thumbnail-image"
                      />
                      <el-icon v-else class="thumbnail-icon"><Picture /></el-icon>
                    </div>
                  </div>
                  <div class="item-right">
                    <el-button type="primary" link @click="editPage(pageNum)">
                      <el-icon><Edit /></el-icon>
                    </el-button>
                    <el-button type="danger" link @click="deletePage(pageNum)">
                      <el-icon><Delete /></el-icon>
                    </el-button>
                  </div>
                </div>

                <!-- 添加按钮 - 在鼠标悬浮的页面下方显示 -->
                <div v-if="hoveredPage === pageNum" class="add-page-item-inline">
                  <div class="add-page-content">
                    <el-button circle size="small" @click="addNewPageAfter(pageNum)">
                      <el-icon class="plus-icon"><Plus /></el-icon>
                    </el-button>
                    <span class="add-page-text">在此后添加新页</span>
                  </div>
                </div>
              </div>
            </template>
          </div>
        </div>
      </div>

      <!-- 卡片3: 页面编辑 -->
      <div class="card">
        <div class="card-header">
          <span>页面编辑</span>
        </div>
        <div class="card-content edit-content">
          <div class="form-section">
            <h3 class="section-title">表单添加</h3>
            <div class="form-fields">
              <div class="field-item checked">
                <el-checkbox v-model="formFields.name" checked disabled>姓名（必填）</el-checkbox>
                <div class="sub-fields">
                  <div class="sub-field">
                    <el-checkbox v-model="formFields.company" checked disabled
                      >公司/单位名称（必填）</el-checkbox
                    >
                  </div>
                  <div class="sub-field">
                    <el-checkbox v-model="formFields.position" checked disabled
                      >职务（必填）</el-checkbox
                    >
                  </div>
                  <div class="sub-field">
                    <el-checkbox v-model="formFields.phone" checked disabled
                      >联系电话（必填）</el-checkbox
                    >
                  </div>
                  <div class="sub-field">
                    <el-checkbox v-model="formFields.email" @change="handleFormFieldChange"
                      >邮箱（选填）</el-checkbox
                    >
                  </div>
                  <div class="sub-field">
                    <el-checkbox v-model="formFields.lunch" @change="handleFormFieldChange"
                      >是否参加自助午餐（必填）</el-checkbox
                    >
                  </div>
                  <div class="sub-field">
                    <el-checkbox v-model="formFields.dinner" @change="handleFormFieldChange"
                      >是否参加晚宴（必填）</el-checkbox
                    >
                  </div>
                </div>
              </div>
              <div class="add-option">
                <el-button type="primary" link @click="addNewField">
                  <el-icon><Plus /></el-icon>添加新选项
                </el-button>
              </div>
            </div>
          </div>

          <div class="component-section">
            <h3 class="section-title">组件添加</h3>
            <div class="component-item">
              <div class="component-label">顶部活动封面</div>
              <div class="cover-upload-area" @click="triggerCoverUpload">
                <div v-if="!coverUploaded" class="cover-placeholder">
                  <p>将文件拖到此处，或点击上传</p>
                </div>
                <div v-else class="cover-preview">
                  <img :src="coverPreviewUrl" alt="活动封面" />
                  <el-button type="primary" link @click.stop="changeCover">更换</el-button>
                </div>
              </div>
              <input
                ref="coverInput"
                type="file"
                accept="image/jpeg,image/png"
                style="display: none"
                @change="handleCoverSelect"
              />
            </div>

            <!-- 成功页背景图上传 - 为当前编辑页生成成功页 -->
            <div class="component-item">
              <div class="component-label">成功页背景图</div>
              <div class="cover-upload-area" @click="triggerSuccessBgUpload">
                <div v-if="!successBgPreviewUrl" class="cover-placeholder">
                  <p>将文件拖到此处，或点击上传</p>
                  <p class="upload-hint" style="margin-top: 8px">
                    上传背景图后，点击下方按钮即可为当前选中的第{{
                      currentEditPage
                    }}页生成成功页图片
                  </p>
                </div>
                <div v-else class="cover-preview">
                  <img :src="successBgPreviewUrl" alt="成功页背景" style="cursor: pointer" />
                  <el-button type="primary" link @click.stop="triggerSuccessBgUpload"
                    >更换背景</el-button
                  >
                </div>
              </div>
              <input
                ref="successBgInput"
                type="file"
                accept="image/jpeg,image/png"
                style="display: none"
                @change="handleSuccessBgSelect"
              />
            </div>

            <!-- 生成成功页按钮 - 为当前编辑页生成 -->
            <div class="component-item">
              <div class="component-label">生成成功页</div>
              <div class="button-group">
                <el-button
                  type="success"
                  @click="generateSuccessPageForCurrentPage"
                  :loading="isGeneratingSuccessPage"
                  style="width: 100%"
                >
                  <el-icon><Picture /></el-icon> 为第{{ currentEditPage }}页生成成功页
                </el-button>
                <el-button
                  v-if="pageImages[currentEditPage] && isPageSuccessPage(currentEditPage)"
                  type="primary"
                  @click="updateSuccessPageForCurrentPage"
                  :loading="isGeneratingSuccessPage"
                  style="width: 100%; margin-top: 12px"
                >
                  <el-icon><Refresh /></el-icon> 更新第{{ currentEditPage }}页成功页背景
                </el-button>
              </div>
              <p class="upload-hint" style="margin-top: 8px; color: #909399">
                点击后将使用当前背景图为第{{
                  currentEditPage
                }}页生成带有"✓"图标和"报名已提交，期待您的到来！"文字的成功页
              </p>
            </div>

            <div class="component-item">
              <div class="component-label">功能按钮</div>
              <div class="button-group">
                <el-button type="primary" @click="handleImmediateClick"> 立即报名 </el-button>
                <el-button type="primary" @click="handleSubmitClick"> 提交报名 </el-button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Picture, Plus, Edit, Delete, Refresh } from '@element-plus/icons-vue'
import html2canvas from 'html2canvas'

// 当前编辑的页面
const currentEditPage = ref(1)

// 文件上传相关
const fileInput = ref<HTMLInputElement>()
const tempImageUrl = ref('')
const tempFileName = ref('')

// 页面图片存储（初始有4页）
const pageImages = ref<Record<number, string>>({
  1: '',
  2: '',
  3: '',
  4: '',
})

// 获取排序后的页码列表
const sortedPages = computed(() => {
  return Object.keys(pageImages.value)
    .map(Number)
    .sort((a, b) => a - b)
})

// 当前页面的图片
const currentPageImage = computed(() => {
  return pageImages.value[currentEditPage.value]
})

// 获取页面图片名称
const getPageImageName = (page: number) => {
  return `第${page}页图片`
}

// 封面图上传相关
const coverInput = ref<HTMLInputElement>()
const coverUploaded = ref<File | null>(null)
const coverPreviewUrl = ref('')

// 成功页背景图上传相关
const successBgInput = ref<HTMLInputElement>()
const successBgPreviewUrl = ref('')
const isGeneratingSuccessPage = ref(false)

// 记录哪些页面是成功页（用于判断显示更新按钮）
const successPageRecords = ref<Set<number>>(new Set())

// 判断指定页面是否是成功页
const isPageSuccessPage = (pageNum: number) => {
  return successPageRecords.value.has(pageNum)
}

// 表单字段
const formFields = reactive({
  name: true,
  company: true,
  position: true,
  phone: true,
  email: false,
  lunch: true,
  dinner: true,
})

// 表单预览显示控制
const showFormPreview = ref(false)
// 立即报名模式标记
const isImmediateMode = ref(false)

// 生成成功页图片到指定页面
const generateSuccessPageToPage = async (targetPageNum: number, bgImageUrl: string) => {
  if (!bgImageUrl) {
    ElMessage.warning('请先上传成功页背景图')
    return false
  }

  // 确保背景图是有效的图片URL
  let backgroundStyle = ''
  if (bgImageUrl.startsWith('data:image')) {
    backgroundStyle = `background-image: url(${bgImageUrl}); background-size: cover; background-position: center;`
  } else {
    backgroundStyle = 'background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);'
  }

  // 创建成功页的HTML结构，图标和文字样式固定不变
  const successHtml = `
    <div style="width: 380px; position: relative; border-radius: 16px; overflow: hidden;">
      <div style="position: relative; width: 100%; ${backgroundStyle} min-height: 500px; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 60px 32px;">
        <div style="width: 40px; height: 40px; background-color: #4caf50; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2); margin-bottom: 20px;">
          <span style="color: white; font-size: 24px; font-weight: bold; line-height: 1;">✔</span>
        </div>
        <div style="font-size: 20px; font-weight: 500; color: white; text-align: center; text-shadow: 0 2px 8px rgba(0,0,0,0.2); line-height: 1.5; letter-spacing: 1px;">报名已提交，期待您的到来！</div>
      </div>
    </div>
  `

  const tempDiv = document.createElement('div')
  tempDiv.style.position = 'fixed'
  tempDiv.style.left = '-9999px'
  tempDiv.style.top = '0'
  tempDiv.innerHTML = successHtml
  document.body.appendChild(tempDiv)

  try {
    const canvas = await html2canvas(tempDiv.querySelector('div') as HTMLElement, {
      scale: 2,
      backgroundColor: null,
      useCORS: true,
    })
    const imageDataUrl = canvas.toDataURL('image/png')
    pageImages.value[targetPageNum] = imageDataUrl
    document.body.removeChild(tempDiv)
    return true
  } catch (error) {
    document.body.removeChild(tempDiv)
    console.error('生成成功页失败:', error)
    return false
  }
}

// 为当前编辑页生成成功页
const generateSuccessPageForCurrentPage = async () => {
  if (!successBgPreviewUrl.value) {
    ElMessage.warning('请先上传成功页背景图')
    return
  }

  isGeneratingSuccessPage.value = true
  ElMessage.info(`正在为第${currentEditPage.value}页生成成功页...`)

  const success = await generateSuccessPageToPage(currentEditPage.value, successBgPreviewUrl.value)

  if (success) {
    successPageRecords.value.add(currentEditPage.value)
    ElMessage.success(`成功页已生成并保存到第${currentEditPage.value}页`)
    // 清除临时预览，关闭相关模式
    tempImageUrl.value = ''
    tempFileName.value = ''
    showFormPreview.value = false
    isImmediateMode.value = false
  } else {
    ElMessage.error('生成成功页失败，请重试')
  }

  isGeneratingSuccessPage.value = false
}

// 更新当前编辑页的成功页背景
const updateSuccessPageForCurrentPage = async () => {
  if (!successBgPreviewUrl.value) {
    ElMessage.warning('请先上传成功页背景图')
    return
  }

  if (!pageImages.value[currentEditPage.value]) {
    ElMessage.warning('当前页面还没有成功页图片，请先点击"生成成功页"')
    return
  }

  ElMessage.info(`正在更新第${currentEditPage.value}页的成功页背景...`)

  const success = await generateSuccessPageToPage(currentEditPage.value, successBgPreviewUrl.value)

  if (success) {
    successPageRecords.value.add(currentEditPage.value)
    ElMessage.success(`第${currentEditPage.value}页的成功页背景已更新，文字和图标保持不变`)
    // 清除临时预览
    tempImageUrl.value = ''
    tempFileName.value = ''
  } else {
    ElMessage.error('更新成功页失败，请重试')
  }
}

// 生成带悬浮立即报名按钮的图片（立即报名模式专用）
const generateImmediateButtonImage = async (originalImageUrl: string, pageNum: number) => {
  const containerHtml = `
    <div style="position: relative; width: 380px; margin: 0 auto;">
      <img src="${originalImageUrl}" style="width: 100%; display: block; border-radius: 8px;" />
      <div style="position: absolute; bottom: 40px; left: 0; right: 0; text-align: center; pointer-events: none;">
        <button style="background: #409eff; color: white; border: none; padding: 12px 32px; border-radius: 40px; font-size: 16px; font-weight: 500; cursor: pointer; box-shadow: 0 2px 8px rgba(0,0,0,0.2); pointer-events: auto;">立即报名</button>
      </div>
    </div>
  `
  const tempDiv = document.createElement('div')
  tempDiv.style.position = 'fixed'
  tempDiv.style.left = '-9999px'
  tempDiv.style.top = '0'
  tempDiv.innerHTML = containerHtml
  document.body.appendChild(tempDiv)

  try {
    const canvas = await html2canvas(tempDiv.querySelector('div') as HTMLElement, {
      scale: 2,
      backgroundColor: '#ffffff',
      useCORS: true,
    })
    const imageDataUrl = canvas.toDataURL('image/png')
    pageImages.value[pageNum] = imageDataUrl
    document.body.removeChild(tempDiv)
    ElMessage.success(`第${pageNum}页已保存为立即报名样式（图片上悬浮按钮）`)
  } catch (error) {
    document.body.removeChild(tempDiv)
    console.error('生成立即报名图片失败:', error)
    ElMessage.error('生成立即报名图片失败')
  }
}

// 保存立即报名模式的图片
const saveImmediatePage = async () => {
  if (tempImageUrl.value) {
    await generateImmediateButtonImage(tempImageUrl.value, currentEditPage.value)
    tempImageUrl.value = ''
    tempFileName.value = ''
    isImmediateMode.value = false
  } else if (currentPageImage.value) {
    await generateImmediateButtonImage(currentPageImage.value, currentEditPage.value)
    isImmediateMode.value = false
  } else {
    ElMessage.warning('请先上传图片')
  }
}

// 取消立即报名模式
const cancelImmediateMode = () => {
  isImmediateMode.value = false
  tempImageUrl.value = ''
  tempFileName.value = ''
  ElMessage.info('已取消立即报名编辑')
}

// 处理表单字段变化
const handleFormFieldChange = () => {
  showFormPreview.value = true
  isImmediateMode.value = false
}

// 处理立即报名按钮点击
const handleImmediateClick = () => {
  showFormPreview.value = false
  isImmediateMode.value = true
  tempImageUrl.value = ''
  tempFileName.value = ''
  ElMessage.info('立即报名模式：请上传图片，图片上会显示悬浮的"立即报名"按钮')
}

// 处理提交报名按钮点击
const handleSubmitClick = () => {
  showFormPreview.value = true
  isImmediateMode.value = false
  ElMessage.info('提交报名模式：请编辑表单内容，然后点击保存生成图片')
}

// 保存表单预览 - 将当前表单配置保存为图片到当前编辑页
const saveFormPreview = async () => {
  const captureElement = document.querySelector('.form-preview-section-capture') as HTMLElement

  if (!captureElement) {
    ElMessage.error('无法获取表单预览区域')
    return
  }

  try {
    ElMessage.info('正在生成表单图片，请稍候...')
    const canvas = await html2canvas(captureElement, {
      scale: 2,
      backgroundColor: '#ffffff',
      useCORS: true,
      logging: false,
    })
    const imageDataUrl = canvas.toDataURL('image/png')
    pageImages.value[currentEditPage.value] = imageDataUrl
    tempImageUrl.value = ''
    tempFileName.value = ''

    ElMessage.success(`表单配置已保存为第${currentEditPage.value}页图片`)

    // 保存后关闭预览模式
    showFormPreview.value = false
    isImmediateMode.value = false
    await nextTick()
  } catch (error) {
    console.error('生成表单图片失败:', error)
    ElMessage.error('保存表单图片失败，请重试')
  }
}

// 取消表单预览
const cancelFormPreview = () => {
  showFormPreview.value = false
  isImmediateMode.value = false
  ElMessage.info('已取消表单编辑')
}

// 触发文件上传
const triggerFileUpload = () => {
  fileInput.value?.click()
}

// 处理文件选择
const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    processFile(file)
  }
  target.value = ''
}

// 处理文件拖拽
const handleFileDrop = (event: DragEvent) => {
  const file = event.dataTransfer?.files[0]
  if (file) {
    processFile(file)
  }
}

// 处理文件
const processFile = (file: File) => {
  if (!file.type.match('image/jpeg') && !file.type.match('image/png')) {
    ElMessage.error('请上传jpg、jpeg或png格式的图片')
    return
  }

  tempFileName.value = file.name
  const reader = new FileReader()
  reader.onload = (e) => {
    tempImageUrl.value = e.target?.result as string
  }
  reader.readAsDataURL(file)
  ElMessage.success('文件上传成功，点击保存按钮完成上传')
}

// 保存页面图片（普通模式）
const savePageImage = async () => {
  if (tempImageUrl.value) {
    pageImages.value[currentEditPage.value] = tempImageUrl.value
    tempImageUrl.value = ''
    tempFileName.value = ''
    ElMessage.success(`第${currentEditPage.value}页图片保存成功`)
  }
}

// 取消上传
const cancelUpload = () => {
  tempImageUrl.value = ''
  tempFileName.value = ''
  ElMessage.info('已取消上传')
}

// 触发封面图上传
const triggerCoverUpload = () => {
  coverInput.value?.click()
}

// 处理封面图选择
const handleCoverSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    processCover(file)
  }
  target.value = ''
}

// 处理封面图文件
const processCover = (file: File) => {
  if (!file.type.match('image/jpeg') && !file.type.match('image/png')) {
    ElMessage.error('请上传jpg、jpeg或png格式的图片')
    return
  }

  coverUploaded.value = file
  const reader = new FileReader()
  reader.onload = (e) => {
    coverPreviewUrl.value = e.target?.result as string
  }
  reader.readAsDataURL(file)
  ElMessage.success('封面图上传成功')
  showFormPreview.value = true
  isImmediateMode.value = false
}

// 更换封面图
const changeCover = () => {
  triggerCoverUpload()
}

// 触发成功页背景图上传
const triggerSuccessBgUpload = () => {
  successBgInput.value?.click()
}

// 处理成功页背景图选择
const handleSuccessBgSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    processSuccessBg(file)
  }
  target.value = ''
}

// 处理成功页背景图文件
const processSuccessBg = (file: File) => {
  if (!file.type.match('image/jpeg') && !file.type.match('image/png')) {
    ElMessage.error('请上传jpg、jpeg或png格式的图片')
    return
  }

  const reader = new FileReader()
  reader.onload = (e) => {
    successBgPreviewUrl.value = e.target?.result as string
    ElMessage.success(
      `成功页背景图上传成功，点击"生成成功页"按钮即可为第${currentEditPage.value}页生成成功页图片`,
    )
  }
  reader.readAsDataURL(file)
}

// 添加新字段
const addNewField = () => {
  ElMessage.info('添加新选项功能')
  showFormPreview.value = true
  isImmediateMode.value = false
}

// 编辑页面
const editPage = (page: number) => {
  currentEditPage.value = page
  tempImageUrl.value = ''
  tempFileName.value = ''
  showFormPreview.value = false
  isImmediateMode.value = false
  ElMessage.info(`正在编辑第${page}页`)
}

// 删除页面
const deletePage = (page: number) => {
  const currentPageCount = sortedPages.value.length
  if (currentPageCount <= 3) {
    ElMessage.warning('页面数量不能少于3页，无法删除')
    return
  }

  ElMessageBox.confirm(`确定要删除第${page}页吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(() => {
    // 如果删除的是成功页，从记录中移除
    if (successPageRecords.value.has(page)) {
      successPageRecords.value.delete(page)
    }

    const newPageImages: Record<number, string> = {}
    const pages = sortedPages.value.filter((p) => p !== page)

    pages.forEach((oldPageNum, index) => {
      const newPageNum = index + 1
      newPageImages[newPageNum] = pageImages.value[oldPageNum]
    })

    pageImages.value = newPageImages

    // 更新成功页记录中的页码
    const newSuccessPages = new Set<number>()
    successPageRecords.value.forEach((oldPageNum) => {
      if (oldPageNum > page) {
        newSuccessPages.add(oldPageNum - 1)
      } else if (oldPageNum < page) {
        newSuccessPages.add(oldPageNum)
      }
    })
    successPageRecords.value = newSuccessPages

    if (currentEditPage.value === page) {
      currentEditPage.value = 1
      tempImageUrl.value = ''
      tempFileName.value = ''
    } else if (currentEditPage.value > page) {
      currentEditPage.value = currentEditPage.value - 1
    }

    ElMessage.success(`第${page}页已删除`)
  })
}

// 添加新页面
// 添加鼠标悬浮的页面记录
const hoveredPage = ref<number | null>(null)
// 添加延迟隐藏的计时器
let hideTimer: any = null

// 处理鼠标移出，延迟隐藏添加按钮
const handleMouseLeave = (pageNum: number) => {
  // 延迟300ms再隐藏，给用户移动到添加按钮区域的时间
  hideTimer = setTimeout(() => {
    if (hoveredPage.value === pageNum) {
      hoveredPage.value = null
    }
  }, 300)
}

// 清除延迟计时器
const clearHideTimer = () => {
  if (hideTimer) {
    clearTimeout(hideTimer)
    hideTimer = null
  }
}

// 在指定页面后添加新页面
const addNewPageAfter = (targetPageNum: number) => {
  // 清除计时器，防止隐藏
  clearHideTimer()

  const currentPages = sortedPages.value
  const targetIndex = currentPages.indexOf(targetPageNum)

  if (targetIndex === -1) {
    ElMessage.error('操作失败：未找到目标页面')
    return
  }

  // 检查页面数量限制
  if (currentPages.length >= 20) {
    ElMessage.warning('页面数量已达到上限（20页），无法继续添加')
    return
  }

  const newPageImages: Record<number, string> = {}
  let newPageCounter = 1

  // 重新构建页面顺序
  for (let i = 0; i < currentPages.length; i++) {
    const oldPageNum = currentPages[i]

    if (i === targetIndex) {
      // 先添加当前页面
      newPageImages[newPageCounter] = pageImages.value[oldPageNum]
      newPageCounter++
      // 添加新页面
      newPageImages[newPageCounter] = ''
      newPageCounter++
    } else {
      newPageImages[newPageCounter] = pageImages.value[oldPageNum]
      newPageCounter++
    }
  }

  pageImages.value = newPageImages

  // 更新成功页记录中的页码
  const newSuccessPages = new Set<number>()
  let newPageCounterForSuccess = 1

  for (let i = 0; i < currentPages.length; i++) {
    const oldPageNum = currentPages[i]

    if (i === targetIndex) {
      // 当前页面
      if (successPageRecords.value.has(oldPageNum)) {
        newSuccessPages.add(newPageCounterForSuccess)
      }
      newPageCounterForSuccess++
      // 新页面（不是成功页）
      newPageCounterForSuccess++
    } else {
      if (successPageRecords.value.has(oldPageNum)) {
        newSuccessPages.add(newPageCounterForSuccess)
      }
      newPageCounterForSuccess++
    }
  }

  successPageRecords.value = newSuccessPages

  // 如果当前编辑的页面在目标页面之后，需要更新当前编辑页码
  if (currentEditPage.value > targetPageNum) {
    currentEditPage.value = currentEditPage.value + 1
  } else if (currentEditPage.value === targetPageNum) {
    // 如果编辑的是目标页面，保持编辑该页面
    // 不做改变
  }

  ElMessage.success(`已在第${targetPageNum}页后添加新页面`)

  // 添加完成后，清除悬浮状态
  setTimeout(() => {
    hoveredPage.value = null
    clearHideTimer()
  }, 100)
}

// 修改原有的 addNewPage 函数（如果还保留原功能的话）
const addNewPage = () => {
  const currentPages = sortedPages.value
  const indexOfPage2 = currentPages.indexOf(2)

  if (indexOfPage2 !== -1) {
    const newPageImages: Record<number, string> = {}
    newPageImages[1] = pageImages.value[1]
    newPageImages[2] = pageImages.value[2]
    newPageImages[3] = ''
    const pagesAfterPage2 = currentPages.filter((p) => p > 2)
    pagesAfterPage2.forEach((oldPageNum, index) => {
      const newPageNum = oldPageNum + 1
      newPageImages[newPageNum] = pageImages.value[oldPageNum]
    })
    pageImages.value = newPageImages

    // 更新成功页记录中的页码
    const newSuccessPages = new Set<number>()
    successPageRecords.value.forEach((oldPageNum) => {
      if (oldPageNum > 2) {
        newSuccessPages.add(oldPageNum + 1)
      } else {
        newSuccessPages.add(oldPageNum)
      }
    })
    successPageRecords.value = newSuccessPages

    ElMessage.success('已在第2页和第3页之间插入新页面')
  } else {
    ElMessage.error('操作失败：未找到第2页')
  }
}
// 加载会议数据（用于编辑模式）
const loadMeetingData = (meeting: any) => {
  if (!meeting) return

  console.log('加载会议数据:', meeting)

  // 加载页面图片
  if (meeting.pageImages && Object.keys(meeting.pageImages).length > 0) {
    pageImages.value = { ...meeting.pageImages }
  } else {
    pageImages.value = {
      1: '',
      2: '',
      3: '',
      4: '',
    }
  }

  // 加载封面图
  if (meeting.coverPreviewUrl) {
    coverPreviewUrl.value = meeting.coverPreviewUrl
    coverUploaded.value = new File([], 'cover')
  } else {
    coverPreviewUrl.value = ''
    coverUploaded.value = null
  }

  // 加载表单字段配置
  if (meeting.formFields) {
    formFields.name = meeting.formFields.name ?? true
    formFields.company = meeting.formFields.company ?? true
    formFields.position = meeting.formFields.position ?? true
    formFields.phone = meeting.formFields.phone ?? true
    formFields.email = meeting.formFields.email ?? false
    formFields.lunch = meeting.formFields.lunch ?? true
    formFields.dinner = meeting.formFields.dinner ?? true
  }

  // 更新成功页记录
  successPageRecords.value.clear()
  const pages = sortedPages.value
  pages.forEach((page) => {
    const pageImage = pageImages.value[page]
    if (pageImage && (pageImage.includes('success') || pageImage.includes('4caf50'))) {
      successPageRecords.value.add(page)
    }
  })

  // 重置编辑状态
  currentEditPage.value = 1
  tempImageUrl.value = ''
  tempFileName.value = ''
  showFormPreview.value = false
  isImmediateMode.value = false

  ElMessage.success(`已加载会议"${meeting.title}"的数据`)
}

// 重置表单（用于新建模式）
const resetForm = () => {
  pageImages.value = {
    1: '',
    2: '',
    3: '',
    4: '',
  }
  coverPreviewUrl.value = ''
  coverUploaded.value = null
  successBgPreviewUrl.value = ''
  successPageRecords.value.clear()
  formFields.name = true
  formFields.company = true
  formFields.position = true
  formFields.phone = true
  formFields.email = false
  formFields.lunch = true
  formFields.dinner = true
  showFormPreview.value = false
  isImmediateMode.value = false
  tempImageUrl.value = ''
  tempFileName.value = ''
  currentEditPage.value = 1
}

// 暴露给父组件的方法和数据
defineExpose({
  pageImages,
  currentEditPage,
  sortedPages,
  formFields,
  coverPreviewUrl,
  successBgPreviewUrl,
  loadMeetingData,
  resetForm,
})
</script>

<style scoped>
/* 所有样式保持不变 */
.conference-form {
}

/* 三个卡片容器 */
.cards-container {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  height: calc(100vh - 300px);
}

/* 卡片通用样式 */
.card {
  background: #ffffff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  display: flex;
  flex-direction: column;
}

.card-header {
  padding: 16px;
  background: #fafafa;
  border-bottom: 1px solid #ebeef5;
  font-weight: 500;
  color: #303133;
  text-align: center;
}

.card-content {
  padding: 20px;
  flex: 1;
  overflow-y: auto;
}

/* 卡片1: 编辑预览 */
.preview-content {
  min-height: 400px;
}

/* 上传区域样式 */
.upload-section {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.upload-box {
  border: 2px dashed #dcdfe6;
  border-radius: 8px;
  padding: 40px 20px;
  text-align: center;
  background: #fafafa;
  cursor: pointer;
  transition: all 0.3s;
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.upload-box.no-border {
  border: none;
  padding: 0;
  background: transparent;
  cursor: default;
}

.upload-box:hover {
  border-color: #409eff;
  background: #ecf5ff;
}

.upload-box.no-border:hover {
  border: none;
  background: transparent;
}

.upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.upload-icon {
  font-size: 48px;
  color: #909399;
  margin-bottom: 8px;
}

.upload-text {
  font-size: 14px;
  color: #606266;
  margin: 0;
}

.highlight-text {
  color: #409eff;
  cursor: pointer;
  font-weight: 500;
}

.upload-hint {
  font-size: 12px;
  color: #909399;
  margin: 2px 0;
}

.file-preview {
  text-align: center;
  width: 100%;
  position: relative;
}

.file-preview img {
  max-width: 100%;
  max-height: calc(100vh - 550px);
  min-height: 200px;
  border-radius: 4px;
  margin-bottom: 12px;
  object-fit: contain;
}

.file-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.file-actions {
  display: flex;
  gap: 16px;
}

.immediate-mode-footer {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 12px 0;
  border-top: 1px solid #ebeef5;
  background: #fafafa;
}

.file-preview.with-overlay-btn {
  position: relative;
}

.overlay-btn {
  position: absolute;
  bottom: 40px;
  left: 0;
  right: 0;
  text-align: center;
  pointer-events: none;
}

.floating-btn {
  background: #409eff;
  color: white;
  border: none;
  padding: 10px 28px;
  border-radius: 40px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  pointer-events: auto;
  transition: transform 0.2s;
}

.floating-btn:hover {
  transform: scale(1.02);
  background: #66b1ff;
}

/* 表单预览样式 */
.form-preview-wrapper {
  width: 100%;
}

.form-preview-section {
  background: #ffffff;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 16px;
}

.form-preview-section-capture {
  background: #ffffff;
  border-radius: 8px;
  overflow: hidden;
  width: 100%;
  max-width: 500px;
}

.preview-cover img {
  width: 100%;
  height: auto;
  display: block;
}

.preview-form-container {
  padding: 20px;
  background: #ffffff;
}

.preview-title {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 20px 0;
  text-align: center;
}

.preview-field {
  margin-bottom: 16px;
}

.preview-field label {
  display: block;
  font-size: 14px;
  color: #606266;
  margin-bottom: 8px;
  font-weight: 500;
}

.preview-field label.required::after {
  content: '*';
  color: #f56c6c;
  margin-left: 4px;
}

.preview-input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  font-size: 14px;
  color: #909399;
  background-color: #fafafa;
}

.preview-radio-group {
  display: flex;
  gap: 20px;
}

.radio-option {
  padding: 5px 12px;
  background: #f5f7fa;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  font-size: 14px;
  color: #606266;
  cursor: not-allowed;
}

.preview-upload-area {
  border: 1px dashed #dcdfe6;
  border-radius: 4px;
  padding: 16px;
  text-align: center;
  background: #fafafa;
}

.preview-upload-placeholder {
  font-size: 12px;
  color: #909399;
}

.preview-buttons {
  display: flex;
  gap: 12px;
  margin-top: 24px;
}

.preview-btn {
  flex: 1;
  padding: 10px 16px;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  cursor: not-allowed;
  transition: all 0.3s;
}

.preview-btn.primary {
  background: #409eff;
  color: #ffffff;
}

.preview-btn.secondary {
  background: #ffffff;
  color: #409eff;
  border: 1px solid #409eff;
}

.form-preview-footer {
  padding: 16px 20px;
  border-top: 1px solid #ebeef5;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  background: #fafafa;
}

/* 卡片2: 列表显示样式 */
.list-content {
  min-height: 400px;
  display: flex;
  flex-direction: column;
}

.list-items {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.list-item {
  display: flex;
  align-items: center;
  padding: 12px 8px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  background: #ffffff;
  border: 1px solid #ebeef5;
}

.list-item:hover {
  background: #f5f7fa;
}

.list-item.active {
  border-color: #409eff;
  box-shadow: 0 2px 12px rgba(64, 158, 255, 0.1);
}

.item-left {
  width: 50px;
  display: flex;
  align-items: center;
}

.page-number {
  font-size: 14px;
  color: #303133;
  font-weight: 500;
}

.item-center {
  flex: 1;
  display: flex;
  justify-content: center;
  cursor: pointer;
}

.page-thumbnail {
  width: 88.04px;
  height: 128.05px;
  background: #f5f7fa;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #dcdfe6;
  overflow: hidden;
}

.thumbnail-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.thumbnail-icon {
  font-size: 32px;
  color: #909399;
}

.item-right {
  width: 80px;
  display: flex;
  justify-content: flex-end;
  gap: 4px;
}

.add-page-item {
  justify-content: center;
  border: 1px dashed #dcdfe6;
}

.add-page-item .item-center {
  justify-content: center;
}

.el-button + .el-button {
  margin-left: 0;
}

/* 卡片3样式 */
.edit-content {
  min-height: 400px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 16px 0;
  padding-bottom: 8px;
  border-bottom: 1px solid #ebeef5;
}

.form-section {
  width: 100%;
}

.form-fields {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.field-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.field-item.checked {
  color: #303133;
}

.sub-fields {
  margin-left: 24px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.sub-field {
  display: flex;
  align-items: center;
}

.add-option {
  margin-top: 8px;
  margin-left: 24px;
}

.component-section {
  width: 100%;
}

.component-item {
  margin-bottom: 20px;
}

.component-label {
  font-size: 14px;
  color: #606266;
  margin-bottom: 8px;
}

.cover-upload-area {
  border: 2px dashed #dcdfe6;
  border-radius: 8px;
  padding: 20px;
  text-align: center;
  background: #fafafa;
  cursor: pointer;
  transition: all 0.3s;
}

.cover-upload-area:hover {
  border-color: #409eff;
  background: #ecf5ff;
}

.cover-placeholder {
  color: #909399;
  font-size: 14px;
}

.cover-preview {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.cover-preview img {
  max-width: 100px;
  max-height: 60px;
  border-radius: 4px;
  object-fit: cover;
  cursor: pointer;
}

.button-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

:deep(.el-checkbox) {
  margin-right: 0;
  width: 100%;
}

:deep(.el-checkbox__label) {
  font-size: 14px;
  color: #606266;
}

:deep(.el-checkbox.is-checked .el-checkbox__label) {
  color: #409eff;
  font-weight: 500;
}

/* 页面项包装器样式 */
.page-item-wrapper {
  margin-bottom: 8px;
}

/* 添加按钮行内样式 */
.add-page-item-inline {
  margin-top: 8px;
  padding: 8px;
  background: #f0f9ff;
  border: 1px solid #409eff;
  border-radius: 8px;
  animation: fadeIn 0.2s ease;
  transition: all 0.2s;
}

.add-page-item-inline:hover {
  background: #e6f4ff;
  border-color: #66b1ff;
}

.add-page-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
}

.add-page-text {
  font-size: 12px;
  color: #409eff;
  font-weight: 500;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-5px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
