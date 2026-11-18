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
  Award,
  CheckCircle2,
  Building,
  Loader2,
  X,
  Camera,
  Globe,
  Mail,
  Phone,
  ExternalLink,
  ShieldCheck,
  Heart,
  Users,
  MessageSquare,
  BookOpen,
  Languages,
  HandHeart,
  Trophy,
  FolderGit2,
  Github,
  Twitter,
  Linkedin,
  Star,
  FileText,
  BadgeCheck,
  Calendar,
  ChevronRight,
  Info,
  Trash2,
} from "lucide-react";
import {
  User,
  Experience,
  Education,
  Skill,
  Certification,
  ProjectItem,
  FamilyMember,
  LanguageItem,
  VolunteerExperience,
  HonorAward,
  ContactInfo,
} from "../types";
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

  // Modals state
  const [showContactInfoModal, setShowContactInfoModal] = useState(false);
  const [showAddExpModal, setShowAddExpModal] = useState(false);
  const [showAddEduModal, setShowAddEduModal] = useState(false);
  const [showAddCertModal, setShowAddCertModal] = useState(false);
  const [showAddProjectModal, setShowAddProjectModal] = useState(false);
  const [showAddFamilyModal, setShowAddFamilyModal] = useState(false);
  const [showAddVolunteerModal, setShowAddVolunteerModal] = useState(false);
  const [showAddAwardModal, setShowAddAwardModal] = useState(false);
  const [showAddLanguageModal, setShowAddLanguageModal] = useState(false);
  const [showAddSkillModal, setShowAddSkillModal] = useState(false);
  const [newSkillName, setNewSkillName] = useState("");

  // Active Profile Tab filter
  const [activeTab, setActiveTab] = useState<
    "all" | "jobs" | "academic" | "family" | "engagement"
  >("all");

  // Sync state if currentUser changes
  useEffect(() => {
    setUser(currentUser);
    setAboutInput(currentUser.about);
  }, [currentUser]);

  // Handle updates
  const handleUpdateAndSave = (updated: User) => {
    setUser(updated);
    onUpdateUser(updated);
  };

  const handleToggleOpenToWork = () => {
    handleUpdateAndSave({ ...user, isOpenToWork: !user.isOpenToWork });
  };

  const handleToggleHiring = () => {
    handleUpdateAndSave({ ...user, isHiring: !user.isHiring });
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
    handleUpdateAndSave({ ...user, about: aboutInput });
    setIsEditingAbout(false);
  };

  const handleEndorseSkill = (skillId: string) => {
    const updatedSkills = user.skills.map((s) => {
      if (s.id === skillId) {
        return {
          ...s,
          endorsementsCount: s.endorsedByMe
            ? Math.max(0, s.endorsementsCount - 1)
            : s.endorsementsCount + 1,
          endorsedByMe: !s.endorsedByMe,
        };
      }
      return s;
    });
    handleUpdateAndSave({ ...user, skills: updatedSkills });
  };

  const handleRemoveSkill = (skillId: string) => {
    const updatedSkills = user.skills.filter((s) => s.id !== skillId);
    handleUpdateAndSave({ ...user, skills: updatedSkills });
  };

  const handleAddSkillSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSkillName.trim()) return;
    const newSkill: Skill = {
      id: `skill_${Date.now()}`,
      name: newSkillName.trim(),
      endorsementsCount: 1,
      endorsedByMe: true,
    };
    handleUpdateAndSave({
      ...user,
      skills: [...user.skills, newSkill],
    });
    setNewSkillName("");
    setShowAddSkillModal(false);
  };

  const handleDeleteExperience = (expId: string) => {
    const updated = user.experiences.filter((exp) => exp.id !== expId);
    handleUpdateAndSave({ ...user, experiences: updated });
  };

  // Form submission handlers for adding items
  const [expForm, setExpForm] = useState({
    title: "",
    company: "",
    location: "San Francisco, CA",
    employmentType: "Full-time",
    startDate: "Jan 2024",
    endDate: "Present",
    isCurrent: true,
    description: "",
    skillsUsedStr: "",
  });

  const handleAddExperienceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expForm.title || !expForm.company) return;
    const skillsUsed = expForm.skillsUsedStr
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const newExp: Experience = {
      id: `exp_${Date.now()}`,
      title: expForm.title,
      company: expForm.company,
      location: expForm.location,
      employmentType: expForm.employmentType,
      startDate: expForm.startDate,
      endDate: expForm.endDate,
      isCurrent: expForm.isCurrent,
      description: expForm.description,
      skillsUsed: skillsUsed.length > 0 ? skillsUsed : undefined,
    };
    handleUpdateAndSave({
      ...user,
      experiences: [newExp, ...user.experiences],
    });
    setShowAddExpModal(false);
    setExpForm({
      title: "",
      company: "",
      location: "San Francisco, CA",
      employmentType: "Full-time",
      startDate: "Jan 2024",
      endDate: "Present",
      isCurrent: true,
      description: "",
      skillsUsedStr: "",
    });
  };

  // Education form state
  const [eduForm, setEduForm] = useState({
    school: "",
    degree: "Bachelor of Science",
    fieldOfStudy: "",
    startDate: "2018",
    endDate: "2022",
    gpa: "",
    activities: "",
    honors: "",
  });

  const handleAddEducationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eduForm.school || !eduForm.fieldOfStudy) return;
    const newEdu: Education = {
      id: `edu_${Date.now()}`,
      school: eduForm.school,
      degree: eduForm.degree,
      fieldOfStudy: eduForm.fieldOfStudy,
      startDate: eduForm.startDate,
      endDate: eduForm.endDate,
      gpa: eduForm.gpa || undefined,
      activities: eduForm.activities || undefined,
      honors: eduForm.honors || undefined,
    };
    handleUpdateAndSave({
      ...user,
      education: [newEdu, ...user.education],
    });
    setShowAddEduModal(false);
  };

  // Certifications form state
  const [certForm, setCertForm] = useState({
    name: "",
    issuingOrganization: "",
    issueDate: "Jan 2024",
    expirationDate: "",
    credentialId: "",
    credentialUrl: "",
  });

  const handleAddCertSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!certForm.name || !certForm.issuingOrganization) return;
    const newCert: Certification = {
      id: `cert_${Date.now()}`,
      name: certForm.name,
      issuingOrganization: certForm.issuingOrganization,
      issueDate: certForm.issueDate,
      expirationDate: certForm.expirationDate || undefined,
      credentialId: certForm.credentialId || undefined,
      credentialUrl: certForm.credentialUrl || undefined,
    };
    handleUpdateAndSave({
      ...user,
      certifications: [newCert, ...(user.certifications || [])],
    });
    setShowAddCertModal(false);
  };

  // Project form state
  const [projForm, setProjForm] = useState({
    title: "",
    role: "Lead Creator",
    startDate: "2025",
    endDate: "Present",
    description: "",
    url: "",
    skillsStr: "",
  });

  const handleAddProjectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!projForm.title) return;
    const newProj: ProjectItem = {
      id: `proj_${Date.now()}`,
      title: projForm.title,
      role: projForm.role,
      startDate: projForm.startDate,
      endDate: projForm.endDate,
      description: projForm.description,
      url: projForm.url || undefined,
      skillsUsed: projForm.skillsStr
        ? projForm.skillsStr.split(",").map((s) => s.trim())
        : undefined,
    };
    handleUpdateAndSave({
      ...user,
      projects: [newProj, ...(user.projects || [])],
    });
    setShowAddProjectModal(false);
  };

  // Family Member form state
  const [familyForm, setFamilyForm] = useState({
    name: "",
    relationship: "Sister & Co-founder",
    headline: "Tech Entrepreneur & Investor",
    location: "San Francisco, CA",
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&auto=format&fit=crop&q=80",
  });

  const handleAddFamilySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!familyForm.name) return;
    const newFam: FamilyMember = {
      id: `fam_${Date.now()}`,
      name: familyForm.name,
      relationship: familyForm.relationship,
      headline: familyForm.headline,
      location: familyForm.location,
      avatar: familyForm.avatar,
    };
    handleUpdateAndSave({
      ...user,
      familyConnections: [newFam, ...(user.familyConnections || [])],
    });
    setShowAddFamilyModal(false);
  };

  // Volunteer Work form state
  const [volForm, setVolForm] = useState({
    organization: "",
    role: "Mentor & Volunteer",
    cause: "Education & STEM",
    startDate: "2023",
    endDate: "Present",
    description: "",
  });

  const handleAddVolunteerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!volForm.organization) return;
    const newVol: VolunteerExperience = {
      id: `vol_${Date.now()}`,
      organization: volForm.organization,
      role: volForm.role,
      cause: volForm.cause,
      startDate: volForm.startDate,
      endDate: volForm.endDate,
      description: volForm.description,
    };
    handleUpdateAndSave({
      ...user,
      volunteerWork: [newVol, ...(user.volunteerWork || [])],
    });
    setShowAddVolunteerModal(false);
  };

  // Award form state
  const [awardForm, setAwardForm] = useState({
    title: "",
    issuer: "",
    issueDate: "2025",
    description: "",
  });

  const handleAddAwardSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!awardForm.title) return;
    const newAward: HonorAward = {
      id: `award_${Date.now()}`,
      title: awardForm.title,
      issuer: awardForm.issuer,
      issueDate: awardForm.issueDate,
      description: awardForm.description,
    };
    handleUpdateAndSave({
      ...user,
      honorsAndAwards: [newAward, ...(user.honorsAndAwards || [])],
    });
    setShowAddAwardModal(false);
  };

  // Language form state
  const [langForm, setLangForm] = useState({
    language: "",
    proficiency: "Full professional" as LanguageItem["proficiency"],
  });

  const handleAddLanguageSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!langForm.language) return;
    const newLang: LanguageItem = {
      id: `lang_${Date.now()}`,
      language: langForm.language,
      proficiency: langForm.proficiency,
    };
    handleUpdateAndSave({
      ...user,
      languages: [newLang, ...(user.languages || [])],
    });
    setShowAddLanguageModal(false);
  };

  // Contact Info edit state
  const [contactForm, setContactForm] = useState<ContactInfo>(
    user.contactInfo || {
      email: "alex.rivera@apex.io",
      phone: "+1 (415) 890-2143",
      website: "https://alexrivera.dev",
      github: "github.com/ruhulaminweb",
      twitter: "twitter.com/alexrivera_tech",
      linkedinUrl: "linkedin.com/in/alexrivera-architect",
    }
  );

  const handleSaveContactInfo = (e: React.FormEvent) => {
    e.preventDefault();
    handleUpdateAndSave({
      ...user,
      contactInfo: contactForm,
    });
    setShowContactInfoModal(false);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      {/* 1. Profile Header Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {/* Cover Banner */}
        <div className="h-48 bg-gradient-to-r from-blue-700 via-indigo-800 to-purple-900 relative group">
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
                className="w-32 h-32 rounded-full border-4 border-white dark:border-slate-900 object-cover shadow-lg"
              />
              <button
                onClick={() => setIsEditProfileModalOpen(true)}
                className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white font-bold text-xs"
                title="Change profile photo"
              >
                <Camera className="w-6 h-6" />
              </button>
              {user.isOpenToWork && (
                <span className="absolute bottom-1 right-1 bg-emerald-600 text-white text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ring-2 ring-white dark:ring-slate-900 shadow-xs">
                  OPEN TO WORK
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => setIsEditProfileModalOpen(true)}
                className="px-4 py-2 rounded-full text-xs font-bold bg-[#0A66C2] text-white hover:bg-[#004182] flex items-center gap-1.5 shadow-xs transition-all"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Profile</span>
              </button>

              <button
                onClick={() => setShowContactInfoModal(true)}
                className="px-4 py-2 rounded-full text-xs font-bold border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1.5 transition-all"
              >
                <Info className="w-3.5 h-3.5 text-[#0A66C2]" />
                <span>Contact Info</span>
              </button>

              <button
                onClick={handleToggleOpenToWork}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                  user.isOpenToWork
                    ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-300"
                    : "border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100"
                }`}
              >
                {user.isOpenToWork ? "Open to Work (Active)" : "Open to..."}
              </button>

              <button
                onClick={handleToggleHiring}
                className={`px-4 py-2 rounded-full text-xs font-bold border transition-all ${
                  user.isHiring
                    ? "bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-950/80 dark:text-purple-300"
                    : "border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100"
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

            <p className="text-sm text-slate-700 dark:text-slate-300 mt-1 max-w-3xl font-medium leading-normal">
              {user.headline}
            </p>

            <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 mt-2 flex-wrap">
              <span className="flex items-center gap-1 font-medium">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                {user.location}
              </span>
              <span className="font-semibold text-[#0A66C2] hover:underline cursor-pointer">
                {user.connectionsCount.toLocaleString()} connections
              </span>
              {user.company && (
                <span className="flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-300">
                  <Building className="w-3.5 h-3.5 text-blue-600" />
                  {user.company}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Filter Tabs for Profile Sections */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        <button
          onClick={() => setActiveTab("all")}
          className={`px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === "all"
              ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs"
              : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-100"
          }`}
        >
          <span>All Sections</span>
        </button>

        <button
          onClick={() => setActiveTab("jobs")}
          className={`px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === "jobs"
              ? "bg-[#0A66C2] text-white shadow-xs"
              : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-100"
          }`}
        >
          <Briefcase className="w-3.5 h-3.5" />
          <span>Jobs & Professional</span>
        </button>

        <button
          onClick={() => setActiveTab("academic")}
          className={`px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === "academic"
              ? "bg-purple-600 text-white shadow-xs"
              : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-100"
          }`}
        >
          <GraduationCap className="w-3.5 h-3.5" />
          <span>Academic & Research</span>
        </button>

        <button
          onClick={() => setActiveTab("family")}
          className={`px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === "family"
              ? "bg-rose-600 text-white shadow-xs"
              : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-100"
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Family & Personal Network</span>
        </button>

        <button
          onClick={() => setActiveTab("engagement")}
          className={`px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === "engagement"
              ? "bg-emerald-600 text-white shadow-xs"
              : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-100"
          }`}
        >
          <HandHeart className="w-3.5 h-3.5" />
          <span>Social Engagement & Causes</span>
        </button>
      </div>

      {/* 2. Featured Spotlight Section */}
      {(activeTab === "all" || activeTab === "engagement") &&
        user.featuredItems &&
        user.featuredItems.length > 0 && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                <span>Featured Spotlight</span>
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {user.featuredItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/80 p-4 space-y-2 hover:border-[#0A66C2] transition-all"
                >
                  {item.imageUrl && (
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-full h-32 object-cover rounded-lg border border-slate-200 dark:border-slate-700"
                    />
                  )}
                  <span className="text-[10px] font-bold text-[#0A66C2] uppercase tracking-wider block">
                    {item.subtitle}
                  </span>
                  <h4 className="font-bold text-xs text-slate-900 dark:text-white line-clamp-1">
                    {item.title}
                  </h4>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300 line-clamp-2">
                    {item.description}
                  </p>
                  {item.linkUrl && (
                    <a
                      href={item.linkUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-bold text-[#0A66C2] hover:underline pt-1"
                    >
                      <span>Explore Repository / Link</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

      {/* 3. Analytics & Private Dashboard Card */}
      {activeTab === "all" && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                <Eye className="w-4 h-4 text-[#0A66C2]" />
                <span>Analytics & Private Dashboard</span>
              </h3>
              <p className="text-[11px] text-slate-500">Only visible to you</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/60 flex items-center gap-3">
              <Eye className="w-6 h-6 text-[#0A66C2]" />
              <div>
                <span className="font-extrabold text-slate-900 dark:text-white text-base">
                  {user.profileViewsThisWeek}
                </span>
                <p className="text-[11px] text-slate-500 font-medium">
                  Profile views this week
                </p>
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/60 flex items-center gap-3">
              <TrendingUp className="w-6 h-6 text-emerald-600" />
              <div>
                <span className="font-extrabold text-slate-900 dark:text-white text-base">
                  1,240
                </span>
                <p className="text-[11px] text-slate-500 font-medium">
                  Post impressions
                </p>
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/60 flex items-center gap-3">
              <Search className="w-6 h-6 text-purple-600" />
              <div>
                <span className="font-extrabold text-slate-900 dark:text-white text-base">
                  {user.searchAppearances}
                </span>
                <p className="text-[11px] text-slate-500 font-medium">
                  Search appearances
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. About Section */}
      {activeTab === "all" && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#0A66C2]" />
              <span>About Summary</span>
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
                  className="px-3.5 py-1 bg-[#0A66C2] text-white text-xs font-bold rounded-full"
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
              className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 focus:outline-hidden"
            />
          ) : (
            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line font-normal">
              {user.about}
            </p>
          )}
        </div>
      )}

      {/* 5. JOBS & PROFESSIONAL DETAILS */}
      {(activeTab === "all" || activeTab === "jobs") && (
        <div className="space-y-6">
          {/* Experience Section */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                  <Briefcase className="w-4.5 h-4.5 text-[#0A66C2]" />
                  <span>Work Experience & Careers</span>
                </h3>
                <p className="text-[11px] text-slate-500">
                  Full-time roles, engineering achievements, and employment history
                </p>
              </div>
              <button
                onClick={() => setShowAddExpModal(true)}
                className="p-1.5 text-slate-500 hover:text-[#0A66C2] rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1 text-xs font-bold"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Add Position</span>
              </button>
            </div>

            <div className="space-y-6">
              {user.experiences.map((exp) => (
                <div key={exp.id} className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-slate-800 flex items-center justify-center border border-slate-200 dark:border-slate-700 text-blue-600 shrink-0">
                    <Building className="w-6 h-6" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                        {exp.title}
                      </h4>
                      <div className="flex items-center gap-2">
                        {exp.employmentType && (
                          <span className="px-2.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] font-bold rounded-full">
                            {exp.employmentType}
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => handleDeleteExperience(exp.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-md transition-colors"
                          title="Remove Experience"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <p className="text-xs text-slate-700 dark:text-slate-300 font-semibold">
                      {exp.company} • {exp.location}
                    </p>
                    <p className="text-[11px] text-slate-400 font-mono">
                      {exp.startDate} - {exp.endDate}
                    </p>
                    <p className="text-xs text-slate-600 dark:text-slate-300 pt-1 leading-relaxed">
                      {exp.description}
                    </p>

                    {exp.skillsUsed && exp.skillsUsed.length > 0 && (
                      <div className="flex items-center gap-1.5 flex-wrap pt-2">
                        <span className="text-[10px] font-bold text-slate-400">
                          Skills:
                        </span>
                        {exp.skillsUsed.map((sk, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 bg-blue-50 dark:bg-blue-950/50 text-[#0A66C2] dark:text-cyan-400 text-[10px] font-semibold rounded-md border border-blue-200 dark:border-blue-900"
                          >
                            • {sk}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Licenses & Certifications Section */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                  <BadgeCheck className="w-4.5 h-4.5 text-emerald-600" />
                  <span>Licenses & Certifications</span>
                </h3>
                <p className="text-[11px] text-slate-500">
                  Verified cloud, architecture, and developer credentials
                </p>
              </div>
              <button
                onClick={() => setShowAddCertModal(true)}
                className="p-1.5 text-slate-500 hover:text-[#0A66C2] rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1 text-xs font-bold"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Add Certification</span>
              </button>
            </div>

            <div className="space-y-4">
              {user.certifications && user.certifications.length > 0 ? (
                user.certifications.map((cert) => (
                  <div
                    key={cert.id}
                    className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700/60"
                  >
                    <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0">
                      <BadgeCheck className="w-5 h-5" />
                    </div>

                    <div className="flex-1 space-y-0.5">
                      <h4 className="font-bold text-slate-900 dark:text-white text-xs">
                        {cert.name}
                      </h4>
                      <p className="text-[11px] text-slate-600 dark:text-slate-300 font-medium">
                        {cert.issuingOrganization}
                      </p>
                      <p className="text-[10px] text-slate-400">
                        Issued {cert.issueDate}{" "}
                        {cert.expirationDate && `• Expires ${cert.expirationDate}`}
                      </p>
                      {cert.credentialId && (
                        <p className="text-[10px] text-slate-500 font-mono">
                          Credential ID: {cert.credentialId}
                        </p>
                      )}
                    </div>

                    {cert.credentialUrl && (
                      <a
                        href={cert.credentialUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1 bg-white dark:bg-slate-900 text-[#0A66C2] border border-slate-300 dark:border-slate-700 text-[10px] font-bold rounded-full hover:bg-slate-100 flex items-center gap-1"
                      >
                        <span>Show credential</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 italic">
                  No certifications added yet. Click 'Add Certification' above.
                </p>
              )}
            </div>
          </div>

          {/* Projects & Innovation Portfolio Section */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                  <FolderGit2 className="w-4.5 h-4.5 text-purple-600" />
                  <span>Projects & Innovations</span>
                </h3>
                <p className="text-[11px] text-slate-500">
                  Key open-source, architecture, and client engineering initiatives
                </p>
              </div>
              <button
                onClick={() => setShowAddProjectModal(true)}
                className="p-1.5 text-slate-500 hover:text-[#0A66C2] rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1 text-xs font-bold"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Add Project</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {user.projects && user.projects.length > 0 ? (
                user.projects.map((proj) => (
                  <div
                    key={proj.id}
                    className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/80 space-y-2 flex flex-col justify-between"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-xs text-slate-900 dark:text-white">
                          {proj.title}
                        </h4>
                        <span className="text-[10px] font-mono text-slate-400">
                          {proj.startDate} {proj.endDate ? `- ${proj.endDate}` : ""}
                        </span>
                      </div>

                      {proj.role && (
                        <p className="text-[11px] font-semibold text-purple-600 dark:text-purple-400">
                          {proj.role}
                        </p>
                      )}

                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                        {proj.description}
                      </p>
                    </div>

                    {proj.skillsUsed && (
                      <div className="flex items-center gap-1.5 flex-wrap pt-2">
                        {proj.skillsUsed.map((sk, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-[10px] font-medium rounded-md"
                          >
                            {sk}
                          </span>
                        ))}
                      </div>
                    )}

                    {proj.url && (
                      <a
                        href={proj.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-bold text-[#0A66C2] hover:underline pt-2"
                      >
                        <span>View Project Source</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 italic">
                  No projects added yet.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 6. ACADEMIC & RESEARCH DETAILS */}
      {(activeTab === "all" || activeTab === "academic") && (
        <div className="space-y-6">
          {/* Education Section */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                  <GraduationCap className="w-4.5 h-4.5 text-indigo-600" />
                  <span>Academic Qualifications & Degrees</span>
                </h3>
                <p className="text-[11px] text-slate-500">
                  Universities, degrees, coursework, and honors
                </p>
              </div>
              <button
                onClick={() => setShowAddEduModal(true)}
                className="p-1.5 text-slate-500 hover:text-[#0A66C2] rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1 text-xs font-bold"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Add Education</span>
              </button>
            </div>

            <div className="space-y-6">
              {user.education.map((edu) => (
                <div key={edu.id} className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-slate-800 flex items-center justify-center border border-slate-200 dark:border-slate-700 text-indigo-600 shrink-0">
                    <GraduationCap className="w-6 h-6" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                      {edu.school}
                    </h4>
                    <p className="text-xs text-slate-700 dark:text-slate-300 font-semibold">
                      {edu.degree}, {edu.fieldOfStudy}
                    </p>
                    <p className="text-[11px] text-slate-400 font-mono">
                      {edu.startDate} - {edu.endDate}
                    </p>

                    {edu.gpa && (
                      <p className="text-xs text-emerald-600 dark:text-emerald-400 font-bold">
                        GPA: {edu.gpa}
                      </p>
                    )}

                    {edu.activities && (
                      <p className="text-xs text-slate-600 dark:text-slate-300">
                        <strong className="text-slate-800 dark:text-slate-200">
                          Activities & Societies:
                        </strong>{" "}
                        {edu.activities}
                      </p>
                    )}

                    {edu.honors && (
                      <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                        🏆 <strong>Honors:</strong> {edu.honors}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Honors & Awards Section */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                  <Trophy className="w-4.5 h-4.5 text-amber-500" />
                  <span>Honors & Awards</span>
                </h3>
              </div>
              <button
                onClick={() => setShowAddAwardModal(true)}
                className="p-1.5 text-slate-500 hover:text-[#0A66C2] rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1 text-xs font-bold"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Add Honor</span>
              </button>
            </div>

            <div className="space-y-3">
              {user.honorsAndAwards && user.honorsAndAwards.length > 0 ? (
                user.honorsAndAwards.map((award) => (
                  <div
                    key={award.id}
                    className="p-3 bg-amber-50/50 dark:bg-amber-950/20 rounded-xl border border-amber-200 dark:border-amber-900/40 space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-xs text-slate-900 dark:text-white">
                        {award.title}
                      </h4>
                      <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400">
                        {award.issueDate}
                      </span>
                    </div>
                    <p className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                      Issued by {award.issuer}
                    </p>
                    <p className="text-xs text-slate-600 dark:text-slate-300">
                      {award.description}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 italic">
                  No honors added yet.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 7. FAMILY & PERSONAL CONNECTIONS */}
      {(activeTab === "all" || activeTab === "family") && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                <Users className="w-4.5 h-4.5 text-rose-600" />
                <span>Family & Personal Connections</span>
              </h3>
              <p className="text-[11px] text-slate-500">
                Family entrepreneurs, co-founders, advisors, and mentors
              </p>
            </div>
            <button
              onClick={() => setShowAddFamilyModal(true)}
              className="p-1.5 text-slate-500 hover:text-[#0A66C2] rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1 text-xs font-bold"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Add Personal Connection</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {user.familyConnections && user.familyConnections.length > 0 ? (
              user.familyConnections.map((fam) => (
                <div
                  key={fam.id}
                  className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/80 space-y-3 flex flex-col justify-between"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={fam.avatar}
                      alt={fam.name}
                      className="w-12 h-12 rounded-full object-cover border border-slate-200 dark:border-slate-700 shadow-xs"
                    />
                    <div>
                      <h4 className="font-bold text-xs text-slate-900 dark:text-white">
                        {fam.name}
                      </h4>
                      <span className="px-2 py-0.5 bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 text-[10px] font-bold rounded-full inline-block mt-0.5">
                        {fam.relationship}
                      </span>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-snug">
                    {fam.headline}
                  </p>

                  {fam.location && (
                    <span className="text-[10px] text-slate-400 flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {fam.location}
                    </span>
                  )}
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 italic">
                No personal connections added yet.
              </p>
            )}
          </div>
        </div>
      )}

      {/* 8. SOCIAL ENGAGEMENT, VOLUNTEER & CAUSES */}
      {(activeTab === "all" || activeTab === "engagement") && (
        <div className="space-y-6">
          {/* Volunteer Experience */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                  <HandHeart className="w-4.5 h-4.5 text-emerald-600" />
                  <span>Volunteer Experience & Community Engagement</span>
                </h3>
              </div>
              <button
                onClick={() => setShowAddVolunteerModal(true)}
                className="p-1.5 text-slate-500 hover:text-[#0A66C2] rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1 text-xs font-bold"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Add Volunteer Role</span>
              </button>
            </div>

            <div className="space-y-4">
              {user.volunteerWork && user.volunteerWork.length > 0 ? (
                user.volunteerWork.map((vol) => (
                  <div
                    key={vol.id}
                    className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/80 space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-xs text-slate-900 dark:text-white">
                        {vol.role} — {vol.organization}
                      </h4>
                      <span className="text-[10px] font-mono text-slate-400">
                        {vol.startDate} - {vol.endDate}
                      </span>
                    </div>

                    <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold rounded-full inline-block">
                      Cause: {vol.cause}
                    </span>

                    <p className="text-xs text-slate-600 dark:text-slate-300 pt-1">
                      {vol.description}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 italic">
                  No volunteer roles listed yet.
                </p>
              )}
            </div>
          </div>

          {/* Languages & Social Causes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Languages */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                  <Languages className="w-4.5 h-4.5 text-blue-600" />
                  <span>Languages</span>
                </h3>
                <button
                  onClick={() => setShowAddLanguageModal(true)}
                  className="p-1 text-slate-400 hover:text-[#0A66C2]"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2">
                {user.languages && user.languages.length > 0 ? (
                  user.languages.map((lang) => (
                    <div
                      key={lang.id}
                      className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-800/50 rounded-lg text-xs"
                    >
                      <span className="font-bold text-slate-900 dark:text-white">
                        {lang.language}
                      </span>
                      <span className="text-[11px] text-slate-500 font-medium">
                        {lang.proficiency}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 italic">
                    No languages added.
                  </p>
                )}
              </div>
            </div>

            {/* Social Causes */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                  <Heart className="w-4.5 h-4.5 text-rose-500 fill-rose-500" />
                  <span>Causes You Care About</span>
                </h3>
              </div>

              <div className="flex flex-wrap gap-2">
                {user.socialCauses && user.socialCauses.length > 0 ? (
                  user.socialCauses.map((cause, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1.5 bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-200 border border-rose-200 dark:border-rose-900/50 rounded-full text-xs font-semibold"
                    >
                      ❤️ {cause}
                    </span>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 italic">
                    No causes listed.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 9. SKILLS & ENDORSEMENTS */}
      {(activeTab === "all" || activeTab === "jobs") && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                <Sparkles className="w-4.5 h-4.5 text-[#0A66C2]" />
                <span>Skills & Endorsements</span>
              </h3>
              <p className="text-[11px] text-slate-500">
                Core competencies, technical expertise, and peer endorsements
              </p>
            </div>
            <button
              onClick={() => setShowAddSkillModal(true)}
              className="p-1.5 text-slate-500 hover:text-[#0A66C2] rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1 text-xs font-bold"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Add Skill</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {user.skills && user.skills.length > 0 ? (
              user.skills.map((skill) => (
                <div
                  key={skill.id}
                  className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/60 flex items-center justify-between gap-2"
                >
                  <div className="flex-1 min-w-0">
                    <h5 className="font-bold text-slate-900 dark:text-white text-xs truncate">
                      {skill.name}
                    </h5>
                    <p className="text-[10px] text-slate-500 font-medium">
                      {skill.endorsementsCount}{" "}
                      {skill.endorsementsCount === 1
                        ? "endorsement"
                        : "endorsements"}
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => handleEndorseSkill(skill.id)}
                      className={`px-2.5 py-1 rounded-full text-xs font-bold transition-colors ${
                        skill.endorsedByMe
                          ? "bg-[#0A66C2] text-white shadow-xs"
                          : "border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                      }`}
                    >
                      {skill.endorsedByMe ? "Endorsed" : "Endorse"}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(skill.id)}
                      className="p-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-md transition-colors"
                      title="Remove Skill"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 italic col-span-full">
                No skills added yet. Click 'Add Skill' above to showcase your expertise.
              </p>
            )}
          </div>
        </div>
      )}

      {/* 10. RECOMMENDATIONS */}
      {activeTab === "all" &&
        user.recommendations &&
        user.recommendations.length > 0 && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-4">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-[#0A66C2]" />
              <span>Recommendations</span>
            </h3>

            <div className="space-y-4">
              {user.recommendations.map((rec) => (
                <div key={rec.id} className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl space-y-2 border border-slate-200 dark:border-slate-700/60">
                  <div className="flex items-center gap-3">
                    <img
                      src={rec.authorAvatar}
                      alt={rec.authorName}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div>
                      <h4 className="font-bold text-xs text-slate-900 dark:text-white">
                        {rec.authorName}
                      </h4>
                      <p className="text-[10px] text-slate-500">
                        {rec.authorHeadline} • {rec.relationship}
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-slate-700 dark:text-slate-300 italic">
                    "{rec.text}"
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

      {/* Contact Info Modal */}
      {showContactInfoModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <Info className="w-4 h-4 text-[#0A66C2]" />
                <span>Contact Details & Online Profiles</span>
              </h3>
              <button
                onClick={() => setShowContactInfoModal(false)}
                className="p-1 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveContactInfo} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold block mb-1 flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-blue-600" /> Email Address
                </label>
                <input
                  type="email"
                  value={contactForm.email || ""}
                  onChange={(e) =>
                    setContactForm({ ...contactForm, email: e.target.value })
                  }
                  className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-300 dark:border-slate-700"
                />
              </div>

              <div>
                <label className="font-semibold block mb-1 flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-emerald-600" /> Phone Number
                </label>
                <input
                  type="text"
                  value={contactForm.phone || ""}
                  onChange={(e) =>
                    setContactForm({ ...contactForm, phone: e.target.value })
                  }
                  className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-300 dark:border-slate-700"
                />
              </div>

              <div>
                <label className="font-semibold block mb-1 flex items-center gap-1">
                  <Globe className="w-3.5 h-3.5 text-purple-600" /> Portfolio Website
                </label>
                <input
                  type="text"
                  value={contactForm.website || ""}
                  onChange={(e) =>
                    setContactForm({ ...contactForm, website: e.target.value })
                  }
                  className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-300 dark:border-slate-700"
                />
              </div>

              <div>
                <label className="font-semibold block mb-1 flex items-center gap-1">
                  <Github className="w-3.5 h-3.5" /> GitHub Profile
                </label>
                <input
                  type="text"
                  value={contactForm.github || ""}
                  onChange={(e) =>
                    setContactForm({ ...contactForm, github: e.target.value })
                  }
                  className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-300 dark:border-slate-700"
                />
              </div>

              <div>
                <label className="font-semibold block mb-1 flex items-center gap-1">
                  <Twitter className="w-3.5 h-3.5 text-cyan-500" /> Twitter / X
                </label>
                <input
                  type="text"
                  value={contactForm.twitter || ""}
                  onChange={(e) =>
                    setContactForm({ ...contactForm, twitter: e.target.value })
                  }
                  className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-300 dark:border-slate-700"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-[#0A66C2] text-white font-bold rounded-lg text-xs mt-2"
              >
                Save Contact Info
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Add Experience Modal */}
      {showAddExpModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleAddExperienceSubmit}
            className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4"
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
                <label className="font-semibold block mb-1">Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Senior Software Architect"
                  value={expForm.title}
                  onChange={(e) =>
                    setExpForm({ ...expForm, title: e.target.value })
                  }
                  className="w-full px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700"
                />
              </div>

              <div>
                <label className="font-semibold block mb-1">Company *</label>
                <input
                  type="text"
                  required
                  placeholder="Company Name"
                  value={expForm.company}
                  onChange={(e) =>
                    setExpForm({ ...expForm, company: e.target.value })
                  }
                  className="w-full px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold block mb-1">Start Date</label>
                  <input
                    type="text"
                    value={expForm.startDate}
                    onChange={(e) =>
                      setExpForm({ ...expForm, startDate: e.target.value })
                    }
                    className="w-full px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1">End Date</label>
                  <input
                    type="text"
                    value={expForm.endDate}
                    onChange={(e) =>
                      setExpForm({ ...expForm, endDate: e.target.value })
                    }
                    className="w-full px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold block mb-1">Description</label>
                <textarea
                  rows={3}
                  value={expForm.description}
                  onChange={(e) =>
                    setExpForm({ ...expForm, description: e.target.value })
                  }
                  className="w-full p-2 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700"
                />
              </div>

              <div>
                <label className="font-semibold block mb-1">
                  Skills Used (comma-separated)
                </label>
                <input
                  type="text"
                  placeholder="TypeScript, React, Flutter, Docker"
                  value={expForm.skillsUsedStr}
                  onChange={(e) =>
                    setExpForm({ ...expForm, skillsUsedStr: e.target.value })
                  }
                  className="w-full px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-[#0A66C2] text-white font-bold rounded-lg text-xs"
            >
              Save Experience
            </button>
          </form>
        </div>
      )}

      {/* Add Education Modal */}
      {showAddEduModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleAddEducationSubmit}
            className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Add Academic Education
              </h3>
              <button
                type="button"
                onClick={() => setShowAddEduModal(false)}
                className="p-1 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold block mb-1">
                  University / Institution *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Stanford University"
                  value={eduForm.school}
                  onChange={(e) =>
                    setEduForm({ ...eduForm, school: e.target.value })
                  }
                  className="w-full px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg border"
                />
              </div>

              <div>
                <label className="font-semibold block mb-1">Degree</label>
                <input
                  type="text"
                  value={eduForm.degree}
                  onChange={(e) =>
                    setEduForm({ ...eduForm, degree: e.target.value })
                  }
                  className="w-full px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg border"
                />
              </div>

              <div>
                <label className="font-semibold block mb-1">
                  Field of Study *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Computer Science & AI"
                  value={eduForm.fieldOfStudy}
                  onChange={(e) =>
                    setEduForm({ ...eduForm, fieldOfStudy: e.target.value })
                  }
                  className="w-full px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg border"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold block mb-1">GPA / Grade</label>
                  <input
                    type="text"
                    placeholder="e.g. 3.9 / 4.0"
                    value={eduForm.gpa}
                    onChange={(e) =>
                      setEduForm({ ...eduForm, gpa: e.target.value })
                    }
                    className="w-full px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg border"
                  />
                </div>
                <div>
                  <label className="font-semibold block mb-1">
                    Dates (e.g. 2020 - 2024)
                  </label>
                  <input
                    type="text"
                    value={`${eduForm.startDate} - ${eduForm.endDate}`}
                    onChange={(e) => {
                      const parts = e.target.value.split("-");
                      setEduForm({
                        ...eduForm,
                        startDate: parts[0] ? parts[0].trim() : "",
                        endDate: parts[1] ? parts[1].trim() : "Present",
                      });
                    }}
                    className="w-full px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg border"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-[#0A66C2] text-white font-bold rounded-lg text-xs"
            >
              Save Education
            </button>
          </form>
        </div>
      )}

      {/* Add Certification Modal */}
      {showAddCertModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleAddCertSubmit}
            className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Add License or Certification
              </h3>
              <button
                type="button"
                onClick={() => setShowAddCertModal(false)}
                className="p-1 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold block mb-1">
                  Certification Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. AWS Certified Solutions Architect"
                  value={certForm.name}
                  onChange={(e) =>
                    setCertForm({ ...certForm, name: e.target.value })
                  }
                  className="w-full px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg border"
                />
              </div>

              <div>
                <label className="font-semibold block mb-1">
                  Issuing Organization *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Amazon Web Services"
                  value={certForm.issuingOrganization}
                  onChange={(e) =>
                    setCertForm({
                      ...certForm,
                      issuingOrganization: e.target.value,
                    })
                  }
                  className="w-full px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg border"
                />
              </div>

              <div>
                <label className="font-semibold block mb-1">
                  Credential ID
                </label>
                <input
                  type="text"
                  placeholder="AWS-PSA-908214"
                  value={certForm.credentialId}
                  onChange={(e) =>
                    setCertForm({ ...certForm, credentialId: e.target.value })
                  }
                  className="w-full px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg border"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-[#0A66C2] text-white font-bold rounded-lg text-xs"
            >
              Save Certification
            </button>
          </form>
        </div>
      )}

      {/* Add Project Modal */}
      {showAddProjectModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleAddProjectSubmit}
            className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Add Project / Innovation
              </h3>
              <button
                type="button"
                onClick={() => setShowAddProjectModal(false)}
                className="p-1 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold block mb-1">Project Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. AI-Powered Code Auditor"
                  value={projForm.title}
                  onChange={(e) =>
                    setProjForm({ ...projForm, title: e.target.value })
                  }
                  className="w-full px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg border"
                />
              </div>

              <div>
                <label className="font-semibold block mb-1">Role</label>
                <input
                  type="text"
                  placeholder="e.g. Creator & Lead Developer"
                  value={projForm.role}
                  onChange={(e) =>
                    setProjForm({ ...projForm, role: e.target.value })
                  }
                  className="w-full px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg border"
                />
              </div>

              <div>
                <label className="font-semibold block mb-1">Description</label>
                <textarea
                  rows={3}
                  value={projForm.description}
                  onChange={(e) =>
                    setProjForm({ ...projForm, description: e.target.value })
                  }
                  className="w-full p-2 bg-slate-100 dark:bg-slate-800 rounded-lg border"
                />
              </div>

              <div>
                <label className="font-semibold block mb-1">Project Link URL</label>
                <input
                  type="text"
                  placeholder="https://github.com/myrepo"
                  value={projForm.url}
                  onChange={(e) =>
                    setProjForm({ ...projForm, url: e.target.value })
                  }
                  className="w-full px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg border"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-[#0A66C2] text-white font-bold rounded-lg text-xs"
            >
              Save Project
            </button>
          </form>
        </div>
      )}

      {/* Add Family / Personal Connection Modal */}
      {showAddFamilyModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleAddFamilySubmit}
            className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Add Family / Personal Connection
              </h3>
              <button
                type="button"
                onClick={() => setShowAddFamilyModal(false)}
                className="p-1 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold block mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Elena Rivera"
                  value={familyForm.name}
                  onChange={(e) =>
                    setFamilyForm({ ...familyForm, name: e.target.value })
                  }
                  className="w-full px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg border"
                />
              </div>

              <div>
                <label className="font-semibold block mb-1">
                  Relationship / Role *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sister & Co-founder, Academic Advisor"
                  value={familyForm.relationship}
                  onChange={(e) =>
                    setFamilyForm({
                      ...familyForm,
                      relationship: e.target.value,
                    })
                  }
                  className="w-full px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg border"
                />
              </div>

              <div>
                <label className="font-semibold block mb-1">Headline</label>
                <input
                  type="text"
                  placeholder="e.g. Co-Founder @ ArtisanTech"
                  value={familyForm.headline}
                  onChange={(e) =>
                    setFamilyForm({ ...familyForm, headline: e.target.value })
                  }
                  className="w-full px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg border"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-rose-600 text-white font-bold rounded-lg text-xs"
            >
              Add Connection
            </button>
          </form>
        </div>
      )}

      {/* Add Volunteer Experience Modal */}
      {showAddVolunteerModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleAddVolunteerSubmit}
            className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Add Volunteer Role
              </h3>
              <button
                type="button"
                onClick={() => setShowAddVolunteerModal(false)}
                className="p-1 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold block mb-1">
                  Organization *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Girls Who Code"
                  value={volForm.organization}
                  onChange={(e) =>
                    setVolForm({ ...volForm, organization: e.target.value })
                  }
                  className="w-full px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg border"
                />
              </div>

              <div>
                <label className="font-semibold block mb-1">Role</label>
                <input
                  type="text"
                  placeholder="e.g. Senior Mentor"
                  value={volForm.role}
                  onChange={(e) =>
                    setVolForm({ ...volForm, role: e.target.value })
                  }
                  className="w-full px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg border"
                />
              </div>

              <div>
                <label className="font-semibold block mb-1">Description</label>
                <textarea
                  rows={3}
                  value={volForm.description}
                  onChange={(e) =>
                    setVolForm({ ...volForm, description: e.target.value })
                  }
                  className="w-full p-2 bg-slate-100 dark:bg-slate-800 rounded-lg border"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-emerald-600 text-white font-bold rounded-lg text-xs"
            >
              Save Volunteer Role
            </button>
          </form>
        </div>
      )}

      {/* Add Award Modal */}
      {showAddAwardModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleAddAwardSubmit}
            className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Add Honor or Award
              </h3>
              <button
                type="button"
                onClick={() => setShowAddAwardModal(false)}
                className="p-1 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold block mb-1">Award Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Bay Area Tech Innovator 2025"
                  value={awardForm.title}
                  onChange={(e) =>
                    setAwardForm({ ...awardForm, title: e.target.value })
                  }
                  className="w-full px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg border"
                />
              </div>

              <div>
                <label className="font-semibold block mb-1">Issuer</label>
                <input
                  type="text"
                  placeholder="e.g. Engineering Council"
                  value={awardForm.issuer}
                  onChange={(e) =>
                    setAwardForm({ ...awardForm, issuer: e.target.value })
                  }
                  className="w-full px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg border"
                />
              </div>

              <div>
                <label className="font-semibold block mb-1">Description</label>
                <textarea
                  rows={2}
                  value={awardForm.description}
                  onChange={(e) =>
                    setAwardForm({ ...awardForm, description: e.target.value })
                  }
                  className="w-full p-2 bg-slate-100 dark:bg-slate-800 rounded-lg border"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-amber-500 text-white font-bold rounded-lg text-xs"
            >
              Save Honor
            </button>
          </form>
        </div>
      )}

      {/* Add Language Modal */}
      {showAddLanguageModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleAddLanguageSubmit}
            className="bg-white dark:bg-slate-900 rounded-2xl max-w-sm w-full border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Add Language
              </h3>
              <button
                type="button"
                onClick={() => setShowAddLanguageModal(false)}
                className="p-1 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold block mb-1">Language *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Spanish, French, Mandarin"
                  value={langForm.language}
                  onChange={(e) =>
                    setLangForm({ ...langForm, language: e.target.value })
                  }
                  className="w-full px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg border"
                />
              </div>

              <div>
                <label className="font-semibold block mb-1">Proficiency</label>
                <select
                  value={langForm.proficiency}
                  onChange={(e) =>
                    setLangForm({
                      ...langForm,
                      proficiency: e.target.value as any,
                    })
                  }
                  className="w-full px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg border"
                >
                  <option value="Native or bilingual">
                    Native or bilingual
                  </option>
                  <option value="Full professional">Full professional</option>
                  <option value="Professional working">
                    Professional working
                  </option>
                  <option value="Elementary">Elementary</option>
                  <option value="Limited working">Limited working</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2 bg-[#0A66C2] text-white font-bold rounded-lg text-xs"
            >
              Add Language
            </button>
          </form>
        </div>
      )}

      {/* Add Skill Modal */}
      {showAddSkillModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleAddSkillSubmit}
            className="bg-white dark:bg-slate-900 rounded-2xl max-w-sm w-full border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#0A66C2]" />
                <span>Add Professional Skill</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowAddSkillModal(false)}
                className="p-1 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold block mb-1 text-slate-700 dark:text-slate-300">
                  Skill Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. TypeScript, System Architecture, GraphQL"
                  value={newSkillName}
                  onChange={(e) => setNewSkillName(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden focus:border-[#0A66C2]"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2 bg-[#0A66C2] hover:bg-[#004182] text-white font-bold rounded-lg text-xs transition-colors shadow-xs"
            >
              Add Skill
            </button>
          </form>
        </div>
      )}

      {/* Edit Profile Modal Component */}
      <EditProfileModal
        isOpen={isEditProfileModalOpen}
        onClose={() => setIsEditProfileModalOpen(false)}
        currentUser={user}
        onSave={(updated) => handleUpdateAndSave(updated)}
      />
    </div>
  );
};
