import { useState, useEffect } from "react";
import {
  MessageSquare,
  User,
  Send,
  Building2,
  Truck,
  ChevronDown,
  Info,
} from "lucide-react";
import confetti from "canvas-confetti";
import { createFeedback, getCompanies } from "../lib/api";
import { Link } from "react-router";

/* =========================
   Constants
========================= */
const institutions = [
  "Algérie Poste",
  "Algérie Télécom",
  "Algerian Drilling Fluids Services Company (ADFC)",
  "Algerian Space Agency (ASAL)",
  "Assemblée Populaire Nationale (APN)",
  "Bomare Company (STREAM)",
  "CDTA",
  "CRAAG",
  "Crédit Populaire d'Algerie (CPA)",
  "Djezzy",
  "Mobilis",
  "Octodet",
  "Oreedoo",
  "Proxylan or CERIST",
  "SLB",
  "SOMEMI",
  "Sonatrach",
];

const cities = [
  "ALGIERS",
  "ANNABA",
  "BEJAIA",
  "BLIDA",
  "BOUMERDES",
  "CONSTANTINE",
  "HASSI MESSAOUD",
  "JIJEL",
  "ORAN",
  "SETIF",
  "TIPAZA",
  "TIZI OUZOU",
];

const difficultiesList = [
  "Uncertain about how to find internship opportunities.",
  "Not receiving responses to my internship applications.",
  "Limited internship opportunities available in my hometown.",
  "Institutions requested a commitment longer than one month.",
  "Official requested documentation (paperwork)",
];

const nonAIAreas = [
  "Web development",
  "Mobile development",
  "Software engineering",
  "Telecommunications/Networks",
  "Computer security",
  "Databases",
];

interface Company {
  id: number;
  name: string | null;
}

/* =========================
   Reusable Sub-components
========================= */
function FormField({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-3">
      <p className="font-medium text-[#1a1f2e] text-sm">
        {label}
        {required && <span className="text-[#EA5A16] ml-1">*</span>}
      </p>
      {children}
    </div>
  );
}

function SelectWithOther({
  options,
  value,
  onChange,
  otherValue,
  onOtherChange,
  placeholder,
}: {
  options: string[];
  value: string;
  onChange: (v: string) => void;
  otherValue: string;
  onOtherChange: (v: string) => void;
  placeholder?: string;
}) {
  const inputClass =
    "w-full px-4 py-3 border border-[#1a1f2e]/10 rounded-xl text-sm font-light text-[#1a1f2e] focus:outline-none focus:ring-2 focus:ring-primary/20 bg-[#f7f5f2]/40 placeholder:text-[#1a1f2e]/30";
  return (
    <div>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required
        className={`${inputClass} cursor-pointer`}
      >
        <option value="">{placeholder || "Select..."}</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
        <option value="other">Other:</option>
      </select>
      {value === "other" && (
        <input
          type="text"
          value={otherValue}
          onChange={(e) => onOtherChange(e.target.value)}
          placeholder="Please specify..."
          required
          className={`mt-2 ${inputClass}`}
        />
      )}
    </div>
  );
}

function RadioGroup({
  name,
  options,
  value,
  onChange,
  otherValue,
  onOtherChange,
}: {
  name: string;
  options: string[];
  value: string;
  onChange: (val: string) => void;
  otherValue?: string;
  onOtherChange?: (val: string) => void;
}) {
  return (
    <div className="space-y-2">
      {options.map((opt) => (
        <label
          key={opt}
          className="flex items-center gap-3 p-3 rounded-xl border border-[#1a1f2e]/10 hover:bg-[#f7f5f2] cursor-pointer transition-colors"
        >
          <input
            type="radio"
            name={name}
            value={opt}
            checked={value === opt}
            onChange={() => onChange(opt)}
            className="accent-[#EA5A16] w-4 h-4 flex-shrink-0"
          />
          <span className="text-sm font-light text-[#1a1f2e]">{opt}</span>
        </label>
      ))}
      {onOtherChange && (
        <div>
          <label className="flex items-center gap-3 p-3 rounded-xl border border-[#1a1f2e]/10 hover:bg-[#f7f5f2] cursor-pointer transition-colors">
            <input
              type="radio"
              name={name}
              value="other"
              checked={value === "other"}
              onChange={() => onChange("other")}
              className="accent-[#EA5A16] w-4 h-4 flex-shrink-0"
            />
            <span className="text-sm font-light text-[#1a1f2e]">Other:</span>
          </label>
          {value === "other" && (
            <input
              type="text"
              value={otherValue}
              onChange={(e) => onOtherChange(e.target.value)}
              placeholder="Please specify..."
              className="mt-2 w-full px-4 py-2.5 border border-[#1a1f2e]/10 rounded-xl text-sm font-light focus:outline-none focus:ring-2 focus:ring-primary/20 bg-[#f7f5f2]/40"
            />
          )}
        </div>
      )}
    </div>
  );
}

