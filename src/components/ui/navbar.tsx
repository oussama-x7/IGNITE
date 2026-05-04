// components/Navbar.tsx
import { Link } from "react-router";
import { useEffect, useState } from "react";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        transition: "all 0.3s ease",
        background: scrolled ? "rgba(13,15,24,0.75)" : "transparent",
        backdropFilter: scrolled ? "blur(14px)" : "none",
        borderBottom: scrolled ? "1px solid rgba(255,255,255,0.06)" : "1px solid transparent",
      }}
    >
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "14px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {/* Logo */}
        <div
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: "20px",
            color: "#fff",
            letterSpacing: "0.08em",
          }}
        >
          IGNITE
        </div>

        {/* Links */}
        <nav
          style={{
            display: "flex",
            alignItems: "center",
            gap: "28px",
          }}
        >
          {[
            { label: "Home", to: "/" },
            { label: "Companies", to: "#companies" },
            { label: "Schedule", to: "/talks" },
          ].map((item) => (
            <Link
              key={item.label}
              to={item.to}
              style={{
                fontFamily: "'Jost', sans-serif",
                fontSize: "12px",
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.65)",
                textDecoration: "none",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.color = "#ea5a16")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.color = "rgba(255,255,255,0.65)")
              }
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* CTA */}
        <Link
          to="/register"
          style={{
            background: "#ea5a16",
            color: "#fff",
            padding: "10px 18px",
            borderRadius: "10px",
            fontFamily: "'Jost', sans-serif",
            fontSize: "11px",
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            textDecoration: "none",
            transition: "all 0.3s ease",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.boxShadow =
              "0 0 24px rgba(234,90,22,0.35)")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.boxShadow = "none")
          }
        >
          Register
        </Link>
      </div>
    </header>
  );
}