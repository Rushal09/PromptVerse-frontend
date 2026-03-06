import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useThemeStore = create(
  persist(
    (set, get) => ({
      theme: "light",

      setTheme: (theme) => {
        set({ theme });
        document.documentElement.setAttribute("data-theme", theme);
      },

      toggleTheme: () => {
        const { theme } = get();
        const newTheme = theme === "light" ? "dark" : "light";
        get().setTheme(newTheme);
      },

      initializeTheme: () => {
        const { theme } = get();
        // Check for system preference if no stored theme
        if (!theme) {
          const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
            .matches
            ? "dark"
            : "light";
          set({ theme: systemTheme });
          document.documentElement.setAttribute("data-theme", systemTheme);
        } else {
          document.documentElement.setAttribute("data-theme", theme);
        }
      },
    }),
    {
      name: "theme-storage",
    }
  )
);

export const useUIStore = create((set) => ({
  // Mobile menu
  isMobileMenuOpen: false,
  setMobileMenuOpen: (open) => set({ isMobileMenuOpen: open }),
  toggleMobileMenu: () =>
    set((state) => ({ isMobileMenuOpen: !state.isMobileMenuOpen })),

  // Sidebar
  isSidebarOpen: true,
  setSidebarOpen: (open) => set({ isSidebarOpen: open }),
  toggleSidebar: () =>
    set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),

  // Search
  searchQuery: "",
  setSearchQuery: (query) => set({ searchQuery: query }),

  // Filters
  filters: {
    category: "all",
    priceRange: "all",
    sortBy: "latest",
  },
  setFilters: (newFilters) =>
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
    })),
  resetFilters: () =>
    set({
      filters: {
        category: "all",
        priceRange: "all",
        sortBy: "latest",
      },
    }),

  // Loading states
  isPageLoading: false,
  setPageLoading: (loading) => set({ isPageLoading: loading }),
}));
