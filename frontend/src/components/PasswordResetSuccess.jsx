



import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './ForgetPasswordPage.css';

const PasswordResetSuccess = () => {
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

  const handleBackToLogin = () => {
    navigate('/login');
  };

  return (
    <div className="forget-password-page">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="floating-particle"></div>
      ))}

      <div className="container-fluid">
        <div className="main-container">
          <div className="forget-card" data-aos="zoom-in" data-aos-duration="1000">
            <div className="text-center" data-aos="zoom-in">
              <div className="success-icon" data-aos="bounce" data-aos-delay="200">
                <i className="fas fa-check-circle"></i>
              </div>

              <h1 className="main-title" data-aos="fade-up" data-aos-delay="400">
                Password Reset Successful!
              </h1>

              <p className="subtitle" data-aos="fade-up" data-aos-delay="600">
                Your password has been successfully reset. You can now use your new password to login.
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default PasswordResetSuccess;
