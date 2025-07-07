<template>
  <tab-tool
    name="绘双箭头"
    v-model="isDrawing"
    :icon="tabDrawDoubleArrowIcon"
    :active-icon="tabDrawDoubleArrowActiveIcon"
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
import { useEditTool, type ITcctEditTool, createDoubleArrowPositions } from '@quick-cesium/sdk/src'

import tabDrawDoubleArrowIcon from '@/assets/icons/tab_draw_double_arrow.png'
import tabDrawDoubleArrowActiveIcon from '@/assets/icons/tab_draw_double_arrow_active.png'

const { getViewerAsync } = useCesiumViewerStore()
const drawStatusStore = useDrawStatusStore()
// 绘制的标志
const isDrawing = ref(false)
let editTool: ITcctEditTool
let viewer: Cesium.Viewer

const handleClick = async () => {
  if (isDrawing.value) {
    // 绘双箭头
    drawStatusStore.status = DrawStatusType.AttackArrow
    if (editTool) {
      editTool
        .drawDoubleArrow()
        .then((positions) => {
          if (positions.length < 3) return

          const fullPositions = createDoubleArrowPositions(positions)
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
