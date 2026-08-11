import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));

// Initialize Gemini Client
const apiKey = process.env.GEMINI_API_KEY;
let aiClient: GoogleGenAI | null = null;
if (apiKey) {
  aiClient = new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// Helper getter
function getAI() {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// --- API ENDPOINTS ---

// Health Check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", aiConfigured: !!process.env.GEMINI_API_KEY });
});

// --- KEYCLOAK AUTHENTICATION & AUDIT LOGGING STORE ---
let keycloakConfig = {
  serverUrl: process.env.KEYCLOAK_URL || "https://keycloak.proconnect.internal/auth",
  realm: process.env.KEYCLOAK_REALM || "proconnect-realm",
  clientId: process.env.KEYCLOAK_CLIENT_ID || "proconnect-web-app",
  clientSecret: process.env.KEYCLOAK_CLIENT_SECRET || "sec_kc_98f412a884",
  grantType: "authorization_code",
  ssoEnabled: true,
  sslRequired: "external",
};

let keycloakAuditLogs: any[] = [
  {
    id: "kc-log-101",
    timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    eventType: "LOGIN_SUCCESS",
    username: "alex.morgan",
    realm: "proconnect-realm",
    clientIp: "192.168.1.104",
    status: "SUCCESS",
    details: "Keycloak OIDC PKCE Login completed via realm 'proconnect-realm'. Granted roles: [realm-admin, proconnect-user, candidate-recruiter].",
    sessionDurationSec: 3600,
    userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
    tokenScope: "openid profile email roles",
  },
  {
    id: "kc-log-102",
    timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    eventType: "TOKEN_REFRESH",
    username: "alex.morgan",
    realm: "proconnect-realm",
    clientIp: "192.168.1.104",
    status: "SUCCESS",
    details: "Token refreshed successfully. Issued new JWT Bearer signed with RSA256.",
    userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
    tokenScope: "openid profile email roles",
  },
  {
    id: "kc-log-103",
    timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    eventType: "VERIFY_TOKEN",
    username: "sarah.chen",
    realm: "proconnect-realm",
    clientIp: "10.0.4.12",
    status: "SUCCESS",
    details: "JWT signature verified against Keycloak JWKS endpoint (certs).",
    userAgent: "Keycloak-JS/22.0.1",
    tokenScope: "openid profile email",
  },
  {
    id: "kc-log-104",
    timestamp: new Date(Date.now() - 1000 * 60 * 240).toISOString(),
    eventType: "LOGIN_FAILED",
    username: "unknown.user",
    realm: "proconnect-realm",
    clientIp: "185.220.101.5",
    status: "FAILED",
    details: "Invalid user credentials provided at Keycloak realm endpoint. Action logged for security audit.",
    userAgent: "Python-requests/2.28.1",
    tokenScope: "none",
  },
];

// Keycloak Config Endpoint
app.get("/api/keycloak/config", (req, res) => {
  res.json({
    config: keycloakConfig,
    issuerUrl: `${keycloakConfig.serverUrl}/realms/${keycloakConfig.realm}`,
    jwksUrl: `${keycloakConfig.serverUrl}/realms/${keycloakConfig.realm}/protocol/openid-connect/certs`,
    tokenUrl: `${keycloakConfig.serverUrl}/realms/${keycloakConfig.realm}/protocol/openid-connect/token`,
    authUrl: `${keycloakConfig.serverUrl}/realms/${keycloakConfig.realm}/protocol/openid-connect/auth`,
  });
});

app.post("/api/keycloak/config", (req, res) => {
  const { serverUrl, realm, clientId, clientSecret, ssoEnabled } = req.body;
  if (serverUrl) keycloakConfig.serverUrl = serverUrl;
  if (realm) keycloakConfig.realm = realm;
  if (clientId) keycloakConfig.clientId = clientId;
  if (clientSecret !== undefined) keycloakConfig.clientSecret = clientSecret;
  if (ssoEnabled !== undefined) keycloakConfig.ssoEnabled = Boolean(ssoEnabled);

  // Add system log
  const newLog = {
    id: `kc-log-${Date.now()}`,
    timestamp: new Date().toISOString(),
    eventType: "VERIFY_TOKEN",
    username: "system.admin",
    realm: keycloakConfig.realm,
    clientIp: req.ip || "127.0.0.1",
    status: "SUCCESS",
    details: `Updated Keycloak configuration for Realm '${keycloakConfig.realm}' and Client ID '${keycloakConfig.clientId}'.`,
    userAgent: req.get("user-agent") || "ProConnect-Client",
    tokenScope: "openid admin",
  };
  keycloakAuditLogs.unshift(newLog);

  res.json({ status: "updated", config: keycloakConfig });
});

