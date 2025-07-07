<template>
  <el-dialog v-model="visible" title="添加书签" width="300" destroy-on-close append-to-body>
    <el-form ref="formRef" :model="ruleForm" :rules="rules" label-width="80px">
      <el-form-item label="书签名称" prop="name">
        <el-input v-model="ruleForm.name"></el-input>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button type="success" size="small" @click="ok">确 定</el-button>
      <el-button type="warning" size="small" @click="cancel">取 消</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import { TcctBookmark } from '@quick-cesium/sdk/src'

interface RuleForm {
  name: string
}

const visible = ref(false)
const formRef = ref<FormInstance>()
const ruleForm = ref<RuleForm>({
  name: '',
})
const checkDuplicateLabel = (rules, value: string, callback: (e?: Error) => void) => {
  if (names.includes(value)) {
    callback(new Error('书签名称已存在'))
  } else {
    callback()
  }
}
const rules = reactive<FormRules<RuleForm>>({
  name: [
    { required: true, message: '书签名称不能为空', trigger: 'blur' },
    { required: true, validator: checkDuplicateLabel, trigger: 'blur' },
  ],
})
let names: Array<string> = []
// 监控位置创建成功的回调
let resolveCallback: (value: string) => void
// 监控位置创建失败的回调
let rejectCallback: (value: string) => void

const ok = async () => {
  if (!formRef.value) return
  formRef.value.validate((valid: boolean) => {
    if (valid) {
      resolveCallback(ruleForm.value.name)
      visible.value = false
    }
  })
}

function cancel() {
  rejectCallback('取消新增无人机机场')
  visible.value = false
}

/**
 * 打开弹窗
 * @param worldPosition 世界坐标（car3）
 * @param farm 林场信息
 */
function open(bookmarks: Array<TcctBookmark>) {
  // 初始化数据
  ruleForm.value = {
    name: '',
  }
  // resolveCallback = null
  // rejectCallback = null

  visible.value = true
  // 获取已有的书签名称
  names = bookmarks.map((item) => item.label)
  return new Promise((resolve, reject) => {
    resolveCallback = resolve
    rejectCallback = reject
  })
}

defineExpose({
  open,
})
</script>

<style scoped></style>
