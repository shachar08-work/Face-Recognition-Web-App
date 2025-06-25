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
  const [albumName, setAlbumName] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!folderPath || !albumName) return;

    try {
      await API.post("/receive-directory-path", {
        path: folderPath,
        name: albumName
      });
      setStatus("נתיב התיקיה והשם נשלחו בהצלחה לשרת.");
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
    <div className="min-h-screen flex items-center justify-center bg-gray-900 px-4">
      <div className="bg-gray-800 text-white rounded-2xl p-8 w-full max-w-md shadow-lg border border-gray-700">
        <h1 className="text-2xl font-bold text-center mb-6">ניהול תיקיית אלבום</h1>

        <form onSubmit={handleSubmit} className="p-6 bg-gray-800 text-white max-w-md mx-auto rounded-lg mt-10">
  <label>שם האלבום:</label>
  <input
    type="text"
    value={albumName}
    onChange={(e) => setAlbumName(e.target.value)}
    placeholder="לדוגמה: חתונה של שחר"
    className="w-full mt-2 p-2 rounded text-black"
  />

  <label className="mt-4 block">הכנס נתיב תיקיה מלאה במחשב שלך:</label>
  <input
    type="text"
    value={folderPath}
    onChange={(e) => setFolderPath(e.target.value)}
    placeholder="לדוגמה: C:\\Users\\Owner\\Pictures\\Album1"
    className="w-full mt-2 p-2 rounded text-black"
  />

  <button type="submit" className="mt-4 px-4 py-2 bg-blue-600 rounded">
    שלח נתיב ואלבום
  </button>

  {status && <p className="mt-2">{status}</p>}
</form>

        {processingDone ? (
          <div>
            <div className="mb-4">
              <button
                onClick={generateCode}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition"
              >
                הפק קוד חדש
              </button>
              {code && (
                <p className="text-center mt-2 text-lg font-mono">{code}</p>
              )}
            </div>

            <form onSubmit={handleUploadPkl} className="flex flex-col gap-4">
              <input
                type="file"
                accept=".pkl"
                multiple
                onChange={handlePklChange}
                className="bg-gray-700 px-4 py-2 rounded-lg"
              />

              <button
                type="submit"
                className="py-3 bg-green-600 hover:bg-green-700 rounded-lg font-semibold transition"
              >
                העלה קבצי pkl
              </button>
            </form>
          </div>
        ) : null}

        {status && (
          <p className="mt-4 text-center text-yellow-300">{status}</p>
        )}
      </div>
    </div>
  );
}
