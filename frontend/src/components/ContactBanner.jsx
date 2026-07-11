
import React from 'react';
import "./ContactBanner.css"; 

export default function ContactBanner() {
  return (
    <div className="contact-banner-wrapper">
      <div className="container">
        <div className="contact-banner-box">
          <div className="contact-banner-content">
            <h2>Contact us today to<br />schedule your waste<br />service and keep your<br />space clean</h2>
          </div>
          <div className="contact-banner-call-box">
     
            <img src="/assets/recycle.gif" alt="Recycling" className="icon mb-2" />
            <p>24 Hours</p>
            <h5>+1123 456 789</h5>
          </div>
        </div>
      </div>
    </div>
  );
}
