/**
 * @Author: Caven Chen
 * @Date: 2020-01-15
 */

import {
  WebMercatorTilingScheme,
  Math as CesiumMath,
  Cartographic,
  Cartesian2,
  Rectangle,
  defined,
  Cartesian3,
  type Ellipsoid,
} from 'cesium'
import gcoord from 'gcoord'

import BD09Projection from '../projection/BD09Projection'

class BD09TilingScheme extends WebMercatorTilingScheme {
  resolutions: Array<number>
  constructor(options?: {
    ellipsoid?: Ellipsoid
    numberOfLevelZeroTilesX?: number
    numberOfLevelZeroTilesY?: number
    rectangleSouthwestInMeters?: Cartesian2
    rectangleNortheastInMeters?: Cartesian2
    resolutions?: Array<number>
  }) {
    super(options)
    // TODO:这里不继承自WebMercatorTilingScheme可能是个更好的办法，然后对应provider、projection可能都要改写
    // @ts-expect-error 重写父类属性
    this._projection = new BD09Projection()
    this.projection.project = function (cartographic, result) {
      // result = result || {}
      // result = CoordTransform.WGS84ToGCJ02(
      //   CesiumMath.toDegrees(cartographic.longitude),
      //   CesiumMath.toDegrees(cartographic.latitude),
      // )
      // result = CoordTransform.GCJ02ToBD09(result[0], result[1])
      // result[0] = Math.min(result[0], 180)
      // result[0] = Math.max(result[0], -180)
      // result[1] = Math.min(result[1], 74.000022)
      // result[1] = Math.max(result[1], -71.988531)
      // result = projection.lngLatToPoint({
      //   lng: result[0],
      //   lat: result[1],
      // })
      const coordBd09 = gcoord.transform(
        [CesiumMath.toDegrees(cartographic.longitude), CesiumMath.toDegrees(cartographic.latitude)],
        gcoord.WGS84,
        gcoord.BD09,
      )
      // 防止超出百度地图经纬度范围
      coordBd09[0] = Math.min(coordBd09[0], 180)
      coordBd09[0] = Math.max(coordBd09[0], -180)
      coordBd09[1] = Math.min(coordBd09[1], 74.000022)
      coordBd09[1] = Math.max(coordBd09[1], -71.988531)
      const coord = gcoord.transform(coordBd09, gcoord.BD09, gcoord.BD09MC)
      result = new Cartesian3(coord[0], coord[1])
      return result
    }
    this.projection.unproject = function (cartesian, result) {
      // result = result || {}
      // result = projection.mercatorToLngLat({
      //   lng: cartesian.x,
      //   lat: cartesian.y,
      // })
      // result = CoordTransform.BD09ToGCJ02(result.lng, result.lat)
      // result = CoordTransform.GCJ02ToWGS84(result[0], result[1])
      // return new Cartographic(CesiumMath.toRadians(result[0]), CesiumMath.toRadians(result[1]))
      const coord = gcoord.transform([cartesian.x, cartesian.y], gcoord.BD09MC, gcoord.WGS84)
      result = new Cartographic(CesiumMath.toRadians(coord[0]), CesiumMath.toRadians(coord[1]))
      return result
    }
    if (options?.resolutions) {
      this.resolutions = options.resolutions
    } else {
      const resolutions = []
      for (let i = 0; i < 19; i++) {
        resolutions[i] = Math.pow(2, 18 - i)
      }
      this.resolutions = resolutions
    }
  }

  /**
   *
   * @param x
   * @param y
   * @param level
   * @param result
   * @returns {Rectangle|*}
   */
  override tileXYToNativeRectangle(
    x: number,
    y: number,
    level: number,
    result: Rectangle | null,
  ): Rectangle {
    const tileWidth = this.resolutions[level] || Math.pow(2, 18 - level)
    const west = x * tileWidth
    const east = (x + 1) * tileWidth
    const north = ((y = -y) + 1) * tileWidth
    const south = y * tileWidth

    if (!defined(result)) {
      return new Rectangle(west, south, east, north)
    }

    result.west = west
    result.south = south
    result.east = east
    result.north = north
    return result
  }

  /**
   *
   * @param position
   * @param level
   * @param result
   * @returns {Cartesian2|*}
   */
  override positionToTileXY(position: Cartographic, level: number, result: Cartesian2): Cartesian2 {
    const rectangle = this.rectangle
    if (!Rectangle.contains(rectangle, position)) {
      return new Cartesian2()
    }
    const projection = this.projection
    const webMercatorPosition = projection.project(position)
    if (!defined(webMercatorPosition)) {
      return new Cartesian2()
    }
    const tileWidth = this.resolutions[level] || Math.pow(2, 18 - level)
    const xTileCoordinate = Math.floor(webMercatorPosition.x / tileWidth)
    const yTileCoordinate = -Math.floor(webMercatorPosition.y / tileWidth)
    if (!defined(result)) {
      return new Cartesian2(xTileCoordinate, yTileCoordinate)
    }
    result.x = xTileCoordinate
    result.y = yTileCoordinate
    return result
  }
}

export default BD09TilingScheme
