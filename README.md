# 🕹️ Arcade Leaderboard API


> Welcome to **RetroZone**, the most popular arcade hall in the local shopping mall. The owner, a nostalgic tech enthusiast, has decided it's time to ditch the paper scoreboards on the wall and go digital. You've been hired as the backend engineering team. Your mission: build the REST API that will power RetroZone's new leaderboard system tracking players, games, and high scores across all machines in the hall.
> 
> By the end of this exercise, you will have a fully working API ready to be consumed by a management dashboard. Let's get to work.

---

## Prerequisites

Make sure you have the following installed before starting:

```bash
pip install fastapi uvicorn streamlit pydantic[email]
```

Your project structure will look like this by the end:

```
retrozone/
├── main.py
├── database.py
├── models.py
├── routers/
│   ├── players.py
│   └── scores.py
└── dashboard.py
```

---

## Part 1 — Hello, RetroZone! 👋

> **Goal:** Get a FastAPI application running, understand the project structure, explore the auto-generated docs, and make your first API call from multiple clients.

### Step 1 — Create your first FastAPI app

Create a file called `main.py` and add the following:

```python
from fastapi import FastAPI

app = FastAPI(
    title="RetroZone Arcade API",
    description="The backend powering the RetroZone arcade hall leaderboard system.",
    version="1.0.0"
)

@app.get("/")
def root():
    return {"message": "Welcome to RetroZone Arcade! 🕹️"}
```

### Step 2 — Run the server

From your terminal, inside the project folder:

```bash
uvicorn main:app --reload
```

You should see something like:

```
INFO:     Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
INFO:     Started reloader process
```

The `--reload` flag means the server restarts automatically every time you save a file. Very handy during development.

### Step 3 — Explore the auto-generated docs

FastAPI generates interactive API documentation for free. Open your browser and go to:

