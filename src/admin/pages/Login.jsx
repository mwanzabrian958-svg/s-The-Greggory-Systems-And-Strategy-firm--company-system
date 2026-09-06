import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Shield, X, UserPlus, Eye, EyeOff,
  ArrowLeft, CheckCircle, RefreshCw, Camera, Upload
} from "lucide-react";
import { apiCall } from "../../services/api";
import { useTheme } from "../../context/ThemeContext";

/**
 * REDESIGNED: Authentication Platform UI
 * Centered layout with glassmorphism, brand alignment, and profile photo integration.
 */
export function Login({ onLoginSuccess }) {
  const { darkMode } = useTheme();
  const navigate = useNavigate();
  const [view, setView] = useState("platform");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [detectedPhoto, setDetectedPhoto] = useState(null);

  const [regStep, setRegStep] = useState(1);
  const [regData, setRegData] = useState({
    first_name: "", last_name: "", email: "",
    password: "", confirmPassword: ""
  });

  const [photoPreview, setPhotoPreview] = useState(null);
  const [photoBase64, setPhotoBase64] = useState(null);
  const fileInputRef = useRef(null);

  // Identity Depth-Scan: Detect photo by email
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (email && email.includes('@') && email.length > 5 && view === "admin") {
         try {
           const res = await apiCall(`/admin/profile-lookup?email=${encodeURIComponent(email)}`);
           if (res.success && res.photoData) {
             setDetectedPhoto(res.photoData);
           } else {
             setDetectedPhoto(null);
           }
         } catch (e) {
           setDetectedPhoto(null);
         }
      }
    }, 800);
    return () => clearTimeout(timer);
  }, [email, view]);

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) return setError("Image must be under 5MB");

    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoPreview(reader.result);
      setPhotoBase64(reader.result.split(',')[1]);
    };
    reader.readAsDataURL(file);
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await apiCall("/admin-verification/authenticate-enhanced", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      const session = {
        user: data.user,
        token: data.token,
        expiresAt: Date.now() + 24 * 60 * 60 * 1000,
      };
      localStorage.setItem("gf_admin_session", JSON.stringify(session));
      localStorage.setItem("gf_admin_session_token", data.token);
      if (onLoginSuccess) onLoginSuccess(data.user);
      window.dispatchEvent(new Event("gf-admin-session-changed"));
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(err.message || "Credential verification failure.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (regData.password !== regData.confirmPassword) return setError("Passwords do not match");
    setLoading(true);
    try {
      let profile_image_id = null;
      if (photoBase64) {
        const imgRes = await apiCall("/images/profile", {
          method: "POST",
          body: JSON.stringify({ dataBase64: photoBase64, contentType: "image/jpeg" })
        });
        profile_image_id = imgRes.image_id;
      }

      const data = await apiCall("/admin-verification/register", {
        method: "POST",
        body: JSON.stringify({ ...regData, role: "admin", profile_image_id }),
      });
      if (data.success) setRegStep(3);
      else setError(data.message || "Registration failure.");
    } catch (err) {
      setError(err.message || "Network relay failure.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#002D62] dark:bg-[#00122B] flex items-center justify-center font-sans relative overflow-hidden transition-colors duration-700">
      {/* Dynamic Background Elements */}
      <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-white/5 dark:bg-[#3B82F6]/5 blur-[120px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-white/5 dark:bg-[#3B82F6]/5 blur-[120px] rounded-full pointer-events-none"></div>

      <div className="relative z-10 w-full max-w-md px-6 animate-in fade-in zoom-in-95 duration-500">

        {/* Brand Identity */}
        <div className="flex flex-col items-center mb-10">
          <div className="w-16 h-16 rounded-full border border-white/30 dark:border-[#3B82F6]/30 p-1 mb-4 flex items-center justify-center overflow-hidden bg-white/5 shadow-2xl">
             {(view === "admin" && detectedPhoto) ? (
                <img src={detectedPhoto} alt="Identity" className="w-full h-full object-cover" />
             ) : (
                <img src="/logo.jpg" alt="GS" className="w-full h-full rounded-full object-cover grayscale brightness-125" />
             )}
          </div>
          <h2 className="text-[10px] font-black uppercase tracking-[0.6em] text-white dark:text-[#3B82F6]/60">Greggory Systems</h2>
          <div className="h-px w-12 bg-gradient-to-r from-transparent via-white/40 dark:via-[#3B82F6]/40 to-transparent mt-4"></div>
        </div>

        <div className="bg-white/10 dark:bg-white/[0.02] border border-white/20 dark:border-white/5 backdrop-blur-3xl rounded-[32px] p-8 md:p-10 shadow-2xl relative overflow-hidden">
          {/* Internal Glow */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/30 dark:via-[#3B82F6]/30 to-transparent"></div>

          {view === "platform" && (
            <div className="text-center space-y-8 animate-in slide-in-from-bottom-2 duration-500">
              <div>
                <h1 className="text-lg font-black text-white uppercase tracking-[0.2em] mb-2">Access Portal</h1>
                <p className="text-[8px] text-white/60 dark:text-zinc-500 font-bold uppercase tracking-widest leading-loose">Secure hand-shake protocol required for <br/> system entry.</p>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => setView("admin")}
                  className="w-full bg-white dark:bg-[#3B82F6] hover:bg-zinc-200 dark:hover:bg-[#2563EB] text-[#002D62] dark:text-white py-3.5 rounded-2xl text-[9px] font-black uppercase tracking-[0.3em] transition-all shadow-xl shadow-black/10 dark:shadow-[#3B82F6]/10"
                >
                  Initiate Handshake
                </button>
                <button
                  onClick={() => { setView("register"); setError(""); }}
                  className="w-full text-[8px] font-black text-white/70 dark:text-zinc-500 uppercase tracking-[0.3em] hover:text-white dark:hover:text-[#3B82F6] transition-colors py-2"
                >
                  Register New Node
                </button>
              </div>
            </div>
          )}

          {view === "admin" && (
            <div className="animate-in fade-in slide-in-from-right-2 duration-300">
              <div className="flex items-center justify-between mb-8">
                 <button onClick={() => setView("platform")} className="text-white/50 dark:text-zinc-500 hover:text-white transition-colors"><ArrowLeft size={16} /></button>
                 <h2 className="text-[10px] font-black text-white uppercase tracking-[0.4em]">Identity Relay</h2>
                 <div className="w-4"></div>
              </div>

              {error && (
                <div className="mb-6 p-3 bg-rose-500/20 border border-rose-500/30 rounded-xl flex items-center gap-3">
                  <Shield className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                  <span className="text-rose-500 text-[8px] font-black uppercase tracking-widest leading-tight">{error}</span>
                </div>
              )}

              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-[7px] font-black text-white/50 dark:text-zinc-500 uppercase tracking-widest ml-1">Relay ID</label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full bg-white/10 dark:bg-white/5 border border-white/20 dark:border-white/10 rounded-xl px-4 py-3 text-[10px] font-bold text-white outline-none focus:border-white/50 dark:focus:border-[#3B82F6]/50 transition-all" placeholder="Enter email..." />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[7px] font-black text-white/50 dark:text-zinc-500 uppercase tracking-widest ml-1">Secure Key</label>
                  <div className="relative">
                    <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full bg-white/10 dark:bg-white/5 border border-white/20 dark:border-white/10 rounded-xl px-4 py-3 text-[10px] font-bold text-white outline-none focus:border-white/50 dark:focus:border-[#3B82F6]/50 transition-all pr-12" placeholder="••••••••" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50 dark:text-zinc-500 hover:text-white dark:hover:text-[#3B82F6] transition-colors">
                      {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>
                <button type="submit" disabled={loading} className="w-full bg-[#D4AF37] hover:bg-[#B8860B] text-black py-4 rounded-xl text-[9px] font-black uppercase tracking-[0.3em] transition-all flex items-center justify-center gap-3 disabled:opacity-50 mt-6 shadow-xl">
                  {loading ? <RefreshCw className="animate-spin" size={14} /> : "Login"}
                </button>
                 <button
                   type="button"
                   onClick={() => { setView("register"); setError(""); }}
                   className="w-full mt-3 py-2.5 rounded-xl text-[8px] font-black text-white/60 dark:text-zinc-500 uppercase tracking-[0.3em] border border-white/20 dark:border-white/10 hover:text-white hover:border-[#D4AF37] dark:hover:border-[#D4AF37] transition-all"
                 >
                   Register New Node
                 </button>
              </form>
            </div>
          )}

          {view === "register" && (
            <div className="animate-in fade-in slide-in-from-right-2 duration-300">
               <div className="flex items-center justify-between mb-8">
                 <button onClick={() => setView("platform")} className="text-white/50 dark:text-zinc-500 hover:text-white transition-colors"><ArrowLeft size={16} /></button>
                 <h2 className="text-[10px] font-black text-white uppercase tracking-[0.4em]">Node Sync</h2>
                 <div className="w-4"></div>
              </div>

              {regStep === 3 ? (
                <div className="text-center py-6">
                  <div className="w-12 h-12 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-500/30">
                    <CheckCircle className="w-6 h-6 text-emerald-500" />
                  </div>
                  <h3 className="text-sm font-black text-white uppercase tracking-widest mb-2">Sync Complete</h3>
                  <p className="text-[8px] text-white/60 dark:text-zinc-500 font-bold uppercase tracking-widest mb-8 leading-relaxed">Your identity node has been <br/> Solidified in the matrix.</p>
                  <button onClick={() => setView("admin")} className="w-full bg-[#D4AF37] hover:bg-[#B8860B] text-black py-3.5 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-xl">Proceed to Verification</button>
                </div>
              ) : (
                <form onSubmit={handleRegisterSubmit} className="space-y-4">
                  {/* Profile Photo Upload */}
                  <div className="flex flex-col items-center mb-6">
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="w-20 h-20 rounded-2xl bg-white/5 border border-white/20 flex items-center justify-center cursor-pointer hover:bg-white/10 transition-all relative overflow-hidden group shadow-inner"
                    >
                      {photoPreview ? (
                        <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <Camera className="w-6 h-6 text-white/40 group-hover:text-white/60" />
                      )}
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Upload className="w-4 h-4 text-white" />
                      </div>
                    </div>
                    <p className="text-[7px] font-black text-white/40 uppercase tracking-widest mt-2">Upload Profile Node</p>
                    <input type="file" ref={fileInputRef} onChange={handlePhotoChange} accept="image/*" className="hidden" />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <input type="text" placeholder="First Name" value={regData.first_name} onChange={(e) => setRegData({...regData, first_name: e.target.value})} required className="w-full bg-white/10 dark:bg-white/5 border border-white/20 dark:border-white/10 rounded-xl px-4 py-3 text-[10px] font-bold text-white outline-none focus:border-white/50 dark:focus:border-[#3B82F6]/40" />
                    <input type="text" placeholder="Last Name" value={regData.last_name} onChange={(e) => setRegData({...regData, last_name: e.target.value})} required className="w-full bg-white/10 dark:bg-white/5 border border-white/20 dark:border-white/10 rounded-xl px-4 py-3 text-[10px] font-bold text-white outline-none focus:border-white/50 dark:focus:border-[#3B82F6]/40" />
                  </div>
                  <input type="email" placeholder="Relay Email" value={regData.email} onChange={(e) => setRegData({...regData, email: e.target.value})} required className="w-full bg-white/10 dark:bg-white/5 border border-white/20 dark:border-white/10 rounded-xl px-4 py-3 text-[10px] font-bold text-white outline-none focus:border-white/50 dark:focus:border-[#3B82F6]/40" />
                  <input type="password" placeholder="Access Key" value={regData.password} onChange={(e) => setRegData({...regData, password: e.target.value})} required minLength={6} className="w-full bg-white/10 dark:bg-white/5 border border-white/20 dark:border-white/10 rounded-xl px-4 py-3 text-[10px] font-bold text-white outline-none focus:border-white/50 dark:focus:border-[#3B82F6]/40" />
                  <input type="password" placeholder="Confirm Key" value={regData.confirmPassword} onChange={(e) => setRegData({...regData, confirmPassword: e.target.value})} required className="w-full bg-white/10 dark:bg-white/5 border border-white/20 dark:border-white/10 rounded-xl px-4 py-3 text-[10px] font-bold text-white outline-none focus:border-white/50 dark:focus:border-[#3B82F6]/40" />

                  {error && <p className="text-[7px] font-black text-rose-500 uppercase text-center">{error}</p>}

                  <button type="submit" disabled={loading} className="w-full bg-[#D4AF37] hover:bg-[#B8860B] text-black py-4 rounded-xl text-[9px] font-black uppercase tracking-[0.3em] shadow-xl transition-all mt-4">
                    {loading ? <RefreshCw className="animate-spin" size={14} /> : "Register"}
                  </button>
                </form>
              )}
            </div>
          )}
        </div>

        <p className="mt-12 text-[7px] font-black text-white/30 dark:text-zinc-600 uppercase tracking-[0.6em] text-center">GSS-RELAY-NODE-SECURE // {new Date().getFullYear()}</p>
      </div>
    </div>
  );
}

export default Login;
