import React, { useState, useEffect } from "react";
import { X, Lock, Mail, User, Phone, MapPin, Sparkles, BookOpen, Eye, EyeOff, Check, HelpCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function AuthModal({ isOpen, onClose }) {
  const { login, register, switchDemo } = useAuth();
  const [mode, setMode] = useState("login"); // 'login' or 'register'
  const [email, setEmail] = useState(() => localStorage.getItem("booknique_remembered_email") || "");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotNotice, setShowForgotNotice] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("Neeladri Road, Electronic City Phase 1, Bengaluru");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("booknique_remembered_email");
    if (saved && !email) {
      setEmail(saved);
    }
  }, []);

  if (!isOpen) return null;

  async function handleSubmit(e) {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    try {
      if (mode === "login") {
        await login(email, password);
        if (rememberMe) {
          localStorage.setItem("booknique_remembered_email", email);
          localStorage.setItem("booknique_remember_me", "true");
        } else {
          localStorage.removeItem("booknique_remembered_email");
          localStorage.removeItem("booknique_remember_me");
        }
      } else {
        await register({
          name,
          email,
          password,
          phone,
          address,
          city: "Bengaluru"
        });
        if (rememberMe) {
          localStorage.setItem("booknique_remembered_email", email);
        }
      }
      onClose();
    } catch (err) {
      setErrorMsg(err.message || "Authentication failed. Please verify credentials.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity"
      />

      <div className="min-h-full flex items-center justify-center p-4">
        <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100">
          
          {/* Top Banner */}
          <div className="p-6 bg-slate-900 text-white relative">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center text-slate-950 font-bold">
                <BookOpen className="w-4 h-4" />
              </div>
              <span className="font-extrabold text-base font-display">
                BOOK<span className="text-amber-400">NIQUE</span>
              </span>
            </div>
            <h3 className="text-xl font-bold font-display">
              {mode === "login" ? "Welcome Back" : "Join BookNique"}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {mode === "login"
                ? "Sign in to access your rental bag and borrowed items."
                : "Create your rental account for doorstep book & toy deliveries."}
            </p>

            {/* Mode Tabs */}
            <div className="grid grid-cols-2 gap-2 mt-4 bg-slate-800/80 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => {
                  setMode("login");
                  setErrorMsg("");
                }}
                className={`py-1.5 text-xs font-bold rounded-lg transition-all ${
                  mode === "login"
                    ? "bg-amber-500 text-slate-950 shadow"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode("register");
                  setErrorMsg("");
                }}
                className={`py-1.5 text-xs font-bold rounded-lg transition-all ${
                  mode === "register"
                    ? "bg-amber-500 text-slate-950 shadow"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                New Member
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 font-medium">
                {errorMsg}
              </div>
            )}

            {mode === "register" && (
              <>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Full Name *</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ananya Sharma"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-1 focus:ring-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Phone Number (Bengaluru) *</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="tel"
                      required
                      placeholder="+91 98450 12345"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-1 focus:ring-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Doorstep Delivery Address</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Flat/Street, Neeladri Road, ECITY-1"
                      value={address}
                      onChange={e => setAddress(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-1 focus:ring-amber-500"
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block font-bold text-slate-700 mb-1">Email Address *</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block font-bold text-slate-700">Password *</label>
                {mode === "login" && (
                  <button
                    type="button"
                    onClick={() => setShowForgotNotice(!showForgotNotice)}
                    className="text-[11px] font-bold text-amber-600 hover:text-amber-700 hover:underline"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full pl-9 pr-10 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {showForgotNotice && (
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-[11px] leading-relaxed">
                <p className="font-bold mb-0.5">Need a password reset?</p>
                <p>
                  Call Booknique Desk at <span className="font-semibold">+91 9000357691 / 9731597313</span> or visit 4th Floor, Above Titan Eye Plus, Neeladri Road, ECITY-1.
                </p>
              </div>
            )}

            {/* Remember Me Checkbox */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={e => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400 border-slate-300"
                />
                <span className="text-xs font-semibold text-slate-700">Remember me</span>
              </label>
              <span className="text-[11px] text-slate-400 font-medium">Secured with JWT</span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold shadow-md shadow-amber-500/20 transition-all flex items-center justify-center gap-1.5"
            >
              {loading ? (
                <span>Please wait...</span>
              ) : mode === "login" ? (
                <span>Sign In to Account</span>
              ) : (
                <span>Create Rental Account</span>
              )}
            </button>

            {/* Quick Demo Access Badges */}
            <div className="pt-3 border-t border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-2 text-center">
                Or 1-Click Demo Login
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={async () => {
                    await switchDemo("admin");
                    onClose();
                  }}
                  className="py-1.5 px-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-[11px] font-bold"
                >
                  Admin Store Demo
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    await switchDemo("staff");
                    onClose();
                  }}
                  className="py-1.5 px-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-[11px] font-bold"
                >
                  Staff Desk Demo
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    await switchDemo("david.chen@example.com");
                    onClose();
                  }}
                  className="py-1.5 px-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-[11px] font-bold col-span-2"
                >
                  Customer Demo (David Chen - M102)
                </button>
              </div>
            </div>

          </form>

        </div>
      </div>
    </div>
  );
}
