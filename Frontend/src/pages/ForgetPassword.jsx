import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getSecurityQuestions, verifySecurityAnswers, resetPassword } from '../services/forgotPassword';

export default function ForgetPassword() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  

  const [email, setEmail] = useState('');
  

  const [securityQuestions, setSecurityQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  

  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');


  const handleStep1Submit = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error('Please enter your email address');
      return;
    }

    setLoading(true);
    try {
      const response = await getSecurityQuestions(email);
      setSecurityQuestions(response.questions);
      setCurrentStep(2);
      toast.success('Security questions loaded successfully');
    } catch (err) {
      const message = err?.response?.data?.error || 'Email not found or error occurred';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };


  const handleStep2Submit = async (e) => {
    e.preventDefault();
    

    const answersArray = securityQuestions.map(q => {
      const answer = answers[q.id];
      if (!answer || !answer.trim()) {
        toast.error(`Please answer: ${q.question_text}`);
        return null;
      }
      return {
        question_id: q.id,
        answer: answer.trim()
      };
    });

    if (answersArray.includes(null)) return;

    setLoading(true);
    try {
      const response = await verifySecurityAnswers(email, answersArray);
      setResetToken(response.reset_token);
      setCurrentStep(3);
      toast.success('Security answers verified successfully');
    } catch (err) {
      const message = err?.response?.data?.error || 'Security answers are incorrect';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleStep3Submit = async (e) => {
    e.preventDefault();
    
    if (!newPassword || !confirmPassword) {
      toast.error('Please fill in all password fields');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    
    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters long');
      return;
    }

    setLoading(true);
    try {
      await resetPassword(resetToken, newPassword, confirmPassword);
      toast.success('Password reset successfully! You can now login with your new password.');
      navigate('/login');
    } catch (err) {
      const message = err?.response?.data?.error || 'Password reset failed';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };


  const handleAnswerChange = (questionId, value) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-violet-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-violet-500 to-pink-500 px-6 py-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-2">
            Reset Your Password
          </h2>
          <p className="text-violet-100 text-sm">
            Step {currentStep} of 3
          </p>
          
          {/* Progress Bar */}
          <div className="mt-4 bg-white/20 rounded-full h-2">
            <div 
              className="bg-white rounded-full h-2 transition-all duration-500"
              style={{ width: `${(currentStep / 3) * 100}%` }}
            ></div>
          </div>
        </div>

        <div className="p-6">
          {/* Step 1: Email Input */}
          {currentStep === 1 && (
            <form onSubmit={handleStep1Submit} className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  Enter Your Email
                </h3>
                <p className="text-gray-600 text-sm mb-4">
                  We'll show you your security questions to verify your identity.
                </p>
                
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors"
                  required
                />
              </div>
              
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-violet-500 to-pink-500 text-white py-3 px-4 rounded-xl hover:from-violet-600 hover:to-pink-600 transition-all duration-200 font-medium disabled:opacity-50"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Loading...
                  </span>
                ) : (
                  'Next Step'
                )}
              </button>
            </form>
          )}

          {/* Step 2: Security Questions */}
          {currentStep === 2 && (
            <form onSubmit={handleStep2Submit} className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  Answer Security Questions
                </h3>
                <p className="text-gray-600 text-sm mb-4">
                  Please answer all security questions to verify your identity.
                </p>
                
                {securityQuestions.map((question, index) => (
                  <div key={question.id} className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {index + 1}. {question.question_text}
                    </label>
                    <input
                      type="text"
                      value={answers[question.id] || ''}
                      onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                      placeholder="Your answer"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors"
                      required
                    />
                  </div>
                ))}
              </div>
              
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="flex-1 bg-gray-200 text-gray-700 py-3 px-4 rounded-xl hover:bg-gray-300 transition-colors font-medium"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-violet-500 to-pink-500 text-white py-3 px-4 rounded-xl hover:from-violet-600 hover:to-pink-600 transition-all duration-200 font-medium disabled:opacity-50"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Verifying...
                    </span>
                  ) : (
                    'Verify Answers'
                  )}
                </button>
              </div>
            </form>
          )}

          {/* Step 3: New Password */}
          {currentStep === 3 && (
            <form onSubmit={handleStep3Submit} className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  Set New Password
                </h3>
                <p className="text-gray-600 text-sm mb-4">
                  Choose a strong password for your account.
                </p>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      New Password
                    </label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm new password"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors"
                      required
                    />
                  </div>
                </div>
                
                <div className="mt-3 text-xs text-gray-500">
                  Password must be at least 8 characters long and contain letters and numbers.
                </div>
              </div>
              
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="flex-1 bg-gray-200 text-gray-700 py-3 px-4 rounded-xl hover:bg-gray-300 transition-colors font-medium"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-violet-500 to-pink-500 text-white py-3 px-4 rounded-xl hover:from-violet-600 hover:to-pink-600 transition-all duration-200 font-medium disabled:opacity-50"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Resetting...
                    </span>
                  ) : (
                    'Reset Password'
                  )}
                </button>
              </div>
            </form>
          )}

          {/* Back to Login Link */}
          <div className="mt-6 text-center">
            <p className="text-gray-600 text-sm">
              Remember your password?{' '}
              <Link 
                to="/login" 
                className="text-pink-600 hover:text-pink-800 font-medium"
              >
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
