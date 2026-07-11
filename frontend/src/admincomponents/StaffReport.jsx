


// import React, { useEffect, useState } from "react";
// import axios from "axios";

// const StaffReport = () => {
//   const [staffData, setStaffData] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");

//   useEffect(() => {
//     const fetchStaffData = async () => {
//       try {
//         const token = localStorage.getItem("access"); // JWT token
//         if (!token) {
//           setError("Admin not logged in. Please login first.");
//           setLoading(false);
//           return;
//         }

//         const res = await axios.get(`${process.env.REACT_APP_API_URL}adminpanel/staff-performance/`, {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         });

//         setStaffData(res.data);
//         setLoading(false);
//       } catch (err) {
//         console.error(err);
//         setError("Failed to fetch staff performance. Check token or permissions.");
//         setLoading(false);
//       }
//     };

//     fetchStaffData();
//   }, []);

//   if (loading) return <p>Loading staff performance...</p>;
//   if (error) return <p className="text-danger">{error}</p>;

//   return (
//     <div className="container mt-4">
//       <h2>Staff Performance Report</h2>
//       <table className="table table-bordered table-striped mt-3">
//         <thead >
//           <tr >
//             <th>Full Name</th>
//             <th>Email</th>
//             <th>Phone</th>
//             <th>Total Pickups</th>
//             <th>Completed</th>
//             <th>Assigned</th>
//             <th>On The Way</th>
//             <th>Cancelled</th>
//             <th>COD to Collect (₹)</th>
//             <th>Collected (₹)</th>
//           </tr>
//         </thead>
//         <tbody>
//           {staffData.map((staff, idx) => (
//             <tr key={idx}>
//               <td>{staff.full_name}</td>
//               <td>{staff.email}</td>
//               <td>{staff.phone}</td>
//               <td>{staff.total_pickups}</td>
//               <td>{staff.completed}</td>
//               <td>{staff.assigned}</td>
//               <td>{staff.on_the_way}</td>
//               <td>{staff.cancelled}</td>
//               <td>{staff.cod_to_collect}</td>
//               <td>{staff.collected}</td>
//             </tr>
//           ))}
//         </tbody>
//       </table>
//     </div>
//   );
// };

// export default StaffReport;


import React, { useEffect, useState } from "react";
import axios from "axios";

const StaffReport = () => {
  const [staffData, setStaffData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchStaffData = async () => {
      try {
        const token = localStorage.getItem("access");
        if (!token) {
          setError("Admin not logged in. Please login first.");
          setLoading(false);
          return;
        }

        const res = await axios.get(`${process.env.REACT_APP_API_URL}adminpanel/staff-performance/`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setStaffData(res.data);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch staff performance.");
        setLoading(false);
      }
    };

    fetchStaffData();
  }, []);

  const exportCSV = () => {
    if (!staffData.length) return;

    const headers = [
      "Full Name",
      "Email",
      "Phone",
      "Total Pickups",
      "Completed",
      "Assigned",
      "On The Way",
      "Cancelled",
      "COD to Collect (₹)",
      "Collected (₹)",
    ];

    const rows = staffData.map(staff => [
      staff.full_name,
      staff.email,
      staff.phone,
      staff.total_pickups,
      staff.completed,
      staff.assigned,
      staff.on_the_way,
      staff.cancelled,
      staff.cod_to_collect,
      staff.collected,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers, ...rows].map(e => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "staff_performance_report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) return <p>Loading staff performance...</p>;
  if (error) return <p className="text-danger">{error}</p>;

  return (
    <div className="container mt-4">
      <h2>Staff Performance Report</h2>
      <button className="btn btn-success mb-3" onClick={exportCSV}>
        Export CSV
      </button>
      <table className="table table-bordered table-striped mt-3">
        <thead >
          <tr>
            <th>Full Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Total Pickups</th>
            <th>Completed</th>
            <th>Assigned</th>
            <th>On The Way</th>
            <th>Cancelled</th>
            <th>COD to Collect (₹)</th>
            <th>Collected (₹)</th>
          </tr>
        </thead>
        <tbody>
          {staffData.map((staff, idx) => (
            <tr key={idx}>
              <td>{staff.full_name}</td>
              <td>{staff.email}</td>
              <td>{staff.phone}</td>
              <td>{staff.total_pickups}</td>
              <td>{staff.completed}</td>
              <td>{staff.assigned}</td>
              <td>{staff.on_the_way}</td>
              <td>{staff.cancelled}</td>
              <td>{staff.cod_to_collect}</td>
              <td>{staff.collected}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default StaffReport;

