import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'

export const useArticleStore = defineStore('article', () => {
  const currentTitle = ref('')
  const route = useRoute()

  // 监听路由变化，更新标题
  watch(() => route.meta.title, (newTitle) => {
    if (newTitle) {
      currentTitle.value = newTitle as string
    }
  }, { immediate: true })

  const setTitle = (title: string) => {
    currentTitle.value = title
  }

  const clearTitle = () => {
    currentTitle.value = ''
  }

  return {
    currentTitle,
    setTitle,
    clearTitle
  }
}) 