<template>
  <div class="auth-page">
    
    <!-- Left Column: Branding -->
    <div class="auth-left">
      <div class="brand-monogram">
        AX<span>.</span>
      </div>
      
      <div class="brand-message">
        <h1>{{ tab === 'login' ? 'Welcome back.' : 'Start calculating.' }}</h1>
        <p>A simple, reliable calculator for your daily operations.</p>
      </div>
      
      <div class="brand-footer">
        Version 1.0.0
      </div>
    </div>

    <!-- Right Column: Form -->
    <div class="auth-right">
      <div class="auth-card">
        <!-- Tabs -->
        <div class="auth-tabs">
          <button 
            type="button" 
            class="auth-tab" 
            :class="{ active: tab === 'login' }" 
            @click="switchTab('login')"
          >
            Sign In
          </button>
          <button 
            type="button" 
            class="auth-tab" 
            :class="{ active: tab === 'register' }" 
            @click="switchTab('register')"
          >
            Register
          </button>
        </div>

        <form @submit.prevent="handleSubmit" novalidate class="auth-form">
          <!-- Username -->
          <div class="form-group">
            <label for="username" class="form-label">Username</label>
            <input
              id="username"
              v-model="form.username"
              type="text"
              class="form-input"
              :class="{ error: errors.username }"
              @blur="validateField('username')"
              autocomplete="username"
              autofocus
            />
            <span v-if="errors.username" class="field-error">
              {{ errors.username }}
            </span>
          </div>

          <!-- Password -->
          <div class="form-group">
            <label for="password" class="form-label">Password</label>
            <div class="password-wrapper">
              <input
                id="password"
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                class="form-input"
                :class="{ error: errors.password }"
                @blur="validateField('password')"
                autocomplete="current-password"
              />
              <button type="button" class="toggle-pass" @click="showPassword = !showPassword" tabindex="-1">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <template v-if="showPassword">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                    <line x1="1" y1="1" x2="23" y2="23"></line>
                  </template>
                  <template v-else>
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </template>
                </svg>
              </button>
            </div>
            <span v-if="errors.password" class="field-error">
              {{ errors.password }}
            </span>
          </div>

          <!-- Confirm Password -->
          <div v-if="tab === 'register'" class="form-group">
            <label for="confirmPassword" class="form-label">Confirm Password</label>
            <input
              id="confirmPassword"
              v-model="form.confirmPassword"
              type="password"
              class="form-input"
              :class="{ error: errors.confirmPassword }"
              @blur="validateField('confirmPassword')"
              autocomplete="new-password"
            />
            <span v-if="errors.confirmPassword" class="field-error">
              {{ errors.confirmPassword }}
            </span>
          </div>

          <!-- Error Alert -->
          <div v-if="apiError" class="alert-error">
            {{ apiError }}
          </div>

          <!-- Submit -->
          <button type="submit" class="submit-btn" :disabled="isLoading">
            <span v-if="isLoading" class="btn-spinner"></span>
            {{ tab === 'login' ? 'Sign In' : 'Create Account' }}
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const tab = ref('login')
const form = reactive({ username: '', password: '', confirmPassword: '' })
const errors = reactive({ username: '', password: '', confirmPassword: '' })
const apiError = ref('')
const isLoading = ref(false)
const showPassword = ref(false)

function switchTab(newTab) {
  if (tab.value === newTab) return
  tab.value = newTab
  form.username = ''
  form.password = ''
  form.confirmPassword = ''
  errors.username = ''
  errors.password = ''
  errors.confirmPassword = ''
  apiError.value = ''
}

function validateField(field) {
  if (field === 'username') {
    errors.username = form.username.trim() ? '' : 'Username is required.'
    if (tab.value === 'register' && form.username.length > 0 && form.username.length < 3) {
      errors.username = 'At least 3 characters.'
    }
  }
  if (field === 'password') {
    if (!form.password) {
      errors.password = 'Password is required.'
    } else if (tab.value === 'register' && form.password.length < 6) {
      errors.password = 'At least 6 characters.'
    } else {
      errors.password = ''
    }
  }
  if (field === 'confirmPassword' && tab.value === 'register') {
    if (!form.confirmPassword) {
      errors.confirmPassword = 'Confirm your password.'
    } else if (form.password !== form.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match.'
    } else {
      errors.confirmPassword = ''
    }
  }
}

function validate() {
  validateField('username')
  validateField('password')
  if (tab.value === 'register') validateField('confirmPassword')
  
  return !errors.username && !errors.password && (tab.value === 'login' || !errors.confirmPassword)
}

