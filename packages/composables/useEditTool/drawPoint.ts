import { Cartesian3, ScreenSpaceEventType } from 'cesium'
import { type DrawDependencies, EditToolStatus } from './types'

/**
 * 绘制点的具体逻辑
 * @param deps 绘制所需的依赖
 * @returns Promise 绘制完成的点坐标
 */
export const drawPoint = (deps: DrawDependencies): Promise<Cartesian3> => {
  const { bus, position, status, registerAbort, globalAbort } = deps

  // 如果在执行其它操作，则取消
  globalAbort()

  status.value = EditToolStatus.Drawing

  return new Promise<Cartesian3>((resolve, reject) => {
    // 清理资源
    const dispose = () => {
      registerAbort(null) // 取消注册当前的 abort 回调
      status.value = EditToolStatus.Default
      bus.offScreen(ScreenSpaceEventType.LEFT_CLICK, handleDraw)
      bus.offScreen(ScreenSpaceEventType.RIGHT_CLICK, handleCancel)
    }

    // 取消绘制
    const abort = (info?: string) => {
      dispose()
      reject(info || '取消点绘制！')
    }

    // 左键绘制
    const handleDraw = () => {
      if (!position.value) {
        console.error('坐标信息转换失败，获取的世界坐标异常！')
        return
      }
      const p = position.value
      dispose()

      // 使用 setTimeout 避免立即 resolve 可能导致的事件冲突或其他问题
      setTimeout(() => {
        resolve(p)
      }, 0)
    }

    // 右键取消
    const handleCancel = () => abort()

    // 注册当前的取消回调
    registerAbort(abort)

    // 绑定绘制相关事件
    bus.onScreen(ScreenSpaceEventType.LEFT_CLICK, handleDraw)
    bus.onScreen(ScreenSpaceEventType.RIGHT_CLICK, handleCancel)
  })
}
