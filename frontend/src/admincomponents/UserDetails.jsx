import React from "react";
import { Container, Row, Col, Card } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";

const UserDetails = () => {
  const { userId } = useParams();
  const navigate = useNavigate();

  const boxes = [
    { title: "Waste Requests", path: `/adminpanel/user/${userId}/waste-requests` },
    { title: "User Updates", path: `/adminpanel/user/${userId}/user-updates` },
    { title: "Request Status", path: `/adminpanel/user/${userId}/request-status` },
    { title: "User Profile", path: `/adminpanel/user/${userId}/user-profile` },
    { title: "Cancelled Requests", path: `/adminpanel/user/${userId}/user-cancel` },
  ];

  return (
    <Container className="mt-4">
      <h2 className="mb-4">User Details</h2>
      <Row>
        {boxes.map((box, index) => (
          <Col key={index} xs={12} sm={6} md={4} className="mb-3">
            <Card
              className="text-center p-3 h-100 hover-shadow"
              onClick={() => navigate(box.path)}
              style={{ cursor: "pointer" }}
            >
              <Card.Body>
                <Card.Title>{box.title}</Card.Title>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
};

export default UserDetails;
