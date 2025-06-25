Face-Recognition-Web-App

SERVER

1.
git clone https://github.com/shachar08-work/Face-Recognition-Web-App
cd Face-Recognition-Web-App

2.
cd server
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt

3.
Make sure you have mongo a .env file with:
MONGO_URI=your-mongodb-uri
DB_NAME=your-db-name

4.
uvicorn main:app --reload



CLIENT
1.
cd ../client
npm install
npm run dev  # or npm start depending on your setup





Notes
Don't forget to upload album embeddings before uploading selfies.
Models and cache folders like album_embeddings/, selfies/, and albums/ are generated locally and ignored by git.


