import { useParams } from "react-router-dom";
import { useState } from "react";
import useUserStore from "../store";
import API from "../api";

export default function UploadSelfie() {
  const { code } = useParams();
  const [file, setFile] = useState(null);
  const [matches, setMatches] = useState(null);
  const [error, setError] = useState("");
  const { name } = useUserStore();

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a file");
      return;
    }

    const formData = new FormData();
    formData.append("code", code);
    formData.append("file", file);

    try {
      const res = await API.post("/upload-selfie", formData);
      setMatches(res.data.matches);
      setError("");
      setFile(null);
    } catch (err) {
      console.error(err);
      setError("Upload failed. Please try again.");
      setFile(null);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-gray-800 via-slate-700 to-gray-900 px-4 py-10">
      <div className="bg-white bg-opacity-90 backdrop-blur-xl shadow-2xl rounded-3xl p-8 w-full max-w-xl text-center">
        <h2 className="text-3xl font-extrabold text-gray-800 mb-6">
          החתונה של <span className="text-indigo-600">{name}</span>
          <p>העלה תמונה בבקשה</p>
        </h2>

        <div className="flex flex-col items-center gap-4">
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files[0])}
            className="block w-full text-gray-700 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-700"
          />

          <button
            onClick={handleUpload}
            disabled={!file}
            className={`w-full py-3 rounded-xl text-white font-semibold transition transform ${
              file
                ? "bg-indigo-600 hover:bg-indigo-700 hover:scale-105"
                : "bg-gray-400 cursor-not-allowed"
            }`}
          >
            Upload Selfie
          </button>
        </div>

        {error && (
          <p className="text-red-600 mt-4 font-medium">{error}</p>
        )}

        {matches && (
          <div className="mt-8 text-left">
            <h3 className="text-xl font-bold text-gray-700 mb-2">Matched Photos:</h3>
            <ul className="list-disc pl-5 text-gray-600">
              {matches.map((name) => (
                <li key={name}>{name}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
