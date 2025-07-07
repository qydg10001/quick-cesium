<template>
  <tab-button name="清空" :icon="tabMeasureClearIcon" @click="handleClick"></tab-button>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
// import * as Cesium from 'cesium'
import TabButton from '@/components/TabButton'
import { useCesiumViewerStore } from '@/stores/cesiumViewer'
import { useDrawStatusStore } from '@/stores/drawStatus'
import { DrawStatusType } from '@/types/drawStatus'
import { useMeasureTool, type ITcctMeasureTool } from '@quick-cesium/sdk/src'

import tabMeasureClearIcon from '@/assets/icons/tab_measure_clear.png'

const { getViewerAsync } = useCesiumViewerStore()
const drawStatusStore = useDrawStatusStore()
let measureTool: ITcctMeasureTool
// let viewer: Cesium.Viewer

const handleClick = async () => {
  // 取消当前绘制
  measureTool?.abort()
  // 清除测量结果
  measureTool?.clear()
  drawStatusStore.status = DrawStatusType.None
}

onMounted(() => {
  getViewerAsync().then((v) => {
    // viewer = v
    measureTool = useMeasureTool(v)
  })
})
</script>

<style scoped></style>
