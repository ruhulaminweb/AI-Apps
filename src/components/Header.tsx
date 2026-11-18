import React, { useState } from "react";
import {
  Search,
  Home,
  Users,
  Briefcase,
  MessageSquare,
  Bell,
  User as UserIcon,
  Smartphone,
  PlusSquare,
  Moon,
  Sun,
  Building2,
  ChevronDown,
  ShieldCheck,
  KeyRound,
  LogOut,
  Settings,
} from "lucide-react";
import { User, NotificationItem } from "../types";

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentUser: User;
  notifications: NotificationItem[];
  unreadMessageCount: number;
  openCreatePost: () => void;
  openFlutterSuite: () => void;
  openKeycloakModal: () => void;
  keycloakAuthenticated: boolean;
  onSignOut?: () => void;
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  currentUser,
  notifications,
  unreadMessageCount,
  openCreatePost,
  openFlutterSuite,
  openKeycloakModal,
  keycloakAuthenticated,
  onSignOut,
  darkMode,
  setDarkMode,
  searchQuery,
  setSearchQuery,
}) => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const unreadNotifCount = notifications.filter((n) => !n.read).length;

  const navItems = [
    { id: "feed", label: "Home", icon: Home },
    { id: "network", label: "My Network", icon: Users, badge: 2 },
    { id: "jobs", label: "Jobs", icon: Briefcase },
    { id: "messaging", label: "Messaging", icon: MessageSquare, badge: unreadMessageCount },
    { id: "notifications", label: "Notifications", icon: Bell, badge: unreadNotifCount },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 transition-colors shadow-xs">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between gap-2">
        {/* Left: Brand Logo & Search */}
        <div className="flex items-center gap-3">
          <button
            id="brand-logo-btn"
            onClick={() => setActiveTab("feed")}
            className="flex items-center gap-2 font-bold text-xl text-[#0A66C2] dark:text-[#378FE9] group focus:outline-hidden"
          >
            <div className="w-9 h-9 bg-[#0A66C2] text-white rounded-md flex items-center justify-center font-black text-xl shadow-xs group-hover:bg-[#004182] transition-colors">
              in
            </div>
            <span className="hidden md:inline-block font-extrabold tracking-tight text-slate-900 dark:text-white">
              ProConnect
            </span>
          </button>

          {/* Search Box */}
          <div className="relative w-48 sm:w-64 lg:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search people, jobs, posts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm rounded-md border border-transparent focus:border-[#0A66C2] focus:bg-white dark:focus:bg-slate-900 focus:outline-hidden transition-all"
            />
          </div>
        </div>

        {/* Center / Right Nav Icons */}
        <nav className="flex items-center space-x-1 sm:space-x-3 md:space-x-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`nav-item-${item.id}`}
                onClick={() => setActiveTab(item.id)}
                className={`relative flex flex-col items-center justify-center py-1.5 px-2 rounded-md transition-colors ${
                  isActive
                    ? "text-[#0A66C2] dark:text-[#378FE9] font-medium"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                }`}
              >
                <div className="relative">
                  <Icon className="w-5 h-5" />
                  {item.badge && item.badge > 0 ? (
                    <span className="absolute -top-1.5 -right-2 bg-red-600 text-white text-[10px] font-bold px-1.2 py-0.2 rounded-full min-w-[16px] text-center">
                      {item.badge}
                    </span>
                  ) : null}
                </div>
                <span className="text-[11px] mt-0.5 hidden sm:inline-block">
                  {item.label}
                </span>
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0A66C2] dark:bg-[#378FE9] rounded-t-full" />
                )}
              </button>
            );
          })}

          {/* Quick Create Post button */}
          <button
            id="header-create-post-btn"
            onClick={openCreatePost}
            className="hidden sm:flex items-center gap-1.5 bg-[#0A66C2] hover:bg-[#004182] text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow-xs transition-all"
          >
            <PlusSquare className="w-4 h-4" />
            <span>Post</span>
          </button>

          {/* Profile Menu Dropdown */}
          <div className="relative">
            <button
              id="profile-dropdown-btn"
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex flex-col items-center text-slate-600 dark:text-slate-300 hover:text-slate-900 transition-colors"
            >
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-6 h-6 rounded-full object-cover ring-1 ring-slate-300 dark:ring-slate-700"
              />
              <div className="flex items-center gap-0.5 text-[11px] mt-0.5 hidden sm:flex">
                <span>Me</span>
                <ChevronDown className="w-3 h-3" />
              </div>
            </button>

            {showProfileMenu && (
              <div
                className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-900 rounded-lg shadow-xl border border-slate-200 dark:border-slate-800 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                onClick={() => setShowProfileMenu(false)}
              >
                <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                      {currentUser.name}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                      {currentUser.headline}
                    </p>
                  </div>
                </div>

                <div className="p-2">
                  <button
                    onClick={() => setActiveTab("profile")}
                    className="w-full text-left px-3 py-1.5 text-xs text-[#0A66C2] font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 rounded-md border border-[#0A66C2] text-center my-1"
                  >
                    View Full Profile
                  </button>

                  <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1 text-xs text-slate-700 dark:text-slate-300">
                    <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                      Account & Access
                    </div>
                    <button
                      onClick={() => setActiveTab("admin")}
                      className="w-full text-left px-3 py-1.5 flex items-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md text-cyan-600 dark:text-cyan-400 font-medium"
                    >
                      <ShieldCheck className="w-4 h-4 text-cyan-500" />
                      <span>Administrative Console</span>
                    </button>
                    <button
                      onClick={() => setActiveTab("settings")}
                      className="w-full text-left px-3 py-1.5 flex items-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md font-medium"
                    >
                      <Settings className="w-4 h-4 text-slate-400" />
                      <span>Settings & Preferences</span>
                    </button>
                    <button
                      onClick={() => setDarkMode(!darkMode)}
                      className="w-full text-left px-3 py-1.5 flex items-center justify-between hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md font-medium text-amber-600 dark:text-amber-400"
                    >
                      <div className="flex items-center gap-2">
                        {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-500" />}
                        <span>Toggle Theme</span>
                      </div>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {darkMode ? "Dark" : "Light"}
                      </span>
                    </button>
                    <button
                      onClick={() => setActiveTab("company")}
                      className="w-full text-left px-3 py-1.5 flex items-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md"
                    >
                      <Building2 className="w-4 h-4 text-slate-400" />
                      <span>Company Pages</span>
                    </button>
                    <button
                      onClick={openFlutterSuite}
                      className="w-full text-left px-3 py-1.5 flex items-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md text-blue-600 font-medium"
                    >
                      <Smartphone className="w-4 h-4 text-blue-500" />
                      <span>Flutter Android/iOS Export</span>
                    </button>
                  </div>

                  {/* Sign Out / Logout Section */}
                  <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <button
                      id="me-signout-btn"
                      onClick={() => {
                        if (onSignOut) {
                          onSignOut();
                        }
                      }}
                      className="w-full text-left px-3 py-2 flex items-center justify-between text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-md transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <LogOut className="w-4 h-4 text-red-500" />
                        <span>Sign Out / Log Out</span>
                      </div>
                      <span className="text-[10px] font-mono bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 px-1.5 py-0.5 rounded-xs">
                        Keycloak
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
};
