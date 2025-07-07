<template>
  <tab-tool
    name="绘多边形"
    v-model="isDrawPolygon"
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
import { useEditTool, type ITcctEditTool } from '@quick-cesium/sdk/src'

import tabDrawPolygonIcon from '@/assets/icons/tab_draw_polygon.png'
import tabDrawPolygonActiveIcon from '@/assets/icons/tab_draw_polygon_active.png'

const { getViewerAsync } = useCesiumViewerStore()
const drawStatusStore = useDrawStatusStore()
// 绘制多边形的标志
const isDrawPolygon = ref(false)
let editTool: ITcctEditTool
let viewer: Cesium.Viewer

const handleClick = async () => {
  if (isDrawPolygon.value) {
    // 绘多边形
    drawStatusStore.status = DrawStatusType.Polygon
    if (editTool) {
      editTool
        .drawPolygon()
        .then((positions) => {
          if (positions.length < 3 || !positions[0]) return

          viewer.entities.add({
            polyline: {
              positions: [...positions, positions[0]],
              width: 2,
              material: Cesium.Color.YELLOW,
            },
            polygon: {
              hierarchy: positions,
              material: Cesium.Color.YELLOW.withAlpha(0.5),
            },
          })
        })
        .finally(() => {
          drawStatusStore.status = DrawStatusType.None
          isDrawPolygon.value = false
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
