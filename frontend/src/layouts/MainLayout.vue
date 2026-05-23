<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { RouterView, useRoute } from 'vue-router'
import Navbar from '@/components/Navbar.vue'
import Footer from '@/components/Footer.vue'
import {
  LayoutDashboard,
  FlaskConical,
  CirclePlay,
  Network,
  MousePointerClick,
  Gauge,
  Bug,
  GitFork,
  Cpu,
  Activity,
  FileText,
  Settings,
  ChevronLeft,
  ChevronRight,
  Zap
} from 'lucide-vue-next'

const route = useRoute()
const sidebarOpen = ref(true)
const isMobile = ref(false)

const navigation = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Test Suites', path: '/test-suites', icon: FlaskConical },
  { name: 'Test Runs', path: '/test-runs', icon: CirclePlay },
  { name: 'API Testing', path: '/api-testing', icon: Network },
  { name: 'UI Testing', path: '/ui-testing', icon: MousePointerClick },
  { name: 'Performance', path: '/performance', icon: Gauge },
  { name: 'Defects', path: '/defects', icon: Bug },
  { name: 'Pipelines', path: '/pipelines', icon: GitFork },
  { name: 'Environments', path: '/environments', icon: Cpu },
  { name: 'Reports', path: '/reports', icon: Activity },
  { name: 'Logs', path: '/logs', icon: FileText },
  { name: 'Settings', path: '/settings', icon: Settings }
]

const checkMobile = () => {
  isMobile.value = window.innerWidth < 1024
  if (isMobile.value) {
    sidebarOpen.value = false
  } else {
    sidebarOpen.value = true
  }
}

const toggleSidebar = () => {
  sidebarOpen.value = !sidebarOpen.value
}

const closeSidebarOnMobile = () => {
  if (isMobile.value) {
    sidebarOpen.value = false
  }
}

onMounted(() => {
  checkMobile()
  window.addEventListener('resize', checkMobile)
})

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile)
})
</script>

<template>
  <div class="flex h-screen bg-background">
    <div v-if="sidebarOpen && isMobile" @click="closeSidebarOnMobile" class="fixed inset-0 bg-black/50 z-40 lg:hidden">
    </div>

    <aside :class="[
      'bg-card border-r transition-all duration-300 flex flex-col fixed lg:relative h-full z-50 overflow-hidden',
      isMobile ? (sidebarOpen ? 'w-64' : 'w-0') : (sidebarOpen ? 'w-64' : 'w-20'),
      isMobile && !sidebarOpen ? '-translate-x-full' : 'translate-x-0'
    ]">
      <div class="p-6 md:py-8 lg:p-4 border-b flex items-center" :class="sidebarOpen ? 'justify-between' : 'justify-center'">
        <div class="flex items-center gap-2">
          <div class="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground" :class="{ 'mx-auto': !sidebarOpen }">
            <Zap />
          </div>
          <h3 v-if="sidebarOpen" class="text-sm font-semibold">QA Automation</h3>
        </div>
        <button v-if="sidebarOpen" @click="toggleSidebar" class="p-2 hover:bg-accent rounded-md hidden lg:block">
          <ChevronLeft :size="20" />
        </button>
      </div>

      <nav class="flex-1 p-4 space-y-1 overflow-y-auto">
        <router-link v-for="item in navigation" :key="item.path" :to="item.path" @click="closeSidebarOnMobile" :class="[
          'flex items-center rounded-lg transition-colors text-sm py-2',
          sidebarOpen ? 'px-3 gap-2 justify-start' : 'justify-center px-0 w-12 mx-auto',
          route.path === item.path
            ? 'bg-primary text-primary-foreground'
            : 'hover:bg-accent hover:text-accent-foreground'
        ]">
          <component :is="item.icon" :size="20" />
          <span v-if="sidebarOpen">{{ item.name }}</span>
        </router-link>
      </nav>
    </aside>

    <div class="flex-1 flex flex-col overflow-hidden">
      <Navbar :on-toggle-sidebar="toggleSidebar" />

      <main class="flex-1 overflow-auto">
        <div class="p-4 md:p-8">
          <RouterView />
        </div>
      </main>

      <Footer />
    </div>
  </div>
</template>
