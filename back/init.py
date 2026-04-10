import os

from flask import Flask, send_from_directory
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager

from db import db

app = Flask(__name__)

# Configuración de MySQL.
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'mysql+pymysql://user:password@localhost/prode_kapotes')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'super-secret-key')

# Upload configuration
UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'uploads')
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 5 * 1024 * 1024  # 5 MB max

# Inicialización de extensiones
from flask_cors import CORS
CORS(app)

db.init_app(app)
migrate = Migrate(app, db)
jwt = JWTManager(app)

# Serve uploaded files
@app.route('/uploads/<path:filename>')
def uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

# Importar modelos y rutas tras la inicialización.
from models import *
from routes import bp as routes_bp
app.register_blueprint(routes_bp)

if __name__ == '__main__':
    app.run(debug=True)