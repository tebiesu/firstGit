<template>
  <section class="dashboard page-enter">
    <el-row :gutter="18">
      <el-col :xs="24" :lg="11">
        <el-card class="page-card input-card">
          <template #header>
            <div class="card-head">
              <h3>分析输入</h3>
              <span>填写情绪与餐食上下文</span>
            </div>
          </template>

          <el-form label-position="top" @submit.prevent>
            <el-form-item label="心情描述">
              <el-input v-model="moodText" type="textarea" :rows="4" placeholder="例如：今天开会密集，晚餐想吃高热量食物" />
            </el-form-item>

            <el-form-item label="饥饿程度 (0-10)">
              <el-slider v-model="hunger" :min="0" :max="10" show-input />
            </el-form-item>

            <el-form-item label="压力程度 (0-10)">
              <el-slider v-model="stress" :min="0" :max="10" show-input />
            </el-form-item>

            <el-form-item label="餐食图片 (最多 3 张)">
              <label class="upload-zone" for="meal-upload">
                <span>点击选择图片或替换文件</span>
                <small>支持常见图片格式</small>
              </label>
              <input id="meal-upload" class="hidden-file" type="file" accept="image/*" multiple @change="onFileChange" />

              <div class="file-list" v-if="files.length">
                <el-tag v-for="(file, index) in files.slice(0, 3)" :key="`${file.name}-${index}`" type="info" effect="plain">
                  {{ file.name }}
                </el-tag>
              </div>
            </el-form-item>

            <el-button class="analyze-btn" type="primary" :loading="loading" @click="onAnalyze">开始分析</el-button>
          </el-form>
        </el-card>
      </el-col>

      <el-col :xs="24" :lg="13">
        <el-card class="page-card result-card">
          <template #header>
            <div class="card-head">
              <h3>分析结果</h3>
              <span>结构化输出与原始数据</span>
            </div>
          </template>

          <div v-if="!result" class="empty-state">
            <h4>等待分析</h4>
            <p>提交左侧表单后，这里会呈现结果摘要与完整响应。</p>
          </div>

          <div v-else class="result-body">
            <div class="result-highlight">
              <p class="highlight-label">关键结论</p>
              <p class="highlight-text">{{ summaryText }}</p>
            </div>

            <el-descriptions :column="1" border class="result-kv" v-if="summaryItems.length">
              <el-descriptions-item v-for="item in summaryItems" :key="item.key" :label="item.key">
                {{ item.value }}
              </el-descriptions-item>
            </el-descriptions>

            <div class="json-block">
              <p>原始响应 JSON</p>
              <pre>{{ resultPreview }}</pre>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { ElMessage } from 'element-plus'

import { analyzeMeal } from '../api'

const moodText = ref('')
const hunger = ref(5)
const stress = ref(5)
const files = ref<File[]>([])
const loading = ref(false)
const result = ref<any>(null)

const summaryItems = computed(() => {
  if (!result.value || typeof result.value !== 'object') return []
  return Object.entries(result.value)
    .filter(([, value]) => ['string', 'number', 'boolean'].includes(typeof value))
    .slice(0, 6)
    .map(([key, value]) => ({ key, value: String(value) }))
})

const summaryText = computed(() => {
  if (!result.value) return '暂无结果'
  return (
    result.value.recommendation ||
    result.value.summary ||
    result.value.detail ||
    '分析已完成，请查看下方结构化字段与原始响应。'
  )
})

const resultPreview = computed(() => (result.value ? JSON.stringify(result.value, null, 2) : ''))

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

<style scoped>
.dashboard {
  animation-delay: 0.05s;
}

.card-head {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.card-head h3 {
  margin: 0;
  font-size: 22px;
  font-family: var(--font-display);
}

.card-head span {
  font-size: 13px;
  color: var(--color-text-muted);
}

.upload-zone {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 3px;
  padding: 14px;
  border: 1px dashed #b7ad9e;
  border-radius: var(--radius-sm);
  background: rgba(27, 111, 106, 0.05);
  cursor: pointer;
  transition: border-color 0.2s ease, background 0.2s ease;
}

.upload-zone:hover {
  border-color: var(--color-primary);
  background: rgba(27, 111, 106, 0.11);
}

.upload-zone small {
  color: var(--color-text-muted);
}

.hidden-file {
  display: none;
}

.file-list {
  margin-top: 10px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.analyze-btn {
  min-width: 130px;
  border-radius: 12px;
  font-weight: 600;
  transition: transform 0.2s ease;
}

.analyze-btn:active {
  transform: translateY(1px);
}

.empty-state {
  min-height: 300px;
  border: 1px dashed #c8bfae;
  border-radius: var(--radius-md);
  background: linear-gradient(160deg, #fffdf8, #f6f2e9);
  display: grid;
  place-items: center;
  text-align: center;
  padding: 22px;
}

.empty-state h4 {
  margin: 0;
  font-size: 24px;
  font-family: var(--font-display);
}

.empty-state p {
  margin: 8px 0 0;
  max-width: 320px;
  color: var(--color-text-muted);
}

.result-body {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.result-highlight {
  border: 1px solid rgba(27, 111, 106, 0.2);
  border-radius: var(--radius-md);
  padding: 14px;
  background: linear-gradient(145deg, rgba(27, 111, 106, 0.09), rgba(198, 125, 47, 0.08));
}

.highlight-label {
  margin: 0;
  font-size: 12px;
  letter-spacing: 0.6px;
  color: var(--color-text-muted);
}

.highlight-text {
  margin: 8px 0 0;
  line-height: 1.6;
}

.result-kv {
  border-radius: var(--radius-sm);
  overflow: hidden;
}

.json-block {
  border: 1px solid #ddd2c0;
  border-radius: var(--radius-sm);
  background: #f8f5ee;
  padding: 12px;
}

.json-block p {
  margin: 0;
  font-size: 12px;
  color: var(--color-text-muted);
}

.json-block pre {
  margin: 10px 0 0;
  max-height: 360px;
  overflow: auto;
  white-space: pre-wrap;
  word-break: break-all;
  font-size: 12px;
  line-height: 1.5;
}

@media (max-width: 1200px) {
  .input-card {
    margin-bottom: 14px;
  }
}
</style>
