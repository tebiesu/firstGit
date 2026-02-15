from sqlalchemy import select

from app.core.security import get_password_hash
from app.db.models import Base
from app.db.session import SessionLocal, engine
from app.models.user import HealthProfile, User


def main() -> None:
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        email = "admin@example.com"
        exists = db.scalar(select(User).where(User.email == email))
        if exists:
            print("admin exists")
            return

        admin = User(
            email=email,
            hashed_password=get_password_hash("123456"),
            role="admin",
            full_name="System Admin",
        )
        db.add(admin)
        db.flush()
        db.add(HealthProfile(user_id=admin.id))
        db.commit()
        print("admin created: admin@example.com / 123456")
    finally:
        db.close()


if __name__ == "__main__":
    main()
