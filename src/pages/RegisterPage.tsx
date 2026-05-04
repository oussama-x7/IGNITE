import { useState } from "react";
import { useNavigate } from "react-router";
import { User, Mail, GraduationCap, School } from "lucide-react";
import confetti from "canvas-confetti";
import { createUser } from "../lib/api";

export function RegisterPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: "", email: "", year: "", school: "" });
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const user = await createUser({
        name: formData.name,
        email: formData.email,
        year_of_study: formData.year,
        school: formData.school,
      });

      const duration = 2000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 100 };
      const interval: any = setInterval(() => {
        const timeLeft = animationEnd - Date.now();
        if (timeLeft <= 0) return clearInterval(interval);
        const particleCount = 50 * (timeLeft / duration);
        confetti({ ...defaults, particleCount, origin: { x: Math.random(), y: Math.random() - 0.2 } });
      }, 250);

      localStorage.setItem('currentUser', JSON.stringify({ ...formData, id: user.id.toString() }));
      setTimeout(() => navigate(`/profile/${user.id}`), 1500);
    } catch (err: any) {
      setError('Error registering user: ' + (err.message || err));
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
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
  };

  const labelIconStyle = {
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
    <div style={{ backgroundColor: "#0d0f18", fontFamily: "'Jost', sans-serif", minHeight: "100vh", paddingTop: "120px", paddingBottom: "80px" }}>
      {/* Background orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full" style={{ background: "rgba(234,90,22,0.04)", filter: "blur(150px)" }} />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full" style={{ background: "rgba(234,90,22,0.03)", filter: "blur(120px)" }} />
      </div>

      <div className="container mx-auto px-6 max-w-2xl relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="h-px w-12" style={{ background: "rgba(234,90,22,0.3)" }} />
            <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "13px", fontStyle: "italic", fontWeight: 300, color: "rgba(234,90,22,0.85)", letterSpacing: "0.3em", textTransform: "uppercase" }}>
              Registration
            </span>
            <div className="h-px w-12" style={{ background: "rgba(234,90,22,0.3)" }} />
          </div>
          <h1 className="mb-4" style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 300, fontSize: "clamp(2.5rem, 6vw, 4.5rem)", color: "#ffffff", letterSpacing: "-0.01em", lineHeight: 1.08 }}>
            Join Ignite 2026
          </h1>
          <p style={{ fontFamily: "'Jost', sans-serif", fontWeight: 200, fontSize: "15px", color: "rgba(255,255,255,0.45)", lineHeight: 1.8, letterSpacing: "0.02em" }}>
            Complete your registration to connect with industry leaders.
          </p>
        </div>

        {/* Form card */}
        <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "24px", padding: "48px 56px", backdropFilter: "blur(12px)", boxShadow: "0 8px 48px rgba(0,0,0,0.3)" }}>
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "28px" }}>

            <div>
              <div style={labelIconStyle}>
                <div style={{ background: "rgba(234,90,22,0.12)", padding: "6px", borderRadius: "8px" }}>
                  <User className="w-4 h-4" style={{ color: "#ea5a16" }} />
                </div>
                Full Name
              </div>
              <input
                type="text" name="name" value={formData.name} onChange={handleChange} required
                placeholder="Enter your full name"
                style={inputStyle}
                onFocus={e => { e.currentTarget.style.borderColor = "rgba(234,90,22,0.5)"; e.currentTarget.style.background = "rgba(255,255,255,0.06)"; }}
                onBlur={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; e.currentTarget.style.background = "rgba(255,255,255,0.04)"; }}
              />
            </div>

            <div>
              <div style={labelIconStyle}>
                <div style={{ background: "rgba(234,90,22,0.12)", padding: "6px", borderRadius: "8px" }}>
                  <Mail className="w-4 h-4" style={{ color: "#ea5a16" }} />
                </div>
                Email Address
              </div>
              <input
                type="email" name="email" value={formData.email} onChange={handleChange} required
                placeholder="your.email@university.edu"
                style={inputStyle}
                onFocus={e => { e.currentTarget.style.borderColor = "rgba(234,90,22,0.5)"; e.currentTarget.style.background = "rgba(255,255,255,0.06)"; }}
                onBlur={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; e.currentTarget.style.background = "rgba(255,255,255,0.04)"; }}
              />
            </div>

            <div>
              <div style={labelIconStyle}>
                <div style={{ background: "rgba(234,90,22,0.12)", padding: "6px", borderRadius: "8px" }}>
                  <GraduationCap className="w-4 h-4" style={{ color: "#ea5a16" }} />
                </div>
                Year of Study
              </div>
              <select
                name="year" value={formData.year} onChange={handleChange} required
                style={{ ...inputStyle, cursor: "pointer" }}
                onFocus={e => { e.currentTarget.style.borderColor = "rgba(234,90,22,0.5)"; e.currentTarget.style.background = "rgba(255,255,255,0.06)"; }}
                onBlur={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; e.currentTarget.style.background = "rgba(255,255,255,0.04)"; }}
              >
                <option value="" style={{ background: "#1a1f2e" }}>Select your year</option>
                {["Year 1", "Year 2", "Year 3", "Year 4", "Masters", "PhD"].map(y => (
                  <option key={y} value={y} style={{ background: "#1a1f2e" }}>{y}</option>
                ))}
              </select>
            </div>

            <div>
              <div style={labelIconStyle}>
                <div style={{ background: "rgba(234,90,22,0.12)", padding: "6px", borderRadius: "8px" }}>
                  <School className="w-4 h-4" style={{ color: "#ea5a16" }} />
                </div>
                School / University
              </div>
              <input
                type="text" name="school" value={formData.school} onChange={handleChange} required
                placeholder="Enter your institution name"
                style={inputStyle}
                onFocus={e => { e.currentTarget.style.borderColor = "rgba(234,90,22,0.5)"; e.currentTarget.style.background = "rgba(255,255,255,0.06)"; }}
                onBlur={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; e.currentTarget.style.background = "rgba(255,255,255,0.04)"; }}
              />
            </div>

            {error && (
              <div style={{ padding: "14px 20px", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: "12px", fontFamily: "'Jost', sans-serif", fontSize: "13px", color: "rgba(239,68,68,0.9)", textAlign: "center" }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              className="group relative inline-flex items-center justify-center gap-3 overflow-hidden"
              style={{ background: "#ea5a16", color: "#ffffff", padding: "16px 48px", borderRadius: "12px", fontFamily: "'Jost', sans-serif", fontSize: "12px", fontWeight: 400, letterSpacing: "0.22em", textTransform: "uppercase", border: "none", cursor: "pointer", transition: "all 0.3s ease", marginTop: "8px" }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 0 32px rgba(234,90,22,0.35)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.boxShadow = "none"; }}
            >
              Complete Registration
              <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}