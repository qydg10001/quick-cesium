<template>
  <section class="app-wrapper">
    <header class="header-wrapper">
      <el-tabs class="menu-wrapper" type="border-card">
        <tab-pane label="场景">
          <tab-pane-group name="配置信息">
            <tab-button name="新建" :icon="tabNewIcon"></tab-button>
            <tab-button name="打开" :icon="tabOpenIcon"></tab-button>
            <tab-button name="保存" :icon="tabSaveIcon"></tab-button>
          </tab-pane-group>
          <tab-pane-group name="视角">
            <tab-button
              name="初始视角"
              :icon="tabInitViewIcon"
              @click="bookmarkStore?.flyToHome()"
            ></tab-button>
            <!-- 书签列表 -->
            <tab-menu-markbook-list></tab-menu-markbook-list>
            <tab-button
              name="书签配置"
              :icon="tabBookmarkConfigIcon"
              @click="showBookmarkConfig = true"
            ></tab-button>
            <markbook-config-dialog v-model="showBookmarkConfig" />
          </tab-pane-group>
        </tab-pane>
        <tab-pane label="基础数据">
          <tab-pane-group name="地图">
            <tab-menu-online-map />
            <!-- <tab-button name="地图服务" :icon="tabWmsIcon"></tab-button> -->
            <tab-button
              name="添加xyz地图"
              :icon="tabXyzIcon"
              @click="showXyzLayerConfig = true"
            ></tab-button>
            <xyz-layer-config-dialog v-model:="showXyzLayerConfig" />
          </tab-pane-group>
        </tab-pane>
        <tab-pane label="编辑">
          <tab-pane-group name="简单要素">
            <tab-menu-draw-point />
            <tab-menu-draw-polyline />
            <tab-menu-draw-polygon />
          </tab-pane-group>
          <tab-pane-group name="图标">
            <tab-menu-draw-icon-list />
          </tab-pane-group>
          <tab-pane-group name="标签">
            <tab-menu-draw-label-list />
          </tab-pane-group>
          <tab-pane-group name="沙盘要素">
            <tab-menu-draw-curve-polygon />
            <tab-menu-draw-straight-arrow />
            <tab-menu-draw-wide-arrow />
            <tab-menu-draw-attack-arrow />
            <tab-menu-draw-double-arrow />
          </tab-pane-group>
          <tab-pane-group name="测量">
            <tab-menu-measure-distance />
            <tab-menu-measure-area />
            <tab-menu-measure-clear />
          </tab-pane-group>
        </tab-pane>
        <tab-pane label="视图">
          <tab-pane-group name="视图">
            <tab-tool
              name="图层管理"
              v-model="isTocActive"
              :icon="tabLayerIcon"
              :active-icon="tabLayerActiveIcon"
            ></tab-tool>
          </tab-pane-group>
          <tab-pane-group name="地图组件">
            <tab-tool
              name="状态栏"
              v-model="showStatusBar"
              :icon="tabStatusBarIcon"
              :active-icon="tabStatusBarActiveIcon"
            ></tab-tool>
          </tab-pane-group>
        </tab-pane>
      </el-tabs>
    </header>
    <section class="app-container">
      <aside v-if="isTocActive" class="aside-wrapper">Aside</aside>
      <main class="content-wrapper">
        <TcctEarth @init="mapInitHandler">
          <TcctStatusBar v-if="showStatusBar" class="status-bar" />
          <TcctMouseTip :visible="false" text="测试" />
        </TcctEarth>
      </main>
    </section>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import * as Cesium from 'cesium'
import {
  TcctEarth,
  TcctStatusBar,
  TcctMouseTip,
  type ITcctViewerBookmark,
} from '@quick-cesium/sdk/src'

import TabPane from './components/TabPane'
import TabPaneGroup from './components/TabPaneGroup'
import TabButton from './components/TabButton'
import TabTool from './components/TabTool'
import { useCesiumViewerStore } from '@/stores/cesiumViewer'
// import TabDropdown from './components/TabDropdown'

