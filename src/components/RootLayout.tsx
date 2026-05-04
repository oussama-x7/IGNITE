import { Outlet, Link, useLocation } from "react-router";
import { Flame, Home, Users, Calendar, Shield, User, Menu, X, MessageSquare } from "lucide-react";
import { useState, useEffect } from "react";

export function RootLayout() {
  const location = useLocation();
  const [profileLink, setProfileLink] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("currentUser");
    if (stored) {
      try {
        const user = JSON.parse(stored);
        setProfileLink(`/profile/${user.id}`);
      } catch {
        setProfileLink(null);
      }
    }
  }, [location]);

  // Close mobile nav on route change
  useEffect(() => setMobileOpen(false), [location]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  const navItems = [
    { to: "/", label: "Home", icon: <Home className="w-5 h-5" /> },
    { to: "/register", label: "Register", icon: <Users className="w-5 h-5" /> },
    { to: "/talks", label: "Talks", icon: <Calendar className="w-5 h-5" /> },
    { to: "/feedback", label: "Feedback", icon: <MessageSquare className="w-5 h-5" /> },
    ...(profileLink
      ? [{ to: profileLink, label: "Profile", icon: <User className="w-5 h-5" /> }]
      : []),
    { to: "/admin", label: "Admin", icon: <Shield className="w-5 h-5" /> },
  ];

  const isHome = location.pathname === "/";
  const isTransparent = isHome && !scrolled;

  return (
    <div className="min-h-screen flex flex-col font-dm" style={{ backgroundColor: "#f7f5f2" }}>
      {/* ─── Prestigious Floating Header ──────────────────────────── */}
      <header 
        className="fixed left-0 right-0 z-50 transition-all duration-700 ease-out flex justify-center px-4 md:px-8"
        style={{ top: scrolled ? "0.75rem" : "1.5rem" }}
      >
        <div 
          className="w-full max-w-7xl mx-auto px-6 py-2.5 md:py-3 rounded-full flex items-center justify-between transition-all duration-700 ease-out"
          style={{
            backgroundColor: isTransparent ? "rgba(255, 255, 255, 0.03)" : "rgba(255, 255, 255, 0.85)",
            backdropFilter: "blur(24px) saturate(1.8)",
            border: isTransparent ? "1px solid rgba(255, 255, 255, 0.1)" : "1px solid rgba(26, 31, 46, 0.06)",
            boxShadow: isTransparent ? "none" : "0 20px 40px -15px rgba(26, 31, 46, 0.05)",
          }}
        >
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative flex items-center justify-center w-9 h-9 rounded-[10px] bg-[#1a1f2e] group-hover:shadow-[0_0_20px_rgba(234,90,22,0.25)] transition-all duration-500">
              <Flame className="w-4 h-4 text-primary group-hover:scale-110 transition-transform duration-500" />
            </div>
            <div className="hidden sm:block">
              <span 
                className="text-lg font-eagle tracking-[0.15em] uppercase transition-colors duration-500"
                style={{ color: isTransparent ? "#ffffff" : "#1a1f2e" }}
              >
                Ignite
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-10">
            {navItems.map(({ to, label }) => {
              const active = isActive(to);
              const textColor = isTransparent ? "#ffffff" : "#1a1f2e";
              const mutedColor = isTransparent ? "rgba(255, 255, 255, 0.6)" : "rgba(26, 31, 46, 0.5)";
              return (
                <Link
                  key={to}
                  to={to}
                  className="relative group py-2"
                >
                  <span 
                    className="font-dm text-xs uppercase tracking-[0.25em] transition-colors duration-300"
                    style={{ color: active ? textColor : mutedColor, fontWeight: active ? 500 : 400 }}
                  >
                    {label}
                  </span>
                  <span 
                    className="absolute bottom-0 left-1/2 -translate-x-1/2 h-px bg-primary transition-all duration-500 ease-out"
                    style={{ width: active ? "100%" : "0%", opacity: active ? 1 : 0 }}
                  />
                  <span 
                    className="absolute bottom-0 left-1/2 -translate-x-1/2 h-px bg-primary/50 transition-all duration-500 ease-out opacity-0 group-hover:opacity-100 group-hover:w-full"
                    style={{ width: "0%" }}
                  />
                </Link>
              )
            })}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden lg:block">
            <Link
              to="/register"
              className="relative inline-flex items-center justify-center px-7 py-2.5 rounded-[10px] group overflow-hidden"
              style={{ backgroundColor: isTransparent ? "rgba(255,255,255,0.1)" : "#1a1f2e" }}
            >
              <span className="absolute inset-0 w-full h-full transition-all duration-300 ease-out group-hover:bg-primary" />
              <span 
                className="relative font-eagle text-[11px] tracking-[0.2em] uppercase transition-colors duration-300"
                style={{ color: "#ffffff" }}
              >
                Register Now
              </span>
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            className="lg:hidden p-2 rounded-lg transition-colors"
            style={{ color: isTransparent ? "#ffffff" : "#1a1f2e" }}
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Dropdown */}
        <div 
          className="absolute top-full left-4 right-4 mt-4 lg:hidden rounded-2xl overflow-hidden transition-all duration-500 ease-out"
          style={{
            maxHeight: mobileOpen ? "500px" : "0px",
            opacity: mobileOpen ? 1 : 0,
            pointerEvents: mobileOpen ? "auto" : "none",
            backgroundColor: "rgba(255, 255, 255, 0.95)",
            backdropFilter: "blur(24px) saturate(1.8)",
            border: "1px solid rgba(26, 31, 46, 0.06)",
            boxShadow: "0 20px 40px -15px rgba(26, 31, 46, 0.1)",
          }}
        >
          <div className="p-6 flex flex-col gap-4">
            {navItems.map(({ to, label, icon }) => {
              const active = isActive(to);
              return (
                <Link
                  key={to}
                  to={to}
                  className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 ${
                    active ? "bg-[#1a1f2e]/5 text-[#1a1f2e]" : "text-[#1a1f2e]/60 hover:bg-[#1a1f2e]/5 hover:text-[#1a1f2e]"
                  }`}
                  onClick={() => setMobileOpen(false)}
                >
                  <div className={active ? "text-primary" : ""}>{icon}</div>
                  <span className="font-dm text-sm uppercase tracking-[0.2em] font-medium">{label}</span>
                </Link>
              )
            })}
            <div className="h-px w-full bg-[#1a1f2e]/10 my-2" />
            <Link
              to="/register"
              className="flex items-center justify-center w-full py-4 rounded-xl bg-[#1a1f2e] text-white font-eagle text-xs uppercase tracking-[0.2em] hover:bg-primary transition-colors duration-300"
              onClick={() => setMobileOpen(false)}
            >
              Register Now
            </Link>
          </div>
        </div>
      </header>

      {/* ─── Page Content ─────────────────────────────────────────── */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* ─── Footer ───────────────────────────────────────────────── */}
      <footer className="relative border-t border-[#1a1f2e]/10 py-16 mt-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a1f2e] via-[#2F3952] to-[#1a1f2e]"></div>
        <div className="absolute inset-0">
          <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-primary/10 rounded-full blur-[100px]"></div>
          <div className="absolute top-0 right-1/4 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[100px]"></div>
        </div>

        <div className="container mx-auto px-8 relative z-10">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-4 mb-6">
              <div className="bg-gradient-to-br from-[#2F3952] to-[#1a1f2e] p-3 rounded-xl shadow-[0_0_20px_rgba(26,31,46,0.5)]">
                <Flame className="w-5 h-5 text-primary" />
              </div>
              <div className="text-left">
                <span className="text-xl font-eagle text-white block tracking-[0.15em] uppercase">
                  Ignite
                </span>
                <span className="text-[10px] text-white/40 font-dm font-light tracking-[0.25em] uppercase">
                  Career Fair 2026
                </span>
              </div>
            </div>
            <p className="text-white/40 text-sm max-w-md mx-auto leading-relaxed font-dm font-light">
              Connecting exceptional talent with industry leaders.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-x-8 gap-y-4 mb-12">
            {navItems.map(({ to, label }) => (
              <Link 
                key={to} 
                to={to} 
                className="text-white/40 hover:text-white text-[10px] font-dm font-light tracking-[0.2em] uppercase transition-colors"
              >
                {label}
              </Link>
            ))}
          </div>

          <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mb-8"></div>

          <div className="text-center">
            <p className="text-white/30 text-xs font-dm font-light tracking-[0.1em] uppercase">
              &copy; 2026 Ignite Career Fair. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}