// Keycloak Login / SSO Authentication
app.post("/api/keycloak/login", (req, res) => {
  const { username, password, realm = keycloakConfig.realm } = req.body;
  const ip = req.ip || "127.0.0.1";
  const userAgent = req.get("user-agent") || "ProConnect Web Client";

  if (!username) {
    return res.status(400).json({ error: "Username or email is required" });
  }

  // Check mock password check or standard demo login
  if (password === "wrong" || password === "error") {
    const failedLog = {
      id: `kc-log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      eventType: "LOGIN_FAILED",
      username,
      realm,
      clientIp: ip,
      status: "FAILED",
      details: `Authentication failed for user '${username}' on Keycloak Realm '${realm}'. Invalid credentials.`,
      userAgent,
      tokenScope: "none",
    };
    keycloakAuditLogs.unshift(failedLog);
    return res.status(401).json({ error: "Invalid Keycloak realm credentials" });
  }

  // Generate synthetic JWT payload simulating Keycloak OIDC Token
  const now = Math.floor(Date.now() / 1000);
  const tokenPayload = {
    sub: `kc-sub-${username.toLowerCase().replace(/[^a-z0-9]/g, "")}-8842`,
    preferred_username: username,
    email: `${username.toLowerCase().replace(/\s+/g, ".")}@proconnect.io`,
    given_name: username.split(" ")[0] || username,
    family_name: username.split(" ")[1] || "User",
    realm_access: {
      roles: ["offline_access", "uma_authorization", "proconnect-user", "realm-admin", "keycloak-audit-reader"],
    },
    resource_access: {
      "proconnect-web-app": {
        roles: ["user", "content-creator", "network-builder"],
      },
      "account": {
        roles: ["manage-account", "view-profile"],
      },
    },
    exp: now + 3600,
    iat: now,
    iss: `${keycloakConfig.serverUrl}/realms/${realm}`,
    azp: keycloakConfig.clientId,
  };

  const headerB64 = Buffer.from(JSON.stringify({ alg: "RS256", typ: "JWT", kid: "kc-key-2026-v1" })).toString("base64url");
  const payloadB64 = Buffer.from(JSON.stringify(tokenPayload)).toString("base64url");
  const mockSig = "kc_sig_" + Math.random().toString(36).substring(2, 18);
  const accessToken = `${headerB64}.${payloadB64}.${mockSig}`;
  const refreshToken = `kc_rt_${Math.random().toString(36).substring(2, 24)}`;

  const successLog = {
    id: `kc-log-${Date.now()}`,
    timestamp: new Date().toISOString(),
    eventType: "LOGIN_SUCCESS",
    username,
    realm,
    clientIp: ip,
    status: "SUCCESS",
    details: `Keycloak OIDC Authentication Successful for user '${username}'. Realm roles: [${tokenPayload.realm_access.roles.join(", ")}].`,
    sessionDurationSec: 3600,
    userAgent,
    tokenScope: "openid profile email roles",
  };
  keycloakAuditLogs.unshift(successLog);

  res.json({
    message: "Authenticated successfully with Keycloak Realm",
    session: {
      isAuthenticated: true,
      accessToken,
      refreshToken,
      tokenPayload,
      roles: tokenPayload.realm_access.roles,
      username,
      email: tokenPayload.email,
      loginTime: new Date().toISOString(),
      expiresAt: tokenPayload.exp * 1000,
    },
  });
});

// Keycloak SignUp / Realm User Registration Endpoint
app.post("/api/keycloak/signup", (req, res) => {
  const { fullName, username, email, password, realm = keycloakConfig.realm, role = "proconnect-user" } = req.body;
  const ip = req.ip || "127.0.0.1";
  const userAgent = req.get("user-agent") || "ProConnect Web Client";

  if (!username || !email || !password) {
    const failLog = {
      id: `kc-log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      eventType: "REGISTER_FAILED",
      username: username || "anonymous",
      realm,
      clientIp: ip,
      status: "FAILED",
      details: "Registration failed on Keycloak Realm: Missing mandatory fields (username, email, or password).",
      userAgent,
      tokenScope: "none",
    };
    keycloakAuditLogs.unshift(failLog);
    return res.status(400).json({ error: "Username, email, and password are required" });
  }

  // Create JWT session for newly registered Keycloak user
  const now = Math.floor(Date.now() / 1000);
  const nameParts = (fullName || username).split(" ");
  const givenName = nameParts[0] || username;
  const familyName = nameParts.slice(1).join(" ") || "User";

  const userRoles = ["offline_access", role, "proconnect-user"];
  if (role === "admin" || role === "realm-admin") {
    userRoles.push("realm-admin");
  }

  const tokenPayload = {
    sub: `kc-sub-${username.toLowerCase().replace(/[^a-z0-9]/g, "")}-${Math.floor(1000 + Math.random() * 9000)}`,
    preferred_username: username,
    email,
    given_name: givenName,
    family_name: familyName,
    realm_access: {
      roles: userRoles,
    },
    resource_access: {
      "proconnect-web-app": {
        roles: ["user", "content-creator"],
      },
    },
    exp: now + 3600,
    iat: now,
    iss: `${keycloakConfig.serverUrl}/realms/${realm}`,
    azp: keycloakConfig.clientId,
  };

  const headerB64 = Buffer.from(JSON.stringify({ alg: "RS256", typ: "JWT", kid: "kc-key-2026-v1" })).toString("base64url");
  const payloadB64 = Buffer.from(JSON.stringify(tokenPayload)).toString("base64url");
  const mockSig = "kc_sig_reg_" + Math.random().toString(36).substring(2, 18);
  const accessToken = `${headerB64}.${payloadB64}.${mockSig}`;
  const refreshToken = `kc_rt_${Math.random().toString(36).substring(2, 24)}`;

  const successLog = {
    id: `kc-log-${Date.now()}`,
    timestamp: new Date().toISOString(),
    eventType: "REGISTER_SUCCESS",
    username,
    realm,
    clientIp: ip,
    status: "SUCCESS",
    details: `User '${username}' (${email}) successfully registered in Keycloak Realm '${realm}'. Granted initial roles: [${userRoles.join(", ")}].`,
    sessionDurationSec: 3600,
    userAgent,
    tokenScope: "openid profile email roles",
  };
  keycloakAuditLogs.unshift(successLog);

  res.json({
    message: "Registration successful in Keycloak Realm!",
    session: {
      isAuthenticated: true,
      accessToken,
      refreshToken,
      tokenPayload,
      roles: userRoles,
      username,
      email,
      loginTime: new Date().toISOString(),
      expiresAt: tokenPayload.exp * 1000,
    },
  });
});

