import React, { useState } from 'react';
import { Navbar, Nav, Container, NavDropdown, Offcanvas, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useNavigate, useLocation } from "react-router-dom";

const MainNavbar = () => {
  const [showOffcanvas, setShowOffcanvas] = useState(false);

const handleOffcanvasShow = () => setShowOffcanvas(true);
const handleOffcanvasClose = () => setShowOffcanvas(false);
const navigate = useNavigate();
const location = useLocation();

const handleContactClick = () => {
  if (location.pathname === "/") {
    const section = document.getElementById("contact");
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    }
  } else {
   
    navigate("/", { state: { scrollToContact: true } });
  }
};

const handleFAQClick = () => {
  if (location.pathname === "/service/aboutus") {
 
    const section = document.getElementById("faq");
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    }
  } else {
  
    navigate("/service/aboutus", { state: { scrollToFAQ: true } });
  }
};

const handlePricing = () => {
  if (location.pathname === "/service/bulk") {
  
    const section = document.getElementById("pricing");
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    }
  } else {
   
    navigate("/service/bulk", { state: { scrollToPricing: true } });
  }
};

  return (
    
      
      
<>
        
        {/* navbar */}
         <Navbar expand="lg" className="bg-transparent  navbar-custom" sticky="top">
            <Container className="d-flex justify-content-between align-items-center">
              {/* Brand */}
              <Navbar.Brand as={Link} to="/" className="fw-bold text-white">GoTrash</Navbar.Brand>

              {/* Center menu */}
              <div className="d-none d-lg-flex mx-auto">
                <Nav className="text-white">
                  <Nav.Link as={Link} to="/"  className="text-white mx-2 custom-hover">Home</Nav.Link>
                  <NavDropdown title="Services" id="services-dropdown" className=' text-white custom-dropdown mx-2'>
                    <NavDropdown.Item as={Link} to="/service/ondemand">On Demand Pickup</NavDropdown.Item>
                    <NavDropdown.Item as={Link} to="/service/residentialpickup">Residential Pickup</NavDropdown.Item>
                    <NavDropdown.Item as={Link} to="/service/bulk">Bulk Waste Collections</NavDropdown.Item>
                    <NavDropdown.Item as={Link} to="/service/schedule">Scheduled Pickups</NavDropdown.Item>
                    <NavDropdown.Item as={Link} to="/service/e-waste">E-Waste Disposal</NavDropdown.Item>
                   
                    <NavDropdown.Item  onClick={handlePricing}>Pricing</NavDropdown.Item>
                    <NavDropdown.Item onClick={handleFAQClick}>FAQ</NavDropdown.Item>
                  </NavDropdown>
                  <Nav.Link as={Link} to="/project" className="text-white mx-2 custom-hover">Projects</Nav.Link>
                  <NavDropdown title="Company" id="company-dropdown" className="custom-dropdown text-white mx-2">
                    <NavDropdown.Item as={Link} to="/service/aboutus">About Us</NavDropdown.Item>
                   
                    <NavDropdown.Item onClick={handleFAQClick}>FAQ</NavDropdown.Item>
                  </NavDropdown>
                  <Nav.Link as={Link} to="/blog" className="text-white mx-2 custom-hover">Blog</Nav.Link>
                </Nav>
              </div>

              {/* Contact Button + Hamburger */}
              <div className="d-flex align-items-center">
                <Button
                  data-aos="fade-left"
                  className="rounded-pill me-2 px-4 py-1 hover-btn"
                  style={{ backgroundColor: '#69b31d', border: 'none', color: 'white' }}
                  onClick={handleContactClick}
                
                >
                  Contact
                </Button>
                <div
                  className="hamburger-icon"
                  onClick={handleOffcanvasShow}
                  style={{ cursor: 'pointer' }}
                  data-aos="fade-left"
                >
                  {/* Stylish Hamburger */}
                  <svg width="28" height="28" viewBox="0 0 100 80" fill="#fff">
                    <rect width="100" height="10" rx="8"></rect>
                    <rect y="30" width="100" height="10" rx="8"></rect>
                    <rect y="60" width="100" height="10" rx="8"></rect>
                  </svg>
                </div>
              </div>
            </Container>
          </Navbar>
          {/* OFF-CANVAS SIDE PANEL */}
          <Offcanvas show={showOffcanvas} onHide={handleOffcanvasClose} placement="end" className="text-dark" backdrop={true} className="offcanvas-end">
            <Offcanvas.Header closeButton>
              <Offcanvas.Title className="fw-bold">GoTrash</Offcanvas.Title>
            </Offcanvas.Header>
            <Offcanvas.Body>
              <h5 className="fw-bold">Our Services</h5>
           
              <div className="d-lg-none">
                <Nav className="flex-column mb-4">
                  <Nav.Link href="#">Home</Nav.Link>
                  <NavDropdown title="Services" id="services-dropdown-mobile">
                
                     <NavDropdown.Item as={Link} to="/service/ondemand">On Demand Pickup</NavDropdown.Item>
                    <NavDropdown.Item as={Link} to="/service/residentialpickup">Residential Pickup</NavDropdown.Item>
                    <NavDropdown.Item as={Link} to="/service/bulk">Bulk Waste Collections</NavDropdown.Item>
                    <NavDropdown.Item as={Link} to="/service/schedule">Scheduled Pickups</NavDropdown.Item>
                    <NavDropdown.Item as={Link} to="/service/e-waste">E-Waste Disposal</NavDropdown.Item>
                    <NavDropdown.Item  onClick={handlePricing}>Pricing</NavDropdown.Item>
                    <NavDropdown.Item onClick={handleFAQClick}>FAQ</NavDropdown.Item>
                  </NavDropdown>
                  <Nav.Link as={Link} to="/project">Projects</Nav.Link>
                  <NavDropdown title="Company" id="company-dropdown-mobile">
                    <NavDropdown.Item as={Link} to="/service/aboutus">About Us</NavDropdown.Item>
                    {/* <NavDropdown.Item href="#">Our Team</NavDropdown.Item>
                    <NavDropdown.Item href="#">Gallery</NavDropdown.Item> */}
                  </NavDropdown>
                  <Nav.Link  as={Link} to="/blog">Blog</Nav.Link>
                  <Nav.Link  onClick={handleContactClick}>Contact</Nav.Link>
                </Nav>
              </div>
              <Nav className="flex-column mb-4">
               

                <Nav.Link as={Link} to="/service/ondemand">On Demand Pickup</Nav.Link>
                <Nav.Link as={Link} to="/service/residentialpickup">Residential Pickup</Nav.Link>
                <Nav.Link as={Link} to="/service/bulk">Bulk Waste Collections</Nav.Link>
                <Nav.Link as={Link} to="/service/schedule">Scheduled Pickups</Nav.Link>
                <Nav.Link as={Link} to="/service/e-waste">E-Waste Disposal</Nav.Link>
               
                
              </Nav>
              <hr />
              <div>
                <p><strong>Contact Us</strong></p>
                <p>🕒 Monday – Friday: 7:00 AM – 5:00 PM</p>
                <p>📍 123 Haridha Nagar, Kerala</p>
                <p>📧 contact@gotrash</p>
                <p>📞 +91 98765 43210</p>
              </div>
            </Offcanvas.Body>
          </Offcanvas>
          
      
    </>
  );
};

export default MainNavbar;
