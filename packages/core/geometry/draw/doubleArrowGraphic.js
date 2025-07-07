import * as Cesium from 'cesium'
import DrawUtil from './drawUtil'

// const tailWidthFactor = 0.07
// const neckWidthFactor = 0.07
// const headWidthFactor = 0.10

const headHeightFactor = 0.25
const headWidthFactor = 0.3
const neckHeightFactor = 0.85
const neckWidthFactor = 0.15
const headAngle = Math.PI - Math.PI / 8.5
const neckAngle = Math.PI - Math.PI / 13

function createPositions(worldPositions) {
  let count = worldPositions.length
  let tempPoint4 = undefined
  let connPoint = undefined
  let pnts = worldPositions.map((car3) => {
    const carto = Cesium.Cartographic.fromCartesian(car3)
    return [Cesium.Math.toDegrees(carto.longitude), Cesium.Math.toDegrees(carto.latitude)]
  })
  let pnt1 = pnts[0]
  let pnt2 = pnts[1]
  let pnt3 = pnts[2]
  if (count === 3) tempPoint4 = getTempPoint4(pnt1, pnt2, pnt3)
  else tempPoint4 = pnts[3]
  if (count === 3 || count === 4) connPoint = DrawUtil.mid(pnt1, pnt2)
  else connPoint = pnts[4]
  let leftArrowPnts, rightArrowPnts
  if (DrawUtil.isClockWise(pnt1, pnt2, pnt3)) {
    leftArrowPnts = getArrowPoints(pnt1, connPoint, tempPoint4, false)
    rightArrowPnts = getArrowPoints(connPoint, pnt2, pnt3, true)
  } else {
    leftArrowPnts = getArrowPoints(pnt2, connPoint, pnt3, false)
    rightArrowPnts = getArrowPoints(connPoint, pnt1, tempPoint4, true)
  }
  let m = leftArrowPnts.length
  let t = (m - 5) / 2
  let llBodyPnts = leftArrowPnts.slice(0, t)
  let lArrowPnts = leftArrowPnts.slice(t, t + 5)
  let lrBodyPnts = leftArrowPnts.slice(t + 5, m)
  let rlBodyPnts = rightArrowPnts.slice(0, t)
  let rArrowPnts = rightArrowPnts.slice(t, t + 5)
  let rrBodyPnts = rightArrowPnts.slice(t + 5, m)
  rlBodyPnts = DrawUtil.getBezierPoints(rlBodyPnts)
  let bodyPnts = DrawUtil.getBezierPoints(rrBodyPnts.concat(llBodyPnts.slice(1)))
  lrBodyPnts = DrawUtil.getBezierPoints(lrBodyPnts)
  // return new Cesium.PolygonHierarchy(
  //   Transform.transformWGS84ArrayToCartesianArray(
  //     Parse.parsePositions(
  //       rlBodyPnts.concat(rArrowPnts, bodyPnts, lArrowPnts, lrBodyPnts)
  //     )
  //   )
  // )
  const pts = rlBodyPnts.concat(rArrowPnts, bodyPnts, lArrowPnts, lrBodyPnts)
  return pts.map((p) => Cesium.Cartesian3.fromDegrees(p[0], p[1]))
}

function getArrowPoints(pnt1, pnt2, pnt3, clockWise) {
  let midPnt = DrawUtil.mid(pnt1, pnt2)
  let len = DrawUtil.distance(midPnt, pnt3)
  let midPnt1 = DrawUtil.getThirdPoint(pnt3, midPnt, Cesium.Math.PI, len * 0.3, true)
  let midPnt2 = DrawUtil.getThirdPoint(pnt3, midPnt, Cesium.Math.PI, len * 0.5, true)
  midPnt1 = DrawUtil.getThirdPoint(midPnt, midPnt1, Cesium.Math.PI_OVER_TWO, len / 5, clockWise)
  midPnt2 = DrawUtil.getThirdPoint(midPnt, midPnt2, Cesium.Math.PI_OVER_TWO, len / 4, clockWise)
  let points = [midPnt, midPnt1, midPnt2, pnt3]
  // 计算箭头部分
  let arrowPnts = getArrowHeadPoints(points)
  let neckLeftPoint = arrowPnts[0]
  let neckRightPoint = arrowPnts[4]
  // 计算箭身部分
  let tailWidthFactor = DrawUtil.distance(pnt1, pnt2) / DrawUtil.getBaseLength(points) / 2
  let bodyPnts = getArrowBodyPoints(points, neckLeftPoint, neckRightPoint, tailWidthFactor)
  let n = bodyPnts.length
  let lPoints = bodyPnts.slice(0, n / 2)
  let rPoints = bodyPnts.slice(n / 2, n)
  lPoints.push(neckLeftPoint)
  rPoints.push(neckRightPoint)
  lPoints = lPoints.reverse()
  lPoints.push(pnt2)
  rPoints = rPoints.reverse()
  rPoints.push(pnt1)
  return lPoints.reverse().concat(arrowPnts, rPoints)
}

