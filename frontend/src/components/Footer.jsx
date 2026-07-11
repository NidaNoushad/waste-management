import React from 'react';
import "./Footer.css";
import { Link } from 'react-router-dom';

import { Container, Row, Col } from 'react-bootstrap';
import {
  FaFacebookF,
  FaTwitter,
  FaInstagram,
  FaYoutube,
  FaWhatsapp
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';



const Footer = () => {

  const navigate = useNavigate();
  const goToContact = (e) => {
    e.preventDefault();
    navigate("/", { state: { scrollTo: "contact" } });
  }
  return (
    <footer className="footer text-light position-relative pt-5 pb-3" style={{ backgroundColor: "#014421" }}>
      <Container fluid className="px-5" >
      <Row className="py-5 g-5" style={{marginBottom: "2rem"}}>
  {/* Column 1: Description */}
  <Col md={4}>
    <h4 style={{color:"#ffff"}}>GoTrash</h4>
    <p className="text-grey">We are committed to providing dependable, eco-friendly waste management solutions tailored to the unique needs of homes, businesses, and industries. By combining advanced technology with sustainable practices, we work to reduce environmental impact, increase efficiency, and support a cleaner, greener future for our communities and the planet</p>
  </Col>

  {/* Column 2: Company + Services */}
  <Col md={4} className="text-center">
    <div className="d-flex justify-content-between">
      <div>
        <h6 className="fw-bold text-grey">Company</h6>
        <ul className="list-unstyled">
          <li><a href="#" className="text-grey">Home</a></li>
          <li><a as={Link} to="/serviceslist" className="text-grey">Our Services</a></li>
          <li><a href="#" className="text-grey">Projects</a></li>
          <li><a as={Link} to="/service/aboutus" className="text-grey">About Us</a></li>
          <li><a href="#" className="text-grey">Blog</a></li>
          <li><a href="#" className="text-grey" onClick={goToContact}>Contact</a></li>
        </ul>
      </div>
      <div>
        <h6 className="fw-bold text-grey">Our Services</h6>
        <ul className="list-unstyled">
          <li><a as={Link} to="/service/ondemand" className="text-grey">On-Demand Pickup</a></li>
          <li><a as={Link} to="/service/e-waste" className="text-grey">E-Waste Disposal</a></li>
          <li><a as={Link} to="/service/residentialpickup" className="text-grey">Residential Pickup</a></li>
          <li><a as={Link} to="/service/bulk" className="text-grey">Bulk Waste Collection</a></li>
          <li><a as={Link} to="/service/schedule" className="text-grey">Scheduled Pickups</a></li>
         
        </ul>
      </div>
    </div>
  </Col>

  {/* Column 3: Follow Us Icons */}
  <Col md={4} className="text-center">
    <h6 className="fw-bold text-grey">Follow Us</h6>
    <div className="d-flex gap-3 mt-2 justify-content-center">
      <a href="#" className="text-grey fs-5"><FaFacebookF /></a>
      <a href="#" className="text-grey fs-5"><FaTwitter /></a>
      <a href="#" className="text-grey fs-5"><FaInstagram /></a>
      <a href="#" className="text-grey fs-5"><FaYoutube /></a>
      <a href="#" className="text-grey fs-5"><FaWhatsapp /></a>
    </div>
  </Col>
</Row>

       
      </Container>

      {/* Background Text */}
      <div className="footer-bg-text position-absolute bottom-0 start-0 w-100 text-center" style={{ zIndex: 0 }}>
        <h1 className="display-1 text-uppercase  opacity-10 text-grey" style={{ fontWeight: 800, marginBottom: "3rem", letterSpacing: "20px" }}>
          gotrash
        </h1>
      </div>
    </footer>
  );
};

export default Footer;
