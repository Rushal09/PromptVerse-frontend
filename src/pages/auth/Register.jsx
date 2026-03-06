import React from "react";
import { Navigate } from "react-router-dom";
import RegisterForm from "../../components/auth/RegisterForm";
import { useAuthStore } from "../../stores/authStore";
import { Sparkles, Users, Shield, Award } from "lucide-react";

export default function RegisterPage() {
  const { isAuthenticated } = useAuthStore();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Left Side - Branding & Benefits */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden p-12 flex-col justify-between">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600 to-blue-600 opacity-90" />
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
            Join the AI revolution today
          </h2>

          <p className="text-xl text-purple-100 mb-8">
            Create, share, and monetize your AI prompts with a global community
            of innovators.
          </p>

          {/* Benefits */}
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center flex-shrink-0">
                <Users className="w-5 h-5 text-blue-300" />
              </div>
              <div>
                <h3 className="text-white font-semibold mb-1">
                  Growing Community
                </h3>
                <p className="text-purple-100 text-sm">
                  Connect with thousands of AI enthusiasts and creators
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center flex-shrink-0">
                <Shield className="w-5 h-5 text-green-300" />
              </div>
              <div>
                <h3 className="text-white font-semibold mb-1">
                  Secure Platform
                </h3>
                <p className="text-purple-100 text-sm">
                  Your data and creations are protected with enterprise-grade
                  security
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center flex-shrink-0">
                <Award className="w-5 h-5 text-yellow-300" />
              </div>
              <div>
                <h3 className="text-white font-semibold mb-1">Earn Revenue</h3>
                <p className="text-purple-100 text-sm">
                  Monetize your best prompts and build a passive income stream
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10 text-purple-100 text-sm">
          © 2025 PromptVerse. All rights reserved.
        </div>
      </div>

      {/* Right Side - Register Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="inline-flex items-center gap-2 mb-2">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                PromptVerse
              </h1>
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              Join the AI Prompt Community
            </p>
          </div>

          <RegisterForm />
        </div>
      </div>
    </div>
  );
}
