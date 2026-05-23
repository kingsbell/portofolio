<script setup>
import { ref, computed } from 'vue'
import Card from '@/components/ui/Card.vue'
import { Line } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'
import {
  Play,
  StopCircle,
  Network,
  Gauge,
  Zap,
  Terminal,
  Layers,
  Database,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
} from 'lucide-vue-next'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

// Active Test Scenario Tab
const activeTab = ref('rest_api') // 'functional', 'load', 'stress'

// Load Scenario parameters
const duration = ref(30) // seconds
const targetVUs = ref(50) // Virtual Users

// Runner State
const isRunning = ref(false)
const progress = ref(0)
const logs = ref([])
const showReport = ref(false)

// Chart configuration
const chartData = ref({
  labels: ['0s', '5s', '10s', '15s', '20s', '25s', '30s'],
  datasets: [
    {
      label: 'Virtual Users (VUs)',
      data: [0, 15, 35, 50, 50, 50, 0],
      borderColor: 'rgb(34, 197, 94)',
      backgroundColor: 'rgba(34, 197, 94, 0.05)',
      yAxisID: 'y',
      tension: 0.3,
      fill: true
    },
    {
      label: 'Response Time (ms)',
      data: [120, 135, 142, 168, 172, 165, 130],
      borderColor: 'rgb(59, 130, 246)',
      backgroundColor: 'transparent',
      yAxisID: 'y1',
      tension: 0.3,
      borderDash: [5, 5]
    }
  ]
})

const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    y: {
      type: 'linear',
      display: true,
      position: 'left',
      title: { display: true, text: 'VUs' },
      grid: { color: 'rgba(0,0,0,0.05)' }
    },
    y1: {
      type: 'linear',
      display: true,
      position: 'right',
      title: { display: true, text: 'Latency (ms)' },
      grid: { drawOnChartArea: false }
    }
  }
}))

// Simulation Logger
const runK6Simulation = () => {
  isRunning.value = true
  showReport.value = false
  progress.value = 0
  logs.value = []
  
  const logMessages = [
    `[k6] Memulai inisialisasi modul k6...`,
    `[k6] Menghubungkan target: ${httpMethod.value} ${targetUrl.value}`,
    `[k6] Mengonfigurasi skenario pengujian: Mode ${activeTab.value.toUpperCase()}`,
    `[k6] Meluncurkan ${activeTab.value === 'functional' ? 1 : targetVUs.value} Virtual Users (VUs)...`,
    `[k6] [0s] Sesi pemanasan (Ramp-up) dimulai...`,
    `[k6] [5s] 15 VUs aktif - Rata-rata Latensi: 135ms - RPS: 240`,
    `[k6] [10s] 35 VUs aktif - Rata-rata Latensi: 142ms - RPS: 480`,
    `[k6] [15s] Keadaan mantap (Steady-state) dicapai dengan ${targetVUs.value} VUs aktif...`,
    `[k6] [20s] Menguji ketahanan - Rata-rata Latensi: 172ms - RPS: 850`,
    `[k6] [25s] Uji coba asersi fungsional berhasil (Status code & JSON Schema: 100% OK)`,
    `[k6] [30s] Sesi pendinginan (Ramp-down) selesai.`,
    `[k6] Menghitung metrik final...`,
    `[k6] Menghasilkan laporan JSON laporan pemantauan...`,
    `[k6] Simulasi selesai. Hasil disimpan ke database.`
  ]

  let i = 0
  const interval = setInterval(() => {
    if (i < logMessages.length) {
      logs.value.push({
        timestamp: new Date().toLocaleTimeString(),
        text: logMessages[i]
      })
      progress.value = Math.min(Math.round(((i + 1) / logMessages.length) * 100), 100)
      i++
    } else {
      clearInterval(interval)
      isRunning.value = false
      showReport.value = true
    }
  }, 800)
}

const stopSimulation = () => {
  isRunning.value = false
  logs.value.push({
    timestamp: new Date().toLocaleTimeString(),
    text: `[k6] [WARNING] Simulasi dihentikan paksa oleh pengguna.`
  })
}
</script>

<template>
  <div class="space-y-8">
    
    <!-- Title Header -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl md:text-3xl font-bold tracking-tight flex items-center gap-2">
          <Network class="text-green-500" /> API Performance Testing (k6)
        </h1>
        <p class="text-sm text-muted-foreground mt-1">
          Konfigurasi skenario HTTP, jalankan simulasi beban virtual, dan pantau stabilitas API secara real-time menggunakan mesin k6.
        </p>
      </div>
    </div>

    <!-- Mode Selector Cards -->
    <div class="grid gap-6 md:grid-cols-2">
