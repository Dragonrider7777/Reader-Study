"""
Script to create a new reader account.

Run this manually whenever you need to add a reader to the study:
    python create_user.py
"""

from auth import hash_password
from database import users_collection


def create_user():
    username = input("Enter username: ").strip()
    password = input("Enter password: ").strip()

    if not username or not password:
        print("Username and password cannot be empty.")
        return

    existing_user = users_collection.find_one({"username": username})
    if existing_user:
        print(f"Username '{username}' already exists. Choose a different one.")
        return

    password_hash = hash_password(password)

    users_collection.insert_one(
        {
            "username": username,
            "password_hash": password_hash,
        }
    )

    print(f"User '{username}' created successfully.")


if __name__ == "__main__":
    create_user()
