<!-- src/views/meeting/MeetingEdit.vue -->
<template>
  <el-dialog
    v-model="visible"
    :title="mode === 'create' ? '新建会议' : '修改会议'"
    width="600px"
    :before-close="handleClose"
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="rules"
      label-width="100px"
      label-position="right"
    >
      <el-form-item label="会议名称" prop="name">
        <el-input v-model="formData.name" placeholder="请输入会议名称" maxlength="50" />
      </el-form-item>

      <el-form-item label="会议时间" prop="date">
        <el-date-picker
          v-model="formData.date"
          type="datetime"
          placeholder="请选择会议时间"
          value-format="YYYY-MM-DD HH:mm"
          style="width: 100%"
        />
      </el-form-item>

      <el-form-item label="会议地点" prop="location">
        <el-input v-model="formData.location" placeholder="请输入会议地点" maxlength="100" />
      </el-form-item>

      <el-form-item label="会议状态" prop="status">
        <el-select v-model="formData.status" placeholder="请选择会议状态" style="width: 100%">
          <el-option label="筹备中" value="preparing" />
          <el-option label="进行中" value="ongoing" />
          <el-option label="结束" value="finished" />
        </el-select>
      </el-form-item>

      <el-form-item label="会议描述">
        <el-input
          v-model="formData.description"
          type="textarea"
          :rows="4"
          placeholder="请输入会议描述"
          maxlength="500"
          show-word-limit
        />
      </el-form-item>

      <el-form-item label="主办单位">
        <el-input v-model="formData.organizer" placeholder="请输入主办单位" maxlength="100" />
      </el-form-item>

      <el-form-item label="参会人数限制">
        <el-input-number
          v-model="formData.maxParticipants"
          :min="0"
          :max="10000"
          placeholder="不限"
          style="width: 100%"
        />
      </el-form-item>

      <el-form-item label="费用设置">
        <el-input-number
          v-model="formData.fee"
          :min="0"
          :precision="2"
          placeholder="免费"
          style="width: 100%"
        >
          <template #prefix>¥</template>
        </el-input-number>
      </el-form-item>
    </el-form>

    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleCancel">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="loading"> 确定 </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { ElForm, ElMessage } from 'element-plus'
import type { FormRules } from 'element-plus'

const props = defineProps<{
  visible: boolean
  mode: 'create' | 'edit'
  meetingData?: any
}>()

const emit = defineEmits<{
  'update:visible': [value: boolean]
  save: [data: any]
}>()

const formRef = ref<InstanceType<typeof ElForm>>()
const loading = ref(false)
const formData = ref({
  id: 0,
  name: '',
  date: '',
  location: '',
  status: 'preparing',
  description: '',
  organizer: '',
  maxParticipants: 0,
  fee: 0,
})

// 表单验证规则
const rules = ref<FormRules>({
  name: [
    { required: true, message: '请输入会议名称', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' },
  ],
  date: [{ required: true, message: '请选择会议时间', trigger: 'change' }],
  location: [
    { required: true, message: '请输入会议地点', trigger: 'blur' },
    { min: 2, max: 100, message: '长度在 2 到 100 个字符', trigger: 'blur' },
  ],
  status: [{ required: true, message: '请选择会议状态', trigger: 'change' }],
})

// 监听传入的数据
watch(
  () => props.meetingData,
  (newVal) => {
    if (newVal) {
      formData.value = {
        id: newVal.id || 0,
        name: newVal.name || '',
        date: newVal.date || '',
        location: newVal.location || '',
        status: newVal.status || 'preparing',
        description: newVal.description || '',
        organizer: newVal.organizer || '',
        maxParticipants: newVal.maxParticipants || 0,
        fee: newVal.fee || 0,
      }
    }
  },
  { immediate: true },
)

// 计算弹窗是否显示
const visible = computed({
  get: () => props.visible,
  set: (value) => emit('update:visible', value),
})

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()
    loading.value = true

    // 模拟API调用
    setTimeout(() => {
      emit('save', { ...formData.value })
      loading.value = false
    }, 500)
  } catch (error) {
    console.error('表单验证失败:', error)
  }
}

// 取消
const handleCancel = () => {
  visible.value = false
}

// 关闭弹窗
const handleClose = () => {
  handleCancel()
}
</script>

<style scoped>
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>
