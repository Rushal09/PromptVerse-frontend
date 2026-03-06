import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { creditAPI } from "../services/credits";
import { queryKeys } from "../lib/queryClient";
import { toast } from "sonner";

export function useCredits() {
  const queryClient = useQueryClient();

  // Get user balance
  const {
    data: balance,
    isLoading: isLoadingBalance,
    error: balanceError,
  } = useQuery({
    queryKey: queryKeys.creditBalance(),
    queryFn: creditAPI.getBalance,
  });

  // Get credit history with pagination
  const useCreditHistory = (page = 1, limit = 20) => {
    return useQuery({
      queryKey: queryKeys.creditHistory(page),
      queryFn: () => creditAPI.getCreditHistory(page, limit),
      keepPreviousData: true,
    });
  };

  // Create credit transaction mutation
  const createCreditMutation = useMutation({
    mutationFn: creditAPI.createCredit,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.credits });
      toast.success("Credit transaction completed!");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Transaction failed");
    },
  });

  // Check and credit popular prompts mutation
  const checkCreditMutation = useMutation({
    mutationFn: creditAPI.checkCreditPopularPrompts,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.credits });
      if (data.credited) {
        toast.success(`Earned ${data.amount} credits!`);
      }
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to process credits");
    },
  });

  return {
    balance: balance?.balance || 0,
    isLoadingBalance,
    balanceError,
    useCreditHistory,
    createCredit: createCreditMutation.mutate,
    checkCredit: checkCreditMutation.mutate,
    isCreatingCredit: createCreditMutation.isPending,
    isCheckingCredit: checkCreditMutation.isPending,
  };
}
