import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import axios from 'axios'

const API_BASE = 'http://127.0.0.1:8001/api'

const api = axios.create({ baseURL: API_BASE })

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,

      isAuthenticated: () => !!get().accessToken,

      login: async (username, password) => {
        const res = await api.post('/auth/login/', { username, password })
        const { user, tokens } = res.data
        set({ user, accessToken: tokens.access })
        return res.data
      },

      register: async (username, email, password, password_confirm) => {
        const res = await api.post('/auth/register/', {
          username, email, password, password_confirm,
        })
        const { user, tokens } = res.data
        set({ user, accessToken: tokens.access })
        return res.data
      },

      logout: () => set({ user: null, accessToken: null }),
    }),
    {
      name: 'task2-auth',
      partialize: (state) => ({ user: state.user, accessToken: state.accessToken }),
    }
  )
)

export const useTaskStore = create((set, get) => ({
  tasks: [],
  isLoading: false,
  error: null,

  getHeaders: () => {
    const token = useAuthStore.getState().accessToken
    return { Authorization: `Bearer ${token}` }
  },

  fetchTasks: async () => {
    set({ isLoading: true, error: null })
    try {
      const res = await api.get('/tasks/', { headers: get().getHeaders() })
      set({ tasks: res.data })
    } catch (e) {
      set({ error: e.response?.data?.detail || 'Failed to load tasks.' })
    } finally {
      set({ isLoading: false })
    }
  },

  createTask: async (data) => {
    const res = await api.post('/tasks/', data, { headers: get().getHeaders() })
    set((state) => ({ tasks: [res.data, ...state.tasks] }))
    return res.data
  },

  updateTask: async (id, data) => {
    const res = await api.put(`/tasks/${id}/`, data, { headers: get().getHeaders() })
    set((state) => ({
      tasks: state.tasks.map((t) => (t.id === id ? res.data : t)),
    }))
    return res.data
  },

  deleteTask: async (id) => {
    await api.delete(`/tasks/${id}/`, { headers: get().getHeaders() })
    set((state) => ({ tasks: state.tasks.filter((t) => t.id !== id) }))
  },

  toggleComplete: async (task) => {
    const res = await api.put(
      `/tasks/${task.id}/`,
      { ...task, completed: !task.completed },
      { headers: get().getHeaders() }
    )
    set((state) => ({
      tasks: state.tasks.map((t) => (t.id === task.id ? res.data : t)),
    }))
  },

  clearError: () => set({ error: null }),
}))
