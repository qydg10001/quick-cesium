/**
 * @Author : Caven Chen
 */
import * as Cesium from 'cesium'
import * as turf from '@turf/turf'

const TWO_PI = Math.PI * 2
const FITTING_COUNT = 100
const ZERO_TOLERANCE = 0.0001

class DrawUtil {
  /**
   * @param pnt1
   * @param pnt2
   * @returns {number}
   */
  static distance(pnt1, pnt2) {
    return Math.sqrt(Math.pow(pnt1[0] - pnt2[0], 2) + Math.pow(pnt1[1] - pnt2[1], 2))
  }

  /**
   * @param points
   * @returns {number}
   */
  static wholeDistance(points) {
    let distance = 0
    for (let i = 0; i < points.length - 1; i++) distance += this.distance(points[i], points[i + 1])
    return distance
  }

  /**
   * 把经纬度当平面坐标计算长度
   * @param points
   * @returns {number}
   */
  // static getBaseLength(points) {
  //   return Math.pow(this.wholeDistance(points), 0.99)
  // }
  static getBaseLength(points) {
    let len = 0
    if (points.length < 2) return len

    for (let i = 1; i < points.length; i++) {
      len += Math.sqrt(
        Math.pow(points[i][0] - points[i - 1][0], 2) + Math.pow(points[i][1] - points[i - 1][1], 2),
      )
    }
    return len
  }

  /**
   * @param pnt1
   * @param pnt2
   * @returns {number[]}
   */
  static mid(pnt1, pnt2) {
    return [(pnt1[0] + pnt2[0]) / 2, (pnt1[1] + pnt2[1]) / 2]
  }

  /**
   * @param pnt1
   * @param pnt2
   * @param pnt3
   * @returns {[*, *]|[*, *]|[*, number]}
   */
  static getCircleCenterOfThreePoints(pnt1, pnt2, pnt3) {
    const pntA = [(pnt1[0] + pnt2[0]) / 2, (pnt1[1] + pnt2[1]) / 2]
    const pntB = [pntA[0] - pnt1[1] + pnt2[1], pntA[1] + pnt1[0] - pnt2[0]]
    const pntC = [(pnt1[0] + pnt3[0]) / 2, (pnt1[1] + pnt3[1]) / 2]
    const pntD = [pntC[0] - pnt1[1] + pnt3[1], pntC[1] + pnt1[0] - pnt3[0]]
    return this.getIntersectPoint(pntA, pntB, pntC, pntD)
  }

  /**
   * @param pntA
   * @param pntB
   * @param pntC
   * @param pntD
   * @returns {(*|number)[]|*[]}
   */
  static getIntersectPoint(pntA, pntB, pntC, pntD) {
    let x, y, f, e
    if (pntA[1] === pntB[1]) {
      f = (pntD[0] - pntC[0]) / (pntD[1] - pntC[1])
      x = f * (pntA[1] - pntC[1]) + pntC[0]
      y = pntA[1]
      return [x, y]
    }
    if (pntC[1] === pntD[1]) {
      e = (pntB[0] - pntA[0]) / (pntB[1] - pntA[1])
      x = e * (pntC[1] - pntA[1]) + pntA[0]
      y = pntC[1]
      return [x, y]
    }
    e = (pntB[0] - pntA[0]) / (pntB[1] - pntA[1])
    f = (pntD[0] - pntC[0]) / (pntD[1] - pntC[1])
    y = (e * pntA[1] - pntA[0] - f * pntC[1] + pntC[0]) / (e - f)
    x = e * y - e * pntA[1] + pntA[0]
    return [x, y]
  }