<button 
        @click="activeTab = 'rest_api'" 
        class="text-left border p-5 rounded-xl transition-all"
        :class="activeTab === 'rest_api' ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'bg-card/45 hover:border-muted-foreground/30'"
      >
        <div class="flex items-center justify-between mb-3">
          <span class="p-2 rounded-lg bg-green-500/10 text-green-600">
            <CheckCircle :size="20" />
          </span>
          <span class="text-[10px] uppercase font-bold text-muted-foreground">Rest API</span>
        </div>
        <h3 class="font-bold text-foreground">Rest API Testing</h3>
        <p class="text-xs text-muted-foreground mt-1">Validasi endpoint REST API untuk memastikan respons yang benar dengan status 200 OK dan payload JSON yang valid.</p>
      </button>

      <button 
        @click="activeTab = 'functional'" 
        class="text-left border p-5 rounded-xl transition-all"
        :class="activeTab === 'functional' ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'bg-card/45 hover:border-muted-foreground/30'"
      >
        <div class="flex items-center justify-between mb-3">
          <span class="p-2 rounded-lg bg-green-500/10 text-green-600">
            <CheckCircle :size="20" />
          </span>
          <span class="text-[10px] uppercase font-bold text-muted-foreground">Functional</span>
        </div>
        <h3 class="font-bold text-foreground">API Assertions</h3>
        <p class="text-xs text-muted-foreground mt-1">Validasi status kode, header, integritas skema JSON, dan response body secara berkala.</p>
      </button>

      <button 
        @click="activeTab = 'load'" 
        class="text-left border p-5 rounded-xl transition-all"
        :class="activeTab === 'load' ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'bg-card/45 hover:border-muted-foreground/30'"
      >
        <div class="flex items-center justify-between mb-3">
          <span class="p-2 rounded-lg bg-blue-500/10 text-blue-600">
            <Gauge :size="20" />
          </span>
          <span class="text-[10px] uppercase font-bold text-muted-foreground">Load Test</span>
        </div>
        <h3 class="font-bold text-foreground">Performance Load</h3>
        <p class="text-xs text-muted-foreground mt-1">Simulasikan puluhan pengguna virtual untuk mengukur response time rata-rata di bawah beban normal.</p>
      </button>

      <button 
        @click="activeTab = 'stress'" 
        class="text-left border p-5 rounded-xl transition-all"
        :class="activeTab === 'stress' ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'bg-card/45 hover:border-muted-foreground/30'"
      >
        <div class="flex items-center justify-between mb-3">
          <span class="p-2 rounded-lg bg-orange-500/10 text-orange-600">
            <Zap :size="20" />
          </span>
          <span class="text-[10px] uppercase font-bold text-muted-foreground">Stress Test</span>
        </div>
        <h3 class="font-bold text-foreground">Stress/Limit Testing</h3>
        <p class="text-xs text-muted-foreground mt-1">Dorong beban RPS setinggi mungkin untuk mendeteksi kapasitas maksimal dan titik pecah (*breaking point*).</p>
      </button>
    </div>

    <!-- Main Configuration Panel & Logs -->
    <div class="grid gap-6 lg:grid-cols-3">
      <!-- HTTP Request Builder -->
      <Card class="lg:col-span-2 border bg-card/45 backdrop-blur-sm p-6 space-y-6">
        <h2 class="text-lg font-bold text-foreground border-b pb-2 flex items-center gap-1.5">
          <Layers :size="18" class="text-primary" /> HTTP Configuration
        </h2>

        <!-- Run / Action Buttons -->
        <div class="flex gap-3 justify-end border-t pt-4">
          <button 
            v-if="isRunning" 
            @click="stopSimulation" 
            class="bg-red-500 text-white px-5 py-2.5 rounded-lg font-semibold text-sm hover:bg-red-600 transition-all flex items-center gap-1.5"
          >
            <StopCircle :size="16" /> Stop Simulation
          </button>
          <button 
            v-else 
            @click="runK6Simulation" 
            class="bg-primary text-primary-foreground px-6 py-2.5 rounded-lg font-semibold text-sm hover:bg-primary/95 transition-all flex items-center gap-1.5 shadow-md"
          >
            <Play :size="14" class="fill-current" /> Run k6 Simulation
          </button>
        </div>
      </Card>

      <!-- Terminal Logs -->
      <Card class="border bg-card/45 backdrop-blur-sm p-5 flex flex-col h-full space-y-4">
        <h2 class="text-lg font-bold text-foreground border-b pb-2 flex items-center gap-1.5">
          <Terminal :size="18" class="text-primary" /> Simulation Logs
        </h2>
        
        <!-- Progress Bar -->
        <div v-if="isRunning" class="space-y-1.5">
          <div class="flex justify-between text-xs font-semibold">
            <span class="text-primary">Running simulation...</span>
            <span>{{ progress }}%</span>
          </div>
          <div class="w-full bg-secondary h-2 rounded-full overflow-hidden">
            <div class="bg-primary h-full rounded-full transition-all duration-300" :style="{ width: `${progress}%` }"></div>
          </div>
        </div>

        <!-- Log window -->
        <div class="flex-1 bg-black/90 text-green-400 font-mono text-xs p-4 rounded-xl overflow-y-auto h-72 lg:h-[320px] space-y-2 select-text custom-scrollbar">
          <div v-for="(log, index) in logs" :key="index" class="leading-relaxed">
            <span class="text-muted-foreground mr-1">[{{ log.timestamp }}]</span> {{ log.text }}
          </div>
          <div v-if="logs.length === 0" class="text-muted-foreground text-center py-20">
            System idle. Silakan klik tombol "Run Simulation" untuk memulai pengujian.
          </div>
        </div>
      </Card>
    </div>

    <!-- Final Analytics Report Card -->
    <transition
      enter-active-class="transition ease-out duration-300 transform"
      enter-from-class="opacity-0 translate-y-4"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition ease-in duration-200 transform"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 translate-y-4"
    >
      <div v-if="showReport" class="space-y-6">
        <h2 class="text-xl font-bold text-foreground flex items-center gap-1.5">
          <Database :size="20" class="text-green-500" /> Simulation Metrics Report
        </h2>

        <!-- Metric Cards -->
        <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card class="border bg-card/45 backdrop-blur-sm p-5 space-y-1">
            <span class="text-xs font-semibold text-muted-foreground uppercase">Rata-rata Latensi</span>
            <p class="text-2xl font-bold text-foreground">152 ms</p>
            <p class="text-[10px] text-green-600 font-medium flex items-center gap-0.5">
              <TrendingUp :size="12" /> p(95) = 286ms
            </p>
          </Card>

          <Card class="border bg-card/45 backdrop-blur-sm p-5 space-y-1">
            <span class="text-xs font-semibold text-muted-foreground uppercase">Throughput</span>
            <p class="text-2xl font-bold text-foreground">850 RPS</p>
            <p class="text-[10px] text-muted-foreground">Rata-rata requests per detik</p>
          </Card>

          <Card class="border bg-card/45 backdrop-blur-sm p-5 space-y-1">
            <span class="text-xs font-semibold text-muted-foreground uppercase">Total HTTP Request</span>
            <p class="text-2xl font-bold text-foreground">25,480</p>
            <p class="text-[10px] text-green-600 font-medium">✔ 25429 <span class="text-red-500 ml-1">✘ 51</span></p>
          </Card>

          <Card class="border bg-card/45 backdrop-blur-sm p-5 space-y-1">
            <span class="text-xs font-semibold text-muted-foreground uppercase">Success Rate</span>
            <p class="text-2xl font-bold text-green-500">99.8%</p>
            <p class="text-[10px] text-muted-foreground">Tingkat kegagalan &lt; 0.2%</p>
          </Card>
        </div>

        <!-- Graph of simulation timeline -->
        <Card class="border bg-card/45 backdrop-blur-sm p-6 space-y-4">
          <div>
            <h3 class="text-lg font-bold text-foreground">Simulation Analytics Timeline</h3>
            <p class="text-xs text-muted-foreground">Grafik tingkat VUs terhadap Latensi (ms) selama sesi pengujian.</p>
          </div>
          <div class="h-64">
            <Line :data="chartData" :options="chartOptions" />
          </div>
        </Card>

        <!-- Dynamic Assertion Summary -->
        <Card class="border bg-card/45 backdrop-blur-sm p-5 space-y-4">
          <div>
            <h3 class="text-lg font-bold text-foreground">Assertion Summary Report</h3>
            <p class="text-xs text-muted-foreground">Hasil pemenuhan kriteria threshold k6.</p>
          </div>
          <div class="space-y-3.5">
            <div class="flex items-center justify-between p-3 rounded-lg border bg-green-500/5 border-green-500/20 text-xs">
              <span class="font-semibold text-green-600 flex items-center gap-1.5">
                <CheckCircle :size="16" /> http_req_failed &lt; 1%
              </span>
              <span class="text-muted-foreground font-bold">Passed (Rate: 0.2%)</span>
            </div>

            <div class="flex items-center justify-between p-3 rounded-lg border bg-green-500/5 border-green-500/20 text-xs">
              <span class="font-semibold text-green-600 flex items-center gap-1.5">
                <CheckCircle :size="16" /> http_req_duration p(95) &lt; 500ms
              </span>
              <span class="text-muted-foreground font-bold">Passed (Actual: 286ms)</span>
            </div>

            <div class="flex items-center justify-between p-3 rounded-lg border bg-red-500/5 border-red-500/20 text-xs" v-if="activeTab === 'stress'">
              <span class="font-semibold text-red-500 flex items-center gap-1.5">
                <AlertTriangle :size="16" /> CPU utilization &lt; 80%
              </span>
              <span class="text-red-500 font-bold">Failed (Peak: 89.2% on stress peak VUs)</span>
            </div>
          </div>
        </Card>
      </div>
    </transition>

  </div>
</template>
