<template>
  <tab-dropdown name="在线地图" :icon="tabWmsOnlineIcon">
    <template #dropdown>
      <div class="map-wrapper">
        <el-divider v-if="layers.length > 0" content-position="left">自定义地图</el-divider>
        <div class="map-list">
          <div
            class="map-item"
            v-for="(item, index) in layers || []"
            :key="index"
            :title="item.name"
            @click="mapServerStore?.addXyzMapServer(item.name, item.url)"
          >
            <el-image style="width: 48px; height: 48px" :src="tabWmsOnlineIcon" fit="" />
            <div class="map-name">{{ item.name }}</div>
          </div>
        </div>
        <el-divider content-position="left">天地图</el-divider>
        <div class="map-list">
          <div
            class="map-item"
            v-for="(item, index) in tdtList || []"
            :key="index"
            :title="item.name"
            @click="mapServerStore?.addOnlineMapServer(item.type, null)"
          >
            <el-image
              style="width: 48px; height: 48px"
              :src="item.icon || tabWmsOnlineIcon"
              fit=""
            />
            <div class="map-name">{{ item.name }}</div>
          </div>
        </div>
        <el-divider content-position="left">高德地图</el-divider>
        <div class="map-list">
          <div
            class="map-item"
            v-for="(item, index) in amapList || []"
            :key="index"
            :title="item.name"
            @click="mapServerStore?.addOnlineMapServer(item.type, null)"
          >
            <el-image
              style="width: 48px; height: 48px"
              :src="item.icon || tabWmsOnlineIcon"
              fit=""
            />
            <div class="map-name">{{ item.name }}</div>
          </div>
        </div>
        <el-divider content-position="left">百度地图</el-divider>
        <div class="map-list">
          <div
            class="map-item"
            v-for="(item, index) in baiduList || []"
            :key="index"
            :title="item.name"
            @click="mapServerStore?.addOnlineMapServer(item.type, null)"
          >
            <el-image
              style="width: 48px; height: 48px"
              :src="item.icon || tabWmsOnlineIcon"
              fit=""
            />
            <div class="map-name">{{ item.name }}</div>
          </div>
        </div>
        <el-divider content-position="left">腾讯地图</el-divider>
        <div class="map-list">
          <div
            class="map-item"
            v-for="(item, index) in tencentList || []"
            :key="index"
            :title="item.name"
            @click="mapServerStore?.addOnlineMapServer(item.type, null)"
          >
            <el-image
              style="width: 48px; height: 48px"
              :src="item.icon || tabWmsOnlineIcon"
              fit=""
            />
            <div class="map-name">{{ item.name }}</div>
          </div>
        </div>
      </div>
    </template>
  </tab-dropdown>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'

import { useCesiumViewerStore } from '@/stores/cesiumViewer'
import { useCustomMaplayerStore } from '@/stores/customMapLayer'
import { TcctOnlineMapType, type ITcctMapServer } from '@quick-cesium/sdk/src'
import TabDropdown from '../TabDropdown'

const { layers } = useCustomMaplayerStore()

import tabWmsOnlineIcon from '@/assets/icons/tab_wms_online.png'
import mapServerVectorIcon from '@/assets/icons/map_server_vector.jpg'
import mapServerImageIcon from '@/assets/icons/map_server_image.jpg'
import mapServerLabelIcon from '@/assets/icons/map_server_label.jpg'
import mapServerTerrainIcon from '@/assets/icons/map_server_terrain.jpg'
import mapServerBoundaryIcon from '@/assets/icons/map_server_boundary.jpg'

const tdtList = [
  {
    name: '天地图地图',
    icon: mapServerVectorIcon,
    type: TcctOnlineMapType.TdtMap,
  },
  {
    name: '天地图地图注记',
    icon: mapServerLabelIcon,
    type: TcctOnlineMapType.TdtMapLabel,
  },
  {
    name: '天地图影像',
    icon: mapServerImageIcon,
    type: TcctOnlineMapType.TdtImage,
  },
  {
    name: '天地图影像注记',
    icon: mapServerLabelIcon,
    type: TcctOnlineMapType.TdtImageLabel,
  },
  {
    name: '天地图地形',
    icon: mapServerTerrainIcon,
    type: TcctOnlineMapType.TdtTerrain,
  },
  {
    name: '天地图地形注记',
    icon: mapServerLabelIcon,
    type: TcctOnlineMapType.TdtTerrainLabel,
  },
  {
    name: '天地图境界',
    icon: mapServerBoundaryIcon,
    type: TcctOnlineMapType.TdtBoundary,
  },
]
const amapList = [
  {
    name: '高德地图',
    icon: mapServerVectorIcon,
    type: TcctOnlineMapType.AMapMap,
  },
  {
    name: '高德影像',
    icon: mapServerImageIcon,
    type: TcctOnlineMapType.AMapImage,
  },
  {
    name: '高德影像标注',
    icon: mapServerLabelIcon,
    type: TcctOnlineMapType.AMapLabel,
  },
]
const baiduList = [
  {
    name: '百度地图',
    icon: mapServerVectorIcon,
    type: TcctOnlineMapType.BaiduMap,
  },
  {
    name: '百度影像',
    icon: mapServerImageIcon,
    type: TcctOnlineMapType.BaiduImage,
  },
]
const tencentList = [
  {
    name: '腾讯地图',
    icon: mapServerVectorIcon,
    type: TcctOnlineMapType.TencentMap,
  },
  {
    name: '腾讯影像',
    icon: mapServerImageIcon,
    type: TcctOnlineMapType.TencentImage,
  },
  {
    name: '腾讯地形',
    icon: mapServerTerrainIcon,
    type: TcctOnlineMapType.TencentTerrain,
  },
]

const { getViewerAsync, getMapServer } = useCesiumViewerStore()
let mapServerStore: ITcctMapServer | null = null

onMounted(() => {
  getViewerAsync().then(() => {
    mapServerStore = getMapServer()
  })
})
</script>

<style scoped>
.map-wrapper {
  width: 640px;
  height: 480px;
  padding: 0 12px;
  overflow-y: auto;
}
.map-list {
  display: flex;
  flex-wrap: wrap;

  .map-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 64px;
    padding: 8px;
    cursor: pointer;

    &:hover {
      background-color: var(--el-fill-color-light);
    }
    .map-name {
      width: 100%;
      overflow: hidden;
      text-overflow: ellipsis;
      text-align: center;
      white-space: nowrap;
    }
  }
}
</style>
