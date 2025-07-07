import mitt, { type Emitter } from 'mitt'
import { Viewer, ScreenSpaceEventHandler, ScreenSpaceEventType } from 'cesium'

// Cesium 屏幕空间事件参数的联合类型
type CesiumScreenSpaceParameter =
  | ScreenSpaceEventHandler.PositionedEvent
  | ScreenSpaceEventHandler.MotionEvent
  | number // 例如 WHEEL 事件的 delta
  | ScreenSpaceEventHandler.TwoPointEvent
  | ScreenSpaceEventHandler.TwoPointMotionEvent

type CesiumScreenSpaceCallback =
  | ScreenSpaceEventHandler.PositionedEventCallback
  | ScreenSpaceEventHandler.MotionEventCallback
  | ScreenSpaceEventHandler.WheelEventCallback
  | ScreenSpaceEventHandler.TwoPointEventCallback
  | ScreenSpaceEventHandler.TwoPointMotionEventCallback

// 定义 mitt 实例中屏幕空间事件的类型映射
// Key 是 Cesium.ScreenSpaceEventType，Value 是对应的参数类型
type ScreenEvents = {
  [key in ScreenSpaceEventType]: CesiumScreenSpaceParameter
}

// 定义 mitt 实例中自定义事件的类型映射
// Key 是事件名 (string)，Value 是参数数组
type CustomEvents = {
  [key: string]: any[] // 使用 any[] 来匹配原版本的 ...args: any[]
}

// 定义 useEventBus 返回的总线对象的公共接口
type EventBus = {
  // 移除 mode 属性

  /**
   * 订阅屏幕空间事件。监听器将始终处于活跃状态。
   * @param event Cesium 屏幕空间事件类型
   * @param handler 事件处理函数
   */
  // onScreen: <Key extends keyof ScreenEvents>(
  //   event: Key,
  //   handler: (param: ScreenEvents[Key]) => void,
  // ) => void
  onScreen: (event: ScreenSpaceEventType, handler: CesiumScreenSpaceCallback) => void

  /**
   * 取消订阅屏幕空间事件。
   * @param event Cesium 屏幕空间事件类型
   * @param handler 要移除的事件处理函数 (如果省略，则移除该事件的所有监听器)
   */
  // offScreen: <Key extends keyof ScreenEvents>(
  //   event: Key,
  //   handler?: (param: ScreenEvents[Key]) => void,
  // ) => void
  offScreen: (event: ScreenSpaceEventType, handler: CesiumScreenSpaceCallback) => void

  /**
   * 订阅自定义事件。
   * @param event 事件名
   * @param handler 事件处理函数
   */
  on: <Key extends keyof CustomEvents>(
    event: Key,
    handler: (...args: CustomEvents[Key]) => void,
  ) => void

  /**
   * 取消订阅自定义事件。
   * @param event 事件名
   * @param handler 要移除的事件处理函数 (如果省略，则移除该事件的所有监听器)
   */
  off: <Key extends keyof CustomEvents>(
    event: Key,
    handler?: (...args: CustomEvents[Key]) => void,
  ) => void

  /**
   * 触发事件。
   * 如果是 Cesium 屏幕空间事件类型，则触发所有屏幕空间事件监听器。
   * 如果是字符串，则触发自定义事件监听器。
   * @param event 事件类型或事件名
   * @param args 事件参数
   */
  // 使用函数重载来区分屏幕空间事件和自定义事件的参数类型
  // emit(event: keyof ScreenEvents, param: ScreenEvents[keyof ScreenEvents]): void
  emit(event: ScreenSpaceEventType, param: CesiumScreenSpaceParameter): void
  emit(event: keyof CustomEvents, ...args: CustomEvents[keyof CustomEvents]): void

  /**
   * 销毁事件总线及其内部资源 (如 Cesium ScreenSpaceEventHandler)。
   */
  dispose: () => void
}

// 定义一个接口来存储与每个 viewer 关联的事件总线组件
interface ViewerEventBusCache {
  screenEmitter: Emitter<ScreenEvents>
  customEmitter: Emitter<CustomEvents>
  handler: ScreenSpaceEventHandler | null
}

// 使用 Map 来缓存每个 viewer 对应的事件总线组件
// Viewer 实例作为 Map 的键
const viewerEventBusCache = new Map<Viewer, ViewerEventBusCache>()

/**
 * 消息总线，接管全局屏幕空间事件，仅作用于单个 Viewer。
 * 调用该hook后，所有鼠标事件必须改为调用返回对象中的方法。
 * 使用方法参考发布订阅模式，Cesium.ScreenSpaceEventType的订阅/解订用onScreen/offScreen，自定义事件用on/off。
 * 注意，这里不单独划分带键盘按键的鼠标事件，而是到具体事件中划分。
 * @param viewer Cesium Viewer 实例
 * @returns EventBus 对象
 */
