
import React, { useEffect, useState, useMemo } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Spinner,
  Table,
  Form,
  Button,
  Badge,
  InputGroup,
} from "react-bootstrap";
import {
  PeopleFill,
  People,
  Clock,
  CheckCircle,
  XCircle,
  Cash,
  ExclamationTriangleFill,
  Download,
  Printer,
} from "react-bootstrap-icons";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";


const API = {
  summary: "/api/adminpanel/dashboard/summary/",
  todayPickups: "/api/adminpanel/pickups/today/",
  trends: "/api/adminpanel/dashboard/trends/",
  wasteType: "/api/adminpanel/dashboard/waste_type/",

};

const COLORS = ["#4e79a7", "#f28e2b", "#e15759", "#76b7b2", "#59a14f", "#b07aa1"];

const KPI = ({ icon: Icon, label, value, className }) => (
  <Card className={`h-100 ${className || ""}`}>
    <Card.Body>
      <Row className="align-items-center">
        <Col xs="auto">
          <div style={{ width: 48, height: 48, display: "grid", placeItems: "center" }}>
            <Icon size={28} />
          </div>
        </Col>
        <Col>
          <div style={{ fontSize: 18, fontWeight: 600 }}>{label}</div>
          <div style={{ fontSize: 22, fontWeight: 700 }}>{value ?? "—"}</div>
        </Col>
      </Row>
    </Card.Body>
  </Card>
);

//  CSV export
function downloadCSV(filename, rows) {
  if (!rows || !rows.length) return;
  const keys = Object.keys(rows[0]);
  const csv = [keys.join(","), ...rows.map((r) => keys.map((k) => `"${String(r[k] ?? "").replace(/"/g, '""')}"`).join(","))].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
}



