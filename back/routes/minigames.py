from datetime import datetime
from flask import jsonify, request
from flask_jwt_extended import get_jwt_identity, jwt_required

from db import db
from models import User, MinigameReward
from .blueprint import bp

@bp.route('/minigames/claim-reward', methods=['POST'])
@jwt_required()
def claim_minigame_reward():
    """Otorga +15 puntos al usuario si ganó un minijuego hoy y aún no reclamó la recompensa diaria de ese juego."""
    current_user_id = int(get_jwt_identity())
    data = request.json or {}
    
    game_name = data.get('game_name')  # 'goltexto' | 'futlegacy' | 'wordle'
    if not game_name or game_name not in ['goltexto', 'futlegacy', 'wordle']:
        return jsonify({'error': 'Nombre de juego inválido.'}), 400
    
    today = datetime.utcnow().date()
    
    existing = MinigameReward.query.filter_by(
        user_id=current_user_id,
        game_name=game_name,
        date=today
    ).first()
    
    user = User.query.get_or_404(current_user_id)
    
    if existing:
        return jsonify({
            'message': 'Ya reclamaste la recompensa de hoy para este minijuego.',
            'points_granted': 0,
            'points': user.points or 0
        }), 200
        
    # Grant reward
    reward = MinigameReward(
        user_id=current_user_id,
        game_name=game_name,
        date=today
    )
    db.session.add(reward)
    user.points = (user.points or 0) + 15
    db.session.commit()
    
    return jsonify({
        'message': f'¡Felicidades! Ganaste +15 puntos por tu victoria.',
        'points_granted': 15,
        'points': user.points
    }), 200
