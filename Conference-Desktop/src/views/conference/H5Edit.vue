<!-- src/views/conference/H5Edit.vue -->
<template>
  <el-dialog
    v-model="visible"
    :title="getDialogTitle"
    width="1200px"
    :before-close="handleClose"
    :close-on-click-modal="false"
    class="h5-edit-dialog"
  >
    <div class="h5-edit-container">
      <!-- 左侧预览区域 -->
      <div class="preview-section">
        <!-- 会议名称 -->
        <div class="conference-name-input-group">
          <div class="input-prepend">会议名称</div>
          <el-input
            v-model="formData.conferenceName"
            placeholder="会议名称..."
            class="conference-name-input"
          />
        </div>

        <!-- 页面列表 -->
        <div class="page-list-section">
          <div class="page-list-header">
            <label class="section-label">页面列表</label>
            <div class="page-counter">
              共 <span class="count">{{ totalPages }}</span> 个页面
            </div>
          </div>

          <div class="page-tabs">
            <el-radio-group v-model="activePageType" class="page-tab-group">
              <el-radio-button label="home">主页</el-radio-button>
              <el-radio-button label="registration">报名页</el-radio-button>
              <el-radio-button label="confirmation">确认页</el-radio-button>
            </el-radio-group>
          </div>

          <!-- 页面内容区域 -->
          <div class="page-content">
            <!-- 主页内容 -->
            <div v-if="activePageType === 'home'" class="page-content-inner">
              <div class="photo-wall">
                <div
                  v-for="(item, index) in homePageImages"
                  :key="index"
                  :class="['photo-item', { selected: selectedImageIndex === index }]"
                  @click="selectHomeImage(index)"
                >
                  <img :src="item.url" :alt="item.name" />
                  <div class="photo-overlay">
                    <div class="photo-type">{{ item.name }}</div>
                    <div class="photo-sort">排序: {{ item.sort }}</div>
                    <div class="photo-actions">
                      <button class="photo-modify-btn" @click.stop="modifyHomeImage(index)">
                        修改
                      </button>
                      <button class="photo-delete-btn" @click.stop="deleteHomeImage(index)">
                        删除
                      </button>
                    </div>
                  </div>
                </div>
                <div class="photo-item add-photo-item" @click="addNewHomeImage">
                  <div class="add-photo-content">
                    <div class="add-icon">+</div>
                    <div class="add-text">新增图片</div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 报名页内容 -->
            <div v-if="activePageType === 'registration'" class="page-content-inner">
              <div class="preview-container">
                <div class="preview-page active">
                  <!-- 头部图片 -->
                  <div class="preview-image-container">
                    <img
                      :src="registrationHeaderImage"
                      class="preview-main-image"
                      alt="报名页头部图片"
                    />
                    <div class="preview-overlay">
                      <div class="preview-title">会议报名</div>
                      <div class="preview-desc">请填写以下信息完成报名</div>
                    </div>
                  </div>

                  <!-- 报名表单 -->
                  <div class="preview-form-container">
                    <div class="preview-form">
                      <div class="form-title">报名信息</div>
                      <div class="form-fields">
                        <!-- 必填字段 -->
                        <div class="form-field">
                          <label for="preview-name">姓名 *</label>
                          <input
                            type="text"
                            id="preview-name"
                            class="preview-input"
                            placeholder="请输入姓名"
                          />
                        </div>
                        <div class="form-field">
                          <label for="preview-company">单位 *</label>
                          <input
                            type="text"
                            id="preview-company"
                            class="preview-input"
                            placeholder="请输入单位名称"
                          />
                        </div>
                        <div class="form-field">
                          <label for="preview-position">职位 *</label>
                          <input
                            type="text"
                            id="preview-position"
                            class="preview-input"
                            placeholder="请输入职位"
                          />
                        </div>
                        <div class="form-field">
                          <label for="preview-phone">手机 *</label>
                          <input
                            type="tel"
                            id="preview-phone"
                            class="preview-input"
                            placeholder="请输入手机号码"
                          />
                        </div>

                        <!-- 选填字段 -->
                        <div v-if="formData.registrationFields.email" class="form-field">
                          <label for="preview-email">邮箱</label>
                          <input
                            type="email"
                            id="preview-email"
                            class="preview-input"
                            placeholder="请输入邮箱地址"
                          />
                        </div>
                        <div v-if="formData.registrationFields.lunch" class="form-field">
                          <label for="preview-lunch">是否参加自主午餐</label>
                          <select id="preview-lunch" class="preview-input">
                            <option value="">请选择</option>
                            <option value="yes">参加</option>
                            <option value="no">不参加</option>
                          </select>
                        </div>
                        <div v-if="formData.registrationFields.dinner" class="form-field">
                          <label for="preview-dinner">是否参加圆桌晚餐</label>
                          <select id="preview-dinner" class="preview-input">
                            <option value="">请选择</option>
                            <option value="yes">参加</option>
                            <option value="no">不参加</option>
                          </select>
                        </div>
                      </div>

                      <button class="preview-submit-btn">提交报名</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 确认页内容 -->
            <div v-if="activePageType === 'confirmation'" class="page-content-inner">
              <div class="confirmation-content">
                <h3>报名成功</h3>
                <p>您的报名信息已提交成功！</p>
                <div class="success-icon">✓</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧编辑区域 -->
      <div class="edit-section">
        <div class="form-content">
          <div class="section-title">页面编辑</div>

          <!-- 主页编辑表单 -->
          <div v-if="activePageType === 'home'" class="edit-form">
            <div class="form-group">
              <label for="pageName">请输入页面名称</label>
              <el-input
                v-model="currentHomeImage.name"
                placeholder="请输入页面名称"
                class="custom-input"
              />
            </div>

            <div class="form-group">
              <label for="pageOrder">请输入页面排序</label>
              <el-input-number
                v-model="currentHomeImage.sort"
                :min="1"
                :max="100"
                placeholder="请输入页面排序"
                class="custom-input"
              />
            </div>

            <div class="form-group">
              <label class="section-label">上传图片</label>
              <div
                class="upload-area"
                @click="triggerImageUpload"
                @dragover.prevent="handleDragOver"
                @dragleave="handleDragLeave"
                @drop.prevent="handleDrop"
                :class="{ dragover: isDragging }"
              >
                <div v-if="!currentHomeImage.url" class="upload-placeholder">
                  <div class="upload-icon">📷</div>
                  <div class="upload-text">点击上传页面图片</div>
                  <div class="upload-hint">建议尺寸：750x1334px</div>
                </div>
                <div v-else class="upload-preview">
                  <img :src="currentHomeImage.url" class="preview-image" alt="预览图片" />
                  <div class="preview-actions">
                    <button class="preview-btn" @click.stop="replaceImage">更换</button>
                    <button class="preview-btn remove-btn" @click.stop="removeImage">删除</button>
                  </div>
                </div>
                <input
                  ref="imageInput"
                  type="file"
                  accept="image/*"
                  style="display: none"
                  @change="handleImageUpload"
                />
              </div>
            </div>

            <div class="form-buttons">
              <el-button type="primary" @click="saveHomeImage" class="save-btn"> 加入 </el-button>
              <el-button @click="clearHomeImageForm" class="clear-btn"> 清空 </el-button>
            </div>
          </div>

          <!-- 报名页编辑表单 -->
          <div v-if="activePageType === 'registration'" class="edit-form">
            <div class="form-group">
              <label class="section-label">上传头部图片</label>
              <div
                class="upload-area"
                @click="triggerHeaderUpload"
                @dragover.prevent="handleDragOver"
                @dragleave="handleDragLeave"
                @drop.prevent="handleDrop"
                :class="{ dragover: isDragging }"
              >
                <div
                  v-if="!registrationHeaderImage || registrationHeaderImage.includes('placeholder')"
                  class="upload-placeholder"
                >
                  <div class="upload-icon">📷</div>
                  <div class="upload-text">点击上传头部图片</div>
                  <div class="upload-hint">建议尺寸：750x300px</div>
                </div>
                <div v-else class="upload-preview">
                  <img :src="registrationHeaderImage" class="preview-image" alt="头部图片" />
                  <div class="preview-actions">
                    <button class="preview-btn" @click.stop="replaceHeaderImage">更换</button>
                    <button class="preview-btn remove-btn" @click.stop="removeHeaderImage">
                      删除
                    </button>
                  </div>
                </div>
                <input
                  ref="headerInput"
                  type="file"
                  accept="image/*"
                  style="display: none"
                  @change="handleHeaderUpload"
                />
              </div>
            </div>

            <div class="form-group">
              <label class="section-label">报名表单勾选</label>
              <div class="checkbox-group">
                <div class="checkbox-item">
                  <el-checkbox v-model="formData.registrationFields.name" disabled
                    >姓名（必填）</el-checkbox
                  >
                </div>
                <div class="checkbox-item">
                  <el-checkbox v-model="formData.registrationFields.company" disabled
                    >单位（必填）</el-checkbox
                  >
                </div>
                <div class="checkbox-item">
                  <el-checkbox v-model="formData.registrationFields.position" disabled
                    >职位（必填）</el-checkbox
                  >
                </div>
                <div class="checkbox-item">
                  <el-checkbox v-model="formData.registrationFields.phone" disabled
                    >手机（必填）</el-checkbox
                  >
                </div>
                <div class="checkbox-item">
                  <el-checkbox v-model="formData.registrationFields.email"
                    >邮箱（选填）</el-checkbox
                  >
                </div>
                <div class="checkbox-item">
                  <el-checkbox v-model="formData.registrationFields.lunch"
                    >是否参加自主午餐（选填）</el-checkbox
                  >
                </div>
                <div class="checkbox-item">
                  <el-checkbox v-model="formData.registrationFields.dinner"
                    >是否参加圆桌晚餐（选填）</el-checkbox
                  >
                </div>
              </div>
            </div>
          </div>

          <!-- 确认页编辑表单 -->
          <div v-if="activePageType === 'confirmation'" class="edit-form">
            <div class="form-group">
              <label class="section-label">上传反馈页图片</label>
              <div class="upload-area" id="feedbackUpload">
                <div class="upload-placeholder">
                  <div class="upload-icon">📷</div>
                  <div class="upload-text">点击上传反馈页图片</div>
                  <div class="upload-hint">建议尺寸：750x1334px</div>
                </div>
                <input
                  type="file"
                  id="feedbackFileInput"
                  class="file-input"
                  accept="image/*"
                  style="display: none"
                />
              </div>
              <div class="upload-preview" id="feedbackPreview" style="display: none"></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleCancel">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="loading">
          {{ mode === 'create' ? '创建会议并生成H5页面' : '保存修改' }}
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const props = defineProps<{
  visible: boolean
  mode: 'view' | 'create' | 'edit'
  h5Data?: any
  conferenceInfo: any
}>()

