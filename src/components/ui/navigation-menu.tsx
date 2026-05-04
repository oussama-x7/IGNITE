import { Link, useLocation } from "react-router";
import { useState, useEffect, useRef } from "react";

// ─── Elegant Animated Navbar ────────────────────────────────────
export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeHover, setActiveHover] = useState<string | null>(null);
  const location = useLocation();
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => setMenuOpen(false), [location.pathname]);

  const links = [
    { to: "/", label: "Home" },
    { to: "/companies", label: "Companies" },
    { to: "/talks", label: "Schedule" },
    { to: "/register", label: "Register", accent: true },
  ];

  const isActive = (to: string) =>
    to === "/" ? location.pathname === "/" : location.pathname.startsWith(to);

  return (
    <nav
      ref={navRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        transition: "background 0.5s ease, backdrop-filter 0.5s ease, border-color 0.5s ease, box-shadow 0.5s ease",
        background: scrolled
          ? "rgba(13,15,24,0.85)"
          : "rgba(13,15,24,0.0)",
        backdropFilter: scrolled ? "blur(20px) saturate(180%)" : "blur(0px)",
        borderBottom: scrolled
          ? "1px solid rgba(255,255,255,0.07)"
          : "1px solid transparent",
        boxShadow: scrolled
          ? "0 8px 40px rgba(0,0,0,0.4)"
          : "none",
      }}
    >
      {/* Top accent line — only when scrolled */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "1px",
          background: "linear-gradient(to right, transparent, rgba(234,90,22,0.6), transparent)",
          opacity: scrolled ? 1 : 0,
          transition: "opacity 0.5s ease",
        }}
      />

      <div
        className="container mx-auto"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: scrolled ? "16px 24px" : "24px 24px",
          transition: "padding 0.4s ease",
        }}
      >
        {/* ─── Wordmark ─── */}
        <Link
          to="/"
          style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "12px" }}
        >
          {/* Animated logo mark */}
          <div
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "8px",
              background: "#ea5a16",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              boxShadow: "0 0 20px rgba(234,90,22,0.35)",
              transition: "box-shadow 0.3s ease, transform 0.3s ease",
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLDivElement).style.boxShadow = "0 0 32px rgba(234,90,22,0.55)";
              (e.currentTarget as HTMLDivElement).style.transform = "rotate(5deg) scale(1.05)";
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLDivElement).style.boxShadow = "0 0 20px rgba(234,90,22,0.35)";
              (e.currentTarget as HTMLDivElement).style.transform = "rotate(0deg) scale(1)";
            }}
          >
            <span style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 600, fontSize: "16px", color: "#fff", lineHeight: 1 }}>
              A
            </span>
          </div>

          {/* Name */}
          <div style={{ display: "flex", flexDirection: "column", lineHeight: 1 }}>
            <span style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontWeight: 400,
              fontSize: "19px",
              color: "#ffffff",
              letterSpacing: "0.02em",
            }}>
              AICHA
            </span>
            <span style={{
              fontFamily: "'Jost', sans-serif",
              fontWeight: 300,
              fontSize: "9px",
              color: "rgba(255,255,255,0.38)",
              letterSpacing: "0.35em",
              textTransform: "uppercase",
              marginTop: "1px",
            }}>
              Career Fair 2026
            </span>
          </div>
        </Link>

        {/* ─── Desktop Nav Links ─── */}
        <div
          className="hidden md:flex"
          style={{ alignItems: "center", gap: "4px" }}
        >
          {links.map(({ to, label, accent }) => {
            const active = isActive(to);
            const hovered = activeHover === label;

            if (accent) {
              return (
                <Link
                  key={to}
                  to={to}
                  style={{
                    fontFamily: "'Jost', sans-serif",
                    fontWeight: 400,
                    fontSize: "11px",
                    letterSpacing: "0.22em",
                    textTransform: "uppercase",
                    textDecoration: "none",
                    padding: "10px 24px",
                    borderRadius: "10px",
                    background: hovered ? "#c94a10" : "#ea5a16",
                    color: "#ffffff",
                    marginLeft: "12px",
                    transition: "all 0.25s ease",
                    boxShadow: hovered
                      ? "0 0 28px rgba(234,90,22,0.45)"
                      : "0 0 0 rgba(234,90,22,0)",
                  }}
                  onMouseEnter={() => setActiveHover(label)}
                  onMouseLeave={() => setActiveHover(null)}
                >
                  {label}
                </Link>
              );
            }

            return (
              <Link
                key={to}
                to={to}
                style={{ position: "relative", textDecoration: "none", padding: "10px 16px" }}
                onMouseEnter={() => setActiveHover(label)}
                onMouseLeave={() => setActiveHover(null)}
              >
                <span
                  style={{
                    fontFamily: "'Jost', sans-serif",
                    fontWeight: 300,
                    fontSize: "12px",
                    letterSpacing: "0.18em",
                    textTransform: "uppercase",
                    color: active
                      ? "#ffffff"
                      : hovered
                      ? "rgba(255,255,255,0.88)"
                      : "rgba(255,255,255,0.50)",
                    transition: "color 0.25s ease",
                  }}
                >
                  {label}
                </span>
                {/* Underline indicator */}
                <span
                  style={{
                    position: "absolute",
                    bottom: "4px",
                    left: "50%",
                    transform: "translateX(-50%)",
                    height: "1px",
                    width: active ? "20px" : hovered ? "14px" : "0px",
                    background: active ? "#ea5a16" : "rgba(255,255,255,0.4)",
                    borderRadius: "999px",
                    transition: "width 0.3s ease, background 0.3s ease",
                  }}
                />
              </Link>
            );
          })}
        </div>

        {/* ─── Mobile Hamburger ─── */}
        <button
          className="flex md:hidden"
          onClick={() => setMenuOpen(v => !v)}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: "8px",
            display: "flex",
            flexDirection: "column",
            gap: "5px",
            alignItems: "flex-end",
          }}
          aria-label="Toggle menu"
        >
          {[1, 2, 3].map(i => (
            <span
              key={i}
              style={{
                display: "block",
                height: "1px",
                background: "#ffffff",
                borderRadius: "999px",
                transition: "all 0.35s cubic-bezier(0.4, 0, 0.2, 1)",
                width: menuOpen
                  ? i === 2 ? "0px" : "22px"
                  : i === 2 ? "14px" : "22px",
                opacity: menuOpen && i === 2 ? 0 : 1,
                transform: menuOpen
                  ? i === 1 ? "translateY(6px) rotate(45deg)"
                  : i === 3 ? "translateY(-6px) rotate(-45deg)"
                  : "none"
                  : "none",
              }}
            />
          ))}
        </button>
      </div>

      {/* ─── Mobile Menu ─── */}
      <div
        style={{
          overflow: "hidden",
          maxHeight: menuOpen ? "320px" : "0px",
          transition: "max-height 0.45s cubic-bezier(0.4, 0, 0.2, 1)",
          borderTop: menuOpen ? "1px solid rgba(255,255,255,0.06)" : "1px solid transparent",
          background: "rgba(13,15,24,0.95)",
          backdropFilter: "blur(24px)",
        }}
      >
        <div style={{ padding: "8px 24px 24px" }}>
          {links.map(({ to, label, accent }, i) => {
            const active = isActive(to);
            return (
              <Link
                key={to}
                to={to}
                style={{
                  display: "block",
                  textDecoration: "none",
                  padding: "14px 0",
                  borderBottom: i < links.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none",
                  fontFamily: "'Jost', sans-serif",
                  fontWeight: 300,
                  fontSize: "13px",
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  color: accent
                    ? "#ea5a16"
                    : active
                    ? "#ffffff"
                    : "rgba(255,255,255,0.55)",
                  transition: "color 0.2s ease",
                  opacity: menuOpen ? 1 : 0,
                  transform: menuOpen ? "translateX(0)" : "translateX(-12px)",
                  transitionDelay: menuOpen ? `${i * 60}ms` : "0ms",
                }}
              >
                {label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}