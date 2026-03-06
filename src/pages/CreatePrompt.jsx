import React, { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useDropzone } from "react-dropzone";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Upload,
  X,
  Image as ImageIcon,
  File as FileIcon,
  Check,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Card } from "../components/ui/card";
import { promptsApi } from "../services/prompts";
import api from "../lib/axios";

// Categories - matching the ones we use in Explore page
const CATEGORIES = [
  "ChatGPT",
  "Midjourney",
  "Dalle",
  "Claude",
  "Writing",
  "Coding",
  "Marketing",
  "Education",
  "Business",
];

// Validation schema based on backend API requirements
const createPromptSchema = z.object({
  title: z
    .string()
    .min(3, "Title must be at least 3 characters")
    .max(100, "Title must be less than 100 characters"),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(2000, "Description must be less than 2000 characters"),
  category: z.string().min(1, "Please select a category"),
  tags: z.string().optional(),
  image: z.any().refine((file) => file !== null && file !== undefined, {
    message: "Image is required",
  }),
  file: z.any().optional(),
});

export default function CreatePrompt() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [imagePreview, setImagePreview] = useState(null);
  const [fileName, setFileName] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors, isDirty },
  } = useForm({
    resolver: zodResolver(createPromptSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "",
      tags: "",
    },
  });

  const watchedValues = watch();

  // Auto-save to localStorage
  useEffect(() => {
    if (isDirty) {
      const autoSaveData = {
        title: watchedValues.title,
        description: watchedValues.description,
        category: watchedValues.category,
        tags: watchedValues.tags,
      };
      localStorage.setItem("createPromptDraft", JSON.stringify(autoSaveData));
    }
  }, [watchedValues, isDirty]);

  // Restore from localStorage on mount
  useEffect(() => {
    const savedDraft = localStorage.getItem("createPromptDraft");
    if (savedDraft) {
      try {
        const draft = JSON.parse(savedDraft);
        if (draft.title || draft.description) {
          const shouldRestore = window.confirm(
            "You have unsaved changes. Would you like to restore them?"
          );
          if (shouldRestore) {
            setValue("title", draft.title || "");
            setValue("description", draft.description || "");
            setValue("category", draft.category || "");
            setValue("tags", draft.tags || "");
            toast.success("Draft restored");
          } else {
            localStorage.removeItem("createPromptDraft");
          }
        }
      } catch (error) {
        console.error("Error restoring draft:", error);
      }
    }
  }, [setValue]);

  // Warn before leaving with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (isDirty && !isSubmitting) {
        e.preventDefault();
        e.returnValue = "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty, isSubmitting]);

  // Image dropzone
  const onImageDrop = useCallback(
    (acceptedFiles) => {
      const file = acceptedFiles[0];
      if (file) {
        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          toast.error("Image size must be less than 5MB");
          return;
        }

        // Validate file type
        if (!file.type.startsWith("image/")) {
          toast.error("Please upload an image file");
          return;
        }

        setValue("image", file, { shouldDirty: true });
        const reader = new FileReader();
        reader.onload = () => setImagePreview(reader.result);
        reader.readAsDataURL(file);
      }
    },
    [setValue]
  );

  const {
    getRootProps: getImageRootProps,
    getInputProps: getImageInputProps,
    isDragActive: isImageDragActive,
  } = useDropzone({
    onDrop: onImageDrop,
    accept: { "image/*": [".png", ".jpg", ".jpeg", ".gif", ".webp"] },
    maxFiles: 1,
    multiple: false,
  });

  // File dropzone
  const onFileDrop = useCallback(
    (acceptedFiles) => {
      const file = acceptedFiles[0];
      if (file) {
        // Validate file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
          toast.error("File size must be less than 10MB");
          return;
        }

        setValue("file", file, { shouldDirty: true });
        setFileName(file.name);
      }
    },
    [setValue]
  );

  const {
    getRootProps: getFileRootProps,
    getInputProps: getFileInputProps,
    isDragActive: isFileDragActive,
  } = useDropzone({
    onDrop: onFileDrop,
    maxFiles: 1,
    multiple: false,
  });

  // Remove image
  const removeImage = () => {
    setImagePreview(null);
    setValue("image", null, { shouldDirty: true });
  };

  // Remove file
  const removeFile = () => {
    setFileName(null);
    setValue("file", null, { shouldDirty: true });
  };

  // Form submission
  const onSubmit = async (data) => {
    setIsSubmitting(true);

    try {
      // Direct FormData creation and submission
      const formData = new FormData();
      formData.append("title", data.title);
      formData.append("description", data.description);
      formData.append("category", data.category);

      // Handle tags - convert comma-separated string to array
      if (data.tags) {
        const tagsArray = data.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter((tag) => tag);
        tagsArray.forEach((tag) => formData.append("tags", tag));
      }

      // Append files if present
      if (data.image) {
        formData.append("image", data.image);
      }

      if (data.file) {
        formData.append("file", data.file);
      }

      // Call the API directly with axios
      const response = await api.post("/promt/create", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success("Prompt created successfully!");
      localStorage.removeItem("createPromptDraft");
      queryClient.invalidateQueries(["prompts"]);
      queryClient.invalidateQueries(["my-prompts"]);

      // Navigate to the created prompt or dashboard
      if (response.data.promt && response.data.promt.id) {
        navigate(`/prompt/${response.data.promt.id}`);
      } else if (response.data.promt && response.data.promt._id) {
        navigate(`/prompt/${response.data.promt._id}`);
      } else {
        navigate("/dashboard");
      }
    } catch (error) {
      console.error("Submission error:", error);
      toast.error(error.response?.data?.message || "Failed to create prompt");
    } finally {
      setIsSubmitting(false);
    }
  };

  const titleLength = watchedValues.title?.length || 0;
  const descriptionLength = watchedValues.description?.length || 0;
  const tagsLength = watchedValues.tags?.length || 0;

  return (
    <div className="min-h-screen px-6 py-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Create New Prompt
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Share your amazing AI prompt with the community
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Title */}
          <Card className="p-6">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-lg font-semibold">
                Title *
              </Label>
              <Input
                id="title"
                placeholder="Enter a catchy title for your prompt..."
                {...register("title")}
                className={errors.title ? "border-red-500" : ""}
              />
              <div className="flex justify-between items-center">
                {errors.title && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {errors.title.message}
                  </p>
                )}
                <p className="text-sm text-gray-500 ml-auto">
                  {titleLength}/100
                </p>
              </div>
            </div>
          </Card>

          {/* Description */}
          <Card className="p-6">
            <div className="space-y-2">
              <Label htmlFor="description" className="text-lg font-semibold">
                Description *
              </Label>
              <Textarea
                id="description"
                placeholder="Describe your prompt in detail. What does it do? How should it be used?"
                rows={6}
                {...register("description")}
                className={errors.description ? "border-red-500" : ""}
              />
              <div className="flex justify-between items-center">
                {errors.description && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {errors.description.message}
                  </p>
                )}
                <p className="text-sm text-gray-500 ml-auto">
                  {descriptionLength}/2000
                </p>
              </div>
            </div>
          </Card>

          {/* Category */}
          <Card className="p-6">
            <div className="space-y-2">
              <Label htmlFor="category" className="text-lg font-semibold">
                Category *
              </Label>
              <select
                id="category"
                {...register("category")}
                className={`w-full px-4 py-2 rounded-lg border bg-white dark:bg-slate-950 text-gray-900 dark:text-white ${
                  errors.category
                    ? "border-red-500"
                    : "border-gray-200 dark:border-slate-800"
                }`}
              >
                <option value="">Select a category</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              {errors.category && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {errors.category.message}
                </p>
              )}
            </div>
          </Card>

          {/* Tags */}
          <Card className="p-6">
            <div className="space-y-2">
              <Label htmlFor="tags" className="text-lg font-semibold">
                Tags (Optional)
              </Label>
              <Input
                id="tags"
                placeholder="ai, art, creative, design (comma-separated)"
                {...register("tags")}
              />
              <p className="text-sm text-gray-500">
                Add tags to help others discover your prompt. Separate with
                commas.
              </p>
              {tagsLength > 0 && (
                <p className="text-sm text-gray-500">{tagsLength}/200</p>
              )}
            </div>
          </Card>

          {/* Image Upload */}
          <Card className="p-6">
            <div className="space-y-4">
              <div>
                <Label className="text-lg font-semibold">
                  Thumbnail Image (Optional)
                </Label>
                <p className="text-sm text-gray-500 mt-1">
                  Upload a preview image for your prompt (max 5MB)
                </p>
              </div>

              {!imagePreview ? (
                <div
                  {...getImageRootProps()}
                  className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                    isImageDragActive
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                      : "border-gray-300 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-500"
                  }`}
                >
                  <input {...getImageInputProps()} />
                  <ImageIcon className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-600 dark:text-gray-400 mb-2">
                    {isImageDragActive
                      ? "Drop the image here"
                      : "Drag and drop an image, or click to select"}
                  </p>
                  <p className="text-sm text-gray-500">
                    PNG, JPG, GIF, WebP up to 5MB
                  </p>
                </div>
              ) : (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-64 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          </Card>

          {/* File Upload */}
          <Card className="p-6">
            <div className="space-y-4">
              <div>
                <Label className="text-lg font-semibold">
                  Additional File (Optional)
                </Label>
                <p className="text-sm text-gray-500 mt-1">
                  Upload a supplementary file (max 10MB)
                </p>
              </div>

              {!fileName ? (
                <div
                  {...getFileRootProps()}
                  className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                    isFileDragActive
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                      : "border-gray-300 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-500"
                  }`}
                >
                  <input {...getFileInputProps()} />
                  <FileIcon className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-600 dark:text-gray-400 mb-2">
                    {isFileDragActive
                      ? "Drop the file here"
                      : "Drag and drop a file, or click to select"}
                  </p>
                  <p className="text-sm text-gray-500">
                    Any file type up to 10MB
                  </p>
                </div>
              ) : (
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-900 rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileIcon className="h-8 w-8 text-blue-600" />
                    <span className="text-gray-900 dark:text-white font-medium">
                      {fileName}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={removeFile}
                    className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              )}
            </div>
          </Card>

          {/* Action Buttons */}
          <div className="sticky bottom-6 bg-white dark:bg-slate-950 border rounded-lg p-4 shadow-lg">
            <div className="flex gap-4 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  if (isDirty) {
                    const confirmLeave = window.confirm(
                      "You have unsaved changes. Are you sure you want to leave?"
                    );
                    if (confirmLeave) {
                      localStorage.removeItem("createPromptDraft");
                      navigate(-1);
                    }
                  } else {
                    navigate(-1);
                  }
                }}
                disabled={isSubmitting}
              >
                Cancel
              </Button>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="min-w-[140px]"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Publish Prompt
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
