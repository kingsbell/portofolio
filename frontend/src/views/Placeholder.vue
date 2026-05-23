<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-xl font-bold tracking-tight">{{ pageName }}</h1>
      <p class="text-muted-foreground">Manage and view details for {{ pageName.toLowerCase() }}.</p>
    </div>
    <Card>
      <CardContent class="py-12 text-center text-muted-foreground flex flex-col items-center justify-center space-y-2">
        <div class="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-2">
          <Zap class="h-6 w-6" />
        </div>
        <h3 class="text-lg font-semibold text-foreground">Fitur Sedang Dikembangkan</h3>
        <p class="text-sm max-w-sm">Modul pengujian otomatis untuk {{ pageName }} sedang diintegrasikan ke dalam sistem QA Automation.</p>
      </CardContent>
    </Card>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import Card from '@/components/ui/Card.vue'
import CardContent from '@/components/ui/CardContent.vue'
import { Zap } from 'lucide-vue-next'

const route = useRoute()
const pageName = computed(() => {
  const name = route.name || 'Feature'
  // Format camelcase or dashes to readable text
  return name.replace(/([A-Z])/g, ' $1').trim()
})
</script>
