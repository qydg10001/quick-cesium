import { shallowReactive } from 'vue'
import { Cartesian3, Math as CesiumMath, Viewer } from 'cesium'
import { Bookmark } from '@quick-cesium/core'

const enum BookmarkZoomType {
  Fly = 'fly', // 飞行到书签位置
  Zoom = 'zoom', // 缩放到书签位置
}

interface BookmarkSetting {
  type: BookmarkZoomType
  duration?: number
}

// 返回值类型
interface IViewerBookmark {
  readonly bookmarks: Array<Bookmark>
  readonly config: BookmarkSetting
  flyToHome: () => void
  getHomeBookmark: () => Bookmark | undefined
  setHomeBookmark: (bookmark: Bookmark) => void
  addBookmark: (bookmark: Bookmark) => void
  removeBookmark: (bookmark: Bookmark) => void
  setConfig: (config: BookmarkSetting) => void
}

function useViewerBookmark(viewer: Viewer, initBookmarks?: Array<Bookmark>): IViewerBookmark {
  const _bookmarks = shallowReactive<Array<Bookmark>>(
    initBookmarks && initBookmarks.length > 0 ? [...initBookmarks] : [],
  )
  const _defaultBookmark = new Bookmark(
    '_默认初始视角',
    Cartesian3.fromDegrees(107.0, 35.0, 5000000),
    0,
    CesiumMath.toRadians(-90),
    0,
  )
  let _homeBookmark: Bookmark | undefined
  let _config: BookmarkSetting = {
    type: BookmarkZoomType.Fly,
    duration: 2, // 默认飞行时间为 2 秒
  }

  // 设置默认的初始视角
  _defaultBookmark.zoomTo(viewer)

  const flyToHome = async () => {
    const bookmark = _homeBookmark || _defaultBookmark
    if (_config.type === BookmarkZoomType.Fly) {
      bookmark.flyTo(viewer, _config.duration)
    } else if (_config.type === BookmarkZoomType.Zoom) {
      bookmark.zoomTo(viewer)
    }
  }

  const getHomeBookmark = () => {
    return _homeBookmark
  }

  const setHomeBookmark = (bookmark: Bookmark) => {
    const _bookmark = _bookmarks.find((b) => b.id === bookmark.id)
    if (!_bookmark) {
      // 如果书签不存在，则添加到书签列表中
      _bookmarks.push(bookmark)
    }
    _homeBookmark = bookmark
  }

  const addBookmark = (bookmark: Bookmark) => {
    const _bookmark = _bookmarks.find((b) => b.id === bookmark.id)
    if (_bookmark) {
      // 如果书签已存在，则退出（更新书签只能通过修改书签本身属性进行）
      console.warn('书签已经存在：', bookmark.id)
      return
    }
    _bookmarks.push(bookmark)
  }

  const removeBookmark = (bookmark: Bookmark) => {
    const index = _bookmarks.findIndex((b) => b.id === bookmark.id)
    if (index !== -1) {
      _bookmarks.splice(index, 1)
      // 如果删除的是 home 书签，则清除 home 书签
      if (_homeBookmark && _homeBookmark.id === bookmark.id) {
        _homeBookmark = undefined
      }
    }
  }

  const setConfig = (config: BookmarkSetting) => {
    _config = Object.assign(_config, config)
  }

  return {
    get bookmarks(): Array<Bookmark> {
      return _bookmarks
    },
    get config(): BookmarkSetting {
      return JSON.parse(JSON.stringify(_config)) // 返回一个深拷贝，避免外部修改配置
    },
    flyToHome,
    getHomeBookmark,
    setHomeBookmark,
    addBookmark,
    removeBookmark,
    setConfig,
  }
}

export default useViewerBookmark
export { useViewerBookmark, BookmarkZoomType, type IViewerBookmark, type BookmarkSetting }
