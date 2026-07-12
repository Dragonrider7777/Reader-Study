# backend/main.py

# IMPORTS:
# FastAPI allows to create REST APIs quickly.
# It will be used to build the backend of the application.
from fastapi import FastAPI, HTTPException

# StaticFiles is a utility that allows FastAPI to serve static files (such as .nii.gz images) directly.
from fastapi.staticfiles import StaticFiles

# CORS stands for Cross-Origin Resource Sharing.
# It allos the React frontend to communicate with the backend
from fastapi.middleware.cors import CORSMiddleware

# Use to read JSON configuration files.
import json

# Used to work with folders/files in an operating-system-independent way.
from pathlib import Path

app = FastAPI()

# ------------ FILE PATHS ------------

# Path to the foldier containing this file (backend/)
BASE_DIR = Path(__file__).resolve().parent

# Folder containing all NiFTi images
IMAGE_FOLDER = BASE_DIR / "data" / "images"

# JSON file describing the reader scan questions
QUESTION_FILE = BASE_DIR / "data" / "scan_questions.json"

# Since React and FastAPI run on different addresses (ports) while developing, we need to allow the frontend to communicate with the backend.
# Browsers block communication for security reasons (like so you can't hack target >:D).
# CORS tells the browser that it's okay for the frontend to communicate with the backend.
app.add_middleware(
    CORSMiddleware,
    # Only allows requests coming from the React frontend (running on localhost:5173).
    allow_origins=["http://localhost:5173", "http://localhost:5174"],
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
    StaticFiles(directory=str(IMAGE_FOLDER)),
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
    """
    Returns every NIfTI image inside the images folder.

    This endpoint is mainly useful for development.
    The actual reader study should use /api/questions instead.
    """

    # Empty list that will eventually hold information about every image
    images = []

    for index, file in enumerate(IMAGE_FOLDER.glob("*.nii.gz")):
        images.append(
            {
                "id": index,
                "filename": file.name,
                "url": f"http://localhost:8000/images/{file.name}",
            }
        )

    return images


# Get reader study questions endpoint:
@app.get("/api/questions")
def get_questions():
    """
    Returns the developer-defined reader study questions.

    Unlike /api/images, this endpoint does NOT automatically create
    one question per image.

    Instead, it reads scan_questions.json so a question may contain:
        - one image (single viewer)
        - two images (dual viewer)
    """

    # Make sure the configuration file exists
    if not QUESTION_FILE.exists():
        raise HTTPException(
            status_code=404,
            detail="scan_questions.json was not found.",
        )

    try:
        # Read the JSON configuration file
        with QUESTION_FILE.open("r", encoding="utf-8") as file:
            questions = json.load(file)

    except json.JSONDecodeError as error:
        raise HTTPException(
            status_code=500,
            detail=f"Invalid JSON: {error}",
        )

    # Make sure the main JSON structure is a list of questions.
    if not isinstance(questions, list):
        raise HTTPException(
            status_code=500,
            detail="scan_questions.json must contain a list of questions.",
        )

    # This list will hold the finished questions that will be sent to React frontend
    formatted_questions = []

    # Loop through every question loaded from scan_questions.json
    for question in questions:
        # This list will hold the image information for the current question
        formatted_images = []

        # Get the filenames listed under the question's "images" field
        # question.get("images", []) means:
        # - return the images list if it exists
        # - otherwise, use an empty list
        for filename in question.get("images", []):
            # Build the full file path to check whether the image exists
            image_path = IMAGE_FOLDER / filename

            # If a JSON refers to a file that does not exist, stop and return a clear backend error
            # This is better than just allowing React to recive a bad URL
            if not image_path.exists():
                raise HTTPException(
                    status_code=500,
                    detail=(
                        f"Question {question.get('id')} references an image "
                        f"that does not exist: {filename}"
                    ),
                )

            # Store both the original filename and the public URL that Reac tcan use to load the NiFTi file
            formatted_images.append(
                {
                    "filename": filename,
                    "url": f"http://localhost:8000/images/{filename}",
                }
            )

        # Copy the original question, but replace its filename list with the newly formated image objects
        formatted_question = {
            **question,
            "images": formatted_images,
        }

        formatted_questions.append(formatted_question)

    # FastAPI automatically converts this Python list into JSON
    return formatted_questions
