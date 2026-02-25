"""Fix chat_messages table — rename content->message, drop message_type, add read column.

Revision ID: b2c3d4e5f601
Revises: a1b2c3d4e5f6
Create Date: 2026-02-25 15:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


revision = 'b2c3d4e5f601'
down_revision = 'a1b2c3d4e5f6'
branch_labels = None
depends_on = None


def upgrade():
    # Rename 'content' → 'message' (the model uses .message not .content)
    op.alter_column('chat_messages', 'content',
                    new_column_name='message',
                    existing_type=sa.Text(),
                    nullable=False)

    # Drop the extra column that doesn't exist in the model
    op.drop_column('chat_messages', 'message_type')

    # Add the 'read' boolean column (model uses m.read for unread tracking)
    op.add_column('chat_messages',
                  sa.Column('read', sa.Boolean(), nullable=True, server_default=sa.text('false')))


def downgrade():
    op.drop_column('chat_messages', 'read')
    op.add_column('chat_messages',
                  sa.Column('message_type', sa.String(length=20), nullable=True))
    op.alter_column('chat_messages', 'message',
                    new_column_name='content',
                    existing_type=sa.Text(),
                    nullable=False)
