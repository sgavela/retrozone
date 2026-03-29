import { useState, useEffect } from 'react'
import { api } from '../api'

const MEDALS  = ['🥇', '🥈', '🥉']
const ORDINALS = ['1ST','2ND','3RD','4TH','5TH','6TH','7TH','8TH','9TH','10TH']

function ordinal(n) {
  return ORDINALS[n - 1] ?? `${n}TH`
}

function rankClass(n) {
  if (n === 1) return 'rank-1'
  if (n === 2) return 'rank-2'
  if (n === 3) return 'rank-3'
  return 'rank-n'
}

function rowClass(n) {
  if (n <= 3) return `lb-row top-${n}`
  return 'lb-row'
}

export default function Leaderboard() {
  const [scores,  setScores]  = useState([])
  const [players, setPlayers] = useState({})
  const [games,   setGames]   = useState([])
  const [filter,  setFilter]  = useState('ALL')
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const [rawScores, rawPlayers] = await Promise.all([
        api.getTopScores(50).catch((e) => {
          if (e.message.toLowerCase().includes('no scores')) return []
          throw e
        }),
        api.getPlayers(),
      ])
      setScores(rawScores)
      const map = {}
      rawPlayers.forEach((p) => { map[p.id] = p.username })
      setPlayers(map)
      setGames([...new Set(rawScores.map((s) => s.game_name))])
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const visible = (filter === 'ALL' ? scores : scores.filter((s) => s.game_name === filter))
    .slice(0, 20)
    .map((s, i) => ({ ...s, rank: i + 1 }))

  return (
    <section>
      <div className="panel">
        <div className="pixel-corner tl" />
        <div className="pixel-corner tr" />
        <div className="pixel-corner bl" />
        <div className="pixel-corner br" />

        <div className="panel-header">
          <span className="panel-title">◈ HIGH SCORES ◈</span>
          <div className="lb-filters">
            <button
              className={`lb-filter-btn${filter === 'ALL' ? ' active' : ''}`}
              onClick={() => setFilter('ALL')}
            >
              ALL GAMES
            </button>
            {games.map((g) => (
              <button
                key={g}
                className={`lb-filter-btn${filter === g ? ' active' : ''}`}
                onClick={() => setFilter(g)}
              >
                {g}
              </button>
            ))}
          </div>
        </div>

        <div className="panel-body" style={{ padding: '0.5rem 0.8rem 1rem' }}>
          {loading && <div className="loading-text">LOADING...</div>}
          {error   && <div className="alert alert-error">⚠ SYSTEM ERROR: {error}</div>}

          {!loading && !error && visible.length === 0 && (
            <div className="empty-state">NO SCORES YET — BE THE FIRST TO PLAY!</div>
          )}

          {!loading && !error && visible.length > 0 && (
            <table className="lb-table">
              <thead>
                <tr>
                  <th style={{ width: 72 }}>RANK</th>
                  <th>PLAYER</th>
                  <th>GAME</th>
                  <th className="r">SCORE</th>
                  <th className="r" style={{ width: 60 }}>LVL</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((s, i) => (
                  <tr
                    key={s.id}
                    className={rowClass(s.rank)}
                    style={{ animationDelay: `${i * 0.05}s` }}
                  >
                    <td>
                      <span className={`rank-badge ${rankClass(s.rank)}`}>
                        {s.rank <= 3 ? MEDALS[s.rank - 1] + ' ' : ''}
                        {ordinal(s.rank)}
                      </span>
                    </td>
                    <td className="col-player">
                      {players[s.player_id] ?? `P${s.player_id}`}
                    </td>
                    <td className="col-game">{s.game_name}</td>
                    <td className="r">
                      <span
                        className="col-score"
                        style={{ animationDelay: `${i * 0.05 + 0.1}s` }}
                      >
                        {s.points.toLocaleString()}
                      </span>
                    </td>
                    <td className="r col-level">
                      {String(s.level).padStart(2, '0')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </section>
  )
}
