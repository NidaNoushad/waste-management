
import React from "react";
import "./GetInTouch.css";
import { useState } from "react";
import axios from "axios";

const GetInTouch= () => {
  

    const [formData, setFormData] = useState({
      name: "",
      email: "",
      phone: "",
      
      message: "",
    });

    const handleInputChange = (e) => {
      setFormData({
        ...formData,
        subject: "No Subject", 
        [e.target.name]: e.target.value,
      });
    };

    const handleSubmit = async (e) => {
      e.preventDefault();
      try {
        const token = localStorage.getItem("accessToken");
        const res = await axios.post(
          `${process.env.REACT_APP_API_URL}contact/`,
          formData,
          {
            headers: {
              "Content-Type": "application/json",
              ...(token && { Authorization: `Bearer ${token}` }),
            },
          }
        );
        alert(res.data.message); // Message from backend
        setFormData({ name: "", email: "", phone: "", message: "" });
      } catch (err) {
        console.error(err.response?.data || err);
        alert("Failed to send message.");
      }
    };
  
  return (
    <div id="contact" className="get-in-touch-section position-relative">
      <video autoPlay muted loop className="video-bg">
        <source src="assets/pickup.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      <div className="overlay"></div>

      <div className="container content-container">
        <div className="row align-items-center">
          {/* Left side content */}
          <div className="col-md-6 text-white">
            <h2 className="mb-4">Need Help? We're Here</h2>
            <p>
              Want to talk? <br/>
              Leave us your contact details and let's schedule a call
            </p>
          </div>

          {/* Right side form */}
          <div className="col-md-6 bg-white p-4 rounded shadow-lg" id="contact">
            <h4 className="mb-3">Get in Touch</h4>
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label">Your Name</label>
                <input type="text" className="form-control"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                placeholder="Enter your name" />
              </div>
              <div className="mb-3">
                <label className="form-label">Gmail</label>
                <input type="email" className="form-control" 
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                
                placeholder="Enter your Gmail"
                
                required
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Phone</label>
                <input type="tel" className="form-control" 
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="Enter your phone number"
                required
                 />
              </div>
              <div className="mb-3">
                <label className="form-label">Tell us about the help you need</label>
                <textarea className="form-control" rows="4" placeholder="Type your message..." 
                   name="message"
                   rows="4"
                   value={formData.message}
                   onChange={handleInputChange}
                style={{resize: "none"}}
                required/>
              </div>
              <button type="submit" className="btn btn-success w-100">Send</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GetInTouch;

