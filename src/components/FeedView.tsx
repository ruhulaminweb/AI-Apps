import React, { useState } from "react";
import {
  Image,
  Video,
  Calendar,
  FileText,
  TrendingUp,
  Bookmark,
  Users,
  Eye,
  Sparkles,
  Smartphone,
  ChevronRight,
  Info,
} from "lucide-react";
import { User, Post, ReactionType } from "../types";
import { PostCard } from "./PostCard";
import { ProfilePopupData } from "./UserProfileModal";

interface FeedViewProps {
  currentUser: User;
  posts: Post[];
  followingIds?: string[];
  onToggleFollow?: (authorId: string) => void;
  onMessageContact?: (contact: { id: string; name: string; headline: string; avatar: string }) => void;
  onSelectProfile?: (profile: ProfilePopupData) => void;
  openCreatePost: () => void;
  openFlutterSuite: () => void;
  onLikePost: (postId: string, reaction: ReactionType) => void;
  onAddComment: (postId: string, text: string) => void;
  onBookmarkPost: (postId: string) => void;
  onVotePoll: (postId: string, optionId: string) => void;
  searchQuery: string;
}

export const FeedView: React.FC<FeedViewProps> = ({
  currentUser,
  posts,
  followingIds = [],
  onToggleFollow,
  onMessageContact,
  onSelectProfile,
  openCreatePost,
  openFlutterSuite,
  onLikePost,
  onAddComment,
  onBookmarkPost,
  onVotePoll,
  searchQuery,
}) => {
  const [activeFilter, setActiveFilter] = useState("all");

  const newsItems = [
    { id: "n1", title: "Flutter & React Cross-Platform Trends", readers: "14,820 readers", time: "1h ago" },
    { id: "n2", title: "AI Agents Boost Engineering Speed", readers: "32,450 readers", time: "3h ago" },
    { id: "n3", title: "Cloud Native Microservices 2026", readers: "9,120 readers", time: "5h ago" },
    { id: "n4", title: "Tech Hiring Surge in Silicon Valley", readers: "21,040 readers", time: "8h ago" },
  ];

  const filteredPosts = posts.filter((p) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        p.content.toLowerCase().includes(q) ||
        p.authorName.toLowerCase().includes(q) ||
        p.tags?.some((t) => t.toLowerCase().includes(q))
      );
    }
    if (activeFilter === "following") return p.isFollowingAuthor;
    if (activeFilter === "bookmarked") return p.isBookmarked;
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Left Column: Mini Profile Card */}
      <aside className="lg:col-span-3 space-y-4">
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs overflow-hidden">
          {/* Cover Banner */}
          <div className="h-16 bg-gradient-to-r from-[#0A66C2] via-blue-700 to-indigo-800 relative">
            {currentUser.coverImage && (
              <img
                src={currentUser.coverImage}
                alt="Cover"
                className="w-full h-full object-cover"
              />
            )}
          </div>

          {/* Profile Details */}
          <div className="px-4 pb-4 pt-0 relative text-center border-b border-slate-100 dark:border-slate-800">
            <div className="-mt-10 mb-2 flex justify-center">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-18 h-18 rounded-full border-4 border-white dark:border-slate-900 object-cover shadow-sm"
              />
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base hover:text-[#0A66C2] cursor-pointer">
              {currentUser.name}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
              {currentUser.headline}
            </p>
          </div>

          {/* Profile Metrics */}
          <div className="py-2 text-xs border-b border-slate-100 dark:border-slate-800 space-y-2">
            <div className="px-4 py-1 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer">
              <span className="text-slate-500 font-medium">Profile views</span>
              <span className="text-[#0A66C2] font-bold">
                {currentUser.profileViewsThisWeek}
              </span>
            </div>
            <div className="px-4 py-1 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer">
              <span className="text-slate-500 font-medium">Search appearances</span>
              <span className="text-[#0A66C2] font-bold">
                {currentUser.searchAppearances}
              </span>
            </div>
            <div className="px-4 py-1 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer">
              <span className="text-slate-500 font-medium">Connections</span>
              <span className="text-[#0A66C2] font-bold">
                {currentUser.connectionsCount}
              </span>
            </div>
          </div>

          {/* Mobile Suite Banner */}
          <div className="p-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-indigo-950/40">
            <button
              onClick={openFlutterSuite}
              className="w-full flex items-center justify-between text-left group"
            >
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-blue-600 text-white rounded-lg">
                  <Smartphone className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Flutter APK / iOS Suite
                  </p>
                  <p className="text-[10px] text-slate-500">Download Code & Build</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </aside>

      {/* Center Column: Main Feed */}
      <main className="lg:col-span-6 space-y-4">
        {/* Post Creation Box */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-2xs space-y-3">
          <div className="flex items-center gap-3">
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-10 h-10 rounded-full object-cover"
            />
            <button
              onClick={openCreatePost}
              className="flex-1 text-left px-4 py-2.5 bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full text-slate-500 dark:text-slate-400 text-xs font-medium border border-transparent focus:outline-hidden transition-colors"
            >
              Start a post, or draft with AI Assistant...
            </button>
          </div>

          {/* Quick Action Icons */}
          <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800/80 text-xs text-slate-600 dark:text-slate-400 font-semibold">
            <button
              onClick={openCreatePost}
              className="flex items-center gap-2 py-1.5 px-3 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors text-blue-600"
            >
              <Image className="w-5 h-5 text-blue-500" />
              <span>Media</span>
            </button>
            <button
              onClick={openCreatePost}
              className="flex items-center gap-2 py-1.5 px-3 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors text-green-600"
            >
              <Video className="w-5 h-5 text-green-500" />
              <span>Video</span>
            </button>
            <button
              onClick={openCreatePost}
              className="flex items-center gap-2 py-1.5 px-3 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors text-amber-600"
            >
              <Calendar className="w-5 h-5 text-amber-500" />
              <span>Event</span>
            </button>
            <button
              onClick={openCreatePost}
              className="flex items-center gap-2 py-1.5 px-3 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors text-purple-600"
            >
              <Sparkles className="w-5 h-5 text-purple-500" />
              <span>AI Draft</span>
            </button>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center justify-between">
          <div className="h-px bg-slate-200 dark:bg-slate-800 flex-1 mr-3" />
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400">Sort by:</span>
            <select
              value={activeFilter}
              onChange={(e) => setActiveFilter(e.target.value)}
              className="bg-transparent font-bold text-slate-700 dark:text-slate-300 focus:outline-hidden cursor-pointer"
            >
              <option value="all">Top Posts</option>
              <option value="following">Following Only</option>
              <option value="bookmarked">Saved Posts</option>
            </select>
          </div>
        </div>

        {/* Posts List */}
        <div className="space-y-4">
          {filteredPosts.length > 0 ? (
            filteredPosts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                currentUserAvatar={currentUser.avatar}
                followingIds={followingIds}
                onToggleFollow={onToggleFollow}
                onMessageContact={onMessageContact}
                onSelectProfile={onSelectProfile}
                onLikePost={onLikePost}
                onAddComment={onAddComment}
                onBookmarkPost={onBookmarkPost}
                onVotePoll={onVotePoll}
              />
            ))
          ) : (
            <div className="bg-white dark:bg-slate-900 rounded-xl p-8 text-center border border-slate-200 dark:border-slate-800 space-y-2">
              <p className="font-semibold text-slate-700 dark:text-slate-300 text-sm">
                No posts found for this filter.
              </p>
              <p className="text-xs text-slate-400">
                Try switching filters or creating a new post.
              </p>
            </div>
          )}
        </div>
      </main>

      {/* Right Column: Trending News & Sidebar */}
      <aside className="lg:col-span-3 space-y-4">
        {/* ProConnect News Widget */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#0A66C2]" />
              <span>ProConnect News</span>
            </h3>
            <Info className="w-4 h-4 text-slate-400" />
          </div>

          <div className="space-y-3">
            {newsItems.map((item) => (
              <div
                key={item.id}
                className="cursor-pointer group hover:bg-slate-50 dark:hover:bg-slate-800/50 p-1.5 rounded-lg transition-colors"
              >
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-[#0A66C2] line-clamp-1">
                  • {item.title}
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  {item.time} • {item.readers}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Flutter APK Builder Quick Callout */}
        <div className="bg-gradient-to-br from-indigo-900 to-blue-900 text-white rounded-xl p-4 shadow-lg space-y-3">
          <div className="flex items-center gap-2 text-cyan-300 font-bold text-xs uppercase tracking-wider">
            <Smartphone className="w-4 h-4" />
            <span>Flutter Unified Suite</span>
          </div>
          <h4 className="font-bold text-sm leading-snug">
            Compile to Android APK & iOS IPA
          </h4>
          <p className="text-xs text-blue-100">
            Get complete Dart source code & step-by-step release compilation scripts.
          </p>
          <button
            onClick={openFlutterSuite}
            className="w-full bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-xs py-2 rounded-lg transition-colors shadow-xs"
          >
            Open Flutter Builder Hub
          </button>
        </div>
      </aside>
    </div>
  );
};
