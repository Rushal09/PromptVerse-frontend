import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "react-router-dom";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  Phone,
  Loader2,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { registerSchema } from "../../schemas";
import { useAuth } from "../../hooks/useAuth";

export default function RegisterForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { register: registerUser, isRegisterLoading } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, touchedFields },
    watch,
    setError,
  } = useForm({
    resolver: zodResolver(registerSchema),
    mode: "onBlur",
  });

  const password = watch("password");

  const onSubmit = async (data) => {
    // Remove confirmPassword and call registerUser
    const { confirmPassword, ...registerData } = data;
    registerUser(registerData);
  };

  const loading = isRegisterLoading || isSubmitting;

  const getPasswordStrength = (pass) => {
    if (!pass) return { strength: 0, label: "", color: "" };
    let strength = 0;
    if (pass.length >= 6) strength++;
    if (pass.length >= 8) strength++;
    if (/[a-z]/.test(pass) && /[A-Z]/.test(pass)) strength++;
    if (/\d/.test(pass)) strength++;
    if (/[^a-zA-Z\d]/.test(pass)) strength++;

    if (strength <= 2) return { strength, label: "Weak", color: "bg-red-500" };
    if (strength <= 3)
      return { strength, label: "Fair", color: "bg-yellow-500" };
    if (strength <= 4) return { strength, label: "Good", color: "bg-blue-500" };
    return { strength, label: "Strong", color: "bg-green-500" };
  };

  const passwordStrength = getPasswordStrength(password);

  return (
    <Card className="w-full shadow-xl border-0 dark:bg-slate-800">
      <CardHeader className="space-y-1 pb-6">
        <CardTitle className="text-3xl font-bold text-center bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
          Create Account
        </CardTitle>
        <CardDescription className="text-center text-base">
          Join thousands of AI enthusiasts today
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username" className="text-sm font-medium">
              Username
            </Label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <Input
                id="username"
                type="text"
                placeholder="Choose a unique username"
                className={`pl-10 h-11 ${
                  errors.username
                    ? "border-red-500"
                    : touchedFields.username && !errors.username
                    ? "border-green-500"
                    : ""
                }`}
                disabled={loading}
                {...register("username")}
              />
              {touchedFields.username && !errors.username && (
                <CheckCircle2 className="absolute right-3 top-3 h-5 w-5 text-green-500" />
              )}
            </div>
            {errors.username && (
              <div className="flex items-center gap-1 text-sm text-red-600 dark:text-red-400">
                <AlertCircle className="h-4 w-4" />
                <span>{errors.username.message}</span>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium">
              Email Address
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                className={`pl-10 h-11 ${
                  errors.email
                    ? "border-red-500"
                    : touchedFields.email && !errors.email
                    ? "border-green-500"
                    : ""
                }`}
                disabled={loading}
                {...register("email")}
              />
              {touchedFields.email && !errors.email && (
                <CheckCircle2 className="absolute right-3 top-3 h-5 w-5 text-green-500" />
              )}
            </div>
            {errors.email && (
              <div className="flex items-center gap-1 text-sm text-red-600 dark:text-red-400">
                <AlertCircle className="h-4 w-4" />
                <span>{errors.email.message}</span>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="mobileNumber" className="text-sm font-medium">
              Mobile Number
            </Label>
            <div className="relative">
              <Phone className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <Input
                id="mobileNumber"
                type="tel"
                placeholder="+1234567890"
                className={`pl-10 h-11 ${
                  errors.mobileNumber
                    ? "border-red-500"
                    : touchedFields.mobileNumber && !errors.mobileNumber
                    ? "border-green-500"
                    : ""
                }`}
                disabled={loading}
                {...register("mobileNumber")}
              />
              {touchedFields.mobileNumber && !errors.mobileNumber && (
                <CheckCircle2 className="absolute right-3 top-3 h-5 w-5 text-green-500" />
              )}
            </div>
            {errors.mobileNumber && (
              <div className="flex items-center gap-1 text-sm text-red-600 dark:text-red-400">
                <AlertCircle className="h-4 w-4" />
                <span>{errors.mobileNumber.message}</span>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium">
              Password
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Create a strong password"
                className={`pl-10 pr-10 h-11 ${
                  errors.password ? "border-red-500" : ""
                }`}
                disabled={loading}
                {...register("password")}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                disabled={loading}
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>

            {password && (
              <div className="space-y-1">
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className={`h-1 flex-1 rounded-full ${
                        i < passwordStrength.strength
                          ? passwordStrength.color
                          : "bg-gray-200 dark:bg-gray-700"
                      }`}
                    />
                  ))}
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Password strength:{" "}
                  <span className="font-medium">{passwordStrength.label}</span>
                </p>
              </div>
            )}

            {errors.password && (
              <div className="flex items-center gap-1 text-sm text-red-600 dark:text-red-400">
                <AlertCircle className="h-4 w-4" />
                <span>{errors.password.message}</span>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-sm font-medium">
              Confirm Password
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm your password"
                className={`pl-10 pr-10 h-11 ${
                  errors.confirmPassword
                    ? "border-red-500"
                    : touchedFields.confirmPassword &&
                      !errors.confirmPassword &&
                      watch("confirmPassword")
                    ? "border-green-500"
                    : ""
                }`}
                disabled={loading}
                {...register("confirmPassword")}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                disabled={loading}
                tabIndex={-1}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
              {touchedFields.confirmPassword &&
                !errors.confirmPassword &&
                watch("confirmPassword") && (
                  <CheckCircle2 className="absolute right-10 top-3 h-5 w-5 text-green-500" />
                )}
            </div>
            {errors.confirmPassword && (
              <div className="flex items-center gap-1 text-sm text-red-600 dark:text-red-400">
                <AlertCircle className="h-4 w-4" />
                <span>{errors.confirmPassword.message}</span>
              </div>
            )}
          </div>

          <Button
            type="submit"
            className="w-full h-11 text-base font-medium bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 transition-all duration-200 mt-6"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Creating account...
              </>
            ) : (
              "Create Account"
            )}
          </Button>

          <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-4">
            By creating an account, you agree to our{" "}
            <Link to="/terms" className="text-blue-600 hover:underline">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link to="/privacy" className="text-blue-600 hover:underline">
              Privacy Policy
            </Link>
          </p>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white dark:bg-slate-800 text-gray-500">
                Already have an account?
              </span>
            </div>
          </div>

          <div className="text-center">
            <Link
              to="/login"
              className="text-base font-medium text-purple-600 hover:text-purple-500 dark:text-purple-400 dark:hover:text-purple-300 transition-colors"
            >
              Sign in to your account →
            </Link>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
