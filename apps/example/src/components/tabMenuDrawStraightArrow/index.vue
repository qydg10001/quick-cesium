<template>
  <tab-tool
    name="绘直箭头"
    v-model="isDrawing"
    :icon="tabDrawStraightArrowIcon"
    :active-icon="tabDrawStraightArrowActiveIcon"
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
import { useEditTool, type ITcctEditTool, createStraightArrowPositions } from '@quick-cesium/sdk/src'

import tabDrawStraightArrowIcon from '@/assets/icons/tab_draw_straight_arrow.png'
import tabDrawStraightArrowActiveIcon from '@/assets/icons/tab_draw_straight_arrow_active.png'

const { getViewerAsync } = useCesiumViewerStore()
const drawStatusStore = useDrawStatusStore()
// 绘制直箭头的标志
const isDrawing = ref(false)
let editTool: ITcctEditTool
let viewer: Cesium.Viewer

const handleClick = async () => {
  if (isDrawing.value) {
    // 绘直箭头
    drawStatusStore.status = DrawStatusType.StraightArrow
    if (editTool) {
      editTool
        .drawStraightArrow()
        .then((positions) => {
          if (!positions[0] || !positions[1]) return

          const fullPositions = createStraightArrowPositions(positions)
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
