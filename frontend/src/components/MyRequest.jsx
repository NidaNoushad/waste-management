import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { useTheme } from './ThemeContext';
import UpdateRequest from "./UpdateRequest";
import './MyRequest.css';
import axiosInstance from "../utils/axiosInstance";
import axios from 'axios';
import {
  Container, Row, Col, Table, Button, Spinner, Badge,
  Pagination, Form
} from "react-bootstrap";

export default function MyRequests() {
  const { isDarkMode } = useTheme();
  const [requests, setRequests] = useState([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const navigate = useNavigate();

  const [statusFilter, setStatusFilter] = useState("all");
  const [sortField, setSortField] = useState("pickup_date");
  const [sortOrder, setSortOrder] = useState("asc");


  useEffect(() => {
    fetchRequests();
  }, [page, pageSize, statusFilter, sortField, sortOrder]);

  async function fetchRequests() {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("accessToken");
      const params = { page, page_size: pageSize };
      if (statusFilter !== "all") params.status = statusFilter;
      params.ordering = (sortOrder === "desc" ? "-" : "") + sortField;

      const res = await axiosInstance.get("waste-request-pickups/", {
        params,
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      setRequests(res.data.results || []);
      setTotalCount(res.data.count || 0);
    } catch (err) {
      setError("Failed to load requests. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function totalPages() {
    return Math.max(1, Math.ceil(totalCount / pageSize));
  }

  function gotoPage(p) {
    if (p < 1 || p > totalPages()) return;
    setPage(p);
  }

  function toggleSort(field) {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  }

  function statusVariant(status) {
    const map = {
      Assigned: "warning",
      Pending: "primary",
      "On the Way": "secondary",
      Complete: "success",
      Cancelled: "danger",
    };
    return map[status] || "light";
  }

  // Updated handleCancel function with correct URL and payload
  const handleCancel = async (request) => {
    if (!window.confirm(`Cancel pickup on ${request.pickup_date}?`)) return;

    try {
      const token = localStorage.getItem("accessToken");


      const pickupDateAmount = request.per_date_amount || (request.final_amount / (request.pickup_dates?.length || 1));

      const payload = {
        pickup_date: request.pickup_date,
        payment_method: request.payment_method,
        transaction_id: request.transaction_id,
        per_pickup_amount: pickupDateAmount
      };

      console.log("Cancelling request with payload:", payload);


      const response = await axiosInstance.put(
        `user-cancel-request/${request.waste_request_id || request.id}/`,

        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log("Cancel response:", response.data);

      // Update local state
      setRequests(prev =>
        prev.map(r =>
          r.id === request.id && r.pickup_date === request.pickup_date
            ? {
              ...r,
              status: "Cancelled",
              refund_id: response.data.refund_id,
              refund_status: response.data.refund_status,
              refund_amount: response.data.refund_amount
            }
            : r
        )
      );


      // Show different messages based on payment method
      if (request.payment_method !== "Cash on Pickup" && response.data.refund_id) {
        const refundMsg = `Pickup cancelled successfully!\n\nRefund Details:\nRefund ID: ${response.data.refund_id}\nRefund Amount: ₹${response.data.refund_amount}\nStatus: ${response.data.refund_status}\n\nRefund will be processed in 3-5 business days.`;
        alert(refundMsg);
      } else if (request.payment_method !== "Cash on Pickup") {
        alert(`Pickup cancelled. ${response.data.message || "Refund will be processed separately."}`);
      } else {
        alert(`Pickup on ${request.pickup_date} cancelled successfully.`);
      }

      // Refresh data to ensure consistency
      await fetchRequests();

    } catch (error) {
      console.error("Cancel failed:", error);
      const errorMsg = error.response?.data?.detail || error.response?.data?.error || "Cancel failed. Please try again.";
      alert(errorMsg);
    }
  };



  async function handleUpdate(updatedFields) {
    if (!selectedRequest) return alert("No request selected!");

    console.log("Starting update with fields:", updatedFields);
    console.log("Selected request:", selectedRequest);

    try {
      const token = localStorage.getItem("accessToken");
      const payload = {
        ...updatedFields,
        waste_request: selectedRequest.id,
        pickup_date: selectedRequest.pickup_date
      };

      console.log("Sending payload:", payload);

      const response = await axiosInstance.put(
        `user-update-request/${selectedRequest.id}/`,

        payload,
        { headers: token ? { Authorization: `Bearer ${token}` } : {} }
      );

      console.log("Update response:", response.data); // Debug log

      // Refresh all data from server
      console.log("Refreshing data..."); // Debug log
      await fetchRequests();

      setShowUpdateModal(false);
      setSelectedRequest(null);

      alert("Request updated successfully!");

    } catch (error) {
      console.error("Update failed:", error);
      console.error("Error details:", error.response?.data);
      alert("Failed to update request. Please try again.");
    }
  }


  {
    selectedRequest && (
      <UpdateRequest
        show={showUpdateModal}
        onClose={() => {
          setShowUpdateModal(false);
          setSelectedRequest(null);
        }}
        initialData={selectedRequest}
        onUpdate={handleUpdate}
      />
    )
  }





  // Enhanced renderTableRow function to show refund info
  const renderTableRow = (r) => {

    const canEdit = r.status === "Pending";
    const canCancel = ["Pending", "Assigned"].includes(r.status);
    const pickupDate = r.pickup_date ? new Date(r.pickup_date).toLocaleDateString("en-GB") : "-";
    const hasRefund = r.refund_id || r.refund_status;

    // Calculate per-pickup amount for display
    const perPickupAmount = r.per_date_amount || (r.final_amount / (r.total_pickup_dates || 1));

    return (
      <tr key={`${r.id}-${r.order_id}`} className={`table-row ${r.status === "Cancelled" ? "cancelled-row" : ""}`}>
        <td className="order-id">{r.order_id}</td>
        <td>{pickupDate}</td>
        <td>{r.waste_type}</td>
        <td>{r.category}</td>
        <td>
          {r.payment_method}

        </td>
        <td className="address-cell">{r.address}</td>
        <td>
          <Badge bg={statusVariant(r.status)}>{r.status}</Badge>

        </td>
        <td>
          <div className="action-buttons">
            <Button
              size="sm"
              variant="outline-primary"
              disabled={!canEdit}
              title={!canEdit ? "Update allowed only for Pending requests" : ""}
              onClick={() => { setSelectedRequest(r); setShowUpdateModal(true); }}
            >
              Update
            </Button>
            <Button
              size="sm"
              variant="outline-danger"
              disabled={!canCancel}
              onClick={() => handleCancel(r)}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              variant="success"
              onClick={() => navigate(`/invoice/${r.waste_request_id || r.id}`)}
            >
              Invoice
            </Button>
          </div>
        </td>
      </tr>
    );
  };
  return (
    <div className={`my-requests-page ${isDarkMode ? 'dark-mode' : 'light-mode'}`}>
      <Container className="py-3">
        {selectedRequest && (
          <UpdateRequest
            show={showUpdateModal}
            onClose={() => { setShowUpdateModal(false); setSelectedRequest(null); }}
            initialData={selectedRequest}
            onUpdate={handleUpdate}
          />
        )}

        {/* Header */}
        <Row className="mb-2 align-items-center">
          <Col xs={12} md={6}>
            <h4 className="page-title">My Waste Requests</h4>
            <div className="page-subtitle">View and manage your scheduled pickups</div>
          </Col>
          <Col xs={12} md={6} className="mt-2 mt-md-0">
            <Form.Select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="theme-select">
              <option value="all">All Status</option>
              <option value="Assigned">Assigned</option>
              <option value="Pending">Pending</option>
              <option value="On the Way">On the Way</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </Form.Select>
          </Col>
        </Row>

        {/* Table */}
        <Row>
          <Col>
            <div className="table-container">
              <div className="table-responsive">
                <Table className="themed-table">
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th onClick={() => toggleSort("pickup_date")} className="sortable-header">
                        Pickup Date {sortField === "pickup_date" ? (sortOrder === "asc" ? "▲" : "▼") : ""}
                      </th>
                      <th>Waste Type</th>
                      <th>Waste Category</th>
                      <th>Payment</th>
                      <th>Address</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr><td colSpan={8} className="text-center py-5"><Spinner animation="border" className="loading-spinner" /></td></tr>
                    ) : error ? (
                      <tr><td colSpan={8} className="text-center text-danger">{error}</td></tr>
                    ) : requests.length === 0 ? (
                      <tr><td colSpan={8} className="text-center empty-state"><i className="fas fa-inbox empty-icon"></i> You have no requests yet.</td></tr>
                    ) : (

                      requests.map(r => renderTableRow(r))
                    )}
                  </tbody>
                </Table>
              </div>
              <div className="table-footer">
                <div className="total-count">Total: {totalCount} rows</div>
                <Pagination>
                  <Pagination.First onClick={() => gotoPage(1)} disabled={page === 1} />
                  <Pagination.Prev onClick={() => gotoPage(page - 1)} disabled={page === 1} />
                  <Pagination.Next onClick={() => gotoPage(page + 1)} disabled={page === totalPages()} />
                  <Pagination.Last onClick={() => gotoPage(totalPages())} disabled={page === totalPages()} />
                </Pagination>
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
}
