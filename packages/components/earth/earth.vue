<template>
  <div class="earth-wrapper">
    <div ref="cesiumContainer" class="cesium-container">
      <slot :viewer="viewerRef"></slot>
    </div>
    <!-- <div id="map3d" class="cesium-container"></div> -->
  </div>
</template>

<script setup lang="ts">
import * as Cesium from 'cesium'
import { markRaw, onMounted, provide, ref, shallowRef, toRaw } from 'vue'
import { viewerKey } from './useMapViewer'

const props = defineProps<{
  token?: string
}>()

const emit = defineEmits<{
  (e: 'init', viewer: Cesium.Viewer): void
}>()

const cesiumContainer = ref<HTMLElement | null>(null)
const viewerRef = shallowRef<Cesium.Viewer | null>(null)
// 将viewer传给后代
provide(viewerKey, viewerRef)

onMounted(async () => {
  if (props.token) {
    Cesium.Ion.defaultAccessToken = props.token
  }

  if (!cesiumContainer.value) {
    console.error('cesiumContainer is null')
    return
  }

  const viewer = new Cesium.Viewer(cesiumContainer.value, {
    // terrainProvider: await Cesium.createWorldTerrainAsync(),
    // terrainProvider: await CesiumTerrainProvider.fromUrl('http://localhost:8888/'),
    // 动画仪表盘
    animation: false,
    // 基础图层选择按钮
    baseLayerPicker: false,
    // 全屏按钮
    fullscreenButton: false,
    vrButton: false,
    // 地名地址查询框
    geocoder: false,
    // 返回地球视角按钮
    homeButton: false,
    // 属性框（显示拾取要素的属性）
    infoBox: false,
    // 场景模式切换按钮（三维地球、2.5维场景、二维地图）
    sceneModePicker: false,
    // 拾取要素识别（显示个框，但不明确选中内容）？？？
    selectionIndicator: false,
    // 时间轴
    timeline: false,
    // 操作提示按钮
    navigationHelpButton: false,
    // 超采样开2倍，如果显示困难再降低
    msaaSamples: 2,
    scene3DOnly: true,
    shouldAnimate: true,
    contextOptions: {
      webgl: {
        // 允许截图
        preserveDrawingBuffer: true,
      },
    },
  })
  // 隐藏logo
  ;(viewer.cesiumWidget.creditContainer as HTMLElement).style.display = 'none'
  // 取消左键双击的默认绑定事件
  viewer.cesiumWidget.screenSpaceEventHandler.removeInputAction(
    Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK,
  )

  // 触发地球初始化事件
  emit('init', markRaw(viewer))
  // 插槽传参
  viewerRef.value = toRaw(viewer)
})
</script>

<style lang="scss" scoped>
.earth-wrapper {
  position: relative;
  height: 100%;
  overflow: hidden;

  .cesium-container {
    height: 100%;
  }
}
</style>
