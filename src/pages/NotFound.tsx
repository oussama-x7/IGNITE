import { Link } from "react-router";
import { Home, ArrowLeft } from "lucide-react";

export function NotFound() {
  return (
    <div style={{ backgroundColor: "#0d0f18", fontFamily: "'Jost', sans-serif", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
      {/* Background orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/3 left-1/4 w-[500px] h-[500px] rounded-full" style={{ background: "rgba(234,90,22,0.04)", filter: "blur(150px)" }} />
        <div className="absolute bottom-1/3 right-1/4 w-[400px] h-[400px] rounded-full" style={{ background: "rgba(255,255,255,0.02)", filter: "blur(120px)" }} />
      </div>

      <div className="relative z-10 text-center max-w-lg">
        <div className="mb-14">
          <h1 className="mb-8" style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 200, fontSize: "clamp(7rem, 20vw, 12rem)", lineHeight: 1, letterSpacing: "-0.04em", background: "linear-gradient(135deg, #ea5a16 0%, rgba(234,90,22,0.4) 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            404
          </h1>
          <h2 className="mb-4" style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 300, fontSize: "clamp(1.5rem, 4vw, 2.5rem)", color: "#ffffff", letterSpacing: "-0.01em" }}>
            Page Not Found
          </h2>
          <p style={{ fontFamily: "'Jost', sans-serif", fontWeight: 200, fontSize: "15px", color: "rgba(255,255,255,0.4)", lineHeight: 1.8, letterSpacing: "0.02em" }}>
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-3"
            style={{ background: "#ea5a16", color: "#ffffff", padding: "14px 40px", borderRadius: "12px", fontFamily: "'Jost', sans-serif", fontSize: "12px", fontWeight: 400, letterSpacing: "0.22em", textTransform: "uppercase", textDecoration: "none", transition: "all 0.3s ease" }}
            onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.boxShadow = "0 0 32px rgba(234,90,22,0.35)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.boxShadow = "none"; }}
          >
            <Home className="w-4 h-4" />
            Go Home
          </Link>
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center justify-center gap-3"
            style={{ background: "transparent", color: "rgba(255,255,255,0.6)", padding: "14px 40px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.12)", fontFamily: "'Jost', sans-serif", fontSize: "12px", fontWeight: 400, letterSpacing: "0.22em", textTransform: "uppercase", cursor: "pointer", transition: "all 0.3s ease" }}
            onMouseEnter={e => { const el = e.currentTarget as HTMLButtonElement; el.style.borderColor = "rgba(255,255,255,0.25)"; el.style.background = "rgba(255,255,255,0.04)"; el.style.color = "rgba(255,255,255,0.85)"; }}
            onMouseLeave={e => { const el = e.currentTarget as HTMLButtonElement; el.style.borderColor = "rgba(255,255,255,0.12)"; el.style.background = "transparent"; el.style.color = "rgba(255,255,255,0.6)"; }}
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
}