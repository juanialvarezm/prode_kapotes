import os
import uuid
import random
from datetime import datetime
from flask import jsonify, request, current_app
from flask_jwt_extended import get_jwt_identity, jwt_required

from db import db
from models import User, Group, GroupMember, JoinRequest, Prediction, Match
from .blueprint import bp
from .helpers import allowed_file, validate_image

@bp.route('/groups', methods=['POST'])
@jwt_required()
def create_group():
    json_data = request.get_json(silent=True) or {}
    name = request.form.get('name') or json_data.get('name')
    description = request.form.get('description', '') or json_data.get('description', '')
    prize_pool_raw = request.form.get('prize_pool') or json_data.get('prize_pool', 0)
    try:
        prize_pool = int(prize_pool_raw)
    except (TypeError, ValueError):
        prize_pool = 0

    if not name:
        return jsonify({'error': 'Group name is required'}), 400

    if Group.query.filter_by(name=name).first():
        return jsonify({'error': 'Group already exists'}), 409

    current_user_id = get_jwt_identity()

    # Handle avatar upload
    avatar_url = None
    if 'avatar' in request.files:
        file = request.files['avatar']
        if file and file.filename:
            if not allowed_file(file.filename):
                return jsonify({'error': 'Tipo de archivo no permitido. Solo se aceptan: PNG, JPG, JPEG, GIF, WEBP'}), 400
            
            # Validate image content
            is_valid, error_msg = validate_image(file)
            if not is_valid:
                return jsonify({'error': error_msg}), 400
            
            ext = file.filename.rsplit('.', 1)[1].lower()
            filename = f"group_{uuid.uuid4().hex}.{ext}"
            filepath = os.path.join(current_app.config['UPLOAD_FOLDER'], filename)
            file.save(filepath)
            avatar_url = f"/uploads/{filename}"

    group = Group(name=name, description=description, owner_id=current_user_id, avatar_url=avatar_url, prize_pool=prize_pool)
    db.session.add(group)
    db.session.flush()  # get group.id

    member = GroupMember(group_id=group.id, user_id=current_user_id)
    db.session.add(member)
    db.session.commit()

    return jsonify({'message': 'Group created', 'group_id': group.id}), 201


@bp.route('/groups/<int:group_id>/avatar', methods=['POST'])
@jwt_required()
def update_group_avatar(group_id):
    current_user_id = get_jwt_identity()
    group = Group.query.get_or_404(group_id)

    if str(group.owner_id) != str(current_user_id):
        return jsonify({'error': 'Only the group owner can update the avatar'}), 403

    if 'avatar' not in request.files:
        return jsonify({'error': 'No avatar file provided'}), 400

    file = request.files['avatar']
    if not file or not file.filename:
        return jsonify({'error': 'No avatar file provided'}), 400
    
    if not allowed_file(file.filename):
        return jsonify({'error': 'Tipo de archivo no permitido. Solo se aceptan: PNG, JPG, JPEG, GIF, WEBP'}), 400
    
    # Validate image content
    is_valid, error_msg = validate_image(file)
    if not is_valid:
        return jsonify({'error': error_msg}), 400

    # Delete old avatar if exists
    if group.avatar_url:
        old_path = os.path.join(current_app.config['UPLOAD_FOLDER'], os.path.basename(group.avatar_url))
        if os.path.exists(old_path):
            os.remove(old_path)

    ext = file.filename.rsplit('.', 1)[1].lower()
    filename = f"group_{uuid.uuid4().hex}.{ext}"
    filepath = os.path.join(current_app.config['UPLOAD_FOLDER'], filename)
    file.save(filepath)
    group.avatar_url = f"/uploads/{filename}"
    db.session.commit()

    return jsonify({'message': 'Avatar updated', 'avatar_url': group.avatar_url}), 200


