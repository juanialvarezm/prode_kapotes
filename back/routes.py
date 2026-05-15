import os
import uuid
import secrets
import requests
import resend
from datetime import datetime, timedelta

from flask import Blueprint, jsonify, request, current_app, redirect
from flask_jwt_extended import (
    create_access_token,
    get_jwt_identity,
    jwt_required,
)
from werkzeug.utils import secure_filename
from PIL import Image


from db import db
from models import User, Group, GroupMember, Match, Prediction, JoinRequest, WordleHistory

bp = Blueprint('api', __name__)

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp'}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5 MB

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


def validate_image(file):
    try:
        # Check file size
        file.seek(0, os.SEEK_END)
        file_size = file.tell()
        file.seek(0)
        
        if file_size > MAX_FILE_SIZE:
            return False, 'La imagen es demasiado grande. El tamaño máximo es 5MB.'
        
        if file_size == 0:
            return False, 'El archivo está vacío.'
        
        # Try to open and verify with PIL
        try:
            file.seek(0)
            img = Image.open(file)
            
            # Verify the format is supported
            img_format = img.format
            if img_format and img_format.lower() not in ['png', 'jpeg', 'gif', 'webp']:
                return False, 'El archivo no es una imagen válida. Solo se permiten PNG, JPG, GIF o WEBP.'
            
            # Verify that it's actually an image (this will raise an exception if corrupt)
            img.verify()
            
            # Reset file pointer and reopen for dimension check (verify() makes image unusable)
            file.seek(0)
            img = Image.open(file)
            width, height = img.size
            file.seek(0)
            
            if width > 4000 or height > 4000:
                return False, 'La imagen es demasiado grande. Las dimensiones máximas son 4000x4000 píxeles.'
            
            if width < 50 or height < 50:
                return False, 'La imagen es demasiado pequeña. Las dimensiones mínimas son 50x50 píxeles.'
            
        except Exception as e:
            return False, 'El archivo de imagen está corrupto o es inválido.'
        
        # TODO: For production, consider integrating content moderation API:
        # - AWS Rekognition (detect nudity, violence, etc.)
        # - Google Cloud Vision API (SafeSearch detection)
        # - Azure Content Moderator
        # - Sightengine API
        # Example:
        # if not is_content_appropriate(file):
        #     return False, 'La imagen contiene contenido inapropiado.'
        
        return True, None
        
    except Exception as e:
        return False, f'Error al validar la imagen: {str(e)}'


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

    token = secrets.token_urlsafe(32)

    user = User(username=username, email=email, is_verified=False, verification_token=token)
    user.set_password(password)
    db.session.add(user)
    db.session.commit()

    # Send verification email via RESEND
    resend.api_key = os.getenv('RESEND_API_KEY')
    frontend_url = os.getenv('FRONTEND_URL', 'http://localhost:5173')
    from_email = os.getenv('RESEND_FROM_EMAIL', 'no-reply@send.prodekapotes.com')
    # Link goes directly to the backend — backend verifies and redirects to frontend
    backend_url = request.url_root.rstrip('/')
    verify_url = f"{backend_url}/verify-email?token={token}"

    try:
        result = resend.Emails.send({
            "from": f"Prode Kapotes <{from_email}>",
            "to": [email],
            "subject": "Verificá tu cuenta en Prode Kapotes",
            "html": f"""
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #6c63ff;">¡Bienvenido a Prode Kapotes, {username}!</h2>
                    <p>Gracias por registrarte. Para activar tu cuenta, hacé clic en el botón de abajo:</p>
                    <a href="{verify_url}"
                       style="display: inline-block; background: #6c63ff; color: white;
                              padding: 12px 24px; border-radius: 6px; text-decoration: none;
                              font-weight: bold; margin: 16px 0;">
                        Verificar mi cuenta
                    </a>
                    <p style="color: #888; font-size: 13px;">
                        Si no creaste esta cuenta, ignorá este mensaje.
                    </p>
                </div>
            """,
        })
        current_app.logger.info(f"Verification email sent to {email}: {result}")
    except Exception as e:
        current_app.logger.error(f"[RESEND ERROR] Failed to send verification email to {email}: {e}", exc_info=True)
        return jsonify({'error': f'Error al enviar el email de verificación: {str(e)}'}), 500

    return jsonify({'message': 'User registered. Please check your email to verify your account.'}), 201


