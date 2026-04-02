import { createRouter, createWebHistory } from 'vue-router'
import { SupabaseService } from '../services/SupabaseService'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/HomeView.vue')
  },
  {
    path: '/admin/login',
    name: 'AdminLogin',
    component: () => import('../views/AdminLogin.vue')
  },
  {
    path: '/admin',
    name: 'AdminDashboard',
    component: () => import('../views/AdminDashboard.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: 'products',
        name: 'ProductManagement',
        component: () => import('../views/ProductManagement.vue')
      },
      {
        path: 'orders',
        name: 'OrderManagement',
        component: () => import('../views/OrderManagement.vue')
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach(async (to, from, next) => {
  const user = await SupabaseService.getUser()
  if (to.meta.requiresAuth && !user) {
    next('/admin/login')
  } else {
    next()
  }
})

export default router