@bp.route('/groups/<int:group_id>/join', methods=['POST'])
@jwt_required()
def join_group(group_id):
    current_user_id = get_jwt_identity()
    group = Group.query.get_or_404(group_id)

    # Already a member
    if GroupMember.query.filter_by(group_id=group.id, user_id=current_user_id).first():
        return jsonify({'message': 'Already member'}), 200

    # Check for existing pending request
    existing = JoinRequest.query.filter_by(
        group_id=group.id, user_id=current_user_id, status='pending'
    ).first()
    if existing:
        return jsonify({'message': 'Join request already pending'}), 200

    join_req = JoinRequest(group_id=group.id, user_id=current_user_id, status='pending')
    db.session.add(join_req)
    db.session.commit()

    return jsonify({'message': 'Join request sent. Waiting for admin approval.'}), 200


@bp.route('/groups/<int:group_id>/requests', methods=['GET'])
@jwt_required()
def get_join_requests(group_id):
    current_user_id = get_jwt_identity()
    group = Group.query.get_or_404(group_id)

    if str(group.owner_id) != str(current_user_id):
        return jsonify({'error': 'Only the group owner can view requests'}), 403

    pending = JoinRequest.query.filter_by(group_id=group.id, status='pending').all()
    result = []
    for r in pending:
        result.append({
            'id': r.id,
            'user_id': r.user.id,
            'username': r.user.username,
            'email': r.user.email,
            'created_at': r.created_at.isoformat() if r.created_at else None,
        })

    return jsonify({'requests': result}), 200


@bp.route('/groups/<int:group_id>/requests/<int:request_id>/accept', methods=['POST'])
@jwt_required()
def accept_join_request(group_id, request_id):
    current_user_id = get_jwt_identity()
    group = Group.query.get_or_404(group_id)

    if str(group.owner_id) != str(current_user_id):
        return jsonify({'error': 'Only the group owner can accept requests'}), 403

    join_req = JoinRequest.query.get_or_404(request_id)
    if join_req.group_id != group.id:
        return jsonify({'error': 'Request does not belong to this group'}), 400
    if join_req.status != 'pending':
        return jsonify({'error': 'Request already processed'}), 400

    # Accept: create membership
    join_req.status = 'accepted'
    membership = GroupMember(group_id=group.id, user_id=join_req.user_id)
    db.session.add(membership)
    db.session.commit()

    return jsonify({'message': f'{join_req.user.username} accepted into {group.name}'}), 200


@bp.route('/groups/<int:group_id>/requests/<int:request_id>/reject', methods=['POST'])
@jwt_required()
def reject_join_request(group_id, request_id):
    current_user_id = get_jwt_identity()
    group = Group.query.get_or_404(group_id)

    if str(group.owner_id) != str(current_user_id):
        return jsonify({'error': 'Only the group owner can reject requests'}), 403

    join_req = JoinRequest.query.get_or_404(request_id)
    if join_req.group_id != group.id:
        return jsonify({'error': 'Request does not belong to this group'}), 400
    if join_req.status != 'pending':
        return jsonify({'error': 'Request already processed'}), 400

    join_req.status = 'rejected'
    db.session.commit()

    return jsonify({'message': f'{join_req.user.username} rejected from {group.name}'}), 200


@bp.route('/groups/<int:group_id>/leave', methods=['POST'])
@jwt_required()
def leave_group(group_id):
    current_user_id = get_jwt_identity()
    group = Group.query.get_or_404(group_id)

    membership = GroupMember.query.filter_by(group_id=group.id, user_id=current_user_id).first()
    if not membership:
        return jsonify({'error': 'You are not a member of this group'}), 400

    members = GroupMember.query.filter_by(group_id=group.id).all()
    member_count = len(members)

    # If last member leaves, delete the group entirely
    if member_count == 1:
        db.session.delete(group)
        db.session.commit()
        return jsonify({'message': f'Left and deleted group {group.name} (no members remaining)'}), 200

    # If the owner is leaving, transfer ownership to a random other member
    if str(group.owner_id) == str(current_user_id):
        other_members = [m for m in members if str(m.user_id) != str(current_user_id)]
        new_owner_membership = random.choice(other_members)
        group.owner_id = new_owner_membership.user_id

    db.session.delete(membership)
    db.session.commit()

    return jsonify({'message': f'Left group {group.name}'}), 200


