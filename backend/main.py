# backend/main.py

# IMPORTS:
# FastAPI allows to create APIs quickly.
# It will be used to build the backend of the application.
from fastapi import FastAPI

# StaticFiles is a utility that allows FastAPI to serve static files (like HTML, CSS, JS) from a directory.
from fastapi.staticfiles import StaticFiles

# CORS stands for Cross-Origin Resource Sharing.
# It allos the React frontend to communicate with the backend
from fastapi.middleware.cors import CORSMiddleware

from pathlib import Path

app = FastAPI()

# Since React and FastAPI run on different addresses (ports) while developing, we need to allow the frontend to communicate with the backend.
# Browsers block communication for security reasons (like so you can't hack target >:D).
# CORS tells the browser that it's okay for the frontend to communicate with the backend.
app.add_middleware(
    CORSMiddleware,
    # Only allows requests coming from the React frontend (running on localhost:5173).
    allow_origins=["http://localhost:5173"],
    # Allows every type of HTTP method (GET, POST, PUT, DELETE, etc.) to be used in requests.
    allow_methods=["*"],
    # Allows every type of HTTP header to be used in requests.
    allow_headers=["*"],
)

# Mounting the static files directory to serve images.
# This creates a route in the FastAPI application that serves static files (like images) from a specified directory.
# The folder is now accessible from the browser.
app.mount(
    # URL path that users/fronted will visit to access the static files (images).
    "/images",
    # Physical directory where the static files (images) are stored.
    StaticFiles(directory="data/images"),
    # Internal name used by FastAPI to refer to this static files mount.
    name="images",
)


# Health endpoint:
@app.get("/api/health")
def health():
    # FastAPI automatically converts this Python dictionary into JSON before sending it to the browser.
    return {"status": "ok"}


# Get images endpoint:
@app.get("/api/images")
def get_images():
    # Create a Path object that points to the image folder
    image_folder = Path("data/images")

    # Empty list that will eventually hold information about every image
    images = []

    for index, file in enumerate(image_folder.glob("*.nii.gz")):
        images.append(
            {
                "id": index,
                "filename": file.name,
                "url": f"http://localhost:8000/images/{file.name}",
            }
        )

    return images
