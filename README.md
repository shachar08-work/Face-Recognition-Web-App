# 🎯 Face Recognition Web App

A full-stack facial recognition app using **FastAPI**, **InsightFace**, and **React**.  
Users upload selfies to find all album photos they appear in, powered by three facial recognition models: `antelopev2`, `buffalo_l`, and `buffalo_s`.

---

## 🧠 Backend (FastAPI)

1. Clone the repository and enter the project folder:

```
git clone https://github.com/shachar08-work/Face-Recognition-Web-App.git
cd Face-Recognition-Web-App/server
```

2. Create and activate a virtual environment:

**macOS/Linux**:
```
python -m venv venv
source venv/bin/activate
```

**Windows**:
```
python -m venv venv
venv\Scripts\activate
```

3. Install dependencies:

```
pip install -r requirements.txt
```

4. Create a `.env` file inside the `server/` folder:

```
MONGO_URI=your-mongodb-uri
DB_NAME=your-db-name
```

Example:
```
MONGO_URI=mongodb+srv://user:password@cluster.mongodb.net
DB_NAME=face_recognition
```

5. Run the FastAPI server:

```
uvicorn main:app --reload
```

Server is available at: http://localhost:8000  
Swagger docs: http://localhost:8000/docs

---

## 🌐 Frontend (React)

1. Navigate to the client folder:

```
cd ../client
```

2. Install frontend dependencies:

```
npm install
```

3. Run the frontend app:

```
npm run dev
```

App runs at: http://localhost:5173

---

## 📁 Folder Structure

```
Face-Recognition-Web-App/
├── client/                 # React frontend
├── server/                 # FastAPI backend
│   ├── main.py             # Backend logic
│   ├── utils.py            # Face recognition functions
│   ├── .env                # Your MongoDB config
│   └── requirements.txt    # Python dependencies
├── .gitignore
└── README.md
```

---

## 📦 .gitignore Example

Add this file at the project root (`/`) or inside both `client/` and `server/` folders if needed:

```
# Node
node_modules/
dist/

# Python
__pycache__/
*.pyc
venv/
*.pkl

# Media & Cache
album_embeddings/
selfies/
albums/

# Secrets
.env
```

---

## 🧪 How It Works

- Admin uploads a folder of images and assigns an album name.
- Server processes the images and stores `.pkl` embeddings from 3 face models.
- A unique album code is saved in MongoDB with associated name and data.
- User enters the album code and uploads a selfie.
- The selfie is augmented (rotated, flipped, half-face) and embedded.
- All album photos across all 3 models are searched for matches.
- The app returns a list of all filenames that include the user's face.

---

## ⚙️ Backend Dependencies

Install using:

```
pip install -r requirements.txt
```

Contents:

```
fastapi
uvicorn
pymongo
pydantic
python-dotenv
opencv-python
insightface
numpy
```

---

## 📝 Notes

- `.env`, `.pkl`, and folders like `albums/`, `selfies/`, `album_embeddings/` are ignored by Git.
- You must upload and train the album before users can match selfies.
- Works with `.jpg`, `.jpeg`, and `.png` files only.
- Supports GPU (via CUDA) if available; otherwise runs on CPU.

---
