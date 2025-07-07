import { defineStore } from 'pinia'
import * as Cesium from 'cesium'
import {
  useViewerBookmark,
  type ITcctViewerBookmark,
  useMapServer,
  type ITcctMapServer,
  TcctBookmark,
} from '@quick-cesium/sdk/src'

export const useCesiumViewerStore = defineStore('cesiumViewer', () => {
  let viewer: Cesium.Viewer | null = null
  const waitList: Array<(viewer: Cesium.Viewer) => void> = []
  let viewerBookmark: ITcctViewerBookmark
  let mapServer: ITcctMapServer

  const setViewer = (val: Cesium.Viewer | null) => {
    const oldVal = viewer
    viewer = val

    if (!Cesium.defined(oldVal) && viewer && Cesium.defined(viewer)) {
      // 初始化书签
      viewerBookmark = useViewerBookmark(viewer)
      // 默认添加昆明书签
      viewerBookmark.addBookmark(
        new TcctBookmark(
          '昆明',
          new Cesium.Cartesian3(-1276921.7111357658, 5662174.007344944, 2690037.9660722706),
          6.2831853071795765,
          -1.57070597828351,
          0,
        ),
      )
      // 初始化地图服务
      mapServer = useMapServer(viewer)
      // 如果有等候列表，则执行所有函数
      while (waitList.length > 0) {
        const func = waitList.pop()
        if (func) func(viewer)
      }
    }
  }

  const getViewer = () => {
    return viewer
  }

  const getViewerAsync = () => {
    return new Promise<Cesium.Viewer>((resolve) => {
      if (Cesium.defined(viewer)) {
        resolve(viewer)
      } else {
        // 添加到等候列表，等待赋值时触发
        waitList.push(resolve)
      }
    })
  }

  const getBookmarkStore = () => {
    return viewerBookmark
  }

  const getMapServer = () => {
    return mapServer
  }

  return { setViewer, getViewer, getViewerAsync, getBookmarkStore, getMapServer }
})
