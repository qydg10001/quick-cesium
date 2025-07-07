<template>
  <div class="my-tab-group">
    <div class="group-container">
      <div class="group-content">
        <slot></slot>
      </div>
      <div :title="props.name" class="group-name">{{ props.name }}</div>
    </div>
    <!-- <el-divider class="my-tab-group-divider" direction="vertical" /> -->
    <tab-divider class="my-tab-group-divider"></tab-divider>
  </div>
</template>

<script setup lang="ts">
import TabDivider from '../TabDivider'

const props = defineProps({
  // 分组名称
  name: {
    type: String,
    default: '',
  },
})
</script>

<style lang="scss" scoped>
.my-tab-group {
  display: flex;
  height: 100%;

  .group-container {
    display: flex;
    flex-direction: column;
  }
}
.group-name {
  // TODO: 文字超出省略号（现状是文字会将上方的宽度撑开）
  flex: none;
  height: 22px;
  // padding: 4px;
  font-size: var(--el-font-size-base);
  line-height: 22px;
  color: var(--el-text-color-secondary);
  text-align: center;
}
.group-content {
  display: flex;
  flex: auto;
}
// 按钮右边距
:deep(.my-tab-button) {
  margin-right: 8px;

  &:last-child {
    margin-right: 0;
  }
}
</style>
