import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { api } from './api'

// Restore from local storage (or from old Zustand state structure)
let initialUser = null
let initialToken = null

try {
  const localData = localStorage.getItem('task2-auth')
  if (localData) {
    const parsed = JSON.parse(localData)
    if (parsed.state) {
      initialUser = parsed.state.user
      initialToken = parsed.state.accessToken
    } else {
      initialUser = parsed.user
      initialToken = parsed.accessToken
    }
  }
} catch (e) {
  // Ignore parsing errors
}

const initialState = {
  user: initialUser,
  accessToken: initialToken,
}

function saveState(state) {
  localStorage.setItem('task2-auth', JSON.stringify({
    user: state.user,
    accessToken: state.accessToken
  }))
}

export const login = createAsyncThunk('auth/login', async ({ username, password }, { rejectWithValue }) => {
  try {
    const res = await api.post('/auth/login/', { username, password })
    return res.data
  } catch (err) {
    return rejectWithValue(err)
  }
})

export const register = createAsyncThunk('auth/register', async ({ username, email, password, confirmPassword }, { rejectWithValue }) => {
  try {
    const res = await api.post('/auth/register/', {
      username, email, password, password_confirm: confirmPassword
    })
    return res.data
  } catch (err) {
    return rejectWithValue(err)
  }
})

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null
      state.accessToken = null
      saveState(state)
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.fulfilled, (state, action) => {
        const { user, tokens } = action.payload
        state.user = user
        state.accessToken = tokens.access
        saveState(state)
      })
      .addCase(register.fulfilled, (state, action) => {
        const { user, tokens } = action.payload
        state.user = user
        state.accessToken = tokens.access
        saveState(state)
      })
  }
})

export const { logout } = authSlice.actions
export default authSlice.reducer
