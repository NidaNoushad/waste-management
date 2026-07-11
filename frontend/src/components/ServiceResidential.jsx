
import React, { useEffect,  useState } from "react";
import "./ServiceResidential.css";
import { Container, Row, Col,Card ,Button,Offcanvas, NavDropdown, Modal, Form } from "react-bootstrap"
import { FaTruck, FaRecycle, FaDatabase, FaCogs, FaChartLine } from "react-icons/fa";
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

const ServiceResidential = () => {
  const [showAvailabilityModel, setShowAvailabilityModel] = useState(false);
  const [cities, setCities] = useState([]);
  const [selectedCity, setSelectedCity] = useState('');
  const [pickupDates, setPickupDates] = useState([]);
  const handleAvailabilityShow = () => setShowAvailabilityModel(true);
  const handleAvailabilityClose = () => setShowAvailabilityModel(false);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get('http://localhost:8000/api/cities/')
      .then(res => setCities(res.data))
      .catch(err => console.error(err));
  }, []);

  // Fetch dates when city changes
  useEffect(() => {
    if (selectedCity) {
      axios.get(`http://localhost:8000/api/cities/${selectedCity}/pickupdates/`)
        .then(res => setPickupDates(res.data))
        .catch(err => console.error(err));
    }
  }, [selectedCity]);
  useEffect(() => {
    AOS.init({ duration: 1000, once: true });
  }, []);
  
  const steps = [
    {
      icon: <CheckCircle size={36} />,
      title: "Book Your Pickup",
      text: "Place a request online in just a few clicks.",
    },
    {
      icon: <Truck size={36} />,
      title: "Next-Day Collection",
      text: "Our team arrives the following day to collect your waste.",
    },
    {
      icon: <Calendar size={36} />,
      title: "Scheduled Pickups",
      text: "Choose daily, weekly, or monthly service for hassle-free collection.",
    },
    {
      icon: <Recycle size={36} />,
      title: "Responsible Disposal",
      text: "Waste is handled safely and efficiently.",
    },
    {
      icon: <Leaf size={36} />,
      title: "Eco-Friendly Recycling",
      text: "Collected waste is recycled or repurposed to protect the environment.",
    },
  ];
  
    

    const features = [
      {
        icon: "fa-solid fa-truck", // Doorstep convenience
        title: "Doorstep Convenience",
        description: "No effort required – we come directly to your location.",
      },
      {
        icon: "fa-solid fa-calendar-check", // Flexible plans
        title: "Flexible Plans",
        description: "Choose a schedule that fits perfectly with your lifestyle.",
      },
      {
        icon: "fa-solid fa-users", // Reliable team
        title: "Reliable Team",
        description: "Safe and hygienic handling by our professional staff.",
      },
    ];
    const handleSchedulePickup = () => {
      const token = localStorage.getItem("accessToken");
      if (token) {
        try {
          const decoded = jwtDecode(token);
          const currentTime = Date.now() / 1000; // in seconds
          if (decoded.exp > currentTime) {
            // ✅ Token valid → Go directly to /new-request (step 1 = PricingSelectionForm)
            navigate("/new-request"); 
          } else {
            // ❌ Token expired → clear & login
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
    <div>
    <Header/>
    <MainNavbar/>
    <section 
    className="ewaste-hero"
    style={{
      background: `url("/assets/residential2.jpg") center/cover no-repeat`,
    }}>
      <div className="overlay"></div>
      <div className="content" data-aos="fade-up">
        <h1 className="hero-title">Residential Pickup</h1>
        <p className="hero-subtitle">Our Services</p>
        <p className="breadcrumb">
      <Link to="/" className="breadcrumb-link">Home</Link> &gt;{" "}
      <Link to="/serviceslist" className="breadcrumb-link">Our Services</Link>&gt;{" "}
      <Link to="/" className="breadcrumb-link">Residential Pickup</Link>
    </p>
      </div>
    </section>

      {/* Second Section */}
      <section className="service-residential py-5">
      <Container fluid>
        <Row className="align-items-center">
          {/* Left Side */}
          <Col
            md={6}
            className="text-section px-5"
            data-aos="fade-right"
          >
            <h2 className="heading mb-4">
              Convenient Waste Collection for Every Home
            </h2>
            <p className="content mb-4">
              GoTrash makes household waste management simple and reliable.
              Order today, and your waste will be picked up the very next day.
            </p>
            <Button className="schedule-btn rounded-pill px-4 py-2" onClick={() => navigate('/login')}>
              Schedule Pickup
            </Button>
          </Col>

          {/* Right Side */}
          <Col
            md={6}
            className="image-section text-center"
            data-aos="fade-left"
          >
            <img
              src="/assets/residential1.png" // replace with your actual image
              alt="Waste Collection Service"
              className="img-fluid rounded shadow"
            />
          </Col>
        </Row>
      </Container>
    </section>

      {/* --- Section 3 --- */}
      <section className="how-it-works py-5">
      <Container>
        <div className="text-center mb-5" data-aos="fade-up">
          <h2 className="section-title">How It Works</h2>
        </div>

        {/* First Row - 3 Cards */}
        <Row>
          {steps.slice(0, 3).map((step, index) => (
            <Col
              md={4}
              sm={6}
              xs={12}
              key={index}
              className="mb-4"
              data-aos="fade-up"
              data-aos-delay={index * 150}
            >
              <Card className="how-card h-100">
                <Card.Body className="text-center">
                  <div className="icon mb-3">{step.icon}</div>
                  <Card.Title className="fw-bold">{step.title}</Card.Title>
                  <Card.Text>{step.text}</Card.Text>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>

        {/* Second Row - 2 Cards full width */}
        <Row>
          {steps.slice(3).map((step, index) => (
            <Col
              md={6}
              xs={12}
              key={index}
              className="mb-4"
              data-aos="fade-up"
              data-aos-delay={(index + 3) * 150}
            >
              <Card className="how-card h-100">
                <Card.Body className="text-center">
                  <div className="icon mb-3">{step.icon}</div>
                  <Card.Title className="fw-bold">{step.title}</Card.Title>
                  <Card.Text>{step.text}</Card.Text>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>
    </section>
      {/* --- Section 4 --- */}
      <section className="check-availability py-5">
      <Container className="text-center" data-aos="fade-up">
        <h2 className="section-title mb-3">Check Availability</h2>
        <p className="section-text mb-4">
          Choose your city from the list below to see the upcoming waste pickup
          schedule in your area. Stay informed and never miss a collection day!
        </p>

        <div className="availability-form d-flex flex-column flex-md-row justify-content-center align-items-center gap-3">
      
          <Button className="availability-btn px-4 py-2 rounded-pill" onClick={handleAvailabilityShow}>
            check out
          </Button>
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
                      {/* <Button variant="success" className="rounded-pill px-4" onClick={() => navigate('/login')}> */}
                      <Button
  className="custom-btn me-3 hover-btn h-btn"
  onClick={handleSchedulePickup}
>
                        Schedule Pickup
                      </Button>
                    </Modal.Footer>
                  </Modal>
        </div>
      </Container>
    </section>
{/* sec5 */}
<section className="why-choose-us py-5">
      <div className="container">
        <div className="row">
          <div className="col-12 text-center mb-5">
            <h2 className="section-title">WHY CHOOSE US</h2>
          </div>
        </div>

        <div className="row justify-content-center">
          {features.map((feature, index) => (
            <div key={index} className="col-lg-4 col-md-6 col-12 mb-4">
              <div className="feature-card h-100 text-center p-4">
                <div className="feature-icon">
                  <i className={feature.icon}></i>
                </div>
                <h4 className="feature-title">{feature.title}</h4>
                <p className="feature-description">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
    <div className="footerthis">
    <Footer/>
    </div>
    
    </div>
  
  );
};

export default ServiceResidential;
