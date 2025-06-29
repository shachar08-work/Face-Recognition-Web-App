import React, { useState } from 'react';
import useUserStore from "../store";
import { useNavigate } from "react-router-dom";
import API from "../api";

export default function CodeEntry() {
  const [code, setCode] = useState('');
  const [error, setError] = useState("");
  const setUser = useUserStore((state) => state.setUser);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); // reset error before try
    try {
      const res = await API.post("/validate-code", new URLSearchParams({ code }));
      if (res.data.owner) {
        setUser(code, "owner");
        navigate(`/owner`)

      }
      else {
        setUser(code, res.data.weddingname);  // Save to Zustand store
        navigate(`/upload/${code}`);
      }
    } catch (err) {
      setError("קוד שגוי. נסה שוב.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-gray-900 via-gray-800 to-gray-700 px-4">
      <div className="bg-gray-800 bg-opacity-90 backdrop-filter backdrop-blur-lg rounded-3xl shadow-2xl max-w-md w-full p-8 border border-gray-700">
        <h1 className="text-3xl font-extrabold text-center text-white mb-8 tracking-wide">
          קוד אלבום
        </h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="הכנס קוד"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="px-5 py-3 text-lg rounded-xl border border-gray-600 bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-blue-500 focus:border-transparent transition"
            autoFocus
          />

          {error && (
            <div className="text-red-400 text-center text-sm font-medium -mt-2">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white text-lg font-semibold py-3 rounded-xl shadow-lg transition transform hover:scale-105"
          >
            שלח
          </button>
        </form>

        <p className="mt-6 text-center text-gray-400">
          הכנס קוד אלבום כדי להמשיך
        </p>
      </div>
    </div>
  );
}
