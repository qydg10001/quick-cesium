<template>
  <tab-tool
    name="绘折线"
    v-model="isDrawPolyline"
    :icon="tabDrawPolylineIcon"
    :active-icon="tabDrawPolylineActiveIcon"
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

import tabDrawPolylineIcon from '@/assets/icons/tab_draw_polyline.png'
import tabDrawPolylineActiveIcon from '@/assets/icons/tab_draw_polyline_active.png'

const { getViewerAsync } = useCesiumViewerStore()
const drawStatusStore = useDrawStatusStore()
// 绘制折线的标志
const isDrawPolyline = ref(false)
let editTool: ITcctEditTool
let viewer: Cesium.Viewer

const handleClick = async () => {
  if (isDrawPolyline.value) {
    // 绘折线
    drawStatusStore.status = DrawStatusType.Polyline
    if (editTool) {
      editTool
        .drawPolyline()
        .then((positions) => {
          viewer.entities.add({
            polyline: {
              positions,
              width: 2,
              material: Cesium.Color.YELLOW,
            },
          })
        })
        .finally(() => {
          drawStatusStore.status = DrawStatusType.None
          isDrawPolyline.value = false
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
