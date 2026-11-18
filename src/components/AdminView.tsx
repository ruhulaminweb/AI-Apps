import React, { useState, useEffect } from "react";
import {
  ShieldCheck,
  KeyRound,
  FileText,
  Settings,
  RefreshCw,
  LogOut,
  Search,
  Download,
  Trash2,
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
  Users,
  ShieldAlert,
  Server,
  Sliders,
  Filter,
} from "lucide-react";
import { KeycloakAuditLog, KeycloakConfig, KeycloakSession } from "../types";

interface AdminViewProps {
  keycloakSession: KeycloakSession;
  setKeycloakSession?: (session: KeycloakSession) => void;
}

export const AdminView: React.FC<AdminViewProps> = ({
  keycloakSession,
  setKeycloakSession,
}) => {
  const [activeTab, setActiveTab] = useState<
    "audit-logs" | "realm-config" | "users-roles" | "jwt-inspector"
  >("audit-logs");

  // Audit Logs State
  const [logs, setLogs] = useState<KeycloakAuditLog[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [filterEventType, setFilterEventType] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [selectedLog, setSelectedLog] = useState<KeycloakAuditLog | null>(null);
  const [logClearMessage, setLogClearMessage] = useState<string | null>(null);

  // Realm Config State
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
  const [configSuccess, setConfigSuccess] = useState<string | null>(null);

  // User Management State
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUserName, setNewUserName] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserRole, setNewUserRole] = useState("proconnect-user");
  const [userList, setUserList] = useState([
    {
      id: "u-101",
      name: "Alex Morgan",
      username: "alex.morgan",
      email: "alex.morgan@proconnect.io",
      roles: ["realm-admin", "proconnect-user", "keycloak-audit-reader"],
      status: "ACTIVE",
      lastLogin: "Just now",
    },
    {
      id: "u-102",
      name: "Sarah Chen",
      username: "sarah.chen",
      email: "sarah.chen@proconnect.io",
      roles: ["recruiter", "proconnect-user"],
      status: "ACTIVE",
      lastLogin: "12 mins ago",
    },
    {
      id: "u-103",
      name: "Marcus Vance",
      username: "marcus.vance",
      email: "marcus.vance@proconnect.io",
      roles: ["keycloak-audit-reader", "proconnect-user"],
      status: "ACTIVE",
      lastLogin: "2 hours ago",
    },
    {
      id: "u-104",
      name: "Jordan Lee",
      username: "jordan.lee",
      email: "jordan.lee@proconnect.io",
      roles: ["proconnect-user"],
      status: "ACTIVE",
      lastLogin: "1 day ago",
    },
  ]);

  // Token Verification / Copy State
  const [copiedToken, setCopiedToken] = useState(false);

  // Fetch Keycloak Config & Logs
  const fetchConfig = async () => {
    try {
      const res = await fetch("/api/keycloak/config");
      const data = await res.json();
      if (data && data.config) {
        setConfig(data.config);
      }
    } catch (err) {
      console.error("Failed to fetch Keycloak config", err);
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
    fetchConfig();
    fetchLogs();
  }, [filterEventType, searchQuery]);

  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      fetchLogs();
    }, 5000);
    return () => clearInterval(interval);
  }, [autoRefresh, filterEventType, searchQuery]);

  // Clear Logs
  const handleClearLogs = async () => {
    if (!window.confirm("Are you sure you want to flush Keycloak Audit Logs?")) return;
    try {
      const res = await fetch("/api/keycloak/logs", { method: "DELETE" });
      const data = await res.json();
      setLogClearMessage(data.message || "Audit logs cleared successfully");
      setTimeout(() => setLogClearMessage(null), 3000);
      fetchLogs();
    } catch (err) {
      console.error("Error clearing logs:", err);
    }
  };

  // Export JSON / CSV
  const handleExportLogsJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(logs, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `keycloak_audit_logs_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleExportLogsCSV = () => {
    if (logs.length === 0) return;
    const headers = ["Timestamp", "EventType", "Username", "Status", "ClientIP", "Details"];
    const rows = logs.map((l) => [
      `"${l.timestamp}"`,
      `"${l.eventType}"`,
      `"${l.username}"`,
      `"${l.status}"`,
      `"${l.clientIp}"`,
      `"${l.details.replace(/"/g, '""')}"`,
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", encodeURI(csvContent));
    downloadAnchor.setAttribute("download", `keycloak_audit_logs_${Date.now()}.csv`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Save Config
  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingConfig(true);
    setConfigSuccess(null);
    try {
      const res = await fetch("/api/keycloak/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });
      const data = await res.json();
      if (res.ok) {
        setConfigSuccess("Keycloak Realm configuration updated and verified!");
        setTimeout(() => setConfigSuccess(null), 3500);
        fetchLogs();
      }
    } catch (err) {
      console.error("Config save error", err);
    } finally {
      setSavingConfig(false);
    }
  };

  // Add User
  const handleAddUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim() || !newUserEmail.trim()) return;
    const newUser = {
      id: `u-${Date.now()}`,
      name: newUserName.trim(),
      username: newUserEmail.split("@")[0].toLowerCase().replace(/[^a-z0-9]/g, "."),
      email: newUserEmail.trim(),
      roles: ["proconnect-user", newUserRole],
      status: "ACTIVE",
      lastLogin: "Just created",
    };
    setUserList([newUser, ...userList]);
    setNewUserName("");
    setNewUserEmail("");
    setShowAddUserModal(false);
  };

  // Copy JWT
  const handleCopyJWT = () => {
    if (keycloakSession.accessToken) {
      navigator.clipboard.writeText(keycloakSession.accessToken);
      setCopiedToken(true);
      setTimeout(() => setCopiedToken(false), 2000);
    }
  };

  const filteredUsers = userList.filter(
    (u) =>
      u.name.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
      u.username.toLowerCase().includes(userSearchQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Banner / Header */}
      <div className="bg-gradient-to-r from-slate-900 via-cyan-950 to-slate-900 rounded-2xl p-6 text-white border border-cyan-800/40 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-cyan-500/20 text-cyan-400 rounded-xl border border-cyan-500/30">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-extrabold tracking-tight flex items-center gap-2">
                  <span>Administrative Console</span>
                  <span className="text-xs bg-cyan-500/20 text-cyan-300 font-mono px-2 py-0.5 rounded-full border border-cyan-500/30">
                    Keycloak OIDC Security
                  </span>
                </h1>
                <p className="text-xs text-slate-300">
                  Audit log analysis, realm security controls, user RBAC management & JWT claim inspection
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <div className="px-3 py-1.5 bg-slate-800/80 rounded-xl border border-slate-700/80 flex items-center gap-2 text-slate-300 font-mono">
              <Server className="w-4 h-4 text-cyan-400" />
              <span>Realm: {config.realm}</span>
            </div>
            <div className="px-3 py-1.5 bg-emerald-500/20 text-emerald-300 rounded-xl border border-emerald-500/30 flex items-center gap-1.5 font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Audit Logging Active</span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 mt-6 pt-4 border-t border-slate-800/80 overflow-x-auto">
          <button
            onClick={() => setActiveTab("audit-logs")}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2 shrink-0 ${
              activeTab === "audit-logs"
                ? "bg-cyan-600 text-white shadow-md shadow-cyan-900/30"
                : "text-slate-300 hover:bg-slate-800/60"
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Keycloak Audit Logs</span>
            <span className="ml-1 px-1.5 py-0.2 bg-white/20 text-white rounded-full text-[10px]">
              {logs.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("realm-config")}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2 shrink-0 ${
              activeTab === "realm-config"
                ? "bg-cyan-600 text-white shadow-md shadow-cyan-900/30"
                : "text-slate-300 hover:bg-slate-800/60"
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>Realm & Server Config</span>
          </button>

          <button
            onClick={() => setActiveTab("users-roles")}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2 shrink-0 ${
              activeTab === "users-roles"
                ? "bg-cyan-600 text-white shadow-md shadow-cyan-900/30"
                : "text-slate-300 hover:bg-slate-800/60"
            }`}
          >
            <Users className="w-4 h-4" />
            <span>User RBAC & Access</span>
          </button>

          <button
            onClick={() => setActiveTab("jwt-inspector")}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2 shrink-0 ${
              activeTab === "jwt-inspector"
                ? "bg-cyan-600 text-white shadow-md shadow-cyan-900/30"
                : "text-slate-300 hover:bg-slate-800/60"
            }`}
          >
            <Code className="w-4 h-4" />
            <span>JWT & Session Claims</span>
          </button>
        </div>
      </div>

      {/* Clear Logs Message Toast */}
      {logClearMessage && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs rounded-xl flex items-center gap-2 font-bold animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          <span>{logClearMessage}</span>
        </div>
      )}

      {/* TAB 1: AUDIT LOGS VIEW */}
      {activeTab === "audit-logs" && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-4">
          {/* Audit Logs Controls */}
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex flex-wrap items-center gap-2 flex-1">
              {/* Search Bar */}
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by user, IP, detail, or event..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-hidden focus:border-cyan-500"
                />
              </div>

              {/* Event Filter */}
              <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <select
                  value={filterEventType}
                  onChange={(e) => setFilterEventType(e.target.value)}
                  className="bg-transparent text-slate-800 dark:text-slate-200 font-semibold focus:outline-hidden cursor-pointer"
                >
                  <option value="ALL">All Event Types</option>
                  <option value="LOGIN_SUCCESS">LOGIN_SUCCESS</option>
                  <option value="LOGIN_FAILED">LOGIN_FAILED</option>
                  <option value="TOKEN_REFRESH">TOKEN_REFRESH</option>
                  <option value="VERIFY_TOKEN">VERIFY_TOKEN</option>
                  <option value="REGISTER_SUCCESS">REGISTER_SUCCESS</option>
                  <option value="PASSWORD_RESET_SUCCESS">PASSWORD_RESET_SUCCESS</option>
                  <option value="LOGOUT">LOGOUT</option>
                </select>
              </div>
            </div>

            {/* Actions: Auto Refresh, Refresh, Clear, Export */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <label className="flex items-center gap-1.5 cursor-pointer font-semibold text-slate-600 dark:text-slate-300 select-none px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
                <input
                  type="checkbox"
                  checked={autoRefresh}
                  onChange={(e) => setAutoRefresh(e.target.checked)}
                  className="rounded-xs text-cyan-600"
                />
                <span>Auto-Refresh (5s)</span>
              </label>

              <button
                onClick={fetchLogs}
                disabled={loadingLogs}
                className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center gap-1 font-semibold"
                title="Refresh logs now"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingLogs ? "animate-spin text-cyan-500" : ""}`} />
                <span className="hidden sm:inline">Refresh</span>
              </button>

              <button
                onClick={handleExportLogsJSON}
                className="px-2.5 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg font-bold flex items-center gap-1"
                title="Export JSON"
              >
                <Download className="w-3.5 h-3.5 text-cyan-500" />
                <span>JSON</span>
              </button>

              <button
                onClick={handleExportLogsCSV}
                className="px-2.5 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg font-bold flex items-center gap-1"
                title="Export CSV"
              >
                <Download className="w-3.5 h-3.5 text-emerald-500" />
                <span>CSV</span>
              </button>

              <button
                onClick={handleClearLogs}
                className="px-2.5 py-1.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 hover:bg-rose-100 dark:hover:bg-rose-900/40 text-rose-600 dark:text-rose-300 rounded-lg font-bold flex items-center gap-1"
                title="Flush logs"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear</span>
              </button>
            </div>
          </div>

          {/* Audit Log Table */}
          <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
            <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-slate-800/80 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">Timestamp</th>
                  <th className="py-2.5 px-3">Event Type</th>
                  <th className="py-2.5 px-3">Username</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Client IP</th>
                  <th className="py-2.5 px-3">Log Details</th>
                  <th className="py-2.5 px-3 text-right">Inspect</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
                {logs.length > 0 ? (
                  logs.map((log) => {
                    const isSuccess = log.status === "SUCCESS";
                    return (
                      <tr
                        key={log.id}
                        onClick={() => setSelectedLog(log)}
                        className="hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors"
                      >
                        <td className="py-2.5 px-3 text-slate-500 dark:text-slate-400 whitespace-nowrap text-[11px]">
                          {new Date(log.timestamp).toLocaleTimeString()}
                        </td>
                        <td className="py-2.5 px-3 whitespace-nowrap">
                          <span className="font-bold text-slate-900 dark:text-slate-100 text-[11px]">
                            {log.eventType}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 font-semibold text-cyan-600 dark:text-cyan-400 whitespace-nowrap">
                          {log.username}
                        </td>
                        <td className="py-2.5 px-3 whitespace-nowrap">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              isSuccess
                                ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800"
                                : "bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800"
                            }`}
                          >
                            {log.status}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-slate-500 whitespace-nowrap text-[11px]">
                          {log.clientIp}
                        </td>
                        <td className="py-2.5 px-3 max-w-xs truncate text-[11px] font-sans text-slate-600 dark:text-slate-300">
                          {log.details}
                        </td>
                        <td className="py-2.5 px-3 text-right font-sans">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedLog(log);
                            }}
                            className="text-cyan-600 hover:underline text-[11px] font-bold"
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400 italic font-sans">
                      No audit logs matching query.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: REALM CONFIGURATION */}
      {activeTab === "realm-config" && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-6">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
              <Sliders className="w-5 h-5 text-cyan-600" />
              <span>Keycloak Server & Realm Settings</span>
            </h3>
            <p className="text-xs text-slate-500">
              Configure OIDC authorization endpoints, realm identity, and client secrets
            </p>
          </div>

          {configSuccess && (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs rounded-xl flex items-center gap-2 font-bold animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>{configSuccess}</span>
            </div>
          )}

          <form onSubmit={handleSaveConfig} className="space-y-4 max-w-2xl">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="font-semibold block mb-1 text-slate-700 dark:text-slate-300">
                  Keycloak Server Base URL
                </label>
                <input
                  type="text"
                  required
                  value={config.serverUrl}
                  onChange={(e) => setConfig({ ...config, serverUrl: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden focus:border-cyan-500 font-mono"
                />
              </div>

              <div>
                <label className="font-semibold block mb-1 text-slate-700 dark:text-slate-300">
                  Keycloak Realm Name
                </label>
                <input
                  type="text"
                  required
                  value={config.realm}
                  onChange={(e) => setConfig({ ...config, realm: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden focus:border-cyan-500 font-mono"
                />
              </div>

              <div>
                <label className="font-semibold block mb-1 text-slate-700 dark:text-slate-300">
                  OIDC Client ID
                </label>
                <input
                  type="text"
                  required
                  value={config.clientId}
                  onChange={(e) => setConfig({ ...config, clientId: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden focus:border-cyan-500 font-mono"
                />
              </div>

              <div>
                <label className="font-semibold block mb-1 text-slate-700 dark:text-slate-300">
                  Client Secret
                </label>
                <input
                  type="password"
                  required
                  value={config.clientSecret}
                  onChange={(e) => setConfig({ ...config, clientSecret: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden focus:border-cyan-500 font-mono"
                />
              </div>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/60 space-y-3">
              <h4 className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-2">
                <Globe className="w-4 h-4 text-cyan-500" />
                <span>OIDC Endpoint Manifest</span>
              </h4>
              <div className="text-[11px] font-mono space-y-1 text-slate-600 dark:text-slate-300">
                <p>
                  <strong>Issuer:</strong> {config.serverUrl}/realms/{config.realm}
                </p>
                <p>
                  <strong>JWKS Certs:</strong> {config.serverUrl}/realms/{config.realm}/protocol/openid-connect/certs
                </p>
                <p>
                  <strong>Token Endpoint:</strong> {config.serverUrl}/realms/{config.realm}/protocol/openid-connect/token
                </p>
              </div>
            </div>

            <button
              type="submit"
              disabled={savingConfig}
              className="px-6 py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {savingConfig ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Updating Realm Config...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Save Keycloak Realm Settings</span>
                </>
              )}
            </button>
          </form>
        </div>
      )}

      {/* TAB 3: USER RBAC MANAGEMENT */}
      {activeTab === "users-roles" && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
                <Users className="w-5 h-5 text-cyan-600" />
                <span>Keycloak Realm Users & Role Access (RBAC)</span>
              </h3>
              <p className="text-xs text-slate-500">
                Manage accounts, role assignments, and active sessions in realm '{config.realm}'
              </p>
            </div>

            <button
              onClick={() => setShowAddUserModal(true)}
              className="px-3.5 py-2 bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
            >
              <UserPlus className="w-4 h-4" />
              <span>Add Realm User</span>
            </button>
          </div>

          {/* User Search */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Filter realm users by name, email or role..."
              value={userSearchQuery}
              onChange={(e) => setUserSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-100 dark:bg-slate-800 text-xs rounded-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-hidden"
            />
          </div>

          {/* User Table */}
          <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
            <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-slate-800/80 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">User</th>
                  <th className="py-2.5 px-3">Username</th>
                  <th className="py-2.5 px-3">Assigned Roles</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Last Active</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="py-3 px-3">
                      <div>
                        <h5 className="font-bold text-slate-900 dark:text-white">{u.name}</h5>
                        <p className="text-[11px] text-slate-500">{u.email}</p>
                      </div>
                    </td>
                    <td className="py-3 px-3 font-mono text-cyan-600 dark:text-cyan-400">
                      {u.username}
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex flex-wrap gap-1">
                        {u.roles.map((r) => (
                          <span
                            key={r}
                            className="px-2 py-0.5 bg-cyan-100 dark:bg-cyan-950/60 text-cyan-800 dark:text-cyan-300 text-[10px] font-bold rounded-md border border-cyan-200 dark:border-cyan-800"
                          >
                            {r}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold rounded-full">
                        {u.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-500 text-[11px]">
                      {u.lastLogin}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => alert(`Session revoked for ${u.name}`)}
                        className="px-2.5 py-1 text-[11px] font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors border border-rose-200 dark:border-rose-800"
                      >
                        Revoke
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: JWT INSPECTOR */}
      {activeTab === "jwt-inspector" && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
                <Code className="w-5 h-5 text-cyan-600" />
                <span>Active JWT Session & Claims Inspector</span>
              </h3>
              <p className="text-xs text-slate-500">
                Decoded OIDC RS256 Bearer Token payload and claims currently held in browser session
              </p>
            </div>

            <button
              onClick={handleCopyJWT}
              className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center gap-1.5"
            >
              {copiedToken ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
              <span>{copiedToken ? "Copied Raw JWT" : "Copy Raw JWT"}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Decoded Claims Box */}
            <div className="p-4 bg-slate-900 text-cyan-400 rounded-xl font-mono text-xs overflow-x-auto space-y-2 border border-slate-800">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800 pb-2 flex items-center justify-between">
                <span>Decoded Payload Claims</span>
                <span className="text-emerald-400">RS256 Verified</span>
              </div>
              <pre className="whitespace-pre-wrap leading-relaxed">
                {JSON.stringify(keycloakSession.tokenPayload || keycloakSession, null, 2)}
              </pre>
            </div>

            {/* Session Status Box */}
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
                <h4 className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-cyan-500" />
                  <span>Session Authenticated Overview</span>
                </h4>

                <div className="text-xs space-y-2 text-slate-700 dark:text-slate-300">
                  <div className="flex justify-between border-b border-slate-200 dark:border-slate-700 pb-1.5">
                    <span className="font-medium text-slate-500">Is Authenticated:</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">
                      {keycloakSession.isAuthenticated ? "TRUE" : "FALSE"}
                    </span>
                  </div>

                  <div className="flex justify-between border-b border-slate-200 dark:border-slate-700 pb-1.5">
                    <span className="font-medium text-slate-500">Username:</span>
                    <span className="font-bold font-mono">{keycloakSession.username || "N/A"}</span>
                  </div>

                  <div className="flex justify-between border-b border-slate-200 dark:border-slate-700 pb-1.5">
                    <span className="font-medium text-slate-500">Email:</span>
                    <span className="font-bold">{keycloakSession.email || "N/A"}</span>
                  </div>

                  <div className="flex justify-between border-b border-slate-200 dark:border-slate-700 pb-1.5">
                    <span className="font-medium text-slate-500">Session Login Time:</span>
                    <span className="font-mono text-[11px]">{keycloakSession.loginTime || "N/A"}</span>
                  </div>
                </div>
              </div>

              {/* Roles Badges */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                <h4 className="font-bold text-xs text-slate-900 dark:text-white">Active Realm Roles</h4>
                <div className="flex flex-wrap gap-1.5">
                  {(keycloakSession.roles || ["proconnect-user"]).map((r) => (
                    <span
                      key={r}
                      className="px-2.5 py-1 bg-cyan-100 dark:bg-cyan-950/80 text-cyan-800 dark:text-cyan-300 text-xs font-bold rounded-lg border border-cyan-300 dark:border-cyan-800"
                    >
                      {r}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Log Inspector Detail Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-xl w-full border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                <FileText className="w-4 h-4 text-cyan-500" />
                <span>Keycloak Audit Record Inspector</span>
              </h3>
              <button
                onClick={() => setSelectedLog(null)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl font-mono">
                <div>
                  <span className="text-[10px] text-slate-400 block">EVENT TYPE</span>
                  <span className="font-bold text-slate-900 dark:text-white">{selectedLog.eventType}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">STATUS</span>
                  <span
                    className={`font-bold ${
                      selectedLog.status === "SUCCESS" ? "text-emerald-500" : "text-rose-500"
                    }`}
                  >
                    {selectedLog.status}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">USER</span>
                  <span className="font-bold text-cyan-600">{selectedLog.username}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">CLIENT IP</span>
                  <span className="text-slate-700 dark:text-slate-300">{selectedLog.clientIp}</span>
                </div>
              </div>

              <div>
                <span className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Event Details:
                </span>
                <p className="p-3 bg-slate-100 dark:bg-slate-800/80 rounded-xl text-slate-800 dark:text-slate-200 leading-relaxed font-sans">
                  {selectedLog.details}
                </p>
              </div>

              <div>
                <span className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Raw Audit Log JSON:
                </span>
                <pre className="p-3 bg-slate-900 text-cyan-300 rounded-xl font-mono text-[11px] overflow-x-auto max-h-48">
                  {JSON.stringify(selectedLog, null, 2)}
                </pre>
              </div>
            </div>

            <button
              onClick={() => setSelectedLog(null)}
              className="w-full py-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold rounded-xl text-xs transition-colors"
            >
              Close Record
            </button>
          </div>
        </div>
      )}

      {/* Add User Modal */}
      {showAddUserModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleAddUserSubmit}
            className="bg-white dark:bg-slate-900 rounded-2xl max-w-sm w-full border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-cyan-500" />
                <span>Add Keycloak Realm User</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowAddUserModal(false)}
                className="p-1 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold block mb-1 text-slate-700 dark:text-slate-300">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rachel Adams"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="font-semibold block mb-1 text-slate-700 dark:text-slate-300">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. rachel.adams@proconnect.io"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="font-semibold block mb-1 text-slate-700 dark:text-slate-300">
                  Assigned Realm Role
                </label>
                <select
                  value={newUserRole}
                  onChange={(e) => setNewUserRole(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden focus:border-cyan-500"
                >
                  <option value="proconnect-user">proconnect-user</option>
                  <option value="recruiter">recruiter</option>
                  <option value="keycloak-audit-reader">keycloak-audit-reader</option>
                  <option value="realm-admin">realm-admin</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2 bg-cyan-600 hover:bg-cyan-700 text-white font-bold rounded-lg text-xs transition-colors shadow-xs"
            >
              Provision User
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
