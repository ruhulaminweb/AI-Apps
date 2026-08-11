import React, { useState, useEffect } from "react";
import {
  User as UserIcon,
  MapPin,
  Briefcase,
  GraduationCap,
  Sparkles,
  Edit2,
  Edit3,
  Plus,
  Eye,
  TrendingUp,
  Search,
  ThumbsUp,
  Award,
  CheckCircle2,
  Building,
  Loader2,
  X,
  Camera,
} from "lucide-react";
import { User, Experience, Skill } from "../types";
import { EditProfileModal } from "./EditProfileModal";

interface ProfileViewProps {
  currentUser: User;
  onUpdateUser: (updatedUser: User) => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  currentUser,
  onUpdateUser,
}) => {
  const [user, setUser] = useState<User>(currentUser);
  const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false);
  const [isEditingAbout, setIsEditingAbout] = useState(false);
  const [aboutInput, setAboutInput] = useState(user.about);
  const [isAiBioLoading, setIsAiBioLoading] = useState(false);

  // Sync state if currentUser changes (e.g. user switch / login)
  useEffect(() => {
    setUser(currentUser);
    setAboutInput(currentUser.about);
  }, [currentUser]);

  // Add Experience Modal
  const [showAddExpModal, setShowAddExpModal] = useState(false);
  const [newExpTitle, setNewExpTitle] = useState("");
  const [newExpCompany, setNewExpCompany] = useState("");
  const [newExpLocation, setNewExpLocation] = useState("San Francisco, CA");
  const [newExpDesc, setNewExpDesc] = useState("");

  const handleToggleOpenToWork = () => {
    const updated = { ...user, isOpenToWork: !user.isOpenToWork };
    setUser(updated);
    onUpdateUser(updated);
  };

  const handleToggleHiring = () => {
    const updated = { ...user, isHiring: !user.isHiring };
    setUser(updated);
    onUpdateUser(updated);
  };

  const handlePolishBioWithAi = async () => {
    setIsAiBioLoading(true);
    try {
      const res = await fetch("/api/gemini/profile-assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          headline: user.headline,
          currentRole: user.role,
          skills: user.skills.map((s) => s.name),
          rawAbout: aboutInput,
        }),
      });
      const data = await res.json();
      if (data.result) {
        setAboutInput(data.result);
      }
    } catch (err) {
      console.error("AI Bio Polish error", err);
    } finally {
      setIsAiBioLoading(false);
    }
  };

  const handleSaveAbout = () => {
    const updated = { ...user, about: aboutInput };
    setUser(updated);
    onUpdateUser(updated);
    setIsEditingAbout(false);
  };

  const handleAddExperienceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExpTitle || !newExpCompany) return;

    const newExp: Experience = {
      id: `exp_${Date.now()}`,
      title: newExpTitle,
      company: newExpCompany,
      location: newExpLocation,
      startDate: "Jan 2025",
      endDate: "Present",
      isCurrent: true,
      description: newExpDesc,
    };

    const updated = { ...user, experiences: [newExp, ...user.experiences] };
    setUser(updated);
    onUpdateUser(updated);
    setShowAddExpModal(false);
  };

  const handleEndorseSkill = (skillId: string) => {
    const updatedSkills = user.skills.map((s) => {
      if (s.id === skillId) {
        return {
          ...s,
          endorsementsCount: s.endorsedByMe
            ? s.endorsementsCount - 1
            : s.endorsementsCount + 1,
          endorsedByMe: !s.endorsedByMe,
        };
      }
      return s;
    });
    const updated = { ...user, skills: updatedSkills };
    setUser(updated);
    onUpdateUser(updated);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      {/* Profile Header Card */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs overflow-hidden">
        {/* Cover Banner */}
        <div className="h-44 bg-gradient-to-r from-blue-700 via-indigo-800 to-purple-900 relative group">
          {user.coverImage && (
            <img
              src={user.coverImage}
              alt="Cover"
              className="w-full h-full object-cover"
            />
          )}
          <button
            onClick={() => setIsEditProfileModalOpen(true)}
            className="absolute top-3 right-3 bg-black/60 hover:bg-black/80 text-white text-xs font-bold px-3 py-1.5 rounded-full backdrop-blur-xs flex items-center gap-1.5 shadow-md transition-all opacity-90 group-hover:opacity-100"
            title="Edit cover banner"
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Edit Cover</span>
          </button>
        </div>

        {/* Profile Content */}
        <div className="px-6 pb-6 relative">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between -mt-16 mb-4 gap-4">
            <div className="relative group">
              <img
                src={user.avatar}
                alt={user.name}
                className="w-32 h-32 rounded-full border-4 border-white dark:border-slate-900 object-cover shadow-md"
              />
              <button
                onClick={() => setIsEditProfileModalOpen(true)}
                className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white font-bold text-xs"
                title="Change profile photo"
              >
                <Camera className="w-6 h-6" />
              </button>
              {user.isOpenToWork && (
                <span className="absolute bottom-1 right-1 bg-emerald-600 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full ring-2 ring-white">
                  OPEN TO WORK
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => setIsEditProfileModalOpen(true)}
                className="px-4 py-1.5 rounded-full text-xs font-bold bg-[#0A66C2] text-white hover:bg-[#004182] flex items-center gap-1.5 shadow-xs transition-all"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Profile</span>
              </button>

              <button
                onClick={handleToggleOpenToWork}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                  user.isOpenToWork
                    ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200"
                    : "border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100"
                }`}
              >
                {user.isOpenToWork ? "Open to Work (Active)" : "Open to..."}
              </button>

              <button
                onClick={handleToggleHiring}
                className={`px-4 py-1.5 rounded-full text-xs font-bold border transition-all ${
                  user.isHiring
                    ? "bg-purple-100 text-purple-800 border-purple-300"
                    : "border-slate-300 text-slate-700 dark:text-slate-200 hover:bg-slate-100"
                }`}
              >
                {user.isHiring ? "Hiring Badge (Active)" : "Hiring Badge"}
              </button>
            </div>
          </div>

          <div>
            <h1 className="font-extrabold text-slate-900 dark:text-white text-2xl flex items-center gap-2">
              <span>{user.name}</span>
              <CheckCircle2 className="w-5 h-5 text-[#0A66C2]" />
            </h1>

            <p className="text-sm text-slate-700 dark:text-slate-300 mt-1 max-w-2xl font-medium">
              {user.headline}
            </p>

            <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 mt-2 flex-wrap">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" />
                {user.location}
              </span>
              <span className="font-semibold text-[#0A66C2]">
                {user.connectionsCount} connections
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Analytics Card */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-2xs space-y-3">
        <h3 className="font-bold text-slate-900 dark:text-white text-sm">
          Analytics & Private Dashboard
        </h3>
        <p className="text-xs text-slate-500">Only visible to you</p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/60 flex items-center gap-3">
            <Eye className="w-6 h-6 text-[#0A66C2]" />
            <div>
              <span className="font-extrabold text-slate-900 dark:text-white text-base">
                {user.profileViewsThisWeek}
              </span>
              <p className="text-[11px] text-slate-500">Profile views this week</p>
            </div>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/60 flex items-center gap-3">
            <TrendingUp className="w-6 h-6 text-emerald-600" />
            <div>
              <span className="font-extrabold text-slate-900 dark:text-white text-base">
                1,240
              </span>
              <p className="text-[11px] text-slate-500">Post impressions</p>
            </div>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/60 flex items-center gap-3">
            <Search className="w-6 h-6 text-purple-600" />
            <div>
              <span className="font-extrabold text-slate-900 dark:text-white text-base">
                {user.searchAppearances}
              </span>
              <p className="text-[11px] text-slate-500">Search appearances</p>
            </div>
          </div>
        </div>
      </div>

      {/* About Section with AI Polish Bio */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-slate-900 dark:text-white text-sm">
            About
          </h3>

          {!isEditingAbout ? (
            <button
              onClick={() => {
                setAboutInput(user.about);
                setIsEditingAbout(true);
              }}
              className="p-1.5 text-slate-400 hover:text-[#0A66C2] rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <Edit2 className="w-4 h-4" />
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePolishBioWithAi}
                disabled={isAiBioLoading}
                className="text-xs text-purple-600 dark:text-purple-400 font-bold flex items-center gap-1 hover:underline disabled:opacity-50"
              >
                {isAiBioLoading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5" />
                )}
                <span>Polish Bio with Gemini AI</span>
              </button>

              <button
                onClick={handleSaveAbout}
                className="px-3 py-1 bg-[#0A66C2] text-white text-xs font-bold rounded-full"
              >
                Save
              </button>
            </div>
          )}
        </div>

        {isEditingAbout ? (
          <textarea
            rows={5}
            value={aboutInput}
            onChange={(e) => setAboutInput(e.target.value)}
            className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-800 dark:text-slate-100"
          />
        ) : (
          <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
            {user.about}
          </p>
        )}
      </div>

      {/* Experience Section */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-slate-900 dark:text-white text-sm">
            Experience
          </h3>
          <button
            onClick={() => setShowAddExpModal(true)}
            className="p-1.5 text-slate-400 hover:text-[#0A66C2] rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          {user.experiences.map((exp) => (
            <div key={exp.id} className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-lg bg-blue-50 dark:bg-slate-800 flex items-center justify-center border border-slate-200 dark:border-slate-700 font-bold text-blue-600">
                <Building className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                  {exp.title}
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                  {exp.company} • {exp.location}
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {exp.startDate} - {exp.endDate}
                </p>
                <p className="text-xs text-slate-700 dark:text-slate-300 mt-1.5">
                  {exp.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Skills Section */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-2xs space-y-4">
        <h3 className="font-bold text-slate-900 dark:text-white text-sm">
          Skills & Endorsements
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {user.skills.map((skill) => (
            <div
              key={skill.id}
              className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/60 flex items-center justify-between"
            >
              <div>
                <h5 className="font-bold text-slate-900 dark:text-white text-xs">
                  {skill.name}
                </h5>
                <p className="text-[10px] text-slate-500">
                  {skill.endorsementsCount} endorsements
                </p>
              </div>

              <button
                onClick={() => handleEndorseSkill(skill.id)}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-colors ${
                  skill.endorsedByMe
                    ? "bg-[#0A66C2] text-white"
                    : "border border-slate-300 dark:border-slate-700 text-slate-600 hover:bg-slate-100"
                }`}
              >
                {skill.endorsedByMe ? "Endorsed" : "Endorse"}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Add Experience Modal */}
      {showAddExpModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleAddExperienceSubmit}
            className="bg-white dark:bg-slate-900 rounded-xl max-w-md w-full border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Add Work Experience
              </h3>
              <button
                type="button"
                onClick={() => setShowAddExpModal(false)}
                className="p-1 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold block mb-1">Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Senior Software Engineer"
                  value={newExpTitle}
                  onChange={(e) => setNewExpTitle(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-md border border-slate-200 dark:border-slate-700"
                />
              </div>

              <div>
                <label className="font-semibold block mb-1">Company</label>
                <input
                  type="text"
                  required
                  placeholder="Company Name"
                  value={newExpCompany}
                  onChange={(e) => setNewExpCompany(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-md border border-slate-200 dark:border-slate-700"
                />
              </div>

              <div>
                <label className="font-semibold block mb-1">Description</label>
                <textarea
                  rows={3}
                  value={newExpDesc}
                  onChange={(e) => setNewExpDesc(e.target.value)}
                  className="w-full p-2 bg-slate-100 dark:bg-slate-800 rounded-md border border-slate-200 dark:border-slate-700"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-[#0A66C2] text-white font-bold rounded-lg text-xs"
            >
              Add Position
            </button>
          </form>
        </div>
      )}

      {/* Edit Profile Modal */}
      <EditProfileModal
        isOpen={isEditProfileModalOpen}
        onClose={() => setIsEditProfileModalOpen(false)}
        currentUser={user}
        onSave={(updated) => {
          setUser(updated);
          onUpdateUser(updated);
        }}
      />
    </div>
  );
};
