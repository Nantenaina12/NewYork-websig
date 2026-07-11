from sqlalchemy.orm import Session
from .models import Log

def log_action(db: Session, user_id: int, action: str, details: str = None, ip: str = None):
    log_entry = Log(user_id=user_id, action=action, details=details, ip_address=ip)
    db.add(log_entry)
    db.commit()