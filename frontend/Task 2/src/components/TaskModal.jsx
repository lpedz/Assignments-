import React, { useState, useEffect, useRef } from 'react'
import './TaskModal.css'

const MAX_TITLE = 100
const MAX_DESC = 500

function validate(form) {
  const errs = {}
  if (!form.title.trim()) errs.title = 'Title is required.'
  else if (form.title.trim().length < 2) errs.title = 'Title must be at least 2 characters.'
  else if (form.title.length > MAX_TITLE) errs.title = `Max ${MAX_TITLE} characters.`
  if (form.description.length > MAX_DESC) errs.description = `Max ${MAX_DESC} characters.`
  return errs
}

export default function TaskModal({ task, onSave, onClose }) {
  const [form, setForm] = useState({
    title: task?.title || '',
    description: task?.description || '',
    completed: task?.completed || false,
  })
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)

  const titleRef = useRef(null)

  useEffect(() => {
    const timer = setTimeout(() => titleRef.current?.focus(), 100)
    return () => clearTimeout(timer)
  }, [])

  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm((f) => ({ ...f, [name]: type === 'checkbox' ? checked : value }))
    setErrors((er) => ({ ...er, [name]: '' }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate(form)
    if (Object.keys(errs).length) { setErrors(errs); return }
    setIsLoading(true)
    try {
      await onSave({ title: form.title.trim(), description: form.description.trim(), completed: form.completed })
    } finally {
      setIsLoading(false)
    }
  }

  const isEdit = !!task

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-card">
        <div className="modal-header">
          <h2 className="modal-title">{isEdit ? 'Edit Task' : 'New Task'}</h2>
          <button className="modal-close" onClick={onClose} id="modal-close-btn" type="button">
            <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate className="modal-form">
          {/* Title */}
          <div className="form-group">
            <div className="label-row">
              <label htmlFor="modal-title" className="form-label">Title <span className="required">*</span></label>
              <span className={`char-count ${form.title.length > MAX_TITLE ? 'over' : ''}`}>
                {form.title.length}/{MAX_TITLE}
              </span>
            </div>
            <input
              ref={titleRef}
              id="modal-title"
              name="title"
              type="text"
              className={`form-input ${errors.title ? 'error' : ''}`}
              placeholder="What needs to be done?"
              value={form.title}
              onChange={handleChange}
              maxLength={MAX_TITLE + 10}
            />
            {errors.title && <span className="field-error">⚠ {errors.title}</span>}
          </div>

          {/* Description */}
          <div className="form-group">
            <div className="label-row">
              <label htmlFor="modal-desc" className="form-label">Description <span className="optional">(optional)</span></label>
              <span className={`char-count ${form.description.length > MAX_DESC ? 'over' : ''}`}>
                {form.description.length}/{MAX_DESC}
              </span>
            </div>
            <textarea
              id="modal-desc"
              name="description"
              className={`form-input form-textarea ${errors.description ? 'error' : ''}`}
              placeholder="Add more details..."
              value={form.description}
              onChange={handleChange}
              rows={4}
              maxLength={MAX_DESC + 10}
            />
            {errors.description && <span className="field-error">⚠ {errors.description}</span>}
          </div>

          {/* Completed toggle */}
          {isEdit && (
            <label className="completed-toggle">
              <div className={`toggle-switch ${form.completed ? 'on' : ''}`}>
                <input type="checkbox" name="completed" checked={form.completed} onChange={handleChange} id="completed-toggle"/>
                <span className="toggle-knob"/>
              </div>
              <span className="toggle-label">
                {form.completed ? '✅ Completed' : '⏳ Pending'}
              </span>
            </label>
          )}

          {/* Actions */}
          <div className="modal-actions">
            <button type="button" className="btn btn-ghost" onClick={onClose} id="modal-cancel-btn">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={isLoading} id="modal-save-btn">
              {isLoading && <span className="btn-spinner"/>}
              {isLoading ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
