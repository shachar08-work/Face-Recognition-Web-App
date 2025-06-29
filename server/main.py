from fastapi import FastAPI, UploadFile, Form, HTTPException, File
from fastapi.middleware.cors import CORSMiddleware
from pymongo import MongoClient
from pydantic import BaseModel
from typing import List
import os
import shutil
import cv2
import pickle
import numpy as np
from dotenv import load_dotenv
from pathlib import Path
from io import BytesIO
from utils import create_model, cosine_similarity, augment_selfie, preprocess_image, get_face_embeddings, verify_directory_is_album, learn_album, l2_normalize
from models import Code, PklMetadata, SelfieMetadata, FolderPath

# Load environment variables
load_dotenv()
MONGO_URI = os.getenv("MONGO_URI")
DB_NAME = os.getenv("DB_NAME")
OWNER_CODE = os.getenv("OWNER_CODE")

# local directories names
ALBUM_EMBEDDING_FOLDER = "album_embeddings"

# MongoDB connection
client = MongoClient(MONGO_URI)
db = client[DB_NAME]
codes_collection = db["codes"]
pkls_collection = db["embedding"]
selfies_collection = db["selfies"]

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

ALBUM_DIR = "albums"
SELFIE_DIR = "selfies"
os.makedirs(ALBUM_DIR, exist_ok=True)
os.makedirs(SELFIE_DIR, exist_ok=True)


# UTIL

def match_selfie_against_each_model(selfie_img, pkl_blobs_by_model: dict, threshold=0.4):
    all_matches = []

    for model_type, pkl_blob in pkl_blobs_by_model.items():
        print(f"🔍 Checking using model: {model_type}")
        model = create_model(model_type)

        processed = preprocess_image(selfie_img)
        augmented_imgs = augment_selfie(processed)

        selfie_embeddings = []
        for aug in augmented_imgs:
            selfie_embeddings.extend(get_face_embeddings(aug, model))

        if not selfie_embeddings:
            print(f"[!] No face found using {model_type}")
            continue
        else:
            print(f"[+] Found {len(selfie_embeddings)} selfie embeddings using {model_type}")

        # Normalize selfie embeddings
        selfie_embeddings = [l2_normalize(np.array(e)) for e in selfie_embeddings]

        album_embeddings = pickle.load(BytesIO(pkl_blob))
        if not album_embeddings:
            print(f"[!] Album embeddings empty for model {model_type}")
            continue

        for filename, face_embs in album_embeddings.items():
            matched = False
            for emb_album in face_embs:
                emb_album = l2_normalize(np.array(emb_album))  # Normalize album embedding
                for emb_selfie in selfie_embeddings:
                    sim = np.dot(emb_selfie, emb_album)  # cosine similarity with normalized vectors = dot product
                    print(f"SIM ({model_type}): {sim:.3f} for {filename}")
                    if sim > threshold:
                        all_matches.append(filename)
                        matched = True
                        break  # matched this album embedding
                if matched:
                    break  # matched this photo, no need to check more embeddings

    return list(set(all_matches))


def clean_databases():
    codes_collection.delete_many({})
    pkls_collection.delete_many({})
    selfies_collection.delete_many({})

# ROUTES

@app.post("/validate-code")
def validate_code(code: str = Form(...)):
    if code == OWNER_CODE:
        return {"owner": True}
    found = codes_collection.find_one({"code": code})
    if found:
        return {"owner": False, "valid": True, "weddingname": found.get("weddingname")}
    raise HTTPException(status_code=404, detail="Code not found")