  /**
   * 计算方位角
   * @param startPnt
   * @param endPnt
   * @returns {number}
   */
  static getAzimuth(startPnt, endPnt) {
    const lon1 = startPnt[0]
    const lat1 = startPnt[1]
    const lon2 = endPnt[0]
    const lat2 = endPnt[1]

    if (lon1 === lon2) {
      if (lat2 >= lat1) {
        return 0
      } else {
        return Math.PI
      }
    }
    if (lat1 === lat2) {
      if (lon2 > lon1) {
        return Cesium.Math.PI_OVER_TWO
      } else if (lon2 < lon1) {
        return Cesium.Math.THREE_PI_OVER_TWO
      }
    }

    const a = Math.atan(((lon2 - lon1) * Math.cos(lat2)) / (lat2 - lat1))
    if (lat2 > lat1) {
      if (lon2 > lon1) {
        return a
      } else {
        return a + Cesium.Math.TWO_PI
      }
    } else {
      return a + Cesium.Math.PI
    }
  }

  /**
   * @param pntA
   * @param pntB
   * @param pntC
   * @returns {number}
   */
  static getAngleOfThreePoints(pntA, pntB, pntC) {
    const angle = this.getAzimuth(pntB, pntC) - this.getAzimuth(pntB, pntA)
    return angle < 0 ? angle + TWO_PI : angle
  }

  /**
   * @param pnt1
   * @param pnt2
   * @param pnt3
   * @returns {boolean}
   */
  static isClockWise(pnt1, pnt2, pnt3) {
    return (pnt3[1] - pnt1[1]) * (pnt2[0] - pnt1[0]) > (pnt2[1] - pnt1[1]) * (pnt3[0] - pnt1[0])
    // return (pnt2[1] - pnt1[1]) * (pnt3[0] - pnt1[0]) > (pnt2[1] - pnt1[0]) * (pnt3[1] - pnt1[1])
  }

  /**
   * @param t
   * @param startPnt
   * @param endPnt
   * @returns {*[]}
   */
  static getPointOnLine(t, startPnt, endPnt) {
    const x = startPnt[0] + t * (endPnt[0] - startPnt[0])
    const y = startPnt[1] + t * (endPnt[1] - startPnt[1])
    return [x, y]
  }

  /**
   * @param t
   * @param startPnt
   * @param cPnt1
   * @param cPnt2
   * @param endPnt
   * @returns {number[]}
   */
  static getCubicValue(t, startPnt, cPnt1, cPnt2, endPnt) {
    t = Math.max(Math.min(t, 1), 0)
    const tp = 1 - t
    const t2 = t * t
    const t3 = t2 * t
    const tp2 = tp * tp
    const tp3 = tp2 * tp
    const x = tp3 * startPnt[0] + 3 * tp2 * t * cPnt1[0] + 3 * tp * t2 * cPnt2[0] + t3 * endPnt[0]
    const y = tp3 * startPnt[1] + 3 * tp2 * t * cPnt1[1] + 3 * tp * t2 * cPnt2[1] + t3 * endPnt[1]
    return [x, y]
  }

  /**
   * 根据第一点和第二点，从第二点沿固定角度延长一定距离，得到第三点
   * @param startPnt
   * @param endPnt
   * @param angle
   * @param distance
   * @param clockWise
   * @returns {*[]}
   */
  static getThirdPoint(startPnt, endPnt, angle, distance, clockWise) {
    const azimuth = this.getAzimuth(startPnt, endPnt)
    const alpha = clockWise ? azimuth + angle : azimuth - angle
    const dx = distance * Math.sin(alpha)
    const dy = distance * Math.cos(alpha)
    return [endPnt[0] + dx, endPnt[1] + dy]
  }

  /**
   * @param center
   * @param radius
   * @param startAngle
   * @param endAngle
   * @returns {[]}
   */
  static getArcPoints(center, radius, startAngle, endAngle) {
    let x,
      y,
      pnts = []
    let angleDiff = endAngle - startAngle
    angleDiff = angleDiff < 0 ? angleDiff + TWO_PI : angleDiff
    for (let i = 0; i <= FITTING_COUNT; i++) {
      const angle = startAngle + (angleDiff * i) / FITTING_COUNT
      x = center[0] + radius * Math.cos(angle)
      y = center[1] + radius * Math.sin(angle)
      pnts.push([x, y])
    }
    return pnts
  }

