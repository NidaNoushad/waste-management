
import React, { useEffect, useState } from "react";
import { Container, Row, Col, Card, Table, Button, Form , Pagination,} from "react-bootstrap";
import axios from "axios";
import axiosInstance from "../utils/axiosInstance";
import AOS from "aos";
import "aos/dist/aos.css";

const PaymentHistory = () => {
  const [payments, setPayments] = useState([]);
  const [filteredPayments, setFilteredPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [paymentMethodFilter, setPaymentMethodFilter] = useState("all");
  // Pagination state
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    AOS.init({ duration: 1000 });
  }, []);

  // useEffect(() => {
  //   fetchPayments();
  // }, [page, statusFilter, paymentMethodFilter]);


  useEffect(() => {
    const fetchPickups = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("accessToken");
        const res = await axiosInstance.get(
          // "http://127.0.0.1:8000/api/waste-request-pickups/",
          "waste-request-pickups/",
          {
            params: { page, page_size: pageSize },
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          }
        );
        setPayments(res.data.results || []);
        setFilteredPayments(res.data.results || []);
        setTotalCount(res.data.count || 0); // backend should return total count
      } catch (err) {
        console.error("Failed to fetch pickups:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPickups();
  }, [page, pageSize]);

//  filter logic
  useEffect(() => {
    let filtered = [...payments];
  
    if (statusFilter !== "all") {
      filtered = filtered.filter((p) => {
        if (statusFilter.toLowerCase() === "paid") {
          return p.payment_status?.toLowerCase() === "paid";
        }
        if (statusFilter.toLowerCase() === "pending") {
          return p.payment_status?.toLowerCase() === "pending";
        }
        if (statusFilter.toLowerCase() === "cancelled") {
          return p.status?.toLowerCase() === "cancelled";
        }
        if (statusFilter.toLowerCase() === "refunded") {
          return p.refund_status?.toLowerCase() === "refunded";
        }
        return true;
      });
    }
  
    if (paymentMethodFilter !== "all") {
      filtered = filtered.filter(
        (p) => p.payment_method?.toLowerCase() === paymentMethodFilter.toLowerCase()
      );
    }
  
    setFilteredPayments(filtered);
  }, [payments, statusFilter, paymentMethodFilter]);
  

  const handlePayNow = (payment) => {
    alert(`Redirecting to payment for Order ID: ${payment.order_id}`);
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <Container className="my-5">
      <Row className="mb-4" data-aos="fade-down">
        <Col>
          <h3 className="text-center fw-bold">Payment History</h3>
        </Col>
      </Row>

      {/* Filters */}
      <Row className="mb-3" data-aos="fade-up">
        <Col md={3} className="mb-2">
          <Form.Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="all">All Status</option>
            <option value="Pending">Pending</option>
            <option value="paid">Paid</option>
            {/* <option value="Refunded">Refunded</option>
            <option value="Refund_initiated">Refund Initiated</option>
            <option value="failed">Failed</option> */}

          </Form.Select>
        </Col>
        <Col md={5} className="mb-2">
          <Form.Select
            value={paymentMethodFilter}
            onChange={(e) => setPaymentMethodFilter(e.target.value)}
          >
            <option value="all">All Methods</option>
            <option value="UPI">UPI</option>
            <option value="Card">Card</option>
            <option value="Cash on Pickup">Cash on Pickup</option>
          </Form.Select>
        </Col>

        <Col md={4} className="mb-2">
          <Button
            variant="secondary"
            onClick={() => {
              setStatusFilter("all");
              setPaymentMethodFilter("all");

            }}
          >
            Clear Filters
          </Button>
        </Col>
      </Row>

      {loading ? (
        <p className="text-center">Loading payments...</p>
      ) : (
        <Row data-aos="fade-up">
          <Col>
            <Card className="shadow-lg rounded-4 p-3">
              <Table responsive bordered hover>
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Amount</th>
                    <th>Payment Method</th>      
                    <th>Date</th>
                    <th>Payment_status</th>
                    <th>Cancellation / Refund Info</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPayments.map((p) => (
                    <tr key={`${p.order_id}-${p.pickup_date}`}>
                      <td>{p.order_id}</td>
                      <td>₹ {Number(p.amount).toFixed(2)}</td>
                      <td>{p.payment_method}</td>
                      {/* <td>
                        {p.status === "Cancelled" && p.payment_method !== "Cash on Pickup" && (
                          <div>
                            <span className="text-danger">Cancelled</span>
                            {p.refund_status && (
                              <div className="mt-1 small">
                                <strong>Refund:</strong> ₹{p.refund_amount || 0} <br />
                                <span className={`badge ${p.refund_status === "Refunded" ? "bg-success" :
                                    p.refund_status === "Failed" ? "bg-danger" :
                                      "bg-warning"
                                  }`}>
                                  Status: {p.refund_status}
                                </span>
                                <br />
                                {p.refund_id && <span>ID: {p.refund_id}</span>}
                              </div>
                            )}
                          </div>
                        )}
                      </td> */}

                      <td>{formatDate(p.pickup_date)}</td>
                      <td>

                      {p.status === "Cancelled" && p.payment_method !== "Cash on Pickup" && p.refund_status ? (
                        <span
                          className={`badge ${p.refund_status === "Refunded"
                              ? "bg-success"
                              : p.refund_status === "Refund_initiated"
                                ? "bg-warning text-dark"
                                : p.refund_status === "Failed"
                                  ? "bg-danger"
                                  : "bg-secondary"
                            }`}
                        >
                          {p.refund_status === "Refund_initiated" ? "Refund Initiated" : p.refund_status}
                        </span>
                      ) : (
                        <span
                          className={`badge ${p.payment_status?.toLowerCase() === "paid"
                              ? "bg-success"
                              : p.payment_status?.toLowerCase() === "pending"
                                ? "bg-warning text-dark"
                                : "bg-secondary"
                            }`}
                        >
                          {p.payment_status}
                        </span>
                      )}

                    </td>
                    <td>
                        {p.status === "Cancelled" && p.payment_method !== "Cash on Pickup" && (
                          <div>
                            <span className="text-danger">Cancelled</span>
                            {p.refund_status && (
                              <div className="mt-1 small">
                                <strong>Refund:</strong> ₹{p.refund_amount || 0} <br />
                                <span className={`badge ${p.refund_status === "Refunded" ? "bg-success" :
                                    p.refund_status === "Failed" ? "bg-danger" :
                                      "bg-warning"
                                  }`}>
                                  Status: {p.refund_status}
                                </span>
                                <br />
                                {p.refund_id && <span>ID: {p.refund_id}</span>}
                              </div>
                            )}
                          </div>
                        )}
                      </td>
                      
                    </tr>
                  ))}
              </tbody>
            </Table>
          </Card>
        </Col>
        </Row>
  )
}
<div className="d-flex justify-content-between align-items-center mt-3">
  <div>Total: {totalCount} rows</div>
  <Pagination>
    <Pagination.First onClick={() => setPage(1)} disabled={page === 1} />
    <Pagination.Prev onClick={() => setPage(page - 1)} disabled={page === 1} />
    <Pagination.Item>{page}</Pagination.Item>
    <Pagination.Next
      onClick={() => setPage(page + 1)}
      disabled={page >= Math.ceil(totalCount / pageSize)}
    />
    <Pagination.Last
      onClick={() => setPage(Math.ceil(totalCount / pageSize))}
      disabled={page >= Math.ceil(totalCount / pageSize)}
    />
  </Pagination>
</div>

    </Container >
  );
};

export default PaymentHistory;

