import React, { useState } from "react";
import {
  LogIn,
  UserPlus,
  Key,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Mail,
  ArrowLeft,
  Send,
  Eye,
  EyeOff,
  Lock,
  User as UserIcon,
  Globe,
  Sparkles,
  Inbox,
  Shield,
  Smartphone,
} from "lucide-react";
import { KeycloakSession } from "../types";

interface LoginScreenProps {
  keycloakSession: KeycloakSession;
  setKeycloakSession: (session: KeycloakSession) => void;
  openKeycloakAuditModal: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  keycloakSession,
  setKeycloakSession,
  openKeycloakAuditModal,
}) => {
  const [authMode, setAuthMode] = useState<"signin" | "signup" | "forgot">("signin");

  // Sign In State
  const [loginRealm, setLoginRealm] = useState("proconnect-realm");
  const [loginUsername, setLoginUsername] = useState("alex.morgan");
  const [loginPassword, setLoginPassword] = useState("password123");
  const [showPassword, setShowPassword] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Sign Up State & 2FA
  const [signupStep, setSignupStep] = useState<"form" | "otp_verify">("form");
  const [signupFullName, setSignupFullName] = useState("");
  const [signupUsername, setSignupUsername] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupConfirmPassword, setSignupConfirmPassword] = useState("");
  const [signupRole, setSignupRole] = useState("proconnect-user");
  const [signupOtpInput, setSignupOtpInput] = useState("");
  const [dispatchedSignupOtp, setDispatchedSignupOtp] = useState<string | null>(null);
  const [signupLoading, setSignupLoading] = useState(false);
  const [signupError, setSignupError] = useState<string | null>(null);
  const [signupSuccess, setSignupSuccess] = useState<string | null>(null);

  // Forgot / Reset Password State & 2FA
  const [resetStep, setResetStep] = useState<"request_otp" | "verify_reset">("request_otp");
  const [resetEmail, setResetEmail] = useState("");
  const [resetOtpInput, setResetOtpInput] = useState("");
  const [dispatchedResetOtp, setDispatchedResetOtp] = useState<string | null>(null);
  const [resetNewPassword, setResetNewPassword] = useState("");
  const [resetConfirmPassword, setResetConfirmPassword] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);
  const [resetSuccess, setResetSuccess] = useState<string | null>(null);

  // Validate Email
  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  };

  // Handle Keycloak Sign In
  const handleKeycloakLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError(null);

    try {
      const res = await fetch("/api/keycloak/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: loginUsername,
          password: loginPassword,
          realm: loginRealm,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to authenticate with Keycloak");
      }

      if (data.session) {
        setKeycloakSession(data.session);
      }
    } catch (err: any) {
      setLoginError(err.message || "Keycloak login error");
    } finally {
      setLoginLoading(false);
    }
  };

  // Step 1: Request 2FA OTP for Sign Up
  const handleRequestSignUpOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignupLoading(true);
    setSignupError(null);

    if (!isValidEmail(signupEmail)) {
      setSignupError("Please enter a valid email address (e.g., user@domain.com)");
      setSignupLoading(false);
      return;
    }

    if (signupPassword !== signupConfirmPassword) {
      setSignupError("Passwords do not match!");
      setSignupLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/keycloak/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: signupEmail,
          purpose: "signup",
          realm: loginRealm,
          userData: {
            fullName: signupFullName,
            username: signupUsername,
            email: signupEmail,
            password: signupPassword,
            role: signupRole,
          },
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to dispatch 2FA verification code");
      }

      setDispatchedSignupOtp(data.otpCode || null);
      setSignupStep("otp_verify");
    } catch (err: any) {
      setSignupError(err.message || "2FA OTP dispatch failed");
    } finally {
      setSignupLoading(false);
    }
  };

  // Step 2: Verify 2FA OTP & Complete Sign Up
  const handleVerifySignUpOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignupLoading(true);
    setSignupError(null);

    try {
      const res = await fetch("/api/keycloak/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: signupEmail,
          code: signupOtpInput,
          purpose: "signup",
          realm: loginRealm,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "2FA OTP Verification failed");
      }

      setSignupSuccess("2FA Verified! Account created successfully.");
      if (data.session) {
        setTimeout(() => {
          setKeycloakSession(data.session);
        }, 1200);
      }
    } catch (err: any) {
      setSignupError(err.message || "2FA verification error");
    } finally {
      setSignupLoading(false);
    }
  };

  // Step 1: Request 2FA OTP for Password Reset
  const handleRequestResetOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetLoading(true);
    setResetError(null);

    if (!isValidEmail(resetEmail)) {
      setResetError("Please enter a valid email address (e.g. user@domain.com)");
      setResetLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/keycloak/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: resetEmail,
          purpose: "reset-password",
          realm: loginRealm,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to dispatch 2FA reset OTP");
      }

      setDispatchedResetOtp(data.otpCode || null);
      setResetStep("verify_reset");
    } catch (err: any) {
      setResetError(err.message || "Error dispatching password reset 2FA OTP");
    } finally {
      setResetLoading(false);
    }
  };

  // Step 2: Verify 2FA OTP & Update Password
  const handleVerifyResetOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetLoading(true);
    setResetError(null);
    setResetSuccess(null);

    if (resetNewPassword !== resetConfirmPassword) {
      setResetError("New passwords do not match!");
      setResetLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/keycloak/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: resetEmail,
          code: resetOtpInput,
          purpose: "reset-password",
          newPassword: resetNewPassword,
          confirmPassword: resetConfirmPassword,
          realm: loginRealm,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to reset password");
      }

      setResetSuccess("Password successfully updated! Redirecting to Sign In...");
      setTimeout(() => {
        setLoginUsername(resetEmail);
        setLoginPassword(resetNewPassword);
        setAuthMode("signin");
        setResetStep("request_otp");
        setResetSuccess(null);
      }, 1800);
    } catch (err: any) {
      setResetError(err.message || "2FA Password Reset Failed");
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F3F2EF] dark:bg-slate-950 flex flex-col justify-between text-slate-900 dark:text-slate-100 font-sans transition-colors duration-200">
      {/* Top Brand Header */}
      <header className="w-full max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex items-center font-black text-2xl tracking-tight text-slate-900 dark:text-white">
            <span>Pro</span>
            <span className="bg-[#0A66C2] text-white px-1.5 py-0.5 rounded-xs ml-0.5 font-bold text-xl">
              in
            </span>
          </div>
          <span className="hidden sm:inline-block text-xs font-semibold px-2 py-0.5 bg-cyan-100 dark:bg-cyan-950/80 text-cyan-800 dark:text-cyan-300 rounded-full border border-cyan-300 dark:border-cyan-800 ml-2">
            Keycloak OIDC Enabled
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={openKeycloakAuditModal}
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-colors border border-slate-300 dark:border-slate-700"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
            <span>Keycloak Audit Logs</span>
          </button>

          <button
            onClick={() => setAuthMode("signup")}
            className={`px-4 py-1.5 text-xs font-bold rounded-full transition-colors ${
              authMode === "signup"
                ? "bg-[#0A66C2] text-white"
                : "text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800"
            }`}
          >
            Join now
          </button>

          <button
            onClick={() => setAuthMode("signin")}
            className={`px-4 py-1.5 text-xs font-bold rounded-full transition-colors border ${
              authMode === "signin"
                ? "border-[#0A66C2] text-[#0A66C2] dark:text-cyan-400 font-bold"
                : "border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-400"
            }`}
          >
            Sign in
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="w-full max-w-7xl mx-auto px-4 py-6 md:py-12 flex-1 flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16">
        {/* Left Side: Headline & Keycloak Identity Card */}
        <div className="flex-1 max-w-lg text-center md:text-left space-y-4">
          <h1 className="text-3xl md:text-5xl font-light text-slate-800 dark:text-slate-100 leading-tight">
            Welcome to your <br />
            <span className="font-semibold text-[#0A66C2] dark:text-cyan-400">
              professional community
            </span>
          </h1>

          <p className="text-sm md:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
            Connect with colleagues, explore industry opportunities, and build your career network backed by secure Keycloak Enterprise Single Sign-On (SSO).
          </p>

          <div className="pt-2 flex flex-wrap gap-2 justify-center md:justify-start">
            <div className="px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2 shadow-xs">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>Keycloak OIDC RS256 JWT Tokens</span>
            </div>
            <div className="px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2 shadow-xs">
              <Globe className="w-4 h-4 text-cyan-500" />
              <span>Multi-Tenant Realm Security</span>
            </div>
          </div>
        </div>

        {/* Right Side: Authentication Box */}
        <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl p-6 md:p-8 border border-slate-200 dark:border-slate-800 shadow-lg">
          {/* Sub-tab Mode Switcher */}
          <div className="flex items-center justify-between gap-1 mb-6 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={() => setAuthMode("signin")}
              className={`flex-1 py-2 px-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                authMode === "signin"
                  ? "bg-white dark:bg-slate-900 text-[#0A66C2] dark:text-cyan-400 shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>

            <button
              type="button"
              onClick={() => setAuthMode("signup")}
              className={`flex-1 py-2 px-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                authMode === "signup"
                  ? "bg-white dark:bg-slate-900 text-[#0A66C2] dark:text-cyan-400 shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Sign Up</span>
            </button>

            <button
              type="button"
              onClick={() => setAuthMode("forgot")}
              className={`flex-1 py-2 px-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                authMode === "forgot" || authMode === "reset"
                  ? "bg-white dark:bg-slate-900 text-[#0A66C2] dark:text-cyan-400 shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <Key className="w-3.5 h-3.5" />
              <span>Forgot</span>
            </button>
          </div>

          {/* MODE 1: SIGN IN */}
          {authMode === "signin" && (
            <div>
              <div className="mb-4">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  Sign in to ProConnect
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Enter your Keycloak credentials to access your profile
                </p>
              </div>

              {loginError && (
                <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-300 text-xs rounded-xl flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
                  <span>{loginError}</span>
                </div>
              )}

              <form onSubmit={handleKeycloakLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Keycloak Realm
                  </label>
                  <input
                    type="text"
                    value={loginRealm}
                    onChange={(e) => setLoginRealm(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 rounded-xl border border-slate-300 dark:border-slate-700 focus:border-[#0A66C2] focus:outline-hidden font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Username or Email
                  </label>
                  <div className="relative">
                    <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={loginUsername}
                      onChange={(e) => setLoginUsername(e.target.value)}
                      placeholder="e.g. alex.morgan"
                      className="w-full pl-10 pr-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 rounded-xl border border-slate-300 dark:border-slate-700 focus:border-[#0A66C2] focus:outline-hidden"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setResetEmail(loginUsername);
                        setAuthMode("forgot");
                      }}
                      className="text-[11px] font-bold text-[#0A66C2] dark:text-cyan-400 hover:underline"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-10 py-2.5 text-xs bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 rounded-xl border border-slate-300 dark:border-slate-700 focus:border-[#0A66C2] focus:outline-hidden"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loginLoading}
                    className="w-full py-3 bg-[#0A66C2] hover:bg-[#004182] text-white font-bold text-xs rounded-full shadow-md transition-all flex items-center justify-center gap-2"
                  >
                    {loginLoading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Signing In via Keycloak...</span>
                      </>
                    ) : (
                      <>
                        <LogIn className="w-4 h-4" />
                        <span>Sign In</span>
                      </>
                    )}
                  </button>
                </div>
              </form>

              {/* Quick Demo Accounts */}
              <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800 text-center">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                  Quick Demo Accounts
                </span>
                <div className="flex justify-center gap-2">
                  <button
                    onClick={() => {
                      setLoginUsername("alex.morgan");
                      setLoginPassword("password123");
                    }}
                    className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                  >
                    alex.morgan (Admin)
                  </button>
                  <button
                    onClick={() => {
                      setLoginUsername("sarah.chen");
                      setLoginPassword("password123");
                    }}
                    className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                  >
                    sarah.chen (Recruiter)
                  </button>
                </div>
              </div>

              <div className="mt-5 text-center">
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  New to ProConnect?{" "}
                </span>
                <button
                  type="button"
                  onClick={() => setAuthMode("signup")}
                  className="text-xs font-bold text-[#0A66C2] dark:text-cyan-400 hover:underline"
                >
                  Join now
                </button>
              </div>
            </div>
          )}

          {/* MODE 2: SIGN UP WITH 2FA EMAIL OTP */}
          {authMode === "signup" && (
            <div>
              <div className="mb-4">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-[#0A66C2]" />
                  <span>Join ProConnect with 2FA</span>
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {signupStep === "form"
                    ? "Fill in your details to receive a 2FA email verification code"
                    : `Enter the 6-digit verification code sent to ${signupEmail}`}
                </p>
              </div>

              {signupError && (
                <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-300 text-xs rounded-xl flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
                  <span>{signupError}</span>
                </div>
              )}

              {signupSuccess && (
                <div className="mb-4 p-3 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-300 text-xs rounded-xl flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>{signupSuccess}</span>
                </div>
              )}

              {signupStep === "form" ? (
                /* STEP 1: SIGNUP DETAILS FORM */
                <form onSubmit={handleRequestSignUpOtp} className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Full Name
                      </label>
                      <input
                        type="text"
                        required
                        value={signupFullName}
                        onChange={(e) => setSignupFullName(e.target.value)}
                        placeholder="e.g. Jordan Lee"
                        className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 rounded-xl border border-slate-300 dark:border-slate-700 focus:border-[#0A66C2] focus:outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Username
                      </label>
                      <input
                        type="text"
                        required
                        value={signupUsername}
                        onChange={(e) => setSignupUsername(e.target.value)}
                        placeholder="jordan.lee"
                        className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 rounded-xl border border-slate-300 dark:border-slate-700 focus:border-[#0A66C2] focus:outline-hidden font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Valid Email Address (for 2FA OTP)
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="email"
                        required
                        value={signupEmail}
                        onChange={(e) => setSignupEmail(e.target.value)}
                        placeholder="jordan@example.com"
                        className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 rounded-xl border border-slate-300 dark:border-slate-700 focus:border-[#0A66C2] focus:outline-hidden font-medium"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Password
                      </label>
                      <input
                        type="password"
                        required
                        value={signupPassword}
                        onChange={(e) => setSignupPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 rounded-xl border border-slate-300 dark:border-slate-700 focus:border-[#0A66C2] focus:outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Confirm Password
                      </label>
                      <input
                        type="password"
                        required
                        value={signupConfirmPassword}
                        onChange={(e) => setSignupConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 rounded-xl border border-slate-300 dark:border-slate-700 focus:border-[#0A66C2] focus:outline-hidden"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Realm Role
                    </label>
                    <select
                      value={signupRole}
                      onChange={(e) => setSignupRole(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 rounded-xl border border-slate-300 dark:border-slate-700 focus:border-[#0A66C2]"
                    >
                      <option value="proconnect-user">Candidate / Professional (User)</option>
                      <option value="recruiter">Corporate Recruiter (Recruiter)</option>
                      <option value="admin">Realm Administrator (Admin)</option>
                    </select>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={signupLoading}
                      className="w-full py-3 bg-[#0A66C2] hover:bg-[#004182] text-white font-bold text-xs rounded-full shadow-md transition-all flex items-center justify-center gap-2"
                    >
                      {signupLoading ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Dispatching 2FA OTP Code...</span>
                        </>
                      ) : (
                        <>
                          <ShieldCheck className="w-4 h-4" />
                          <span>Send 2FA Email OTP</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              ) : (
                /* STEP 2: 2FA OTP CODE VERIFICATION */
                <form onSubmit={handleVerifySignUpOtp} className="space-y-4">
                  {/* Simulated Email Inbox Box */}
                  <div className="p-3.5 bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 rounded-xl space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-blue-700 dark:text-blue-300">
                      <div className="flex items-center gap-1.5">
                        <Inbox className="w-4 h-4 text-[#0A66C2]" />
                        <span>Simulated Keycloak Mail Inbox</span>
                      </div>
                      <span className="text-[10px] bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-0.5 rounded-full">
                        2FA SPI
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-600 dark:text-slate-300">
                      OTP dispatched to <strong className="text-slate-900 dark:text-white">{signupEmail}</strong>:
                    </p>

                    {dispatchedSignupOtp && (
                      <div className="p-2.5 bg-white dark:bg-slate-900 rounded-lg border border-blue-300 dark:border-blue-700 flex items-center justify-between">
                        <span className="text-xs font-medium text-slate-500">Your 6-Digit OTP:</span>
                        <span className="text-lg font-mono font-extrabold text-[#0A66C2] dark:text-cyan-400 tracking-widest">
                          {dispatchedSignupOtp}
                        </span>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Enter 6-Digit Verification Code
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        required
                        maxLength={6}
                        value={signupOtpInput}
                        onChange={(e) => setSignupOtpInput(e.target.value.replace(/\D/g, ""))}
                        placeholder="e.g. 839210"
                        className="w-full pl-10 pr-3 py-2.5 text-base font-mono font-bold tracking-widest bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 rounded-xl border border-slate-300 dark:border-slate-700 focus:border-[#0A66C2] text-center"
                      />
                    </div>
                  </div>

                  <div className="pt-2 space-y-2">
                    <button
                      type="submit"
                      disabled={signupLoading || signupOtpInput.length < 6}
                      className="w-full py-3 bg-[#0A66C2] hover:bg-[#004182] text-white font-bold text-xs rounded-full shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {signupLoading ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Verifying OTP Code...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Verify 2FA & Create Account</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => setSignupStep("form")}
                      className="w-full py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 flex items-center justify-center gap-1"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Edit Signup Details</span>
                    </button>
                  </div>
                </form>
              )}

              <div className="mt-5 text-center">
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  Already on ProConnect?{" "}
                </span>
                <button
                  type="button"
                  onClick={() => setAuthMode("signin")}
                  className="text-xs font-bold text-[#0A66C2] dark:text-cyan-400 hover:underline"
                >
                  Sign in
                </button>
              </div>
            </div>
          )}

          {/* MODE 3: RESET PASSWORD WITH 2FA EMAIL OTP */}
          {authMode === "forgot" && (
            <div>
              <div className="mb-4">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Key className="w-5 h-5 text-[#0A66C2]" />
                  <span>2FA Password Reset</span>
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {resetStep === "request_otp"
                    ? "Enter your registered valid email address to receive a 2FA OTP code"
                    : `Enter the 6-digit OTP code sent to ${resetEmail} and set a new password`}
                </p>
              </div>

              {resetError && (
                <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-300 text-xs rounded-xl flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
                  <span>{resetError}</span>
                </div>
              )}

              {resetSuccess && (
                <div className="mb-4 p-3 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-300 text-xs rounded-xl flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>{resetSuccess}</span>
                </div>
              )}

              {resetStep === "request_otp" ? (
                /* STEP 1: REQUEST 2FA RESET OTP */
                <form onSubmit={handleRequestResetOtp} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Registered Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="email"
                        required
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                        placeholder="e.g. alex.morgan@proconnect.io"
                        className="w-full pl-10 pr-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 rounded-xl border border-slate-300 dark:border-slate-700 focus:border-[#0A66C2] focus:outline-hidden"
                      />
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={resetLoading}
                      className="w-full py-3 bg-[#0A66C2] hover:bg-[#004182] text-white font-bold text-xs rounded-full shadow-md transition-all flex items-center justify-center gap-2"
                    >
                      {resetLoading ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Dispatching Reset 2FA OTP...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          <span>Send 2FA Reset OTP</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="text-center pt-2">
                    <button
                      type="button"
                      onClick={() => setAuthMode("signin")}
                      className="text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 flex items-center justify-center gap-1 mx-auto"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Back to Sign In</span>
                    </button>
                  </div>
                </form>
              ) : (
                /* STEP 2: VERIFY OTP AND SET NEW PASSWORD */
                <form onSubmit={handleVerifyResetOtp} className="space-y-3.5">
                  {/* Simulated Mail Inbox Box */}
                  <div className="p-3.5 bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 rounded-xl space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-blue-700 dark:text-blue-300">
                      <div className="flex items-center gap-1.5">
                        <Inbox className="w-4 h-4 text-[#0A66C2]" />
                        <span>Keycloak Mail SPI Dispatch</span>
                      </div>
                      <span className="text-[10px] bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-0.5 rounded-full">
                        Password Reset
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-600 dark:text-slate-300">
                      Reset OTP dispatched to <strong className="text-slate-900 dark:text-white">{resetEmail}</strong>:
                    </p>

                    {dispatchedResetOtp && (
                      <div className="p-2.5 bg-white dark:bg-slate-900 rounded-lg border border-blue-300 dark:border-blue-700 flex items-center justify-between">
                        <span className="text-xs font-medium text-slate-500">Reset Code:</span>
                        <span className="text-lg font-mono font-extrabold text-[#0A66C2] dark:text-cyan-400 tracking-widest">
                          {dispatchedResetOtp}
                        </span>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      6-Digit Reset OTP Code
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={6}
                      value={resetOtpInput}
                      onChange={(e) => setResetOtpInput(e.target.value.replace(/\D/g, ""))}
                      placeholder="e.g. 592014"
                      className="w-full px-3.5 py-2.5 text-base font-mono font-bold tracking-widest bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 rounded-xl border border-slate-300 dark:border-slate-700 focus:border-[#0A66C2] text-center"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      New Password
                    </label>
                    <input
                      type="password"
                      required
                      value={resetNewPassword}
                      onChange={(e) => setResetNewPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 rounded-xl border border-slate-300 dark:border-slate-700 focus:border-[#0A66C2]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      required
                      value={resetConfirmPassword}
                      onChange={(e) => setResetConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 rounded-xl border border-slate-300 dark:border-slate-700 focus:border-[#0A66C2]"
                    />
                  </div>

                  <div className="pt-2 space-y-2">
                    <button
                      type="submit"
                      disabled={resetLoading || resetOtpInput.length < 6}
                      className="w-full py-3 bg-[#0A66C2] hover:bg-[#004182] text-white font-bold text-xs rounded-full shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {resetLoading ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Updating Password...</span>
                        </>
                      ) : (
                        <>
                          <ShieldCheck className="w-4 h-4" />
                          <span>Verify 2FA & Update Password</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => setResetStep("request_otp")}
                      className="w-full py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 flex items-center justify-center gap-1"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Resend OTP to another email</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-7xl mx-auto px-6 py-6 border-t border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between text-xs text-slate-500 dark:text-slate-400 gap-4">
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-800 dark:text-slate-200">ProConnect</span>
          <span>© 2026</span>
          <span className="text-slate-300 dark:text-slate-700">•</span>
          <span className="text-cyan-600 dark:text-cyan-400 font-mono">Keycloak SSO v26.1</span>
        </div>

        <div className="flex flex-wrap justify-center gap-4 text-[11px]">
          <a href="#privacy" onClick={(e) => e.preventDefault()} className="hover:underline">
            User Agreement
          </a>
          <a href="#privacy" onClick={(e) => e.preventDefault()} className="hover:underline">
            Privacy Policy
          </a>
          <a href="#guidelines" onClick={(e) => e.preventDefault()} className="hover:underline">
            Community Guidelines
          </a>
          <button
            onClick={openKeycloakAuditModal}
            className="hover:underline text-cyan-600 dark:text-cyan-400 font-bold"
          >
            Audit Logs Panel
          </button>
        </div>
      </footer>
    </div>
  );
};
