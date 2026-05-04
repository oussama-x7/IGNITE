import { useState } from "react";
import { MapPin, Search, Info } from "lucide-react";

interface BoothLocation {
  id: string;
  company: string;
  boothNumber: string;
  x: number;
  y: number;
  color: string;
}

const BOOTH_LOCATIONS: BoothLocation[] = [
  { id: "1", company: "TechCorp Solutions",     boothNumber: "A1", x: 10, y: 15, color: "#ea5a16" },
  { id: "2", company: "DataVision Analytics",   boothNumber: "A2", x: 30, y: 15, color: "#c44d0e" },
  { id: "3", company: "FinTech Innovations",    boothNumber: "A3", x: 50, y: 15, color: "#a03e0a" },
  { id: "4", company: "GreenEnergy Systems",    boothNumber: "B1", x: 10, y: 45, color: "#ea5a16" },
  { id: "5", company: "CyberShield Security",   boothNumber: "B2", x: 30, y: 45, color: "#c44d0e" },
  { id: "6", company: "HealthTech Labs",         boothNumber: "B3", x: 50, y: 45, color: "#a03e0a" },
];

export function MapPage() {
  const [selectedBooth, setSelectedBooth] = useState<BoothLocation | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredBooths = BOOTH_LOCATIONS.filter(b =>
    b.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.boothNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{ backgroundColor: "#0d0f18", fontFamily: "'Jost', sans-serif", minHeight: "100vh" }}>
      {/* Background orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] rounded-full" style={{ background: "rgba(234,90,22,0.04)", filter: "blur(150px)" }} />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] rounded-full" style={{ background: "rgba(234,90,22,0.03)", filter: "blur(130px)" }} />
      </div>

      <div className="container mx-auto px-6 relative z-10" style={{ paddingTop: "120px", paddingBottom: "80px" }}>
        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="h-px w-12" style={{ background: "rgba(234,90,22,0.3)" }} />
            <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "13px", fontStyle: "italic", fontWeight: 300, color: "rgba(234,90,22,0.85)", letterSpacing: "0.3em", textTransform: "uppercase" }}>
              Venue
            </span>
            <div className="h-px w-12" style={{ background: "rgba(234,90,22,0.3)" }} />
          </div>
          <h1 className="mb-4" style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 300, fontSize: "clamp(2.5rem, 6vw, 5rem)", color: "#ffffff", letterSpacing: "-0.01em", lineHeight: 1.08 }}>
            Event Map
          </h1>
          <p style={{ fontFamily: "'Jost', sans-serif", fontWeight: 200, fontSize: "15px", color: "rgba(255,255,255,0.4)", lineHeight: 1.8 }}>
            Find company booths and navigate the event venue
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Map */}
          <div className="lg:col-span-2">
            <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "20px", padding: "32px", marginBottom: "24px" }}>
              <div style={{ background: "rgba(255,255,255,0.02)", border: "1px dashed rgba(255,255,255,0.08)", borderRadius: "16px", padding: "40px", minHeight: "500px", position: "relative" }}>
                {/* Main Hall label */}
                <div style={{ position: "absolute", top: "16px", left: "16px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "10px", padding: "6px 14px", fontFamily: "'Jost', sans-serif", fontSize: "12px", fontWeight: 400, color: "rgba(255,255,255,0.6)", letterSpacing: "0.1em" }}>
                  Main Hall
                </div>

                {/* Entrance */}
                <div style={{ position: "absolute", bottom: "16px", left: "50%", transform: "translateX(-50%)", background: "#ea5a16", borderRadius: "10px", padding: "8px 24px", fontFamily: "'Jost', sans-serif", fontSize: "12px", fontWeight: 400, color: "#ffffff", letterSpacing: "0.15em", textTransform: "uppercase" }}>
                  Main Entrance
                </div>

                {/* Legend */}
                <div style={{ position: "absolute", top: "16px", right: "16px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "10px", padding: "12px 16px" }}>
                  {[["#ea5a16","Section A"],["#c44d0e","Section B"],["#a03e0a","Section C"]].map(([color, label]) => (
                    <div key={label} className="flex items-center gap-2 mb-1 last:mb-0">
                      <div style={{ width: "10px", height: "10px", borderRadius: "4px", background: color }} />
                      <span style={{ fontFamily: "'Jost', sans-serif", fontSize: "11px", color: "rgba(255,255,255,0.5)" }}>{label}</span>
                    </div>
                  ))}
                </div>

                {/* Booths */}
                <div style={{ position: "relative", width: "100%", height: "100%" }}>
                  {filteredBooths.map(booth => (
                    <div
                      key={booth.id}
                      style={{ position: "absolute", left: `${booth.x}%`, top: `${booth.y}%`, transform: "translate(-50%, -50%)", cursor: "pointer" }}
                      onClick={() => setSelectedBooth(booth)}
                      className="group"
                    >
                      <div
                        style={{
                          width: "88px", height: "88px", borderRadius: "14px",
                          background: booth.color,
                          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                          transition: "all 0.2s ease",
                          transform: selectedBooth?.id === booth.id ? "scale(1.12)" : "scale(1)",
                          opacity: selectedBooth && selectedBooth.id !== booth.id ? 0.45 : 1,
                          boxShadow: selectedBooth?.id === booth.id ? `0 8px 24px ${booth.color}55` : "none",
                        }}
                      >
                        <MapPin className="w-5 h-5 mb-1" style={{ color: "#ffffff" }} />
                        <span style={{ fontFamily: "'Jost', sans-serif", fontSize: "11px", fontWeight: 600, color: "#ffffff", letterSpacing: "0.08em" }}>{booth.boothNumber}</span>
                      </div>
                      <div style={{ position: "absolute", top: "100%", left: "50%", transform: "translateX(-50%)", marginTop: "8px", background: "rgba(13,15,24,0.95)", border: "1px solid rgba(255,255,255,0.1)", padding: "6px 12px", borderRadius: "8px", fontFamily: "'Jost', sans-serif", fontSize: "11px", color: "rgba(255,255,255,0.7)", whiteSpace: "nowrap", pointerEvents: "none", opacity: 0, transition: "opacity 0.2s" }}
                        className="group-hover:opacity-100">
                        {booth.company}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Info notice */}
            <div style={{ background: "rgba(234,90,22,0.06)", border: "1px solid rgba(234,90,22,0.15)", borderRadius: "14px", padding: "20px 24px", display: "flex", alignItems: "flex-start", gap: "14px" }}>
              <div style={{ background: "rgba(234,90,22,0.15)", padding: "8px", borderRadius: "10px", flexShrink: 0 }}>
                <Info className="w-4 h-4" style={{ color: "#ea5a16" }} />
              </div>
              <div>
                <p style={{ fontFamily: "'Jost', sans-serif", fontSize: "13px", fontWeight: 500, color: "rgba(255,255,255,0.8)", marginBottom: "4px" }}>Interactive Map</p>
                <p style={{ fontFamily: "'Jost', sans-serif", fontSize: "13px", fontWeight: 200, color: "rgba(255,255,255,0.45)", lineHeight: 1.6 }}>
                  Click on any booth to view company details. Use the search box to find specific companies.
                </p>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            {/* Search panel */}
            <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "20px", padding: "28px" }}>
              <h3 className="mb-5" style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 300, fontSize: "1.6rem", color: "#ffffff" }}>Find a Booth</h3>

              <div style={{ position: "relative", marginBottom: "24px" }}>
                <Search className="absolute" style={{ left: "14px", top: "50%", transform: "translateY(-50%)", width: "14px", height: "14px", color: "rgba(255,255,255,0.3)" }} />
                <input
                  type="text" placeholder="Search companies..." value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  style={{ width: "100%", paddingLeft: "40px", paddingRight: "16px", paddingTop: "12px", paddingBottom: "12px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", fontFamily: "'Jost', sans-serif", fontSize: "13px", color: "#ffffff", outline: "none", boxSizing: "border-box" }}
                  onFocus={e => { e.currentTarget.style.borderColor = "rgba(234,90,22,0.5)"; e.currentTarget.style.background = "rgba(255,255,255,0.06)"; }}
                  onBlur={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; e.currentTarget.style.background = "rgba(255,255,255,0.04)"; }}
                />
              </div>

              {selectedBooth && (
                <div style={{ marginBottom: "20px", padding: "20px", background: "rgba(234,90,22,0.08)", border: "1px solid rgba(234,90,22,0.2)", borderRadius: "14px" }}>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: "14px", marginBottom: "16px" }}>
                    <div style={{ width: "44px", height: "44px", borderRadius: "12px", background: selectedBooth.color, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <MapPin className="w-5 h-5" style={{ color: "#ffffff" }} />
                    </div>
                    <div>
                      <h4 style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 400, fontSize: "1.15rem", color: "#ffffff", marginBottom: "2px" }}>{selectedBooth.company}</h4>
                      <p style={{ fontFamily: "'Jost', sans-serif", fontSize: "12px", fontWeight: 300, color: "rgba(255,255,255,0.5)" }}>Booth {selectedBooth.boothNumber}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedBooth(null)}
                    style={{ width: "100%", padding: "10px", background: "#ea5a16", border: "none", borderRadius: "10px", fontFamily: "'Jost', sans-serif", fontSize: "12px", fontWeight: 400, color: "#ffffff", cursor: "pointer", letterSpacing: "0.1em", textTransform: "uppercase", transition: "all 0.2s" }}
                  >
                    Clear Selection
                  </button>
                </div>
              )}

              <p style={{ fontFamily: "'Jost', sans-serif", fontSize: "11px", fontWeight: 400, color: "rgba(255,255,255,0.3)", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: "12px" }}>All Booths</p>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {filteredBooths.map(booth => (
                  <button
                    key={booth.id}
                    onClick={() => setSelectedBooth(booth)}
                    style={{
                      width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", borderRadius: "12px", border: "1px solid",
                      borderColor: selectedBooth?.id === booth.id ? "rgba(234,90,22,0.35)" : "rgba(255,255,255,0.06)",
                      background: selectedBooth?.id === booth.id ? "rgba(234,90,22,0.1)" : "rgba(255,255,255,0.02)",
                      cursor: "pointer", transition: "all 0.2s",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: booth.color, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <span style={{ fontFamily: "'Jost', sans-serif", fontSize: "10px", fontWeight: 700, color: "#ffffff" }}>{booth.boothNumber}</span>
                      </div>
                      <span style={{ fontFamily: "'Jost', sans-serif", fontSize: "13px", fontWeight: 300, color: "rgba(255,255,255,0.75)" }}>{booth.company}</span>
                    </div>
                    <MapPin className="w-3.5 h-3.5" style={{ color: "rgba(255,255,255,0.25)" }} />
                  </button>
                ))}
              </div>
            </div>

            {/* Event info */}
            <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "20px", padding: "28px" }}>
              <h4 className="mb-5" style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 300, fontSize: "1.4rem", color: "#ffffff" }}>Event Information</h4>
              {[["Date", "April 22, 2026"], ["Time", "9:00 AM – 5:00 PM"], ["Venue", "Main Conference Hall"]].map(([label, value]) => (
                <div key={label} style={{ display: "flex", gap: "8px", marginBottom: "12px", fontFamily: "'Jost', sans-serif", fontSize: "13px" }}>
                  <span style={{ fontWeight: 500, color: "rgba(255,255,255,0.5)", letterSpacing: "0.06em" }}>{label}:</span>
                  <span style={{ fontWeight: 200, color: "rgba(255,255,255,0.75)" }}>{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}