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
