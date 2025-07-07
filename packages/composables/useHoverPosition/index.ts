import {
  Viewer,
  Cartesian3,
  Cartographic,
  Cartesian2,
  ScreenSpaceEventType,
  ScreenSpaceEventHandler,
} from 'cesium'
import { computed, ref, shallowRef, ComputedRef, type Ref, type ShallowRef } from 'vue'
import { useElementHover } from '@vueuse/core'
import { useEventBus } from '../useEventBus'

// type HoverPosition = IHoverPositionCache & {
//   readonly coordinate: ComputedRef<Cartographic | null>
// }

type HoverPosition = {
  isHover: Ref<boolean>
  screenPosition: ShallowRef<Cartesian2 | null>
  position: ShallowRef<Cartesian3 | null>
  // coordinate: ShallowRef<Cartographic | null>
}

// 使用 Map 来缓存每个 viewer 对应的位置缓存
// Viewer 实例作为 Map 的键
const viewerHoverPositionCache = new Map<Viewer, HoverPosition>()
const useHoverPosition = (viewer: Viewer): HoverPosition => {
  let cache = viewerHoverPositionCache.get(viewer)
  if (!cache) {
    // cesium所在的canvas元素
    const canvasRef = ref(viewer.canvas)
    // 动态监听鼠标是否悬停在地图内
    const isHover = useElementHover(canvasRef)
    const screenPosition = shallowRef<Cartesian2 | null>(null)
    const position = shallowRef<Cartesian3 | null>(null)
    // const coordinate = shallowRef<Cartographic | null>(null)
    // 添加鼠标移动事件
    const bus = useEventBus(viewer)
    bus.onScreen(ScreenSpaceEventType.MOUSE_MOVE, (param: ScreenSpaceEventHandler.MotionEvent) => {
      screenPosition.value = param.endPosition.clone()
      position.value = viewer.scene.pickPosition(param.endPosition)
      // coordinate.value = Cartographic.fromCartesian(position.value)
    })
    cache = {
      isHover,
      screenPosition,
      position,
      // coordinate,
    }
    viewerHoverPositionCache.set(viewer, cache)
  }

  return cache
}

export { useHoverPosition, type HoverPosition }
