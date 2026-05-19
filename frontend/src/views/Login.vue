<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import Button from '@/components/ui/Button.vue'
import Card from '@/components/ui/Card.vue'
import CardHeader from '@/components/ui/CardHeader.vue'
import CardTitle from '@/components/ui/CardTitle.vue'
import CardContent from '@/components/ui/CardContent.vue'
import { Mail, Lock, Eye, EyeOff, Loader2, ArrowRight, Github, Sparkles } from 'lucide-vue-next'

const router = useRouter()

// Reactive Form State
const form = reactive({
    email: '',
    password: '',
    rememberMe: false
})

// UI & Loading States
const loading = ref(false)
const passwordVisible = ref(false)
const errors = reactive({
    email: '',
    password: '',
    general: ''
})

// Toggle password visibility
const togglePasswordVisibility = () => {
    passwordVisible.value = !passwordVisible.value
}

// Validate inputs
const validateForm = () => {
    let isValid = true
    errors.email = ''
    errors.password = ''
    errors.general = ''

    if (!form.email) {
        errors.email = 'Email is required'
        isValid = false
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
        errors.email = 'Please enter a valid email address'
        isValid = false
    }

    if (!form.password) {
        errors.password = 'Password is required'
        isValid = false
    } else if (form.password.length < 6) {
        errors.password = 'Password must be at least 6 characters'
        isValid = false
    }

    return isValid
}

// Handle Form Submission
const handleLogin = async (e) => {
    e.preventDefault()

    if (!validateForm()) return

    loading.value = true

    try {
        // Simulate API Call delay
        await new Promise((resolve) => setTimeout(resolve, 1500))

        // Simple mock authentication success
        console.log('Login Success:', form)
        router.push('/dashboard')
    } catch (err) {
        errors.general = 'Invalid email or password. Please try again.'
    } finally {
        loading.value = false
    }
}

// Social Sign in Mock
const handleSocialLogin = (provider) => {
    console.log(`Logging in with ${provider}`)
    loading.value = true
    setTimeout(() => {
        loading.value = false
        router.push('/dashboard')
    }, 1000)
}
</script>

<template>
    <div
        class="outer-container h-screen h-[90dvh] w-full flex items-center justify-center bg-background font-sans overflow-hidden p-4 sm:p-6 md:p-8 lg:p-12 relative">
        <!-- Right Panel: Elegant Login Form -->
        <div class="flex items-center w-full justify-center relative">

            <div class="w-full max-w-md space-y-4 md:space-y-6 lg:space-y-8 z-10">
                <!-- Logo/Header for Mobile views -->
                <div class="flex flex-col items-center text-center lg:hidden space-y-1 mb-2 md:mb-4">
                    <h1 class="text-2xl font-bold tracking-tight">Welcome</h1>
                    <p class="text-sm text-muted-foreground">Login into you dashboard</p>
                </div>

                <div class="space-y-2 text-left hidden lg:block">
                    <h1 class="text-3xl font-extrabold tracking-tight text-center">Welcome</h1>
                    <p class="text-sm text-muted-foreground text-center">Login into you dashboard</p>
                </div>

                <!-- Main Card Component -->
                <Card class="border shadow-md bg-card/60 backdrop-blur-sm overflow-hidden">
                    <CardHeader class="pb-3 md:pb-4">
                        <CardTitle class="text-xl font-bold flex items-center gap-2">
                            Sign In
                        </CardTitle>
                    </CardHeader>
                    <CardContent class="space-y-3 md:space-y-4 lg:space-y-5">
                        <!-- General Server/Validation Error Alert -->
                        <div v-if="errors.general"
                            class="p-3 bg-destructive/10 border border-destructive/20 text-destructive text-xs rounded-lg transition-all duration-300">
                            {{ errors.general }}
                        </div>

                        <!-- Email & Password Form -->
                        <form @submit="handleLogin" class="space-y-3 md:space-y-4">
                            <!-- Email Input Field -->
                            <div class="space-y-1.5">
                                <label for="email"
                                    class="text-xs font-semibold text-foreground/80 tracking-wide uppercase">Email
                                    Address</label>
                                <div class="relative group">
                                    <span
                                        class="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors duration-200">
                                        <Mail class="h-4 w-4" />
                                    </span>
                                    <input id="email" v-model="form.email" type="email" placeholder="Email Address"
                                        :disabled="loading"
                                        class="w-full pl-10 pr-4 py-2 bg-background/50 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300 text-sm disabled:opacity-50"
                                        :class="{ 'border-destructive focus:ring-destructive': errors.email }" />
                                </div>
                                <p v-if="errors.email" class="text-[11px] text-destructive font-medium mt-0.5">{{
                                    errors.email }}</p>
                            </div>

                            <!-- Password Input Field -->
                            <div class="space-y-1.5">
                                <div class="flex items-center justify-between">
                                    <label for="password"
                                        class="text-xs font-semibold text-foreground/80 tracking-wide uppercase">Password</label>
                                    <a href="#"
                                        class="text-xs text-primary font-medium hover:underline hover:text-primary/95">Forgot
                                        Password?</a>
                                </div>
                                <div class="relative group">
                                    <span
                                        class="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors duration-200">
                                        <Lock class="h-4 w-4" />
                                    </span>
                                    <input id="password" v-model="form.password"
                                        :type="passwordVisible ? 'text' : 'password'" placeholder="Password"
                                        :disabled="loading"
                                        class="w-full pl-10 pr-12 py-2 bg-background/50 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300 text-sm disabled:opacity-50"
                                        :class="{ 'border-destructive focus:ring-destructive': errors.password }" />
                                    <!-- Toggle Visibility Button -->
                                    <button type="button" @click="togglePasswordVisibility"
                                        class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1 rounded-md"
                                        title="Toggle Password Visibility">
                                        <component :is="passwordVisible ? EyeOff : Eye" class="h-4 w-4" />
                                    </button>
                                </div>
                                <p v-if="errors.password" class="text-[11px] text-destructive font-medium mt-0.5">{{
                                    errors.password }}</p>
                            </div>

                            <!-- Submit Button with loading animation and hover scaling -->
                            <button type="submit" :disabled="loading"
                                class="w-full mt-1 md:mt-2 flex items-center justify-center gap-2 py-2 md:py-2.5 px-4 bg-primary text-primary-foreground hover:bg-primary/95 active:scale-[0.98] font-semibold text-sm rounded-lg shadow-md shadow-primary/10 transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none">
                                <template v-if="loading">
                                    <Loader2 class="h-4 w-4 animate-spin" />
                                    <span>Signing In...</span>
                                </template>
                                <template v-else>
                                    <span>Sign In</span>
                                    <ArrowRight class="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                </template>
                            </button>
                        </form>

                        <!-- Sign Up CTA Link -->
                        <p class="text-xs text-center text-muted-foreground mt-2 md:mt-4">
                            Don't have an account?
                            <a href="#" class="text-primary font-semibold hover:underline">Create an account</a>
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    </div>
</template>

<style scoped>
.animate-spin-slow {
    animation: spin 8s linear infinite;
}

@keyframes spin {
    from {
        transform: rotate(0deg);
    }

    to {
        transform: rotate(360deg);
    }
}

@media (max-height: 660px) {
    .outer-container {
        overflow-y: auto !important;
        align-items: center !important;
    }
}
</style>