// src/components/ServiceList.jsx
import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import "./ServicesList.css";
import Footer from './Footer';
import Header from './Header';

import MainNavbar from './MainNavbar';

const services = [
  {
    name: "E-Waste Disposal",
    description: "Safe collection of electronic waste from homes and businesses.",
    image: "/assets/ewaste1.jpg",
    link: "/service/e-waste",
  },
  {
    name: "On-Demand Pickup",
    description: "Urgent waste pickup, scheduled for the very next day.",
    image: "/assets/rp2.jpeg",
    link: "/service/ondemand",
  },
  {
    name: "Residential Pickup",
    description: "Affordable pickup for small loads (under 25 kg).",
    image: "/assets/residential1.png",
    link: "/service/residentialpickup",
  },
  {
    name: "Bulk Waste Collection",
    description: "Hassle-free pickup for larger loads (above 25 kg).",
    image: "/assets/bulk1.jpg",
    link: "/service/bulk",
  },
  {
    name: "Scheduled Pickups",
    description: "Daily, weekly, or monthly collection options.",
    image:"/assets/schedule1.jpg",
    link: "/service/schedule",
  },
  
];

export default function ServicesList() {
  return (
    <>
    <Header/>
    <MainNavbar/>
    <Container   className="p-0" style={{ background: "#e6f4e6" }}>
     {/* First Section */}
  <Row className="justify-content-center Col lg={10} first-section" style={{ padding: "80px 20px", background: "white" }}>
    <Col md={6}>
      <h1>Our Company Services</h1>
    </Col>
    <Col md={6}>
      <p>
        GoTrash offers safe, reliable, and flexible waste management solutions for homes, offices, and events. From urgent pickups to scheduled collections, we handle it all.
      </p>
    </Col>
  </Row>
  {/* {sectn2} */}
      <Row className="g-0">
        {services.map((service, idx) => (
          <Col md={12} key={idx}>
          <a href={service.link} style={{ textDecoration: "none", color: "inherit" }}>
            <div
              className="section"
              style={{
                backgroundImage: `url(${service.image})`,
              }}
            >
              <div className="overlay"></div>
              <div className="service-text">
                <h2>{service.name}</h2>
                <p>{service.description}</p>
              </div>
            </div>
            </a>
          </Col>
        ))}
      </Row>
    </Container>
    <Footer/>
    </>
  );
}
