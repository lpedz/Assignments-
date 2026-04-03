import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { api } from './api'

// Helper to append Auth headers
const getConfig = (thunkAPI) => {
  const token = thunkAPI.getState().auth.accessToken
  return { headers: { Authorization: `Bearer ${token}` } }
}

export const fetchTasks = createAsyncThunk('tasks/fetchTasks', async (_, thunkAPI) => {
  try {
    const res = await api.get('/tasks/', getConfig(thunkAPI))
    return res.data
  } catch (err) {
    return thunkAPI.rejectWithValue(err.response?.data?.detail || 'Failed to load tasks.')
  }
})

export const createTask = createAsyncThunk('tasks/createTask', async (data, thunkAPI) => {
  try {
    const res = await api.post('/tasks/', data, getConfig(thunkAPI))
    return res.data
  } catch (err) {
    return thunkAPI.rejectWithValue(err)
  }
})

export const updateTask = createAsyncThunk('tasks/updateTask', async ({ id, data }, thunkAPI) => {
  try {
    const res = await api.put(`/tasks/${id}/`, data, getConfig(thunkAPI))
    return res.data
  } catch (err) {
    return thunkAPI.rejectWithValue(err)
  }
})

export const toggleComplete = createAsyncThunk('tasks/toggleComplete', async (task, thunkAPI) => {
  try {
    const res = await api.put(`/tasks/${task.id}/`, { ...task, completed: !task.completed }, getConfig(thunkAPI))
    return res.data
  } catch (err) {
    return thunkAPI.rejectWithValue(err)
  }
})

export const deleteTaskAction = createAsyncThunk('tasks/deleteTaskAction', async (id, thunkAPI) => {
  try {
    await api.delete(`/tasks/${id}/`, getConfig(thunkAPI))
    return id
  } catch (err) {
    return thunkAPI.rejectWithValue(err)
  }
})

export const taskSlice = createSlice({
  name: 'tasks',
  initialState: {
    items: [],
    isLoading: false,
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Tasks
      .addCase(fetchTasks.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.isLoading = false
        state.items = action.payload
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload
      })
      // Create Task
      .addCase(createTask.fulfilled, (state, action) => {
        state.items.unshift(action.payload)
      })
      // Update Task
      .addCase(updateTask.fulfilled, (state, action) => {
        const idx = state.items.findIndex((t) => t.id === action.payload.id)
        if (idx !== -1) state.items[idx] = action.payload
      })
      // Toggle Complete
      .addCase(toggleComplete.fulfilled, (state, action) => {
        const idx = state.items.findIndex((t) => t.id === action.payload.id)
        if (idx !== -1) state.items[idx] = action.payload
      })
      // Delete Task
      .addCase(deleteTaskAction.fulfilled, (state, action) => {
        state.items = state.items.filter((t) => t.id !== action.payload)
      })
  }
})

export const { clearError } = taskSlice.actions
export default taskSlice.reducer
