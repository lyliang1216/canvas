import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('../views/AboutView.vue')
    },
    {
      path: '/area',
      name: 'area',
      component: () => import('../views/AreaView.vue')
    },
    {
      path: '/all',
      name: 'all',
      component: () => import('../views/AllView.vue')
    },
    {
      path: '/res',
      name: 'res',
      component: () => import('../views/ResView.vue')
    },
    {
      path: '/resArea',
      name: 'resArea',
      component: () => import('../views/ResAreaView.vue')
    }
  ]
})

export default router
