import React, { useEffect } from "react";
import "./ServiceEWasteRecycling.css";
import { Container, Row, Col,Card } from "react-bootstrap"
import { FaTruck, FaRecycle, FaDatabase, FaCogs, FaChartLine } from "react-icons/fa";
import AOS from "aos";
import "aos/dist/aos.css";
import { Link } from "react-router-dom";
import Footer from './Footer';
import Header from './Header';

import MainNavbar from './MainNavbar';

const ServiceEwasteRecycling = () => {
  useEffect(() => {
    AOS.init({ duration: 1000, once: true });
  }, []);
  
    useEffect(() => {
      if (typeof window !== "undefined") {
        const observerOptions = {
          threshold: 0.1,
          rootMargin: "0px 0px -50px 0px",
        };
  
        const observer = new IntersectionObserver((entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.style.opacity = "1";
              entry.target.style.transform = "translateY(0)";
            }
          });
        }, observerOptions);
  
        document.querySelectorAll("[data-aos]").forEach((el) => {
          el.style.opacity = "0";
          el.style.transform = "translateY(30px)";
          el.style.transition = "all 0.8s ease";
          observer.observe(el);
        });
      }
    }, []);
  
    const items = [
      "Televisions & Monitors",
      "Computers & Laptops",
      "Keyboards, Mice, and Accessories",
      "Printers, Scanners, and Copiers",
      "Mobile Phones & Landline Phones",
      "Small Home Appliances",
    ];
  

  return (
    <>
    <Header/>
    <MainNavbar/>
    <section 
    className="ewaste-hero"
    style={{
      background: `url("/assets/ewaste3.jpg") center/cover no-repeat`,
    }}>
      <div className="overlay"></div>
      <div className="content" data-aos="fade-up">
        <h1 className="hero-title">E-Waste Disposal</h1>
        <p className="hero-subtitle">Our Services</p>
        <p className="breadcrumb">
      <Link to="/" className="breadcrumb-link">Home</Link> &gt;{" "}
      <Link to="/serviceslist" className="breadcrumb-link">Our Services</Link>
    </p>
      </div>
    </section>

      {/* Second Section */}
      <section className="ewaste-info py-5">
        <Container>
          <Row className="align-items-center">
            {/* Left Image */}
            <Col md={6} data-aos="fade-right">
              <img
                src="/assets/ewaste2.jpg"
                alt="E-waste handling"
                className="img-fluid rounded shadow"
              />
            </Col>

            {/* Right Content */}
            <Col md={6} data-aos="fade-left">
              <h2 className="section-title">Handling Electronics the Right Way</h2>
              <p className="section-text">
                At <strong>GoTrash Waste Management</strong>, we 
                expertise in safely managing electronic waste. From obsolete 
                gadgets to large-scale IT equipment, our process ensures 
                responsible disposal and maximum recovery of value.  
              </p>
              <p className="section-text">
                We not only wipe sensitive data clean but also identify reusable 
                components that can be remarketed or recycled. By choosing GoTrash, 
                you reduce environmental impact while saving your business money 
                through sustainable e-waste practices.
              </p>
            </Col>
          </Row>
        </Container>
      </section>

      {/* --- Section 3 --- */}
      <section className="ewaste-offerings py-5">
        <Container fluid>
          <Row className="align-items-center">
            {/* Left Content */}
            <Col md={6} className="offer-text" data-aos="fade-right">
              <h2 className="section-title">
                Electronics <br /> Collection Solutions
              </h2>
              <p className="section-text">
                At <strong>GoTrash</strong>, we offer hassle-free collection services for unwanted or unused electronics. Whether it’s from your home, office, or community, our goal is to keep your space clean while we handle the responsible recycling.
              </p>
              <ul className="offer-list">
                <li>
                  <strong>Trust:</strong> Backed by proven expertise in 
                  responsible waste management.
                </li>
                <li>
                  <strong>Dependability:</strong> A dedicated team ensuring 
                  smooth and reliable service.
                </li>
              
                <li>
                  <strong>Efficiency:</strong> Skilled staff and modern 
                  facilities for safe, quick processing.
                </li>
                <li>
                  <strong>Convenience:</strong> Easy scheduling through our 
                  online platform.
                </li>
              </ul>
            </Col>

            {/* Right Image */}
            <Col md={6} className="p-0" data-aos="fade-left">
              <img
                src="/assets/ewaste4.png"
                alt="Electronics recycling"
                className="img-fluid h-100 w-100 object-fit-cover"
              />
            </Col>
          </Row>
        </Container>
      </section>
      {/* --- Section 4 --- */}
      <section className="recycling-process py-5">
        <Container fluid>
          <Row>
            {/* Left Side - Black */}
            <Col md={6} className="process-left d-flex flex-column justify-content-center text-light" data-aos="fade-right">
              <h2 className="process-title mb-4">Recycling Process</h2>

              <div className="process-step">
                <FaTruck className="process-icon" />
                <div>
                  <h5>Schedule a Pickup</h5>
                  <p>Log into your account, give us some details and we'll handle the rest.</p>
                </div>
              </div>

              <div className="process-step">
                <FaRecycle className="process-icon" />
                <div>
                  <h5>Pickup and Collection</h5>
                  <p>From small loads to full truck pickups.</p>
                </div>
              </div>
            </Col>

            {/* Right Side - Dark Green */}
            <Col md={6} className="process-right d-flex flex-column justify-content-center text-light" data-aos="fade-left">
              <div className="process-step">
                <FaDatabase className="process-icon" />
                <div>
                  <h5>Safe Handling</h5>
                  <p>All collected materials are handled responsibly to ensure safety and compliance.</p>
                </div>
              </div>

              <div className="process-step">
                <FaCogs className="process-icon" />
                <div>
                  <h5>Recycling & Processing</h5>
                  <p>GoTrash ensures the collected waste is properly recycled at our facilities to reduce landfill impact and support sustainability.</p>
                </div>
              </div>

              <div className="process-step">
                <FaChartLine className="process-icon" />
                <div>
                  <h5>Tracking & Reporting</h5>
                  <p>Stay informed with updates on your scheduled pickups and collection history through your account dashboard.</p>
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </section>
{/* sec5 */}
      <section className="ewaste-section5 py-5">
      <Container>
        {/* Heading */}
        <Row className="justify-content-center text-center mb-4">
          <Col lg={8}>
            <h2 className="section5-title" data-aos="fade-up">
              Examples of E-Waste We Collect
            </h2>
            <p className="section5-subtitle" data-aos="fade-up" data-aos-delay="100">
              GoTrash helps you dispose of common electronic items responsibly,
              including:
            </p>
          </Col>
        </Row>

        {/* Items Grid */}
        <Row className="g-4">
          {items.map((item, index) => (
            <Col key={index} md={6} lg={4} data-aos="fade-up" data-aos-delay={200 + index * 100}>
              <Card className="ewaste-card shadow-sm h-100 text-center">
                <Card.Body>
               
                  <Card.Text className="fw-medium">{item}</Card.Text>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>
    </section>
    <Footer/>
    
    </>
  );
};

export default ServiceEwasteRecycling;
