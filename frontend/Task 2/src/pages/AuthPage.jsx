import React, { useState } from 'react'
import { useDispatch } from 'react-redux'
import { login, register } from '../store/authSlice'
import './Auth.css'

function validate(tab, form) {
  const errs = {}
  if (!form.username.trim()) errs.username = 'Username is required.'
  else if (form.username.length < 3) errs.username = 'At least 3 characters.'

  if (!form.password) errs.password = 'Password is required.'
  else if (form.password.length < 8) errs.password = 'At least 8 characters.'

  if (tab === 'register') {
    if (!form.email.trim()) errs.email = 'Email is required.'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Enter a valid email.'
    if (!form.confirmPassword) errs.confirmPassword = 'Please confirm your password.'
    else if (form.password !== form.confirmPassword) errs.confirmPassword = 'Passwords do not match.'
  }
  return errs
}

export default function AuthPage() {
  const [tab, setTab] = useState('login')
  const [form, setForm] = useState({ username: '', email: '', password: '', confirmPassword: '' })
  const [errors, setErrors] = useState({})
  const [apiError, setApiError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)
  const dispatch = useDispatch()

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }))
    setErrors((er) => ({ ...er, [e.target.name]: '' }))
    setApiError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate(tab, form)
    if (Object.keys(errs).length) { setErrors(errs); return }
    setIsLoading(true)
    setApiError('')
    try {
      let resultAction
      if (tab === 'login') {
        resultAction = await dispatch(login({ username: form.username, password: form.password }))
      } else {
        resultAction = await dispatch(register({ username: form.username, email: form.email, password: form.password, confirmPassword: form.confirmPassword }))
      }
      if (resultAction.error) {
        throw resultAction.payload || resultAction.error
      }
    } catch (err) {
      const data = err.response?.data
      if (!data) setApiError(err.message || 'Network error or server unreachable.')
      else if (typeof data === 'string') setApiError(data)
      else if (data?.error) setApiError(data.error)
      else if (data?.non_field_errors) setApiError(data.non_field_errors[0])
      else if (data?.detail) setApiError(data.detail)
      else if (data?.username) setApiError('Username: ' + data.username[0])
      else if (data?.email) setApiError('Email: ' + data.email[0])
      else if (data?.password) setApiError('Password: ' + data.password[0])
      else if (data?.password_confirm) setApiError('Password Confirm: ' + data.password_confirm[0])
      else setApiError('Authentication failed. Please check your inputs.')
    } finally {
      setIsLoading(false)
    }
  }

  const switchTab = (t) => {
    if (tab === t) return
    setTab(t)
    setErrors({})
    setApiError('')
    setForm({ username: '', email: '', password: '', confirmPassword: '' })
  }

  return (
    <div className="auth-page">
      
      {/* Left Column: Branding */}
      <div className="auth-left">
        <div className="brand-monogram">
          TF<span>.</span>
        </div>
        
        <div className="brand-message">
          <h1>{tab === 'login' ? 'Welcome back.' : 'Start building.'}</h1>
          <p>A simple, reliable task manager to help you stay organized and focused.</p>
        </div>
        
        <div className="brand-footer">
          Version 1.0.0
        </div>
      </div>

      {/* Right Column: Form */}
      <div className="auth-right">
        <div className="auth-card">
          <div className="auth-tabs">
            <button
              className={`auth-tab ${tab === 'login' ? 'active' : ''}`}
              onClick={() => switchTab('login')}
              type="button"
            >
              Sign In
            </button>
            <button
              className={`auth-tab ${tab === 'register' ? 'active' : ''}`}
              onClick={() => switchTab('register')}
              type="button"
            >
              Register
            </button>
          </div>

          <form onSubmit={handleSubmit} noValidate className="auth-form">
            <div className="form-group">
              <label htmlFor="username" className="form-label">Username</label>
              <input
                id="username"
                name="username"
                type="text"
                className={`form-input ${errors.username ? 'error' : ''}`}
                value={form.username}
                onChange={handleChange}
                autoComplete="username"
                autoFocus
              />
              {errors.username && <span className="field-error">{errors.username}</span>}
            </div>

            {tab === 'register' && (
              <div className="form-group">
                <label htmlFor="email" className="form-label">Email</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  className={`form-input ${errors.email ? 'error' : ''}`}
                  value={form.email}
                  onChange={handleChange}
                  autoComplete="email"
                />
                {errors.email && <span className="field-error">{errors.email}</span>}
              </div>
            )}

            <div className="form-group">
              <label htmlFor="password" className="form-label">Password</label>
              <div className="password-wrapper">
                <input
                  id="password"
                  name="password"
                  type={showPass ? 'text' : 'password'}
                  className={`form-input ${errors.password ? 'error' : ''}`}
                  value={form.password}
                  onChange={handleChange}
                  autoComplete={tab === 'login' ? 'current-password' : 'new-password'}
                />
                <button type="button" className="toggle-pass" onClick={() => setShowPass(!showPass)} tabIndex={-1} aria-label="Toggle Password">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    {showPass ? (
                      <><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></>
                    ) : (
                      <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></>
                    )}
                  </svg>
                </button>
              </div>
              {errors.password && <span className="field-error">{errors.password}</span>}
            </div>

            {tab === 'register' && (
              <div className="form-group">
                <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  className={`form-input ${errors.confirmPassword ? 'error' : ''}`}
                  value={form.confirmPassword}
                  onChange={handleChange}
                  autoComplete="new-password"
                />
                {errors.confirmPassword && <span className="field-error">{errors.confirmPassword}</span>}
              </div>
            )}

            {apiError && (
              <div className="alert-error">
                {apiError}
              </div>
            )}

            <button type="submit" className="submit-btn" disabled={isLoading}>
              {isLoading && <span className="btn-spinner" />}
              {tab === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
