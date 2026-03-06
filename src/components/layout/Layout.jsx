import React from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";
import { useUIStore } from "../../stores/uiStore";
import { cn } from "../../lib/utils";

export default function Layout({ children }) {
  const { isSidebarOpen } = useUIStore();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      <Header />
      <div className="flex pt-4 pl-2">
        <Sidebar />
        <main
          className={cn(
            "flex-1 transition-all duration-300 ease-in-out min-h-[calc(100vh-4rem)]"
          )}
        >
          <div className="w-full">{children}</div>
        </main>
      </div>
    </div>
  );
}
