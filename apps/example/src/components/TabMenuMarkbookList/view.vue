<template>
  <tab-dropdown
    name="书签列表"
    button-name="添加书签"
    :icon="tabBookmarkListIcon"
    @click="addBookmark"
  >
    <template #dropdown>
      <div class="bookmark-list">
        <div
          class="bookmark-item"
          v-for="(item, index) in bookmarkStore?.bookmarks || []"
          :key="index"
          @click="flyToBookmark(item)"
        >
          <div class="bookmark-name">{{ item.label }}</div>
          <el-icon
            class="bookmark-view"
            :class="{ active: item.id === bookmarkStore?.getHomeBookmark()?.id }"
            title="设为初始视角"
            @click.stop="bookmarkStore?.setHomeBookmark(item)"
            ><View
          /></el-icon>
          <el-icon title="删除" @click.stop="bookmarkStore?.removeBookmark(item)"
            ><CloseBold
          /></el-icon>
        </div>
        <div
          class="bookmark-empty"
          v-if="!bookmarkStore || !bookmarkStore.bookmarks || bookmarkStore.bookmarks.length === 0"
        >
          <div>暂无书签</div>
        </div>
      </div>
    </template>
  </tab-dropdown>
  <addLabelDialog ref="addLabelDialogRef" />
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { ElMessage } from 'element-plus'

import { useCesiumViewerStore } from '@/stores/cesiumViewer'
import { TcctBookmark, TcctBookmarkZoomType, type ITcctViewerBookmark } from '@quick-cesium/sdk/src'
import TabDropdown from '../TabDropdown'
import addLabelDialog from './addLabelDialog.vue'

import tabBookmarkListIcon from '@/assets/icons/tab_bookmark_list.png'

const { getViewer, getViewerAsync, getBookmarkStore } = useCesiumViewerStore()
const addLabelDialogRef = ref<InstanceType<typeof addLabelDialog>>()
// const bookmarks = defineModel<Array<TcctBookmark>>()
let bookmarkStore: ITcctViewerBookmark | null = null

const addBookmark = () => {
  const viewer = getViewer()
  if (!viewer) {
    ElMessage({
      message: '获取三维地球失败',
      type: 'warning',
    })
    return
  }

  // 获取相机参数
  const camera = viewer.camera
  if (addLabelDialogRef.value) {
    addLabelDialogRef.value
      .open(bookmarkStore?.bookmarks || [])
      .then((name) => {
        if (typeof name === 'string') {
          bookmarkStore?.addBookmark(
            new TcctBookmark(name, camera.position, camera.heading, camera.pitch, camera.roll),
          )
        }
      })
      .catch(() => {
        ElMessage({
          message: '取消新增书签',
          type: 'info',
        })
      })
    return
  }
}

const flyToBookmark = (bookmark: TcctBookmark) => {
  const viewer = getViewer()
  if (!viewer) {
    ElMessage({
      message: '获取三维地球失败',
      type: 'warning',
    })
    return
  }

  if (!bookmarkStore?.config) {
    // 找不到配置，默认跳转
    bookmark.flyTo(viewer)
  }
  if (bookmarkStore?.config.type === TcctBookmarkZoomType.Fly) {
    // 飞行跳转
    bookmark.flyTo(viewer, bookmarkStore.config.duration)
  } else if (bookmarkStore?.config.type === TcctBookmarkZoomType.Zoom) {
    // 直接跳转
    bookmark.zoomTo(viewer)
  }
}

onMounted(() => {
  getViewerAsync().then(() => {
    bookmarkStore = getBookmarkStore()
  })
})
</script>

<style scoped>
.bookmark-list {
  width: 200px;
  max-height: 340px;
  padding: 8px;
  overflow-y: auto;

  .bookmark-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px;
    cursor: pointer;
    border-bottom: 1px var(--el-border-color) var(--el-border-style);

    &:last-child {
      border-bottom: none;
    }
    &:hover {
      background-color: var(--el-fill-color-light);

      & .bookmark-view {
        display: inline-flex;
      }
    }
    .bookmark-name {
      flex: auto;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .el-icon {
      margin-left: 8px;
      color: var(--el-text-color-secondary);
      cursor: pointer;

      &:hover {
        color: var(--el-text-color-primary);
      }
    }
    .bookmark-view {
      display: none;

      &.active {
        display: inline-flex;
        color: var(--el-color-primary);
      }
    }
  }

  .bookmark-empty {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    color: var(--el-text-color-secondary);
  }
}
</style>
