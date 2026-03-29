async function request(url, options = {}) {
  const res = await fetch(url, options)
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }))
    throw new Error(err.detail || `HTTP ${res.status}`)
  }
  return res.json()
}

export const api = {
  getPlayers: () => request('/players/'),
  createPlayer: (data) =>
    request('/players/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }),
  deletePlayer: (id) => request(`/players/${id}`, { method: 'DELETE' }),

  getTopScores: (limit = 10) => request(`/scores/top?limit=${limit}`),
  getScores: (params = {}) => {
    const q = new URLSearchParams(
      Object.fromEntries(
        Object.entries(params).filter(([, v]) => v !== '' && v != null)
      )
    ).toString()
    return request(`/scores/${q ? '?' + q : ''}`)
  },
  createScore: (data) =>
    request('/scores/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }),
  deleteScore: (id) => request(`/scores/${id}`, { method: 'DELETE' }),
}
