import { defineStore } from 'pinia'
import { DrawStatusType } from '@/types/drawStatus'
import { ref } from 'vue'

export const useDrawStatusStore = defineStore('drawStatus', () => {
  const status = ref<DrawStatusType>(DrawStatusType.None)

  return { status }
})