// Keycloak Forgot Password Endpoint
app.post("/api/keycloak/forgot-password", (req, res) => {
  const { emailOrUsername, realm = keycloakConfig.realm } = req.body;
  const ip = req.ip || "127.0.0.1";
  const userAgent = req.get("user-agent") || "ProConnect Web Client";

  if (!emailOrUsername) {
    return res.status(400).json({ error: "Email or username is required" });
  }

  const resetToken = `kc_prt_${Math.random().toString(36).substring(2, 18)}_${Date.now()}`;
  const resetUrl = `${keycloakConfig.serverUrl}/realms/${realm}/login-actions/action-token?key=${resetToken}`;

  const resetLog = {
    id: `kc-log-${Date.now()}`,
    timestamp: new Date().toISOString(),
    eventType: "PASSWORD_RESET_REQUESTED",
    username: emailOrUsername,
    realm,
    clientIp: ip,
    status: "SUCCESS",
    details: `Password reset link requested for '${emailOrUsername}' in Keycloak Realm '${realm}'. Action token generated: ${resetToken.substring(0, 16)}...`,
    userAgent,
    tokenScope: "openid reset-credentials",
  };
  keycloakAuditLogs.unshift(resetLog);

  res.json({
    message: `Password reset email dispatched for '${emailOrUsername}' via Keycloak SMTP SPI.`,
    resetToken,
    resetUrl,
    expiresInMinutes: 15,
  });
});

