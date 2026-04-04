import os

from flask import Flask
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager

from db import db

app = Flask(__name__)

# Configuración de MySQL.
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'mysql+pymysql://user:password@localhost/prode_kapotes')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'super-secret-key')

# Inicialización de extensiones
from flask_cors import CORS
CORS(app)

db.init_app(app)
migrate = Migrate(app, db)
jwt = JWTManager(app)

# Importar modelos y rutas tras la inicialización.
from models import *
from routes import bp as routes_bp
app.register_blueprint(routes_bp)

if __name__ == '__main__':
    app.run(debug=True)