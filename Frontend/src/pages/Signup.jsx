import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { registerUser } from "../services/user";
import googleApi from "../services/googleAuth";
import clsx from "clsx";
import { GoogleLogin } from "@react-oauth/google";
import { saveGoogleToken } from "../services/auth";

// import { jwtDecode } from 'jwt-decode'

export default function SignUp() {
  const [, setLoading] = useState(false);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    first_name: "",
    last_name: "",
    address: "",
    phone_number: "",
    security_answer_1: "", // What is your favourite colour?
    security_answer_2: "", // What is your favourite animal?
    security_answer_3: "", // What is your favourite food?
  });

  const [errors, setErrors] = useState({
    termsAccepted: false,
    passwordMismatch: false,
  });
  const [submitting, setSubmitting] = useState(false);

  const handleGoogleSignup = useCallback(async (credentialResponse) => {
    try {
      const { data } = await googleApi.post("/google/login/", {
        credential: credentialResponse.credential,
      });
      saveGoogleToken(data);
      toast.success("Google account created and logged in!");
      navigate("/dashboard", { replace: true });
      // eslint-disable-next-line no-unused-vars
    } catch (err) {
      toast.error("Google signup failed");
    }
  }, [navigate]);

  useEffect(() => {
    if (window.google && window.google.accounts && window.google.accounts.id) {
      window.google.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        callback: handleGoogleSignup,
      });
    }
  }, [handleGoogleSignup]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (name === "termsCheckbox") {
      setErrors((prev) => ({ ...prev, termsAccepted: false }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    setLoading(true);
    const passwordMismatch = formData.password !== formData.confirmPassword;
    const termsAccepted = !document.getElementById("terms-checkbox").checked;

    setErrors({ passwordMismatch, termsAccepted });

    if (passwordMismatch || termsAccepted) {
      return;
    }

    try {
      setSubmitting(true);
      const registrationData = {
        ...formData,
        security_answers: [
          formData.security_answer_1,
          formData.security_answer_2,
          formData.security_answer_3,
        ],
      };
      await registerUser(registrationData);
      toast.success("Account created successfully, please sign in.");
      navigate("/login", { replace: true });
    } catch (err) {
      const apiErrors = err?.response?.data;
      const message = apiErrors
        ? Object.entries(apiErrors)
            .map(
              ([field, msgs]) =>
                `${field}: ${Array.isArray(msgs) ? msgs.join(", ") : msgs}`,
            )
            .join(" | ")
        : "Sign up failed. Please check your inputs.";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleButtonClick = () => {
    if (window.google && window.google.accounts && window.google.accounts.id) {
      window.google.accounts.id.prompt();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-violet-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl w-full flex flex-col lg:flex-row gap-0 items-stretch bg-white rounded-3xl shadow-2xl overflow-hidden">
        {/* Left side - Brand info */}
        <div className="lg:w-2/5 bg-gradient-to-br from-violet-500 to-pink-500 text-white relative overflow-hidden">
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

        {/* Right side - Signup form */}
        <div className="lg:w-3/5 p-6 lg:p-8 flex flex-col justify-center">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">
              Create an Account
            </h2>
            <p className="text-gray-500 mt-1 text-sm">
              Fill in your details to get started
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Username */}
              <div className="form-control w-full">
                <label className="label py-1">
                  <span className="label-text text-sm font-medium text-gray-700">
                    Username
                  </span>
                </label>
                <input
                  type="text"
                  name="username"
                  placeholder="Username"
                  className="input input-bordered w-full bg-gray-50 focus:bg-white transition-colors duration-200 border-gray-200 focus:border-pink-500 focus:ring-2 focus:ring-pink-200 rounded-xl h-10"
                  value={formData.username}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Email */}
              <div className="form-control w-full">
                <label className="label py-1">
                  <span className="label-text text-sm font-medium text-gray-700">
                    Email Address
                  </span>
                </label>
                <input
                  type="email"
                  name="email"
                  placeholder="your@email.com"
                  className="input input-bordered w-full bg-gray-50 focus:bg-white transition-colors duration-200 border-gray-200 focus:border-pink-500 focus:ring-2 focus:ring-pink-200 rounded-xl h-10"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* First Name */}
              <div className="form-control w-full">
                <label className="label py-1">
                  <span className="label-text text-sm font-medium text-gray-700">
                    First Name
                  </span>
                </label>
                <input
                  type="text"
                  name="first_name"
                  placeholder="First Name"
                  className="input input-bordered w-full bg-gray-50 focus:bg-white transition-colors duration-200 border-gray-200 focus:border-pink-500 focus:ring-2 focus:ring-pink-200 rounded-xl h-10"
                  value={formData.first_name}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Last Name */}
              <div className="form-control w-full">
                <label className="label py-1">
                  <span className="label-text text-sm font-medium text-gray-700">
                    Last Name
                  </span>
                </label>
                <input
                  type="text"
                  name="last_name"
                  placeholder="Last Name"
                  className="input input-bordered w-full bg-gray-50 focus:bg-white transition-colors duration-200 border-gray-200 focus:border-pink-500 focus:ring-2 focus:ring-pink-200 rounded-xl h-10"
                  value={formData.last_name}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Password */}
              <div className="form-control w-full">
                <label className="label py-1">
                  <span className="label-text text-sm font-medium text-gray-700">
                    Password
                  </span>
                </label>
                <input
                  type="password"
                  name="password"
                  placeholder="Create a strong password"
                  className={`input input-bordered w-full bg-gray-50 focus:bg-white transition-colors duration-200 
                    ${errors.passwordMismatch ? "border-red-500 focus:border-red-500 focus:ring-red-200" : "border-gray-200 focus:border-pink-500 focus:ring-pink-200"} 
                    rounded-xl h-10`}
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Confirm Password */}
              <div className="form-control w-full">
                <label className="label py-1">
                  <span className="label-text text-sm font-medium text-gray-700">
                    Confirm Password
                  </span>
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="Confirm your password"
                  className={`input input-bordered w-full bg-gray-50 focus:bg-white transition-colors duration-200 
                    ${errors.passwordMismatch ? "border-red-500 focus:border-red-500 focus:ring-red-200" : "border-gray-200 focus:border-pink-500 focus:ring-pink-200"} 
                    rounded-xl h-10`}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Address */}
              <div className="form-control w-full">
                <label className="label py-1">
                  <span className="label-text text-sm font-medium text-gray-700">
                    Address
                  </span>
                </label>
                <input
                  type="text"
                  name="address"
                  placeholder="Your location"
                  className="input input-bordered w-full bg-gray-50 focus:bg-white transition-colors duration-200 border-gray-200 focus:border-pink-500 focus:ring-2 focus:ring-pink-200 rounded-xl h-10"
                  value={formData.address}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Phone Number */}
              <div className="form-control w-full">
                <label className="label py-1">
                  <span className="label-text text-sm font-medium text-gray-700">
                    Phone Number
                  </span>
                </label>
                <input
                  type="tel"
                  name="phone_number"
                  placeholder="Your phone number"
                  className="input input-bordered w-full bg-gray-50 focus:bg-white transition-colors duration-200 border-gray-200 focus:border-pink-500 focus:ring-2 focus:ring-pink-200 rounded-xl h-10"
                  value={formData.phone_number}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Security Questions Section */}
            <div className="mt-6 pt-4 border-t border-gray-100">
              <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-4 h-4 text-pink-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
                Security Questions (for account recovery)
              </h3>
              
              <div className="grid grid-cols-1 gap-4">
                {/* Security Question 1 */}
                <div className="form-control w-full">
                  <label className="label py-1">
                    <span className="label-text text-sm font-medium text-gray-700">
                      What is your favourite colour?
                    </span>
                  </label>
                  <input
                    type="text"
                    name="security_answer_1"
                    placeholder="e.g., Blue"
                    className="input input-bordered w-full bg-gray-50 focus:bg-white transition-colors duration-200 border-gray-200 focus:border-pink-500 focus:ring-2 focus:ring-pink-200 rounded-xl h-10"
                    value={formData.security_answer_1}
                    onChange={handleChange}
                    required
                  />
                </div>

                {/* Security Question 2 */}
                <div className="form-control w-full">
                  <label className="label py-1">
                    <span className="label-text text-sm font-medium text-gray-700">
                      What is your favourite animal?
                    </span>
                  </label>
                  <input
                    type="text"
                    name="security_answer_2"
                    placeholder="e.g., Cat"
                    className="input input-bordered w-full bg-gray-50 focus:bg-white transition-colors duration-200 border-gray-200 focus:border-pink-500 focus:ring-2 focus:ring-pink-200 rounded-xl h-10"
                    value={formData.security_answer_2}
                    onChange={handleChange}
                    required
                  />
                </div>

                {/* Security Question 3 */}
                <div className="form-control w-full">
                  <label className="label py-1">
                    <span className="label-text text-sm font-medium text-gray-700">
                      What is your favourite food?
                    </span>
                  </label>
                  <input
                    type="text"
                    name="security_answer_3"
                    placeholder="e.g., Pizza"
                    className="input input-bordered w-full bg-gray-50 focus:bg-white transition-colors duration-200 border-gray-200 focus:border-pink-500 focus:ring-2 focus:ring-pink-200 rounded-xl h-10"
                    value={formData.security_answer_3}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="form-control mt-2">
              <label className="flex items-center justify-start gap-2 cursor-pointer">
                <input
                  id="terms-checkbox"
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 text-pink-600 focus:ring-pink-500"
                  onChange={() =>
                    setErrors((prev) => ({ ...prev, termsAccepted: false }))
                  }
                />
                <span className="label-text text-xs text-gray-600">
                  I agree to the{" "}
                  <Link to="/terms" className="text-pink-600 hover:underline">
                    Terms and Conditions
                  </Link>
                  
                </span>
              </label>

              {/* Uniform error indication area */}
              {(errors.termsAccepted || errors.passwordMismatch) && (
                <div className="alert alert-error alert-soft shadow-sm py-2 mt-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="stroke-current shrink-0 h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span className="text-xs">
                    {errors.passwordMismatch && "Passwords do not match. "}
                    {errors.termsAccepted &&
                      "Please accept the terms and conditions."}
                  </span>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={submitting}
              aria-busy={submitting}
              className={clsx(
                "btn w-full text-base bg-gradient-to-r from-violet-500 to-pink-500 hover:from-violet-600 hover:to-pink-600 border-0 text-white h-10 rounded-xl mt-2",
                submitting && "pointer-events-none opacity-80",
              )}
            >
              {submitting ? (
                <span className="flex items-center gap-2">
                  <span className="loading loading-spinner loading-sm"></span>
                  <span>Creating...</span>
                </span>
              ) : (
                "Create Account"
              )}
            </button>

            <div className="divider text-gray-400 text-xs my-2">
              OR CONTINUE WITH
            </div>
            <div className="w-full flex justify-center">
              <div className="w-full ">
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
                    {/* Google logo SVG */}
                  </svg>
                  <span className="text-sm">Continue with Google</span>
                </button>
              </div>
            </div>

            <div className="text-center mt-4">
              <p className="text-gray-600 text-xs">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="text-pink-600 hover:text-pink-800 font-medium"
                >
                  Sign In
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
