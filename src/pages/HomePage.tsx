import { Link } from "react-router";
import { useState, useEffect, useRef } from "react";
import { Building2, Briefcase, GraduationCap } from "lucide-react";

import { getCompanies } from "../lib/api";
import type { Database } from "../lib/database.types";

import { AichaModel } from "./aichamodel";


type Company = Database['public']['Tables']['company']['Row'];

// ─── Countdown hook ─────────────────────────────────────────────
function useCountdown(targetDate: Date) {
  const calc = () => {
    const diff = targetDate.getTime() - Date.now();
    if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    return {
      days: Math.floor(diff / (1000 * 60 * 60 * 24)),
      hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((diff / (1000 * 60)) % 60),
      seconds: Math.floor((diff / 1000) % 60),
    };
  };
  const [time, setTime] = useState(calc);
  useEffect(() => {
    const id = setInterval(() => setTime(calc()), 1000);
    return () => clearInterval(id);
  }, []);
  return time;
}

// ─── Typing animation hook ──────────────────────────────────────
function useTypingEffect(text: string, speed = 38, startDelay = 800) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);
  useEffect(() => {
    let i = 0;
    const timeout = setTimeout(() => {
      const interval = setInterval(() => {
        setDisplayed(text.slice(0, i + 1));
        i++;
        if (i >= text.length) { clearInterval(interval); setDone(true); }
      }, speed);
      return () => clearInterval(interval);
    }, startDelay);
    return () => clearTimeout(timeout);
  }, [text, speed, startDelay]);
  return { displayed, done };
}

// ─── Scroll reveal hook ─────────────────────────────────────────
function useScrollReveal(threshold = 0.12) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect(); } },
      { threshold }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);
  return { ref, visible };
}

// ─── Parallax hook ──────────────────────────────────────────────
function useParallax() {
  const [scrollY, setScrollY] = useState(0);
  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => { setScrollY(window.scrollY); ticking = false; });
        ticking = true;
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return scrollY;
}

// ─── Count-up hook ──────────────────────────────────────────────
function useCountUp(target: number, duration = 1800, start = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime: number | null = null;
    const step = (ts: number) => {
      if (!startTime) startTime = ts;
      const progress = Math.min((ts - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [start, target, duration]);
  return count;
}

// ─── Mouse tracking hook ─────────────────────────────────────────
function useMouseGlow() {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ x: 0, y: 0, opacity: 0 });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      setPos({ x: e.clientX - rect.left, y: e.clientY - rect.top, opacity: 1 });
    };
    const onLeave = () => setPos(p => ({ ...p, opacity: 0 }));
    el.addEventListener("mousemove", onMove);
    el.addEventListener("mouseleave", onLeave);
    return () => { el.removeEventListener("mousemove", onMove); el.removeEventListener("mouseleave", onLeave); };
  }, []);

  return { ref, pos };
}

