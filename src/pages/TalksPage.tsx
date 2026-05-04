import { Clock, User, Calendar, CheckCircle, Circle, PlayCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { getTalks } from "../lib/api";
import type { Database } from "../lib/database.types";

type Talk = Database['public']['Tables']['talks']['Row'];

export function TalksPage() {
  const [talks, setTalks] = useState<Talk[]>([]);

  useEffect(() => {
    getTalks()
      .then(data => setTalks(data || []))
      .catch(console.error);
  }, []);

  const upcomingTalks = talks.filter(t => t.status?.toLowerCase() === 'upcoming');
  const ongoingTalks  = talks.filter(t => t.status?.toLowerCase() === 'live' || t.status?.toLowerCase() === 'ongoing');
  const finishedTalks = talks.filter(t => t.status?.toLowerCase() === 'completed' || t.status?.toLowerCase() === 'finished');

  return (
    <div style={{ backgroundColor: "#0d0f18", fontFamily: "'Jost', sans-serif", minHeight: "100vh" }}>

      {/* ─── Hero ─────────────────────────────────────────────── */}
      <section className="relative overflow-hidden" style={{ paddingTop: "160px", paddingBottom: "120px" }}>
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-20 w-[600px] h-[600px] rounded-full" style={{ background: "rgba(234,90,22,0.05)", filter: "blur(140px)" }} />
          <div className="absolute bottom-20 right-20 w-[400px] h-[400px] rounded-full" style={{ background: "rgba(234,90,22,0.03)", filter: "blur(120px)" }} />
        </div>

        <div className="container mx-auto px-6 relative z-10 text-center">
          <div className="inline-flex items-center gap-4 mb-14" style={{ background: "rgba(255,255,255,0.04)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.1)", padding: "10px 28px", borderRadius: "999px" }}>
            <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "#ea5a16", boxShadow: "0 0 8px rgba(234,90,22,0.8)" }} />
            <span style={{ fontFamily: "'Jost', sans-serif", fontSize: "11px", fontWeight: 400, color: "rgba(255,255,255,0.7)", letterSpacing: "0.25em", textTransform: "uppercase" }}>May 2, 2026</span>
          </div>

          <div className="mb-6">
            <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "13px", fontStyle: "italic", fontWeight: 300, color: "rgba(234,90,22,0.85)", letterSpacing: "0.3em", textTransform: "uppercase" }}>
              Event Schedule
            </span>
          </div>

          <h1 className="mb-8" style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 300, fontSize: "clamp(3rem, 8vw, 6rem)", color: "#ffffff", letterSpacing: "-0.01em", lineHeight: 1.08 }}>
            Speaker Lineup
          </h1>

          <p style={{ fontFamily: "'Jost', sans-serif", fontWeight: 200, fontSize: "clamp(1rem, 2vw, 1.15rem)", color: "rgba(255,255,255,0.45)", letterSpacing: "0.06em", maxWidth: "480px", margin: "0 auto", lineHeight: 1.8 }}>
            Hear from industry pioneers, innovators, and thought leaders shaping the future of technology.
          </p>
        </div>

        <div className="absolute bottom-0 left-0 right-0" style={{ height: "80px", background: "linear-gradient(to top, #0d0f18, transparent)" }} />
      </section>

      {/* ─── Live Now ─────────────────────────────────────────── */}
      {ongoingTalks.length > 0 && (
        <section className="container mx-auto px-6 pb-20">
          <div className="mb-12">
            <div className="flex items-center gap-4 mb-3">
              <div className="w-2.5 h-2.5 rounded-full animate-pulse" style={{ background: "#ea5a16", boxShadow: "0 0 8px rgba(234,90,22,0.6)" }} />
              <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 300, fontSize: "clamp(1.8rem, 4vw, 2.8rem)", color: "#ffffff", letterSpacing: "-0.01em" }}>
                Happening Now
              </h2>
            </div>
            <p className="ml-6" style={{ fontFamily: "'Jost', sans-serif", fontWeight: 200, fontSize: "13px", color: "rgba(255,255,255,0.35)" }}>Join the live discussion</p>
          </div>
          <div className="space-y-5">
            {ongoingTalks.map(talk => <TalkCard key={talk.id} talk={talk} isLive />)}
          </div>
        </section>
      )}

      {/* ─── Upcoming ──────────────────────────────────────────── */}
      <section className="container mx-auto px-6 py-20">
        <div className="mb-12">
          <div className="flex items-center gap-4 mb-3">
            <div className="h-px w-12" style={{ background: "rgba(234,90,22,0.3)" }} />
            <span style={{ fontFamily: "'Jost', sans-serif", fontSize: "11px", fontWeight: 400, color: "rgba(234,90,22,0.7)", letterSpacing: "0.4em", textTransform: "uppercase" }}>Upcoming Sessions</span>
          </div>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 300, fontSize: "clamp(1.8rem, 4vw, 2.8rem)", color: "#ffffff", letterSpacing: "-0.01em" }}>
            Next on Stage
          </h2>
          <p className="mt-2" style={{ fontFamily: "'Jost', sans-serif", fontWeight: 200, fontSize: "13px", color: "rgba(255,255,255,0.35)" }}>Curated talks across all tracks</p>
        </div>
        <div className="space-y-5">
          {upcomingTalks.map(talk => <TalkCard key={talk.id} talk={talk} />)}
        </div>
      </section>

      {/* ─── Completed ────────────────────────────────────────── */}
      {finishedTalks.length > 0 && (
        <section className="container mx-auto px-6 py-20">
          <div className="mb-12">
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 300, fontSize: "clamp(1.8rem, 4vw, 2.8rem)", color: "rgba(255,255,255,0.3)", letterSpacing: "-0.01em" }}>
              Completed
            </h2>
            <p className="mt-2" style={{ fontFamily: "'Jost', sans-serif", fontWeight: 200, fontSize: "13px", color: "rgba(255,255,255,0.22)" }}>Recorded sessions available on demand</p>
          </div>
          <div className="space-y-5 opacity-40">
            {finishedTalks.map(talk => <TalkCard key={talk.id} talk={talk} />)}
          </div>
        </section>
      )}
    </div>
  );
}

