import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./App.css";
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import { SocketProvider } from "./contexts/SocketContext";
import { ToastProvider } from "./contexts/ToastContext";
import { ToastContainer } from "./components/Toast";

function App() {
  return (
    <ToastProvider>
      <SocketProvider>
        <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          {/* Placeholder routes — to be built after landing */}
          <Route path="/auth" element={<Auth />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
    </SocketProvider>
    <ToastContainer />
    </ToastProvider>
  );
}

export default App;