// ─── Reveal wrapper ─────────────────────────────────────────────
function Reveal({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const { ref, visible } = useScrollReveal();
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0px)" : "translateY(32px)",
        transition: `opacity 0.7s ease ${delay}ms, transform 0.7s ease ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

// ─── Animated stat ──────────────────────────────────────────────
function AnimatedStat({ target, suffix = "", isText = false, start }: { target: number; suffix?: string; isText?: boolean; start: boolean }) {
  const count = useCountUp(target, 1800, start);
  if (isText) return <span>All Levels</span>;
  return <span>{count}{suffix}</span>;
}

// ─── Animated divider ───────────────────────────────────────────


// ─── HomePage ───────────────────────────────────────────────────
export function HomePage() {
  const [companies, setCompanies] = useState<Company[]>([]);

  useEffect(() => {
    getCompanies()
      .then(data => setCompanies(data || []))
      .catch(console.error);
  }, []);

  const countdown = useCountdown(new Date("2026-05-16T09:00:00"));
  const { displayed, done } = useTypingEffect("Where exceptional talent meets industry excellence.");
  const scrollY = useParallax();
  const { ref: statsRef, visible: statsVisible } = useScrollReveal(0.2);

  return (
    <div style={{ backgroundColor: "#0d0f18", fontFamily: "'Jost', sans-serif", margin: 0, padding: 0 }}>

      {/* ─── Hero ───────────────────────────────────────────────── */}
      <section
        className="relative overflow-hidden"
        style={{ minHeight: "100vh", display: "flex", alignItems: "center", paddingTop: "100px", paddingBottom: "60px" }}
      >
        {/* Full-cover background image */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url('/src/assets/ignite.jpg')`,
            backgroundSize: "cover",
            backgroundPosition: "center center",
            backgroundRepeat: "no-repeat",
            backgroundAttachment: "fixed",
          }}
        />

        {/* Dark overlay */}
        <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(8,10,18,0.45) 0%, rgba(8,10,18,0.38) 50%, rgba(8,10,18,0.95) 100%)" }} />

        {/* Warm tint */}
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse at 30% 40%, rgba(234,90,22,0.07) 0%, transparent 60%)" }} />

        {/* Parallax orbs */}
        <div className="absolute inset-0 pointer-events-none will-change-transform" style={{ transform: `translateY(${scrollY * 0.25}px)` }}>
          <div className="absolute top-20 left-20 w-[500px] h-[500px] rounded-full" style={{ background: "radial-gradient(circle, rgba(234,90,22,0.06) 0%, transparent 70%)", filter: "blur(60px)" }} />
          <div className="absolute bottom-32 right-20 w-[400px] h-[400px] rounded-full" style={{ background: "radial-gradient(circle, rgba(255,255,255,0.04) 0%, transparent 70%)", filter: "blur(80px)" }} />
        </div>

        {/* Content */}
        <div className="container mx-auto px-6 text-center relative z-10 will-change-transform w-full" style={{ transform: `translateY(${scrollY * 0.06}px)` }}>
         <div className="inline-flex items-stretch mb-14" style={{ position: "relative" }}>

  {/* Gradient border */}
  <div style={{
    position: "absolute", inset: "-1px", borderRadius: "12px",
    background: "linear-gradient(135deg, rgba(234,90,22,0.55), rgba(255,255,255,0.07) 45%, rgba(234,90,22,0.2))",
  }} />

  {/* Inner surface */}
  <div style={{ position: "relative", zIndex: 1, display: "flex", alignItems: "stretch", background: "rgba(8,10,18,0.55)", backdropFilter: "blur(20px)", borderRadius: "12px", overflow: "hidden" }}>

    {/* Top shimmer line */}
    <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "1px", background: "linear-gradient(90deg, transparent, rgba(234,90,22,0.8) 25%, rgba(255,190,80,0.5) 50%, rgba(234,90,22,0.8) 75%, transparent)" }} />

    {/* Date */}
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "16px 26px 18px", gap: "3px", position: "relative" }}>
      <div style={{ position: "absolute", right: 0, top: "14px", bottom: "14px", width: "1px", background: "linear-gradient(to bottom, transparent, rgba(234,90,22,0.4), transparent)" }} />
      <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "38px", fontWeight: 600, color: "#ffffff", lineHeight: 1, letterSpacing: "-0.02em" }}>16</span>
      <span style={{ fontFamily: "'Jost', sans-serif", fontSize: "8px", fontWeight: 500, color: "#ea5a16", letterSpacing: "0.38em", textTransform: "uppercase" }}>May 2026</span>
    </div>

    {/* Venue */}
    <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", padding: "28px 30px 18px 26px", gap: "4px" }}>
      <span style={{ fontFamily: "'Jost', sans-serif", fontSize: "7.5px", fontWeight: 500, color: "rgba(234,90,22,0.55)", letterSpacing: "0.36em", textTransform: "uppercase" }}>Location</span>
      <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "15px", fontWeight: 600, fontStyle: "italic", color: "rgba(255,255,255,0.85)", letterSpacing: "0.05em" }}>Main Conference Hall</span>
    </div>
  </div>