- **Swagger UI** → [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- **ReDoc** → [http://127.0.0.1:8000/redoc](http://127.0.0.1:8000/redoc)

Click on the `GET /` endpoint in Swagger, then click **"Try it out"** → **"Execute"**. You should see the response from your API directly in the browser.

### Step 4 — Call the API from Python

Open a Python shell or a new script and try:

```python
import requests

response = requests.get("http://127.0.0.1:8000/")
print(response.status_code)   # 200
print(response.json())        # {'message': 'Welcome to RetroZone Arcade! 🕹️'}
```

### Step 5 — Call the API from the terminal

**On Linux / macOS:**
```bash
curl http://127.0.0.1:8000/
```

**On Windows (PowerShell):**
```powershell
Invoke-WebRequest -Uri http://127.0.0.1:8000/ | Select-Object -ExpandProperty Content
```

All three clients (Swagger, Python requests, curl) return the exact same response — because they're all talking to the same HTTP server. That's the beauty of a well-defined API.

---

## Part 2 — The First Real Endpoint 🗃️

> **Goal:** Connect the API to a SQLite database and build your first real endpoint: `GET /players`, which returns all registered players from the database.

### Step 1 — Set up the database

Create a file called `database.py`:

```python
import sqlite3

DB_PATH = "retrozone.db"

def get_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row  # rows behave like dicts
    return conn

def init_db():
    conn = get_connection()
    cursor = conn.cursor()

    cursor.executescript("""
        CREATE TABLE IF NOT EXISTS players (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            username    TEXT NOT NULL UNIQUE,
            email       TEXT NOT NULL UNIQUE,
            created_at  TEXT DEFAULT (datetime('now'))
        );

        CREATE TABLE IF NOT EXISTS scores (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            player_id   INTEGER NOT NULL REFERENCES players(id),
            game_name   TEXT NOT NULL,
            points      INTEGER NOT NULL,
            level       INTEGER NOT NULL,
            created_at  TEXT DEFAULT (datetime('now'))
        );
    """)

    # Seed some initial data so the database isn't empty
    cursor.executescript("""
        INSERT OR IGNORE INTO players (username, email) VALUES
            ('shadow99',   'shadow99@mail.com'),
            ('pixel_queen', 'pixel@mail.com'),
            ('neon_rider',  'neon@mail.com');

        INSERT OR IGNORE INTO scores (player_id, game_name, points, level) VALUES
            (1, 'Galaga',     15200, 5),
            (1, 'Pac-Man',    8400,  3),
            (2, 'Galaga',     22100, 8),
            (3, 'Street Fighter', 31000, 10),
            (2, 'Street Fighter', 18500, 6);
    """)

    conn.commit()
    conn.close()
```

### Step 2 — Initialize the database on startup

Update `main.py` to call `init_db()` when the application starts:

```python
from fastapi import FastAPI
from database import init_db

app = FastAPI(
    title="RetroZone Arcade API",
    description="The backend powering the RetroZone arcade hall leaderboard system.",
    version="1.0.0"
)

@app.on_event("startup")
def on_startup():
    init_db()

@app.get("/")
def root():
    return {"message": "Welcome to RetroZone Arcade! 🕹️"}
```

### Step 3 — Build the first real endpoint

Add this directly to `main.py` for now (we'll organise into routers in Part 3):

```python
from database import get_connection

@app.get("/players")
def get_all_players():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM players")
    players = cursor.fetchall()
    conn.close()
    return [dict(player) for player in players]
```

### Step 4 — Test it

Go to [http://127.0.0.1:8000/players](http://127.0.0.1:8000/players) in your browser or Swagger. You should see the three seeded players returned as a JSON array.

Also try it with Python:

```python
import requests

response = requests.get("http://127.0.0.1:8000/players")
print(response.json())
```

---

## Part 3 — Full CRUD: All the Methods 🔧

> **Goal:** Build all the remaining endpoints for both `players` and `scores` resources.

Before diving in, reorganise your project using FastAPI **routers** to keep things clean.

### Routers setup

Create `routers/players.py`:

```python
from fastapi import APIRouter
from database import get_connection

router = APIRouter(prefix="/players", tags=["Players"])
```

Create `routers/scores.py`:

```python
from fastapi import APIRouter
from database import get_connection

router = APIRouter(prefix="/scores", tags=["Scores"])
```

Update `main.py` to include them:

```python
from fastapi import FastAPI
from database import init_db
from routers import players, scores

app = FastAPI(
    title="RetroZone Arcade API",
    description="The backend powering the RetroZone arcade hall leaderboard system.",
    version="1.0.0"
)

@app.on_event("startup")
def on_startup():
    init_db()

app.include_router(players.router)
app.include_router(scores.router)

@app.get("/")
def root():
    return {"message": "Welcome to RetroZone Arcade! 🕹️"}
```

---

### Endpoints to implement

#### Players

| Method | Path | Description | Notes |
|--------|------|-------------|-------|
| `GET` | `/players` | Get all players | Already done in Part 2 — move it to the router |
| `GET` | `/players/{player_id}` | Get one player by ID | Path parameter |
| `POST` | `/players` | Register a new player | Request body: `username`, `email` |
| `PUT` | `/players/{player_id}` | Update a player's info | Path param + body |
| `DELETE` | `/players/{player_id}` | Remove a player | Path parameter |

#### Scores

| Method | Path | Description | Notes |
|--------|------|-------------|-------|
| `GET` | `/scores` | Get all scores | Query params: `game_name`, `min_points`, `limit` |
| `GET` | `/scores/{score_id}` | Get one score by ID | Path parameter |
| `GET` | `/players/{player_id}/scores` | All scores for a player | Path parameter, add to players router |
| `POST` | `/scores` | Submit a new score | Body: `player_id`, `game_name`, `points`, `level` |
| `PUT` | `/scores/{score_id}` | Correct a score | Path param + body |
| `DELETE` | `/scores/{score_id}` | Delete a score | Path parameter |

---

### Reference implementations

Below are two complete examples. Use them as your guide and implement the rest yourself.

#### Example A — `GET /scores` with query parameters

```python
from typing import Optional

@router.get("/")
def get_scores(
    game_name: Optional[str] = None,
    min_points: Optional[int] = None,
    limit: Optional[int] = 10
):
    conn = get_connection()
    cursor = conn.cursor()

    query = "SELECT * FROM scores WHERE 1=1"
    params = []

    if game_name:
        query += " AND game_name = ?"
        params.append(game_name)

    if min_points is not None:
        query += " AND points >= ?"
        params.append(min_points)

    query += " ORDER BY points DESC LIMIT ?"
    params.append(limit)

    cursor.execute(query, params)
    scores = cursor.fetchall()
    conn.close()
    return [dict(s) for s in scores]
```

Try it in Swagger and notice that `game_name`, `min_points` and `limit` appear automatically as optional query parameters in the UI.

#### Example B — `POST /players` with a request body

```python
from pydantic import BaseModel

class PlayerCreate(BaseModel):
    username: str
    email: str

@router.post("/")
def create_player(player: PlayerCreate):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO players (username, email) VALUES (?, ?)",
        (player.username, player.email)
    )
    conn.commit()
    new_id = cursor.lastrowid
    conn.close()
    return {"id": new_id, "username": player.username, "email": player.email}
```

Test it from Python:

```python
import requests

response = requests.post("http://127.0.0.1:8000/players", json={
    "username": "turbo_gamer",
    "email": "turbo@mail.com"
})
print(response.json())
```

Now implement all the remaining endpoints. By the end of this part you should be able to:

- Register a player and submit a score for them
- Query scores filtered by game and minimum points
- Update and delete both players and scores
- Browse all scores for a specific player

---

## Part 4 — Validation, Errors & Status Codes 🛡️

> **Goal:** Harden the API. Right now it trusts the caller completely — that's dangerous. We'll use Pydantic to validate input data, return proper HTTP status codes, and handle error cases gracefully.

### 4.1 — Pydantic validation

Pydantic models let you declare what valid input looks like. FastAPI enforces it automatically and returns a `422 Unprocessable Entity` with a clear explanation when the input is wrong — you don't have to write that logic yourself.

**Guided example — validating a new score:**

Update `models.py` (create this file):

```python
from pydantic import BaseModel, Field, EmailStr
from typing import Optional

class PlayerCreate(BaseModel):
    username: str = Field(min_length=3, max_length=30)
    email: EmailStr  # requires: pip install email-validator

class PlayerUpdate(BaseModel):
    username: Optional[str] = Field(default=None, min_length=3, max_length=30)
    email: Optional[EmailStr] = None

class ScoreCreate(BaseModel):
    player_id: int
    game_name: str = Field(min_length=1, max_length=50)
    points: int = Field(ge=0)         # greater than or equal to 0
    level: int = Field(ge=1, le=99)   # between 1 and 99

class ScoreUpdate(BaseModel):
    game_name: Optional[str] = Field(default=None, min_length=1, max_length=50)
    points: Optional[int] = Field(default=None, ge=0)
    level: Optional[int] = Field(default=None, ge=1, le=99)
```

Now update your `POST /scores` to use `ScoreCreate` from `models.py`. Try sending invalid data (negative points, empty game name) from Swagger and observe the automatic `422` response.

**Your turn:** Apply the appropriate model to every `POST` and `PUT` endpoint in both routers.

---

### 4.2 — HTTP status codes

By default FastAPI returns `200 OK` for everything that works. But there's a richer vocabulary:

| Code | Meaning | When to use |
|------|---------|-------------|
| `200` | OK | Successful GET, PUT, DELETE |
| `201` | Created | Successful POST (something new was created) |
| `400` | Bad Request | Input is syntactically valid but breaks a business rule |
| `404` | Not Found | The requested resource doesn't exist |
| `409` | Conflict | Duplicate resource (e.g. username already taken) |
| `422` | Unprocessable Entity | Pydantic validation failed (automatic) |

**Guided example — returning `201` on player creation:**

```python
from fastapi import APIRouter, status

@router.post("/", status_code=status.HTTP_201_CREATED)
def create_player(player: PlayerCreate):
    ...
```

**Your turn:** Go through every endpoint and assign the correct `status_code`. Pay special attention to `POST` endpoints.

---

### 4.3 — Error handling with HTTPException

When something goes wrong, don't return an empty response or crash — raise an `HTTPException` with a meaningful message.

**Guided example — `GET /players/{player_id}`:**

```python
from fastapi import HTTPException, status

@router.get("/{player_id}")
def get_player(player_id: int):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM players WHERE id = ?", (player_id,))
    player = cursor.fetchone()
    conn.close()

    if player is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Player with id {player_id} not found."
        )

    return dict(player)
```

**Guided example — `POST /players` with duplicate username detection:**

```python
import sqlite3

@router.post("/", status_code=status.HTTP_201_CREATED)
def create_player(player: PlayerCreate):
    conn = get_connection()
    cursor = conn.cursor()
    try:
        cursor.execute(
            "INSERT INTO players (username, email) VALUES (?, ?)",
            (player.username, player.email)
        )
        conn.commit()
        new_id = cursor.lastrowid
        conn.close()
        return {"id": new_id, "username": player.username, "email": player.email}
    except sqlite3.IntegrityError:
        conn.close()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Username '{player.username}' or email is already taken."
        )
```

**Your turn:** Add proper `HTTPException` handling to:

- `GET /players/{player_id}` — 404 if not found ✅ (done above, use as reference)
- `GET /scores/{score_id}` — 404 if not found
- `GET /players/{player_id}/scores` — 404 if player doesn't exist
- `PUT /players/{player_id}` — 404 if not found
- `PUT /scores/{score_id}` — 404 if not found
- `DELETE /players/{player_id}` — 404 if not found
- `DELETE /scores/{score_id}` — 404 if not found
- `POST /scores` — 404 if the referenced `player_id` doesn't exist
- `POST /players` — 409 if username or email is already taken ✅ (done above)

---

### 4.4 — Bonus: business rule validation

Add this endpoint to your scores router as a final challenge:

```
GET /scores/top?limit=3
```

It should return the top scores across all games, ordered by points descending. If there are no scores in the database at all, return a `404` with the message `"No scores on the board yet. Be the first to play!"`.

This forces you to think about edge cases beyond just "does this row exist?".

---

## Part 5 — RetroZone Admin Dashboard 📊

> **Goal:** Build a Streamlit web app that consumes your API and serves as the internal management panel for RetroZone staff. No direct database access — everything goes through the API.

### Setup

All the dashboard code lives in a single file: `dashboard.py`.

Run it with:

```bash
streamlit run dashboard.py
```

Make sure your FastAPI server is also running in a separate terminal.

### Dashboard sections to build

Your dashboard must have the following sections, accessible via a sidebar menu:

---

#### 🏆 Leaderboard

- Fetch all scores from `GET /scores` and display them in a table
- Add a dropdown to filter by game name
- Add a number input to filter by minimum points
- Show the results sorted by score (highest first)

```python
import streamlit as st
import requests

API_URL = "http://127.0.0.1:8000"

st.title("🏆 RetroZone Leaderboard")

game_filter = st.text_input("Filter by game name (leave empty for all)")
min_points = st.number_input("Minimum points", min_value=0, value=0)

params = {"limit": 50}
if game_filter:
    params["game_name"] = game_filter
if min_points > 0:
    params["min_points"] = min_points

response = requests.get(f"{API_URL}/scores", params=params)

if response.status_code == 200:
    scores = response.json()
    if scores:
        st.dataframe(scores)
    else:
        st.info("No scores match your filters.")
else:
    st.error("Could not fetch scores from the API.")
```

Use this as your starting point and template for the rest of the sections.

---

#### 👾 Players

- Show a table with all registered players (`GET /players`)
- Include a form to register a new player (`POST /players`)
  - Fields: username, email
  - Show a success message on `201`, and the error detail on `409` or `422`
- Include a section to delete a player by ID (`DELETE /players/{player_id}`)
  - Show a `404` message if the player doesn't exist

---

#### 🎮 Submit a Score

- A form that allows staff to manually submit a score on behalf of a player
- Fields: player ID, game name, points, level
- Use `POST /scores`
- Handle and display errors properly (player not found, invalid points, etc.)

---

#### 🔍 Player Profile

- A search box where staff can enter a player ID
- Fetch and display player details from `GET /players/{player_id}`
- Below, fetch and display all their scores from `GET /players/{player_id}/scores`
- Show a clear `404` message if the player doesn't exist

---

### Tips for the dashboard

- Use `st.sidebar.radio()` or `st.sidebar.selectbox()` to build the navigation menu between sections.
- Use `st.success()`, `st.error()`, `st.warning()`, and `st.info()` to communicate API responses to the user.
- Always check `response.status_code` before accessing `response.json()`.
- Keep `API_URL = "http://127.0.0.1:8000"` as a constant at the top of the file so it's easy to change.
