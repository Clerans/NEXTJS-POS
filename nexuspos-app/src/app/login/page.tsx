"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { User, Lock, Eye, EyeOff, ShieldAlert } from "lucide-react";
import { toast } from "sonner";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("password");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Forced Password Change Modal State
  const [mustReset, setMustReset] = useState(false);
  const [userIdToReset, setUserIdToReset] = useState<number | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Login failed");
      }

      if (typeof window !== "undefined") {
        if (data.token) localStorage.setItem("nexuspos_auth_token", data.token);
        if (data.user) localStorage.setItem("nexuspos_user", JSON.stringify(data.user));
        localStorage.setItem("isAuthenticated", "true");
      }

      if (data.user?.mustChangePassword) {
        setMustReset(true);
        setUserIdToReset(data.user.id);
        toast.warning("Default password detected! Please update your password to proceed.");
        return;
      }

      toast.success(data.message || "Logged in successfully!");
      router.push("/dashboard");
    } catch (error: any) {
      toast.error(error.message || "Login failed. Please check credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match!");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters long.");
      return;
    }

    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: userIdToReset,
          newPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to update password");
      }

      toast.success("Password changed successfully! Welcome to NEXUSPOS.");
      setMustReset(false);
      router.push("/dashboard");
    } catch (error: any) {
      toast.error(error.message || "Failed to update password");
    }
  };

  return (
    <div className="min-h-screen bg-[#D7E9EB] flex flex-col items-center justify-center p-4">
      {/* Login Card */}
      <div className="w-full max-w-[400px] bg-white rounded-[32px] shadow-2xl overflow-hidden border border-white/60">
        {/* Top Header Banner */}
        <div className="bg-[#004953] py-14 px-8 text-center flex flex-col items-center justify-center">
          <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center border border-white/20 mb-3.5 shadow-inner">
            <div className="w-11 h-11 rounded-xl bg-white text-[#004953] font-black text-xs flex items-center justify-center tracking-tighter shadow-xs">
              NEXUS
            </div>
          </div>
          <h1 className="text-2xl font-black text-white tracking-wide">NEXUSPOS</h1>
          <p className="text-xs text-white/80 font-medium mt-1 tracking-wide">
            POS Management System
          </p>
        </div>

        {/* Form Body */}
        <div className="px-8 sm:px-10 py-10 sm:py-12 space-y-7 bg-white">
          {!mustReset ? (
            <>
              <div className="text-center space-y-1.5">
                <h2 className="text-xl font-extrabold text-text-dark">Welcome Back!</h2>
                <p className="text-xs sm:text-sm text-text-gray font-medium">
                  Sign in to access your dashboard
                </p>
              </div>

              <form onSubmit={handleLogin} className="space-y-5 pt-2">
                {/* Username Input */}
                <div>
                  <label className="block text-xs sm:text-sm font-bold text-text-dark mb-2">
                    Username
                  </label>
                  <div className="relative flex items-center bg-[#F0F5F6] rounded-xl px-4 py-3.5 border border-transparent focus-within:border-[#004953]/30 transition-all">
                    <User className="w-4 h-4 text-text-gray mr-3 shrink-0" />
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full bg-transparent text-xs sm:text-sm font-semibold text-text-dark focus:outline-none placeholder:text-text-gray/60"
                      placeholder="Enter username"
                      required
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-xs sm:text-sm font-bold text-text-dark">
                      Password
                    </label>
                    <Link
                      href="/forgot-password"
                      className="text-xs text-patina font-semibold hover:underline"
                    >
                      Forgot?
                    </Link>
                  </div>
                  <div className="relative flex items-center bg-[#F0F5F6] rounded-xl px-4 py-3.5 border border-transparent focus-within:border-[#004953]/30 transition-all">
                    <Lock className="w-4 h-4 text-text-gray mr-3 shrink-0" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-transparent text-xs sm:text-sm font-semibold text-text-dark focus:outline-none placeholder:text-text-gray/60 pr-7"
                      placeholder="••••••••"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 text-text-gray hover:text-text-dark transition-colors"
                      aria-label="Toggle Password Visibility"
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-[#004953] hover:bg-[#00363D] active:scale-[0.99] text-white text-xs sm:text-sm font-bold rounded-xl shadow-md transition-all flex items-center justify-center cursor-pointer mt-5 disabled:opacity-50"
                >
                  {loading ? "Signing In..." : "Sign In"}
                </button>
              </form>
            </>
          ) : (
            <>
              <div className="text-center space-y-1.5">
                <div className="flex justify-center mb-2">
                  <ShieldAlert className="w-10 h-10 text-amber-600" />
                </div>
                <h2 className="text-xl font-extrabold text-text-dark">
                  Update Initial Password
                </h2>
                <p className="text-xs text-text-gray font-medium">
                  Security Requirement: You must change the default administrator
                  password on first login.
                </p>
              </div>

              <form onSubmit={handlePasswordReset} className="space-y-4 pt-2">
                <div>
                  <label className="block text-xs font-bold text-text-dark mb-1">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-[#F0F5F6] rounded-xl px-4 py-3 border border-border text-xs font-semibold focus:outline-none focus:border-patina"
                    placeholder="Enter new password"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-text-dark mb-1">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-[#F0F5F6] rounded-xl px-4 py-3 border border-border text-xs font-semibold focus:outline-none focus:border-patina"
                    placeholder="Confirm new password"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-3.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow transition-all cursor-pointer mt-3"
                >
                  Update Password & Continue
                </button>
              </form>
            </>
          )}
        </div>
      </div>

      {/* Footer copyright */}
      <div className="text-center mt-6 text-[11px] text-text-gray font-semibold tracking-wide">
        © 2026 NEXUSPOS Management System
      </div>
    </div>
  );
}