# JbVAW
@app.post("/receive-directory-path")
async def receive_folder_path(data: FolderPath):
    directory_path = data.path
    embedding_folder = ALBUM_EMBEDDING_FOLDER
    if verify_directory_is_album(directory_path):
        print("good directory")
        code = learn_album(directory_path, embedding_folder)  # returns code
        model_data = []
        folder = os.path.join(embedding_folder, code)
        # Instead of just reading files in order, read by filename and build a dict:
        for file in os.listdir(folder):
            if file.endswith(".pkl"):
                model_type = file.replace("model-", "").replace(".pkl", "")
                with open(os.path.join(folder, file), "rb") as f:
                    pkl_blob = f.read()
                model_data.append({"model_type": model_type, "data": pkl_blob})

        metadata = {
            "album_code": code,
            "embedded_models": model_data
        }
        codemetadata = {
            "code": code,
            "weddingname": data.name
        }
        pkls_collection.insert_one(metadata)
        codes_collection.insert_one(codemetadata)
        shutil.rmtree(folder)
        return {"message": "Path received", "album_code": code}

    else:
        print("bad directory")
    return {"message": "Bad path received"}


@app.post("/upload-owner-data")
async def upload_owner_data(code: str = Form(...), files: List[UploadFile] = File(...)):
    if not code or not files:
        raise HTTPException(status_code=400, detail="Missing code or files")

    model_data = [await file.read() for file in files]
    pkls_collection.insert_one(PklMetadata(album_code=code, embedded_models=model_data).dict())
    return {"status": "success", "message": f"{len(model_data)} pkl files uploaded"}


# @app.post("/upload-selfie")
# async def upload_selfie(code: str = Form(...), file: UploadFile = File(...)):
#     # Validate album code exists
#     found = codes_collection.find_one({"code": code})
#     if not found:
#         raise HTTPException(status_code=404, detail="Album code not found")

#     selfie_path = os.path.join(SELFIE_DIR, file.filename)
#     with open(selfie_path, "wb") as buffer:
#         shutil.copyfileobj(file.file, buffer)
#     img = cv2.imread(selfie_path)
#     if img is None:
#         raise HTTPException(status_code=400, detail="Invalid image file")

#     album_doc = pkls_collection.find_one({"album_code": code})
#     if not album_doc or "embedded_models" not in album_doc:
#         raise HTTPException(status_code=404, detail="Album embeddings not found")

#     # Build dict: model_type -> pkl blob
#     pkl_blobs_by_model = {
#         entry["model_type"]: entry["data"] for entry in album_doc["embedded_models"]
#     }

#     matches = match_selfie_against_each_model(img, pkl_blobs_by_model, threshold=0.4)

#     # Save selfie metadata
#     metadata = SelfieMetadata(filename=file.filename, album_code=code, matches=matches)
#     selfies_collection.insert_one(metadata.dict())

#     return {"status": "success", "matches": matches}



from datetime import datetime

@app.post("/upload-selfie")
async def upload_selfie(
    code: str = Form(...),
    user_name: str = Form(...),
    phone: str = Form(...),
    file: UploadFile = File(...)
):
    # Validate album code exists
    found = codes_collection.find_one({"code": code})
    if not found:
        raise HTTPException(status_code=404, detail="Album code not found")

    selfie_path = os.path.join(SELFIE_DIR, file.filename)
    with open(selfie_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    img = cv2.imread(selfie_path)
    if img is None:
        raise HTTPException(status_code=400, detail="Invalid image file")

    album_doc = pkls_collection.find_one({"album_code": code})
    if not album_doc or "embedded_models" not in album_doc:
        raise HTTPException(status_code=404, detail="Album embeddings not found")

    # Build dict: model_type -> pkl blob
    pkl_blobs_by_model = {
        entry["model_type"]: entry["data"] for entry in album_doc["embedded_models"]
    }

    matches = match_selfie_against_each_model(img, pkl_blobs_by_model, threshold=0.4)

    # Save selfie metadata
    metadata = {
        "filename": file.filename,
        "album_code": code,
        "matches": matches,
        "uploaded_by": user_name,
        "phone": phone,
        "uploaded_at": datetime.utcnow()
    }
    selfies_collection.insert_one(metadata)

    os.remove(selfie_path)
    return {"status": "success", "matches": matches}






