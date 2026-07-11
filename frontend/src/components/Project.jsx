import React from "react";
import { Card, Button, Container, Row, Col } from "react-bootstrap";
import Footer from './Footer';
import Header from './Header';
import MainNavbar from './MainNavbar';

const Project = () => {
  const projects = [
    {
      title: "Waste Pickup Scheduler",
      description: "Manage and schedule waste pickup requests efficiently.",
      link: "#",
    },
    {
      title: "User Dashboard",
      description: "View and track your waste requests in real-time.",
      link: "#",
    },
    {
      title: "Payment Integration",
      description: "Secure online payment for waste disposal services.",
      link: "#",
    },
  ];

  return (
    <>
    <Header/>
    <MainNavbar/>
    <Container className="my-5">
      <h2 className="text-center mb-4">Our Projects</h2>
      <Row>
        {projects.map((project, index) => (
          <Col key={index} md={4} className="mb-4">
            <Card className="h-100 shadow-sm">
              <Card.Body>
                <Card.Title>{project.title}</Card.Title>
                <Card.Text>{project.description}</Card.Text>
                <Button variant="success" href={project.link}>
                  Learn More
                </Button>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
    <Footer/>
    </>
  );
};

export default Project;
