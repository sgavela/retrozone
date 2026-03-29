from fastapi import FastAPI
from database import init_db, get_connection

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

@app.get("/players")
def get_all_players():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM players")
    players = cursor.fetchall()
    conn.close()
    return [dict(player) for player in players]
