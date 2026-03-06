import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Invalid email address").min(1, "Email is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const registerSchema = z
  .object({
    username: z
      .string()
      .min(3, "Username must be at least 3 characters")
      .max(20, "Username must be less than 20 characters")
      .regex(
        /^[a-zA-Z0-9_]+$/,
        "Username can only contain letters, numbers, and underscores"
      ),
    email: z
      .string()
      .email("Invalid email address")
      .min(1, "Email is required"),
    mobileNumber: z
      .string()
      .min(10, "Mobile number must be at least 10 digits")
      .regex(/^\+?[1-9]\d{1,14}$/, "Invalid mobile number format"),
    password: z
      .string()
      .min(6, "Password must be at least 6 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Password must contain at least one lowercase letter, one uppercase letter, and one number"
      ),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export const profileUpdateSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(20, "Username must be less than 20 characters")
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "Username can only contain letters, numbers, and underscores"
    ),
  bio: z.string().max(250, "Bio must be less than 250 characters").optional(),
  mobileNumber: z
    .string()
    .min(10, "Mobile number must be at least 10 digits")
    .regex(/^\+?[1-9]\d{1,14}$/, "Invalid mobile number format"),
});

export const promptCreateSchema = z.object({
  title: z
    .string()
    .min(3, "Title must be at least 3 characters")
    .max(100, "Title must be less than 100 characters"),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(2000, "Description must be less than 2000 characters"),
  category: z.string().min(1, "Please select a category"),
  tags: z.array(z.string()).max(10, "Maximum 10 tags allowed").optional(),
  isfree: z.boolean().default(true),
  price: z
    .number()
    .min(0, "Price cannot be negative")
    .max(1000, "Price cannot exceed $1000")
    .optional(),
  isPublic: z.boolean().default(true),
});

export const commentSchema = z.object({
  comment: z
    .string()
    .min(1, "Comment cannot be empty")
    .max(500, "Comment must be less than 500 characters"),
});

export const creditCreateSchema = z.object({
  amount: z
    .number()
    .min(1, "Amount must be at least 1")
    .max(10000, "Amount cannot exceed 10000"),
  description: z.string().min(1, "Description is required"),
});