function CheckboxGroup({
  options,
  values,
  onChange,
}: {
  options: string[];
  values: string[];
  onChange: (val: string[]) => void;
}) {
  const toggle = (opt: string) =>
    onChange(
      values.includes(opt) ? values.filter((v) => v !== opt) : [...values, opt],
    );

  return (
    <div className="space-y-2">
      {options.map((opt) => (
        <label
          key={opt}
          className="flex items-center gap-3 p-3 rounded-xl border border-[#1a1f2e]/10 hover:bg-[#f7f5f2] cursor-pointer transition-colors"
        >
          <input
            type="checkbox"
            checked={values.includes(opt)}
            onChange={() => toggle(opt)}
            className="accent-[#EA5A16] w-4 h-4 flex-shrink-0"
          />
          <span className="text-sm font-light text-[#1a1f2e]">{opt}</span>
        </label>
      ))}
      <label className="flex items-center gap-3 p-3 rounded-xl border border-[#1a1f2e]/10 hover:bg-[#f7f5f2] cursor-pointer transition-colors">
        <input
          type="checkbox"
          checked={values.includes("other")}
          onChange={() => toggle("other")}
          className="accent-[#EA5A16] w-4 h-4 flex-shrink-0"
        />
        <span className="text-sm font-light text-[#1a1f2e]">Other:</span>
      </label>
    </div>
  );
}

function StarRating({
  name,
  value,
  onChange,
}: {
  name: string;
  value: number;
  onChange: (v: number) => void;
}) {
  const labels = ["1 (very dissatisfied)", "2", "3", "4", "5 (very satisfied)"];
  return (
    <div className="space-y-2">
      {[1, 2, 3, 4, 5].map((star, i) => (
        <label
          key={star}
          className="flex items-center gap-3 p-3 rounded-xl border border-[#1a1f2e]/10 hover:bg-[#f7f5f2] cursor-pointer transition-colors"
        >
          <input
            type="radio"
            name={name}
            checked={value === star}
            onChange={() => onChange(star)}
            className="accent-[#EA5A16] w-4 h-4 flex-shrink-0"
          />
          <span className="text-sm font-light text-[#1a1f2e]">{labels[i]}</span>
        </label>
      ))}
    </div>
  );
}

