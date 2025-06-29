import insightface
import numpy as np
import cv2
import os
import pickle
import random
import string

models_dict = {}
CACHE_DIR = "album_embeddings"
os.makedirs(CACHE_DIR, exist_ok=True)



# def create_model(model_type="antelopev2"):
#     model = insightface.app.FaceAnalysis(name=model_type, providers=["CPUExecutionProvider"])
#     model.prepare(ctx_id=0, det_size=(640, 640))
#     return model

def create_model(modelType):
    model = insightface.app.FaceAnalysis(name=modelType, providers=["CUDAExecutionProvider", "CPUExecutionProvider"])
    model.prepare(ctx_id=0, det_size=(640, 640))  # Use GPU if available (ctx_id=0), CPU if ctx_id=-1
    return model


def preprocess_image(img):
    img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    h, w = img.shape[:2]
    if w > 640:
        scale = 640 / w
        img = cv2.resize(img, (int(w * scale), int(h * scale)))
    img = cv2.convertScaleAbs(img, alpha=1.1, beta=10)
    return img

def augment_selfie(img):
    augmented = [img]
    center = (img.shape[1] // 2, img.shape[0] // 2)
    for angle in [-20, 20]:
        M = cv2.getRotationMatrix2D(center, angle, 1)
        rotated = cv2.warpAffine(img, M, (img.shape[1], img.shape[0]))
        augmented.append(rotated)
    flipped = cv2.flip(img, 1)
    augmented.append(flipped)

    h, w = img.shape[:2]
    left_half = img[:, :w // 2]
    right_half = img[:, w // 2:]
    augmented.extend([left_half, right_half])
    return augmented

def l2_normalize(v):
    norm = np.linalg.norm(v)
    if norm == 0:
        return v
    return v / norm

def get_face_embeddings(img, model):
    faces = model.get(img)
    return [face.embedding for face in faces if face.embedding is not None]


def cosine_similarity(a, b):
    return np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b))


def find_matches(selfie, album_embeddings, threshold=0.4):
    matched_photos = []
    # model_types = ["buffalo_l", "buffalo_s", "antelopev2"]
    model_types = ["antelopev2"]
    for model_type in model_types:
        model = create_model(model_type)
        models_dict[model_type] = model

    print("111111111111")
    print(models_dict)
    for model_name, model in models_dict.items():
        print("2222222222")
        augmented_imgs = augment_selfie(selfie)
        selfie_embeddings = []
        for augmented_img in augmented_imgs:
            selfie_embeddings.extend(get_face_embeddings(augmented_img, model))


        for album in album_embeddings:
            for filename, embedded_album in album.items():
                print("++++++++++++")
                print(filename)
                print(model_name)
                sim = cosine_similarity(selfie_embeddings, embedded_album)
                if sim > threshold:
                    if filename not in matched_photos:
                        matched_photos.append(filename)
                    break
            break
    return matched_photos


def verify_directory_is_album(directory_path):
    if not os.path.exists(directory_path):
        print("Folder does not exist.")
        return False

    allowed_extensions = { ".jpg", ".jpeg", ".png" }

    for root, dirs, files in os.walk(directory_path):
        for file in files:
            ext = os.path.splitext(file)[1].lower()
            if ext not in allowed_extensions:
                print(f"Found non-image file: {file}")
                return False

    print("Folder exists and contains only images.")
    return True

def generate_ascii_code(length):
    chars = string.ascii_letters + string.digits
    return ''.join(random.choice(chars) for _ in range(length))

def createModel(modelType):
    model = insightface.app.FaceAnalysis(name=modelType, providers=["CPUExecutionProvider"])
    model.prepare(ctx_id=1, det_size=(640, 640))  # Use GPU if available (ctx_id=0), CPU if ctx_id=-1
    return model



def build_album_embeddings(album_dir, model):
    album_embeddings = {}
    for filename in os.listdir(album_dir):
        if not filename.lower().endswith(('.png', '.jpg', '.jpeg')):
            continue
        path = os.path.join(album_dir, filename)
        img = cv2.imread(path)
        if img is None:
            continue
        img = preprocess_image(img)
        embeddings = get_face_embeddings(img, model)
        embeddings = [l2_normalize(e) for e in embeddings if e is not None]
        if embeddings:
            album_embeddings[filename] = embeddings
    return album_embeddings

def save_cache(data, path):
    with open(path, "wb") as f:
        pickle.dump(data, f)


def learn_album(album_path, output_path):
    model_types = ["buffalo_l", "buffalo_s", "antelopev2"]
    album_code = generate_ascii_code(5)
    album_embedding_folder = os.path.join(output_path, album_code)
    os.makedirs(album_embedding_folder, exist_ok=True)

    for model_type in model_types:
        model = create_model(model_type)
        embeddings = build_album_embeddings(album_path, model)
        pkl_path = os.path.join(album_embedding_folder, f"model-{model_type}.pkl")
        save_cache(embeddings, pkl_path)

    return album_code


