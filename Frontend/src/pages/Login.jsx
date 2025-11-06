import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { login } from "../services/auth";
import googleApi from "../services/googleAuth";
import { saveGoogleToken } from "../services/auth";
import clsx from "clsx";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    if (window.google && window.google.accounts && window.google.accounts.id) {
      window.google.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        callback: handleGoogleLogin,
      });
    }
    // eslint-disable-next-line
  }, []);

  const handleGoogleLogin = async (credentialResponse) => {
    try {
      const { data } = await googleApi.post("/google/login/", {
        credential: credentialResponse.credential,
      });
      saveGoogleToken(data);
      toast.success("Google login successful!");
      navigate("/dashboard", { replace: true });
      // eslint-disable-next-line no-unused-vars
    } catch (err) {
      toast.error("Google login failed");
    }
  };

  const handleGoogleButtonClick = () => {
    if (window.google && window.google.accounts && window.google.accounts.id) {
      window.google.accounts.id.prompt();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);

    try {
      // The backend login already supports "email or username", so use email for username.
      await login({ email, password });
      console.log("Login successful:", { email });
      toast.success("Login successful!");
      navigate("/dashboard", { replace: true });
    } catch (err) {
      const msg =
        err?.response?.data?.detail ||
        err?.response?.data?.error ||
        "Login failed. Please check your email/password.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-violet-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl w-full flex flex-col lg:flex-row gap-0 items-stretch bg-white rounded-3xl shadow-2xl overflow-hidden">
        {/* Left side - Brand info */}
        <div className="lg:w-1/2 bg-gradient-to-br from-violet-500 to-pink-500 text-white relative overflow-hidden">
          <div className="absolute w-64 h-64 rounded-full bg-white/10 -top-12 -right-12"></div>
          <div className="absolute w-48 h-48 rounded-full bg-white/10 bottom-12 -left-12"></div>

          <div className="relative z-10 p-6 lg:p-10 flex flex-col justify-center h-full">
            <div className="mb-6">
              <h1 className="text-3xl font-extrabold mb-2 flex items-center">
                <span className="bg-white text-violet-600 px-3 py-1 rounded-xl mr-2 shadow-md">
                  TechPath
                </span>
                Blog
              </h1>
            </div>

            <p className="text-lg italic mb-6 font-light leading-relaxed">
              "Join our IT community and stay ahead with the latest tech
              insights, tutorials, and industry trends. Sign up today to unlock
              exclusive content!"
            </p>

            <div className="mt-6 hidden lg:block">
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <div className="badge bg-white/20 border-0 p-2 rounded-full">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-3 h-3 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <p className="text-white/90 font-medium text-sm">
                    Access to premium articles and tutorials
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="badge bg-white/20 border-0 p-2 rounded-full">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-3 h-3 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <p className="text-white/90 font-medium text-sm">
                    Join our exclusive tech community
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="badge bg-white/20 border-0 p-2 rounded-full">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-3 h-3 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <p className="text-white/90 font-medium text-sm">
                    Stay updated with latest industry news
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right side - Login form */}
        <div className="lg:w-1/2 p-6 lg:p-10 flex flex-col justify-center">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Welcome Back!</h2>
            <p className="text-gray-500 mt-1 text-sm">
              Please sign in to your account
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="form-control w-full">
              <label className="label py-1">
                <span className="label-text text-sm font-medium text-gray-700">
                  Email Address
                </span>
              </label>
              <input
                type="email"
                placeholder="name@example.com"
                className="input input-bordered w-full bg-gray-50 focus:bg-white transition-colors duration-200 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-pink-200 rounded-xl h-10"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-control w-full">
              <label className="label py-1">
                <span className="label-text text-sm font-medium text-gray-700">
                  Password
                </span>
              </label>
              <input
                type="password"
                placeholder="Enter your password"
                className="input input-bordered w-full bg-gray-50 focus:bg-white transition-colors duration-200 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-pink-200 rounded-xl h-10"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="flex items-center justify-end">
              <Link to="/forget-password" className="text-blue-600 hover:text-blue-800 font-medium text-xs transition-colors cursor-pointer">
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              aria-busy={loading}
              className={clsx(
                "btn w-full text-base bg-gradient-to-r from-violet-500 to-pink-500 hover:from-violet-600 hover:to-pink-600 border-0 text-white h-10 rounded-xl",
                loading && "pointer-events-none opacity-80",
              )}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="loading loading-spinner loading-sm"></span>
                  <span>Signing In...</span>
                </span>
              ) : (
                "Sign In"
              )}
            </button>

            <div className="divider text-gray-400 text-xs my-2">
              OR CONTINUE WITH
            </div>

            <button
              type="button"
              className="btn btn-outline w-full gap-2 border-gray-300 hover:bg-gray-50 hover:border-gray-400 text-gray-700 rounded-xl h-10 min-h-0"
              onClick={handleGoogleButtonClick}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                className="w-4 h-4"
              >
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              <span className="text-sm">Continue with Google</span>
            </button>

            <div className="text-center mt-4">
              <p className="text-gray-600 text-xs">
                Don't have an account yet?{" "}
                <Link
                  to="/signup"
                  className="text-blue-600 hover:text-blue-800  font-medium"
                >
                  Sign Up
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
