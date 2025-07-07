<template>
  <tab-tool
    name="绘点"
    v-model="isDrawPoint"
    :icon="tabDrawPointIcon"
    :active-icon="tabDrawPointActiveIcon"
    @click="handleClick"
  ></tab-tool>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import * as Cesium from 'cesium'
import TabTool from '@/components/TabTool'
import { useCesiumViewerStore } from '@/stores/cesiumViewer'
import { useDrawStatusStore } from '@/stores/drawStatus'
import { DrawStatusType } from '@/types/drawStatus'
import { useEditTool, type ITcctEditTool } from '@quick-cesium/sdk/src'

import tabDrawPointIcon from '@/assets/icons/tab_draw_point.png'
import tabDrawPointActiveIcon from '@/assets/icons/tab_draw_point_active.jpg'

const { getViewerAsync } = useCesiumViewerStore()
const drawStatusStore = useDrawStatusStore()
// 绘制点的标志
const isDrawPoint = ref(false)
let editTool: ITcctEditTool
let viewer: Cesium.Viewer

const handleClick = async () => {
  if (isDrawPoint.value) {
    // 绘点
    drawStatusStore.status = DrawStatusType.Point
    if (editTool) {
      editTool
        .drawPoint()
        .then((position) => {
          viewer.entities.add({
            position,
            point: {
              pixelSize: 10,
              color: Cesium.Color.YELLOW,
            },
          })
        })
        .finally(() => {
          drawStatusStore.status = DrawStatusType.None
          isDrawPoint.value = false
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
    if (val !== DrawStatusType.Point) {
      isDrawPoint.value = false
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

<style scoped></style>
