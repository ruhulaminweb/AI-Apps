import React, { useState } from "react";
import {
  ThumbsUp,
  MessageSquare,
  Repeat,
  Send,
  Bookmark,
  MoreHorizontal,
  Heart,
  Lightbulb,
  Smile,
  PartyPopper,
  HandHeart,
  Globe,
  Plus,
  Check,
} from "lucide-react";
import { Post, ReactionType, Comment } from "../types";
import { ProfilePopupData } from "./UserProfileModal";

interface PostCardProps {
  post: Post;
  currentUserAvatar: string;
  followingIds?: string[];
  onToggleFollow?: (authorId: string) => void;
  onMessageContact?: (contact: { id: string; name: string; headline: string; avatar: string }) => void;
  onSelectProfile?: (profile: ProfilePopupData) => void;
  onLikePost: (postId: string, reaction: ReactionType) => void;
  onAddComment: (postId: string, text: string) => void;
  onBookmarkPost: (postId: string) => void;
  onVotePoll?: (postId: string, optionId: string) => void;
}

export const PostCard: React.FC<PostCardProps> = ({
  post,
  currentUserAvatar,
  followingIds = [],
  onToggleFollow,
  onMessageContact,
  onSelectProfile,
  onLikePost,
  onAddComment,
  onBookmarkPost,
  onVotePoll,
}) => {
  const [showReactionsHover, setShowReactionsHover] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [showShareModal, setShowShareModal] = useState(false);

  const isFollowing = followingIds.includes(post.authorId) || post.isFollowingAuthor || false;

  const totalReactions: number = (Object.values(post.reactions || {}) as number[]).reduce((a: number, b: number) => a + (b || 0), 0);

  const reactionIcons: Record<ReactionType, { label: string; icon: any; color: string }> = {
    like: { label: "Like", icon: ThumbsUp, color: "text-[#0A66C2]" },
    celebrate: { label: "Celebrate", icon: PartyPopper, color: "text-green-600" },
    support: { label: "Support", icon: HandHeart, color: "text-purple-600" },
    love: { label: "Love", icon: Heart, color: "text-red-500" },
    insightful: { label: "Insightful", icon: Lightbulb, color: "text-amber-500" },
    funny: { label: "Funny", icon: Smile, color: "text-teal-500" },
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    onAddComment(post.id, commentText);
    setCommentText("");
  };

  return (
    <article className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs overflow-hidden transition-all">
      {/* Header Info */}
      <div className="p-4 flex items-start justify-between gap-3">
        <div
          onClick={() =>
            onSelectProfile &&
            onSelectProfile({
              id: post.authorId,
              name: post.authorName,
              headline: post.authorHeadline,
              avatar: post.authorAvatar,
              degree: post.authorDegree,
            })
          }
          className="flex items-start gap-3 cursor-pointer group"
        >
          <img
            src={post.authorAvatar}
            alt={post.authorName}
            className="w-12 h-12 rounded-full object-cover ring-2 ring-slate-100 dark:ring-slate-800 group-hover:opacity-90 transition-opacity"
          />
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm group-hover:text-[#0A66C2] dark:group-hover:text-[#378FE9] group-hover:underline">
                {post.authorName}
              </h4>
              {post.authorDegree && (
                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                  • {post.authorDegree}
                </span>
              )}
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
              {post.authorHeadline}
            </p>

            <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-0.5">
              <span>{post.createdAt}</span>
              <span>•</span>
              <Globe className="w-3 h-3" />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onToggleFollow && onToggleFollow(post.authorId)}
            className={`text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1 transition-colors ${
              isFollowing
                ? "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                : "text-[#0A66C2] dark:text-[#378FE9] hover:bg-blue-50 dark:hover:bg-blue-950/40"
            }`}
          >
            {isFollowing ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Following</span>
              </>
            ) : (
              <>
                <Plus className="w-3.5 h-3.5" />
                <span>Follow</span>
              </>
            )}
          </button>

          <button
            onClick={() => onBookmarkPost(post.id)}
            className={`p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ${
              post.isBookmarked ? "text-[#0A66C2]" : "text-slate-400"
            }`}
            title="Bookmark Post"
          >
            <Bookmark className={`w-4 h-4 ${post.isBookmarked ? "fill-current" : ""}`} />
          </button>
        </div>
      </div>

      {/* Post Text Body */}
      <div className="px-4 pb-3">
        <p className="text-slate-800 dark:text-slate-200 text-sm leading-relaxed whitespace-pre-line">
          {post.content}
        </p>

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {post.tags.map((tag, idx) => (
              <span
                key={idx}
                className="text-xs font-semibold text-[#0A66C2] dark:text-[#378FE9] hover:underline cursor-pointer"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Media Attachments */}
      {post.media?.type === "image" && post.media.url && (
        <div className="w-full bg-slate-900/5 dark:bg-slate-950/50">
          <img
            src={post.media.url}
            alt={post.media.title || "Post attachment"}
            className="w-full max-h-[480px] object-cover cursor-pointer hover:opacity-95 transition-opacity"
          />
        </div>
      )}

      {post.media?.type === "poll" && post.media.pollOptions && (
        <div className="mx-4 my-2 p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/60 space-y-2.5">
          <h5 className="font-semibold text-xs text-slate-800 dark:text-slate-200">
            {post.media.title}
          </h5>
          <div className="space-y-2">
            {post.media.pollOptions.map((opt) => {
              const total = post.media?.totalVotes || 1;
              const pct = Math.round((opt.votes / Math.max(total, 1)) * 100);
              return (
                <button
                  key={opt.id}
                  onClick={() => onVotePoll && onVotePoll(post.id, opt.id)}
                  className="w-full relative text-left p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-[#0A66C2] transition-colors overflow-hidden group"
                >
                  <div
                    className="absolute inset-y-0 left-0 bg-blue-100 dark:bg-blue-900/40 transition-all duration-300"
                    style={{ width: `${pct}%` }}
                  />
                  <div className="relative z-10 flex items-center justify-between text-xs font-medium text-slate-800 dark:text-slate-200">
                    <span>{opt.text}</span>
                    <span className="text-slate-500 font-bold">{pct}%</span>
                  </div>
                </button>
              );
            })}
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            {post.media.totalVotes || 0} votes • Poll open
          </p>
        </div>
      )}

      {/* Reaction Counts Bar */}
      <div className="px-4 py-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-1.5">
          <div className="flex -space-x-1">
            <span className="w-4 h-4 rounded-full bg-[#0A66C2] text-white text-[9px] flex items-center justify-center font-bold ring-1 ring-white dark:ring-slate-900">
              👍
            </span>
            <span className="w-4 h-4 rounded-full bg-red-500 text-white text-[9px] flex items-center justify-center font-bold ring-1 ring-white dark:ring-slate-900">
              ❤️
            </span>
            <span className="w-4 h-4 rounded-full bg-amber-500 text-white text-[9px] flex items-center justify-center font-bold ring-1 ring-white dark:ring-slate-900">
              💡
            </span>
          </div>
          <span className="font-medium hover:underline cursor-pointer">
            {totalReactions > 0 ? totalReactions : "Be the first to react"}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowComments(!showComments)}
            className="hover:underline hover:text-slate-700 dark:hover:text-slate-300 cursor-pointer"
          >
            {post.commentsCount} comments
          </button>
          <span>•</span>
          <button
            onClick={() => setShowShareModal(true)}
            className="hover:underline hover:text-slate-700 dark:hover:text-slate-300 cursor-pointer"
          >
            {post.repostsCount} reposts
          </button>
        </div>
      </div>

      {/* Action Buttons with Reactions Hover */}
      <div className="px-2 py-1 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between relative">
        {/* Hover Reactions Popup */}
        {showReactionsHover && (
          <div
            onMouseLeave={() => setShowReactionsHover(false)}
            className="absolute -top-12 left-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full shadow-lg p-1.5 flex items-center gap-1 z-30 animate-in fade-in zoom-in-95 duration-100"
          >
            {(Object.keys(reactionIcons) as ReactionType[]).map((rx) => {
              const meta = reactionIcons[rx];
              const IconComp = meta.icon;
              return (
                <button
                  key={rx}
                  onClick={() => {
                    onLikePost(post.id, rx);
                    setShowReactionsHover(false);
                  }}
                  className="p-1.5 hover:scale-125 transition-transform rounded-full hover:bg-slate-100 dark:hover:bg-slate-700"
                  title={meta.label}
                >
                  <IconComp className={`w-5 h-5 ${meta.color}`} />
                </button>
              );
            })}
          </div>
        )}

        {/* Like Button */}
        <button
          onMouseEnter={() => setShowReactionsHover(true)}
          onClick={() =>
            onLikePost(post.id, post.userReaction ? post.userReaction : "like")
          }
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800/80 text-xs font-semibold transition-colors ${
            post.userReaction
              ? reactionIcons[post.userReaction]?.color || "text-[#0A66C2]"
              : "text-slate-600 dark:text-slate-400"
          }`}
        >
          <ThumbsUp className={`w-4 h-4 ${post.userReaction ? "fill-current" : ""}`} />
          <span>{post.userReaction ? post.userReaction.toUpperCase() : "Like"}</span>
        </button>

        {/* Comment Button */}
        <button
          onClick={() => setShowComments(!showComments)}
          className="flex-1 flex items-center justify-center gap-2 py-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800/80 text-xs font-semibold text-slate-600 dark:text-slate-400 transition-colors"
        >
          <MessageSquare className="w-4 h-4" />
          <span>Comment</span>
        </button>

        {/* Repost Button */}
        <button
          onClick={() => setShowShareModal(true)}
          className="flex-1 flex items-center justify-center gap-2 py-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800/80 text-xs font-semibold text-slate-600 dark:text-slate-400 transition-colors"
        >
          <Repeat className="w-4 h-4" />
          <span>Repost</span>
        </button>

        {/* Send Direct Message */}
        <button
          onClick={() => {
            if (onMessageContact) {
              onMessageContact({
                id: post.authorId,
                name: post.authorName,
                headline: post.authorHeadline,
                avatar: post.authorAvatar,
              });
            } else {
              setShowShareModal(true);
            }
          }}
          className="flex-1 flex items-center justify-center gap-2 py-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800/80 text-xs font-semibold text-slate-600 dark:text-slate-400 transition-colors"
          title="Send private message to author"
        >
          <Send className="w-4 h-4 text-[#0A66C2]" />
          <span>Message</span>
        </button>
      </div>

      {/* Expandable Comments Section */}
      {showComments && (
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 space-y-3">
          {/* Add Comment Input */}
          <form onSubmit={handleCommentSubmit} className="flex items-center gap-2">
            <img
              src={currentUserAvatar}
              alt="Me"
              className="w-8 h-8 rounded-full object-cover"
            />
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Add a comment..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                className="w-full pl-3 pr-10 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-full text-xs text-slate-900 dark:text-slate-100 focus:outline-hidden focus:border-[#0A66C2]"
              />
              <button
                type="submit"
                disabled={!commentText.trim()}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-[#0A66C2] p-1 disabled:opacity-40"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>

          {/* Comment Thread */}
          <div className="space-y-3 pt-2">
            {post.comments && post.comments.length > 0 ? (
              post.comments.map((c) => (
                <div key={c.id} className="flex items-start gap-2 text-xs">
                  <img
                    src={c.authorAvatar}
                    alt={c.authorName}
                    onClick={() =>
                      onSelectProfile &&
                      onSelectProfile({
                        id: c.authorId,
                        name: c.authorName,
                        headline: c.authorHeadline,
                        avatar: c.authorAvatar,
                      })
                    }
                    className="w-7 h-7 rounded-full object-cover cursor-pointer hover:opacity-80 transition-opacity"
                  />
                  <div className="flex-1 bg-white dark:bg-slate-800 p-2.5 rounded-lg border border-slate-200 dark:border-slate-700/80">
                    <div className="flex items-center justify-between">
                      <span
                        onClick={() =>
                          onSelectProfile &&
                          onSelectProfile({
                            id: c.authorId,
                            name: c.authorName,
                            headline: c.authorHeadline,
                            avatar: c.authorAvatar,
                          })
                        }
                        className="font-bold text-slate-900 dark:text-slate-100 cursor-pointer hover:text-[#0A66C2] hover:underline"
                      >
                        {c.authorName}
                      </span>
                      <span className="text-[10px] text-slate-400">{c.createdAt}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      {c.authorHeadline}
                    </p>
                    <p className="text-slate-800 dark:text-slate-200 mt-1">{c.content}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-xs text-slate-400 py-2">
                No comments yet. Start the conversation!
              </p>
            )}
          </div>
        </div>
      )}

      {/* Share / Repost Modal */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl p-5 max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              Repost or Share
            </h3>
            <p className="text-xs text-slate-500">
              Share this post with your professional network or send as a direct message.
            </p>

            <div className="space-y-2">
              <button
                onClick={() => {
                  alert("Post shared to your feed!");
                  setShowShareModal(false);
                }}
                className="w-full text-left p-3 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg flex items-center gap-3 border border-slate-200 dark:border-slate-700"
              >
                <Repeat className="w-5 h-5 text-[#0A66C2]" />
                <div>
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Repost instantly
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Share directly with your connections
                  </p>
                </div>
              </button>

              <button
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  alert("Link copied to clipboard!");
                  setShowShareModal(false);
                }}
                className="w-full text-left p-3 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg flex items-center gap-3 border border-slate-200 dark:border-slate-700"
              >
                <Send className="w-5 h-5 text-indigo-600" />
                <div>
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Copy link to post
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Copy post link to share in messages
                  </p>
                </div>
              </button>
            </div>

            <button
              onClick={() => setShowShareModal(false)}
              className="w-full text-center text-xs text-slate-500 hover:underline pt-2"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </article>
  );
};
