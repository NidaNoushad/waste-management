import React, { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import AOS from 'aos';
import 'aos/dist/aos.css';
import './LoginPage.css';
import { FiLogIn } from 'react-icons/fi';
import { FaUserPlus } from 'react-icons/fa';
import Header from './Header';
import Footer from './Footer';
import MainNavbar from './MainNavbar'
import { useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Common states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");


  // Register-specific
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);

  useEffect(() => {
    AOS.init({ duration: 1000 });
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const mode = params.get("mode");
    if (mode === "register") {
      setIsLogin(false);
    }
  }, [location]);

  const handleSwitch = (login) => {
    setIsLogin(login);
    setTimeout(() => {
      AOS.refresh(); // Re-trigger AOS animation
    }, 100); // Delay is needed to let DOM update
  };

  //  register api
  const handleRegister = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert("password do not match!");
      return;
    }

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}register/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({

          // username: name,
          email: email,
          full_name: name,
          password: password,
          password2: confirmPassword,
          phone_number: phone,
        }),
      });

      const data = await response.json();
      console.log(data);
      if (response.ok) {
        alert("Registration successful! Please login.");

        // Redirect to login page
        setName("");
        setEmail("");
        setPhone("");
        setPassword("");
        setConfirmPassword("");


        setIsLogin(true);
      } else {
        const firstError = Object.values(data)[0][0] || "Something went wrong";
        alert(firstError);

      }
    } catch (error) {
      alert("Error: " + error.message);
    }
  };

  // login api with jwt
  const handleLogin = async (e) => {
    e.preventDefault();


    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}token/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({

          username: email,

          password: password,

        }),
      });

      const data = await response.json();
      console.log(data);
      if (response.ok) {
        localStorage.setItem("accessToken", data.access);
        localStorage.setItem("refreshToken", data.refresh);
        alert("Login successful!");
        navigate('/userdashboard')
        // redirect to dashboard or home
      } else {
        alert(data.detail || "Login failed");
      }
    } catch (error) {
      alert("Error: " + error.message);
    }
  };




  useEffect(() => {
    const fetchRequests = async () => {
      const token = localStorage.getItem("accessToken");
      if (!token) return;
      const response = await fetch(`${process.env.REACT_APP_API_URL}waste-requests/`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      console.log(data); // Or setState(data)
    };

    fetchRequests();
  }, []);





  return (
    <>
      <Header />
      <MainNavbar />
      <div className="container-fuid login-container">
        <div className="row min-vh-100 d-flex align-items-center justify-content-center">
          {/* Left side */}
          <div className="col-md-6 p-5 text-center text-md-start" data-aos="zoom-in">
            <h6 style={{ color: "#69b31d" }}>Turning Waste Into New Possibilities</h6>
            <h1 className="fw-bold mb-4" style={{ color: "#014421", fontSize: "2rem" }}>Smart Disposal For Cleaner World</h1>
            <p className="text-muted mt-3">
              Delivering smart waste solutions for homes, businesses & industries to keep communities clean and protect the environment every day.
            </p>
          </div>

          {/* Right side */}
          <div className="col-md-6 p-5 shadow bg-white login-box " data-aos="zoom-in" style={{
            backgroundColor: "#b4c2bf",
            minHeight: "500px",
            marginTop: "40px",
            marginBottom: "40px"
          }} key={isLogin ? "login" : "register"}>
            {isLogin ? (
              <>
                <h2 className='mb-4 d-flex align-items-center gap-2' style={{ color: "#014421" }}
                ><FiLogIn /> Login </h2>
                <form onSubmit={handleLogin}>

                  <div className="mb-3">
                    <label className="form-label">Email</label>
                    <input
                      type="email"
                      className="form-control"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="Enter your email"
                    />
                  </div>


                  <div className="mb-3">
                    <label className="form-label">Password</label>
                    <input type="password" className="form-control"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      placeholder="Enter your password" />
                  </div>

                  <button type="submit" className="btn w-100 mt-3 " style={{ backgroundColor: "#69b31d", color: "#ffff", fontWeight: "500" }}>Login</button>

                  <div className="d-flex justify-content-between mt-3">
                    <span
                      onClick={() => navigate('/forget-password')}
                      className="text-decoration-none"
                      style={{ cursor: 'pointer', color: "#69b31d" }}
                    >
                      Forgot Password?
                    </span>

                    <span className="text-decoration-none" onClick={() => setIsLogin(false)} style={{ cursor: 'pointer', color: "red" }}>
                      Don't have an account? Sign Up
                    </span>
                  </div>
                </form>
              </>
            ) : (
              <>
                <h2 className='mb-4 d-flex align-items-center gap-2' style={{ color: "#014421" }}><FaUserPlus /> Register</h2>
                <form onSubmit={handleRegister}>
                  <div className="mb-3">
                    <label className="form-label">Full Name</label>
                    <input type="text" className="form-control"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      placeholder="Enter your name" />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Email</label>
                    <input type="email" className="form-control"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="Enter your email" />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Phone</label>
                    <input type="text" className="form-control"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                      placeholder="Enter your phone number" />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Password</label>
                    <input type="password" className="form-control"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      placeholder="Create a password" />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Confirm Password</label>
                    <input type="password" className="form-control"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      placeholder="Re-enter password" />
                  </div>

                  <button type="submit" className="btn w-100 mt-3" style={{ backgroundColor: "#69b31d", color: "#fff", fontWeight: "500" }}>
                    Register
                  </button>

                  <div className="mt-3 text-end">
                    <span onClick={() => setIsLogin(true)} style={{ cursor: 'pointer', color: "red" }} >
                      Already have an account? Login
                    </span>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default LoginPage;
