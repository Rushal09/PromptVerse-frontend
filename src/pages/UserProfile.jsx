import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Link as LinkIcon,
  ArrowLeft,
  Users,
  Heart,
  FileText,
  Award,
  UserPlus,
  UserMinus,
  Loader2,
  Check,
} from "lucide-react";
import { useAuthStore } from "../stores/authStore";
import { userAPI } from "../services/users";
import { promptAPI } from "../services/prompts";
import { toast } from "sonner";
import PromptCard from "../components/prompts/PromptCard";
import { Button } from "../components/ui/button";

export default function UserProfile() {
  const { userId } = useParams();
  const { user: currentUser, updateUser } = useAuthStore();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("prompts");

  // If viewing own profile, redirect to /profile
  if (userId === currentUser?.id) {
    navigate("/profile", { replace: true });
    return null;
  }

  // Fetch current user's profile to get latest following list
  const { data: currentUserProfile } = useQuery({
    queryKey: ["current-user-profile"],
    queryFn: userAPI.getCurrentUser,
    staleTime: 1 * 60 * 1000, // 1 minute
  });

  // Fetch user profile by ID
  const {
    data: profileData,
    isLoading: isLoadingProfile,
    isError,
  } = useQuery({
    queryKey: ["user-profile", userId],
    queryFn: () => userAPI.getUserById(userId),
    enabled: !!userId,
  });

  // Fetch user's prompts
  const { data: promptsData = [], isLoading: isLoadingPrompts } = useQuery({
    queryKey: ["user-prompts", userId],
    queryFn: () => promptAPI.getPromptsByUserId(userId),
    enabled: !!userId,
  });

  // Follow/Unfollow mutation
  const followMutation = useMutation({
    mutationFn: () => userAPI.toggleFollowUser(userId),
    onSuccess: (data) => {
      // Invalidate queries to refetch fresh data
      queryClient.invalidateQueries(["user-profile", userId]);
      queryClient.invalidateQueries(["current-user-profile"]);
      queryClient.invalidateQueries(["user-profile"]); // For own profile page
      queryClient.invalidateQueries(["prompt"]); // For prompt detail pages

      // Update auth store with new following list if available
      if (currentUserProfile?.user) {
        updateUser({
          following: data.isFollowing
            ? [...(currentUserProfile.user.following || []), userId]
            : (currentUserProfile.user.following || []).filter(
                (id) => id !== userId
              ),
        });
      }

      toast.success(data.message || "Success");
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message || "Failed to update follow status"
      );
    },
  });

  const user = profileData?.user;

  // Check if current user is following this user from the fetched profile data
  const isFollowing =
    currentUserProfile?.user?.following?.includes(userId) || false;

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
    { id: "prompts", label: "Prompts", icon: FileText },
    { id: "about", label: "About", icon: User },
  ];

  if (isLoadingProfile) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
      </div>
    );
  }

  if (isError || !user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <User className="h-16 w-16 text-gray-400 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          User not found
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          This user doesn't exist or has been removed
        </p>
        <Button onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-none">
      {/* Back Button */}
      <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back
      </Button>

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

              {/* Follow Button */}
              <div className="mt-4 sm:mt-0">
                <Button
                  onClick={() => followMutation.mutate()}
                  disabled={followMutation.isPending}
                  variant={isFollowing ? "outline" : "default"}
                  size="lg"
                >
                  {followMutation.isPending ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : isFollowing ? (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Following
                    </>
                  ) : (
                    <>
                      <UserPlus className="h-4 w-4 mr-2" />
                      Follow
                    </>
                  )}
                </Button>
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
                  <p className="text-gray-600 dark:text-gray-400">
                    This user hasn't created any prompts yet
                  </p>
                </div>
              )}
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
                  {user?.bio && (
                    <div className="flex items-start space-x-3">
                      <FileText className="h-5 w-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Bio
                        </p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {user.bio}
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
