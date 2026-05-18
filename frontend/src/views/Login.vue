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
    <div class="min-h-screen grid lg:grid-cols-2 bg-background font-sans overflow-hidden">
        <!-- Left Panel: Premium Visual Graphics (Teaser Dashboard) -->
        <div
            class="hidden lg:flex flex-col justify-between relative bg-gradient-to-tr from-emerald-950 via-emerald-900 to-teal-800 text-white p-12 overflow-hidden">
            <!-- Ambient Background Glows -->
            <div
                class="absolute -top-40 -left-40 w-96 h-96 bg-emerald-500 rounded-full blur-3xl opacity-20 animate-pulse">
            </div>
            <div class="absolute -bottom-20 -right-20 w-80 h-80 bg-teal-400 rounded-full blur-3xl opacity-20"></div>

            <!-- Header Branding -->
            <div class="flex items-center gap-3 relative z-10">
                <div
                    class="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-emerald-400 flex items-center justify-center shadow-lg shadow-emerald-950/50">
                    <Sparkles class="h-5 w-5 text-white animate-spin-slow" />
                </div>
                <span
                    class="text-xl font-bold tracking-tight bg-gradient-to-r from-white to-emerald-200 bg-clip-text text-transparent">
                    CRM Core
                </span>
            </div>

            <!-- Hero Teaser Card inside a beautiful Glassmorphism border -->
            <div class="relative z-10 my-auto max-w-md space-y-6">
                <div class="space-y-2">
                    <span
                        class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        Now Available v2.0
                    </span>
                    <h2 class="text-4xl font-extrabold tracking-tight leading-tight">
                        Supercharge your workflow management.
                    </h2>
                    <p class="text-emerald-100/80 leading-relaxed text-sm">
                        Access robust CRM tools, responsive analytics dashboards, real-time reports, and automated sales
                        pipeline trackers designed to build premium customer relationships.
                    </p>
                </div>

                <!-- Mini Analytics Preview Card (Glassmorphic Mockup) -->
                <div class="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 shadow-2xl space-y-4">
                    <div class="flex items-center justify-between">
                        <div class="flex items-center gap-2.5">
                            <div class="w-2.5 h-2.5 bg-emerald-400 rounded-full animate-ping"></div>
                            <span class="text-xs font-medium text-emerald-200 uppercase tracking-wider">Live
                                Analytics</span>
                        </div>
                        <span class="text-xs text-white/60">Updated just now</span>
                    </div>
                    <div class="grid grid-cols-2 gap-4">
                        <div class="bg-white/5 rounded-xl p-3 border border-white/5">
                            <span class="text-[10px] text-white/55 block uppercase">Monthly Income</span>
                            <span class="text-lg font-bold text-white">$234,567</span>
                            <span class="text-[10px] text-emerald-400 block mt-1">▲ +18.4% last week</span>
                        </div>
                        <div class="bg-white/5 rounded-xl p-3 border border-white/5">
                            <span class="text-[10px] text-white/55 block uppercase">Active Deals</span>
                            <span class="text-lg font-bold text-white">89</span>
                            <span class="text-[10px] text-emerald-400 block mt-1">▲ +23% last month</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Footer Info -->
            <div
                class="relative z-10 flex items-center justify-between text-xs text-emerald-200/60 border-t border-white/10 pt-6">
                <span>© 2026 CRM Core Application</span>
                <div class="flex gap-4">
                    <a href="#" class="hover:underline">Privacy Policy</a>
                    <a href="#" class="hover:underline">Terms of Service</a>
                </div>
            </div>
        </div>

        <!-- Right Panel: Elegant Login Form -->
        <div class="flex items-center justify-center p-6 sm:p-12 relative">
            <!-- Subtle Decorative Background Glow for mobile/tablet -->
            <div class="absolute top-20 right-20 w-48 h-48 bg-primary/5 rounded-full blur-3xl lg:hidden"></div>
            <div class="absolute bottom-20 left-20 w-48 h-48 bg-emerald-500/5 rounded-full blur-3xl lg:hidden"></div>

            <div class="w-full max-w-md space-y-8 z-10">
                <!-- Logo/Header for Mobile views -->
                <div class="flex flex-col items-center text-center lg:hidden space-y-2 mb-6">
                    <div
                        class="w-12 h-12 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                        <Sparkles class="h-6 w-6 text-white" />
                    </div>
                    <h1 class="text-2xl font-bold tracking-tight">CRM Core</h1>
                    <p class="text-sm text-muted-foreground">Sign in to manage your relationships</p>
                </div>

                <div class="space-y-2 text-left hidden lg:block">
                    <h1 class="text-3xl font-extrabold tracking-tight">Welcome back</h1>
                    <p class="text-sm text-muted-foreground">Please enter your credentials to access your dashboard.</p>
                </div>

                <!-- Main Card Component -->
                <Card class="border shadow-md bg-card/60 backdrop-blur-sm overflow-hidden">
                    <CardHeader class="pb-4">
                        <CardTitle class="text-xl font-bold flex items-center gap-2">
                            Sign In
                        </CardTitle>
                    </CardHeader>
                    <CardContent class="space-y-5">
                        <!-- General Server/Validation Error Alert -->
                        <div v-if="errors.general"
                            class="p-3 bg-destructive/10 border border-destructive/20 text-destructive text-xs rounded-lg transition-all duration-300">
                            {{ errors.general }}
                        </div>

                        <!-- Email & Password Form -->
                        <form @submit="handleLogin" class="space-y-4">
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
                                    <input id="email" v-model="form.email" type="email" placeholder="name@example.com"
                                        :disabled="loading"
                                        class="w-full pl-10 pr-4 py-2.5 bg-background/50 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300 text-sm disabled:opacity-50"
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
                                        :type="passwordVisible ? 'text' : 'password'" placeholder="••••••••"
                                        :disabled="loading"
                                        class="w-full pl-10 pr-12 py-2.5 bg-background/50 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300 text-sm disabled:opacity-50"
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

                            <!-- Remember Me Checkbox -->
                            <div class="flex items-center space-x-2 pt-1">
                                <input id="remember" v-model="form.rememberMe" type="checkbox"
                                    class="h-4 w-4 rounded border-input text-primary focus:ring-primary bg-background cursor-pointer" />
                                <label for="remember"
                                    class="text-xs font-medium text-muted-foreground cursor-pointer select-none">
                                    Keep me signed in on this device
                                </label>
                            </div>

                            <!-- Submit Button with loading animation and hover scaling -->
                            <button type="submit" :disabled="loading"
                                class="w-full mt-2 flex items-center justify-center gap-2 py-2.5 px-4 bg-primary text-primary-foreground hover:bg-primary/95 active:scale-[0.98] font-semibold text-sm rounded-lg shadow-md shadow-primary/10 transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none">
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

                        <!-- Separation Divider -->
                        <div class="relative py-2">
                            <div class="absolute inset-0 flex items-center">
                                <div class="w-full border-t border-border"></div>
                            </div>
                            <div class="relative flex justify-center text-xs">
                                <span class="bg-card px-3 text-muted-foreground font-medium uppercase tracking-wider">Or
                                    Continue With</span>
                            </div>
                        </div>

                        <!-- Social Logins -->
                        <div class="grid grid-cols-2 gap-3">
                            <button @click="handleSocialLogin('Github')" type="button" :disabled="loading"
                                class="flex items-center justify-center gap-2 py-2 px-4 border border-input rounded-lg hover:bg-accent text-sm font-semibold transition-all duration-200 disabled:opacity-50">
                                <Github class="h-4 w-4 text-foreground" />
                                <span>GitHub</span>
                            </button>
                            <button @click="handleSocialLogin('Google')" type="button" :disabled="loading"
                                class="flex items-center justify-center gap-2 py-2 px-4 border border-input rounded-lg hover:bg-accent text-sm font-semibold transition-all duration-200 disabled:opacity-50">
                                <!-- Custom SVG Google icon -->
                                <svg class="h-4 w-4" viewBox="0 0 24 24" width="24" height="24"
                                    xmlns="http://www.w3.org/2000/svg">
                                    <g transform="matrix(1, 0, 0, 1, 0, 0)">
                                        <path
                                            d="M21.35,11.1H12v2.7h5.38c-0.24,1.28 -0.96,2.37 -2.04,3.1v2.57h3.3c1.93,-1.78 3.04,-4.4 3.04,-7.4C21.68,11.8 21.56,11.4 21.35,11.1z"
                                            fill="#4285F4" />
                                        <path
                                            d="M12,20.4c2.43,0 4.47,-0.8 5.96,-2.18l-3.3,-2.57c-0.9,0.6 -2.07,0.98 -3.3,0.98 -2.34,0 -4.33,-1.58 -5.04,-3.7H2.92v2.66C4.4,17.84 8.02,20.4 12,20.4z"
                                            fill="#34A853" />
                                        <path
                                            d="M6.96,12.93c-0.18,-0.54 -0.29,-1.11 -0.29,-1.7c0,-0.6 0.11,-1.17 0.29,-1.71V6.86H2.92C2.3,8.08 1.95,9.47 1.95,10.95c0,1.48 0.35,2.87 0.97,4.09L6.96,12.93z"
                                            fill="#FBBC05" />
                                        <path
                                            d="M12,5.2c1.32,0 2.5,0.45 3.44,1.35l2.58,-2.58C16.46,2.5 14.43,1.95 12,1.95 8.02,1.95 4.4,4.5 2.92,7.44l4.04,3.13C7.67,6.78 9.66,5.2 12,5.2z"
                                            fill="#EA4335" />
                                    </g>
                                </svg>
                                <span>Google</span>
                            </button>
                        </div>

                        <!-- Sign Up CTA Link -->
                        <p class="text-xs text-center text-muted-foreground mt-4">
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
</style>