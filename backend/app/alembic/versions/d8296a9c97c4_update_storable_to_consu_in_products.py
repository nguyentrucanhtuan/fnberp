"""update storable to consu in products

Revision ID: d8296a9c97c4
Revises: f950c271c99e
Create Date: 2026-04-02 10:45:31.394884

"""
from alembic import op
import sqlalchemy as sa
import sqlmodel.sql.sqltypes


# revision identifiers, used by Alembic.
revision = 'd8296a9c97c4'
down_revision = 'f950c271c99e'
branch_labels = None
depends_on = None


def upgrade():
    # Cập nhật dữ liệu cũ từ 'storable' sang 'consu'
    # Phải thực hiện sau khi giá trị 'consu' đã được ADD và COMMIT ở migration trước.
    op.execute("UPDATE products SET type = 'consu' WHERE type = 'storable'")


def downgrade():
    op.execute("UPDATE products SET type = 'storable' WHERE type = 'consu'")