  /**
   * @param t
   * @param pnt1
   * @param pnt2
   * @param pnt3
   * @returns {*[][]}
   */
  static getBisectorNormals(t, pnt1, pnt2, pnt3) {
    const normal = this.getNormal(pnt1, pnt2, pnt3)
    const dist = Math.sqrt(normal[0] * normal[0] + normal[1] * normal[1])
    const uX = normal[0] / dist
    const uY = normal[1] / dist
    const d1 = this.distance(pnt1, pnt2)
    const d2 = this.distance(pnt2, pnt3)
    let dt, x, y, bisectorNormalLeft, bisectorNormalRight
    if (dist > ZERO_TOLERANCE) {
      if (this.isClockWise(pnt1, pnt2, pnt3)) {
        dt = t * d1
        x = pnt2[0] - dt * uY
        y = pnt2[1] + dt * uX
        bisectorNormalRight = [x, y]
        dt = t * d2
        x = pnt2[0] + dt * uY
        y = pnt2[1] - dt * uX
        bisectorNormalLeft = [x, y]
      } else {
        dt = t * d1
        x = pnt2[0] + dt * uY
        y = pnt2[1] - dt * uX
        bisectorNormalRight = [x, y]
        dt = t * d2
        x = pnt2[0] - dt * uY
        y = pnt2[1] + dt * uX
        bisectorNormalLeft = [x, y]
      }
    } else {
      x = pnt2[0] + t * (pnt1[0] - pnt2[0])
      y = pnt2[1] + t * (pnt1[1] - pnt2[1])
      bisectorNormalRight = [x, y]
      x = pnt2[0] + t * (pnt3[0] - pnt2[0])
      y = pnt2[1] + t * (pnt3[1] - pnt2[1])
      bisectorNormalLeft = [x, y]
    }
    return [bisectorNormalRight, bisectorNormalLeft]
  }

  /**
   * @param pnt1
   * @param pnt2
   * @param pnt3
   * @returns {number[]}
   */
  static getNormal(pnt1, pnt2, pnt3) {
    let dX1 = pnt1[0] - pnt2[0]
    let dY1 = pnt1[1] - pnt2[1]
    const d1 = Math.sqrt(dX1 * dX1 + dY1 * dY1)
    dX1 /= d1
    dY1 /= d1

    let dX2 = pnt3[0] - pnt2[0]
    let dY2 = pnt3[1] - pnt2[1]
    const d2 = Math.sqrt(dX2 * dX2 + dY2 * dY2)
    dX2 /= d2
    dY2 /= d2

    const uX = dX1 + dX2
    const uY = dY1 + dY2
    return [uX, uY]
  }

  /**
   * @param t
   * @param controlPoints
   * @returns {[]}
   */
  static getCurvePoints(t, controlPoints) {
    const leftControl = this.getLeftMostControlPoint(t, controlPoints)
    let normals = [leftControl]
    let pnt1, pnt2, pnt3, normalPoints
    for (let i = 0; i < controlPoints.length - 2; i++) {
      pnt1 = controlPoints[i]
      pnt2 = controlPoints[i + 1]
      pnt3 = controlPoints[i + 2]
      normalPoints = this.getBisectorNormals(t, pnt1, pnt2, pnt3)
      normals = normals.concat(normalPoints)
    }
    const rightControl = this.getRightMostControlPoint(t, controlPoints)
    normals.push(rightControl)
    const points = []
    for (let i = 0; i < controlPoints.length - 1; i++) {
      pnt1 = controlPoints[i]
      pnt2 = controlPoints[i + 1]
      points.push(pnt1)
      for (let t = 0; t < FITTING_COUNT; t++) {
        const pnt = this.getCubicValue(
          t / FITTING_COUNT,
          pnt1,
          normals[i * 2],
          normals[i * 2 + 1],
          pnt2,
        )
        points.push(pnt)
      }
      points.push(pnt2)
    }
    return points
  }

