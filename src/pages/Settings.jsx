import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  User,
  Lock,
  Bell,
  Shield,
  Trash2,
  Save,
  AlertTriangle,
  Loader2,
  Camera,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Card } from "../components/ui/card";
import { authApi } from "../services/auth";
import { useAuthStore } from "../stores/authStore";
import api from "../lib/axios";

// Validation schemas
const profileSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  bio: z.string().max(250, "Bio must be less than 250 characters").optional(),
  profilePicture: z.string().optional(),
});

const passwordSchema = z
  .object({
    currentPassword: z
      .string()
      .min(6, "Password must be at least 6 characters"),
    newPassword: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export default function Settings() {
  const [activeTab, setActiveTab] = useState("profile");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const { user, setUser, logout } = useAuthStore();
  const queryClient = useQueryClient();

  const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "account", label: "Account", icon: Lock },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "privacy", label: "Privacy", icon: Shield },
    { id: "danger", label: "Danger Zone", icon: AlertTriangle },
  ];

  // Fetch current user profile
  const { data: profile, isLoading } = useQuery({
    queryKey: ["user-profile"],
    queryFn: () => authApi.getProfile(),
    staleTime: 5 * 60 * 1000,
  });

  // Profile Section Component
  const ProfileSection = () => {
    const {
      register,
      handleSubmit,
      formState: { errors, isDirty },
    } = useForm({
      resolver: zodResolver(profileSchema),
      defaultValues: {
        username: profile?.user?.username || "",
        bio: profile?.user?.bio || "",
        profilePicture: profile?.user?.profilePicture || "",
      },
    });

    const updateProfileMutation = useMutation({
      mutationFn: (data) => api.put("/user/update", data),
      onSuccess: (response) => {
        toast.success("Profile updated successfully");
        queryClient.invalidateQueries(["user-profile"]);
        if (response.data.user) {
          setUser(response.data.user);
        }
      },
      onError: (error) => {
        toast.error(
          error.response?.data?.message || "Failed to update profile"
        );
      },
    });

    const onSubmit = (data) => {
      updateProfileMutation.mutate(data);
    };

    const bioLength = profile?.user?.bio?.length || 0;

    return (
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-6">Profile Settings</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Profile Picture */}
          <div className="flex items-center gap-6">
            <div className="relative">
              <img
                src={
                  profile?.user?.profilePicture ||
                  "https://via.placeholder.com/100"
                }
                alt="Profile"
                className="w-24 h-24 rounded-full object-cover"
              />
              <button
                type="button"
                className="absolute bottom-0 right-0 p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
              >
                <Camera className="h-4 w-4" />
              </button>
            </div>
            <div>
              <Label>Profile Picture</Label>
              <p className="text-sm text-gray-500 mt-1">
                Click the camera icon to change your profile picture
              </p>
            </div>
          </div>

          {/* Username */}
          <div>
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              {...register("username")}
              className={errors.username ? "border-red-500" : ""}
            />
            {errors.username && (
              <p className="text-sm text-red-600 mt-1">
                {errors.username.message}
              </p>
            )}
          </div>

          {/* Bio */}
          <div>
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              rows={4}
              placeholder="Tell us about yourself..."
              {...register("bio")}
              className={errors.bio ? "border-red-500" : ""}
            />
            <div className="flex justify-between mt-1">
              {errors.bio && (
                <p className="text-sm text-red-600">{errors.bio.message}</p>
              )}
              <p className="text-sm text-gray-500 ml-auto">{bioLength}/250</p>
            </div>
          </div>

          {/* Save Button */}
          <Button
            type="submit"
            disabled={!isDirty || updateProfileMutation.isLoading}
          >
            {updateProfileMutation.isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </form>
      </Card>
    );
  };

  // Account Section Component
  const AccountSection = () => {
    const {
      register,
      handleSubmit,
      reset,
      formState: { errors },
    } = useForm({
      resolver: zodResolver(passwordSchema),
    });

    const changePasswordMutation = useMutation({
      mutationFn: (data) => api.put("/user/change-password", data),
      onSuccess: () => {
        toast.success("Password changed successfully");
        reset();
      },
      onError: (error) => {
        toast.error(
          error.response?.data?.message || "Failed to change password"
        );
      },
    });

    const onSubmit = (data) => {
      changePasswordMutation.mutate({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
    };

    return (
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-6">Account Settings</h2>

        {/* Email (Read-only) */}
        <div className="mb-6">
          <Label>Email Address</Label>
          <Input
            value={profile?.user?.email || ""}
            disabled
            className="bg-gray-50 dark:bg-slate-900"
          />
          <p className="text-sm text-gray-500 mt-1">
            Email address cannot be changed
          </p>
        </div>

        {/* Mobile Number (Read-only) */}
        <div className="mb-6">
          <Label>Mobile Number</Label>
          <Input
            value={profile?.user?.mobileNumber || ""}
            disabled
            className="bg-gray-50 dark:bg-slate-900"
          />
        </div>

        {/* Change Password */}
        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold mb-4">Change Password</h3>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="currentPassword">Current Password</Label>
              <Input
                id="currentPassword"
                type="password"
                {...register("currentPassword")}
                className={errors.currentPassword ? "border-red-500" : ""}
              />
              {errors.currentPassword && (
                <p className="text-sm text-red-600 mt-1">
                  {errors.currentPassword.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                {...register("newPassword")}
                className={errors.newPassword ? "border-red-500" : ""}
              />
              {errors.newPassword && (
                <p className="text-sm text-red-600 mt-1">
                  {errors.newPassword.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                {...register("confirmPassword")}
                className={errors.confirmPassword ? "border-red-500" : ""}
              />
              {errors.confirmPassword && (
                <p className="text-sm text-red-600 mt-1">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            <Button type="submit" disabled={changePasswordMutation.isLoading}>
              {changePasswordMutation.isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Password"
              )}
            </Button>
          </form>
        </div>
      </Card>
    );
  };

  // Notifications Section
  const NotificationsSection = () => {
    const [notifications, setNotifications] = useState({
      emailNewPrompt: true,
      emailComments: true,
      emailLikes: false,
      emailFollowers: true,
      emailPurchases: true,
    });

    const toggleNotification = (key) => {
      setNotifications((prev) => ({
        ...prev,
        [key]: !prev[key],
      }));
      toast.success("Notification preferences updated");
    };

    return (
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-6">Notification Preferences</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">New Prompts from Followed Users</p>
              <p className="text-sm text-gray-500">
                Get notified when someone you follow creates a new prompt
              </p>
            </div>
            <button
              onClick={() => toggleNotification("emailNewPrompt")}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                notifications.emailNewPrompt
                  ? "bg-blue-600"
                  : "bg-gray-200 dark:bg-gray-700"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  notifications.emailNewPrompt
                    ? "translate-x-6"
                    : "translate-x-1"
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Comments on Your Prompts</p>
              <p className="text-sm text-gray-500">
                Get notified when someone comments on your prompts
              </p>
            </div>
            <button
              onClick={() => toggleNotification("emailComments")}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                notifications.emailComments
                  ? "bg-blue-600"
                  : "bg-gray-200 dark:bg-gray-700"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  notifications.emailComments
                    ? "translate-x-6"
                    : "translate-x-1"
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Likes on Your Prompts</p>
              <p className="text-sm text-gray-500">
                Get notified when someone likes your prompts
              </p>
            </div>
            <button
              onClick={() => toggleNotification("emailLikes")}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                notifications.emailLikes
                  ? "bg-blue-600"
                  : "bg-gray-200 dark:bg-gray-700"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  notifications.emailLikes ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">New Followers</p>
              <p className="text-sm text-gray-500">
                Get notified when someone follows you
              </p>
            </div>
            <button
              onClick={() => toggleNotification("emailFollowers")}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                notifications.emailFollowers
                  ? "bg-blue-600"
                  : "bg-gray-200 dark:bg-gray-700"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  notifications.emailFollowers
                    ? "translate-x-6"
                    : "translate-x-1"
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Prompt Purchases</p>
              <p className="text-sm text-gray-500">
                Get notified when someone purchases your prompt
              </p>
            </div>
            <button
              onClick={() => toggleNotification("emailPurchases")}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                notifications.emailPurchases
                  ? "bg-blue-600"
                  : "bg-gray-200 dark:bg-gray-700"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  notifications.emailPurchases
                    ? "translate-x-6"
                    : "translate-x-1"
                }`}
              />
            </button>
          </div>
        </div>
      </Card>
    );
  };

  // Privacy Section
  const PrivacySection = () => {
    const [privacy, setPrivacy] = useState({
      profileVisible: true,
      showEmail: false,
      showFollowers: true,
      showLiked: false,
    });

    const togglePrivacy = (key) => {
      setPrivacy((prev) => ({
        ...prev,
        [key]: !prev[key],
      }));
      toast.success("Privacy settings updated");
    };

    return (
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-6">Privacy Settings</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Public Profile</p>
              <p className="text-sm text-gray-500">
                Make your profile visible to everyone
              </p>
            </div>
            <button
              onClick={() => togglePrivacy("profileVisible")}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                privacy.profileVisible
                  ? "bg-blue-600"
                  : "bg-gray-200 dark:bg-gray-700"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  privacy.profileVisible ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Show Email Address</p>
              <p className="text-sm text-gray-500">
                Display your email on your profile
              </p>
            </div>
            <button
              onClick={() => togglePrivacy("showEmail")}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                privacy.showEmail
                  ? "bg-blue-600"
                  : "bg-gray-200 dark:bg-gray-700"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  privacy.showEmail ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Show Followers/Following</p>
              <p className="text-sm text-gray-500">
                Display your followers and following lists
              </p>
            </div>
            <button
              onClick={() => togglePrivacy("showFollowers")}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                privacy.showFollowers
                  ? "bg-blue-600"
                  : "bg-gray-200 dark:bg-gray-700"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  privacy.showFollowers ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Show Liked Prompts</p>
              <p className="text-sm text-gray-500">
                Display prompts you've liked on your profile
              </p>
            </div>
            <button
              onClick={() => togglePrivacy("showLiked")}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                privacy.showLiked
                  ? "bg-blue-600"
                  : "bg-gray-200 dark:bg-gray-700"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  privacy.showLiked ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>
        </div>
      </Card>
    );
  };

  // Danger Zone Section
  const DangerSection = () => {
    const deleteAccountMutation = useMutation({
      mutationFn: () => api.delete("/user/delete"),
      onSuccess: () => {
        toast.success("Account deleted successfully");
        logout();
      },
      onError: (error) => {
        toast.error(
          error.response?.data?.message || "Failed to delete account"
        );
      },
    });

    const handleDeleteAccount = () => {
      if (deleteConfirmText === "DELETE") {
        deleteAccountMutation.mutate();
      } else {
        toast.error("Please type DELETE to confirm");
      }
    };

    return (
      <Card className="p-6 border-red-200 dark:border-red-900">
        <h2 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-6">
          Danger Zone
        </h2>

        <div className="space-y-6">
          <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
            <h3 className="font-semibold text-red-900 dark:text-red-100 mb-2 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Delete Account
            </h3>
            <p className="text-sm text-red-700 dark:text-red-300 mb-4">
              Once you delete your account, there is no going back. This will
              permanently delete your profile, prompts, and all associated data.
            </p>
            <Button
              variant="outline"
              className="border-red-600 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30"
              onClick={() => setShowDeleteConfirm(true)}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Account
            </Button>
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <Card className="max-w-md w-full p-6">
              <h3 className="text-xl font-bold text-red-600 mb-4">
                Are you absolutely sure?
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                This action cannot be undone. This will permanently delete your
                account and remove all your data from our servers.
              </p>
              <p className="text-sm font-medium mb-2">
                Please type <strong>DELETE</strong> to confirm:
              </p>
              <Input
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder="Type DELETE here"
                className="mb-4"
              />
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setDeleteConfirmText("");
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleDeleteAccount}
                  disabled={
                    deleteConfirmText !== "DELETE" ||
                    deleteAccountMutation.isLoading
                  }
                  className="flex-1 bg-red-600 hover:bg-red-700"
                >
                  {deleteAccountMutation.isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    "Delete Account"
                  )}
                </Button>
              </div>
            </Card>
          </div>
        )}
      </Card>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen px-6 py-6">
        <div className="max-w-5xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 dark:bg-slate-800 rounded w-1/4" />
            <div className="h-64 bg-gray-200 dark:bg-slate-800 rounded" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-6 py-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Settings
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your account settings and preferences
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Tabs Sidebar */}
          <div className="lg:col-span-1">
            <Card className="p-2">
              <nav className="space-y-1">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                        activeTab === tab.id
                          ? "bg-blue-600 text-white"
                          : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800"
                      } ${
                        tab.id === "danger" && activeTab !== "danger"
                          ? "text-red-600"
                          : ""
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      <span className="font-medium">{tab.label}</span>
                    </button>
                  );
                })}
              </nav>
            </Card>
          </div>

          {/* Content Area */}
          <div className="lg:col-span-3">
            {activeTab === "profile" && <ProfileSection />}
            {activeTab === "account" && <AccountSection />}
            {activeTab === "notifications" && <NotificationsSection />}
            {activeTab === "privacy" && <PrivacySection />}
            {activeTab === "danger" && <DangerSection />}
          </div>
        </div>
      </div>
    </div>
  );
}
