<template>
  <div class="calc-page">
    <!-- Navbar -->
    <nav class="calc-nav">
      <div class="nav-brand">
        AX<span>.</span>
      </div>
      <div class="nav-right">
        <span class="user-chip" v-if="authStore.user">
          <span class="user-dot"></span>
          {{ authStore.user.username }}
        </span>
        <button class="btn-ghost" @click="handleLogout" id="logout-btn">
          Sign Out
        </button>
      </div>
    </nav>

    <div class="calc-container">
      
      <!-- Left column: Operational Input -->
      <div class="calc-engine">
        <div class="calc-header">
          <h2>Calculator</h2>
          <p>Perform your arithmetic operations</p>
        </div>

        <form @submit.prevent="handleSubmit" novalidate class="engine-form">
          <!-- Variables -->
          <div class="var-grid">
            <div class="form-group">
              <label for="varA" class="form-label">Value A</label>
              <input
                id="varA"
                v-model="form.a"
                type="number"
                step="any"
                class="form-input"
                :class="{ error: errors.a }"
                placeholder="0.0"
                @blur="validateVars"
              />
            </div>
            
            <div class="form-group">
              <label for="varB" class="form-label">Value B</label>
              <input
                id="varB"
                v-model="form.b"
                type="number"
                step="any"
                class="form-input"
                :class="{ error: errors.b }"
                placeholder="0.0"
                @blur="validateVars"
              />
            </div>
          </div>
          
          <span v-if="errors.a || errors.b" class="field-error">
            ⚠ {{ errors.a || errors.b }}
          </span>

          <!-- Operations -->
          <div class="form-group" style="margin-top: 12px;">
            <label class="form-label">Operation</label>
            <div class="op-grid">
              <button 
                v-for="op in operations" 
                :key="op.id"
                type="button"
                class="op-btn"
                :class="{ active: form.operation === op.id }"
                @click="form.operation = op.id"
                :id="`op-${op.id}`"
              >
                <span class="op-symbol">{{ op.symbol }}</span>
                <span class="op-name">{{ op.name }}</span>
              </button>
            </div>
          </div>

          <div v-if="calcStore.error" class="alert-error" style="margin-top:8px;">
            {{ calcStore.error }}
          </div>

          <!-- Execute -->
          <button type="submit" class="submit-btn" :disabled="calcStore.isLoading" id="calc-submit-btn">
            <span v-if="calcStore.isLoading" class="btn-spinner"></span>
            {{ calcStore.isLoading ? 'Computing...' : 'Calculate' }}
          </button>
        </form>

        <!-- Current Output -->
        <div class="output-panel" v-if="calcStore.result !== null">
          <span class="output-label">OUT  > </span>
          <span class="output-value" :class="{ 'is-error': typeof calcStore.result === 'string' && calcStore.result.includes('rror') }">
            {{ formatResult(calcStore.result) }}
          </span>
        </div>
      </div>

      <!-- Right column: Persistence Log -->
      <div class="calc-ledger">
        <div class="ledger-header">
          <h3 class="form-label">History</h3>
          <button v-if="calcStore.history.length > 0" class="btn-ghost btn-sm" @click="calcStore.clearHistory()">
            Clear
          </button>
        </div>
        
        <div class="ledger-body">
          <div v-if="calcStore.history.length === 0" class="ledger-empty">
            No operations logged.
          </div>
          <div 
            v-else 
            v-for="item in calcStore.history" 
            :key="item.id"
            class="ledger-entry"
            :class="{ 'entry-error': typeof item.result === 'string' && item.result.includes('rror') }"
          >
            <div class="entry-math" v-if="item.a !== undefined">
              <span class="var">{{ item.a }}</span>
              <span class="op">{{ getOpSymbol(item.op) }}</span>
              <span class="var">{{ item.b }}</span>
              <span class="eq">=</span>
              <span class="res">{{ formatResult(item.result) }}</span>
            </div>
            <div class="entry-math" v-else>
              <span class="res">{{ item.expression }}</span>
            </div>
            <div class="entry-meta">
              {{ item.timestamp }}
            </div>
          </div>
        </div>
      </div>
      
    </div>
  </div>
</template>

<script setup>
import { reactive, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useCalculatorStore } from '../stores/calculator'

const router = useRouter()
const authStore = useAuthStore()
const calcStore = useCalculatorStore()

const operations = [
  { id: 'add', symbol: '+', name: 'Add' },
  { id: 'subtract', symbol: '−', name: 'Subtract' },
  { id: 'multiply', symbol: '×', name: 'Multiply' },
  { id: 'divide', symbol: '÷', name: 'Divide' }
]

const form = reactive({ a: '', b: '', operation: 'add' })
const errors = reactive({ a: '', b: '' })

watch(
  () => calcStore.error,
  (newVal) => {
    // Attempt auto-clear when token expires
    if (newVal && newVal.includes('token is invalid')) {
      authStore.logout()
      router.push('/login')
    }
  }
)

function getOpSymbol(opId) {
  const f = operations.find((o) => o.id === opId)
  return f ? f.symbol : '?'
}

function formatResult(val) {
  if (typeof val === 'number') {
    return Number.isInteger(val) ? val.toString() : val.toFixed(4)
  }
  return val
}

