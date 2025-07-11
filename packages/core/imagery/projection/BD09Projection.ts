/**
 * @Author: Caven Chen
 * @Date: 2020-01-15
 */
type FactorArray = [number, number, number, number, number, number, number, number, number, number]

const EARTH_RADIUS = 6370996.81
const MC_BAND: number[] = [12890594.86, 8362377.87, 5591021, 3481989.83, 1678043.12, 0]
const LL_BAND: number[] = [75, 60, 45, 30, 15, 0]
const MC2LL: FactorArray[] = [
  [
    1.410526172116255e-8, 8.98305509648872e-6, -1.9939833816331, 2.009824383106796e2,
    -1.872403703815547e2, 91.6087516669843, -23.38765649603339, 2.57121317296198, -0.03801003308653,
    1.73379812e7,
  ],
  [
    -7.435856389565537e-9, 8.983055097726239e-6, -0.78625201886289, 96.32687599759846,
    -1.85204757529826, -59.36935905485877, 47.40033549296737, -16.50741931063887, 2.28786674699375,
    1.026014486e7,
  ],
  [
    -3.030883460898826e-8, 8.98305509983578e-6, 0.30071316287616, 59.74293618442277, 7.357984074871,
    -25.38371002664745, 13.45380521110908, -3.29883767235584, 0.32710905363475, 6.85681737e6,
  ],
  [
    -1.981981304930552e-8, 8.983055099779535e-6, 0.03278182852591, 40.31678527705744,
    0.65659298677277, -4.44255534477492, 0.85341911805263, 0.12923347998204, -0.04625736007561,
    4.48277706e6,
  ],
  [
    3.09191371068437e-9, 8.983055096812155e-6, 0.00006995724062, 23.10934304144901,
    -0.00023663490511, -0.6321817810242, -0.00663494467273, 0.03430082397953, -0.00466043876332,
    2.5551644e6,
  ],
  [
    2.890871144776878e-9, 8.983055095805407e-6, -0.00000003068298, 7.47137025468032,
    -0.00000353937994, -0.02145144861037, -0.00001234426596, 0.00010322952773, -0.00000323890364,
    8.260885e5,
  ],
]
const LL2MC: FactorArray[] = [
  [
    -0.0015702102444, 1.113207020616939e5, 1.704480524535203e15, -1.033898737604234e16,
    2.611266785660388e16, -3.51496691766537e16, 2.659570071840392e16, -1.072501245418824e16,
    1.800819912950474e15, 82.5,
  ],
  [
    // eslint-disable-next-line no-loss-of-precision
    8.277824516172526e-4, 1.113207020463578e5, 6.477955746671608e8, -4.082003173641316e9,
    1.077490566351142e10, -1.517187553151559e10, 1.205306533862167e10, -5.124939663577472e9,
    9.133119359512032e8, 67.5,
  ],
  [
    0.00337398766765, 1.113207020202162e5, 4.481351045890365e6, -2.339375119931662e7,
    7.968221547186455e7, -1.159649932797253e8, 9.723671115602145e7, -4.366194633752821e7,
    8.477230501135234e6, 52.5,
  ],
  [
    0.00220636496208, 1.113207020209128e5, 5.175186112841131e4, 3.796837749470245e6,
    9.920137397791013e5, -1.22195221711287e6, 1.340652697009075e6, -6.209436990984312e5,
    1.444169293806241e5, 37.5,
  ],
  [
    -3.441963504368392e-4, 1.113207020576856e5, 2.782353980772752e2, 2.485758690035394e6,
    6.070750963243378e3, 5.482118345352118e4, 9.540606633304236e3, -2.71055326746645e3,
    1.405483844121726e3, 22.5,
  ],
  [
    -3.218135878613132e-4, 1.113207020701615e5, 0.00369383431289, 8.237256402795718e5,
    0.46104986909093, 2.351343141331292e3, 1.58060784298199, 8.77738589078284, 0.37238884252424,
    7.45,
  ],
]

class Point {
  lat: number
  lng: number
  constructor(lng?: number | string, lat?: number | string) {
    if (typeof lng === 'string') {
      lng = parseFloat(lng)
    }
    if (typeof lat === 'string') {
      lat = parseFloat(lat)
    }
    this.lng = lng || 0
    this.lat = lat || 0
  }
}

class Pixel {
  x: number
  y: number
  constructor(x: number, y: number) {
    this.x = x || 0
    this.y = y || 0
  }
}

class BD09Projection {
  isWgs84: boolean
  constructor() {
    this.isWgs84 = false
  }

