from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional
from database import get_connection

router = APIRouter(prefix="/scores", tags=["Scores"])


class ScoreCreate(BaseModel):
    player_id: int
    game_name: str
    points: int
    level: int


class ScoreUpdate(BaseModel):
    game_name: Optional[str] = None
    points: Optional[int] = None
    level: Optional[int] = None


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


@router.get("/{score_id}")
def get_score(score_id: int):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM scores WHERE id = ?", (score_id,))
    score = cursor.fetchone()
    conn.close()
    return dict(score)


@router.post("/")
def create_score(score: ScoreCreate):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO scores (player_id, game_name, points, level) VALUES (?, ?, ?, ?)",
        (score.player_id, score.game_name, score.points, score.level)
    )
    conn.commit()
    new_id = cursor.lastrowid
    conn.close()
    return {
        "id": new_id,
        "player_id": score.player_id,
        "game_name": score.game_name,
        "points": score.points,
        "level": score.level
    }


@router.put("/{score_id}")
def update_score(score_id: int, score: ScoreUpdate):
    conn = get_connection()
    cursor = conn.cursor()
    if score.game_name is not None:
        cursor.execute(
            "UPDATE scores SET game_name = ? WHERE id = ?",
            (score.game_name, score_id)
        )
    if score.points is not None:
        cursor.execute(
            "UPDATE scores SET points = ? WHERE id = ?",
            (score.points, score_id)
        )
    if score.level is not None:
        cursor.execute(
            "UPDATE scores SET level = ? WHERE id = ?",
            (score.level, score_id)
        )
    conn.commit()
    cursor.execute("SELECT * FROM scores WHERE id = ?", (score_id,))
    updated = cursor.fetchone()
    conn.close()
    return dict(updated)


@router.delete("/{score_id}")
def delete_score(score_id: int):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM scores WHERE id = ?", (score_id,))
    conn.commit()
    conn.close()
    return {"message": f"Score {score_id} deleted."}
