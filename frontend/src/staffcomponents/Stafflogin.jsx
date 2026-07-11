// src/pages/StaffLoginPage.jsx
import React, { useState,useEffect } from "react";
import { Form, Button, Container, Row, Col } from "react-bootstrap";
import "./Stafflogin.css"; // custom styling
import axios from "axios";

const Stafflogin = () => {
 
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [error, setError] = useState("");


  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
  
    try {
      const response = await axios.post("http://127.0.0.1:8000/api/staff/login/", {
        username: formData.username,
        password: formData.password,
      });
  
      // Save tokens to localStorage
      localStorage.setItem("access", response.data.access);
      localStorage.setItem("refresh", response.data.refresh);
  
      // ✅ Set Axios default header
      axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.access}`;
  
      alert("Staff logged in successfully!");
      window.location.href = "/staff/Staffdashboard"; // redirect after login
    } catch (err) {
      if (err.response) {
        setError(
          err.response.data.detail ||
          err.response.data.non_field_errors?.[0] ||
          "Login failed. Please check credentials."
        );
      } else {
        setError("Error: " + err.message);
      }
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("access");
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  }, []);
    

  

 


  return (
    <div className="staff-login-page">
      <Container fluid className="h-100">
        <Row className="h-100">
          {/* LEFT SIDE */}
          <Col
            md={6}
            className="d-none d-md-flex align-items-center justify-content-center left-panel"
            style={{
              background: `url(/assets/staffbg.jpg) center center/cover no-repeat`,
            }}
          >
            <div className="text-center text-white">
              <h1 className="logo">GoTrash</h1>
              {/* <h3 className="subtitle">Waste Management System</h3> */}
              <p className="tagline">
                Manage pickups, schedules and reports
              </p>
            </div>
          </Col>

          {/* RIGHT SIDE */}
          <Col
            md={6}
            className="d-flex align-items-center justify-content-center right-panel"
          >
            <div className="login-box">
              <h2 className="mb-4 text-center">Staff Login</h2>
              {error && <p className="text-danger">{error}</p>}
              <Form onSubmit={handleSubmit}>
              <Form.Group controlId="username" className="mb-3">
                  <Form.Label>Username</Form.Label>
                  <Form.Control
                    type="text"
                    name="username"
                    placeholder="Enter your username"
                    value={formData.username}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
              

                <Form.Group controlId="password" className="mb-3">
                  <Form.Label>Password</Form.Label>
                  <Form.Control
                    type="password"
                    name="password"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>

                <Button type="submit" className="w-100 btn-login">
                  Sign In
                </Button>
              </Form>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Stafflogin;