import TabMenuMarkbookList from './components/TabMenuMarkbookList'
import MarkbookConfigDialog from './components/TabMenuMarkbookConfig/configDialog.vue'
import TabMenuOnlineMap from './components/TabMenuOnlineMap'
import XyzLayerConfigDialog from './components/TabMenuXyzLayer/configDialog.vue'
import TabMenuDrawPoint from './components/tabMenuDrawPoint/index.vue'
import TabMenuDrawPolyline from './components/tabMenuDrawPolyline/index.vue'
import TabMenuDrawPolygon from './components/tabMenuDrawPolygon/index.vue'
import TabMenuDrawIconList from './components/tabMenuDrawIconList/index.vue'
import TabMenuDrawLabelList from './components/tabMenuDrawLabelList/index.vue'
import TabMenuDrawCurvePolygon from './components/tabMenuDrawCurvePolygon/index.vue'
import TabMenuDrawStraightArrow from './components/tabMenuDrawStraightArrow/index.vue'
import TabMenuDrawWideArrow from './components/tabMenuDrawWideArrow/index.vue'
import TabMenuDrawAttackArrow from './components/tabMenuDrawAttackArrow/index.vue'
import TabMenuDrawDoubleArrow from './components/tabMenuDrawDoubleArrow/index.vue'
import TabMenuMeasureDistance from './components/tabMenuMeasureDistance/index.vue'
import TabMenuMeasureArea from './components/tabMenuMeasureArea/index.vue'
import TabMenuMeasureClear from './components/tabMenuMeasureClear/index.vue'

import tabNewIcon from '@/assets/icons/tab_new.png'
import tabOpenIcon from '@/assets/icons/tab_open.png'
import tabSaveIcon from '@/assets/icons/tab_save.png'
import tabInitViewIcon from '@/assets/icons/tab_init_view.png'
import tabBookmarkConfigIcon from '@/assets/icons/tab_bookmark_config.png'
// import tabWmsIcon from '@/assets/icons/tab_wms.png'
// import tabWmtsIcon from '@/assets/icons/tab_wmts.png'
import tabXyzIcon from '@/assets/icons/tab_xyz.png'
import tabLayerIcon from '@/assets/icons/tab_layer.png'
import tabLayerActiveIcon from '@/assets/icons/tab_layer_active.png'
import tabStatusBarIcon from '@/assets/icons/tab_status_bar.png'
import tabStatusBarActiveIcon from '@/assets/icons/tab_status_bar_active.png'

const { setViewer, getViewerAsync, getBookmarkStore } = useCesiumViewerStore()
const isTocActive = ref(false)
let bookmarkStore: ITcctViewerBookmark
// 显示书签配置弹窗的标志
const showBookmarkConfig = ref(false)
// 显示xyz图层配置弹窗的标志
const showXyzLayerConfig = ref(false)
// 显示底部状态栏
const showStatusBar = ref(true)

const viewerRef = ref<Cesium.Viewer | null>(null)

const mapInitHandler = (viewer: Cesium.Viewer) => {
  viewerRef.value = viewer
  setViewer(viewer)
  getViewerAsync().then(() => {
    bookmarkStore = getBookmarkStore()
  })

  // console.log('map init', viewer)
}

// onUnmounted(() => {
//   if (viewer) {
//     viewer.destroy()
//     viewer = null
//   }
// })
</script>

<style lang="scss" scoped>
.app-wrapper {
  display: flex;
  flex-direction: column;
  height: 100vh;

  .header-wrapper {
    display: flex;
    flex: none;
    align-items: center;
    height: 133px;
    border-bottom: 1px var(--el-border-color) var(--el-border-style);

    .menu-wrapper {
      width: calc(100% - 2px);
      height: 100%;

      :deep(.el-tabs__content) {
        padding: 0;
      }
      .tab-wrapper {
        height: 100%;
      }
    }
  }
  .app-container {
    display: flex;
    flex: auto;
    height: 0;

    border-bottom: 1px var(--el-border-color) var(--el-border-style);

    .aside-wrapper {
      flex: none;
      width: 260px;
      padding: 20px;
    }

    .content-wrapper {
      position: relative;
      flex: auto;
    }
  }
}
.status-bar {
  position: absolute;
  right: 0;
  bottom: 0;
  left: 0;
}
</style>
