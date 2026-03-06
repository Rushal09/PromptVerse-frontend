import React, { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Heart,
  MessageCircle,
  Download,
  Share2,
  Eye,
  Calendar,
  DollarSign,
  User,
  Flag,
  ArrowLeft,
  Check,
  Send,
  MoreVertical,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Textarea } from "../components/ui/textarea";
import PromptCard from "../components/prompts/PromptCard";
import { promptAPI } from "../services/prompts";
import { userAPI } from "../services/users";
import { useAuthStore } from "../stores/authStore";
import { formatRelativeTime, formatPrice } from "../lib/utils";

export default function PromptDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, isAuthenticated, updateUser } = useAuthStore();

  const [commentText, setCommentText] = useState("");
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);

  // Fetch current user's profile to get latest following list
  const { data: currentUserProfile } = useQuery({
    queryKey: ["current-user-profile"],
    queryFn: userAPI.getCurrentUser,
    enabled: isAuthenticated,
    staleTime: 1 * 60 * 1000, // 1 minute
  });

  // Fetch prompt details
  const {
    data: prompt,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["prompt", id],
    queryFn: () => promptAPI.getPromptById(id),
    staleTime: 5 * 60 * 1000,
  });

  // Fetch creator's profile to get real-time follower count
  const creatorId = prompt?.createdBy?._id || prompt?.createdBy;
  const { data: creatorProfile } = useQuery({
    queryKey: ["user-profile", creatorId],
    queryFn: () => userAPI.getUserById(creatorId),
    enabled: !!creatorId && creatorId !== user?.id,
    staleTime: 1 * 60 * 1000, // 1 minute
  });

  // Fetch related prompts
  const { data: relatedPrompts } = useQuery({
    queryKey: ["related-prompts", prompt?.category],
    queryFn: () =>
      promptAPI.getAllPrompts({
        category: prompt?.category,
        limit: 4,
      }),
    enabled: !!prompt?.category,
  });

  // Like/Unlike mutation
  const likeMutation = useMutation({
    mutationFn: () => promptAPI.toggleLike(id),
    onMutate: async () => {
      await queryClient.cancelQueries(["prompt", id]);
      const previousPrompt = queryClient.getQueryData(["prompt", id]);

      queryClient.setQueryData(["prompt", id], (old) => ({
        ...old,
        isLiked: !old.isLiked,
        likes: old.isLiked
          ? old.likes.filter((l) => l.user !== user?.id)
          : [...old.likes, { user: user?.id }],
      }));

      return { previousPrompt };
    },
    onError: (err, variables, context) => {
      queryClient.setQueryData(["prompt", id], context.previousPrompt);
      toast.error("Failed to update like");
    },
  });

  // Follow/Unfollow mutation - Fixed to use userAPI
  const followMutation = useMutation({
    mutationFn: (userId) => userAPI.toggleFollowUser(userId),
    onSuccess: (data) => {
      // Invalidate queries to refetch fresh data
      queryClient.invalidateQueries(["prompt", id]);
      queryClient.invalidateQueries(["current-user-profile"]);
      queryClient.invalidateQueries(["user-profile"]); // For profile pages

      // Update auth store with new following list if available
      const creatorId = prompt?.createdBy?._id || prompt?.createdBy;
      if (currentUserProfile?.user && creatorId) {
        updateUser({
          following: data.message?.includes("Followed")
            ? [...(currentUserProfile.user.following || []), creatorId]
            : (currentUserProfile.user.following || []).filter(
                (id) => id !== creatorId
              ),
        });
      }

      toast.success(data.message || "Success");
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message || "Failed to update follow status"
      );
    },
  });

  // Purchase mutation
  const purchaseMutation = useMutation({
    mutationFn: () => promptAPI.purchasePrompt(id),
    onSuccess: () => {
      queryClient.invalidateQueries(["prompt", id]);
      setShowPurchaseModal(false);
      toast.success("Purchase successful! You can now download this prompt");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Purchase failed");
    },
  });

  // Add comment mutation
  const commentMutation = useMutation({
    mutationFn: (data) => promptAPI.addComment(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(["prompt", id]);
      setCommentText("");
      toast.success("Comment added successfully");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to add comment");
    },
  });

  // Download handler
  const handleDownload = async () => {
    try {
      console.log("Download initiated. Prompt data:", {
        file: prompt.file,
        isfree: prompt.isfree,
        isPurchased: prompt.isPurchased,
        title: prompt.title,
      });

      // Check if user has purchased or if prompt is free
      if (!prompt.isfree && !prompt.isPurchased) {
        toast.error("Please purchase this prompt to download");
        setShowPurchaseModal(true);
        return;
      }

      // If there's a file attached, download from Cloudinary
      if (prompt.file) {
        console.log("Downloading file from:", prompt.file);

        // For Cloudinary PDFs, we need to modify the URL to force download
        // Cloudinary URL format: https://res.cloudinary.com/cloud_name/resource_type/upload/...
        let downloadUrl = prompt.file;

        // Check if it's a Cloudinary URL and if it's a PDF
        if (
          prompt.file.includes("cloudinary.com") &&
          prompt.file.includes(".pdf")
        ) {
          // Add fl_attachment flag to force download
          // This tells Cloudinary to set Content-Disposition: attachment
          downloadUrl = prompt.file.replace(
            "/upload/",
            "/upload/fl_attachment/"
          );
          console.log("Modified URL for PDF download:", downloadUrl);
        }

        // For Cloudinary files, try direct download first
        try {
          // Method 1: Use modified URL with download flag
          const link = document.createElement("a");
          link.href = downloadUrl;

          // Get filename from URL
          const urlParts = prompt.file.split("/");
          let filename = urlParts[urlParts.length - 1];
          filename = filename.split("?")[0]; // Remove query params

          // Ensure proper extension
          if (!filename.includes(".")) {
            filename = `${prompt.title}.pdf`;
          }

          link.setAttribute("download", filename);
          link.setAttribute("target", "_blank");
          link.rel = "noopener noreferrer";
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);

          toast.success("Download started");
        } catch (fetchError) {
          console.error("Download failed:", fetchError);

          // Method 2: Try opening directly in new tab
          window.open(downloadUrl, "_blank");

          toast.info(
            "File opened in new tab. Use your browser's download option if needed."
          );
        }
      } else {
        // If no file, download the prompt description as text file
        const textContent = `Title: ${prompt.title}\n\nDescription:\n${
          prompt.description
        }\n\nCategory: ${prompt.category}\nTags: ${prompt.tags?.join(
          ", "
        )}\n\nCreated by: ${prompt.createdBy?.username}\nCreated at: ${new Date(
          prompt.createdAt
        ).toLocaleDateString()}`;

        const blob = new Blob([textContent], { type: "text/plain" });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `${prompt.title}-prompt.txt`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);

        toast.success("Prompt text downloaded");
      }
    } catch (error) {
      console.error("Download error:", error);
      toast.error("Download failed. Please try again.");
    }
  };

  // Share handlers
  const handleShare = (platform) => {
    const url = window.location.href;
    const text = `Check out this prompt: ${prompt?.title}`;

    const shareUrls = {
      twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(
        url
      )}&text=${encodeURIComponent(text)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
        url
      )}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
        url
      )}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(text + " " + url)}`,
    };

    if (platform === "copy") {
      navigator.clipboard.writeText(url);
      toast.success("Link copied to clipboard");
    } else {
      window.open(shareUrls[platform], "_blank", "width=600,height=400");
    }
    setShowShareMenu(false);
  };

  // Submit comment
  const handleSubmitComment = () => {
    if (!isAuthenticated) {
      toast.error("Please login to comment");
      navigate("/login");
      return;
    }

    if (!commentText.trim()) {
      toast.error("Comment cannot be empty");
      return;
    }

    commentMutation.mutate({
      comment: commentText,
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen px-6 py-6">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 dark:bg-slate-800 rounded w-1/4" />
            <div className="aspect-video bg-gray-200 dark:bg-slate-800 rounded-lg" />
            <div className="h-4 bg-gray-200 dark:bg-slate-800 rounded w-3/4" />
            <div className="h-4 bg-gray-200 dark:bg-slate-800 rounded w-2/3" />
          </div>
        </div>
      </div>
    );
  }

  if (isError || !prompt) {
    return (
      <div className="min-h-screen px-6 py-6 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Prompt not found
          </h2>
          <Button onClick={() => navigate("/explore")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Explore
          </Button>
        </div>
      </div>
    );
  }

  const isOwned =
    prompt.isPurchased ||
    (prompt.createdBy?._id || prompt.createdBy) === user?.id ||
    prompt.isfree;

  // Check if current user is following the prompt creator (creatorId already declared above)
  const isFollowingCreator =
    currentUserProfile?.user?.following?.includes(creatorId) || false;

  return (
    <div className="min-h-screen px-6 py-6">
      <div className="max-w-6xl mx-auto">
        {/* Back Button */}
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Hero Image */}
            <div className="aspect-video w-full overflow-hidden rounded-lg border">
              {prompt.image ? (
                <img
                  src={prompt.image}
                  alt={prompt.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 flex items-center justify-center">
                  <span className="text-6xl font-bold text-blue-600 dark:text-blue-400">
                    {prompt.title?.charAt(0) || "P"}
                  </span>
                </div>
              )}
            </div>

            {/* Title and Author */}
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                {prompt.title}
              </h1>

              <div className="flex items-center justify-between">
                <Link
                  to={`/profile/${prompt.createdBy?._id || prompt.createdBy}`}
                  className="flex items-center gap-3 hover:opacity-80 transition-opacity"
                >
                  <img
                    src={
                      prompt.createdBy?.profilePicture ||
                      prompt.createdByProfilePicture
                    }
                    alt={prompt.createdBy?.username || prompt.createdByUsername}
                    className="w-12 h-12 rounded-full"
                  />
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {prompt.createdBy?.username || prompt.createdByUsername}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {creatorProfile?.user?.followers?.length ||
                        prompt.followerCount ||
                        0}{" "}
                      followers
                    </p>
                  </div>
                </Link>

                {user?.id !== (prompt.createdBy?._id || prompt.createdBy) && (
                  <Button
                    onClick={() =>
                      followMutation.mutate(
                        prompt.createdBy?._id || prompt.createdBy
                      )
                    }
                    disabled={followMutation.isPending}
                    variant={isFollowingCreator ? "outline" : "default"}
                  >
                    {isFollowingCreator ? (
                      <>
                        <Check className="h-4 w-4 mr-2" />
                        Following
                      </>
                    ) : (
                      <>
                        <User className="h-4 w-4 mr-2" />
                        Follow
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>

            {/* Description */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Description</h2>
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                {prompt.description}
              </p>
            </Card>

            {/* Tags */}
            {prompt.tags && prompt.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {prompt.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-gray-100 dark:bg-slate-800 rounded-full text-sm text-gray-700 dark:text-gray-300"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
            {/* Comments Section */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                Comments ({prompt.comments?.length || 0})
              </h2>

              {/* Add Comment Form */}
              <div className="mb-6">
                <Textarea
                  placeholder={
                    isAuthenticated ? "Add a comment..." : "Login to comment"
                  }
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  disabled={!isAuthenticated}
                  rows={3}
                  className="mb-2"
                />
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">
                    {commentText.length}/500
                  </span>
                  <Button
                    onClick={handleSubmitComment}
                    disabled={
                      !isAuthenticated ||
                      !commentText.trim() ||
                      commentText.length > 500 ||
                      commentMutation.isLoading
                    }
                  >
                    <Send className="h-4 w-4 mr-2" />
                    {commentMutation.isLoading ? "Posting..." : "Post Comment"}
                  </Button>
                </div>
              </div>

              {/* Comments List */}
              <div className="space-y-4">
                {prompt.comments && prompt.comments.length > 0 ? (
                  prompt.comments.map((comment) => (
                    <div
                      key={comment._id}
                      className="border-l-2 border-gray-200 dark:border-slate-700 pl-4"
                    >
                      <div className="flex items-start gap-3">
                        <Link to={`/profile/${comment.userId}`}>
                          <img
                            src={
                              comment.profilePicture ||
                              "https://via.placeholder.com/32"
                            }
                            alt={comment.username}
                            className="w-8 h-8 rounded-full hover:opacity-80 transition-opacity"
                          />
                        </Link>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Link
                              to={`/profile/${comment.userId}`}
                              className="font-semibold text-sm hover:underline"
                            >
                              {comment.username}
                            </Link>
                            <span className="text-xs text-gray-500">
                              {formatRelativeTime(comment.createdAt)}
                            </span>
                          </div>
                          <p className="text-gray-700 dark:text-gray-300 text-sm">
                            {comment.comment}
                          </p>
                          <div className="flex items-center gap-4 mt-2">
                            <button className="text-xs text-gray-500 hover:text-blue-600">
                              <Heart className="h-3 w-3 inline mr-1" />
                              {comment.likes || 0}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-gray-500 py-8">
                    No comments yet. Be the first to comment!
                  </p>
                )}
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Action Buttons */}
            <Card className="p-6 space-y-4">
              {!isOwned ? (
                <Button
                  onClick={() => setShowPurchaseModal(true)}
                  size="lg"
                  className="w-full"
                >
                  <DollarSign className="h-5 w-5 mr-2" />
                  Buy for {formatPrice(prompt.price)}
                </Button>
              ) : (
                <Button
                  onClick={handleDownload}
                  size="lg"
                  className="w-full"
                  variant="default"
                >
                  <Download className="h-5 w-5 mr-2" />
                  Download
                </Button>
              )}

              <Button
                onClick={() => likeMutation.mutate()}
                variant={prompt.isLiked ? "default" : "outline"}
                size="lg"
                className="w-full"
                disabled={likeMutation.isLoading}
              >
                <Heart
                  className={`h-5 w-5 mr-2 ${
                    prompt.isLiked ? "fill-current" : ""
                  }`}
                />
                {prompt.isLiked ? "Liked" : "Like"}
              </Button>

              <div className="relative">
                <Button
                  onClick={() => setShowShareMenu(!showShareMenu)}
                  variant="outline"
                  size="lg"
                  className="w-full"
                >
                  <Share2 className="h-5 w-5 mr-2" />
                  Share
                </Button>

                {showShareMenu && (
                  <div className="absolute top-full mt-2 w-full bg-white dark:bg-slate-950 rounded-lg border shadow-lg z-10">
                    <button
                      onClick={() => handleShare("copy")}
                      className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-slate-800 rounded-t-lg"
                    >
                      Copy Link
                    </button>
                    <button
                      onClick={() => handleShare("twitter")}
                      className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-slate-800"
                    >
                      Share on Twitter
                    </button>
                    <button
                      onClick={() => handleShare("facebook")}
                      className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-slate-800"
                    >
                      Share on Facebook
                    </button>
                    <button
                      onClick={() => handleShare("linkedin")}
                      className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-slate-800"
                    >
                      Share on LinkedIn
                    </button>
                    <button
                      onClick={() => handleShare("whatsapp")}
                      className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-slate-800 rounded-b-lg"
                    >
                      Share on WhatsApp
                    </button>
                  </div>
                )}
              </div>

              <Button variant="ghost" size="lg" className="w-full text-red-600">
                <Flag className="h-5 w-5 mr-2" />
                Report
              </Button>
            </Card>

            {/* Stats */}
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Statistics</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400 flex items-center gap-2">
                    <Heart className="h-4 w-4" />
                    Likes
                  </span>
                  <span className="font-semibold">
                    {prompt.likes?.length || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400 flex items-center gap-2">
                    <Download className="h-4 w-4" />
                    Downloads
                  </span>
                  <span className="font-semibold">{prompt.downloads || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400 flex items-center gap-2">
                    <MessageCircle className="h-4 w-4" />
                    Comments
                  </span>
                  <span className="font-semibold">
                    {prompt.comments?.length || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400 flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    Views
                  </span>
                  <span className="font-semibold">{prompt.views || 0}</span>
                </div>
                <div className="flex justify-between items-center pt-3 border-t">
                  <span className="text-gray-600 dark:text-gray-400 flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Published
                  </span>
                  <span className="text-sm">
                    {formatRelativeTime(prompt.createdAt)}
                  </span>
                </div>
              </div>
            </Card>

            {/* Category Badge */}
            <Card className="p-6">
              <h3 className="font-semibold mb-3">Category</h3>
              <span className="inline-block px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300 rounded-full text-sm font-medium">
                {prompt.category}
              </span>
            </Card>
          </div>
        </div>

        {/* Related Prompts */}
        {relatedPrompts && relatedPrompts.data?.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-6">Related Prompts</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedPrompts.data.slice(0, 4).map((relatedPrompt) => (
                <PromptCard key={relatedPrompt._id} prompt={relatedPrompt} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Purchase Modal */}
      {showPurchaseModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-md w-full p-6">
            <h3 className="text-xl font-bold mb-4">Confirm Purchase</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Are you sure you want to purchase "{prompt.title}" for{" "}
              {formatPrice(prompt.price)}?
            </p>
            <div className="flex gap-3">
              <Button
                onClick={() => setShowPurchaseModal(false)}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={() => purchaseMutation.mutate()}
                disabled={purchaseMutation.isLoading}
                className="flex-1"
              >
                {purchaseMutation.isLoading
                  ? "Processing..."
                  : "Confirm Purchase"}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
