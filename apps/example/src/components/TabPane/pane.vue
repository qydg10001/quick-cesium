<template>
  <el-tab-pane class="my-tab-pane" :label="props.label">
    <el-scrollbar always>
      <slot></slot>
    </el-scrollbar>
  </el-tab-pane>
</template>

<script setup lang="ts">
const props = defineProps({
  label: {
    type: String,
    default: '',
  },
})
</script>

<style lang="scss" scoped>
.my-tab-pane {
  height: 100%;

  // 滚动条内容高度撑开
  :deep(.el-scrollbar__view) {
    display: flex;
    height: 100%;
    height: calc(100% - 8px);
    padding: 4px;
  }
  // :deep(.my-tab-group) {
  //   display: flex;
  //   height: 100%;
  // }
  // 最后一个分组的分隔线不显示
  // :deep(.my-tab-group:last-child .my-tab-group-divider) {
  //   display: none;
  // }
  // // 按钮右边距
  // :deep(.my-tab-button) {
  //   margin-right: 8px;

  //   &:last-child {
  //     margin-right: 0;
  //   }
  // }
}
</style>
