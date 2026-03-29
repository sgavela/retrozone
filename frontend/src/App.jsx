import { useState } from 'react'
import StarField from './components/StarField'
import Header from './components/Header'
import Leaderboard from './components/Leaderboard'
import Players from './components/Players'
import ScoreForm from './components/ScoreForm'
import './index.css'

export default function App() {
  const [tab, setTab] = useState('leaderboard')

  return (
    <div className="app">
      <StarField />
      <Header tab={tab} setTab={setTab} />
      <main className="main-content">
        {tab === 'leaderboard' && <Leaderboard />}
        {tab === 'players'     && <Players />}
        {tab === 'scores'      && <ScoreForm />}
      </main>
      <footer className="arcade-footer">
        <span className="blink">
          © RETROZONE ARCADE — ALL RIGHTS RESERVED — PLAY AT YOUR OWN RISK
        </span>
      </footer>
    </div>
  )
}
