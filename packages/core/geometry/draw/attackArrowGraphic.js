import * as Cesium from 'cesium'
import DrawUtil from './drawUtil'
import { createPositions as createAttackStraightArrow } from './attackStraightArrowGraphic'

// const tailWidthFactor = 0.07
const neckWidthFactor = 0.07
const headWidthFactor = 0.1
const headAngle = Math.PI - Math.PI / 8.5
const neckAngle = Math.PI - Math.PI / 13

// 创建箭头点数组
function createPositions(worldPositions) {
  if (!worldPositions || worldPositions.length < 3) {
    return []
  } else if (worldPositions.length === 3) {
    return createAttackStraightArrow(worldPositions)
  }

  let pnts = worldPositions.map((car3) => {
    const carto = Cesium.Cartographic.fromCartesian(car3)
    return [Cesium.Math.toDegrees(carto.longitude), Cesium.Math.toDegrees(carto.latitude)]
  })
  // 箭头尾部中间
  let pntTail = DrawUtil.mid(pnts[0], pnts[1])
  // 箭头顶点
  let pntHead = pnts[pnts.length - 1]
  // 靠近尾点的点
  let pntTailNear = pnts[1]
  // 靠近顶点的点
  let pntNeck = pnts[pnts.length - 2]

  let len = DrawUtil.getBaseLength(pnts)
  // let tailWidth = len * tailWidthFactor
  // let neckWidth = len * neckWidthFactor
  // let headWidth = len * headWidthFactor
  const tailWidth = DrawUtil.getBaseLength(pnts.slice(0, 2)) / 2
  const neckWidth = tailWidth
  const headWidth = (tailWidth * 10) / 7
  const isClockWise = DrawUtil.isClockWise(pnts[0], pnts[1], pnts[2])
  // 箭头左尾点
  let tailLeft = isClockWise ? pnts[0] : pnts[1]
  // 箭头右尾点
  let tailRight = isClockWise ? pnts[1] : pnts[0]
  // 箭头左端点
  let headLeft = DrawUtil.getThirdPoint(pntNeck, pntHead, headAngle, headWidth, false)
  // 箭头右端点
  let headRight = DrawUtil.getThirdPoint(pntNeck, pntHead, headAngle, headWidth, true)
  // 箭头左颈点
  let neckLeft = DrawUtil.getThirdPoint(pntNeck, pntHead, neckAngle, neckWidth, false)
  // 箭头右颈点
  let neckRight = DrawUtil.getThirdPoint(pntNeck, pntHead, neckAngle, neckWidth, true)

  // 生成样条曲线
  const innerPoints = pnts.slice(2, pnts.length - 1)
  const minHalfWidth = neckWidth * Math.sin(Math.PI / 13)
  const leftControls = [
    tailLeft,
    ...DrawUtil.getArrowAsideControlPoints(
      [tailLeft, ...innerPoints, neckLeft],
      tailWidth,
      true,
      minHalfWidth,
    ),
    neckLeft,
  ]
  // const leftPoints = DrawUtil.getBezierPoints(leftControls)
  const leftPoints = DrawUtil.getQBSplinePoints(leftControls)
  // innerPoints.reverse()
  const rightControls = [
    neckRight,
    ...DrawUtil.getArrowAsideControlPoints(
      [tailRight, ...innerPoints, neckRight],
      tailWidth,
      false,
      minHalfWidth,
    ),
    tailRight,
  ]
  // const rightPoints = DrawUtil.getBezierPoints(rightControls)
  const rightPoints = DrawUtil.getQBSplinePoints(rightControls)
  const pts = [
    tailLeft,
    ...leftPoints,
    neckLeft,
    headLeft,
    pntHead,
    headRight,
    neckRight,
    ...rightPoints,
    tailRight,
  ]

  return DrawUtil.positionDistinct(pts.map((p) => Cesium.Cartesian3.fromDegrees(p[0], p[1])))
}

export { createPositions }
