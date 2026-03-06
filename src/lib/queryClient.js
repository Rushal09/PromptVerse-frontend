import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes - data considered fresh
      gcTime: 10 * 60 * 1000, // 10 minutes - garbage collection time (formerly cacheTime)
      retry: (failureCount, error) => {
        // Don't retry on 401, 403, 404
        if (
          error?.response?.status === 401 ||
          error?.response?.status === 403 ||
          error?.response?.status === 404
        ) {
          return false;
        }
        return failureCount < 3;
      },
      refetchOnWindowFocus: false,
      refetchOnMount: false, // Don't refetch on mount if data is still fresh
      refetchOnReconnect: false, // Don't refetch on reconnect if data is still fresh
    },
    mutations: {
      retry: 1,
    },
  },
});

// Query key factory pattern
export const queryKeys = {
  // Auth
  auth: ["auth"],
  profile: () => [...queryKeys.auth, "profile"],

  // Users
  users: ["users"],
  userList: (filters) => [...queryKeys.users, "list", filters],
  userDetail: (id) => [...queryKeys.users, "detail", id],

  // Prompts
  prompts: ["prompts"],
  promptList: (filters) => [...queryKeys.prompts, "list", filters],
  promptDetail: (id) => [...queryKeys.prompts, "detail", id],
  myPrompts: () => [...queryKeys.prompts, "my"],

  // Credits
  credits: ["credits"],
  creditBalance: () => [...queryKeys.credits, "balance"],
  creditHistory: (page) => [...queryKeys.credits, "history", page],
};