  /**
   * 根据平面直角坐标计算两点间距离;
   * @param {Point} point1 平面直角点坐标1
   * @param {Point} point2 平面直角点坐标2;
   * @return {Number} 返回两点间的距离
   */
  getDistanceByMC(point1: Point, point2: Point) {
    if (!point1 || !point2) {
      return 0
    }
    point1 = this.convertMC2LL(point1)
    if (!point1) {
      return 0
    }
    const x1 = this.toRadians(point1['lng'])
    const y1 = this.toRadians(point1['lat'])
    point2 = this.convertMC2LL(point2)
    if (!point2) {
      return 0
    }
    const x2 = this.toRadians(point2['lng'])
    const y2 = this.toRadians(point2['lat'])
    return this.getDistance(x1, x2, y1, y2)
  }

  /**
   * 根据经纬度坐标计算两点间距离;
   * @param point1
   * @param point2
   * @returns {number|*} 返回两点间的距离
   */
  getDistanceByLL(point1: Point, point2: Point) {
    if (!point1 || !point2) {
      return 0
    }
    point1['lng'] = this.getLoop(point1['lng'], -180, 180)
    point1['lat'] = this.getRange(point1['lat'], -74, 74)
    point2['lng'] = this.getLoop(point2['lng'], -180, 180)
    point2['lat'] = this.getRange(point2['lat'], -74, 74)
    const x1 = this.toRadians(point1['lng'])
    const y1 = this.toRadians(point1['lat'])
    const x2 = this.toRadians(point2['lng'])
    const y2 = this.toRadians(point2['lat'])
    return this.getDistance(x1, x2, y1, y2)
  }

  /**
   * 平面直角坐标转换成经纬度坐标;
   * @param point
   * @returns {{lng: number, lat: number}}
   */
  convertMC2LL(point: Point) {
    if (!point) {
      return new Point()
    }
    let lnglat = new Point()
    if (this.isWgs84) {
      lnglat.lng = (point.lng / 20037508.34) * 180
      const mmy = (point.lat / 20037508.34) * 180
      lnglat.lat = (180 / Math.PI) * (2 * Math.atan(Math.exp((mmy * Math.PI) / 180)) - Math.PI / 2)
      return new Point(lnglat['lng'].toFixed(6), lnglat['lat'].toFixed(6))
    }

    const temp = {
      lng: Math.abs(point['lng']),
      lat: Math.abs(point['lat']),
    }

    let factor = undefined
    for (let i = 0; i < MC_BAND.length; i++) {
      if (temp['lat'] >= MC_BAND[i]!) {
        factor = MC2LL[i]
        break
      }
    }
    if (!factor) {
      return new Point(0, 0)
    }
    lnglat = this.convertor(point, factor)
    return new Point(lnglat['lng'].toFixed(6), lnglat['lat'].toFixed(6))
  }

  /**
   * 经纬度坐标转换成平面直角坐标;
   * @param point 经纬度坐标
   * @returns {{lng: number, lat: number}|*}
   */
  convertLL2MC(point: Point) {
    if (!point) {
      return { lng: 0, lat: 0 }
    }
    if (point['lng'] > 180 || point['lng'] < -180 || point['lat'] > 90 || point['lat'] < -90) {
      return point
    }

    if (this.isWgs84) {
      const mercator = new Point()
      const earthRad = 6378137.0
      mercator.lng = ((point.lng * Math.PI) / 180) * earthRad
      const a = (point.lat * Math.PI) / 180
      mercator.lat = (earthRad / 2) * Math.log((1.0 + Math.sin(a)) / (1.0 - Math.sin(a)))

      return {
        lng: parseFloat(mercator['lng'].toFixed(2)),
        lat: parseFloat(mercator['lat'].toFixed(2)),
      }
    }

    point['lng'] = this.getLoop(point['lng'], -180, 180)
    point['lat'] = this.getRange(point['lat'], -74, 74)
    const temp = { lng: point['lng'], lat: point['lat'] }
    let factor = undefined
    for (let i = 0; i < LL_BAND.length; i++) {
      if (temp['lat'] >= LL_BAND[i]!) {
        factor = LL2MC[i]
        break
      }
    }
    if (!factor) {
      for (let i = 0; i < LL_BAND.length; i++) {
        if (temp['lat'] <= -LL_BAND[i]!) {
          factor = LL2MC[i]
          break
        }
      }
    }
    if (!factor) {
      return { lng: 0, lat: 0 }
    }

    const mc = this.convertor(point, factor)
    return {
      lng: parseFloat(mc['lng'].toFixed(2)),
      lat: parseFloat(mc['lat'].toFixed(2)),
    }
  }

