import { Viewer, UrlTemplateImageryProvider } from 'cesium'
import {
  OnlineImageryLayer,
  XyzImageryLayer,
  OnlineMapType,
  getOnlineMapProvider,
} from '@quick-cesium/core'
// import { shallowReactive } from 'vue'

// 返回值类型
// 由于已经继承了ImageryLayer和ImageryProvider，所以图层管理用cesium自带的对象
interface IMapServer {
  // readonly CustomLayers: Array<XyzImageryLayer>
  addOnlineMapServer: (type: OnlineMapType, options: any) => void
  addXyzMapServer: (name: string, url: string) => void
}

function useMapServer(viewer: Viewer): IMapServer {
  // const _customLayers = shallowReactive<Array<XyzImageryLayer>>([])
  // 去掉默认加载的地图
  viewer.imageryLayers.removeAll()
  // 底图换成天地图影像+天地图影像标注
  viewer.imageryLayers.addImageryProvider(getOnlineMapProvider(OnlineMapType.TdtImage))
  viewer.imageryLayers.addImageryProvider(getOnlineMapProvider(OnlineMapType.TdtImageLabel))
  console.log('useMapServer: 初始化地图服务')
  return {
    // addMapServer: (type: OnlineMapType, options: any) => {
    //   console.log('useMapServer: 添加地图服务', type, options)
    //   switch (type) {
    //     case OnlineMapType.AMapMap:
    //       viewer.imageryLayers.addImageryProvider(
    //         new Cesium.WebMapTileServiceImageryProvider({
    //           url: 'https://webst0{1-4}.is.autonavi.com/appmaptile})
    //       )
    //   }
    // },
    // get CustomLayers() {
    //   return _customLayers
    // },
    addOnlineMapServer: (type: OnlineMapType, options: any) => {
      console.log('useMapServer: 添加在线地图服务', type, options)
      viewer.imageryLayers.add(
        new OnlineImageryLayer(getOnlineMapName(type), type, getOnlineMapProvider(type)),
      )
    },
    addXyzMapServer: (name: string, url: string) => {
      viewer.imageryLayers.add(
        new XyzImageryLayer(name, url, new UrlTemplateImageryProvider({ url })),
      )
    },
  }
}

function getOnlineMapName(type: OnlineMapType): string {
  switch (type) {
    case OnlineMapType.TdtMap:
      return '天地图地图'
    case OnlineMapType.TdtMapLabel:
      return '天地图地图标注'
    case OnlineMapType.TdtImage:
      return '天地图影像'
    case OnlineMapType.TdtImageLabel:
      return '天地图影像标注'
    case OnlineMapType.TdtTerrain:
      return '天地图地形'
    case OnlineMapType.TdtTerrainLabel:
      return '天地图地形标注'
    case OnlineMapType.TdtBoundary:
      return '天地图边界'
    case OnlineMapType.AMapMap:
      return '高德地图'
    case OnlineMapType.AMapImage:
      return '高德影像'
    case OnlineMapType.AMapLabel:
      return '高德影像标注'
    case OnlineMapType.BaiduMap:
      return '百度地图'
    case OnlineMapType.BaiduImage:
      return '百度影像'
    case OnlineMapType.TencentMap:
      return '腾讯地图'
    case OnlineMapType.TencentImage:
      return '腾讯影像'
    case OnlineMapType.TencentTerrain:
      return '腾讯地形'
  }
}

export { type IMapServer, useMapServer }
