import React, { useState } from "react";
import {
  Users,
  UserCheck,
  UserPlus,
  Building,
  Newspaper,
  Check,
  X,
  Search,
  MessageSquare,
  UserMinus,
  Send,
  Sparkles,
  Plus,
  ShieldCheck,
  Filter,
} from "lucide-react";
import { ConnectionRequest } from "../types";
import { peopleMayKnow } from "../data/mockData";
import { ProfilePopupData } from "./UserProfileModal";

export interface ContactPerson {
  id: string;
  name: string;
  headline: string;
  avatar: string;
  location?: string;
  mutualConnections?: number;
  online?: boolean;
}

interface NetworkViewProps {
  connections: ContactPerson[];
  requests: ConnectionRequest[];
  followingIds: string[];
  onAcceptRequest: (req: ConnectionRequest) => void;
  onIgnoreRequest: (id: string) => void;
  onConnectPerson: (person: ContactPerson, note?: string) => void;
  onToggleFollow: (id: string) => void;
  onMessageContact: (contact: ContactPerson) => void;
  onRemoveConnection: (id: string) => void;
  onSelectProfile?: (profile: ProfilePopupData) => void;
}

export const NetworkView: React.FC<NetworkViewProps> = ({
  connections,
  requests,
  followingIds,
  onAcceptRequest,
  onIgnoreRequest,
  onConnectPerson,
  onToggleFollow,
  onMessageContact,
  onRemoveConnection,
  onSelectProfile,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<"invitations" | "connections" | "suggestions" | "following">(
    requests.length > 0 ? "invitations" : "connections"
  );
  const [connectionSearch, setConnectionSearch] = useState("");
  const [noteModalPerson, setNoteModalPerson] = useState<ContactPerson | null>(null);
  const [noteText, setNoteText] = useState("");
  const [pendingConnectIds, setPendingConnectIds] = useState<string[]>([]);

  // Filter connections by search text
  const filteredConnections = connections.filter(
    (c) =>
      c.name.toLowerCase().includes(connectionSearch.toLowerCase()) ||
      c.headline.toLowerCase().includes(connectionSearch.toLowerCase())
  );

  const handleSendConnectionNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteModalPerson) return;
    onConnectPerson(noteModalPerson, noteText);
    setPendingConnectIds([...pendingConnectIds, noteModalPerson.id]);
    setNoteModalPerson(null);
    setNoteText("");
  };

  const handleQuickConnect = (person: ContactPerson) => {
    onConnectPerson(person);
    if (!pendingConnectIds.includes(person.id)) {
      setPendingConnectIds([...pendingConnectIds, person.id]);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Left Sidebar: Manage My Network */}
      <aside className="lg:col-span-3">
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-2xs space-y-4">
          <h3 className="font-bold text-slate-900 dark:text-white text-sm pb-2 border-b border-slate-100 dark:border-slate-800">
            Manage my network
          </h3>

          <div className="space-y-1 text-xs text-slate-700 dark:text-slate-300">
            <button
              onClick={() => setActiveSubTab("connections")}
              className={`w-full flex items-center justify-between p-2.5 rounded-lg transition-colors text-left ${
                activeSubTab === "connections"
                  ? "bg-blue-50 dark:bg-blue-950/50 text-[#0A66C2] font-bold"
                  : "hover:bg-slate-50 dark:hover:bg-slate-800"
              }`}
            >
              <div className="flex items-center gap-3">
                <Users className="w-4 h-4 text-[#0A66C2]" />
                <span>My Connections</span>
              </div>
              <span className="font-bold text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full text-[11px]">
                {connections.length}
              </span>
            </button>

            <button
              onClick={() => setActiveSubTab("following")}
              className={`w-full flex items-center justify-between p-2.5 rounded-lg transition-colors text-left ${
                activeSubTab === "following"
                  ? "bg-blue-50 dark:bg-blue-950/50 text-[#0A66C2] font-bold"
                  : "hover:bg-slate-50 dark:hover:bg-slate-800"
              }`}
            >
              <div className="flex items-center gap-3">
                <UserCheck className="w-4 h-4 text-emerald-600" />
                <span>Following & Followers</span>
              </div>
              <span className="font-bold text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full text-[11px]">
                {followingIds.length + 2100}
              </span>
            </button>

            <button
              onClick={() => setActiveSubTab("invitations")}
              className={`w-full flex items-center justify-between p-2.5 rounded-lg transition-colors text-left ${
                activeSubTab === "invitations"
                  ? "bg-blue-50 dark:bg-blue-950/50 text-[#0A66C2] font-bold"
                  : "hover:bg-slate-50 dark:hover:bg-slate-800"
              }`}
            >
              <div className="flex items-center gap-3">
                <UserPlus className="w-4 h-4 text-amber-500" />
                <span>Pending Invitations</span>
              </div>
              {requests.length > 0 && (
                <span className="font-bold text-white bg-amber-500 px-2 py-0.5 rounded-full text-[11px]">
                  {requests.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveSubTab("suggestions")}
              className={`w-full flex items-center justify-between p-2.5 rounded-lg transition-colors text-left ${
                activeSubTab === "suggestions"
                  ? "bg-blue-50 dark:bg-blue-950/50 text-[#0A66C2] font-bold"
                  : "hover:bg-slate-50 dark:hover:bg-slate-800"
              }`}
            >
              <div className="flex items-center gap-3">
                <Building className="w-4 h-4 text-indigo-500" />
                <span>People You May Know</span>
              </div>
              <span className="font-bold text-[#0A66C2] text-[11px]">
                {peopleMayKnow.length}
              </span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="lg:col-span-9 space-y-6">
        {/* Navigation Tabs Header */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-2 shadow-2xs flex items-center justify-between gap-2 overflow-x-auto">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveSubTab("invitations")}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                activeSubTab === "invitations"
                  ? "bg-[#0A66C2] text-white"
                  : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              <span>Invitations</span>
              {requests.length > 0 && (
                <span className="px-1.5 py-0.2 bg-amber-400 text-slate-900 text-[10px] font-black rounded-full">
                  {requests.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveSubTab("connections")}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                activeSubTab === "connections"
                  ? "bg-[#0A66C2] text-white"
                  : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>My Connections ({connections.length})</span>
            </button>

            <button
              onClick={() => setActiveSubTab("suggestions")}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                activeSubTab === "suggestions"
                  ? "bg-[#0A66C2] text-white"
                  : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Recommended Contacts</span>
            </button>

            <button
              onClick={() => setActiveSubTab("following")}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                activeSubTab === "following"
                  ? "bg-[#0A66C2] text-white"
                  : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Following ({followingIds.length})</span>
            </button>
          </div>
        </div>

        {/* SUBTAB 1: Pending Invitations */}
        {activeSubTab === "invitations" && (
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-[#0A66C2]" />
                <span>Pending Connection Invitations ({requests.length})</span>
              </h3>
            </div>

            {requests.length > 0 ? (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {requests.map((req) => (
                  <div
                    key={req.id}
                    className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <img
                        src={req.user.avatar}
                        alt={req.user.name}
                        onClick={() =>
                          onSelectProfile &&
                          onSelectProfile({
                            id: req.user.id,
                            name: req.user.name,
                            headline: req.user.headline,
                            avatar: req.user.avatar,
                            mutualConnections: req.user.mutualConnections,
                          })
                        }
                        className="w-12 h-12 rounded-full object-cover ring-2 ring-slate-100 dark:ring-slate-800 cursor-pointer hover:opacity-80 transition-opacity"
                      />
                      <div>
                        <h4
                          onClick={() =>
                            onSelectProfile &&
                            onSelectProfile({
                              id: req.user.id,
                              name: req.user.name,
                              headline: req.user.headline,
                              avatar: req.user.avatar,
                              mutualConnections: req.user.mutualConnections,
                            })
                          }
                          className="font-bold text-slate-900 dark:text-white text-sm cursor-pointer hover:text-[#0A66C2] hover:underline"
                        >
                          {req.user.name}
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {req.user.headline}
                        </p>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {req.user.mutualConnections} mutual connections • {req.sentAt}
                        </p>
                        {req.message && (
                          <p className="text-xs text-slate-700 dark:text-slate-300 mt-2 bg-blue-50/60 dark:bg-slate-800 p-2.5 rounded-lg border border-blue-100 dark:border-slate-700 italic">
                            "{req.message}"
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                      <button
                        onClick={() => onIgnoreRequest(req.id)}
                        className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full border border-slate-300 dark:border-slate-700 transition-colors"
                      >
                        Ignore
                      </button>
                      <button
                        onClick={() => onAcceptRequest(req)}
                        className="px-4 py-1.5 text-xs font-bold bg-[#0A66C2] hover:bg-[#004182] text-white rounded-full transition-all flex items-center gap-1.5 shadow-xs"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Accept & Connect</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center space-y-2">
                <Check className="w-8 h-8 text-emerald-500 mx-auto" />
                <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  You're all caught up!
                </p>
                <p className="text-xs text-slate-500">
                  No pending invitations right now. Check out suggestions below to expand your network.
                </p>
              </div>
            )}
          </div>
        )}

        {/* SUBTAB 2: My Connections (1st Degree) */}
        {activeSubTab === "connections" && (
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs p-4 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  My Connections ({connections.length})
                </h3>
                <p className="text-xs text-slate-500">
                  1st-degree contacts in your professional network
                </p>
              </div>

              {/* Search Connections */}
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search contacts by name or title..."
                  value={connectionSearch}
                  onChange={(e) => setConnectionSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs text-slate-900 dark:text-slate-100 border border-transparent focus:border-[#0A66C2] focus:outline-hidden"
                />
              </div>
            </div>

            {filteredConnections.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredConnections.map((contact) => {
                  const isFollowing = followingIds.includes(contact.id);
                  return (
                    <div
                      key={contact.id}
                      className="p-4 bg-slate-50/70 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700/80 flex flex-col justify-between space-y-3 hover:border-blue-300 dark:hover:border-blue-800 transition-all"
                    >
                      <div className="flex items-start gap-3">
                        <div className="relative">
                          <img
                            src={contact.avatar}
                            alt={contact.name}
                            onClick={() =>
                              onSelectProfile &&
                              onSelectProfile({
                                id: contact.id,
                                name: contact.name,
                                headline: contact.headline,
                                avatar: contact.avatar,
                                location: contact.location,
                                mutualConnections: contact.mutualConnections,
                              })
                            }
                            className="w-12 h-12 rounded-full object-cover ring-2 ring-white dark:ring-slate-700 cursor-pointer hover:opacity-80 transition-opacity"
                          />
                          {contact.online && (
                            <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full ring-2 ring-white dark:ring-slate-900" />
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <h4
                            onClick={() =>
                              onSelectProfile &&
                              onSelectProfile({
                                id: contact.id,
                                name: contact.name,
                                headline: contact.headline,
                                avatar: contact.avatar,
                                location: contact.location,
                                mutualConnections: contact.mutualConnections,
                              })
                            }
                            className="font-bold text-slate-900 dark:text-white text-sm truncate cursor-pointer hover:text-[#0A66C2] hover:underline"
                          >
                            {contact.name}
                          </h4>
                          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                            {contact.headline}
                          </p>
                          {contact.location && (
                            <p className="text-[11px] text-slate-400 mt-1">
                              {contact.location}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between gap-2">
                        {/* Send Private Message Button */}
                        <button
                          onClick={() => onMessageContact(contact)}
                          className="flex-1 py-1.5 px-3 bg-[#0A66C2] hover:bg-[#004182] text-white font-bold text-xs rounded-full transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>Message</span>
                        </button>

                        {/* Follow / Unfollow */}
                        <button
                          onClick={() => onToggleFollow(contact.id)}
                          className={`py-1.5 px-3 text-xs font-semibold rounded-full border transition-colors flex items-center gap-1 ${
                            isFollowing
                              ? "bg-slate-200/80 dark:bg-slate-700 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-600"
                              : "text-[#0A66C2] border-[#0A66C2] hover:bg-blue-50 dark:hover:bg-blue-950/40"
                          }`}
                        >
                          {isFollowing ? (
                            <>
                              <Check className="w-3 h-3" />
                              <span>Following</span>
                            </>
                          ) : (
                            <>
                              <Plus className="w-3 h-3" />
                              <span>Follow</span>
                            </>
                          )}
                        </button>

                        {/* Remove Connection */}
                        <button
                          onClick={() => onRemoveConnection(contact.id)}
                          className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-full transition-colors"
                          title="Remove Connection"
                        >
                          <UserMinus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-8 text-center text-slate-400 text-xs">
                No connections match "{connectionSearch}".
              </div>
            )}
          </div>
        )}

        {/* SUBTAB 3: People You May Know / Suggestions */}
        {(activeSubTab === "suggestions" || activeSubTab === "invitations") && (
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                  People you may know in Tech & Engineering
                </h3>
                <p className="text-xs text-slate-400">
                  Based on your headline, skills & mutual connections
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {peopleMayKnow.map((person) => {
                const isPending = pendingConnectIds.includes(person.id);
                const isFollowing = followingIds.includes(person.id);
                return (
                  <div
                    key={person.id}
                    className="bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700/80 p-4 flex flex-col justify-between text-center space-y-3 hover:shadow-md transition-shadow relative"
                  >
                    <div className="space-y-2 flex flex-col items-center">
                      <img
                        src={person.avatar}
                        alt={person.name}
                        onClick={() =>
                          onSelectProfile &&
                          onSelectProfile({
                            id: person.id,
                            name: person.name,
                            headline: person.headline,
                            avatar: person.avatar,
                            location: (person as any).location,
                            mutualConnections: person.mutualConnections,
                          })
                        }
                        className="w-16 h-16 rounded-full object-cover ring-2 ring-white dark:ring-slate-700 cursor-pointer hover:opacity-80 transition-opacity"
                      />
                      <h4
                        onClick={() =>
                          onSelectProfile &&
                          onSelectProfile({
                            id: person.id,
                            name: person.name,
                            headline: person.headline,
                            avatar: person.avatar,
                            location: (person as any).location,
                            mutualConnections: person.mutualConnections,
                          })
                        }
                        className="font-bold text-slate-900 dark:text-white text-xs line-clamp-1 cursor-pointer hover:text-[#0A66C2] hover:underline"
                      >
                        {person.name}
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 min-h-[32px] line-clamp-2">
                        {person.headline}
                      </p>
                      <p className="text-[10px] text-slate-400">
                        {person.mutualConnections} mutual connections
                      </p>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
                      {/* Connect Button */}
                      <button
                        onClick={() =>
                          isPending
                            ? null
                            : setNoteModalPerson(person)
                        }
                        disabled={isPending}
                        className={`w-full py-1.5 text-xs font-bold rounded-full border transition-all flex items-center justify-center gap-1 ${
                          isPending
                            ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 border-emerald-300 dark:border-emerald-800 cursor-default"
                            : "text-[#0A66C2] dark:text-[#378FE9] border-[#0A66C2] hover:bg-blue-50 dark:hover:bg-blue-950/40"
                        }`}
                      >
                        {isPending ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>Invitation Sent</span>
                          </>
                        ) : (
                          <>
                            <UserPlus className="w-3.5 h-3.5" />
                            <span>Connect</span>
                          </>
                        )}
                      </button>

                      {/* Follow Toggle */}
                      <button
                        onClick={() => onToggleFollow(person.id)}
                        className={`w-full py-1 text-[11px] font-semibold rounded-full border transition-colors flex items-center justify-center gap-1 ${
                          isFollowing
                            ? "bg-slate-200/80 dark:bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-300"
                            : "text-slate-600 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:bg-slate-100"
                        }`}
                      >
                        {isFollowing ? (
                          <>
                            <Check className="w-3 h-3" />
                            <span>Following</span>
                          </>
                        ) : (
                          <>
                            <Plus className="w-3 h-3" />
                            <span>Follow</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* SUBTAB 4: Following & Followers */}
        {activeSubTab === "following" && (
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  Following & Followers
                </h3>
                <p className="text-xs text-slate-500">
                  People, creators, and company pages whose posts appear in your feed
                </p>
              </div>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {followingIds.map((id) => {
                // Find person in connections or mock data or fallback
                const contact =
                  connections.find((c) => c.id === id) ||
                  peopleMayKnow.find((p) => p.id === id) || {
                    id,
                    name: id.startsWith("comp") ? "MobileFirst Tech" : "Sophia Martinez",
                    headline: id.startsWith("comp") ? "Software Company" : "Principal AI Researcher @ InnovateAI",
                    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&auto=format&fit=crop&q=80",
                  };

                return (
                  <div
                    key={id}
                    className="py-3 flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={contact.avatar}
                        alt={contact.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div>
                        <h4 className="font-bold text-slate-900 dark:text-white text-xs">
                          {contact.name}
                        </h4>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          {contact.headline}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onToggleFollow(id)}
                        className="px-3 py-1 text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-red-50 hover:text-red-600 rounded-full border border-slate-300 dark:border-slate-700 transition-colors"
                      >
                        Following
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>

      {/* Send Personalized Connection Note Modal */}
      {noteModalPerson && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-[#0A66C2]" />
                <span>Connect with {noteModalPerson.name}</span>
              </h3>
              <button
                onClick={() => setNoteModalPerson(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl">
              <img
                src={noteModalPerson.avatar}
                alt={noteModalPerson.name}
                className="w-12 h-12 rounded-full object-cover"
              />
              <div>
                <h4 className="font-bold text-xs text-slate-900 dark:text-white">
                  {noteModalPerson.name}
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {noteModalPerson.headline}
                </p>
              </div>
            </div>

            <form onSubmit={handleSendConnectionNote} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Add a personal note (Optional):
                </label>
                <textarea
                  rows={3}
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  placeholder={`Hi ${noteModalPerson.name}, I came across your profile and would love to connect and share insights regarding tech and engineering...`}
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-700 focus:border-[#0A66C2] focus:outline-hidden"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => handleQuickConnect(noteModalPerson)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full"
                >
                  Send without note
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#0A66C2] hover:bg-[#004182] text-white font-bold text-xs rounded-full shadow-md flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Invitation</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
