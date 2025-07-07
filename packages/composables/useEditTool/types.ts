import type { Ref, ShallowRef } from 'vue'
import type { Cartesian3, Viewer } from 'cesium'
import type { EventBus } from '../useEventBus'

/**
 * useEditTool hook 对外暴露的接口
 */
export type EditTool = {
  /**
   * 绘制点
   * @returns 绘制的点的世界坐标
   */
  drawPoint: () => Promise<Cartesian3>
  /**
   * 绘制折线
   * @returns 所有绘制的世界坐标的数组
   */
  drawPolyline: () => Promise<Array<Cartesian3>>
  /**
   * 绘制多边形
   * @returns 所有绘制的世界坐标的数组
   */
  drawPolygon: () => Promise<Array<Cartesian3>>
  /**
   * 绘制曲面
   * @returns 绘制曲面的特征点（世界坐标）数组
   */
  drawCurvePolygon: () => Promise<Array<Cartesian3>>
  /**
   * 绘制直箭头
   * @returns 绘制直箭头的特征点（世界坐标）数组
   */
  drawStraightArrow: () => Promise<Array<Cartesian3>>
  /**
   * 绘制宽箭头
   * @returns 绘制宽箭头的特征点（世界坐标）数组
   */
  drawWideArrow: () => Promise<Array<Cartesian3>>
  /**
   * 绘制攻击箭头
   * @returns 绘制攻击箭头的特征点（世界坐标）数组
   */
  drawAttackArrow: () => Promise<Array<Cartesian3>>
  /**
   * 绘制双箭头
   * @returns 绘制攻击箭头的特征点（世界坐标）数组
   */
  drawDoubleArrow: () => Promise<Array<Cartesian3>>
  /**
   * 取消当前绘制或编辑操作
   */
  abort: () => void
}

/**
 * 编辑工具的状态
 */
export const enum EditToolStatus {
  Default = 'default', // 默认状态，无操作
  Drawing = 'drawing', // 正在绘制
  Editing = 'editing', // 正在编辑现有图形 (未来可能添加)
}

// 定义一个接口，用于描述绘制函数需要的依赖
// 这样可以清晰地知道每个绘制函数需要哪些上下文信息
export interface DrawDependencies {
  viewer: Viewer
  bus: EventBus
  position: ShallowRef<Cartesian3 | null>
  status: Ref<EditToolStatus>
  /** 注册当前绘制操作的取消回调 */
  registerAbort: (cb: Function | null) => void
  /** 调用全局取消操作 */
  globalAbort: () => void
}
