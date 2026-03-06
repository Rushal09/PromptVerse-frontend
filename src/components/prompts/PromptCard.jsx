import React from "react";
import { Link } from "react-router-dom";
import { Heart, MessageCircle, Eye, Download, DollarSign } from "lucide-react";
import { Card, CardContent, CardFooter } from "../ui/card";
import { Button } from "../ui/button";
import { usePromptActions } from "../../hooks/usePrompts";
import { formatRelativeTime, formatPrice } from "../../lib/utils";

export default function PromptCard({ prompt }) {
  const { toggleLike, isLiking } = usePromptActions();

  const handleLike = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleLike(prompt._id);
  };

  const isLiked = prompt.likes?.some(
    (like) => like.user === prompt.currentUserId
  );

  return (
    <Card className="group hover:shadow-lg transition-shadow duration-200">
      <Link to={`/prompt/${prompt._id}`}>
        <div className="aspect-video w-full overflow-hidden rounded-t-lg">
          {prompt.image ? (
            <img
              src={prompt.image}
              alt={prompt.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 flex items-center justify-center">
              <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {prompt.title?.charAt(0) || "P"}
              </span>
            </div>
          )}
        </div>
      </Link>

      <CardContent className="p-4">
        <div className="flex items-center space-x-2 mb-2">
          <Link
            to={`/profile/${prompt.createdBy?._id || prompt.createdBy}`}
            className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={
                prompt.createdBy?.profilePicture ||
                prompt.createdByProfilePicture
              }
              alt={prompt.createdBy?.username || prompt.createdByUsername}
              className="w-6 h-6 rounded-full"
            />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {prompt.createdBy?.username || prompt.createdByUsername}
            </span>
          </Link>
          <span className="text-xs text-gray-500">•</span>
          <span className="text-xs text-gray-500">
            {formatRelativeTime(prompt.createdAt)}
          </span>
        </div>

        <Link to={`/prompt/${prompt._id}`}>
          <h3 className="font-semibold text-lg mb-2 line-clamp-2 hover:text-blue-600 transition-colors">
            {prompt.title}
          </h3>
        </Link>

        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">
          {prompt.description}
        </p>

        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-4">
            <button
              onClick={handleLike}
              disabled={isLiking}
              className={`flex items-center space-x-1 transition-colors ${
                isLiked
                  ? "text-red-500 hover:text-red-600"
                  : "text-gray-500 hover:text-red-500"
              }`}
            >
              <Heart className={`h-4 w-4 ${isLiked ? "fill-current" : ""}`} />
              <span>{prompt.likes?.length || 0}</span>
            </button>

            <div className="flex items-center space-x-1 text-gray-500">
              <MessageCircle className="h-4 w-4" />
              <span>{prompt.comments?.length || 0}</span>
            </div>

            <div className="flex items-center space-x-1 text-gray-500">
              <Eye className="h-4 w-4" />
              <span>{prompt.views || 0}</span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${
                prompt.isfree
                  ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                  : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
              }`}
            >
              {formatPrice(prompt.price)}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap gap-1 mt-3">
          {prompt.tags?.slice(0, 3).map((tag, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded-full text-xs text-gray-600 dark:text-gray-400"
            >
              #{tag}
            </span>
          ))}
          {prompt.tags?.length > 3 && (
            <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded-full text-xs text-gray-600 dark:text-gray-400">
              +{prompt.tags.length - 3}
            </span>
          )}
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <Link to={`/prompt/${prompt._id}`} className="w-full">
          <Button variant="outline" className="w-full">
            <Eye className="h-4 w-4 mr-2" />
            View Details
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