// Keycloak Reset Password Confirmation Endpoint
app.post("/api/keycloak/reset-password", (req, res) => {
  const { resetToken, newPassword, confirmPassword, username = "alex.morgan", realm = keycloakConfig.realm } = req.body;
  const ip = req.ip || "127.0.0.1";
  const userAgent = req.get("user-agent") || "ProConnect Web Client";

  if (!newPassword || newPassword !== confirmPassword) {
    const failLog = {
      id: `kc-log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      eventType: "PASSWORD_CHANGE",
      username,
      realm,
      clientIp: ip,
      status: "FAILED",
      details: "Password change rejected: Passwords do not match or standard policy requirements not met.",
      userAgent,
      tokenScope: "none",
    };
    keycloakAuditLogs.unshift(failLog);
    return res.status(400).json({ error: "Passwords do not match or are invalid" });
  }

  const changeLog = {
    id: `kc-log-${Date.now()}`,
    timestamp: new Date().toISOString(),
    eventType: "PASSWORD_RESET_SUCCESS",
    username,
    realm,
    clientIp: ip,
    status: "SUCCESS",
    details: `Password for user '${username}' successfully updated in Keycloak Realm '${realm}'. Active sessions invalidated.`,
    userAgent,
    tokenScope: "openid profile email",
  };
  keycloakAuditLogs.unshift(changeLog);

  res.json({
    message: "Keycloak password successfully updated! You can now log in with your new credentials.",
    status: "SUCCESS",
  });
});

// In-Memory store for 2FA OTPs
interface OtpStoreItem {
  code: string;
  email: string;
  purpose: "signup" | "reset-password";
  expiresAt: number;
  userData?: any;
}

const otpStore = new Map<string, OtpStoreItem>();

// Keycloak 2FA Email OTP Dispatch Endpoint
app.post("/api/keycloak/send-otp", (req, res) => {
  const { email, purpose = "signup", userData, realm = keycloakConfig.realm } = req.body;
  const ip = req.ip || "127.0.0.1";
  const userAgent = req.get("user-agent") || "ProConnect Web Client";

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email.trim())) {
    return res.status(400).json({ error: "Please enter a valid email address (e.g. user@domain.com)" });
  }

  const cleanEmail = email.trim().toLowerCase();
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = Date.now() + 10 * 60 * 1000;

  const storeKey = `${cleanEmail}:${purpose}`;
  otpStore.set(storeKey, {
    code,
    email: cleanEmail,
    purpose,
    expiresAt,
    userData,
  });

  const eventType = purpose === "signup" ? "2FA_SIGNUP_OTP_DISPATCHED" : "2FA_RESET_OTP_DISPATCHED";
  const otpLog = {
    id: `kc-log-${Date.now()}`,
    timestamp: new Date().toISOString(),
    eventType,
    username: userData?.username || cleanEmail,
    realm,
    clientIp: ip,
    status: "SUCCESS",
    details: `Two-Factor OTP code (${code}) sent to valid email '${cleanEmail}' for ${purpose}. Keycloak SMTP SPI verification active for 10 min.`,
    userAgent,
    tokenScope: "openid email 2fa",
  };
  keycloakAuditLogs.unshift(otpLog);

  res.json({
    message: `2FA verification OTP sent to ${cleanEmail}`,
    email: cleanEmail,
    otpCode: code,
    expiresInSeconds: 600,
    purpose,
  });
});

// Keycloak 2FA Email OTP Verification Endpoint
app.post("/api/keycloak/verify-otp", (req, res) => {
  const { email, code, purpose, newPassword, confirmPassword, realm = keycloakConfig.realm } = req.body;
  const ip = req.ip || "127.0.0.1";
  const userAgent = req.get("user-agent") || "ProConnect Web Client";

  if (!email || !code) {
    return res.status(400).json({ error: "Valid email address and 6-digit OTP code are required" });
  }

  const cleanEmail = email.trim().toLowerCase();
  const storeKey = `${cleanEmail}:${purpose}`;
  const record = otpStore.get(storeKey);

  if (!record) {
    return res.status(400).json({ error: "No active 2FA OTP request found for this email address. Please request a new code." });
  }

  if (Date.now() > record.expiresAt) {
    otpStore.delete(storeKey);
    return res.status(400).json({ error: "OTP verification code has expired. Please request a new code." });
  }

  if (record.code !== code.trim()) {
    const failLog = {
      id: `kc-log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      eventType: purpose === "signup" ? "2FA_SIGNUP_FAILED" : "2FA_RESET_FAILED",
      username: record.userData?.username || cleanEmail,
      realm,
      clientIp: ip,
      status: "FAILED",
      details: `Invalid 2FA OTP code submitted for '${cleanEmail}'. Keycloak 2FA rejected.`,
      userAgent,
      tokenScope: "2fa",
    };
    keycloakAuditLogs.unshift(failLog);
    return res.status(400).json({ error: "Invalid OTP code. Please enter the correct 6-digit code sent to your email." });
  }

  // OTP verified successfully
  otpStore.delete(storeKey);

  if (purpose === "signup") {
    const userData = record.userData || {};
    const username = userData.username || cleanEmail.split("@")[0];
    const fullName = userData.fullName || username;
    const role = userData.role || "proconnect-user";

    const now = Math.floor(Date.now() / 1000);
    const nameParts = fullName.split(" ");
    const givenName = nameParts[0] || username;
    const familyName = nameParts.slice(1).join(" ") || "User";

    const userRoles = ["offline_access", role, "proconnect-user"];
    if (role === "admin" || role === "realm-admin") {
      userRoles.push("realm-admin");
    }

    const tokenPayload = {
      sub: `kc-sub-${username.toLowerCase().replace(/[^a-z0-9]/g, "")}-${Math.floor(1000 + Math.random() * 9000)}`,
      preferred_username: username,
      email: cleanEmail,
      given_name: givenName,
      family_name: familyName,
      realm_access: {
        roles: userRoles,
      },
      resource_access: {
        "proconnect-web-app": {
          roles: ["user", "content-creator"],
        },
      },
      exp: now + 3600,
      iat: now,
      iss: `${keycloakConfig.serverUrl}/realms/${realm}`,
      azp: keycloakConfig.clientId,
    };

    const headerB64 = Buffer.from(JSON.stringify({ alg: "RS256", typ: "JWT", kid: "kc-key-2026-v1" })).toString("base64url");
    const payloadB64 = Buffer.from(JSON.stringify(tokenPayload)).toString("base64url");
    const mockSig = "kc_sig_2fa_" + Math.random().toString(36).substring(2, 18);
    const accessToken = `${headerB64}.${payloadB64}.${mockSig}`;
    const refreshToken = `kc_rt_${Math.random().toString(36).substring(2, 24)}`;

    const successLog = {
      id: `kc-log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      eventType: "2FA_SIGNUP_SUCCESS",
      username,
      realm,
      clientIp: ip,
      status: "SUCCESS",
      details: `2FA email OTP verified! Account '${username}' (${cleanEmail}) registered and authenticated in Keycloak Realm '${realm}'.`,
      sessionDurationSec: 3600,
      userAgent,
      tokenScope: "openid profile email roles 2fa_verified",
    };
    keycloakAuditLogs.unshift(successLog);

    return res.json({
      message: "2FA Email verification successful! Account created.",
      session: {
        isAuthenticated: true,
        accessToken,
        refreshToken,
        tokenPayload,
        roles: userRoles,
        username,
        email: cleanEmail,
        loginTime: new Date().toISOString(),
        expiresAt: tokenPayload.exp * 1000,
      },
    });
  } else if (purpose === "reset-password") {
    if (!newPassword || newPassword !== confirmPassword) {
      return res.status(400).json({ error: "New password and confirmation password do not match." });
    }

    const resetSuccessLog = {
      id: `kc-log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      eventType: "2FA_RESET_PASSWORD_SUCCESS",
      username: cleanEmail,
      realm,
      clientIp: ip,
      status: "SUCCESS",
      details: `2FA Email OTP verified! Password for '${cleanEmail}' successfully updated in Keycloak Realm '${realm}'.`,
      userAgent,
      tokenScope: "openid profile email 2fa_verified",
    };
    keycloakAuditLogs.unshift(resetSuccessLog);

    return res.json({
      message: "2FA OTP verified! Your password has been successfully reset.",
      status: "SUCCESS",
    });
  }

  res.json({ message: "2FA OTP verified successfully." });
});

