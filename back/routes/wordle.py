from datetime import datetime, timedelta
from flask import jsonify, request
from flask_jwt_extended import get_jwt_identity, jwt_required

from db import db
from models import WordleHistory, User, MinigameReward
from .blueprint import bp

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

    # Check if win reward for today should be awarded (+15 pts)
    points_granted = 0
    if won:
        reward_claimed = MinigameReward.query.filter_by(
            user_id=current_user_id,
            game_name='wordle',
            date=today
        ).first()
        if not reward_claimed:
            reward = MinigameReward(
                user_id=current_user_id,
                game_name='wordle',
                date=today
            )
            db.session.add(reward)
            user = User.query.get(current_user_id)
            if user:
                user.points = (user.points or 0) + 15
                points_granted = 15

    db.session.commit()
    user = User.query.get(current_user_id)
    new_total_points = user.points if user else 0
    return jsonify({
        'message': msg,
        'points_granted': points_granted,
        'points': new_total_points
    }), 200


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
