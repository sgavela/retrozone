import sqlite3
from fastapi import APIRouter, HTTPException, status
from database import get_connection
from models import PlayerCreate, PlayerUpdate

router = APIRouter(prefix="/players", tags=["Players"])


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
    if player is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Player with id {player_id} not found."
        )
    return dict(player)


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


@router.put("/{player_id}")
def update_player(player_id: int, player: PlayerUpdate):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM players WHERE id = ?", (player_id,))
    if cursor.fetchone() is None:
        conn.close()
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Player with id {player_id} not found."
        )
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
    cursor.execute("SELECT * FROM players WHERE id = ?", (player_id,))
    if cursor.fetchone() is None:
        conn.close()
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Player with id {player_id} not found."
        )
    cursor.execute("DELETE FROM players WHERE id = ?", (player_id,))
    conn.commit()
    conn.close()
    return {"message": f"Player {player_id} deleted."}


@router.get("/{player_id}/scores")
def get_player_scores(player_id: int):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM players WHERE id = ?", (player_id,))
    if cursor.fetchone() is None:
        conn.close()
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Player with id {player_id} not found."
        )
    cursor.execute("SELECT * FROM scores WHERE player_id = ?", (player_id,))
    scores = cursor.fetchall()
    conn.close()
    return [dict(s) for s in scores]
