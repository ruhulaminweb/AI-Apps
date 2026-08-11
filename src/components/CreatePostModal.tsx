import React, { useState } from "react";
import {
  X,
  Sparkles,
  Image as ImageIcon,
  BarChart2,
  FileText,
  Smile,
  Globe,
  Loader2,
  Wand2,
} from "lucide-react";
import { User, Post } from "../types";

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  onPostCreated: (post: Post) => void;
}

export const CreatePostModal: React.FC<CreatePostModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onPostCreated,
}) => {
  const [content, setContent] = useState("");
  const [mediaType, setMediaType] = useState<"none" | "image" | "poll">("none");
  const [imageUrl, setImageUrl] = useState("");
  const [pollQuestion, setPollQuestion] = useState("");
  const [pollOptions, setPollOptions] = useState(["Option 1", "Option 2"]);

  // AI Assistant states
  const [showAiAssistant, setShowAiAssistant] = useState(false);
  const [aiTopic, setAiTopic] = useState("");
  const [aiTone, setAiTone] = useState("Professional");
  const [aiLength, setAiLength] = useState("Medium");
  const [includeHashtags, setIncludeHashtags] = useState(true);
  const [isAiLoading, setIsAiLoading] = useState(false);

  if (!isOpen) return null;

  const handleGenerateAiPost = async () => {
    setIsAiLoading(true);
    try {
      const res = await fetch("/api/gemini/post-assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: aiTopic || "key insights on software engineering leadership",
          tone: aiTone,
          length: aiLength,
          includeHashtags,
          rawDraft: content,
        }),
      });
      const data = await res.json();
      if (data.result) {
        setContent(data.result);
      }
    } catch (err) {
      console.error("AI post generation error:", err);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    const newPost: Post = {
      id: `post_${Date.now()}`,
      authorId: currentUser.id,
      authorName: currentUser.name,
      authorHeadline: currentUser.headline,
      authorAvatar: currentUser.avatar,
      authorDegree: "1st",
      content,
      createdAt: "Just now",
      reactions: {
        like: 0,
        celebrate: 0,
        support: 0,
        love: 0,
        insightful: 0,
        funny: 0,
      },
      commentsCount: 0,
      comments: [],
      repostsCount: 0,
      media:
        mediaType === "image" && imageUrl
          ? { type: "image", url: imageUrl, title: "Attachment" }
          : mediaType === "poll" && pollQuestion
          ? {
              type: "poll",
              title: pollQuestion,
              pollOptions: pollOptions.map((opt, idx) => ({
                id: `opt_${idx}`,
                text: opt,
                votes: 0,
              })),
              totalVotes: 0,
            }
          : undefined,
    };

    onPostCreated(newPost);
    setContent("");
    setImageUrl("");
    setMediaType("none");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-xl max-w-2xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-10 h-10 rounded-full object-cover"
            />
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-1">
                {currentUser.name}
              </h3>
              <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full w-max mt-0.5">
                <Globe className="w-3 h-3" />
                <span>Anyone</span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          {/* Main Textarea */}
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What do you want to talk about?"
            className="w-full h-36 bg-transparent text-slate-900 dark:text-slate-100 text-sm placeholder-slate-400 border-none resize-none focus:outline-hidden"
          />

          {/* Media Attachments Section */}
          {mediaType === "image" && (
            <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Add Image URL
                </span>
                <button
                  type="button"
                  onClick={() => setMediaType("none")}
                  className="text-xs text-red-500 hover:underline"
                >
                  Remove
                </button>
              </div>
              <input
                type="text"
                placeholder="https://images.unsplash.com/..."
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md text-xs"
              />
              {imageUrl && (
                <img
                  src={imageUrl}
                  alt="Preview"
                  className="w-full h-40 object-cover rounded-md mt-2"
                  onError={(e) => ((e.target as any).style.display = "none")}
                />
              )}
            </div>
          )}

          {mediaType === "poll" && (
            <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Create a Poll
                </span>
                <button
                  type="button"
                  onClick={() => setMediaType("none")}
                  className="text-xs text-red-500 hover:underline"
                >
                  Remove
                </button>
              </div>
              <input
                type="text"
                placeholder="Your Question (e.g. Which mobile tech is best?)"
                value={pollQuestion}
                onChange={(e) => setPollQuestion(e.target.value)}
                className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md text-xs font-medium"
              />
              {pollOptions.map((opt, idx) => (
                <input
                  key={idx}
                  type="text"
                  placeholder={`Option ${idx + 1}`}
                  value={opt}
                  onChange={(e) => {
                    const newOpts = [...pollOptions];
                    newOpts[idx] = e.target.value;
                    setPollOptions(newOpts);
                  }}
                  className="w-full px-3 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md text-xs"
                />
              ))}
              {pollOptions.length < 4 && (
                <button
                  type="button"
                  onClick={() => setPollOptions([...pollOptions, ""])}
                  className="text-xs text-[#0A66C2] font-semibold hover:underline"
                >
                  + Add option
                </button>
              )}
            </div>
          )}

          {/* AI Post Assistant Toggle Panel */}
          <div className="border border-indigo-200 dark:border-indigo-900/60 bg-gradient-to-r from-indigo-50/50 to-blue-50/50 dark:from-indigo-950/30 dark:to-blue-950/30 rounded-xl p-3.5 transition-all">
            <button
              type="button"
              onClick={() => setShowAiAssistant(!showAiAssistant)}
              className="w-full flex items-center justify-between font-semibold text-xs text-indigo-700 dark:text-indigo-300"
            >
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400 animate-pulse" />
                <span>AI Post Assistant (Gemini)</span>
              </div>
              <span className="text-[10px] bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded-full font-bold">
                {showAiAssistant ? "Hide" : "Open Assistant"}
              </span>
            </button>

            {showAiAssistant && (
              <div className="mt-3 pt-3 border-t border-indigo-100 dark:border-indigo-900/50 space-y-3">
                <p className="text-[11px] text-slate-600 dark:text-slate-400">
                  Provide a topic or let Gemini polish your current draft into a top-performing LinkedIn post.
                </p>

                <input
                  type="text"
                  placeholder="Topic or main message (optional if draft entered)"
                  value={aiTopic}
                  onChange={(e) => setAiTopic(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md text-xs"
                />

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                      Tone
                    </label>
                    <select
                      value={aiTone}
                      onChange={(e) => setAiTone(e.target.value)}
                      className="w-full px-2 py-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md text-xs"
                    >
                      <option value="Professional">Professional</option>
                      <option value="Thought Leader">Thought Leader</option>
                      <option value="Engaging & Friendly">Engaging & Friendly</option>
                      <option value="Hiring / Announcement">Hiring / Announcement</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                      Length
                    </label>
                    <select
                      value={aiLength}
                      onChange={(e) => setAiLength(e.target.value)}
                      className="w-full px-2 py-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md text-xs"
                    >
                      <option value="Short & Punchy">Short & Punchy</option>
                      <option value="Medium">Medium</option>
                      <option value="Detailed Story">Detailed Story</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includeHashtags}
                      onChange={(e) => setIncludeHashtags(e.target.checked)}
                      className="rounded-xs text-[#0A66C2]"
                    />
                    <span>Include Trending Hashtags</span>
                  </label>

                  <button
                    type="button"
                    onClick={handleGenerateAiPost}
                    disabled={isAiLoading}
                    className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-3 py-1.5 rounded-md shadow-xs transition-colors disabled:opacity-50"
                  >
                    {isAiLoading ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Generating...</span>
                      </>
                    ) : (
                      <>
                        <Wand2 className="w-3.5 h-3.5" />
                        <span>{content ? "Polish Draft" : "Draft Post"}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
            <button
              type="button"
              onClick={() => setMediaType("image")}
              className={`p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-colors ${
                mediaType === "image" ? "text-[#0A66C2]" : ""
              }`}
              title="Add Media"
            >
              <ImageIcon className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={() => setMediaType("poll")}
              className={`p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-colors ${
                mediaType === "poll" ? "text-[#0A66C2]" : ""
              }`}
              title="Create Poll"
            >
              <BarChart2 className="w-5 h-5" />
            </button>
          </div>

          <button
            onClick={handleSubmit}
            disabled={!content.trim()}
            className="bg-[#0A66C2] hover:bg-[#004182] text-white text-xs font-semibold px-5 py-2 rounded-full shadow-xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Post
          </button>
        </div>
      </div>
    </div>
  );
};
