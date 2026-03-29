import { useState, useEffect } from 'react'

const MARQUEE =
  '★ RETROZONE ARCADE ★  INSERT COIN TO CONTINUE  ★  HIGH SCORES UPDATED  ★  CHALLENGE YOUR FRIENDS  ★  NEW RECORDS AWAIT  ★  PLAY NOW  ★  '

const TABS = [
  { id: 'leaderboard', label: '▲ LEADERBOARD' },
  { id: 'players',     label: '◉ PLAYERS' },
  { id: 'scores',      label: '► NEW SCORE' },
]

export default function Header({ tab, setTab }) {
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  const hh = String(time.getHours()).padStart(2, '0')
  const mm = String(time.getMinutes()).padStart(2, '0')
  const ss = String(time.getSeconds()).padStart(2, '0')

  return (
    <header className="arcade-header">
      <div className="header-top">
        <h1 className="header-title">◄ RETROZONE ARCADE ►</h1>
        <span className="header-coin">► INSERT COIN ◄</span>
        <span className="header-clock">{hh}:{mm}:{ss}</span>
      </div>

      <nav className="nav-tabs">
        {TABS.map(({ id, label }) => (
          <button
            key={id}
            className={`nav-tab${tab === id ? ' active' : ''}`}
            onClick={() => setTab(id)}
          >
            {label}
          </button>
        ))}
      </nav>

      <div className="marquee-wrap">
        <span className="marquee-text">{MARQUEE.repeat(4)}</span>
      </div>
    </header>
  )
}
