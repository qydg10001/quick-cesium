// src/composables/useMapViewer.ts
import { inject, computed, type InjectionKey, type ShallowRef } from 'vue'
import type { Viewer } from 'cesium'

const viewerKey: InjectionKey<ShallowRef<Viewer | null>> = Symbol('viewer')

/**
 * 提供内部组件调用的获取viewer对象方法
 * @param propViewer 组件获取的viewer属性，可选（组件没有viewer属性则不传）
 * @returns 当前viewer或null
 */
function useMapViewer(props: object, propName: string = 'viewer') {
  const viewerRefFromInject: ShallowRef<Viewer | null> | undefined = inject(viewerKey)

  // 通过计算属性动态监听
  const activeViewer = computed<Viewer | null>(() => {
    // 首先尝试从inject获取viewer对象
    // 如果调用方法的组件是cesium地球的后代组件，可以获取其provide的viewer对象
    if (viewerRefFromInject && viewerRefFromInject.value) {
      return viewerRefFromInject.value
    }
    // 否则，判断传入的viewer对象是否可用（从父组件传入的属性）
    const propViewer = (props as { [propName]: Viewer })[propName] as Viewer | null | undefined
    if (propViewer) {
      return propViewer
    }
    return null
  })

  return activeViewer
}

export default useMapViewer
export { viewerKey, useMapViewer }
