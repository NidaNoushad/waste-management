

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './ForgetPasswordPage.css';

const ResetPasswordPage = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const { uid, token } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/aos/2.3.4/aos.js';
      script.onload = () => {
        window.AOS.init({ duration: 1000, once: true, offset: 100 });
      };
      document.head.appendChild(script);

      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://cdnjs.cloudflare.com/ajax/libs/aos/2.3.4/aos.css';
      document.head.appendChild(link);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (newPassword !== confirmPassword) {
      setErrorMessage("Passwords do not match!");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/reset/${uid}/${token}/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          new_password1: newPassword,
          new_password2: confirmPassword
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setIsSubmitted(true);
      } else {
        // Show backend validation message
        if (data.error) {
          if (typeof data.error === "string") {
            setErrorMessage(data.error);
          } else {
            // Convert dict of errors into readable text
            const messages = Object.values(data.error).flat().join(" ");
            setErrorMessage(messages);
          }
        } else {
          setErrorMessage("Reset failed. Please try again.");
        }
      }
    } catch (err) {
      console.error("Error:", err);
      setErrorMessage("Something went wrong. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackToLogin = () => {
    navigate("/login");
  };

  return (
    <div className="forget-password-page">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="floating-particle"></div>
      ))}

      <div className="container-fluid">
        <div className="main-container">
          <div className="forget-card" data-aos="zoom-in" data-aos-duration="1000">
            {!isSubmitted ? (
              <>
                <div className="icon-container" data-aos="bounce" data-aos-delay="200">
                  <i className="fas fa-lock"></i>
                </div>

                <h1 className="main-title" data-aos="fade-up" data-aos-delay="400">
                  Reset Your Password
                </h1>

                <p className="subtitle" data-aos="fade-up" data-aos-delay="600">
                  Enter your new password below. 
                  <br />
                  <small>
                    Must be at least 8 characters, include uppercase, lowercase, and a number.
                  </small>
                </p>

                <form onSubmit={handleSubmit}>
                  <div className="form-group" data-aos="fade-up" data-aos-delay="800">
                    <label className="form-label">New Password</label>
                    <input
                      type="password"
                      className="form-control"
                      placeholder="Enter new password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group" data-aos="fade-up" data-aos-delay="1000">
                    <label className="form-label">Confirm New Password</label>
                    <input
                      type="password"
                      className="form-control"
                      placeholder="Confirm new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                  </div>

                  {/* Show error message */}
                  {errorMessage && (
                    <p className="error-text" data-aos="fade-up" data-aos-delay="1100">
                      {errorMessage}
                    </p>
                  )}

                  <div data-aos="fade-up" data-aos-delay="1200">
                    <button
                      type="submit"
                      className="submit-btn"
                      disabled={isSubmitting || !newPassword || !confirmPassword}
                    >
                      {isSubmitting && <div className="loading-spinner"></div>}
                      {isSubmitting ? 'Resetting...' : 'Reset Password'}
                    </button>
                  </div>
                </form>

                <div className="text-center" data-aos="fade-up" data-aos-delay="1400">
                  <button
                    className="back-link"
                    onClick={handleBackToLogin}
                    style={{ background: 'none', border: 'none' }}
                  >
                    <i className="fas fa-arrow-left"></i> Back to login
                  </button>
                </div>
              </>
            ) : (
              <div className="text-center" data-aos="zoom-in">
                <div className="success-icon" data-aos="bounce" data-aos-delay="200">
                  <i className="fas fa-check-circle"></i>
                </div>

                <h1 className="main-title" data-aos="fade-up" data-aos-delay="400">
                  Password Reset!
                </h1>

                <p className="subtitle" data-aos="fade-up" data-aos-delay="600">
                  Your password has been successfully reset. You can now login using your new password.
                </p>

                <div data-aos="fade-up" data-aos-delay="800">
                  <button
                    className="submit-btn"
                    onClick={handleBackToLogin}
                    style={{ marginTop: '20px' }}
                  >
                    <i className="fas fa-arrow-left" style={{ marginRight: '8px' }}></i>
                    Back to Login
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
