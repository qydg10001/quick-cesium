<template>
  <tab-tool
    name="绘曲面"
    v-model="isDrawing"
    :icon="tabDrawPolygonIcon"
    :active-icon="tabDrawPolygonActiveIcon"
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
import { useEditTool, type ITcctEditTool, createCurvePolygonPositions } from '@quick-cesium/sdk/src'

import tabDrawPolygonIcon from '@/assets/icons/tab_draw_curve_polygon.png'
import tabDrawPolygonActiveIcon from '@/assets/icons/tab_draw_curve_polygon_active.png'

const { getViewerAsync } = useCesiumViewerStore()
const drawStatusStore = useDrawStatusStore()
// 绘制曲面的标志
const isDrawing = ref(false)
let editTool: ITcctEditTool
let viewer: Cesium.Viewer

const handleClick = async () => {
  if (isDrawing.value) {
    // 绘曲面
    drawStatusStore.status = DrawStatusType.CurvePolygon
    if (editTool) {
      editTool
        .drawCurvePolygon()
        .then((positions) => {
          if (positions.length < 2 || !positions[0]) return

          const fullPositions = createCurvePolygonPositions(positions)
          viewer.entities.add({
            polyline: {
              positions: fullPositions,
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
