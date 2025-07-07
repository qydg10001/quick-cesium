<template>
  <tab-tool
    name="平面距离"
    v-model="isMeasureDistance"
    :icon="tabMeasureDistanceIcon"
    :active-icon="tabMeasureDistanceActiveIcon"
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

import tabMeasureDistanceIcon from '@/assets/icons/tab_measure_distance.png'
import tabMeasureDistanceActiveIcon from '@/assets/icons/tab_measure_distance_active.png'

const { getViewerAsync } = useCesiumViewerStore()
const drawStatusStore = useDrawStatusStore()
// 绘制点的标志
const isMeasureDistance = ref(false)
let measureTool: ITcctMeasureTool
// let viewer: Cesium.Viewer

const handleClick = async () => {
  if (isMeasureDistance.value) {
    // 绘线
    drawStatusStore.status = DrawStatusType.MeasureDistance
    if (measureTool) {
      measureTool.distance().finally(() => {
        drawStatusStore.status = DrawStatusType.None
        isMeasureDistance.value = false
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
    if (val !== DrawStatusType.MeasureDistance) {
      isMeasureDistance.value = false
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
