import {
  useQuery,
  useMutation,
  useQueryClient,
  useInfiniteQuery,
} from "@tanstack/react-query";
import { promptAPI } from "../services/prompts";
import { queryKeys } from "../lib/queryClient";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export function usePrompts(filters = {}) {
  const queryClient = useQueryClient();

  // Get all prompts with filters
  const {
    data: prompts,
    isLoading: isLoadingPrompts,
    error: promptsError,
    refetch: refetchPrompts,
  } = useQuery({
    queryKey: queryKeys.promptList(filters),
    queryFn: () => promptAPI.getAllPrompts(filters),
    keepPreviousData: true,
  });

  // Get my prompts
  const {
    data: myPrompts,
    isLoading: isLoadingMyPrompts,
    refetch: refetchMyPrompts,
  } = useQuery({
    queryKey: queryKeys.myPrompts(),
    queryFn: promptAPI.getMyPrompts,
  });

  return {
    prompts: prompts?.prompts || [],
    myPrompts: myPrompts?.prompts || [],
    isLoadingPrompts,
    isLoadingMyPrompts,
    promptsError,
    refetchPrompts,
    refetchMyPrompts,
  };
}

export function usePrompt(promptId) {
  const queryClient = useQueryClient();

  // Get single prompt
  const {
    data: prompt,
    isLoading: isLoadingPrompt,
    error: promptError,
  } = useQuery({
    queryKey: queryKeys.promptDetail(promptId),
    queryFn: () => promptAPI.getPromptById(promptId),
    enabled: !!promptId,
  });

  return {
    prompt: prompt?.prompt,
    isLoadingPrompt,
    promptError,
  };
}

export function usePromptActions() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // Create prompt mutation
  const createPromptMutation = useMutation({
    mutationFn: promptAPI.createPrompt,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.prompts });
      toast.success("Prompt created successfully!");
      navigate(`/prompt/${data.prompt._id}`);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to create prompt");
    },
  });

  // Update prompt mutation
  const updatePromptMutation = useMutation({
    mutationFn: ({ promptId, updates }) =>
      promptAPI.updatePrompt(promptId, updates),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.prompts });
      queryClient.invalidateQueries({
        queryKey: queryKeys.promptDetail(data.prompt._id),
      });
      toast.success("Prompt updated successfully!");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to update prompt");
    },
  });

  // Delete prompt mutation
  const deletePromptMutation = useMutation({
    mutationFn: promptAPI.deletePrompt,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.prompts });
      toast.success("Prompt deleted successfully!");
      navigate("/dashboard");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to delete prompt");
    },
  });

  // Like/unlike prompt mutation
  const likeMutation = useMutation({
    mutationFn: promptAPI.toggleLike,
    onSuccess: (data, promptId) => {
      // Invalidate all prompt queries to refresh counts
      queryClient.invalidateQueries({
        queryKey: queryKeys.promptDetail(promptId),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.prompts });
      queryClient.invalidateQueries({ queryKey: ["dashboard-prompts"] });
      queryClient.invalidateQueries({ queryKey: ["explore-prompts"] });
    },
    onError: (error) => {
      toast.error("Failed to update like");
    },
  });

  // Add comment mutation
  const commentMutation = useMutation({
    mutationFn: ({ promptId, commentData }) =>
      promptAPI.addComment(promptId, commentData),
    onSuccess: (data, { promptId }) => {
      // Invalidate all prompt queries to refresh counts
      queryClient.invalidateQueries({
        queryKey: queryKeys.promptDetail(promptId),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.prompts });
      queryClient.invalidateQueries({ queryKey: ["dashboard-prompts"] });
      queryClient.invalidateQueries({ queryKey: ["explore-prompts"] });
      toast.success("Comment added successfully!");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to add comment");
    },
  });

  return {
    createPrompt: createPromptMutation.mutate,
    updatePrompt: (promptId, updates) =>
      updatePromptMutation.mutate({ promptId, updates }),
    deletePrompt: deletePromptMutation.mutate,
    toggleLike: likeMutation.mutate,
    addComment: (promptId, commentData) =>
      commentMutation.mutate({ promptId, commentData }),

    isCreating: createPromptMutation.isPending,
    isUpdating: updatePromptMutation.isPending,
    isDeleting: deletePromptMutation.isPending,
    isLiking: likeMutation.isPending,
    isCommenting: commentMutation.isPending,
  };
}

// Hook for infinite scroll prompts
export function useInfinitePrompts(filters = {}) {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
  } = useInfiniteQuery({
    queryKey: queryKeys.promptList(filters),
    queryFn: ({ pageParam = 1 }) =>
      promptAPI.getAllPrompts({ ...filters, page: pageParam }),
    getNextPageParam: (lastPage, pages) => {
      if (lastPage.prompts.length === 0) return undefined;
      return pages.length + 1;
    },
  });

  const prompts = data?.pages.flatMap((page) => page.prompts) || [];

  return {
    prompts,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
  };
}
