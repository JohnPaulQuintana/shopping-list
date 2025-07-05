from firebase_admin import auth as firebase_auth
from app.firebase_config import db

def verify_and_store_user(token: str):
    """
    Verify Firebase token and store user in Firestore.
    """
    decoded = firebase_auth.verify_id_token(token)
    uid = decoded["uid"]
    user = firebase_auth.get_user(uid)

    doc_ref = db.collection("users").document(uid)
    doc_ref.set({
        "uid": uid,
        "email": user.email,
        "name": user.display_name,
        "photoURL": user.photo_url,
    }, merge=True)

    return user

def get_user_by_token(token: str):
    decoded = firebase_auth.verify_id_token(token)
    uid = decoded["uid"]

    doc = db.collection("users").document(uid).get()
    if not doc.exists:
        raise ValueError("User not found")

    return doc.to_dict()

