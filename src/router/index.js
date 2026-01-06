import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    redirect: '/index'
  },
  {
    path: '/index',
    name: 'Index',
    component: () => import('@/views/index.vue')
  },
  {
    path: '/satellite',
    name: 'satellite',
    component: () => import('@/views/satellite.vue')
  },
  {
    path: '/coord',
    name: 'coord',
    component: () => import('@/views/coord.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
