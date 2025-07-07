/**
 * @Author: Caven
 * @Date: 2020-01-15
 */

import { UrlTemplateImageryProvider } from 'cesium'

type TdtStyle = 'vec' | 'cva' | 'img' | 'cia' | 'ter' | 'cta' | 'ibo'
type TdtImageryProviderOptions = Omit<
  UrlTemplateImageryProvider.ConstructorOptions & {
    protocol?: string
    style?: TdtStyle
    key?: string
  },
  'url'
> & { url?: string }

// key来源：vue-cesium项目
// https://github.com/zouyaoji/vue-cesium/blob/dev/website/docs/zh-CN/providers/vc-imagery-provider-tianditu.md
const DEFAULT_KEY = '436ce7e50d27eede2f2929307e6b33c0'
const TILE_URL = '//t{s}.tianditu.gov.cn/DataServer?T={style}_w&x={x}&y={y}&l={z}&tk={key}'

class TdtImageryProvider extends UrlTemplateImageryProvider {
  constructor(options: TdtImageryProviderOptions) {
    super({
      url: [
        options.protocol || '',
        TILE_URL.replace(/\{style\}/g, options.style || 'vec').replace(
          /\{key\}/g,
          options.key || DEFAULT_KEY,
        ),
      ].join(''),
      subdomains: ['0', '1', '2', '3', '4', '5', '6', '7'],
      maximumLevel: 18,
    })
  }
}

export default TdtImageryProvider
export { TdtImageryProvider, type TdtStyle, type TdtImageryProviderOptions }
