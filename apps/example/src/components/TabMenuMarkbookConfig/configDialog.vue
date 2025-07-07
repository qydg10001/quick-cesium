<template>
  <el-dialog v-model="visible" title="书签配置" width="300" destroy-on-close append-to-body>
    <el-form :model="ruleForm" label-width="100px">
      <el-form-item label="跳转方式" prop="type">
        <el-radio-group v-model="ruleForm.type">
          <el-radio-button label="飞行" value="fly" />
          <el-radio-button label="直接跳转" value="zoom" />
        </el-radio-group>
      </el-form-item>
      <el-form-item label="飞行时间(s)" prop="duration">
        <el-input-number
          v-model="ruleForm.duration"
          :precision="1"
          :min="0.5"
          :disabled="ruleForm.type === 'zoom'"
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button type="success" size="small" @click="ok">确 定</el-button>
      <el-button type="warning" size="small" @click="cancel">取 消</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { useCesiumViewerStore } from '@/stores/cesiumViewer'
import {
  TcctBookmarkZoomType,
  type ITcctViewerBookmark,
  type ITcctBookmarkSetting,
} from '@quick-cesium/sdk/src'

const { getBookmarkStore } = useCesiumViewerStore()

const visible = defineModel<boolean>({
  type: Boolean,
  default: false,
})
const ruleForm = ref<ITcctBookmarkSetting>({
  type: TcctBookmarkZoomType.Fly, // 默认飞行跳转
  duration: 2,
})
let bookmarkStore: ITcctViewerBookmark | null = null

watch(
  () => visible.value,
  (val) => {
    if (val) {
      bookmarkStore = getBookmarkStore()
      if (!bookmarkStore) {
        // console.warn('获取书签配置信息失败')
        ElMessage({
          message: '获取书签配置信息失败',
          type: 'warning',
        })
        visible.value = false
      }

      ruleForm.value = bookmarkStore.config
    }
  },
)

const ok = () => {
  if (!bookmarkStore) return
  bookmarkStore.setConfig(ruleForm.value)
  visible.value = false
}

const cancel = () => {
  visible.value = false
}
</script>

<style scoped></style>
