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

# ------------ MODULES ------------

# Each module defines one way that a study item can be displayed
# Also determines what evaluation question the reader should answer
MODULES = {
    1: {
        "viewer_type": "single",
        "question": "Rate this image from a scale of 1 to 6",
        "response_type": "rating",
        "required_images": 1,
    },
    2: {
        "viewer_type": "double",
        "question": "How similar are these images?",
        "response_type": "rating",
        "required_images": 2,
    },
}

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

# ------------ QUESTION CONFIGURATION HELPERS ------------


def load_question_config():
    """
    Read and validate the main scan_questions.json file
    Returns:
        A list containing the study-item directories
    Raises:
        HTTPException if the file is missing, unreadable, invalid JSON, or does not contain a JSON list
    """

    # The study cannot run if its developer-created configuration is missing
    if not QUESTION_FILE.exists():
        raise HTTPException(
            status_code=500, detail="scan_questions.json was not found."
        )

    try:
        with QUESTION_FILE.open("r", encoding="utf-8") as file:
            questions = json.load(file)

    except json.JSONDecodeError as error:
        # This usually means the JSON has a missing comma, bracket, quotation mark, or another syntax mistake
        raise HTTPException(
            status_code=500,
            detail=f"scan_questions.json contains invalid JSON: {error}",
        ) from error

    except OSError as error:
        # OSError covers problems such as file permissions or disk errors
        raise HTTPException(
            status_code=500,
            detail=f"scan_questions.json could not be read: {error}",
        ) from error

    # the outer JSON structure should be:
    # [
    #   {...}
    #   {...}
    # ]
    if not isinstance(questions, list):
        raise HTTPException(
            status_code=500,
            detail=f"scan_questions.json must contain a list of study items.",
        )

    # An empty study would leave the frontend with nothing to display
    if not questions:
        raise HTTPException(
            status_code=500,
            detail="scan_questions.json does not contain any study items.",
        )

    return questions


def format_study_item(item, position):
    """
    Validate and format one study item.

    This item starts with filenames from scan_questions.json.
    This function adds the shared module configuration and converts each filename into an object containing a filename and public image URL.
    """

    # Each item in the JSON list must be an object/dictionary
    if not isinstance(item, dict):
        raise HTTPException(
            status_code=500,
            detail=f"Study item at list position {position} must be a JSON object.",
        )

    item_id = item.get("id")
    module_type = item.get("module_type")
    filenames = item.get("images")

    # A unique ID will eventually be needed when saving reader responses
    if item_id is None:
        raise HTTPException(
            status_code=500,
            detail=f"Study item at list position {position} is missing an id.",
        )

    # Confirm that the item uses one of the two supported modules
    if module_type not in MODULES:
        raise HTTPException(
            status_code=500,
            detail=f"Study item {item_id} uses an invalid module type: {module_type}.",
        )

    # The images filed must be a JSON list, even when there is only one image
    if not isinstance(filenames, list):
        raise HTTPException(
            status_code=500, detail=f"Study item {item_id} must contain an images list."
        )

    module_config = MODULES[module_type]
    required_images = module_config.get("required_images")

    # Verify that the module definnition itself is correctly configured
    if not isinstance(required_images, int) or required_images < 1:
        raise HTTPException(
            status_code=500,
            detail=f"Module {module_type} has an invalid required_images setting.",
        )

    # For example:
    # - a single-view module requires exactly 1 image
    # - a dual-view module requires exactly 2 images
    if len(filenames) != required_images:
        raise HTTPException(
            status_code=500,
            detail=(
                f"Study item {item_id} belogns to module {module_type}, which requires {required_images} image(s),"
                f"but {len(filenames)} were provided."
            ),
        )

    formatted_images = []

    for filename in filenames:
        # Prevent values such as null, numbers, or empty strings from being treated as image filenames
        if not isinstance(filename, str) or not filename.strip():
            raise HTTPException(
                status_code=500,
                detail=f"Study item {item_id} contains an invalid image filename.",
            )

        # Path(filename).name removes folder components
        # If it differs from the supplied value, the JSON attempted to include something like:
        # "../private-file" or "another-folder/file.nii.gz"
        if Path(filename).name != filename:
            raise HTTPException(
                status_code=500,
                detail=f"Study item {item_id} contains an unsafe image path: {filename}",
            )

        # Ensure that only the expected NiFTi file format is referenced
        if not filename.lower().endswith("nii.gz"):
            raise HTTPException(
                status_code=500,
                detail=f"Study item {item_id} references an unsupported file type: {filename}",
            )

        image_path = IMAGE_FOLDER / filename

        # Confirm that the referenced path exists and is an actual file
        if not image_path.is_file():
            raise HTTPException(
                status_code=500,
                detail=f"Study item {item_id} references a missing image: {filename}",
            )

        formatted_images.append(
            {"filename": filename, "url": f"http://localhost:8000/images/{filename}"}
        )

    return {
        # Keep item-specific fields such as id and module_type
        **item,
        # Add shared properties such as viewer type and question text
        **module_config,
        # Replace the original filename list with frontend-ready image data
        "images": formatted_images,
    }


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


# ------------ GET READER STUDY QUESTIONS ENDPOINT ------------


@app.get("/api/questions")
def get_questions():
    """
    Returns the configured reader-study items.

    The number of study items comse from scan_questions.json, not from the number of files in the image directory.

    Each study item is assigned a module, and the module determines:
    - the shared question
    - the viewer type
    - the response type
    - the required number of images
    """

    questions = load_question_config()

    # Make sure IDs are unique before returning the study
    question_ids = [
        question.get("id") for question in questions if isinstance(question, dict)
    ]

    if len(question_ids) != len(set(question_ids)):
        raise HTTPException(
            status_code=500,
            detail="Every study item in scan_questions must have a unique id.",
        )

    # enumerate(..., start=1) gives clearer human-readable positions in errors
    return [
        format_study_item(question, position)
        for position, question in enumerate(questions, start=1)
    ]