function getArrowHeadPoints(points) {
  let len = DrawUtil.getBaseLength(points)
  let headHeight = len * headHeightFactor
  let headPnt = points[points.length - 1]
  let headWidth = headHeight * headWidthFactor
  let neckWidth = headHeight * neckWidthFactor
  let neckHeight = headHeight * neckHeightFactor
  let headEndPnt = DrawUtil.getThirdPoint(
    points[points.length - 2],
    headPnt,
    Cesium.Math.PI,
    headHeight,
    true,
  )
  let neckEndPnt = DrawUtil.getThirdPoint(
    points[points.length - 2],
    headPnt,
    Cesium.Math.PI,
    neckHeight,
    true,
  )
  let headLeft = DrawUtil.getThirdPoint(
    headPnt,
    headEndPnt,
    Cesium.Math.PI_OVER_TWO,
    headWidth,
    false,
  )
  let headRight = DrawUtil.getThirdPoint(
    headPnt,
    headEndPnt,
    Cesium.Math.PI_OVER_TWO,
    headWidth,
    true,
  )
  let neckLeft = DrawUtil.getThirdPoint(
    headPnt,
    neckEndPnt,
    Cesium.Math.PI_OVER_TWO,
    neckWidth,
    false,
  )
  let neckRight = DrawUtil.getThirdPoint(
    headPnt,
    neckEndPnt,
    Cesium.Math.PI_OVER_TWO,
    neckWidth,
    true,
  )

  return [neckLeft, headLeft, headPnt, headRight, neckRight]
}

function getArrowBodyPoints(points, neckLeft, neckRight, tailWidthFactor) {
  let allLen = DrawUtil.wholeDistance(points)
  let len = DrawUtil.getBaseLength(points)
  let tailWidth = len * tailWidthFactor
  let neckWidth = DrawUtil.distance(neckLeft, neckRight)
  let widthDif = (tailWidth - neckWidth) / 2
  let tempLen = 0
  let leftBodyPnts = []
  let rightBodyPnts = []
  for (let i = 1; i < points.length - 1; i++) {
    let angle = DrawUtil.getAngleOfThreePoints(points[i - 1], points[i], points[i + 1]) / 2
    tempLen += DrawUtil.distance(points[i - 1], points[i])
    let w = (tailWidth / 2 - (tempLen / allLen) * widthDif) / Math.sin(angle)
    let left = DrawUtil.getThirdPoint(points[i - 1], points[i], Math.PI - angle, w, true)
    let right = DrawUtil.getThirdPoint(points[i - 1], points[i], angle, w, false)
    leftBodyPnts.push(left)
    rightBodyPnts.push(right)
  }
  return leftBodyPnts.concat(rightBodyPnts)
}

function getTempPoint4(linePnt1, linePnt2, point) {
  let midPnt = DrawUtil.mid(linePnt1, linePnt2)
  let len = DrawUtil.distance(midPnt, point)
  let angle = DrawUtil.getAngleOfThreePoints(linePnt1, midPnt, point)
  let symPnt, distance1, distance2, mid
  if (angle < Cesium.Math.PI_OVER_TWO) {
    distance1 = len * Math.sin(angle)
    distance2 = len * Math.cos(angle)
    mid = DrawUtil.getThirdPoint(linePnt1, midPnt, Cesium.Math.PI_OVER_TWO, distance1, false)
    symPnt = DrawUtil.getThirdPoint(midPnt, mid, Cesium.Math.PI_OVER_TWO, distance2, true)
  } else if (angle >= Cesium.Math.PI_OVER_TWO && angle < Math.PI) {
    distance1 = len * Math.sin(Math.PI - angle)
    distance2 = len * Math.cos(Math.PI - angle)
    mid = DrawUtil.getThirdPoint(linePnt1, midPnt, Cesium.Math.PI_OVER_TWO, distance1, false)
    symPnt = DrawUtil.getThirdPoint(midPnt, mid, Cesium.Math.PI_OVER_TWO, distance2, false)
  } else if (angle >= Math.PI && angle < Math.PI * 1.5) {
    distance1 = len * Math.sin(angle - Math.PI)
    distance2 = len * Math.cos(angle - Math.PI)
    mid = DrawUtil.getThirdPoint(linePnt1, midPnt, Cesium.Math.PI_OVER_TWO, distance1, true)
    symPnt = DrawUtil.getThirdPoint(midPnt, mid, Cesium.Math.PI_OVER_TWO, distance2, true)
  } else {
    distance1 = len * Math.sin(Math.PI * 2 - angle)
    distance2 = len * Math.cos(Math.PI * 2 - angle)
    mid = DrawUtil.getThirdPoint(linePnt1, midPnt, Cesium.Math.PI_OVER_TWO, distance1, true)
    symPnt = DrawUtil.getThirdPoint(midPnt, mid, Cesium.Math.PI_OVER_TWO, distance2, false)
  }
  return symPnt
}

export { createPositions }
