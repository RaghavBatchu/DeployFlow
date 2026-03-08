import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import PipelineAnimation from "../components/PipelineAnimation";
import Navbar from "../components/Navbar";
import { auth } from "../services/api";

const roles = [
  { icon: "👨‍💻", title: "Developer", desc: "Push code to trigger the build pipeline and kick off the workflow.", accent: "#7c3aed", bg: "linear-gradient(135deg, #f5f3ff, #ede9fe)", border: "#ddd6fe" },
  { icon: "🧪", title: "QA Engineer", desc: "Run automated tests and validate the build before deployment.", accent: "#2563eb", bg: "linear-gradient(135deg, #eff6ff, #dbeafe)", border: "#bfdbfe" },
  { icon: "⚙️", title: "DevOps", desc: "Deploy the validated application to production infrastructure.", accent: "#0e7490", bg: "linear-gradient(135deg, #ecfeff, #cffafe)", border: "#a5f3fc" },
  { icon: "👔", title: "Manager", desc: "Approve the final release and complete the deployment pipeline.", accent: "#059669", bg: "linear-gradient(135deg, #ecfdf5, #d1fae5)", border: "#6ee7b7" },
];

type FooterLink = { label: string; href: string; external?: boolean };
type FooterLinks = { [category: string]: FooterLink[] };

const footerLinks: FooterLinks = {
  Project: [
    { label: "GitHub", href: "https://github.com/RaghavBatchu/DeployFlow", external: true },
    { label: "How it Works", href: "#how-it-works" },
    { label: "Roadmap", href: "#" },
  ],
  Roles: [
    { label: "Developer", href: "#" },
    { label: "QA Engineer", href: "#" },
    { label: "DevOps", href: "#" },
    { label: "Manager", href: "#" },
  ],
  Connect: [
    { label: "GitHub Profile", href: "https://github.com/RaghavBatchu", external: true },
    { label: "Privacy Policy", href: "#" },
  ],
};

