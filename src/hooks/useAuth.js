import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { authAPI } from "../services/auth";
import { useAuthStore } from "../stores/authStore";
import { queryKeys } from "../lib/queryClient";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export function useAuth() {
  const { user, isAuthenticated, setUser, setLoading, logout } = useAuthStore();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Get current user profile
  const { data: profile, isLoading: isLoadingProfile } = useQuery({
    queryKey: queryKeys.profile(),
    queryFn: authAPI.getProfile,
    enabled: isAuthenticated,
    retry: false,
    onSuccess: (data) => {
      setUser(data.user);
    },
    onError: () => {
      logout();
    },
  });

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: authAPI.login,
    onMutate: () => {
      setLoading(true);
    },
    onSuccess: (data) => {
      setUser(data.user);
      toast.success("Logged in successfully!");
      navigate("/dashboard");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Login failed");
    },
    onSettled: () => {
      setLoading(false);
    },
  });

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: authAPI.register,
    onMutate: () => {
      setLoading(true);
    },
    onSuccess: (data) => {
      setUser(data.user);
      toast.success("Account created successfully!");
      navigate("/dashboard");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Registration failed");
    },
    onSettled: () => {
      setLoading(false);
    },
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: authAPI.logout,
    onSuccess: () => {
      logout();
      queryClient.clear();
      toast.success("Logged out successfully!");
      navigate("/");
    },
    onError: () => {
      // Force logout even if API call fails
      logout();
      queryClient.clear();
      navigate("/");
    },
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: authAPI.updateProfile,
    onSuccess: (data) => {
      setUser(data.user);
      queryClient.invalidateQueries({ queryKey: queryKeys.profile() });
      toast.success("Profile updated successfully!");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to update profile");
    },
  });

  // Follow/unfollow mutation
  const followMutation = useMutation({
    mutationFn: authAPI.followUser,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.profile() });
      queryClient.invalidateQueries({ queryKey: queryKeys.users });
      toast.success(data.message);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Action failed");
    },
  });

  return {
    user,
    isAuthenticated,
    isLoading: useAuthStore((state) => state.isLoading) || isLoadingProfile,
    login: (data) => loginMutation.mutate(data),
    register: (data) => registerMutation.mutate(data),
    logout: logoutMutation.mutate,
    updateProfile: updateProfileMutation.mutate,
    followUser: followMutation.mutate,
    isLoginLoading: loginMutation.isPending,
    isRegisterLoading: registerMutation.isPending,
    isLogoutLoading: logoutMutation.isPending,
    isUpdateLoading: updateProfileMutation.isPending,
    isFollowLoading: followMutation.isPending,
  };
}

export function useUsers() {
  const queryClient = useQueryClient();

  // Get all users
  const { data: users, isLoading: isLoadingUsers } = useQuery({
    queryKey: queryKeys.userList(),
    queryFn: authAPI.getAllUsers,
  });

  // Get user by ID
  const getUserById = (userId) => {
    return useQuery({
      queryKey: queryKeys.userDetail(userId),
      queryFn: () => authAPI.getUserById(userId),
      enabled: !!userId,
    });
  };

  return {
    users: users?.users || [],
    isLoadingUsers,
    getUserById,
  };
}
