import streamlit as st
import requests

API_URL = "http://127.0.0.1:8000"

st.set_page_config(page_title="RetroZone Admin", layout="wide")

section = st.sidebar.selectbox(
    "Navigate",
    ["🏆 Leaderboard", "👾 Players", "🎮 Submit a Score", "🔍 Player Profile"]
)

# ── Leaderboard ────────────────────────────────────────────────────────────────
if section == "🏆 Leaderboard":
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
            st.dataframe(scores, use_container_width=True)
        else:
            st.info("No scores match your filters.")
    else:
        st.error("Could not fetch scores from the API.")

# ── Players ────────────────────────────────────────────────────────────────────
elif section == "👾 Players":
    st.title("👾 Players")

    response = requests.get(f"{API_URL}/players")
    if response.status_code == 200:
        players = response.json()
        if players:
            st.dataframe(players, use_container_width=True)
        else:
            st.info("No players registered yet.")
    else:
        st.error("Could not fetch players from the API.")

    st.divider()

    st.subheader("Register a new player")
    with st.form("register_player"):
        username = st.text_input("Username")
        email = st.text_input("Email")
        submitted = st.form_submit_button("Register")

    if submitted:
        response = requests.post(
            f"{API_URL}/players",
            json={"username": username, "email": email}
        )
        if response.status_code == 201:
            st.success(f"Player '{response.json()['username']}' registered successfully!")
        elif response.status_code == 409:
            st.error(response.json()["detail"])
        elif response.status_code == 422:
            for err in response.json()["detail"]:
                st.error(f"{' → '.join(str(l) for l in err['loc'])}: {err['msg']}")
        else:
            st.error("Unexpected error.")

    st.divider()

    st.subheader("Delete a player")
    with st.form("delete_player"):
        player_id = st.number_input("Player ID", min_value=1, step=1)
        confirmed = st.form_submit_button("Delete")

    if confirmed:
        response = requests.delete(f"{API_URL}/players/{int(player_id)}")
        if response.status_code == 200:
            st.success(response.json()["message"])
        elif response.status_code == 404:
            st.warning(response.json()["detail"])
        else:
            st.error("Unexpected error.")

# ── Submit a Score ─────────────────────────────────────────────────────────────
elif section == "🎮 Submit a Score":
    st.title("🎮 Submit a Score")

    with st.form("submit_score"):
        player_id = st.number_input("Player ID", min_value=1, step=1)
        game_name = st.text_input("Game Name")
        points = st.number_input("Points", min_value=0, step=1)
        level = st.number_input("Level", min_value=1, max_value=99, step=1)
        submitted = st.form_submit_button("Submit")

    if submitted:
        response = requests.post(
            f"{API_URL}/scores",
            json={
                "player_id": int(player_id),
                "game_name": game_name,
                "points": int(points),
                "level": int(level)
            }
        )
        if response.status_code == 201:
            data = response.json()
            st.success(
                f"Score submitted! {data['game_name']} — {data['points']} pts "
                f"(level {data['level']}) for player {data['player_id']}."
            )
        elif response.status_code == 404:
            st.warning(response.json()["detail"])
        elif response.status_code == 422:
            for err in response.json()["detail"]:
                st.error(f"{' → '.join(str(l) for l in err['loc'])}: {err['msg']}")
        else:
            st.error("Unexpected error.")

# ── Player Profile ─────────────────────────────────────────────────────────────
elif section == "🔍 Player Profile":
    st.title("🔍 Player Profile")

    player_id = st.number_input("Enter Player ID", min_value=1, step=1)
    search = st.button("Search")

    if search:
        response = requests.get(f"{API_URL}/players/{int(player_id)}")
        if response.status_code == 404:
            st.warning(response.json()["detail"])
        elif response.status_code == 200:
            player = response.json()
            st.subheader(f"{player['username']}")
            st.write(f"**Email:** {player['email']}")
            st.write(f"**Joined:** {player['created_at']}")

            scores_response = requests.get(f"{API_URL}/players/{int(player_id)}/scores")
            if scores_response.status_code == 200:
                scores = scores_response.json()
                st.divider()
                st.subheader("Scores")
                if scores:
                    st.dataframe(scores, use_container_width=True)
                else:
                    st.info("This player has no scores yet.")
            else:
                st.error("Could not fetch scores for this player.")
        else:
            st.error("Unexpected error.")
