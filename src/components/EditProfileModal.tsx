import React, { useState } from "react";
import {
  X,
  Camera,
  Upload,
  Sparkles,
  Loader2,
  Check,
  Plus,
  Trash2,
  Image as ImageIcon,
  User as UserIcon,
  Briefcase,
  MapPin,
  Building,
} from "lucide-react";
import { User, Skill } from "../types";
import { PRESET_AVATARS, PRESET_COVERS } from "../utils/userProfiles";

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  onSave: (updatedUser: User) => void;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onSave,
}) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<"general" | "images" | "skills">("general");

  // Form States
  const [name, setName] = useState(currentUser.name);
  const [headline, setHeadline] = useState(currentUser.headline);
  const [role, setRole] = useState(currentUser.role || "");
  const [company, setCompany] = useState(currentUser.company || "");
  const [location, setLocation] = useState(currentUser.location);
  const [isOpenToWork, setIsOpenToWork] = useState(currentUser.isOpenToWork);
  const [isHiring, setIsHiring] = useState(currentUser.isHiring);
  const [about, setAbout] = useState(currentUser.about);

  // Images
  const [avatar, setAvatar] = useState(currentUser.avatar);
  const [coverImage, setCoverImage] = useState(currentUser.coverImage || PRESET_COVERS[0].url);
  const [customAvatarUrl, setCustomAvatarUrl] = useState("");
  const [customCoverUrl, setCustomCoverUrl] = useState("");

  // Skills
  const [skills, setSkills] = useState<Skill[]>(currentUser.skills || []);
  const [newSkillName, setNewSkillName] = useState("");

  // AI Polish
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiSuccessMessage, setAiSuccessMessage] = useState<string | null>(null);

  // Handle Avatar Local File Upload
  const handleAvatarFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === "string") {
          setAvatar(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle Cover Local File Upload
  const handleCoverFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === "string") {
          setCoverImage(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle AI Polish Bio
  const handlePolishBioWithAi = async () => {
    setIsAiLoading(true);
    setAiSuccessMessage(null);
    try {
      const res = await fetch("/api/gemini/profile-assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          headline: headline,
          currentRole: role,
          skills: skills.map((s) => s.name),
          rawAbout: about,
        }),
      });

      const data = await res.json();
      if (data.result) {
        setAbout(data.result);
        setAiSuccessMessage("Bio polished with Gemini AI!");
        setTimeout(() => setAiSuccessMessage(null), 3000);
      }
    } catch (err) {
      console.error("AI Bio Polish error", err);
    } finally {
      setIsAiLoading(false);
    }
  };

  // Handle Add Skill
  const handleAddSkill = () => {
    if (!newSkillName.trim()) return;
    const newSkill: Skill = {
      id: `sk_${Date.now()}`,
      name: newSkillName.trim(),
      endorsementsCount: 0,
      endorsedByMe: false,
    };
    setSkills([...skills, newSkill]);
    setNewSkillName("");
  };

  // Handle Remove Skill
  const handleRemoveSkill = (id: string) => {
    setSkills(skills.filter((s) => s.id !== id));
  };

  // Submit Save
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedUser: User = {
      ...currentUser,
      name,
      headline,
      role,
      company,
      location,
      isOpenToWork,
      isHiring,
      about,
      avatar: customAvatarUrl.trim() || avatar,
      coverImage: customCoverUrl.trim() || coverImage,
      skills,
    };

    onSave(updatedUser);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-8 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 shrink-0">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <UserIcon className="w-5 h-5 text-[#0A66C2]" />
              <span>Edit Profile Details</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Update your photo, headline, bio, and background banner
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 px-6 bg-slate-100/50 dark:bg-slate-800/30 shrink-0">
          <button
            onClick={() => setActiveTab("general")}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === "general"
                ? "border-[#0A66C2] text-[#0A66C2] dark:text-cyan-400"
                : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            <UserIcon className="w-4 h-4" />
            <span>General Info</span>
          </button>

          <button
            onClick={() => setActiveTab("images")}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === "images"
                ? "border-[#0A66C2] text-[#0A66C2] dark:text-cyan-400"
                : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            <span>Profile & Cover Images</span>
          </button>

          <button
            onClick={() => setActiveTab("skills")}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === "skills"
                ? "border-[#0A66C2] text-[#0A66C2] dark:text-cyan-400"
                : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            <Briefcase className="w-4 h-4" />
            <span>Skills ({skills.length})</span>
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto flex-1">
          {/* TAB 1: GENERAL INFO */}
          {activeTab === "general" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Alex Morgan"
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-xl border border-slate-300 dark:border-slate-700 focus:border-[#0A66C2] focus:outline-hidden font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Location
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="e.g. San Francisco, CA"
                      className="w-full pl-9 pr-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-xl border border-slate-300 dark:border-slate-700 focus:border-[#0A66C2] focus:outline-hidden"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Professional Headline *
                </label>
                <textarea
                  rows={2}
                  required
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                  placeholder="e.g. Senior Full Stack Architect | React, Node.js & AI Specialist"
                  className="w-full p-3 text-xs bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-xl border border-slate-300 dark:border-slate-700 focus:border-[#0A66C2] focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Current Position / Role
                  </label>
                  <input
                    type="text"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    placeholder="e.g. Lead Software Architect"
                    className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-xl border border-slate-300 dark:border-slate-700 focus:border-[#0A66C2] focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Company
                  </label>
                  <div className="relative">
                    <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      placeholder="e.g. Apex Innovations"
                      className="w-full pl-9 pr-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-xl border border-slate-300 dark:border-slate-700 focus:border-[#0A66C2] focus:outline-hidden"
                    />
                  </div>
                </div>
              </div>

              {/* Status Badges */}
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/80 flex flex-wrap gap-4">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700 dark:text-slate-300">
                  <input
                    type="checkbox"
                    checked={isOpenToWork}
                    onChange={(e) => setIsOpenToWork(e.target.checked)}
                    className="w-4 h-4 rounded-sm text-[#0A66C2] focus:ring-0"
                  />
                  <span>Show "OPEN TO WORK" Badge</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700 dark:text-slate-300">
                  <input
                    type="checkbox"
                    checked={isHiring}
                    onChange={(e) => setIsHiring(e.target.checked)}
                    className="w-4 h-4 rounded-sm text-purple-600 focus:ring-0"
                  />
                  <span>Show "HIRING" Badge</span>
                </label>
              </div>

              {/* About / Summary Section */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    About / Bio Summary
                  </label>
                  <button
                    type="button"
                    onClick={handlePolishBioWithAi}
                    disabled={isAiLoading}
                    className="text-xs font-bold text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1 disabled:opacity-50"
                  >
                    {isAiLoading ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Sparkles className="w-3.5 h-3.5" />
                    )}
                    <span>Polish with Gemini AI</span>
                  </button>
                </div>

                {aiSuccessMessage && (
                  <div className="mb-2 p-2 bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 text-[11px] font-semibold rounded-lg flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-purple-500" />
                    <span>{aiSuccessMessage}</span>
                  </div>
                )}

                <textarea
                  rows={4}
                  value={about}
                  onChange={(e) => setAbout(e.target.value)}
                  placeholder="Share a brief overview of your background, experience, and career goals..."
                  className="w-full p-3 text-xs bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-xl border border-slate-300 dark:border-slate-700 focus:border-[#0A66C2] focus:outline-hidden"
                />
              </div>
            </div>
          )}

          {/* TAB 2: PROFILE & COVER IMAGES */}
          {activeTab === "images" && (
            <div className="space-y-6">
              {/* Profile Photo Section */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/80 space-y-4">
                <div className="flex items-center gap-4">
                  <div className="relative shrink-0">
                    <img
                      src={customAvatarUrl.trim() || avatar}
                      alt="Avatar Preview"
                      className="w-20 h-20 rounded-full object-cover border-2 border-white dark:border-slate-700 shadow-md"
                    />
                    <div className="absolute -bottom-1 -right-1 bg-[#0A66C2] text-white p-1 rounded-full shadow-xs">
                      <Camera className="w-3.5 h-3.5" />
                    </div>
                  </div>

                  <div className="flex-1 space-y-2">
                    <h4 className="font-bold text-xs text-slate-900 dark:text-white">
                      Profile Avatar Image
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Upload a local photo from your device or select from preset avatars
                    </p>

                    <div className="flex items-center gap-2 flex-wrap">
                      <label className="px-3 py-1.5 bg-[#0A66C2] hover:bg-[#004182] text-white text-xs font-bold rounded-lg cursor-pointer flex items-center gap-1.5 transition-colors">
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload Photo</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleAvatarFileUpload}
                          className="hidden"
                        />
                      </label>

                      <input
                        type="text"
                        placeholder="Paste Image URL..."
                        value={customAvatarUrl}
                        onChange={(e) => setCustomAvatarUrl(e.target.value)}
                        className="flex-1 min-w-[180px] px-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg"
                      />
                    </div>
                  </div>
                </div>

                {/* Preset Avatars */}
                <div>
                  <span className="text-[11px] font-semibold text-slate-500 block mb-2">
                    Select from Preset Professional Avatars:
                  </span>
                  <div className="grid grid-cols-6 gap-2">
                    {PRESET_AVATARS.map((preset, idx) => (
                      <button
                        type="button"
                        key={idx}
                        onClick={() => {
                          setAvatar(preset.url);
                          setCustomAvatarUrl("");
                        }}
                        className={`relative rounded-full overflow-hidden border-2 transition-all aspect-square ${
                          avatar === preset.url && !customAvatarUrl
                            ? "border-[#0A66C2] ring-2 ring-[#0A66C2]/30 scale-105"
                            : "border-transparent opacity-80 hover:opacity-100"
                        }`}
                        title={preset.label}
                      >
                        <img
                          src={preset.url}
                          alt={preset.label}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Cover Banner Section */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/80 space-y-4">
                <div>
                  <h4 className="font-bold text-xs text-slate-900 dark:text-white mb-1">
                    Cover Background Banner
                  </h4>
                  <div className="h-28 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 relative mb-3">
                    <img
                      src={customCoverUrl.trim() || coverImage}
                      alt="Cover Preview"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 right-2 bg-black/60 text-white text-[10px] px-2 py-1 rounded-md font-mono">
                      Preview
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <label className="px-3 py-1.5 bg-slate-800 text-white dark:bg-slate-700 text-xs font-bold rounded-lg cursor-pointer flex items-center gap-1.5 hover:bg-slate-900 transition-colors">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload Banner</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleCoverFileUpload}
                        className="hidden"
                      />
                    </label>

                    <input
                      type="text"
                      placeholder="Paste Banner Image URL..."
                      value={customCoverUrl}
                      onChange={(e) => setCustomCoverUrl(e.target.value)}
                      className="flex-1 min-w-[200px] px-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg"
                    />
                  </div>
                </div>

                {/* Preset Covers */}
                <div>
                  <span className="text-[11px] font-semibold text-slate-500 block mb-2">
                    Preset Banner Themes:
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {PRESET_COVERS.map((preset, idx) => (
                      <button
                        type="button"
                        key={idx}
                        onClick={() => {
                          setCoverImage(preset.url);
                          setCustomCoverUrl("");
                        }}
                        className={`h-14 rounded-lg overflow-hidden border-2 relative transition-all ${
                          coverImage === preset.url && !customCoverUrl
                            ? "border-[#0A66C2] ring-2 ring-[#0A66C2]/30"
                            : "border-transparent opacity-70 hover:opacity-100"
                        }`}
                      >
                        <img
                          src={preset.url}
                          alt={preset.label}
                          className="w-full h-full object-cover"
                        />
                        <span className="absolute bottom-1 left-1 bg-black/60 text-white text-[9px] px-1 rounded-xs">
                          {preset.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: SKILLS */}
          {activeTab === "skills" && (
            <div className="space-y-4">
              <div>
                <h4 className="font-bold text-xs text-slate-900 dark:text-white mb-1">
                  Manage Professional Skills
                </h4>
                <p className="text-xs text-slate-500">
                  Add key skills to showcase your expertise on your profile
                </p>
              </div>

              {/* Add New Skill Input */}
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newSkillName}
                  onChange={(e) => setNewSkillName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddSkill();
                    }
                  }}
                  placeholder="e.g. Next.js, Cloud Architecture, GraphQL..."
                  className="flex-1 px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-xl border border-slate-300 dark:border-slate-700 focus:border-[#0A66C2] focus:outline-hidden"
                />
                <button
                  type="button"
                  onClick={handleAddSkill}
                  className="px-4 py-2 bg-[#0A66C2] hover:bg-[#004182] text-white font-bold text-xs rounded-xl flex items-center gap-1 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Skill</span>
                </button>
              </div>

              {/* Current Skills List */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                {skills.map((skill) => (
                  <div
                    key={skill.id}
                    className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between"
                  >
                    <div>
                      <span className="font-bold text-xs text-slate-800 dark:text-slate-100 block">
                        {skill.name}
                      </span>
                      <span className="text-[10px] text-slate-500">
                        {skill.endorsementsCount} Endorsements
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(skill.id)}
                      className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="px-6 py-2.5 bg-[#0A66C2] hover:bg-[#004182] text-white font-bold text-xs rounded-full shadow-md flex items-center gap-1.5 transition-all"
            >
              <Check className="w-4 h-4" />
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
