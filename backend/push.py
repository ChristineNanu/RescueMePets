import os
import json

from dotenv import load_dotenv
from pywebpush import webpush, WebPushException
from sqlalchemy.orm import Session

import models

load_dotenv()

VAPID_PRIVATE_KEY = os.getenv("VAPID_PRIVATE_KEY")
VAPID_PUBLIC_KEY = os.getenv("VAPID_PUBLIC_KEY")
VAPID_CLAIM_EMAIL = os.getenv("VAPID_CLAIM_EMAIL", "admin@rescuemepets.com")


def push_enabled() -> bool:
    return bool(VAPID_PRIVATE_KEY and VAPID_PUBLIC_KEY)


def send_push_to_user(db: Session, user_id: int, title: str, body: str, url: str = "/"):
    """Send a Web Push notification to every device a user has subscribed on.
    Blocking (pywebpush uses requests) — callers on the async event loop
    should offload this via run_in_threadpool. Best-effort: never raises."""
    if not push_enabled():
        return
    subs = db.query(models.PushSubscription).filter(models.PushSubscription.user_id == user_id).all()
    payload = json.dumps({"title": title, "body": body, "url": url})
    for sub in subs:
        try:
            webpush(
                subscription_info={
                    "endpoint": sub.endpoint,
                    "keys": {"p256dh": sub.p256dh, "auth": sub.auth},
                },
                data=payload,
                vapid_private_key=VAPID_PRIVATE_KEY,
                vapid_claims={"sub": f"mailto:{VAPID_CLAIM_EMAIL}"},
            )
        except WebPushException as e:
            status = e.response.status_code if e.response is not None else None
            if status in (404, 410):
                # subscription expired or was revoked by the browser — clean it up
                db.delete(sub)
                db.commit()
            else:
                print(f"Push send failed for user {user_id}: {e}")
        except Exception as e:
            print(f"Push send failed for user {user_id}: {e}")
