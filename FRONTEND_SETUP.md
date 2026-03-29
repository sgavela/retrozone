# RetroZone Arcade — Frontend

React frontend con estética retro arcade para la API FastAPI de RetroZone.

## Stack

| Pieza | Tecnología |
|-------|------------|
| UI    | React 18 + Vite |
| Estilos | CSS puro (sin librerías) |
| Fuente | Press Start 2P (Google Fonts) |
| API | `fetch` nativo con proxy Vite |

## Requisitos previos

### Node.js 18+

**Ubuntu/Debian (recomendado via nvm):**
```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
source ~/.bashrc
nvm install 18
nvm use 18
```

**Ubuntu/Debian (via apt):**
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs
```

**macOS (via Homebrew):**
```bash
brew install node@18
```

**Windows:** descarga el instalador LTS desde [nodejs.org](https://nodejs.org)

Verifica la instalación:
```bash
node --version  # debe mostrar v18.x.x o superior
npm --version
```

### Backend FastAPI corriendo en `http://localhost:8000`

## Arranque rápido

```bash
# Terminal 1 — backend (desde la raíz del proyecto)
uvicorn main:app --reload

# Terminal 2 — frontend
cd frontend
npm install
npm run dev
```

Abre **http://localhost:5173**

## Estructura

```
frontend/
├── index.html              # HTML de entrada + Google Fonts
├── package.json
├── vite.config.js          # Config Vite + proxy API
└── src/
    ├── main.jsx            # Punto de entrada React
    ├── App.jsx             # Componente raíz + routing por tabs
    ├── index.css           # Todos los estilos: scanlines, neón, animaciones
    ├── api.js              # Wrappers fetch para todos los endpoints
    └── components/
        ├── StarField.jsx   # Fondo animado de estrellas (canvas)
        ├── Header.jsx      # Header sticky: título, reloj, tabs de navegación
        ├── Leaderboard.jsx # Tabla de puntuaciones con filtro por juego
        ├── Players.jsx     # Grid de jugadores con alta/baja
        └── ScoreForm.jsx   # Formulario de nueva puntuación
```
