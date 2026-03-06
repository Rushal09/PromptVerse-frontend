import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  CreditCard,
  TrendingUp,
  Calendar,
  Plus,
  Minus,
  RefreshCw,
  DollarSign,
  Gift,
  Award,
  PlusCircle,
} from "lucide-react";
import { creditAPI } from "../services/credits";
import { toast } from "sonner";

const Credits = () => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [amount, setAmount] = useState(0);
  const [description, setDescription] = useState("");
  const [type, setType] = useState("credit");

  const queryClient = useQueryClient();

  // Fetch credit balance
  const {
    data: balanceData,
    isLoading: balanceLoading,
    error: balanceError,
  } = useQuery({
    queryKey: ["credit-balance"],
    queryFn: creditAPI.getBalance,
  });

  // Fetch credit history
  const {
    data: historyData = [],
    isLoading: historyLoading,
    error: historyError,
  } = useQuery({
    queryKey: ["credit-history"],
    queryFn: creditAPI.getCreditHistory,
  });

  const createMutation = useMutation({
    mutationFn: creditAPI.createCredit,
    onSuccess: (data) => {
      toast.success("Credit transaction created");
      queryClient.invalidateQueries({ queryKey: ["credit-balance"] });
      queryClient.invalidateQueries({ queryKey: ["credit-history"] });
      setShowAddModal(false);
      setAmount(0);
      setDescription("");
    },
    onError: (err) => {
      toast.error(
        err.response?.data?.message || "Failed to create transaction"
      );
    },
  });

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getTransactionIcon = (type, description) => {
    if (type === "credit") {
      if (description && description.toLowerCase().includes("popular")) {
        return <Award className="text-yellow-500" size={20} />;
      }
      return <Plus className="text-green-500" size={20} />;
    }
    return <Minus className="text-red-500" size={20} />;
  };

  const getTransactionColor = (type) => {
    return type === "credit" ? "text-green-600" : "text-red-600";
  };

  const balance = balanceData?.balance || 0;

  if (balanceLoading || historyLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-20 w-20 border-b-2 border-[var(--color-accent-1)]"></div>
      </div>
    );
  }

  return (
    <div className="max-w-none">
      {/* Header */}
      <div className="bg-gradient-to-r from-[var(--color-accent-1)] to-[var(--color-accent-2)] p-6 text-white mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Credits</h1>
            <p className="text-blue-100">
              Manage your credits and view transaction history
            </p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center space-x-2 px-4 py-2 rounded-md bg-white text-blue-600 hover:bg-gray-100 transition-colors"
          >
            <PlusCircle size={18} />
            <span className="font-medium">Add Credits</span>
          </button>
        </div>
      </div>

      <div className="p-6">
        {/* Balance Card */}
        <div className="bg-gradient-to-r from-[var(--color-accent-1)] to-[var(--color-accent-2)] rounded-lg p-6 mb-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-medium opacity-90 mb-1">
                Current Balance
              </h2>
              <div className="text-4xl font-bold">
                {balance.toLocaleString()}
              </div>
              <p className="text-xs opacity-75 mt-1">Credits</p>
            </div>
            <div className="text-right">
              <CreditCard size={48} className="opacity-75" />
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-[var(--color-secondary)] border border-[var(--color-neutral)] rounded-lg p-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-[var(--color-primary)]">
                This Month
              </h3>
              <TrendingUp className="text-green-500" size={18} />
            </div>
            <div className="text-2xl font-bold text-[var(--color-primary)] mb-1">
              {historyData
                .filter((transaction) => {
                  const transactionDate = new Date(transaction.createdAt);
                  const currentDate = new Date();
                  return (
                    transactionDate.getMonth() === currentDate.getMonth() &&
                    transactionDate.getFullYear() ===
                      currentDate.getFullYear() &&
                    transaction.transactionType === "credit"
                  );
                })
                .reduce((sum, t) => sum + t.amount, 0)
                .toLocaleString()}
            </div>
            <p className="text-sm text-[var(--color-neutral)]">
              Credits earned
            </p>
          </div>

          <div className="bg-[var(--color-secondary)] border border-[var(--color-neutral)] rounded-lg p-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-[var(--color-primary)]">
                Total Earned
              </h3>
              <Gift className="text-blue-500" size={18} />
            </div>
            <div className="text-2xl font-bold text-[var(--color-primary)] mb-1">
              {historyData
                .filter((t) => t.transactionType === "credit")
                .reduce((sum, t) => sum + t.amount, 0)
                .toLocaleString()}
            </div>
            <p className="text-sm text-[var(--color-neutral)]">
              All time credits
            </p>
          </div>

          <div className="bg-[var(--color-secondary)] border border-[var(--color-neutral)] rounded-lg p-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-[var(--color-primary)]">
                Total Spent
              </h3>
              <DollarSign className="text-red-500" size={18} />
            </div>
            <div className="text-2xl font-bold text-[var(--color-primary)] mb-1">
              {historyData
                .filter((t) => t.transactionType === "debit")
                .reduce((sum, t) => sum + t.amount, 0)
                .toLocaleString()}
            </div>
            <p className="text-sm text-[var(--color-neutral)]">
              All time spent
            </p>
          </div>
        </div>

        {/* Transaction History */}
        <div className="bg-[var(--color-secondary)] border border-[var(--color-neutral)] rounded-lg">
          <div className="px-6 py-4 border-b border-[var(--color-neutral)] flex items-center justify-between">
            <h2 className="text-xl font-bold text-[var(--color-primary)]">
              Transaction History
            </h2>
            <button
              onClick={() => {
                queryClient.invalidateQueries({
                  queryKey: ["credit-history"],
                });
                queryClient.invalidateQueries({
                  queryKey: ["credit-balance"],
                });
              }}
              className="flex items-center space-x-2 text-sm text-[var(--color-accent-1)] hover:text-[var(--color-accent-2)] transition-colors"
            >
              <RefreshCw size={16} />
              <span>Refresh</span>
            </button>
          </div>

          <div className="p-6">
            {historyData.length > 0 ? (
              <div className="space-y-3">
                {historyData.map((transaction) => (
                  <div
                    key={transaction._id}
                    className="flex items-center justify-between p-4 bg-[var(--color-background)] rounded-lg border border-[var(--color-neutral)] hover:border-[var(--color-accent-1)] transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="p-2 bg-[var(--color-secondary)] rounded-full">
                        {getTransactionIcon(
                          transaction.transactionType,
                          transaction.description
                        )}
                      </div>
                      <div>
                        <h3 className="font-medium text-[var(--color-primary)]">
                          {transaction.description}
                        </h3>
                        <p className="text-sm text-[var(--color-neutral)]">
                          <Calendar size={12} className="inline mr-1" />
                          {formatDate(transaction.createdAt)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div
                        className={`text-lg font-bold ${getTransactionColor(
                          transaction.transactionType
                        )}`}
                      >
                        {transaction.transactionType === "credit" ? "+" : "-"}
                        {transaction.amount}
                      </div>
                      <div className="text-sm text-[var(--color-neutral)]">
                        Balance: {transaction.balance}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <CreditCard
                  size={48}
                  className="mx-auto text-[var(--color-neutral)] mb-4"
                />
                <h3 className="text-xl font-semibold text-[var(--color-primary)] mb-2">
                  No transactions yet
                </h3>
                <p className="text-sm text-[var(--color-neutral)] mb-4">
                  Your credit transactions will appear here
                </p>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="inline-flex items-center space-x-2 px-4 py-2 text-sm rounded-md bg-gradient-to-r from-[var(--color-accent-1)] to-[var(--color-accent-2)] text-white hover:opacity-90 transition-opacity"
                >
                  <Plus size={16} />
                  <span>Add your first credits</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* How to Earn Credits */}
        <div className="mt-6 bg-[var(--color-secondary)] border border-[var(--color-neutral)] rounded-lg p-6">
          <h2 className="text-xl font-bold text-[var(--color-primary)] mb-4">
            How to Earn Credits
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start space-x-3 p-4 bg-[var(--color-background)] rounded-lg">
              <Award className="text-yellow-500 flex-shrink-0" size={24} />
              <div>
                <h3 className="font-medium text-[var(--color-primary)] mb-1">
                  Popular Prompts
                </h3>
                <p className="text-sm text-[var(--color-neutral)]">
                  Earn credits when your prompt gets featured or reaches
                  engagement milestones.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3 p-4 bg-[var(--color-background)] rounded-lg">
              <Gift className="text-blue-500 flex-shrink-0" size={24} />
              <div>
                <h3 className="font-medium text-[var(--color-primary)] mb-1">
                  Admin Rewards
                </h3>
                <p className="text-sm text-[var(--color-neutral)]">
                  Occasional rewards given to valuable contributors.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Credit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div
            className="absolute inset-0 bg-black opacity-40"
            onClick={() => setShowAddModal(false)}
          />
          <div className="relative bg-[var(--color-secondary)] rounded-lg p-6 w-full max-w-md z-50 border border-[var(--color-neutral)]">
            <h3 className="text-lg font-semibold text-[var(--color-primary)] mb-3">
              Create Credit Transaction
            </h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-[var(--color-neutral)] mb-1">
                  Amount
                </label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded bg-[var(--color-background)] border border-[var(--color-neutral)]"
                />
              </div>
              <div>
                <label className="block text-sm text-[var(--color-neutral)] mb-1">
                  Type
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full px-3 py-2 rounded bg-[var(--color-background)] border border-[var(--color-neutral)]"
                >
                  <option value="credit">Credit (add)</option>
                  <option value="debit">Debit (spend)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-[var(--color-neutral)] mb-1">
                  Description
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded bg-[var(--color-background)] border border-[var(--color-neutral)]"
                />
              </div>
              <div className="flex justify-end space-x-2 mt-4">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-md border border-[var(--color-neutral)]"
                >
                  Cancel
                </button>
                <button
                  onClick={() =>
                    createMutation.mutate({
                      amount,
                      description,
                      transactionType: type,
                    })
                  }
                  disabled={createMutation.isPending}
                  className="px-4 py-2 rounded-md bg-gradient-to-r from-[var(--color-accent-1)] to-[var(--color-accent-2)] text-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {createMutation.isPending ? "Saving..." : "Save"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Credits;