@bp.route('/verify-email', methods=['GET'])
def verify_email():
    frontend_url = os.getenv('FRONTEND_URL', 'http://localhost:5173')
    token = request.args.get('token')
    if not token:
        return redirect(f"{frontend_url}/#/auth?verify_error=token_required")

    user = User.query.filter_by(verification_token=token).first()
    if not user:
        return redirect(f"{frontend_url}/#/auth?verify_error=invalid_token")

    user.is_verified = True
    user.verification_token = None
    db.session.commit()

    access_token = create_access_token(identity=str(user.id))
    return redirect(f"{frontend_url}/#/auth?access_token={access_token}")


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

    if not user.is_verified:
        return jsonify({'error': 'Debés verificar tu email antes de iniciar sesión. Revisá tu casilla de correo.'}), 403

    access_token = create_access_token(identity=str(user.id))
    return jsonify({'access_token': access_token}), 200


@bp.route('/health')
def health():
    return {"status": "ok"}, 200

@bp.route('/me', methods=['GET'])
@jwt_required()
def get_name():
    identity = get_jwt_identity()
    try:
        user_id = int(identity)
    except (TypeError, ValueError):
        return jsonify({'error': 'Invalid user identity'}), 401

    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404

    groups_count = GroupMember.query.filter_by(user_id=user_id).count()
    total_predictions = Prediction.query.filter_by(user_id=user_id).count()

    return jsonify({
        'id': user.id,
        'username': user.username,
        'email': user.email,
        'profile_picture': user.profile_picture,
        'created_at': user.created_at.isoformat() if user.created_at else None,
        'groups_count': groups_count,
        'total_predictions': total_predictions,
    }), 200


@bp.route('/me', methods=['PUT'])
@jwt_required()
def update_profile():
    identity = get_jwt_identity()
    try:
        user_id = int(identity)
    except (TypeError, ValueError):
        return jsonify({'error': 'Invalid user identity'}), 401

    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404

    # Read only from multipart form data
    username = request.form.get('username')
    email = request.form.get('email')

    # Update username if provided
    if username and username != user.username:
        # Check if username is already taken
        existing_user = User.query.filter_by(username=username).first()
        if existing_user:
            return jsonify({'error': 'Username already taken'}), 409
        user.username = username

    # Update email if provided
    if email and email != user.email:
        # Check if email is already taken
        existing_user = User.query.filter_by(email=email).first()
        if existing_user:
            return jsonify({'error': 'Email already taken'}), 409
        user.email = email

    # Handle profile picture upload
    if 'profile_picture' in request.files:
        file = request.files['profile_picture']
        if file and file.filename:
            if not allowed_file(file.filename):
                return jsonify({'error': 'Tipo de archivo no permitido. Solo se aceptan: PNG, JPG, JPEG, GIF, WEBP'}), 400
            is_valid, error_msg = validate_image(file)
            if not is_valid:
                return jsonify({'error': error_msg}), 400

            try:
                import cloudinary.uploader

                # Delete old image from Cloudinary if exists
                if user.profile_picture_id:
                    cloudinary.uploader.destroy(user.profile_picture_id)

                file.seek(0)
                result = cloudinary.uploader.upload(
                    file,
                    folder='profile_pictures'
                )

                user.profile_picture = result['secure_url']
                user.profile_picture_id = result['public_id']

            except Exception as e:
                return jsonify({'error': 'Error subiendo la imagen', 'details': str(e)}), 500

    db.session.commit()
    return jsonify({
        'msg': 'Perfil actualizado correctamente',
        'user': {
            'username': user.username,
            'email': user.email,
            'profile_picture': user.profile_picture
        }
    }), 200


@bp.route('/groups', methods=['POST'])
@jwt_required()
def create_group():
    name = request.form.get('name') or (request.json or {}).get('name')
    description = request.form.get('description', '') or (request.json or {}).get('description', '')
    prize_pool_raw = request.form.get('prize_pool') or (request.json or {}).get('prize_pool', 0)
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
    db.session.commit()

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


# --- JOIN REQUEST SYSTEM (private groups) ---

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


# --- LEAVE GROUP ---

