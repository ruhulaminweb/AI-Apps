import React, { useState } from "react";
import { Building2, Globe, MapPin, Users, Check, Plus, Briefcase } from "lucide-react";
import { initialCompanies } from "../data/mockData";
import { Company } from "../types";

export const CompanyView: React.FC = () => {
  const [companies, setCompanies] = useState<Company[]>(initialCompanies);
  const [selectedCompany, setSelectedCompany] = useState<Company>(companies[0]);

  const handleToggleFollow = (companyId: string) => {
    setCompanies(
      companies.map((c) => {
        if (c.id === companyId) {
          const nextState = !c.isFollowing;
          return {
            ...c,
            isFollowing: nextState,
            followersCount: nextState ? c.followersCount + 1 : c.followersCount - 1,
          };
        }
        return c;
      })
    );
    if (selectedCompany.id === companyId) {
      setSelectedCompany({
        ...selectedCompany,
        isFollowing: !selectedCompany.isFollowing,
        followersCount: !selectedCompany.isFollowing
          ? selectedCompany.followersCount + 1
          : selectedCompany.followersCount - 1,
      });
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      {/* Companies Selector */}
      <div className="flex items-center gap-3 overflow-x-auto pb-2">
        {companies.map((c) => (
          <button
            key={c.id}
            onClick={() => setSelectedCompany(c)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl border font-bold text-xs transition-all whitespace-nowrap ${
              selectedCompany.id === c.id
                ? "bg-[#0A66C2] text-white border-[#0A66C2]"
                : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50"
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>{c.name}</span>
          </button>
        ))}
      </div>

      {/* Selected Company Banner & Details */}
      {selectedCompany && (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs overflow-hidden space-y-4">
          <div className="h-48 bg-slate-800 relative">
            <img
              src={selectedCompany.banner}
              alt="Banner"
              className="w-full h-full object-cover"
            />
          </div>

          <div className="px-6 pb-6 relative">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between -mt-12 mb-4 gap-4">
              <img
                src={selectedCompany.logo}
                alt={selectedCompany.name}
                className="w-24 h-24 rounded-2xl border-4 border-white dark:border-slate-900 object-cover shadow-md"
              />

              <button
                onClick={() => handleToggleFollow(selectedCompany.id)}
                className={`px-6 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs ${
                  selectedCompany.isFollowing
                    ? "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                    : "bg-[#0A66C2] text-white hover:bg-[#004182]"
                }`}
              >
                {selectedCompany.isFollowing ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Following</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    <span>Follow Company</span>
                  </>
                )}
              </button>
            </div>

            <h2 className="font-extrabold text-slate-900 dark:text-white text-xl">
              {selectedCompany.name}
            </h2>
            <p className="text-xs font-medium text-slate-600 dark:text-slate-300 mt-1">
              {selectedCompany.tagline}
            </p>

            <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 mt-2 flex-wrap">
              <span>{selectedCompany.industry}</span>
              <span>•</span>
              <span>{selectedCompany.followersCount.toLocaleString()} followers</span>
              <span>•</span>
              <span>{selectedCompany.employeesCount} employees</span>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
              <h4 className="font-bold text-slate-900 dark:text-white text-xs">
                About Organization
              </h4>
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                {selectedCompany.about}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
