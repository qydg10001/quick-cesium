import { Cartesian3, Cartographic, Math as CesiumMath, Viewer } from 'cesium'
import type { IConfigurable, ConfigurableClassType } from '../types/IConfigurable'
import { createUUID } from '../utils'

type BookmarkOptions = {
  id?: string
  label: string
  x: number
  y: number
  z: number
  heading?: number
  pitch?: number
  roll?: number
  // isDefaultView?: boolean
}

class Bookmark implements IConfigurable<BookmarkOptions> {
  // id
  readonly id: string = createUUID()
  // 标签名称
  label: string
  // 世界坐标的位置
  position: Cartesian3
  // 方向角，单位弧度
  heading: number
  // 俯仰角，单位弧度
  pitch: number
  // 翻滚角，单位弧度
  roll: number
  // 作为默认视角的标记
  // readonly isDefaultView: boolean = false

  /**
   * 创建书签
   * @param label 标签名称
   * @param position 世界坐标位置
   * @param heading 方向角，单位弧度
   * @param pitch 俯仰角，单位弧度
   * @param roll 翻滚角，单位弧度
   */
  constructor(
    label: string,
    position: Cartesian3,
    heading?: number,
    pitch?: number,
    roll?: number,
  ) {
    this.id = createUUID()
    this.label = label
    this.position = position.clone()
    this.heading = heading || 0
    this.pitch = pitch || CesiumMath.toRadians(-90)
    this.roll = roll || 0
  }

  /**
   * 通过世界坐标和方向角创建书签
   * @param label 书签标签
   * @param position 世界坐标位置
   * @param heading 方向角，单位度
   * @param pitch 俯仰角，单位度
   * @param roll 翻滚角，单位度
   * @returns 书签对象
   */
  static CreateByDegree(
    label: string,
    position: Cartesian3,
    heading?: number,
    pitch?: number,
    roll?: number,
  ): Bookmark {
    return new Bookmark(
      label,
      position,
      CesiumMath.toRadians(heading || 0),
      CesiumMath.toRadians(pitch || -90),
      CesiumMath.toRadians(roll || 0),
    )
  }

  /**
   * 通过经纬度坐标创建书签
   * @param label 书签标签
   * @param longitude 经度，单位度
   * @param latitude 纬度，单位度
   * @param height 高度，单位米，默认 0
   * @param heading 方向角，单位度
   * @param pitch 俯仰角，单位度
   * @param roll 翻滚角，单位度
   * @returns 书签对象
   */
  static CreateByCoordinate(
    label: string,
    longitude: number,
    latitude: number,
    height?: number,
    heading?: number,
    pitch?: number,
    roll?: number,
  ): Bookmark {
    const position = Cartographic.toCartesian(
      new Cartographic(
        CesiumMath.toRadians(longitude),
        CesiumMath.toRadians(latitude),
        height || 0,
      ),
    )
    return Bookmark.CreateByDegree(label, position, heading, pitch, roll)
  }

  /**
   * 通过配置信息创建书签
   * @param options 书签选项
   */
  static fromConfig(options: BookmarkOptions) {
    return new Bookmark(
      options.label,
      new Cartesian3(options.x, options.y, options.z),
      options.heading,
      options.pitch,
      options.roll,
    )
  }

  /**
   * 获取经纬度坐标
   * @returns 经纬度坐标
   */
  getCoordinate(): Cartographic {
    return Cartographic.fromCartesian(this.position)
  }

  /**
   * 飞到书签位置
   * @param viewer cesium Viewer 实例
   * @param duration 飞行时间，单位秒
   */
  flyTo(viewer: Viewer, duration?: number): void {
    viewer.camera.flyTo({
      destination: this.position,
      orientation: {
        heading: this.heading,
        pitch: this.pitch,
        roll: this.roll,
      },
      duration: duration || 2.0,
    })
  }

  /**
   * 瞬间跳转到书签位置
   * @param viewer cesium Viewer 实例
   */
  zoomTo(viewer: Viewer): void {
    viewer.camera.setView({
      destination: this.position,
      orientation: {
        heading: this.heading,
        pitch: this.pitch,
        roll: this.roll,
      },
    })
  }

  toConfig(): BookmarkOptions {
    return {
      id: this.id,
      label: this.label,
      x: this.position.x,
      y: this.position.y,
      z: this.position.z,
      heading: this.heading,
      pitch: this.pitch,
      roll: this.roll,
      // isDefaultView: this.isDefaultView,
    }
  }
}

// 用于类型检查，确保 Bookmark 类符合 ConfigurableClassType 类型
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _checkMyComponentType: ConfigurableClassType<Bookmark, BookmarkOptions> = Bookmark

export default Bookmark
export { Bookmark, type BookmarkOptions }
