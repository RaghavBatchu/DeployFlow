import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { auth } from "../services/api";

export default function Navbar() {
  const navigate = useNavigate();
  const isAuthenticated = auth.isAuthenticated();

  const handleLogout = () => {
    auth.clearAuth();
    navigate("/");
  };

  return (
    <motion.nav
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "14px 32px", background: "rgba(255,255,255,0.9)",
        backdropFilter: "blur(12px)", borderBottom: "1px solid #f3f4f6",
        fontFamily: "'Inter', sans-serif"
      }}
    >
      {/* Logo */}
      <Link to="/" style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none" }}>
        <div style={{ width: 32, height: 32, borderRadius: "8px", background: "#9333ea", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 14px rgba(147,51,234,0.3)" }}>
          <svg
            style={{ width: "20px", height: "20px", color: "white" }}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
            <polyline points="2 12 12 17 22 12"></polyline>
            <polyline points="2 17 12 22 22 17"></polyline>
          </svg>
        </div>
        <span style={{ fontWeight: 800, color: "#111", fontSize: "17px", letterSpacing: "-0.3px" }}>DeployFlow</span>
      </Link>

      {/* Center Links */}
      <div style={{ display: "flex", gap: "32px" }}>
        {["How it works", "Roles", "Features", "FAQ"].map((link) => (
          <a key={link} href={`#${link.toLowerCase().replace(/ /g, "-")}`}
            style={{ fontSize: "14px", color: "#6b7280", fontWeight: 500, textDecoration: "none" }}>
            {link}
          </a>
        ))}
      </div>

      {/* Auth */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        {isAuthenticated ? (
          <>
            <button
              onClick={handleLogout}
              style={{ background: "transparent", border: "none", cursor: "pointer", fontSize: "14px", fontWeight: 500, color: "#ef4444", textDecoration: "none" }}
            >
              Logout
            </button>
            <Link to="/dashboard" style={{ background: "linear-gradient(135deg, #7c3aed, #2563eb)", color: "#fff", fontSize: "14px", fontWeight: 600, padding: "9px 20px", borderRadius: "999px", textDecoration: "none", boxShadow: "0 4px 14px rgba(124,58,237,0.3)" }}>
              Dashboard →
            </Link>
          </>
        ) : (
          <>
            <Link to="/auth" style={{ fontSize: "14px", fontWeight: 500, color: "#374151", textDecoration: "none" }}>Sign In</Link>
            <Link to="/auth?tab=register" style={{ background: "linear-gradient(135deg, #7c3aed, #2563eb)", color: "#fff", fontSize: "14px", fontWeight: 600, padding: "9px 20px", borderRadius: "999px", textDecoration: "none", boxShadow: "0 4px 14px rgba(124,58,237,0.3)" }}>
              Start Playing →
            </Link>
          </>
        )}
      </div>
    </motion.nav>
  );
}
