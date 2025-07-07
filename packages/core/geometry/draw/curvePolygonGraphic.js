import * as Cesium from 'cesium'
import DrawUtil from './drawUtil'

const FITTING_COUNT = 100
const t = 0.4

function createPositions(worldPositions) {
  let pnts = worldPositions.map((car3) => {
    const carto = Cesium.Cartographic.fromCartesian(car3)
    return [Cesium.Math.toDegrees(carto.longitude), Cesium.Math.toDegrees(carto.latitude)]
  })

  if (pnts.length === 2) {
    let mid = DrawUtil.mid(pnts[0], pnts[1])
    let d = DrawUtil.distance(pnts[0], mid) / 2
    let pntLeft = DrawUtil.getThirdPoint(pnts[0], mid, Cesium.Math.PI_OVER_TWO, d, false)
    let pntRight = DrawUtil.getThirdPoint(pnts[0], mid, Cesium.Math.PI_OVER_TWO, d, true)
    pnts = [pnts[0], pntLeft, pnts[1], pntRight]
  }
  // let mid = DrawUtil.mid(pnts[0], pnts[2])
  pnts.push(pnts[0], pnts[1])
  let normals = []
  for (let i = 0; i < pnts.length - 2; i++) {
    let pnt1 = pnts[i]
    let pnt2 = pnts[i + 1]
    let pnt3 = pnts[i + 2]
    let normalPoints = DrawUtil.getBisectorNormals(t, pnt1, pnt2, pnt3)
    normals = normals.concat(normalPoints)
  }
  let count = normals.length
  normals = [normals[count - 1]].concat(normals.slice(0, count - 1))
  let pList = []
  for (let i = 0; i < pnts.length - 2; i++) {
    let pnt1 = pnts[i]
    let pnt2 = pnts[i + 1]
    pList.push(pnt1)
    for (let t = 0; t <= FITTING_COUNT; t++) {
      let pnt = DrawUtil.getCubicValue(
        t / FITTING_COUNT,
        pnt1,
        normals[i * 2],
        normals[i * 2 + 1],
        pnt2,
      )
      pList.push(pnt)
    }
    pList.push(pnt2)
  }
  return DrawUtil.positionDistinct(pList.map((p) => Cesium.Cartesian3.fromDegrees(p[0], p[1])))
}

export { createPositions }
