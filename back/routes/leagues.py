from flask import jsonify, request
from flask_jwt_extended import get_jwt_identity, jwt_required

from db import db
from models import User, League, LeagueTeam, LeagueMatch, LeagueMember
from .blueprint import bp

@bp.route('/leagues', methods=['POST'])
@jwt_required()
def create_league():
    data = request.json or {}
    name = data.get('name', '').strip()
    description = data.get('description', '').strip()

    if not name:
        return jsonify({'error': 'El nombre de la liga es obligatorio'}), 400

    current_user_id = get_jwt_identity()

    # Create the league
    league = League(name=name, description=description, owner_id=current_user_id)
    db.session.add(league)
    db.session.flush()  # get league.id before commit

    # Owner is automatically a member
    member = LeagueMember(league_id=league.id, user_id=current_user_id)
    db.session.add(member)
    db.session.commit()

    return jsonify({'message': 'Liga creada', 'league_id': league.id}), 201


@bp.route('/leagues', methods=['GET'])
@jwt_required()
def list_leagues():
    """Return all leagues the current user belongs to."""
    current_user_id = get_jwt_identity()
    memberships = LeagueMember.query.filter_by(user_id=current_user_id).all()

    result = []
    for m in memberships:
        lg = m.league
        result.append({
            'id': lg.id,
            'name': lg.name,
            'description': lg.description,
            'owner_id': lg.owner_id,
            'is_owner': str(lg.owner_id) == str(current_user_id),
            'teams_count': len(lg.teams),
            'members_count': len(lg.members),
            'created_at': lg.created_at.isoformat() if lg.created_at else None,
        })

    return jsonify({'leagues': result}), 200


@bp.route('/leagues/<int:league_id>', methods=['GET'])
@jwt_required()
def get_league(league_id):
    current_user_id = get_jwt_identity()
    league = League.query.get_or_404(league_id)

    # Only members can view
    is_member = LeagueMember.query.filter_by(
        league_id=league.id, user_id=current_user_id
    ).first() is not None
    is_owner = str(league.owner_id) == str(current_user_id)

    if not is_member:
        return jsonify({'error': 'Solo los miembros pueden ver esta liga'}), 403

    # Teams
    teams = [{
        'id': t.id,
        'name': t.name,
        'created_by': t.created_by,
    } for t in league.teams]

    # Matches
    matches = []
    for m in league.matches:
        matches.append({
            'id': m.id,
            'home_team_id': m.home_team_id,
            'home_team_name': m.home_team.name,
            'away_team_id': m.away_team_id,
            'away_team_name': m.away_team.name,
            'match_date': m.match_date.isoformat() if m.match_date else None,
            'home_score': m.home_score,
            'away_score': m.away_score,
            'status': m.status,
        })

    # Members
    members = [{
        'id': mb.user.id,
        'username': mb.user.username,
        'email': mb.user.email,
    } for mb in league.members]

    return jsonify({
        'id': league.id,
        'name': league.name,
        'description': league.description,
        'owner_id': league.owner_id,
        'is_owner': is_owner,
        'is_member': is_member,
        'teams': teams,
        'matches': matches,
        'members': members,
        'created_at': league.created_at.isoformat() if league.created_at else None,
    }), 200


@bp.route('/leagues/<int:league_id>/teams', methods=['POST'])
@jwt_required()
def create_league_team(league_id):
    current_user_id = get_jwt_identity()
    league = League.query.get_or_404(league_id)

    if str(league.owner_id) != str(current_user_id):
        return jsonify({'error': 'Solo el dueño puede crear equipos'}), 403

    data = request.json or {}
    name = data.get('name', '').strip()
    if not name:
        return jsonify({'error': 'El nombre del equipo es obligatorio'}), 400

    team = LeagueTeam(league_id=league.id, name=name, created_by=current_user_id)
    db.session.add(team)
    db.session.commit()

    return jsonify({'message': 'Equipo creado', 'team_id': team.id, 'name': team.name}), 201


@bp.route('/leagues/<int:league_id>/teams/<int:team_id>', methods=['DELETE'])
@jwt_required()
def delete_league_team(league_id, team_id):
    current_user_id = get_jwt_identity()
    league = League.query.get_or_404(league_id)

    if str(league.owner_id) != str(current_user_id):
        return jsonify({'error': 'Solo el dueño puede eliminar equipos'}), 403

    team = LeagueTeam.query.filter_by(id=team_id, league_id=league_id).first_or_404()
    db.session.delete(team)
    db.session.commit()

    return jsonify({'message': 'Equipo eliminado'}), 200


