import React, { useState, useEffect } from "react";
import { User, Post, ReactionType, NotificationItem, KeycloakSession, ConnectionRequest, Conversation } from "./types";
import {
  currentUser as initialUser,
  initialPosts,
  initialNotifications,
  connectionRequests,
  initialConversations,
} from "./data/mockData";
import { Header } from "./components/Header";
import { FeedView } from "./components/FeedView";
import { NetworkView, ContactPerson } from "./components/NetworkView";
import { JobsView } from "./components/JobsView";
import { MessagingView } from "./components/MessagingView";
import { NotificationsView } from "./components/NotificationsView";
import { ProfileView } from "./components/ProfileView";
import { CompanyView } from "./components/CompanyView";
import { AdminView } from "./components/AdminView";
import { SettingsView } from "./components/SettingsView";
import { CreatePostModal } from "./components/CreatePostModal";
import { FlutterSuiteModal } from "./components/FlutterSuiteModal";
import { KeycloakAuditModal } from "./components/KeycloakAuditModal";
import { UserProfileModal, ProfilePopupData } from "./components/UserProfileModal";
import { LoginScreen } from "./components/LoginScreen";
import { getProfileForUser, saveProfileForUser } from "./utils/userProfiles";

export default function App() {
  const [activeTab, setActiveTab] = useState<string>("feed");
  const [keycloakSession, setKeycloakSession] = useState<KeycloakSession>(() => {
    try {
      const saved =
        sessionStorage.getItem("proconnect_session") ||
        localStorage.getItem("proconnect_session");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.isAuthenticated) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn("Error loading stored session:", e);
    }
    return {
      isAuthenticated: false,
      username: "",
      email: "",
      roles: [],
      accessToken: "",
    };
  });

  const [user, setUser] = useState<User>(() => {
    if (keycloakSession.isAuthenticated && keycloakSession.username) {
      return getProfileForUser(keycloakSession.username, keycloakSession.tokenPayload);
    }
    return getProfileForUser("alex.morgan");
  });

  const [posts, setPosts] = useState<Post[]>(() => {
    const saved = localStorage.getItem("proconnect_posts");
    return saved ? JSON.parse(saved) : initialPosts;
  });

  const [notifications, setNotifications] = useState<NotificationItem[]>(
    initialNotifications
  );

  const [darkMode, setDarkMode] = useState<boolean>(() => {
    return localStorage.getItem("proconnect_theme") === "dark";
  });

  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
  const [isFlutterSuiteOpen, setIsFlutterSuiteOpen] = useState(false);
  const [isKeycloakModalOpen, setIsKeycloakModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Network & Connections State
  const [connections, setConnections] = useState<ContactPerson[]>(() => {
    const saved = localStorage.getItem("proconnect_connections");
    return saved
      ? JSON.parse(saved)
      : [
          {
            id: "user_2",
            name: "Sophia Martinez",
            headline: "Principal AI Researcher @ InnovateAI | Speaker & Tech Founder",
            avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&auto=format&fit=crop&q=80",
            location: "San Francisco, CA",
            online: true,
          },
          {
            id: "user_3",
            name: "David Kim",
            headline: "Senior Staff Engineer @ CloudScale",
            avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
            location: "San Jose, CA",
            online: true,
          },
          {
            id: "user_4",
            name: "Marcus Vance",
            headline: "VP of Product @ MobileFirst | Mobile & Web Ecosystem Leader",
            avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80",
            location: "Austin, TX",
            online: false,
          },
          {
            id: "user_5",
            name: "Elena Rostova",
            headline: "Head of Talent Acquisition @ NextGen Tech",
            avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
            location: "New York, NY",
            online: true,
          },
        ];
  });

  const [followingIds, setFollowingIds] = useState<string[]>(() => {
    const saved = localStorage.getItem("proconnect_following");
    return saved ? JSON.parse(saved) : ["user_2", "user_4", "user_5", "comp_1"];
  });

  const [requests, setRequests] = useState<ConnectionRequest[]>(() => {
    const saved = localStorage.getItem("proconnect_requests");
    return saved ? JSON.parse(saved) : connectionRequests;
  });

  // Private Messaging State
  const [conversations, setConversations] = useState<Conversation[]>(() => {
    const saved = localStorage.getItem("proconnect_conversations");
    return saved ? JSON.parse(saved) : initialConversations;
  });

  const [activeConvId, setActiveConvId] = useState<string>("conv_1");

  // Profile Popup Modal State
  const [selectedProfile, setSelectedProfile] = useState<ProfilePopupData | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  const handleSelectProfile = (profile: ProfilePopupData) => {
    setSelectedProfile(profile);
    setIsProfileModalOpen(true);
  };

  // Sync User Profile when Keycloak session changes
  useEffect(() => {
    if (keycloakSession.isAuthenticated && keycloakSession.username) {
      const activeProfile = getProfileForUser(
        keycloakSession.username,
        keycloakSession.tokenPayload
      );
      setUser(activeProfile);
    }
  }, [keycloakSession.username, keycloakSession.isAuthenticated]);

  const handleUpdateUser = (updatedUser: User) => {
    setUser(updatedUser);
    if (keycloakSession.username) {
      saveProfileForUser(keycloakSession.username, updatedUser);
    }
  };

  // Sync Dark Mode Class to HTML Element
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("proconnect_theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("proconnect_theme", "light");
    }
  }, [darkMode]);

  // Persist State
  useEffect(() => {
    if (keycloakSession.username) {
      saveProfileForUser(keycloakSession.username, user);
    }
  }, [user, keycloakSession.username]);

  useEffect(() => {
    localStorage.setItem("proconnect_posts", JSON.stringify(posts));
  }, [posts]);

  useEffect(() => {
    localStorage.setItem("proconnect_connections", JSON.stringify(connections));
  }, [connections]);

  useEffect(() => {
    localStorage.setItem("proconnect_following", JSON.stringify(followingIds));
  }, [followingIds]);

  useEffect(() => {
    localStorage.setItem("proconnect_requests", JSON.stringify(requests));
  }, [requests]);

  useEffect(() => {
    localStorage.setItem("proconnect_conversations", JSON.stringify(conversations));
  }, [conversations]);

  // Network & Following Handlers
  const handleToggleFollow = (targetId: string) => {
    setFollowingIds((prev) =>
      prev.includes(targetId)
        ? prev.filter((id) => id !== targetId)
        : [...prev, targetId]
    );
  };

  const handleAcceptRequest = (req: ConnectionRequest) => {
    setRequests((prev) => prev.filter((r) => r.id !== req.id));
    const newContact: ContactPerson = {
      id: req.user.id,
      name: req.user.name,
      headline: req.user.headline,
      avatar: req.user.avatar,
      mutualConnections: req.user.mutualConnections,
      online: true,
    };
    setConnections((prev) => [newContact, ...prev]);
    setUser((prev) => ({
      ...prev,
      connectionsCount: prev.connectionsCount + 1,
    }));
    setNotifications((prev) => [
      {
        id: `n_${Date.now()}`,
        type: "connection",
        title: `You are now connected with ${req.user.name}`,
        description: `${req.user.name} is now a 1st degree connection in your network.`,
        time: "Just now",
        read: false,
        avatar: req.user.avatar,
        linkTab: "network",
      },
      ...prev,
    ]);
  };

  const handleIgnoreRequest = (id: string) => {
    setRequests((prev) => prev.filter((r) => r.id !== id));
  };

  const handleConnectPerson = (person: ContactPerson, note?: string) => {
    setNotifications((prev) => [
      {
        id: `n_${Date.now()}`,
        type: "connection",
        title: `Invitation sent to ${person.name}`,
        description: note ? `Note: "${note}"` : "Sent standard connection invitation.",
        time: "Just now",
        read: false,
        avatar: person.avatar,
        linkTab: "network",
      },
      ...prev,
    ]);
  };

  const handleRemoveConnection = (id: string) => {
    setConnections((prev) => prev.filter((c) => c.id !== id));
    setUser((prev) => ({
      ...prev,
      connectionsCount: Math.max(0, prev.connectionsCount - 1),
    }));
  };

  // Messaging Handlers
  const handleMessageContact = (contact: {
    id: string;
    name: string;
    headline: string;
    avatar: string;
    online?: boolean;
  }) => {
    const existing = conversations.find((c) => c.participant.id === contact.id);
    if (!existing) {
      const newConv: Conversation = {
        id: `conv_${Date.now()}`,
        participant: {
          id: contact.id,
          name: contact.name,
          headline: contact.headline,
          avatar: contact.avatar,
          online: contact.online ?? true,
        },
        lastMessage: "Conversation started",
        lastMessageTime: "Just now",
        unreadCount: 0,
        messages: [
          {
            id: `m_${Date.now()}`,
            senderId: contact.id,
            senderName: contact.name,
            senderAvatar: contact.avatar,
            text: `Hi ${user.name}! Thanks for connecting. How can I help you today?`,
            createdAt: "Just now",
            isMe: false,
          },
        ],
      };
      setConversations((prev) => [newConv, ...prev]);
      setActiveConvId(newConv.id);
    } else {
      setActiveConvId(existing.id);
    }
    setActiveTab("messaging");
  };

  const handleSendMessage = (convId: string, text: string) => {
    const newMsg = {
      id: `m_${Date.now()}`,
      senderId: user.id,
      senderName: user.name,
      senderAvatar: user.avatar,
      text,
      createdAt: "Just now",
      isMe: true,
    };
    setConversations((prev) =>
      prev.map((c) =>
        c.id === convId
          ? {
              ...c,
              lastMessage: text,
              lastMessageTime: "Just now",
              messages: [...c.messages, newMsg],
            }
          : c
      )
    );
  };

  // Handlers for Post Interactions
  const handleLikePost = (postId: string, reaction: ReactionType) => {
    setPosts(
      posts.map((p) => {
        if (p.id === postId) {
          const currentReaction = p.userReaction;
          const reactions = { ...p.reactions };

          if (currentReaction === reaction) {
            reactions[reaction] = Math.max(0, reactions[reaction] - 1);
            return { ...p, reactions, userReaction: undefined };
          } else {
            if (currentReaction) {
              reactions[currentReaction] = Math.max(
                0,
                reactions[currentReaction] - 1
              );
            }
            reactions[reaction] = (reactions[reaction] || 0) + 1;
            return { ...p, reactions, userReaction: reaction };
          }
        }
        return p;
      })
    );
  };

  const handleAddComment = (postId: string, text: string) => {
    setPosts(
      posts.map((p) => {
        if (p.id === postId) {
          const newComment = {
            id: `c_${Date.now()}`,
            authorId: user.id,
            authorName: user.name,
            authorHeadline: user.headline,
            authorAvatar: user.avatar,
            content: text,
            createdAt: "Just now",
            likesCount: 0,
          };
          return {
            ...p,
            commentsCount: p.commentsCount + 1,
            comments: [...(p.comments || []), newComment],
          };
        }
        return p;
      })
    );
  };

  const handleBookmarkPost = (postId: string) => {
    setPosts(
      posts.map((p) =>
        p.id === postId ? { ...p, isBookmarked: !p.isBookmarked } : p
      )
    );
  };

  const handleVotePoll = (postId: string, optionId: string) => {
    setPosts(
      posts.map((p) => {
        if (p.id === postId && p.media?.type === "poll" && p.media.pollOptions) {
          const updatedOptions = p.media.pollOptions.map((opt) =>
            opt.id === optionId ? { ...opt, votes: opt.votes + 1 } : opt
          );
          return {
            ...p,
            media: {
              ...p.media,
              pollOptions: updatedOptions,
              totalVotes: (p.media.totalVotes || 0) + 1,
            },
          };
        }
        return p;
      })
    );
  };

  const handlePostCreated = (newPost: Post) => {
    setPosts([newPost, ...posts]);
  };

  const handleMarkAllNotificationsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })));
  };

  const handleSignOut = async () => {
    try {
      await fetch("/api/keycloak/logout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: keycloakSession.username || user.name,
        }),
      });
    } catch (e) {
      console.warn("Keycloak logout error:", e);
    }

    sessionStorage.removeItem("proconnect_session");
    localStorage.removeItem("proconnect_session");

    setKeycloakSession({
      isAuthenticated: false,
      username: "",
      email: "",
      roles: [],
      accessToken: "",
    });
  };

  // If user is logged out, show full-screen LinkedIn Keycloak Login Screen
  if (!keycloakSession.isAuthenticated) {
    return (
      <>
        <LoginScreen
          keycloakSession={keycloakSession}
          setKeycloakSession={setKeycloakSession}
          openKeycloakAuditModal={() => setIsKeycloakModalOpen(true)}
        />
        <KeycloakAuditModal
          isOpen={isKeycloakModalOpen}
          onClose={() => setIsKeycloakModalOpen(false)}
          keycloakSession={keycloakSession}
          setKeycloakSession={setKeycloakSession}
        />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F2EE] dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans transition-colors duration-200">
      {/* Top Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={user}
        notifications={notifications}
        unreadMessageCount={1}
        openCreatePost={() => setIsCreatePostOpen(true)}
        openFlutterSuite={() => setIsFlutterSuiteOpen(true)}
        openKeycloakModal={() => setIsKeycloakModalOpen(true)}
        keycloakAuthenticated={keycloakSession.isAuthenticated}
        onSignOut={handleSignOut}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      {/* Main View Router */}
      <div className="pb-12">
        {activeTab === "feed" && (
          <FeedView
            currentUser={user}
            posts={posts}
            followingIds={followingIds}
            onToggleFollow={handleToggleFollow}
            onMessageContact={handleMessageContact}
            onSelectProfile={handleSelectProfile}
            openCreatePost={() => setIsCreatePostOpen(true)}
            openFlutterSuite={() => setIsFlutterSuiteOpen(true)}
            onLikePost={handleLikePost}
            onAddComment={handleAddComment}
            onBookmarkPost={handleBookmarkPost}
            onVotePoll={handleVotePoll}
            searchQuery={searchQuery}
          />
        )}

        {activeTab === "network" && (
          <NetworkView
            connections={connections}
            requests={requests}
            followingIds={followingIds}
            onAcceptRequest={handleAcceptRequest}
            onIgnoreRequest={handleIgnoreRequest}
            onConnectPerson={handleConnectPerson}
            onToggleFollow={handleToggleFollow}
            onMessageContact={handleMessageContact}
            onRemoveConnection={handleRemoveConnection}
            onSelectProfile={handleSelectProfile}
          />
        )}

        {activeTab === "jobs" && <JobsView currentUser={user} />}

        {activeTab === "messaging" && (
          <MessagingView
            currentUser={user}
            conversations={conversations}
            onSendMessage={handleSendMessage}
            activeConvId={activeConvId}
            onSelectConvId={setActiveConvId}
            onStartNewConversation={handleMessageContact}
            connections={connections}
            onSelectProfile={handleSelectProfile}
          />
        )}

        {activeTab === "notifications" && (
          <NotificationsView
            notifications={notifications}
            onMarkAllRead={handleMarkAllNotificationsRead}
            onSelectTab={setActiveTab}
          />
        )}

        {activeTab === "profile" && (
          <ProfileView currentUser={user} onUpdateUser={handleUpdateUser} />
        )}

        {activeTab === "company" && <CompanyView />}

        {activeTab === "admin" && (
          <AdminView
            keycloakSession={keycloakSession}
            setKeycloakSession={setKeycloakSession}
          />
        )}

        {activeTab === "settings" && (
          <SettingsView
            currentUser={user}
            darkMode={darkMode}
            setDarkMode={setDarkMode}
            onSignOut={handleSignOut}
            openFlutterSuite={() => setIsFlutterSuiteOpen(true)}
            openKeycloakModal={() => setIsKeycloakModalOpen(true)}
            setActiveTabApp={setActiveTab}
          />
        )}
      </div>

      {/* Create Post Modal */}
      <CreatePostModal
        isOpen={isCreatePostOpen}
        onClose={() => setIsCreatePostOpen(false)}
        currentUser={user}
        onPostCreated={handlePostCreated}
      />

      {/* Flutter Mobile Suite Modal */}
      <FlutterSuiteModal
        isOpen={isFlutterSuiteOpen}
        onClose={() => setIsFlutterSuiteOpen(false)}
      />

      {/* Keycloak Auth & Audit Log Modal */}
      <KeycloakAuditModal
        isOpen={isKeycloakModalOpen}
        onClose={() => setIsKeycloakModalOpen(false)}
        keycloakSession={keycloakSession}
        setKeycloakSession={setKeycloakSession}
      />

      {/* Interactive User Profile Popup Modal */}
      <UserProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        profile={selectedProfile}
        connections={connections}
        followingIds={followingIds}
        pendingRequests={requests.map((r) => ({ id: r.user.id }))}
        onConnectPerson={handleConnectPerson}
        onToggleFollow={handleToggleFollow}
        onMessageContact={handleMessageContact}
      />
    </div>
  );
}
