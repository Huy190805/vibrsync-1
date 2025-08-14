from database.db import users_collection
from passlib.context import CryptContext
from bson import ObjectId
import datetime

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Seed data
users = [
    {
        "_id": str(ObjectId()),
        "name": "Admin User",
        "email": "admin@example.com",
        "hashed_password": pwd_context.hash("admin123"),
        "role": "admin",
        "created_at": datetime.datetime.utcnow(),
        "avatar": "/avatars/admin.png"
    },
    {
        "_id": str(ObjectId()),
        "name": "Regular User",
        "email": "user@example.com",
        "hashed_password": pwd_context.hash("user123"),
        "role": "user",
        "created_at": datetime.datetime.utcnow(),
        "avatar": "/avatars/user.png"
    }
]

def seed_users():
    
    users_collection.insert_many(users)
    print("✅ Users seeded successfully.")

if __name__ == "__main__":
    seed_users()