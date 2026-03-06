import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Toaster } from "sonner";
import { queryClient } from "./lib/queryClient";
import { useThemeStore } from "./stores/uiStore";

// Pages
import LoginPage from "./pages/auth/Login";
import RegisterPage from "./pages/auth/Register";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import UserProfile from "./pages/UserProfile";
import CreatePrompt from "./pages/CreatePrompt";
import PromptDetail from "./pages/PromptDetail";
import Credits from "./pages/Credits";
import Settings from "./pages/Settings";
import Explore from "./pages/Explore";
import Landing from "./pages/Landing";

// Components
import ProtectedRoute from "./components/auth/ProtectedRoute";
import Layout from "./components/layout/Layout";
import { useAuthStore } from "./stores/authStore";

function App() {
  const { initializeTheme } = useThemeStore();
  const { isAuthenticated } = useAuthStore();

  // Initialize theme on app load
  React.useEffect(() => {
    initializeTheme();
  }, [initializeTheme]);

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="App">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Protected Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Dashboard />
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Profile />
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/profile/:userId"
              element={
                <ProtectedRoute>
                  <Layout>
                    <UserProfile />
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/create-prompt"
              element={
                <ProtectedRoute>
                  <Layout>
                    <CreatePrompt />
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/prompt/:id"
              element={
                <ProtectedRoute>
                  <Layout>
                    <PromptDetail />
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/credits"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Credits />
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Settings />
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/explore"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Explore />
                  </Layout>
                </ProtectedRoute>
              }
            />

            {/* Catch all route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>

        {/* Toast notifications */}
        <Toaster position="top-right" richColors closeButton />
      </Router>

      {/* React Query Devtools */}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;
