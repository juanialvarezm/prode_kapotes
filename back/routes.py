import requests
from datetime import datetime

from flask import Blueprint, jsonify, request
from flask_jwt_extended import (
    create_access_token,
    get_jwt_identity,
    jwt_required,
)

from db import db
from models import User, Group, GroupMember, Match, Prediction

bp = Blueprint('api', __name__)


@bp.route('/')
def home():
    return jsonify({'message': 'Welcome to Prode Kapotes API'})


@bp.route('/register', methods=['POST'])
def register():
    data = request.json or {}
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')

    if not all([username, email, password]):
        return jsonify({'error': 'username, email and password required'}), 400

    if User.query.filter((User.username == username) | (User.email == email)).first():
        return jsonify({'error': 'username or email already exists'}), 409

    user = User(username=username, email=email)
    user.set_password(password)
    db.session.add(user)
    db.session.commit()

    return jsonify({'message': 'User registered successfully'}), 201


@bp.route('/login', methods=['POST'])
def login():
    data = request.json or {}
    username = data.get('username')
    password = data.get('password')

    if not all([username, password]):
        return jsonify({'error': 'username and password required'}), 400

    user = User.query.filter_by(username=username).first()
    if not user or not user.check_password(password):
        return jsonify({'error': 'Invalid credentials'}), 401

    access_token = create_access_token(identity=user.id)
    return jsonify({'access_token': access_token}), 200


@bp.route('/groups', methods=['POST'])
@jwt_required()
def create_group():
    data = request.json or {}
    name = data.get('name')
    description = data.get('description', '')

    if not name:
        return jsonify({'error': 'Group name is required'}), 400

    if Group.query.filter_by(name=name).first():
        return jsonify({'error': 'Group already exists'}), 409

    current_user_id = get_jwt_identity()
    group = Group(name=name, description=description, owner_id=current_user_id)
    db.session.add(group)
    db.session.commit()

    member = GroupMember(group_id=group.id, user_id=current_user_id)
    db.session.add(member)
    db.session.commit()

    return jsonify({'message': 'Group created', 'group_id': group.id}), 201


@bp.route('/groups/<int:group_id>/join', methods=['POST'])
@jwt_required()
def join_group(group_id):
    current_user_id = get_jwt_identity()
    group = Group.query.get_or_404(group_id)

    if GroupMember.query.filter_by(group_id=group.id, user_id=current_user_id).first():
        return jsonify({'message': 'Already member'}), 200

    membership = GroupMember(group_id=group.id, user_id=current_user_id)
    db.session.add(membership)
    db.session.commit()

    return jsonify({'message': f'User joined group {group.name}'}), 200


@bp.route('/groups/<int:group_id>/members', methods=['GET'])
@jwt_required()
def group_members(group_id):
    group = Group.query.get_or_404(group_id)
    memberships = GroupMember.query.filter_by(group_id=group.id).all()

    users = []
    for membership in memberships:
        users.append({
            'id': membership.user.id,
            'username': membership.user.username,
            'email': membership.user.email,
            'joined_at': membership.joined_at.isoformat(),
        })

    return jsonify({'group': group.name, 'members': users}), 200


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
    matches = Match.query.order_by(Match.match_time).all()
    data = []
    for m in matches:
        data.append({
            'id': m.id,
            'external_id': m.external_id,
            'home_team': m.home_team,
            'away_team': m.away_team,
            'match_time': m.match_time.isoformat(),
            'status': m.status,
            'home_score': m.home_score,
            'away_score': m.away_score,
        })
    return jsonify(data), 200


@bp.route('/predictions', methods=['POST'])
@jwt_required()
def create_prediction():
    data = request.json or {}
    match_id = data.get('match_id')
    group_id = data.get('group_id')
    predicted_home = data.get('predicted_home')
    predicted_away = data.get('predicted_away')

    if not all([match_id, group_id, predicted_home is not None, predicted_away is not None]):
        return jsonify({'error': 'match_id, group_id, predicted_home and predicted_away required'}), 400

    current_user_id = get_jwt_identity()

    if not GroupMember.query.filter_by(group_id=group_id, user_id=current_user_id).first():
        return jsonify({'error': 'User must belong to group to predict'}), 403

    match = Match.query.get_or_404(match_id)
    if match.status not in ['SCHEDULED', 'TIMED', 'POSTPONED']:
        return jsonify({'error': 'Cannot predict a completed or cancelled match'}), 400

    pred = Prediction.query.filter_by(user_id=current_user_id, group_id=group_id, match_id=match_id).first()
    if pred:
        pred.predicted_home = predicted_home
        pred.predicted_away = predicted_away
        pred.created_at = datetime.utcnow()
        msg = 'Prediction updated'
    else:
        pred = Prediction(
            user_id=current_user_id,
            group_id=group_id,
            match_id=match_id,
            predicted_home=predicted_home,
            predicted_away=predicted_away,
        )
        db.session.add(pred)
        msg = 'Prediction created'

    db.session.commit()
    return jsonify({'message': msg}), 200


