import { defineStore } from 'pinia'
import { type TcctXyzImageryLayerOptions } from '@quick-cesium/sdk/src'
import { shallowReactive } from 'vue'

export const useCustomMaplayerStore = defineStore('customMaplayer', () => {
  const layers = shallowReactive<Array<TcctXyzImageryLayerOptions>>([])

  return { layers }
})
