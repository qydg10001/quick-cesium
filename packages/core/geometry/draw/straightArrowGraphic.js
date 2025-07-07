import * as Cesium from 'cesium'
import DrawUtil from './drawUtil'

const tailWidthFactor = 0.07
const neckWidthFactor = 0.07
const headWidthFactor = 0.1
const headAngle = Math.PI - Math.PI / 8.5
const neckAngle = Math.PI - Math.PI / 13

// 创建箭头点数组
function createPositions(worldPositions) {
  // let pnts = Parse.parsePolygonCoordToArray(
  //   Transform.transformCartesianArrayToWGS84Array(this._positions)
  // )[0]
  let pnts = worldPositions.map((car3) => {
    const carto = Cesium.Cartographic.fromCartesian(car3)
    return [Cesium.Math.toDegrees(carto.longitude), Cesium.Math.toDegrees(carto.latitude)]
  })
  // 箭头尾部中间
  let pnt1 = pnts[0]
  // 箭头顶点
  let pnt2 = pnts[1]
  let len = DrawUtil.getBaseLength(pnts)
  let tailWidth = len * tailWidthFactor
  let neckWidth = len * neckWidthFactor
  let headWidth = len * headWidthFactor
  // 箭头左尾点
  let tailLeft = DrawUtil.getThirdPoint(pnt2, pnt1, Cesium.Math.PI_OVER_TWO, tailWidth, true)
  // 箭头右尾点
  let tailRight = DrawUtil.getThirdPoint(pnt2, pnt1, Cesium.Math.PI_OVER_TWO, tailWidth, false)
  // 箭头左端点
  let headLeft = DrawUtil.getThirdPoint(pnt1, pnt2, headAngle, headWidth, false)
  // 箭头右端点
  let headRight = DrawUtil.getThirdPoint(pnt1, pnt2, headAngle, headWidth, true)
  // 箭头左颈点
  let neckLeft = DrawUtil.getThirdPoint(pnt1, pnt2, neckAngle, neckWidth, false)
  // 箭头右颈点
  let neckRight = DrawUtil.getThirdPoint(pnt1, pnt2, neckAngle, neckWidth, true)
  const pts = [tailLeft, neckLeft, headLeft, pnt2, headRight, neckRight, tailRight]
  return DrawUtil.positionDistinct(pts.map((p) => Cesium.Cartesian3.fromDegrees(p[0], p[1])))
}

export { createPositions }
