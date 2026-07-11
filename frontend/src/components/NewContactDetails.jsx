import React, { useEffect, useState } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import { Container, Row, Col, Form, Button } from "react-bootstrap";


const ContactDetails = ({ onSubmit, onBack, defaultValues = {} }) => {
  const [name, setName] = useState(defaultValues.name || "");
  const [phone, setPhone] = useState(defaultValues.phone || "");
  const [email, setEmail] = useState(defaultValues.email || "");
  const [address, setAddress] = useState(defaultValues.address || "");
  const [zipcode, setzipcode] = useState(defaultValues.zipcode || "");

  useEffect(() => {
    AOS.init({ duration: 600, once: true });

    const token = localStorage.getItem("accessToken");
    if (token) {
      fetch("http://127.0.0.1:8000/api/profile/", {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then(res => res.json())
        .then(data => {
          setName(data.full_name || "");
          setPhone(data.phone_number || "");
          setEmail(data.email || "");
          setAddress(data.address || "");
         
          setzipcode(data.zipcode || "");
        })
        .catch(err => console.error("Error loading profile:", err));
    }
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
       name,
       phone:phone ? phone.toString().slice(0, 10) : "",
       email, 
       address ,
       zipcode: zipcode
      
      
      });
  };

  return (
    <Container
      className="my-4 p-4 shadow-sm bg-white"
      style={{ border: "none" }}
      data-aos="fade-up"
    >
      <h3 className="mb-4" style={{ color: "#014421" }}>
        Contact Details
      </h3>

      <Form onSubmit={handleSubmit}>
        <Form.Group as={Row} className="mb-3" data-aos="fade-right">
          <Form.Label column sm={3}>Full Name:</Form.Label>
          <Col sm={9}>
            <Form.Control
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              required
            />
          </Col>
        </Form.Group>

        <Form.Group as={Row} className="mb-3" data-aos="fade-left">
          <Form.Label column sm={3}>Phone Number:</Form.Label>
          <Col sm={9}>
            <Form.Control
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Enter your phone number"
              required
            />
          </Col>
        </Form.Group>

        <Form.Group as={Row} className="mb-3" data-aos="fade-up">
          <Form.Label column sm={3}>Email:</Form.Label>
          <Col sm={9}>
            <Form.Control
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />
          </Col>
        </Form.Group>

        <Form.Group as={Row} className="mb-4" data-aos="fade-right">
          <Form.Label column sm={3}>Address:</Form.Label>
          <Col sm={9}>
            <Form.Control
              as="textarea"
              rows={3}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Enter your address"
              required
            />
          </Col>
        </Form.Group>

  

<Form.Group as={Row} className="mb-3" data-aos="fade-right">
  <Form.Label column sm={3}>Pin Code:</Form.Label>
  <Col sm={9}>
    <Form.Control
      type="text"
      value={zipcode}
      onChange={(e) => setzipcode(e.target.value)}
      placeholder="Enter your zip code"
      required
    />
  </Col>
</Form.Group>

        <Row className="mt-4" >
          <Col sm={6}>
            <Button
              variant="secondary"
              className="w-100"
              onClick={onBack}
            >
              Back
            </Button>
          </Col>
          <Col sm={6}>
            <Button
              type="submit"
              className="w-100"
              style={{ backgroundColor: "#014421", cursor: "pointer" }}
            >
              Confirm
            </Button>
          </Col>
        </Row>
      </Form>
    </Container>
  );
};

export default ContactDetails;
