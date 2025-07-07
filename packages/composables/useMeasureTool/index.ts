import * as Cesium from 'cesium'
import * as turf from '@turf/turf'
import { useEditTool } from '../useEditTool'

// 存储测量内容的辅助图层
let measureLayer: Cesium.CustomDataSource | null = null

type MeasureTool = {
  /**
   * 测量距离
   * @returns 返回测量的坐标点数组
   */
  distance: () => Promise<Cesium.Cartesian3[]>
  /**
   * 测量面积
   * @returns 返回测量的坐标点数组
   */
  area: () => Promise<Cesium.Cartesian3[]>
  /**
   * 取消当前测量
   */
  abort: () => void
  /**
   * 清除所有测量结果
   */
  clear: () => void
}

type coordinate = {
  longitude: string | number
  latitude: string | number
}

const useMeasureTool = (viewer: Cesium.Viewer): MeasureTool => {
  if (!viewer) {
    throw new Error('获取 Viewer 实例失败，请确保在 Viewer 初始化后调用 useMeasureTool 方法！')
  }

  const editTool = useEditTool(viewer)
  if (!measureLayer) {
    measureLayer = new Cesium.CustomDataSource('__assist_measure')
    viewer.dataSources.add(measureLayer)
  }

  // 距离测量
  const measureDistance = () => {
    return editTool.drawPolyline().then((positions) => {
      const style = {
        width: 5,
        material: Cesium.Color.fromCssColorString('#57e0e0'),
      }
      let arr: Array<[Cesium.Cartesian3, Cesium.Cartesian3]> = []
      for (let i = 0; i < positions.length; i++) {
        if (i + 1 < positions.length) {
          if (!positions[i] || !positions[i + 1]) continue
          arr.push([positions[i], positions[i + 1]])
        }
      }
      console.log(arr)
      let result = 0
      arr.forEach((item) => {
        let start = Cesium.Cartographic.fromCartesian(item[0])
        let end = Cesium.Cartographic.fromCartesian(item[1])
        let startObj: coordinate = { longitude: '', latitude: '' }
        let endObj: coordinate = { longitude: '', latitude: '' }
        startObj.longitude = Cesium.Math.toDegrees(start.longitude)
        startObj.latitude = Cesium.Math.toDegrees(start.latitude)
        endObj.longitude = Cesium.Math.toDegrees(end.longitude)
        endObj.latitude = Cesium.Math.toDegrees(end.latitude)

        console.log(startObj)
        console.log(endObj)

        let from = turf.point([startObj.longitude, startObj.latitude])
        let to = turf.point([endObj.longitude, endObj.latitude])

        let distance = turf.distance(from, to, { units: 'kilometers' }) * 1000

        result += distance

        const tempPolyline = new Cesium.Entity({
          // position: [ {x: (item[0].x + item[1].x) / 2,  y: (item[0].y + item[1].y) / 2, z: (item[0].z + item[1].z) / 2} ],
          position: new Cesium.Cartesian3(
            (item[0].x + item[1].x) / 2,
            (item[0].y + item[1].y) / 2,
            (item[0].z + item[1].z) / 2,
          ),
          polyline: {
            positions: [...item],
            width: style.width,
            material: style.material,
            clampToGround: true,
          },
          label: new Cesium.LabelGraphics({
            text: distance.toFixed(2) + '米',
            heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
            pixelOffset: new Cesium.Cartesian2(10, 10),
            disableDepthTestDistance: Number.POSITIVE_INFINITY,
          }),
        })

        measureLayer.entities.add(tempPolyline)
        return positions
      })

      let len = positions.length - 1
      if (len > 1) {
        let resultLabel = new Cesium.Entity({
          position: new Cesium.Cartesian3(
            (positions[0].x + positions[len].x) / 2,
            (positions[0].y + positions[len].y) / 2,
            (positions[0].z + positions[len].z) / 2,
          ),
          label: new Cesium.LabelGraphics({
            text: '总距离：' + result.toFixed(2) + '米',
            heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
            disableDepthTestDistance: Number.POSITIVE_INFINITY,
            fillColor: Cesium.Color.AQUAMARINE,
          }),
        })
        measureLayer.entities.add(resultLabel)
      }
      return positions
    })
  }

  // 面积测量
  const measureArea = () => {
    return editTool.drawPolygon().then((positions) => {
      let polygon: Array<[number, number]> = []
      positions.forEach((item) => {
        let obj = Cesium.Cartographic.fromCartesian(item)
        polygon.push([Cesium.Math.toDegrees(obj.longitude), Cesium.Math.toDegrees(obj.latitude)])
      })

      let features = turf.points(polygon)
      let center = turf.center(features)

      console.log(center)

      let points0 = Cesium.Cartographic.fromCartesian(positions[0])
      polygon.push([
        Cesium.Math.toDegrees(points0.longitude),
        Cesium.Math.toDegrees(points0.latitude),
      ])
      let areaPolygon = turf.polygon([polygon])
      let area = turf.area(areaPolygon)

      const tempPolygon = new Cesium.Entity({
        position: Cesium.Cartesian3.fromDegrees(
          center.geometry.coordinates[0],
          center.geometry.coordinates[1],
        ),
        polygon: {
          hierarchy: new Cesium.PolygonHierarchy(positions),
          heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
          material: Cesium.Color.fromCssColorString('#ffff00').withAlpha(0.3),
        },
        polyline: {
          positions: [...positions, positions[0]],
          clampToGround: true,
          width: 2,
          material: Cesium.Color.fromCssColorString('#ffff00'),
        },
        label: new Cesium.LabelGraphics({
          text: area.toFixed(2) + '平方米',
          heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
          disableDepthTestDistance: Number.POSITIVE_INFINITY,
        }),
      })
      measureLayer.entities.add(tempPolygon)
      return positions
    })
  }

  // 取消当前测量
  const abort = () => {
    editTool.abort() // 调用编辑工具的取消方法
  }

  // 清除所有测量结果
  const clear = () => {
    measureLayer.entities.removeAll()
  }

  return {
    distance: measureDistance,
    area: measureArea,
    abort,
    clear,
  }
}

export default useMeasureTool
export { useMeasureTool, type MeasureTool }