  /**
   *
   * @param fromPoint
   * @param factor
   * @returns {{lng: *, lat: *}}
   */
  convertor(fromPoint: Point, factor: FactorArray) {
    if (!fromPoint || !factor) {
      return new Point()
    }
    let x = factor[0] + factor[1] * Math.abs(fromPoint['lng'])
    const temp = Math.abs(fromPoint['lat']) / factor[9]
    let y =
      factor[2] +
      factor[3] * temp +
      factor[4] * temp * temp +
      factor[5] * temp * temp * temp +
      factor[6] * temp * temp * temp * temp +
      factor[7] * temp * temp * temp * temp * temp +
      factor[8] * temp * temp * temp * temp * temp * temp
    x *= fromPoint['lng'] < 0 ? -1 : 1
    y *= fromPoint['lat'] < 0 ? -1 : 1
    return {
      lng: x,
      lat: y,
    }
  }

  /**
   *
   * @param x1
   * @param x2
   * @param y1
   * @param y2
   * @returns {number}
   */
  getDistance(x1: number, x2: number, y1: number, y2: number) {
    return (
      EARTH_RADIUS *
      Math.acos(Math.sin(y1) * Math.sin(y2) + Math.cos(y1) * Math.cos(y2) * Math.cos(x2 - x1))
    )
  }

  /**
   *
   * @param deg
   * @returns {number}
   */
  toRadians(deg: number) {
    return (Math.PI * deg) / 180
  }

  /**
   *
   * @param rad
   * @returns {number}
   */
  toDegrees(rad: number) {
    return (180 * rad) / Math.PI
  }

  /**
   *
   * @param v
   * @param a
   * @param b
   * @returns {number}
   */
  getRange(v: number, a: number, b: number) {
    if (a != null) {
      v = Math.max(v, a)
    }
    if (b != null) {
      v = Math.min(v, b)
    }
    return v
  }

  /**
   *
   * @param v
   * @param a
   * @param b
   * @returns {*}
   */
  getLoop(v: number, a: number, b: number) {
    while (v > b) {
      v -= b - a
    }
    while (v < a) {
      v += b - a
    }
    return v
  }

  /**
   *
   * @param point
   * @returns {{lng: number, lat: number}|*}
   */
  lngLatToMercator(point: Point) {
    return this.convertLL2MC(point)
  }

  /**
   *
   * @param point
   * @returns {{x: (number|*), y: (number|*)}}
   */
  lngLatToPoint(point: Point): Pixel {
    const mercator = this.convertLL2MC(point)
    return {
      x: mercator['lng'],
      y: mercator['lat'],
    }
  }

  /**
   * 墨卡托变换至经纬度
   * @param point 墨卡托
   * @returns Point 经纬度
   */
  mercatorToLngLat(point: Point) {
    return this.convertMC2LL(point)
  }

  /**
   * 平面到球面坐标
   * @param point 平面坐标
   * @returns Point 球面坐标
   */
  pointToLngLat(point: Pixel) {
    const mercator = { lng: point.x, lat: point.y }
    return this.convertMC2LL(mercator)
  }

  /**
   * 地理坐标转换至像素坐标
   * @param point 地理坐标
   * @param zoom 级别
   * @param mapCenter 地图中心点，注意为了保证没有误差，这里需要传递墨卡托坐标
   * @param mapSize 地图容器大小
   */
  pointToPixel(
    point: Point,
    zoom: number,
    mapCenter: Point,
    mapSize: { width: number; height: number },
  ) {
    if (!point) {
      return
    }
    point = this.lngLatToMercator(point)
    const zoomUnits = this.getZoomUnits(zoom)
    const x = Math.round((point['lng'] - mapCenter['lng']) / zoomUnits + mapSize.width / 2)
    const y = Math.round((mapCenter['lat'] - point['lat']) / zoomUnits + mapSize.height / 2)
    return { x, y }
  }

  /**
   * 像素坐标转换至地理坐标
   * @param pixel 像素坐标
   * @param zoom 级别
   * @param mapCenter 地图中心点，注意为了保证没有误差，这里需要传递墨卡托坐标
   * @param mapSize 地图容器大小
   */
  pixelToPoint(
    pixel: Pixel,
    zoom: number,
    mapCenter: Point,
    mapSize: { width: number; height: number },
  ) {
    if (!pixel) {
      return
    }
    const zoomUnits = this.getZoomUnits(zoom)
    const lng = mapCenter['lng'] + zoomUnits * (pixel.x - mapSize.width / 2)
    const lat = mapCenter['lat'] - zoomUnits * (pixel.y - mapSize.height / 2)
    const point = { lng, lat }
    return this.mercatorToLngLat(point)
  }

  /**
   *
   * @param zoom
   * @returns {number}
   */
  getZoomUnits(zoom: number) {
    return Math.pow(2, 18 - zoom)
  }
}

export default BD09Projection