  /**
   * @param t
   * @param controlPoints
   * @returns {number[]}
   */
  static getLeftMostControlPoint(t, controlPoints) {
    const pnt1 = controlPoints[0]
    const pnt2 = controlPoints[1]
    const pnt3 = controlPoints[2]
    const pnts = this.getBisectorNormals(0, pnt1, pnt2, pnt3)
    const normalRight = pnts[0]
    const normal = this.getNormal(pnt1, pnt2, pnt3)
    const dist = Math.sqrt(normal[0] * normal[0] + normal[1] * normal[1])
    let controlX, controlY
    if (dist > ZERO_TOLERANCE) {
      const mid = this.mid(pnt1, pnt2)
      const pX = pnt1[0] - mid[0]
      const pY = pnt1[1] - mid[1]
      const d1 = this.distance(pnt1, pnt2)
      // normal at midpoint
      const n = 2.0 / d1
      const nX = -n * pY
      const nY = n * pX
      // upper triangle of symmetric transform matrix
      const a11 = nX * nX - nY * nY
      const a12 = 2 * nX * nY
      const a22 = nY * nY - nX * nX
      const dX = normalRight[0] - mid[0]
      const dY = normalRight[1] - mid[1]
      // coordinates of reflected vector
      controlX = mid[0] + a11 * dX + a12 * dY
      controlY = mid[1] + a12 * dX + a22 * dY
    } else {
      controlX = pnt1[0] + t * (pnt2[0] - pnt1[0])
      controlY = pnt1[1] + t * (pnt2[1] - pnt1[1])
    }
    return [controlX, controlY]
  }

  /**
   * @param t
   * @param controlPoints
   * @returns {number[]}
   */
  static getRightMostControlPoint(t, controlPoints) {
    const count = controlPoints.length
    const pnt1 = controlPoints[count - 3]
    const pnt2 = controlPoints[count - 2]
    const pnt3 = controlPoints[count - 1]
    const pnts = this.getBisectorNormals(0, pnt1, pnt2, pnt3)
    const normalLeft = pnts[1]
    const normal = this.getNormal(pnt1, pnt2, pnt3)
    const dist = Math.sqrt(normal[0] * normal[0] + normal[1] * normal[1])
    let controlX, controlY
    if (dist > ZERO_TOLERANCE) {
      const mid = this.mid(pnt2, pnt3)
      const pX = pnt3[0] - mid[0]
      const pY = pnt3[1] - mid[1]

      const d1 = this.distance(pnt2, pnt3)
      // normal at midpoint
      const n = 2.0 / d1
      const nX = -n * pY
      const nY = n * pX

      // upper triangle of symmetric transform matrix
      const a11 = nX * nX - nY * nY
      const a12 = 2 * nX * nY
      const a22 = nY * nY - nX * nX

      const dX = normalLeft[0] - mid[0]
      const dY = normalLeft[1] - mid[1]

      // coordinates of reflected vector
      controlX = mid[0] + a11 * dX + a12 * dY
      controlY = mid[1] + a12 * dX + a22 * dY
    } else {
      controlX = pnt3[0] + t * (pnt2[0] - pnt3[0])
      controlY = pnt3[1] + t * (pnt2[1] - pnt3[1])
    }
    return [controlX, controlY]
  }

  /**
   * @param points
   * @returns {[]|*}
   */
  static getBezierPoints(points) {
    if (points.length <= 2) return points
    const bezierPoints = []
    const n = points.length - 1
    for (let t = 0; t <= 1; t += 0.01) {
      let x = 0
      let y = 0
      for (let index = 0; index <= n; index++) {
        const factor = this.getBinomialFactor(n, index)
        const a = Math.pow(t, index)
        const b = Math.pow(1 - t, n - index)
        x += factor * a * b * points[index][0]
        y += factor * a * b * points[index][1]
      }
      bezierPoints.push([x, y])
    }
    bezierPoints.push(points[n])
    return bezierPoints
  }

  /**
   *
   * @param n
   * @param index
   * @returns {number}
   */
  static getBinomialFactor(n, index) {
    return this.getFactorial(n) / (this.getFactorial(index) * this.getFactorial(n - index))
  }

  /**
   * @param n
   * @returns {number}
   */
  static getFactorial(n) {
    if (n <= 1) return 1
    if (n === 2) return 2
    if (n === 3) return 6
    if (n === 4) return 24
    if (n === 5) return 120
    let result = 1
    for (let i = 1; i <= n; i++) result *= i
    return result
  }

