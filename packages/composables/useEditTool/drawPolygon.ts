import {
  Cartesian3,
  Entity,
  CallbackProperty,
  Color as CesiumColor,
  ScreenSpaceEventType,
  PolygonHierarchy,
  HeightReference,
} from 'cesium'
import { type DrawDependencies, EditToolStatus } from './types'

/**
 * 绘制多边形的具体逻辑
 * @param deps 绘制所需的依赖
 * @returns Promise 绘制完成的所有点坐标数组
 */
export const drawPolygon = (deps: DrawDependencies): Promise<Array<Cartesian3>> => {
  const { viewer, bus, position, status, registerAbort, globalAbort } = deps

  // 如果在执行其它操作，则取消
  globalAbort()

  status.value = EditToolStatus.Drawing
  const featurePositions: Array<Cartesian3> = []

  // 临时多边形实体 (包含填充和边界线)
  const tempPolygon = new Entity({
    polygon: {
      hierarchy: new CallbackProperty(() => {
        const positions = [...featurePositions]
        // 添加当前鼠标位置作为最后一个点，形成动态效果
        if (
          position.value &&
          !position.value.equals(featurePositions[featurePositions.length - 1]) // 避免重复添加同一个点
        ) {
          positions.push(position.value)
        }
        // 多边形需要至少3个点才能形成
        if (positions.length < 3) {
          return null
        }
        return new PolygonHierarchy(positions)
      }, false),
      heightReference: HeightReference.CLAMP_TO_GROUND,
      material: CesiumColor.fromCssColorString('#ff0000').withAlpha(0.3),
    },
    // 绘制边界线，连接所有点和第一个点，形成闭合效果
    polyline: {
      positions: new CallbackProperty(() => {
        const positions = [...featurePositions]
        // 添加当前鼠标位置作为最后一个点
        if (
          position.value &&
          !position.value.equals(featurePositions[featurePositions.length - 1])
        ) {
          positions.push(position.value)
        }
        // 如果有至少一个点，则连接到第一个点形成闭合线
        if (featurePositions.length > 0 && featurePositions[0]) {
          positions.push(featurePositions[0])
        }
        return positions
      }, false),
      // clampToGround: true, // 多边形边界线通常不需要 clampToGround，因为多边形本身已经处理了高度
      width: 2,
      material: CesiumColor.fromCssColorString('#ff0000'),
    },
  })

  viewer.entities.add(tempPolygon)

  return new Promise<Array<Cartesian3>>((resolve, reject) => {
    // 清理资源
    const dispose = () => {
      registerAbort(null) // 取消注册当前的 abort 回调
      status.value = EditToolStatus.Default
      viewer.entities.remove(tempPolygon)
      bus.offScreen(ScreenSpaceEventType.LEFT_CLICK, handleAddPoint)
      bus.offScreen(ScreenSpaceEventType.RIGHT_CLICK, handleCancelDraw)
      bus.offScreen(ScreenSpaceEventType.LEFT_DOUBLE_CLICK, handleEndDraw)
    }

    // 取消绘制
    const abort = (info?: string) => {
      dispose()
      reject(info || '取消多边形绘制！')
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
      if (featurePositions.length < 3) {
        // TODO: 替换为实际的错误提示方式
        console.error('请保多边形至少有三个点！')
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
