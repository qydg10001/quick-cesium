<template>
  <div
    v-if="props.visible && position.show"
    class="tooltip-info"
    :style="{
      // display: props.visible ? 'block' : 'none',
      left: position.x + 'px',
      top: position.y + 'px',
    }"
    v-html="props.text"
  ></div>
</template>

<script setup lang="ts">
import { reactive, watch } from 'vue'
import { defined, Viewer } from 'cesium'
import { useHoverPosition } from '@quick-cesium/composables'
import { useMapViewer } from '../earth'

const props = defineProps<{
  visible: boolean
  text: string
  viewer?: Viewer | null
}>()

const position = reactive<{
  show: boolean
  x: number
  y: number
}>({
  show: false,
  x: -1000,
  y: -1000,
})
const viewerRef = useMapViewer(props)

watch(
  viewerRef,
  (viewer) => {
    if (defined(viewer)) {
      const { isHover, screenPosition } = useHoverPosition(viewer)
      // positionRef = position

      // 监听鼠标位置
      watch(
        screenPosition,
        (val) => {
          if (val) {
            position.x = val.x
            position.y = val.y
          } else {
            position.x = -1000
            position.y = -1000
          }
        },
        {
          immediate: true,
        },
      )
      // 监听鼠标是否在地球内
      watch(
        isHover,
        (val) => {
          position.show = val
        },
        {
          immediate: true,
        },
      )
    }
  },
  {
    immediate: true,
  },
)
</script>

<style scoped>
.tooltip-info {
  position: absolute;
  right: 0;
  left: 0;
  z-index: 9999;
  width: max-content;
  padding: 4px 8px;
  margin: -12px 0 0 20px;
  font-size: 12px;
  color: white;
  pointer-events: none;
  background-color: #000;
  border-radius: 4px;

  &::before {
    position: absolute;
    top: 4px;
    left: -10px;
    width: 0;
    height: 0;
    content: '';
    border-top: solid 8px transparent;
    border-right: solid 10px #000;
    border-bottom: solid 8px transparent;
  }
}
</style>
