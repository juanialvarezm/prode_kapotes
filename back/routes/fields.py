from flask import jsonify, request
from flask_jwt_extended import jwt_required
from db import db
from models import FootballField
from .blueprint import bp

ADDRESS_CLEANUP_MAP = {
    "San Martin 892": "Rodríguez Peña 3131, Villa Lynch, San Martín",
    "San Martín 892": "Rodríguez Peña 3131, Villa Lynch, San Martín",
    "Directorio": "Doblas 1043, Caballito",
    "Crisólogo Larralde": "Padre Canavery 1351, Núñez",
    "Elvira Rawson": "Av. Alicia Moreau de Justo 989, Puerto Madero",
    "Mugica": "Av. Ramos Mejía 1350, Retiro",
    "Asamblea": "Emilio Mitre 985, Parque Chacabuco",
    "Pampa 1420": "Arribeños 1701, Belgrano",
    "Juan B. Justo 7700": "Roma 560, Liniers",
    "Triunvirato 4500": "Av. Francisco Beiró 2835, Agronomía",
    "Boedo 800": "Castro 1224, Boedo",
    "Libertador 15000": "Gaetán Gutiérrez 857, San Isidro",
    "Maipú 1100": "Carlos Francisco Melo 460, Vicente López",
    "Libertador 900": "Av. del Libertador 1081, Vicente López",
    "Liniers 1200": "Av. Liniers 2244, Victoria, Tigre",
    "Mitre 1200": "9 de Julio 398, Avellaneda",
    "Hipólito Yrigoyen 4500": "Ramón Cabrero 2007, Lanús",
    "Alsina 1200": "Av. Las Heras 1512, Lomas de Zamora",
    "Guido y Autopista": "Av. Vicente López 3186, Quilmes",
    "25 de Mayo 1200": "Rodríguez Peña 3131, Villa Lynch, San Martín",
    "Rivadavia 14200": "Necochea 953, Ramos Mejía",
    "Hipólito Yrigoyen 1200": "Av. Eva Perón 2176, Morón",
    "Brandson 3200": "Intendente Carlos Ratti 1490, Ituzaingó",
    "Arias 2300": "Pte. Sarmiento 3391, Castelar"
}

def clean_field_name(name):
    if not name:
        return "Camp Nou"
    cleaned = name
    for word in ["Predio ", " Predio", "Arena ", " Arena", "Complejo ", " Complejo", "Torneos y Complejo "]:
        cleaned = cleaned.replace(word, "")
    cleaned = cleaned.strip()
    if not cleaned or cleaned.lower() in ["arena", "predio", "complejo"]:
        return "Camp Nou"
    return cleaned

def sanitize_field_dict(f):
    addr = f.address or ""
    for match_str, replace_str in ADDRESS_CLEANUP_MAP.items():
        if match_str in addr:
            addr = replace_str
            break
            
    name = clean_field_name(f.name)
    zone = f.zone
    name_lower = (name or "").lower()
    addr_lower = addr.lower()
    if "caballito" in name_lower or "caballito" in addr_lower:
        zone = "CABA"
    elif "vicente" in name_lower or "vicente" in addr_lower:
        zone = "GBA Norte"

    return {
        'id': f.id,
        'name': name,
        'address': addr,
        'zone': zone,
        'phone': f.phone,
        'field_types': f.field_types,
        'surface': f.surface,
        'features': f.features,
        'image_url': f.image_url,
        'description': f.description
    }

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
    
    result = [sanitize_field_dict(f) for f in fields]
        
    return jsonify({
        'fields': result,
        'has_more': (page * per_page) < total,
        'total': total
    }), 200


@bp.route('/fields/<int:field_id>', methods=['GET'])
@jwt_required(optional=True)
def get_field_by_id(field_id):
    f = FootballField.query.get_or_404(field_id)
    return jsonify(sanitize_field_dict(f)), 200