const emit = defineEmits<{
  'update:visible': [value: boolean]
  save: [data: any]
}>()

// 表单数据
const formData = ref({
  conferenceName: '',
  homePageImages: [] as Array<{ url: string; name: string; sort: number }>,
  registrationHeaderImage: 'https://via.placeholder.com/750x300/4facfe/ffffff?text=报名页头部图片',
  registrationFields: {
    name: true,
    company: true,
    position: true,
    phone: true,
    email: false,
    lunch: false,
    dinner: false,
  },
  confirmationContent: '报名成功',
})

// UI状态
const activePageType = ref('home')
const selectedImageIndex = ref(-1)
const currentHomeImage = ref({
  url: '',
  name: '',
  sort: 1,
  originalIndex: -1,
})
const isDragging = ref(false)
const loading = ref(false)
const imageInput = ref<HTMLInputElement>()
const headerInput = ref<HTMLInputElement>()

// 计算属性
const getDialogTitle = computed(() => {
  const titles = {
    view: '查看H5页面',
    create: '创建H5页面',
    edit: '编辑H5页面',
  }
  return titles[props.mode]
})

const totalPages = computed(() => {
  return formData.value.homePageImages.length + 2 // 主页图片数 + 报名页 + 确认页
})

const homePageImages = computed(() => {
  return [...formData.value.homePageImages].sort((a, b) => a.sort - b.sort)
})

