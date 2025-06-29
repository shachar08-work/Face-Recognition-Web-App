import { useParams } from "react-router-dom";
import { useState } from "react";
import useUserStore from "../store";
import API from "../api";
import { useNavigate } from "react-router-dom";

export default function UploadSelfie() {
  const { code } = useParams();
  const { name: weddingName } = useUserStore();
  const navigate = useNavigate();

  const [file, setFile] = useState(null);
  const [userName, setUserName] = useState("");
  const [phone, setPhone] = useState("");
  const [matches, setMatches] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleUpload = async () => {
    if (!file || !userName || !phone) {
      setError("אנא מלא את כל הפרטים והעלה תמונה");
      return;
    }

    const formData = new FormData();
    formData.append("code", code);
    formData.append("file", file);
    formData.append("user_name", userName);
    formData.append("phone", phone);

    try {
      setLoading(true);
      setError("");
      setMatches(null);

      await API.post("/upload-selfie", formData);
      setFile(null);
      setError("");
      setMatches(null);
      alert("נהדר! נעדכן אותך בהמשך לגבי התמונות בהן הופעת.");
      navigate("/");
    } catch (err) {
      console.error(err);
      setError("העלאה נכשלה. נסה שוב.");
    } finally {
      setLoading(false);
    }
  };

  const canUpload = file && userName.trim() && phone.trim();
  

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-gray-800 via-slate-700 to-gray-900 px-4 py-10">
      <div className="bg-white bg-opacity-90 backdrop-blur-xl shadow-2xl rounded-3xl p-8 w-full max-w-xl text-center">
        <h2 className="text-3xl font-extrabold text-gray-800 mb-6">
          החתונה של <span className="text-indigo-600">{weddingName}</span>
          <p className="text-lg mt-2 text-gray-700">העלה תמונה בבקשה</p>
        </h2>

        <div className="flex flex-col gap-4 text-right">
          <label className="font-medium text-gray-700">שם מלא:</label>
          <input
            type="text"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            placeholder="הכנס את שמך"
            className="px-4 py-2 rounded-lg border border-gray-300 text-gray-800"
          />

          <label className="font-medium text-gray-700">מספר טלפון:</label>
          <input
            type="text"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="הכנס מספר טלפון"
            className="px-4 py-2 rounded-lg border border-gray-300 text-gray-800"
          />

          <label className="font-medium text-gray-700">בחר תמונה:</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files[0])}
            className="block w-full text-gray-700 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-700"
          />

          <button
            onClick={handleUpload}
            disabled={!canUpload || loading}
            className={`w-full py-3 rounded-xl text-white font-semibold transition transform ${
              canUpload && !loading
                ? "bg-indigo-600 hover:bg-indigo-700 hover:scale-105"
                : "bg-gray-400 cursor-not-allowed"
            }`}
          >
            {loading ? "טוען..." : "העלה תמונה"}
          </button>
        </div>

        {error && (
          <p className="text-red-600 mt-4 font-medium">{error}</p>
        )}

        {matches && (
          <div className="mt-8 text-left">
            <h3 className="text-xl font-bold text-gray-700 mb-2">תמונות תואמות:</h3>
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