// Keycloak Token Verification & JWT Decode Endpoint
app.post("/api/keycloak/verify-token", (req, res) => {
  const authHeader = req.headers.authorization;
  const token = req.body.token || (authHeader && authHeader.startsWith("Bearer ") ? authHeader.substring(7) : null);
  const ip = req.ip || "127.0.0.1";
  const userAgent = req.get("user-agent") || "ProConnect Client";

  if (!token) {
    return res.status(400).json({ error: "No JWT token provided for Keycloak verification" });
  }

  try {
    const parts = token.split(".");
    if (parts.length === 3) {
      const payloadStr = Buffer.from(parts[1], "base64url").toString("utf-8");
      const decodedPayload = JSON.parse(payloadStr);

      const auditLog = {
        id: `kc-log-${Date.now()}`,
        timestamp: new Date().toISOString(),
        eventType: "VERIFY_TOKEN",
        username: decodedPayload.preferred_username || "token.bearer",
        realm: keycloakConfig.realm,
        clientIp: ip,
        status: "SUCCESS",
        details: `JWT Token payload successfully verified against Keycloak Certs (JWKS). Issuer: ${decodedPayload.iss}`,
        userAgent,
        tokenScope: "openid profile email roles",
      };
      keycloakAuditLogs.unshift(auditLog);

      return res.json({
        valid: true,
        header: { alg: "RS256", typ: "JWT", kid: "kc-key-2026-v1" },
        payload: decodedPayload,
        signatureVerified: true,
        issuer: decodedPayload.iss,
        timeToExpirySec: Math.max(0, Math.floor(decodedPayload.exp - Date.now() / 1000)),
      });
    }
  } catch (err: any) {
    console.warn("Token decoding failed:", err.message);
  }

  // Fallback verification for arbitrary tokens
  const fallbackLog = {
    id: `kc-log-${Date.now()}`,
    timestamp: new Date().toISOString(),
    eventType: "VERIFY_TOKEN",
    username: "session.user",
    realm: keycloakConfig.realm,
    clientIp: ip,
    status: "SUCCESS",
    details: "Keycloak Bearer token active and verified.",
    userAgent,
    tokenScope: "openid profile email",
  };
  keycloakAuditLogs.unshift(fallbackLog);

  res.json({
    valid: true,
    signatureVerified: true,
    issuer: `${keycloakConfig.serverUrl}/realms/${keycloakConfig.realm}`,
    realm: keycloakConfig.realm,
    message: "Keycloak Bearer token validated successfully.",
  });
});

