---
trigger: always_on
description: Flask backend conventions, API route structure, auth guards, ORM models, and database migration rules.
---

# Backend Conventions & Flask Rules

## 1. Route Pattern & Flow
All API routes are registered on the single blueprint `bp = Blueprint('api', __name__)` in `back/routes.py`. Follow this exact flow in handlers:

```python
@bp.route('/leagues', methods=['POST'])
@jwt_required()
def create_league():
    data = request.json or {}
    current_user_id = get_jwt_identity()

    # 1. Input validation
    name = data.get('name')
    if not name:
        return jsonify({'error': 'name is required'}), 400

    # 2. Guard clauses & business logic
    if League.query.filter_by(name=name).first():
        return jsonify({'error': 'League already exists'}), 409

    # 3. DB modification
    league = League(name=name, owner_id=current_user_id)
    db.session.add(league)
    db.session.commit()

    # 4. JSON response
    return jsonify({'message': 'League created', 'league_id': league.id}), 201
```

## 2. Authentication & Authorization Guards
- **JWT Protection:** Use `@jwt_required()` on protected routes. Retrieve identity with `current_user_id = get_jwt_identity()`.
- **Ownership Guard:** Explicitly compare IDs as strings when verifying resource ownership:
  ```python
  if str(league.owner_id) != str(current_user_id):
      return jsonify({'error': 'Only the owner can do this'}), 403
  ```

## 3. Response Standard Format
- **Error Responses:** ALWAYS use the `'error'` key with appropriate HTTP 4xx/5xx status code:
  `return jsonify({'error': 'Human-readable internal error message'}), 400`
- **Success Responses:** Return a JSON object with `'message'` and/or payload data:
  `return jsonify({'message': 'Success', 'id': item.id}), 200`

## 4. Models & Database Rules
- **Location:** All models live in `back/models.py`.
- **Naming:** Classes in `PascalCase`, tables in `snake_case` plural (`__tablename__ = 'leagues'`).
- **Cascade Deletes:** Specify `cascade='all, delete-orphan'` on parent-child relationships where deletion should clean up children.
- **Migration Workflow:** Always apply model changes through Flask-Migrate:
  ```bash
  cd back
  flask db migrate -m "description of changes"
  flask db upgrade
  ```
