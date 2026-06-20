<script setup>
import { ref, computed, onMounted } from 'vue'
import Card from '@/components/ui/Card.vue'
import CardContent from '@/components/ui/CardContent.vue'
import { Line, Bar } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'
import {
  FlaskConical,
  Check,
  X,
  Clock,
  TrendingUp,
  Network,
  Gauge,
  Zap,
  ShieldCheck,
  Activity,
  MousePointerClick,
  Cpu,
  FileText,
  AlertTriangle,
  ArrowRight,
  Loader2
} from 'lucide-vue-next'
import { api } from '@/lib/api'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

// Global State
const suitesCount = ref(0)
const runs = ref([])
const loading = ref(true)

const fetchDashboardData = async () => {
  loading.value = true
  try {
    const suites = await api.getSuites()
    suitesCount.value = suites.length

    runs.value = await api.getAllRuns()
  } catch (error) {
    console.error('Failed to fetch dashboard data:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchDashboardData()
})

// Calculations for Metrics
const totalSuites = computed(() => suitesCount.value)

const averagePassRate = computed(() => {
  if (runs.value.length === 0) return '0%'
  const sum = runs.value.reduce((acc, r) => acc + parseFloat(r.success_rate), 0)
  return (sum / runs.value.length).toFixed(1) + '%'
})

const failedRunsCount = computed(() => {
  return runs.value.filter(r => r.status === 'failed').length
})

const averageDuration = computed(() => {
  if (runs.value.length === 0) return '0s'
  const sumMs = runs.value.reduce((acc, r) => acc + r.duration_ms, 0)
  const avgSec = Math.round(sumMs / runs.value.length / 1000)
  
  if (avgSec < 60) return `${avgSec}s`
  const min = Math.floor(avgSec / 60)
  const sec = avgSec % 60
  return `${min}m ${sec}s`
})

// Pass Rate Trend (Bar Chart 30 days) - maps actual runs if available, else falls back to mock
const passRateData = computed(() => {
  let data = [70, 94, 82, 95, 94, 91, 95, 86, 92, 96, 93, 76, 92, 97, 94, 89, 82, 92, 90, 94, 88, 93, 91, 95, 93, 80, 92, 94, 93, 91];
  
  if (runs.value.length > 0) {
    const runsSorted = [...runs.value].slice(0, 30).reverse()
    data = runsSorted.map(r => parseFloat(r.success_rate))
  }
  
  const colors = data.map(val => val < 85 ? '#f97316' : '#22c55e');
  return {
    labels: Array.from({ length: data.length }, (_, i) => `${data.length - i} run lalu`),
    datasets: [
      {
        label: 'Pass Rate (%)',
        data: data,
        backgroundColor: colors,
        borderRadius: 4,
        barThickness: 10,
      }
    ]
  };
});

const passRateOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      callbacks: {
        label: (context) => `Pass Rate: ${context.parsed.y}%`
      }
    }
  },
  scales: {
    y: {
      min: 0,
      max: 100,
      ticks: {
        callback: (value) => `${value}%`
      },
      grid: {
        color: 'rgba(0,0,0,0.05)'
      }
    },
    x: {
      display: false
    }
  }
}));

// Load & Stress Profile (Line Chart)
const loadStressData = computed(() => ({
  labels: ['0', '10%', '20%', '30%', '40%', '50%', '60%', '70%', '80%', '90%', '100%'],
  datasets: [
    {
      label: 'Latency (ms)',
      data: [120, 140, 180, 240, 310, 420, 600, 900, 1400, 2200, 3500],
      borderColor: 'rgb(59, 130, 246)',
      backgroundColor: 'rgba(59, 130, 246, 0.05)',
      tension: 0.4,
      fill: true,
      pointRadius: 0
    }
  ]
}));

const loadStressOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false }
  },
  scales: {
    y: {
      ticks: { callback: (value) => `${value}ms` },
      grid: { color: 'rgba(0,0,0,0.05)' }
    },
    x: {
      grid: { display: false }
    }
  }
}));

const formatWhen = (dateStr) => {
  const diffMs = new Date() - new Date(dateStr)
  const diffMin = Math.floor(diffMs / 60000)
  if (diffMin < 1) return 'Baru saja'
  if (diffMin < 60) return `${diffMin} menit lalu`
  const diffHour = Math.floor(diffMin / 60)
  if (diffHour < 24) return `${diffHour} jam lalu`
  return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
}
</script>

