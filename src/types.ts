export type ReactionType = "like" | "celebrate" | "support" | "love" | "insightful" | "funny";

export interface ContactInfo {
  email?: string;
  phone?: string;
  website?: string;
  github?: string;
  twitter?: string;
  linkedinUrl?: string;
}

export interface Certification {
  id: string;
  name: string;
  issuingOrganization: string;
  issueDate: string;
  expirationDate?: string;
  credentialId?: string;
  credentialUrl?: string;
  logo?: string;
}

export interface ProjectItem {
  id: string;
  title: string;
  role?: string;
  startDate: string;
  endDate?: string;
  description: string;
  url?: string;
  skillsUsed?: string[];
}

export interface FamilyMember {
  id: string;
  name: string;
  relationship: string; // e.g. "Spouse & Co-founder", "Sister & Tech Entrepreneur", "Mentor & Advisor"
  headline: string;
  avatar: string;
  location?: string;
}

export interface LanguageItem {
  id: string;
  language: string;
  proficiency: "Native or bilingual" | "Full professional" | "Professional working" | "Elementary" | "Limited working";
}

export interface VolunteerExperience {
  id: string;
  organization: string;
  role: string;
  cause: string;
  startDate: string;
  endDate: string;
  description: string;
}

export interface HonorAward {
  id: string;
  title: string;
  issuer: string;
  issueDate: string;
  description: string;
}

export interface FeaturedItem {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  imageUrl?: string;
  linkUrl?: string;
  type: "post" | "article" | "link" | "media";
}

export interface User {
  id: string;
  name: string;
  headline: string;
  avatar: string;
  coverImage?: string;
  location: string;
  connectionsCount: number;
  profileViewsThisWeek: number;
  searchAppearances: number;
  about: string;
  isOpenToWork: boolean;
  isHiring: boolean;
  company?: string;
  role?: string;
  contactInfo?: ContactInfo;
  experiences: Experience[];
  education: Education[];
  skills: Skill[];
  recommendations: Recommendation[];
  certifications?: Certification[];
  projects?: ProjectItem[];
  familyConnections?: FamilyMember[];
  languages?: LanguageItem[];
  socialCauses?: string[];
  volunteerWork?: VolunteerExperience[];
  honorsAndAwards?: HonorAward[];
  featuredItems?: FeaturedItem[];
}

export interface Experience {
  id: string;
  title: string;
  company: string;
  companyLogo?: string;
  location: string;
  employmentType?: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  description: string;
  skillsUsed?: string[];
}

export interface Education {
  id: string;
  school: string;
  degree: string;
  fieldOfStudy: string;
  startDate: string;
  endDate: string;
  gpa?: string;
  activities?: string;
  honors?: string;
}

export interface Skill {
  id: string;
  name: string;
  endorsementsCount: number;
  endorsedByMe?: boolean;
}

export interface Recommendation {
  id: string;
  authorName: string;
  authorHeadline: string;
  authorAvatar: string;
  relationship: string;
  text: string;
  date: string;
}

export interface Comment {
  id: string;
  authorId: string;
  authorName: string;
  authorHeadline: string;
  authorAvatar: string;
  content: string;
  createdAt: string;
  likesCount: number;
  likedByMe?: boolean;
}

export interface PostMedia {
  type: "image" | "video" | "document" | "poll";
  url?: string;
  title?: string;
  pollOptions?: { id: string; text: string; votes: number }[];
  totalVotes?: number;
}

export interface Post {
  id: string;
  authorId: string;
  authorName: string;
  authorHeadline: string;
  authorAvatar: string;
  authorDegree?: "1st" | "2nd" | "3rd";
  isFollowingAuthor?: boolean;
  content: string;
  createdAt: string;
  media?: PostMedia;
  reactions: Record<ReactionType, number>;
  userReaction?: ReactionType;
  commentsCount: number;
  comments: Comment[];
  repostsCount: number;
  isBookmarked?: boolean;
  tags?: string[];
}

export interface Job {
  id: string;
  title: string;
  company: string;
  companyLogo: string;
  location: string;
  locationType: "Remote" | "Hybrid" | "On-site";
  employmentType: "Full-time" | "Part-time" | "Contract" | "Internship";
  salaryRange?: string;
  postedAt: string;
  applicantsCount: number;
  easyApply: boolean;
  description: string;
  requirements: string[];
  skillsRequired: string[];
  isSaved?: boolean;
  applied?: boolean;
}

export interface ConnectionRequest {
  id: string;
  user: {
    id: string;
    name: string;
    headline: string;
    avatar: string;
    mutualConnections: number;
  };
  sentAt: string;
  message?: string;
}

export interface DirectMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  text: string;
  createdAt: string;
  isMe: boolean;
}

export interface Conversation {
  id: string;
  participant: {
    id: string;
    name: string;
    headline: string;
    avatar: string;
    online: boolean;
  };
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  messages: DirectMessage[];
}

export interface NotificationItem {
  id: string;
  type: "view" | "like" | "comment" | "job" | "connection" | "mention";
  title: string;
  description: string;
  time: string;
  read: boolean;
  avatar?: string;
  linkTab?: string;
}

export interface Company {
  id: string;
  name: string;
  tagline: string;
  logo: string;
  banner: string;
  industry: string;
  followersCount: number;
  isFollowing?: boolean;
  website: string;
  about: string;
  employeesCount: number;
  locations: string[];
}

export interface KeycloakConfig {
  serverUrl: string;
  realm: string;
  clientId: string;
  clientSecret?: string;
  grantType: "authorization_code" | "password" | "client_credentials";
  ssoEnabled: boolean;
  sslRequired: "external" | "all" | "none";
}

export interface KeycloakTokenPayload {
  sub: string;
  preferred_username: string;
  email: string;
  given_name?: string;
  family_name?: string;
  realm_access: {
    roles: string[];
  };
  resource_access?: Record<string, { roles: string[] }>;
  exp: number;
  iat: number;
  iss: string;
  azp?: string;
}

export interface KeycloakSession {
  isAuthenticated: boolean;
  accessToken?: string;
  refreshToken?: string;
  tokenPayload?: KeycloakTokenPayload;
  roles: string[];
  username?: string;
  email?: string;
  loginTime?: string;
  expiresAt?: number;
}

export interface KeycloakAuditLog {
  id: string;
  timestamp: string;
  eventType:
    | "LOGIN_SUCCESS"
    | "LOGIN_FAILED"
    | "REGISTER_SUCCESS"
    | "REGISTER_FAILED"
    | "PASSWORD_RESET_REQUESTED"
    | "PASSWORD_RESET_SUCCESS"
    | "LOGOUT"
    | "TOKEN_REFRESH"
    | "VERIFY_TOKEN"
    | "SSO_EXCHANGE"
    | "REALM_ACCESS_DENIED"
    | "PASSWORD_CHANGE";
  username: string;
  realm: string;
  clientIp: string;
  status: "SUCCESS" | "FAILED" | "WARNING";
  details: string;
  sessionDurationSec?: number;
  userAgent?: string;
  tokenScope?: string;
}

export interface FlutterFile {
  path: string;
  title: string;
  language: string;
  code: string;
}