const registrationHeaderImage = computed(() => {
  return formData.value.registrationHeaderImage
})

const visible = computed({
  get: () => props.visible,
  set: (value) => emit('update:visible', value),
})

// 监听传入的数据
watch(
  () => props.h5Data,
  (newVal) => {
    if (newVal) {
      formData.value = {
        conferenceName: newVal.conferenceName || '',
        homePageImages: newVal.homePageImages || [],
        registrationHeaderImage:
          newVal.registrationHeaderImage ||
          'https://via.placeholder.com/750x300/4facfe/ffffff?text=报名页头部图片',
        registrationFields: {
          name: true,
          company: true,
          position: true,
          phone: true,
          email: newVal.registrationFields?.email || false,
          lunch: newVal.registrationFields?.lunch || false,
          dinner: newVal.registrationFields?.dinner || false,
        },
        confirmationContent: newVal.confirmationContent || '报名成功',
      }
    } else {
      // 初始化默认数据
      initDefaultData()
    }
  },
  { immediate: true },
)

// 初始化默认数据
function initDefaultData() {
  formData.value = {
    conferenceName: props.conferenceInfo?.name || '',
    homePageImages: [
      {
        url: 'https://www.hyqfocus.com/conference/static/uploads/8748379329_intro.jpg',
        name: '会议流程',
        sort: 1,
      },
      {
        url: 'https://www.hyqfocus.com/resource/images/176/img1763627860_270.jpg',
        name: '会议介绍',
        sort: 2,
      },
      {
        url: 'https://www.hyqfocus.com/resource/images/176/img1763627873_964.jpg',
        name: '会议特点',
        sort: 3,
      },
    ],
    registrationHeaderImage:
      'https://via.placeholder.com/750x300/4facfe/ffffff?text=报名页头部图片',
    registrationFields: {
      name: true,
      company: true,
      position: true,
      phone: true,
      email: false,
      lunch: false,
      dinner: false,
    },
    confirmationContent: '报名成功',
  }
}

