from fastapi import APIRouter
from pydantic import BaseModel
from database import get_connection

router = APIRouter(prefix="/players", tags=["Players"])


class PlayerCreate(BaseModel):
    username: str
    email: str


class PlayerUpdate(BaseModel):
    username: str = None
    email: str = None


@router.get("/")
def get_all_players():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM players")
    players = cursor.fetchall()
    conn.close()
    return [dict(player) for player in players]


@router.get("/{player_id}")
def get_player(player_id: int):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM players WHERE id = ?", (player_id,))
    player = cursor.fetchone()
    conn.close()
    return dict(player)


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


@router.put("/{player_id}")
def update_player(player_id: int, player: PlayerUpdate):
    conn = get_connection()
    cursor = conn.cursor()
    if player.username is not None:
        cursor.execute(
            "UPDATE players SET username = ? WHERE id = ?",
            (player.username, player_id)
        )
    if player.email is not None:
        cursor.execute(
            "UPDATE players SET email = ? WHERE id = ?",
            (player.email, player_id)
        )
    conn.commit()
    cursor.execute("SELECT * FROM players WHERE id = ?", (player_id,))
    updated = cursor.fetchone()
    conn.close()
    return dict(updated)


@router.delete("/{player_id}")
def delete_player(player_id: int):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM players WHERE id = ?", (player_id,))
    conn.commit()
    conn.close()
    return {"message": f"Player {player_id} deleted."}


@router.get("/{player_id}/scores")
def get_player_scores(player_id: int):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM scores WHERE player_id = ?", (player_id,))
    scores = cursor.fetchall()
    conn.close()
    return [dict(s) for s in scores]
