import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from 'axios'

const API_BASE = 'http://127.0.0.1:8000/api'

export const useAuthStore = defineStore('auth', () => {
  const accessToken = ref(localStorage.getItem('access_token') || null)
  const refreshToken = ref(localStorage.getItem('refresh_token') || null)
  const user = ref(JSON.parse(localStorage.getItem('user') || 'null'))

  const isAuthenticated = computed(() => !!accessToken.value)

  function setTokens(access, refresh) {
    accessToken.value = access
    refreshToken.value = refresh
    localStorage.setItem('access_token', access)
    localStorage.setItem('refresh_token', refresh)
  }

  function setUser(userData) {
    user.value = userData
    localStorage.setItem('user', JSON.stringify(userData))
  }

  async function login(username, password) {
    const response = await axios.post(`${API_BASE}/token/`, { username, password })
    setTokens(response.data.access, response.data.refresh)
    // Decode user info from token payload
    const payload = JSON.parse(atob(response.data.access.split('.')[1]))
    setUser({ username: payload.username || username, id: payload.user_id })
    return response.data
  }

  async function register(username, password) {
    const response = await axios.post(`${API_BASE}/register/`, { username, password })
    // Automatically log in after registration
    return login(username, password)
  }

  async function refreshAccessToken() {
    if (!refreshToken.value) throw new Error('No refresh token')
    const response = await axios.post(`${API_BASE}/token/refresh/`, {
      refresh: refreshToken.value,
    })
    accessToken.value = response.data.access
    localStorage.setItem('access_token', response.data.access)
    return response.data.access
  }

  function logout() {
    accessToken.value = null
    refreshToken.value = null
    user.value = null
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('user')
  }

  return { accessToken, refreshToken, user, isAuthenticated, login, register, logout, refreshAccessToken }
})
