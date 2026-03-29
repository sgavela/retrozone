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
