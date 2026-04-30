import os
import requests

AF_BASE_URL = 'https://v3.football.api-sports.io'
AF_API_KEY  = os.getenv('API_FOOTBALL_KEY')

def get_headers():
    return {
        'x-apisports-key': AF_API_KEY,
    }

def fetch_fixtures(season=2026, league=1):
    resp = requests.get(
        f"{AF_BASE_URL}/fixtures",
        headers=get_headers(),
        params={
            "league": league,
            "season": season,
        },
        timeout=20,
    )

    if resp.status_code != 200:
        raise Exception(f"Error API-Football: {resp.status_code} - {resp.text[:200]}")

    data = resp.json()
    return data.get("response", [])