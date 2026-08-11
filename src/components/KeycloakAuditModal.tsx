import React, { useState, useEffect } from "react";
import {
  ShieldCheck,
  KeyRound,
  FileText,
  Settings,
  RefreshCw,
  LogOut,
  LogIn,
  Search,
  Download,
  Trash2,
  Lock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  Globe,
  UserCheck,
  Database,
  ExternalLink,
  Code,
  X,
  Copy,
  Check,
  UserPlus,
  Mail,
  Key,
  ArrowLeft,
  Send,
} from "lucide-react";
import { KeycloakAuditLog, KeycloakConfig, KeycloakSession } from "../types";

interface KeycloakAuditModalProps {
  isOpen: boolean;
  onClose: () => void;
  keycloakSession: KeycloakSession;
  setKeycloakSession: (session: KeycloakSession) => void;
}

export const KeycloakAuditModal: React.FC<KeycloakAuditModalProps> = ({
  isOpen,
  onClose,
  keycloakSession,
  setKeycloakSession,
}) => {
  const [activeTab, setActiveTab] = useState<"logs" | "token" | "login" | "config">("logs");
  const [logs, setLogs] = useState<KeycloakAuditLog[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [filterEventType, setFilterEventType] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Auth tester mode state: signin | signup | forgot | reset
  const [authMode, setAuthMode] = useState<"signin" | "signup" | "forgot" | "reset">("signin");

  // Login form state
  const [loginUsername, setLoginUsername] = useState("alex.morgan");
  const [loginPassword, setLoginPassword] = useState("password123");
  const [loginRealm, setLoginRealm] = useState("proconnect-realm");
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Signup form state
  const [signupFullName, setSignupFullName] = useState("");
  const [signupUsername, setSignupUsername] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupConfirmPassword, setSignupConfirmPassword] = useState("");
  const [signupRole, setSignupRole] = useState("proconnect-user");
  const [signupLoading, setSignupLoading] = useState(false);
  const [signupError, setSignupError] = useState<string | null>(null);
  const [signupSuccess, setSignupSuccess] = useState<string | null>(null);

  // Forgot Password state
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState<string | null>(null);
  const [forgotResult, setForgotResult] = useState<any>(null);

  // Reset Password state
  const [resetTokenInput, setResetTokenInput] = useState("");
  const [resetNewPassword, setResetNewPassword] = useState("");
  const [resetConfirmPassword, setResetConfirmPassword] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);
  const [resetSuccess, setResetSuccess] = useState<string | null>(null);

  // Config state
  const [config, setConfig] = useState<KeycloakConfig>({
    serverUrl: "https://keycloak.proconnect.internal/auth",
    realm: "proconnect-realm",
    clientId: "proconnect-web-app",
    clientSecret: "sec_kc_98f412a884",
    grantType: "authorization_code",
    ssoEnabled: true,
    sslRequired: "external",
  });
  const [savingConfig, setSavingConfig] = useState(false);
  const [configSuccess, setConfigSuccess] = useState(false);

  // Verification state
  const [verifyingToken, setVerifyingToken] = useState(false);
  const [verificationResult, setVerificationResult] = useState<any>(null);
  const [copiedToken, setCopiedToken] = useState(false);

  // Fetch Keycloak Config and Logs on load
  const fetchConfig = async () => {
    try {
      const res = await fetch("/api/keycloak/config");
      const data = await res.json();
      if (data && data.config) {
        setConfig(data.config);
      }
    } catch (err) {
      console.error("Failed to load Keycloak config", err);
    }
  };

  const fetchLogs = async () => {
    setLoadingLogs(true);
    try {
      let url = "/api/keycloak/logs?";
      if (filterEventType !== "ALL") url += `eventType=${filterEventType}&`;
      if (searchQuery) url += `search=${encodeURIComponent(searchQuery)}&`;

      const res = await fetch(url);
      const data = await res.json();
      if (data && data.logs) {
        setLogs(data.logs);
      }
    } catch (err) {
      console.error("Failed to fetch Keycloak audit logs", err);
    } finally {
      setLoadingLogs(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchConfig();
      fetchLogs();
    }
  }, [isOpen, filterEventType, searchQuery]);

  useEffect(() => {
    if (!isOpen || !autoRefresh) return;
    const interval = setInterval(() => {
      fetchLogs();
    }, 5000);
    return () => clearInterval(interval);
  }, [isOpen, autoRefresh, filterEventType, searchQuery]);

  if (!isOpen) return null;

  // Handle Keycloak SignUp / User Registration
  const handleKeycloakSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignupLoading(true);
    setSignupError(null);
    setSignupSuccess(null);

    if (signupPassword !== signupConfirmPassword) {
      setSignupError("Passwords do not match!");
      setSignupLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/keycloak/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: signupFullName,
          username: signupUsername,
          email: signupEmail,
          password: signupPassword,
          realm: loginRealm,
          role: signupRole,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to register with Keycloak Realm");
      }

      setSignupSuccess("Keycloak realm account created successfully!");
      if (data.session) {
        setKeycloakSession(data.session);
        setLoginUsername(signupUsername);
        setTimeout(() => {
          setActiveTab("token");
        }, 1200);
      }
      fetchLogs();
    } catch (err: any) {
      setSignupError(err.message || "Keycloak signup error");
    } finally {
      setSignupLoading(false);
    }
  };

  // Handle Keycloak Forgot Password
  const handleKeycloakForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotLoading(true);
    setForgotError(null);
    setForgotResult(null);

    try {
      const res = await fetch("/api/keycloak/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          emailOrUsername: forgotEmail,
          realm: loginRealm,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to process reset password request");
      }

      setForgotResult(data);
      if (data.resetToken) {
        setResetTokenInput(data.resetToken);
      }
      fetchLogs();
    } catch (err: any) {
      setForgotError(err.message || "Error requesting password reset");
    } finally {
      setForgotLoading(false);
    }
  };

  // Handle Keycloak Reset Password
  const handleKeycloakResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetLoading(true);
    setResetError(null);
    setResetSuccess(null);

    if (resetNewPassword !== resetConfirmPassword) {
      setResetError("New password and confirm password do not match!");
      setResetLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/keycloak/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resetToken: resetTokenInput,
          newPassword: resetNewPassword,
          confirmPassword: resetConfirmPassword,
          username: forgotEmail || loginUsername || "user",
          realm: loginRealm,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update Keycloak password");
      }

      setResetSuccess(data.message || "Password updated successfully!");
      setTimeout(() => {
        setAuthMode("signin");
        setLoginPassword(resetNewPassword);
      }, 1500);
      fetchLogs();
    } catch (err: any) {
      setResetError(err.message || "Error resetting password");
    } finally {
      setResetLoading(false);
    }
  };
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
        setActiveTab("token");
        fetchLogs();
      }
    } catch (err: any) {
      setLoginError(err.message || "Keycloak login error");
    } finally {
      setLoginLoading(false);
    }
  };

  // Handle Logout
  const handleKeycloakLogout = async () => {
    try {
      await fetch("/api/keycloak/logout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: keycloakSession.username || "alex.morgan" }),
      });
      setKeycloakSession({
        isAuthenticated: false,
        roles: [],
      });
      fetchLogs();
    } catch (err) {
      console.error("Logout error", err);
    }
  };

  // Verify JWT Token
  const handleVerifyToken = async () => {
    setVerifyingToken(true);
    try {
      const res = await fetch("/api/keycloak/verify-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: keycloakSession.accessToken }),
      });
      const data = await res.json();
      setVerificationResult(data);
      fetchLogs();
    } catch (err) {
      console.error("Token verification failed", err);
    } finally {
      setVerifyingToken(false);
    }
  };

  // Refresh Token
  const handleRefreshToken = async () => {
    try {
      const res = await fetch("/api/keycloak/refresh", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          refreshToken: keycloakSession.refreshToken,
          username: keycloakSession.username || "alex.morgan",
        }),
      });
      const data = await res.json();
      if (data.accessToken) {
        setKeycloakSession({
          ...keycloakSession,
          accessToken: data.accessToken,
          expiresAt: Date.now() + data.expiresIn * 1000,
        });
        fetchLogs();
      }
    } catch (err) {
      console.error("Refresh token error", err);
    }
  };

  // Save Config
  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingConfig(true);
    setConfigSuccess(false);

    try {
      const res = await fetch("/api/keycloak/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });
      const data = await res.json();
      if (data.status === "updated") {
        setConfigSuccess(true);
        setTimeout(() => setConfigSuccess(false), 3000);
        fetchLogs();
      }
    } catch (err) {
      console.error("Error saving config", err);
    } finally {
      setSavingConfig(false);
    }
  };

  // Clear Audit Logs
  const handleClearLogs = async () => {
    if (!window.confirm("Are you sure you want to clear Keycloak security audit logs?")) return;
    try {
      await fetch("/api/keycloak/logs", { method: "DELETE" });
      fetchLogs();
    } catch (err) {
      console.error("Error clearing logs", err);
    }
  };

  // Download Logs CSV
  const handleExportCSV = () => {
    const headers = ["ID", "Timestamp", "Event Type", "Username", "Realm", "Client IP", "Status", "Details"];
    const rows = logs.map((l) => [
      l.id,
      l.timestamp,
      l.eventType,
      l.username,
      l.realm,
      l.clientIp,
      l.status,
      `"${l.details.replace(/"/g, '""')}"`,
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `keycloak-audit-logs-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedToken(true);
    setTimeout(() => setCopiedToken(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-5xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-cyan-900 via-slate-900 to-indigo-950 text-white p-4 sm:p-5 flex items-center justify-between border-b border-cyan-800/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-400/30 flex items-center justify-center text-cyan-300 shadow-inner">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold tracking-tight text-white">
                  Keycloak Identity & Audit Log Engine
                </h3>
                <span className="text-[10px] bg-cyan-500/20 text-cyan-300 font-mono px-2 py-0.5 rounded-full border border-cyan-500/30">
                  OIDC / Realm v22.0
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Single Sign-On (SSO) authentication, role-based access tokens, and real-time security audit logger
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {keycloakSession.isAuthenticated ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-semibold rounded-full">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                Keycloak Authenticated
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-semibold rounded-full">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                SSO Idle
              </span>
            )}

            <button
              id="close-keycloak-modal"
              onClick={onClose}
              className="p-1.5 hover:bg-white/10 rounded-lg text-slate-300 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 px-4 pt-2 gap-2 overflow-x-auto">
          <button
            id="kc-tab-logs"
            onClick={() => setActiveTab("logs")}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-lg transition-all border-b-2 ${
              activeTab === "logs"
                ? "border-cyan-500 text-cyan-600 dark:text-cyan-400 bg-white dark:bg-slate-900"
                : "border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Security Audit Logs</span>
            <span className="ml-1 text-[10px] bg-slate-200 dark:bg-slate-800 px-1.5 py-0.5 rounded-full font-mono">
              {logs.length}
            </span>
          </button>

          <button
            id="kc-tab-token"
            onClick={() => setActiveTab("token")}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-lg transition-all border-b-2 ${
              activeTab === "token"
                ? "border-cyan-500 text-cyan-600 dark:text-cyan-400 bg-white dark:bg-slate-900"
                : "border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
            }`}
          >
            <KeyRound className="w-4 h-4" />
            <span>JWT Bearer Claims</span>
          </button>

          <button
            id="kc-tab-login"
            onClick={() => setActiveTab("login")}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-lg transition-all border-b-2 ${
              activeTab === "login"
                ? "border-cyan-500 text-cyan-600 dark:text-cyan-400 bg-white dark:bg-slate-900"
                : "border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
            }`}
          >
            <LogIn className="w-4 h-4" />
            <span>SSO Login Tester</span>
          </button>

          <button
            id="kc-tab-config"
            onClick={() => setActiveTab("config")}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-lg transition-all border-b-2 ${
              activeTab === "config"
                ? "border-cyan-500 text-cyan-600 dark:text-cyan-400 bg-white dark:bg-slate-900"
                : "border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Realm Configuration</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 bg-slate-50/50 dark:bg-slate-950/50">
          {/* TAB 1: AUDIT LOGS */}
          {activeTab === "logs" && (
            <div className="space-y-4">
              {/* Controls Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
                <div className="flex flex-wrap items-center gap-2 flex-1 min-w-[280px]">
                  <div className="relative flex-1 min-w-[180px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search by user, details, IP, realm..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-lg border border-transparent focus:border-cyan-500 focus:outline-hidden"
                    />
                  </div>

                  <select
                    value={filterEventType}
                    onChange={(e) => setFilterEventType(e.target.value)}
                    className="py-1.5 px-3 text-xs bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-lg border border-transparent focus:border-cyan-500 font-medium"
                  >
                    <option value="ALL">All Event Types</option>
                    <option value="LOGIN_SUCCESS">LOGIN_SUCCESS</option>
                    <option value="LOGIN_FAILED">LOGIN_FAILED</option>
                    <option value="REGISTER_SUCCESS">REGISTER_SUCCESS</option>
                    <option value="REGISTER_FAILED">REGISTER_FAILED</option>
                    <option value="PASSWORD_RESET_REQUESTED">PASSWORD_RESET_REQUESTED</option>
                    <option value="PASSWORD_RESET_SUCCESS">PASSWORD_RESET_SUCCESS</option>
                    <option value="TOKEN_REFRESH">TOKEN_REFRESH</option>
                    <option value="VERIFY_TOKEN">VERIFY_TOKEN</option>
                    <option value="LOGOUT">LOGOUT</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setAutoRefresh(!autoRefresh)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                      autoRefresh
                        ? "bg-cyan-50 dark:bg-cyan-950/40 border-cyan-200 dark:border-cyan-800 text-cyan-600 dark:text-cyan-400"
                        : "bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400"
                    }`}
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${autoRefresh ? "animate-spin text-cyan-500" : ""}`} />
                    <span>{autoRefresh ? "Live Stream (5s)" : "Paused"}</span>
                  </button>

                  <button
                    onClick={handleExportCSV}
                    className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-700 transition-colors"
                    title="Export Audit Log to CSV"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Export CSV</span>
                  </button>

                  <button
                    onClick={handleClearLogs}
                    className="flex items-center gap-1 px-3 py-1.5 bg-red-50 dark:bg-red-950/40 hover:bg-red-100 text-red-600 dark:text-red-400 text-xs font-semibold rounded-lg border border-red-200 dark:border-red-800 transition-colors"
                    title="Clear All Logs"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Clear</span>
                  </button>
                </div>
              </div>

              {/* Logs Stream Table */}
              <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-100/70 dark:bg-slate-800/70 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                        <th className="py-2.5 px-3">Timestamp</th>
                        <th className="py-2.5 px-3">Event Type</th>
                        <th className="py-2.5 px-3">User & Realm</th>
                        <th className="py-2.5 px-3">Client IP</th>
                        <th className="py-2.5 px-3">Status</th>
                        <th className="py-2.5 px-3">Details & Security Scope</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
                      {loadingLogs && logs.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-8 text-center text-slate-400">
                            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-cyan-500" />
                            Loading Keycloak audit streams...
                          </td>
                        </tr>
                      ) : logs.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-8 text-center text-slate-400">
                            No Keycloak audit logs match your query filter.
                          </td>
                        </tr>
                      ) : (
                        logs.map((log) => {
                          const dateStr = new Date(log.timestamp).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                            second: "2-digit",
                          });

                          return (
                            <tr
                              key={log.id}
                              className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                            >
                              <td className="py-2.5 px-3 font-mono text-[11px] text-slate-500 dark:text-slate-400 whitespace-nowrap">
                                <div className="flex items-center gap-1.5">
                                  <Clock className="w-3 h-3 text-slate-400" />
                                  <span>{dateStr}</span>
                                </div>
                              </td>

                              <td className="py-2.5 px-3 font-bold">
                                <span
                                  className={`inline-block px-2 py-0.5 rounded-xs text-[10px] font-mono uppercase tracking-wide border ${
                                    log.eventType === "LOGIN_SUCCESS"
                                      ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800"
                                      : log.eventType === "LOGIN_FAILED" || log.eventType === "REGISTER_FAILED"
                                      ? "bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-300 border-red-300 dark:border-red-800"
                                      : log.eventType === "REGISTER_SUCCESS"
                                      ? "bg-cyan-50 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-300 border-cyan-300 dark:border-cyan-800"
                                      : log.eventType === "PASSWORD_RESET_REQUESTED"
                                      ? "bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-800"
                                      : log.eventType === "PASSWORD_RESET_SUCCESS"
                                      ? "bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border-teal-300 dark:border-teal-800"
                                      : log.eventType === "TOKEN_REFRESH"
                                      ? "bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-800"
                                      : log.eventType === "LOGOUT"
                                      ? "bg-orange-50 dark:bg-orange-950/60 text-orange-700 dark:text-orange-300 border-orange-300 dark:border-orange-800"
                                      : "bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-300 dark:border-purple-800"
                                  }`}
                                >
                                  {log.eventType}
                                </span>
                              </td>

                              <td className="py-2.5 px-3 font-medium text-slate-800 dark:text-slate-200">
                                <div className="flex items-center gap-1.5">
                                  <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                                  <span className="font-bold">{log.username}</span>
                                </div>
                                <div className="text-[10px] text-slate-400 font-mono">
                                  realm: {log.realm}
                                </div>
                              </td>

                              <td className="py-2.5 px-3 font-mono text-[11px] text-slate-600 dark:text-slate-400 whitespace-nowrap">
                                <div className="flex items-center gap-1">
                                  <Globe className="w-3 h-3 text-slate-400" />
                                  <span>{log.clientIp}</span>
                                </div>
                              </td>

                              <td className="py-2.5 px-3">
                                {log.status === "SUCCESS" ? (
                                  <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                                    SUCCESS
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 text-[11px] text-red-600 dark:text-red-400 font-semibold">
                                    <XCircle className="w-3.5 h-3.5 text-red-500" />
                                    FAILED
                                  </span>
                                )}
                              </td>

                              <td className="py-2.5 px-3 text-slate-600 dark:text-slate-300 text-xs">
                                <p className="line-clamp-2 leading-relaxed">{log.details}</p>
                                {log.tokenScope && (
                                  <span className="mt-1 inline-block text-[10px] font-mono bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-1.5 py-0.2 rounded-xs">
                                    scope: {log.tokenScope}
                                  </span>
                                )}
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ACTIVE TOKEN & JWT CLAIMS */}
          {activeTab === "token" && (
            <div className="space-y-6">
              {/* Session Overview Card */}
              <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs">
                <div className="flex flex-wrap items-center justify-between gap-4 mb-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-cyan-100 dark:bg-cyan-950 text-cyan-600 dark:text-cyan-400 flex items-center justify-center font-bold">
                      <KeyRound className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white text-base">
                        Active Keycloak Session
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {keycloakSession.isAuthenticated
                          ? `Logged in as ${keycloakSession.username || "User"} (${keycloakSession.email})`
                          : "No active Keycloak token session detected."}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {keycloakSession.isAuthenticated && (
                      <>
                        <button
                          onClick={handleVerifyToken}
                          disabled={verifyingToken}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
                        >
                          <ShieldCheck className="w-4 h-4" />
                          <span>{verifyingToken ? "Verifying..." : "Verify Signature"}</span>
                        </button>

                        <button
                          onClick={handleRefreshToken}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-700 transition-colors"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                          <span>Refresh Token</span>
                        </button>

                        <button
                          onClick={handleKeycloakLogout}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 dark:bg-red-950/40 hover:bg-red-100 text-red-600 dark:text-red-400 text-xs font-semibold rounded-lg border border-red-200 dark:border-red-800 transition-colors"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          <span>Logout</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {keycloakSession.isAuthenticated ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-200 dark:border-slate-700/60">
                      <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block mb-1">
                        Realm Roles
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {keycloakSession.roles.map((r) => (
                          <span
                            key={r}
                            className="bg-cyan-100 dark:bg-cyan-900/60 text-cyan-800 dark:text-cyan-200 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border border-cyan-200 dark:border-cyan-700"
                          >
                            {r}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-200 dark:border-slate-700/60">
                      <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block mb-1">
                        OIDC Issuer & Realm
                      </span>
                      <p className="text-xs font-mono text-slate-800 dark:text-slate-200 truncate">
                        {config.serverUrl}/realms/{config.realm}
                      </p>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-200 dark:border-slate-700/60">
                      <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block mb-1">
                        Token Expiration
                      </span>
                      <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        Expires in ~1 hour (Auto-refresh enabled)
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <p className="text-slate-500 text-sm mb-3">
                      To generate a Keycloak JWT bearer token, launch the SSO Login Tester tab.
                    </p>
                    <button
                      onClick={() => setActiveTab("login")}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-600 text-white rounded-lg text-xs font-bold shadow-xs hover:bg-cyan-700 transition-colors"
                    >
                      <LogIn className="w-4 h-4" />
                      <span>Log In via Keycloak SSO</span>
                    </button>
                  </div>
                )}
              </div>

              {/* JWT Bearer Decoded Viewer */}
              {keycloakSession.accessToken && (
                <div className="bg-slate-900 text-slate-100 rounded-xl p-4 border border-slate-800 shadow-md">
                  <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
                    <div className="flex items-center gap-2">
                      <Code className="w-4 h-4 text-cyan-400" />
                      <span className="font-mono text-xs font-bold text-cyan-300">
                        JWT Token Header & Payload (Decoded)
                      </span>
                    </div>

                    <button
                      onClick={() => copyToClipboard(keycloakSession.accessToken || "")}
                      className="flex items-center gap-1 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 rounded-md transition-colors"
                    >
                      {copiedToken ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-400">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy Raw Bearer Token</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-[11px]">
                    <div>
                      <span className="text-slate-400 block mb-1 text-[10px] uppercase font-bold">
                        Token Header (RS256)
                      </span>
                      <pre className="bg-slate-950 p-3 rounded-lg text-amber-300 overflow-x-auto border border-slate-800/80">
                        {JSON.stringify({ alg: "RS256", typ: "JWT", kid: "kc-key-2026-v1" }, null, 2)}
                      </pre>
                    </div>

                    <div>
                      <span className="text-slate-400 block mb-1 text-[10px] uppercase font-bold">
                        Payload Claims (Roles & Subject)
                      </span>
                      <pre className="bg-slate-950 p-3 rounded-lg text-cyan-300 overflow-x-auto max-h-60 border border-slate-800/80">
                        {JSON.stringify(keycloakSession.tokenPayload || {}, null, 2)}
                      </pre>
                    </div>
                  </div>

                  {verificationResult && (
                    <div className="mt-4 pt-3 border-t border-slate-800 flex items-center gap-2 text-xs text-emerald-400 font-mono">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>
                        Keycloak JWKS Signature Verified! Issuer: {verificationResult.issuer}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: SSO AUTH & LOGGING TESTER (SIGNIN, SIGNUP, FORGOT PASSWORD) */}
          {activeTab === "login" && (
            <div className="max-w-xl mx-auto bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-md">
              {/* Top Sub-tabs / Mode selector */}
              <div className="flex items-center justify-between gap-1 mb-5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setAuthMode("signin")}
                  className={`flex-1 py-1.5 px-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                    authMode === "signin"
                      ? "bg-white dark:bg-slate-900 text-cyan-600 dark:text-cyan-400 shadow-xs"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Sign In</span>
                </button>

                <button
                  type="button"
                  onClick={() => setAuthMode("signup")}
                  className={`flex-1 py-1.5 px-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                    authMode === "signup"
                      ? "bg-white dark:bg-slate-900 text-cyan-600 dark:text-cyan-400 shadow-xs"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Sign Up</span>
                </button>

                <button
                  type="button"
                  onClick={() => setAuthMode("forgot")}
                  className={`flex-1 py-1.5 px-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                    authMode === "forgot" || authMode === "reset"
                      ? "bg-white dark:bg-slate-900 text-cyan-600 dark:text-cyan-400 shadow-xs"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  <Key className="w-3.5 h-3.5" />
                  <span>Forgot Password</span>
                </button>
              </div>

              {/* Header Info */}
              <div className="flex items-center gap-3 mb-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-600 to-indigo-700 text-white flex items-center justify-center font-black text-xl shadow-md">
                  KC
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-base">
                    {authMode === "signin" && "Keycloak Single Sign-On (Sign In)"}
                    {authMode === "signup" && "Keycloak Realm Registration (Sign Up)"}
                    {authMode === "forgot" && "Reset Keycloak Credentials"}
                    {authMode === "reset" && "Update Keycloak Password"}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {authMode === "signin" && "Authenticate user credentials against Keycloak OIDC Realm"}
                    {authMode === "signup" && "Register new user account with role provisioning & audit logging"}
                    {authMode === "forgot" && "Send OIDC password recovery dispatch link via SMTP"}
                    {authMode === "reset" && "Set new credentials for user account"}
                  </p>
                </div>
              </div>

              {/* MODE 1: SIGN IN */}
              {authMode === "signin" && (
                <>
                  {loginError && (
                    <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-300 text-xs rounded-lg flex items-center gap-2">
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
                        className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-lg border border-slate-200 dark:border-slate-700 focus:border-cyan-500 focus:outline-hidden font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Username or Email
                      </label>
                      <input
                        type="text"
                        value={loginUsername}
                        onChange={(e) => setLoginUsername(e.target.value)}
                        placeholder="e.g. alex.morgan"
                        className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-lg border border-slate-200 dark:border-slate-700 focus:border-cyan-500 focus:outline-hidden"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                          Password
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            setForgotEmail(loginUsername);
                            setAuthMode("forgot");
                          }}
                          className="text-[11px] font-semibold text-cyan-600 dark:text-cyan-400 hover:underline"
                        >
                          Forgot password?
                        </button>
                      </div>
                      <input
                        type="password"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-lg border border-slate-200 dark:border-slate-700 focus:border-cyan-500 focus:outline-hidden"
                      />
                    </div>

                    <div className="pt-2 flex items-center gap-3">
                      <button
                        type="submit"
                        disabled={loginLoading}
                        className="flex-1 py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2"
                      >
                        {loginLoading ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            <span>Exchanging Code with Realm...</span>
                          </>
                        ) : (
                          <>
                            <LogIn className="w-4 h-4" />
                            <span>Authenticate with Keycloak</span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>

                  <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">
                      Don't have an account in this realm?
                    </span>
                    <button
                      type="button"
                      onClick={() => setAuthMode("signup")}
                      className="text-xs font-bold text-cyan-600 dark:text-cyan-400 hover:underline flex items-center gap-1"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>Sign Up Free</span>
                    </button>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-center">
                    <span className="text-[11px] text-slate-400 block mb-2">
                      Quick Demo Accounts
                    </span>
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => {
                          setLoginUsername("alex.morgan");
                          setLoginPassword("password123");
                        }}
                        className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] font-medium rounded-md hover:bg-slate-200"
                      >
                        alex.morgan (Admin)
                      </button>
                      <button
                        onClick={() => {
                          setLoginUsername("sarah.chen");
                          setLoginPassword("password123");
                        }}
                        className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] font-medium rounded-md hover:bg-slate-200"
                      >
                        sarah.chen (Recruiter)
                      </button>
                    </div>
                  </div>
                </>
              )}

              {/* MODE 2: SIGN UP */}
              {authMode === "signup" && (
                <>
                  {signupError && (
                    <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-300 text-xs rounded-lg flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
                      <span>{signupError}</span>
                    </div>
                  )}

                  {signupSuccess && (
                    <div className="mb-4 p-3 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-300 text-xs rounded-lg flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>{signupSuccess}</span>
                    </div>
                  )}

                  <form onSubmit={handleKeycloakSignUp} className="space-y-3.5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                          className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-lg border border-slate-200 dark:border-slate-700 focus:border-cyan-500 focus:outline-hidden"
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
                          className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-lg border border-slate-200 dark:border-slate-700 focus:border-cyan-500 focus:outline-hidden font-mono"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Email Address
                      </label>
                      <input
                        type="email"
                        required
                        value={signupEmail}
                        onChange={(e) => setSignupEmail(e.target.value)}
                        placeholder="jordan@example.com"
                        className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-lg border border-slate-200 dark:border-slate-700 focus:border-cyan-500 focus:outline-hidden"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                          className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-lg border border-slate-200 dark:border-slate-700 focus:border-cyan-500 focus:outline-hidden"
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
                          className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-lg border border-slate-200 dark:border-slate-700 focus:border-cyan-500 focus:outline-hidden"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Realm Role Assignment
                      </label>
                      <select
                        value={signupRole}
                        onChange={(e) => setSignupRole(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-lg border border-slate-200 dark:border-slate-700 focus:border-cyan-500 font-medium"
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
                        className="w-full py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2"
                      >
                        {signupLoading ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            <span>Creating Keycloak Realm Account...</span>
                          </>
                        ) : (
                          <>
                            <UserPlus className="w-4 h-4" />
                            <span>Register & Sign In to Realm</span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>

                  <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">
                      Already registered in Keycloak?
                    </span>
                    <button
                      type="button"
                      onClick={() => setAuthMode("signin")}
                      className="text-xs font-bold text-cyan-600 dark:text-cyan-400 hover:underline flex items-center gap-1"
                    >
                      <LogIn className="w-3.5 h-3.5" />
                      <span>Back to Sign In</span>
                    </button>
                  </div>
                </>
              )}

              {/* MODE 3: FORGOT PASSWORD */}
              {authMode === "forgot" && (
                <>
                  {forgotError && (
                    <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-300 text-xs rounded-lg flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
                      <span>{forgotError}</span>
                    </div>
                  )}

                  {forgotResult ? (
                    <div className="space-y-4">
                      <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl">
                        <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300 font-bold text-xs mb-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                          <span>Password Reset Email Dispatched!</span>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-300 mb-3">
                          {forgotResult.message}
                        </p>

                        <div className="p-2.5 bg-slate-900 text-slate-100 rounded-lg text-[11px] font-mono space-y-1">
                          <div className="text-slate-400">Generated Action Token:</div>
                          <div className="text-cyan-300 break-all">{forgotResult.resetToken}</div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setAuthMode("reset")}
                        className="w-full py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2"
                      >
                        <Key className="w-4 h-4" />
                        <span>Proceed to Reset Password Form</span>
                      </button>

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
                    </div>
                  ) : (
                    <form onSubmit={handleKeycloakForgotPassword} className="space-y-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          Username or Registered Email Address
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <input
                            type="text"
                            required
                            value={forgotEmail}
                            onChange={(e) => setForgotEmail(e.target.value)}
                            placeholder="alex.morgan or alex@proconnect.io"
                            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-lg border border-slate-200 dark:border-slate-700 focus:border-cyan-500 focus:outline-hidden"
                          />
                        </div>
                      </div>

                      <div className="pt-2">
                        <button
                          type="submit"
                          disabled={forgotLoading}
                          className="w-full py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2"
                        >
                          {forgotLoading ? (
                            <>
                              <RefreshCw className="w-4 h-4 animate-spin" />
                              <span>Dispatching Keycloak Reset Token...</span>
                            </>
                          ) : (
                            <>
                              <Send className="w-4 h-4" />
                              <span>Request Password Reset Link</span>
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
                  )}
                </>
              )}

              {/* MODE 4: RESET PASSWORD */}
              {authMode === "reset" && (
                <>
                  {resetError && (
                    <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-300 text-xs rounded-lg flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
                      <span>{resetError}</span>
                    </div>
                  )}

                  {resetSuccess && (
                    <div className="mb-4 p-3 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-300 text-xs rounded-lg flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>{resetSuccess}</span>
                    </div>
                  )}

                  <form onSubmit={handleKeycloakResetPassword} className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Keycloak Action Token
                      </label>
                      <input
                        type="text"
                        required
                        value={resetTokenInput}
                        onChange={(e) => setResetTokenInput(e.target.value)}
                        placeholder="kc_prt_..."
                        className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-lg border border-slate-200 dark:border-slate-700 focus:border-cyan-500 font-mono"
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
                        className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-lg border border-slate-200 dark:border-slate-700 focus:border-cyan-500 focus:outline-hidden"
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
                        className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-lg border border-slate-200 dark:border-slate-700 focus:border-cyan-500 focus:outline-hidden"
                      />
                    </div>

                    <div className="pt-2">
                      <button
                        type="submit"
                        disabled={resetLoading}
                        className="w-full py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2"
                      >
                        {resetLoading ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            <span>Updating Password in Keycloak Realm...</span>
                          </>
                        ) : (
                          <>
                            <Key className="w-4 h-4" />
                            <span>Update Password & Return to Login</span>
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
                </>
              )}
            </div>
          )}

          {/* TAB 4: REALM CONFIGURATION */}
          {activeTab === "config" && (
            <div className="space-y-6">
              <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs">
                <div className="flex items-center gap-3 mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
                  <Settings className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white text-base">
                      Keycloak Realm & Client Settings
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Configure connection details for your self-hosted or Keycloak Cloud server
                    </p>
                  </div>
                </div>

                {configSuccess && (
                  <div className="mb-4 p-3 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-300 text-xs rounded-lg flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span>Keycloak configuration saved successfully!</span>
                  </div>
                )}

                <form onSubmit={handleSaveConfig} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Keycloak Server URL
                    </label>
                    <input
                      type="text"
                      value={config.serverUrl}
                      onChange={(e) => setConfig({ ...config, serverUrl: e.target.value })}
                      className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-lg border border-slate-200 dark:border-slate-700 focus:border-cyan-500 focus:outline-hidden font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Keycloak Realm Name
                    </label>
                    <input
                      type="text"
                      value={config.realm}
                      onChange={(e) => setConfig({ ...config, realm: e.target.value })}
                      className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-lg border border-slate-200 dark:border-slate-700 focus:border-cyan-500 focus:outline-hidden font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Client ID
                    </label>
                    <input
                      type="text"
                      value={config.clientId}
                      onChange={(e) => setConfig({ ...config, clientId: e.target.value })}
                      className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-lg border border-slate-200 dark:border-slate-700 focus:border-cyan-500 focus:outline-hidden font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Client Secret (Optional for PKCE)
                    </label>
                    <input
                      type="password"
                      value={config.clientSecret || ""}
                      onChange={(e) => setConfig({ ...config, clientSecret: e.target.value })}
                      className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-lg border border-slate-200 dark:border-slate-700 focus:border-cyan-500 focus:outline-hidden font-mono"
                    />
                  </div>

                  <div className="sm:col-span-2 pt-2 flex items-center justify-end gap-3">
                    <button
                      type="submit"
                      disabled={savingConfig}
                      className="px-5 py-2 bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-2"
                    >
                      {savingConfig ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Saving...</span>
                        </>
                      ) : (
                        <>
                          <Database className="w-4 h-4" />
                          <span>Save Keycloak Realm Config</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>

              {/* Endpoint Discovery Links */}
              <div className="bg-slate-900 text-slate-200 rounded-xl p-4 border border-slate-800">
                <h5 className="font-bold text-xs text-cyan-300 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  Keycloak Realm OpenID Endpoints
                </h5>

                <div className="space-y-2 text-xs font-mono">
                  <div className="flex items-center justify-between bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                    <span className="text-slate-400">OpenID Discovery:</span>
                    <span className="text-cyan-400 truncate max-w-md">
                      {config.serverUrl}/realms/{config.realm}/.well-known/openid-configuration
                    </span>
                  </div>

                  <div className="flex items-center justify-between bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                    <span className="text-slate-400">JWKS Certs Endpoint:</span>
                    <span className="text-cyan-400 truncate max-w-md">
                      {config.serverUrl}/realms/{config.realm}/protocol/openid-connect/certs
                    </span>
                  </div>

                  <div className="flex items-center justify-between bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                    <span className="text-slate-400">Token Endpoint:</span>
                    <span className="text-cyan-400 truncate max-w-md">
                      {config.serverUrl}/realms/{config.realm}/protocol/openid-connect/token
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
