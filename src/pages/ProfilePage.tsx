import { useState, useEffect } from "react";
import { useParams } from "react-router";
import { QRCodeSVG } from "qrcode.react";
import { User, Mail, GraduationCap, School, Upload, Download, QrCode, Trash, Flame } from "lucide-react";
import { getUserById, updateUser } from "../lib/api";
import { supabase } from "../lib/supabase";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  year: string;
  school: string;
  cvFileName?: string;
  cvUrl?: string;
  cvPath?: string;
}

export function ProfilePage() {
  const { userId } = useParams();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [showQR, setShowQR] = useState(false);

  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState("");
  const [cvActionError, setCvActionError] = useState("");

  useEffect(() => {
    if (userId) {
      getUserById(Number(userId))
        .then(user => {
          let cvUrl = "";
          let cvFileName = "";
          
          if (user.cv_path) {
            const { data } = supabase.storage.from("cvs").getPublicUrl(user.cv_path);
            cvUrl = data.publicUrl;
            cvFileName = user.cv_path.split("/").pop() || "Resume.pdf";
          } else {
            // Fallback to local storage for backward compatibility
            const storedCV = localStorage.getItem(`cv_${user.id}`);
            if (storedCV) {
              cvFileName = storedCV;
            }
          }

          setProfile({
            id: user.id.toString(),
            name: user.name || '',
            email: user.email || '',
            year: user.year_of_study || '',
            school: user.school || '',
            cvFileName,
            cvUrl,
            cvPath: user.cv_path || ''
          });
        })
        .catch(console.error);
    }
  }, [userId]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setUploadError("");
    
    if (file && file.type === 'application/pdf' && profile) {
      if (file.size > 5 * 1024 * 1024) {
        setUploadError("File is too large. Please upload a PDF under 5MB.");
        return;
      }

      setIsUploading(true);
      setUploadProgress(0);
      
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) return prev;
          return prev + Math.floor(Math.random() * 15) + 5;
        });
      }, 400);

      try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${profile.id}_${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `${profile.id}/${fileName}`;

        // Upload to Storage
        const { error: uploadError } = await supabase.storage
          .from("cvs")
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        // Get the public URL
        const { data } = supabase.storage.from("cvs").getPublicUrl(filePath);
        
        // Update user record in database
        await updateUser(Number(profile.id), { cv_path: filePath });

        setUploadProgress(100);
        
        setTimeout(() => {
          setProfile({ 
            ...profile, 
            cvFileName: file.name,
            cvUrl: data.publicUrl,
            cvPath: filePath
          });
          setIsUploading(false);
        }, 600);
        
      } catch (error: any) {
        console.error("Error uploading CV:", error);
        setUploadError("Failed to upload CV: " + (error.message || "Unknown error"));
        setIsUploading(false);
      } finally {
        clearInterval(progressInterval);
      }
    } else if (file && file.type !== 'application/pdf') {
      setUploadError("Please upload a valid PDF file.");
    }
  };

  const handleDownloadCV = () => {
    setCvActionError("");
    if (profile?.cvUrl) {
      window.open(profile.cvUrl, '_blank');
    } else {
      setCvActionError('No CV found.');
    }
  };

  const handleDeleteCV = async () => {
    if (!profile || !profile.cvPath) return;
    setCvActionError("");

    setIsDeleting(true);
    try {
      const { error: deleteError } = await supabase.storage
        .from("cvs")
        .remove([profile.cvPath]);

      if (deleteError) throw deleteError;

      await updateUser(Number(profile.id), { cv_path: null });

      setProfile({
        ...profile,
        cvFileName: undefined,
        cvUrl: undefined,
        cvPath: undefined
      });
      
    } catch (error: any) {
      console.error("Error deleting CV:", error);
      setCvActionError("Failed to delete CV: " + (error.message || "Unknown error"));
    } finally {
      setIsDeleting(false);
    }
  };

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="mb-4">Profile Not Found</h2>
          <p className="text-muted-foreground">Please register first to create your profile.</p>
        </div>
      </div>
    );
  }

  const profileUrl = `${window.location.origin}/profile/${profile.id}`;
  const qrValue = profile.cvUrl || profileUrl;

  return (
    <div className="min-h-screen pt-28 pb-20 font-dm" style={{ backgroundColor: "#f7f5f2" }}>
      <div className="container mx-auto px-6 max-w-5xl">
        <div className="mb-20 text-center">
          <span className="text-xs uppercase tracking-[0.4em] text-primary/70 font-medium mb-6 block flex items-center justify-center gap-4">
            <div className="h-px w-8 bg-primary/30" />
            Profile
            <div className="h-px w-8 bg-primary/30" />
          </span>
          <h1 className="mb-4 text-5xl md:text-6xl font-light tracking-tight text-[#1a1f2e]">My Profile</h1>
          <p className="text-base text-[#1a1f2e]/60 font-light">
            Manage your profile and share your information with companies.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-3xl border border-[#1a1f2e]/5 p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
              <h3 className="mb-8 text-2xl font-light text-[#1a1f2e]">Personal Information</h3>
              <div className="space-y-5">
                <div className="flex items-start gap-4 p-5 bg-[#f7f5f2]/50 border border-[#1a1f2e]/5 rounded-2xl overflow-hidden">
                  <div className="bg-gradient-to-br from-primary/20 to-primary/10 p-2.5 rounded-xl shrink-0">
                    <User className="w-5 h-5 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-[#1a1f2e]/50 font-medium mb-1">Full Name</p>
                    <p className="font-medium text-lg text-[#1a1f2e] truncate w-full" title={profile.name}>{profile.name}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-5 bg-[#f7f5f2]/50 border border-[#1a1f2e]/5 rounded-2xl overflow-hidden">
                  <div className="bg-gradient-to-br from-primary/20 to-primary/10 p-2.5 rounded-xl shrink-0">
                    <Mail className="w-5 h-5 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-[#1a1f2e]/50 font-medium mb-1">Email</p>
                    <p className="font-medium text-lg text-[#1a1f2e] truncate w-full" title={profile.email}>{profile.email}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-5 bg-[#f7f5f2]/50 border border-[#1a1f2e]/5 rounded-2xl overflow-hidden">
                  <div className="bg-gradient-to-br from-primary/20 to-primary/10 p-2.5 rounded-xl shrink-0">
                    <GraduationCap className="w-5 h-5 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-[#1a1f2e]/50 font-medium mb-1">Year of Study</p>
                    <p className="font-medium text-lg text-[#1a1f2e] truncate w-full" title={profile.year}>{profile.year}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-5 bg-[#f7f5f2]/50 border border-[#1a1f2e]/5 rounded-2xl overflow-hidden">
                  <div className="bg-gradient-to-br from-primary/20 to-primary/10 p-2.5 rounded-xl shrink-0">
                    <School className="w-5 h-5 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-[#1a1f2e]/50 font-medium mb-1">School</p>
                    <p className="font-medium text-lg text-[#1a1f2e] truncate w-full" title={profile.school}>{profile.school}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-[#1a1f2e]/5 p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
              <h3 className="mb-8 text-2xl font-light text-[#1a1f2e]">CV Management</h3>

              {profile.cvFileName ? (
                <div className="space-y-5">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-6 bg-accent/5 border border-accent/20 rounded-2xl gap-4 overflow-hidden">
                    <div className="flex items-center gap-4 min-w-0 flex-1">
                      <div className="bg-white border border-accent/20 p-3 rounded-xl shadow-sm shrink-0">
                        <Upload className="w-6 h-6 text-accent" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-[#1a1f2e] text-lg truncate w-full" title={profile.cvFileName}>{profile.cvFileName}</p>
                        <p className="text-sm text-[#1a1f2e]/50 font-light">Uploaded successfully</p>
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                      <button
                        onClick={handleDownloadCV}
                        disabled={!profile.cvUrl}
                        className="flex items-center gap-2 bg-white border border-[#1a1f2e]/10 hover:border-[#1a1f2e]/30 hover:bg-[#f7f5f2] text-[#1a1f2e] px-6 py-3 rounded-xl transition-all duration-300 font-eagle text-xs tracking-[0.15em] uppercase w-full sm:w-auto justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Download className="w-4 h-4" />
                        View CV
                      </button>
                      <button
                        onClick={handleDeleteCV}
                        disabled={isDeleting}
                        className="flex items-center gap-2 bg-red-50 border border-red-100 hover:border-red-300 hover:bg-red-100 text-red-600 px-6 py-3 rounded-xl transition-all duration-300 font-eagle text-xs tracking-[0.15em] uppercase w-full sm:w-auto justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Trash className="w-4 h-4" />
                        {isDeleting ? "Deleting..." : "Delete CV"}
                      </button>
                    </div>
                  </div>
                  {cvActionError && (
                    <p className="text-red-500 text-sm font-medium bg-red-50 py-2 px-4 rounded-lg inline-block mt-2">{cvActionError}</p>
                  )}
                </div>
              ) : (
                <label className="block">
                  <div className="border-2 border-dashed border-[#1a1f2e]/10 hover:border-primary/50 rounded-2xl p-10 text-center cursor-pointer transition-all hover:bg-[#f7f5f2]">
                    {isUploading ? (
                      <div className="relative w-16 h-16 mx-auto mb-4 flex items-end justify-center">
                        <Flame className="w-16 h-16 text-[#1a1f2e]/10 absolute bottom-0" strokeWidth={1.5} />
                        <div 
                          className="absolute bottom-0 overflow-hidden w-full transition-all duration-300 ease-out"
                          style={{ height: `${uploadProgress}%` }}
                        >
                          <Flame className="w-16 h-16 text-red-500 fill-red-500 absolute bottom-0 left-0" strokeWidth={1.5} />
                        </div>
                      </div>
                    ) : (
                      <Upload className="w-16 h-16 text-[#1a1f2e]/30 mx-auto mb-4" />
                    )}
                    <h4 className="mb-3 text-xl font-light text-[#1a1f2e]">
                      {isUploading ? "Uploading CV..." : "Upload Your CV"}
                    </h4>
                    <p className="text-sm text-[#1a1f2e]/50 font-light mb-4">
                      {isUploading 
                        ? `${uploadProgress}%` 
                        : "Click to select a PDF file or drag and drop"}
                    </p>
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={handleFileUpload}
                      disabled={isUploading}
                      className="hidden"
                    />
                    {uploadError && (
                      <p className="text-red-500 text-sm mt-4 font-medium bg-red-50 py-2 px-4 rounded-lg inline-block">{uploadError}</p>
                    )}
                  </div>
                </label>
              )}

              <div className="mt-8 p-6 bg-gradient-to-r from-accent/10 to-accent/5 border border-accent/20 rounded-2xl">
                <p className="text-sm text-[#1a1f2e]/70 leading-relaxed font-light">
                  <strong className="font-medium text-[#1a1f2e]">Note:</strong> Your CV will be securely stored and accessible via your QR code.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <div className="bg-white rounded-3xl border border-[#1a1f2e]/5 p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
              <h3 className="mb-4 text-2xl font-light text-[#1a1f2e]">Your QR Code</h3>
              <p className="text-sm text-[#1a1f2e]/60 mb-8 leading-relaxed font-light">
                Companies can scan this to quickly access your profile and CV.
              </p>

              <div className="bg-white p-8 rounded-2xl mb-8 border border-[#1a1f2e]/10 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                <QRCodeSVG
                  value={qrValue}
                  size={200}
                  level="H"
                  className="w-full h-auto"
                />
              </div>

              <button
                onClick={() => setShowQR(!showQR)}
                className="w-full flex items-center justify-center gap-3 bg-[#1a1f2e] hover:bg-[#2F3952] text-white px-8 py-4 rounded-xl transition-all duration-300 hover:shadow-[0_8px_20px_rgba(26,31,46,0.2)] font-eagle text-sm tracking-[0.15em] uppercase"
              >
                <QrCode className="w-5 h-5" />
                {showQR ? 'Hide' : 'Show'} Full Screen
              </button>
            </div>

            
          </div>
        </div>

        {showQR && (
          <div
            className="fixed inset-0 bg-[#f7f5f2]/95 backdrop-blur-xl z-50 flex items-center justify-center p-4"
            onClick={() => setShowQR(false)}
          >
            <div className="bg-white p-12 rounded-[2.5rem] max-w-lg w-full shadow-[0_20px_60px_rgb(0,0,0,0.15)] border border-[#1a1f2e]/10 overflow-hidden">
              <h2 className="text-center mb-8 text-3xl text-[#1a1f2e] font-light tracking-tight truncate px-2" title={profile.name}>{profile.name}</h2>
              <div className="bg-white p-8 rounded-3xl border border-[#1a1f2e]/10 shadow-[0_8px_30px_rgb(0,0,0,0.06)] mb-8">
                <QRCodeSVG
                  value={qrValue}
                  size={400}
                  level="H"
                  className="w-full h-auto"
                />
              </div>
              <p className="text-center text-[15px] text-[#1a1f2e]/60 font-light tracking-wide">
                Scan to view profile and CV
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
