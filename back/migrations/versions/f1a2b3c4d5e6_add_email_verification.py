"""add email verification fields

Revision ID: f1a2b3c4d5e6
Revises: bdcdfc0315c2
Create Date: 2026-05-10 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'f1a2b3c4d5e6'
down_revision = 'bdcdfc0315c2'
branch_labels = None
depends_on = None


def upgrade():
    with op.batch_alter_table('users', schema=None) as batch_op:
        batch_op.add_column(sa.Column('is_verified', sa.Boolean(), nullable=False, server_default=sa.false()))
        batch_op.add_column(sa.Column('verification_token', sa.String(length=64), nullable=True))
        batch_op.create_unique_constraint('uq_users_verification_token', ['verification_token'])


def downgrade():
    with op.batch_alter_table('users', schema=None) as batch_op:
        batch_op.drop_constraint('uq_users_verification_token', type_='unique')
        batch_op.drop_column('verification_token')
        batch_op.drop_column('is_verified')
