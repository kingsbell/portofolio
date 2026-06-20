<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import Card from '@/components/ui/Card.vue'
import CardContent from '@/components/ui/CardContent.vue'
import Button from '@/components/ui/Button.vue'
import { 
  Search, 
  Plus, 
  Trash2, 
  Chrome, 
  Loader2, 
  ArrowRight, 
  ExternalLink,
  FlaskConical,
  X
} from 'lucide-vue-next'
import { api } from '@/lib/api'

const suites = ref([])
const loading = ref(true)
const searchQuery = ref('')
const recordingSuiteId = ref(null)

// Form State
const showCreateForm = ref(false)
const form = ref({
  name: '',
  description: '',
  targetUrl: ''
})
const formLoading = ref(false)
const formError = ref('')

const fetchSuites = async () => {
  loading.value = true
  try {
    suites.value = await api.getSuites()
  } catch (error) {
    console.error('Failed to fetch suites:', error)
  } finally {
    loading.value = false
  }
}

const handleCreateSuite = async (e) => {
  e.preventDefault()
  if (!form.value.name || !form.value.targetUrl) {
    formError.value = 'Nama skenario dan URL Target wajib diisi'
    return
  }
  formLoading.value = true
  formError.value = ''
  try {
    let target = form.value.targetUrl.trim()
    if (!/^https?:\/\//i.test(target)) {
      target = 'http://' + target
    }
    
    await api.createSuite(form.value.name, form.value.description, target)
    form.value = { name: '', description: '', targetUrl: '' }
    showCreateForm.value = false
    await fetchSuites()
  } catch (error) {
    formError.value = error.message || 'Gagal membuat scenario suite'
  } finally {
    formLoading.value = false
  }
}

const handleDeleteSuite = async (id) => {
  if (!confirm('Apakah Anda yakin ingin menghapus skenario ini beserta semua endpoints dan riwayat pengujiannya?')) {
    return
  }
  try {
    await api.deleteSuite(id)
    await fetchSuites()
  } catch (error) {
    alert('Gagal menghapus suite: ' + error.message)
  }
}

const handleLaunchRecorder = async (suite) => {
  recordingSuiteId.value = suite.id
  try {
    await api.startRecording(suite.id)
    alert('Perekaman selesai. Seluruh endpoint API XHR/Fetch berhasil disimpan!')
  } catch (error) {
    alert('Gagal menjalankan recorder: ' + error.message)
  } finally {
    recordingSuiteId.value = null
  }
}

const formatDate = (dateStr) => {
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
}

// Filtered Suites
const filteredSuites = computed(() => {
  const query = searchQuery.value.toLowerCase().trim()
  if (!query) return suites.value
  return suites.value.filter(s => 
    s.name.toLowerCase().includes(query) || 
    s.target_url.toLowerCase().includes(query) ||
    (s.description && s.description.toLowerCase().includes(query))
  )
})