@bp.route('/leagues/<int:league_id>/matches', methods=['POST'])
@jwt_required()
def create_league_match(league_id):
    current_user_id = get_jwt_identity()
    league = League.query.get_or_404(league_id)

    if str(league.owner_id) != str(current_user_id):
        return jsonify({'error': 'Solo el dueño puede crear partidos'}), 403

    data = request.json or {}
    home_team_id = data.get('home_team_id')
    away_team_id = data.get('away_team_id')
    match_date_str = data.get('match_date')

    if not home_team_id or not away_team_id:
        return jsonify({'error': 'home_team_id y away_team_id son obligatorios'}), 400

    if home_team_id == away_team_id:
        return jsonify({'error': 'Un equipo no puede jugar contra sí mismo'}), 400

    # Verify both teams belong to this league
    home = LeagueTeam.query.filter_by(id=home_team_id, league_id=league_id).first()
    away = LeagueTeam.query.filter_by(id=away_team_id, league_id=league_id).first()
    if not home or not away:
        return jsonify({'error': 'Uno o ambos equipos no pertenecen a esta liga'}), 400

    match_date = None
    if match_date_str:
        try:
            from dateutil import parser as date_parser
            match_date = date_parser.isoparse(match_date_str)
        except Exception:
            pass

    match = LeagueMatch(
        league_id=league.id,
        home_team_id=home_team_id,
        away_team_id=away_team_id,
        match_date=match_date,
        status='SCHEDULED',
    )
    db.session.add(match)
    db.session.commit()

    return jsonify({'message': 'Partido creado', 'match_id': match.id}), 201


@bp.route('/leagues/<int:league_id>/matches/<int:match_id>', methods=['PATCH'])
@jwt_required()
def update_league_match(league_id, match_id):
    """Update match score / status."""
    current_user_id = get_jwt_identity()
    league = League.query.get_or_404(league_id)

    if str(league.owner_id) != str(current_user_id):
        return jsonify({'error': 'Solo el dueño puede actualizar partidos'}), 403

    match = LeagueMatch.query.filter_by(id=match_id, league_id=league_id).first_or_404()

    data = request.json or {}
    if data.get('home_score') is not None:
        match.home_score = int(data['home_score'])
    if data.get('away_score') is not None:
        match.away_score = int(data['away_score'])
    if data.get('status'):
        match.status = data['status']
    if data.get('match_date'):
        try:
            from dateutil import parser as date_parser
            match.match_date = date_parser.isoparse(data['match_date'])
        except Exception:
            pass

    # Auto-mark as FINISHED if both scores are set
    if match.home_score is not None and match.away_score is not None:
        match.status = 'FINISHED'

    db.session.commit()
    return jsonify({'message': 'Partido actualizado'}), 200


@bp.route('/leagues/<int:league_id>/matches/<int:match_id>', methods=['DELETE'])
@jwt_required()
def delete_league_match(league_id, match_id):
    current_user_id = get_jwt_identity()
    league = League.query.get_or_404(league_id)

    if str(league.owner_id) != str(current_user_id):
        return jsonify({'error': 'Solo el dueño puede eliminar partidos'}), 403

    match = LeagueMatch.query.filter_by(id=match_id, league_id=league_id).first_or_404()
    db.session.delete(match)
    db.session.commit()

    return jsonify({'message': 'Partido eliminado'}), 200


@bp.route('/leagues/<int:league_id>/members', methods=['POST'])
@jwt_required()
def add_league_member(league_id):
    current_user_id = get_jwt_identity()
    league = League.query.get_or_404(league_id)

    if str(league.owner_id) != str(current_user_id):
        return jsonify({'error': 'Solo el dueño puede agregar miembros'}), 403

    data = request.json or {}
    username = data.get('username', '').strip()
    if not username:
        return jsonify({'error': 'username es obligatorio'}), 400

    target = User.query.filter_by(username=username).first()
    if not target:
        return jsonify({'error': f'Usuario "{username}" no encontrado'}), 404

    existing = LeagueMember.query.filter_by(
        league_id=league.id, user_id=target.id
    ).first()
    if existing:
        return jsonify({'error': 'El usuario ya es miembro de la liga'}), 409

    member = LeagueMember(league_id=league.id, user_id=target.id)
    db.session.add(member)
    db.session.commit()

    return jsonify({'message': f'{target.username} agregado a la liga'}), 201


@bp.route('/leagues/<int:league_id>/members/<int:user_id>', methods=['DELETE'])
@jwt_required()
def remove_league_member(league_id, user_id):
    current_user_id = get_jwt_identity()
    league = League.query.get_or_404(league_id)

    if str(league.owner_id) != str(current_user_id):
        return jsonify({'error': 'Solo el dueño puede eliminar miembros'}), 403

    if str(user_id) == str(current_user_id):
        return jsonify({'error': 'No podés eliminarte a vos mismo como dueño'}), 400

    membership = LeagueMember.query.filter_by(
        league_id=league.id, user_id=user_id
    ).first_or_404()
    db.session.delete(membership)
    db.session.commit()

    return jsonify({'message': 'Miembro eliminado'}), 200


@bp.route('/leagues/<int:league_id>', methods=['DELETE'])
@jwt_required()
def delete_league(league_id):
    current_user_id = get_jwt_identity()
    league = League.query.get_or_404(league_id)

    if str(league.owner_id) != str(current_user_id):
        return jsonify({'error': 'Solo el dueño puede eliminar la liga'}), 403

    db.session.delete(league)
    db.session.commit()

    return jsonify({'message': 'Liga eliminada'}), 200
