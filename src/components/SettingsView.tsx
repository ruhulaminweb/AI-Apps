import React, { useState, useEffect } from "react";
import {
  Settings,
  Shield,
  Key,
  Lock,
  Bell,
  Eye,
  Sun,
  Moon,
  Smartphone,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Trash2,
  Save,
  Globe,
  Sliders,
  LogOut,
  User,
  ShieldCheck,
  Check,
} from "lucide-react";
import { User as UserType } from "../types";

interface SettingsViewProps {
  currentUser: UserType;
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
  onSignOut?: () => void;
  openFlutterSuite?: () => void;
  openKeycloakModal?: () => void;
  setActiveTabApp?: (tab: string) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  currentUser,
  darkMode,
  setDarkMode,
  onSignOut,
  openFlutterSuite,
  openKeycloakModal,
  setActiveTabApp,
}) => {
  const [activeTab, setActiveTab] = useState<
    | "security"
    | "admin"
    | "keycloak-sso"
    | "flutter-suite"
    | "display"
    | "privacy"
    | "notifications"
  >("security");

  // Security State
  const [hasSavedCreds, setHasSavedCreds] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [passwordMsg, setPasswordMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Active Sessions
  const [activeSessions, setActiveSessions] = useState([
    {
      id: "s-1",
      device: "MacBook Pro (Chrome v122)",
      ip: "192.168.1.104",
      location: "San Francisco, CA, USA",
      isCurrent: true,
      lastActive: "Active now",
    },
    {
      id: "s-2",
      device: "iPhone 15 Pro (ProConnect App v2.4)",
      ip: "172.56.21.90",
      location: "San Jose, CA, USA",
      isCurrent: false,
      lastActive: "2 hours ago",
    },
  ]);

  // Privacy State
  const [profileVisibility, setProfileVisibility] = useState<"public" | "connections" | "private">("public");
  const [shareActivityUpdates, setShareActivityUpdates] = useState(true);
  const [showOnlineStatus, setShowOnlineStatus] = useState(true);
  const [searchEngineIndexing, setSearchEngineIndexing] = useState(true);

  // Notification Preferences State
  const [emailMessages, setEmailMessages] = useState(true);
  const [emailConnections, setEmailConnections] = useState(true);
  const [emailJobAlerts, setEmailJobAlerts] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [soundEffects, setSoundEffects] = useState(true);

  // Interface State
  const [compactLayout, setCompactLayout] = useState(false);

  // Keycloak SSO Preferences
  const [ssoTimeout, setSsoTimeout] = useState("3600");
  const [autoRefreshToken, setAutoRefreshToken] = useState(true);

  // Save Banner Toast
  const [saveToast, setSaveToast] = useState<string | null>(null);

  // Check saved credentials on load
  useEffect(() => {
    try {
      const saved = localStorage.getItem("proconnect_saved_credentials");
      if (saved) setHasSavedCreds(true);
    } catch (e) {
      console.warn("Error checking saved credentials", e);
    }
  }, []);

  const handleClearSavedCreds = () => {
    localStorage.removeItem("proconnect_saved_credentials");
    localStorage.removeItem("proconnect_session");
    setHasSavedCreds(false);
    triggerSaveToast("Saved login credentials cleared!");
  };

  const triggerSaveToast = (msg: string) => {
    setSaveToast(msg);
    setTimeout(() => setSaveToast(null), 3000);
  };

  // Change Password Handler
  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMsg(null);
    if (!oldPassword || !newPassword) {
      setPasswordMsg({ type: "error", text: "Please fill in all password fields." });
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setPasswordMsg({ type: "error", text: "New passwords do not match." });
      return;
    }
    if (newPassword.length < 8) {
      setPasswordMsg({ type: "error", text: "New password must be at least 8 characters." });
      return;
    }

    setPasswordLoading(true);
    setTimeout(() => {
      setPasswordLoading(false);
      setPasswordMsg({ type: "success", text: "Keycloak realm password updated successfully!" });
      setOldPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
    }, 1000);
  };

  const handleRevokeOtherSessions = () => {
    setActiveSessions(activeSessions.filter((s) => s.isCurrent));
    triggerSaveToast("Revoked all other active device sessions.");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Banner / Header */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-[#0A66C2]/10 text-[#0A66C2] dark:text-cyan-400 rounded-2xl border border-[#0A66C2]/20">
            <Settings className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Account & System Settings
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Manage your credentials, 2FA security, notification preferences & Keycloak SSO integration
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <img
            src={currentUser.avatar}
            alt={currentUser.name}
            className="w-9 h-9 rounded-full object-cover ring-2 ring-[#0A66C2]/30"
          />
          <div className="text-xs">
            <span className="font-bold block text-slate-900 dark:text-white">{currentUser.name}</span>
            <span className="text-slate-500 font-mono text-[11px]">{currentUser.email || "alex.morgan@proconnect.io"}</span>
          </div>
        </div>
      </div>

      {/* Save Toast */}
      {saveToast && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs rounded-xl flex items-center gap-2 font-bold animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          <span>{saveToast}</span>
        </div>
      )}

      {/* Main Settings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Left Side Navigation Menu */}
        <div className="md:col-span-1 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-3 shadow-xs space-y-1 h-fit">
          <button
            onClick={() => setActiveTab("security")}
            className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2.5 ${
              activeTab === "security"
                ? "bg-[#0A66C2] text-white shadow-xs"
                : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <Lock className="w-4 h-4" />
            <span>Account & Security</span>
          </button>

          <button
            onClick={() => setActiveTab("admin")}
            className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2.5 ${
              activeTab === "admin"
                ? "bg-[#0A66C2] text-white shadow-xs"
                : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-cyan-500" />
            <span>Administrative Console</span>
          </button>

          <button
            onClick={() => setActiveTab("keycloak-sso")}
            className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2.5 ${
              activeTab === "keycloak-sso"
                ? "bg-[#0A66C2] text-white shadow-xs"
                : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <Key className="w-4 h-4 text-emerald-500" />
            <span>Keycloak Auth OIDC</span>
          </button>

          <button
            onClick={() => setActiveTab("flutter-suite")}
            className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2.5 ${
              activeTab === "flutter-suite"
                ? "bg-[#0A66C2] text-white shadow-xs"
                : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <Smartphone className="w-4 h-4 text-blue-500" />
            <span>Flutter APK/iOS Codebase</span>
          </button>

          <button
            onClick={() => setActiveTab("display")}
            className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2.5 ${
              activeTab === "display"
                ? "bg-[#0A66C2] text-white shadow-xs"
                : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>Appearance & Theme</span>
          </button>

          <button
            onClick={() => setActiveTab("privacy")}
            className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2.5 ${
              activeTab === "privacy"
                ? "bg-[#0A66C2] text-white shadow-xs"
                : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <Eye className="w-4 h-4" />
            <span>Privacy & Visibility</span>
          </button>

          <button
            onClick={() => setActiveTab("notifications")}
            className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2.5 ${
              activeTab === "notifications"
                ? "bg-[#0A66C2] text-white shadow-xs"
                : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <Bell className="w-4 h-4" />
            <span>Notifications</span>
          </button>
        </div>

        {/* Right Content Panels */}
        <div className="md:col-span-3 space-y-6">
          {/* TAB 1: ACCOUNT & SECURITY */}
          {activeTab === "security" && (
            <div className="space-y-6">
              {/* Saved Login Credentials Management */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
                      <Save className="w-5 h-5 text-[#0A66C2]" />
                      <span>Saved Login Credentials</span>
                    </h3>
                    <p className="text-xs text-slate-500">
                      Manage cached browser credentials for 1-click automatic login
                    </p>
                  </div>

                  {hasSavedCreds ? (
                    <span className="px-2.5 py-1 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-xs font-bold rounded-full flex items-center gap-1 border border-emerald-300 dark:border-emerald-800">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Saved Credentials Active</span>
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-500 text-xs font-semibold rounded-full">
                      No saved credentials
                    </span>
                  )}
                </div>

                {hasSavedCreds ? (
                  <div className="p-4 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-xl flex items-center justify-between gap-4">
                    <div className="text-xs text-slate-700 dark:text-slate-300 space-y-0.5">
                      <p className="font-bold text-blue-900 dark:text-blue-200">
                        1-Click Login Credentials Loaded
                      </p>
                      <p className="text-slate-500 dark:text-slate-400">
                        Your browser currently retains encrypted local credentials for fast sign-in.
                      </p>
                    </div>

                    <button
                      onClick={handleClearSavedCreds}
                      className="px-3 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl transition-colors shrink-0 flex items-center gap-1.5 shadow-xs"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Clear Saved Login</span>
                    </button>
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 italic">
                    To save credentials for 1-click sign in, check the "Save password for 1-click sign in" checkbox on the Sign In page.
                  </p>
                )}
              </div>

              {/* Two-Factor Authentication (2FA) */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
                      <Shield className="w-5 h-5 text-[#0A66C2]" />
                      <span>Two-Factor Authentication (2FA)</span>
                    </h3>
                    <p className="text-xs text-slate-500">
                      Keycloak Email OTP verification when signing in from unknown devices
                    </p>
                  </div>

                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={twoFactorEnabled}
                      onChange={(e) => {
                        setTwoFactorEnabled(e.target.checked);
                        triggerSaveToast(
                          e.target.checked
                            ? "2FA Email OTP protection enabled!"
                            : "2FA protection disabled."
                        );
                      }}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-300 peer-focus:outline-hidden rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0A66C2]" />
                  </label>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  When enabled, signing up or resetting your password requires entering a 6-digit verification code dispatched directly to your registered email address via Keycloak Mail SPI.
                </p>
              </div>

              {/* Password Change Form */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
                <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
                  <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
                    <Key className="w-5 h-5 text-[#0A66C2]" />
                    <span>Change Password</span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    Update your Keycloak realm password credentials
                  </p>
                </div>

                {passwordMsg && (
                  <div
                    className={`p-3 text-xs rounded-xl flex items-center gap-2 font-bold ${
                      passwordMsg.type === "success"
                        ? "bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300"
                        : "bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300"
                    }`}
                  >
                    {passwordMsg.type === "success" ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
                    )}
                    <span>{passwordMsg.text}</span>
                  </div>
                )}

                <form onSubmit={handleChangePassword} className="space-y-3 max-w-md text-xs">
                  <div>
                    <label className="font-semibold block mb-1 text-slate-700 dark:text-slate-300">
                      Current Password *
                    </label>
                    <input
                      type="password"
                      required
                      value={oldPassword}
                      onChange={(e) => setOldPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden focus:border-[#0A66C2]"
                    />
                  </div>

                  <div>
                    <label className="font-semibold block mb-1 text-slate-700 dark:text-slate-300">
                      New Password *
                    </label>
                    <input
                      type="password"
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="At least 8 characters"
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden focus:border-[#0A66C2]"
                    />
                  </div>

                  <div>
                    <label className="font-semibold block mb-1 text-slate-700 dark:text-slate-300">
                      Confirm New Password *
                    </label>
                    <input
                      type="password"
                      required
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden focus:border-[#0A66C2]"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={passwordLoading}
                    className="px-5 py-2.5 bg-[#0A66C2] hover:bg-[#004182] text-white font-bold rounded-xl transition-colors shadow-xs flex items-center gap-2 disabled:opacity-50"
                  >
                    {passwordLoading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Updating Password...</span>
                      </>
                    ) : (
                      <>
                        <Key className="w-4 h-4" />
                        <span>Update Password</span>
                      </>
                    )}
                  </button>
                </form>
              </div>

              {/* Active Sessions & Devices */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
                      <Smartphone className="w-5 h-5 text-[#0A66C2]" />
                      <span>Active Sessions & Login Devices</span>
                    </h3>
                    <p className="text-xs text-slate-500">
                      Devices currently logged into your Keycloak realm account
                    </p>
                  </div>

                  {activeSessions.length > 1 && (
                    <button
                      onClick={handleRevokeOtherSessions}
                      className="px-3 py-1.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-300 text-xs font-bold rounded-xl hover:bg-rose-100 transition-colors"
                    >
                      Sign Out Other Devices
                    </button>
                  )}
                </div>

                <div className="space-y-3">
                  {activeSessions.map((s) => (
                    <div
                      key={s.id}
                      className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs"
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 dark:text-white">{s.device}</span>
                          {s.isCurrent && (
                            <span className="px-2 py-0.2 bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold rounded-full">
                              This Device
                            </span>
                          )}
                        </div>
                        <p className="text-slate-500 text-[11px]">
                          IP: {s.ip} • {s.location}
                        </p>
                      </div>
                      <span className="text-[11px] font-mono text-slate-400">{s.lastActive}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PRIVACY & VISIBILITY */}
          {activeTab === "privacy" && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-6">
              <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
                  <Eye className="w-5 h-5 text-[#0A66C2]" />
                  <span>Privacy & Profile Visibility</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Control who can see your profile, connection network, and activity updates
                </p>
              </div>

              <div className="space-y-4 text-xs">
                {/* Profile Visibility Options */}
                <div>
                  <label className="font-bold block mb-2 text-slate-800 dark:text-slate-200">
                    Who can see your full profile?
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[
                      { id: "public", title: "Public", desc: "Visible to all ProConnect members and public search" },
                      { id: "connections", title: "Connections Only", desc: "Visible only to 1st degree connections" },
                      { id: "private", title: "Private Mode", desc: "Anonymous browsing and hidden profile" },
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => {
                          setProfileVisibility(opt.id as any);
                          triggerSaveToast(`Profile visibility set to ${opt.title}`);
                        }}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          profileVisibility === opt.id
                            ? "bg-blue-50 dark:bg-blue-950/40 border-[#0A66C2] text-slate-900 dark:text-white"
                            : "border-slate-200 dark:border-slate-700 hover:border-slate-300"
                        }`}
                      >
                        <span className="font-bold block text-sm mb-1">{opt.title}</span>
                        <span className="text-[11px] text-slate-500">{opt.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Toggles */}
                <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold block text-slate-800 dark:text-slate-200">
                        Share activity updates with your network
                      </span>
                      <span className="text-slate-500 text-[11px]">
                        Notify connections when you change job status or publish new posts
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={shareActivityUpdates}
                      onChange={(e) => {
                        setShareActivityUpdates(e.target.checked);
                        triggerSaveToast("Activity broadcasting updated");
                      }}
                      className="w-4 h-4 text-[#0A66C2] rounded-xs"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold block text-slate-800 dark:text-slate-200">
                        Show active online status badge
                      </span>
                      <span className="text-slate-500 text-[11px]">
                        Allow connections to see when you are active on ProConnect
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={showOnlineStatus}
                      onChange={(e) => {
                        setShowOnlineStatus(e.target.checked);
                        triggerSaveToast("Online status visibility updated");
                      }}
                      className="w-4 h-4 text-[#0A66C2] rounded-xs"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold block text-slate-800 dark:text-slate-200">
                        Search engine indexing
                      </span>
                      <span className="text-slate-500 text-[11px]">
                        Allow external search engines (Google, Bing) to index your public profile
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={searchEngineIndexing}
                      onChange={(e) => {
                        setSearchEngineIndexing(e.target.checked);
                        triggerSaveToast("Search indexing preference updated");
                      }}
                      className="w-4 h-4 text-[#0A66C2] rounded-xs"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: NOTIFICATION PREFERENCES */}
          {activeTab === "notifications" && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-6">
              <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
                  <Bell className="w-5 h-5 text-[#0A66C2]" />
                  <span>Notification Preferences</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Manage email alerts, push notifications, and messaging sound alerts
                </p>
              </div>

              <div className="space-y-4 text-xs">
                <h4 className="font-bold text-slate-800 dark:text-slate-200 uppercase text-[11px] tracking-wider text-slate-400">
                  Email Notifications
                </h4>

                <div className="space-y-3">
                  <label className="flex items-center justify-between cursor-pointer">
                    <span>Direct Messages & Chat Alerts</span>
                    <input
                      type="checkbox"
                      checked={emailMessages}
                      onChange={(e) => {
                        setEmailMessages(e.target.checked);
                        triggerSaveToast("Message email preferences updated");
                      }}
                      className="w-4 h-4 text-[#0A66C2] rounded-xs"
                    />
                  </label>

                  <label className="flex items-center justify-between cursor-pointer">
                    <span>Connection Requests & Network Invitations</span>
                    <input
                      type="checkbox"
                      checked={emailConnections}
                      onChange={(e) => {
                        setEmailConnections(e.target.checked);
                        triggerSaveToast("Connection email preferences updated");
                      }}
                      className="w-4 h-4 text-[#0A66C2] rounded-xs"
                    />
                  </label>

                  <label className="flex items-center justify-between cursor-pointer">
                    <span>Job Recommendations & Opportunity Matches</span>
                    <input
                      type="checkbox"
                      checked={emailJobAlerts}
                      onChange={(e) => {
                        setEmailJobAlerts(e.target.checked);
                        triggerSaveToast("Job alerts preferences updated");
                      }}
                      className="w-4 h-4 text-[#0A66C2] rounded-xs"
                    />
                  </label>
                </div>

                <h4 className="font-bold text-slate-800 dark:text-slate-200 uppercase text-[11px] tracking-wider text-slate-400 pt-4 border-t border-slate-100 dark:border-slate-800">
                  In-App & Push Alerts
                </h4>

                <div className="space-y-3">
                  <label className="flex items-center justify-between cursor-pointer">
                    <span>Push Notifications on Browser & Mobile</span>
                    <input
                      type="checkbox"
                      checked={pushNotifications}
                      onChange={(e) => {
                        setPushNotifications(e.target.checked);
                        triggerSaveToast("Push notification preferences updated");
                      }}
                      className="w-4 h-4 text-[#0A66C2] rounded-xs"
                    />
                  </label>

                  <label className="flex items-center justify-between cursor-pointer">
                    <span>Sound Effects on New Message</span>
                    <input
                      type="checkbox"
                      checked={soundEffects}
                      onChange={(e) => {
                        setSoundEffects(e.target.checked);
                        triggerSaveToast("Sound alert preferences updated");
                      }}
                      className="w-4 h-4 text-[#0A66C2] rounded-xs"
                    />
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: APPEARANCE & DISPLAY */}
          {activeTab === "display" && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-6">
              <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
                  <Sliders className="w-5 h-5 text-[#0A66C2]" />
                  <span>Appearance & Interface Display</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Customize application theme and layout density
                </p>
              </div>

              <div className="space-y-5 text-xs">
                {/* Theme Selector */}
                <div>
                  <label className="font-bold block mb-2 text-slate-800 dark:text-slate-200">
                    Theme Mode
                  </label>
                  <div className="grid grid-cols-2 gap-3 max-w-md">
                    <button
                      type="button"
                      onClick={() => setDarkMode(false)}
                      className={`p-4 rounded-xl border flex items-center gap-3 font-bold transition-all ${
                        !darkMode
                          ? "bg-blue-50 border-[#0A66C2] text-[#0A66C2]"
                          : "border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                      }`}
                    >
                      <Sun className="w-5 h-5 text-amber-500" />
                      <span>Light Theme</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setDarkMode(true)}
                      className={`p-4 rounded-xl border flex items-center gap-3 font-bold transition-all ${
                        darkMode
                          ? "bg-slate-800 border-cyan-500 text-cyan-400"
                          : "border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                      }`}
                    >
                      <Moon className="w-5 h-5 text-indigo-400" />
                      <span>Dark Theme</span>
                    </button>
                  </div>
                </div>

                {/* Density */}
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                  <label className="flex items-center justify-between cursor-pointer">
                    <div>
                      <span className="font-bold block text-slate-800 dark:text-slate-200">
                        Compact Feed Layout
                      </span>
                      <span className="text-slate-500 text-[11px]">
                        Reduce padding and image heights for denser content viewing
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={compactLayout}
                      onChange={(e) => {
                        setCompactLayout(e.target.checked);
                        triggerSaveToast("Layout density saved");
                      }}
                      className="w-4 h-4 text-[#0A66C2] rounded-xs"
                    />
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* TAB: ADMINISTRATIVE CONSOLE */}
          {activeTab === "admin" && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-cyan-600" />
                    <span>Administrative Console & System Controls</span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    Keycloak audit stream, realm security configuration, RBAC user permissions & session manager
                  </p>
                </div>

                {setActiveTabApp && (
                  <button
                    onClick={() => setActiveTabApp("admin")}
                    className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-2"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>Open Full Admin Console</span>
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
                  <span className="text-slate-400 font-medium">Audit Trail Stream</span>
                  <p className="text-lg font-black text-slate-900 dark:text-white">Active (Realtime)</p>
                  <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">100% Events Captured</p>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
                  <span className="text-slate-400 font-medium">Keycloak Realm</span>
                  <p className="text-lg font-black text-slate-900 dark:text-white">proconnect-realm</p>
                  <p className="text-[11px] text-cyan-600 dark:text-cyan-400 font-semibold">OIDC Client Active</p>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
                  <span className="text-slate-400 font-medium">System Role</span>
                  <p className="text-lg font-black text-[#0A66C2] dark:text-cyan-400">realm-admin</p>
                  <p className="text-[11px] text-slate-500 font-mono">RS256 Verified</p>
                </div>
              </div>

              <div className="p-4 bg-cyan-50 dark:bg-cyan-950/40 border border-cyan-200 dark:border-cyan-800/60 rounded-xl text-xs space-y-3">
                <h4 className="font-bold text-cyan-950 dark:text-cyan-200 text-sm flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-cyan-600" />
                  <span>Administrative Capabilities Included Under Settings</span>
                </h4>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-slate-700 dark:text-slate-300">
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-cyan-600 shrink-0" />
                    <span>Realtime Keycloak OIDC Audit Event Logger</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-cyan-600 shrink-0" />
                    <span>Realm Client Secret & Endpoint Inspector</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-cyan-600 shrink-0" />
                    <span>Role-Based Access Control (RBAC) User Provisioning</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-cyan-600 shrink-0" />
                    <span>JWT RS256 Bearer Token Claims Inspector</span>
                  </li>
                </ul>

                {setActiveTabApp && (
                  <button
                    onClick={() => setActiveTabApp("admin")}
                    className="mt-2 px-4 py-2 bg-cyan-700 hover:bg-cyan-800 text-white font-bold rounded-xl transition-all shadow-xs"
                  >
                    Go to Admin Workspace & Audit Stream
                  </button>
                )}
              </div>
            </div>
          )}

          {/* TAB: KEYCLOAK AUTH OIDC */}
          {activeTab === "keycloak-sso" && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
                    <Key className="w-5 h-5 text-emerald-600" />
                    <span>Keycloak OIDC Authentication & SSO Engine</span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    OpenID Connect federation, session lifetimes, silent token refresh & security logs
                  </p>
                </div>

                {openKeycloakModal && (
                  <button
                    onClick={openKeycloakModal}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-2"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>Open Keycloak OIDC Inspector</span>
                  </button>
                )}
              </div>

              <div className="space-y-4 text-xs max-w-xl">
                <div>
                  <label className="font-bold block mb-1 text-slate-800 dark:text-slate-200">
                    SSO Session Token Lifespan
                  </label>
                  <select
                    value={ssoTimeout}
                    onChange={(e) => {
                      setSsoTimeout(e.target.value);
                      triggerSaveToast("Session lifespan updated!");
                    }}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                  >
                    <option value="900">15 Minutes (High Security)</option>
                    <option value="3600">1 Hour (Standard)</option>
                    <option value="28800">8 Hours (Workday)</option>
                    <option value="86400">24 Hours (Persistent)</option>
                  </select>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                  <label className="flex items-center justify-between cursor-pointer">
                    <div>
                      <span className="font-bold block text-slate-800 dark:text-slate-200">
                        Automatic Silent Token Refresh
                      </span>
                      <span className="text-slate-500 text-[11px]">
                        Automatically exchange refresh tokens in background before expiration
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={autoRefreshToken}
                      onChange={(e) => {
                        setAutoRefreshToken(e.target.checked);
                        triggerSaveToast("Silent refresh preference saved!");
                      }}
                      className="w-4 h-4 text-[#0A66C2] rounded-xs"
                    />
                  </label>
                </div>

                {onSignOut && (
                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                    <button
                      onClick={onSignOut}
                      className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-xs transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out Keycloak Session</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB: FLUTTER APK / IOS UNIFIED CODEBASE */}
          {activeTab === "flutter-suite" && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
                    <Smartphone className="w-5 h-5 text-blue-600" />
                    <span>Flutter Mobile APK & iOS Unified Codebase</span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    Export cross-platform Dart code, generate Android APKs & iOS Xcode project packages
                  </p>
                </div>

                {openFlutterSuite && (
                  <button
                    onClick={openFlutterSuite}
                    className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-2"
                  >
                    <Smartphone className="w-4 h-4 text-cyan-200" />
                    <span>Open Flutter Mobile Suite</span>
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
                  <span className="text-slate-400 font-medium">Target Framework</span>
                  <p className="text-lg font-black text-[#0A66C2] dark:text-cyan-400">Flutter 3.19.0</p>
                  <p className="text-[11px] text-slate-500 font-mono">Dart v3.3.0</p>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
                  <span className="text-slate-400 font-medium">Platforms Supported</span>
                  <p className="text-lg font-black text-slate-900 dark:text-white">Android & iOS</p>
                  <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">100% Native Widgets</p>
                </div>

                <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
                  <span className="text-slate-400 font-medium">Keycloak Integration</span>
                  <p className="text-lg font-black text-slate-900 dark:text-white">flutter_appauth</p>
                  <p className="text-[11px] text-cyan-600 dark:text-cyan-400 font-semibold">PKCE OAuth2 Included</p>
                </div>
              </div>

              <div className="p-4 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60 rounded-xl text-xs space-y-3">
                <h4 className="font-bold text-blue-950 dark:text-blue-200 text-sm flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-blue-600" />
                  <span>Unified Mobile Codebase Capabilities</span>
                </h4>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-slate-700 dark:text-slate-300">
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span>Complete main.dart & Flutter screen implementations</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span>Keycloak OAuth2 / OpenID Connect Flutter AppAuth service</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span>Android release APK package generator</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span>iOS Xcode workspace archive configuration</span>
                  </li>
                </ul>

                {openFlutterSuite && (
                  <button
                    onClick={openFlutterSuite}
                    className="mt-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-xs"
                  >
                    Launch Mobile Export Suite & Build APK
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
