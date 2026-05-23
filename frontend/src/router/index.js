import { createRouter, createWebHistory } from 'vue-router'
import MainLayout from '@/layouts/MainLayout.vue'
import { authState, isAuthenticated } from '@/lib/auth'

const router = createRouter({
  history: createWebHistory('/automate/'),
  routes: [
    {
      path: '/login',
      name: 'Login',
      component: () => import('@/views/Login.vue')
    },
    {
      path: '/register',
      name: 'Register',
      component: () => import('@/views/Register.vue')
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
          path: 'test-suites',
          name: 'TestSuite',
          component: () => import('@/views/Contacts.vue')
        },
        {
          path: 'test-runs',
          name: 'TestRun',
          component: () => import('@/views/Companies.vue')
        },
        {
          path: 'api-testing',
          name: 'ApiTesting',
          component: () => import('@/views/ApiTesting.vue')
        },
        {
          path: 'ui-testing',
          name: 'UiTesting',
          component: () => import('@/views/Tasks.vue')
        },
        {
          path: 'performance',
          name: 'Performance',
          component: () => import('@/views/Placeholder.vue')
        },
        {
          path: 'defects',
          name: 'Defects',
          component: () => import('@/views/Placeholder.vue')
        },
        {
          path: 'pipelines',
          name: 'Pipelines',
          component: () => import('@/views/Placeholder.vue')
        },
        {
          path: 'environments',
          name: 'Environments',
          component: () => import('@/views/Placeholder.vue')
        },
        {
          path: 'reports',
          name: 'Reports',
          component: () => import('@/views/Reports.vue')
        },
        {
          path: 'logs',
          name: 'Logs',
          component: () => import('@/views/Placeholder.vue')
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

  const isPublicPage = ['Login', 'Register'].includes(to.name)

  if (!isPublicPage && !isAuthenticated.value) {
    next({ name: 'Login' })
  } else if (isPublicPage && isAuthenticated.value) {
    next({ name: 'Dashboard' })
  } else {
    next()
  }
})

export default router
