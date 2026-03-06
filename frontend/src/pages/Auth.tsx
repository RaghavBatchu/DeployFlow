import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import authHero from "../assets/auth-hero.png";

/* ─── Types ─────────────────────────────────────────────────── */
const ROLES = [
  { value: "developer", label: "Developer", icon: "👨‍💻", color: "#7c3aed" },
  { value: "qa",        label: "QA Engineer", icon: "🧪",  color: "#2563eb" },
  { value: "devops",    label: "DevOps",      icon: "⚙️",  color: "#0e7490" },
  { value: "manager",   label: "Manager",     icon: "👔",  color: "#059669" },
] as const;
type Role = (typeof ROLES)[number]["value"];

/* ─── Icons ──────────────────────────────────────────────────── */
const EyeOpen = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
  </svg>
);
const EyeOff = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
);


/* ─── Toggle ─────────────────────────────────────────────────── */
function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      style={{
        position: "relative", display: "inline-flex", alignItems: "center",
        width: 44, height: 24, borderRadius: 999, border: "none", cursor: "pointer",
        background: on ? "#7c3aed" : "#d1d5db",
        transition: "background 0.2s",
        flexShrink: 0,
      }}
    >
      <span style={{
        position: "absolute", left: on ? 22 : 2,
        width: 20, height: 20, borderRadius: "50%", background: "#fff",
        boxShadow: "0 1px 4px rgba(0,0,0,0.25)",
        transition: "left 0.2s",
      }} />
    </button>
  );
}