@bp.route('/groups/<int:group_id>/leave', methods=['POST'])
@jwt_required()
def leave_group(group_id):
    current_user_id = get_jwt_identity()
    group = Group.query.get_or_404(group_id)

    membership = GroupMember.query.filter_by(group_id=group.id, user_id=current_user_id).first()
    if not membership:
        return jsonify({'error': 'You are not a member of this group'}), 400

    # Owner logic: can only leave if they are the last member
    if str(group.owner_id) == str(current_user_id):
        member_count = GroupMember.query.filter_by(group_id=group.id).count()
        if member_count > 1:
            return jsonify({'error': 'El owner no puede abandonar el grupo mientras haya otros miembros. Eliminá a los demás primero.'}), 403

    db.session.delete(membership)
    db.session.commit()

    return jsonify({'message': f'Left group {group.name}'}), 200


# --- KICK MEMBER ---

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
            'match_time': m.match_time.isoformat(),
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
            'match_time': p.match.match_time.isoformat(),
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


# ── WORDLE ENDPOINTS ─────────────────────────────────────────────────────

@bp.route('/wordle/save', methods=['POST'])
@jwt_required()
def save_wordle_result():
    """Guarda el resultado del Wordle del día."""
    current_user_id = int(get_jwt_identity())
    data = request.json or {}
    
    won = data.get('won')
    attempts = data.get('attempts')
    player_name = data.get('player_name')
    
    if won is None or attempts is None or not player_name:
        return jsonify({'error': 'won, attempts and player_name required'}), 400
    
    # Usar la fecha de hoy (hora del servidor)
    today = datetime.utcnow().date()
    
    # Verificar si ya existe un registro para hoy
    existing = WordleHistory.query.filter_by(
        user_id=current_user_id,
        date=today
    ).first()
    
    if existing:
        # Actualizar el existente
        existing.won = won
        existing.attempts = attempts
        existing.player_name = player_name
        msg = 'Resultado actualizado'
    else:
        # Crear nuevo registro
        record = WordleHistory(
            user_id=current_user_id,
            date=today,
            won=won,
            attempts=attempts,
            player_name=player_name
        )
        db.session.add(record)
        msg = 'Resultado guardado'
    
    db.session.commit()
    return jsonify({'message': msg}), 200


@bp.route('/wordle/history', methods=['GET'])
@jwt_required()
def get_wordle_history():
    """Obtiene el historial de Wordle del usuario actual."""
    current_user_id = int(get_jwt_identity())
    
    # Obtener los últimos 30 días de historial
    history = WordleHistory.query.filter_by(
        user_id=current_user_id
    ).order_by(WordleHistory.date.desc()).limit(30).all()
    
    result = []
    for h in history:
        result.append({
            'date': h.date.isoformat(),
            'won': h.won,
            'attempts': h.attempts,
            'player_name': h.player_name,
        })
    
    # Calcular racha actual (días consecutivos ganados desde hoy hacia atrás)
    current_streak = 0
    if history:
        today = datetime.utcnow().date()
        sorted_history = sorted(history, key=lambda x: x.date, reverse=True)
        
        for i, h in enumerate(sorted_history):
            expected_date = today - timedelta(days=i)
            if h.date == expected_date and h.won:
                current_streak += 1
            else:
                break
    
    return jsonify({
        'history': result,
        'current_streak': current_streak,
        'total_played': len(history),
        'total_won': sum(1 for h in history if h.won),
    }), 200


# ── API-Football ─────────────────────────────────────────────────────────
# Docs: https://www.api-football.com/documentation-v3
# Endpoint: GET https://v3.football.api-sports.io/fixtures?league=1&season=2026
# Auth header: x-apisports-key: <API_KEY>

# AF_BASE_URL = 'https://v3.football.api-sports.io'
# AF_API_KEY  = os.getenv('API_FOOTBALL_KEY', 'xxxxxxx')

# # Status mapping: API-Football short codes → internal status
# AF_STATUS_MAP = {
#     # Not started
#     'NS':   'SCHEDULED',
#     'TBD':  'SCHEDULED',
#     'PST':  'POSTPONED',
#     # Live
#     '1H':   'IN_PLAY',
#     'HT':   'IN_PLAY',
#     '2H':   'IN_PLAY',
#     'ET':   'IN_PLAY',
#     'BT':   'IN_PLAY',
#     'P':    'IN_PLAY',
#     'INT':  'IN_PLAY',
#     'LIVE': 'IN_PLAY',
#     # Finished
#     'FT':   'FINISHED',
#     'AET':  'FINISHED',
#     'PEN':  'FINISHED',
#     # Other
#     'SUSP': 'POSTPONED',
#     'ABD':  'POSTPONED',
#     'AWD':  'FINISHED',
#     'WO':   'FINISHED',
#     'CANC': 'POSTPONED',
# }