async function handleSubmit() {
  apiError.value = ''
  if (!validate()) return
  isLoading.value = true
  try {
    if (tab.value === 'login') {
      await authStore.login(form.username, form.password)
    } else {
      await authStore.register(form.username, form.password)
    }
    router.push('/calculator')
  } catch (e) {
    if (!e.response) {
      apiError.value = e.message || 'Network error or server unreachable.'
    } else if (tab.value === 'register') {
      apiError.value = e.response?.data?.error || 
                       (e.response?.data?.username ? `Username: ${e.response.data.username[0]}` : null) || 
                       'Registration failed. Please try again.'
    } else {
      apiError.value = e.response?.data?.detail || 'Invalid credentials. Please check your inputs.'
    }
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.auth-page {
  min-height: 100vh;
  display: flex;
  background-color: #0B0F14;
  color: #E6EDF3;
  font-family: 'Inter', -apple-system, sans-serif;
  width: 100%;
}

/* Left Branding Side */
.auth-left {
  width: 40%;
  min-width: 320px;
  background-color: #0B0F14;
  border-right: 1px solid #1F2933;
  padding: 48px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.brand-monogram {
  font-size: 24px;
  font-weight: 700;
  letter-spacing: -1px;
  color: #E6EDF3;
  display: flex;
  align-items: center;
  gap: 8px;
}

.brand-monogram span {
  color: #00C2A8; /* using controlled teal here for distinction from React version */
}

.brand-message {
  margin-bottom: auto;
  margin-top: 120px;
}

.brand-message h1 {
  font-size: 36px;
  font-weight: 600;
  line-height: 1.1;
  letter-spacing: -0.02em;
  color: #E6EDF3;
  margin-bottom: 20px;
}

.brand-message p {
  font-size: 16px;
  color: #8B949E;
  line-height: 1.5;
  max-width: 80%;
}

.brand-footer {
  font-size: 13px;
  color: #8B949E;
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

/* Right Form Side */
.auth-right {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
}

.auth-card {
  width: 100%;
  max-width: 400px;
  background: #11161D;
  border: 1px solid #1F2933;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  padding: 40px;
}

/* Tabs */
.auth-tabs {
  display: flex;
  gap: 20px;
  margin-bottom: 32px;
  border-bottom: 1px solid #1F2933;
  padding-bottom: 8px;
}

.auth-tab {
  background: none;
  border: none;
  padding: 0 0 8px 0;
  color: #8B949E;
  font-family: inherit;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  position: relative;
  transition: color 0.2s;
}

.auth-tab:hover {
  color: #E6EDF3;
}

.auth-tab.active {
  color: #E6EDF3;
}

.auth-tab.active::after {
  content: '';
  position: absolute;
  bottom: -9px;
  left: 0;
  width: 100%;
  height: 2px;
  background-color: #00C2A8;
}

/* Form Elements */
.auth-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-label {
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #8B949E;
}

.form-input {
  background: #0B0F14;
  border: 1px solid #1F2933;
  border-radius: 6px;
  padding: 10px 12px;
  font-family: inherit;
  font-size: 14px;
  color: #E6EDF3;
  outline: none;
  transition: border-color 0.2s;
  height: 40px;
}

.form-input:focus {
  border-color: #00C2A8;
}

.form-input.error {
  border-color: #F85149;
}

.field-error {
  font-size: 12px;
  color: #F85149;
  margin-top: 4px;
}

.password-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.password-wrapper .form-input {
  width: 100%;
  padding-right: 36px;
}

.toggle-pass {
  position: absolute;
  right: 10px;
  background: none;
  border: none;
  color: #8B949E;
  cursor: pointer;
  padding: 4px;
  display: flex;
}

.toggle-pass:hover {
  color: #E6EDF3;
}

.toggle-pass svg {
  width: 16px;
  height: 16px;
}

/* Submit Button */
.submit-btn {
  background: #00C2A8;
  color: #0b0f14;
  border: none;
  border-radius: 6px;
  height: 40px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  margin-top: 12px;
  transition: transform 0.1s, background-color 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.submit-btn:hover:not(:disabled) {
  background: #0cdbbc;
  transform: translateY(-1px);
}

.submit-btn:active:not(:disabled) {
  background: #009c87;
  transform: translateY(0);
}

.submit-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.btn-spinner {
  width: 14px;
  height: 14px;
  border: 2px solid rgba(11,15,20,0.3);
  border-top-color: #0b0f14;
  border-radius: 50%;
  animation: authSpin 0.8s linear infinite;
}

@keyframes authSpin {
  to { transform: rotate(360deg); }
}

/* API Error Alert */
.alert-error {
  background: rgba(248, 81, 73, 0.1);
  border: 1px solid rgba(248, 81, 73, 0.4);
  color: #F85149;
  padding: 12px;
  border-radius: 6px;
  font-size: 13px;
  display: flex;
  align-items: flex-start;
  gap: 8px;
}

/* Responsive */
@media (max-width: 768px) {
  .auth-page {
    flex-direction: column;
  }
  .auth-left {
    width: 100%;
    min-height: 200px;
    padding: 32px;
    border-right: none;
    border-bottom: 1px solid #1F2933;
  }
  .brand-message {
    margin-top: 32px;
  }
  .auth-right {
    padding: 24px;
    align-items: flex-start;
  }
}
</style>
