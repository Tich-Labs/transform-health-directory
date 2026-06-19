import { useState } from "react";
import { supabase } from "../supabase";

export default function AdminLogin({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showForgot, setShowForgot] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [showPw, setShowPw] = useState(false);

  async function handleLogin(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const { data, error: authErr } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (authErr) throw authErr;
      onLogin(data.user);
    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleResetPassword(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + "/#/admin",
      });
      if (error) throw error;
      setResetSent(true);
    } catch (err) {
      setError(err.message || "Failed to send reset email");
    } finally {
      setLoading(false);
    }
  }

  if (showForgot) {
    return (
      <div className="min-h-screen bg-brand-sand flex items-center justify-center px-4 font-sans">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
          <div className="text-center mb-8">
            <img
              src="https://transformhealthcoalition.org/wp-content/themes/th/assets/images/main_logo.svg"
              alt="Transform Health"
              className="h-8 mx-auto mb-6"
            />
            <h1 className="text-2xl font-bold text-brand-navy">Reset password</h1>
            <p className="text-[1.4rem] text-gray-500 mt-2">
              Enter your email to receive a reset link
            </p>
          </div>

          {resetSent ? (
            <div className="text-center">
              <div className="text-[1.5rem] text-green-700 bg-green-50 rounded-lg px-4 py-6 mb-4">
                Check your email for the password reset link.
              </div>
              <button
                onClick={() => { setShowForgot(false); setResetSent(false); setEmail(""); }}
                className="text-brand-pink underline text-[1.4rem] cursor-pointer"
              >
                Back to login
              </button>
            </div>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-5">
              <div>
                <label className="block text-[1.4rem] font-medium text-brand-dark mb-1.5">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-[1.5rem] outline-none focus:border-brand-pink"
                  placeholder="your@email.com"
                />
              </div>

              {error && (
                <div className="text-[1.3rem] text-red-600 bg-red-50 rounded-lg px-4 py-3">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-brand-pink text-white font-semibold text-[1.5rem] rounded-lg hover:bg-brand-pink-dark transition-colors disabled:opacity-50 cursor-pointer"
              >
                {loading ? "Sending..." : "Send reset link"}
              </button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => { setShowForgot(false); setError(""); }}
                  className="text-gray-500 underline text-[1.3rem] cursor-pointer"
                >
                  Back to login
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-sand flex items-center justify-center px-4 font-sans">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
        <div className="text-center mb-8">
          <img
            src="https://transformhealthcoalition.org/wp-content/themes/th/assets/images/main_logo.svg"
            alt="Transform Health"
            className="h-8 mx-auto mb-6"
          />
          <h1 className="text-2xl font-bold text-brand-navy">Admin Login</h1>
          <p className="text-[1.4rem] text-gray-500 mt-2">
            Sign in to manage the database
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-[1.4rem] font-medium text-brand-dark mb-1.5">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-[1.5rem] outline-none focus:border-brand-pink"
              placeholder="admin@example.com"
            />
          </div>

          <div>
            <label className="block text-[1.4rem] font-medium text-brand-dark mb-1.5">
              Password
            </label>
            <div className="relative">
              <input
                type={showPw ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg text-[1.5rem] outline-none focus:border-brand-pink"
                placeholder="Enter your password"
              />
              <button
                type="button"
                onClick={() => setShowPw((p) => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[1.3rem] text-gray-500 hover:text-brand-navy cursor-pointer"
              >
                {showPw ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          {error && (
            <div className="text-[1.3rem] text-red-600 bg-red-50 rounded-lg px-4 py-3">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-brand-pink text-white font-semibold text-[1.5rem] rounded-lg hover:bg-brand-pink-dark transition-colors disabled:opacity-50 cursor-pointer"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>

          <div className="text-center">
            <button
              type="button"
              onClick={() => { setShowForgot(true); setError(""); }}
              className="text-gray-500 underline text-[1.3rem] cursor-pointer hover:text-brand-pink"
            >
              Forgot password?
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
