import os
import secrets
import re
from flask import jsonify, request, current_app, redirect
from flask_jwt_extended import (
    create_access_token,
    get_jwt_identity,
    jwt_required,
)
# pyrefly: ignore [missing-import]
import resend

from db import db
from models import User, GroupMember, Prediction, Match
from .blueprint import bp
from .helpers import allowed_file, validate_image

USERNAME_REGEX = re.compile(r'^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ_ .-]+$')

@bp.route('/register', methods=['POST'])
def register():
    data = request.json or {}
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')

    if not all([username, email, password]):
        return jsonify({'error': 'username, email and password required'}), 400

    if not USERNAME_REGEX.match(username):
        return jsonify({'error': "El nombre de usuario solo puede contener letras, números, espacios, puntos, guiones y guiones bajos (sin '@')."}), 400

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
    
    from datetime import datetime
    from models import GroupMatch, GroupMatchParticipant
    now = datetime.utcnow()
    played_matches_count = GroupMatchParticipant.query.filter_by(user_id=user_id, confirmed=True)\
        .join(GroupMatch)\
        .filter(GroupMatch.match_date < now)\
        .count()

    return jsonify({
        'id': user.id,
        'username': user.username,
        'email': user.email,
        'profile_picture': user.profile_picture,
        'created_at': user.created_at.isoformat() if user.created_at else None,
        'groups_count': groups_count,
        'played_matches_count': played_matches_count,
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
        if not USERNAME_REGEX.match(username):
            return jsonify({'error': "El nombre de usuario solo puede contener letras, números, espacios, puntos, guiones y guiones bajos (sin '@')."}), 400
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


@bp.route('/users/search', methods=['GET'])
@jwt_required()
def search_users():
    q = request.args.get('q', '').strip()
    if len(q) < 2:
        return jsonify({'users': [], 'has_more': False, 'total': 0}), 200

    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)

    try:
        current_user_id = int(get_jwt_identity())
    except (ValueError, TypeError):
        current_user_id = None

    # Base query filtering matching usernames and excluding current user
    query = User.query.filter(User.username.ilike(f'%{q}%'))
    if current_user_id is not None:
        query = query.filter(User.id != current_user_id)

    total = query.count()
    users = query.offset((page - 1) * per_page).limit(per_page).all()

    result = [
        {
            'id': u.id,
            'username': u.username,
            'email': u.email,
            'profile_picture': u.profile_picture
        }
        for u in users
    ]
    return jsonify({
        'users': result,
        'has_more': (page * per_page) < total,
        'total': total
    }), 200


@bp.route('/users/<int:user_id>', methods=['GET'])
@jwt_required()
def get_user_profile(user_id):
    from datetime import datetime
    from collections import Counter
    from models import GroupMatch, GroupMatchParticipant

    user = User.query.get_or_404(user_id)

    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)

    # Calculate stats across all match participations
    participations = GroupMatchParticipant.query.filter_by(user_id=user.id, confirmed=True).join(GroupMatch).all()
    
    now = datetime.utcnow()
    played_participations = [p for p in participations if p.group_match.match_date < now]
    played_count = len(played_participations)
    
    paid_count = sum(1 for p in played_participations if p.paid)
    pending_payment_count = played_count - paid_count
    
    upcoming_participations = [p for p in participations if p.group_match.match_date >= now]
    upcoming_count = len(upcoming_participations)

    # Calculate estimated spent
    total_spent = 0
    for p in played_participations:
        m = p.group_match
        part_count = GroupMatchParticipant.query.filter_by(group_match_id=m.id, confirmed=True).count()
        if part_count > 0:
            total_spent += m.price / part_count
    total_spent = round(total_spent)

    # Calculate favorite fields (top 3)
    field_counts = Counter(p.group_match.field_name for p in played_participations)
    favorite_fields = [field for field, count in field_counts.most_common(3)]

    # Get paginated matches
    paginated_parts = GroupMatchParticipant.query.filter_by(user_id=user.id, confirmed=True)\
        .join(GroupMatch)\
        .order_by(GroupMatch.match_date.desc())\
        .offset((page - 1) * per_page)\
        .limit(per_page)\
        .all()

    matches_data = []
    for p in paginated_parts:
        m = p.group_match
        part_count = GroupMatchParticipant.query.filter_by(group_match_id=m.id, confirmed=True).count()
        cost_per_person = round(m.price / part_count) if part_count > 0 else m.price
        
        matches_data.append({
            'id': m.id,
            'title': m.title,
            'match_date': m.match_date.isoformat() + 'Z',
            'field_name': m.field_name,
            'price': m.price,
            'group_name': m.group.name if m.group else "Sin grupo",
            'group_id': m.group_id,
            'cost_per_person': cost_per_person,
            'paid': p.paid,
            'is_past': m.match_date < now
        })

    total_matches = len(participations)

    return jsonify({
        'user': {
            'id': user.id,
            'username': user.username,
            'profile_picture': user.profile_picture,
            'created_at': user.created_at.isoformat() if user.created_at else None,
        },
        'stats': {
            'played_count': played_count,
            'paid_count': paid_count,
            'pending_payment_count': pending_payment_count,
            'upcoming_count': upcoming_count,
            'total_spent': total_spent,
            'favorite_fields': favorite_fields
        },
        'matches': matches_data,
        'has_more': (page * per_page) < total_matches
    }), 200
