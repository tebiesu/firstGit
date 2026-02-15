"""init schema

Revision ID: 20260215_0001
Revises:
Create Date: 2026-02-15 13:50:00
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "20260215_0001"
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "users",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("email", sa.String(length=255), nullable=False),
        sa.Column("hashed_password", sa.String(length=255), nullable=False),
        sa.Column("role", sa.String(length=32), nullable=False),
        sa.Column("full_name", sa.String(length=120), nullable=True),
        sa.Column("age", sa.Integer(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=False),
    )
    op.create_index(op.f("ix_users_id"), "users", ["id"], unique=False)
    op.create_index(op.f("ix_users_email"), "users", ["email"], unique=True)

    op.create_table(
        "provider_configs",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("provider_type", sa.String(length=64), nullable=False),
        sa.Column("name", sa.String(length=120), nullable=False),
        sa.Column("base_url", sa.String(length=500), nullable=False),
        sa.Column("encrypted_api_key", sa.Text(), nullable=False),
        sa.Column("model_map", sa.JSON(), nullable=False),
        sa.Column("priority", sa.Integer(), nullable=False),
        sa.Column("enabled", sa.Boolean(), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
    )
    op.create_index(op.f("ix_provider_configs_provider_type"), "provider_configs", ["provider_type"], unique=False)
    op.create_index(op.f("ix_provider_configs_priority"), "provider_configs", ["priority"], unique=False)
    op.create_index(op.f("ix_provider_configs_enabled"), "provider_configs", ["enabled"], unique=False)
    op.create_index(op.f("ix_provider_configs_name"), "provider_configs", ["name"], unique=True)

    op.create_table(
        "health_profiles",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("goal_type", sa.String(length=64), nullable=False),
        sa.Column("calorie_target", sa.Integer(), nullable=True),
        sa.Column("allergies", sa.Text(), nullable=True),
        sa.Column("chronic_conditions", sa.Text(), nullable=True),
        sa.Column("food_restrictions", sa.Text(), nullable=True),
    )
    op.create_index(op.f("ix_health_profiles_user_id"), "health_profiles", ["user_id"], unique=True)

    op.create_table(
        "meals",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("image_path", sa.String(length=500), nullable=True),
        sa.Column("mood_text", sa.Text(), nullable=True),
        sa.Column("hunger_level", sa.Integer(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=False),
    )
    op.create_index(op.f("ix_meals_user_id"), "meals", ["user_id"], unique=False)
    op.create_index(op.f("ix_meals_created_at"), "meals", ["created_at"], unique=False)

    op.create_table(
        "audit_logs",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id"), nullable=True),
        sa.Column("action", sa.String(length=120), nullable=False),
        sa.Column("details", sa.JSON(), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
    )
    op.create_index(op.f("ix_audit_logs_user_id"), "audit_logs", ["user_id"], unique=False)
    op.create_index(op.f("ix_audit_logs_action"), "audit_logs", ["action"], unique=False)
    op.create_index(op.f("ix_audit_logs_created_at"), "audit_logs", ["created_at"], unique=False)

    op.create_table(
        "provider_call_logs",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("provider_id", sa.Integer(), sa.ForeignKey("provider_configs.id"), nullable=True),
        sa.Column("task_type", sa.String(length=64), nullable=False),
        sa.Column("attempt", sa.Integer(), nullable=False),
        sa.Column("latency_ms", sa.Integer(), nullable=False),
        sa.Column("status", sa.String(length=32), nullable=False),
        sa.Column("error_message", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=False),
    )
    op.create_index(op.f("ix_provider_call_logs_provider_id"), "provider_call_logs", ["provider_id"], unique=False)
    op.create_index(op.f("ix_provider_call_logs_task_type"), "provider_call_logs", ["task_type"], unique=False)
    op.create_index(op.f("ix_provider_call_logs_created_at"), "provider_call_logs", ["created_at"], unique=False)

    op.create_table(
        "meal_analyses",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("meal_id", sa.Integer(), sa.ForeignKey("meals.id"), nullable=False),
        sa.Column("foods", sa.JSON(), nullable=False),
        sa.Column("nutrition", sa.JSON(), nullable=False),
        sa.Column("risk_score", sa.Float(), nullable=False),
        sa.Column("raw_model_output", sa.JSON(), nullable=False),
    )
    op.create_index(op.f("ix_meal_analyses_meal_id"), "meal_analyses", ["meal_id"], unique=True)
    op.create_index(op.f("ix_meal_analyses_risk_score"), "meal_analyses", ["risk_score"], unique=False)

    op.create_table(
        "emotion_records",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("meal_id", sa.Integer(), sa.ForeignKey("meals.id"), nullable=False),
        sa.Column("label", sa.String(length=64), nullable=False),
        sa.Column("stress_score", sa.Float(), nullable=False),
        sa.Column("negative_score", sa.Float(), nullable=False),
    )
    op.create_index(op.f("ix_emotion_records_meal_id"), "emotion_records", ["meal_id"], unique=False)
    op.create_index(op.f("ix_emotion_records_label"), "emotion_records", ["label"], unique=False)

    op.create_table(
        "recommendations",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("meal_id", sa.Integer(), sa.ForeignKey("meals.id"), nullable=False),
        sa.Column("content", sa.JSON(), nullable=False),
        sa.Column("status", sa.String(length=32), nullable=False),
    )
    op.create_index(op.f("ix_recommendations_meal_id"), "recommendations", ["meal_id"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_recommendations_meal_id"), table_name="recommendations")
    op.drop_table("recommendations")

    op.drop_index(op.f("ix_emotion_records_label"), table_name="emotion_records")
    op.drop_index(op.f("ix_emotion_records_meal_id"), table_name="emotion_records")
    op.drop_table("emotion_records")

    op.drop_index(op.f("ix_meal_analyses_risk_score"), table_name="meal_analyses")
    op.drop_index(op.f("ix_meal_analyses_meal_id"), table_name="meal_analyses")
    op.drop_table("meal_analyses")

    op.drop_index(op.f("ix_provider_call_logs_created_at"), table_name="provider_call_logs")
    op.drop_index(op.f("ix_provider_call_logs_task_type"), table_name="provider_call_logs")
    op.drop_index(op.f("ix_provider_call_logs_provider_id"), table_name="provider_call_logs")
    op.drop_table("provider_call_logs")

    op.drop_index(op.f("ix_audit_logs_created_at"), table_name="audit_logs")
    op.drop_index(op.f("ix_audit_logs_action"), table_name="audit_logs")
    op.drop_index(op.f("ix_audit_logs_user_id"), table_name="audit_logs")
    op.drop_table("audit_logs")

    op.drop_index(op.f("ix_meals_created_at"), table_name="meals")
    op.drop_index(op.f("ix_meals_user_id"), table_name="meals")
    op.drop_table("meals")

    op.drop_index(op.f("ix_health_profiles_user_id"), table_name="health_profiles")
    op.drop_table("health_profiles")

    op.drop_index(op.f("ix_provider_configs_name"), table_name="provider_configs")
    op.drop_index(op.f("ix_provider_configs_enabled"), table_name="provider_configs")
    op.drop_index(op.f("ix_provider_configs_priority"), table_name="provider_configs")
    op.drop_index(op.f("ix_provider_configs_provider_type"), table_name="provider_configs")
    op.drop_table("provider_configs")

    op.drop_index(op.f("ix_users_email"), table_name="users")
    op.drop_index(op.f("ix_users_id"), table_name="users")
    op.drop_table("users")
