import React from "react";
import { Navigate } from "react-router-dom";
import LoginForm from "../../components/auth/LoginForm";
import { useAuthStore } from "../../stores/authStore";
import { Sparkles, Zap, TrendingUp } from "lucide-react";

export default function LoginPage() {
  const { isAuthenticated } = useAuthStore();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Left Side - Branding & Features */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden p-12 flex-col justify-between">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-purple-600 opacity-90" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzBoMnYyaC0ydi0yem0wLTZoMnYyaC0ydi0yem02IDZoMnYyaC0ydi0yem0tNiA2aDJ2MmgtMnYtMnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-10" />

        {/* Content */}
        <div className="relative z-10">
          <div className="flex items-center gap-3 text-white mb-8">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <Sparkles className="w-6 h-6" />
            </div>
            <h1 className="text-3xl font-bold">PromptVerse</h1>
          </div>

          <h2 className="text-4xl font-bold text-white mb-6 leading-tight">
            Welcome back to the future of AI prompts
          </h2>

          <p className="text-xl text-blue-100 mb-8">
            Access thousands of premium AI prompts and join our thriving
            community of creators.
          </p>

          {/* Features */}
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center flex-shrink-0">
                <Zap className="w-5 h-5 text-yellow-300" />
              </div>
              <div>
                <h3 className="text-white font-semibold mb-1">
                  Instant Access
                </h3>
                <p className="text-blue-100 text-sm">
                  Get immediate access to premium prompts and start creating
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-5 h-5 text-green-300" />
              </div>
              <div>
                <h3 className="text-white font-semibold mb-1">
                  Trending Prompts
                </h3>
                <p className="text-blue-100 text-sm">
                  Discover what's hot in the AI community
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10 text-blue-100 text-sm">
          © 2025 PromptVerse. All rights reserved.
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="inline-flex items-center gap-2 mb-2">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                PromptVerse
              </h1>
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              Your AI Prompt Marketplace
            </p>
          </div>

          <LoginForm />
        </div>
      </div>
    </div>
  );
}
