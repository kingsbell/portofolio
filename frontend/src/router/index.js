import { createRouter, createWebHistory } from 'vue-router'
import MainLayout from '@/layouts/MainLayout.vue'
import { authState, isAuthenticated } from '@/lib/auth'

const router = createRouter({
  history: createWebHistory('/material-dashboard-shadcn-vue/'),
  routes: [
    {
      path: '/login',
      name: 'Login',
      component: () => import('@/views/Login.vue')
    },
    {
      path: '/',
      component: MainLayout,
      children: [
        {
          path: '',
          redirect: '/login'
        },
        {
          path: 'dashboard',
          name: 'Dashboard',
          component: () => import('@/views/Dashboard.vue')
        },
        {
          path: 'contacts',
          name: 'Contacts',
          component: () => import('@/views/Contacts.vue')
        },
        {
          path: 'companies',
          name: 'Companies',
          component: () => import('@/views/Companies.vue')
        },
        {
          path: 'deals',
          name: 'Deals',
          component: () => import('@/views/Deals.vue')
        },
        {
          path: 'tasks',
          name: 'Tasks',
          component: () => import('@/views/Tasks.vue')
        },
        {
          path: 'reports',
          name: 'Reports',
          component: () => import('@/views/Reports.vue')
        },
        {
          path: 'billing',
          name: 'Billing',
          component: () => import('@/views/Billing.vue')
        },
        {
          path: 'settings',
          name: 'Settings',
          component: () => import('@/views/Settings.vue')
        },
        {
          path: 'docs',
          name: 'Docs',
          component: () => import('@/views/Docs.vue')
        }
      ]
    }
  ]
})

router.beforeEach(async (to, from, next) => {
  // Hanya lakukan pengecekan status login ke backend jika status lokal belum terautentikasi
  if (!isAuthenticated.value) {
    await authState.check()
  }

  if (to.name !== 'Login' && !isAuthenticated.value) {
    next({ name: 'Login' })
  } else if (to.name === 'Login' && isAuthenticated.value) {
    next({ name: 'Dashboard' })
  } else {
    next()
  }
})

export default router
