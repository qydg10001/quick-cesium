import { ImageryLayer, ImageryProvider, UrlTemplateImageryProvider } from 'cesium'
import { createUUID } from '../../utils'
import type { IConfigurable, ConfigurableClassType } from '../../types/IConfigurable'
import { MapLayerType, type XyzImageryLayerOptions } from '../types'

class XyzImageryLayer extends ImageryLayer implements IConfigurable<XyzImageryLayerOptions> {
  readonly id: string = createUUID()
  name: string
  url: string
  provider: ImageryProvider
  // TODO: 切片方案，后续添加相关内容，目前默认3857
  // tilingScheme

  constructor(name: string, url: string, provider: ImageryProvider) {
    super(provider)
    this.name = name
    this.url = url
    this.provider = provider
  }

  static fromConfig(config: XyzImageryLayerOptions): XyzImageryLayer {
    return new XyzImageryLayer(
      config.name,
      config.url,
      new UrlTemplateImageryProvider({ url: config.url }),
    )
  }

  toConfig(): XyzImageryLayerOptions {
    return {
      layerType: MapLayerType.XYZ,
      name: this.name,
      url: this.url,
      id: this.id,
    }
  }
}

// 用于类型检查，确保 OnlineImageryLayer 类符合 ConfigurableClassType 类型
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _checkMyComponentType: ConfigurableClassType<XyzImageryLayer, XyzImageryLayerOptions> =
  XyzImageryLayer

export { XyzImageryLayer }
