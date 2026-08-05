<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { RouterLink, RouterView, useRoute, useRouter } from 'vue-router'
import UnitToggler from './components/UnitToggler.vue'
import SearchBar from './components/practices/weather/SearchBar.vue'
import FavoriteHeartDots from './components/practices/weather/FavoriteHeartDots.vue'
import { useSearchStore } from './stores/searchStore'
import { useFavoritesStore } from './stores/favoritesStore'
import { useDemoStore } from './stores/demoStore'
import { CITY_LIST } from './services/weatherApi'

const route = useRoute()
const router = useRouter()
const searchStore = useSearchStore()
const favoritesStore = useFavoritesStore()
const demoStore = useDemoStore()

// nav 실제 높이를 CSS 변수로 노출한다. 모바일에서는 즐겨찾기 칩이 줄바꿈되며 nav 높이가
// 늘어날 수 있는데(App.vue의 반응형 대응), 지도 화면(WeatherMapView.vue)이 "100vh - nav 높이"로
// 자기 높이를 계산하므로 하드코딩된 상수 대신 이 변수를 참조하게 한다.
const navRef = ref(null)
let navResizeObserver = null

onMounted(() => {
  if (!navRef.value) return
  navResizeObserver = new ResizeObserver(([entry]) => {
    document.documentElement.style.setProperty('--nav-h', `${Math.round(entry.contentRect.height)}px`)
  })
  navResizeObserver.observe(navRef.value)
})
onUnmounted(() => navResizeObserver?.disconnect())

// 즐겨찾기 칩은 이름만 보여주면 되므로, 날씨 API를 다시 부르지 않고 정적 메타데이터에서 찾는다.
const favoriteCities = computed(() =>
  CITY_LIST.filter((city) => favoritesStore.isFavorite(city.id)),
)

// 칩을 클릭하면 "지도에서 보기"/"즐겨찾기 해제" 두 옵션이 담긴 작은 메뉴가 뜬다.
const openMenuFor = ref(null)

function toggleMenu(cityId) {
  openMenuFor.value = openMenuFor.value === cityId ? null : cityId
}

function viewOnMap(city) {
  openMenuFor.value = null
  router.push({ name: 'weather-map', query: { city: city.id } })
}

function removeFavorite(city) {
  openMenuFor.value = null
  favoritesStore.toggleFavorite(city.id)
}

function handleOutsideClick(event) {
  if (!event.target.closest('.app-nav__favorite-item')) {
    openMenuFor.value = null
  }
}

onMounted(() => document.addEventListener('click', handleOutsideClick))
onUnmounted(() => document.removeEventListener('click', handleOutsideClick))
</script>

<template>
  <nav ref="navRef" class="app-nav">
    <div class="app-nav__links">
      <RouterLink to="/" class="app-nav__link">날씨</RouterLink>
      <RouterLink to="/map" class="app-nav__link">지도</RouterLink>
      <RouterLink to="/practices" class="app-nav__link">실습 모음</RouterLink>
      <RouterLink to="/study-guide" class="app-nav__link">스터디 가이드</RouterLink>
    </div>

    <div v-if="favoriteCities.length > 0" class="app-nav__favorites">
      <div v-for="city in favoriteCities" :key="city.id" class="app-nav__favorite-item">
        <button class="app-nav__favorite-chip" @click.stop="toggleMenu(city.id)">
          <FavoriteHeartDots :active="true" :size="12" />
          {{ city.name }}
        </button>

        <div v-if="openMenuFor === city.id" class="app-nav__favorite-menu">
          <button class="app-nav__favorite-menu-item" @click.stop="viewOnMap(city)">
            지도에서 보기
          </button>
          <button
            class="app-nav__favorite-menu-item app-nav__favorite-menu-item--danger"
            @click.stop="removeFavorite(city)"
          >
            즐겨찾기 해제
          </button>
        </div>
      </div>
    </div>

    <button class="app-nav__demo-toggle" @click="demoStore.toggleDummyData">
      {{ demoStore.useDummyData ? '실제 데이터 보기' : '데모 데이터 보기' }}
    </button>

    <!-- 홈 화면(weather-home)은 카드 목록 위에 자체 검색창(SearchBar.vue, 슬롯 배치 실습 과제
         산출물)이 이미 있어, 같은 store를 공유하는 이 nav 검색창을 그 화면에서만 숨긴다 —
         지도 등 다른 화면에서는 이 검색창이 유일한 검색 진입점이라 그대로 둔다. -->
    <SearchBar
      v-if="route.name !== 'weather-home'"
      class="app-nav__search"
      :query="searchStore.query"
      @update-query="searchStore.setQuery"
    />

    <UnitToggler />
  </nav>
  <RouterView />
