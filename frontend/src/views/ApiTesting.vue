<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import Card from '@/components/ui/Card.vue'
import CardContent from '@/components/ui/CardContent.vue'
import Button from '@/components/ui/Button.vue'
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
  Loader2,
  Trash2,
  Calendar,
  X,
  FileCode,
  Globe,
  Settings,
  ChevronDown,
  ChevronUp
} from 'lucide-vue-next'
import { api } from '@/lib/api'

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

const route = useRoute()
const suiteId = route.params.id

// Data State
const suite = ref(null)
const endpoints = ref([])
const runs = ref([])
const activeSubTab = ref('endpoints')

// Loading States
const suiteLoading = ref(true)
const endpointsLoading = ref(true)
const runsLoading = ref(true)

// Runner State
const testType = ref('functional')
const vus = ref(10)
const duration = ref(10)
const isRunning = ref(false)
const progress = ref(0)
const logs = ref('System idle. Silakan klik tombol "Jalankan Uji Coba k6" di samping.')
const currentRunResult = ref(null)
const showReport = ref(false)

// UI State
const expandedEndpointId = ref(null)
const selectedRunLog = ref(null)
const showLogModal = ref(false)

// Fetch Data
const fetchSuiteDetail = async () => {
  suiteLoading.value = true
  try {
    suite.value = await api.getSuite(suiteId)
  } catch (error) {
    console.error('Failed to fetch suite:', error)
  } finally {
    suiteLoading.value = false
  }
}

const fetchEndpoints = async () => {
  endpointsLoading.value = true
  try {
    endpoints.value = await api.getSuiteEndpoints(suiteId)
  } catch (error) {
    console.error('Failed to fetch endpoints:', error)
  } finally {
    endpointsLoading.value = false
  }
}

const fetchRuns = async () => {
  runsLoading.value = true
  try {
    runs.value = await api.getSuiteRuns(suiteId)
  } catch (error) {
    console.error('Failed to fetch runs:', error)
  } finally {
    runsLoading.value = false
  }
}

const deleteEndpoint = async (id) => {
  if (!confirm('Apakah Anda yakin ingin menghapus endpoint terekam ini?')) {
    return
  }
  try {
    await api.deleteEndpoint(id)
    await fetchEndpoints()
  } catch (error) {
    alert('Gagal menghapus endpoint: ' + error.message)
  }
}

const toggleExpandEndpoint = (id) => {
  if (expandedEndpointId.value === id) {
    expandedEndpointId.value = null
  } else {
    expandedEndpointId.value = id
  }
}

// Run Test Simulation
const runSimulation = async () => {
  if (endpoints.value.length === 0) {
    alert('Tidak ada endpoint yang terekam. Skenario harus memiliki minimal satu endpoint untuk dijalankan.')
    return
  }
  
  isRunning.value = true
  showReport.value = false
  progress.value = 0
  logs.value = 'Menginisialisasi k6 Engine...\nMenghubungkan ke database dan membaca endpoints...\nMembuat file skrip k6 temporary...\nMenjalankan pengujian CLI k6...\n'
  
  const progressInterval = setInterval(() => {
    if (progress.value < 90) {
      progress.value += Math.round(Math.random() * 8) + 2
      if (progress.value > 90) progress.value = 90
    }
  }, 400)
  
  try {
    const data = await api.runTest(suiteId, testType.value, vus.value, duration.value)
    progress.value = 100
    logs.value += `\n[SELESAI] K6 Test Run berhasil dijalankan!\n\n--- OUTPUT LOG ---\n${data.logOutput}`
    currentRunResult.value = data
    showReport.value = true
    await fetchRuns()
  } catch (error) {
    logs.value += `\n[ERROR] Uji coba k6 gagal:\n${error.message}`
    alert('Pengujian k6 gagal: ' + error.message)
  } finally {
    clearInterval(progressInterval)
    isRunning.value = false
  }
}

const stopSimulation = () => {
  alert('Menghentikan proses CLI k6...')
  isRunning.value = false
}

// Chart configuration
const chartData = computed(() => {
  const recentRuns = [...runs.value].slice(0, 7).reverse()
  
  const labels = recentRuns.length > 0 
    ? recentRuns.map(r => new Date(r.executed_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }))
    : ['Run 1', 'Run 2', 'Run 3', 'Run 4', 'Run 5']
    
  const latencyData = recentRuns.length > 0
    ? recentRuns.map(r => r.avg_latency)
    : [120, 135, 142, 168, 172]

  const rpsData = recentRuns.length > 0
    ? recentRuns.map(r => r.max_rps)
    : [10, 50, 100, 200, 150]

  return {
    labels,
    datasets: [
      {
        label: 'Rata-rata Latensi (ms)',
        data: latencyData,
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.05)',
        yAxisID: 'y',
        tension: 0.3,
        fill: true
      },
      {
        label: 'Max RPS',
        data: rpsData,
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'transparent',
        yAxisID: 'y1',
        tension: 0.3,
        borderDash: [5, 5]
      }
    ]
  }
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