@bp.route('/groups/<int:group_id>/kick/<int:user_id>', methods=['POST'])
@jwt_required()
def kick_member(group_id, user_id):
    current_user_id = get_jwt_identity()
    group = Group.query.get_or_404(group_id)

    if str(group.owner_id) != str(current_user_id):
        return jsonify({'error': 'Only the group owner can remove members'}), 403

    if str(user_id) == str(current_user_id):
        return jsonify({'error': 'Cannot kick yourself. Use leave instead.'}), 400

    membership = GroupMember.query.filter_by(group_id=group.id, user_id=user_id).first()
    if not membership:
        return jsonify({'error': 'User is not a member of this group'}), 404

    db.session.delete(membership)
    db.session.commit()

    user = User.query.get(user_id)
    return jsonify({'message': f'{user.username} removed from {group.name}'}), 200


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


@bp.route('/groups/<int:group_id>/predictions', methods=['GET'])
@jwt_required()
def group_predictions(group_id):
    """Get all predictions for a group, optionally filtered by user_id."""
    group = Group.query.get_or_404(group_id)

    # Only members can see predictions
    current_user_id = get_jwt_identity()
    if not GroupMember.query.filter_by(group_id=group.id, user_id=current_user_id).first():
        return jsonify({'error': 'Access denied'}), 403

    # Optional user filter
    filter_user_id = request.args.get('user_id', type=int)

    query = Prediction.query.filter_by(group_id=group.id)
    if filter_user_id:
        query = query.filter_by(user_id=filter_user_id)

    predictions = query.join(Match).order_by(Match.match_time).all()

    result = []
    for p in predictions:
        result.append({
            'id': p.id,
            'user_id': p.user_id,
            'username': p.user.username,
            'match_id': p.match_id,
            'home_team': p.match.home_team,
            'away_team': p.match.away_team,
            'match_time': p.match.match_time.isoformat() + 'Z',
            'match_status': p.match.status,
            'home_score': p.match.home_score,
            'away_score': p.match.away_score,
            'predicted_home': p.predicted_home,
            'predicted_away': p.predicted_away,
            'is_exact': p.is_exact(),
            'is_winner': p.is_winner(),
            'created_at': p.created_at.isoformat() if p.created_at else None,
        })

    # Also return group members for user filter dropdown
    members = GroupMember.query.filter_by(group_id=group.id).all()
    members_list = [{'id': m.user.id, 'username': m.user.username} for m in members]

    return jsonify({
        'group': group.name,
        'predictions': result,
        'members': members_list,
    }), 200


@bp.route('/mygroups', methods=['GET'])
@jwt_required()
def my_groups():
    current_user_id = get_jwt_identity()
    memberships = GroupMember.query.filter_by(user_id=current_user_id).all()
    groups = []
    for m in memberships:
        g = m.group
        groups.append({
            'id': g.id,
            'name': g.name,
            'description': g.description,
            'avatar_url': g.avatar_url,
            'owner_id': g.owner_id,
            'prize_pool': g.prize_pool,
        })

    return jsonify({'groups': groups}), 200


