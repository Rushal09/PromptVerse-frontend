import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Home,
  Search,
  Plus,
  User,
  Wallet,
  Heart,
  Bookmark,
  Settings,
  TrendingUp,
  Users,
} from "lucide-react";
import { useUIStore } from "../../stores/uiStore";
import { cn } from "../../lib/utils";

const sidebarItems = [
  { icon: Home, label: "Dashboard", path: "/dashboard" },
  { icon: Search, label: "Explore", path: "/explore" },
  { icon: Plus, label: "Create", path: "/create-prompt" },
  { icon: Wallet, label: "Credits", path: "/credits" },
  { icon: Settings, label: "Settings", path: "/settings" },
];

export default function Sidebar() {
  const location = useLocation();
  const { isSidebarOpen, isMobileMenuOpen, setMobileMenuOpen } = useUIStore();

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-16 left-0 z-50 h-[calc(100vh-4rem)] w-56 bg-white dark:bg-slate-950 border-r transition-transform duration-300 ease-in-out md:translate-x-0",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full",
          !isSidebarOpen && "md:-translate-x-full"
        )}
      >
        <nav className="p-3 space-y-1">
          {sidebarItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;

            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  "flex items-center space-x-2 px-3 py-2.5 rounded-lg transition-colors text-sm",
                  isActive
                    ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                    : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-slate-800"
                )}
              >
                <Icon className="h-5 w-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main content spacing */}
      <div
        className={cn(
          "transition-all duration-300 ease-in-out md:ml-0",
          isSidebarOpen && "md:ml-56"
        )}
      />
    </>
  );
}