const getMethodColor = (method) => {
  const m = method.toUpperCase()
  if (m === 'GET') return 'bg-sky-500/10 text-sky-500 border-sky-500/20'
  if (m === 'POST') return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
  if (m === 'PUT') return 'bg-amber-500/10 text-amber-500 border-amber-500/20'
  if (m === 'DELETE') return 'bg-red-500/10 text-red-500 border-red-500/20'
  return 'bg-purple-500/10 text-purple-500 border-purple-500/20'
}

const formatDate = (dateStr) => {
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

onMounted(() => {
  fetchSuiteDetail()
  fetchEndpoints()
  fetchRuns()
})
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-5">
      <div class="flex items-center gap-3">
        <router-link to="/test-suites" class="p-2 border rounded-lg bg-card/50 hover:bg-card hover:text-primary transition-all text-xs flex items-center gap-1.5 font-semibold">
          ← Kembali
        </router-link>
        <div v-if="!suiteLoading && suite">
          <h1 class="text-xl font-bold tracking-tight text-foreground">{{ suite.name }}</h1>
          <p class="text-[11px] text-muted-foreground font-mono mt-0.5 break-all">{{ suite.target_url }}</p>
        </div>
        <div v-else class="space-y-2">
          <div class="h-6 w-48 bg-muted animate-pulse rounded"></div>
          <div class="h-4 w-64 bg-muted animate-pulse rounded"></div>
        </div>
      </div>
    </div>

    <!-- Navigation Tabs -->
    <div class="flex border-b border-muted">
      <button 
        @click="activeSubTab = 'endpoints'" 
        class="px-5 py-2.5 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5"
        :class="activeSubTab === 'endpoints' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'"
      >
        <Layers class="h-4 w-4" />
        REST API Endpoints ({{ endpoints.length }})
      </button>
      <button 
        @click="activeSubTab = 'k6'" 
        class="px-5 py-2.5 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5"
        :class="activeSubTab === 'k6' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'"
      >
        <Play class="h-4 w-4 fill-current" />
        k6 Test Runner
      </button>
      <button 
        @click="activeSubTab = 'history'" 
        class="px-5 py-2.5 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5"
        :class="activeSubTab === 'history' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'"
      >
        <Database class="h-4 w-4" />
        Riwayat Run & Analitik
      </button>
    </div>

    <!-- Tab 1: REST API Endpoints (Captured List) -->
    <div v-if="activeSubTab === 'endpoints'" class="space-y-4">
      <Card class="border bg-card/45 backdrop-blur-sm p-5 space-y-4">
        <div>
          <h2 class="text-sm font-bold text-foreground">Endpoints Hasil Rekaman Browser</h2>
          <p class="text-xs text-muted-foreground">List request API XHR/Fetch yang berhasil ditangkap saat browser merekam aktivitas.</p>
        </div>

        <div v-if="endpointsLoading" class="flex flex-col items-center justify-center py-20 space-y-3">
          <Loader2 class="h-6 w-6 text-primary animate-spin" />
          <p class="text-xs text-muted-foreground">Memuat endpoints...</p>
        </div>

        <div v-else-if="endpoints.length === 0" class="border border-dashed rounded-xl p-10 text-center bg-card/25">
          <Layers class="h-8 w-8 text-muted-foreground mx-auto mb-3 opacity-50" />
          <h3 class="text-xs font-semibold text-foreground">Tidak ada endpoint terekam</h3>
          <p class="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
            Silakan kembali ke daftar Test Suites dan klik "Record XHR" untuk merekam endpoint secara otomatis.
          </p>
        </div>

        <div v-else class="space-y-3">
          <div 
            v-for="(ep, index) in endpoints" 
            :key="ep.id" 
            class="border rounded-xl bg-card/60 overflow-hidden transition-all duration-300"
          >
            <!-- Endpoint Header Row -->
            <div class="p-4 flex items-center justify-between gap-4 hover:bg-accent/20 cursor-pointer transition-colors" @click="toggleExpandEndpoint(ep.id)">
              <div class="flex items-center gap-3 min-w-0">
                <span class="bg-muted text-muted-foreground w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold">{{ index + 1 }}</span>
                <span :class="['px-2 py-0.5 border rounded text-[9px] font-extrabold uppercase tracking-wide', getMethodColor(ep.method)]">
                  {{ ep.method }}
                </span>
                <span class="font-mono text-xs text-foreground truncate break-all">{{ ep.url }}</span>
              </div>
              <div class="flex items-center gap-3 shrink-0">
                <button 
                  @click.stop="deleteEndpoint(ep.id)" 
                  class="p-1.5 text-muted-foreground hover:text-red-500 rounded-md hover:bg-red-500/10 transition-colors"
                  title="Hapus Endpoint"
                >
                  <Trash2 class="h-3.5 w-3.5" />
                </button>
                <component :is="expandedEndpointId === ep.id ? ChevronUp : ChevronDown" class="h-4 w-4 text-muted-foreground" />
              </div>
            </div>

            <!-- Endpoint Detail Accordion -->
            <div v-if="expandedEndpointId === ep.id" class="border-t bg-card/30 p-4 space-y-4 animate-in slide-in-from-top-1 duration-200">
              <div v-if="ep.description" class="space-y-1">
                <h4 class="text-[10px] uppercase font-bold text-muted-foreground tracking-wide">Deskripsi</h4>
                <p class="text-xs text-foreground">{{ ep.description }}</p>
              </div>

              <!-- Headers -->
              <div class="space-y-1.5">
                <h4 class="text-[10px] uppercase font-bold text-muted-foreground tracking-wide">Headers</h4>
                <div class="border rounded-lg bg-background/50 p-3 overflow-x-auto max-h-40">
                  <table class="w-full text-[11px] font-mono">
                    <tbody>
                      <tr v-for="h in JSON.parse(ep.headers || '[]')" :key="h.key" class="border-b last:border-none border-muted/30">
                        <td class="text-primary font-semibold py-1.5 pr-4 select-all">{{ h.key }}</td>
                        <td class="text-foreground/80 py-1.5 break-all select-all">{{ h.value }}</td>
                      </tr>
                      <tr v-if="JSON.parse(ep.headers || '[]').length === 0">
                        <td class="text-muted-foreground py-1 text-center" colspan="2">No Headers</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <!-- Body Payload -->
              <div class="space-y-1.5">
                <h4 class="text-[10px] uppercase font-bold text-muted-foreground tracking-wide">Request Body Payload</h4>
                <pre class="bg-black/90 text-green-400 font-mono text-[11px] p-3 rounded-lg overflow-x-auto max-h-48 border select-all">{{ ep.body ? JSON.stringify(JSON.parse(ep.body), null, 4) : 'No Body Payload' }}</pre>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>

    <!-- Tab 2: k6 Performance Test Runner -->
    <div v-else-if="activeSubTab === 'k6'" class="grid gap-6 lg:grid-cols-3">
      <!-- Config Form -->
      <Card class="lg:col-span-1 border bg-card/45 p-5 flex flex-col justify-between space-y-5">
        <div class="space-y-5">
          <h2 class="text-sm font-bold text-foreground border-b pb-2 flex items-center gap-1.5">
            <Settings class="h-4 w-4 text-primary" /> Konfigurasi k6
          </h2>
          <div class="space-y-4">
            <div class="space-y-1.5">
              <label class="text-xs font-semibold text-muted-foreground">Tipe Pengujian</label>
              <select v-model="testType" class="w-full text-xs border rounded-lg p-2.5 bg-background focus:ring-1 focus:ring-primary focus:outline-none transition-all">
                <option value="functional">Functional (1 VU, Assertion Check)</option>
                <option value="load">Load Test (Steady Load Simulation)</option>
                <option value="stress">Stress Test (Breaking Point Simulation)</option>
              </select>
            </div>
            
            <div v-if="testType !== 'functional'" class="grid grid-cols-2 gap-3 animate-in slide-in-from-top-1 duration-200">
              <div class="space-y-1.5">
                <label class="text-xs font-semibold text-muted-foreground">Virtual Users (VUs)</label>
                <input v-model="vus" type="number" min="1" max="1000" class="w-full text-xs border rounded-lg p-2 bg-background focus:ring-1 focus:ring-primary focus:outline-none transition-all" />
              </div>
              <div class="space-y-1.5">
                <label class="text-xs font-semibold text-muted-foreground">Durasi (Detik)</label>
                <input v-model="duration" type="number" min="2" max="600" class="w-full text-xs border rounded-lg p-2 bg-background focus:ring-1 focus:ring-primary focus:outline-none transition-all" />
              </div>
            </div>
          </div>
        </div>

        <div class="pt-4 border-t">
          <Button 
            v-if="isRunning" 
            @click="stopSimulation" 
            variant="destructive"
            class="w-full h-10 px-4 font-semibold text-xs flex items-center justify-center gap-1.5 shadow-sm"
          >
            <StopCircle class="h-4 w-4" /> Hentikan Uji Coba
          </Button>
          <Button 
            v-else 
            @click="runSimulation"
            :disabled="endpoints.length === 0"
            class="w-full h-10 px-4 font-semibold text-xs flex items-center justify-center gap-1.5 shadow-sm"
          >
            <Play class="h-3.5 w-3.5 fill-current" /> Jalankan Uji Coba k6
          </Button>
        </div>
      </Card>

      <!-- Terminal logs -->
      <Card class="lg:col-span-2 border bg-card/45 p-5 flex flex-col h-full space-y-4">
        <h2 class="text-sm font-bold text-foreground border-b pb-2 flex items-center gap-1.5">
          <Terminal class="h-4 w-4 text-primary" /> Live Terminal Log k6
        </h2>
        
        <!-- Progress bar -->
        <div v-if="isRunning" class="space-y-1.5 animate-in fade-in duration-200">
          <div class="flex justify-between text-[10px] font-semibold">
            <span class="text-primary">Running simulation...</span>
            <span>{{ progress }}%</span>
          </div>
          <div class="w-full bg-secondary h-1.5 rounded-full overflow-hidden">
            <div class="bg-primary h-full rounded-full transition-all duration-300" :style="{ width: `${progress}%` }"></div>
          </div>
        </div>

        <!-- Log window -->
        <div class="flex-1 bg-black/90 text-green-400 font-mono text-[11px] p-4 rounded-xl overflow-y-auto h-72 lg:h-[260px] space-y-2 select-text custom-scrollbar">
          <pre class="leading-relaxed whitespace-pre-wrap">{{ logs }}</pre>
        </div>
      </Card>

      <!-- Simulation Report (when finished) -->
      <div v-if="showReport && currentRunResult" class="lg:col-span-3 space-y-6 pt-4 animate-in slide-in-from-bottom-2 duration-300">
        <h3 class="text-base font-bold text-foreground flex items-center gap-1.5 border-b pb-2">
          <Database class="h-5 w-5 text-green-500" /> Hasil Laporan Run Terakhir
        </h3>

        <!-- Metrics summary cards -->
        <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card class="border bg-card/45 backdrop-blur-sm p-4 space-y-1">
            <span class="text-[10px] font-semibold text-muted-foreground uppercase">Status</span>
            <p :class="['text-xl font-bold uppercase', currentRunResult.status === 'success' ? 'text-green-500' : 'text-red-500']">
              {{ currentRunResult.status }}
            </p>
            <p class="text-[9px] text-muted-foreground">Kriteria kelulusan &gt;= 95%</p>
          </Card>

          <Card class="border bg-card/45 backdrop-blur-sm p-4 space-y-1">
            <span class="text-[10px] font-semibold text-muted-foreground uppercase">Rata-rata Latensi</span>
            <p class="text-xl font-bold text-foreground">{{ currentRunResult.avgLatency }} ms</p>
            <p class="text-[9px] text-muted-foreground">Waktu tunggu tanggapan HTTP</p>
          </Card>

          <Card class="border bg-card/45 backdrop-blur-sm p-4 space-y-1">
            <span class="text-[10px] font-semibold text-muted-foreground uppercase">Total Request</span>
            <p class="text-xl font-bold text-foreground">{{ currentRunResult.totalRequests }}</p>
            <p class="text-[9px] text-muted-foreground">Jumlah panggilan API sukses & gagal</p>
          </Card>

          <Card class="border bg-card/45 backdrop-blur-sm p-4 space-y-1">
            <span class="text-[10px] font-semibold text-muted-foreground uppercase">Success Rate</span>
            <p :class="['text-xl font-bold', currentRunResult.successRate >= 95 ? 'text-green-500' : 'text-red-500']">
              {{ currentRunResult.successRate }}%
            </p>
            <p class="text-[9px] text-muted-foreground">Throughput: {{ currentRunResult.maxRps }} RPS</p>
          </Card>
        </div>
      </div>
    </div>

    <!-- Tab 3: History & Analytics Reports -->
    <div v-else-if="activeSubTab === 'history'" class="space-y-6">
      <!-- Analytics chart -->
      <Card class="border bg-card/45 backdrop-blur-sm p-5 space-y-4">
        <div>
          <h3 class="text-sm font-bold text-foreground">Tren Latensi & throughput (7 Run Terakhir)</h3>
          <p class="text-xs text-muted-foreground">Visualisasi data peningkatan latensi rata-rata terhadap batas Max RPS.</p>
        </div>
        <div class="h-64">
          <Line :data="chartData" :options="chartOptions" />
        </div>
      </Card>

      <!-- History Table -->
      <Card class="border bg-card/45 p-5 space-y-4">
        <div>
          <h3 class="text-sm font-bold text-foreground">Laporan Riwayat Eksekusi k6</h3>
          <p class="text-xs text-muted-foreground">Daftar rekaman pengujian beban k6 untuk scenario suite ini.</p>
        </div>

        <div v-if="runsLoading" class="flex flex-col items-center justify-center py-20 space-y-3">
          <Loader2 class="h-6 w-6 text-primary animate-spin" />
          <p class="text-xs text-muted-foreground">Memuat riwayat...</p>
        </div>

        <div v-else-if="runs.length === 0" class="border border-dashed rounded-xl p-8 text-center bg-card/25 text-xs text-muted-foreground">
          Belum ada riwayat uji coba. Jalankan k6 runner untuk melihat riwayat di sini.
        </div>

        <div v-else class="overflow-x-auto border rounded-xl">
          <table class="w-full text-xs text-left">
            <thead class="bg-muted/50 border-b text-[10px] font-bold uppercase text-muted-foreground">
              <tr>
                <th class="p-3">Waktu Eksekusi</th>
                <th class="p-3">Tipe Uji</th>
                <th class="p-3">Status</th>
                <th class="p-3">Durasi</th>
                <th class="p-3 text-right">Rata-rata Latensi</th>
                <th class="p-3 text-right">Success Rate</th>
                <th class="p-3 text-right">Max RPS</th>
                <th class="p-3 text-center">Log</th>
              </tr>
            </thead>
            <tbody class="divide-y border-b last:border-none">
              <tr v-for="run in runs" :key="run.id" class="hover:bg-accent/15 transition-colors">
                <td class="p-3 font-medium whitespace-nowrap">{{ formatDate(run.executed_at) }}</td>
                <td class="p-3 capitalize font-semibold text-foreground/80">{{ run.test_type }}</td>
                <td class="p-3">
                  <span :class="['px-2 py-0.5 rounded-full text-[9px] font-bold uppercase', run.status === 'success' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500']">
                    {{ run.status }}
                  </span>
                </td>
                <td class="p-3 text-foreground/75">{{ run.duration_ms / 1000 }}s</td>
                <td class="p-3 text-right font-mono font-semibold">{{ run.avg_latency }} ms</td>
                <td class="p-3 text-right font-mono font-semibold" :class="run.success_rate >= 95 ? 'text-green-500' : 'text-red-500'">{{ run.success_rate }}%</td>
                <td class="p-3 text-right font-mono font-semibold">{{ run.max_rps }} RPS</td>
                <td class="p-3 text-center">
                  <button @click="openLogModal(run)" class="p-1 hover:bg-primary/10 hover:text-primary rounded-md transition-colors" title="Buka Log Output">
                    <Terminal class="h-3.5 w-3.5" />
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>
    </div>

    <!-- Logs Viewer Modal -->
    <div v-if="showLogModal && selectedRunLog" class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div class="w-full max-w-3xl bg-card border rounded-xl shadow-xl overflow-hidden flex flex-col h-[80vh] relative animate-in fade-in zoom-in-95 duration-200">
        <!-- Header -->
        <div class="p-4 border-b flex items-center justify-between">
          <div class="flex items-center gap-2">
            <Terminal class="h-5 w-5 text-primary" />
            <div>
              <h3 class="text-sm font-bold text-foreground">k6 Console Log Output</h3>
              <p class="text-[10px] text-muted-foreground">{{ formatDate(selectedRunLog.executed_at) }} - Mode: {{ selectedRunLog.test_type }} (Status: {{ selectedRunLog.status }})</p>
            </div>
          </div>
          <button 
            @click="showLogModal = false" 
            class="p-1.5 rounded-md text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
          >
            <X class="h-4 w-4" />
          </button>
        </div>

        <!-- Terminal log body -->
        <div class="flex-1 bg-black text-green-400 font-mono text-[11px] p-5 overflow-y-auto select-text">
          <pre class="whitespace-pre-wrap leading-relaxed">{{ selectedRunLog.log_output }}</pre>
        </div>

        <!-- Footer -->
        <div class="p-3 border-t bg-card flex justify-end">
          <Button size="sm" @click="showLogModal = false" class="h-8 text-xs font-semibold">Tutup</Button>
        </div>
      </div>
    </div>
  </div>
</template>