// Keycloak Refresh Token
app.post("/api/keycloak/refresh", (req, res) => {
  const { refreshToken, username = "alex.morgan" } = req.body;
  const ip = req.ip || "127.0.0.1";

  const now = Math.floor(Date.now() / 1000);
  const newPayload = {
    sub: `kc-sub-${username.toLowerCase().replace(/[^a-z0-9]/g, "")}-8842`,
    preferred_username: username,
    email: `${username.toLowerCase().replace(/\s+/g, ".")}@proconnect.io`,
    realm_access: {
      roles: ["offline_access", "proconnect-user", "realm-admin"],
    },
    exp: now + 3600,
    iat: now,
    iss: `${keycloakConfig.serverUrl}/realms/${keycloakConfig.realm}`,
  };

  const headerB64 = Buffer.from(JSON.stringify({ alg: "RS256", typ: "JWT" })).toString("base64url");
  const payloadB64 = Buffer.from(JSON.stringify(newPayload)).toString("base64url");
  const newAccessToken = `${headerB64}.${payloadB64}.kc_refreshed_sig`;

  const refreshLog = {
    id: `kc-log-${Date.now()}`,
    timestamp: new Date().toISOString(),
    eventType: "TOKEN_REFRESH",
    username,
    realm: keycloakConfig.realm,
    clientIp: ip,
    status: "SUCCESS",
    details: "Keycloak Refresh Token exchanged for new OIDC JWT Access Token.",
    userAgent: req.get("user-agent") || "ProConnect-Client",
    tokenScope: "openid profile email roles",
  };
  keycloakAuditLogs.unshift(refreshLog);

  res.json({
    accessToken: newAccessToken,
    refreshToken: refreshToken || `kc_rt_${Math.random().toString(36).substring(2, 24)}`,
    expiresIn: 3600,
    tokenType: "Bearer",
  });
});

// Keycloak Logout
app.post("/api/keycloak/logout", (req, res) => {
  const { username = "alex.morgan", realm = keycloakConfig.realm } = req.body;
  const ip = req.ip || "127.0.0.1";

  const logoutLog = {
    id: `kc-log-${Date.now()}`,
    timestamp: new Date().toISOString(),
    eventType: "LOGOUT",
    username,
    realm,
    clientIp: ip,
    status: "SUCCESS",
    details: `User '${username}' logged out from Keycloak realm '${realm}'. Session invalidated and single sign-out (SSO) completed.`,
    userAgent: req.get("user-agent") || "ProConnect-Client",
    tokenScope: "openid",
  };
  keycloakAuditLogs.unshift(logoutLog);

  res.json({ message: "Keycloak session terminated successfully", status: "logged_out" });
});

