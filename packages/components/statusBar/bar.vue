<template>
  <div v-if="viewerRef" class="status-bar">
    <span
      >经度：
      <span style="display: inline-block; min-width: 80px">
        {{ mapStatus.longitude === null ? '--' : mapStatus.longitude.toFixed(6) }}°
      </span>
    </span>
    <span
      >纬度：
      <span style="display: inline-block; min-width: 80px">
        {{ mapStatus.latitude === null ? '--' : mapStatus.latitude.toFixed(6) }}°
      </span>
    </span>
    <span
      >海拔/模型高度：
      <span style="display: inline-block; min-width: 70px">
        {{ mapStatus.height === null ? '--' : mapStatus.height.toFixed(2) }}m
      </span>
    </span>
    <span
      >方向：
      <span style="display: inline-block; min-width: 30px">
        {{
          mapStatus.direction === null
            ? '--'
            : mapStatus.direction.toFixed(0) === '360'
              ? '0'
              : mapStatus.direction.toFixed(0)
        }}°
      </span>
    </span>
    <span
      >俯仰角：
      <span style="display: inline-block; min-width: 30px">
        {{ mapStatus.pitch === null ? '--' : mapStatus.pitch.toFixed(0) }}°
      </span>
    </span>
  </div>
</template>

<script setup lang="ts">
import { onUnmounted, reactive, watch } from 'vue'
import { defined, Viewer, Math as CesiumMath, Cartographic } from 'cesium'
import { useHoverPosition } from '@quick-cesium/composables'
import { useMapViewer } from '../earth'

const props = defineProps<{
  viewer?: Viewer | null
}>()

const mapStatus = reactive<{
  longitude: number | null
  latitude: number | null
  height: number | null
  direction: number | null
  pitch: number | null
}>({
  longitude: null,
  latitude: null,
  height: null,
  direction: null,
  pitch: null,
})
const viewerRef = useMapViewer(props)

const handleStatusChange = () => {
  if (!defined(viewerRef.value)) return

  mapStatus.direction = CesiumMath.toDegrees(viewerRef.value.scene.camera.heading)
  mapStatus.pitch = CesiumMath.toDegrees(viewerRef.value.scene.camera.pitch)
}

watch(
  viewerRef,
  (viewer) => {
    if (defined(viewer)) {
      const { position } = useHoverPosition(viewer)
      // positionRef = position

      watch(
        position,
        (val) => {
          // console.log('当前position', val)
          if (val) {
            const coordinate = Cartographic.fromCartesian(val)
            mapStatus.longitude = CesiumMath.toDegrees(coordinate.longitude)
            mapStatus.latitude = CesiumMath.toDegrees(coordinate.latitude)
            mapStatus.height = coordinate.height
          } else {
            mapStatus.longitude = null
            mapStatus.latitude = null
            mapStatus.height = null
          }
        },
        {
          immediate: true,
        },
      )

      // 初始化当前视角
      mapStatus.direction = CesiumMath.toDegrees(viewer.scene.camera.heading)
      mapStatus.pitch = CesiumMath.toDegrees(viewer.scene.camera.pitch)

      viewer.scene.camera.percentageChanged = 0.01 //设置相机变化的识别精度，默认值为0.5
      viewer.scene.camera.changed.addEventListener(handleStatusChange)
    }
  },
  {
    immediate: true,
  },
)

onUnmounted(() => {
  // 解绑相机变化的监听
  if (defined(viewerRef.value)) {
    viewerRef.value.scene.camera.changed.removeEventListener(handleStatusChange)
  }
})
</script>

<style scoped>
.status-bar {
  z-index: 1;
  height: 30px;
  line-height: 30px;
  color: #ccc;
  text-align: right;
  background-color: rgba(0, 0, 0, 0.3);
  & > span {
    margin-left: 20px;

    &:last-child {
      margin-right: 40px;
    }
  }
}
</style>