/* =========================
   Internship Form
========================= */
function InternshipForm() {
  const inputClass =
    "w-full px-4 py-3 border border-[#1a1f2e]/10 rounded-xl text-sm font-light text-[#1a1f2e] focus:outline-none focus:ring-2 focus:ring-primary/20 bg-[#f7f5f2]/40 placeholder:text-[#1a1f2e]/30";
  const textareaClass = `${inputClass} resize-none leading-relaxed`;

  const [email, setEmail] = useState("your.email@ensia.edu.dz");
  const [institution, setInstitution] = useState("");
  const [institutionOther, setInstitutionOther] = useState("");
  const [city, setCity] = useState("");
  const [cityOther, setCityOther] = useState("");
  const [howFound, setHowFound] = useState("");
  const [howFoundOther, setHowFoundOther] = useState("");
  const [wasDifficult, setWasDifficult] = useState("");
  const [checkedDifficulties, setCheckedDifficulties] = useState<string[]>([]);
  const [internshipType, setInternshipType] = useState("");
  const [isAI, setIsAI] = useState("");
  const [nonAIArea, setNonAIArea] = useState("");
  const [nonAIAreaOther, setNonAIAreaOther] = useState("");
  const [projectName, setProjectName] = useState("");
  const [overallRating, setOverallRating] = useState(0);
  const [platformRating, setPlatformRating] = useState(0);
  const [likedInternship, setLikedInternship] = useState("");
  const [dislikedInternship, setDislikedInternship] = useState("");
  const [likedPlatform, setLikedPlatform] = useState("");
  const [dislikedPlatform, setDislikedPlatform] = useState("");
  const [otherComment, setOtherComment] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // handle internship form submission here
    console.log({
      email,
      institution: institution === "other" ? institutionOther : institution,
      city: city === "other" ? cityOther : city,
      howFound: howFound === "other" ? howFoundOther : howFound,
      wasDifficult,
      checkedDifficulties,
      internshipType,
      isAI,
      nonAIArea: nonAIArea === "other" ? nonAIAreaOther : nonAIArea,
      projectName,
      overallRating,
      platformRating,
      likedInternship,
      dislikedInternship,
      likedPlatform,
      dislikedPlatform,
      otherComment,
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-10 animate-in fade-in duration-500"
    >
      {/* Email */}
      <FormField label="Email" required>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={inputClass}
        />
        <p className="text-xs text-[#1a1f2e]/40 font-light">
          Record {email} as the email to be included with my response
        </p>
      </FormField>

      {/* Institution */}
      <FormField
        label="Where did you perform your internship (name of institution)?"
        required
      >
        <SelectWithOther
          options={institutions}
          value={institution}
          onChange={setInstitution}
          otherValue={institutionOther}
          onOtherChange={setInstitutionOther}
          placeholder="Select institution..."
        />
      </FormField>

      {/* City */}
      <FormField
        label="In which city did you perform your internship? (in English, uppercase letters, e.g. ALGIERS)"
        required
      >
        <SelectWithOther
          options={cities}
          value={city}
          onChange={setCity}
          otherValue={cityOther}
          onOtherChange={setCityOther}
          placeholder="Select city..."
        />
      </FormField>

      {/* How found */}
      <FormField label="How did you find the internship?" required>
        <RadioGroup
          name="howFound"
          options={[
            "Through the School's Platform",
            "Through a Teacher",
            "On your own",
            "Ignite",
          ]}
          value={howFound}
          onChange={setHowFound}
          otherValue={howFoundOther}
          onOtherChange={setHowFoundOther}
        />
      </FormField>

      {/* Was it difficult */}
      <FormField label="Was it difficult to find an internship?" required>
        <RadioGroup
          name="wasDifficult"
          options={["Yes", "No"]}
          value={wasDifficult}
          onChange={setWasDifficult}
        />
      </FormField>

      {/* Difficulties — only when Yes */}
      {wasDifficult === "Yes" && (
        <FormField label="If it was difficult to find an internship, select and list the main problems you encountered">
          <CheckboxGroup
            options={difficultiesList}
            values={checkedDifficulties}
            onChange={setCheckedDifficulties}
          />
        </FormField>
      )}

      {/* Discovery or Practical */}
      <FormField
        label='Was the internship "Discovery" or "Practical"?'
        required
      >
        <RadioGroup
          name="internshipType"
          options={[
            "Discovery (explored the company)",
            "Practical (worked on a project)",
            "Both",
          ]}
          value={internshipType}
          onChange={setInternshipType}
        />
      </FormField>

      {/* AI related */}
      <FormField
        label="Was the internship related to AI and Data Science?"
        required
      >
        <RadioGroup
          name="isAI"
          options={["Yes", "No", "Somewhat"]}
          value={isAI}
          onChange={setIsAI}
        />
      </FormField>

      {/* Non-AI area — shown if No or Somewhat */}
      {(isAI === "No" || isAI === "Somewhat") && (
        <FormField label="If the internship was not related to AI and Data Science, please specify the main area:">
          <RadioGroup
            name="nonAIArea"
            options={nonAIAreas}
            value={nonAIArea}
            onChange={setNonAIArea}
            otherValue={nonAIAreaOther}
            onOtherChange={setNonAIAreaOther}
          />
        </FormField>
      )}

      {/* Project name — shown if Practical or Both */}
      {(internshipType === "Practical (worked on a project)" ||
        internshipType === "Both") && (
        <FormField label='If the internship was "Practical", briefly name the project you worked in'>
          <input
            type="text"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            placeholder="Project name..."
            className={inputClass}
          />
        </FormField>
      )}

      {/* Overall rating */}
      <FormField
        label="Rate your overall satisfaction with the internship [1-5]"
        required
      >
        <StarRating
          name="overallRating"
          value={overallRating}
          onChange={setOverallRating}
        />
      </FormField>

      {/* Platform rating */}
      <FormField
        label="Rate your satisfaction with the school's internship platform [1-5]"
        required
      >
        <StarRating
          name="platformRating"
          value={platformRating}
          onChange={setPlatformRating}
        />
      </FormField>

      {/* Open-ended questions */}
      <FormField label="Briefly list the things you liked most during your internship">
        <textarea
          rows={4}
          value={likedInternship}
          onChange={(e) => setLikedInternship(e.target.value)}
          placeholder="What stood out positively..."
          className={textareaClass}
        />
      </FormField>

      <FormField label="Briefly list the things you liked less during your internship">
        <textarea
          rows={4}
          value={dislikedInternship}
          onChange={(e) => setDislikedInternship(e.target.value)}
          placeholder="What could have been better..."
          className={textareaClass}
        />
      </FormField>

      <FormField label="Briefly list the things you liked most about the school's internship platform">
        <textarea
          rows={4}
          value={likedPlatform}
          onChange={(e) => setLikedPlatform(e.target.value)}
          placeholder="Positive aspects of the platform..."
          className={textareaClass}
        />
      </FormField>

      <FormField label="Briefly list the things you liked less about the school's internship platform">
        <textarea
          rows={4}
          value={dislikedPlatform}
          onChange={(e) => setDislikedPlatform(e.target.value)}
          placeholder="What could be improved..."
          className={textareaClass}
        />
      </FormField>

      <FormField label="Any other comment?">
        <textarea
          rows={4}
          value={otherComment}
          onChange={(e) => setOtherComment(e.target.value)}
          placeholder="Any additional thoughts..."
          className={textareaClass}
        />
      </FormField>

      {/* Submit */}
      <button
        type="submit"
        className="w-full bg-[#1a1f2e] text-white py-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:bg-[#2f3952] hover:shadow-[0_8px_25px_rgba(26,31,46,0.25)] hover:-translate-y-0.5 active:translate-y-0 active:shadow-none cursor-pointer font-medium tracking-wide flex items-center justify-center gap-3"
      >
        Submit Internship Feedback
        <Send className="w-4 h-4" />
      </button>
    </form>
  );
}

/* =========================
   Main Component
========================= */
export function FeedbackPage() {
  const [showInternshipForm, setShowInternshipForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "", // 👈 add
    year_of_study: "", // 👈 add
    school: "", // 👈 add
    feedback: "",
    category: "general",
    company_name: "",
    rating: 0,
  });
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    async function fetchCompanies() {
      try {
        const data = await getCompanies();
        setCompanies(data);
      } catch (err) {
        console.error("Error fetching companies:", err);
      }
    }
    fetchCompanies();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      await createFeedback({
        person_name: formData.name,
        email: formData.email, // 👈 add
        year_of_study: formData.year_of_study, // 👈 add
        school: formData.school, // 👈 add
        feedback: formData.feedback,
        category: formData.category,
        company_name:
          formData.category === "company" ? formData.company_name : null,
      });
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#EA5A16", "#1a1f2e", "#ffffff"],
      });
      setSubmitted(true);
    } catch (err: any) {
      setError("Error submitting feedback: " + (err.message || err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  /* ---------- Success screen ---------- */
  if (submitted) {
    return (
      <div
        className="min-h-screen pt-28 pb-20 font-dm flex items-center justify-center"
        style={{ backgroundColor: "#0d0f18" }}
      >
        <div className="container mx-auto px-6 max-w-2xl text-center">
          <div className="bg-white rounded-3xl border border-[#1a1f2e]/5 p-16 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-8">
              <MessageSquare className="w-10 h-10 text-primary" />
            </div>
            <h2 className="text-4xl font-light text-[#1a1f2e] mb-4 tracking-tight">
              Thank You!
            </h2>
            <p className="text-[#1a1f2e]/60 font-light mb-12">
              Your feedback helps us make Ignite even better for everyone.
            </p>
            <Link
              to="/"
              className="inline-flex items-center justify-center gap-3 bg-[#1a1f2e] hover:bg-[#2F3952] text-white px-10 py-4 rounded-xl transition-all duration-300 font-eagle text-sm tracking-[0.15em] uppercase"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  /* ---------- Main render ---------- */
  return (
    <div
      className="min-h-screen pt-28 pb-20 font-dm"
      style={{ backgroundColor: "#f7f5f2" }}
    >
      <div className="container mx-auto px-6 max-w-2xl">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="text-xs uppercase tracking-[0.4em] text-primary/70 font-medium mb-6 flex items-center justify-center gap-4">
            <div className="h-px w-8 bg-primary/30" />
            {showInternshipForm ? "4th Year Internship" : "Your Experience"}
            <div className="h-px w-8 bg-primary/30" />
          </span>
          <h1 className="mb-4 text-5xl md:text-6xl font-light tracking-tight text-[#1a1f2e]">
            {showInternshipForm ? "Internship Feedback" : "Tell Us Your Story"}
          </h1>
          <p className="text-base text-[#1a1f2e]/60 font-light max-w-lg mx-auto leading-relaxed">
            {showInternshipForm
              ? "Dear fourth-year students, we would like to gather your feedback regarding your first internship experience. Your participation is greatly appreciated."
              : "Every journey at Ignite is unique. We'd love to hear about your experience, the connections you made, and the moments that inspired you."}
          </p>
        </div>

        <div className="bg-white rounded-[2rem] border border-[#1a1f2e]/5 p-10 md:p-14 shadow-[0_20px_50px_rgba(26,31,46,0.04)] relative overflow-hidden">
          {/* Decorative blobs */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-secondary/5 rounded-full -ml-16 -mb-16 blur-3xl pointer-events-none" />

          {showInternshipForm ? (
            <InternshipForm />
          ) : (
            <form onSubmit={handleSubmit} className="space-y-10 relative z-10">
              {/* Name */}
              <div>
                <label className="flex items-center gap-2 mb-4 font-medium text-[#1a1f2e]">
                  <div className="bg-primary/10 p-1.5 rounded-lg">
                    <User className="w-4 h-4 text-primary" />
                  </div>
                  Your Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="What should we call you?"
                  className="w-full px-6 py-4 bg-[#f7f5f2]/40 border border-[#1a1f2e]/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-[#1a1f2e] font-light placeholder:text-[#1a1f2e]/30"
                />
              </div>

              {/* Email */}
              <div>
                <label className="flex items-center gap-2 mb-4 font-medium text-[#1a1f2e]">
                  <div className="bg-primary/10 p-1.5 rounded-lg">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-4 h-4 text-primary"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <rect width="20" height="16" x="2" y="4" rx="2" />
                      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                    </svg>
                  </div>
                  Your Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="your@email.com"
                  className="w-full px-6 py-4 bg-[#f7f5f2]/40 border border-[#1a1f2e]/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-[#1a1f2e] font-light placeholder:text-[#1a1f2e]/30"
                />
              </div>

              {/* Year of Study */}
              <div>
                <label className="flex items-center gap-2 mb-4 font-medium text-[#1a1f2e]">
                  <div className="bg-primary/10 p-1.5 rounded-lg">
                    <Info className="w-4 h-4 text-primary" />
                  </div>
                  Year of Study
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {["1st Year", "2nd Year", "3rd Year", "4th Year" , "5th Year"].map(
                    (year) => (
                      <button
                        key={year}
                        type="button"
                        onClick={() =>
                          setFormData({ ...formData, year_of_study: year })
                        }
                        className={`flex items-center justify-center px-4 py-2.5 rounded-full border text-xs transition-all duration-500 ${
                          formData.year_of_study === year
                            ? "bg-[#1a1f2e] border-[#1a1f2e] text-white shadow-lg shadow-[#1a1f2e]/20 scale-105"
                            : "bg-white border-[#1a1f2e]/10 text-[#1a1f2e]/60 hover:border-primary/30 hover:text-[#1a1f2e]"
                        }`}
                      >
                        <span className="font-medium tracking-tight">
                          {year}
                        </span>
                      </button>
                    ),
                  )}
                </div>
              </div>

              {/* School */}
              <div>
                <label className="flex items-center gap-2 mb-4 font-medium text-[#1a1f2e]">
                  <div className="bg-primary/10 p-1.5 rounded-lg">
                    <Building2 className="w-4 h-4 text-primary" />
                  </div>
                  School / Institution
                </label>
                <input
                  type="text"
                  name="school"
                  value={formData.school}
                  onChange={handleChange}
                  required
                  placeholder="e.g. ENSIA, ESI, USTHB..."
                  className="w-full px-6 py-4 bg-[#f7f5f2]/40 border border-[#1a1f2e]/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-[#1a1f2e] font-light placeholder:text-[#1a1f2e]/30"
                />
              </div>

              {/* Category */}
              <div>
                <label className="flex items-center gap-2 mb-5 font-medium text-[#1a1f2e]">
                  <div className="bg-primary/10 p-1.5 rounded-lg">
                    <Info className="w-4 h-4 text-primary" />
                  </div>
                  What is your story about?
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { id: "general", label: "General", icon: MessageSquare },
                    { id: "company", label: "Company", icon: Building2 },
                    { id: "logistic", label: "Logistic", icon: Truck },
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() =>
                        setFormData({ ...formData, category: cat.id })
                      }
                      className={`flex items-center justify-center gap-2 px-4 py-2 rounded-full border text-xs transition-all duration-500 ${
                        formData.category === cat.id
                          ? "bg-[#1a1f2e] border-[#1a1f2e] text-white shadow-lg shadow-[#1a1f2e]/20 scale-105"
                          : "bg-white border-[#1a1f2e]/10 text-[#1a1f2e]/60 hover:border-primary/30 hover:text-[#1a1f2e]"
                      }`}
                    >
                      <cat.icon
                        className={`w-3 h-3 ${formData.category === cat.id ? "text-white" : "text-primary/60"}`}
                      />
                      <span className="font-medium tracking-tight">
                        {cat.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Company dropdown — only when category is "company" */}
              {formData.category === "company" && (
                <div className="animate-in fade-in slide-in-from-top-4 duration-500">
                  <label className="flex items-center gap-2 mb-3 font-medium text-[#1a1f2e] text-sm">
                    <div className="bg-primary/10 p-1 rounded-lg">
                      <Building2 className="w-3.5 h-3.5 text-primary" />
                    </div>
                    Which company?
                  </label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      className="w-full flex items-center justify-between px-5 py-2.5 bg-[#f7f5f2]/40 border border-[#1a1f2e]/10 rounded-xl text-[#1a1f2e] font-light text-xs transition-all hover:border-primary/30"
                    >
                      <span className="truncate">
                        {formData.company_name || "Select company..."}
                      </span>
                      <ChevronDown
                        className={`w-3.5 h-3.5 transition-transform duration-500 ${isDropdownOpen ? "rotate-180" : ""}`}
                      />
                    </button>
                    {isDropdownOpen && (
                      <div className="absolute z-50 w-full mt-2 bg-white border border-[#1a1f2e]/10 rounded-xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-300">
                        <div className="max-h-[168px] overflow-y-auto scrollbar-hide">
                          {companies.map((company) => (
                            <button
                              key={company.id}
                              type="button"
                              className="w-full text-left px-5 py-2.5 text-xs hover:bg-primary/5 transition-colors text-[#1a1f2e] font-light border-b border-[#1a1f2e]/5 last:border-0"
                              onClick={() => {
                                setFormData({
                                  ...formData,
                                  company_name: company.name || "",
                                });
                                setIsDropdownOpen(false);
                              }}
                            >
                              {company.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Story / Feedback */}
              <div>
                <label className="flex items-center gap-2 mb-4 font-medium text-[#1a1f2e]">
                  <div className="bg-primary/10 p-1.5 rounded-lg">
                    <MessageSquare className="w-4 h-4 text-primary" />
                  </div>
                  Your Story
                </label>
                <div className="relative">
                  <textarea
                    name="feedback"
                    value={formData.feedback}
                    onChange={handleChange}
                    required
                    rows={6}
                    placeholder="Share your experience — the highlights, the challenges, the people you met..."
                    className="w-full px-7 py-6 bg-[#f7f5f2]/40 border border-[#1a1f2e]/10 rounded-[2rem] focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-[#1a1f2e] font-light resize-none leading-relaxed placeholder:text-[#1a1f2e]/30"
                  />
                  <div className="absolute bottom-6 right-8 opacity-10 pointer-events-none">
                    <MessageSquare className="w-12 h-12 text-[#1a1f2e]" />
                  </div>
                </div>
                <p className="text-xs text-[#1a1f2e]/30 font-light mt-2 text-right pr-2">
                  {formData.feedback.length} characters
                </p>
              </div>

              {/* Rating */}
              <div>
                <label className="flex items-center gap-2 mb-4 font-medium text-[#1a1f2e]">
                  <div className="bg-primary/10 p-1.5 rounded-lg">
                    <Info className="w-4 h-4 text-primary" />
                  </div>
                  Overall Experience
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFormData({ ...formData, rating: star })}
                      className={`flex-1 py-3 rounded-xl border text-sm font-medium transition-all duration-300 ${
                        formData.rating >= star
                          ? "bg-[#1a1f2e] border-[#1a1f2e] text-white shadow-md"
                          : "bg-white border-[#1a1f2e]/10 text-[#1a1f2e]/40 hover:border-primary/30"
                      }`}
                    >
                      {star}
                    </button>
                  ))}
                </div>
                <div className="flex justify-between mt-1.5 px-1">
                  <span className="text-[10px] text-[#1a1f2e]/30 font-light">
                    Poor
                  </span>
                  <span className="text-[10px] text-[#1a1f2e]/30 font-light">
                    Excellent
                  </span>
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="p-4 bg-red-50 text-red-600 rounded-2xl border border-red-100 text-sm font-medium text-center">
                  {error}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#1a1f2e] text-white py-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:bg-[#2f3952] hover:shadow-[0_8px_25px_rgba(26,31,46,0.25)] hover:-translate-y-0.5 active:translate-y-0 active:shadow-none cursor-pointer font-medium tracking-wide flex items-center justify-center gap-3"
              >
                {isSubmitting ? (
                  "Sending..."
                ) : (
                  <>
                    Share Your Story
                    <Send className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Toggle button */}
          <button
            type="button"
            onClick={() => setShowInternshipForm((prev) => !prev)}
            className="w-full mt-6 bg-[#1a1f2e] text-white py-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:bg-[#2f3952] hover:shadow-[0_8px_25px_rgba(26,31,46,0.25)] hover:-translate-y-0.5 active:translate-y-0 active:shadow-none cursor-pointer font-medium tracking-wide relative z-10"
          >
            {showInternshipForm
              ? "← Back to Ignite Feedback"
              : "Show Previous Internship Form"}
          </button>
        </div>
      </div>
    </div>
  );
}