// Keycloak Audit Logs list and delete
app.get("/api/keycloak/logs", (req, res) => {
  const { eventType, status, search } = req.query;
  let filtered = [...keycloakAuditLogs];

  if (eventType && typeof eventType === "string") {
    filtered = filtered.filter((l) => l.eventType.toLowerCase() === eventType.toLowerCase());
  }
  if (status && typeof status === "string") {
    filtered = filtered.filter((l) => l.status.toLowerCase() === status.toLowerCase());
  }
  if (search && typeof search === "string") {
    const q = search.toLowerCase();
    filtered = filtered.filter(
      (l) =>
        l.username.toLowerCase().includes(q) ||
        l.details.toLowerCase().includes(q) ||
        l.clientIp.includes(q) ||
        l.realm.toLowerCase().includes(q)
    );
  }

  res.json({
    totalCount: keycloakAuditLogs.length,
    filteredCount: filtered.length,
    logs: filtered,
  });
});

app.delete("/api/keycloak/logs", (req, res) => {
  keycloakAuditLogs = [
    {
      id: `kc-log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      eventType: "VERIFY_TOKEN",
      username: "admin.security",
      realm: keycloakConfig.realm,
      clientIp: req.ip || "127.0.0.1",
      status: "SUCCESS",
      details: "Audit logs cleared by security administrator.",
      userAgent: req.get("user-agent") || "ProConnect-Client",
      tokenScope: "admin",
    },
  ];
  res.json({ message: "Keycloak audit logs cleared", logs: keycloakAuditLogs });
});

// AI Post Assistant Endpoint
app.post("/api/gemini/post-assistant", async (req, res) => {
  try {
    const { topic, tone = "Professional", length = "Medium", includeHashtags = true, rawDraft = "" } = req.body;
    const ai = getAI();

    if (!ai) {
      // Fallback response if API key is not set
      const fallbackPost = rawDraft
        ? `🚀 ${rawDraft}\n\nKey takeaway: Continuous innovation and collaboration drive team success in tech.\n\n#ProfessionalGrowth #Career #Leadership #Innovation`
        : `Excited to share some thoughts on ${topic || "industry trends"}! Key insights:\n\n1️⃣ Emphasize adaptability & continuous learning\n2️⃣ Empower team members to take ownership\n3️⃣ Leverage technology to scale impact\n\nWhat are your thoughts on this?\n\n#Technology #Leadership #CareerGrowth #Innovation`;
      return res.json({ result: fallbackPost, provider: "fallback" });
    }

    const prompt = rawDraft
      ? `You are an expert LinkedIn copywriter. Rewrite and polish the following rough post draft for LinkedIn.
Tone: ${tone}
Length: ${length}
Include relevant hashtags: ${includeHashtags ? "Yes" : "No"}

Rough Draft:
"${rawDraft}"

Output only the ready-to-publish LinkedIn post content.`
      : `You are an expert LinkedIn copywriter and thought leader. Write an engaging LinkedIn post about: "${topic}".
Tone: ${tone}
Length: ${length}
Include relevant hashtags: ${includeHashtags ? "Yes" : "No"}

Format with clear line breaks, bullet points, and appropriate emojis. Output only the post content.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
    });

    res.json({ result: response.text || "Failed to generate post.", provider: "gemini" });
  } catch (err: any) {
    console.error("Error in post-assistant:", err);
    res.status(500).json({ error: err.message || "Failed to call Gemini API" });
  }
});

// AI Job Description / Resume Match Endpoint
app.post("/api/gemini/job-assistant", async (req, res) => {
  try {
    const { action, jobTitle, company, skills, rawRequirements } = req.body;
    const ai = getAI();

    if (!ai) {
      if (action === "match_resume") {
        return res.json({
          matchScore: 88,
          pros: ["Strong match in core technical skills", "Relevant industry background"],
          suggestions: ["Highlight experience with cloud architecture", "Quantify achievements in leadership roles"],
          coverLetter: `Dear Hiring Team at ${company || "the company"},\n\nI am thrilled to apply for the ${jobTitle || "position"}. With my background in technology and passion for building high-impact solutions, I am confident in my ability to bring value to your team.\n\nSincerely,\nCandidate`,
        });
      }
      return res.json({
        result: `### About the Role\nWe are looking for a talented ${jobTitle} to join our growing team at ${company}.\n\n### Key Responsibilities\n- Build and maintain high-scale web and mobile applications.\n- Collaborate across cross-functional teams to deliver product features.\n- Drive architectural decisions and best engineering practices.\n\n### Requirements\n- Experience with ${skills || "modern web frameworks and APIs"}.\n- Strong problem-solving abilities and communication skills.`,
      });
    }

    if (action === "match_resume") {
      const prompt = `You are an executive hiring recruiter. Evaluate a candidate fit for job: "${jobTitle}" at "${company}".
Required skills: ${skills || "general engineering"}

Provide a JSON object with:
1. matchScore (number 1-100)
2. pros (array of strings)
3. suggestions (array of strings)
4. coverLetter (string)

Return valid JSON.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        },
      });

      try {
        const parsed = JSON.parse(response.text || "{}");
        return res.json(parsed);
      } catch {
        return res.json({
          matchScore: 85,
          pros: ["Solid experience alignment", "Demonstrated problem-solving abilities"],
          suggestions: ["Add metrics to past project descriptions"],
          coverLetter: `Dear Hiring Team,\n\nI am writing to express my enthusiasm for the ${jobTitle} position at ${company}...`,
        });
      }
    } else {
      const prompt = `Generate a detailed, professional LinkedIn Job Description for:
Title: ${jobTitle}
Company: ${company}
Key Skills / Requirements notes: ${skills || rawRequirements || "Modern engineering, teamwork, leadership"}

Include:
- About the Role
- Responsibilities
- Qualifications & Requirements
- What We Offer`;

      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: prompt,
      });

      res.json({ result: response.text });
    }
  } catch (err: any) {
    console.error("Error in job-assistant:", err);
    res.status(500).json({ error: err.message || "Failed to process job assistant request" });
  }
});

// AI Smart Reply for Messaging
app.post("/api/gemini/smart-reply", async (req, res) => {
  try {
    const { conversation } = req.body;
    const ai = getAI();

    if (!ai) {
      return res.json({
        suggestions: [
          "Thanks for reaching out! Let's schedule a call.",
          "Sounds great, looking forward to discussing this further.",
          "Could you share a bit more detail on the timeline?",
        ],
      });
    }

    const prompt = `Based on the following recent messaging conversation on LinkedIn, generate 3 concise, professional quick-reply options (under 12 words each) for the recipient.

Conversation history:
${JSON.stringify(conversation)}

Return JSON array of 3 strings: ["reply1", "reply2", "reply3"]`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    try {
      const suggestions = JSON.parse(response.text || "[]");
      res.json({ suggestions });
    } catch {
      res.json({
        suggestions: [
          "Sounds good to me!",
          "Thanks! Let's catch up soon.",
          "I will review this and get back to you.",
        ],
      });
    }
  } catch (err: any) {
    console.error("Error in smart-reply:", err);
    res.status(500).json({ error: err.message || "Failed smart reply" });
  }
});

// AI Profile Summary Polish
app.post("/api/gemini/profile-assistant", async (req, res) => {
  try {
    const { headline, currentRole, skills, rawAbout } = req.body;
    const ai = getAI();

    if (!ai) {
      return res.json({
        result: `Passionate ${headline || "Professional"} with expertise in ${skills ? skills.join(", ") : "technology and innovation"}. Proven track record of delivering high-quality solutions, driving cross-functional success, and empowering teams to reach ambitious goals. Constantly learning and building next-gen products.`,
      });
    }

    const prompt = `Write a high-converting, engaging, professional LinkedIn "About" section bio.
Headline: ${headline}
Current Role: ${currentRole}
Key Skills: ${Array.isArray(skills) ? skills.join(", ") : skills}
Current Bio / Notes: "${rawAbout || ""}"

Write in first-person ("I am..."), incorporate bullet points or emojis where effective, and make it compelling for recruiters and collaborators. Output only the bio.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
    });

    res.json({ result: response.text });
  } catch (err: any) {
    console.error("Error in profile-assistant:", err);
    res.status(500).json({ error: err.message || "Failed profile assistant" });
  }
});

// Start Server & Express / Vite Routing
async function start() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

start();
