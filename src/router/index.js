import { createRouter, createWebHistory } from 'vue-router'
import { SupabaseService } from '../services/SupabaseService'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/HomeView.vue')
  },
  {
    path: '/digital',
    name: 'DigitalProducts',
    component: () => import('../views/DigitalProducts.vue')
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
    meta: { requiresAuth: true }
  },
  // Redirect old child routes to admin (tabs handle them now)
  {
    path: '/admin/products',
    redirect: '/admin'
  },
  {
    path: '/admin/orders',
    redirect: '/admin'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  SupabaseService.getUser()
    .then((user) => {
      if (to.meta.requiresAuth && !user) {
        next('/admin/login')
      } else {
        next()
      }
    })
    .catch(() => {
      next('/admin/login')
    })
})

export default router
