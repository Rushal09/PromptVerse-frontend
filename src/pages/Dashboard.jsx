import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "../stores/authStore";
import PromptCard from "../components/prompts/PromptCard";
import { Button } from "../components/ui/button";
import {
  Plus,
  TrendingUp,
  Users,
  Star,
  Zap,
  Crown,
  ArrowRight,
  Sparkles,
  Heart,
  Eye,
  MessageCircle,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { promptAPI } from "../services/prompts";
import { userAPI } from "../services/users";

export default function Dashboard() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("trending");

  // Fetch all prompts (increased limit to show more prompts)
  const { data: promptsData, isLoading: isLoadingPrompts } = useQuery({
    queryKey: ["dashboard-prompts"],
    queryFn: () => promptAPI.getAllPrompts({ limit: 100 }), // Fetch up to 100 prompts
  });

  // Fetch current user's data for stats
  const { data: currentUserData } = useQuery({
    queryKey: ["current-user-profile"],
    queryFn: userAPI.getCurrentUser,
  });

  const prompts = promptsData?.prompts || [];

  // Calculate stats
  const trendingPrompts = prompts
    .sort((a, b) => (b.views || 0) - (a.views || 0))
    .slice(0, 8);

  const popularPrompts = prompts
    .sort((a, b) => (b.likes?.length || 0) - (a.likes?.length || 0))
    .slice(0, 8);

  const latestPrompts = prompts
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 8);

  const displayPrompts =
    activeTab === "trending"
      ? trendingPrompts
      : activeTab === "popular"
      ? popularPrompts
      : latestPrompts;

  const stats = [
    {
      title: "My Prompts",
      value: currentUserData?.user?.promptCount || "0",
      icon: Star,
      gradient: "from-blue-500 to-cyan-500",
      bgGradient:
        "from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20",
    },
    {
      title: "Total Likes",
      value: currentUserData?.user?.totalLikes || "0",
      icon: Heart,
      gradient: "from-pink-500 to-rose-500",
      bgGradient:
        "from-pink-50 to-rose-50 dark:from-pink-900/20 dark:to-rose-900/20",
    },
    {
      title: "Followers",
      value: currentUserData?.user?.followers?.length || "0",
      icon: Users,
      gradient: "from-purple-500 to-indigo-500",
      bgGradient:
        "from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20",
    },
    {
      title: "Credits",
      value: currentUserData?.user?.balance || "0",
      icon: Zap,
      gradient: "from-amber-500 to-orange-500",
      bgGradient:
        "from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20",
    },
  ];

  const tabs = [
    { id: "trending", label: "Trending", icon: TrendingUp },
    { id: "popular", label: "Most Liked", icon: Heart },
    { id: "latest", label: "Latest", icon: Sparkles },
  ];

  return (
    <div className="max-w-none">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500 rounded-2xl p-8 mb-8 text-white">
        {/* Animated background */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
          <div className="absolute top-0 -right-4 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"></div>
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="h-6 w-6" />
            <span className="text-sm font-semibold uppercase tracking-wider">
              Welcome back!
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-3">
            Hello, {user?.username || "Creator"}! 👋
          </h1>
          <p className="text-lg text-blue-100 mb-6 max-w-2xl">
            Discover amazing AI prompts, create your own masterpieces, and
            connect with a vibrant community of creators.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link to="/create-prompt">
              <Button
                size="lg"
                className="bg-white text-purple-600 hover:bg-gray-100 font-semibold shadow-lg"
              >
                <Plus className="h-5 w-5 mr-2" />
                Create Prompt
              </Button>
            </Link>
            <Link to="/explore">
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-white text-white hover:bg-white/10 font-semibold"
              >
                Explore All
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Prompts Section */}
      <div className="bg-white dark:bg-slate-950 rounded-xl border p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Discover Prompts
          </h2>
          <Link to="/explore">
            <Button variant="outline" size="sm">
              View All
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b pb-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                activeTab === tab.id
                  ? "bg-blue-500 text-white shadow-md"
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800"
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Prompts Grid */}
        {isLoadingPrompts ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="bg-white dark:bg-slate-950 rounded-lg border animate-pulse"
              >
                <div className="aspect-video bg-gray-200 dark:bg-slate-800 rounded-t-lg"></div>
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-gray-200 dark:bg-slate-800 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 dark:bg-slate-800 rounded w-full"></div>
                  <div className="h-3 bg-gray-200 dark:bg-slate-800 rounded w-5/6"></div>
                </div>
              </div>
            ))}
          </div>
        ) : displayPrompts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {displayPrompts.map((prompt) => (
              <PromptCard key={prompt._id} prompt={prompt} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-500 dark:text-gray-400 mb-4">
              <Star className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">No prompts found</p>
              <p className="text-sm">Be the first to create a prompt!</p>
            </div>
            <Link to="/create-prompt">
              <Button className="mt-4">
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Prompt
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
