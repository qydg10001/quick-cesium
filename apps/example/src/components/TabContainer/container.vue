<template>
  <div class="my-tab-button wrapper" :title="props.name">
    <div class="container_wrapper">
      <slot></slot>
    </div>
    <div class="name">{{ props.name }}</div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps({
  name: {
    type: String,
    default: '容器',
  },
})
</script>

<style lang="scss" scoped>
.wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-width: 64px;
  height: 100%;
  cursor: pointer;
  border-radius: 4px;

  &:hover {
    background-color: var(--el-fill-color-light);
    transition: background-color 0.25s ease;
  }
  .container_wrapper {
    display: flex;
    flex: auto;
    align-items: center;
    justify-content: center;
  }
  .name {
    flex: none;
    align-items: center;
    justify-content: center;
    width: 100%;
    padding: 4px 0;
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
</style>
