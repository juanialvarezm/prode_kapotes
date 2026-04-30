from datetime import datetime
from dateutil import parser as dateparser
from back.models import Match, db
from back.services.api_football import fetch_fixtures

AF_STATUS_MAP = {
    'NS': 'SCHEDULED',
    'TBD': 'SCHEDULED',
    'PST': 'POSTPONED',
    '1H': 'IN_PLAY',
    'HT': 'IN_PLAY',
    '2H': 'IN_PLAY',
    'ET': 'IN_PLAY',
    'BT': 'IN_PLAY',
    'P': 'IN_PLAY',
    'LIVE': 'IN_PLAY',
    'FT': 'FINISHED',
    'AET': 'FINISHED',
    'PEN': 'FINISHED',
    'SUSP': 'POSTPONED',
    'CANC': 'POSTPONED',
}

def sync_matches(season=2026):
    fixtures = fetch_fixtures(season=season)

    inserted, updated = 0, 0

    for f in fixtures:
        fixture = f.get("fixture", {})
        teams   = f.get("teams", {})
        goals   = f.get("goals", {})

        ext_id = str(fixture.get("id"))
        if not ext_id:
            continue

        match_time = parse_date(fixture.get("date"))
        status     = map_status(fixture)

        match = Match.query.filter_by(external_id=ext_id).first()

        if not match:
            match = Match(external_id=ext_id)
            db.session.add(match)
            inserted += 1
        else:
            updated += 1

        match.home_team  = teams.get("home", {}).get("name", "TBD")
        match.away_team  = teams.get("away", {}).get("name", "TBD")
        match.match_time = match_time
        match.status     = status
        match.home_score = goals.get("home")
        match.away_score = goals.get("away")

    db.session.commit()

    return {
        "inserted": inserted,
        "updated": updated,
        "total": inserted + updated,
    }


def parse_date(date_str):
    try:
        return dateparser.isoparse(date_str)
    except:
        return datetime.utcnow()


def map_status(fixture):
    raw = fixture.get("status", {}).get("short", "NS")
    return AF_STATUS_MAP.get(raw, "SCHEDULED")