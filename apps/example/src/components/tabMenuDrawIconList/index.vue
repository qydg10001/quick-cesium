<template>
  <tab-tool
    name="绘制图标"
    v-model="isDrawIcon"
    :icon="tabDrawIconIcon"
    :active-icon="tabDrawIconActiveIcon"
    @click="handleClick"
  ></tab-tool>
  <tab-dropdown name="图标样式" :icon="iconUrl">
    <template #dropdown>
      <!-- <div class="icon-list">
        <div
          class="icon-item"
          v-for="(item, index) in icons || []"
          :key="index"
          :title="item.name"
          @click="mapServerStore?.addXyzMapServer(item.name, item.url)"
        >
          <el-image style="width: 48px; height: 48px" :src="tabWmsOnlineIcon" fit="" />
          <div class="map-name">{{ item.name }}</div>
        </div>
      </div> -->
      <div class="icon-list">
        <div
          :class="{ active: icon === iconUrl }"
          class="icon-item"
          v-for="(icon, index) in icons"
          :key="index"
          @click="selectIcon(icon)"
        >
          <el-image style="width: 48px; height: 48px" :src="icon" fit="contain" />
        </div>
      </div>
    </template>
  </tab-dropdown>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import * as Cesium from 'cesium'
import TabTool from '@/components/TabTool'
import TabDropdown from '@/components/TabDropdown'
import { useCesiumViewerStore } from '@/stores/cesiumViewer'
import { useDrawStatusStore } from '@/stores/drawStatus'
import { DrawStatusType } from '@/types/drawStatus'
import { useEditTool, type ITcctEditTool } from '@quick-cesium/sdk/src'

import tabDrawIconIcon from '@/assets/icons/tab_draw_icon.png'
import tabDrawIconActiveIcon from '@/assets/icons/tab_draw_icon_active.png'

// 示例图标
import analysisAroundIcon from '@/assets/icons/example/analysis_around.png'
import analysisCoordinationLocationIcon from '@/assets/icons/example/analysis_coordination_location.png'
import analysisMapLocationIcon from '@/assets/icons/example/analysis_map_location.png'
import analysisSandboxIcon from '@/assets/icons/example/analysis_sandbox.png'
import analysisSpreadIcon from '@/assets/icons/example/analysis_spread.png'
import checkPointIcon from '@/assets/icons/example/check_point.png'
import sandboxExplosiveIcon from '@/assets/icons/example/sandbox_explosive.png'
import sandboxFireIcon from '@/assets/icons/example/sandbox_fire.png'
import sandboxFirefighterIcon from '@/assets/icons/example/sandbox_firefighter.png'
import sandboxFirepointIcon from '@/assets/icons/example/sandbox_firepoint.png'
import sandboxFlameIcon from '@/assets/icons/example/sandbox_flame.png'
import sandboxTrappedIcon from '@/assets/icons/example/sandbox_trapped.png'
import sandboxWaterIcon from '@/assets/icons/example/sandbox_water.png'
import { VerticalOrigin } from 'cesium'

const { getViewerAsync } = useCesiumViewerStore()
const drawStatusStore = useDrawStatusStore()
// 绘制图标的标志
const isDrawIcon = ref(false)
const iconUrl = ref(checkPointIcon)
const icons = ref([
  checkPointIcon,
  analysisAroundIcon,
  analysisCoordinationLocationIcon,
  analysisMapLocationIcon,
  analysisSandboxIcon,
  analysisSpreadIcon,
  sandboxExplosiveIcon,
  sandboxFireIcon,
  sandboxFirefighterIcon,
  sandboxFirepointIcon,
  sandboxFlameIcon,
  sandboxTrappedIcon,
  sandboxWaterIcon,
])
let editTool: ITcctEditTool
let viewer: Cesium.Viewer

const handleClick = async () => {
  if (isDrawIcon.value) {
    // 绘点
    drawStatusStore.status = DrawStatusType.Icon
    if (editTool) {
      editTool
        .drawPoint()
        .then((position) => {
          viewer.entities.add({
            position,
            billboard: {
              image: iconUrl.value,
              verticalOrigin: VerticalOrigin.BOTTOM,
            },
          })
        })
        .finally(() => {
          drawStatusStore.status = DrawStatusType.None
          isDrawIcon.value = false
        })
    }
  } else {
    // 取消绘制
    editTool?.abort()
  }
}

const selectIcon = (icon: string) => {
  iconUrl.value = icon
}

watch(
  () => drawStatusStore.status,
  (val) => {
    if (val !== DrawStatusType.Icon) {
      isDrawIcon.value = false
    }
  },
)

onMounted(() => {
  getViewerAsync().then((v) => {
    viewer = v
    editTool = useEditTool(v)
  })
})
</script>

<style lang="scss" scoped>
.icon-list {
  display: flex;
  flex-wrap: wrap;
  width: 612px;
  max-height: 400px;
  margin: 12px;
  border-left: 1px solid var(--el-border-color);

  .icon-item {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 60px;
    height: 60px;
    cursor: pointer;
    // background-color: #f0f0f0;
    border-right: 1px solid var(--el-border-color);
    border-bottom: 1px solid var(--el-border-color);

    &:nth-child(-n + 10) {
      border-top: 1px solid var(--el-border-color);
    }
    &:hover {
      color: var(--brand-color-light);
      // background-color: #e0e0e0;
      background-color: var(--el-border-color-extra-light);
    }
    &.active {
      background-color: var(--el-color-primary-light-7);
    }
  }
}
</style>
