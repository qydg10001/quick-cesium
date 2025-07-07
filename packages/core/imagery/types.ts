const enum OnlineMapType {
  /** 天地图 */
  /**
   * 天地图地图
   */
  TdtMap = 'tdt_vec',
  /**
   * 天地图地图注记
   */
  TdtMapLabel = 'tdt_cva',
  /**
   * 天地图影像
   */
  TdtImage = 'tdt_img',
  /**
   * 天地图影像注记
   */
  TdtImageLabel = 'tdt_cia',
  /**
   * 天地图地形
   */
  TdtTerrain = 'tdt_ter',
  /**
   * 天地图地形注记
   */
  TdtTerrainLabel = 'tdt_cta',
  /**
   * 天地图境界
   */
  TdtBoundary = 'tdt_ibo',
  /** 高德 */
  /**
   * 高德地图
   */
  AMapMap = 'amap_elec',
  /**
   * 高德影像地图
   */
  AMapImage = 'amap_img',
  /**
   * 高德影像标注
   */
  AMapLabel = 'amap_cva',
  /** 百度 */
  /**
   * 百度地图
   */
  BaiduMap = 'baidu_vec',
  /**
   * 百度影像
   */
  BaiduImage = 'baidu_img',
  /** 腾讯 */
  /**
   * 腾讯地图
   */
  TencentMap = 'tencent_elec',
  /**
   * 腾讯影像
   */
  TencentImage = 'tencent_img',
  /**
   * 腾讯地形
   */
  TencentTerrain = 'tencent_terrain',
  /** bing */
  /**
   * bing地图
   */
  // BingMap = 'bing_vec',
  /**
   * 自定义地图服务
   */
  // CustomMapServer = 'custom_map_server',
  /**
   * 自定义地图瓦片服务
   */
  // CustomTileServer = 'custom_tile_server',
}

const enum MapLayerType {
  Online = 'online',
  XYZ = 'xyz',
}

type OnlineImageryLayerOptions = {
  layerType: MapLayerType.Online
  name: string
  type: OnlineMapType
  id?: string
}

type XyzImageryLayerOptions = {
  layerType: MapLayerType.XYZ
  name: string
  url: string
  id?: string
}

export { OnlineMapType, MapLayerType, type OnlineImageryLayerOptions, type XyzImageryLayerOptions }
