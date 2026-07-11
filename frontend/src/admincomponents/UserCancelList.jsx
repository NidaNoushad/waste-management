import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Container, Table, Spinner, Button, Form } from "react-bootstrap";

const UserCancelList = () => {
  const { userId } = useParams();
  const [cancelled, setCancelled] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const navigate = useNavigate();
  const itemsPerPage = 10;

  const paginatedCancelled = cancelled.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  const fetchCancelled = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("access");
      const res = await fetch(
        `http://127.0.0.1:8000/api/adminpanel/users/${userId}/user-cancel/`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await res.json();
      setCancelled(data);
    } catch (err) {
      console.error(err);
      alert("Failed to load cancelled pickups");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCancelled();
  }, [userId]);

  const handleRefundStatusChange = async (cancelId, newStatus) => {
    try {
      const token = localStorage.getItem("access");
      
      await fetch(`http://127.0.0.1:8000/api/adminpanel/user-cancel-request/${cancelId}/`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ refund_status: newStatus }),
      });
      fetchCancelled(); // refresh table
    } catch (err) {
      console.error(err);
      alert("Failed to update refund status");
    }
  };

  if (loading)
    return (
      <Container className="text-center mt-5">
        <Spinner animation="border" variant="success" />
      </Container>
    );

  return (
    <Container className="mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3 className="mb-0">User Cancelled Pickups</h3>
        <Button
          variant="secondary"
          onClick={() => navigate(-1)} // goes back to UserDetail.jsx
        >
          Back
        </Button>
      </div>

      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>#</th>
            <th>Order ID</th>
            <th>Pickup Date</th>
            <th>Waste Type</th>
            <th>Category</th>
            <th>Final Amount</th>
            <th>Cancelled By</th>
          
            <th>Refund Status</th>
            <th>Refund Amount</th>
            <th>Payment Method</th>
          </tr>
        </thead>
        <tbody>
          {paginatedCancelled.map((c, index) => (
            <tr key={c.id}>
              <td>{index + 1}</td>
              <td>{c.order_id || "N/A"}</td>
              <td>{c.pickup_date}</td>
              <td>{c.waste_type}</td>
              <td>{c.category}</td>
              <td>{c.final_amount}</td>
              <td>{c.cancelled_by}</td>
             
              <td>
                <Form.Select
                  value={c.refund_status || "Pending"}
                  onChange={(e) =>
                    handleRefundStatusChange(c.id, e.target.value)
                  }
                  disabled={c.payment_method === "Cash on Pickup"}
                >
                  <option value="Refund_initiated">Refund Initiated</option>
                  <option value="Refunded">Refunded</option>
                  <option value="Failed">Failed</option>
                </Form.Select>
              </td>
              <td>{c.refund_amount || "N/A"}</td>
              <td>{c.payment_method || "N/A"}</td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* Pagination */}
      <div className="d-flex justify-content-between mt-2">
        <Button
          disabled={page === 1}
          onClick={() => setPage((prev) => prev - 1)}
        >
          Prev
        </Button>
        <span>Page {page}</span>
        <Button
          disabled={page * itemsPerPage >= cancelled.length}
          onClick={() => setPage((prev) => prev + 1)}
        >
          Next
        </Button>
      </div>
    </Container>
  );
};

export default UserCancelList;
