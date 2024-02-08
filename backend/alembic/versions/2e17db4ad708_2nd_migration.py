"""2nd  migration

Revision ID: 2e17db4ad708
Revises: 14cc52ce9e3c
Create Date: 2024-02-08 11:54:28.285678

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '2e17db4ad708'
down_revision: Union[str, None] = '14cc52ce9e3c'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
