import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import CodeEntry from "./pages/CodeEntry";
import UploadSelfie from "./pages/UploadSelfie";
import ProtectedRoute from "./ProtectedRoute";
import OwnerUpload from "./pages/OwnerUpload";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<CodeEntry />} />
        <Route path="/upload/:code" element={<ProtectedRoute><UploadSelfie /></ProtectedRoute>} />
        <Route path="/owner" element={<ProtectedRoute><OwnerUpload /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;