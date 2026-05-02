import os
from dotenv import load_dotenv
from jobs.sheduler import start_scheduler

load_dotenv()

from flask import Flask, send_from_directory
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager
import cloudinary

from db import db

app = Flask(__name__)


uri = os.getenv("DB_URL") or os.getenv("DATABASE_URL")

if not uri:
    raise RuntimeError("DB_URL no está seteada")

if uri.startswith("mysql://"):
    uri = uri.replace("mysql://", "mysql+pymysql://", 1)

app.config['SQLALCHEMY_DATABASE_URI'] = uri  # ← esto faltaba
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'super-secret-key')

print("DATABASE_URL =", os.getenv("DATABASE_URL"))

cloudinary.config(
    api_key = os.getenv("CLOUDINARY_API_KEY"),
    api_secret = os.getenv("CLOUDINARY_API_SECRET"),
    cloud_name = os.getenv("CLOUDINARY_CLOUD_NAME")
)

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

# Iniciar scheduler con contexto de app
start_scheduler(app)

if __name__ == '__main__':
    app.run(debug=True)