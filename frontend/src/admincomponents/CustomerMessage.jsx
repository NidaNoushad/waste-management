import { useEffect, useState } from "react";

import { Container, Table, Spinner, Alert, Button, Form, Pagination } from "react-bootstrap";

const CustomerMessage = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  const fetchMessages = async (searchValue = "", pageNumber = 1) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("access");
      const res = await fetch(
        `http://127.0.0.1:8000/api/adminpanel/messages/?search=${searchValue}&page=${pageNumber}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!res.ok) throw new Error("Failed to fetch messages");
      const data = await res.json();
      setMessages(data.results || []); 
      setTotalPages(Math.ceil(data.count / 10) || 1); 
      setPage(pageNumber);
    } catch (err) {
      console.error(err);
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);


  const handleSearch = (e) => {
    e.preventDefault();
    fetchMessages(search, 1); // reset to page 1 when searching
  };
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this message?")) return;

    try {
      const token = localStorage.getItem("access");
      const res = await fetch(`http://127.0.0.1:8000/api/adminpanel/messages/${id}/`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to delete message");

      // Remove from frontend immediately
      setMessages((prev) => prev.filter((msg) => msg.id !== id));
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };
  const renderPagination = () => {
    const items = [];
    for (let i = 1; i <= totalPages; i++) {
      items.push(
        <Pagination.Item key={i} active={i === page} onClick={() => fetchMessages(search, i)}>
          {i}
        </Pagination.Item>
      );
    }
    return <Pagination>{items}</Pagination>;
  };

  if (loading) return (
    <Container className="text-center mt-5">
      <Spinner animation="border" variant="success" />
    </Container>
  );

  return (
    <Container className="mt-4">
      <h2>Customer Messages</h2>

      {/* Search */}
      <Form className="mb-3 d-flex" onSubmit={handleSearch}>
        <Form.Control
          type="text"
          placeholder="Search by name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Button type="submit" className="ms-2">Search</Button>
      </Form>

      {messages.length === 0 ? (
        <Alert variant="info">No messages found.</Alert>
      ) : (
        <>
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Subject</th>
                <th>Message</th>
                <th>Member?</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {messages.map((msg, index) => (
                <tr key={msg.id}>
                  <td>{index + 1 + (page - 1) * 10}</td>
                  <td>{msg.name}</td>
                  <td>{msg.email}</td>
                  <td>{msg.phone}</td>
                  <td>{msg.subject}</td>
                  <td>{msg.message}</td>
                  <td>{msg.is_member ? "Yes" : "No"}</td>
                  <td>{new Date(msg.created_at).toLocaleString()}</td>
                  <td>
                    <Button variant="danger" size="sm" onClick={() => handleDelete(msg.id)}>
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
          {renderPagination()}
        </>
      )}
    </Container>
  );
};

export default CustomerMessage;



