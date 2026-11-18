import React, { useState } from "react";
import {
  Briefcase,
  MapPin,
  Search,
  Bookmark,
  Sparkles,
  CheckCircle2,
  X,
  FileText,
  Building,
  DollarSign,
  Loader2,
  Send,
  Plus,
  BarChart2,
  TrendingUp,
  Award,
  Users,
  Calendar,
  Filter,
  ArrowUpRight,
  ShieldCheck,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell,
  ComposedChart,
  Line,
} from "recharts";
import { Job, User } from "../types";
import { initialJobs } from "../data/mockData";

interface JobsViewProps {
  currentUser: User;
}

// Analytics Mock Datasets
const applicationTrendsData = [
  { month: "Jan 2026", applications: 18, interviews: 4, offers: 1, techVolume: 12, finTechVolume: 4, healthVolume: 2 },
  { month: "Feb 2026", applications: 24, interviews: 6, offers: 2, techVolume: 15, finTechVolume: 6, healthVolume: 3 },
  { month: "Mar 2026", applications: 32, interviews: 9, offers: 2, techVolume: 20, finTechVolume: 8, healthVolume: 4 },
  { month: "Apr 2026", applications: 28, interviews: 8, offers: 3, techVolume: 18, finTechVolume: 7, healthVolume: 3 },
  { month: "May 2026", applications: 42, interviews: 12, offers: 4, techVolume: 26, finTechVolume: 10, healthVolume: 6 },
  { month: "Jun 2026", applications: 38, interviews: 11, offers: 3, techVolume: 22, finTechVolume: 11, healthVolume: 5 },
  { month: "Jul 2026", applications: 50, interviews: 16, offers: 5, techVolume: 30, finTechVolume: 14, healthVolume: 6 },
  { month: "Aug 2026", applications: 58, interviews: 19, offers: 6, techVolume: 35, finTechVolume: 16, healthVolume: 7 },
];

const salaryRangesDataBySeniority: Record<
  string,
  Array<{ role: string; minSalary: number; medianSalary: number; maxSalary: number; bonus: number }>
> = {
  Senior: [
    { role: "Mobile Eng (Flutter/iOS)", minSalary: 145, medianSalary: 175, maxSalary: 215, bonus: 25 },
    { role: "Full-Stack Architect", minSalary: 160, medianSalary: 195, maxSalary: 240, bonus: 30 },
    { role: "AI / ML Engineer", minSalary: 170, medianSalary: 210, maxSalary: 265, bonus: 35 },
    { role: "DevOps / SRE Lead", minSalary: 150, medianSalary: 180, maxSalary: 220, bonus: 22 },
    { role: "Staff Product Designer", minSalary: 135, medianSalary: 165, maxSalary: 200, bonus: 20 },
    { role: "Data Science Lead", minSalary: 165, medianSalary: 205, maxSalary: 250, bonus: 32 },
  ],
  Lead: [
    { role: "Mobile Eng (Flutter/iOS)", minSalary: 170, medianSalary: 205, maxSalary: 250, bonus: 35 },
    { role: "Full-Stack Architect", minSalary: 185, medianSalary: 225, maxSalary: 280, bonus: 42 },
    { role: "AI / ML Engineer", minSalary: 200, medianSalary: 250, maxSalary: 320, bonus: 50 },
    { role: "DevOps / SRE Lead", minSalary: 175, medianSalary: 210, maxSalary: 255, bonus: 30 },
    { role: "Staff Product Designer", minSalary: 160, medianSalary: 190, maxSalary: 230, bonus: 28 },
    { role: "Data Science Lead", minSalary: 195, medianSalary: 240, maxSalary: 300, bonus: 45 },
  ],
  "Mid-Level": [
    { role: "Mobile Eng (Flutter/iOS)", minSalary: 115, medianSalary: 140, maxSalary: 165, bonus: 15 },
    { role: "Full-Stack Architect", minSalary: 125, medianSalary: 150, maxSalary: 180, bonus: 18 },
    { role: "AI / ML Engineer", minSalary: 130, medianSalary: 160, maxSalary: 195, bonus: 20 },
    { role: "DevOps / SRE Lead", minSalary: 118, medianSalary: 142, maxSalary: 170, bonus: 14 },
    { role: "Staff Product Designer", minSalary: 105, medianSalary: 130, maxSalary: 155, bonus: 12 },
    { role: "Data Science Lead", minSalary: 130, medianSalary: 160, maxSalary: 195, bonus: 22 },
  ],
};