</template>

<style scoped>
.app-nav {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 16px;
  padding: 16px 20px;
  background: var(--ink);
  border-bottom: 2px solid var(--amber);
}

.app-nav__links {
  display: flex;
  gap: 16px;
}

.app-nav__link {
  font-family: var(--font-pixel-kr);
  font-size: 14px;
  color: var(--paper);
  text-decoration: none;
  letter-spacing: 0.05em;
}

.app-nav__link.router-link-active {
  color: var(--amber);
}

.app-nav__favorites {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.app-nav__favorite-item {
  position: relative;
}

.app-nav__favorite-chip {
  display: flex;
  align-items: center;
  gap: 6px;
  border: 1px solid var(--amber);
  background: rgba(255, 255, 255, 0.06);
  color: var(--amber);
  font-family: var(--font-pixel-kr);
  font-size: 12px;
  padding: 4px 10px;
  border-radius: 999px;
  cursor: pointer;
}

.app-nav__favorite-menu {
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  z-index: 20;
  display: flex;
  flex-direction: column;
  min-width: 130px;
  background: var(--paper);
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.3);
}

.app-nav__favorite-menu-item {
  border: none;
  background: none;
  text-align: left;
  padding: 10px 14px;
  font-family: var(--font-pixel-kr);
  font-size: 12px;
  color: var(--ink);
  cursor: pointer;
}

.app-nav__favorite-menu-item:hover {
  background: var(--panel);
}

.app-nav__favorite-menu-item--danger {
  color: #c0392b;
}

.app-nav__demo-toggle {
  border: 1px solid var(--moss);
  background: var(--panel);
  color: var(--dot-lit);
  font-family: var(--font-pixel-kr);
  font-size: 12px;
  padding: 8px 14px;
  border-radius: 999px;
  cursor: pointer;
}

.app-nav__demo-toggle:hover {
  border-color: var(--amber);
  color: var(--amber);
}

/* 링크/즐겨찾기는 왼쪽, 검색·단위 전환은 오른쪽으로 밀어낸다 */
.app-nav__search {
  flex: 0 1 220px;
  margin-left: auto;
}

/* ≤640px: 모바일. nav를 세로로 쌓고, 즐겨찾기 칩은 줄바꿈 대신 가로 스크롤로 눌러
   nav 높이가 즐겨찾기 개수(최대 17개)에 따라 커지지 않게 한다. */
@media (max-width: 640px) {
  .app-nav {
    flex-direction: column;
    align-items: stretch;
    gap: 10px;
  }

  .app-nav__favorites {
    flex-wrap: nowrap;
    overflow-x: auto;
    padding-bottom: 2px;
  }

  .app-nav__favorite-chip {
    flex-shrink: 0;
  }

  .app-nav__search {
    margin-left: 0;
    flex: 1 1 auto;
    width: 100%;
  }

  /* 우측 끝 칩에서 열어도 메뉴가 화면 밖으로 나가지 않도록, 앵커 대신 화면 폭에 맞춘
     고정 팝업으로 바꾼다. */
  .app-nav__favorite-menu {
    position: fixed;
    left: 16px;
    right: 16px;
    top: auto;
    min-width: 0;
  }
}
</style>
