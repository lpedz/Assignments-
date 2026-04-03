import { defineStore } from 'pinia'
import { ref } from 'vue'
import axios from 'axios'
import { useAuthStore } from './auth'

const API_BASE = 'http://127.0.0.1:8000/api'

function getAuthHeaders() {
  const authStore = useAuthStore()
  return { Authorization: `Bearer ${authStore.accessToken}` }
}

export const useCalculatorStore = defineStore('calculator', () => {
  const result = ref(null)
  const error = ref(null)
  const isLoading = ref(false)
  const history = ref(JSON.parse(localStorage.getItem('calc_history') || '[]'))

  function saveHistory() {
    localStorage.setItem('calc_history', JSON.stringify(history.value.slice(0, 20)))
  }

  function addToHistory(a, b, op, res) {
    const symbols = { add: '+', subtract: '−', multiply: '×', divide: '÷' }
    history.value.unshift({
      a, b, op, result: res,
      expression: `${a} ${symbols[op]} ${b} = ${res}`,
      timestamp: new Date().toLocaleTimeString(),
      id: Date.now(),
    })
    if (history.value.length > 20) history.value.pop()
    saveHistory()
  }

  async function calculate(operation, a, b) {
    error.value = null
    result.value = null
    isLoading.value = true
    try {
      const response = await axios.post(
        `${API_BASE}/${operation}/`,
        { a: parseFloat(a), b: parseFloat(b) },
        { headers: getAuthHeaders() }
      )
      result.value = response.data.result
      addToHistory(a, b, operation, response.data.result)
    } catch (e) {
      error.value = e.response?.data?.error || 'Calculation failed. Please try again.'
    } finally {
      isLoading.value = false
    }
  }

  function clearHistory() {
    history.value = []
    localStorage.removeItem('calc_history')
  }

  return { result, error, isLoading, history, calculate, clearHistory }
})
