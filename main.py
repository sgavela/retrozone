from fastapi import FastAPI

app = FastAPI(
    title="RetroZone Arcade API",
    description="The backend powering the RetroZone arcade hall leaderboard system.",
    version="1.0.0"
)

@app.get("/")
def root():
    return {"message": "Welcome to RetroZone Arcade! 🕹️"}
