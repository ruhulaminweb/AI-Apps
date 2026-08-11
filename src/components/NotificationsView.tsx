import React, { useState } from "react";
import {
  Bell,
  Check,
  Eye,
  ThumbsUp,
  Briefcase,
  UserCheck,
  MessageSquare,
  X,
} from "lucide-react";
import { NotificationItem } from "../types";

interface NotificationsViewProps {
  notifications: NotificationItem[];
  onMarkAllRead: () => void;
  onSelectTab: (tab: string) => void;
}

export const NotificationsView: React.FC<NotificationsViewProps> = ({
  notifications,
  onMarkAllRead,
  onSelectTab,
}) => {
  const [filter, setFilter] = useState("all");

  const getIcon = (type: string) => {
    switch (type) {
      case "view":
        return <Eye className="w-4 h-4 text-blue-500" />;
      case "like":
        return <ThumbsUp className="w-4 h-4 text-[#0A66C2]" />;
      case "job":
        return <Briefcase className="w-4 h-4 text-emerald-500" />;
      case "connection":
        return <UserCheck className="w-4 h-4 text-purple-500" />;
      default:
        return <Bell className="w-4 h-4 text-amber-500" />;
    }
  };

  const filtered = notifications.filter((n) => {
    if (filter === "unread") return !n.read;
    if (filter === "jobs") return n.type === "job";
    if (filter === "posts") return n.type === "like" || n.type === "comment";
    return true;
  });

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-4">
      {/* Notifications Header */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-[#0A66C2]" />
          <h3 className="font-bold text-slate-900 dark:text-white text-base">
            Notifications
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg text-xs">
            {["all", "unread", "posts", "jobs"].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1 rounded-md capitalize font-semibold transition-colors ${
                  filter === f
                    ? "bg-white dark:bg-slate-900 text-[#0A66C2] shadow-xs"
                    : "text-slate-600 dark:text-slate-400"
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          <button
            onClick={onMarkAllRead}
            className="text-xs text-[#0A66C2] font-semibold hover:underline"
          >
            Mark all read
          </button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs divide-y divide-slate-100 dark:divide-slate-800 overflow-hidden">
        {filtered.length > 0 ? (
          filtered.map((item) => (
            <div
              key={item.id}
              onClick={() => item.linkTab && onSelectTab(item.linkTab)}
              className={`p-4 flex items-start gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer ${
                !item.read ? "bg-blue-50/40 dark:bg-blue-950/20" : ""
              }`}
            >
              <div className="relative">
                {item.avatar ? (
                  <img
                    src={item.avatar}
                    alt="Notif"
                    className="w-11 h-11 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-11 h-11 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center">
                    {getIcon(item.type)}
                  </div>
                )}
                <span className="absolute -bottom-1 -right-1 p-1 bg-white dark:bg-slate-800 rounded-full shadow-2xs">
                  {getIcon(item.type)}
                </span>
              </div>

              <div className="flex-1">
                <p className="text-xs font-bold text-slate-900 dark:text-white">
                  {item.title}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {item.description}
                </p>
                <span className="text-[10px] text-slate-400 mt-1 block">
                  {item.time}
                </span>
              </div>

              {!item.read && (
                <span className="w-2.5 h-2.5 bg-[#0A66C2] rounded-full self-center" />
              )}
            </div>
          ))
        ) : (
          <div className="p-8 text-center text-xs text-slate-400">
            No notifications found in this category.
          </div>
        )}
      </div>
    </div>
  );
};
