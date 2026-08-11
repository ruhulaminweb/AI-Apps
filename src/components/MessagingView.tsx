import React, { useState, useEffect } from "react";
import {
  MessageSquare,
  Send,
  Sparkles,
  Paperclip,
  Image as ImageIcon,
  Smile,
  MoreVertical,
  Search,
  CheckCheck,
  Loader2,
  Plus,
  X,
  UserCheck,
  Users,
} from "lucide-react";
import { Conversation, DirectMessage, User } from "../types";
import { ContactPerson } from "./NetworkView";
import { ProfilePopupData } from "./UserProfileModal";

interface MessagingViewProps {
  currentUser: User;
  conversations: Conversation[];
  onSendMessage: (convId: string, text: string) => void;
  activeConvId: string;
  onSelectConvId: (id: string) => void;
  onStartNewConversation: (contact: ContactPerson) => void;
  connections: ContactPerson[];
  onSelectProfile?: (profile: ProfilePopupData) => void;
}

export const MessagingView: React.FC<MessagingViewProps> = ({
  currentUser,
  conversations,
  onSendMessage,
  activeConvId,
  onSelectConvId,
  onStartNewConversation,
  connections,
  onSelectProfile,
}) => {
  const [inputMessage, setInputMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [contactSearchQuery, setContactSearchQuery] = useState("");
  const [attachmentImage, setAttachmentImage] = useState<string | null>(null);

  const [smartReplies, setSmartReplies] = useState<string[]>([
    "Thanks for reaching out! Let's schedule a call.",
    "Sounds great, looking forward to reviewing this.",
    "Could you share a bit more detail on the timeline?",
  ]);
  const [isSmartReplyLoading, setIsSmartReplyLoading] = useState(false);

  // Active conversation
  const activeConv =
    conversations.find((c) => c.id === activeConvId) || conversations[0];

  // Filtered conversations
  const filteredConversations = conversations.filter(
    (conv) =>
      conv.participant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Filtered contacts for new chat composer
  const filteredContacts = connections.filter(
    (c) =>
      c.name.toLowerCase().includes(contactSearchQuery.toLowerCase()) ||
      c.headline.toLowerCase().includes(contactSearchQuery.toLowerCase())
  );

  const handleSend = (textToSend?: string) => {
    const text = textToSend || inputMessage;
    if ((!text.trim() && !attachmentImage) || !activeConv) return;

    let fullText = text.trim();
    if (attachmentImage) {
      fullText = fullText
        ? `${fullText}\n[Image Attachment]`
        : "[Image Attachment]";
    }

    onSendMessage(activeConv.id, fullText);
    setInputMessage("");
    setAttachmentImage(null);

    // Trigger AI Smart Reply generator for next quick options
    fetchSmartReplies(
      {
        id: `m_${Date.now()}`,
        senderId: currentUser.id,
        senderName: currentUser.name,
        senderAvatar: currentUser.avatar,
        text: fullText,
        createdAt: "Just now",
        isMe: true,
      },
      activeConv
    );
  };

  const fetchSmartReplies = async (msg: DirectMessage, conv: Conversation) => {
    setIsSmartReplyLoading(true);
    try {
      const res = await fetch("/api/gemini/smart-reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversation: [...conv.messages, msg].map((m) => ({
            sender: m.senderName,
            text: m.text,
          })),
        }),
      });
      const data = await res.json();
      if (data.suggestions && Array.isArray(data.suggestions)) {
        setSmartReplies(data.suggestions);
      }
    } catch (err) {
      console.error("Smart reply error", err);
    } finally {
      setIsSmartReplyLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs grid grid-cols-1 md:grid-cols-12 overflow-hidden h-[750px]">
        {/* Left Column: Conversations List */}
        <div className="md:col-span-4 border-r border-slate-100 dark:border-slate-800 flex flex-col">
          {/* Header & Search & New Chat Button */}
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-[#0A66C2]" />
                <span>Messaging</span>
              </h3>

              {/* Start New Private Message Button */}
              <button
                onClick={() => setShowNewChatModal(true)}
                className="p-1.5 bg-blue-50 dark:bg-blue-950/50 hover:bg-[#0A66C2] text-[#0A66C2] hover:text-white rounded-full transition-all"
                title="New Message to Contact"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search messages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs text-slate-900 dark:text-slate-100 border border-transparent focus:outline-hidden focus:border-[#0A66C2]"
              />
            </div>
          </div>

          {/* Conversations Items */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
            {filteredConversations.length > 0 ? (
              filteredConversations.map((conv) => {
                const isSelected = conv.id === activeConv?.id;
                return (
                  <div
                    key={conv.id}
                    onClick={() => onSelectConvId(conv.id)}
                    className={`p-3.5 flex items-start gap-3 cursor-pointer transition-colors ${
                      isSelected
                        ? "bg-blue-50/80 dark:bg-blue-950/40 border-l-4 border-[#0A66C2]"
                        : "hover:bg-slate-50 dark:hover:bg-slate-800/50"
                    }`}
                  >
                    <div className="relative">
                      <img
                        src={conv.participant.avatar}
                        alt={conv.participant.name}
                        className="w-11 h-11 rounded-full object-cover"
                      />
                      {conv.participant.online && (
                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full ring-2 ring-white dark:ring-slate-900" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-slate-900 dark:text-white text-xs truncate">
                          {conv.participant.name}
                        </h4>
                        <span className="text-[10px] text-slate-400">
                          {conv.lastMessageTime}
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                        {conv.lastMessage}
                      </p>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-8 text-center space-y-3">
                <p className="text-xs text-slate-400">
                  No message thread found matching "{searchQuery}".
                </p>
                <button
                  onClick={() => setShowNewChatModal(true)}
                  className="px-4 py-2 bg-[#0A66C2] text-white font-bold text-xs rounded-full"
                >
                  Start a new chat
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Chat Window */}
        <div className="md:col-span-8 flex flex-col h-full bg-slate-50/50 dark:bg-slate-950/20">
          {activeConv ? (
            <>
              {/* Chat Header */}
              <div className="p-4 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div
                  onClick={() =>
                    onSelectProfile &&
                    onSelectProfile({
                      id: activeConv.participant.id,
                      name: activeConv.participant.name,
                      headline: activeConv.participant.headline,
                      avatar: activeConv.participant.avatar,
                    })
                  }
                  className="flex items-center gap-3 cursor-pointer group"
                >
                  <div className="relative">
                    <img
                      src={activeConv.participant.avatar}
                      alt={activeConv.participant.name}
                      className="w-10 h-10 rounded-full object-cover group-hover:opacity-85 transition-opacity"
                    />
                    {activeConv.participant.online && (
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-white dark:ring-slate-900" />
                    )}
                  </div>

                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white text-sm group-hover:text-[#0A66C2] dark:group-hover:text-[#378FE9] group-hover:underline">
                      {activeConv.participant.name}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                      {activeConv.participant.headline}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-full font-bold flex items-center gap-1">
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>1st Contact</span>
                  </span>
                </div>
              </div>

              {/* Chat Thread Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {activeConv.messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex items-end gap-2 max-w-[80%] ${
                      msg.isMe ? "ml-auto flex-row-reverse" : "mr-auto"
                    }`}
                  >
                    {!msg.isMe && (
                      <img
                        src={msg.senderAvatar}
                        alt={msg.senderName}
                        className="w-7 h-7 rounded-full object-cover"
                      />
                    )}

                    <div
                      className={`p-3 rounded-2xl text-xs space-y-1 ${
                        msg.isMe
                          ? "bg-[#0A66C2] text-white rounded-br-xs"
                          : "bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-bl-xs shadow-2xs"
                      }`}
                    >
                      <p className="leading-relaxed whitespace-pre-line">{msg.text}</p>
                      <div
                        className={`text-[9px] flex items-center justify-end gap-1 ${
                          msg.isMe ? "text-blue-100" : "text-slate-400"
                        }`}
                      >
                        <span>{msg.createdAt}</span>
                        {msg.isMe && <CheckCheck className="w-3 h-3" />}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* AI Smart Replies Bar */}
              <div className="px-4 py-2 bg-indigo-50/50 dark:bg-indigo-950/20 border-t border-indigo-100 dark:border-indigo-900/40">
                <div className="flex items-center gap-1 text-[11px] font-bold text-indigo-700 dark:text-indigo-300 mb-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Gemini AI Quick Replies:</span>
                  {isSmartReplyLoading && <Loader2 className="w-3 h-3 animate-spin ml-1" />}
                </div>

                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {smartReplies.map((reply, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSend(reply)}
                      className="text-xs bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-medium px-3 py-1 rounded-full border border-indigo-200 dark:border-indigo-800 hover:border-[#0A66C2] hover:bg-blue-50 dark:hover:bg-blue-950/50 transition-colors whitespace-nowrap shadow-2xs"
                    >
                      "{reply}"
                    </button>
                  ))}
                </div>
              </div>

              {/* Attachment Preview if any */}
              {attachmentImage && (
                <div className="px-4 py-2 bg-slate-100 dark:bg-slate-800 flex items-center justify-between">
                  <span className="text-xs text-slate-700 dark:text-slate-300 font-semibold flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-[#0A66C2]" />
                    <span>Image Attached</span>
                  </span>
                  <button
                    onClick={() => setAttachmentImage(null)}
                    className="p-1 hover:text-red-500"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Message Input Controls */}
              <div className="p-3 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
                <button
                  onClick={() =>
                    setAttachmentImage(
                      "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&auto=format&fit=crop&q=80"
                    )
                  }
                  className="p-2 text-slate-400 hover:text-[#0A66C2] rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
                  title="Attach Photo"
                >
                  <ImageIcon className="w-4 h-4" />
                </button>

                <input
                  type="text"
                  placeholder={`Write a message to ${activeConv.participant.name}...`}
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  className="flex-1 px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-full text-xs text-slate-900 dark:text-slate-100 border border-transparent focus:outline-hidden focus:border-[#0A66C2]"
                />

                <button
                  onClick={() => handleSend()}
                  disabled={!inputMessage.trim() && !attachmentImage}
                  className="p-2 bg-[#0A66C2] hover:bg-[#004182] text-white rounded-full transition-colors disabled:opacity-40 shadow-xs"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-3">
              <MessageSquare className="w-12 h-12 text-slate-300" />
              <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                No conversation selected
              </p>
              <button
                onClick={() => setShowNewChatModal(true)}
                className="px-5 py-2 bg-[#0A66C2] text-white font-bold text-xs rounded-full shadow-md"
              >
                Select a Contact to Message
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Start New Conversation Modal */}
      {showNewChatModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-[#0A66C2]" />
                <span>New Private Message</span>
              </h3>
              <button
                onClick={() => setShowNewChatModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Select a 1st-degree connection from your contacts list to open a private message thread:
            </p>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search connected contacts..."
                value={contactSearchQuery}
                onChange={(e) => setContactSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs text-slate-900 dark:text-slate-100 border border-transparent focus:border-[#0A66C2] focus:outline-hidden"
              />
            </div>

            <div className="max-h-60 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
              {filteredContacts.length > 0 ? (
                filteredContacts.map((contact) => (
                  <div
                    key={contact.id}
                    onClick={() => {
                      onStartNewConversation(contact);
                      setShowNewChatModal(false);
                    }}
                    className="p-3 flex items-center justify-between hover:bg-blue-50 dark:hover:bg-slate-800 rounded-xl cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={contact.avatar}
                        alt={contact.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div>
                        <h4 className="font-bold text-xs text-slate-900 dark:text-white">
                          {contact.name}
                        </h4>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
                          {contact.headline}
                        </p>
                      </div>
                    </div>

                    <button className="px-3 py-1 bg-[#0A66C2] text-white text-[11px] font-bold rounded-full">
                      Chat
                    </button>
                  </div>
                ))
              ) : (
                <p className="p-4 text-center text-xs text-slate-400">
                  No contacts found matching "{contactSearchQuery}".
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