  /**
   * @param points
   * @returns {[]|*}
   */
  static getQBSplinePoints(points) {
    if (points.length <= 2) return points
    const n = 2
    const bSplinePoints = []
    const m = points.length - n - 1
    bSplinePoints.push(points[0])
    for (let i = 0; i <= m; i++) {
      for (let t = 0; t <= 1; t += 0.05) {
        let x = 0
        let y = 0
        for (let k = 0; k <= n; k++) {
          const factor = this.getQuadricBSplineFactor(k, t)
          x += factor * points[i + k][0]
          y += factor * points[i + k][1]
        }
        bSplinePoints.push([x, y])
      }
    }
    bSplinePoints.push(points[points.length - 1])
    return bSplinePoints
  }

  /**
   * @param k
   * @param t
   * @returns {number}
   */
  static getQuadricBSplineFactor(k, t) {
    if (k === 0) return Math.pow(t - 1, 2) / 2
    if (k === 1) return (-2 * Math.pow(t, 2) + 2 * t + 1) / 2
    if (k === 2) return Math.pow(t, 2) / 2
    return 0
  }

  /**
   * 获取箭头上单边的曲线的控制点，要求最少三个点
   * @param points
   * @param distance
   * @param isLeft
   * @returns {[]}
   */
  static getArrowAsideControlPoints(points, distance, isLeft, minHalfWidth = 0) {
    const pnts = []
    const len = this.getBaseLength(points)
    let subLen = 0
    const isReverseAngle = false
    for (let i = 1; i < points.length - 1; i++) {
      const pnt0 = points[i - 1]
      const pnt1 = points[i]
      const pnt2 = points[i + 1]

      const line1 = new Cesium.Cartesian2(pnt1[0] - pnt0[0], pnt1[1] - pnt0[1])
      const line2 = new Cesium.Cartesian2(pnt2[0] - pnt1[0], pnt2[1] - pnt1[1])
      const isReverseAngle = Cesium.Cartesian2.cross(line1, line2) >= 0
      const halfAngle =
        (Cesium.Cartesian2.angleBetween(line1, line2) * (isReverseAngle ? -1 : 1)) / 2
      // const plusAngle = Cesium.Math.PI_OVER_TWO * ((isLeft ^ isReverseAngle) ? -1 : 1)
      const plusAngle = Cesium.Math.PI_OVER_TWO * (isLeft ? -1 : 1)
      // 计算距离
      subLen += this.distance(pnt0, pnt1)
      const asideLen = (distance - minHalfWidth) * (1 - subLen / len) + minHalfWidth
      pnts.push(this.getThirdPoint(pnt0, pnt1, halfAngle + plusAngle, asideLen, true))
    }
    if (!isLeft) {
      pnts.reverse()
    }
    return pnts
  }

