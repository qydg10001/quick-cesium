import {
  Cartesian3,
  Entity,
  CallbackProperty,
  Color as CesiumColor,
  ScreenSpaceEventType,
} from 'cesium'
import { type DrawDependencies, EditToolStatus } from './types'

/**
 * 绘制折线的具体逻辑
 * @param deps 绘制所需的依赖
 * @returns Promise 绘制完成的所有点坐标数组
 */
export const drawPolyline = (deps: DrawDependencies): Promise<Array<Cartesian3>> => {
  const { viewer, bus, position, status, registerAbort, globalAbort } = deps

  // 如果在执行其它操作，则取消
  globalAbort()

  status.value = EditToolStatus.Drawing
  const featurePositions: Array<Cartesian3> = []

  // 临时折线实体
  const tempPolyline = new Entity({
    polyline: {
      positions: new CallbackProperty(() => {
        const positions = [...featurePositions]
        // 添加当前鼠标位置作为最后一个点，形成动态效果
        if (
          position.value &&
          !position.value.equals(featurePositions[featurePositions.length - 1]) // 避免重复添加同一个点
        ) {
          positions.push(position.value)
        }
        return positions
      }, false),
      width: 2,
      material: CesiumColor.fromCssColorString('#FF0000'),
      clampToGround: true,
    },
  })

  viewer.entities.add(tempPolyline)

  return new Promise<Array<Cartesian3>>((resolve, reject) => {
    // 清理资源
    const dispose = () => {
      registerAbort(null) // 取消注册当前的 abort 回调
      status.value = EditToolStatus.Default
      viewer.entities.remove(tempPolyline)
      bus.offScreen(ScreenSpaceEventType.LEFT_CLICK, handleAddPoint)
      bus.offScreen(ScreenSpaceEventType.RIGHT_CLICK, handleCancelDraw)
      bus.offScreen(ScreenSpaceEventType.LEFT_DOUBLE_CLICK, handleEndDraw)
    }

    // 取消绘制
    const abort = (info?: string) => {
      dispose()
      reject(info || '取消折线绘制！')
    }

    // 左键加点
    const handleAddPoint = () => {
      if (position.value && !position.value.equals(featurePositions[featurePositions.length - 1])) {
        featurePositions.push(position.value)
      }
    }

    // 左键双击完成绘制
    const handleEndDraw = () => {
      // 双击时，如果鼠标位置与最后一个点不同，先添加当前点
      handleAddPoint()
      if (featurePositions.length < 2) {
        // TODO: 替换为实际的错误提示方式
        console.error('请保证折线至少有两个点！')
        return
      }
      dispose()
      // 使用 setTimeout 避免立即 resolve 可能导致的事件冲突或其他问题
      setTimeout(() => {
        resolve(featurePositions)
      }, 0)
    }

    // 右键取消绘制或删除最后一个点
    const handleCancelDraw = () => {
      if (featurePositions.length > 0) {
        // 取消最后绘制的点
        featurePositions.pop()
      } else {
        // 如果没有点，则取消整个绘制
        abort()
      }
    }

    // 注册当前的取消回调
    registerAbort(abort)

    // 绑定绘制相关事件
    bus.onScreen(ScreenSpaceEventType.LEFT_CLICK, handleAddPoint)
    bus.onScreen(ScreenSpaceEventType.RIGHT_CLICK, handleCancelDraw)
    bus.onScreen(ScreenSpaceEventType.LEFT_DOUBLE_CLICK, handleEndDraw)
  })
}
