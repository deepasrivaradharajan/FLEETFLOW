import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import {
  Truck,
  Mail,
  User,
  AlertCircle,
  CheckCircle2,
  Lock,
  ArrowRight,
  Sparkles,
  ShieldCheck
} from 'lucide-react';

export const AuthPage: React.FC = () => {
  const { signInWithGoogle, login, signup, quickDemoLogin, resetPassword } = useAuth();

  const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [role, setRole] = useState<UserRole>('dispatcher');
  const [driverId, setDriverId] = useState('DRV-101');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleGoogleSignIn = async () => {
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);
    try {
      await signInWithGoogle(role);
    } catch (err: any) {
      setErrorMsg(err.message || 'Google sign-in could not be completed.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    try {
      if (mode === 'login') {
        await login(email, password);
      } else if (mode === 'signup') {
        if (!displayName.trim()) {
          throw new Error('Please provide your full name.');
        }
        await signup(email, password, displayName, role, role === 'driver' ? driverId : undefined);
      } else if (mode === 'forgot') {
        await resetPassword(email);
        setSuccessMsg('Password reset instructions sent! Please check your email inbox.');
      }
    } catch (err: any) {
      let msg = err.message || 'Authentication failed. Please check your credentials.';
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password') {
        msg = 'Invalid email or password.';
      } else if (err.code === 'auth/email-already-in-use') {
        msg = 'An account with this email already exists. Please login instead.';
      } else if (err.code === 'auth/weak-password') {
        msg = 'Password should be at least 6 characters.';
      } else if (err.code === 'auth/operation-not-allowed') {
        msg = 'Email/Password authentication is disabled on this Firebase project. Please use "Continue with Google" or 1-Click Demo Evaluation.';
      }
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = async (targetRole: UserRole) => {
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);
    try {
      await quickDemoLogin(targetRole);
    } catch (err: any) {
      setErrorMsg(`Demo login: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Dynamic Background subtle ambient light */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex items-center justify-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-xl shadow-blue-500/25">
            <Truck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight">
              Fleet<span className="text-amber-400">Flow</span>
            </h1>
            <p className="text-xs text-slate-400 font-medium tracking-wide uppercase">
              Next-Gen Fleet & Telematics
            </p>
          </div>
        </div>

        <h2 className="mt-6 text-center text-xl font-bold text-slate-100">
          {mode === 'login' && 'Sign in to Fleet Operations'}
          {mode === 'signup' && 'Create your FleetFlow Account'}
          {mode === 'forgot' && 'Reset your Password'}
        </h2>
        <p className="mt-1 text-center text-xs text-slate-400">
          Real-time GPS tracking, fuel analytics, and dispatch intelligence
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0 relative z-10">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl">
          {/* Quick Demo Access Bar */}
          <div className="mb-5 p-3.5 rounded-xl bg-blue-950/40 border border-blue-800/50">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-[11px] font-bold text-blue-300 flex items-center gap-1.5 uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" /> 1-Click Demo Evaluation
              </span>
              <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-800/40">
                Instant Access
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemo('admin')}
                disabled={loading}
                className="px-2.5 py-2 rounded-lg bg-blue-600/30 hover:bg-blue-600 text-blue-200 hover:text-white border border-blue-500/40 text-xs font-semibold transition-all flex flex-col items-center justify-center disabled:opacity-50 cursor-pointer shadow-sm"
              >
                <span className="font-bold">Admin</span>
                <span className="text-[9px] opacity-80">Full Control</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemo('dispatcher')}
                disabled={loading}
                className="px-2.5 py-2 rounded-lg bg-indigo-600/30 hover:bg-indigo-600 text-indigo-200 hover:text-white border border-indigo-500/40 text-xs font-semibold transition-all flex flex-col items-center justify-center disabled:opacity-50 cursor-pointer shadow-sm"
              >
                <span className="font-bold">Dispatcher</span>
                <span className="text-[9px] opacity-80">Hubs & Fleet</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemo('driver')}
                disabled={loading}
                className="px-2.5 py-2 rounded-lg bg-emerald-600/30 hover:bg-emerald-600 text-emerald-200 hover:text-white border border-emerald-500/40 text-xs font-semibold transition-all flex flex-col items-center justify-center disabled:opacity-50 cursor-pointer shadow-sm"
              >
                <span className="font-bold">Driver</span>
                <span className="text-[9px] opacity-80">My Route</span>
              </button>
            </div>
          </div>

          {/* Primary Google Login Button */}
          <div className="mb-5">
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full py-2.5 px-4 bg-white hover:bg-slate-100 text-slate-800 font-semibold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-50 border border-slate-200"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>
          </div>

          <div className="relative flex items-center justify-center mb-5">
            <div className="border-t border-slate-800 w-full" />
            <span className="bg-slate-900 px-3 text-[10px] text-slate-500 uppercase tracking-widest font-semibold">
              Or Use Email & Password
            </span>
          </div>

          {errorMsg && (
            <div className="mb-4 p-3 rounded-xl bg-rose-950/40 border border-rose-800/60 text-rose-300 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/60 text-emerald-300 text-xs flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="e.g. Jordan Miller"
                    className="w-full pl-10 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full pl-10 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {mode !== 'forgot' && (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-300">Password</label>
                  {mode === 'login' && (
                    <button
                      type="button"
                      onClick={() => setMode('forgot')}
                      className="text-xs text-blue-400 hover:text-blue-300 hover:underline cursor-pointer"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            )}

            {mode === 'signup' && (
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Operational Role
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['admin', 'dispatcher', 'driver'] as UserRole[]).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRole(r)}
                      className={`py-2 px-2 rounded-xl text-xs font-bold capitalize border transition-all cursor-pointer ${
                        role === r
                          ? 'bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-600/30'
                          : 'bg-slate-800/80 text-slate-400 border-slate-700 hover:bg-slate-800 hover:text-slate-200'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
                <p className="text-[11px] text-slate-400 mt-1.5">
                  {role === 'admin' && '• Admin: Complete control over fleet, drivers, hubs, and system settings.'}
                  {role === 'dispatcher' && '• Dispatcher: Manage active live tracking, route schedules, and shipments.'}
                  {role === 'driver' && '• Driver: Tailored cab portal seeing assigned vehicle, GPS route, and shipments.'}
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  {mode === 'login' && 'Sign In with Email'}
                  {mode === 'signup' && 'Create Account with Email'}
                  {mode === 'forgot' && 'Send Reset Email'}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Mode Switchers */}
          <div className="mt-5 pt-3.5 border-t border-slate-800 text-center text-xs text-slate-400">
            {mode === 'login' && (
              <p>
                Don't have an account?{' '}
                <button
                  onClick={() => {
                    setMode('signup');
                    setErrorMsg('');
                  }}
                  className="font-bold text-blue-400 hover:text-blue-300 hover:underline cursor-pointer"
                >
                  Sign up now
                </button>
              </p>
            )}

            {mode === 'signup' && (
              <p>
                Already have an account?{' '}
                <button
                  onClick={() => {
                    setMode('login');
                    setErrorMsg('');
                  }}
                  className="font-bold text-blue-400 hover:text-blue-300 hover:underline cursor-pointer"
                >
                  Sign in
                </button>
              </p>
            )}

            {mode === 'forgot' && (
              <button
                onClick={() => {
                  setMode('login');
                  setErrorMsg('');
                }}
                className="font-bold text-blue-400 hover:text-blue-300 hover:underline cursor-pointer"
              >
                ← Back to sign in
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
