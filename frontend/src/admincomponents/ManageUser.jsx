

import React, { useEffect, useState } from "react";
import { Table, Button, Container, Spinner } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

const ManageUser = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem("access"); // admin token
        if (!token) {
          alert("You are not authorized! Please login.");
          navigate("/admin/login");
          return;
        }

        const res = await fetch("http://127.0.0.1:8000/api/adminpanel/users/", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          throw new Error(`Error: ${res.status}`);
        }

        const data = await res.json();
        setUsers(data);
      } catch (err) {
        console.error(err);
        alert("Failed to load users. Check console for details.");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [navigate]);

  if (loading)
    return (
      <Container className="text-center mt-5">
        <Spinner animation="border" variant="success" />
      </Container>
    );

  return (
    <Container className="mt-4">
      <h2 className="mb-4">Manage Users</h2>
      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>ID</th>
            <th>Username</th>
            <th>Name</th>
            <th>Email</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user,index) => (
            <tr key={user.id}>
              <td>{index + 1}</td>
              <td>{user.username}</td>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td>
                <Button
                  variant="success"
                  size="sm"
                  onClick={() => navigate(`/adminpanel/user/${user.user_id}`)}
                >
                  View Details
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Container>
  );
};

export default ManageUser;

