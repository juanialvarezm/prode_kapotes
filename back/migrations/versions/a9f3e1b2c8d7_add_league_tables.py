"""add league tables

Revision ID: a9f3e1b2c8d7
Revises: f1a2b3c4d5e6
Create Date: 2026-05-17 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'a9f3e1b2c8d7'
down_revision = 'f1a2b3c4d5e6'
branch_labels = None
depends_on = None


def upgrade():
    # --- leagues ---
    op.create_table(
        'leagues',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(length=120), nullable=False),
        sa.Column('description', sa.String(length=255), nullable=True),
        sa.Column('owner_id', sa.Integer(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['owner_id'], ['users.id']),
        sa.PrimaryKeyConstraint('id'),
    )

    # --- league_teams ---
    op.create_table(
        'league_teams',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('league_id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(length=120), nullable=False),
        sa.Column('created_by', sa.Integer(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['created_by'], ['users.id']),
        sa.ForeignKeyConstraint(['league_id'], ['leagues.id']),
        sa.PrimaryKeyConstraint('id'),
    )

    # --- league_matches ---
    op.create_table(
        'league_matches',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('league_id', sa.Integer(), nullable=False),
        sa.Column('home_team_id', sa.Integer(), nullable=False),
        sa.Column('away_team_id', sa.Integer(), nullable=False),
        sa.Column('match_date', sa.DateTime(), nullable=True),
        sa.Column('home_score', sa.Integer(), nullable=True),
        sa.Column('away_score', sa.Integer(), nullable=True),
        sa.Column('status', sa.String(length=32), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['away_team_id'], ['league_teams.id']),
        sa.ForeignKeyConstraint(['home_team_id'], ['league_teams.id']),
        sa.ForeignKeyConstraint(['league_id'], ['leagues.id']),
        sa.PrimaryKeyConstraint('id'),
    )

    # --- league_members ---
    op.create_table(
        'league_members',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('league_id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('joined_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['league_id'], ['leagues.id']),
        sa.ForeignKeyConstraint(['user_id'], ['users.id']),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('league_id', 'user_id', name='unique_league_member'),
    )


def downgrade():
    op.drop_table('league_members')
    op.drop_table('league_matches')
    op.drop_table('league_teams')
    op.drop_table('leagues')
