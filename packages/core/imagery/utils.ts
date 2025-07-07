import type { ImageryProvider } from 'cesium'
import AMapImageryProvider, { type AMapStyle } from './provider/AMapImageryProvider'
import BaiduImageryProvider, { type BaiduStyle } from './provider/BaiduImageryProvider'
import TdtImageryProvider, { type TdtStyle } from './provider/TdtImageryProvider'
import TencentImageryProvider, { type TencentStyle } from './provider/TencentImageryProvider'
import type { OnlineMapType } from './types'

/**
 * 获取地图服务
 * @param type 地图类型
 * @returns 地图服务
 */
const getOnlineMapProvider = (type: OnlineMapType): ImageryProvider => {
  const info = type.split('_')
  if (!info[0] || !info[1]) {
    throw new Error('添加地图服务失败，请检查地图类型')
  }
  const style = info[1]
  if (info[0] === 'tdt') {
    if (!['vec', 'cva', 'img', 'cia', 'ter', 'cta', 'ibo'].includes(style)) {
      throw new Error(`不支持的天地图类型 ${style}`)
    }
    return new TdtImageryProvider({
      style: style as TdtStyle,
    })
  }
  if (info[0] === 'amap') {
    if (!['img', 'elec', 'cva'].includes(style)) {
      throw new Error(`不支持的高德地图类型 ${style}`)
    }
    return new AMapImageryProvider({
      style: style as AMapStyle,
      crs: 'WGS84',
    })
  }
  if (info[0] === 'baidu') {
    if (!['vec', 'img'].includes(style)) {
      throw new Error(`不支持的百度地图类型 ${style}`)
    }
    return new BaiduImageryProvider({
      style: style as BaiduStyle,
      crs: 'WGS84',
    })
  }
  if (info[0] === 'tencent') {
    if (!['elec', 'img', 'terrain'].includes(style)) {
      throw new Error(`不支持的腾讯地图类型 ${style}`)
    }
    return new TencentImageryProvider({
      style: style as TencentStyle,
      crs: 'WGS84',
    })
  }
  throw new Error('添加地图服务失败，请检查地图类型')
}

export { getOnlineMapProvider }
