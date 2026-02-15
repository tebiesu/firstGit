<template>
  <el-row :gutter="16">
    <el-col :span="12">
      <el-card>
        <template #header>餐食分析</template>
        <el-form label-position="top" @submit.prevent>
          <el-form-item label="心情描述">
            <el-input v-model="moodText" type="textarea" :rows="3" />
          </el-form-item>
          <el-form-item label="饥饿程度 (0-10)">
            <el-slider v-model="hunger" :min="0" :max="10" />
          </el-form-item>
          <el-form-item label="压力程度 (0-10)">
            <el-slider v-model="stress" :min="0" :max="10" />
          </el-form-item>
          <el-form-item label="餐食图片">
            <input type="file" accept="image/*" multiple @change="onFileChange" />
          </el-form-item>
          <el-button type="primary" :loading="loading" @click="onAnalyze">开始分析</el-button>
        </el-form>
      </el-card>
    </el-col>

    <el-col :span="12">
      <el-card>
        <template #header>分析结果</template>
        <pre style="white-space: pre-wrap">{{ result ? JSON.stringify(result, null, 2) : '暂无结果' }}</pre>
      </el-card>
    </el-col>
  </el-row>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'

import { analyzeMeal } from '../api'

const moodText = ref('')
const hunger = ref(5)
const stress = ref(5)
const files = ref<File[]>([])
const loading = ref(false)
const result = ref<any>(null)

const onFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  files.value = Array.from(target.files || [])
}

const onAnalyze = async () => {
  loading.value = true
  const formData = new FormData()
  formData.append('mood_text', moodText.value)
  formData.append('hunger_level', String(hunger.value))
  formData.append('stress_level', String(stress.value))
  files.value.slice(0, 3).forEach((file) => formData.append('images', file))

  try {
    result.value = await analyzeMeal(formData)
    ElMessage.success('分析完成')
  } catch (error: any) {
    ElMessage.error(error?.response?.data?.detail || '分析失败')
  } finally {
    loading.value = false
  }
}
</script>
