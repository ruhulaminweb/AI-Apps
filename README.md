# ProConnect — AI-Built Professional Networking Platform 🚀

> **Built a Full-Stack LinkedIn Alternative ("ProConnect") in < 60 Minutes — 0 Lines of Manual Code Written! 🤖✨**

[![Repository](https://img.shields.io/badge/GitHub-ruhulaminweb%2FAI--Apps-blue?logo=github)](https://github.com/ruhulaminweb/AI-Apps)
[![Model](https://img.shields.io/badge/Built%20With-Gemini%203.6%20Flash-8E44AD?logo=google)](https://ai.google.dev/)
[![Stack](https://img.shields.io/badge/Stack-React%2018%20%7C%20TypeScript%20%7C%20Tailwind%20CSS%20%7C%20Express-61DAFB?logo=react)](https://react.dev/)

---

## 📊 The Build Breakdown

- ⏱️ **Total Build Time**: ~45–60 Minutes
- 🗣️ **Total Prompts Used**: ~12 Iterative Prompts
- 💻 **Lines of Manual Code Written**: **0**
- ⚡ **Tech Stack Generated**: React 18, TypeScript, Tailwind CSS, Express Node.js Server, Lucide Icons, Vite, Motion
- 🤖 **AI Model Used**: **Gemini 3.6 Flash** via Google AI Studio

---

## 📌 Overview

**ProConnect** is a full-featured, enterprise-grade professional networking web application modeled after LinkedIn and modern developer networks. What makes this project unique is that **every single component, state manager, layout, and API endpoint was generated purely through natural language prompting** using Google AI Studio powered by **Gemini 3.6 Flash**.

No code editors, no manual syntax debugging — just pure vision, architecture, and iterative natural language prompts.

---

## 🛠️ Key Features Built via Prompting

- 🔑 **Keycloak SSO & Enterprise Audit Log Modal**: Full OIDC/JWT token simulation, role-based access control (`realm-admin`, `proconnect-user`), security audit log table, and live token inspector.
- 👤 **Interactive Profile Popup Cards**: Click any user name or avatar across the feed, comments, or network to reveal an interactive popup profile card with instant Connect (with custom notes), Follow/Unfollow, and Direct Message actions.
- 📰 **Rich Interactive Newsfeed**: Multi-media post creation, poll voting with live percentage distribution, custom LinkedIn emoji reaction counters (Like, Celebrate, Support, Insightful, Funny), inline comments, and bookmarking.
- 💬 **Real-time Private Messaging**: Instant 1-on-1 messaging view with online indicators, conversation history, and quick-chat triggers.
- 🕸️ **Network & Connections Hub**: Manage 1st-degree connections, accept/ignore pending invitations, and discover "People You May Know" suggestions.
- 💼 **Jobs & Career Center**: Filterable job board with skill match indicators and quick-apply workflows.
- 📱 **Flutter Cross-Platform Suite Modal**: Live Dart/Flutter code generator for matching iOS and Android mobile UI screens.
- 🌙 **Dark/Light Mode & Search**: Complete responsive theme engine and global search bar.

---

## 🛠️ Architecture & Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS v4, Lucide React Icons, Motion animations.
- **Backend**: Node.js + Express server for custom API routing.
- **Dev & Build Tooling**: Vite, esbuild, `tsx`.
- **AI Engine**: Google AI Studio (Gemini 3.6 Flash model).

```
AI-Apps/
├── server.ts                   # Express server entry point & API routes
├── src/
│   ├── main.tsx                # App bootstrap
│   ├── App.tsx                 # Main layout & top-level state manager
│   ├── types.ts                # TypeScript interface definitions
│   ├── components/
│   │   ├── Header.tsx          # Top navigation bar & theme toggles
│   │   ├── FeedView.tsx        # News feed & post feed container
│   │   ├── PostCard.tsx        # Individual post card with reactions & comments
│   │   ├── UserProfileModal.tsx# Profile inspector popup modal
│   │   ├── NetworkView.tsx     # Connections, requests & recommendations
│   │   ├── MessagingView.tsx   # Direct chat & messaging screen
│   │   ├── ProfileView.tsx     # Full user profile page
│   │   ├── JobsView.tsx        # Job listings & application modal
│   │   ├── AuthModal.tsx       # Keycloak SSO Login & Register modal
│   │   ├── KeycloakAuditModal.tsx # Keycloak token & session auditor
│   │   └── FlutterSuiteModal.tsx  # Flutter app code exporter
│   ├── data/
│   │   ├── mockData.ts         # Initial feeds, connections & jobs data
│   │   └── flutterTemplates.ts # Flutter Dart code generators
│   └── utils/
│       └── userProfiles.ts     # Local profile persistence utilities
├── package.json
└── vite.config.ts
```

---

## 🚀 Local Development Setup

### Prerequisites
- Node.js (v18+ recommended)
- npm or yarn or bun

### Instructions

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/ruhulaminweb/AI-Apps.git
   cd AI-Apps
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Start Development Server**:
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` in your browser.

4. **Production Build**:
   ```bash
   npm run build
   npm start
   ```

---

## 💡 How it Was Built (AI Prompting Journey)

This entire application was constructed iteratively through natural conversation with **Gemini 3.6 Flash**:

1. **Phase 1: Scaffolding & Design System**
   - Prompted the AI to build a clean, high-contrast, modern professional networking layout with feed, messaging, and networking tabs.
2. **Phase 2: Deep Componentization & State Handling**
   - Asked the model to split code cleanly into modular TypeScript components (`FeedView`, `PostCard`, `NetworkView`, `JobsView`).
3. **Phase 3: Interactive Features & Enterprise Integrations**
   - Prompted for multi-reaction buttons, custom invitation notes, Keycloak SSO simulation modals, and security audit logs.
4. **Phase 4: Global Profile Inspector & Polish**
   - Added `UserProfileModal` to allow instant profile inspection from any post, comment, connection card, or chat header.

---

## 👤 Author & Credits

- **Creator**: [Ruhul Amin](https://github.com/ruhulaminweb)
- **Built With**: [Google AI Studio](https://ai.studio) & **Gemini 3.6 Flash**

---

*Made with ❤️ using Gemini 3.6 Flash AI Prompting.*
