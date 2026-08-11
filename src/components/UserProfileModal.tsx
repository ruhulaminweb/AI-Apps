import React, { useState } from "react";
import {
  X,
  UserPlus,
  UserCheck,
  MessageSquare,
  MapPin,
  Users,
  Check,
  ShieldCheck,
  Briefcase,
  Sparkles,
  Send,
  Building,
  Award,
} from "lucide-react";

export interface ProfilePopupData {
  id: string;
  name: string;
  headline: string;
  avatar: string;
  location?: string;
  mutualConnections?: number;
  coverImage?: string;
  about?: string;
  degree?: string;
  company?: string;
}

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: ProfilePopupData | null;
  connections: Array<{ id: string }>;
  followingIds: string[];
  pendingRequests: Array<{ id: string }>;
  onConnectPerson: (person: any, note?: string) => void;
  onToggleFollow: (id: string) => void;
  onMessageContact: (contact: {
    id: string;
    name: string;
    headline: string;
    avatar: string;
  }) => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  profile,
  connections,
  followingIds,
  pendingRequests,
  onConnectPerson,
  onToggleFollow,
  onMessageContact,
}) => {
  const [noteText, setNoteText] = useState("");
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [hasSentNote, setHasSentNote] = useState(false);

  if (!isOpen || !profile) return null;

  const isConnected = connections.some((c) => c.id === profile.id);
  const isFollowing = followingIds.includes(profile.id);
  const isPending = pendingRequests.some((r) => r.id === profile.id) || hasSentNote;

  const handleConnect = (e: React.FormEvent) => {
    e.preventDefault();
    onConnectPerson(
      {
        id: profile.id,
        name: profile.name,
        headline: profile.headline,
        avatar: profile.avatar,
        location: profile.location,
        mutualConnections: profile.mutualConnections || 5,
      },
      noteText
    );
    setHasSentNote(true);
    setShowNoteInput(false);
  };

  const defaultCover =
    profile.coverImage ||
    "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80";

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden relative my-8">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-20 p-2 bg-black/40 hover:bg-black/60 text-white rounded-full transition-colors"
          title="Close profile"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Cover Image Banner */}
        <div className="h-32 w-full relative bg-slate-200 dark:bg-slate-800">
          <img
            src={defaultCover}
            alt="Cover"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        </div>

        {/* Profile Content Body */}
        <div className="px-6 pb-6 pt-0 relative space-y-5">
          {/* Avatar and Degree Badge */}
          <div className="flex items-end justify-between -mt-12 mb-2">
            <div className="relative">
              <img
                src={profile.avatar}
                alt={profile.name}
                className="w-24 h-24 rounded-full object-cover ring-4 ring-white dark:ring-slate-900 shadow-md bg-white"
              />
              <span className="absolute bottom-1 right-1 w-4 h-4 bg-emerald-500 rounded-full ring-2 ring-white dark:ring-slate-900" />
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1 bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 rounded-full text-xs font-bold text-[#0A66C2] dark:text-[#378FE9]">
              <ShieldCheck className="w-4 h-4" />
              <span>{profile.degree || (isConnected ? "1st Contact" : "2nd Degree")}</span>
            </div>
          </div>

          {/* Name & Headline */}
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                {profile.name}
              </h2>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed font-medium">
              {profile.headline}
            </p>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400 mt-2">
              {profile.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>{profile.location}</span>
                </span>
              )}
              <span className="flex items-center gap-1 text-[#0A66C2] dark:text-[#378FE9] font-bold">
                <Users className="w-3.5 h-3.5" />
                <span>{profile.mutualConnections || 12} mutual connections</span>
              </span>
            </div>
          </div>

          {/* Core Action Buttons: CONNECT, FOLLOW, MESSAGE */}
          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-700/80 space-y-2.5">
            <div className="flex flex-wrap items-center gap-2">
              {/* CONNECT BUTTON */}
              {isConnected ? (
                <div className="px-4 py-2 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 font-bold text-xs rounded-full border border-emerald-200 dark:border-emerald-800 flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4" />
                  <span>Connected</span>
                </div>
              ) : isPending ? (
                <div className="px-4 py-2 bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 font-bold text-xs rounded-full border border-amber-200 dark:border-amber-800 flex items-center gap-1.5">
                  <Check className="w-4 h-4" />
                  <span>Invitation Pending</span>
                </div>
              ) : (
                <button
                  onClick={() => setShowNoteInput(!showNoteInput)}
                  className="px-4 py-2 bg-[#0A66C2] hover:bg-[#004182] text-white font-bold text-xs rounded-full shadow-sm transition-all flex items-center gap-1.5"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Connect</span>
                </button>
              )}

              {/* FOLLOW BUTTON */}
              <button
                onClick={() => onToggleFollow(profile.id)}
                className={`px-4 py-2 text-xs font-bold rounded-full border transition-colors flex items-center gap-1.5 ${
                  isFollowing
                    ? "bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 border-slate-300 dark:border-slate-600"
                    : "border-[#0A66C2] text-[#0A66C2] dark:text-[#378FE9] hover:bg-blue-50 dark:hover:bg-blue-950/40"
                }`}
              >
                {isFollowing ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Following</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    <span>Follow</span>
                  </>
                )}
              </button>

              {/* MESSAGE BUTTON */}
              <button
                onClick={() => {
                  onMessageContact({
                    id: profile.id,
                    name: profile.name,
                    headline: profile.headline,
                    avatar: profile.avatar,
                  });
                  onClose();
                }}
                className="px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-xs rounded-full shadow-sm hover:opacity-90 transition-all flex items-center gap-1.5 ml-auto"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Message</span>
              </button>
            </div>

            {/* Optional Personal Note Box for Connect */}
            {showNoteInput && !isPending && !isConnected && (
              <form onSubmit={handleConnect} className="pt-2 space-y-2 border-t border-slate-200 dark:border-slate-700">
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                  Add an invitation note to {profile.name}:
                </label>
                <textarea
                  rows={2}
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  placeholder={`Hi ${profile.name}, I'd like to connect with you on ProConnect...`}
                  className="w-full p-2.5 bg-white dark:bg-slate-900 rounded-lg text-xs border border-slate-300 dark:border-slate-700 focus:border-[#0A66C2] focus:outline-hidden"
                />
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowNoteInput(false)}
                    className="px-3 py-1 text-xs text-slate-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-[#0A66C2] text-white font-bold text-xs rounded-full flex items-center gap-1"
                  >
                    <Send className="w-3 h-3" />
                    <span>Send Invitation</span>
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* About Section */}
          <div className="space-y-2">
            <h3 className="font-bold text-xs text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5 text-[#0A66C2]" />
              <span>About</span>
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50/60 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
              {profile.about ||
                `Accomplished professional specializing in engineering, architecture, and technology innovation. Passionate about building scalable cloud applications, collaborating with global teams, and driving digital transformation.`}
            </p>
          </div>

          {/* Highlights & Endorsements */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="p-3 bg-blue-50/50 dark:bg-slate-800/50 rounded-xl border border-blue-100 dark:border-slate-700 text-xs">
              <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white mb-1">
                <Building className="w-3.5 h-3.5 text-[#0A66C2]" />
                <span>Current Role</span>
              </div>
              <p className="text-[11px] text-slate-500 line-clamp-1">
                {profile.company || "Tech Innovators Corp"}
              </p>
            </div>

            <div className="p-3 bg-indigo-50/50 dark:bg-slate-800/50 rounded-xl border border-indigo-100 dark:border-slate-700 text-xs">
              <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white mb-1">
                <Award className="w-3.5 h-3.5 text-indigo-500" />
                <span>Verification</span>
              </div>
              <p className="text-[11px] text-slate-500 line-clamp-1">
                Keycloak Identity Verified
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
