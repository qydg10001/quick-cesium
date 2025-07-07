<template>
  <tab-tool
    name="绘宽箭头"
    v-model="isDrawing"
    :icon="tabDrawWideArrowIcon"
    :active-icon="tabDrawWideArrowActiveIcon"
    @click="handleClick"
  ></tab-tool>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import * as Cesium from 'cesium'
import TabTool from '@/components/TabTool'
import { useCesiumViewerStore } from '@/stores/cesiumViewer'
import { useDrawStatusStore } from '@/stores/drawStatus'
import { DrawStatusType } from '@/types/drawStatus'
import { useEditTool, type ITcctEditTool, createWideArrowPositions } from '@quick-cesium/sdk/src'

import tabDrawWideArrowIcon from '@/assets/icons/tab_draw_wide_arrow.png'
import tabDrawWideArrowActiveIcon from '@/assets/icons/tab_draw_wide_arrow_active.png'

const { getViewerAsync } = useCesiumViewerStore()
const drawStatusStore = useDrawStatusStore()
// 绘制曲面的标志
const isDrawing = ref(false)
let editTool: ITcctEditTool
let viewer: Cesium.Viewer

const handleClick = async () => {
  if (isDrawing.value) {
    // 绘曲面
    drawStatusStore.status = DrawStatusType.WideArrow
    if (editTool) {
      editTool
        .drawWideArrow()
        .then((positions) => {
          if (positions.length < 2) return

          const fullPositions = createWideArrowPositions(positions)
          viewer.entities.add({
            polyline: {
              positions: [...fullPositions, fullPositions[0]],
              width: 2,
              material: Cesium.Color.YELLOW,
            },
            polygon: {
              hierarchy: fullPositions,
              material: Cesium.Color.YELLOW.withAlpha(0.5),
            },
          })
        })
        .finally(() => {
          drawStatusStore.status = DrawStatusType.None
          isDrawing.value = false
        })
    }
  } else {
    // 取消绘制
    editTool?.abort()
  }
}

onMounted(() => {
  getViewerAsync().then((v) => {
    viewer = v
    editTool = useEditTool(v)
  })
})
</script>

<style scoped></style>
