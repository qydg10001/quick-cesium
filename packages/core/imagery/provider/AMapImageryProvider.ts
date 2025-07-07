/**
 * @Author: Caven Chen
 * @Date: 2020-01-15
 */

import GCJ02TilingScheme from '../tilingScheme/GCJ02TilingScheme'
import { UrlTemplateImageryProvider } from 'cesium'

type AMapStyle = 'img' | 'elec' | 'cva'
type AMapCrs = 'WGS84' | 'GCJ02'
type AMapImageryProviderOptions = Omit<
  UrlTemplateImageryProvider.ConstructorOptions & {
    protocol?: string
    style?: AMapStyle
    crs?: AMapCrs
  },
  'url'
> & { url?: string }

const TILE_URL: Record<AMapStyle, string> = {
  img: '//webst{s}.is.autonavi.com/appmaptile?style=6&x={x}&y={y}&z={z}',
  elec: '//webrd{s}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}',
  cva: '//webst{s}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}',
}

class AMapImageryProvider extends UrlTemplateImageryProvider {
  constructor(options: AMapImageryProviderOptions) {
    let url = TILE_URL['elec']
    if (typeof options.style === 'string' && options.style in TILE_URL) {
      url = TILE_URL[options.style]
    }
    options['url'] = options.url || [options.protocol || '', url].join('')
    if (!options.subdomains || !options.subdomains.length) {
      options['subdomains'] = ['01', '02', '03', '04']
    }
    if (options.crs === 'WGS84') {
      options['tilingScheme'] = new GCJ02TilingScheme()
    }
    super(options as UrlTemplateImageryProvider.ConstructorOptions)
  }
}
export default AMapImageryProvider
export { AMapImageryProvider, type AMapStyle, type AMapCrs, type AMapImageryProviderOptions }
