/**
 * @Author: Caven Chen
 * @Date: 2020-01-15
 */
import {
  Cartesian2,
  WebMercatorTilingScheme,
  ImageryProvider,
  UrlTemplateImageryProvider,
  type ImageryTypes,
} from 'cesium'

import BD09TilingScheme from '../tilingScheme/BD09TilingScheme'

type BaiduStyle = 'img' | 'vec'
type BaiduCrs = 'WGS84' | 'BD09'
type BaiduImageryProviderOptions = Omit<
  UrlTemplateImageryProvider.ConstructorOptions & {
    url?: string
    protocol?: string
    style?: BaiduStyle
    crs?: BaiduCrs
  },
  'url'
> & { url?: string }

// const TILE_URL = {
//   img: '//shangetu{s}.map.bdimg.com/it/u=x={x};y={y};z={z};v=009;type=sate&fm=46',
//   vec: '//online{s}.map.bdimg.com/tile/?qt=tile&x={x}&y={y}&z={z}&styles=sl&v=020',
//   custom: '//api{s}.map.bdimg.com/customimage/tile?&x={x}&y={y}&z={z}&scale=1&customid={style}',
//   traffic:
//     '//its.map.baidu.com:8002/traffic/TrafficTileService?time={time}&label={labelStyle}&v=016&level={z}&x={x}&y={y}&scaler=2',
// }
const TILE_URL = {
  img: '//maponline{s}.bdimg.com/starpic/u=x={x};y={y};z={z};v=009;type=sate&qt=satepc&app=webearth2&udt={udt}&fm=46&v=009',
  vec: '//maponline{s}.bdimg.com/tile/?qt=vtile&x={x}&y={y}&z={z}&styles=pl&scaler=2&udt={udt}&from=jsapi3_0&showtext=1',
  // custom: '//api{s}.map.bdimg.com/customimage/tile?&x={x}&y={y}&z={z}&scale=1&customid={style}',
  // traffic: '//its.map.baidu.com:8002/traffic/TrafficTileService?time={time}&label={labelStyle}&v=016&level={z}&x={x}&y={y}&scaler=2',
}
class BaiduImageryProvider extends UrlTemplateImageryProvider {
  // private _rectangle: Rectangle
  private _url: string
  private _crs: BaiduCrs
  private _style: BaiduStyle
  constructor(options: BaiduImageryProviderOptions) {
    // options['url'] =
    //   options.url || [options.protocol || '', TILE_URL[options.style] || TILE_URL['vec']].join('')
    let url = TILE_URL['vec']
    if (typeof options.style === 'string' && options.style in TILE_URL) {
      url = TILE_URL[options.style]
    }
    options['url'] = options.url || [options.protocol || '', url].join('')

    if (options.crs === 'WGS84') {
      const resolutions = []
      for (let i = 0; i < 19; i++) {
        resolutions[i] = 256 * Math.pow(2, 18 - i)
      }
      options['tilingScheme'] = new BD09TilingScheme({
        resolutions,
        rectangleSouthwestInMeters: new Cartesian2(-20037726.37, -12474104.17),
        rectangleNortheastInMeters: new Cartesian2(20037726.37, 12474104.17),
      })
    } else {
      options['tilingScheme'] = new WebMercatorTilingScheme({
        rectangleSouthwestInMeters: new Cartesian2(-33554054, -33746824),
        rectangleNortheastInMeters: new Cartesian2(33554054, 33746824),
      })
    }
    options['maximumLevel'] = 18
    super(options as UrlTemplateImageryProvider.ConstructorOptions)
    // @ts-expect-error 重写父类属性
    this._rectangle = this.tilingScheme.rectangle
    this._url = options.url
    this._crs = options.crs || 'BD09'
    this._style = options.style || 'vec'
  }

  override requestImage(x: number, y: number, level: number) {
    const xTiles = this.tilingScheme.getNumberOfXTilesAtLevel(level)
    const yTiles = this.tilingScheme.getNumberOfYTilesAtLevel(level)
    let url = this._url
      .replace('{z}', level.toString())
      .replace('{s}', String(1))
      .replace('{style}', this._style)
      .replace('{udt}', String(new Date().getTime()))
    if (this._crs === 'WGS84') {
      url = url.replace('{x}', String(x)).replace('{y}', String(-y))
    } else {
      url = url.replace('{x}', String(x - xTiles / 2)).replace('{y}', String(yTiles / 2 - y - 1))
    }
    return ImageryProvider.loadImage(this, url) as Promise<ImageryTypes>
  }
}

export default BaiduImageryProvider
export { BaiduImageryProvider, type BaiduStyle, type BaiduCrs, type BaiduImageryProviderOptions }
