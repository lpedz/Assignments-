import React, { useEffect, useState, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { logout } from '../store/authSlice'
import { fetchTasks, createTask, updateTask, toggleComplete, deleteTaskAction, clearError } from '../store/taskSlice'
import TaskModal from '../components/TaskModal'
import './Tasks.css'

const FILTERS = ['All', 'Pending', 'Completed']

export default function TasksPage() {
  const dispatch = useDispatch()
  const user = useSelector((s) => s.auth.user)
  const { items: tasks, isLoading, error } = useSelector((s) => s.tasks)

  const [modal, setModal] = useState(null) // null | 'create' | task-object
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [filter, setFilter] = useState('All')
  const [search, setSearch] = useState('')
  const [toastMsg, setToastMsg] = useState('')
  const [isSaving, setSaving] = useState(false)
  const [isDeleting, setDeleting] = useState(false)

  useEffect(() => {
    dispatch(fetchTasks())
  }, [dispatch])

  const showToast = (msg) => {
    setToastMsg(msg)
    setTimeout(() => setToastMsg(''), 3000)
  }

  const filtered = useMemo(() => {
    return tasks.filter((t) => {
      const matchFilter =
        filter === 'All' ||
        (filter === 'Completed' && t.completed) ||
        (filter === 'Pending' && !t.completed)
      const matchSearch =
        !search ||
        t.title.toLowerCase().includes(search.toLowerCase()) ||
        t.description?.toLowerCase().includes(search.toLowerCase())
      return matchFilter && matchSearch
    })
  }, [tasks, filter, search])

  const stats = useMemo(() => ({
    total: tasks.length,
    completed: tasks.filter((t) => t.completed).length,
    pending: tasks.filter((t) => !t.completed).length,
  }), [tasks])

  const handleSave = async (data) => {
    setSaving(true)
    try {
      if (modal === 'create') {
        const resultAction = await dispatch(createTask(data))
        if (resultAction.error) throw resultAction.payload || resultAction.error
        showToast('✅ Task created!')
      } else {
        const resultAction = await dispatch(updateTask({ id: modal.id, data }))
        if (resultAction.error) throw resultAction.payload || resultAction.error
        showToast('✅ Task updated!')
      }
      setModal(null)
    } catch (e) {
      showToast('❌ ' + (e?.response?.data?.title?.[0] || e?.message || 'Something went wrong.'))
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteConfirm) return
    setDeleting(true)
    try {
      const resultAction = await dispatch(deleteTaskAction(deleteConfirm.id))
      if (resultAction.error) throw resultAction.payload || resultAction.error
      setDeleteConfirm(null)
      showToast('🗑 Task deleted.')
    } catch {
      showToast('❌ Delete failed.')
    } finally {
      setDeleting(false)
    }
  }

  const handleToggle = (task) => {
    dispatch(toggleComplete(task))
  }

  const handleLogout = () => {
    dispatch(logout())
  }

  return (
    <div className="tasks-page">
      {/* Navbar */}
      <nav className="tasks-nav">
        <div className="nav-brand">
          <span className="nav-brand-name">TF<span>.</span></span>
        </div>
        <div className="nav-right">
          {user && (
            <span className="user-chip">
              <span className="user-dot" />
              {user.username}
            </span>
          )}
          <button id="logout-btn" className="btn btn-ghost btn-sm" onClick={handleLogout}>
            <svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
            </svg>
            Logout
          </button>
        </div>
      </nav>

      <div className="tasks-container">
        {/* Stats */}
        <div className="stats-row">
          <div className="stat-card">
            <span className="stat-num">{stats.total}</span>
            <span className="stat-label">Total</span>
          </div>
          <div className="stat-card stat-pending">
            <span className="stat-num">{stats.pending}</span>
            <span className="stat-label">Pending</span>
          </div>
          <div className="stat-card stat-done">
            <span className="stat-num">{stats.completed}</span>
            <span className="stat-label">Completed</span>
          </div>
          {stats.total > 0 && (
            <div className="progress-wrap">
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: `${Math.round((stats.completed / stats.total) * 100)}%` }}
                />
              </div>
              <span className="progress-pct">{Math.round((stats.completed / stats.total) * 100)}% done</span>
            </div>
          )}
        </div>

        {/* Toolbar */}
        <div className="toolbar">
          <div className="toolbar-left">
            <div className="search-wrap">
              <svg className="search-icon" width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
              <input
                id="search-tasks"
                type="text"
                className="search-input"
                placeholder="Search tasks..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <button type="button" className="search-clear" onClick={() => setSearch('')}>×</button>
              )}
            </div>
            <div className="filter-tabs">
              {FILTERS.map((f) => (
                <button
                  key={f}
                  type="button"
                  className={`filter-tab ${filter === f ? 'active' : ''}`}
                  onClick={() => setFilter(f)}
                  id={`filter-${f.toLowerCase()}`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
          <button
            id="create-task-btn"
            className="btn btn-primary"
            onClick={() => setModal('create')}
          >
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4"/>
            </svg>
            New Task
          </button>
        </div>

        {/* Error banner */}
        {error && (
          <div className="alert alert-error" style={{ marginBottom: 16 }}>
            <span>❌</span> {error}
            <button style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }} onClick={() => dispatch(clearError())}>×</button>
          </div>
        )}

        {/* Loading */}
        {isLoading && (
          <div className="tasks-loading">
            <div className="loading-spinner" />
            <span>Loading tasks...</span>
          </div>
        )}

        {/* Task list */}
        {!isLoading && (
          <div className="tasks-list">
            {filtered.length === 0 ? (
              <div className="tasks-empty">
                <div className="empty-icon">
                  {search ? '⌕' : filter !== 'All' ? '≡' : '∅'}
                </div>
                <h3>{search ? 'No results found' : filter !== 'All' ? `No ${filter.toLowerCase()} tasks` : 'No tasks yet'}</h3>
                <p>{search ? 'Try a different search term.' : 'Click "New Task" to get started.'}</p>
              </div>
            ) : (
              filtered.map((task) => (
                <div
                  key={task.id}
                  className={`task-card ${task.completed ? 'completed' : ''}`}
                >
                  <button
                    type="button"
                    className={`task-check ${task.completed ? 'checked' : ''}`}
                    onClick={() => handleToggle(task)}
                    id={`toggle-${task.id}`}
                    title={task.completed ? 'Mark incomplete' : 'Mark complete'}
                  >
                    {task.completed && (
                      <svg width="12" height="12" fill="none" stroke="white" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7"/>
                      </svg>
                    )}
                  </button>

                  <div className="task-body">
                    <h4 className="task-title">{task.title}</h4>
                    {task.description && (
                      <p className="task-desc">{task.description}</p>
                    )}
                    <div className="task-meta">
                      <span className={`task-badge ${task.completed ? 'badge-done' : 'badge-pending'}`}>
                        {task.completed ? 'Completed' : 'Pending'}
                      </span>
                      <span className="task-date">
                        {new Date(task.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                  </div>

                  <div className="task-actions">
                    <button
                      type="button"
                      className="task-action-btn edit-btn"
                      onClick={() => setModal(task)}
                      id={`edit-${task.id}`}
                      title="Edit task"
                    >
                      <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                      </svg>
                    </button>
                    <button
                      type="button"
                      className="task-action-btn delete-btn"
                      onClick={() => setDeleteConfirm(task)}
                      id={`delete-${task.id}`}
                      title="Delete task"
                    >
                      <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                      </svg>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Task Modal */}
      {modal && (
        <TaskModal
          task={modal === 'create' ? null : modal}
          onSave={handleSave}
          onClose={() => setModal(null)}
          isSaving={isSaving}
        />
      )}

      {/* Delete Confirm Modal */}
      {deleteConfirm && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setDeleteConfirm(null)}>
          <div className="confirm-card">
            <div className="confirm-icon">🗑</div>
            <h3>Delete Task?</h3>
            <p>Are you sure you want to delete <strong>"{deleteConfirm.title}"</strong>? This cannot be undone.</p>
            <div className="confirm-actions">
              <button type="button" className="btn-ghost btn" onClick={() => setDeleteConfirm(null)} id="confirm-cancel-btn">
                Cancel
              </button>
              <button type="button" className="btn-danger btn" onClick={handleDelete} disabled={isDeleting} id="confirm-delete-btn">
                {isDeleting && <span className="btn-spinner" />}
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toastMsg && (
        <div className="toast">{toastMsg}</div>
      )}
    </div>
  )
}
