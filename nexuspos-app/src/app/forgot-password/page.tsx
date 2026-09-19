"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Mail } from "lucide-react";
import { toast } from "sonner";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    toast.success("Password recovery instructions sent to your registered email!");
  };

  return (
    <div className="min-h-screen bg-[#D7E9EB] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-[400px] bg-white rounded-[32px] shadow-2xl overflow-hidden border border-white/60">
        <div className="bg-[#004953] py-10 px-8 text-center flex flex-col items-center justify-center">
          <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center border border-white/20 mb-3">
            <Mail className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-xl font-black text-white tracking-wide">
            Reset Password
          </h1>
          <p className="text-xs text-white/80 font-medium mt-1">
            NEXUSPOS Security Recovery
          </p>
        </div>

        <div className="px-8 sm:px-10 py-8 space-y-5 bg-white">
          {!submitted ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <p className="text-xs text-text-gray font-medium">
                Enter your administrative email address and we will dispatch a
                secure password reset token.
              </p>
              <div>
                <label className="block text-xs font-bold text-text-dark mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#F0F5F6] rounded-xl px-4 py-3 border border-border text-xs font-semibold focus:outline-none focus:border-patina"
                  placeholder="admin@nexuspos.lk"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full py-3.5 bg-[#004953] hover:bg-[#00363D] text-white text-xs font-bold rounded-xl shadow transition-all cursor-pointer"
              >
                Send Reset Link
              </button>
            </form>
          ) : (
            <div className="text-center py-4 space-y-3">
              <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                ✓
              </div>
              <h3 className="text-sm font-bold text-text-dark">Recovery Email Sent</h3>
              <p className="text-xs text-text-gray">
                Check your inbox for instructions to reset your account password.
              </p>
            </div>
          )}

          <div className="pt-2 text-center">
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-patina hover:underline"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
