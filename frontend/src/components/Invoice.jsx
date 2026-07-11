


import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Container, Row, Col, Table, Button, Spinner, Alert } from 'react-bootstrap';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const uploadInvoice = async (pdfBlob, requestId, updateId = null) => {
  const token = localStorage.getItem("accessToken");
  const formData = new FormData();
  formData.append("invoice_file", pdfBlob, `invoice_${requestId}.pdf`);
  formData.append("related_request", requestId);
  if (updateId) formData.append("related_update", updateId);

  try {
    await axios.post("/api/invoices/", formData, {
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    });
    alert("Invoice uploaded successfully!");
  } catch (err) {
    console.error(err);
    alert("Failed to upload invoice.");
  }
};

const Invoice = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);
  const [uploaded, setUploaded] = useState(false);
  const invoiceRef = useRef();


  useEffect(() => {
    fetchInvoice();
  }, [id]);

  const fetchInvoice = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("accessToken");
      const res = await axios.get(`/api/waste-requests/${id}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setData(res.data);
    } catch (e) {
      setErr(e.response?.data || e.message || 'Failed to load invoice');
    } finally {
      setLoading(false);
    }
  };

  const generatePDF = async () => {
    if (!invoiceRef.current) return;
    const canvas = await html2canvas(invoiceRef.current, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const imgProps = pdf.getImageProperties(imgData);
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`invoice_${data?.id || id}.pdf`);
    const pdfBlob = pdf.output('blob');
    await uploadInvoice(pdfBlob, data.id);
  };

  const handlePrint = () => window.print();

  if (loading) return (<div className="text-center my-5"><Spinner animation="border" /></div>);
  if (err) return (<Container className="my-5"><Alert variant="danger">{JSON.stringify(err)}</Alert></Container>);
  if (!data) return (<Container className="my-5"><p>No invoice data found.</p></Container>);

  // Ensure numeric values
  const base = Number(data.base_price || 0);

  const addCharges = Number(data.additional_charges || data.extra_charge || 0);
  const gst = Number(data.gstAmount || data.gst_amount || 0);
  const finalAmount = Number(data.final_amount || base + addCharges + gst);


  const breakdownData = data.per_date_breakdown || {};
  const breakdown = breakdownData.breakdown || [];

  const subtotal = breakdown.reduce((acc, row) => {
    const original = Number(row.original_amount || 0);
    const refundExtra = Number(row.refund_extra || 0);
    return acc + (original + refundExtra);
  }, 0);

  return (
    <Container className="my-4">
      <Row>
        <Col className="d-flex justify-content-between align-items-center mb-3 flex-wrap">
          <h4>Invoice</h4>
          <div className="mt-2 mt-md-0">
            <Button variant="success" className="me-2 mb-2 mb-md-0" onClick={generatePDF}>Download PDF</Button>
            <Button variant="secondary" onClick={handlePrint}>Print</Button>
          </div>
        </Col>
      </Row>

      <div ref={invoiceRef} className="p-4 border rounded bg-white shadow-sm">
        {/* Header */}
        <Row className="mb-4">
          <Col md={6}>
            <h5 className="fw-bold">TrashGo</h5>
            <div>123 Green Street</div>
            <div>Phone: +91 12345 67890</div>
            <div>Email: support@trashgo.example</div>
          </Col>
          <Col md={6} className="text-md-end">
            <h6 className="fw-bold">Invoice #{data.order_id || data.id}</h6>
            <div><strong>Date:</strong> {new Date(data.date || data.created_at || Date.now()).toLocaleString()}</div>
            <div><strong>Status:</strong> {data.status || '-'}</div>
          </Col>
        </Row>

        {/* Customer & Pickup */}
        <Row className="mb-4">
          <Col md={6}>
            <h6 className="fw-bold">Bill To:</h6>
            <div>{data.name || '-'}</div>
            <div>{data.phone || '-'}</div>
            <div>{data.address || '-'}</div>
          </Col>
          <Col md={6} className="text-md-end">
            <h6 className="fw-bold">Pickup details:</h6>
            <div><strong>Pickup Address:</strong> {data.address || '-'}</div>
            {data.transaction_id && (
              <div><strong>Transaction ID:</strong> {data.transaction_id}</div>
            )}
          </Col>
        </Row>

        {/* Per-date breakdown table */}
        <Table bordered responsive hover>
          <thead className="table-light">
            <tr>
              <th>#</th>
              <th>Pickup Date</th>
              <th>Original Amount (₹)</th>
              <th>Updated Amount (₹)</th>
              <th>Refund / Extra (₹)</th>
            </tr>
          </thead>
          <tbody>
            {breakdown.map((b, idx) => (
              <tr key={idx}>
                <td>{idx + 1}</td>
                <td>{b.pickup_date}</td>
                <td>{Number(b.original_amount || 0).toFixed(2)}</td>
                {/* <td>{Number(b.updated_amount || 0).toFixed(2)}</td> */}
                <td>
                  {b.updated_amount !== null && b.updated_amount !== undefined
                    ? Number(b.updated_amount).toFixed(2)
                    : "0.00"}
                </td>
                <td>
                  {(() => {
                    const val = Number(b.refund_extra || 0);
                    if (val < 0) {
                      return `Refund: ${Math.abs(val).toFixed(2)}`;
                    } else if (val > 0) {
                      return `Extra: ${val.toFixed(2)}`;
                    } else {
                      return "0.00";
                    }
                  })()}
                </td>

              </tr>
            ))}
          </tbody>
        </Table>

        {/* Summary */}
        <Row className="mt-3">
          <Col md={6}>
            {data.notes && (
              <div>
                <strong>Notes:</strong>
                <div>{data.notes}</div>
              </div>
            )}
          </Col>
          <Col md={6}>
            <Table borderless>
              <tbody>
                <tr>
                  <td className="text-end"><strong>Base Price</strong></td>
                  <td className="text-end">{base.toFixed(2)}</td>
                </tr>
                <tr>
                  <td className="text-end"><strong>Additional Charges</strong></td>
                  <td className="text-end">{addCharges.toFixed(2)}</td>
                </tr>
                <tr>
                  <td className="text-end"><strong>GST (18%)</strong></td>
                  <td className="text-end">{gst.toFixed(2)}</td>
                </tr>
                <tr>
                  <td className="text-end"><strong>Total</strong></td>
                  <td className="text-end"><strong>{subtotal.toFixed(2)}</strong></td>
                </tr>
              </tbody>
            </Table>
          </Col>
        </Row>

        <Row className="mt-4">
          <Col>
            <small className="text-muted">Payment method: {data.payment_method || 'Cash on Pickup'}
              {data.transaction_id && (
                <><br />Transaction ID: {data.transaction_id}</>
              )}

            </small>
          </Col>
        </Row>

        {/* Thank You */}
        <Row className="mt-5">
          <Col>
            <div className="text-center text-success fst-italic fw-semibold" style={{ fontSize: '1.1rem' }}>
              Thank you for your order! We appreciate your support in making the environment cleaner.
            </div>
          </Col>
        </Row>
      </div>

      <Row className="mt-3">
        <Col>
          <Button variant="outline-primary" onClick={() => navigate(-1)}>← Back</Button>
        </Col>
      </Row>
    </Container>
  );
};

export default Invoice;

