import requests
from flask import jsonify, request
from flask_jwt_extended import jwt_required

from db import db
from models import Match
from .blueprint import bp

@bp.route('/matches/refresh', methods=['POST'])
@jwt_required()
def refresh_matches():
    # Usa API pública de partidos del Mundial
    URL = 'https://worldcupjson.netlify.app/api/v1/matches'
    resp = requests.get(URL, timeout=15)
    if resp.status_code != 200:
        return jsonify({'error': 'Error fetching matches'}), 502

    external_matches = resp.json() or []
    inserted = 0
    updated = 0

    for m in external_matches:
        ext_id = str(m.get('id') or m.get('match_number') or m.get('datetime'))
        if not ext_id:
            continue

        home = m['home_team']['country'] if m.get('home_team') else m.get('home_team_country')
        away = m['away_team']['country'] if m.get('away_team') else m.get('away_team_country')
        date = m.get('datetime') or m.get('location')

        # map status and score
        status = m.get('status', 'SCHEDULED')
        home_score = m.get('home_team', {}).get('goals') if isinstance(m.get('home_team'), dict) else m.get('home_score')
        away_score = m.get('away_team', {}).get('goals') if isinstance(m.get('away_team'), dict) else m.get('away_score')

        from dateutil import parser
        try:
            match_time = parser.isoparse(date)
        except Exception:
            continue

        match = Match.query.filter_by(external_id=ext_id).first()
        if not match:
            match = Match(
                external_id=ext_id,
                home_team=home,
                away_team=away,
                match_time=match_time,
                status=status,
                home_score=home_score,
                away_score=away_score,
            )
            db.session.add(match)
            inserted += 1
        else:
            match.home_team = home
            match.away_team = away
            match.match_time = match_time
            match.status = status
            match.home_score = home_score
            match.away_score = away_score
            updated += 1

    db.session.commit()
    return jsonify({'updated': updated, 'inserted': inserted}), 200


@bp.route('/matches', methods=['GET'])
def list_matches():
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    per_page = min(per_page, 100)  # cap

    query = Match.query.order_by(Match.match_time)
    total = query.count()
    matches = query.offset((page - 1) * per_page).limit(per_page).all()

    data = []
    for m in matches:
        data.append({
            'id': m.id,
            'external_id': m.external_id,
            'home_team': m.home_team,
            'away_team': m.away_team,
            'match_time': m.match_time.isoformat() + 'Z',
            'status': m.status,
            'home_score': m.home_score,
            'away_score': m.away_score,
        })
    return jsonify({
        'matches': data,
        'total': total,
        'page': page,
        'per_page': per_page,
        'has_more': (page * per_page) < total,
    }), 200


@bp.route('/sync_wc2026', methods=['POST'])
@jwt_required()
def sync_wc2026():
    """Sincronización manual de partidos (usa el servicio en background)."""
    try:
        from services.sync_services import sync_matches
        result = sync_matches(season=2026)
        return jsonify({
            'message': 'Sincronización completada',
            'inserted': result['inserted'],
            'updated': result['updated'],
            'total': result['total'],
        }), 200
    except Exception as e:
        return jsonify({
            'error': 'Error en la sincronización',
            'details': str(e)
        }), 500
