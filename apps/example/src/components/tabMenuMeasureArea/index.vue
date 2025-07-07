<template>
  <tab-tool
    name="平面面积"
    v-model="isMeasureArea"
    :icon="tabMeasureAreaIcon"
    :active-icon="tabMeasureAreaActiveIcon"
    @click="handleClick"
  ></tab-tool>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
// import * as Cesium from 'cesium'
import TabTool from '@/components/TabTool'
import { useCesiumViewerStore } from '@/stores/cesiumViewer'
import { useDrawStatusStore } from '@/stores/drawStatus'
import { DrawStatusType } from '@/types/drawStatus'
import { useMeasureTool, type ITcctMeasureTool } from '@quick-cesium/sdk/src'

import tabMeasureAreaIcon from '@/assets/icons/tab_measure_area.png'
import tabMeasureAreaActiveIcon from '@/assets/icons/tab_measure_area_active.png'

const { getViewerAsync } = useCesiumViewerStore()
const drawStatusStore = useDrawStatusStore()
// 测量面积的标志
const isMeasureArea = ref(false)
let measureTool: ITcctMeasureTool
// let viewer: Cesium.Viewer

const handleClick = async () => {
  if (isMeasureArea.value) {
    // 绘面
    drawStatusStore.status = DrawStatusType.MeasureArea
    if (measureTool) {
      measureTool.area().finally(() => {
        drawStatusStore.status = DrawStatusType.None
        isMeasureArea.value = false
      })
    }
  } else {
    // 取消绘制
    measureTool?.abort()
  }
}

watch(
  () => drawStatusStore.status,
  (val) => {
    if (val !== DrawStatusType.MeasureArea) {
      isMeasureArea.value = false
    }
  },
)

onMounted(() => {
  getViewerAsync().then((v) => {
    // viewer = v
    measureTool = useMeasureTool(v)
  })
})
</script>

<style scoped></style>
