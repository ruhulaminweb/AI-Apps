import React, { useState } from "react";
import {
  X,
  Lock,
  Mail,
  User as UserIcon,
  Briefcase,
  MapPin,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  UserCheck,
  LogIn,
  UserPlus,
  RefreshCw,
} from "lucide-react";
import { User } from "../types";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: "signin" | "signup" | "switch";
  currentUser: User;
  onLogin: (user: User) => void;
  onRegister: (newUser: User) => void;
  allUsers: User[];
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialTab = "signin",
  currentUser,
  onLogin,
  onRegister,
  allUsers,
}) => {
  const [activeTab, setActiveTab] = useState<"signin" | "signup" | "switch">(
    initialTab
  );

  // Sign In Form state
  const [loginEmail, setLoginEmail] = useState("alex.rivera@apex.io");
  const [loginPassword, setLoginPassword] = useState("••••••••");
  const [rememberMe, setRememberMe] = useState(true);

  // Sign Up Form state
  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupHeadline, setSignupHeadline] = useState("");
  const [signupCompany, setSignupCompany] = useState("");
  const [signupRole, setSignupRole] = useState("");
  const [signupLocation, setSignupLocation] = useState("San Francisco, CA");
  const [signupAvatar, setSignupAvatar] = useState(
    "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&auto=format&fit=crop&q=80"
  );

  // Avatar presets for quick selection during sign up
  const avatarPresets = [
    "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=400&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80",
  ];

  const [isLoading, setIsLoading] = useState(false);
  const [socialLoadingProvider, setSocialLoadingProvider] = useState<
    string | null
  >(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  if (!isOpen) return null;

  // Handle Login Submit
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setIsLoading(true);

    setTimeout(() => {
      // Find matching user or fallback to current user or first account
      const matchedUser =
        allUsers.find(
          (u) => u.name.toLowerCase() === loginEmail.toLowerCase()
        ) ||
        allUsers.find((u) => u.id === "user_me") ||
        allUsers[0];

      setIsLoading(false);
      setSuccessMsg(`Welcome back, ${matchedUser.name}!`);
      setTimeout(() => {
        onLogin(matchedUser);
        setSuccessMsg("");
        onClose();
      }, 600);
    }, 700);
  };

  // Handle Social Sign In (Google, LinkedIn, GitHub, Microsoft)
  const handleSocialAuth = (providerName: string) => {
    setErrorMsg("");
    setSocialLoadingProvider(providerName);

    setTimeout(() => {
      setSocialLoadingProvider(null);
      // Pick a preset or current user for demo SSO
      const targetUser =
        providerName === "Google"
          ? allUsers.find((u) => u.name.includes("Sophia")) || currentUser
          : providerName === "GitHub"
          ? allUsers.find((u) => u.name.includes("Marcus")) || currentUser
          : currentUser;

      setSuccessMsg(`Authenticated successfully via ${providerName}!`);
      setTimeout(() => {
        onLogin(targetUser);
        setSuccessMsg("");
        onClose();
      }, 700);
    }, 1000);
  };

  // Handle Sign Up Submit
  const handleSignUpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!signupName.trim() || !signupEmail.trim() || !signupPassword.trim()) {
      setErrorMsg("Please fill in all required fields (Name, Email, Password)");
      return;
    }

    setErrorMsg("");
    setIsLoading(true);

    setTimeout(() => {
      const newUserId = `user_created_${Date.now()}`;
      const createdUser: User = {
        id: newUserId,
        name: signupName.trim(),
        headline:
          signupHeadline.trim() ||
          `${signupRole || "Professional"} at ${
            signupCompany || "Self-Employed"
          }`,
        avatar: signupAvatar,
        coverImage:
          "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80",
        location: signupLocation || "Global",
        connectionsCount: 12,
        profileViewsThisWeek: 5,
        searchAppearances: 2,
        isOpenToWork: true,
        isHiring: false,
        company: signupCompany || "ProConnect Network",
        role: signupRole || "Member",
        about: `Hi, I am ${signupName}. Excited to connect with professionals and build on ProConnect!`,
        experiences: signupCompany
          ? [
              {
                id: `exp_${Date.now()}`,
                title: signupRole || "Professional",
                company: signupCompany,
                companyLogo:
                  "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&auto=format&fit=crop&q=80",
                location: signupLocation || "Remote",
                startDate: "Jan 2026",
                endDate: "Present",
                isCurrent: true,
                description: `Building and leading projects at ${signupCompany}.`,
              },
            ]
          : [],
        education: [],
        skills: [
          { id: "sk_1", name: "Leadership", endorsementsCount: 1, endorsedByMe: true },
          { id: "sk_2", name: "Software Development", endorsementsCount: 1, endorsedByMe: true },
        ],
        recommendations: [],
      };

      setIsLoading(false);
      setSuccessMsg(`Welcome to ProConnect, ${signupName}! Account created.`);
      setTimeout(() => {
        onRegister(createdUser);
        setSuccessMsg("");
        onClose();
      }, 700);
    }, 800);
  };

  // Quick switch user
  const handleQuickSwitch = (u: User) => {
    setIsLoading(true);
    setTimeout(() => {
      onLogin(u);
      setIsLoading(false);
      onClose();
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 w-full max-w-xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-8 relative">
        {/* Modal Top Banner */}
        <div className="bg-gradient-to-r from-[#0A66C2] to-blue-800 p-6 text-white relative">
          <button
            id="close-auth-modal-btn"
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-white text-[#0A66C2] rounded-md font-black text-lg flex items-center justify-center shadow-xs">
              in
            </div>
            <span className="font-extrabold text-xl tracking-tight">ProConnect</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold">
            {activeTab === "signin"
              ? "Welcome to your professional community"
              : activeTab === "signup"
              ? "Make the most of your professional life"
              : "Switch Professional Profile"}
          </h2>
          <p className="text-xs sm:text-sm text-blue-100 mt-1">
            {activeTab === "signin"
              ? "Sign in to access your network, jobs, and messages."
              : activeTab === "signup"
              ? "Join millions of professionals connecting, sharing, and growing."
              : "Test ProConnect as different professionals or switch accounts instantly."}
          </p>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 mt-4 pt-2 border-t border-white/20">
            <button
              id="auth-tab-signin"
              onClick={() => {
                setActiveTab("signin");
                setErrorMsg("");
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === "signin"
                  ? "bg-white text-[#0A66C2] shadow-sm"
                  : "bg-white/10 text-white hover:bg-white/20"
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>

            <button
              id="auth-tab-signup"
              onClick={() => {
                setActiveTab("signup");
                setErrorMsg("");
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === "signup"
                  ? "bg-white text-[#0A66C2] shadow-sm"
                  : "bg-white/10 text-white hover:bg-white/20"
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Join Now (Sign Up)</span>
            </button>

            <button
              id="auth-tab-switch"
              onClick={() => {
                setActiveTab("switch");
                setErrorMsg("");
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === "switch"
                  ? "bg-white text-[#0A66C2] shadow-sm"
                  : "bg-white/10 text-white hover:bg-white/20"
              }`}
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Switch Demo Account</span>
            </button>
          </div>
        </div>

        {/* Success or Error Alerts */}
        {successMsg && (
          <div className="bg-emerald-50 dark:bg-emerald-950/50 border-b border-emerald-200 dark:border-emerald-800 p-3 flex items-center gap-2 text-emerald-800 dark:text-emerald-200 text-xs font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="bg-red-50 dark:bg-red-950/50 border-b border-red-200 dark:border-red-800 p-3 flex items-center gap-2 text-red-800 dark:text-red-200 text-xs font-medium">
            <X className="w-4 h-4 text-red-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <div className="p-6">
          {/* ================= TAB 1: SIGN IN ================= */}
          {activeTab === "signin" && (
            <div className="space-y-4">
              <form onSubmit={handleLoginSubmit} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Email or Username
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="alex.rivera@apex.io"
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg border border-slate-300 dark:border-slate-700 text-sm focus:border-[#0A66C2] focus:outline-hidden transition-all"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => setErrorMsg("Password reset email sent to " + loginEmail)}
                      className="text-xs text-[#0A66C2] hover:underline font-medium"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="password"
                      required
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg border border-slate-300 dark:border-slate-700 text-sm focus:border-[#0A66C2] focus:outline-hidden transition-all"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-600 dark:text-slate-400">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="rounded-xs border-slate-300 text-[#0A66C2] focus:ring-[#0A66C2]"
                    />
                    <span>Remember me on this device</span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  id="signin-submit-btn"
                  className="w-full py-2.5 bg-[#0A66C2] hover:bg-[#004182] text-white font-bold text-sm rounded-full shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
                >
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Sign In</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Social Login Divider */}
              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200 dark:border-slate-800" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white dark:bg-slate-900 px-3 text-slate-500 font-medium">
                    Or sign in with
                  </span>
                </div>
              </div>

              {/* Social Login Buttons */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  id="sso-google-btn"
                  onClick={() => handleSocialAuth("Google")}
                  disabled={!!socialLoadingProvider}
                  className="flex items-center justify-center gap-2 py-2 px-3 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors"
                >
                  {socialLoadingProvider === "Google" ? (
                    <div className="w-3.5 h-3.5 border-2 border-[#0A66C2] border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                  )}
                  <span>Google</span>
                </button>

                <button
                  type="button"
                  id="sso-linkedin-btn"
                  onClick={() => handleSocialAuth("LinkedIn")}
                  disabled={!!socialLoadingProvider}
                  className="flex items-center justify-center gap-2 py-2 px-3 bg-[#0A66C2] hover:bg-[#004182] text-white rounded-lg text-xs font-semibold transition-colors"
                >
                  {socialLoadingProvider === "LinkedIn" ? (
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <div className="w-4 h-4 bg-white text-[#0A66C2] rounded-xs font-black text-[11px] flex items-center justify-center">
                      in
                    </div>
                  )}
                  <span>LinkedIn</span>
                </button>

                <button
                  type="button"
                  id="sso-github-btn"
                  onClick={() => handleSocialAuth("GitHub")}
                  disabled={!!socialLoadingProvider}
                  className="flex items-center justify-center gap-2 py-2 px-3 bg-slate-900 hover:bg-black text-white dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-700 rounded-lg text-xs font-semibold transition-colors"
                >
                  {socialLoadingProvider === "GitHub" ? (
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                    </svg>
                  )}
                  <span>GitHub</span>
                </button>

                <button
                  type="button"
                  id="sso-microsoft-btn"
                  onClick={() => handleSocialAuth("Microsoft")}
                  disabled={!!socialLoadingProvider}
                  className="flex items-center justify-center gap-2 py-2 px-3 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors"
                >
                  {socialLoadingProvider === "Microsoft" ? (
                    <div className="w-3.5 h-3.5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <div className="grid grid-cols-2 gap-0.5 w-3.5 h-3.5">
                      <div className="bg-[#F25022]" />
                      <div className="bg-[#7FBA00]" />
                      <div className="bg-[#00A4EF]" />
                      <div className="bg-[#FFB900]" />
                    </div>
                  )}
                  <span>Microsoft</span>
                </button>
              </div>
            </div>
          )}

          {/* ================= TAB 2: SIGN UP ================= */}
          {activeTab === "signup" && (
            <form onSubmit={handleSignUpSubmit} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Full Name *
                  </label>
                  <div className="relative">
                    <UserIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Jordan Miller"
                      value={signupName}
                      onChange={(e) => setSignupName(e.target.value)}
                      className="w-full pl-9 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg border border-slate-300 dark:border-slate-700 text-xs focus:border-[#0A66C2] focus:outline-hidden transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Work Email *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="email"
                      required
                      placeholder="jordan@company.com"
                      value={signupEmail}
                      onChange={(e) => setSignupEmail(e.target.value)}
                      className="w-full pl-9 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg border border-slate-300 dark:border-slate-700 text-xs focus:border-[#0A66C2] focus:outline-hidden transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Password *
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="password"
                      required
                      placeholder="6+ characters"
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                      className="w-full pl-9 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg border border-slate-300 dark:border-slate-700 text-xs focus:border-[#0A66C2] focus:outline-hidden transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Current Company / Org
                  </label>
                  <div className="relative">
                    <Briefcase className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="e.g. Acme AI Solutions"
                      value={signupCompany}
                      onChange={(e) => setSignupCompany(e.target.value)}
                      className="w-full pl-9 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg border border-slate-300 dark:border-slate-700 text-xs focus:border-[#0A66C2] focus:outline-hidden transition-all"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Professional Headline / Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Senior Product Designer | UI/UX & Design Systems Lead"
                  value={signupHeadline}
                  onChange={(e) => setSignupHeadline(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg border border-slate-300 dark:border-slate-700 text-xs focus:border-[#0A66C2] focus:outline-hidden transition-all"
                />
              </div>

              {/* Avatar Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Choose Profile Photo
                </label>
                <div className="flex items-center gap-2">
                  <img
                    src={signupAvatar}
                    alt="Selected Avatar"
                    className="w-10 h-10 rounded-full object-cover ring-2 ring-[#0A66C2]"
                  />
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                    {avatarPresets.map((presetUrl, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setSignupAvatar(presetUrl)}
                        className={`w-8 h-8 rounded-full overflow-hidden transition-all ${
                          signupAvatar === presetUrl
                            ? "ring-2 ring-[#0A66C2] scale-105"
                            : "opacity-70 hover:opacity-100"
                        }`}
                      >
                        <img
                          src={presetUrl}
                          alt={`Preset ${idx}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  id="signup-submit-btn"
                  className="w-full py-2.5 bg-[#0A66C2] hover:bg-[#004182] text-white font-bold text-sm rounded-full shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Agree & Join ProConnect</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>

              <p className="text-[11px] text-slate-500 dark:text-slate-400 text-center mt-2">
                By clicking Agree & Join, you agree to the ProConnect User Agreement, Privacy Policy, and Cookie Policy.
              </p>
            </form>
          )}

          {/* ================= TAB 3: SWITCH DEMO ACCOUNT ================= */}
          {activeTab === "switch" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Select Profile to Act As:
                </span>
                <span className="text-xs text-[#0A66C2] font-medium flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Instant Authentication
                </span>
              </div>

              <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                {allUsers.map((u) => {
                  const isCurrent = u.id === currentUser.id;
                  return (
                    <button
                      key={u.id}
                      onClick={() => handleQuickSwitch(u)}
                      disabled={isLoading}
                      className={`w-full p-3 rounded-xl text-left border transition-all flex items-center justify-between gap-3 ${
                        isCurrent
                          ? "bg-blue-50/80 dark:bg-blue-950/40 border-[#0A66C2] ring-1 ring-[#0A66C2]"
                          : "bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 border-slate-200 dark:border-slate-700"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={u.avatar}
                          alt={u.name}
                          className="w-11 h-11 rounded-full object-cover shrink-0"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                              {u.name}
                            </h4>
                            {isCurrent && (
                              <span className="bg-[#0A66C2] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                                Active Profile
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                            {u.headline}
                          </p>
                          <span className="text-[10px] text-slate-400 dark:text-slate-500">
                            {u.location}
                          </span>
                        </div>
                      </div>

                      <div className="shrink-0">
                        {isCurrent ? (
                          <UserCheck className="w-5 h-5 text-[#0A66C2]" />
                        ) : (
                          <span className="text-xs font-semibold text-[#0A66C2] hover:underline px-2.5 py-1 bg-white dark:bg-slate-900 rounded-md border border-slate-200 dark:border-slate-700 shadow-2xs">
                            Switch
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