const useEventBus = (viewer: Viewer): EventBus => {
  let cache: ViewerEventBusCache | undefined = viewerEventBusCache.get(viewer)
  if (!cache) {
    cache = {
      // 创建一个 mitt 实例用于处理所有屏幕空间事件
      screenEmitter: mitt<ScreenEvents>(),
      // 创建一个 mitt 实例用于处理自定义事件
      customEmitter: mitt<CustomEvents>(),
      // 存储创建的 ScreenSpaceEventHandler 实例，以便销毁
      // 注意：这里没有使用viewer中自带的ScreenSpaceEventHandler实例，故不会接管其绑定函数
      handler: new ScreenSpaceEventHandler(viewer.canvas),
    }
    viewerEventBusCache.set(viewer, cache)
  }
  // 如果缓存中不存在 ScreenSpaceEventHandler 实例，则创建一个
  if (!cache.handler) {
    cache.handler = new ScreenSpaceEventHandler(viewer.canvas)
  }

  // 构建返回的 EventBus 对象
  const bus: EventBus = {
    // 移除 mode 属性的定义

    // onScreen 直接注册到 screenEmitter
    // onScreen(event, handler) {
    //   screenEmitter.on(event, handler)
    // },
    onScreen: cache.screenEmitter.on,

    // offScreen 直接从 screenEmitter 移除
    // offScreen(event, handler) {
    //   screenEmitter.off(event, handler)
    // },
    offScreen: cache.screenEmitter.off,

    // on 保持不变
    // on(event, handler) {
    //   customEmitter.on(event, handler as (param: any[]) => void)
    // },
    on: cache.customEmitter.on,

    // off 保持不变
    // off(event, handler) {
    //   customEmitter.off(event, handler as ((param?: any[]) => void) | undefined)
    // },
    off: cache.customEmitter.off,

    // emit 方法的实现需要处理两种不同的事件类型和参数结构
    emit(event: any, ...args: any[]) {
      // 使用 any 在实现层面处理联合类型和重载
      if (typeof event === 'string') {
        // 触发自定义事件
        // mitt.emit(type, event), event 是 payload
        cache.customEmitter.emit(event, args) // 将 ...args 作为单个数组 payload 传递
      } else if (Object.values(ScreenSpaceEventType).includes(event)) {
        // 触发屏幕空间事件 (触发所有监听器，无模式检查)
        // 屏幕空间事件通常只有一个参数
        cache.screenEmitter.emit(event, args[0] as CesiumScreenSpaceParameter)
      } else {
        console.warn(`EventBus: 不符合规范的触发事件: ${event}`)
      }
    },

    dispose() {
      if (cache.handler && !cache.handler.isDestroyed()) {
        cache.handler.destroy()
      }
      cache.handler = null
      // mitt 实例本身不需要显式销毁，它们会被垃圾回收
    },
  }

  // 用于 LEFT_CLICK 节流的状态
  let isLeftClickThrottled = false

  // 遍历所有 Cesium 屏幕空间事件类型
  for (const eventTypeString in ScreenSpaceEventType) {
    const eventType = ScreenSpaceEventType[eventTypeString] as unknown as ScreenSpaceEventType
    const eventTypeCode = Number(eventType) // 获取对应的数字代码

    // 定义 Cesium handler 实际执行的函数

    // 特殊处理 LEFT_CLICK 进行节流
    // 观测到cesium双击会触发2次单击，所以在单击里加一个200毫秒的节流
    if (eventTypeCode === ScreenSpaceEventType.LEFT_CLICK) {
      const throttledClickAction = (args: CesiumScreenSpaceParameter) => {
        if (isLeftClickThrottled) return // 如果正在节流，则忽略本次事件
        isLeftClickThrottled = true // 设置节流状态

        // 触发 LEFT_CLICK 事件到总线
        bus.emit(eventType, args)

        // 200ms 后解除节流状态
        window.setTimeout(() => {
          isLeftClickThrottled = false
        }, 200)
      }
      // 将节流后的函数设置到 Cesium handler
      cache.handler.setInputAction(throttledClickAction, eventTypeCode)
    } else {
      // 将 Cesium 原生事件参数转发到我们的 mitt 总线
      const cesiumHandlerAction = (args: CesiumScreenSpaceParameter) => {
        // 直接通过 bus.emit 触发事件，mitt 会负责分发给所有监听器
        bus.emit(eventType, args)
      }
      cache.handler.setInputAction(cesiumHandlerAction, eventTypeCode)
    }
  }

  return bus
}

export { useEventBus, type EventBus }