function validateVars() {
  errors.a = form.a === '' || isNaN(form.a) ? 'Missing Value A.' : ''
  errors.b = form.b === '' || isNaN(form.b) ? 'Missing Value B.' : ''
  if (form.operation === 'divide' && parseFloat(form.b) === 0) {
    errors.b = 'Zero division error.'
  }
  return !errors.a && !errors.b
}

async function handleSubmit() {
  if (!validateVars()) return
  await calcStore.calculate(form.operation, parseFloat(form.a), parseFloat(form.b))
}

function handleLogout() {
  authStore.logout()
  router.push('/login')
}
</script>

<style scoped>
.calc-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #0B0F14;
}

/* Navbar */
.calc-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 32px;
  background: #0B0F14;
  border-bottom: 1px solid #1F2933;
}

.nav-brand {
  font-size: 18px;
  font-weight: 700;
  letter-spacing: -0.5px;
  color: #E6EDF3;
}

.nav-brand span {
  color: #00C2A8;
}

.nav-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.user-chip {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 500;
  color: #8B949E;
}

.user-dot {
  width: 6px;
  height: 6px;
  background: #00C2A8;
  border-radius: 50%;
}

.btn-ghost {
  background: none;
  border: 1px solid transparent;
  color: #8B949E;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 13px;
  cursor: pointer;
  transition: color 0.1s;
}
.btn-ghost:hover { color: #E6EDF3; }

/* Asymmetrical Layout */
.calc-container {
  display: flex;
  flex: 1;
  max-width: 1000px;
  margin: 0 auto;
  width: 100%;
  padding: 48px 24px;
  gap: 32px;
}

.calc-engine {
  flex: 1.2;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.calc-ledger {
  flex: 1;
  background: #11161D;
  border: 1px solid #1F2933;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  height: fit-content;
  max-height: calc(100vh - 180px);
}

/* Engine Styles */
.calc-header h2 {
  font-size: 24px;
  font-weight: 600;
  color: #E6EDF3;
}

.calc-header p {
  font-size: 13px;
  color: #8B949E;
  margin-top: 4px;
}

.engine-form {
  background: #11161D;
  border: 1px solid #1F2933;
  border-radius: 8px;
  padding: 32px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.var-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
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
  height: 40px;
  transition: border-color 0.1s;
}

.form-input:focus { border-color: #00C2A8; }
.form-input.error { border-color: #F85149; }
.field-error { font-size: 12px; color: #F85149; }

.op-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}

.op-btn {
  background: #0B0F14;
  border: 1px solid #1F2933;
  border-radius: 6px;
  padding: 10px;
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  color: #8B949E;
  transition: all 0.1s;
}

.op-btn:hover { border-color: #303F50; color: #E6EDF3; }

.op-btn.active {
  background: rgba(0, 194, 168, 0.1);
  border-color: #00C2A8;
  color: #00C2A8;
}

.op-symbol {
  font-size: 18px;
  font-weight: 700;
  font-family: monospace;
  width: 20px;
}

.op-name {
  font-size: 13px;
  font-weight: 500;
}

.submit-btn {
  background: #00C2A8;
  color: #0b0f14;
  border: none;
  border-radius: 6px;
  height: 40px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  margin-top: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}
.submit-btn:hover:not(:disabled) { background: #0cdbbc; transform: translateY(-1px); }
.submit-btn:disabled { opacity: 0.7; cursor: not-allowed; }

.btn-spinner {
  width: 14px;
  height: 14px;
  border: 2px solid rgba(11,15,20,0.3);
  border-top-color: #0b0f14;
  border-radius: 50%;
  animation: authSpin 0.8s linear infinite;
}
@keyframes authSpin { to { transform: rotate(360deg); } }

.output-panel {
  background: transparent;
  border-left: 2px solid #00C2A8;
  padding: 8px 16px;
  font-family: monospace;
  font-size: 16px;
}
.output-label { color: #8B949E; font-weight: bold; }
.output-value { color: #E6EDF3; font-weight: bold; }
.output-value.is-error { color: #F85149; }

.alert-error {
  background: rgba(248, 81, 73, 0.1);
  border: 1px solid rgba(248, 81, 73, 0.4);
  color: #F85149;
  padding: 12px;
  border-radius: 6px;
  font-size: 13px;
}

/* Ledger Styles */
.ledger-header {
  padding: 16px 20px;
  border-bottom: 1px solid #1F2933;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.ledger-body {
  padding: 12px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.ledger-empty {
  font-size: 13px;
  color: #8B949E;
  padding: 24px;
  text-align: center;
}

.ledger-entry {
  display: flex;
  flex-direction: column;
  padding: 12px 14px;
  background: #0B0F14;
  border: 1px solid transparent;
  border-radius: 6px;
  gap: 4px;
}

.ledger-entry:hover {
  border-color: #1F2933;
}

.entry-math {
  font-family: monospace;
  font-size: 14px;
  color: #8B949E;
  display: flex;
  gap: 6px;
}

.entry-math .op, .entry-math .eq { color: #E6EDF3; }
.entry-math .res { color: #00C2A8; font-weight: bold; }
.ledger-entry.entry-error .res { color: #F85149; }

.entry-meta {
  font-size: 10px;
  color: #484F58;
}

/* Responsive */
@media (max-width: 768px) {
  .calc-container {
    flex-direction: column;
    padding: 24px 16px;
  }
}
</style>
