import React, { useEffect, useState } from "react";
import { Container, Spinner, Table } from "react-bootstrap";
import { useParams } from "react-router-dom";

const WasteRequestDetail = () => {
  const { requestId } = useParams();
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRequest = async () => {
      try {
        const token = localStorage.getItem("access");
        const res = await fetch(
          `http://127.0.0.1:8000/api/adminpanel/wasterequests/${requestId}/`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const data = await res.json();
        setRequest(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchRequest();
  }, [requestId]);

  if (loading)
    return (
      <Container className="text-center mt-5">
        <Spinner animation="border" variant="success" />
      </Container>
    );

  if (!request) return <p>No request found.</p>;

  // Example for Per-Date Breakdown table
  const perDateBreakdown = request.per_date_breakdown || []; // backend should return this array

  return (
    <Container className="mt-4">
      <h3>Waste Request Details - {request.order_id}</h3>
      <p><b>Name:</b> {request.name}</p>
      <p><b>Email:</b> {request.email}</p>
      <p><b>Phone:</b> {request.phone}</p>
      <p><b>Address:</b> {request.address}</p>
      <p><b>Category:</b> {request.category}</p>
      <p><b>Waste Type:</b> {request.waste_type}</p>
      <p><b>Weight:</b> {request.weight} kg</p>
      <p><b>Status:</b> {request.status}</p>
      <p><b>Payment Status:</b> {request.payment_status}</p>

      <h5 className="mt-4">Per-Date Breakdown</h5>
      <Table striped bordered>
        <thead>
          <tr>
            <th>#</th>
            <th>Pickup Date</th>
            <th>Original Amount</th>
            <th>Updated Amount</th>
            <th>Difference / Refund</th>
          </tr>
        </thead>
        <tbody>
          {perDateBreakdown.map((d, idx) => (
            <tr key={idx}>
              <td>{idx + 1}</td>
              <td>{d.pickup_date}</td>
              <td>₹{d.original_amount}</td>
              <td>₹{d.updated_amount}</td>
              <td>{d.difference_text}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Container>
  );
};

export default WasteRequestDetail;
