/**
 * @Author: Caven Chen
 * @Date: 2020-01-15
 */
import {
  WebMercatorTilingScheme,
  WebMercatorProjection,
  Math as CesiumMath,
  Cartographic,
  type Cartesian3,
  type Cartesian2,
  type Ellipsoid,
} from 'cesium'
import gcoord from 'gcoord'

class GCJ02TilingScheme extends WebMercatorTilingScheme {
  constructor(options?: {
    ellipsoid?: Ellipsoid
    numberOfLevelZeroTilesX?: number
    numberOfLevelZeroTilesY?: number
    rectangleSouthwestInMeters?: Cartesian2
    rectangleNortheastInMeters?: Cartesian2
  }) {
    super(options)
    const projection = new WebMercatorProjection()
    this.projection.project = function (cartographic: Cartographic, result: Cartesian3) {
      const coord = gcoord.transform(
        [CesiumMath.toDegrees(cartographic.longitude), CesiumMath.toDegrees(cartographic.latitude)],
        gcoord.WGS84,
        gcoord.GCJ02,
      )
      result = projection.project(
        new Cartographic(CesiumMath.toRadians(coord[0]), CesiumMath.toRadians(coord[1])),
      )
      return result
    }
    this.projection.unproject = function (cartesian, result) {
      const cartographic = projection.unproject(cartesian)
      const coord = gcoord.transform(
        [CesiumMath.toDegrees(cartographic.longitude), CesiumMath.toDegrees(cartographic.latitude)],
        gcoord.GCJ02,
        gcoord.WGS84,
      )
      result = new Cartographic(CesiumMath.toRadians(coord[0]), CesiumMath.toRadians(coord[1]))
      return result
    }
  }
}

export default GCJ02TilingScheme
export { GCJ02TilingScheme }
