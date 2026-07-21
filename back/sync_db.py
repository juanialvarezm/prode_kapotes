from init import app
from db import db
from sqlalchemy import text

with app.app_context():
    db.create_all()
    
    with db.engine.connect() as conn:
        try:
            conn.execute(text("ALTER TABLE users ADD COLUMN points INT NOT NULL DEFAULT 0;"))
            conn.commit()
            print("Added points column to users")
        except Exception as e:
            print("points column status:", e)
            
        try:
            conn.execute(text("ALTER TABLE group_matches ADD COLUMN photo_points_awarded TINYINT(1) NOT NULL DEFAULT 0;"))
            conn.commit()
            print("Added photo_points_awarded column to group_matches")
        except Exception as e:
            print("photo_points_awarded column status:", e)

print("DB Sync Completed Successfully.")
