/**
 * @Author: Caven Chen
 * @Date: 2020-01-15
 */

import { UrlTemplateImageryProvider, type ImageryProvider } from 'cesium'
import GCJ02TilingScheme from '../tilingScheme/GCJ02TilingScheme'

type TencentStyle = 'img' | 'elec' | 'terrain'
type TencentCrs = 'WGS84' | 'GCJ02'
type TencentImageryProviderOptions = Omit<
  UrlTemplateImageryProvider.ConstructorOptions & {
    protocol?: string
    style?: TencentStyle
    crs?: TencentCrs
    mapStyle?: string
  },
  'url'
> & { url?: string }

const TILE_URL: Record<TencentStyle, string> = {
  img: '//p{s}.map.gtimg.com/sateTiles/{z}/{sx}/{sy}/{x}_{reverseY}.jpg?version=400',
  elec: '//rt{s}.map.gtimg.com/tile?z={z}&x={x}&y={reverseY}&styleid={style}&scene=0&version=347',
  terrain: '//p{s}.map.gtimg.com/demTiles/{z}/{sx}/{sy}/{x}_{reverseY}.jpg&scene=0',
}

class TencentImageryProvider extends UrlTemplateImageryProvider {
  constructor(options: TencentImageryProviderOptions) {
    let url = TILE_URL['elec']
    if (typeof options.style === 'string' && options.style in TILE_URL) {
      url = TILE_URL[options.style]
    }
    url = options.url || [options.protocol || '', url].join('')
    // mapStyle改变矢量地图样式
    options['url'] = url.replace('{style}', options.mapStyle || '1')

    if (!options.subdomains || !options.subdomains.length) {
      options['subdomains'] = ['0', '1', '2']
    }

    if (options.style === 'img') {
      options['customTags'] = {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        sx: (imageryProvider: ImageryProvider, x: number, y: number, level: number) => {
          return x >> 4
        },
        sy: (imageryProvider: ImageryProvider, x: number, y: number, level: number) => {
          return ((1 << level) - 1 - y) >> 4
        },
      }
    }

    if (options.crs === 'WGS84') {
      options['tilingScheme'] = new GCJ02TilingScheme()
    }
    super(options as UrlTemplateImageryProvider.ConstructorOptions)
  }
}

export default TencentImageryProvider
export {
  TencentImageryProvider,
  type TencentStyle,
  type TencentCrs,
  type TencentImageryProviderOptions,
}
