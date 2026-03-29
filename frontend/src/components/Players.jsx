import { useState, useEffect } from 'react'
import { api } from '../api'

const AVATAR_STYLES = [
  { color: '#00f5ff', bg: 'rgba(0,245,255,0.08)' },
  { color: '#39ff14', bg: 'rgba(57,255,20,0.08)' },
  { color: '#ff00ff', bg: 'rgba(255,0,255,0.08)' },
  { color: '#ffe000', bg: 'rgba(255,224,0,0.08)' },
  { color: '#ff6600', bg: 'rgba(255,102,0,0.08)' },
  { color: '#ff3131', bg: 'rgba(255,49,49,0.08)' },
]

function Avatar({ username, index }) {
  const { color, bg } = AVATAR_STYLES[index % AVATAR_STYLES.length]
  return (
    <div
      className="player-avatar"
      style={{ borderColor: color, background: bg, boxShadow: `0 0 12px ${color}33` }}
    >
      <span style={{ color, textShadow: `0 0 8px ${color}`, fontSize: '0.75rem' }}>
        {username.slice(0, 2).toUpperCase()}
      </span>
    </div>
  )
}

export default function Players() {
  const [players,    setPlayers]    = useState([])
  const [loading,    setLoading]    = useState(true)
  const [error,      setError]      = useState(null)
  const [showForm,   setShowForm]   = useState(false)
  const [form,       setForm]       = useState({ username: '', email: '' })
  const [submitting, setSubmitting] = useState(false)
  const [formError,  setFormError]  = useState(null)
  const [deletingId, setDeletingId] = useState(null)
  const [gameOver,   setGameOver]   = useState(false)

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    setError(null)
    try {
      setPlayers(await api.getPlayers())
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('DELETE THIS PLAYER?')) return
    setDeletingId(id)
    try {
      await api.deletePlayer(id)
      setGameOver(true)
      setTimeout(() => {
        setGameOver(false)
        setPlayers((prev) => prev.filter((p) => p.id !== id))
      }, 1400)
    } catch (e) {
      alert(e.message)
    } finally {
      setDeletingId(null)
    }
  }

  async function handleAdd(e) {
    e.preventDefault()
    setSubmitting(true)
    setFormError(null)
    try {
      const player = await api.createPlayer(form)
      setPlayers((prev) => [...prev, player])
      setForm({ username: '', email: '' })
      setShowForm(false)
    } catch (e) {
      setFormError(e.message)
    } finally {
      setSubmitting(false)
    }
  }

  const set = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }))

  return (
    <section>
      {gameOver && (
        <div className="game-over-overlay">
          <span className="game-over-text">GAME OVER</span>
        </div>
      )}

      <div className="panel">
        <div className="pixel-corner tl" />
        <div className="pixel-corner tr" />
        <div className="pixel-corner bl" />
        <div className="pixel-corner br" />

        <div className="panel-header">
          <span className="panel-title">◈ ACTIVE PLAYERS ◈</span>
          <button
            className="btn btn-green btn-sm"
            onClick={() => { setShowForm((v) => !v); setFormError(null) }}
          >
            {showForm ? '✕ CANCEL' : '+ NEW PLAYER'}
          </button>
        </div>

        {showForm && (
          <div style={{ padding: '1rem 1.4rem', borderBottom: '1px solid rgba(0,245,255,0.1)' }}>
            <form className="arcade-form" onSubmit={handleAdd}>
              {formError && (
                <div className="alert alert-error">⚠ {formError}</div>
              )}
              <div className="two-col">
                <div className="form-group">
                  <label className="form-label">USERNAME</label>
                  <input
                    className="form-input"
                    value={form.username}
                    onChange={set('username')}
                    placeholder="ENTER NAME..."
                    required
                    minLength={3}
                    maxLength={30}
                    autoFocus
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">EMAIL</label>
                  <input
                    className="form-input"
                    type="email"
                    value={form.email}
                    onChange={set('email')}
                    placeholder="player@arcade.com"
                    required
                  />
                </div>
              </div>
              <div>
                <button type="submit" className="btn btn-green" disabled={submitting}>
                  {submitting ? '▶ REGISTERING...' : '▶ REGISTER PLAYER'}
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="panel-body">
          {loading && <div className="loading-text">LOADING...</div>}
          {error   && <div className="alert alert-error">⚠ SYSTEM ERROR: {error}</div>}

          {!loading && !error && players.length === 0 && (
            <div className="empty-state">NO PLAYERS REGISTERED</div>
          )}

          {!loading && !error && players.length > 0 && (
            <div className="players-grid">
              {players.map((p, i) => {
                const joined = p.created_at ? p.created_at.split(' ')[0] : '—'
                return (
                  <div
                    key={p.id}
                    className="player-card"
                    style={{ animationDelay: `${i * 0.07}s` }}
                  >
                    <Avatar username={p.username} index={i} />
                    <div className="player-username">{p.username}</div>
                    <div className="player-email">{p.email}</div>
                    <div className="player-meta">
                      ID: #{String(p.id).padStart(3, '0')}<br />
                      JOINED: {joined}
                    </div>
                    <div className="player-card-actions">
                      <button
                        className="btn btn-red btn-sm"
                        onClick={() => handleDelete(p.id)}
                        disabled={deletingId === p.id}
                      >
                        {deletingId === p.id ? '...' : '✕ DELETE'}
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
