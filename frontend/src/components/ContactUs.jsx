import React, { useEffect, useState } from 'react';
import './ContactUs.css';
import axios from 'axios';


const ContactUs = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    phone: "",  
    message: ''
  });

  useEffect(() => {
    // Initialize AOS animations
    if (typeof window !== 'undefined' && !window.AOS) {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/aos/2.3.4/aos.js';
      script.onload = () => {
        window.AOS.init({
          duration: 1000,
          once: true,
          offset: 100
        });
      };
      document.head.appendChild(script);

      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://cdnjs.cloudflare.com/ajax/libs/aos/2.3.4/aos.css';
      document.head.appendChild(link);
    } else if (window.AOS) {
      window.AOS.refresh();
    }
  }, []);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };
 

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    try {
      const token = localStorage.getItem("accessToken");
      const res = await axios.post(
        "http://127.0.0.1:8000/api/contact/", // backend URL
        formData,
        {
          headers: {
            "Content-Type": "application/json",
            // if logged in, include auth token:
            ...(token && { Authorization: `Bearer ${token}` })
            
          },
        }
      );
      alert(res.data.message); // shows "Message sent successfully!"
      setFormData({ name: "", email: "", phone: "", subject: "", message: "" });
    } catch (err) {
      console.error(err.response?.data || err);
      alert("Failed to send message.");
    }
  };

  return (
    <div className="contact-us-page">

      {/* Hero Section */}
      <section className="hero-section">
        <div className="container">
          <div className="row">
            <div className="col-12">
              <h1 className="hero-title" data-aos="fade-down" style={{color:"black"}}>Contact Us</h1>
              <div className="breadcrumb-custom" data-aos="fade-up" data-aos-delay="200">
                <a href="/" style={{color:"black"}}>Home</a> / Contact Us
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="main-content">
        <div className="container">
          <div className="row">

            {/* Contact Form */}
            <div className="col-lg-7">
              <div data-aos="fade-right">
                <div className="section-title">CONTACT US</div>
           
              </div>

              <div className="form-container" data-aos="fade-up" data-aos-delay="200">
                <form onSubmit={handleSubmit}>
                  <div className="row">
                    <div className="col-md-6">
                      <div className="form-group">
                        <label className="form-label">
                          Your Name <span className="required">*</span>
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          placeholder="Enter your name"
                        />
                      </div>
                    </div>

                    <div className="col-md-6">
                      <div className="form-group">
                        <label className="form-label">
                          Email <span className="required">*</span>
                        </label>
                        <input
                          type="email"
                          className="form-control"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          placeholder="enter your email"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">
                      Phone <span className="required">*</span>
                    </label>
                    <input
                      type="tel"
                      className="form-control"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="enter your contact number"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">
                      Subject <span className="required">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      placeholder="Enter Subject"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      Your Message <span className="required">*</span>
                    </label>
                    <textarea
                      className="form-control message-textarea"
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      placeholder="Enter here.."
                    ></textarea>
                  </div>

                  <button type="submit" className="send-btn">
                    <i className="fas fa-arrow-right" style={{ marginRight: '8px' }}></i>
                    Send Message
                  </button>
                </form>
              </div>
            </div>

            {/* Contact Information */}
            <div className="col-lg-5">
              <div className="info-card" data-aos="fade-left" data-aos-delay="300">
                <div className="info-section">
                  <h3 className="info-title">Address</h3>
                  <div className="info-text">4517 Haridha Nagar.</div>
                  <div className="info-text">Kerala, India 39495</div>
                </div>

                <div className="info-section">
                  <h3 className="info-title">Contact</h3>
                  <div className="info-text">Phone: +91 98765 43210</div>
                  <div className="info-text">Email: contact@gotrash</div>
                </div>

                <div className="info-section">
                  <h3 className="info-title">Open Time</h3>
                  <div className="info-text">Monday - Friday : 7:00 AM - 6:00 PM</div>
                  <div className="info-text">Saturday  : 9:00 AM - 5:00 PM</div>
                </div>

                <div className="info-section">
                  <h3 className="info-title">Stay Connected</h3>
                  <div className="social-icons">
                    <a href="#" className="social-icon" aria-label="Facebook"><i className="fab fa-facebook-f"></i></a>
                    <a href="#" className="social-icon" aria-label="Twitter"><i className="fab fa-twitter"></i></a>
                    <a href="#" className="social-icon" aria-label="Pinterest"><i className="fab fa-pinterest"></i></a>
                    <a href="#" className="social-icon" aria-label="Instagram"><i className="fab fa-instagram"></i></a>
                    <a href="#" className="social-icon" aria-label="YouTube"><i className="fab fa-youtube"></i></a>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
};

export default ContactUs;