@bp.route('/groups/<int:group_id>/scores', methods=['GET'])
@jwt_required()
def group_scores(group_id):
    group = Group.query.get_or_404(group_id)

    # solo miembros pueden ver
    if not GroupMember.query.filter_by(group_id=group.id, user_id=get_jwt_identity()).first():
        return jsonify({'error': 'Access denied'}), 403

    members = GroupMember.query.filter_by(group_id=group.id).all()
    results = []

    for m in members:
        uid = m.user_id
        user = m.user
        predictions = Prediction.query.filter_by(group_id=group.id, user_id=uid).join(Match).all()

        total_exact = sum(1 for p in predictions if p.is_exact())
        total_winner = sum(1 for p in predictions if p.is_winner())

        results.append({
            'user_id': uid,
            'username': user.username,
            'email': user.email,
            'exact_hits': total_exact,
            'winner_hits': total_winner,
            'total_predictions': len(predictions),
        })

    return jsonify({'group': group.name, 'scores': results}), 200


@bp.route('/mygroups', methods=['GET'])
@jwt_required()
def my_groups():
    current_user_id = get_jwt_identity()
    memberships = GroupMember.query.filter_by(user_id=current_user_id).all()
    groups = []
    for m in memberships:
        g = m.group
        groups.append({'id': g.id, 'name': g.name, 'description': g.description})

    return jsonify({'groups': groups}), 200


@bp.route('/me', methods=['GET'])
@jwt_required()
def get_me():
    current_user_id = get_jwt_identity()
    user = User.query.get_or_404(current_user_id)
    memberships = GroupMember.query.filter_by(user_id=current_user_id).all()
    total_predictions = Prediction.query.filter_by(user_id=current_user_id).count()

    return jsonify({
        'id': user.id,
        'username': user.username,
        'email': user.email,
        'created_at': user.created_at.isoformat(),
        'groups_count': len(memberships),
        'total_predictions': total_predictions,
    }), 200


@bp.route('/groups/<int:group_id>', methods=['GET'])
@jwt_required()
def get_group(group_id):
    group = Group.query.get_or_404(group_id)
    return jsonify({
        'id': group.id,
        'name': group.name,
        'description': group.description,
        'owner_id': group.owner_id,
        'created_at': group.created_at.isoformat() if group.created_at else None,
    }), 200


@bp.route('/users/search', methods=['GET'])
@jwt_required()
def search_users():
    q = request.args.get('q', '').strip()
    if len(q) < 2:
        return jsonify({'users': []}), 200

    users = User.query.filter(User.username.ilike(f'%{q}%')).limit(20).all()
    current_user_id = get_jwt_identity()
    result = [
        {'id': u.id, 'username': u.username, 'email': u.email}
        for u in users if u.id != current_user_id
    ]
    return jsonify({'users': result}), 200


@bp.route('/groups/<int:group_id>/add_member', methods=['POST'])
@jwt_required()
def add_member(group_id):
    current_user_id = get_jwt_identity()
    group = Group.query.get_or_404(group_id)

    if group.owner_id != current_user_id:
        return jsonify({'error': 'Only the group owner can add members'}), 403

    data = request.json or {}
    user_id = data.get('user_id')
    if not user_id:
        return jsonify({'error': 'user_id is required'}), 400

    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404

    if GroupMember.query.filter_by(group_id=group.id, user_id=user_id).first():
        return jsonify({'message': 'User is already a member'}), 200

    membership = GroupMember(group_id=group.id, user_id=user_id)
    db.session.add(membership)
    db.session.commit()

    return jsonify({'message': f'{user.username} added to {group.name}'}), 200