# def _af_headers():
#     return {
#         'x-apisports-key': AF_API_KEY,
#     }


# def _sync_api_football_data(fixtures):
#     """Toma la lista 'response' de API-Football y la guarda en la DB."""
#     from dateutil import parser as dateparser

#     if not isinstance(fixtures, list):
#         return jsonify({'error': 'Formato de respuesta inesperado de API-Football'}), 400

#     inserted = 0
#     updated  = 0

#     for f in fixtures:
#         fixture_info = f.get('fixture', {})
#         teams        = f.get('teams', {})
#         goals        = f.get('goals', {})
#         status_obj   = fixture_info.get('status', {})

#         ext_id    = str(fixture_info.get('id', ''))
#         if not ext_id:
#             continue

#         home_team  = teams.get('home', {}).get('name', 'TBD')
#         away_team  = teams.get('away', {}).get('name', 'TBD')
#         home_score = goals.get('home')       # None si no jugó
#         away_score = goals.get('away')
#         raw_status = status_obj.get('short', 'NS')
#         mapped_status = AF_STATUS_MAP.get(raw_status, 'SCHEDULED')

#         date_str = fixture_info.get('date')  # ISO 8601 con tz
#         try:
#             match_time = dateparser.isoparse(date_str)
#         except Exception:
#             match_time = datetime.utcnow()

#         match = Match.query.filter_by(external_id=ext_id).first()
#         if not match:
#             match = Match(
#                 external_id=ext_id,
#                 home_team=home_team,
#                 away_team=away_team,
#                 match_time=match_time,
#                 status=mapped_status,
#                 home_score=home_score,
#                 away_score=away_score,
#             )
#             db.session.add(match)
#             inserted += 1
#         else:
#             match.home_team   = home_team
#             match.away_team   = away_team
#             match.match_time  = match_time
#             match.status      = mapped_status
#             match.home_score  = home_score
#             match.away_score  = away_score
#             updated += 1

#     db.session.commit()
#     return jsonify({
#         'message': 'Partidos sincronizados desde API-Football',
#         'inserted': inserted,
#         'updated':  updated,
#         'total':    inserted + updated,
#     }), 200


# @bp.route('/sync_matches', methods=['POST'])
# @jwt_required()
# def sync_matches():
#     """Sincroniza partidos del Mundial 2026 desde API-Football (league=1, season=2026)."""
#     if not AF_API_KEY or AF_API_KEY == 'xxxxxxx':
#         return jsonify({'error': 'API_FOOTBALL_KEY no configurada en el servidor'}), 500

#     params = {
#         'league': 1,      # FIFA World Cup
#         'season': 2026,
#     }

#     try:
#         resp = requests.get(
#             f'{AF_BASE_URL}/fixtures',
#             headers=_af_headers(),
#             params=params,
#             timeout=20,
#         )
#     except requests.exceptions.RequestException as e:
#         return jsonify({'error': 'No se pudo conectar con API-Football', 'details': str(e)}), 502

#     if resp.status_code == 401:
#         return jsonify({'error': 'API key inválida o expirada (401)'}), 502
#     if resp.status_code == 403:
#         return jsonify({'error': 'Acceso denegado a API-Football (403)'}), 502
#     if resp.status_code != 200:
#         return jsonify({
#             'error': f'Error {resp.status_code} al obtener partidos',
#             'details': resp.text[:300],
#         }), 502

#     try:
#         raw = resp.json()
#     except Exception:
#         return jsonify({'error': 'API-Football no devolvió JSON válido', 'details': resp.text[:300]}), 502

#     # API-Football devuelve los fixtures en raw['response']
#     fixtures = raw.get('response', [])
#     if not fixtures:
#         errors = raw.get('errors', {})
#         return jsonify({'error': 'Sin partidos en la respuesta', 'api_errors': errors}), 502

#     return _sync_api_football_data(fixtures)


# # Mantiene compatibilidad con el endpoint viejo que usaba el frontend
# @bp.route('/sync_wc2026', methods=['POST'])
# @jwt_required()
# def sync_wc2026():
#     """Alias de /sync_matches para compatibilidad hacia atrás."""
#     return sync_matches()

@bp.route("/matches", methods=["GET"])
def get_matches():
    matches = Match.query.all()
    return jsonify([m.to_dict() for m in matches])


# ============================================================
#  LEAGUES FEATURE
# ============================================================

from models import League, LeagueTeam, LeagueMatch, LeagueMember


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