</div>

          {/* Eyebrow */}
          <div className="mb-6">
            <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "13px", fontStyle: "italic", fontWeight: 300, color: "rgba(234,90,22,0.85)", letterSpacing: "0.3em", textTransform: "uppercase" }}>
              Career Fair 2026
            </span>
          </div>

          {/* Main heading */}
          <h1 className="mb-8 leading-tight" style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 300, fontSize: "clamp(3.5rem, 9vw, 7.5rem)", color: "#ffffff", letterSpacing: "-0.01em", lineHeight: 1.08 }}>
            <span className="block mb-2" style={{ color: "rgba(255,255,255,0.82)", fontSize: "clamp(1.6rem, 3.5vw, 2.8rem)", fontStyle: "italic", fontWeight: 300, letterSpacing: "0.04em" }}>
              Welcome to
            </span>
            <AichaModel />
          </h1>

          {/* Typing tagline */}
          <p className="mb-16 max-w-2xl mx-auto leading-relaxed" style={{ fontFamily: "'Jost', sans-serif", fontWeight: 200, fontSize: "clamp(1rem, 2vw, 1.2rem)", color: "rgba(255,255,255,0.58)", letterSpacing: "0.06em", minHeight: "2rem" }}>
            {displayed}
            {!done && <span className="inline-block w-0.5 h-5 ml-0.5 align-middle animate-pulse" style={{ background: "rgba(234,90,22,0.7)" }} />}
          </p>

          {/* Countdown */}
          <div className="flex flex-wrap justify-center gap-3 sm:gap-8 mb-20 px-4">
            {[
              { label: "Days", value: countdown.days },
              { label: "Hours", value: countdown.hours },
              { label: "Minutes", value: countdown.minutes },
              { label: "Seconds", value: countdown.seconds },
            ].map(({ label, value }) => (
              <div key={label} className="flex flex-col items-center">
                <div
                  className="relative overflow-hidden mb-4 group"
                  style={{
                    backdropFilter: "blur(20px)",
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "16px",
                    width: "clamp(64px, 10vw, 96px)",
                    height: "clamp(64px, 10vw, 112px)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
                  }}
                >
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ background: "linear-gradient(to bottom, rgba(255,255,255,0.06), transparent)" }} />
                  <span style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 300, fontSize: "clamp(1.6rem, 4vw, 3rem)", color: "#ffffff", letterSpacing: "-0.02em", lineHeight: 1 }}>
                    {String(value).padStart(2, "0")}
                  </span>
                </div>
                <span style={{ fontFamily: "'Jost', sans-serif", fontSize: "10px", fontWeight: 400, color: "rgba(255,255,255,0.45)", letterSpacing: "0.28em", textTransform: "uppercase" }}>
                  {label}
                </span>
              </div>
            ))}
          </div>

          {/* CTA button */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Link
              to="/register"
              className="group relative inline-flex items-center justify-center gap-4 overflow-hidden"
              style={{
                background: "#ea5a16",
                color: "#ffffff",
                padding: "16px 48px",
                borderRadius: "12px",
                fontFamily: "'Jost', sans-serif",
                fontSize: "12px",
                fontWeight: 400,
                letterSpacing: "0.22em",
                textTransform: "uppercase",
                textDecoration: "none",
                transition: "all 0.3s ease",
                boxShadow: "0 0 0 rgba(234,90,22,0)",
              }}
              onMouseEnter={e => (e.currentTarget.style.boxShadow = "0 0 32px rgba(234,90,22,0.35)")}
              onMouseLeave={e => (e.currentTarget.style.boxShadow = "0 0 0 rgba(234,90,22,0)")}
            >
              <span className="relative z-10 flex items-center gap-3">
                Register Now
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
                </svg>
              </span>
            </Link>
          </div>
        </div>

        {/* ─── Scroll indicator ─── */}
        <div
          className="absolute bottom-10 left-1/2"
          style={{
            transform: "translateX(-50%)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "8px",
            opacity: scrollY > 60 ? 0 : 1,
            transition: "opacity 0.5s ease",
          }}
        >
          <span style={{ fontFamily: "'Jost', sans-serif", fontSize: "9px", fontWeight: 300, color: "rgba(255,255,255,0.3)", letterSpacing: "0.35em", textTransform: "uppercase" }}>
            Scroll
          </span>
          <div
            style={{
              width: "1px",
              height: "40px",
              background: "linear-gradient(to bottom, rgba(255,255,255,0.4), transparent)",
              animation: "scrollPulse 2s ease-in-out infinite",
            }}
          />
          <style>{`
            @keyframes scrollPulse {
              0%, 100% { opacity: 0.4; transform: scaleY(1); }
              50% { opacity: 1; transform: scaleY(0.6); }
            }
          `}</style>
        </div>
      </section>

      {/* ─── Participating Companies ─────────────────────────────── */}
      <CompaniesSection companies={companies} />

      {/* ─── Stats ──────────────────────────────────────────────── */}
      <section className="relative py-32 overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, #0d0f18 0%, #161b2e 50%, #0d0f18 100%)" }} />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/4 w-[500px] h-[500px] rounded-full" style={{ background: "rgba(234,90,22,0.05)", filter: "blur(120px)" }} />
          <div className="absolute top-1/2 right-1/4 w-[500px] h-[500px] rounded-full" style={{ background: "rgba(234,90,22,0.03)", filter: "blur(120px)" }} />
        </div>
        <div className="container mx-auto px-6 relative z-10">
          <Reveal className="text-center mb-24">
            <span className="mb-8 block flex items-center justify-center gap-4" style={{ fontFamily: "'Jost', sans-serif", fontSize: "11px", fontWeight: 400, color: "rgba(234,90,22,0.72)", letterSpacing: "0.4em", textTransform: "uppercase" }}>
              <div className="h-px w-12" style={{ background: "rgba(255,255,255,0.1)" }} />
              Event Impact
              <div className="h-px w-12" style={{ background: "rgba(255,255,255,0.1)" }} />
            </span>
            <h2 className="mb-6" style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 300, fontSize: "clamp(2.4rem, 5.5vw, 4rem)", color: "#ffffff", letterSpacing: "-0.01em" }}>
              By The Numbers
            </h2>
            <p className="max-w-2xl mx-auto" style={{ fontFamily: "'Jost', sans-serif", fontWeight: 200, fontSize: "15px", color: "rgba(255,255,255,0.48)", lineHeight: 1.8, letterSpacing: "0.04em" }}>
              Building connections that shape the future of business and technology.
            </p>
          </Reveal>

          <div ref={statsRef} className="grid grid-cols-1 md:grid-cols-3 gap-16 max-w-6xl mx-auto">
            {[
              { icon: <Building2 className="w-12 h-12 mx-auto" style={{ color: "rgba(234,90,22,0.65)" }} />, target: 40, suffix: " +", label: "Companies", desc: "Industry leaders across technology, finance, and consulting.", isText: false },
              { icon: <Briefcase className="w-12 h-12 mx-auto" style={{ color: "rgba(234,90,22,0.48)" }} />, target: 300, suffix: " +", label: "Opportunities", desc: "Full-time positions and internships for driven professionals.", isText: false },
              { icon: <GraduationCap className="w-12 h-12 mx-auto" style={{ color: "rgba(234,90,22,0.38)" }} />, target: 500, suffix: " +", label: "Students", desc: "From undergraduates to PhD candidates and beyond.", isText: false },
            ].map(({ icon, target, suffix, label, desc, isText }, i) => (
              <div
                key={label}
                className="text-center group p-8 rounded-3xl transition-colors duration-500"
                style={{
                  border: "1px solid transparent",
                  opacity: statsVisible ? 1 : 0,
                  transform: statsVisible ? "translateY(0px)" : "translateY(40px)",
                  transition: `opacity 0.7s ease ${i * 150}ms, transform 0.7s ease ${i * 150}ms, background 0.3s, border-color 0.3s`,
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = "rgba(255,255,255,0.04)"; (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(255,255,255,0.08)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = "transparent"; (e.currentTarget as HTMLDivElement).style.borderColor = "transparent"; }}
              >
                <div className="mb-8 transform group-hover:scale-110 transition-transform duration-500">{icon}</div>
                <h3 className="mb-4" style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 300, fontSize: "clamp(3rem, 5vw, 4rem)", color: "#ffffff", letterSpacing: "-0.02em", lineHeight: 1 }}>
                  <AnimatedStat target={target} suffix={suffix} isText={isText} start={statsVisible} />
                </h3>
                <p className="mb-6" style={{ fontFamily: "'Jost', sans-serif", fontWeight: 400, fontSize: "11px", color: "rgba(255,255,255,0.75)", letterSpacing: "0.28em", textTransform: "uppercase" }}>
                  {label}
                </p>
                <div className="w-16 h-px mx-auto mb-6 opacity-50 group-hover:opacity-100 transition-opacity duration-500" style={{ background: "linear-gradient(to right, transparent, rgba(234,90,22,0.5), transparent)" }} />
                <p className="max-w-[220px] mx-auto" style={{ fontFamily: "'Jost', sans-serif", fontWeight: 200, fontSize: "14px", color: "rgba(255,255,255,0.45)", lineHeight: 1.75 }}>
                  {desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden" style={{ background: "#0d0f18", paddingTop: "96px", paddingBottom: "96px", margin: 0 }}>
        <div className="absolute top-0 left-0 right-0 h-px" style={{ background: "linear-gradient(to right, transparent, rgba(255,255,255,0.06), transparent)" }} />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/3 w-[600px] h-[600px] rounded-full" style={{ background: "rgba(234,90,22,0.04)", filter: "blur(150px)" }} />
          <div className="absolute bottom-0 right-1/3 w-[600px] h-[600px] rounded-full" style={{ background: "rgba(234,90,22,0.03)", filter: "blur(150px)" }} />
        </div>
        <div className="container mx-auto px-6 relative z-10">
          <Reveal>
            <div className="max-w-3xl mx-auto text-center p-16 rounded-3xl" style={{ background: "rgba(255,255,255,0.03)", backdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.08)", boxShadow: "0 8px 48px rgba(0,0,0,0.3)" }}>
              <span className="mb-6 block" style={{ fontFamily: "'Jost', sans-serif", fontSize: "11px", fontWeight: 400, color: "rgba(234,90,22,0.72)", letterSpacing: "0.4em", textTransform: "uppercase" }}>
                Join Us
              </span>
              <h2 className="mb-6" style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 300, fontSize: "clamp(2rem, 4.5vw, 3.2rem)", color: "#ffffff", letterSpacing: "-0.01em" }}>
                Ready to Start Your Journey?
              </h2>
              <p className="mb-12 max-w-xl mx-auto" style={{ fontFamily: "'Jost', sans-serif", fontWeight: 300, fontSize: "15px", color: "rgba(255,255,255,0.45)", lineHeight: 1.8, letterSpacing: "0.02em" }}>
                Register now to connect with top employers and take the next step in your career. Space is limited.
              </p>
              <div className="flex flex-col sm:flex-row gap-5 justify-center">
                <Link
                  to="/register"
                  className="group inline-flex items-center justify-center gap-4"
                  style={{ background: "#ea5a16", color: "#ffffff", padding: "16px 48px", borderRadius: "12px", fontFamily: "'Jost', sans-serif", fontSize: "12px", fontWeight: 400, letterSpacing: "0.22em", textTransform: "uppercase", textDecoration: "none", transition: "all 0.3s ease" }}
                  onMouseEnter={e => (e.currentTarget.style.boxShadow = "0 0 32px rgba(234,90,22,0.3)")}
                  onMouseLeave={e => (e.currentTarget.style.boxShadow = "none")}
                >
                  Register for Free
                  <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
                <Link
                  to="/talks"
                  className="inline-flex items-center justify-center gap-3"
                  style={{ background: "transparent", color: "rgba(255,255,255,0.65)", padding: "16px 48px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.15)", fontFamily: "'Jost', sans-serif", fontSize: "12px", fontWeight: 400, letterSpacing: "0.22em", textTransform: "uppercase", textDecoration: "none", transition: "all 0.3s ease" }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.3)"; e.currentTarget.style.background = "rgba(255,255,255,0.05)"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)"; e.currentTarget.style.background = "transparent"; }}
                >
                  View Schedule
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

    </div>
  );
}

