import { ImageryLayer, ImageryProvider } from 'cesium'
import type { IConfigurable, ConfigurableClassType } from '../../types/IConfigurable'
import { MapLayerType, OnlineMapType, type OnlineImageryLayerOptions } from '../types'
import { createUUID } from '../../utils'
import { getOnlineMapProvider } from '../utils'

class OnlineImageryLayer extends ImageryLayer implements IConfigurable<OnlineImageryLayerOptions> {
  readonly id: string = createUUID()
  name: string
  type: OnlineMapType
  provider: ImageryProvider

  constructor(name: string, type: OnlineMapType, provider: ImageryProvider) {
    super(provider)
    this.name = name
    this.type = type
    this.provider = provider
  }

  static fromConfig(config: OnlineImageryLayerOptions): OnlineImageryLayer {
    return new OnlineImageryLayer(config.name, config.type, getOnlineMapProvider(config.type))
  }

  toConfig(): OnlineImageryLayerOptions {
    return {
      layerType: MapLayerType.Online,
      name: this.name,
      type: this.type,
      id: this.id,
    }
  }
}

// 用于类型检查，确保 OnlineImageryLayer 类符合 ConfigurableClassType 类型
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _checkMyComponentType: ConfigurableClassType<OnlineImageryLayer, OnlineImageryLayerOptions> =
  OnlineImageryLayer

export { OnlineImageryLayer }
