import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Link as LinkIcon,
  Edit,
  Users,
  Heart,
  FileText,
  Award,
  Settings,
  UserPlus,
  UserMinus,
  Loader2,
} from "lucide-react";
import { useAuthStore } from "../stores/authStore";
import { userAPI } from "../services/users";
import { promptAPI } from "../services/prompts";
import { toast } from "sonner";
import PromptCard from "../components/prompts/PromptCard";
import { useNavigate } from "react-router-dom";

export default function Profile() {
  const { user: currentUser } = useAuthStore();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("prompts");

  // Fetch current user profile
  const { data: profileData, isLoading: isLoadingProfile } = useQuery({
    queryKey: ["current-user-profile"],
    queryFn: userAPI.getCurrentUser,
    staleTime: 1 * 60 * 1000, // 1 minute - keep in sync with other pages
  });

  // Fetch user's prompts
  const { data: promptsData = [], isLoading: isLoadingPrompts } = useQuery({
    queryKey: ["user-prompts"],
    queryFn: promptAPI.getMyPrompts,
  });

  const user = profileData?.user || currentUser;

  const stats = [
    {
      label: "Prompts",
      value: promptsData.length || 0,
      icon: FileText,
      color: "text-blue-500",
      bg: "bg-blue-100 dark:bg-blue-900",
    },
    {
      label: "Followers",
      value: user?.followers?.length || 0,
      icon: Users,
      color: "text-purple-500",
      bg: "bg-purple-100 dark:bg-purple-900",
    },
    {
      label: "Following",
      value: user?.following?.length || 0,
      icon: UserPlus,
      color: "text-green-500",
      bg: "bg-green-100 dark:bg-green-900",
    },
    {
      label: "Likes",
      value: promptsData.reduce((sum, p) => sum + (p.likes?.length || 0), 0),
      icon: Heart,
      color: "text-red-500",
      bg: "bg-red-100 dark:bg-red-900",
    },
  ];

  const tabs = [
    { id: "prompts", label: "My Prompts", icon: FileText },
    { id: "liked", label: "Liked", icon: Heart },
    { id: "about", label: "About", icon: User },
  ];

  if (isLoadingProfile) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="max-w-none">
      {/* Cover & Profile Section */}
      <div className="relative">
        {/* Cover Image */}
        <div className="h-48 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-t-lg" />

        {/* Profile Info */}
        <div className="bg-white dark:bg-slate-950 border-x border-b rounded-b-lg">
          <div className="px-6 pb-6">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between -mt-16 mb-4">
              {/* Avatar */}
              <div className="flex items-end space-x-4">
                <div className="relative">
                  <img
                    src={
                      user?.profilePicture ||
                      `https://ui-avatars.com/api/?name=${user?.username}&size=128&background=random`
                    }
                    alt={user?.username}
                    className="h-32 w-32 rounded-full border-4 border-white dark:border-slate-950 bg-white"
                  />
                  {user?.userType === "admin" && (
                    <div className="absolute bottom-2 right-2 bg-blue-500 rounded-full p-1">
                      <Award className="h-4 w-4 text-white" />
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-4 sm:mt-0 flex space-x-3">
                <button
                  onClick={() => navigate("/settings")}
                  className="inline-flex items-center space-x-2 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
                >
                  <Settings className="h-4 w-4" />
                  <span>Edit Profile</span>
                </button>
              </div>
            </div>

            {/* User Info */}
            <div className="space-y-3">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {user?.username}
                </h1>
                {user?.bio && (
                  <p className="text-gray-600 dark:text-gray-400 mt-2">
                    {user.bio}
                  </p>
                )}
              </div>

              {/* Meta Info */}
              <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
                {user?.email && (
                  <div className="flex items-center space-x-1.5">
                    <Mail className="h-4 w-4" />
                    <span>{user.email}</span>
                  </div>
                )}
                {user?.mobileNumber && (
                  <div className="flex items-center space-x-1.5">
                    <Phone className="h-4 w-4" />
                    <span>{user.mobileNumber}</span>
                  </div>
                )}
                <div className="flex items-center space-x-1.5">
                  <Calendar className="h-4 w-4" />
                  <span>
                    Joined{" "}
                    {new Date(user?.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 my-6">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-white dark:bg-slate-950 p-6 rounded-lg border hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {stat.label}
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {stat.value}
                </p>
              </div>
              <div className={`${stat.bg} p-3 rounded-lg`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-slate-950 border rounded-lg">
        <div className="border-b">
          <div className="flex space-x-8 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-4 border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? "border-blue-500 text-blue-600 dark:text-blue-400"
                    : "border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                <tab.icon className="h-5 w-5" />
                <span className="font-medium">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === "prompts" && (
            <div>
              {isLoadingPrompts ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                </div>
              ) : promptsData.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {promptsData.map((prompt) => (
                    <PromptCard key={prompt._id} prompt={prompt} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    No prompts yet
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Start creating and sharing prompts with the community
                  </p>
                  <button
                    onClick={() => navigate("/create-prompt")}
                    className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    <FileText className="h-4 w-4" />
                    <span>Create Your First Prompt</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === "liked" && (
            <div className="text-center py-12">
              <Heart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                No liked prompts
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Prompts you like will appear here
              </p>
            </div>
          )}

          {activeTab === "about" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  About
                </h3>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <User className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Username
                      </p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {user?.username}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Mail className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Email
                      </p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {user?.email}
                      </p>
                    </div>
                  </div>
                  {user?.mobileNumber && (
                    <div className="flex items-start space-x-3">
                      <Phone className="h-5 w-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Phone
                        </p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {user.mobileNumber}
                        </p>
                      </div>
                    </div>
                  )}
                  <div className="flex items-start space-x-3">
                    <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Member Since
                      </p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {new Date(user?.createdAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                  {user?.userType && (
                    <div className="flex items-start space-x-3">
                      <Award className="h-5 w-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Account Type
                        </p>
                        <p className="font-medium text-gray-900 dark:text-white capitalize">
                          {user.userType}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
