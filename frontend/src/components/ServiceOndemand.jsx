
import React, { useEffect,  useState } from "react";
import "./ServiceOndemand.css";
import { Container, Row, Col,Card ,Button,Offcanvas, NavDropdown, Modal, Form } from "react-bootstrap"
import { FaHome, FaUsers, FaBuilding, FaCalendarTimes } from "react-icons/fa"; // fontawesome react-icons
import { CheckCircle, Calendar, Truck, Recycle, Leaf } from "lucide-react"; // nice icons

import AOS from "aos";
import "aos/dist/aos.css";
import { Link } from "react-router-dom";
import axios from 'axios';
import { jwtDecode } from "jwt-decode";
import { useNavigate } from 'react-router-dom';
import Footer from './Footer';
import Header from './Header';
import MainNavbar from './MainNavbar';

const ServiceOndemand = () => {

  const navigate = useNavigate();


  const handleScheduleClick = () => {
    navigate("/login"); 
  };
 
    

    
  

  return (
    <div>
    <Header/>
    <MainNavbar/>
    <section 
    className="ewaste-hero"
    style={{
      background: `url("/assets/rp1.jpeg") center/cover no-repeat`,
    }}>
      <div className="overlay"></div>
      <div className="content" data-aos="fade-up">
        <h1 className="hero-title">On-demand Pickup</h1>
        <p className="hero-subtitle">Our Services</p>
        <p className="breadcrumb">
      <Link to="/" className="breadcrumb-link">Home</Link> &gt;{" "}
      <Link to="/serviceslist" className="breadcrumb-link">Our Services</Link>&gt;{" "}
      <Link to="/service/ondemand" className="breadcrumb-link">On-demand Pickup</Link>
    </p>
      </div>
    </section>

      {/* Second Section */}
      <section
      className="py-5"
      style={{ backgroundColor: "#fff", color: "#1a4d2e" }}
    >
      <div className="container">
        <div className="row align-items-center">
          {/* Left Content */}
          <div className="col-md-6" data-aos="fade-right">
            <h2 className="fw-bold mb-3">
              Urgent pickups at your doorstep, whenever you need
            </h2>
            <p className="mb-4">
              Sometimes waste can’t wait. With <strong>GoTrash’s On-Demand Pickup</strong>, 
              you don’t need to stick to a fixed schedule — simply book online and 
              our team will arrive the very next day. <br />
              <strong>Fast, reliable, and hassle-free.</strong>
            </p>
            
          </div>

          {/* Right Image */}
          <div className="col-md-6 text-center" data-aos="fade-left">
            <img
              src="/assets/rp2.jpeg"
              alt="On-Demand Pickup"
              className="img-fluid rounded shadow"
            />
          </div>
        </div>
      </div>
    </section>

      {/* --- Section 3 --- */}
      <section className="py-5" style={{ backgroundColor: "#fff" }}>
      <div className="container">
        <div className="row">
          {/* Heading Box */}
          <div
            className="col-md-3 d-flex align-items-center justify-content-center why-heading"
            data-aos="fade-right"
          >
            <h3 className="fw-bold text-center">Why GoTrash On-Demand Pickup?</h3>
          </div>

          {/* Points */}
          <div className="col-md-9">
            <div className="row g-4">
              <div className="col-md-6" data-aos="zoom-in">
                <div className="why-box">
                  <h4 className="fw-bold">Speed</h4>
                  <p>Next-day waste removal when it can’t wait.</p>
                </div>
              </div>
              <div className="col-md-6" data-aos="zoom-in">
                <div className="why-box">
                  <h4 className="fw-bold">Flexibility</h4>
                  <p>Perfect for sudden clean-ups, parties, or urgent needs.</p>
                </div>
              </div>
              <div className="col-md-6" data-aos="zoom-in">
                <div className="why-box">
                  <h4 className="fw-bold">Reliability</h4>
                  <p>A dedicated team ensures timely and safe collection.</p>
                </div>
              </div>
              <div className="col-md-6" data-aos="zoom-in">
                <div className="why-box">
                  <h4 className="fw-bold">Peace of Mind</h4>
                  <p>Focus on what matters, while we handle the waste.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
      {/* --- Section 4 --- */}
   <section className="py-5" style={{ backgroundColor: "#fff" }}>
      <div className="container">
        <div className="row align-items-center">
          
          <div className="col-md-6 d-flex flex-column gap-3" data-aos="fade-right">
            <img
              src="/assets/rp3.jpeg"
              alt="Waste Pickup"
              className="img-fluid rounded shadow"
            />
          
          </div>

          
          <div className="col-md-6" data-aos="fade-left">
            <h2 className="fw-bold mb-4 text-ideal">Ideal For…</h2>
            <ul className="list-unstyled fs-5">
              <li className="mb-3 d-flex align-items-center">
                <FaHome className="me-3 icon-ideal" />
                Households with sudden large amounts of waste
              </li>
              <li className="mb-3 d-flex align-items-center">
                <FaUsers className="me-3 icon-ideal" />
                Events or gatherings needing next-day clearance
              </li>
              <li className="mb-3 d-flex align-items-center">
                <FaBuilding className="me-3 icon-ideal" />
                Businesses requiring urgent disposal
              </li>
              <li className="mb-3 d-flex align-items-center">
                <FaCalendarTimes className="me-3 icon-ideal" />
                Residents who missed their regular scheduled pickup
              </li>
            </ul>
            <button className="btn btn-ideal px-4 py-2 mt-3">
              Learn More
            </button>
          </div>
        </div>
      </div>
    </section> 
    
{/* sec5 */}
<section className="why-choose-us py-5" style={{ backgroundColor: "#fff", color: "#1a4d2e" }}>
  <div className="container">
    <div className="row justify-content-center">
      <div className="col-lg-8 text-center">
        <h2 className="section-title mb-3" style={{ color: "#1a4d2e" }}>Need It Gone Fast?</h2>
        <p className="section-subtitle mb-4">
          Book your On-Demand Pickup today and we’ll be there tomorrow.
        </p>
        <button className="btn btn-lg px-4"
        onClick={handleScheduleClick}
         style={{ backgroundColor: "#1a4d2e", color: "#fff" }}>
          Schedule Now
        </button>
      </div>
    </div>
  </div>
</section>

  
    <Footer/>
  
    
    </div>
  
  );
};

export default ServiceOndemand;