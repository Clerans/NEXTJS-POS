import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ROUTES } from '@/app/router/routes';
import { api } from '@/services/api/axiosInstance';
import { Mail, KeyRound, Lock, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

export const ForgotPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [step, setStep] = useState<'REQUEST' | 'RESET'>('REQUEST');
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const urlToken = searchParams.get('token');
    if (urlToken) {
      setToken(urlToken);
      setStep('RESET');
    }
  }, [searchParams]);

  const handleRequestToken = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailOrUsername.trim()) {
      toast.error('Please enter your email address or username');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/auth/forgot-password', {
        emailOrUsername: emailOrUsername.trim(),
      });

      const message = response.data?.message || 'Password reset link sent to console / email';
      toast.success(message);

      if (response.data?.resetToken) {
        setToken(response.data.resetToken);
      }

      setStep('RESET');
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Failed to request password reset';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token.trim()) {
      toast.error('Reset token is required');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('New password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/auth/reset-password', {
        token: token.trim(),
        newPassword,
      });

      toast.success(response.data?.message || 'Password reset successfully! Please log in.');
      navigate(ROUTES.AUTH_LOGIN);
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Failed to reset password. Token may be expired.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#D7E9EB] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-[420px] bg-white rounded-[32px] shadow-2xl overflow-hidden border border-white/60">
        {/* Header Banner */}
        <div className="bg-[#004953] py-10 px-8 text-center flex flex-col items-center justify-center">
          <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center border border-white/20 mb-3 shadow-inner">
            <KeyRound className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-xl font-black text-white tracking-wide">
            {step === 'REQUEST' ? 'Forgot Password' : 'Set New Password'}
          </h1>
          <p className="text-xs text-white/80 font-medium mt-1">
            {step === 'REQUEST'
              ? 'Enter your details to receive password recovery instructions'
              : 'Enter your reset token and new password'}
          </p>
        </div>

        {/* Body */}
        <div className="px-8 sm:px-10 py-8 space-y-6 bg-white">
          {step === 'REQUEST' ? (
            <form onSubmit={handleRequestToken} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-textDark mb-2">Email or Username</label>
                <div className="relative flex items-center bg-[#F0F5F6] rounded-xl px-4 py-3.5 border border-transparent focus-within:border-[#004953]/30 transition-all">
                  <Mail className="w-4 h-4 text-textGray mr-3 flex-shrink-0" />
                  <input
                    type="text"
                    value={emailOrUsername}
                    onChange={(e) => setEmailOrUsername(e.target.value)}
                    className="w-full bg-transparent text-xs sm:text-sm font-semibold text-textDark focus:outline-none placeholder:text-textGray/60"
                    placeholder="admin@nexuspos.com or admin"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-[#004953] hover:bg-[#00363D] active:scale-[0.99] text-white text-xs sm:text-sm font-bold rounded-xl shadow-md transition-all flex items-center justify-center cursor-pointer"
              >
                {loading ? 'Generating Link...' : 'Send Reset Instructions'}
              </button>

              <div className="text-center pt-1">
                <button
                  type="button"
                  onClick={() => setStep('RESET')}
                  className="text-xs text-[#004953] font-bold hover:underline"
                >
                  Already have a reset token? Enter token
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-textDark mb-1.5">Reset Token</label>
                <div className="relative flex items-center bg-[#F0F5F6] rounded-xl px-4 py-3 border border-transparent focus-within:border-[#004953]/30">
                  <KeyRound className="w-4 h-4 text-textGray mr-3 flex-shrink-0" />
                  <input
                    type="text"
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    className="w-full bg-transparent text-xs font-semibold text-textDark focus:outline-none placeholder:text-textGray/60"
                    placeholder="Enter reset token from console/email"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-textDark mb-1.5">New Password</label>
                <div className="relative flex items-center bg-[#F0F5F6] rounded-xl px-4 py-3 border border-transparent focus-within:border-[#004953]/30">
                  <Lock className="w-4 h-4 text-textGray mr-3 flex-shrink-0" />
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-transparent text-xs font-semibold text-textDark focus:outline-none placeholder:text-textGray/60"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-textDark mb-1.5">Confirm New Password</label>
                <div className="relative flex items-center bg-[#F0F5F6] rounded-xl px-4 py-3 border border-transparent focus-within:border-[#004953]/30">
                  <Lock className="w-4 h-4 text-textGray mr-3 flex-shrink-0" />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-transparent text-xs font-semibold text-textDark focus:outline-none placeholder:text-textGray/60"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-[#004953] hover:bg-[#00363D] active:scale-[0.99] text-white text-xs sm:text-sm font-bold rounded-xl shadow-md transition-all flex items-center justify-center cursor-pointer mt-2"
              >
                {loading ? 'Resetting Password...' : 'Reset Password & Login'}
              </button>

              <div className="text-center pt-1">
                <button
                  type="button"
                  onClick={() => setStep('REQUEST')}
                  className="text-xs text-textGray hover:text-textDark font-medium"
                >
                  Request a new token
                </button>
              </div>
            </form>
          )}

          <div className="text-center pt-2 border-t border-gray-100">
            <Link to={ROUTES.AUTH_LOGIN} className="inline-flex items-center text-xs text-[#004953] font-bold hover:underline">
              <ArrowLeft className="w-3.5 h-3.5 mr-1" />
              Back to Login
            </Link>
          </div>
        </div>
      </div>

      <div className="text-center mt-6 text-[11px] text-textGray font-semibold tracking-wide">
        © 2026 NEXUSPOS Management System
      </div>
    </div>
  );
};
