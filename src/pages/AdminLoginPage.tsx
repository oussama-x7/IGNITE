import { useState } from "react";
import { useNavigate } from "react-router";
import { supabase } from "../lib/supabase";
import { Mail, Lock } from "lucide-react";

export function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setError(error.message);
    else navigate("/admin");
  };

  const inputStyle = {
    width: "100%",
    padding: "14px 20px",
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "12px",
    color: "#ffffff",
    fontFamily: "'Jost', sans-serif",
    fontSize: "14px",
    fontWeight: 300,
    outline: "none",
    letterSpacing: "0.02em",
    transition: "border-color 0.2s ease, background 0.2s ease",
    boxSizing: "border-box" as const,
  };

  const labelStyle = {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginBottom: "12px",
    fontFamily: "'Jost', sans-serif",
    fontSize: "12px",
    fontWeight: 400,
    color: "rgba(255,255,255,0.6)",
    letterSpacing: "0.08em",
    textTransform: "uppercase" as const,
  };

  return (
    <div style={{ backgroundColor: "#0d0f18", fontFamily: "'Jost', sans-serif", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 24px" }}>
      {/* Background orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/3 left-1/3 w-[500px] h-[500px] rounded-full" style={{ background: "rgba(234,90,22,0.04)", filter: "blur(150px)" }} />
        <div className="absolute bottom-1/3 right-1/3 w-[400px] h-[400px] rounded-full" style={{ background: "rgba(234,90,22,0.03)", filter: "blur(120px)" }} />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="h-px w-10" style={{ background: "rgba(234,90,22,0.3)" }} />
            <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "13px", fontStyle: "italic", fontWeight: 300, color: "rgba(234,90,22,0.85)", letterSpacing: "0.3em", textTransform: "uppercase" }}>
              Administration
            </span>
            <div className="h-px w-10" style={{ background: "rgba(234,90,22,0.3)" }} />
          </div>
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 300, fontSize: "clamp(2rem, 5vw, 3rem)", color: "#ffffff", letterSpacing: "-0.01em" }}>
            Admin Login
          </h1>
        </div>

        {/* Card */}
        <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "24px", padding: "48px", backdropFilter: "blur(12px)", boxShadow: "0 8px 48px rgba(0,0,0,0.3)" }}>
          {error && (
            <div style={{ padding: "12px 18px", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: "10px", fontFamily: "'Jost', sans-serif", fontSize: "13px", color: "rgba(239,68,68,0.9)", textAlign: "center", marginBottom: "24px" }}>
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            <div>
              <div style={labelStyle}>
                <div style={{ background: "rgba(234,90,22,0.12)", padding: "6px", borderRadius: "8px" }}>
                  <Mail className="w-4 h-4" style={{ color: "#ea5a16" }} />
                </div>
                Email Address
              </div>
              <input
                type="email" value={email} onChange={e => setEmail(e.target.value)} required
                placeholder="admin@example.com" style={inputStyle}
                onFocus={e => { e.currentTarget.style.borderColor = "rgba(234,90,22,0.5)"; e.currentTarget.style.background = "rgba(255,255,255,0.06)"; }}
                onBlur={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; e.currentTarget.style.background = "rgba(255,255,255,0.04)"; }}
              />
            </div>

            <div>
              <div style={labelStyle}>
                <div style={{ background: "rgba(234,90,22,0.12)", padding: "6px", borderRadius: "8px" }}>
                  <Lock className="w-4 h-4" style={{ color: "#ea5a16" }} />
                </div>
                Password
              </div>
              <input
                type="password" value={password} onChange={e => setPassword(e.target.value)} required
                placeholder="••••••••" style={inputStyle}
                onFocus={e => { e.currentTarget.style.borderColor = "rgba(234,90,22,0.5)"; e.currentTarget.style.background = "rgba(255,255,255,0.06)"; }}
                onBlur={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; e.currentTarget.style.background = "rgba(255,255,255,0.04)"; }}
              />
            </div>

            <button
              type="submit"
              style={{ background: "#ea5a16", color: "#ffffff", padding: "15px 0", borderRadius: "12px", fontFamily: "'Jost', sans-serif", fontSize: "12px", fontWeight: 400, letterSpacing: "0.22em", textTransform: "uppercase", border: "none", cursor: "pointer", transition: "all 0.3s ease", marginTop: "8px", width: "100%" }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 0 32px rgba(234,90,22,0.35)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.boxShadow = "none"; }}
            >
              Login
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}