// ─── Companies Section ────────────────────────────────────────
function CompaniesSection({ companies }: { companies: Company[] }) {
  const [query, setQuery] = useState("");
  const [activeOpp, setActiveOpp] = useState<string>("All");
  const [activeType, setActiveType] = useState<string>("All");

  const oppFilters = ["All", "Job", "Internship", "Both"];
  const typeFilters = ["All", "Company", "Startup"];

  const filtered = companies.filter(c => {
    const name = (c.name || "").toLowerCase();
    const desc = (c.description || "").toLowerCase();
    const opp  = (c.Opportunities || "").toLowerCase();
    const type = ((c as any).Type || "").toLowerCase();

    const matchesQuery = !query || name.includes(query.toLowerCase()) || desc.includes(query.toLowerCase());
    const matchesOpp =
      activeOpp === "All" ||
      (activeOpp === "Both" ? opp.includes("both") : opp.toLowerCase().includes(activeOpp.toLowerCase()));
    const matchesType = activeType === "All" || type.includes(activeType.toLowerCase());

    return matchesQuery && matchesOpp && matchesType;
  });

  const FilterBtn = ({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) => (
    <button
      onClick={onClick}
      style={{
        fontFamily: "'Jost', sans-serif",
        fontSize: "11px",
        fontWeight: 400,
        letterSpacing: "0.18em",
        textTransform: "uppercase",
        padding: "8px 20px",
        borderRadius: "999px",
        border: active ? "1px solid #ea5a16" : "1px solid rgba(255,255,255,0.1)",
        background: active ? "rgba(234,90,22,0.15)" : "rgba(255,255,255,0.03)",
        color: active ? "#ea5a16" : "rgba(255,255,255,0.5)",
        cursor: "pointer",
        transition: "all 0.2s ease",
        whiteSpace: "nowrap" as const,
      }}
      onMouseEnter={e => { if (!active) { (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,255,255,0.25)"; (e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.8)"; } }}
      onMouseLeave={e => { if (!active) { (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,255,255,0.1)"; (e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.5)"; } }}
    >
      {label}
    </button>
  );

  return (
    <section className="relative py-32" style={{ background: "#0d0f18" }}>
      <div className="absolute top-0 left-0 right-0 h-px" style={{ background: "linear-gradient(to right, transparent, rgba(234,90,22,0.25), transparent)" }} />

      <div className="container mx-auto px-6">
        <Reveal className="mb-16 text-center">
          <span className="mb-6 flex items-center justify-center gap-4" style={{ fontFamily: "'Jost', sans-serif", fontSize: "11px", fontWeight: 400, color: "rgba(234,90,22,0.7)", letterSpacing: "0.4em", textTransform: "uppercase" }}>
            <div className="h-px w-12" style={{ background: "rgba(234,90,22,0.25)" }} />
            Exclusive Partners
            <div className="h-px w-12" style={{ background: "rgba(234,90,22,0.25)" }} />
          </span>
          <h2 className="mb-4" style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 300, fontSize: "clamp(2.2rem, 5vw, 3.8rem)", color: "#ffffff", letterSpacing: "-0.01em" }}>
            Participating Companies
          </h2>
          <p style={{ fontFamily: "'Jost', sans-serif", fontWeight: 300, fontSize: "15px", color: "rgba(255,255,255,0.42)", maxWidth: "36rem", margin: "0 auto", lineHeight: 1.8 }}>
            {companies.length} industry leaders ready to connect with exceptional talent.
          </p>
        </Reveal>

        {/* Search + Filters */}
        <div className="max-w-5xl mx-auto mb-10 space-y-5">
          <div className="relative">
            <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
              <svg className="w-4 h-4" style={{ color: "rgba(255,255,255,0.3)" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search companies by name or description…"
              value={query}
              onChange={e => setQuery(e.target.value)}
              style={{ width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "14px", padding: "16px 20px 16px 44px", fontFamily: "'Jost', sans-serif", fontSize: "14px", fontWeight: 300, color: "#ffffff", outline: "none", letterSpacing: "0.02em", transition: "border-color 0.2s ease, background 0.2s ease" }}
              onFocus={e => { e.currentTarget.style.borderColor = "rgba(234,90,22,0.5)"; e.currentTarget.style.background = "rgba(255,255,255,0.06)"; }}
              onBlur={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; e.currentTarget.style.background = "rgba(255,255,255,0.04)"; }}
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="absolute inset-y-0 right-5 flex items-center"
                style={{ color: "rgba(255,255,255,0.3)", background: "none", border: "none", cursor: "pointer" }}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-6 items-start">
            <div className="flex flex-wrap items-center gap-2">
              <span style={{ fontFamily: "'Jost', sans-serif", fontSize: "10px", fontWeight: 400, color: "rgba(255,255,255,0.28)", letterSpacing: "0.25em", textTransform: "uppercase", marginRight: "4px" }}>Opportunity</span>
              {oppFilters.map(f => <FilterBtn key={f} label={f} active={activeOpp === f} onClick={() => setActiveOpp(f)} />)}
            </div>
            <div className="hidden md:block w-px h-8 self-center" style={{ background: "rgba(255,255,255,0.08)" }} />
            <div className="flex flex-wrap items-center gap-2">
              <span style={{ fontFamily: "'Jost', sans-serif", fontSize: "10px", fontWeight: 400, color: "rgba(255,255,255,0.28)", letterSpacing: "0.25em", textTransform: "uppercase", marginRight: "4px" }}>Type</span>
              {typeFilters.map(f => <FilterBtn key={f} label={f} active={activeType === f} onClick={() => setActiveType(f)} />)}
            </div>
          </div>

          <div style={{ fontFamily: "'Jost', sans-serif", fontSize: "12px", fontWeight: 300, color: "rgba(255,255,255,0.28)", letterSpacing: "0.06em" }}>
            {filtered.length === companies.length ? `Showing all ${companies.length} companies` : `${filtered.length} of ${companies.length} companies match`}
          </div>
        </div>

        {/* Company list */}
        <div className="max-w-5xl mx-auto space-y-4">
          {filtered.length > 0 ? (
            filtered.map((company, index) => (
              <Reveal key={company.id} delay={Math.min(index * 40, 400)}>
                <CompanyCard company={company} index={index} />
              </Reveal>
            ))
          ) : (
            <div className="text-center py-24">
              <div className="mb-4 text-5xl">🔍</div>
              <p style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 300, fontSize: "1.6rem", color: "rgba(255,255,255,0.35)" }}>No companies found</p>
              <p style={{ fontFamily: "'Jost', sans-serif", fontWeight: 300, fontSize: "13px", color: "rgba(255,255,255,0.22)", marginTop: "8px" }}>Try adjusting your search or filters</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

// ─── Company Card ──────────────────────────────────────────────
function CompanyCard({ company, index }: { company: Company; index: number }) {
  const { ref, pos } = useMouseGlow();

  const opportunityColors: Record<string, { color: string; background: string }> = {
    Job:        { color: "#ea5a16",               background: "rgba(234,90,22,0.10)" },
    Internship: { color: "rgba(255,255,255,0.7)",  background: "rgba(255,255,255,0.07)" },
    Both:       { color: "rgba(234,90,22,0.85)",  background: "rgba(234,90,22,0.08)" },
  };

  const typeStyleMap: Record<string, { color: string; background: string; border: string }> = {
    Startup: { color: "#f59e0b",               background: "rgba(245,158,11,0.10)", border: "rgba(245,158,11,0.28)" },
    Company: { color: "rgba(139,168,255,0.9)", background: "rgba(99,120,255,0.08)",  border: "rgba(99,120,255,0.22)" },
  };

  const opportunitiesList = company.Opportunities ? company.Opportunities.split(',').map(s => s.trim()) : ["Both"];
  const yearsList = company.Accepted_Year_Groups ? company.Accepted_Year_Groups.split(',').map(s => s.trim()) : ["All Years"];
  const companyType: string = (company as any).Type || "";
  const typeS = typeStyleMap[companyType] ?? typeStyleMap["Company"];

  return (
    <div
      ref={ref}
      className="group relative overflow-hidden rounded-2xl transition-all duration-500"
      style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
      onMouseEnter={e => { const el = e.currentTarget as HTMLDivElement; el.style.background = "rgba(255,255,255,0.055)"; el.style.borderColor = "rgba(255,255,255,0.12)"; el.style.transform = "translateY(-2px)"; el.style.boxShadow = "0 12px 40px rgba(0,0,0,0.35)"; }}
      onMouseLeave={e => { const el = e.currentTarget as HTMLDivElement; el.style.background = "rgba(255,255,255,0.03)"; el.style.borderColor = "rgba(255,255,255,0.07)"; el.style.transform = "translateY(0)"; el.style.boxShadow = "none"; }}
    >
      {/* Mouse-follow glow */}
      <div
        style={{
          position: "absolute",
          width: "200px",
          height: "200px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(234,90,22,0.07) 0%, transparent 70%)",
          pointerEvents: "none",
          transform: `translate(${pos.x - 100}px, ${pos.y - 100}px)`,
          opacity: pos.opacity,
          transition: "opacity 0.3s ease",
        }}
      />

      {/* Left accent bar */}
      <div className="absolute top-0 left-0 bottom-0 w-[3px] opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ background: "linear-gradient(to bottom, #ea5a16, rgba(234,90,22,0.1))" }} />

      <div className="flex flex-col md:flex-row items-start md:items-center gap-8 p-8 md:px-10">
        {/* Index */}
        <div className="hidden md:block w-14 text-right select-none flex-shrink-0" style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 300, fontSize: "2.6rem", color: "rgba(255,255,255,0.06)", letterSpacing: "-0.04em", lineHeight: 1 }}>
          {String(index + 1).padStart(2, "0")}
        </div>

        {/* Logo */}
        <div className="relative flex-shrink-0">
          <div className="absolute inset-0 opacity-0 group-hover:opacity-50 transition-opacity duration-500 rounded-xl" style={{ background: "rgba(234,90,22,0.2)", filter: "blur(16px)" }} />
          <div className="relative w-16 h-16 flex items-center justify-center rounded-xl group-hover:scale-105 transition-transform duration-500" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}>
            <span style={{ fontFamily: "'Jost', sans-serif", fontWeight: 400, fontSize: "1.05rem", color: "#ffffff", letterSpacing: "0.04em" }}>
              {company.Logo_Abbreviation || 'CP'}
            </span>
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-3 mb-2">
            <h3
              className="truncate transition-colors duration-300 group-hover:text-[#ea5a16]"
              title={company.name || ""}
              style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 400, fontSize: "clamp(1.2rem, 2vw, 1.6rem)", color: "#ffffff", letterSpacing: "-0.01em", lineHeight: 1.2 }}
            >
              {company.name}
            </h3>
            {companyType && (
              <span style={{ fontFamily: "'Jost', sans-serif", fontSize: "10px", fontWeight: 500, letterSpacing: "0.2em", textTransform: "uppercase", color: typeS.color, background: typeS.background, border: `1px solid ${typeS.border}`, padding: "3px 10px", borderRadius: "999px", flexShrink: 0 }}>
                {companyType}
              </span>
            )}
          </div>

          <p className="mb-4 line-clamp-2" title={company.description || ""} style={{ fontFamily: "'Jost', sans-serif", fontWeight: 300, fontSize: "13.5px", color: "rgba(255,255,255,0.4)", lineHeight: 1.75, letterSpacing: "0.01em" }}>
            {company.description}
          </p>

          <div className="flex flex-wrap items-center gap-5">
            <div className="flex items-center gap-2">
              <Briefcase className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "rgba(255,255,255,0.22)" }} />
              <div className="flex flex-wrap gap-1.5">
                {opportunitiesList.map((opp) => {
                  const s = opportunityColors[opp] ?? opportunityColors['Both'];
                  return (
                    <span key={opp} style={{ fontFamily: "'Jost', sans-serif", fontSize: "10px", fontWeight: 400, letterSpacing: "0.18em", textTransform: "uppercase", color: s.color, background: s.background, padding: "4px 10px", borderRadius: "6px" }}>
                      {opp}
                    </span>
                  );
                })}
              </div>
            </div>

            <div className="h-3.5 w-px hidden md:block" style={{ background: "rgba(255,255,255,0.08)" }} />

            <div className="flex items-center gap-2">
              <GraduationCap className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "rgba(255,255,255,0.22)" }} />
              <span style={{ fontFamily: "'Jost', sans-serif", fontWeight: 300, fontSize: "13px", color: "rgba(255,255,255,0.38)", letterSpacing: "0.01em" }}>
                {yearsList.length > 1 ? "Multiple Levels" : yearsList[0]}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}