// 选择主页图片
function selectHomeImage(index: number) {
  selectedImageIndex.value = index
  const image = homePageImages.value[index]
  currentHomeImage.value = {
    url: image.url,
    name: image.name,
    sort: image.sort,
    originalIndex: formData.value.homePageImages.findIndex((img) => img.url === image.url),
  }
}

// 添加新主页图片
function addNewHomeImage() {
  selectedImageIndex.value = -1
  currentHomeImage.value = {
    url: '',
    name: '',
    sort: formData.value.homePageImages.length + 1,
    originalIndex: -1,
  }
}

// 修改主页图片
function modifyHomeImage(index: number) {
  selectHomeImage(index)
}

// 删除主页图片
function deleteHomeImage(index: number) {
  const image = homePageImages.value[index]
  ElMessageBox.confirm(`确定要删除"${image.name}"吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(() => {
      formData.value.homePageImages = formData.value.homePageImages.filter(
        (img) => img.url !== image.url,
      )
      ElMessage.success('删除成功')
    })
    .catch(() => {
      // 取消删除
    })
}

// 保存主页图片
function saveHomeImage() {
  if (!currentHomeImage.value.name || !currentHomeImage.value.url) {
    ElMessage.warning('请填写图片名称并上传图片')
    return
  }

  if (currentHomeImage.value.originalIndex >= 0) {
    // 修改现有图片
    formData.value.homePageImages[currentHomeImage.value.originalIndex] = {
      url: currentHomeImage.value.url,
      name: currentHomeImage.value.name,
      sort: currentHomeImage.value.sort,
    }
    ElMessage.success('修改成功')
  } else {
    // 添加新图片
    formData.value.homePageImages.push({
      url: currentHomeImage.value.url,
      name: currentHomeImage.value.name,
      sort: currentHomeImage.value.sort,
    })
    ElMessage.success('添加成功')
  }

  // 清空表单
  clearHomeImageForm()
}

// 清空主页图片表单
function clearHomeImageForm() {
  currentHomeImage.value = {
    url: '',
    name: '',
    sort: formData.value.homePageImages.length + 1,
    originalIndex: -1,
  }
  selectedImageIndex.value = -1
}

// 触发图片上传
function triggerImageUpload() {
  imageInput.value?.click()
}

// 处理图片上传
function handleImageUpload(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  if (!file.type.match('image.*')) {
    ElMessage.warning('请上传图片文件')
    return
  }

  const reader = new FileReader()
  reader.onload = (e) => {
    currentHomeImage.value.url = e.target?.result as string
  }
  reader.readAsDataURL(file)

  // 重置input
  target.value = ''
}

// 触发头部图片上传
function triggerHeaderUpload() {
  headerInput.value?.click()
}

// 处理头部图片上传
function handleHeaderUpload(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  if (!file.type.match('image.*')) {
    ElMessage.warning('请上传图片文件')
    return
  }

  const reader = new FileReader()
  reader.onload = (e) => {
    formData.value.registrationHeaderImage = e.target?.result as string
  }
  reader.readAsDataURL(file)

  // 重置input
  target.value = ''
}

// 替换图片
function replaceImage() {
  triggerImageUpload()
}

// 删除图片
function removeImage() {
  currentHomeImage.value.url = ''
}

// 替换头部图片
function replaceHeaderImage() {
  triggerHeaderUpload()
}

// 删除头部图片
function removeHeaderImage() {
  formData.value.registrationHeaderImage =
    'https://via.placeholder.com/750x300/4facfe/ffffff?text=报名页头部图片'
}

// 拖拽相关函数
function handleDragOver() {
  isDragging.value = true
}

function handleDragLeave() {
  isDragging.value = false
}

function handleDrop(event: DragEvent) {
  isDragging.value = false
  const files = event.dataTransfer?.files
  if (!files || files.length === 0) return

  const file = files[0]
  if (!file.type.match('image.*')) {
    ElMessage.warning('请上传图片文件')
    return
  }

  const reader = new FileReader()
  reader.onload = (e) => {
    if (activePageType.value === 'home') {
      currentHomeImage.value.url = e.target?.result as string
    } else if (activePageType.value === 'registration') {
      formData.value.registrationHeaderImage = e.target?.result as string
    }
  }
  reader.readAsDataURL(file)
}

// 提交表单
async function handleSubmit() {
  if (!formData.value.conferenceName) {
    ElMessage.warning('请输入会议名称')
    return
  }

  loading.value = true

  try {
    // 模拟API调用
    await new Promise((resolve) => setTimeout(resolve, 1000))

    emit('save', {
      ...formData.value,
      conferenceName: formData.value.conferenceName,
      homePageImages: formData.value.homePageImages,
      registrationHeaderImage: formData.value.registrationHeaderImage,
      registrationFields: formData.value.registrationFields,
      confirmationContent: formData.value.confirmationContent,
    })

    ElMessage.success(props.mode === 'create' ? '创建成功' : '保存成功')
  } catch (error) {
    console.error('保存失败:', error)
    ElMessage.error('保存失败')
  } finally {
    loading.value = false
  }
}

// 取消
function handleCancel() {
  visible.value = false
}

// 关闭弹窗
function handleClose() {
  handleCancel()
}
</script>

<style scoped lang="scss">
.h5-edit-dialog {
  :deep(.el-dialog__body) {
    padding: 0;
  }
}

.h5-edit-container {
  display: flex;
  height: 700px;
  background: linear-gradient(135deg, #0c0c0c 0%, #3b3b3d 50%, #16213e 100%);
  color: #fff;
}

/* 左侧预览区域 */
.preview-section {
  flex: 1;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  overflow-y: auto;
}

/* 会议名称输入框 */
.conference-name-input-group {
  display: flex;
  margin-bottom: 10px;
}

.input-prepend {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-right: none;
  border-radius: 8px 0 0 8px;
  padding: 10px 20px;
  color: #00f2fe;
  font-size: 0.9rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 120px;
}

.conference-name-input {
  flex: 1;

  :deep(.el-input__inner) {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-left: none;
    border-radius: 0 8px 8px 0;
    color: white;
    font-size: 0.9rem;
    transition: all 0.3s ease;
    height: 42px;

    &:focus {
      outline: none;
      border-color: #00f2fe;
      box-shadow: 0 0 15px rgba(0, 242, 254, 0.3);
    }

    &::placeholder {
      color: #8892b0;
    }
  }
}

/* 页面列表区域 */
.page-list-section {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 15px;
  padding: 20px;
  flex: 1;
}

.page-list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.section-label {
  color: #00f2fe;
  font-size: 1rem;
  font-weight: 500;
}

.page-counter {
  color: #8892b0;
  font-size: 0.9rem;

  .count {
    color: #00f2fe;
    font-weight: 500;
  }
}

/* 页面标签页 */
.page-tabs {
  margin-bottom: 20px;
}

.page-tab-group {
  width: 100%;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.2);

  :deep(.el-radio-button) {
    flex: 1;

    .el-radio-button__inner {
      width: 100%;
      background: rgba(255, 255, 255, 0.05);
      border: none;
      color: #8892b0;
      padding: 10px 16px;
      font-size: 0.9rem;
      transition: all 0.3s ease;
      border-radius: 0;

      &:hover {
        background: rgba(255, 255, 255, 0.08);
        color: white;
      }
    }

    &:first-child .el-radio-button__inner {
      border-right: 1px solid rgba(255, 255, 255, 0.2);
    }

    &:last-child .el-radio-button__inner {
      border-left: 1px solid rgba(255, 255, 255, 0.2);
    }
  }

  :deep(.el-radio-button__orig-radio:checked + .el-radio-button__inner) {
    background: linear-gradient(135deg, #4facfe, #00f2fe);
    color: white;
    border-color: #00f2fe;
    box-shadow: 0 0 15px rgba(0, 242, 254, 0.6);
  }
}

/* 页面内容区域 */
.page-content {
  flex: 1;
  overflow-y: auto;
}

.page-content-inner {
  padding: 10px 0;
}

/* 照片墙样式 */
.photo-wall {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.photo-item {
  position: relative;
  border-radius: 6px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
  aspect-ratio: 1;
  border: 1px solid rgba(255, 255, 255, 0.1);

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    transition: transform 0.3s ease;
  }

  &:hover {
    transform: scale(1.05);
    box-shadow: 0 5px 15px rgba(0, 242, 254, 0.3);
    border-color: rgba(0, 242, 254, 0.5);

    img {
      transform: scale(1.1);
    }
  }

  &.selected {
    border: 2px solid #00f2fe;
    box-shadow: 0 0 15px rgba(0, 242, 254, 0.6);
  }
}

.photo-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  opacity: 0;
  transition: all 0.3s ease;
  backdrop-filter: blur(2px);

  .photo-item:hover & {
    opacity: 1;
  }
}

.photo-type {
  color: white;
  font-size: 0.9rem;
  margin-bottom: 5px;
  font-weight: 500;
  text-align: center;
}

.photo-sort {
  color: #8892b0;
  font-size: 0.75rem;
  margin-bottom: 15px;
  text-align: center;
}

.photo-actions {
  display: flex;
  gap: 8px;
}

.photo-modify-btn {
  background: #67c23a;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  color: white;
  cursor: pointer;
  font-size: 0.7rem;
  transition: all 0.3s ease;

  &:hover {
    background: #5daf34;
    transform: scale(1.05);
  }
}

.photo-delete-btn {
  background: #f56c6c;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  color: white;
  cursor: pointer;
  font-size: 0.7rem;
  transition: all 0.3s ease;

  &:hover {
    background: #e55c5c;
    transform: scale(1.05);
  }
}

/* 新增图片按钮样式 */
.add-photo-item {
  background: rgba(255, 255, 255, 0.05);
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px dashed rgba(255, 255, 255, 0.3);
  transition: all 0.3s ease;

  &:hover {
    background: rgba(0, 242, 254, 0.1);
    border-color: #00f2fe;
    transform: scale(1.05);
    box-shadow: 0 5px 15px rgba(0, 242, 254, 0.3);
  }
}

.add-photo-content {
  text-align: center;
  color: #8892b0;
  transition: all 0.3s ease;

  .add-photo-item:hover & {
    color: #00f2fe;
  }
}

.add-icon {
  font-size: 2rem;
  margin-bottom: 8px;
  font-weight: 300;
}

.add-text {
  font-size: 0.9rem;
  font-weight: 500;
}

/* 报名页预览样式 */
.preview-container {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  padding: 20px;
  position: relative;
  min-height: 400px;
}

.preview-image-container {
  position: relative;
  max-width: 375px;
  margin: 0 auto;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
}

.preview-main-image {
  width: 100%;
  height: auto;
  display: block;
}

.preview-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.8));
  padding: 30px 20px 20px;
  text-align: center;
}

.preview-title {
  color: white;
  font-size: 1.3rem;
  margin-bottom: 8px;
  font-weight: 500;
}

.preview-desc {
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.9rem;
  margin-bottom: 20px;
}

/* 表单预览样式 */
.preview-form-container {
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.95);
  padding: 10px;
  margin-top: -5px;
}

.preview-form {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05));
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  padding: 10px;
  position: relative;
  overflow: hidden;
}

.form-title {
  text-align: center;
  color: #333;
  margin-bottom: 10px;
  font-size: 1.2rem;
  font-weight: 500;
}

.form-fields {
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-bottom: 20px;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 5px;
  margin-top: 10px;

  label {
    color: #333;
    font-size: 0.9rem;
    font-weight: 500;
  }
}

.preview-input {
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 0.9rem;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: #00f2fe;
    box-shadow: 0 0 0 2px rgba(0, 242, 254, 0.2);
  }
}

.preview-submit-btn {
  width: 100%;
  padding: 15px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-size: 18px;
  cursor: pointer;
  margin-top: 10px;
  transition: transform 0.2s;
  border: none;
  border-radius: 8px;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(0, 242, 254, 0.4);
  }
}

/* 确认页样式 */
.confirmation-content {
  text-align: center;
  padding: 60px 20px;

  h3 {
    color: #00f2fe;
    font-size: 1.5rem;
    margin-bottom: 10px;
  }

  p {
    color: #8892b0;
    margin-bottom: 20px;
  }
}

.success-icon {
  font-size: 4rem;
  color: #67c23a;
}

/* 右侧编辑区域 */
.edit-section {
  width: 400px;
  padding: 20px;
  background: rgba(255, 255, 255, 0.03);
  border-left: 1px solid rgba(255, 255, 255, 0.1);
  overflow-y: auto;
}

.form-content {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  padding: 20px;
}

.section-title {
  color: #00f2fe;
  font-size: 1rem;
  font-weight: 500;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.edit-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;

  label {
    color: #00f2fe;
    font-size: 0.9rem;
    font-weight: 500;
  }
}

.custom-input {
  :deep(.el-input__inner) {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 8px;
    color: white;
    font-size: 0.9rem;
    transition: all 0.3s ease;
    height: 42px;

    &:focus {
      outline: none;
      border-color: #00f2fe;
      box-shadow: 0 0 15px rgba(0, 242, 254, 0.3);
    }

    &::placeholder {
      color: #8892b0;
    }
  }
}

:deep(.el-input-number) {
  width: 100%;

  .el-input-number__decrease,
  .el-input-number__increase {
    background: rgba(255, 255, 255, 0.1);
    color: white;
    border-color: rgba(255, 255, 255, 0.2);

    &:hover {
      color: #00f2fe;
    }
  }

  .el-input__inner {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.2);
    color: white;

    &:focus {
      border-color: #00f2fe;
    }
  }
}

/* 上传区域样式 */
.upload-area {
  background: rgba(255, 255, 255, 0.03);
  border: 2px dashed rgba(255, 255, 255, 0.2);
  border-radius: 10px;
  height: 120px;
  padding: 10px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;

  &:hover {
    border-color: #00f2fe;
    background: rgba(0, 242, 254, 0.05);
  }

  &.dragover {
    border-color: #00f2fe;
    background: rgba(0, 242, 254, 0.1);
  }
}

.upload-placeholder {
  color: #8892b0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100%;
}

.upload-icon {
  font-size: 2rem;
  margin-bottom: 10px;
}

.upload-text {
  font-size: 1rem;
  margin-bottom: 5px;
  color: #fff;
}

.upload-hint {
  font-size: 0.85rem;
  color: #8892b0;
}

.upload-preview {
  text-align: center;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.preview-image {
  max-width: 100%;
  max-height: 80px;
  border-radius: 8px;
  border: 2px solid rgba(0, 242, 254, 0.3);
  margin: 0 auto;
}

.preview-actions {
  margin-top: 10px;
  display: flex;
  gap: 10px;
  justify-content: center;
}

.preview-btn {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  padding: 5px 10px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.8rem;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
  }

  &.remove-btn {
    background: rgba(255, 107, 107, 0.2);
    border-color: #ff6b6b;

    &:hover {
      background: rgba(255, 107, 107, 0.3);
    }
  }
}

/* 复选框组样式 */
.checkbox-group {
  background: rgba(255, 255, 255, 0.03);
  padding: 4px;
}

.checkbox-item {
  display: flex;
  align-items: center;
  margin-bottom: 6px;
  padding: 4px;
  border-radius: 5px;
  transition: background 0.3s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.05);
  }

  :deep(.el-checkbox) {
    .el-checkbox__input {
      width: 18px;
      height: 18px;
      margin-right: 10px;
    }

    .el-checkbox__label {
      color: #fff;
      font-size: 0.95rem;
    }

    &.is-disabled {
      .el-checkbox__label {
        color: #00f2fe !important;
        font-weight: 500;
      }
    }
  }
}

/* 表单按钮 */
.form-buttons {
  display: flex;
  justify-content: center;
  gap: 20px;
  padding: 20px;
  margin-top: 20px;
}

.save-btn {
  background: linear-gradient(135deg, #00f2fe, #4facfe);
  border: none;
  color: white;
  padding: 10px 30px;
  border-radius: 5px;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    transform: scale(1.05);
    box-shadow: 0 5px 15px rgba(0, 242, 254, 0.4);
  }
}

.clear-btn {
  background: linear-gradient(135deg, #f56c6c, #e55c5c);
  border: none;
  color: white;
  padding: 10px 30px;
  border-radius: 5px;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    transform: scale(1.05);
    box-shadow: 0 5px 15px rgba(245, 108, 108, 0.4);
  }
}

/* 空提示 */
.empty-hint {
  color: #8892b0;
  font-size: 0.9rem;
  text-align: center;
  padding: 20px;
}

/* 对话框底部 */
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 20px;
  background: rgba(255, 255, 255, 0.03);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

:deep(.el-button) {
  &.el-button--primary {
    background: linear-gradient(135deg, #00f2fe, #4facfe);
    border: none;

    &:hover {
      background: linear-gradient(135deg, #4facfe, #00f2fe);
      transform: translateY(-2px);
      box-shadow: 0 5px 15px rgba(0, 242, 254, 0.4);
    }
  }
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .h5-edit-dialog {
    width: 95% !important;
    max-width: 1200px;
  }
}

@media (max-width: 992px) {
  .h5-edit-container {
    flex-direction: column;
    height: auto;
    max-height: 80vh;
  }

  .edit-section {
    width: 100%;
    border-left: none;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
  }
}
</style>
