"""
MongoDB connection setup.

This module creates one shared MongoDB client for the entire application.
Don't need to create a brand new connection every time an API request arrives.
"""

import os

from dotenv import load_dotenv
from pymongo import MongoClient

# Load variables from the backend's .env file.
load_dotenv()


MONGODB_URI = os.getenv("MONGODB_URI")
MONGODB_DATABASE = os.getenv("MONGODB_DATABASE", "Reader_Study")

if not MONGODB_URI:
    raise RuntimeError("MONGODB_URI is missing. Add it to the backend .env file.")


# The client represents the application's connection to MongoDB.
mongo_client = MongoClient(MONGODB_URI)

# Select the database the application will use.
database = mongo_client[MONGODB_DATABASE]

# Select the collections that the application will use.
responses_collection = database["responses"]
sessions_collection = database["sessions"]
studies_collection = database["studies"]
users_collection = database["users"]
