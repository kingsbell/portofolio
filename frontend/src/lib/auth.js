import { ref } from 'vue'
import { api } from './api'

export const currentUser = ref(null)
export const isAuthenticated = ref(false)

export const authState = {
    async check() {
        try {
            const data = await api.checkAuth()
            currentUser.value = data.user
            isAuthenticated.value = true
            return true
        } catch (error) {
            currentUser.value = null
            isAuthenticated.value = false
            return false
        }
    },
    async login(email, password) {
        const data = await api.login(email, password)
        currentUser.value = data.user
        isAuthenticated.value = true
        return data
    },
    async logout() {
        await api.logout()
        currentUser.value = null
        isAuthenticated.value = false
    }
}
