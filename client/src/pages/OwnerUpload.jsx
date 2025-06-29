import React, { useState } from "react";
import API from "../api";

export default function OwnerUpload() {
  const [imageFiles, setImageFiles] = useState([]);
  const [processingDone, setProcessingDone] = useState(false);
  const [code, setCode] = useState("");
  const [pklFiles, setPklFiles] = useState([]);
  const [images, setImages] = useState([]);
  const [folderPath, setFolderPath] = useState("");
  const [status, setStatus] = useState("");
  const [learningAlbum, setLearningAlbum] = useState(false);
  const [albumName, setAlbumName] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!folderPath || !albumName) return;
    setLearningAlbum(true);
    try {
      const res = await API.post("/receive-directory-path", {
        path: folderPath,
        name: albumName
      });
      setCode(res.data.album_code);
      setStatus("נתיב התיקיה והשם נשלחו בהצלחה לשרת.");
      setLearningAlbum(false);
      setProcessingDone(true);
    } catch {
      setStatus("שגיאה בשליחת הנתיב או השם.");
    }
  };

  const generateCode = () => {
    const newCode = Math.floor(10000 + Math.random() * 90000).toString();
    setCode(newCode);
    setStatus("קוד נוצר: " + newCode);
  };

  const handlePklChange = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = files.filter((file) => file.name.endsWith(".pkl"));
    setPklFiles(validFiles);
  };

  const handleUploadPkl = async (e) => {
    e.preventDefault();
    if (!code || pklFiles.length === 0) return;

    const formData = new FormData();
    formData.append("code", code);
    pklFiles.forEach((file) => {
      formData.append("files", file);
    });

    try {
      await API.post("/upload-owner-data", formData);
      setStatus("קבצי pkl הועלו בהצלחה!");
    } catch {
      setStatus("שגיאה בהעלאת קבצי pkl");
    }
  };

  return (
  <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700 flex items-center justify-center px-4 py-12">
    <div className="bg-gray-900 text-white rounded-3xl shadow-2xl w-full max-w-xl p-10 border border-gray-700">
      <h1 className="text-3xl font-extrabold text-center mb-6 tracking-wide text-white">
        ניהול תיקיית אלבום
      </h1>

      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-6 text-white"
      >
        <div>
          <label className="block mb-2 text-sm font-medium">
            שם האלבום:
          </label>
          <input
            type="text"
            value={albumName}
            onChange={(e) => setAlbumName(e.target.value)}
            placeholder="לדוגמה: חתונה של שחר"
            className="w-full px-4 py-3 rounded-xl bg-gray-800 border border-gray-600 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:outline-none text-white"
          />
        </div>

        <div>
          <label className="block mb-2 text-sm font-medium">
            נתיב תיקייה במחשב:
          </label>
          <input
            type="text"
            value={folderPath}
            onChange={(e) => setFolderPath(e.target.value)}
            placeholder="לדוגמה: C:\\Users\\Owner\\Pictures\\Album1"
            className="w-full px-4 py-3 rounded-xl bg-gray-800 border border-gray-600 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:outline-none text-white"
          />
        </div>

        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white text-lg font-semibold py-3 rounded-xl transition transform hover:scale-105 shadow-md"
        >
          שלח נתיב ואלבום
        </button>

        {/* Status + Code Messages */}
        {(code || learningAlbum || status) && (
          <div className="text-center mt-4 space-y-1">
            {code && (
              <p className="text-green-400 font-semibold text-lg">
                ✅ קוד האלבום: {code}
              </p>
            )}
            {learningAlbum && (
              <p className="text-yellow-400 font-medium animate-pulse">
                טוען...
              </p>
            )}
            {status && (
              <p className="text-blue-400 font-medium">{status}</p>
            )}
          </div>
        )}
      </form>
    </div>
  </div>
);
}