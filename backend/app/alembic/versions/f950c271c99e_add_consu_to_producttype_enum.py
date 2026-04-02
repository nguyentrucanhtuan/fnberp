"""add consu to producttype enum

Revision ID: f950c271c99e
Revises: 9518e2b38e36
Create Date: 2026-04-02 10:44:50.865301

"""
from alembic import op
import sqlalchemy as sa
import sqlmodel.sql.sqltypes


# revision identifiers, used by Alembic.
revision = 'f950c271c99e'
down_revision = '9518e2b38e36'
branch_labels = None
depends_on = None


def upgrade():
    # Thêm 'consu' vào enum 'producttype'
    # Lưu ý: Postgres không cho phép chạy ADD VALUE trong khối transaction trên một số version.
    # Tuy nhiên, chúng ta có thể gọi nó trực tiếp.
    op.execute("ALTER TYPE producttype ADD VALUE IF NOT EXISTS 'consu'")


def downgrade():
    # Không thể dễ dàng xóa enum value trong Postgres.
    pass