function TalkCard({ talk, isLive = false }: { talk: Talk; isLive?: boolean }) {
  const statusKey =
    talk.status?.toLowerCase() === 'live' || talk.status?.toLowerCase() === 'ongoing' ? 'ongoing' :
    talk.status?.toLowerCase() === 'completed' || talk.status?.toLowerCase() === 'finished' ? 'finished' : 'upcoming';

  const badgeStyle = {
    upcoming: { color: "rgba(255,255,255,0.5)",  borderColor: "rgba(255,255,255,0.12)", background: "transparent" },
    ongoing:  { color: "#ea5a16",                borderColor: "rgba(234,90,22,0.4)",    background: "rgba(234,90,22,0.08)" },
    finished: { color: "rgba(255,255,255,0.25)", borderColor: "rgba(255,255,255,0.08)", background: "transparent" },
  }[statusKey];

  const badgeLabel = { upcoming: "Upcoming", ongoing: "Live Now", finished: "Completed" }[statusKey];
  const BadgeIcon  = { upcoming: Circle, ongoing: PlayCircle, finished: CheckCircle }[statusKey];

  return (
    <div
      className="group relative overflow-hidden rounded-2xl transition-all duration-500"
      style={{
        background: "rgba(255,255,255,0.03)",
        border: isLive ? "1px solid rgba(234,90,22,0.2)" : "1px solid rgba(255,255,255,0.07)",
        boxShadow: isLive ? "0 4px 24px rgba(234,90,22,0.06)" : "none",
      }}
      onMouseEnter={e => { const el = e.currentTarget as HTMLDivElement; el.style.background = "rgba(255,255,255,0.055)"; el.style.borderColor = isLive ? "rgba(234,90,22,0.35)" : "rgba(255,255,255,0.12)"; el.style.transform = "translateY(-2px)"; el.style.boxShadow = "0 12px 40px rgba(0,0,0,0.35)"; }}
      onMouseLeave={e => { const el = e.currentTarget as HTMLDivElement; el.style.background = "rgba(255,255,255,0.03)"; el.style.borderColor = isLive ? "rgba(234,90,22,0.2)" : "rgba(255,255,255,0.07)"; el.style.transform = "translateY(0)"; el.style.boxShadow = isLive ? "0 4px 24px rgba(234,90,22,0.06)" : "none"; }}
    >
      <div className="absolute top-0 left-0 bottom-0 w-[3px] opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{ background: "linear-gradient(to bottom, #ea5a16, rgba(234,90,22,0.1))" }} />

      <div className="grid grid-cols-1 lg:grid-cols-5">
        {/* Left panel */}
        <div
          className="lg:col-span-1 p-6 flex flex-col items-center justify-center relative overflow-hidden"
          style={{ background: isLive ? "linear-gradient(135deg, #ea5a16 0%, rgba(234,90,22,0.7) 100%)" : "linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)" }}
        >
          <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(255,255,255,0.08), transparent)" }} />
          {isLive && <div className="absolute top-3 right-3 w-2 h-2 bg-white rounded-full animate-pulse" />}
          <div className="relative text-center">
            <Calendar className="w-7 h-7 mx-auto mb-3" style={{ color: isLive ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.4)" }} />
            <p style={{ fontFamily: "'Jost', sans-serif", fontSize: "10px", fontWeight: 400, color: isLive ? "rgba(255,255,255,0.85)" : "rgba(255,255,255,0.45)", letterSpacing: "0.3em", textTransform: "uppercase" }}>{talk.time || "TBA"}</p>
            <p className="mt-1" style={{ fontFamily: "'Jost', sans-serif", fontSize: "10px", color: isLive ? "rgba(255,255,255,0.55)" : "rgba(255,255,255,0.25)" }}>45 min</p>
          </div>
        </div>

        {/* Right content */}
        <div className="lg:col-span-4 p-7 flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between gap-4 mb-4">
              <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 400, fontSize: "clamp(1.1rem, 2vw, 1.5rem)", color: "#ffffff", letterSpacing: "-0.01em", lineHeight: 1.3, flex: 1 }}>
                {talk.talk_tilte}
              </h3>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border whitespace-nowrap flex-shrink-0"
                style={{ ...badgeStyle, fontFamily: "'Jost', sans-serif", fontSize: "10px", fontWeight: 400, letterSpacing: "0.2em", textTransform: "uppercase" }}>
                <BadgeIcon className="w-3.5 h-3.5" />
                <span>{badgeLabel}</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-5 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: "rgba(255,255,255,0.06)" }}>
                  <User className="w-3 h-3" style={{ color: "rgba(255,255,255,0.3)" }} />
                </div>
                <p style={{ fontFamily: "'Jost', sans-serif", fontSize: "12px", fontWeight: 300, color: "rgba(255,255,255,0.55)" }}>{talk.speaker_name}</p>
              </div>
              <div className="hidden md:block w-px h-4" style={{ background: "rgba(255,255,255,0.08)" }} />
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: "rgba(255,255,255,0.06)" }}>
                  <Clock className="w-3 h-3" style={{ color: "rgba(255,255,255,0.3)" }} />
                </div>
                <p style={{ fontFamily: "'Jost', sans-serif", fontSize: "12px", fontWeight: 300, color: "rgba(255,255,255,0.55)" }}>{talk.location || "TBA"}</p>
              </div>
            </div>

            <p style={{ fontFamily: "'Jost', sans-serif", fontSize: "13.5px", fontWeight: 200, color: "rgba(255,255,255,0.35)", lineHeight: 1.75 }}>
              Join {talk.speaker_name} for an insightful session on {talk.talk_tilte}.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}