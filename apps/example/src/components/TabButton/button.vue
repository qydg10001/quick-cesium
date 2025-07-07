<template>
  <div class="my-tab-button wrapper" :title="props.name" @click="emit('click')">
    <div class="pic_wrapper">
      <slot>
        <img class="pic" :src="props.icon" />
      </slot>
    </div>
    <div class="name">{{ props.name }}</div>
  </div>
</template>

<script setup lang="ts">
import defaultIcon from '@/assets/icons/default_tab_icon.png'

const props = defineProps({
  name: {
    type: String,
    default: '按钮',
  },
  icon: {
    type: String,
    default: defaultIcon,
  },
})
const emit = defineEmits(['click'])
</script>

<style lang="scss" scoped>
.wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 100%;
  cursor: pointer;
  border-radius: 4px;

  &:hover {
    background-color: var(--el-fill-color-light);
    transition: background-color 0.25s ease;
  }
  .pic_wrapper {
    display: flex;
    flex: auto;
    align-items: center;
    justify-content: center;

    .pic {
      width: 32px;
      height: 32px;
    }
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
