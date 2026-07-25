from datetime import datetime
from flask import jsonify, request
from flask_jwt_extended import get_jwt_identity, jwt_required

from db import db
from models import GroupMember, Match, Prediction
from .blueprint import bp

###comment

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
