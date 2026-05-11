"""verify existing users (registered before email verification feature)

Revision ID: a1b2c3d4e5f6
Revises: f1a2b3c4d5e6
Create Date: 2026-05-11 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'a1b2c3d4e5f6'
down_revision = 'f1a2b3c4d5e6'
branch_labels = None
depends_on = None


def upgrade():
    # Users who have no verification_token were created before the email
    # verification feature was added. Mark them as already verified so they
    # can still log in without going through the verification flow.
    op.execute(
        "UPDATE users SET is_verified = TRUE WHERE verification_token IS NULL AND is_verified = FALSE"
    )


def downgrade():
    # Cannot safely reverse this — leave as-is
    pass
