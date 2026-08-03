import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'weather-home',
      component: () => import('../views/WeatherHomeView.vue'),
    },
    {
      path: '/weather/:id',
      name: 'weather-detail',
      component: () => import('../views/WeatherDetailView.vue'),
      props: true,
    },
    {
      path: '/practices',
      name: 'practices',
      component: () => import('../views/practices/PracticesIndexView.vue'),
    },
    {
      path: '/practices/day1',
      name: 'practices-day1',
      component: () => import('../views/practices/PracticesDay1View.vue'),
    },
    {
      path: '/practices/day2',
      name: 'practices-day2',
      component: () => import('../views/practices/PracticesDay2View.vue'),
    },
    {
      path: '/practices/day3',
      name: 'practices-day3',
      component: () => import('../views/practices/PracticesDay3View.vue'),
    },
    {
      path: '/practices/day4',
      name: 'practices-day4',
      component: () => import('../views/practices/PracticesDay4View.vue'),
    },
    {
      // Catch-all Route: 정의되지 않은 모든 경로 처리
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('../views/NotFoundView.vue'),
    },
  ],
})

export default router