  /**
   * 获取条带上单边的控制点，要求最少两个点
   * @param {*} points 主干点列表
   * @param {*} isLeft 是否生成左侧控制点
   * @param {*} width 单边宽度（米）
   * @returns 单边控制点列表
   */
  static getStripAsideControlPoints(points, isLeft, width) {
    const pnts = []
    if (points.length === 2) {
      const azimuth = Cesium.Math.toDegrees(this.getAzimuth(points[0], points[1]))
      const angle = this.getTurfAngle(azimuth + (isLeft ? -90 : 90))
      pnts.push(this.getTurfDestination(points[0], width, angle))
      pnts.push(this.getTurfDestination(points[1], width, angle))
    } else if (points.length > 2) {
      // 添加第一个点
      const azimuthFirst = Cesium.Math.toDegrees(this.getAzimuth(points[0], points[1]))
      const angleFirst = this.getTurfAngle(azimuthFirst + (isLeft ? -90 : 90))
      pnts.push(this.getTurfDestination(points[0], width, angleFirst))
      // 添加中间控制点
      for (let i = 1; i < points.length - 1; i++) {
        const pnt0 = points[i - 1]
        const pnt1 = points[i]
        const pnt2 = points[i + 1]

        // 重写计算二分距离的算法
        const azimuth0 = Cesium.Math.toDegrees(this.getAzimuth(pnt0, pnt1))
        const azimuth1 = Cesium.Math.toDegrees(this.getAzimuth(pnt1, pnt2))
        let angle = this.getTurfAngle((azimuth0 + azimuth1) / 2)
        const angleDiff = Math.abs(azimuth1 - azimuth0)
        const isReverseAngle = angleDiff > 180
        // console.log('azimuth0', azimuth0, 'azimuth1', azimuth1, 'angle', angle, 'azimuth1-azimuth0', azimuth1-azimuth0)
        angle = this.getTurfAngle(angle + 90 * (isLeft ^ isReverseAngle ? -1 : 1))
        // console.log('计算后angle', angle)

        // 计算等宽的条带控制点
        // const azimuth1 = Cesium.Math.toDegrees(this.getAzimuth(pnt0, pnt1))
        // const angle1 = this.getTurfAngle(azimuth1 + (isLeft ? -90 : 90))
        // const p11 = this.getTurfDestination(pnt0, width, angle1)
        // const p12 = this.getTurfDestination(pnt1, width, angle1)
        // const azimuth2 = Cesium.Math.toDegrees(this.getAzimuth(pnt1, pnt2))
        // const angle2 = this.getTurfAngle(azimuth2 + (isLeft ? -90 : 90))
        // const p21 = this.getTurfDestination(pnt1, width, angle2)
        // const p22 = this.getTurfDestination(pnt2, width, angle2)
        // if(turf.booleanIntersects(turf.lineString([p11, p12]), turf.lineString([p21, p22]))) {
        //   const interPnt = this.getIntersectPoint(p11, p12, p21, p22)
        //   console.log('interPnt', interPnt)
        //   pnts.push(interPnt)
        // } else {
        //   pnts.push(p12)
        //   pnts.push(p21)
        // }

        // 计算距离
        pnts.push(this.getTurfDestination(pnt1, width, angle))
      }
      // 添加最后一个点
      const azimuthLast = Cesium.Math.toDegrees(
        this.getAzimuth(points[points.length - 2], points[points.length - 1]),
      )
      const angleLast = this.getTurfAngle(azimuthLast + (isLeft ? -90 : 90))
      pnts.push(this.getTurfDestination(points[points.length - 1], width, angleLast))
    }
    // 右侧反序
    if (!isLeft) {
      pnts.reverse()
    }
    return pnts
  }

  /**
   * 坐标点去重
   * @param {*} worldPositions 坐标点列表
   */
  static positionDistinct(worldPositions) {
    // 坐标点列表浅拷贝，因为后续的splice作用于数组本身，需要避免影响到传入的参数
    const positions = [...worldPositions]
    const pnts = positions.map((car3) => {
      const carto = Cesium.Cartographic.fromCartesian(car3)
      return [Cesium.Math.toDegrees(carto.longitude), Cesium.Math.toDegrees(carto.latitude)]
    })
    for (let index = pnts.length - 1; index > 0; index--) {
      const p1 = pnts[index]
      const p0 = pnts[index - 1]
      // 两点之间的距离小于1e-9，认为是同一个点
      // 删除后一个点
      if (
        (p1[0] === p0[0] && p1[1] === p0[1]) ||
        Math.sqrt(Math.pow(p1[0] - p0[0], 2) + Math.pow(p1[1] - p0[1], 2)) < 1e-9
      ) {
        positions.splice(index, 1)
      }
    }
    return positions
  }

  /**
   * 获取turf中的角度(-180, 180)
   * @param angle 角度值
   * @returns
   */
  static getTurfAngle(angle) {
    let res = angle
    while (res > 180) {
      res -= 360
    }
    while (res < -180) {
      res += 360
    }
    return res
  }

  /**
   * 获取turf中的点
   * @param pnt 点
   * @param distance 距离（米）
   * @param angle 角度
   * @returns [经度, 纬度]
   */
  static getTurfDestination(pnt, distance, angle) {
    const json = turf.destination(pnt, distance / 1000, angle)
    return json.geometry.coordinates
  }
}

export default DrawUtil
