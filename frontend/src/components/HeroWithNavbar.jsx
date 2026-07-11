import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Navbar, Nav, Container, Row, Col, Button, Offcanvas, NavDropdown, Modal, Form } from 'react-bootstrap';
import AOS from 'aos';
import 'aos/dist/aos.css';
import './Hero.css';

import Header from './Header';

import { useLocation } from "react-router-dom";
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import ScrollToTopButton from './ScrollToTopButton';
import { jwtDecode } from "jwt-decode";
import MainNavbar from './MainNavbar';

const HeroWithNavbar = () => {
  const backgroundImages = ['/assets/hero_bg1.png', '/assets/hero_bg3.jpg', '/assets/hero_bg2.jpg'];
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showHeader, setShowHeader] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [showAvailabilityModel, setShowAvailabilityModel] = useState(false);
  const [cities, setCities] = useState([]);
  const [selectedCity, setSelectedCity] = useState('');
  const [pickupDates, setPickupDates] = useState([]);
  const location = useLocation();
  const navigate = useNavigate();

  const handleAvailabilityShow = () => setShowAvailabilityModel(true);
  const handleAvailabilityClose = () => setShowAvailabilityModel(false);

  useEffect(() => {
    if (location.state?.scrollTo) {
      const section = document.getElementById(location.state.scrollTo);
      if (section) {
        section.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, [location]);


  useEffect(() => {
    axios.get(`${process.env.REACT_APP_API_URL}cities/`)
      .then(res => setCities(res.data))
      .catch(err => console.error(err));
  }, []);

  // Fetch dates when city changes
  useEffect(() => {
    if (selectedCity) {
      axios.get(`${process.env.REACT_APP_API_URL}cities/${selectedCity}/pickupdates/`)
        .then(res => setPickupDates(res.data))
        .catch(err => console.error(err));
    }
  }, [selectedCity]);

  useEffect(() => {
    AOS.init({ duration: 1000 });

    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % backgroundImages.length);
    }, 2000); // Change every 2 seconds

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY) {
        // scrolling down
        setShowHeader(false);
      } else {
        // scrolling up
        setShowHeader(true);
      }
      setLastScrollY(currentScrollY);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);




  const handleSchedulePickup = () => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        const currentTime = Date.now() / 1000; // in seconds
        if (decoded.exp > currentTime) {
          // Token valid → Go directly to /new-request (step 1 = PricingSelectionForm)
          navigate("/new-request");
        } else {
          // Token expired → clear & login
          localStorage.removeItem("accessToken");
          navigate("/login");
        }
      } catch (err) {
        console.error("Token decode failed:", err);
        navigate("/login");
      }
    } else {
      navigate("/login");
    }
  };
  return (
    <>
      <Header />

      <div className={`header-navbar-wrapper ${showHeader ? 'show-header' : 'hide-header'}`} id='hero'>

        <div
          className="hero-slide"
          style={{
            backgroundImage: `url(${backgroundImages[currentImageIndex]})`,
            transition: 'background-image 1s ease-in-out',
          }}
        >
          <MainNavbar />
          <div className="overlay">


            {/* Hero Section */}
            <Container>
              <Row className="align-items-center mainhero" style={{ minHeight: '80vh' }}>
                <Col md={6}>
                  <h1 data-aos="fade-right" >Efficient<br />
                    Waste Management <br />
                    for a Greener World</h1>
                </Col>
                <Col md={6}>
                  <p data-aos="fade-left" >
                    Delivering smart waste solutions for homes, <br />
                    businesses & industries to keep communities clean & protect <br />
                    the environment every day.
                  </p>
                  <div className="btn-group mt-4">

                    <Button className="custom-btn me-3 hover-btn h-btn" onClick={handleSchedulePickup}>
                      Schedule Pickup</Button>
                    <Button className="custom-btn hover-btn h-btn" onClick={handleAvailabilityShow}>Check Availability</Button>
                    <Modal show={showAvailabilityModel} onHide={handleAvailabilityClose} centered>
                      <Modal.Header closeButton>
                        <Modal.Title>Check Waste Pickup Availability</Modal.Title>
                      </Modal.Header>
                      <Modal.Body>
                        <Form.Group controlId="citySelect">
                          <Form.Label>Select Your City</Form.Label>
                          <Form.Select
                            value={selectedCity}
                            onChange={(e) => setSelectedCity(e.target.value)}
                          >
                            <option value="">-- Choose a city --</option>
                            {cities.map((city) => (
                              <option key={city.id} value={city.id}>
                                {city.name}
                              </option>
                            ))}
                          </Form.Select>
                        </Form.Group>

                        {pickupDates.length > 0 && (
                          <div className="mt-3">
                            <h6>Available Pickup Dates:</h6>
                            <ul className="list-group">
                              {pickupDates.map((date, index) => (
                                <li key={index} className="list-group-item">
                                  {date.date}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </Modal.Body>
                      <Modal.Footer>

                        <Button
                          className="custom-btn me-3 hover-btn h-btn"
                          onClick={handleSchedulePickup}
                        >
                          Schedule Pickup
                        </Button>
                      </Modal.Footer>
                    </Modal>
                  </div>
                </Col>
              </Row>
            </Container>
          </div>
        </div>
      </div>
      <ScrollToTopButton />
    </>
  );
};

export default HeroWithNavbar;

