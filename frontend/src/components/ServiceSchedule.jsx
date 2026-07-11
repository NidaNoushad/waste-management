


import React from "react";
import { Container, Row, Col, Card } from "react-bootstrap";
import "./ServiceSchedule.css";
import { useNavigate,Link } from 'react-router-dom';
 import  { useEffect,  useState } from "react";
import Footer from './Footer';
import Header from './Header';
import MainNavbar from './MainNavbar';
// (Optional) If using icons
import { FaClock, FaSyncAlt, FaHandHoldingHeart, FaLeaf } from "react-icons/fa";

const ServiceSchedule = () => {
  return (
    <>
    <Header/>
        <MainNavbar/>
        <section 
        className="ewaste-hero"
        style={{
          background: `url("/assets/schedule1.jpg") center/cover no-repeat`,
        }}>
          <div className="overlay"></div>
          <div className="content" data-aos="fade-up">
            <h1 className="hero-title">Scheduled Pickup</h1>
            <p className="hero-subtitle">Our Services</p>
            <p className="breadcrumb">
          <Link to="/" className="breadcrumb-link">Home</Link> &gt;{" "}
          <Link to="/serviceslist" className="breadcrumb-link">Our Services</Link>&gt;{" "}
          <Link to="/" className="breadcrumb-link">Scheduled Pickup</Link>
        </p>
          </div>
        </section>
    <section id="service-schedule">
      <Container>
        <div className="service-schedule-heading">
          <h2 style={{color:"#1a4d2e"}}>Waste collection made routine and reliable.</h2>
          {/* <p className="subheading">Waste collection made routine and reliable.</p> */}
        </div>

        <div className="service-schedule-content">
          <p>
            Keep your home, business, or community consistently clean with GoTrash’s Scheduled Pickup services.
            Whether you need daily, weekly, or monthly waste collection, we’ll design a routine that fits your lifestyle
            or business needs.
          </p>
        </div>

       

<section className="py-5 bg-light">
      <div className="container">
        {/* <h3 className="text-center mb-4">Our Scheduled Pickup Benefits</h3> */}
        <Row className="services-cards-row g-4">
          {/* Consistency */}
          <Col xs={12} md={6} lg={3}>
            <div className="stack">
              <Card className="services-card h-100 text-center">
                <div className="services-icon">
                  <FaClock />
                </div>
                <Card.Body>
                  <Card.Title>Consistency</Card.Title>
                  <Card.Text>No missed pickups, always on time.</Card.Text>
                </Card.Body>
              </Card>
            </div>
          </Col>

          {/* Flexibility */}
          <Col xs={12} md={6} lg={3}>
            <div className="stack">
              <Card className="service-card h-100 text-center">
                <div className="service-icon">
                  <FaSyncAlt />
                </div>
                <Card.Body>
                  <Card.Title>Flexibility</Card.Title>
                  <Card.Text>Choose a frequency that works best for you.</Card.Text>
                </Card.Body>
              </Card>
            </div>
          </Col>

          {/* Convenience */}
          <Col xs={12} md={6} lg={3}>
            <div className="stack">
              <Card className="service-card h-100 text-center">
                <div className="service-icon">
                  <FaHandHoldingHeart />
                </div>
                <Card.Body>
                  <Card.Title>Convenience</Card.Title>
                  <Card.Text>
                    Hassle-free scheduling through our online platform.
                  </Card.Text>
                </Card.Body>
              </Card>
            </div>
          </Col>

          {/* Clean Surroundings */}
          <Col xs={12} md={6} lg={3}>
            <div className="stack">
              <Card className="service-card h-100 text-center">
                <div className="service-icon">
                  <FaLeaf />
                </div>
                <Card.Body>
                  <Card.Title>Clean Surroundings</Card.Title>
                  <Card.Text>
                    A healthier and tidier environment for everyone.
                  </Card.Text>
                </Card.Body>
              </Card>
            </div>
          </Col>
        </Row>
      </div>
    </section>
      </Container>
    </section>
    {/* Help Section */}
<section className="help-section text-center py-5 bg-light">
  <div className="container">
    <h3>For Any Help</h3>
    <p className="text-muted mb-4">
      Need assistance with scheduling or have any questions?  
      Our support team is just a click away.
    </p>
    <a href="#contact" className="btn btn-primary px-4">Contact Us</a>
  </div>
</section>
{/* Image + Content Section */}
<section className="image-content-section py-5">
  <div className="container">
    <div className="row align-items-center">
      {/* Image */}
      <div className="col-md-6 mb-4 mb-md-0">
        <img 
          src="/assets/schedule2.jpeg" 
          alt="Scheduled Waste Pickup" 
          className="img-fluid rounded shadow"
        />
      </div>

      {/* Content */}
      <div className="col-md-6">
        <h3>Why Choose Scheduled Pickups?</h3>
        <p className="text-muted">
          With GoTrash, waste collection becomes effortless.  
          Our scheduled pickup plans save you time and ensure your surroundings remain clean.  
        </p>
        <ul className="list-unstyled">
          <li>✔ Reliable service with no delays</li>
          <li>✔ Flexible scheduling to match your lifestyle</li>
          <li>✔ Eco-friendly disposal methods</li>
        </ul>
      </div>
    </div>
  </div>
</section>
<Footer/>
    </>
  );
};

export default ServiceSchedule;