/* ─── Field component ────────────────────────────────────────── */
function Field({
  id, label, type = "text", value, onChange, autoComplete,
  suffix,
}: {
  id: string; label: string; type?: string; value: string;
  onChange: (v: string) => void; autoComplete?: string;
  suffix?: React.ReactNode;
}) {
  const [focused, setFocused] = useState(false);
  const raised = focused || value.length > 0;

  return (
    <div style={{ position: "relative" }}>
      <label
        htmlFor={id}
        style={{
          position: "absolute", left: 12,
          top: raised ? 6 : "50%",
          transform: raised ? "none" : "translateY(-50%)",
          fontSize: raised ? 10 : 14,
          fontWeight: raised ? 600 : 400,
          color: focused ? "#7c3aed" : "#9ca3af",
          pointerEvents: "none",
          transition: "all 0.15s",
          zIndex: 1,
        }}
      >
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        autoComplete={autoComplete}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          width: "100%", height: 52, padding: "18px 12px 4px",
          paddingRight: suffix ? 40 : 12,
          background: "#fff",
          border: `1.5px solid ${focused ? "#7c3aed" : "#e5e7eb"}`,
          borderRadius: 10,
          fontSize: 14, color: "#111",
          outline: "none",
          boxShadow: focused ? "0 0 0 3px rgba(124,58,237,0.1)" : "none",
          transition: "border-color 0.15s, box-shadow 0.15s",
          boxSizing: "border-box",
        }}
      />
      {suffix && (
        <div style={{
          position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
          color: "#9ca3af", cursor: "pointer", display: "flex", alignItems: "center",
        }}>
          {suffix}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   AUTH PAGE
═══════════════════════════════════════════════════════════════ */
export default function Auth() {
  const [searchParams, setSearchParams] = useSearchParams();
  const isRegister = searchParams.get("tab") === "register";

  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [name, setName]         = useState("");
  const [role, setRole]         = useState<Role>("developer");
  const [showPw, setShowPw]     = useState(false);
  const [remember, setRemember] = useState(true);

  const switchTab = (tab: "login" | "register") =>
    setSearchParams(tab === "register" ? { tab: "register" } : {});

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center",
      justifyContent: "center", padding: "2rem",
      background: "#f1f0f5",
      fontFamily: "'Inter', system-ui, sans-serif",
    }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.97, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        style={{
          width: "100%", maxWidth: 920,
          display: "flex", borderRadius: 20,
          boxShadow: "0 24px 80px rgba(0,0,0,0.15)",
          overflow: "hidden", background: "#fff",
          minHeight: 560,
        }}
      >
        {/* ── LEFT: Hero Panel ─────────────────────────────────── */}
        <div style={{
          position: "relative", width: "38%", flexShrink: 0,
          display: "flex", flexDirection: "column", justifyContent: "space-between",
          padding: "2rem", overflow: "hidden",
        }}>
          {/* Photo */}
          <img
            src={authHero}
            alt="DevOps engineer at work"
            style={{
              position: "absolute", inset: 0,
              width: "100%", height: "100%",
              objectFit: "cover", objectPosition: "center",
              zIndex: 0,
            }}
          />
          {/* Gradient overlay */}
          <div style={{
            position: "absolute", inset: 0, zIndex: 1,
            background: "linear-gradient(180deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.2) 45%, rgba(0,0,0,0.75) 100%)",
          }} />

          {/* Logo */}
          <div style={{ position: "relative", zIndex: 2, display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 8,
              background: "rgba(255,255,255,0.2)",
              backdropFilter: "blur(8px)",
              border: "1px solid rgba(255,255,255,0.3)",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#fff", fontWeight: 900, fontSize: 14,
            }}>D</div>
            <span style={{ color: "#fff", fontWeight: 800, fontSize: 15, letterSpacing: "-0.3px" }}>
              DeployFlow
            </span>
          </div>

          {/* Quote */}
          <div style={{ position: "relative", zIndex: 2 }}>
            <blockquote style={{
              color: "#fff", fontSize: "1.25rem", fontWeight: 800,
              lineHeight: 1.4, marginBottom: "1rem",
            }}>
              "Ship faster.<br />Break nothing.<br />Own the pipeline."
            </blockquote>
            <p style={{ color: "rgba(255,255,255,0.85)", fontWeight: 600, fontSize: 14 }}>
              Real-time Collaboration
            </p>
            <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 12, marginTop: 2 }}>
              4 roles · 1 pipeline · live multiplayer
            </p>
            <div style={{ display: "flex", gap: 8, marginTop: 16, flexWrap: "wrap" }}>
              {["4 Roles", "Live Updates", "CI/CD Sim"].map((s) => (
                <span key={s} style={{
                  fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.9)",
                  background: "rgba(255,255,255,0.15)",
                  backdropFilter: "blur(4px)",
                  border: "1px solid rgba(255,255,255,0.2)",
                  borderRadius: 999, padding: "4px 12px",
                }}>{s}</span>
              ))}
            </div>
          </div>
        </div>

        {/* ── RIGHT: Form Panel ────────────────────────────────── */}
        <div style={{
          flex: 1, display: "flex", flexDirection: "column",
          justifyContent: "center", padding: "3rem 3.5rem",
          overflowY: "auto",
        }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={isRegister ? "reg" : "login"}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.22 }}
            >
              {/* Heading */}
              <h1 style={{ fontSize: "1.6rem", fontWeight: 900, color: "#0f0f0f", marginBottom: 6 }}>
                {isRegister ? "Create your account" : "Welcome back to DeployFlow"}
              </h1>
              <p style={{ fontSize: 14, color: "#6b7280", marginBottom: 28 }}>
                {isRegister
                  ? "Pick your role and join a live CI/CD simulation."
                  : "Sign in to continue your pipeline simulation."}
              </p>

              {/* Form */}
              <form onSubmit={(e) => e.preventDefault()} style={{ display: "flex", flexDirection: "column", gap: 14 }}>

                {isRegister && (
                  <Field id="name" label="Full name" value={name} onChange={setName} autoComplete="name" />
                )}

                <Field id="email" label="Email" type="email" value={email} onChange={setEmail} autoComplete="email" />

                <Field
                  id="password"
                  label="Password"
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={setPassword}
                  autoComplete={isRegister ? "new-password" : "current-password"}
                  suffix={
                    <button type="button" onClick={() => setShowPw((p) => !p)}
                      style={{ background: "none", border: "none", cursor: "pointer", color: "#9ca3af", display: "flex" }}>
                      {showPw ? <EyeOff /> : <EyeOpen />}
                    </button>
                  }
                />

                {/* Role picker */}
                {isRegister && (
                  <div>
                    <p style={{ fontSize: 11, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>
                      Choose your role
                    </p>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                      {ROLES.map((r) => (
                        <button
                          key={r.value}
                          type="button"
                          onClick={() => setRole(r.value)}
                          style={{
                            display: "flex", alignItems: "center", gap: 8,
                            padding: "10px 14px", borderRadius: 10, fontSize: 13, fontWeight: 600,
                            cursor: "pointer", transition: "all 0.15s",
                            border: role === r.value ? `1.5px solid ${r.color}` : "1.5px solid #e5e7eb",
                            background: role === r.value ? `${r.color}12` : "#fff",
                            color: role === r.value ? r.color : "#6b7280",
                            boxShadow: role === r.value ? `0 0 0 3px ${r.color}18` : "none",
                          }}
                        >
                          <span style={{ fontSize: 16 }}>{r.icon}</span>
                          {r.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Forgot password + Remember (login) */}
                {!isRegister && (
                  <>
                    <div style={{ display: "flex", justifyContent: "flex-end", marginTop: -4 }}>
                      <button type="button" style={{
                        background: "none", border: "none", cursor: "pointer",
                        fontSize: 13, fontWeight: 600, color: "#7c3aed",
                      }}>
                        Forgot password?
                      </button>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <span style={{ fontSize: 14, color: "#6b7280" }}>Remember sign in details</span>
                      <Toggle on={remember} onToggle={() => setRemember((r) => !r)} />
                    </div>
                  </>
                )}

                {/* Primary CTA */}
                <button
                  type="submit"
                  style={{
                    width: "100%", padding: "14px 0", borderRadius: 12, border: "none",
                    background: "linear-gradient(135deg, #7c3aed, #6d28d9)",
                    color: "#fff", fontWeight: 700, fontSize: 15, cursor: "pointer",
                    boxShadow: "0 8px 24px rgba(124,58,237,0.3)",
                    transition: "opacity 0.15s, transform 0.1s",
                    letterSpacing: "0.01em",
                    marginTop: 4,
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.9")}
                  onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
                  onMouseDown={(e) => (e.currentTarget.style.transform = "scale(0.985)")}
                  onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
                >
                  {isRegister ? "Create Account →" : "Log in"}
                </button>



                {/* Switch */}
                <p style={{ textAlign: "center", fontSize: 14, color: "#6b7280", marginTop: 4 }}>
                  {isRegister ? (
                    <>Already have an account?{" "}
                      <button type="button" onClick={() => switchTab("login")}
                        style={{ background: "none", border: "none", cursor: "pointer", fontSize: 14, fontWeight: 700, color: "#7c3aed" }}>
                        Sign in
                      </button>
                    </>
                  ) : (
                    <>Don't have an account?{" "}
                      <button type="button" onClick={() => switchTab("register")}
                        style={{ background: "none", border: "none", cursor: "pointer", fontSize: 14, fontWeight: 700, color: "#7c3aed" }}>
                        Sign up
                      </button>
                    </>
                  )}
                </p>
              </form>
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
