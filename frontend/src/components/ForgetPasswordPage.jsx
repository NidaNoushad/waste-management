import React, { useState, useEffect } from 'react';
import './ForgetPasswordPage.css';
import { useNavigate } from 'react-router-dom';

const ForgetPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  



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
    if (!email) return;
  
    setIsSubmitting(true);
    try {
      
      const response = await fetch(`${process.env.REACT_APP_API_URL}password-reset/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
  
      if (response.ok) {
        setIsSubmitted(true); // show success card
      } else {
        const data = await response.json();
        alert(data.error || "Something went wrong");
      }
    } catch (err) {
      console.error("Error:", err);
      alert("Error: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  

 
  const navigate = useNavigate();
  const handleBackToLogin = () => {
    navigate('/login');
  };

  return (
    <div className="forget-password-page">
      {/* Floating Particles */}
      {[...Array(6)].map((_, i) => (
        <div key={i} className="floating-particle"></div>
      ))}

      <div className="container-fluid">
        <div className="main-container">
          <div className="forget-card" data-aos="zoom-in" data-aos-duration="1000">
            {!isSubmitted ? (
              <>
                <div className="icon-container" data-aos="bounce" data-aos-delay="200">
                  <i className="fas fa-key"></i>
                </div>

                <h1 className="main-title" data-aos="fade-up" data-aos-delay="400">
                  Forget password?
                </h1>

                <p className="subtitle" data-aos="fade-up" data-aos-delay="600">
                  We'll send you the updated instructions shortly.
                </p>

                <form onSubmit={handleSubmit}>
                  <div className="form-group" data-aos="fade-up" data-aos-delay="800">
                    <label className="form-label">Email</label>
                    <input
                      type="email"
                      className="form-control"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>

                  <div data-aos="fade-up" data-aos-delay="1000">
                    <button
                      type="submit"
                      className="submit-btn"
                      disabled={isSubmitting || !email}
                    >
                      {isSubmitting && <div className="loading-spinner"></div>}
                      {isSubmitting ? 'Sending...' : 'Reset password'}
                    </button>
                  </div>
                </form>

                <div className="text-center" data-aos="fade-up" data-aos-delay="1200">
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
                  Email Sent!
                </h1>

                <p className="subtitle" data-aos="fade-up" data-aos-delay="600">
                  We've sent password reset instructions to <strong>{email}</strong>. 
                  Please check your email and follow the instructions.
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

export default ForgetPasswordPage;

