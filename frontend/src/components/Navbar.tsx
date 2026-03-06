import { motion } from "framer-motion";
import { Link } from "react-router-dom";

export default function Navbar() {
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
      <Link to="/" style={{ display: "flex", alignItems: "center", gap: "8px", textDecoration: "none" }}>
        <div style={{ width: 32, height: 32, borderRadius: "8px", background: "linear-gradient(135deg, #7c3aed, #2563eb)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: "14px" }}>D</div>
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
        <Link to="/auth" style={{ fontSize: "14px", fontWeight: 500, color: "#374151", textDecoration: "none" }}>Sign In</Link>
        <Link to="/auth?tab=register" style={{ background: "linear-gradient(135deg, #7c3aed, #2563eb)", color: "#fff", fontSize: "14px", fontWeight: 600, padding: "9px 20px", borderRadius: "999px", textDecoration: "none", boxShadow: "0 4px 14px rgba(124,58,237,0.3)" }}>
          Start Playing →
        </Link>
      </div>
    </motion.nav>
  );
}
