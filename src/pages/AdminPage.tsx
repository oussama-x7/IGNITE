import { useState, useEffect } from "react";
import {
  Users, UserCheck, UserX, Search, CheckCircle, XCircle,
  BarChart3, User, Mail, GraduationCap, School,
  Building2, Briefcase, Plus, Layers, Calendar, Clock, MapPin, LogOut, X, MessageSquare, Truck
} from "lucide-react";

import { getCompanies, getTalks, createCompany, createTalk, deleteCompany, deleteTalk, updateTalkStatus } from "../lib/api";
import type { Database } from "../lib/database.types";
import { useNavigate } from "react-router";
import { supabase } from "../lib/supabase";

type DBCompany = Database['public']['Tables']['company']['Row'];
type DBTalk   = Database['public']['Tables']['talks']['Row'];
type DBFeedback = Database['public']['Tables']['feedback']['Row'];

// ─── Attendee type mapped directly from the DB schema ─────────────
interface Attendee {
  id: number;
  created_at: string;
  name: string | null;
  email: string | null;
  year_of_study: string | null;
  school: string | null;
  check_in: number | null;
  // UI-only derived field
  checkedIn: boolean;
  checkedInAt?: string;
}

const ALL_YEARS = ["Year 1", "Year 2", "Year 3", "Year 4", "Masters", "PhD", "All Years"];

