


import React, { useEffect, useState } from "react";
import { Table, Button, Container, Spinner, Collapse, Card } from "react-bootstrap";
import { useParams } from "react-router-dom";

const WasteRequestList = () => {
  const { userId } = useParams();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openId, setOpenId] = useState(null); // track which request is expanded

  useEffect(() => {
    const fetchRequests = async () => {
      console.log("Fetching requests for user:", userId);
      try {
        const token = localStorage.getItem("access");
        const res = await fetch(
          `http://127.0.0.1:8000/api/waste-requests/?user=${userId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const data = await res.json();
        setRequests(data);
      } catch (err) {
        console.error(err);
        alert("Failed to load waste requests");
      } finally {
        setLoading(false);
      }
    };
    fetchRequests();
  }, [userId]);

  if (loading)
    return (
      <Container className="text-center mt-5">
        <Spinner animation="border" variant="success" />
      </Container>
    );

  return (
    <Container className="mt-4">
      <h3>Waste Requests</h3>
      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>#</th>
            <th>Order ID</th>
            <th>Waste Type</th>
            <th>Category</th>

            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {requests.map((req, index) => (
            <React.Fragment key={req.id}>
              <tr>
                <td>{index + 1}</td>
                <td>{req.order_id}</td>
                <td>{req.waste_type || "N/A"}</td>
                <td>{req.category || "N/A"}</td>

                <td>
                  <Button
                    size="sm"
                    variant="info"
                    onClick={() => setOpenId(openId === req.id ? null : req.id)}
                  >
                    {openId === req.id ? "Hide Details" : "View Details"}
                  </Button>
                </td>
              </tr>

              {/* Expandable details row */}
              <tr>
                <td colSpan={6} style={{ padding: 0, border: 0 }}>
                  <Collapse in={openId === req.id}>
                    <div>
                      <Card body>
                        {/* --- General Info Table --- */}
                        <h5>Request Details:</h5>
                        <Table bordered size="sm">
                          <tbody>
                            <tr>
                              <th>Weight</th>
                              <td>{req.weight || "N/A"}</td>
                            </tr>

                            <tr>
                              <th>Frequency</th>
                              <td>{req.frequency || "N/A"}</td>
                            </tr>
                            <tr>
                              <th>Urgency</th>
                              <td>{req.urgency || "N/A"}</td>
                            </tr>
                            <tr>
                              <th>Duration</th>
                              <td>{req.duration || "N/A"}</td>
                            </tr>
                            <tr>
                              <th>Base Price</th>
                              <td>₹{Number(req.base_price || 0).toFixed(2)}</td>
                            </tr>
                            <tr>
                              <th>GST Amount</th>
                              <td>₹{Number(req.gstAmount || 0).toFixed(2)}</td>
                            </tr>
                            <tr>
                              <th>Additional Charges</th>
                              <td>₹{Number(req.additional_charges || 0).toFixed(2)}</td>
                            </tr>
                            <tr>
                              <th>Final Amount</th>
                              <td>₹{Number(req.final_amount || 0).toFixed(2)}</td>
                            </tr>
                            <tr>
                              <th>Payment Method</th>
                              <td>{req.payment_method || "N/A"}</td>
                            </tr>
                            <tr>
                              <th>Payment Status</th>
                              <td>{req.payment_status || "N/A"}</td>
                            </tr>
                            <tr>
                              <th>Order ID</th>
                              <td>{req.order_id}</td>
                            </tr>
                            <tr>
                              <th>Transaction ID</th>
                              <td>{req.transaction_id || "N/A"}</td>
                            </tr>
                            <tr>
                              <th>Status</th>
                              <td>{req.status || "Pending"}</td>
                            </tr>
                          </tbody>
                        </Table>
                        <h5>Per-Date Breakdown:</h5>
                        {req.per_date_breakdown?.breakdown?.length ? (
                          <Table striped bordered size="sm">
                            <thead>
                              <tr>
                                <th>Week</th>
                                <th>Pickup Date</th>
                                <th>Original Amount</th>
                                <th>Updated Amount</th>
                                <th>Difference / Refund</th>
                                <th>Feedbacks</th>
                              </tr>
                            </thead>
                            <tbody>
                              {req.per_date_breakdown.breakdown.map((d, idx) => {
                                const original = d.original_amount.toFixed(2);
                                const updated = d.updated_amount?.toFixed(2) || "0.00";
                                let diffText = "₹0.00";
                                const diff = d.updated_amount - d.original_amount;

                                if (diff > 0) diffText = `Extra: ₹${diff.toFixed(2)}`;
                                else if (diff < 0) diffText = `Refund: ₹${Math.abs(diff).toFixed(2)}`;

                                // filter feedbacks for this pickup date
                                const feedbacksForDate = req.feedbacks?.filter(
                                  (fb) => fb.pickup_date === d.pickup_date
                                ) || [];

                                return (
                                  <tr key={idx}>
                                    <td>{idx + 1}</td>
                                    <td>{d.pickup_date}</td>
                                    <td>₹{original}</td>
                                    <td>₹{updated}</td>
                                    <td>{diffText}</td>
                                    <td>
                                      {feedbacksForDate.length ? (
                                        <ul>
                                          {feedbacksForDate.map((fb, i) => (
                                            <li key={i}>
                                              {fb.comment} - Rating: {fb.rating}
                                            </li>
                                          ))}
                                        </ul>
                                      ) : (
                                        <span>No feedback</span>
                                      )}
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </Table>
                        ) : (
                          <p>No pickup dates</p>
                        )}

                      </Card>
                    </div>

                  </Collapse>
                </td>
              </tr>
            </React.Fragment>
          ))}
        </tbody>
      </Table>
    </Container>
  );
};

export default WasteRequestList;
