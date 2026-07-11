

import React, { useEffect, useState } from "react";
import { Container, Card, Button, Form, Row, Col } from "react-bootstrap";
import axios from "axios";
import { FaStar } from "react-icons/fa";
import { useLocation } from "react-router-dom";

const FeedbackForm = ({ wasteRequestId, pickupDate, onFeedbackSubmitted, existingFeedback }) => {
  const [comment, setComment] = useState(existingFeedback?.comment || "");
  const [rating, setRating] = useState(existingFeedback?.rating || 5);
  const [submitting, setSubmitting] = useState(false);
  const [hoverRating, setHoverRating] = useState(0);

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const token = localStorage.getItem("accessToken");
      const res = await axios.post(
        `${process.env.REACT_APP_API_URL}feedback/${wasteRequestId}/`,
        {
          pickup_date: pickupDate, comment, rating
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      onFeedbackSubmitted(res.data);
      setSubmitting(false);

    } catch (err) {
      // console.error(err);
      console.error("Error submitting feedback:", err.response?.data || err);
      alert("Failed to submit feedback");
      setSubmitting(false);

    }
  };

  return (
    <Form className="mt-3">
      <Form.Group className="mb-2">
        <Form.Label>Feedback</Form.Label>
        <Form.Control
          as="textarea"
          rows={2}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Write your feedback..."
          style={{ borderRadius: "12px", padding: "10px" }}
        />
      </Form.Group>
      <Form.Group className="mb-3">
        <Form.Label>Rating</Form.Label>
        <div style={{ display: "flex", gap: "5px" }}>
          {[1, 2, 3, 4, 5].map((star) => (
            <FaStar
              key={star}
              size={28}
              style={{ cursor: "pointer", transition: "transform 0.2s" }}
              color={(hoverRating || rating) >= star ? "#ffc107" : "#e4e5e9"}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              onClick={() => setRating(star)}
              onMouseDown={() => setHoverRating(star)}
            />
          ))}
        </div>
      </Form.Group>
      <Button
        onClick={handleSubmit}
        disabled={submitting}
        className="w-100"
        style={{
          background: "#28a745",
          border: "none",
          borderRadius: "12px",
          padding: "8px 0",
          fontWeight: "bold",
        }}
      >
        {submitting
          ? "Submitting..."
          : existingFeedback
            ? "Update Feedback"
            : "Submit Feedback"}
      </Button>
    </Form>
  );
};

const Feedback = () => {
  const [completedPickups, setCompletedPickups] = useState([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const highlightPickupId = location.state?.highlightPickupId;
  const highlightOrderId = location.state?.highlightOrderId;
  const highlightPickupDate = location.state?.highlightPickupDate;

  useEffect(() => {
    const fetchCompletedPickups = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        const res = await axios.get(
          `${process.env.REACT_APP_API_URL}waste-request-pickups/?status=Complete`,
          { headers: token ? { Authorization: `Bearer ${token}` } : {} }
        );
        setCompletedPickups(res.data.results);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };
    fetchCompletedPickups();
  }, []);



  const handleFeedbackUpdate = (pickupId, pickupDate, feedback) => {
    setCompletedPickups((prev) =>
      prev.map((p) => {
        if (p.id === pickupId) {

          const existing = p.feedbacks || [];
          const updatedFeedbacks = existing.filter(f => f.pickup_date !== pickupDate);
          return { ...p, feedbacks: [...updatedFeedbacks, feedback] };
        }
        return p;
      })
    );
  };


  return (

    <Container className="my-5">
      {/* Stylish Heading Section */}
      <div className="text-center mb-5">
        <h1 style={{ fontWeight: "bold", color: "#1a4d2e", fontSize: "2.5rem" }}>
          We appreciate your feedback
        </h1>
        <p style={{ fontSize: "1.1rem", color: "#555", maxWidth: "600px", margin: "0 auto", lineHeight: "1.6" }}>
          We are always looking for ways to improve your experience. <br />
          Please take a moment to evaluate and tell us what you think.
        </p>
      </div>

      {loading ? (
        <p className="text-center">Loading...</p>
      ) : completedPickups.length === 0 ? (
        <p className="text-center">No completed pickups yet.</p>
      ) : (
        <Row xs={1} md={2} lg={2} className="g-4">
          {completedPickups.map((pickup) => (
            <Col key={pickup.id}>
              <Card
                className="shadow-sm h-100"
                style={{
                  borderRadius: "20px",
                  transition: "transform 0.3s, box-shadow 0.3s",
                  border: pickup.order_id === highlightOrderId && pickup.pickup_date === highlightPickupDate ? "3px solid #28a745" : "none",
                  boxShadow:
                    pickup.id === pickup.order_id === highlightOrderId && pickup.pickup_date === highlightPickupDate
                      ? "0 0 15px #28a745"
                      : "0 4px 10px rgba(0,0,0,0.1)",
                  animation:
                    pickup.order_id === highlightOrderId && pickup.pickup_date === highlightPickupDate
                      ? "glow 1.5s ease-in-out infinite alternate"
                      : "none",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "scale(1.03)";
                  e.currentTarget.style.boxShadow = "0 8px 20px rgba(0,0,0,0.2)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "scale(1)";
                  e.currentTarget.style.boxShadow = "0 4px 10px rgba(0,0,0,0.1)";
                }}
              >
                <Card.Body>
                  <Card.Title
                    style={{ fontWeight: "bold", color: "#1a4d2e", }}
                  >
                    Order ID: {pickup.order_id}
                  </Card.Title>
                  <Card.Text style={{ fontSize: "0.95rem" }}>
                    <strong>Pickup Date:</strong> {pickup.pickup_date} <br />
                    <strong>Waste Type:</strong> {pickup.waste_type} <br />
                    <strong>Category:</strong> {pickup.category}
                  </Card.Text>
                  {pickup.feedbacks && pickup.feedbacks.length > 0 && pickup.feedbacks.find(f => f.pickup_date === pickup.pickup_date) ? (
                    pickup.feedbacks
                      .filter(f => f.pickup_date === pickup.pickup_date)
                      .map((f, index) => (
                        <Card.Text key={index} style={{ marginTop: "10px" }}>
                          <strong>Your Feedback:</strong> {f.comment} <br />
                          <strong>Rating:</strong> {f.rating} ⭐
                        </Card.Text>
                      ))
                  ) : (
                    <FeedbackForm
                      wasteRequestId={pickup.id}        // the WasteRequest id
                      pickupDate={pickup.pickup_date}   // the pickup date
                      existingFeedback={null}
                      onFeedbackSubmitted={(feedback) =>
                        handleFeedbackUpdate(pickup.id, pickup.pickup_date, feedback)
                      }
                    />
                  )}

                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </Container>

  );
};

export default Feedback;

