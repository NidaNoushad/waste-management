
import React, { useEffect, useState } from 'react';
import { useTheme } from './ThemeContext';
import './ProfileManagement.css';

const ProfileManagement = () => {
  const { isDarkMode, toggleTheme } = useTheme();
  
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phoneNumber:'',
    address: '',
    city: '',
    zipcode: ''
  });
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    // smsNotifications: false
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/aos/2.3.4/aos.js';
      script.onload = () => {
        window.AOS.init({
          duration: 800,
          once: true,
          offset: 50
        });
      };
      document.head.appendChild(script);

      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://cdnjs.cloudflare.com/ajax/libs/aos/2.3.4/aos.css';
      document.head.appendChild(link);
    }
  }, []);


  useEffect(() => {
    const token = localStorage.getItem("accessToken");
  
    if (token) {
      fetch("http://127.0.0.1:8000/api/profile/", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then(res => res.json())
        .then(data => {
          setProfileData({
            name: data.full_name || "",
            email: data.email || "",
            phoneNumber: data.phone_number || "",
            address: data.address || "",
            city: data.city || "",
            zipcode: data.zipcode || ""
          });
          setNotifications({
            emailNotifications: data.email_notifications,
            // smsNotifications: data.sms_notifications
          });
        })
        .catch(err => console.error("Error loading profile:", err));
    }
  }, []);

  const handleProfileChange = (e) => {
    setProfileData({
      ...profileData,
      [e.target.name]: e.target.value
    });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value
    });
  };


  const handleNotificationToggle = (type) => {
    const updated = {
      ...notifications,
      [type]: !notifications[type]
    };
    setNotifications(updated);
  
    const token = localStorage.getItem("accessToken");
  
    fetch("http://127.0.0.1:8000/api/profile/", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        ...profileData,
        email_notifications: updated.emailNotifications,
        // sms_notifications: updated.smsNotifications,
      }),
    })
    .then(res => res.json())
    .then(data => console.log("Preferences updated:", data))
    .catch(err => console.error("Error updating preferences:", err));
  };




  const handleSaveProfile = () => {
    const token = localStorage.getItem("accessToken");
  
    fetch("http://127.0.0.1:8000/api/profile/", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        full_name: profileData.name,
        email: profileData.email,
        phone_number: profileData.phoneNumber,
        address: profileData.address,
        city: profileData.city,
        zipcode: profileData.zipcode
      }),
    })
      .then(res => res.json())
      .then(data => {
        alert("Profile updated successfully!");
        setProfileData({
          name: data.full_name,
          email: data.email,
          phoneNumber: data.phone_number,
          address: data.address,
          city: data.city,
          zipcode: data.zipcode
        });
      })
      .catch(err => {
        console.error("Error updating profile:", err);
        alert("Failed to update profile.");
      });
  };
  

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert("New passwords do not match!");
      return;
    }
  
    try {
      const response = await fetch("http://127.0.0.1:8000/api/change-password/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`, // JWT token
        },
        body: JSON.stringify({
          old_password: passwordData.currentPassword,
          new_password: passwordData.newPassword,
          confirm_password: passwordData.confirmPassword,
        }),
      });
  
      const data = await response.json();
      if (response.ok) {
        alert(data.message);
        setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
      } else {
        alert(data.error || "Something went wrong");
      }
    } catch (error) {
      alert("Error: " + error.message);
    }
  };
  
  return (
    <div className="profile-management">
      <div className="profile-container">
        {/* Header */}
        <div className="profile-header" data-aos="fade-down">
          <h1 className="profile-title">My Profile</h1>
          <button className="theme-toggle" onClick={toggleTheme}>
            <i className={`fas ${isDarkMode ? 'fa-sun' : 'fa-moon'}`}></i>
            {isDarkMode ? ' Light Mode' : ' Dark Mode'}
          </button>
        </div>

        {/* Avatar Section */}
        <div className="profile-avatar-section" data-aos="fade-up">
          <div className="avatar">
            <i className="fas fa-user"></i>
          </div>
          <div className="user-info">
            <h3>{profileData.name}</h3>
            <div className="user-location">{profileData.city}</div>
          </div>
     
        </div>

        <div className="row">
          {/* Personal Information */}
          <div className="col-md-6">
            <div className="profile-card" data-aos="fade-right">
              <h4 className="card-title">Personal Information</h4>
              <div className="form-group">
                <label className="form-label">Name:</label>
                <input type="text" className="form-control" name="name"
                  value={profileData.name} onChange={handleProfileChange} />
              </div>
              <div className="form-group">
                <label className="form-label">Email Address:</label>
                <input type="email" className="form-control" name="email"
                  value={profileData.email} onChange={handleProfileChange} />
              </div>
              <div className="form-group">
                <label className="form-label">Phone Number:</label>
                <input type="tel" className="form-control" name="phoneNumber"
                  value={profileData.phoneNumber} onChange={handleProfileChange} />
              </div>
              <button className="save-btn" onClick={handleSaveProfile}>
                <i className="fas fa-save"></i> Save Changes
              </button>
            </div>
          </div>

          {/* Address */}
          <div className="col-md-6">
            <div className="profile-card" data-aos="fade-left">
              <h4 className="card-title">Address</h4>
              <div className="form-group">
                <label className="form-label">Address:</label>
                <input type="text" className="form-control" name="address"
                  value={profileData.address} onChange={handleProfileChange} />
              </div>
              <div className="form-group">
                <label className="form-label">City:</label>
                <input type="text" className="form-control" name="city"
                  value={profileData.city} onChange={handleProfileChange} />
              </div>
              <div className="form-group">
                <label className="form-label">Zip Code:</label>
                <input type="text" className="form-control" name="zipcode"
                  value={profileData.zipcode} onChange={handleProfileChange} />
              </div>
              <button className="save-btn" onClick={handleSaveProfile}>
                <i className="fas fa-map-marker-alt"></i> Update Address
              </button>
            </div>
          </div>
        </div>

        {/* Password Change */}
        <div className="profile-card" data-aos="fade-up" data-aos-delay="200">
          <h4 className="card-title">Change Password</h4>
          <div className="row">
            <div className="col-md-6">
              <div className="form-group">
                <label className="form-label">Current Password:</label>
                <input type="password" className="form-control" name="currentPassword"
                  value={passwordData.currentPassword} onChange={handlePasswordChange} />
              </div>
            </div>
            <div className="col-md-6">
              <div className="form-group">
                <label className="form-label">New Password:</label>
                <input type="password" className="form-control" name="newPassword"
                  value={passwordData.newPassword} onChange={handlePasswordChange} />
              </div>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Confirm New Password:</label>
            <input type="password" className="form-control" name="confirmPassword"
              value={passwordData.confirmPassword} onChange={handlePasswordChange} />
          </div>
          <button className="save-btn" onClick={handleChangePassword}>
            <i className="fas fa-key"></i> Change Password
          </button>
        </div>

        {/* Notifications */}
        <div className="profile-card" data-aos="fade-up" data-aos-delay="300">
          <h4 className="card-title">Notification Settings</h4>
          <div className="notification-item">
            <div>
              <strong>Email Notifications</strong>
              <div>Receive updates about waste collection schedules via email</div>
            </div>
            <label className="toggle-switch">
              <input type="checkbox" checked={notifications.emailNotifications}
                onChange={() => handleNotificationToggle('emailNotifications')} />
              <span className="slider"></span>
            </label>
          </div>
        
        </div>

        {/* Preferences */}
        <div className="profile-card" data-aos="fade-up" data-aos-delay="400">
          <h4 className="card-title">Preferences</h4>
          <div className="notification-item">
            <div>
              <strong>Dark Mode</strong>
              <div>Switch between light and dark theme for entire application</div>
            </div>
            <label className="toggle-switch">
              <input type="checkbox" checked={isDarkMode} onChange={toggleTheme} />
              <span className="slider"></span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileManagement;

