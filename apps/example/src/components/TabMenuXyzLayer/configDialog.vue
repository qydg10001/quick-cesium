<template>
  <el-dialog v-model="visible" title="添加xyz图层配置" width="400" destroy-on-close append-to-body>
    <el-form ref="formRef" :model="ruleForm" :rules="rules" label-width="100px">
      <el-form-item label="图层名称" prop="name">
        <el-input v-model="ruleForm.name" style="width: 240px" placeholder="请输入图层名称" />
      </el-form-item>
      <el-form-item label="url" prop="url">
        <el-input v-model="ruleForm.url" style="width: 240px" placeholder="请输入url" />
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
import { ElMessage, type FormInstance } from 'element-plus'
import { TcctMapLayerType, createUUID, type TcctXyzImageryLayerOptions } from '@quick-cesium/sdk/src'
import { useCustomMaplayerStore } from '@/stores/customMapLayer'

const { layers } = useCustomMaplayerStore()
const visible = defineModel<boolean>({
  type: Boolean,
  default: false,
})
const formRef = ref<FormInstance>()
const ruleForm = ref<TcctXyzImageryLayerOptions>({
  layerType: TcctMapLayerType.XYZ, // xyz 服务
  name: '',
  url: '',
  id: createUUID(),
})
const rules = ref({
  name: [{ required: true, message: '请输入图层名称', trigger: 'blur' }],
  url: [{ required: true, message: '请输入url', trigger: 'blur' }],
})

const reset = () => {
  if (!formRef.value) return
  formRef.value.resetFields()
  ruleForm.value = {
    layerType: TcctMapLayerType.XYZ,
    name: '',
    url: '',
    id: createUUID(),
  }
}

watch(
  () => visible.value,
  (val) => {
    if (val) {
      reset()
    }
  },
)

const ok = () => {
  if (!formRef.value) return
  formRef.value.validate((valid: boolean) => {
    if (valid) {
      layers.push({ ...ruleForm.value })
      ElMessage.success('添加成功')
      visible.value = false
    }
  })
}

const cancel = () => {
  visible.value = false
}
</script>

<style scoped></style>
