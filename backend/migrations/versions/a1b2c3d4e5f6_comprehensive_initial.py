"""Comprehensive initial migration — creates all tables from scratch.

Replaces the broken incremental migration chain.

Revision ID: a1b2c3d4e5f6
Revises:
Create Date: 2026-02-25 10:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'a1b2c3d4e5f6'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    # ── users ──────────────────────────────────────────────────────────────
    op.create_table(
        'users',
        sa.Column('id',             sa.Integer(),      nullable=False),
        sa.Column('email',          sa.String(255),    nullable=False),
        sa.Column('password_hash',  sa.String(255),    nullable=False),
        sa.Column('full_name',      sa.String(255),    nullable=False),
        sa.Column('role',           sa.String(50),     nullable=False),
        sa.Column('created_at',     sa.DateTime(),     nullable=True),
        sa.Column('updated_at',     sa.DateTime(),     nullable=True),
        # Lawyer-specific fields
        sa.Column('specialization', sa.String(255),    nullable=True),
        sa.Column('experience_yrs', sa.Integer(),      nullable=True),
        sa.Column('bar_council_id', sa.String(100),    nullable=True),
        sa.Column('bio',            sa.Text(),         nullable=True),
        sa.Column('hourly_rate',    sa.Float(),        nullable=True),
        sa.Column('available',      sa.Boolean(),      nullable=True),
        sa.Column('rating',         sa.Float(),        nullable=True),
        sa.Column('location',       sa.String(255),    nullable=True),
        # Approval
        sa.Column('is_approved',    sa.Boolean(),      nullable=False, server_default=sa.text('false')),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index('ix_users_email', 'users', ['email'], unique=True)

    # ── contracts ──────────────────────────────────────────────────────────
    op.create_table(
        'contracts',
        sa.Column('id',                 sa.Integer(),       nullable=False),
        sa.Column('user_id',            sa.Integer(),       nullable=False),
        sa.Column('title',              sa.String(500),     nullable=False),
        sa.Column('file_name',          sa.String(500),     nullable=False),
        sa.Column('file_path',          sa.String(1000),    nullable=False),
        sa.Column('file_type',          sa.String(50),      nullable=False),
        sa.Column('extracted_text',     sa.Text(),          nullable=True),
        sa.Column('version',            sa.Integer(),       nullable=True),
        sa.Column('parent_contract_id', sa.Integer(),       nullable=True),
        sa.Column('status',             sa.String(50),      nullable=True),
        sa.Column('created_at',         sa.DateTime(),      nullable=True),
        sa.Column('updated_at',         sa.DateTime(),      nullable=True),
        sa.ForeignKeyConstraint(['user_id'],            ['users.id']),
        sa.ForeignKeyConstraint(['parent_contract_id'], ['contracts.id']),
        sa.PrimaryKeyConstraint('id'),
    )

    # ── analysis_results ───────────────────────────────────────────────────
    op.create_table(
        'analysis_results',
        sa.Column('id',                 sa.Integer(),               nullable=False),
        sa.Column('contract_id',        sa.Integer(),               nullable=False),
        sa.Column('overall_risk_score', sa.Numeric(precision=5, scale=2), nullable=False),
        sa.Column('risk_level',         sa.String(50),              nullable=False),
        sa.Column('completeness_score', sa.Numeric(precision=5, scale=2), nullable=False),
        sa.Column('compliance_status',  sa.String(50),              nullable=False),
        sa.Column('total_clauses',      sa.Integer(),               nullable=False),
        sa.Column('flagged_clauses',    sa.Integer(),               nullable=False),
        sa.Column('missing_clauses',    sa.Integer(),               nullable=False),
        sa.Column('analysis_metadata',  sa.JSON(),                  nullable=True),
        sa.Column('created_at',         sa.DateTime(),              nullable=True),
        sa.ForeignKeyConstraint(['contract_id'], ['contracts.id']),
        sa.PrimaryKeyConstraint('id'),
    )

    # ── clauses ────────────────────────────────────────────────────────────
    op.create_table(
        'clauses',
        sa.Column('id',               sa.Integer(),   nullable=False),
        sa.Column('analysis_id',      sa.Integer(),   nullable=False),
        sa.Column('clause_type',      sa.String(100), nullable=False),
        sa.Column('clause_text',      sa.Text(),      nullable=False),
        sa.Column('clause_position',  sa.Integer(),   nullable=False),
        sa.Column('risk_level',       sa.String(50),  nullable=True),
        sa.Column('risk_explanation', sa.Text(),      nullable=True),
        sa.Column('plain_explanation',sa.Text(),      nullable=True),
        sa.Column('is_flagged',       sa.Boolean(),   nullable=True),
        sa.Column('flagged_reasons',  sa.JSON(),      nullable=True),
        sa.Column('created_at',       sa.DateTime(),  nullable=True),
        sa.ForeignKeyConstraint(['analysis_id'], ['analysis_results.id']),
        sa.PrimaryKeyConstraint('id'),
    )

    # ── compliance_checks ──────────────────────────────────────────────────
    op.create_table(
        'compliance_checks',
        sa.Column('id',             sa.Integer(),   nullable=False),
        sa.Column('analysis_id',    sa.Integer(),   nullable=False),
        sa.Column('rule_name',      sa.String(255), nullable=False),
        sa.Column('rule_reference', sa.String(500), nullable=True),
        sa.Column('status',         sa.String(50),  nullable=False),
        sa.Column('explanation',    sa.Text(),      nullable=True),
        sa.Column('created_at',     sa.DateTime(),  nullable=True),
        sa.ForeignKeyConstraint(['analysis_id'], ['analysis_results.id']),
        sa.PrimaryKeyConstraint('id'),
    )

    # ── missing_clauses ────────────────────────────────────────────────────
    op.create_table(
        'missing_clauses',
        sa.Column('id',               sa.Integer(),   nullable=False),
        sa.Column('analysis_id',      sa.Integer(),   nullable=False),
        sa.Column('clause_name',      sa.String(255), nullable=False),
        sa.Column('clause_category',  sa.String(100), nullable=False),
        sa.Column('importance',       sa.String(50),  nullable=False),
        sa.Column('description',      sa.Text(),      nullable=True),
        sa.Column('created_at',       sa.DateTime(),  nullable=True),
        sa.ForeignKeyConstraint(['analysis_id'], ['analysis_results.id']),
        sa.PrimaryKeyConstraint('id'),
    )

    # ── appointments ───────────────────────────────────────────────────────
    op.create_table(
        'appointments',
        sa.Column('id',           sa.Integer(),   nullable=False),
        sa.Column('client_id',    sa.Integer(),   nullable=False),
        sa.Column('lawyer_id',    sa.Integer(),   nullable=False),
        sa.Column('status',       sa.String(20),  nullable=True),
        sa.Column('message',      sa.Text(),      nullable=True),
        sa.Column('chat_enabled', sa.Boolean(),   nullable=True),
        sa.Column('call_enabled', sa.Boolean(),   nullable=True),
        sa.Column('created_at',   sa.DateTime(),  nullable=True),
        sa.Column('updated_at',   sa.DateTime(),  nullable=True),
        sa.ForeignKeyConstraint(['client_id'], ['users.id']),
        sa.ForeignKeyConstraint(['lawyer_id'], ['users.id']),
        sa.PrimaryKeyConstraint('id'),
    )

    # ── chat_messages ──────────────────────────────────────────────────────
    op.create_table(
        'chat_messages',
        sa.Column('id',              sa.Integer(),   nullable=False),
        sa.Column('appointment_id',  sa.Integer(),   nullable=False),
        sa.Column('sender_id',       sa.Integer(),   nullable=False),
        sa.Column('content',         sa.Text(),      nullable=False),
        sa.Column('message_type',    sa.String(20),  nullable=True),
        sa.Column('created_at',      sa.DateTime(),  nullable=True),
        sa.ForeignKeyConstraint(['appointment_id'], ['appointments.id']),
        sa.ForeignKeyConstraint(['sender_id'],      ['users.id']),
        sa.PrimaryKeyConstraint('id'),
    )

    # ── discussion_posts ───────────────────────────────────────────────────
    op.create_table(
        'discussion_posts',
        sa.Column('id',          sa.Integer(),   nullable=False),
        sa.Column('title',       sa.String(300), nullable=False),
        sa.Column('content',     sa.Text(),      nullable=False),
        sa.Column('category',    sa.String(100), nullable=False),
        sa.Column('tags',        sa.String(500), nullable=True),
        sa.Column('author_id',   sa.Integer(),   nullable=False),
        sa.Column('upvotes',     sa.Integer(),   nullable=True),
        sa.Column('downvotes',   sa.Integer(),   nullable=True),
        sa.Column('view_count',  sa.Integer(),   nullable=True),
        sa.Column('is_pinned',   sa.Boolean(),   nullable=True),
        sa.Column('is_answered', sa.Boolean(),   nullable=True),
        sa.Column('created_at',  sa.DateTime(),  nullable=True),
        sa.Column('updated_at',  sa.DateTime(),  nullable=True),
        sa.ForeignKeyConstraint(['author_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index('ix_discussion_posts_author_id',  'discussion_posts', ['author_id'],  unique=False)
    op.create_index('ix_discussion_posts_category',   'discussion_posts', ['category'],   unique=False)
    op.create_index('ix_discussion_posts_created_at', 'discussion_posts', ['created_at'], unique=False)

    # ── discussion_votes ───────────────────────────────────────────────────
    op.create_table(
        'discussion_votes',
        sa.Column('id',          sa.Integer(),   nullable=False),
        sa.Column('user_id',     sa.Integer(),   nullable=False),
        sa.Column('target_type', sa.String(20),  nullable=False),
        sa.Column('target_id',   sa.Integer(),   nullable=False),
        sa.Column('vote',        sa.String(10),  nullable=False),
        sa.Column('created_at',  sa.DateTime(),  nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('user_id', 'target_type', 'target_id', name='uq_discussion_vote'),
    )

    # ── discussion_comments ────────────────────────────────────────────────
    op.create_table(
        'discussion_comments',
        sa.Column('id',          sa.Integer(),   nullable=False),
        sa.Column('post_id',     sa.Integer(),   nullable=False),
        sa.Column('parent_id',   sa.Integer(),   nullable=True),
        sa.Column('author_id',   sa.Integer(),   nullable=False),
        sa.Column('content',     sa.Text(),      nullable=False),
        sa.Column('upvotes',     sa.Integer(),   nullable=True),
        sa.Column('downvotes',   sa.Integer(),   nullable=True),
        sa.Column('is_accepted', sa.Boolean(),   nullable=True),
        sa.Column('created_at',  sa.DateTime(),  nullable=True),
        sa.Column('updated_at',  sa.DateTime(),  nullable=True),
        sa.ForeignKeyConstraint(['author_id'], ['users.id'],             ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['parent_id'], ['discussion_comments.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['post_id'],   ['discussion_posts.id'],  ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index('ix_discussion_comments_post_id', 'discussion_comments', ['post_id'], unique=False)


def downgrade():
    op.drop_index('ix_discussion_comments_post_id', table_name='discussion_comments')
    op.drop_table('discussion_comments')
    op.drop_table('discussion_votes')
    op.drop_index('ix_discussion_posts_created_at', table_name='discussion_posts')
    op.drop_index('ix_discussion_posts_category',   table_name='discussion_posts')
    op.drop_index('ix_discussion_posts_author_id',  table_name='discussion_posts')
    op.drop_table('discussion_posts')
    op.drop_table('chat_messages')
    op.drop_table('appointments')
    op.drop_table('missing_clauses')
    op.drop_table('compliance_checks')
    op.drop_table('clauses')
    op.drop_table('analysis_results')
    op.drop_table('contracts')
    op.drop_index('ix_users_email', table_name='users')
    op.drop_table('users')
