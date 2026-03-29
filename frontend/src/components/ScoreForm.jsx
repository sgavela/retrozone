import { useState, useEffect } from 'react'
import { api } from '../api'

const PRESET_GAMES = [
  'GALAGA', 'PAC-MAN', 'STREET FIGHTER', 'DONKEY KONG',
  'SPACE INVADERS', 'TETRIS', 'ASTEROIDS', 'CENTIPEDE',
  'FROGGER', 'MORTAL KOMBAT', 'CONTRA', 'MEGA MAN',
]

const EMPTY = { player_id: '', game_name: '', points: '', level: '' }

export default function ScoreForm() {
  const [players,    setPlayers]    = useState([])
  const [form,       setForm]       = useState(EMPTY)
  const [submitting, setSubmitting] = useState(false)
  const [error,      setError]      = useState(null)
  const [success,    setSuccess]    = useState(null)
  const [loading,    setLoading]    = useState(true)

  useEffect(() => {
    api.getPlayers()
      .then((data) => { setPlayers(data); setLoading(false) })
      .catch((e) => { setError(e.message); setLoading(false) })
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    setSuccess(null)
    try {
      const result = await api.createScore({
        player_id: Number(form.player_id),
        game_name: form.game_name,
        points:    Number(form.points),
        level:     Number(form.level),
      })
      const player = players.find((p) => p.id === result.player_id)
      setSuccess(
        `${(player?.username ?? 'PLAYER').toUpperCase()} — ${result.game_name.toUpperCase()} — ${result.points.toLocaleString()} PTS`
      )
      setForm(EMPTY)
    } catch (e) {
      setError(e.message)
    } finally {
      setSubmitting(false)
    }
  }

  const set = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }))

  return (
    <section>
      <div className="panel">
        <div className="pixel-corner tl" />
        <div className="pixel-corner tr" />
        <div className="pixel-corner bl" />
        <div className="pixel-corner br" />

        <div className="panel-header">
          <span className="panel-title">◈ SUBMIT HIGH SCORE ◈</span>
          <span style={{ fontSize: '0.42rem', color: 'rgba(0,245,255,0.35)', letterSpacing: '0.15em' }}>
            ENTER YOUR INITIALS
          </span>
        </div>

        <div className="panel-body">
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{
              fontSize: 'clamp(0.55rem, 2vw, 0.85rem)',
              color: '#ffe000',
              textShadow: '0 0 12px #ffe000, 0 0 24px #ffe000',
              letterSpacing: '0.2em',
              animation: 'neon-pulse 2s ease-in-out infinite',
            }}>
              ▶▶ NEW HIGH SCORE ◀◀
            </div>
          </div>

          {error   && <div className="alert alert-error"   style={{ marginBottom: '1.2rem' }}>⚠ {error}</div>}
          {success && (
            <div className="alert alert-success" style={{ marginBottom: '1.2rem', textAlign: 'center' }}>
              ★★★ SCORE RECORDED! ★★★<br />
              <span style={{ fontSize: '0.55rem', color: '#39ff14' }}>{success}</span>
            </div>
          )}

          {loading ? (
            <div className="loading-text">LOADING PLAYERS...</div>
          ) : (
            <form
              className="arcade-form"
              onSubmit={handleSubmit}
              style={{ maxWidth: 500, margin: '0 auto' }}
            >
              <div className="form-group">
                <label className="form-label">SELECT PLAYER</label>
                <select
                  className="form-select"
                  value={form.player_id}
                  onChange={set('player_id')}
                  required
                >
                  <option value="">— SELECT PLAYER —</option>
                  {players.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.username.toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">GAME TITLE</label>
                <input
                  className="form-input"
                  list="games-list"
                  value={form.game_name}
                  onChange={set('game_name')}
                  placeholder="GALAGA, PAC-MAN, ..."
                  required
                  maxLength={50}
                />
                <datalist id="games-list">
                  {PRESET_GAMES.map((g) => <option key={g} value={g} />)}
                </datalist>
              </div>

              <div className="two-col">
                <div className="form-group">
                  <label className="form-label">SCORE</label>
                  <input
                    className="form-input"
                    type="number"
                    value={form.points}
                    onChange={set('points')}
                    placeholder="000000"
                    required
                    min={0}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">LEVEL (1-99)</label>
                  <input
                    className="form-input"
                    type="number"
                    value={form.level}
                    onChange={set('level')}
                    placeholder="01"
                    required
                    min={1}
                    max={99}
                  />
                </div>
              </div>

              <div style={{ textAlign: 'center', marginTop: '0.5rem' }}>
                <button
                  type="submit"
                  className="btn btn-yellow btn-lg"
                  disabled={submitting}
                  style={{ minWidth: 240 }}
                >
                  {submitting ? '▶ SAVING...' : '▶ SUBMIT SCORE ◀'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      <RecentScores players={players} />
    </section>
  )
}

function RecentScores({ players }) {
  const [scores,  setScores]  = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.getScores({ limit: 6 })
      .then((data) => { setScores(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const playerMap = {}
  players.forEach((p) => { playerMap[p.id] = p.username })

  if (loading || scores.length === 0) return null

  return (
    <div className="panel">
      <div className="pixel-corner tl" />
      <div className="pixel-corner tr" />
      <div className="pixel-corner bl" />
      <div className="pixel-corner br" />

      <div className="panel-header">
        <span className="panel-title">◈ RECENT SCORES ◈</span>
      </div>

      <div style={{ padding: '0.2rem 0.8rem 0.8rem' }}>
        {scores.map((s, i) => (
          <div
            key={s.id}
            className="lb-row"
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '0.65rem 0.5rem',
              fontSize: '0.48rem',
              animationDelay: `${i * 0.04}s`,
            }}
          >
            <span className="col-player">{(playerMap[s.player_id] ?? `P${s.player_id}`).toUpperCase()}</span>
            <span className="col-game">{s.game_name}</span>
            <span className="col-score">{s.points.toLocaleString()}</span>
            <span className="col-level">LVL {String(s.level).padStart(2, '0')}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
