<template>
  <tab-tool
    name="绘制标签"
    v-model="isDrawLabel"
    :icon="tabDrawLabelIcon"
    :active-icon="tabDrawLabelActiveIcon"
    @click="handleClick"
  ></tab-tool>
  <tab-container name="显示内容">
    <el-input v-model="labelText" style="width: 180px" />
  </tab-container>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import * as Cesium from 'cesium'
import TabTool from '@/components/TabTool'
import TabContainer from '@/components/TabContainer'
import { useCesiumViewerStore } from '@/stores/cesiumViewer'
import { useDrawStatusStore } from '@/stores/drawStatus'
import { DrawStatusType } from '@/types/drawStatus'
import { useEditTool, type ITcctEditTool } from '@quick-cesium/sdk/src'

import tabDrawLabelIcon from '@/assets/icons/tab_draw_label.png'
import tabDrawLabelActiveIcon from '@/assets/icons/tab_draw_label_active.png'
import { ElMessage } from 'element-plus'

const { getViewerAsync } = useCesiumViewerStore()
const drawStatusStore = useDrawStatusStore()
// 绘制图标的标志
const isDrawLabel = ref(false)
const labelText = ref('')

let editTool: ITcctEditTool
let viewer: Cesium.Viewer

const handleClick = async () => {
  if (isDrawLabel.value) {
    if (!labelText.value) {
      isDrawLabel.value = false
      ElMessage({
        message: '显示内容不能为空',
        type: 'warning',
      })
      return
    }

    // 绘点
    drawStatusStore.status = DrawStatusType.Label
    if (editTool) {
      editTool
        .drawPoint()
        .then((position) => {
          viewer.entities.add({
            position,
            label: {
              text: labelText.value,
              // showBackground: true,
              font: '20px sans-serif',
              // horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
              verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
              // pixelOffset: new Cesium.Cartesian2(0, -20),
            },
          })
        })
        .finally(() => {
          drawStatusStore.status = DrawStatusType.None
          isDrawLabel.value = false
        })
    }
  } else {
    // 取消绘制
    editTool?.abort()
  }
}

watch(
  () => drawStatusStore.status,
  (val) => {
    if (val !== DrawStatusType.Label) {
      isDrawLabel.value = false
    }
  },
)

onMounted(() => {
  getViewerAsync().then((v) => {
    viewer = v
    editTool = useEditTool(v)
  })
})
</script>

<style lang="scss" scoped>
.icon-list {
  display: flex;
  flex-wrap: wrap;
  margin-top: 20px;
  border-left: 1px solid var(--el-border-color);

  .icon-item {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 60px;
    height: 60px;
    cursor: pointer;
    // background-color: #f0f0f0;
    border-right: 1px solid var(--el-border-color);
    border-bottom: 1px solid var(--el-border-color);

    &:nth-child(-n + 10) {
      border-top: 1px solid var(--el-border-color);
    }
    &:hover {
      color: var(--brand-color-light);
      // background-color: #e0e0e0;
      background-color: var(--el-border-color-extra-light);
    }
    &.active {
      background-color: var(--el-color-primary-light-7);
    }
  }
}
</style>
