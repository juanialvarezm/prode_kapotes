from flask import jsonify, request
from flask_jwt_extended import jwt_required
from db import db
from models import FootballField
from .blueprint import bp

@bp.route('/fields', methods=['GET'])
@jwt_required(optional=True)
def get_fields():
    query = FootballField.query
    
    # Filter by zone
    zone = request.args.get('zone')
    if zone and zone != 'Todos':
        query = query.filter(FootballField.zone == zone)
        
    # Filter by type (F5, F7, F8, F11)
    field_type = request.args.get('type')
    if field_type and field_type != 'Todos':
        query = query.filter(FootballField.field_types.like(f"%{field_type}%"))
        
    # Search query
    search = request.args.get('q')
    if search:
        query = query.filter(
            (FootballField.name.like(f"%{search}%")) |
            (FootballField.address.like(f"%{search}%"))
        )
        
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 12, type=int)
    
    total = query.count()
    fields = query.order_by(FootballField.name.asc())\
                  .offset((page - 1) * per_page)\
                  .limit(per_page)\
                  .all()
    
    result = []
    for f in fields:
        result.append({
            'id': f.id,
            'name': f.name,
            'address': f.address,
            'zone': f.zone,
            'phone': f.phone,
            'field_types': f.field_types,
            'surface': f.surface,
            'features': f.features,
            'image_url': f.image_url,
            'description': f.description
        })
        
    return jsonify({
        'fields': result,
        'has_more': (page * per_page) < total,
        'total': total
    }), 200


@bp.route('/fields/<int:field_id>', methods=['GET'])
@jwt_required(optional=True)
def get_field_by_id(field_id):
    f = FootballField.query.get_or_404(field_id)
    return jsonify({
        'id': f.id,
        'name': f.name,
        'address': f.address,
        'zone': f.zone,
        'phone': f.phone,
        'field_types': f.field_types,
        'surface': f.surface,
        'features': f.features,
        'image_url': f.image_url,
        'description': f.description
    }), 200
