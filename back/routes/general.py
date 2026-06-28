from flask import jsonify
from .blueprint import bp

@bp.route('/')
def home():
    return jsonify({'message': 'Welcome to Prode Kapotes API'})

@bp.route('/health')
def health():
    return {"status": "ok"}, 200