// ─── Main Component ───────────────────────────────────────────────
export function AdminPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/adminlogin");
  };

  // ── Auth guard ────────────────────────────────────────────────
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/adminlogin");
      } else {
        setAuthenticated(true);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        navigate("/adminlogin");
      } else {
        setAuthenticated(true);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const [tab, setTab] = useState<"attendees" | "companies" | "talks" | "feedback">("attendees");
  const [adminError, setAdminError] = useState<string | null>(null);

  // ── Attendees state ───────────────────────────────────────────
  const [attendees, setAttendees]               = useState<Attendee[]>([]);
  const [attendeesLoading, setAttendeesLoading] = useState(true);
  const [attendeesError, setAttendeesError]     = useState<string | null>(null);
  const [searchQuery, setSearchQuery]           = useState("");
  const [filterStatus, setFilterStatus]         = useState<"all" | "checked-in" | "not-checked-in">("all");
  const [showAddAttendeeForm, setShowAddAttendeeForm] = useState(false);
  const [newAttendee, setNewAttendee] = useState({ name: "", email: "", year_of_study: "", school: "" });

  // ── Companies state ───────────────────────────────────────────
  const [companies, setCompanies]               = useState<DBCompany[]>([]);
  const [companySearch, setCompanySearch]       = useState("");
  const [showAddCompanyForm, setShowAddCompanyForm] = useState(false);
  const [newCompany, setNewCompany] = useState<{
    name: string; description: string; logo: string;
    opportunities: ("Job" | "Internship" | "Both")[];
    acceptedYears: string[];
  }>({ name: "", description: "", logo: "", opportunities: [], acceptedYears: [] });

  // ── Talks state ───────────────────────────────────────────────
  const [talks, setTalks]                     = useState<DBTalk[]>([]);
  const [talkSearch, setTalkSearch]           = useState("");
  const [showAddTalkForm, setShowAddTalkForm] = useState(false);
  const [newTalk, setNewTalk] = useState<{
    title: string; speaker: string; time: string; location: string; status: string;
  }>({ title: "", speaker: "", time: "", location: "", status: "Upcoming" });

  const [feedback, setFeedback] = useState<DBFeedback[]>([]);
  const [feedbackLoading, setFeedbackLoading] = useState(true);
  const [feedbackFilterCategory, setFeedbackFilterCategory] = useState<"all" | "general" | "company" | "logistic">("all");
  const [feedbackSearchQuery, setFeedbackSearchQuery] = useState("");

  // ══════════════════════════════════════════════════════════════
  // DATA LOADING — reads directly from the database
  // ══════════════════════════════════════════════════════════════
  useEffect(() => {
    if (!authenticated) return;

    async function loadAttendees() {
      setAttendeesLoading(true);
      setAttendeesError(null);
      try {
        const { data, error } = await supabase
          .from("users")
          .select("*")
          .order("created_at", { ascending: false });

        console.log("=== ATTENDEES DEBUG ===");
        console.log("Data:", data);
        console.log("Error:", error);
        console.log("Row count:", data?.length);
        console.log("======================");

        if (error) throw error;

        const mapped: Attendee[] = (data ?? []).map((row: any) => ({
          ...row,
          checkedIn: Number(row.check_in) === 1,
        }));

        setAttendees(mapped);
      } catch (err: any) {
        console.error("Attendees load error:", err);
        setAttendeesError(err.message ?? "Failed to load attendees");
      } finally {
        setAttendeesLoading(false);
      }
    }

    async function loadCompaniesAndTalks() {
      try {
        const [c, t] = await Promise.all([getCompanies(), getTalks()]);
        setCompanies(c);
        setTalks(t);
      } catch (err: any) {
        console.error("Companies/Talks load error:", err);
      }
    }

    async function loadFeedback() {
      setFeedbackLoading(true);
      try {
        const { data, error } = await supabase.from("feedback").select("*").order("created_at", { ascending: false });
        if (error) throw error;
        setFeedback(data || []);
      } catch (err) {
        console.error("Feedback load error:", err);
      } finally {
        setFeedbackLoading(false);
      }
    }

    loadAttendees();
    loadCompaniesAndTalks();
    loadFeedback();
  }, [authenticated]);

  // ══════════════════════════════════════════════════════════════
  // REAL-TIME subscription on the `users` table
  // ══════════════════════════════════════════════════════════════
  useEffect(() => {
    const channel = supabase
      .channel("users-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "users" },
        (payload) => {
          if (payload.eventType === "INSERT") {
            const row = payload.new as any;
            setAttendees((prev) => [
              { ...row, checkedIn: Number(row.check_in) === 1 },
              ...prev,
            ]);
          } else if (payload.eventType === "UPDATE") {
            const row = payload.new as any;
            setAttendees((prev) =>
              prev.map((a) =>
                a.id === row.id
                  ? { ...a, ...row, checkedIn: Number(row.check_in) === 1 }
                  : a
              )
            );
          } else if (payload.eventType === "DELETE") {
            const row = payload.old as any;
            setAttendees((prev) => prev.filter((a) => a.id !== row.id));
          }
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  // ─── Attendee helpers ─────────────────────────────────────────
  const totalAttendees    = attendees.length;
  const checkedInCount    = attendees.filter((a) => a.checkedIn).length;
  const notCheckedInCount = totalAttendees - checkedInCount;

  const toggleCheckIn = async (id: number) => {
    const attendee = attendees.find((a) => a.id === id);
    if (!attendee) return;

    const newStatus = !attendee.checkedIn;
    try {
      const { error } = await supabase
        .from("users")
        .update({ check_in: newStatus ? 1 : 0 })
        .eq("id", id);

      if (error) throw error;

      // Optimistic update — real-time subscription will also fire
      setAttendees((prev) =>
        prev.map((a) =>
          a.id === id
            ? { ...a, checkedIn: newStatus, checkedInAt: newStatus ? new Date().toISOString() : undefined }
            : a
        )
      );
    } catch (err: any) {
      console.error("Attendance update error:", err);
      setAdminError(`Error updating attendance: ${err.message ?? JSON.stringify(err)}`);
    }
  };

  const handleAddAttendee = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data, error } = await supabase
        .from("users")
        .insert({
          name: newAttendee.name,
          email: newAttendee.email,
          year_of_study: newAttendee.year_of_study,
          school: newAttendee.school,
          check_in: 0,
        })
        .select()
        .single();

      if (error) throw error;

      // Real-time will also push this — adding optimistically for instant feedback
      setAttendees((prev) => [{ ...data, checkedIn: false }, ...prev]);
      setNewAttendee({ name: "", email: "", year_of_study: "", school: "" });
      setShowAddAttendeeForm(false);
    } catch (err: any) {
      console.error(err);
      setAdminError("Error adding attendee: " + (err.message ?? err));
    }
  };

  const filteredAttendees = attendees.filter((a) => {
    const name   = a.name   ?? "";
    const email  = a.email  ?? "";
    const school = a.school ?? "";
    const matchesSearch =
      name.toLowerCase().includes(searchQuery.toLowerCase())   ||
      email.toLowerCase().includes(searchQuery.toLowerCase())  ||
      school.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter =
      filterStatus === "all" ||
      (filterStatus === "checked-in"     &&  a.checkedIn) ||
      (filterStatus === "not-checked-in" && !a.checkedIn);
    return matchesSearch && matchesFilter;
  });

  // ─── Company helpers ──────────────────────────────────────────
  const filteredCompanies = companies.filter(
    (c) =>
      (c.name        ?? "").toLowerCase().includes(companySearch.toLowerCase()) ||
      (c.description ?? "").toLowerCase().includes(companySearch.toLowerCase())
  );

  const handleAddCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCompany.name || !newCompany.description) return;
    setLoading(true);
    try {
      const created = await createCompany({
        name: newCompany.name,
        description: newCompany.description,
        Logo_Abbreviation: newCompany.logo || newCompany.name.slice(0, 2).toUpperCase(),
        Opportunities: newCompany.opportunities.length > 0 ? newCompany.opportunities.join(",") : "Both",
        Accepted_Year_Groups: newCompany.acceptedYears.length > 0 ? newCompany.acceptedYears.join(",") : "All Years",
      });
      setCompanies((prev) => [created, ...prev]);
      setNewCompany({ name: "", description: "", logo: "", opportunities: [], acceptedYears: [] });
      setShowAddCompanyForm(false);
    } catch (err: any) {
      console.error(err);
      setAdminError("Error creating company: " + (err.message ?? err));
    } finally {
      setLoading(false);
    }
  };

  const toggleOpportunity = (opp: "Job" | "Internship" | "Both") =>
    setNewCompany((prev) => ({
      ...prev,
      opportunities: prev.opportunities.includes(opp)
        ? prev.opportunities.filter((o) => o !== opp)
        : [...prev.opportunities, opp],
    }));

  const toggleYear = (year: string) =>
    setNewCompany((prev) => ({
      ...prev,
      acceptedYears: prev.acceptedYears.includes(year)
        ? prev.acceptedYears.filter((y) => y !== year)
        : [...prev.acceptedYears, year],
    }));

  const removeCompany = async (id: any) => {
    try {
      await deleteCompany(id);
      setCompanies((prev) => prev.filter((c) => c.id != id));
    } catch (err: any) {
      console.error(err);
      setAdminError("Error deleting company: " + (err.message ?? err));
    }
  };

  const opportunityColors: Record<string, string> = {
    Job:        "text-primary bg-primary/10 border-primary/20",
    Internship: "text-secondary bg-secondary/10 border-secondary/20",
    Both:       "text-accent bg-accent/10 border-accent/20",
  };

  // ─── Talks helpers ────────────────────────────────────────────
  const filteredTalks = talks.filter(
    (t) =>
      (t.talk_tilte   ?? "").toLowerCase().includes(talkSearch.toLowerCase()) ||
      (t.speaker_name ?? "").toLowerCase().includes(talkSearch.toLowerCase())
  );

  const handleAddTalk = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const created = await createTalk({
        talk_tilte:   newTalk.title,
        speaker_name: newTalk.speaker,
        time:         newTalk.time,
        location:     newTalk.location,
        status:       newTalk.status,
      });
      setTalks((prev) => [created, ...prev]);
      setNewTalk({ title: "", speaker: "", time: "", location: "", status: "Upcoming" });
      setShowAddTalkForm(false);
    } catch (err: any) {
      console.error(err);
      setAdminError("Error creating talk: " + (err.message ?? err));
    }
  };

  const updateTalkStatusLocal = async (id: number, status: string) => {
    try {
      await updateTalkStatus(id, status);
      setTalks((prev) => prev.map((t) => (t.id === id ? { ...t, status } : t)));
    } catch (err: any) {
      console.error(err);
      setAdminError("Error updating status: " + (err.message ?? err));
    }
  };

  const removeTalk = async (id: any) => {
    try {
      await deleteTalk(id);
      setTalks((prev) => prev.filter((t) => t.id != id));
    } catch (err: any) {
      console.error(err);
      setAdminError("Error deleting talk: " + (err.message ?? err));
    }
  };

  const statusColors: Record<string, string> = {
    Upcoming:  "text-blue-600 bg-blue-500/10 border-blue-500/20",
    Live:      "text-green-600 bg-green-500/10 border-green-500/20",
    Completed: "text-muted-foreground bg-muted border-border",
    Cancelled: "text-destructive bg-destructive/10 border-destructive/20",
  };

  // ─── Feedback helpers ─────────────────────────────────────────
  const filteredFeedbackList = feedback.filter((f) => {
    const matchesCategory = feedbackFilterCategory === "all" || f.category === feedbackFilterCategory;
    const matchesSearch = 
      (f.person_name ?? "").toLowerCase().includes(feedbackSearchQuery.toLowerCase()) ||
      (f.feedback ?? "").toLowerCase().includes(feedbackSearchQuery.toLowerCase()) ||
      (f.company_name ?? "").toLowerCase().includes(feedbackSearchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // ══════════════════════════════════════════════════════════════
  // RENDER
  // ══════════════════════════════════════════════════════════════
  return (
    <div className="min-h-screen font-dm" style={{ backgroundColor: "#f7f5f2" }}>

      {/* ─── Hero ─────────────────────────────────────────────── */}
      <section className="relative bg-gradient-to-br from-[#1a1f2e] via-[#2F3952] to-[#1a1f2e] pt-28 pb-20 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-10 left-20 w-[400px] h-[400px] bg-primary/10 rounded-full blur-[100px]" />
          <div className="absolute bottom-0 right-20 w-[400px] h-[400px] bg-accent/10 rounded-full blur-[100px]" />
        </div>
        <div className="container mx-auto px-6 relative z-10">
          <div className="flex justify-end mb-4">
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white/80 hover:text-white rounded-xl text-xs font-medium transition-all backdrop-blur-sm"
            >
              <LogOut className="w-3.5 h-3.5" />
              Logout
            </button>
          </div>
          <div className="text-center">
            <span className="text-xs uppercase tracking-[0.3em] text-primary/60 font-light mb-6 block">Administration</span>
            <h1 className="text-5xl md:text-6xl font-extralight text-white tracking-tight mb-4">Admin Dashboard</h1>
            <p className="text-sm text-white/40 font-light max-w-md mx-auto">
              Manage attendees and companies, track event participation
            </p>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#f7f5f2] to-transparent" />
      </section>

      <div className="container mx-auto px-6 pb-20 -mt-2">

        {/* ─── Tab switcher ─────────────────────────────────────── */}
        <div className="flex overflow-x-auto gap-2 mb-10 bg-white border border-border rounded-2xl p-1.5 shadow-sm w-full md:w-fit scrollbar-hide">
          {(["attendees", "companies", "talks", "feedback"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 md:flex-none flex items-center justify-center gap-2.5 px-4 md:px-7 py-3 rounded-xl text-sm font-medium transition-all capitalize whitespace-nowrap ${
                tab === t
                  ? "bg-gradient-to-r from-[#2F3952] to-[#1a1f2e] text-white shadow-md"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t === "attendees" && <Users className="w-4 h-4" />}
              {t === "companies" && <Building2 className="w-4 h-4" />}
              {t === "talks"     && <Calendar className="w-4 h-4" />}
              {t === "feedback"  && <MessageSquare className="w-4 h-4" />}
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {adminError && (
          <div className="mb-8 p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3 text-red-600 relative shadow-sm">
            <XCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div className="flex-1 text-sm font-medium">{adminError}</div>
            <button onClick={() => setAdminError(null)} className="text-red-400 hover:text-red-600 transition-colors p-1">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* ═══════════════ ATTENDEES TAB ═══════════════ */}
        {tab === "attendees" && (
          <>
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-10">
              {[
                { icon: <Users className="w-6 h-6 text-primary" />,             label: "Total Registered", value: totalAttendees,    accent: "from-primary/20 to-primary/10",     border: "border-border" },
                { icon: <UserCheck className="w-6 h-6 text-accent" />,          label: "Checked In",       value: checkedInCount,    accent: "from-accent/20 to-accent/10",       border: "border-accent/30" },
                { icon: <UserX className="w-6 h-6 text-muted-foreground" />,    label: "Not Checked In",   value: notCheckedInCount,  accent: "from-muted to-muted/50",            border: "border-border" },
                { icon: <BarChart3 className="w-6 h-6 text-secondary" />,       label: "Attendance Rate",  value: `${totalAttendees > 0 ? Math.round((checkedInCount / totalAttendees) * 100) : 0}%`, accent: "from-secondary/20 to-secondary/10", border: "border-secondary/30" },
              ].map(({ icon, label, value, accent, border }) => (
                <div key={label} className={`bg-white border ${border} rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow`}>
                  <div className="flex items-center gap-4">
                    <div className={`bg-gradient-to-br ${accent} p-3 rounded-xl`}>{icon}</div>
                    <div>
                      <p className="text-xs text-muted-foreground font-medium mb-0.5">{label}</p>
                      <p className="text-3xl font-bold">{value}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Table card */}
            <div className="bg-white border border-border rounded-2xl p-8 shadow-sm">
              <div className="flex flex-col md:flex-row gap-4 mb-8">
                {/* Search */}
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search by name, email, or school…"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-11 pr-4 py-3.5 bg-muted/40 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all text-sm"
                  />
                </div>

                {/* Add button */}
                <button
                  onClick={() => setShowAddAttendeeForm(true)}
                  className="px-6 py-3.5 bg-gradient-to-r from-[#2F3952] to-[#1a1f2e] hover:shadow-lg text-white rounded-xl transition-all font-medium whitespace-nowrap flex items-center gap-2 text-sm"
                >
                  <Plus className="w-4 h-4" /> Add Attendee
                </button>

                {/* Filter pills */}
                <div className="flex gap-2">
                  {(["all", "checked-in", "not-checked-in"] as const).map((f) => (
                    <button
                      key={f}
                      onClick={() => setFilterStatus(f)}
                      className={`px-4 py-2.5 rounded-xl transition-all font-medium text-sm ${
                        filterStatus === f
                          ? "bg-gradient-to-r from-[#2F3952] to-[#1a1f2e] text-white shadow-md"
                          : "bg-muted/40 hover:bg-muted text-foreground/70"
                      }`}
                    >
                      {f === "all" ? "All" : f === "checked-in" ? "Checked In" : "Not Checked In"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Loading / error states */}
              {attendeesLoading && (
                <div className="text-center py-16">
                  <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                  <p className="text-muted-foreground text-sm">Loading attendees…</p>
                </div>
              )}

              {attendeesError && !attendeesLoading && (
                <div className="text-center py-16">
                  <XCircle className="w-10 h-10 text-destructive mx-auto mb-3 opacity-50" />
                  <p className="text-destructive text-sm font-medium">Failed to load attendees</p>
                  <p className="text-muted-foreground text-xs mt-1">{attendeesError}</p>
                </div>
              )}

              {!attendeesLoading && !attendeesError && (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        {["Name", "Email", "Year", "School", "Status", "Action"].map((h) => (
                          <th
                            key={h}
                            className={`text-left py-3 px-4 font-medium text-sm text-muted-foreground
                              ${["Email"].includes(h) ? "hidden md:table-cell" : ""}
                              ${["Year", "School"].includes(h) ? "hidden lg:table-cell" : ""}
                              ${["Status", "Action"].includes(h) ? "text-center" : ""}
                            `}
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredAttendees.map((attendee) => (
                        <tr key={attendee.id} className="border-b border-border/40 hover:bg-muted/20 transition-colors">
                          <td className="py-4 px-4 min-w-0 max-w-[150px]">
                            <p className="font-medium text-sm truncate" title={attendee.name || ""}>{attendee.name}</p>
                            <p className="text-xs text-muted-foreground md:hidden truncate" title={attendee.email || ""}>{attendee.email}</p>
                          </td>
                          <td className="py-4 px-4 text-sm text-muted-foreground hidden md:table-cell max-w-[150px] lg:max-w-[200px] truncate" title={attendee.email || ""}>{attendee.email}</td>
                          <td className="py-4 px-4 text-sm hidden lg:table-cell max-w-[120px] truncate" title={attendee.year_of_study || ""}>{attendee.year_of_study}</td>
                          <td className="py-4 px-4 text-sm hidden lg:table-cell max-w-[150px] truncate" title={attendee.school || ""}>{attendee.school}</td>
                          <td className="py-4 px-4 text-center">
                            {attendee.checkedIn ? (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-accent/10 text-accent rounded-xl text-xs font-medium border border-accent/30">
                                <CheckCircle className="w-3.5 h-3.5" /> Checked In
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-muted/60 text-muted-foreground rounded-xl text-xs font-medium border border-border">
                                <XCircle className="w-3.5 h-3.5" /> Pending
                              </span>
                            )}
                          </td>
                          <td className="py-4 px-4 text-center">
                            <button
                              onClick={() => toggleCheckIn(attendee.id)}
                              className={`px-4 py-2 rounded-xl transition-all text-xs font-medium ${
                                attendee.checkedIn
                                  ? "bg-destructive/10 hover:bg-destructive/20 text-destructive border border-destructive/20"
                                  : "bg-gradient-to-r from-[#2F3952] to-[#1a1f2e] hover:shadow-md text-white shadow-sm"
                              }`}
                            >
                              {attendee.checkedIn ? "Undo" : "Check In"}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {filteredAttendees.length === 0 && (
                    <div className="text-center py-16">
                      <Users className="w-10 h-10 text-muted-foreground mx-auto mb-3 opacity-30" />
                      <p className="text-muted-foreground text-sm">No attendees found</p>
                    </div>
                  )}
                </div>
              )}

            </div>
          </>
        )}

        {/* ═══════════════ COMPANIES TAB ═══════════════ */}
        {tab === "companies" && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
              {[
                { icon: <Building2 className="w-6 h-6 text-primary" />,   label: "Total Companies",      value: companies.length, accent: "from-primary/20 to-primary/10",     border: "border-border" },
                { icon: <Briefcase className="w-6 h-6 text-secondary" />, label: "Hiring Full-time",     value: companies.filter((c) => c.Opportunities?.includes("Job") || c.Opportunities?.includes("Both")).length, accent: "from-secondary/20 to-secondary/10", border: "border-secondary/30" },
                { icon: <Layers className="w-6 h-6 text-accent" />,       label: "Offering Internships", value: companies.filter((c) => c.Opportunities?.includes("Internship") || c.Opportunities?.includes("Both")).length, accent: "from-accent/20 to-accent/10", border: "border-accent/30" },
              ].map(({ icon, label, value, accent, border }) => (
                <div key={label} className={`bg-white border ${border} rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow`}>
                  <div className="flex items-center gap-4">
                    <div className={`bg-gradient-to-br ${accent} p-3 rounded-xl`}>{icon}</div>
                    <div>
                      <p className="text-xs text-muted-foreground font-medium mb-0.5">{label}</p>
                      <p className="text-3xl font-bold">{value}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-white border border-border rounded-2xl p-8 shadow-sm">
              <div className="flex flex-col md:flex-row gap-4 mb-8">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search companies…"
                    value={companySearch}
                    onChange={(e) => setCompanySearch(e.target.value)}
                    className="w-full pl-11 pr-4 py-3.5 bg-muted/40 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all text-sm"
                  />
                </div>
                <button
                  onClick={() => setShowAddCompanyForm(true)}
                  className="px-6 py-3.5 bg-gradient-to-r from-[#2F3952] to-[#1a1f2e] hover:shadow-lg text-white rounded-xl transition-all font-medium whitespace-nowrap flex items-center gap-2 text-sm"
                >
                  <Plus className="w-4 h-4" /> Add Company
                </button>
              </div>

              <div className="space-y-4">
                {filteredCompanies.map((company, index) => (
                  <div
                    key={company.id}
                    className="group flex flex-col md:flex-row items-start md:items-center gap-6 p-7 rounded-2xl border transition-all hover:shadow-md"
                    style={{ backgroundColor: "#faf9f7", borderColor: "rgba(26,31,46,0.08)" }}
                  >
                    <div className="hidden md:block text-5xl font-light w-16 text-right select-none" style={{ color: "rgba(26,31,46,0.12)" }}>
                      {String(index + 1).padStart(2, "0")}
                    </div>
                    <div className="bg-gradient-to-br from-[#2F3952] to-[#1a1f2e] w-16 h-16 rounded-2xl flex items-center justify-center shadow-md flex-shrink-0 group-hover:scale-105 transition-transform">
                      <span className="font-bold text-white text-sm tracking-tight">{company.Logo_Abbreviation ?? "CP"}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xl font-light text-[#1a1f2e] mb-1 tracking-tight truncate" title={company.name || ""}>{company.name}</h3>
                      <p className="text-sm font-light mb-3 line-clamp-2" title={company.description || ""} style={{ color: "rgba(26,31,46,0.5)" }}>{company.description}</p>
                      <div className="flex flex-wrap items-center gap-4">
                        <div className="flex items-center gap-2">
                          <Briefcase className="w-3.5 h-3.5" style={{ color: "rgba(26,31,46,0.3)" }} />
                          <div className="flex flex-wrap gap-1.5">
                            {(company.Opportunities ? company.Opportunities.split(",") : []).map((opp) => (
                              <span key={opp} className={`text-xs font-medium px-2.5 py-1 rounded-lg border ${opportunityColors[opp.trim()] ?? opportunityColors["Both"]}`}>{opp.trim()}</span>
                            ))}
                          </div>
                        </div>
                        <div className="h-3 w-px hidden md:block" style={{ backgroundColor: "rgba(26,31,46,0.12)" }} />
                        <div className="flex items-center gap-2">
                          <GraduationCap className="w-3.5 h-3.5" style={{ color: "rgba(26,31,46,0.3)" }} />
                          <span className="text-xs font-light" style={{ color: "rgba(26,31,46,0.4)" }}>
                            {company.Accepted_Year_Groups
                              ? company.Accepted_Year_Groups.split(",").length > 2
                                ? `${company.Accepted_Year_Groups.split(",").length} levels`
                                : company.Accepted_Year_Groups
                              : "All Years"}
                          </span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => removeCompany(company.id)}
                      className="flex-shrink-0 px-4 py-2 text-xs font-medium text-destructive bg-destructive/10 hover:bg-destructive/20 border border-destructive/20 rounded-xl transition-all"
                    >
                      Remove
                    </button>
                  </div>
                ))}

                {filteredCompanies.length === 0 && (
                  <div className="text-center py-16">
                    <Building2 className="w-10 h-10 text-muted-foreground mx-auto mb-3 opacity-30" />
                    <p className="text-muted-foreground text-sm">No companies found</p>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* ═══════════════ TALKS TAB ═══════════════ */}
        {tab === "talks" && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-10">
              {[
                { icon: <Calendar className="w-6 h-6 text-primary" />,        label: "Total Talks", value: talks.length,                                        accent: "from-primary/20 to-primary/10",       border: "border-border" },
                { icon: <CheckCircle className="w-6 h-6 text-green-600" />,   label: "Live",        value: talks.filter((t) => t.status === "Live").length,      accent: "from-green-500/20 to-green-500/10",   border: "border-green-500/30" },
                { icon: <Clock className="w-6 h-6 text-blue-600" />,          label: "Upcoming",    value: talks.filter((t) => t.status === "Upcoming").length,  accent: "from-blue-500/20 to-blue-500/10",     border: "border-blue-500/30" },
                { icon: <XCircle className="w-6 h-6 text-destructive" />,     label: "Cancelled",   value: talks.filter((t) => t.status === "Cancelled").length, accent: "from-destructive/20 to-destructive/10", border: "border-destructive/30" },
              ].map(({ icon, label, value, accent, border }) => (
                <div key={label} className={`bg-white border ${border} rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow`}>
                  <div className="flex items-center gap-4">
                    <div className={`bg-gradient-to-br ${accent} p-3 rounded-xl`}>{icon}</div>
                    <div>
                      <p className="text-xs text-muted-foreground font-medium mb-0.5">{label}</p>
                      <p className="text-3xl font-bold">{value}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-white border border-border rounded-2xl p-8 shadow-sm">
              <div className="flex flex-col md:flex-row gap-4 mb-8">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search talks…"
                    value={talkSearch}
                    onChange={(e) => setTalkSearch(e.target.value)}
                    className="w-full pl-11 pr-4 py-3.5 bg-muted/40 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all text-sm"
                  />
                </div>
                <button
                  onClick={() => setShowAddTalkForm(true)}
                  className="px-6 py-3.5 bg-gradient-to-r from-[#2F3952] to-[#1a1f2e] hover:shadow-lg text-white rounded-xl transition-all font-medium whitespace-nowrap flex items-center gap-2 text-sm"
                >
                  <Plus className="w-4 h-4" /> Add Talk
                </button>
              </div>

              <div className="space-y-4">
                {filteredTalks.map((talk, index) => (
                  <div
                    key={talk.id}
                    className="group flex flex-col md:flex-row items-start md:items-center gap-6 p-7 rounded-2xl border transition-all hover:shadow-md"
                    style={{ backgroundColor: "#faf9f7", borderColor: "rgba(26,31,46,0.08)" }}
                  >
                    <div className="hidden md:block text-5xl font-light w-16 text-right select-none" style={{ color: "rgba(26,31,46,0.12)" }}>
                      {String(index + 1).padStart(2, "0")}
                    </div>
                    <div className="flex-1 min-w-0 w-full">
                      <div className="flex justify-between items-start mb-2 gap-4">
                        <h3 className="text-xl font-light text-[#1a1f2e] tracking-tight truncate" title={talk.talk_tilte || ""}>{talk.talk_tilte}</h3>
                        <span className={`text-xs font-medium px-2.5 py-1 rounded-lg border whitespace-nowrap flex-shrink-0 ${statusColors[talk.status ?? "Upcoming"]}`}>
                          {talk.status}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-4 text-sm mt-3">
                        <div className="flex items-center gap-2 text-muted-foreground min-w-0 max-w-[200px]">
                          <User className="w-4 h-4 flex-shrink-0" /><span className="truncate" title={talk.speaker_name || ""}>{talk.speaker_name}</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground min-w-0 max-w-[150px]">
                          <Clock className="w-4 h-4 flex-shrink-0" /><span className="truncate">{talk.time}</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground min-w-0 max-w-[200px]">
                          <MapPin className="w-4 h-4 flex-shrink-0" /><span className="truncate" title={talk.location || ""}>{talk.location}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 self-end md:self-center mt-4 md:mt-0 w-full md:w-auto flex-wrap">
                      <select
                        value={talk.status ?? "Upcoming"}
                        onChange={(e) => updateTalkStatusLocal(talk.id, e.target.value)}
                        className="px-4 py-2 text-sm bg-white border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30"
                      >
                        <option value="Upcoming">Upcoming</option>
                        <option value="Live">Live</option>
                        <option value="Completed">Completed</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                      <button
                        onClick={() => removeTalk(talk.id)}
                        className="px-4 py-2 text-sm font-medium text-destructive bg-destructive/10 hover:bg-destructive/20 border border-destructive/20 rounded-xl transition-all"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}

                {filteredTalks.length === 0 && (
                  <div className="text-center py-16">
                    <Calendar className="w-10 h-10 text-muted-foreground mx-auto mb-3 opacity-30" />
                    <p className="text-muted-foreground text-sm">No talks found</p>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* ═══════════════ FEEDBACK TAB ═══════════════ */}
        {tab === "feedback" && (
          <div className="bg-white border border-border rounded-2xl p-8 shadow-sm">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
              <div>
                <h2 className="text-3xl font-light tracking-tight text-[#1a1f2e]">User Feedback</h2>
                <p className="text-sm text-muted-foreground mt-2 font-light">Insights from event participants</p>
              </div>
              <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search feedback..."
                    value={feedbackSearchQuery}
                    onChange={(e) => setFeedbackSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 bg-muted/40 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm"
                  />
                </div>
                <div className="flex bg-muted/40 p-1 rounded-xl w-full sm:w-auto">
                  {(["all", "general", "company", "logistic"] as const).map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setFeedbackFilterCategory(cat)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all capitalize ${
                        feedbackFilterCategory === cat
                          ? "bg-white text-[#1a1f2e] shadow-sm"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {feedbackLoading ? (
              <div className="text-center py-16">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-muted-foreground text-sm">Loading feedback…</p>
              </div>
            ) : filteredFeedbackList.length === 0 ? (
              <div className="text-center py-20">
                <MessageSquare className="w-12 h-12 text-muted-foreground/20 mx-auto mb-4" />
                <p className="text-muted-foreground text-sm">No feedback matches your filters.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredFeedbackList.map((f) => (
                  <div key={f.id} className="group relative bg-white border border-[#1a1f2e]/10 rounded-3xl p-8 shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] transition-all duration-500 overflow-hidden">
                    {/* Decorative Top Accent */}
                    <div className={`absolute top-0 left-0 right-0 h-1.5 ${
                      f.category === 'company' ? 'bg-primary' :
                      f.category === 'logistic' ? 'bg-secondary' :
                      'bg-accent'
                    }`} />

                    <div className="flex flex-col h-full">
                      <div className="flex items-start justify-between mb-8">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-[#1a1f2e] flex items-center justify-center text-white shadow-lg shadow-[#1a1f2e]/20 group-hover:scale-110 transition-transform duration-500">
                            <span className="text-sm font-bold tracking-tighter">
                              {f.person_name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || "U"}
                            </span>
                          </div>
                          <div>
                            <h4 className="font-semibold text-[#1a1f2e] text-base leading-tight">{f.person_name}</h4>
                            <p className="text-[11px] text-muted-foreground uppercase tracking-[0.1em] font-medium mt-1">
                              {new Date(f.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-2">
                          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                            f.category === 'company' ? 'bg-primary/5 text-primary border-primary/20' :
                            f.category === 'logistic' ? 'bg-secondary/5 text-secondary border-secondary/20' :
                            'bg-accent/5 text-accent border-accent/20'
                          }`}>
                            {f.category === 'company' && <Building2 className="w-3 h-3" />}
                            {f.category === 'logistic' && <Truck className="w-3 h-3" />}
                            {f.category === 'general' && <MessageSquare className="w-3 h-3" />}
                            {f.category || 'general'}
                          </div>
                          {f.company_name && (
                            <div className="flex items-center gap-2 text-base font-bold text-[#1a1f2e] bg-primary/10 px-4 py-1.5 rounded-xl border border-primary/20 shadow-md">
                              <Building2 className="w-4 h-4 text-primary" />
                              {f.company_name}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="relative flex-1">
                        <div className="absolute -top-4 -left-2 opacity-[0.03] text-6xl font-serif text-[#1a1f2e] pointer-events-none">
                          “
                        </div>
                        <p className="text-[#1a1f2e]/80 text-[15px] leading-relaxed font-light italic relative z-10 pl-2">
                          {f.feedback}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ═══════ ADD ATTENDEE MODAL ═══════ */}
      {showAddAttendeeForm && (
        <div className="fixed inset-0 bg-[#1a1f2e]/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-border rounded-2xl max-w-2xl w-full shadow-2xl">
            <div className="p-8 border-b border-border">
              <h2 className="text-3xl font-light">Add New Attendee</h2>
              <p className="text-sm text-muted-foreground mt-2 font-light">Manually register an attendee</p>
            </div>
            <form onSubmit={handleAddAttendee} className="p-8 space-y-5">
              {[
                { name: "name",  label: "Full Name",      type: "text",  placeholder: "Enter full name",         icon: <User className="w-4 h-4 text-primary" /> },
                { name: "email", label: "Email Address",  type: "email", placeholder: "email@university.edu",    icon: <Mail className="w-4 h-4 text-primary" /> },
              ].map(({ name, label, type, placeholder, icon }) => (
                <div key={name}>
                  <label className="flex items-center gap-2 mb-2.5 font-medium text-sm">
                    <div className="bg-primary/10 p-1.5 rounded-lg">{icon}</div>
                    {label}
                  </label>
                  <input
                    type={type}
                    name={name}
                    value={(newAttendee as any)[name]}
                    onChange={(e) => setNewAttendee((prev) => ({ ...prev, [e.target.name]: e.target.value }))}
                    required
                    placeholder={placeholder}
                    className="w-full px-5 py-3 bg-muted/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all text-sm"
                  />
                </div>
              ))}
              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="flex items-center gap-2 mb-2.5 font-medium text-sm">
                    <div className="bg-primary/10 p-1.5 rounded-lg"><GraduationCap className="w-4 h-4 text-primary" /></div>
                    Year
                  </label>
                  <select
                    name="year_of_study"
                    value={newAttendee.year_of_study}
                    onChange={(e) => setNewAttendee((prev) => ({ ...prev, year_of_study: e.target.value }))}
                    required
                    className="w-full px-5 py-3 bg-muted/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all text-sm"
                  >
                    <option value="">Select year</option>
                    {["Year 1","Year 2","Year 3","Year 4","Masters","PhD"].map((y) => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
                <div>
                  <label className="flex items-center gap-2 mb-2.5 font-medium text-sm">
                    <div className="bg-primary/10 p-1.5 rounded-lg"><School className="w-4 h-4 text-primary" /></div>
                    School
                  </label>
                  <input
                    type="text"
                    name="school"
                    value={newAttendee.school}
                    onChange={(e) => setNewAttendee((prev) => ({ ...prev, school: e.target.value }))}
                    required
                    placeholder="University name"
                    className="w-full px-5 py-3 bg-muted/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all text-sm"
                  />
                </div>
              </div>
              <div className="flex gap-4 pt-2">
                <button type="submit" className="flex-1 bg-gradient-to-r from-[#2F3952] to-[#1a1f2e] text-white px-6 py-3.5 rounded-xl font-medium hover:shadow-xl transition-all text-sm">
                  Add Attendee
                </button>
                <button
                  type="button"
                  onClick={() => { setShowAddAttendeeForm(false); setNewAttendee({ name: "", email: "", year_of_study: "", school: "" }); }}
                  className="px-6 py-3.5 bg-muted hover:bg-muted/80 text-foreground rounded-xl transition-all font-medium text-sm"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ═══════ ADD COMPANY MODAL ═══════ */}
      {showAddCompanyForm && (
        <div className="fixed inset-0 bg-[#1a1f2e]/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-border rounded-2xl max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-8 border-b border-border sticky top-0 bg-white z-10">
              <h2 className="text-3xl font-light">Add New Company</h2>
              <p className="text-sm text-muted-foreground mt-2 font-light">Add a participating company to the event</p>
            </div>
            <form onSubmit={handleAddCompany} className="p-8 space-y-6">
              <div>
                <label className="flex items-center gap-2 mb-2.5 font-medium text-sm">
                  <div className="bg-primary/10 p-1.5 rounded-lg"><Building2 className="w-4 h-4 text-primary" /></div>
                  Company Name
                </label>
                <input type="text" value={newCompany.name} onChange={(e) => setNewCompany((p) => ({ ...p, name: e.target.value }))} required
                  placeholder="e.g. TechCorp Solutions"
                  className="w-full px-5 py-3 bg-muted/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all text-sm" />
              </div>
              <div>
                <label className="flex items-center gap-2 mb-2.5 font-medium text-sm">
                  <div className="bg-primary/10 p-1.5 rounded-lg"><Layers className="w-4 h-4 text-primary" /></div>
                  Description
                </label>
                <input type="text" value={newCompany.description} onChange={(e) => setNewCompany((p) => ({ ...p, description: e.target.value }))} required
                  placeholder="Brief company description"
                  className="w-full px-5 py-3 bg-muted/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all text-sm" />
              </div>
              <div>
                <label className="flex items-center gap-2 mb-2.5 font-medium text-sm">
                  <div className="bg-primary/10 p-1.5 rounded-lg"><User className="w-4 h-4 text-primary" /></div>
                  Logo Abbreviation <span className="text-muted-foreground font-normal ml-1">(2 lettres, auto si vide)</span>
                </label>
                <input type="text" value={newCompany.logo}
                  onChange={(e) => setNewCompany((p) => ({ ...p, logo: e.target.value.toUpperCase().slice(0, 2) }))}
                  placeholder="TC" maxLength={2}
                  className="w-24 px-5 py-3 bg-muted/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all text-sm uppercase" />
              </div>
              <div>
                <label className="flex items-center gap-2 mb-3 font-medium text-sm">
                  <div className="bg-primary/10 p-1.5 rounded-lg"><Briefcase className="w-4 h-4 text-primary" /></div>
                  Opportunities
                </label>
                <div className="flex flex-wrap gap-2">
                  {(["Job", "Internship", "Both"] as const).map((opp) => (
                    <button key={opp} type="button" onClick={() => toggleOpportunity(opp)}
                      className={`px-5 py-2.5 rounded-xl text-sm font-medium border transition-all ${
                        newCompany.opportunities.includes(opp) ? opportunityColors[opp] : "bg-muted/40 text-muted-foreground border-border hover:bg-muted"
                      }`}>{opp}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="flex items-center gap-2 mb-3 font-medium text-sm">
                  <div className="bg-primary/10 p-1.5 rounded-lg"><GraduationCap className="w-4 h-4 text-primary" /></div>
                  Accepted Year Groups
                </label>
                <div className="flex flex-wrap gap-2">
                  {ALL_YEARS.map((year) => (
                    <button key={year} type="button" onClick={() => toggleYear(year)}
                      className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
                        newCompany.acceptedYears.includes(year) ? "bg-[#2F3952] text-white border-[#2F3952] shadow-sm" : "bg-muted/40 text-muted-foreground border-border hover:bg-muted"
                      }`}>{year}</button>
                  ))}
                </div>
              </div>
              <div className="flex gap-4 pt-2">
                <button type="submit" disabled={loading}
                  className="flex-1 bg-gradient-to-r from-[#2F3952] to-[#1a1f2e] text-white px-6 py-3.5 rounded-xl font-medium hover:shadow-xl transition-all text-sm disabled:opacity-50">
                  {loading ? "Adding…" : "Add Company"}
                </button>
                <button type="button"
                  onClick={() => { setShowAddCompanyForm(false); setNewCompany({ name: "", description: "", logo: "", opportunities: [], acceptedYears: [] }); }}
                  className="px-6 py-3.5 bg-muted hover:bg-muted/80 text-foreground rounded-xl transition-all font-medium text-sm">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ═══════ ADD TALK MODAL ═══════ */}
      {showAddTalkForm && (
        <div className="fixed inset-0 bg-[#1a1f2e]/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-border rounded-2xl max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-8 border-b border-border sticky top-0 bg-white z-10">
              <h2 className="text-3xl font-light">Add New Talk</h2>
              <p className="text-sm text-muted-foreground mt-2 font-light">Schedule a new talk or presentation</p>
            </div>
            <form onSubmit={handleAddTalk} className="p-8 space-y-6">
              <div>
                <label className="flex items-center gap-2 mb-2.5 font-medium text-sm">
                  <div className="bg-primary/10 p-1.5 rounded-lg"><Layers className="w-4 h-4 text-primary" /></div>
                  Talk Title
                </label>
                <input type="text" value={newTalk.title} onChange={(e) => setNewTalk((p) => ({ ...p, title: e.target.value }))} required
                  placeholder="e.g. Future of AI in Fintech"
                  className="w-full px-5 py-3 bg-muted/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all text-sm" />
              </div>
              <div>
                <label className="flex items-center gap-2 mb-2.5 font-medium text-sm">
                  <div className="bg-primary/10 p-1.5 rounded-lg"><User className="w-4 h-4 text-primary" /></div>
                  Speaker Name
                </label>
                <input type="text" value={newTalk.speaker} onChange={(e) => setNewTalk((p) => ({ ...p, speaker: e.target.value }))} required
                  placeholder="e.g. Dr. Alice Smith"
                  className="w-full px-5 py-3 bg-muted/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="flex items-center gap-2 mb-2.5 font-medium text-sm">
                    <div className="bg-primary/10 p-1.5 rounded-lg"><Clock className="w-4 h-4 text-primary" /></div>
                    Time
                  </label>
                  <input type="text" value={newTalk.time} onChange={(e) => setNewTalk((p) => ({ ...p, time: e.target.value }))} required
                    placeholder="e.g. 10:00 AM"
                    className="w-full px-5 py-3 bg-muted/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all text-sm" />
                </div>
                <div>
                  <label className="flex items-center gap-2 mb-2.5 font-medium text-sm">
                    <div className="bg-primary/10 p-1.5 rounded-lg"><MapPin className="w-4 h-4 text-primary" /></div>
                    Location
                  </label>
                  <input type="text" value={newTalk.location} onChange={(e) => setNewTalk((p) => ({ ...p, location: e.target.value }))} required
                    placeholder="e.g. Hall A"
                    className="w-full px-5 py-3 bg-muted/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all text-sm" />
                </div>
              </div>
              <div>
                <label className="flex items-center gap-2 mb-3 font-medium text-sm">
                  <div className="bg-primary/10 p-1.5 rounded-lg"><CheckCircle className="w-4 h-4 text-primary" /></div>
                  Status
                </label>
                <div className="flex flex-wrap gap-2">
                  {(["Upcoming", "Live", "Completed", "Cancelled"] as const).map((status) => (
                    <button key={status} type="button" onClick={() => setNewTalk((prev) => ({ ...prev, status }))}
                      className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
                        newTalk.status === status ? "bg-[#2F3952] text-white border-[#2F3952] shadow-sm" : "bg-muted/40 text-muted-foreground border-border hover:bg-muted"
                      }`}>{status}</button>
                  ))}
                </div>
              </div>
              <div className="flex gap-4 pt-2">
                <button type="submit" className="flex-1 bg-gradient-to-r from-[#2F3952] to-[#1a1f2e] text-white px-6 py-3.5 rounded-xl font-medium hover:shadow-xl transition-all text-sm">
                  Add Talk
                </button>
                <button type="button"
                  onClick={() => { setShowAddTalkForm(false); setNewTalk({ title: "", speaker: "", time: "", location: "", status: "Upcoming" }); }}
                  className="px-6 py-3.5 bg-muted hover:bg-muted/80 text-foreground rounded-xl transition-all font-medium text-sm">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}