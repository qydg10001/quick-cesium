<template>
  <div class="my-tab-button wrapper" :title="props.name">
    <!-- 上半部分作为其它组件的图标 -->
    <div
      v-if="hasComponent"
      class="btn-wrapper"
      :title="props.buttonName || ''"
      @click="emit('click')"
    >
      <slot name="content">
        <img class="pic" :src="props.icon" />
      </slot>
    </div>
    <el-popover
      placement="bottom-start"
      :show-arrow="false"
      width="fit-content"
      :offset="2"
      popper-style="padding: 0;"
      @show="isPopoverShow = true"
      @hide="isPopoverShow = false"
    >
      <template #reference>
        <div class="dropdown_button" :class="{ active: isPopoverShow }">
          <!-- 上半部分没有单独作用的图标 -->
          <div v-if="!hasComponent" class="pic_wrapper">
            <slot name="content">
              <img class="pic" :src="props.icon" />
            </slot>
          </div>
          <div class="name">{{ props.name }}</div>
          <el-icon class="dropdown-icon" :size="12"><CaretBottom /></el-icon>
        </div>
      </template>
      <div class="dropdown-content">
        <slot name="dropdown">
          <div class="dropdown-placeholder">下拉内容为空</div>
        </slot>
      </div>
    </el-popover>
  </div>
</template>

<script setup lang="ts">
import { getCurrentInstance, ref } from 'vue'

import defaultIcon from '@/assets/icons/default_tab_icon.png'

const props = defineProps({
  name: {
    type: String,
    default: '按钮',
  },
  buttonName: {
    type: String,
  },
  icon: {
    type: String,
    default: defaultIcon,
  },
})
const instance = getCurrentInstance()
const hasComponent = !!instance?.vnode.props?.onClick
const isPopoverShow = ref(false)
// console.log(props.icon, 'icon')
const emit = defineEmits(['click'])
</script>

<style lang="scss" scoped>
.wrapper {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 100%;
  cursor: pointer;
  border-radius: 4px;

  .btn-wrapper {
    display: flex;
    flex: auto;
    align-items: center;
    justify-content: center;
    width: 100%;
    border-bottom: 1px var(--el-border-color) var(--el-border-style);
    border-radius: 4px 4px 0 0;

    &:hover {
      background-color: var(--el-fill-color-light);
      transition: background-color 0.25s ease;
    }
    .pic {
      width: 32px;
      height: 32px;
    }
  }
  .pic_wrapper {
    display: flex;
    flex: auto;
    align-items: center;
    justify-content: center;
    width: 100%;
    border-radius: 4px 4px 0 0;
    .pic {
      width: 32px;
      height: 32px;
    }
  }
  .dropdown_button {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 100%;
    border-radius: 0 0 4px 4px;
    // padding: 4px 0;
    // height: 24px;
    // overflow: hidden;
    // text-overflow: ellipsis;
    // font-size: var(--el-font-size-base);
    // color: var(--el-text-color-primary);
    // text-align: center;
    // white-space: nowrap;

    // .el-icon {
    //   margin-top: 2px;
    //   color: var(--el-text-color-secondary);
    // }

    &.active,
    &:hover {
      background-color: var(--el-fill-color-light);
      transition: background-color 0.25s ease;

      & .dropdown-icon {
        color: var(--el-text-color-primary);
      }
    }
    .dropdown-icon {
      margin-top: -5px;
      color: var(--el-text-color-secondary);
    }
    .name {
      flex: none;
      align-items: center;
      justify-content: center;
      width: 100%;
      // padding: 4px 0;
      // height: 24px;
      overflow: hidden;
      text-overflow: ellipsis;
      font-size: var(--el-font-size-base);
      // line-height: 24px;
      color: var(--el-text-color-primary);
      text-align: center;
      white-space: nowrap;
    }
  }
}
.dropdown-content {
  .dropdown-placeholder {
    width: 140px;
    height: 80px;
    padding: 8px;
    color: var(--el-text-color-secondary);
    text-align: center;
  }
}
</style>