const skillDemandData = [
  { skill: "Flutter / Dart", jobCount: 420, avgSalary: 172, growth: "+28%", color: "#0A66C2" },
  { skill: "React / TypeScript", jobCount: 890, avgSalary: 168, growth: "+22%", color: "#06B6D4" },
  { skill: "Python / AI Engineering", jobCount: 750, avgSalary: 195, growth: "+45%", color: "#8B5CF6" },
  { skill: "Node.js / Express", jobCount: 610, avgSalary: 160, growth: "+18%", color: "#10B981" },
  { skill: "Keycloak / OIDC Security", jobCount: 310, avgSalary: 182, growth: "+34%", color: "#F59E0B" },
];

export const JobsView: React.FC<JobsViewProps> = ({ currentUser }) => {
  const [jobs, setJobs] = useState<Job[]>(initialJobs);
  const [selectedJob, setSelectedJob] = useState<Job>(jobs[0]);
  const [searchQuery, setSearchQuery] = useState("");
  const [locationTypeFilter, setLocationTypeFilter] = useState<string>("All");

  // Tab State: Explore vs Analytics
  const [mainTab, setMainTab] = useState<"explore" | "analytics">("explore");
  const [selectedSeniority, setSelectedSeniority] = useState<"Senior" | "Lead" | "Mid-Level">("Senior");
  const [selectedIndustry, setSelectedIndustry] = useState<"All" | "Software Tech" | "FinTech" | "HealthTech">("All");

  // Easy Apply Modal
  const [showApplyModal, setShowApplyModal] = useState(false);

  // AI Match Modal / Drawer
  const [showAiMatch, setShowAiMatch] = useState(false);
  const [aiMatchLoading, setAiMatchLoading] = useState(false);
  const [aiMatchResult, setAiMatchResult] = useState<{
    matchScore?: number;
    pros?: string[];
    suggestions?: string[];
    coverLetter?: string;
  } | null>(null);

  // Post a Job Modal
  const [showPostJobModal, setShowPostJobModal] = useState(false);
  const [newJobTitle, setNewJobTitle] = useState("");
  const [newJobCompany, setNewJobCompany] = useState("");
  const [newJobLocation, setNewJobLocation] = useState("San Francisco, CA");
  const [newJobType, setNewJobType] = useState<"Remote" | "Hybrid" | "On-site">("Remote");
  const [newJobSkills, setNewJobSkills] = useState("Flutter, React, TypeScript, Node.js");
  const [newJobDesc, setNewJobDesc] = useState("");
  const [isAiDescLoading, setIsAiDescLoading] = useState(false);

  const filteredJobs = jobs.filter((job) => {
    const matchesQuery =
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.skillsRequired.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesLoc =
      locationTypeFilter === "All" || job.locationType === locationTypeFilter;
    return matchesQuery && matchesLoc;
  });

  const handleToggleSave = (jobId: string) => {
    setJobs(
      jobs.map((j) => (j.id === jobId ? { ...j, isSaved: !j.isSaved } : j))
    );
    if (selectedJob.id === jobId) {
      setSelectedJob({ ...selectedJob, isSaved: !selectedJob.isSaved });
    }
  };

  const handleRunAiMatch = async () => {
    setAiMatchLoading(true);
    setShowAiMatch(true);
    try {
      const res = await fetch("/api/gemini/job-assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "match_resume",
          jobTitle: selectedJob.title,
          company: selectedJob.company,
          skills: selectedJob.skillsRequired.join(", "),
        }),
      });
      const data = await res.json();
      setAiMatchResult(data);
    } catch (err) {
      console.error("AI Job Match Error:", err);
    } finally {
      setAiMatchLoading(false);
    }
  };

  const handleGenerateJobDescWithAi = async () => {
    if (!newJobTitle) return;
    setIsAiDescLoading(true);
    try {
      const res = await fetch("/api/gemini/job-assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "generate_desc",
          jobTitle: newJobTitle,
          company: newJobCompany || "TechCorp",
          skills: newJobSkills,
        }),
      });
      const data = await res.json();
      if (data.result) {
        setNewJobDesc(data.result);
      }
    } catch (err) {
      console.error("AI job description generation failed", err);
    } finally {
      setIsAiDescLoading(false);
    }
  };

  const handlePostJobSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newJobTitle) return;

    const createdJob: Job = {
      id: `job_${Date.now()}`,
      title: newJobTitle,
      company: newJobCompany || "Apex Innovations",
      companyLogo: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=120",
      location: newJobLocation,
      locationType: newJobType,
      employmentType: "Full-time",
      salaryRange: "$150,000 - $200,000 / year",
      postedAt: "Just now",
      applicantsCount: 1,
      easyApply: true,
      description: newJobDesc || "We are hiring for this exciting technical role!",
      requirements: ["Strong proficiency in required skills", "Great collaboration"],
      skillsRequired: newJobSkills.split(",").map((s) => s.trim()),
    };

    setJobs([createdJob, ...jobs]);
    setSelectedJob(createdJob);
    setShowPostJobModal(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Top Header & Navigation Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="font-bold text-slate-900 dark:text-white text-lg flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-[#0A66C2]" />
              <span>Jobs & Career Opportunities</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Explore open roles, analyze industry salary trends, and track your application funnel.
            </p>
          </div>

          <button
            onClick={() => setShowPostJobModal(true)}
            className="bg-[#0A66C2] hover:bg-[#004182] text-white text-xs font-bold px-4 py-2 rounded-full flex items-center gap-1.5 shadow-xs transition-colors self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Post a Free Job</span>
          </button>
        </div>

        {/* Sub Navigation Tabs: Explore vs Analytics */}
        <div className="flex items-center gap-2 border-t border-slate-100 dark:border-slate-800 pt-3">
          <button
            onClick={() => setMainTab("explore")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              mainTab === "explore"
                ? "bg-[#0A66C2] text-white shadow-xs"
                : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
            }`}
          >
            <Briefcase className="w-4 h-4" />
            <span>Explore Jobs</span>
          </button>

          <button
            onClick={() => setMainTab("analytics")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              mainTab === "analytics"
                ? "bg-[#0A66C2] text-white shadow-xs"
                : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
            }`}
          >
            <BarChart2 className="w-4 h-4 text-emerald-400" />
            <span>Job Analytics & Market Trends</span>
          </button>
        </div>

        {/* Filter Controls for Explore Tab */}
        {mainTab === "explore" && (
          <div className="flex flex-col md:flex-row items-center gap-3 pt-2">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by job title, company, or skills (e.g. Flutter, React)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs rounded-lg border border-slate-200 dark:border-slate-700 focus:outline-hidden focus:border-[#0A66C2]"
              />
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
              {["All", "Remote", "Hybrid", "On-site"].map((loc) => (
                <button
                  key={loc}
                  onClick={() => setLocationTypeFilter(loc)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                    locationTypeFilter === loc
                      ? "bg-[#0A66C2] text-white"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200"
                  }`}
                >
                  {loc}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* TAB 1: EXPLORE JOBS VIEW */}
      {mainTab === "explore" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Job Postings List */}
          <div className="lg:col-span-5 space-y-3 max-h-[800px] overflow-y-auto pr-1">
            {filteredJobs.length > 0 ? (
              filteredJobs.map((job) => {
                const isSelected = selectedJob?.id === job.id;
                return (
                  <div
                    key={job.id}
                    onClick={() => setSelectedJob(job)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? "bg-blue-50/70 dark:bg-blue-950/40 border-[#0A66C2] shadow-xs"
                        : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <img
                        src={job.companyLogo}
                        alt={job.company}
                        className="w-12 h-12 rounded-lg object-cover border border-slate-200 dark:border-slate-700"
                      />
                      <div className="flex-1">
                        <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                          {job.title}
                        </h4>
                        <p className="text-xs text-slate-600 dark:text-slate-300">
                          {job.company}
                        </p>

                        <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {job.location} ({job.locationType})
                          </span>
                        </div>

                        {job.salaryRange && (
                          <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mt-1">
                            {job.salaryRange}
                          </p>
                        )}

                        <div className="flex items-center justify-between mt-3 text-[10px] text-slate-400">
                          <span>{job.postedAt} • {job.applicantsCount} applicants</span>
                          {job.easyApply && (
                            <span className="text-[#0A66C2] font-bold">⚡ Easy Apply</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                <p className="text-xs text-slate-500">No jobs match your query.</p>
              </div>
            )}
          </div>

          {/* Right Column: Selected Job Details & AI Match */}
          <div className="lg:col-span-7">
            {selectedJob ? (
              <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-2xs space-y-6 sticky top-20">
                {/* Job Header */}
                <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-5">
                  <div className="flex items-start gap-4">
                    <img
                      src={selectedJob.companyLogo}
                      alt={selectedJob.company}
                      className="w-16 h-16 rounded-xl object-cover border border-slate-200 dark:border-slate-700"
                    />
                    <div>
                      <h3 className="font-extrabold text-slate-900 dark:text-white text-lg">
                        {selectedJob.title}
                      </h3>
                      <p className="text-xs font-semibold text-[#0A66C2] dark:text-[#378FE9] mt-0.5">
                        {selectedJob.company}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        {selectedJob.location} • {selectedJob.locationType} • {selectedJob.employmentType}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleToggleSave(selectedJob.id)}
                    className={`p-2 rounded-full border transition-colors ${
                      selectedJob.isSaved
                        ? "bg-blue-50 border-[#0A66C2] text-[#0A66C2]"
                        : "border-slate-300 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                    }`}
                    title="Save Job"
                  >
                    <Bookmark className={`w-5 h-5 ${selectedJob.isSaved ? "fill-current" : ""}`} />
                  </button>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-3 flex-wrap">
                  <button
                    onClick={() => setShowApplyModal(true)}
                    className="bg-[#0A66C2] hover:bg-[#004182] text-white text-xs font-bold px-6 py-2.5 rounded-full shadow-xs transition-colors flex items-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    <span>Easy Apply</span>
                  </button>

                  <button
                    onClick={handleRunAiMatch}
                    className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-xs font-bold px-4 py-2.5 rounded-full shadow-xs transition-all flex items-center gap-2"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>AI Resume Match & Cover Letter</span>
                  </button>
                </div>

                {/* Required Skills Badges */}
                <div>
                  <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-2">
                    Skills & Qualifications
                  </h5>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedJob.skillsRequired.map((s, i) => (
                      <span
                        key={i}
                        className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium px-2.5 py-1 rounded-md"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Job Description */}
                <div className="space-y-3 pt-2">
                  <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    About the job
                  </h5>
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                    {selectedJob.description}
                  </p>

                  {selectedJob.requirements && selectedJob.requirements.length > 0 && (
                    <div className="mt-4 space-y-2">
                      <h6 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        Key Requirements:
                      </h6>
                      <ul className="list-disc list-inside space-y-1 text-xs text-slate-600 dark:text-slate-400">
                        {selectedJob.requirements.map((req, idx) => (
                          <li key={idx}>{req}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                <p className="text-xs text-slate-500">Select a job posting to view details.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: ANALYTICS & MARKET TRENDS VIEW */}
      {mainTab === "analytics" && (
        <div className="space-y-6">
          {/* Key Analytics KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-2">
              <div className="flex items-center justify-between text-xs font-medium text-slate-500">
                <span>Applied Jobs Tracked</span>
                <div className="p-2 bg-blue-50 dark:bg-blue-950/50 text-[#0A66C2] rounded-xl">
                  <Send className="w-4 h-4" />
                </div>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-black text-slate-900 dark:text-white">58</span>
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
                  <TrendingUp className="w-3.5 h-3.5" />
                  +26% MoM
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Total job applications submitted this quarter</p>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-2">
              <div className="flex items-center justify-between text-xs font-medium text-slate-500">
                <span>Interview Call Rate</span>
                <div className="p-2 bg-purple-50 dark:bg-purple-950/50 text-purple-600 rounded-xl">
                  <Users className="w-4 h-4" />
                </div>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-black text-slate-900 dark:text-white">32.7%</span>
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
                  <TrendingUp className="w-3.5 h-3.5" />
                  Top 10%
                </span>
              </div>
              <p className="text-[11px] text-slate-400">19 interviews scheduled from 58 applications</p>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-2">
              <div className="flex items-center justify-between text-xs font-medium text-slate-500">
                <span>Industry Median Salary</span>
                <div className="p-2 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 rounded-xl">
                  <DollarSign className="w-4 h-4" />
                </div>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-black text-slate-900 dark:text-white">$185,000</span>
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
                  <TrendingUp className="w-3.5 h-3.5" />
                  +$15k
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Senior Level tech engineering benchmark</p>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-2">
              <div className="flex items-center justify-between text-xs font-medium text-slate-500">
                <span>Highest Growth Skill</span>
                <div className="p-2 bg-amber-50 dark:bg-amber-950/50 text-amber-600 rounded-xl">
                  <Award className="w-4 h-4" />
                </div>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-xl font-extrabold text-slate-900 dark:text-white">AI Engineering</span>
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  +45% YoY
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Average base $195,000 + equity packages</p>
            </div>
          </div>

          {/* CHART 1: APPLIED JOBS TRENDS */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-[#0A66C2]" />
                  <span>Applied Jobs & Funnel Conversion Trends</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Monthly history of job applications submitted, interviews generated, and offer extensions
                </p>
              </div>

              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-400 font-medium">Sector Filter:</span>
                {["All", "Software Tech", "FinTech", "HealthTech"].map((ind) => (
                  <button
                    key={ind}
                    onClick={() => setSelectedIndustry(ind as any)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                      selectedIndustry === ind
                        ? "bg-[#0A66C2] text-white"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200"
                    }`}
                  >
                    {ind}
                  </button>
                ))}
              </div>
            </div>

            <div className="h-80 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={applicationTrendsData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorApplications" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0A66C2" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#0A66C2" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="colorInterviews" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="colorOffers" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                  <XAxis dataKey="month" stroke="#94A3B8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(15, 23, 42, 0.9)",
                      borderColor: "#334155",
                      borderRadius: "12px",
                      color: "#F8FAFC",
                      fontSize: "12px",
                      boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.3)",
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }} />
                  <Area
                    type="monotone"
                    dataKey={
                      selectedIndustry === "Software Tech"
                        ? "techVolume"
                        : selectedIndustry === "FinTech"
                        ? "finTechVolume"
                        : selectedIndustry === "HealthTech"
                        ? "healthVolume"
                        : "applications"
                    }
                    name="Applications Sent"
                    stroke="#0A66C2"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorApplications)"
                  />
                  <Area
                    type="monotone"
                    dataKey="interviews"
                    name="Interviews Scheduled"
                    stroke="#8B5CF6"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorInterviews)"
                  />
                  <Area
                    type="monotone"
                    dataKey="offers"
                    name="Offers Received"
                    stroke="#10B981"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorOffers)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* CHART 2: SALARY RANGES BASED ON INDUSTRY DATA */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-emerald-600" />
                  <span>Industry Salary Ranges ($K / year)</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Min, Median, and Max base salary benchmarks derived from verified industry market data
                </p>
              </div>

              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-400 font-medium">Seniority Level:</span>
                {(["Senior", "Lead", "Mid-Level"] as const).map((lvl) => (
                  <button
                    key={lvl}
                    onClick={() => setSelectedSeniority(lvl)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                      selectedSeniority === lvl
                        ? "bg-emerald-600 text-white shadow-xs"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200"
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            <div className="h-80 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={salaryRangesDataBySeniority[selectedSeniority]}
                  margin={{ top: 10, right: 10, left: -10, bottom: 40 }}
                >
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                  <XAxis
                    dataKey="role"
                    stroke="#94A3B8"
                    fontSize={10}
                    tickLine={false}
                    interval={0}
                    angle={-15}
                    textAnchor="end"
                  />
                  <YAxis
                    stroke="#94A3B8"
                    fontSize={11}
                    tickLine={false}
                    unit="k"
                  />
                  <Tooltip
                    formatter={(value: any) => [`$${value},000`, ""]}
                    contentStyle={{
                      backgroundColor: "rgba(15, 23, 42, 0.9)",
                      borderColor: "#334155",
                      borderRadius: "12px",
                      color: "#F8FAFC",
                      fontSize: "12px",
                      boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.3)",
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }} />
                  <Bar dataKey="minSalary" name="Minimum Base ($K)" fill="#93C5FD" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="medianSalary" name="Median Compensation ($K)" fill="#0A66C2" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="maxSalary" name="Maximum Range ($K)" fill="#10B981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* CHART 3: SKILL DEMAND & SALARY PREMIUM */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-4">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
                <Award className="w-5 h-5 text-purple-600" />
                <span>Top Tech Skill Demand & Compensation Premium</span>
              </h3>
              <p className="text-xs text-slate-500">
                Open job listings count and average annual salary per specialized core competency
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    layout="vertical"
                    data={skillDemandData}
                    margin={{ top: 5, right: 20, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                    <XAxis type="number" stroke="#94A3B8" fontSize={10} unit="k" />
                    <YAxis dataKey="skill" type="category" stroke="#94A3B8" fontSize={10} tickLine={false} width={120} />
                    <Tooltip
                      formatter={(value: any) => [`$${value},000`, "Avg Salary"]}
                      contentStyle={{
                        backgroundColor: "rgba(15, 23, 42, 0.9)",
                        borderColor: "#334155",
                        borderRadius: "12px",
                        color: "#F8FAFC",
                        fontSize: "12px",
                      }}
                    />
                    <Bar dataKey="avgSalary" name="Average Salary ($K)" radius={[0, 6, 6, 0]}>
                      {skillDemandData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-3">
                {skillDemandData.map((item, i) => (
                  <div
                    key={i}
                    className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/60 flex items-center justify-between text-xs"
                  >
                    <div className="space-y-0.5">
                      <span className="font-bold text-slate-900 dark:text-white block">{item.skill}</span>
                      <span className="text-slate-400 text-[11px]">{item.jobCount} active job postings</span>
                    </div>
                    <div className="text-right">
                      <span className="font-black text-[#0A66C2] dark:text-cyan-400 block">${item.avgSalary},000 / yr</span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold text-[11px]">{item.growth} YoY growth</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AI Resume Match Drawer / Modal */}
      {showAiMatch && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl max-w-xl w-full border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-purple-600 font-bold text-sm">
                <Sparkles className="w-5 h-5" />
                <span>AI Candidate Match Breakdown</span>
              </div>
              <button
                onClick={() => setShowAiMatch(false)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {aiMatchLoading ? (
              <div className="py-12 flex flex-col items-center justify-center space-y-3">
                <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
                <p className="text-xs font-medium text-slate-500">
                  Analyzing candidate skills against {selectedJob?.title}...
                </p>
              </div>
            ) : (
              <div className="space-y-4 text-xs">
                {/* Score badge */}
                <div className="flex items-center justify-between p-4 bg-purple-50 dark:bg-purple-950/40 rounded-xl border border-purple-200 dark:border-purple-800">
                  <div>
                    <h4 className="font-bold text-purple-900 dark:text-purple-200 text-base">
                      Fit Score: {aiMatchResult?.matchScore || 88}%
                    </h4>
                    <p className="text-purple-700 dark:text-purple-300 text-[11px]">
                      Excellent alignment with your profile and background.
                    </p>
                  </div>
                  <div className="w-14 h-14 rounded-full bg-purple-600 text-white font-extrabold text-base flex items-center justify-center shadow-md">
                    {aiMatchResult?.matchScore || 88}%
                  </div>
                </div>

                {/* Pros & Suggestions */}
                {aiMatchResult?.pros && (
                  <div className="space-y-1">
                    <h5 className="font-bold text-slate-800 dark:text-slate-200">
                      Top Match Strengths:
                    </h5>
                    <ul className="list-disc list-inside text-slate-600 dark:text-slate-300 space-y-0.5">
                      {aiMatchResult.pros.map((p, i) => (
                        <li key={i}>{p}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Cover Letter Draft */}
                {aiMatchResult?.coverLetter && (
                  <div className="space-y-1 pt-2">
                    <h5 className="font-bold text-slate-800 dark:text-slate-200">
                      Generated Cover Letter:
                    </h5>
                    <textarea
                      readOnly
                      value={aiMatchResult.coverLetter}
                      className="w-full h-36 p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 font-mono text-[11px] resize-none"
                    />
                  </div>
                )}

                <button
                  onClick={() => {
                    setShowAiMatch(false);
                    setShowApplyModal(true);
                  }}
                  className="w-full py-2.5 bg-[#0A66C2] hover:bg-[#004182] text-white font-bold rounded-lg text-xs transition-colors"
                >
                  Proceed to Easy Apply with Cover Letter
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Easy Apply Modal */}
      {showApplyModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl max-w-md w-full border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Easy Apply to {selectedJob?.company}
              </h3>
              <button
                onClick={() => setShowApplyModal(false)}
                className="p-1 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Applicant Name
                </label>
                <input
                  type="text"
                  defaultValue={currentUser.name}
                  className="w-full px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-md border border-slate-200 dark:border-slate-700"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Email
                </label>
                <input
                  type="email"
                  defaultValue="alex.rivera@example.com"
                  className="w-full px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-md border border-slate-200 dark:border-slate-700"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Resume Attachment
                </label>
                <div className="p-3 border border-dashed border-slate-300 dark:border-slate-700 rounded-lg text-center bg-slate-50 dark:bg-slate-800/50">
                  <FileText className="w-6 h-6 text-[#0A66C2] mx-auto mb-1" />
                  <p className="font-semibold text-slate-800 dark:text-slate-200">
                    Alex_Rivera_Software_Architect.pdf
                  </p>
                  <p className="text-[10px] text-slate-400">PDF • 240 KB</p>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                alert(`Application submitted to ${selectedJob?.company}!`);
                setShowApplyModal(false);
              }}
              className="w-full py-2.5 bg-[#0A66C2] hover:bg-[#004182] text-white font-bold rounded-lg text-xs shadow-xs"
            >
              Submit Application
            </button>
          </div>
        </div>
      )}

      {/* Post a Job Modal */}
      {showPostJobModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handlePostJobSubmit}
            className="bg-white dark:bg-slate-900 rounded-xl max-w-lg w-full border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Post a Job Opportunity
              </h3>
              <button
                type="button"
                onClick={() => setShowPostJobModal(false)}
                className="p-1 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Job Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Senior Mobile Engineer (Flutter)"
                  value={newJobTitle}
                  onChange={(e) => setNewJobTitle(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-md border border-slate-200 dark:border-slate-700"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Company Name
                </label>
                <input
                  type="text"
                  placeholder="Apex Innovations"
                  value={newJobCompany}
                  onChange={(e) => setNewJobCompany(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-md border border-slate-200 dark:border-slate-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    value={newJobLocation}
                    onChange={(e) => setNewJobLocation(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-md border border-slate-200 dark:border-slate-700"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Workplace Type
                  </label>
                  <select
                    value={newJobType}
                    onChange={(e) => setNewJobType(e.target.value as any)}
                    className="w-full px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-md border border-slate-200 dark:border-slate-700"
                  >
                    <option value="Remote">Remote</option>
                    <option value="Hybrid">Hybrid</option>
                    <option value="On-site">On-site</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Required Skills (comma separated)
                </label>
                <input
                  type="text"
                  value={newJobSkills}
                  onChange={(e) => setNewJobSkills(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-md border border-slate-200 dark:border-slate-700"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">
                    Job Description
                  </label>
                  <button
                    type="button"
                    onClick={handleGenerateJobDescWithAi}
                    disabled={isAiDescLoading || !newJobTitle}
                    className="text-[11px] text-purple-600 dark:text-purple-400 font-bold flex items-center gap-1 hover:underline disabled:opacity-50"
                  >
                    {isAiDescLoading ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <Sparkles className="w-3 h-3" />
                    )}
                    <span>Generate with AI</span>
                  </button>
                </div>
                <textarea
                  rows={4}
                  value={newJobDesc}
                  onChange={(e) => setNewJobDesc(e.target.value)}
                  placeholder="Details about responsibilities and company culture..."
                  className="w-full p-2.5 bg-slate-100 dark:bg-slate-800 rounded-md border border-slate-200 dark:border-slate-700 text-xs"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-[#0A66C2] hover:bg-[#004182] text-white font-bold rounded-lg text-xs"
            >
              Publish Job Listing
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
