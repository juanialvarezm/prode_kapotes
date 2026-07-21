from datetime import datetime

from werkzeug.security import generate_password_hash, check_password_hash

from db import db

##comment
class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)
    profile_picture = db.Column(db.String(500), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    profile_picture_id = db.Column(db.String(255), nullable=True)
    is_verified = db.Column(db.Boolean, nullable=False, default=False)
    verification_token = db.Column(db.String(64), nullable=True, unique=True)
    points = db.Column(db.Integer, nullable=False, default=0)

    groups = db.relationship('Group', backref='owner', lazy=True)
    group_memberships = db.relationship('GroupMember', back_populates='user', lazy=True)
    predictions = db.relationship('Prediction', back_populates='user', lazy=True)
    join_requests = db.relationship('JoinRequest', back_populates='user', lazy=True)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)


class Group(db.Model):
    __tablename__ = 'groups'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), unique=True, nullable=False)
    description = db.Column(db.String(255), nullable=True)
    avatar_url = db.Column(db.String(500), nullable=True)
    owner_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    prize_pool = db.Column(db.Integer, nullable=False, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    members = db.relationship('GroupMember', back_populates='group', lazy=True,
                              cascade='all, delete-orphan')
    predictions = db.relationship('Prediction', back_populates='group', lazy=True)
    join_requests_rel = db.relationship('JoinRequest', back_populates='group', lazy=True,
                                        cascade='all, delete-orphan')


class GroupMember(db.Model):
    __tablename__ = 'group_members'
    id = db.Column(db.Integer, primary_key=True)
    group_id = db.Column(db.Integer, db.ForeignKey('groups.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    joined_at = db.Column(db.DateTime, default=datetime.utcnow)

    group = db.relationship('Group', back_populates='members')
    user = db.relationship('User', back_populates='group_memberships')


class JoinRequest(db.Model):
    __tablename__ = 'join_requests'
    id = db.Column(db.Integer, primary_key=True)
    group_id = db.Column(db.Integer, db.ForeignKey('groups.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    status = db.Column(db.String(20), nullable=False, default='pending')  # pending | accepted | rejected
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    group = db.relationship('Group', back_populates='join_requests_rel')
    user = db.relationship('User', back_populates='join_requests')


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


class WordleHistory(db.Model):
    __tablename__ = 'wordle_history'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    date = db.Column(db.Date, nullable=False)
    won = db.Column(db.Boolean, nullable=False)
    attempts = db.Column(db.Integer, nullable=False)
    player_name = db.Column(db.String(50), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    user = db.relationship('User', backref='wordle_history', lazy=True)

    __table_args__ = (
        db.UniqueConstraint('user_id', 'date', name='unique_user_date'),
    )


# ============================================================
#  LEAGUES FEATURE
# ============================================================

class League(db.Model):
    __tablename__ = 'leagues'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    description = db.Column(db.String(255), nullable=True)
    owner_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationships
    owner = db.relationship('User', backref='owned_leagues', lazy=True)
    teams = db.relationship('LeagueTeam', back_populates='league', lazy=True,
                            cascade='all, delete-orphan')
    matches = db.relationship('LeagueMatch', back_populates='league', lazy=True,
                              cascade='all, delete-orphan')
    members = db.relationship('LeagueMember', back_populates='league', lazy=True,
                              cascade='all, delete-orphan')


class LeagueTeam(db.Model):
    __tablename__ = 'league_teams'
    id = db.Column(db.Integer, primary_key=True)
    league_id = db.Column(db.Integer, db.ForeignKey('leagues.id'), nullable=False)
    name = db.Column(db.String(120), nullable=False)
    created_by = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    league = db.relationship('League', back_populates='teams')
    creator = db.relationship('User', backref='league_teams_created', lazy=True)

    # Matches where this team is home or away
    home_matches = db.relationship('LeagueMatch',
                                   foreign_keys='LeagueMatch.home_team_id',
                                   back_populates='home_team', lazy=True)
    away_matches = db.relationship('LeagueMatch',
                                   foreign_keys='LeagueMatch.away_team_id',
                                   back_populates='away_team', lazy=True)


class LeagueMatch(db.Model):
    __tablename__ = 'league_matches'
    id = db.Column(db.Integer, primary_key=True)
    league_id = db.Column(db.Integer, db.ForeignKey('leagues.id'), nullable=False)
    home_team_id = db.Column(db.Integer, db.ForeignKey('league_teams.id'), nullable=False)
    away_team_id = db.Column(db.Integer, db.ForeignKey('league_teams.id'), nullable=False)
    match_date = db.Column(db.DateTime, nullable=True)
    home_score = db.Column(db.Integer, nullable=True)
    away_score = db.Column(db.Integer, nullable=True)
    # Status: SCHEDULED | FINISHED
    status = db.Column(db.String(32), nullable=False, default='SCHEDULED')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    league = db.relationship('League', back_populates='matches')
    home_team = db.relationship('LeagueTeam', foreign_keys=[home_team_id],
                                back_populates='home_matches')
    away_team = db.relationship('LeagueTeam', foreign_keys=[away_team_id],
                                back_populates='away_matches')


class LeagueMember(db.Model):
    __tablename__ = 'league_members'
    id = db.Column(db.Integer, primary_key=True)
    league_id = db.Column(db.Integer, db.ForeignKey('leagues.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    joined_at = db.Column(db.DateTime, default=datetime.utcnow)

    league = db.relationship('League', back_populates='members')
    user = db.relationship('User', backref='league_memberships', lazy=True)

    __table_args__ = (
        db.UniqueConstraint('league_id', 'user_id', name='unique_league_member'),
    )


# ============================================================
#  ORGANIZED MATCHES FEATURE
# ============================================================

class GroupMatch(db.Model):
    __tablename__ = 'group_matches'
    id = db.Column(db.Integer, primary_key=True)
    group_id = db.Column(db.Integer, db.ForeignKey('groups.id'), nullable=False)
    creator_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    title = db.Column(db.String(120), nullable=False, default="Partido de fútbol")
    match_date = db.Column(db.DateTime, nullable=False)
    field_name = db.Column(db.String(120), nullable=False)
    price = db.Column(db.Integer, nullable=False, default=0)
    match_photo = db.Column(db.String(500), nullable=True)
    match_photo_id = db.Column(db.String(100), nullable=True)
    photo_points_awarded = db.Column(db.Boolean, nullable=False, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    group = db.relationship('Group', backref=db.backref('matches_organized', lazy=True, cascade='all, delete-orphan'))
    creator = db.relationship('User', backref=db.backref('matches_created', lazy=True))
    participants = db.relationship('GroupMatchParticipant', back_populates='group_match', lazy=True, cascade='all, delete-orphan')


class GroupMatchParticipant(db.Model):
    __tablename__ = 'group_match_participants'
    id = db.Column(db.Integer, primary_key=True)
    group_match_id = db.Column(db.Integer, db.ForeignKey('group_matches.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    confirmed = db.Column(db.Boolean, nullable=False, default=True)
    paid = db.Column(db.Boolean, nullable=False, default=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    group_match = db.relationship('GroupMatch', back_populates='participants')
    user = db.relationship('User', backref=db.backref('match_participations', lazy=True))

    __table_args__ = (
        db.UniqueConstraint('group_match_id', 'user_id', name='unique_match_participant'),
    )


class FootballField(db.Model):
    __tablename__ = 'football_fields'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    address = db.Column(db.String(255), nullable=False)
    zone = db.Column(db.String(60), nullable=False)  # e.g. "CABA", "GBA Norte", etc.
    phone = db.Column(db.String(60), nullable=True)
    field_types = db.Column(db.String(120), nullable=False)  # e.g. "F5, F7, F8"
    surface = db.Column(db.String(60), nullable=False)  # e.g. "Césped Sintético", "Natural"
    features = db.Column(db.String(255), nullable=True)  # e.g. "Estacionamiento, Buffet, Vestuarios"
    image_url = db.Column(db.String(500), nullable=True)
    description = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)


class GroupMatchMvpVote(db.Model):
    __tablename__ = 'group_match_mvp_votes'
    id = db.Column(db.Integer, primary_key=True)
    group_match_id = db.Column(db.Integer, db.ForeignKey('group_matches.id', ondelete='CASCADE'), nullable=False)
    voter_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    voted_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    __table_args__ = (
        db.UniqueConstraint('group_match_id', 'voter_id', name='unique_match_mvp_vote'),
    )

    group_match = db.relationship('GroupMatch', backref=db.backref('mvp_votes', lazy=True, cascade='all, delete-orphan'))
    voter = db.relationship('User', foreign_keys=[voter_id], backref=db.backref('mvp_votes_cast', lazy=True))
    voted = db.relationship('User', foreign_keys=[voted_id], backref=db.backref('mvp_votes_received', lazy=True))


class MinigameReward(db.Model):
    __tablename__ = 'minigame_rewards'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    game_name = db.Column(db.String(50), nullable=False)  # 'wordle' | 'goltexto' | 'futlegacy'
    date = db.Column(db.Date, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    __table_args__ = (
        db.UniqueConstraint('user_id', 'game_name', 'date', name='unique_user_game_daily_reward'),
    )

    user = db.relationship('User', backref=db.backref('minigame_rewards', lazy=True))



