<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import Card from '@/components/ui/Card.vue'
import CardContent from '@/components/ui/CardContent.vue'
import { User, Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-vue-next'
import { api } from '@/lib/api'
import { authState } from '@/lib/auth'

const router = useRouter()

// Reactive Form State
const form = reactive({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
})

// UI & Loading States
const loading = ref(false)
const passwordVisible = ref(false)
const confirmPasswordVisible = ref(false)
const successMessage = ref('')
const errors = reactive({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    general: ''
})

// Toggle password visibility
const togglePasswordVisibility = () => {
    passwordVisible.value = !passwordVisible.value
}

const toggleConfirmPasswordVisibility = () => {
    confirmPasswordVisible.value = !confirmPasswordVisible.value
}

// Validate inputs
const validateForm = () => {
    let isValid = true
    errors.name = ''
    errors.email = ''
    errors.password = ''
    errors.confirmPassword = ''
    errors.general = ''

    if (!form.name.trim()) {
        errors.name = 'Name is required'
        isValid = false
    }

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

    if (form.password !== form.confirmPassword) {
        errors.confirmPassword = 'Passwords do not match'
        isValid = false
    }

    return isValid
}

// Handle Form Submission
const handleRegister = async (e) => {
    e.preventDefault()

    if (!validateForm()) return

    loading.value = true
    errors.general = ''
    successMessage.value = ''

    try {
        // 1. Call Register API
        await api.register(form.name, form.email, form.password)
        
        // successMessage.value = 'Registration successful! Logging you in...'
        successMessage.value = 'Registration successful!'
        
        // 2. Auto Login
        // await authState.login(form.email, form.password)
        
        // 3. Redirect to login
        setTimeout(() => {
            router.push('/login')
        }, 1000)
    } catch (err) {
        errors.general = err.message || 'Registration failed. Please try again.'
    } finally {
        loading.value = false
    }
}
</script>

<template>
    <div
        class="outer-container h-screen h-[90dvh] w-full flex items-center justify-center bg-background font-sans overflow-hidden p-4 sm:p-6 md:p-8 lg:p-12 relative">
        <div class="flex items-center w-full justify-center relative">
            <div class="w-full max-w-md space-y-4 md:space-y-6 lg:space-y-8 z-10">
                <!-- Header -->
                <div class="flex flex-col items-center text-center space-y-1 mb-2 md:mb-4">
                    <h1 class="text-2xl lg:text-3xl font-extrabold tracking-tight">Create an Account</h1>
                    <p class="text-sm text-muted-foreground">Register to access your dashboard</p>
                </div>

                <!-- Main Card Component -->
                <Card class="border shadow-md bg-card/60 backdrop-blur-sm overflow-hidden p-2 md:p-6">
                    <CardContent class="space-y-3 md:space-y-4 lg:space-y-5">
                        <!-- Success Alert -->
                        <div v-if="successMessage"
                            class="p-3 bg-green-500/10 border border-green-500/20 text-green-600 text-xs rounded-lg transition-all duration-300">
                            {{ successMessage }}
                        </div>

                        <!-- General Server/Validation Error Alert -->
                        <div v-if="errors.general"
                            class="p-3 bg-destructive/10 border border-destructive/20 text-destructive text-xs rounded-lg transition-all duration-300">
                            {{ errors.general }}
                        </div>

                        <!-- Registration Form -->
                        <form @submit="handleRegister" class="space-y-3 md:space-y-4">
                            <!-- Name Input -->
                            <div class="space-y-1.5">
                                <label for="name"
                                    class="text-xs font-semibold text-foreground/80 tracking-wide uppercase">Full Name</label>
                                <div class="relative group">
                                    <span
                                        class="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors duration-200">
                                        <User class="h-4 w-4" />
                                    </span>
                                    <input id="name" v-model="form.name" type="text" placeholder="Full Name"
                                        :disabled="loading"
                                        class="w-full pl-10 pr-4 py-2 bg-background/50 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300 text-sm disabled:opacity-50"
                                        :class="{ 'border-destructive focus:ring-destructive': errors.name }" />
                                </div>
                                <p v-if="errors.name" class="text-[11px] text-destructive font-medium mt-0.5">{{
                                    errors.name }}</p>
                            </div>

                            <!-- Email Input -->
                            <div class="space-y-1.5">
                                <label for="email"
                                    class="text-xs font-semibold text-foreground/80 tracking-wide uppercase">Email Address</label>
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

                            <!-- Password Input -->
                            <div class="space-y-1.5">
                                <label for="password"
                                    class="text-xs font-semibold text-foreground/80 tracking-wide uppercase">Password</label>
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

                            <!-- Confirm Password Input -->
                            <div class="space-y-1.5">
                                <label for="confirmPassword"
                                    class="text-xs font-semibold text-foreground/80 tracking-wide uppercase">Confirm Password</label>
                                <div class="relative group">
                                    <span
                                        class="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors duration-200">
                                        <Lock class="h-4 w-4" />
                                    </span>
                                    <input id="confirmPassword" v-model="form.confirmPassword"
                                        :type="confirmPasswordVisible ? 'text' : 'password'" placeholder="Confirm Password"
                                        :disabled="loading"
                                        class="w-full pl-10 pr-12 py-2 bg-background/50 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300 text-sm disabled:opacity-50"
                                        :class="{ 'border-destructive focus:ring-destructive': errors.confirmPassword }" />
                                    <!-- Toggle Visibility Button -->
                                    <button type="button" @click="toggleConfirmPasswordVisibility"
                                        class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1 rounded-md"
                                        title="Toggle Confirm Password Visibility">
                                        <component :is="confirmPasswordVisible ? EyeOff : Eye" class="h-4 w-4" />
                                    </button>
                                </div>
                                <p v-if="errors.confirmPassword" class="text-[11px] text-destructive font-medium mt-0.5">{{
                                    errors.confirmPassword }}</p>
                            </div>

                            <!-- Submit Button -->
                            <button type="submit" :disabled="loading"
                                class="w-full mt-1 md:mt-2 flex items-center justify-center gap-2 py-2 md:py-2.5 px-4 bg-primary text-primary-foreground hover:bg-primary/95 active:scale-[0.98] font-semibold text-sm rounded-lg shadow-md shadow-primary/10 transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none">
                                <template v-if="loading">
                                    <Loader2 class="h-4 w-4 animate-spin" />
                                    <span>Creating Account...</span>
                                </template>
                                <template v-else>
                                    <span>Register</span>
                                </template>
                            </button>
                        </form>

                        <!-- Back to Login Link -->
                        <p class="text-xs text-center text-muted-foreground mt-2 md:mt-4">
                            Already have an account?
                            <router-link to="/login" class="text-primary font-semibold hover:underline">Log In</router-link>
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    </div>
</template>

<style scoped>
@media (max-height: 660px) {
    .outer-container {
        overflow-y: auto !important;
        align-items: center !important;
    }
}
</style>