@bp.route('/groups/<int:group_id>', methods=['GET'])
@jwt_required()
def get_group(group_id):
    current_user_id = get_jwt_identity()
    group = Group.query.get_or_404(group_id)

    # Check membership
    is_member = GroupMember.query.filter_by(group_id=group.id, user_id=current_user_id).first() is not None
    is_owner = str(group.owner_id) == str(current_user_id)

    # Check pending request for current user
    pending_request = JoinRequest.query.filter_by(
        group_id=group.id, user_id=current_user_id, status='pending'
    ).first()

    # Get members (paginated, 10 per page)
    members_page = request.args.get('members_page', 1, type=int)
    members_per_page = 10
    members_query = GroupMember.query.filter_by(group_id=group.id)
    members_total = members_query.count()
    memberships = members_query.offset((members_page - 1) * members_per_page).limit(members_per_page).all()
    members = [{
        'id': ms.user.id,
        'username': ms.user.username,
        'email': ms.user.email,
        'joined_at': ms.joined_at.isoformat(),
    } for ms in memberships]

    # Get pending request count (for owner)
    pending_count = JoinRequest.query.filter_by(group_id=group.id, status='pending').count() if is_owner else 0

    return jsonify({
        'id': group.id,
        'name': group.name,
        'description': group.description,
        'avatar_url': group.avatar_url,
        'owner_id': group.owner_id,
        'prize_pool': group.prize_pool,
        'created_at': group.created_at.isoformat() if group.created_at else None,
        'is_member': is_member,
        'is_owner': is_owner,
        'has_pending_request': pending_request is not None,
        'members': members,
        'members_total': members_total,
        'members_page': members_page,
        'members_has_more': (members_page * members_per_page) < members_total,
        'pending_requests_count': pending_count,
    }), 200


@bp.route('/groups/<int:group_id>/prize_pool', methods=['PATCH'])
@jwt_required()
def update_prize_pool(group_id):
    current_user_id = get_jwt_identity()
    group = Group.query.get_or_404(group_id)

    if str(group.owner_id) != str(current_user_id):
        return jsonify({'error': 'Only the group owner can update the prize pool'}), 403

    data = request.json or {}
    prize_pool_raw = data.get('prize_pool', 0)
    try:
        prize_pool = int(prize_pool_raw)
    except (TypeError, ValueError):
        return jsonify({'error': 'prize_pool must be a number'}), 400

    if prize_pool < 0:
        return jsonify({'error': 'prize_pool cannot be negative'}), 400

    group.prize_pool = prize_pool
    db.session.commit()

    return jsonify({'message': 'Prize pool updated', 'prize_pool': group.prize_pool}), 200


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


@bp.route('/my-requests', methods=['GET'])
@jwt_required()
def my_pending_requests():
    """Get all pending join requests for groups the current user owns."""
    current_user_id = get_jwt_identity()

    # Get all groups owned by this user
    owned_groups = Group.query.filter_by(owner_id=current_user_id).all()
    owned_group_ids = [g.id for g in owned_groups]

    if not owned_group_ids:
        return jsonify({'requests': [], 'total': 0}), 200

    # Get all pending requests for those groups
    pending = JoinRequest.query.filter(
        JoinRequest.group_id.in_(owned_group_ids),
        JoinRequest.status == 'pending'
    ).all()

    result = []
    for r in pending:
        result.append({
            'id': r.id,
            'group_id': r.group_id,
            'group_name': r.group.name,
            'user_id': r.user.id,
            'username': r.user.username,
            'email': r.user.email,
            'created_at': r.created_at.isoformat() if r.created_at else None,
        })

    return jsonify({'requests': result, 'total': len(result)}), 200


@bp.route("/groups/<int:group_id>/invitacion", methods=["POST"])
@jwt_required()
def invite_wpp(group_id):
    import urllib.parse

    current_user_id = get_jwt_identity()
    group = Group.query.get_or_404(group_id)
    
    # Check if user is a member of the group
    membership = GroupMember.query.filter_by(group_id=group.id, user_id=current_user_id).first()
    if not membership:
        return jsonify({'error': 'No pertenecés a este grupo para poder invitar.'}), 403

    frontend_url = os.getenv('FRONTEND_URL', 'http://localhost:5173')
    invite_link = f"{frontend_url}/#/join-group?groupId={group.id}"
    
    message = f"¡Te invito a unirte a mi grupo '{group.name}' en Prode Kapotes! Entrá a este link para unirte: {invite_link}"
    encoded_message = urllib.parse.quote(message)
    
    whatsapp_url = f"https://api.whatsapp.com/send?text={encoded_message}"
    
    return jsonify({'whatsapp_url': whatsapp_url}), 200