onMounted(() => {
  fetchSuites()
})
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold tracking-tight flex items-center gap-2">
          <FlaskConical class="text-primary h-6 w-6" /> Test Suites
        </h1>
        <p class="text-xs text-muted-foreground mt-1">
          Kelola skenario pengujian API otomatis, lakukan recording network, dan konfigurasi skrip k6.
        </p>
      </div>
      <Button @click="showCreateForm = true" size="sm" class="h-9 px-4 font-semibold flex items-center gap-1.5 shadow-sm">
        <Plus class="h-4 w-4" />
        Tambah Suite
      </Button>
    </div>

    <!-- Search & Filters -->
    <Card class="border bg-card/40 backdrop-blur-sm p-4">
      <div class="relative group">
        <span class="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors duration-200">
          <Search class="h-4 w-4" />
        </span>
        <input 
          v-model="searchQuery"
          type="text" 
          placeholder="Cari skenario berdasarkan nama, URL, atau deskripsi..." 
          class="w-full pl-10 pr-4 py-2 bg-background/50 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300 text-xs"
        />
      </div>
    </Card>

    <!-- Loading State -->
    <div v-if="loading" class="flex flex-col items-center justify-center py-20 space-y-4">
      <Loader2 class="h-8 w-8 text-primary animate-spin" />
      <p class="text-xs text-muted-foreground">Memuat daftar skenario...</p>
    </div>

    <!-- Empty State -->
    <div v-else-if="filteredSuites.length === 0" class="border border-dashed rounded-xl p-12 text-center bg-card/25">
      <FlaskConical class="h-10 w-10 text-muted-foreground mx-auto mb-4 opacity-50" />
      <h3 class="text-sm font-semibold text-foreground">Tidak ada Test Suite ditemukan</h3>
      <p class="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
        Mulai dengan membuat suite baru untuk merekam aktivitas API.
      </p>
      <Button @click="showCreateForm = true" size="sm" class="mt-4 flex items-center gap-1.5 mx-auto">
        <Plus class="h-3.5 w-3.5" /> Buat Suite Pertama
      </Button>
    </div>

    <!-- Suites Grid -->
    <div v-else class="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      <Card 
        v-for="suite in filteredSuites" 
        :key="suite.id" 
        class="border hover:border-primary/40 bg-card/45 backdrop-blur-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between"
      >
        <CardContent class="p-5 flex-1 flex flex-col justify-between space-y-4">
          <!-- Top Info -->
          <div class="space-y-1.5">
            <div class="flex justify-between items-start gap-2">
              <h3 class="font-bold text-sm text-foreground line-clamp-1 group-hover:text-primary transition-colors">{{ suite.name }}</h3>
              <button 
                @click="handleDeleteSuite(suite.id)" 
                class="p-1.5 text-muted-foreground hover:text-red-500 rounded-md hover:bg-red-500/10 transition-colors"
                title="Hapus Suite"
              >
                <Trash2 class="h-3.5 w-3.5" />
              </button>
            </div>
            <p class="text-[10px] font-mono text-muted-foreground break-all flex items-center gap-1 line-clamp-1">
              <ExternalLink class="h-2.5 w-2.5 inline" />
              {{ suite.target_url }}
            </p>
            <p class="text-xs text-muted-foreground line-clamp-2 pt-1 h-8">
              {{ suite.description || 'Tidak ada deskripsi skenario.' }}
            </p>
          </div>

          <!-- Bottom Actions -->
          <div class="border-t pt-3 flex items-center justify-between gap-2">
            <span class="text-[10px] text-muted-foreground">
              Dibuat: {{ formatDate(suite.created_at) }}
            </span>
            <div class="flex items-center gap-2">
              <Button 
                @click="handleLaunchRecorder(suite)"
                :disabled="recordingSuiteId !== null"
                variant="outline"
                size="sm" 
                class="h-8 px-2.5 text-[10px] border-emerald-500/30 text-emerald-500 hover:bg-emerald-500/10 hover:text-emerald-400 font-semibold flex items-center gap-1"
              >
                <template v-if="recordingSuiteId === suite.id">
                  <Loader2 class="h-3 w-3 animate-spin" />
                  Merekam...
                </template>
                <template v-else>
                  <Chrome class="h-3.5 w-3.5" />
                  Record XHR
                </template>
              </Button>

              <router-link :to="`/test-suites/${suite.id}`" class="inline-flex">
                <Button size="sm" class="h-8 px-2.5 text-[10px] font-semibold flex items-center gap-1">
                  Detail <ArrowRight class="h-3 w-3" />
                </Button>
              </router-link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Create Suite Modal -->
    <div v-if="showCreateForm" class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div class="w-full max-w-md bg-card border rounded-xl shadow-xl overflow-hidden p-6 relative animate-in fade-in zoom-in-95 duration-200">
        <!-- Close button -->
        <button 
          @click="showCreateForm = false" 
          class="absolute right-4 top-4 p-1 rounded-md text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
        >
          <X class="h-4 w-4" />
        </button>

        <h2 class="text-base font-bold text-foreground flex items-center gap-2 mb-2">
          <FlaskConical class="text-primary h-5 w-5" /> Buat Scenario Suite
        </h2>
        <p class="text-xs text-muted-foreground mb-4">
          Langkah pertama untuk merekam aktivitas API request. Tentukan target url awal untuk browser recorder.
        </p>

        <!-- Form error -->
        <div v-if="formError" class="p-3 bg-red-500/10 border border-red-500/20 text-red-500 text-xs rounded-lg mb-4">
          {{ formError }}
        </div>

        <form @submit="handleCreateSuite" class="space-y-4">
          <div class="space-y-1.5">
            <label class="text-xs font-semibold text-foreground/80">Nama Skenario</label>
            <input 
              v-model="form.name"
              type="text" 
              placeholder="Contoh: Autentikasi Pengguna & Checkout" 
              class="w-full px-3 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-xs"
              required
            />
          </div>

          <div class="space-y-1.5">
            <label class="text-xs font-semibold text-foreground/80">URL Target Awal</label>
            <input 
              v-model="form.targetUrl"
              type="text" 
              placeholder="Contoh: http://localhost:3000/login" 
              class="w-full px-3 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-xs"
              required
            />
          </div>

          <div class="space-y-1.5">
            <label class="text-xs font-semibold text-foreground/80">Deskripsi (Opsional)</label>
            <textarea 
              v-model="form.description"
              rows="3" 
              placeholder="Tuliskan tujuan atau detail skenario pengujian..." 
              class="w-full px-3 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-xs resize-none"
            ></textarea>
          </div>

          <div class="flex items-center justify-end gap-3 pt-2">
            <Button 
              type="button" 
              variant="outline" 
              @click="showCreateForm = false"
              size="sm"
              class="h-9 px-4 font-semibold text-xs"
            >
              Batal
            </Button>
            <Button 
              type="submit" 
              :disabled="formLoading"
              size="sm"
              class="h-9 px-4 font-semibold text-xs flex items-center gap-1.5"
            >
              <template v-if="formLoading">
                <Loader2 class="h-3.5 w-3.5 animate-spin" />
                Membuat...
              </template>
              <template v-else>
                Simpan
              </template>
            </Button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
