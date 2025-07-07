import {
  Viewer,
  Cartesian3,
  CustomDataSource,
  Entity,
  CallbackPositionProperty,
  Color as CesiumColor,
  ScreenSpaceEventType,
  HeightReference, // 虽然polygon逻辑移走了，但assistPoint可能需要HeightReference
} from 'cesium'
import { useEventBus } from '../useEventBus'
import { useHoverPosition } from '../useHoverPosition'
import { ref, watch } from 'vue'

// 导入拆分后的类型和绘制逻辑
import { EditToolStatus, type EditTool, type DrawDependencies } from './types'
import { drawPoint as _drawPoint } from './drawPoint'
import { drawPolyline as _drawPolyline } from './drawPolyline'
import { drawPolygon as _drawPolygon } from './drawPolygon'
import { drawCurvePolygon as _drawCurvePolygon } from './drawCurvePolygon'
import { drawStraightArrow as _drawStraightArrow } from './drawStraightArrow'
import { drawWideArrow as _drawWideArrow } from './drawWideArrow'
import { drawAttackArrow as _drawAttackArrow } from './drawAttackArrow'
import { drawDoubleArrow as _drawDoubleArrow } from './drawDoubleArrow'

// 所有useEditTool实例共用一个绘制状态和取消回调
// 如果需要每个实例独立，则将此变量移入 useEditTool 函数内部
let abortCallback: Function | null = null

// 存储编辑状态辅助entity的图层
let assistLayer: CustomDataSource | null = null

const useEditTool = (viewer: Viewer): EditTool => {
  // 获取实时位置
  const { isHover, position } = useHoverPosition(viewer)
  // 获取事件总线
  const bus = useEventBus(viewer)
  const status = ref<EditToolStatus>(EditToolStatus.Default)

  // 判断辅助点是否显示
  watch(
    () => [status.value, isHover.value],
    ([nowStatus, hover]) => {
      if (hover && nowStatus === EditToolStatus.Drawing) {
        assistPoint.show = true
      } else {
        assistPoint.show = false
      }
    },
  )

  if (!assistLayer) {
    assistLayer = new CustomDataSource('__assist_edit')
    viewer.dataSources.add(assistLayer)
  }

  // 辅助点，用于显示获取的实际位置
  const assistPoint = new Entity({
    show: false,
    position: new CallbackPositionProperty(() => {
      return position.value || undefined
    }, false),
    point: {
      pixelSize: 7,
      color: CesiumColor.BLUE,
      outlineColor: CesiumColor.WHITE,
      outlineWidth: 1,
    },
    // 可以考虑是否需要 HeightReference.CLAMP_TO_GROUND
    // heightReference: HeightReference.CLAMP_TO_GROUND,
  })
  viewer.entities.add(assistPoint)

  // 全局取消当前绘制操作的函数
  const abort = () => {
    if (abortCallback) {
      abortCallback() // 调用当前注册的取消回调
      abortCallback = null // 清空回调
    }
  }

  // 注册当前绘制操作的取消回调函数
  const registerAbort = (cb: Function | null) => {
    abortCallback = cb
  }

  // 准备传递给绘制函数的依赖对象
  const drawDependencies: DrawDependencies = {
    viewer,
    bus,
    position,
    status,
    registerAbort,
    globalAbort: abort, // 将全局 abort 函数也传递进去，方便内部调用
  }

  // 调用拆分后的绘制函数，并传递依赖
  const drawPoint = () => _drawPoint(drawDependencies)
  const drawPolyline = () => _drawPolyline(drawDependencies)
  const drawPolygon = () => _drawPolygon(drawDependencies)
  const drawCurvePolygon = () => _drawCurvePolygon(drawDependencies)
  const drawStraightArrow = () => _drawStraightArrow(drawDependencies)
  const drawWideArrow = () => _drawWideArrow(drawDependencies)
  const drawAttackArrow = () => _drawAttackArrow(drawDependencies)
  const drawDoubleArrow = () => _drawDoubleArrow(drawDependencies)

  // TODO: 添加 startEdit 等其他编辑功能

  // 在 hook 卸载时清理资源 (如果 hook 实例会被销毁)
  // Vue 3 Composition API 的 setup 函数返回的对象没有 beforeDestroy/unmounted 生命周期钩子
  // 如果 useEditTool 是在 setup 中调用，并且 setup 返回了 useEditTool 的结果，
  // 那么当组件卸载时，Cesium 实体和事件监听可能不会自动清理。
  // 需要手动处理清理逻辑，例如在组件的 onUnmounted 钩子中调用一个 cleanup 函数。
  // 或者 useEventBus 内部已经处理了 Viewer 销毁时的清理。
  // 这里暂时不添加清理逻辑，假设 useEventBus 和 useHoverPosition 已经处理或外部会手动清理。
  // 如果需要，可以在这里返回一个 cleanup 函数，并在组件 unmounted 时调用。
  /*
  const cleanup = () => {
      abort(); // 取消所有正在进行的绘制
      viewer.dataSources.remove(assistLayer, true); // 移除并销毁数据源
      viewer.entities.remove(assistPoint); // 移除辅助点
      // useEventBus 和 useHoverPosition 可能也需要清理
  };
  // return { ..., cleanup };
  */

  return {
    drawPoint,
    drawPolyline,
    drawPolygon,
    drawCurvePolygon,
    drawStraightArrow,
    drawWideArrow,
    drawAttackArrow,
    drawDoubleArrow,
    abort,
    // 如果需要，可以暴露 status
    // status
  }
}

export { useEditTool, type EditTool, EditToolStatus } // 也可以在这里重新导出 EditToolStatus