<template>
  <div class="space-y-8">
    
    <!-- Top Header -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl md:text-3xl font-bold tracking-tight">Automation Testing Dashboard</h1>
        <p class="text-sm text-muted-foreground mt-1">Pantau kesehatan test suite, pipeline CI/CD, dan stabilitas rilis secara real-time.</p>
      </div>
    </div>

    <!-- 4 Metrics Cards -->
    <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Card class="border bg-card/45 backdrop-blur-sm">
        <CardContent class="p-5 flex items-center justify-between">
          <div class="space-y-1">
            <span class="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Test Suites</span>
            <p class="text-3xl font-bold">{{ totalSuites }}</p>
            <p class="text-[11px] text-green-600 font-medium flex items-center gap-0.5">
              <span>Skenario terdaftar</span>
            </p>
          </div>
          <div class="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center text-green-600">
            <FlaskConical :size="20" />
          </div>
        </CardContent>
      </Card>

      <Card class="border bg-card/45 backdrop-blur-sm">
        <CardContent class="p-5 flex items-center justify-between">
          <div class="space-y-1">
            <span class="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Pass Rate</span>
            <p class="text-3xl font-bold text-green-500">{{ averagePassRate }}</p>
            <p class="text-[11px] text-green-600 font-medium flex items-center gap-0.5">
              <span>Rata-rata success rate</span>
            </p>
          </div>
          <div class="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center text-green-600">
            <div class="w-5 h-5 rounded-full bg-green-600 text-white flex items-center justify-center text-[10px]">
              <Check :size="12" stroke-width="3" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card class="border bg-card/45 backdrop-blur-sm">
        <CardContent class="p-5 flex items-center justify-between">
          <div class="space-y-1">
            <span class="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Failed Runs</span>
            <p class="text-3xl font-bold text-red-500">{{ failedRunsCount }}</p>
            <p class="text-[11px] text-red-500 font-medium flex items-center gap-0.5">
              <span>Run di bawah kriteria 95%</span>
            </p>
          </div>
          <div class="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center text-red-500">
            <div class="w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center text-[10px]">
              <X :size="12" stroke-width="3" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card class="border bg-card/45 backdrop-blur-sm">
        <CardContent class="p-5 flex items-center justify-between">
          <div class="space-y-1">
            <span class="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Avg Duration</span>
            <p class="text-3xl font-bold">{{ averageDuration }}</p>
            <p class="text-[11px] text-green-600 font-medium flex items-center gap-0.5">
              <span>Rata-rata eksekusi k6</span>
            </p>
          </div>
          <div class="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-600">
            <Clock :size="20" />
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Pass Rate Trend & Test Coverage -->
    <div class="grid gap-6 lg:grid-cols-3">
      <!-- Pass Rate Trend Bar Chart -->
      <Card class="lg:col-span-2 border bg-card/45 backdrop-blur-sm p-5 space-y-4">
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-lg font-bold text-foreground">Pass Rate Trend</h2>
            <p class="text-xs text-muted-foreground">30 hari terakhir · seluruh suite</p>
          </div>
          <span class="text-xs font-semibold text-green-600 bg-green-500/10 px-2 py-0.5 rounded-full flex items-center gap-0.5">
            <TrendingUp :size="12" /> +3.4%
          </span>
        </div>
        <div class="h-64">
          <Bar :data="passRateData" :options="passRateOptions" />
        </div>
        <div class="flex items-center justify-between text-[11px] text-muted-foreground pt-2">
          <span>30d lalu</span>
          <span>Hari ini</span>
        </div>
      </Card>

      <!-- Test Coverage Progress Bars -->
      <Card class="border bg-card/45 backdrop-blur-sm p-5 space-y-6">
        <div>
          <h2 class="text-lg font-bold text-foreground">Test Coverage</h2>
          <p class="text-xs text-muted-foreground">Berdasarkan tipe pengujian</p>
        </div>
        
        <div class="space-y-4">
          <!-- Unit -->
          <div class="space-y-1.5">
            <div class="flex justify-between text-xs font-semibold">
              <span class="text-foreground">Unit</span>
              <span class="text-muted-foreground">87%</span>
            </div>
            <div class="w-full bg-secondary h-2.5 rounded-full overflow-hidden">
              <div class="bg-green-500 h-full rounded-full" style="width: 87%"></div>
            </div>
          </div>

          <!-- Integration -->
          <div class="space-y-1.5">
            <div class="flex justify-between text-xs font-semibold">
              <span class="text-foreground">Integration</span>
              <span class="text-muted-foreground">72%</span>
            </div>
            <div class="w-full bg-secondary h-2.5 rounded-full overflow-hidden">
              <div class="bg-green-500 h-full rounded-full" style="width: 72%"></div>
            </div>
          </div>

          <!-- E2E -->
          <div class="space-y-1.5">
            <div class="flex justify-between text-xs font-semibold">
              <span class="text-foreground">E2E</span>
              <span class="text-muted-foreground">58%</span>
            </div>
            <div class="w-full bg-secondary h-2.5 rounded-full overflow-hidden">
              <div class="bg-blue-500 h-full rounded-full" style="width: 58%"></div>
            </div>
          </div>

          <!-- Visual -->
          <div class="space-y-1.5">
            <div class="flex justify-between text-xs font-semibold">
              <span class="text-foreground">Visual</span>
              <span class="text-muted-foreground">41%</span>
            </div>
            <div class="w-full bg-secondary h-2.5 rounded-full overflow-hidden">
              <div class="bg-orange-500 h-full rounded-full" style="width: 41%"></div>
            </div>
          </div>
        </div>
      </Card>
    </div>

    <!-- Recent Test Runs Table -->
    <Card class="border bg-card/45 backdrop-blur-sm p-5 space-y-4">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-lg font-bold text-foreground">Recent Test Runs</h2>
          <p class="text-xs text-muted-foreground">Eksekusi terbaru dari seluruh environment</p>
        </div>
        <router-link to="/test-runs" class="text-xs font-semibold text-primary hover:underline flex items-center gap-0.5">
          Lihat semua
        </router-link>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-left text-sm border-collapse">
          <thead>
            <tr class="border-b text-muted-foreground text-xs uppercase font-bold">
              <th class="pb-3 pr-2">Run</th>
              <th class="pb-3 px-2">Status</th>
              <th class="pb-3 px-2">Type</th>
              <th class="pb-3 px-2">Target</th>
              <th class="pb-3 px-2">Result</th>
              <th class="pb-3 px-2">Duration</th>
              <th class="pb-3 pl-2 text-right">When</th>
            </tr>
          </thead>
          <tbody v-if="runs.length > 0">
            <tr v-for="run in runs.slice(0, 5)" :key="run.id" class="border-b hover:bg-muted/40 transition-colors">
              <td class="py-3.5 pr-2">
                <p class="font-bold text-foreground">{{ run.suite_name || 'Uji Coba k6' }}</p>
                <p class="text-xs text-muted-foreground">#{{ run.id }}</p>
              </td>
              <td class="py-3.5 px-2">
                <span :class="[
                  'px-2 py-0.5 rounded text-xs font-semibold',
                  run.status === 'success' ? 'bg-green-500/10 text-green-600' : 'bg-red-500/10 text-red-500'
                ]">{{ run.status === 'success' ? 'Passed' : 'Failed' }}</span>
              </td>
              <td class="py-3.5 px-2 text-muted-foreground capitalize">{{ run.test_type }}</td>
              <td class="py-3.5 px-2 text-muted-foreground">k6 CLI</td>
              <td class="py-3.5 px-2 font-bold" :class="run.success_rate >= 95 ? 'text-green-600' : 'text-red-500'">
                {{ run.success_rate }}% <span class="text-muted-foreground text-xs font-normal">rate</span>
              </td>
              <td class="py-3.5 px-2 text-muted-foreground">{{ run.duration_ms / 1000 }}s</td>
              <td class="py-3.5 pl-2 text-right text-muted-foreground">{{ formatWhen(run.executed_at) }}</td>
            </tr>
          </tbody>
          <tbody v-else>
            <tr class="border-b hover:bg-muted/40 transition-colors">
              <td class="py-3.5 pr-2">
                <p class="font-bold text-foreground">Checkout E2E Smoke</p>
                <p class="text-xs text-muted-foreground">#4821</p>
              </td>
              <td class="py-3.5 px-2">
                <span class="bg-green-500/10 text-green-600 px-2 py-0.5 rounded text-xs font-semibold">Passed</span>
              </td>
              <td class="py-3.5 px-2 text-muted-foreground">staging</td>
              <td class="py-3.5 px-2 text-muted-foreground">Chrome</td>
              <td class="py-3.5 px-2 text-green-600 font-bold">124 <span class="text-muted-foreground text-xs font-normal">/ 124</span></td>
              <td class="py-3.5 px-2 text-muted-foreground">4m 12s</td>
              <td class="py-3.5 pl-2 text-right text-muted-foreground">2 menit lalu</td>
            </tr>
            <tr class="border-b hover:bg-muted/40 transition-colors">
              <td class="py-3.5 pr-2">
                <p class="font-bold text-foreground">Auth & Session Regression</p>
                <p class="text-xs text-muted-foreground">#4820</p>
              </td>
              <td class="py-3.5 px-2">
                <span class="bg-red-500/10 text-red-500 px-2 py-0.5 rounded text-xs font-semibold">Failed</span>
              </td>
              <td class="py-3.5 px-2 text-muted-foreground">production</td>
              <td class="py-3.5 px-2 text-muted-foreground">Firefox</td>
              <td class="py-3.5 px-2 text-red-500 font-bold">81 <span class="text-muted-foreground text-xs font-normal">/ 89</span> <span class="text-xs text-red-500 font-normal"> - 8 failed</span></td>
              <td class="py-3.5 px-2 text-muted-foreground">12m 47s</td>
              <td class="py-3.5 pl-2 text-right text-muted-foreground">18 menit lalu</td>
            </tr>
            <tr class="border-b hover:bg-muted/40 transition-colors">
              <td class="py-3.5 pr-2">
                <p class="font-bold text-foreground">API Contract — Orders v2</p>
                <p class="text-xs text-muted-foreground">#4819</p>
              </td>
              <td class="py-3.5 px-2">
                <span class="bg-green-500/10 text-green-600 px-2 py-0.5 rounded text-xs font-semibold">Passed</span>
              </td>
              <td class="py-3.5 px-2 text-muted-foreground">staging</td>
              <td class="py-3.5 px-2 text-muted-foreground">API</td>
              <td class="py-3.5 px-2 text-green-600 font-bold">56 <span class="text-muted-foreground text-xs font-normal">/ 56</span></td>
              <td class="py-3.5 px-2 text-muted-foreground">1m 38s</td>
              <td class="py-3.5 pl-2 text-right text-muted-foreground">32 menit lalu</td>
            </tr>
            <tr class="border-b hover:bg-muted/40 transition-colors">
              <td class="py-3.5 pr-2">
                <p class="font-bold text-foreground">Mobile Web Checkout</p>
                <p class="text-xs text-muted-foreground">#4818</p>
              </td>
              <td class="py-3.5 px-2">
                <span class="bg-yellow-500/10 text-yellow-600 px-2 py-0.5 rounded text-xs font-semibold">Flaky</span>
              </td>
              <td class="py-3.5 px-2 text-muted-foreground">staging</td>
              <td class="py-3.5 px-2 text-muted-foreground">Safari iOS</td>
              <td class="py-3.5 px-2 text-yellow-600 font-bold">68 <span class="text-muted-foreground text-xs font-normal">/ 72</span> <span class="text-xs text-red-500 font-normal"> - 4 failed</span></td>
              <td class="py-3.5 px-2 text-muted-foreground">9m 04s</td>
              <td class="py-3.5 pl-2 text-right text-muted-foreground">1 jam lalu</td>
            </tr>
            <tr class="hover:bg-muted/40 transition-colors">
              <td class="py-3.5 pr-2">
                <p class="font-bold text-foreground">Nightly Full Regression</p>
                <p class="text-xs text-muted-foreground">#4817</p>
              </td>
              <td class="py-3.5 px-2">
                <span class="bg-green-500/10 text-green-600 px-2 py-0.5 rounded text-xs font-semibold">Passed</span>
              </td>
              <td class="py-3.5 px-2 text-muted-foreground">staging</td>
              <td class="py-3.5 px-2 text-muted-foreground">Chrome</td>
              <td class="py-3.5 px-2 text-green-600 font-bold">1789 <span class="text-muted-foreground text-xs font-normal">/ 1842</span> <span class="text-xs text-red-500 font-normal"> - 53 failed</span></td>
              <td class="py-3.5 px-2 text-muted-foreground">1h 14m</td>
              <td class="py-3.5 pl-2 text-right text-muted-foreground">6 jam lalu</td>
            </tr>
          </tbody>
        </table>
      </div>
    </Card>

    <!-- API Testing Section Header -->
    <div class="space-y-1">
      <div class="flex items-center justify-between">
        <h2 class="text-xl font-bold tracking-tight">API Testing</h2>
        <router-link to="/test-suites" class="text-xs font-semibold text-primary hover:underline flex items-center gap-0.5">
          Detail <ArrowRight :size="12" />
        </router-link>
      </div>
      <p class="text-xs text-muted-foreground">REST API, Load, Stress, dan Assertion test</p>
    </div>

    <!-- API Testing Cards (REST API, Load, Stress, Assertion) -->
    <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Card class="border bg-card/45 backdrop-blur-sm p-4 space-y-3">
        <div class="flex items-center justify-between">
          <span class="text-xs font-semibold text-foreground flex items-center gap-1.5">
            <Network :size="16" class="text-green-500" /> REST API
          </span>
          <span class="text-[10px] text-muted-foreground">Endpoint & status code</span>
        </div>
        <div class="flex items-baseline justify-between">
          <p class="text-2xl font-bold">642</p>
          <span class="text-xs text-muted-foreground">182 ms</span>
        </div>
        <div class="flex items-center justify-between text-[11px] font-medium">
          <span class="text-green-600">✔ 631 <span class="text-red-500 ml-1">✘ 11</span></span>
          <span class="text-green-600">98.3%</span>
        </div>
        <div class="w-full bg-secondary h-1.5 rounded-full overflow-hidden">
          <div class="bg-green-500 h-full rounded-full" style="width: 98.3%"></div>
        </div>
      </Card>

      <Card class="border bg-card/45 backdrop-blur-sm p-4 space-y-3">
        <div class="flex items-center justify-between">
          <span class="text-xs font-semibold text-foreground flex items-center gap-1.5">
            <Gauge :size="16" class="text-blue-500" /> Load Test
          </span>
          <span class="text-[10px] text-muted-foreground">Throughput & RPS</span>
        </div>
        <div class="flex items-baseline justify-between">
          <p class="text-2xl font-bold">18</p>
          <span class="text-xs text-muted-foreground">1.42k RPS</span>
        </div>
        <div class="flex items-center justify-between text-[11px] font-medium">
          <span class="text-green-600">✔ 17 <span class="text-red-500 ml-1">✘ 1</span></span>
          <span class="text-green-600">94.4%</span>
        </div>
        <div class="w-full bg-secondary h-1.5 rounded-full overflow-hidden">
          <div class="bg-green-500 h-full rounded-full" style="width: 94.4%"></div>
        </div>
      </Card>

      <Card class="border bg-card/45 backdrop-blur-sm p-4 space-y-3">
        <div class="flex items-center justify-between">
          <span class="text-xs font-semibold text-foreground flex items-center gap-1.5">
            <Zap :size="16" class="text-orange-500" /> Stress Test
          </span>
          <span class="text-[10px] text-muted-foreground">Breaking point</span>
        </div>
        <div class="flex items-baseline justify-between">
          <p class="text-2xl font-bold">9</p>
          <span class="text-xs text-muted-foreground">3.8k VUs</span>
        </div>
        <div class="flex items-center justify-between text-[11px] font-medium">
          <span class="text-green-600">✔ 7 <span class="text-red-500 ml-1">✘ 2</span></span>
          <span class="text-orange-500">77.8%</span>
        </div>
        <div class="w-full bg-secondary h-1.5 rounded-full overflow-hidden">
          <div class="bg-orange-500 h-full rounded-full" style="width: 77.8%"></div>
        </div>
      </Card>

      <Card class="border bg-card/45 backdrop-blur-sm p-4 space-y-3">
        <div class="flex items-center justify-between">
          <span class="text-xs font-semibold text-foreground flex items-center gap-1.5">
            <ShieldCheck :size="16" class="text-green-500" /> Assertion Test
          </span>
          <span class="text-[10px] text-muted-foreground">Schema & contract</span>
        </div>
        <div class="flex items-baseline justify-between">
          <p class="text-2xl font-bold">1,284</p>
          <span class="text-xs text-muted-foreground">99.0%</span>
        </div>
        <div class="flex items-center justify-between text-[11px] font-medium">
          <span class="text-green-600">✔ 1271 <span class="text-red-500 ml-1">✘ 13</span></span>
          <span class="text-green-600">99.0%</span>
        </div>
        <div class="w-full bg-secondary h-1.5 rounded-full overflow-hidden">
          <div class="bg-green-500 h-full rounded-full" style="width: 99.0%"></div>
        </div>
      </Card>
    </div>

    <!-- REST API Endpoints & Load & Stress Profile Grid -->
    <div class="grid gap-6 lg:grid-cols-3">
      <!-- REST API Endpoints Table -->
      <Card class="lg:col-span-2 border bg-card/45 backdrop-blur-sm p-5 space-y-4">
        <div>
          <h2 class="text-lg font-bold text-foreground">REST API Endpoints</h2>
          <p class="text-xs text-muted-foreground">Latensi & error rate (1h)</p>
        </div>
        
        <div class="overflow-x-auto">
          <table class="w-full text-left text-sm border-collapse">
            <thead>
              <tr class="border-b text-muted-foreground text-xs uppercase font-bold">
                <th class="pb-3 pr-2">Method</th>
                <th class="pb-3 px-2">Endpoint</th>
                <th class="pb-3 px-2">Status</th>
                <th class="pb-3 px-2">P50</th>
                <th class="pb-3 px-2">P95</th>
                <th class="pb-3 px-2">P99</th>
                <th class="pb-3 px-2">RPS</th>
                <th class="pb-3 pl-2 text-right">Error</th>
              </tr>
            </thead>
            <tbody>
              <tr class="border-b hover:bg-muted/40 transition-colors">
                <td class="py-3 pr-2"><span class="bg-blue-500/10 text-blue-500 px-2 py-0.5 rounded text-xs font-bold uppercase">GET</span></td>
                <td class="py-3 px-2 font-mono text-xs">/api/v2/products</td>
                <td class="py-3 px-2 text-green-600 font-bold">200</td>
                <td class="py-3 px-2 text-muted-foreground">84 ms</td>
                <td class="py-3 px-2 text-muted-foreground">142 ms</td>
                <td class="py-3 px-2 text-muted-foreground">218 ms</td>
                <td class="py-3 px-2 font-semibold">482</td>
                <td class="py-3 pl-2 text-right text-green-600 font-semibold">0.1%</td>
              </tr>
              <tr class="border-b hover:bg-muted/40 transition-colors">
                <td class="py-3 pr-2"><span class="bg-green-500/10 text-green-600 px-2 py-0.5 rounded text-xs font-bold uppercase">POST</span></td>
                <td class="py-3 px-2 font-mono text-xs">/api/v2/checkout</td>
                <td class="py-3 px-2 text-green-600 font-bold">201</td>
                <td class="py-3 px-2 text-muted-foreground">312 ms</td>
                <td class="py-3 px-2 text-muted-foreground">684 ms</td>
                <td class="py-3 px-2 text-muted-foreground">1180 ms</td>
                <td class="py-3 px-2 font-semibold">96</td>
                <td class="py-3 pl-2 text-right text-red-500 font-semibold">1.8%</td>
              </tr>
              <tr class="border-b hover:bg-muted/40 transition-colors">
                <td class="py-3 pr-2"><span class="bg-blue-500/10 text-blue-500 px-2 py-0.5 rounded text-xs font-bold uppercase">GET</span></td>
                <td class="py-3 px-2 font-mono text-xs">/api/v2/orders/:id</td>
                <td class="py-3 px-2 text-green-600 font-bold">200</td>
                <td class="py-3 px-2 text-muted-foreground">62 ms</td>
                <td class="py-3 px-2 text-muted-foreground">118 ms</td>
                <td class="py-3 px-2 text-muted-foreground">196 ms</td>
                <td class="py-3 px-2 font-semibold">318</td>
                <td class="py-3 pl-2 text-right text-green-600 font-semibold">0.3%</td>
              </tr>
              <tr class="border-b hover:bg-muted/40 transition-colors">
                <td class="py-3 pr-2"><span class="bg-green-500/10 text-green-600 px-2 py-0.5 rounded text-xs font-bold uppercase">POST</span></td>
                <td class="py-3 px-2 font-mono text-xs">/api/v2/auth/login</td>
                <td class="py-3 px-2 text-green-600 font-bold">200</td>
                <td class="py-3 px-2 text-muted-foreground">148 ms</td>
                <td class="py-3 px-2 text-muted-foreground">286 ms</td>
                <td class="py-3 px-2 text-muted-foreground">512 ms</td>
                <td class="py-3 px-2 font-semibold">142</td>
                <td class="py-3 pl-2 text-right text-green-600 font-semibold">0.6%</td>
              </tr>
              <tr class="hover:bg-muted/40 transition-colors">
                <td class="py-3 pr-2"><span class="bg-orange-500/10 text-orange-500 px-2 py-0.5 rounded text-xs font-bold uppercase">PATCH</span></td>
                <td class="py-3 px-2 font-mono text-xs">/api/v2/cart/items</td>
                <td class="py-3 px-2 text-red-500 font-bold">500</td>
                <td class="py-3 px-2 text-muted-foreground">92 ms</td>
                <td class="py-3 px-2 text-muted-foreground">178 ms</td>
                <td class="py-3 px-2 text-muted-foreground">342 ms</td>
                <td class="py-3 px-2 font-semibold">64</td>
                <td class="py-3 pl-2 text-right text-red-500 font-semibold">4.2%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>

      <!-- Load & Stress Profile Chart -->
      <Card class="border bg-card/45 backdrop-blur-sm p-5 space-y-4">
        <div>
          <h2 class="text-lg font-bold text-foreground">Load & Stress Profile</h2>
          <p class="text-xs text-muted-foreground">Response time vs Virtual Users</p>
        </div>
        <div class="h-44 relative">
          <Line :data="loadStressData" :options="loadStressOptions" />
          <!-- Vertical Dotted Line representing breaking point -->
          <div class="absolute top-0 bottom-6 right-6 border-r border-dashed border-red-500 flex flex-col items-center">
            <span class="bg-red-500 text-white text-[9px] px-1 rounded absolute -top-1 right-1 font-semibold whitespace-nowrap">breaking point</span>
          </div>
        </div>
        <div class="grid grid-cols-3 gap-2 text-center pt-2">
          <div class="p-2 border rounded-lg bg-card/20">
            <p class="text-[10px] text-muted-foreground uppercase font-bold">Peak VUs</p>
            <p class="text-sm font-bold">3,800</p>
          </div>
          <div class="p-2 border rounded-lg bg-card/20">
            <p class="text-[10px] text-muted-foreground uppercase font-bold">Max RPS</p>
            <p class="text-sm font-bold">1,420</p>
          </div>
          <div class="p-2 border rounded-lg bg-card/20">
            <p class="text-[10px] text-muted-foreground uppercase font-bold text-red-500">Err Rate</p>
            <p class="text-sm font-bold text-red-500">2.4%</p>
          </div>
        </div>
      </Card>
    </div>

    <!-- Assertion Results Section -->
    <Card class="border bg-card/45 backdrop-blur-sm p-5 space-y-4">
      <div>
        <h2 class="text-lg font-bold text-foreground">Assertion Results</h2>
        <p class="text-xs text-muted-foreground">Total 7,702 assertion · 24 jam</p>
      </div>

      <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <div class="border p-4 rounded-xl space-y-2 bg-card/20">
          <span class="text-xs font-semibold text-muted-foreground">Status code</span>
          <p class="text-2xl font-bold">99.7%</p>
          <div class="w-full bg-secondary h-1.5 rounded-full overflow-hidden">
            <div class="bg-green-500 h-full" style="width: 99.7%"></div>
          </div>
          <p class="text-[10px] text-muted-foreground"><span class="text-green-600 font-semibold">1842</span> · <span class="text-red-500">6 failed</span></p>
        </div>

        <div class="border p-4 rounded-xl space-y-2 bg-card/20">
          <span class="text-xs font-semibold text-muted-foreground">Response schema (JSON)</span>
          <p class="text-2xl font-bold">98.8%</p>
          <div class="w-full bg-secondary h-1.5 rounded-full overflow-hidden">
            <div class="bg-green-500 h-full" style="width: 98.8%"></div>
          </div>
          <p class="text-[10px] text-muted-foreground"><span class="text-green-600 font-semibold">1521</span> · <span class="text-red-500">18 failed</span></p>
        </div>

        <div class="border p-4 rounded-xl space-y-2 bg-card/20">
          <span class="text-xs font-semibold text-muted-foreground">Header & content-type</span>
          <p class="text-2xl font-bold">99.8%</p>
          <div class="w-full bg-secondary h-1.5 rounded-full overflow-hidden">
            <div class="bg-green-500 h-full" style="width: 99.8%"></div>
          </div>
          <p class="text-[10px] text-muted-foreground"><span class="text-green-600 font-semibold">1648</span> · <span class="text-red-500">4 failed</span></p>
        </div>

        <div class="border p-4 rounded-xl space-y-2 bg-card/20">
          <span class="text-xs font-semibold text-muted-foreground">Response time SLA</span>
          <p class="text-2xl font-bold">97.2%</p>
          <div class="w-full bg-secondary h-1.5 rounded-full overflow-hidden">
            <div class="bg-orange-500 h-full" style="width: 97.2%"></div>
          </div>
          <p class="text-[10px] text-muted-foreground"><span class="text-green-600 font-semibold">1402</span> · <span class="text-red-500">41 failed</span></p>
        </div>

        <div class="border p-4 rounded-xl space-y-2 bg-card/20">
          <span class="text-xs font-semibold text-muted-foreground">Business logic / data</span>
          <p class="text-2xl font-bold">98.2%</p>
          <div class="w-full bg-secondary h-1.5 rounded-full overflow-hidden">
            <div class="bg-green-500 h-full" style="width: 98.2%"></div>
          </div>
          <p class="text-[10px] text-muted-foreground"><span class="text-green-600 font-semibold">1198</span> · <span class="text-red-500">22 failed</span></p>
        </div>
      </div>
    </Card>

    <!-- UI Testing Section Header -->
    <div class="space-y-1">
      <div class="flex items-center justify-between">
        <h2 class="text-xl font-bold tracking-tight">UI Testing</h2>
        <router-link to="/ui-testing" class="text-xs font-semibold text-primary hover:underline flex items-center gap-0.5">
          Detail <ArrowRight :size="12" />
        </router-link>
      </div>
      <p class="text-xs text-muted-foreground">End-to-end browser & device automation</p>
    </div>

    <!-- UI Testing Cards (Visual Diff, LCP, Accessibility, Broken Selectors) -->
    <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Card class="border bg-card/45 backdrop-blur-sm p-4 space-y-2">
        <span class="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">Visual diff baseline</span>
        <div class="flex items-baseline justify-between">
          <p class="text-2xl font-bold">98.4%</p>
          <span class="text-xs text-muted-foreground">1,284 snapshots</span>
        </div>
        <div class="w-full bg-secondary h-1 rounded-full overflow-hidden">
          <div class="bg-green-500 h-full" style="width: 98.4%"></div>
        </div>
      </Card>

      <Card class="border bg-card/45 backdrop-blur-sm p-4 space-y-2">
        <span class="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">Avg LCP</span>
        <div class="flex items-baseline justify-between">
          <p class="text-2xl font-bold">1.8s</p>
          <span class="text-xs text-muted-foreground">Largest Contentful Paint</span>
        </div>
        <div class="w-full bg-secondary h-1 rounded-full overflow-hidden">
          <div class="bg-green-500 h-full" style="width: 90%"></div>
        </div>
      </Card>

      <Card class="border bg-card/45 backdrop-blur-sm p-4 space-y-2">
        <span class="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">Accessibility (axe)</span>
        <div class="flex items-baseline justify-between">
          <p class="text-2xl font-bold">92</p>
          <span class="text-xs text-muted-foreground">Lighthouse score</span>
        </div>
        <div class="w-full bg-secondary h-1 rounded-full overflow-hidden">
          <div class="bg-green-500 h-full" style="width: 92%"></div>
        </div>
      </Card>

      <Card class="border bg-card/45 backdrop-blur-sm p-4 space-y-2">
        <span class="text-xs font-semibold text-muted-foreground uppercase tracking-wider block text-red-500">Broken selectors</span>
        <div class="flex items-baseline justify-between">
          <p class="text-2xl font-bold text-red-500">7</p>
          <span class="text-xs text-muted-foreground">24 jam terakhir</span>
        </div>
        <div class="w-full bg-secondary h-1 rounded-full overflow-hidden">
          <div class="bg-red-500 h-full" style="width: 70%"></div>
        </div>
      </Card>
    </div>

    <!-- UI Test Scenarios Table -->
    <Card class="border bg-card/45 backdrop-blur-sm p-5 space-y-4">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-lg font-bold text-foreground">UI Test Scenarios</h2>
          <p class="text-xs text-muted-foreground">Last run · 24 jam</p>
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-left text-sm border-collapse">
          <thead>
            <tr class="border-b text-muted-foreground text-xs uppercase font-bold">
              <th class="pb-3 pr-2">Scenario</th>
              <th class="pb-3 px-2">Browser</th>
              <th class="pb-3 px-2">Device</th>
              <th class="pb-3 px-2">Steps</th>
              <th class="pb-3 px-2">Duration</th>
              <th class="pb-3 pl-2 text-right">Status</th>
            </tr>
          </thead>
          <tbody>
            <tr class="border-b hover:bg-muted/40 transition-colors">
              <td class="py-3.5 pr-2 font-bold text-foreground">Login & SSO flow</td>
              <td class="py-3.5 px-2 text-muted-foreground">Chrome</td>
              <td class="py-3.5 px-2 text-muted-foreground">Desktop</td>
              <td class="py-3.5 px-2 font-semibold">14</td>
              <td class="py-3.5 px-2 text-muted-foreground">1m 28s</td>
              <td class="py-3.5 pl-2 text-right">
                <span class="bg-green-500/10 text-green-600 px-2 py-0.5 rounded text-xs font-semibold">Passed</span>
              </td>
            </tr>
            <tr class="border-b hover:bg-muted/40 transition-colors">
              <td class="py-3.5 pr-2 font-bold text-foreground">Checkout — Guest</td>
              <td class="py-3.5 px-2 text-muted-foreground">Firefox</td>
              <td class="py-3.5 px-2 text-muted-foreground">Desktop</td>
              <td class="py-3.5 px-2 font-semibold">22</td>
              <td class="py-3.5 px-2 text-muted-foreground">3m 04s</td>
              <td class="py-3.5 pl-2 text-right">
                <span class="bg-red-500/10 text-red-500 px-2 py-0.5 rounded text-xs font-semibold">Failed</span>
              </td>
            </tr>
            <tr class="border-b hover:bg-muted/40 transition-colors">
              <td class="py-3.5 pr-2 font-bold text-foreground">Product search & filter</td>
              <td class="py-3.5 px-2 text-muted-foreground">Safari</td>
              <td class="py-3.5 px-2 text-muted-foreground">Desktop</td>
              <td class="py-3.5 px-2 font-semibold">18</td>
              <td class="py-3.5 px-2 text-muted-foreground">2m 11s</td>
              <td class="py-3.5 pl-2 text-right">
                <span class="bg-green-500/10 text-green-600 px-2 py-0.5 rounded text-xs font-semibold">Passed</span>
              </td>
            </tr>
            <tr class="border-b hover:bg-muted/40 transition-colors">
              <td class="py-3.5 pr-2 font-bold text-foreground">Add to cart (mobile)</td>
              <td class="py-3.5 px-2 text-muted-foreground">Safari iOS</td>
              <td class="py-3.5 px-2 text-muted-foreground">Mobile</td>
              <td class="py-3.5 px-2 font-semibold">12</td>
              <td class="py-3.5 px-2 text-muted-foreground">1m 56s</td>
              <td class="py-3.5 pl-2 text-right">
                <span class="bg-yellow-500/10 text-yellow-600 px-2 py-0.5 rounded text-xs font-semibold">Flaky</span>
              </td>
            </tr>
            <tr class="hover:bg-muted/40 transition-colors">
              <td class="py-3.5 pr-2 font-bold text-foreground">Profile avatar upload</td>
              <td class="py-3.5 px-2 text-muted-foreground">Chrome</td>
              <td class="py-3.5 px-2 text-muted-foreground">Desktop</td>
              <td class="py-3.5 px-2 font-semibold">8</td>
              <td class="py-3.5 px-2 text-muted-foreground">0m 48s</td>
              <td class="py-3.5 pl-2 text-right">
                <span class="bg-green-500/10 text-green-600 px-2 py-0.5 rounded text-xs font-semibold">Passed</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </Card>

    <!-- Bottom Tri-Column Grid (Flaky Tests, CI/CD, Target) -->
    <div class="grid gap-6 lg:grid-cols-3">
      <!-- Top Flaky Tests -->
      <Card class="border bg-card/45 backdrop-blur-sm p-5 space-y-4">
        <div class="flex items-center gap-1.5">
          <AlertTriangle :size="18" class="text-orange-500" />
          <h2 class="text-sm font-bold text-foreground uppercase tracking-wider">Top Flaky Tests</h2>
        </div>
        <div class="space-y-4 pt-2">
          <div class="space-y-1.5">
            <div class="flex justify-between text-xs">
              <span class="font-mono text-muted-foreground truncate max-w-[200px]">checkout.spec.ts &gt; applies coupon</span>
              <span class="text-muted-foreground font-semibold">24 runs <span class="text-orange-500 ml-1">38%</span></span>
            </div>
            <div class="w-full bg-secondary h-2 rounded-full overflow-hidden">
              <div class="bg-orange-500 h-full" style="width: 38%"></div>
            </div>
          </div>

          <div class="space-y-1.5">
            <div class="flex justify-between text-xs">
              <span class="font-mono text-muted-foreground truncate max-w-[200px]">auth.spec.ts &gt; refresh token expiry</span>
              <span class="text-muted-foreground font-semibold">31 runs <span class="text-orange-500 ml-1">27%</span></span>
            </div>
            <div class="w-full bg-secondary h-2 rounded-full overflow-hidden">
              <div class="bg-orange-500 h-full" style="width: 27%"></div>
            </div>
          </div>

          <div class="space-y-1.5">
            <div class="flex justify-between text-xs">
              <span class="font-mono text-muted-foreground truncate max-w-[200px]">search.spec.ts &gt; autocomplete latency</span>
              <span class="text-muted-foreground font-semibold">42 runs <span class="text-orange-500 ml-1">19%</span></span>
            </div>
            <div class="w-full bg-secondary h-2 rounded-full overflow-hidden">
              <div class="bg-orange-500 h-full" style="width: 19%"></div>
            </div>
          </div>

          <div class="space-y-1.5">
            <div class="flex justify-between text-xs">
              <span class="font-mono text-muted-foreground truncate max-w-[200px]">profile.spec.ts &gt; avatar upload</span>
              <span class="text-muted-foreground font-semibold">18 runs <span class="text-orange-500 ml-1">12%</span></span>
            </div>
            <div class="w-full bg-secondary h-2 rounded-full overflow-hidden">
              <div class="bg-orange-500 h-full" style="width: 12%"></div>
            </div>
          </div>
        </div>
      </Card>

      <!-- CI/CD Pipelines -->
      <Card class="border bg-card/45 backdrop-blur-sm p-5 space-y-4">
        <div class="flex items-center gap-1.5">
          <Network :size="18" class="text-green-500" />
          <h2 class="text-sm font-bold text-foreground uppercase tracking-wider">CI/CD Pipelines</h2>
        </div>
        <div class="space-y-4 pt-2">
          <!-- Main nightly -->
          <div class="space-y-1.5">
            <div class="flex items-center justify-between text-xs">
              <div>
                <p class="font-bold text-foreground">main · nightly-e2e</p>
                <p class="text-[10px] text-muted-foreground">branch · main</p>
              </div>
              <span class="bg-blue-500/10 text-blue-500 px-2 py-0.5 rounded text-[10px] font-bold">RUNNING</span>
            </div>
            <div class="w-full bg-secondary h-1.5 rounded-full overflow-hidden">
              <div class="bg-blue-500 h-full animate-pulse" style="width: 65%"></div>
            </div>
          </div>

          <!-- Release 2.18 -->
          <div class="space-y-1.5">
            <div class="flex items-center justify-between text-xs">
              <div>
                <p class="font-bold text-foreground">release/2.18 · smoke</p>
                <p class="text-[10px] text-muted-foreground">branch · release/2.18</p>
              </div>
              <span class="bg-green-500/10 text-green-600 px-2 py-0.5 rounded text-[10px] font-bold">PASSED</span>
            </div>
            <div class="w-full bg-secondary h-1.5 rounded-full overflow-hidden">
              <div class="bg-green-500 h-full" style="width: 100%"></div>
            </div>
          </div>

          <!-- Feature cart pr-check -->
          <div class="space-y-1.5">
            <div class="flex items-center justify-between text-xs">
              <div>
                <p class="font-bold text-foreground">feature/cart-v3 · pr-check</p>
                <p class="text-[10px] text-muted-foreground">branch · feature/cart-v3</p>
              </div>
              <span class="bg-red-500/10 text-red-500 px-2 py-0.5 rounded text-[10px] font-bold">FAILED</span>
            </div>
            <div class="w-full bg-secondary h-1.5 rounded-full overflow-hidden">
              <div class="bg-red-500 h-full" style="width: 100%"></div>
            </div>
          </div>
        </div>
      </Card>

      <!-- Execution by Target -->
      <Card class="border bg-card/45 backdrop-blur-sm p-5 space-y-4">
        <div class="flex items-center gap-1.5">
          <Cpu :size="18" class="text-blue-500" />
          <h2 class="text-sm font-bold text-foreground uppercase tracking-wider">Execution by Target</h2>
        </div>
        <div class="space-y-3.5 pt-2">
          <!-- Chrome -->
          <div class="space-y-1.5">
            <div class="flex justify-between text-xs">
              <span class="text-muted-foreground font-medium flex items-center gap-1"><Cpu :size="12" /> Chrome</span>
              <span class="text-muted-foreground font-semibold">1,284 runs <span class="text-foreground ml-1">95%</span></span>
            </div>
            <div class="w-full bg-secondary h-1.5 rounded-full overflow-hidden">
              <div class="bg-green-500 h-full" style="width: 95%"></div>
            </div>
          </div>

          <!-- Firefox -->
          <div class="space-y-1.5">
            <div class="flex justify-between text-xs">
              <span class="text-muted-foreground font-medium flex items-center gap-1"><Cpu :size="12" /> Firefox</span>
              <span class="text-muted-foreground font-semibold">624 runs <span class="text-foreground ml-1">92%</span></span>
            </div>
            <div class="w-full bg-secondary h-1.5 rounded-full overflow-hidden">
              <div class="bg-green-500 h-full" style="width: 92%"></div>
            </div>
          </div>

          <!-- Safari -->
          <div class="space-y-1.5">
            <div class="flex justify-between text-xs">
              <span class="text-muted-foreground font-medium flex items-center gap-1"><Cpu :size="12" /> Safari</span>
              <span class="text-muted-foreground font-semibold">412 runs <span class="text-foreground ml-1">89%</span></span>
            </div>
            <div class="w-full bg-secondary h-1.5 rounded-full overflow-hidden">
              <div class="bg-green-500 h-full" style="width: 89%"></div>
            </div>
          </div>

          <!-- Mobile Web -->
          <div class="space-y-1.5">
            <div class="flex justify-between text-xs">
              <span class="text-muted-foreground font-medium flex items-center gap-1"><Cpu :size="12" /> Mobile Web</span>
              <span class="text-muted-foreground font-semibold">318 runs <span class="text-foreground ml-1">87%</span></span>
            </div>
            <div class="w-full bg-secondary h-1.5 rounded-full overflow-hidden">
              <div class="bg-green-500 h-full" style="width: 87%"></div>
            </div>
          </div>

          <!-- API -->
          <div class="space-y-1.5">
            <div class="flex justify-between text-xs">
              <span class="text-muted-foreground font-medium flex items-center gap-1"><Cpu :size="12" /> API</span>
              <span class="text-muted-foreground font-semibold">942 runs <span class="text-foreground ml-1">98%</span></span>
            </div>
            <div class="w-full bg-secondary h-1.5 rounded-full overflow-hidden">
              <div class="bg-green-500 h-full" style="width: 98%"></div>
            </div>
          </div>
        </div>
      </Card>
    </div>

  </div>
</template>