export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const [pickups, setPickups] = useState([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [trends, setTrends] = useState([]);
  const [wasteType, setWasteType] = useState([]);
  const [range, setRange] = useState("week"); // or "month"
  const [tableLoading, setTableLoading] = useState(false);

  // Update pickup status
  async function updatePickupStatus(pickupId, newStatus) {
    try {
      const token = localStorage.getItem("access");
      const res = await fetch(`/staff/pickups/${pickupId}/update-status/`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error("Failed to update status");

    } catch (err) {
      console.error(err);
      alert("Error updating status");
    }
  }

  // Confirm payment for COD
  async function confirmPickupPayment(pickupId) {
    try {
      const token = localStorage.getItem("access");
      const res = await fetch(`/staff/pickups/${pickupId}/confirm-payment/`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to confirm payment");
      // refresh table
    } catch (err) {
      console.error(err);
      alert("Error confirming payment");
    }
  }
  // Fetch initial data
  useEffect(() => {
    let mounted = true;
    async function loadAll() {
      setLoading(true);
      try {
        const token = localStorage.getItem("access");
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        // parallel fetches
        const [
          sRes,
          alertsRes,
        ] = await Promise.all([
          fetch(API.summary, { headers }),

        ]);
        if (!sRes.ok) throw new Error("Failed to load dashboard summary");
        const sData = await sRes.json();


        if (!mounted) return;
        setSummary(sData);

        setWasteType(sData.waste_type_data || []);
        // setAlerts(alertsData);
      } catch (err) {
        console.error(err);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    loadAll();
    return () => (mounted = false);
  }, []);


  useEffect(() => {
    fetchPickups();
  }, []);

  // Fetch trends when range changes
  useEffect(() => {
    fetchTrends(range);
  }, [range]);

  async function fetchPickups() {
    setTableLoading(true);
    try {
      const token = localStorage.getItem("access");
      const res = await fetch(API.todayPickups, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        console.error("failed to fetch pickups", res.status);
        setPickups([]);
        return;
      }
      const data = await res.json();
      const arr = Array.isArray(data) ? data : data.results ?? [];
      setPickups(arr);
    } catch (err) {
      console.error(err);
      setPickups([]);
    } finally {
      setTableLoading(false);
    }
  }


  async function fetchTrends(rangeParam = "week") {
    try {
      const token = localStorage.getItem("access");
      const res = await fetch(`${API.trends}?range=${rangeParam}`, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) {
        console.error("failed to fetch trends", res.status);
        setTrends([]);
        return;
      }
      const data = await res.json();
      setTrends(data);
    } catch (err) {
      console.error(err);
      setTrends([]);
    }
  }

  const topKPIs = useMemo(() => {
    return [
      { icon: PeopleFill, label: "Total Users", value: summary ? summary.total_users : "—" },
      { icon: People, label: "Total Staff", value: summary ? summary.total_staff : "—" },
      { icon: Clock, label: "Pending Requests", value: summary ? summary.pending_requests : "—" },
      { icon: CheckCircle, label: "Completed Pickups", value: summary ? summary.completed_requests : "—" },
      { icon: XCircle, label: "Cancelled Requests", value: summary ? summary.cancelled_requests : "—" },
    ];
  }, [summary]);

  if (loading) {
    return (
      <Container className="text-center mt-5">
        <Spinner animation="border" />
      </Container>
    );
  }

  return (
    <Container fluid className="mt-4">
      {/* KPIs */}
      <Row className="g-3 mb-3">
        {topKPIs.map((k, i) => (
          <Col key={i} xs={12} sm={6} md={4} lg={2}>
            <KPI {...k} />
          </Col>
        ))}

        <Col xs={12} sm={6} md={4} lg={2}>
          <Card className="h-100">
            <Card.Body>
              <div style={{ fontSize: 16, fontWeight: 600 }}>Total Revenue</div>
              <div style={{ fontSize: 20, fontWeight: 700 }}>
                {summary && typeof summary.revenue !== "undefined"
                  ? `₹${Number(summary.revenue).toFixed(2)}`
                  : "—"}
              </div>
              <div className="mt-2">
                <Button size="sm" variant="outline-primary" onClick={() => downloadCSV("revenue-report.csv", summary?.revenue_rows || [])}>
                  <Download /> Export
                </Button>{" "}
                <Button size="sm" variant="outline-secondary" onClick={() => window.print()}>
                  <Printer /> Print
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Overview: left = table, right = charts + alerts */}
      <Row className="g-3">
        <Col lg={7}>
          <Card>
            <Card.Header className="d-flex justify-content-between align-items-center">
              <div>
                <strong>Today's Pickups</strong>{" "}
                <small className="text-muted">(status: Pending / Assigned / Complete)</small>
              </div>
              <div className="d-flex align-items-center">
                <Form.Select
                  size="sm"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  style={{ minWidth: 180 }}
                >
                  <option value="">All Status</option>
                  <option value="Pending">Pending</option>
                  <option value="Assigned">Assigned</option>
                  <option value="Complete">Complete</option>
                  <option value="Cancelled">Cancelled</option>
                </Form.Select>


                <Button variant="link" size="sm" onClick={() => fetchPickups()} className="ms-2">Refresh</Button>
              </div>
            </Card.Header>

            <Card.Body style={{ minHeight: 220 }}>
              {tableLoading ? (
                <div className="text-center"><Spinner /></div>
              ) : pickups.length === 0 ? (
                <div className="text-center text-muted">No pickups for today</div>
              ) : (
                <Table striped hover responsive size="sm">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Order</th>
                      <th>Customer</th>
                      <th>Date</th>
                      <th>Amount</th>
                      <th>Status</th>
                      <th>Assigned Staff</th>
                    </tr>
                  </thead>

                  <tbody>
                    {pickups
                      .filter(p => !statusFilter || p.status === statusFilter)
                      .map((p, idx) => (
                        <tr key={p.id}>
                          <td>{idx + 1}</td>
                          <td>{p.order_id}</td>
                          <td>{p.customer}</td>
                          <td>{p.pickup_date}</td>
                          <td>{p.per_date_amount ? `₹${Number(p.per_date_amount).toFixed(2)}` : "—"}</td>
                          <td>
                            <Badge bg={p.status === "Complete" ? "success" : p.status === "Cancelled" ? "danger" : "warning"}>
                              {p.status}
                            </Badge>
                          </td>
                          <td>
                            {p.assigned_staff || "Not Assigned"}
                            {/* <div className="mt-1 d-flex flex-wrap gap-1">
                              {p.status !== "Complete" && p.status !== "Cancelled" && (
                                <>
                                  <Button size="sm" variant="success" onClick={() => updatePickupStatus(p.id, "Complete")}>Complete</Button>
                                  <Button size="sm" variant="danger" onClick={() => updatePickupStatus(p.id, "Cancelled")}>Cancel</Button>
                                </>
                              )}
                              {p.payment_method === "Cash on Pickup" && !p.is_paid && (
                                <Button size="sm" variant="primary" onClick={() => confirmPickupPayment(p.id)}>Mark Paid</Button>
                              )}
                            </div> */}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </Table>
              )}
            </Card.Body>
            <Card.Footer className="d-flex justify-content-between">
              <div className="text-muted">Showing {pickups.length} pickups</div>
              <div>
                <Button size="sm" onClick={() => downloadCSV("today-pickups.csv", pickups)}>Export CSV</Button>
              </div>
            </Card.Footer>
          </Card>
        </Col>

        <Col lg={5}>
          <Card className="mb-3">
            <Card.Header>
              <strong>Requests Trend</strong>
              <div className="float-end">
                <Form.Select value={range} onChange={(e) => setRange(e.target.value)} size="sm">
                  <option value="week">Last 7 days</option>
                  <option value="month">Last 30 days</option>
                </Form.Select>
              </div>
            </Card.Header>
            <Card.Body style={{ height: 280 }}>
              {trends.length === 0 ? (
                <div className="text-center text-muted">No trend data</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="period" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="requests" stroke="#4e79a7" />
                    <Line type="monotone" dataKey="completed" stroke="#59a14f" />
                    <Line type="monotone" dataKey="cancelled" stroke="#e15759" />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </Card.Body>
          </Card>

          <Card className="mb-3">
            <Card.Header><strong>Waste Type Split</strong></Card.Header>
            <Card.Body style={{ height: 240 }}>
              {wasteType.length === 0 ? (
                <div className="text-center text-muted">No data</div>
              ) : (
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      dataKey="count"
                      isAnimationActive={false}
                      data={wasteType}
                      cx="50%"
                      cy="50%"
                      outerRadius={70}
                      label={(entry) => entry.name}
                    >
                      {wasteType.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </Card.Body>
          </Card>


        </Col>
      </Row>

    
      <Row className="g-3 mt-3">



        <Col md={6}>
          <Card>
            <Card.Header><strong>Admin Quick Actions</strong></Card.Header>
            <Card.Body>
              <div className="d-flex gap-2">
                <Button variant="primary" onClick={() => window.location.href = "/admin/manageuser"}>Manage Users</Button>
                <Button variant="secondary" onClick={() => window.location.href = "/admin/stafflist"}>Manage Staff</Button>
              </div>
         
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}


