import { User } from "../types";
import { currentUser as initialUser } from "../data/mockData";

export const PRESET_AVATARS = [
  {
    label: "Alex (Tech Lead)",
    url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80",
  },
  {
    label: "Sarah (Recruiter)",
    url: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80",
  },
  {
    label: "Jordan (Engineer)",
    url: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&auto=format&fit=crop&q=80",
  },
  {
    label: "Elena (Product Manager)",
    url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop&q=80",
  },
  {
    label: "David (Architect)",
    url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80",
  },
  {
    label: "Maya (UX Designer)",
    url: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&auto=format&fit=crop&q=80",
  },
];

export const PRESET_COVERS = [
  {
    label: "Tech Blue Gradient",
    url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80",
  },
  {
    label: "Modern Office Space",
    url: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200&auto=format&fit=crop&q=80",
  },
  {
    label: "Code & Workspace",
    url: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&auto=format&fit=crop&q=80",
  },
  {
    label: "Dark Abstract",
    url: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1200&auto=format&fit=crop&q=80",
  },
];

function formatNameFromUsername(username: string): string {
  if (!username) return "Member User";
  return username
    .split(/[\._\-\s]+/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}

export function getProfileForUser(username: string, tokenPayload?: any): User {
  const cleanUsername = (username || "guest").toLowerCase().trim();
  const storageKey = `proconnect_user_profile_${cleanUsername}`;

  const saved = localStorage.getItem(storageKey);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      console.warn("Failed to parse saved user profile:", e);
    }
  }

  // Preset accounts
  if (cleanUsername === "alex.morgan" || cleanUsername === "alex.rivera") {
    saveProfileForUser(cleanUsername, initialUser);
    return initialUser;
  }

  if (cleanUsername === "sarah.chen") {
    const sarahUser: User = {
      id: "user_sarah_chen",
      name: "Sarah Chen",
      headline: "Senior Technical Talent Acquisition Leader @ Apex Innovations | Scaling Engineering Teams",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80",
      coverImage: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200&auto=format&fit=crop&q=80",
      location: "San Francisco, CA",
      connectionsCount: 2840,
      profileViewsThisWeek: 342,
      searchAppearances: 188,
      isOpenToWork: false,
      isHiring: true,
      company: "Apex Innovations",
      role: "Lead Technical Recruiter",
      about: "I specialize in recruiting top-tier software engineers, AI architects, and engineering managers across the Bay Area. Always looking to connect with passionate builders!",
      experiences: [
        {
          id: "exp_sarah_1",
          title: "Lead Technical Recruiter",
          company: "Apex Innovations",
          location: "San Francisco, CA",
          startDate: "Jan 2022",
          endDate: "Present",
          isCurrent: true,
          description: "Leading tech talent acquisition for frontend, backend, and machine learning infrastructure teams.",
        },
      ],
      education: [
        {
          id: "edu_sarah_1",
          school: "Stanford University",
          degree: "Bachelor of Arts",
          fieldOfStudy: "Organizational Psychology",
          startDate: "2015",
          endDate: "2019",
        },
      ],
      skills: [
        { id: "s_sc1", name: "Technical Recruiting", endorsementsCount: 89, endorsedByMe: true },
        { id: "s_sc2", name: "Talent Acquisition", endorsementsCount: 74, endorsedByMe: true },
        { id: "s_sc3", name: "Executive Search", endorsementsCount: 42, endorsedByMe: false },
        { id: "s_sc4", name: "Sourcing & Headhunting", endorsementsCount: 65, endorsedByMe: false },
      ],
      recommendations: [],
    };
    saveProfileForUser(cleanUsername, sarahUser);
    return sarahUser;
  }

  // Derive profile for new/unknown user
  let name = "";
  if (tokenPayload?.given_name || tokenPayload?.family_name) {
    name = `${tokenPayload.given_name || ""} ${tokenPayload.family_name || ""}`.trim();
  }
  if (!name) {
    name = formatNameFromUsername(cleanUsername);
  }

  const role = tokenPayload?.realm_access?.roles?.includes("recruiter")
    ? "Corporate Recruiter"
    : tokenPayload?.realm_access?.roles?.includes("admin")
    ? "Realm System Administrator"
    : "Software Specialist";

  const isHiring = tokenPayload?.realm_access?.roles?.includes("recruiter") || false;

  const newUser: User = {
    id: `user_${cleanUsername}_${Date.now()}`,
    name: name,
    headline: `${role} | ProConnect Keycloak Realm Member`,
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&auto=format&fit=crop&q=80",
    coverImage: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80",
    location: "San Francisco Bay Area, CA",
    connectionsCount: 85,
    profileViewsThisWeek: 24,
    searchAppearances: 12,
    isOpenToWork: true,
    isHiring: isHiring,
    company: "ProConnect Inc.",
    role: role,
    about: `Welcome to my profile! I am ${name}, a ${role.toLowerCase()} on ProConnect. Passionate about software innovation, collaboration, and professional networking.`,
    experiences: [
      {
        id: `exp_new_1`,
        title: role,
        company: "ProConnect Inc.",
        location: "San Francisco, CA",
        startDate: "2024",
        endDate: "Present",
        isCurrent: true,
        description: `Working as a ${role} focusing on professional projects and community building.`,
      },
    ],
    education: [
      {
        id: `edu_new_1`,
        school: "State University",
        degree: "Bachelor of Science",
        fieldOfStudy: "Computer Science & Engineering",
        startDate: "2018",
        endDate: "2022",
      },
    ],
    skills: [
      { id: `sk_1`, name: "JavaScript & TypeScript", endorsementsCount: 12, endorsedByMe: true },
      { id: `sk_2`, name: "React & Web Development", endorsementsCount: 15, endorsedByMe: true },
      { id: `sk_3`, name: "Problem Solving", endorsementsCount: 8, endorsedByMe: false },
    ],
    recommendations: [],
  };

  saveProfileForUser(cleanUsername, newUser);
  return newUser;
}

export function saveProfileForUser(username: string, profile: User): void {
  if (!username) return;
  const cleanUsername = username.toLowerCase().trim();
  const storageKey = `proconnect_user_profile_${cleanUsername}`;
  try {
    localStorage.setItem(storageKey, JSON.stringify(profile));
    localStorage.setItem("proconnect_user", JSON.stringify(profile));
  } catch (e) {
    console.warn("Failed to save user profile:", e);
  }
}
