"""2nd  migration

Revision ID: ffadfefbf6ff
Revises: 2e17db4ad708
Create Date: 2024-02-08 11:58:15.906206

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'ffadfefbf6ff'
down_revision: Union[str, None] = '2e17db4ad708'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
