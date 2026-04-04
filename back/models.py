from datetime import datetime

from werkzeug.security import generate_password_hash, check_password_hash

from db import db


class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    groups = db.relationship('Group', backref='owner', lazy=True)
    group_memberships = db.relationship('GroupMember', back_populates='user', lazy=True)
    predictions = db.relationship('Prediction', back_populates='user', lazy=True)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)


class Group(db.Model):
    __tablename__ = 'groups'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), unique=True, nullable=False)
    description = db.Column(db.String(255), nullable=True)
    owner_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    members = db.relationship('GroupMember', back_populates='group', lazy=True)
    predictions = db.relationship('Prediction', back_populates='group', lazy=True)


class GroupMember(db.Model):
    __tablename__ = 'group_members'
    id = db.Column(db.Integer, primary_key=True)
    group_id = db.Column(db.Integer, db.ForeignKey('groups.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    joined_at = db.Column(db.DateTime, default=datetime.utcnow)

    group = db.relationship('Group', back_populates='members')
    user = db.relationship('User', back_populates='group_memberships')


class Match(db.Model):
    __tablename__ = 'matches'
    id = db.Column(db.Integer, primary_key=True)
    external_id = db.Column(db.String(120), unique=True, nullable=False)
    home_team = db.Column(db.String(120), nullable=False)
    away_team = db.Column(db.String(120), nullable=False)
    match_time = db.Column(db.DateTime, nullable=False)
    status = db.Column(db.String(32), nullable=False, default='SCHEDULED')
    home_score = db.Column(db.Integer, nullable=True)
    away_score = db.Column(db.Integer, nullable=True)

    predictions = db.relationship('Prediction', back_populates='match', lazy=True)


class Prediction(db.Model):
    __tablename__ = 'predictions'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    group_id = db.Column(db.Integer, db.ForeignKey('groups.id'), nullable=False)
    match_id = db.Column(db.Integer, db.ForeignKey('matches.id'), nullable=False)
    predicted_home = db.Column(db.Integer, nullable=False)
    predicted_away = db.Column(db.Integer, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    user = db.relationship('User', back_populates='predictions')
    group = db.relationship('Group', back_populates='predictions')
    match = db.relationship('Match', back_populates='predictions')

    def is_exact(self):
        if self.match.home_score is None or self.match.away_score is None:
            return False
        return self.predicted_home == self.match.home_score and self.predicted_away == self.match.away_score

    def is_winner(self):
        if self.match.home_score is None or self.match.away_score is None:
            return False
        actual_diff = self.match.home_score - self.match.away_score
        predicted_diff = self.predicted_home - self.predicted_away
        return (actual_diff > 0 and predicted_diff > 0) or (actual_diff < 0 and predicted_diff < 0) or (actual_diff == 0 and predicted_diff == 0)