export default function Landing() {
  return (
    <div style={{ minHeight: "100vh", background: "#fafafa", fontFamily: "'Inter', sans-serif" }}>
      <Navbar />

      {/* ═══ HERO ═══ */}
      <section style={{
        position: "relative", overflow: "hidden",
        padding: "8rem 2rem 6rem",
        background: "linear-gradient(160deg, #faf5ff 0%, #eff6ff 40%, #f0fdf4 100%)"
      }}>
        {/* Decorative orbs */}
        <div style={{ position: "absolute", top: "-80px", left: "-80px", width: "400px", height: "400px", borderRadius: "50%", background: "radial-gradient(circle, rgba(124,58,237,0.12), transparent 70%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: "-60px", right: "-60px", width: "300px", height: "300px", borderRadius: "50%", background: "radial-gradient(circle, rgba(16,185,129,0.1), transparent 70%)", pointerEvents: "none" }} />

        <div style={{ maxWidth: "1200px", margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4rem", alignItems: "center", position: "relative" }}>
          {/* Left */}
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "rgba(124,58,237,0.12)", color: "#6d28d9", fontSize: "12px", fontWeight: 700, padding: "6px 16px", borderRadius: "999px", marginBottom: "1.5rem", border: "1px solid rgba(124,58,237,0.2)" }}>
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#7c3aed", display: "inline-block" }} />
              Real-time DevOps Simulator
            </div>

            <h1 style={{ fontSize: "3.75rem", fontWeight: 900, lineHeight: 1.08, color: "#0f0f0f", marginBottom: "1.25rem", letterSpacing: "-1px" }}>
              <span style={{ background: "linear-gradient(135deg, #7c3aed 0%, #2563eb 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Simulate</span>{" "}
              the DevOps<br />Lifecycle
            </h1>

            <p style={{ color: "#6b7280", fontSize: "1.1rem", lineHeight: 1.75, marginBottom: "2rem", maxWidth: "420px" }}>
              Play as a Developer, QA, DevOps Engineer, or Manager. Collaborate in real-time to move your project through a live CI/CD pipeline.
            </p>

            <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", marginBottom: "1.5rem" }}>
              <Link to={auth.isAuthenticated() ? "/dashboard" : "/auth?tab=register"} style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "linear-gradient(135deg, #7c3aed, #2563eb)", color: "#fff", fontWeight: 700, padding: "14px 28px", borderRadius: "999px", fontSize: "15px", boxShadow: "0 8px 28px rgba(124,58,237,0.35)", textDecoration: "none", transition: "opacity 0.2s" }}>
                {auth.isAuthenticated() ? "→ Go to Dashboard" : "→ Start Simulation"}
              </Link>
              <a href="#how-it-works" style={{ display: "inline-flex", alignItems: "center", color: "#374151", fontWeight: 600, padding: "14px 24px", borderRadius: "999px", border: "1px solid #d1d5db", fontSize: "15px", textDecoration: "none", background: "rgba(255,255,255,0.7)" }}>
                How it Works
              </a>
            </div>
            <div style={{ display: "flex", gap: "1.5rem", color: "#9ca3af", fontSize: "13px", flexWrap: "wrap" }}>
              <span>✓ No setup required</span>
              <span>✓ Real-time multiplayer</span>
              <span>✓ Free to play</span>
            </div>
          </motion.div>

          {/* Right: Pipeline Card */}
          <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7, delay: 0.2 }} style={{ position: "relative" }}>
            <div style={{ background: "#fff", borderRadius: "24px", boxShadow: "0 24px 64px rgba(124,58,237,0.12), 0 4px 16px rgba(0,0,0,0.05)", border: "1px solid rgba(124,58,237,0.1)", padding: "2rem", animation: "float 4s ease-in-out infinite" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                <div>
                  <p style={{ fontSize: "11px", color: "#9ca3af", fontWeight: 700, letterSpacing: "0.1em", marginBottom: "4px" }}>ACTIVE PIPELINE</p>
                  <p style={{ fontSize: "16px", fontWeight: 800, color: "#111" }}>DeployFlow Sprint #12</p>
                </div>
                <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "#ecfdf5", color: "#059669", fontSize: "12px", fontWeight: 700, padding: "6px 14px", borderRadius: "999px", border: "1px solid #a7f3d0" }}>
                  <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#10b981", display: "inline-block" }} />
                  Live
                </div>
              </div>

              <PipelineAnimation />

              <div style={{ marginTop: "1.5rem", display: "flex", flexDirection: "column", gap: "10px" }}>
                {[
                  { user: "Raghav", role: "Developer", action: "pushed code to main", bg: "rgba(124,58,237,0.08)", color: "#6d28d9" },
                  { user: "Ankit", role: "QA", action: "started test suite", bg: "rgba(37,99,235,0.08)", color: "#1d4ed8" },
                  { user: "Neha", role: "DevOps", action: "deploying to production…", bg: "rgba(14,116,144,0.08)", color: "#0e7490" },
                ].map((item, i) => (
                  <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 1.6 + i * 0.3 }}
                    style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "13px" }}>
                    <div style={{ width: 26, height: 26, borderRadius: "50%", background: "linear-gradient(135deg, #7c3aed22, #2563eb22)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, color: "#7c3aed", fontSize: "11px", flexShrink: 0, border: "1px solid #ddd6fe" }}>
                      {item.user[0]}
                    </div>
                    <span style={{ background: item.bg, color: item.color, fontSize: "11px", fontWeight: 700, padding: "3px 10px", borderRadius: "999px", flexShrink: 0 }}>{item.role}</span>
                    <span style={{ color: "#6b7280", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.action}</span>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Floating badges */}
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 1.2, type: "spring" }}
              style={{ position: "absolute", top: "-16px", right: "-16px", background: "linear-gradient(135deg, #fef3c7, #fff7ed)", borderRadius: "16px", boxShadow: "0 8px 24px rgba(245,158,11,0.2)", border: "1px solid #fde68a", padding: "10px 16px", display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ fontSize: "20px" }}>🎉</span>
              <div>
                <p style={{ fontWeight: 800, color: "#92400e", fontSize: "13px" }}>Pipeline Complete!</p>
                <p style={{ color: "#b45309", fontSize: "12px" }}>Deployed in 4 turns</p>
              </div>
            </motion.div>

            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 1.4, type: "spring" }}
              style={{ position: "absolute", bottom: "-16px", left: "-16px", background: "#fff", borderRadius: "16px", boxShadow: "0 8px 24px rgba(0,0,0,0.08)", border: "1px solid #f3f4f6", padding: "10px 16px" }}>
              <p style={{ color: "#9ca3af", fontSize: "11px", fontWeight: 600, marginBottom: "6px" }}>Online Players</p>
              <div style={{ display: "flex" }}>
                {["R", "A", "N", "K"].map((l, i) => (
                  <div key={i} style={{ width: 28, height: 28, borderRadius: "50%", background: `linear-gradient(135deg, ${["#7c3aed","#2563eb","#0891b2","#059669"][i]}, ${["#a855f7","#3b82f6","#06b6d4","#10b981"][i]})`, border: "2px solid white", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: "11px", fontWeight: 800, marginRight: i < 3 ? "-6px" : 0 }}>{l}</div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ═══ HOW IT WORKS ═══ */}
      <section id="how-it-works" style={{ padding: "8rem 2rem", background: "#fff", borderTop: "1px solid #f3f4f6" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} style={{ textAlign: "center", marginBottom: "3.5rem" }}>
            <p style={{ fontSize: "20px", fontWeight: 800, color: "#7c3aed", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: "16px" }}>How it works</p>
            <h2 style={{ fontSize: "3.5rem", fontWeight: 900, color: "#0f0f0f", marginBottom: "1.25rem", letterSpacing: "-1px" }}>Four roles. One pipeline.<br/>Zero meetings.</h2>
            <p style={{ color: "#6b7280", maxWidth: "520px", margin: "0 auto", lineHeight: 1.8, fontSize: "17px" }}>Each player picks a role and performs exactly one action to advance the shared deployment pipeline.</p>
          </motion.div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1.5rem" }}>
            {roles.map((role, i) => (
              <motion.div key={role.title}
                initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                whileHover={{ y: -10, scale: 1.02, transition: { duration: 0.2 } }}
                style={{ background: role.bg, border: `1px solid ${role.border}`, borderRadius: "24px", padding: "2.5rem 2rem", cursor: "default" }}>
                <div style={{ fontSize: "3.5rem", marginBottom: "1.25rem" }}>{role.icon}</div>
                <div style={{ display: "inline-block", background: "#fff", color: role.accent, fontSize: "12px", fontWeight: 800, padding: "5px 14px", borderRadius: "999px", marginBottom: "1rem", border: `1px solid ${role.border}` }}>{role.title}</div>
                <p style={{ color: "#374151", fontSize: "15px", lineHeight: 1.75 }}>{role.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ STATS STRIP ═══ */}
      <section style={{ padding: "3rem 2rem", background: "linear-gradient(90deg, #f5f3ff, #eff6ff, #ecfeff, #ecfdf5)" }}>
        <div style={{ maxWidth: "900px", margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "2rem", textAlign: "center" }}>
          {[
            { num: "4", label: "Roles Supported" },
            { num: "100%", label: "Real-time Updates" },
            { num: "<1s", label: "Socket Latency" },
            { num: "∞", label: "Games Playable" },
          ].map((s) => (
            <div key={s.num}>
              <p style={{ fontSize: "2.25rem", fontWeight: 900, background: "linear-gradient(135deg, #7c3aed, #2563eb)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>{s.num}</p>
              <p style={{ color: "#6b7280", fontSize: "13px", fontWeight: 600, marginTop: "4px" }}>{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ CTA ═══ */}
      <section style={{ padding: "6rem 2rem", background: "#fff" }}>
        <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
          style={{ maxWidth: "820px", margin: "0 auto", background: "linear-gradient(135deg, #7c3aed 0%, #2563eb 60%, #0891b2 100%)", borderRadius: "28px", padding: "4.5rem 3rem", textAlign: "center", boxShadow: "0 32px 80px rgba(124,58,237,0.3)", position: "relative", overflow: "hidden" }}>
          {/* BG sparkles */}
          <div style={{ position: "absolute", top: "-50px", right: "-50px", width: "250px", height: "250px", borderRadius: "50%", background: "rgba(255,255,255,0.06)", pointerEvents: "none" }} />
          <div style={{ position: "absolute", bottom: "-40px", left: "60px", width: "160px", height: "160px", borderRadius: "50%", background: "rgba(255,255,255,0.05)", pointerEvents: "none" }} />
          <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "12px", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: "12px" }}>Get Started Now</p>
          <h2 style={{ fontSize: "2.75rem", fontWeight: 900, color: "#fff", marginBottom: "1rem", letterSpacing: "-0.5px" }}>Ready to deploy?</h2>
          <p style={{ color: "rgba(255,255,255,0.75)", fontSize: "1.1rem", marginBottom: "2.5rem", lineHeight: 1.65 }}>Pick your role and join a live simulation in seconds.</p>
          <Link to={auth.isAuthenticated() ? "/dashboard" : "/auth?tab=register"} style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "#fff", color: "#7c3aed", fontWeight: 800, padding: "16px 40px", borderRadius: "999px", fontSize: "16px", textDecoration: "none", boxShadow: "0 8px 24px rgba(0,0,0,0.15)" }}>
            {auth.isAuthenticated() ? "→ Go to Dashboard" : "→ Start Simulation for Free"}
          </Link>
        </motion.div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer style={{ background: "#0f0f11", color: "#e5e7eb", padding: "4rem 2rem 2rem" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          {/* Top row */}
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: "3rem", paddingBottom: "3rem", borderBottom: "1px solid #1f2937" }}>

            {/* Brand col */}
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "1rem" }}>
                <div style={{ width: 36, height: 36, borderRadius: "10px", background: "#9333ea", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 14px rgba(147,51,234,0.3)" }}>
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
                <span style={{ fontWeight: 800, color: "#fff", fontSize: "18px", letterSpacing: "-0.3px" }}>DeployFlow</span>
              </div>
              <p style={{ color: "#9ca3af", fontSize: "14px", lineHeight: 1.75, maxWidth: "280px" }}>
                A real-time multiplayer DevOps simulator. Pick a role, collaborate with your team, and deploy a CI/CD pipeline together.
              </p>
              <div style={{ marginTop: "1.5rem" }}>
                <a href="https://github.com/RaghavBatchu/DeployFlow" target="_blank" rel="noopener noreferrer"
                  style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "#1f2937", color: "#e5e7eb", fontSize: "13px", fontWeight: 600, padding: "9px 18px", borderRadius: "10px", textDecoration: "none", border: "1px solid #374151", transition: "all 0.2s" }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
                  </svg>
                  View on GitHub
                </a>
              </div>
            </div>

            {/* Link columns */}
            {Object.entries(footerLinks).map(([category, links]) => (
              <div key={category}>
                <h4 style={{ color: "#fff", fontWeight: 700, fontSize: "13px", letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: "1.25rem" }}>{category}</h4>
                <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "10px" }}>
                  {links.map((link) => (
                    <li key={link.label}>
                      <a href={link.href} target={link.external ? "_blank" : undefined} rel={link.external ? "noopener noreferrer" : undefined}
                        style={{ color: "#9ca3af", fontSize: "14px", textDecoration: "none", transition: "color 0.2s" }}
                        onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.color = "#e5e7eb"}
                        onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.color = "#9ca3af"}>
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Bottom row */}
          <div style={{ paddingTop: "2rem", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
            <p style={{ color: "#6b7280", fontSize: "13px" }}>
              © {new Date().getFullYear()} DeployFlow by{" "}
              <a href="https://github.com/RaghavBatchu" target="_blank" rel="noopener noreferrer" style={{ color: "#818cf8", textDecoration: "none", fontWeight: 600 }}>Raghav Batchu</a>.
              Built with React, Node.js &amp; Socket.io.
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#10b981", display: "inline-block" }} />
              <span style={{ color: "#6b7280", fontSize: "13px" }}>All systems operational</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
