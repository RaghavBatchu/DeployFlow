import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./App.css";
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        {/* Placeholder routes — to be built after landing */}
        <Route path="/auth" element={<Auth />} />
        <Route path="/dashboard" element={<div className="flex items-center justify-center min-h-screen text-gray-400">Dashboard coming soon</div>} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
