import os
import uuid
import random
from datetime import datetime
from flask import jsonify, request, current_app
from flask_jwt_extended import get_jwt_identity, jwt_required

from db import db
from models import User, Group, GroupMember, JoinRequest, Prediction, Match, GroupMatch, GroupMatchParticipant, GroupMatchMvpVote, GroupMessage
from .blueprint import bp
from .helpers import allowed_file, validate_image

@bp.route('/groups', methods=['POST'])
@jwt_required()
def create_group():
    json_data = request.get_json(silent=True) or {}
    name = request.form.get('name') or json_data.get('name')
    description = request.form.get('description', '') or json_data.get('description', '')
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

    # Direct join: create membership
    member = GroupMember(group_id=group.id, user_id=current_user_id)
    db.session.add(member)

    # Clean up any existing join requests (pending or rejected)
    JoinRequest.query.filter_by(group_id=group.id, user_id=current_user_id).delete()

    db.session.commit()

    return jsonify({'message': f'Successfully joined group {group.name}'}), 200


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
            'profile_picture': r.user.profile_picture,
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
            'profile_picture': p.user.profile_picture,
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
        'group_avatar_url': group.avatar_url,
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
        'profile_picture': ms.user.profile_picture,
    } for ms in memberships]

    # Get pending request count (for owner)
    pending_count = JoinRequest.query.filter_by(group_id=group.id, status='pending').count() if is_owner else 0

    return jsonify({
        'id': group.id,
        'name': group.name,
        'description': group.description,
        'avatar_url': group.avatar_url,
        'owner_id': group.owner_id,
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
            'group_avatar_url': r.group.avatar_url,
            'user_id': r.user.id,
            'username': r.user.username,
            'email': r.user.email,
            'profile_picture': r.user.profile_picture,
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

    frontend_url = os.getenv('FRONTEND_URL', 'http://localhost:5173').rstrip('/')
    invite_link = f"{frontend_url}/#/join-group?groupId={group.id}"
    
    message = f"¡Te invito a unirte a mi grupo '{group.name}' en Prode Kapotes! Entrá a este link para unirte: {invite_link}"
    encoded_message = urllib.parse.quote(message)
    
    whatsapp_url = f"https://api.whatsapp.com/send?text={encoded_message}"
    
    return jsonify({'whatsapp_url': whatsapp_url}), 200


# ============================================================
#  ORGANIZED MATCHES ENDPOINTS
# ============================================================

@bp.route('/groups/<int:group_id>/organized-matches', methods=['GET'])
@jwt_required()
def get_organized_matches(group_id):
    current_user_id = int(get_jwt_identity())
    group = Group.query.get_or_404(group_id)

    # Check if user is member
    membership = GroupMember.query.filter_by(group_id=group.id, user_id=current_user_id).first()
    if not membership:
        return jsonify({'error': 'No pertenecés a este grupo.'}), 403

    matches = GroupMatch.query.filter_by(group_id=group.id).order_by(GroupMatch.match_date.desc()).all()
    
    result = []
    from collections import Counter
    now = datetime.utcnow()
    
    for m in matches:
        is_past = m.match_date < now
        
        # Count MVP votes for past matches
        vote_counts = Counter()
        my_vote = None
        if is_past:
            votes = [v.voted_id for v in m.mvp_votes]
            vote_counts = Counter(votes)
            for v in m.mvp_votes:
                if v.voter_id == current_user_id:
                    my_vote = v.voted_id
                    break

        # Calculate winner MVP ID
        winner_mvp_id = None
        if is_past and vote_counts:
            max_votes = max(vote_counts.values())
            if max_votes > 0:
                candidates = [uid for uid, count in vote_counts.items() if count == max_votes]
                winner_mvp_id = candidates[0]

        participants_list = []
        user_confirmed = False
        user_paid = False
        
        for p in m.participants:
            participants_list.append({
                'user_id': p.user.id,
                'username': p.user.username,
                'profile_picture': p.user.profile_picture,
                'confirmed': p.confirmed,
                'paid': p.paid,
                'votes_count': vote_counts.get(p.user.id, 0) if is_past else 0
            })
            if p.user_id == current_user_id:
                user_confirmed = p.confirmed
                user_paid = p.paid
                
        result.append({
            'id': m.id,
            'title': m.title,
            'match_date': m.match_date.isoformat(),
            'field_name': m.field_name,
            'price': m.price,
            'created_at': m.created_at.isoformat() if m.created_at else None,
            'creator_id': m.creator_id,
            'participants': participants_list,
            'is_confirmed': user_confirmed,
            'is_paid': user_paid,
            'is_past': is_past,
            'match_photo': m.match_photo,
            'my_vote': my_vote,
            'winner_mvp_id': winner_mvp_id
        })
        
    return jsonify({'matches': result}), 200


@bp.route('/groups/<int:group_id>/organized-matches', methods=['POST'])
@jwt_required()
def create_organized_match(group_id):
    current_user_id = int(get_jwt_identity())
    group = Group.query.get_or_404(group_id)

    # Check if member
    membership = GroupMember.query.filter_by(group_id=group.id, user_id=current_user_id).first()
    if not membership:
        return jsonify({'error': 'No pertenecés a este grupo para poder organizar partidos.'}), 403


    json_data = request.get_json(silent=True) or {}
    title = json_data.get('title') or 'Partido de fútbol'
    date_str = json_data.get('match_date')
    field_name = json_data.get('field_name')
    price = json_data.get('price', 0)

    if not date_str or not field_name:
        return jsonify({'error': 'La fecha y la cancha son obligatorias.'}), 400

    try:
        if date_str.endswith('Z'):
            date_str = date_str[:-1]
        match_date = datetime.fromisoformat(date_str)
    except Exception:
        return jsonify({'error': 'Formato de fecha inválido.'}), 400

    try:
        price = int(price)
    except ValueError:
        price = 0

    match = GroupMatch(
        group_id=group.id,
        creator_id=current_user_id,
        title=title,
        match_date=match_date,
        field_name=field_name,
        price=price
    )
    db.session.add(match)
    db.session.commit()

    return jsonify({'message': 'Partido organizado con éxito.', 'match_id': match.id}), 201


@bp.route('/groups/<int:group_id>/organized-matches/<int:match_id>', methods=['DELETE'])
@jwt_required()
def delete_organized_match(group_id, match_id):
    current_user_id = int(get_jwt_identity())
    group = Group.query.get_or_404(group_id)

    match = GroupMatch.query.filter_by(id=match_id, group_id=group.id).first_or_404()

    # Check if owner of group OR creator of match
    if str(group.owner_id) != str(current_user_id) and str(match.creator_id) != str(current_user_id):
        return jsonify({'error': 'Solo el creador del partido o el dueño del grupo pueden eliminar partidos.'}), 403
    
    db.session.delete(match)
    db.session.commit()

    return jsonify({'message': 'Partido eliminado con éxito.'}), 200


@bp.route('/groups/<int:group_id>/organized-matches/<int:match_id>/attend', methods=['POST'])
@jwt_required()
def toggle_organized_match_attendance(group_id, match_id):
    current_user_id = int(get_jwt_identity())
    group = Group.query.get_or_404(group_id)

    # Check if user is member
    membership = GroupMember.query.filter_by(group_id=group.id, user_id=current_user_id).first()
    if not membership:
        return jsonify({'error': 'No pertenecés a este grupo.'}), 403

    match = GroupMatch.query.filter_by(id=match_id, group_id=group.id).first_or_404()

    json_data = request.get_json(silent=True) or {}
    confirmed = json_data.get('confirmed', True)

    participant = GroupMatchParticipant.query.filter_by(group_match_id=match.id, user_id=current_user_id).first()

    if confirmed:
        if not participant:
            participant = GroupMatchParticipant(group_match_id=match.id, user_id=current_user_id, confirmed=True, paid=False)
            db.session.add(participant)
        else:
            participant.confirmed = True
    else:
        if participant:
            db.session.delete(participant)

    db.session.commit()
    return jsonify({'message': 'Asistencia actualizada con éxito.'}), 200


@bp.route('/groups/<int:group_id>/organized-matches/<int:match_id>/participants/<int:user_id>/pay', methods=['POST'])
@jwt_required()
def toggle_participant_payment(group_id, match_id, user_id):
    current_user_id = int(get_jwt_identity())
    group = Group.query.get_or_404(group_id)
    match = GroupMatch.query.filter_by(id=match_id, group_id=group.id).first_or_404()

    # Check if owner of the group or creator of the match
    if str(group.owner_id) != str(current_user_id) and str(match.creator_id) != str(current_user_id):
        return jsonify({'error': 'Solo el administrador del grupo o el creador del partido pueden registrar pagos.'}), 403

    participant = GroupMatchParticipant.query.filter_by(group_match_id=match.id, user_id=user_id).first_or_404()

    json_data = request.get_json(silent=True) or {}
    paid = json_data.get('paid', True)

    participant.paid = paid
    db.session.commit()

    return jsonify({'message': 'Estado de pago actualizado con éxito.', 'paid': participant.paid}), 200


@bp.route('/groups/<group_id>/organized-matches/<int:match_id>/vote-mvp', methods=['POST'])
@jwt_required()
def vote_organized_match_mvp(group_id, match_id):
    current_user_id = int(get_jwt_identity())
    group = Group.query.get_or_404(group_id)

    # Check if user is member
    membership = GroupMember.query.filter_by(group_id=group.id, user_id=current_user_id).first()
    if not membership:
        return jsonify({'error': 'No pertenecés a este grupo.'}), 403

    match = GroupMatch.query.filter_by(id=match_id, group_id=group.id).first_or_404()

    # Validate that match has finished
    if match.match_date > datetime.utcnow():
        return jsonify({'error': 'No podés votar antes de que termine el partido.'}), 400

    # Read voted user id
    json_data = request.get_json(silent=True) or {}
    voted_id = json_data.get('voted_id')
    if not voted_id:
        return jsonify({'error': 'Debés especificar a quién votar.'}), 400

    # Ensure current user is a confirmed participant of the match
    voter_participant = GroupMatchParticipant.query.filter_by(group_match_id=match.id, user_id=current_user_id, confirmed=True).first()
    if not voter_participant:
        return jsonify({'error': 'Solo los jugadores confirmados que participaron del partido pueden votar.'}), 403

    # Ensure voted user is a confirmed participant of the match
    voted_participant = GroupMatchParticipant.query.filter_by(group_match_id=match.id, user_id=voted_id, confirmed=True).first()
    if not voted_participant:
        return jsonify({'error': 'El jugador votado debe ser un participante confirmado del partido.'}), 400

    # Create or update vote
    vote = GroupMatchMvpVote.query.filter_by(group_match_id=match.id, voter_id=current_user_id).first()
    if not vote:
        vote = GroupMatchMvpVote(group_match_id=match.id, voter_id=current_user_id, voted_id=voted_id)
        db.session.add(vote)
    else:
        vote.voted_id = voted_id

    db.session.commit()
    return jsonify({'message': 'Voto registrado con éxito.'}), 200


@bp.route('/groups/<group_id>/organized-matches/<int:match_id>/photo', methods=['POST'])
@jwt_required()
def upload_organized_match_photo(group_id, match_id):
    current_user_id = int(get_jwt_identity())
    group = Group.query.get_or_404(group_id)

    # Check if user is member
    membership = GroupMember.query.filter_by(group_id=group.id, user_id=current_user_id).first()
    if not membership:
        return jsonify({'error': 'No pertenecés a este grupo.'}), 403

    match = GroupMatch.query.filter_by(id=match_id, group_id=group.id).first_or_404()

    # Validate that match has finished
    if match.match_date > datetime.utcnow():
        return jsonify({'error': 'No podés subir fotos antes de que termine el partido.'}), 400

    # Ensure uploader is confirmed participant or group owner
    participant = GroupMatchParticipant.query.filter_by(group_match_id=match.id, user_id=current_user_id, confirmed=True).first()
    is_owner = str(group.owner_id) == str(current_user_id)
    if not participant and not is_owner:
        return jsonify({'error': 'Solo los jugadores que participaron o el administrador pueden subir fotos.'}), 403

    if 'photo' not in request.files:
        return jsonify({'error': 'No file uploaded'}), 400

    file = request.files['photo']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    if not allowed_file(file.filename):
        return jsonify({'error': 'Formato de imagen no permitido. Usa JPG, JPEG o PNG.'}), 400

    # Upload to Cloudinary
    try:
        import cloudinary.uploader
        
        # If there is an existing photo, delete it first
        if match.match_photo_id:
            try:
                cloudinary.uploader.destroy(match.match_photo_id)
            except Exception as e:
                print("Failed to delete old photo:", e)

        # Upload new photo
        result = cloudinary.uploader.upload(
            file, 
            folder='match_photos',
            transformation=[
                {"width": 800, "height": 600, "crop": "limit"},
                {"quality": "auto:good"}
            ]
        )
        
        match.match_photo = result.get('secure_url')
        match.match_photo_id = result.get('public_id')

        # Award 50 points to all confirmed participants and creator if not already awarded for this match
        points_awarded = False
        if not getattr(match, 'photo_points_awarded', False):
            confirmed_participants = GroupMatchParticipant.query.filter_by(group_match_id=match.id, confirmed=True).all()
            user_ids_to_reward = {p.user_id for p in confirmed_participants}
            user_ids_to_reward.add(match.creator_id)

            for u_id in user_ids_to_reward:
                u = User.query.get(u_id)
                if u:
                    u.points = (u.points or 0) + 50

            match.photo_points_awarded = True
            points_awarded = True

        db.session.commit()

        msg = '¡Foto subida con éxito! Se otorgaron +50 puntos a los participantes.' if points_awarded else 'Foto del partido actualizada con éxito.'

        return jsonify({
            'message': msg,
            'match_photo': match.match_photo,
            'points_awarded': points_awarded,
            'points_granted': 50 if points_awarded else 0
        }), 200
    except Exception as e:
        return jsonify({'error': f'Error al subir la imagen: {str(e)}'}), 500


# ============================================================
#  GROUP CHAT API
# ============================================================

@bp.route('/groups/<int:group_id>/messages', methods=['GET'])
@jwt_required()
def get_group_messages(group_id):
    current_user_id = get_jwt_identity()
    group = Group.query.get(group_id)
    if not group:
        return jsonify({'error': 'Group not found'}), 404

    is_member = GroupMember.query.filter_by(group_id=group_id, user_id=current_user_id).first()
    if not is_member and str(group.owner_id) != str(current_user_id):
        return jsonify({'error': 'You are not a member of this group'}), 403

    after_id = request.args.get('after_id', type=int)

    if after_id:
        messages = GroupMessage.query.filter(
            GroupMessage.group_id == group_id,
            GroupMessage.id > after_id
        ).order_by(GroupMessage.id.asc()).limit(100).all()
    else:
        messages = GroupMessage.query.filter_by(group_id=group_id).order_by(GroupMessage.id.desc()).limit(50).all()
        messages.reverse()

    result = []
    for m in messages:
        result.append({
            'id': m.id,
            'group_id': m.group_id,
            'user_id': m.user_id,
            'username': m.user.username if m.user else 'Usuario',
            'user_profile_picture': m.user.profile_picture if m.user else None,
            'content': m.content,
            'created_at': m.created_at.isoformat() if m.created_at else None
        })

    return jsonify({'messages': result}), 200



@bp.route('/groups/<int:group_id>/messages', methods=['POST'])
@jwt_required()
def send_group_message(group_id):
    current_user_id = get_jwt_identity()
    group = Group.query.get(group_id)
    if not group:
        return jsonify({'error': 'Group not found'}), 404

    is_member = GroupMember.query.filter_by(group_id=group_id, user_id=current_user_id).first()
    if not is_member and str(group.owner_id) != str(current_user_id):
        return jsonify({'error': 'You are not a member of this group'}), 403

    data = request.get_json(silent=True) or {}
    content = (data.get('content') or '').strip()

    if not content:
        return jsonify({'error': 'Message content cannot be empty'}), 400

    if len(content) > 1000:
        return jsonify({'error': 'Message is too long (max 1000 characters)'}), 400

    msg = GroupMessage(group_id=group_id, user_id=current_user_id, content=content)
    db.session.add(msg)
    db.session.commit()

    return jsonify({
        'message': 'Message sent',
        'chat_message': {
            'id': msg.id,
            'group_id': msg.group_id,
            'user_id': msg.user_id,
            'username': msg.user.username if msg.user else 'Usuario',
            'user_profile_picture': msg.user.profile_picture if msg.user else None,
            'content': msg.content,
            'created_at': msg.created_at.isoformat() if msg.created_at else None
        }
    }), 201