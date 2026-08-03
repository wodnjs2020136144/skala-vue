import { ref, watch } from 'vue'
import { defineStore } from 'pinia'

const STORAGE_KEY = 'weather-favorites'

function loadFavorites() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

// 즐겨찾기한 도시 id 목록을 관리하고 localStorage에 영속화하는 스토어.
export const useFavoritesStore = defineStore('favorites', () => {
  const favoriteIds = ref(loadFavorites())

  watch(
    favoriteIds,
    (ids) => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(ids))
    },
    { deep: true },
  )

  function isFavorite(id) {
    return favoriteIds.value.includes(id)
  }

  function toggleFavorite(id) {
    favoriteIds.value = isFavorite(id)
      ? favoriteIds.value.filter((favId) => favId !== id)
      : [...favoriteIds.value, id]
  }

  return { favoriteIds, isFavorite, toggleFavorite }
})
