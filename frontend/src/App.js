import React from 'react';
import Homepage from './components/Homepage';
import HeroWithNavbar from './components/HeroWithNavbar';
import Banner from "./components/Banner";
import ServicesCards from "./components/ServicesCards";
import 'bootstrap/dist/css/bootstrap.min.css';
import AOS from 'aos';
import 'aos/dist/aos.css';
import {useEffect} from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from './components/LoginPage';
import UserDashboard from './components/UserDashboard';
import DashboardLayout from './components/DashboardLayout';
import NewRequest from './components/NewRequest';
import Invoice from './components/Invoice';
import MyRequest from './components/MyRequest';
import TrackPickup from './components/TrackPickup';
import PaymentHistory from './components/PaymentHistory';
import Feedback from './components/Feedback';
import ContactUs from './components/ContactUs';
import ProfileManagement from './components/ProfileManagement';
import ForgetPasswordPage from './components/ForgetPasswordPage';
import ResetPasswordPage from './components/ResetPasswordPage';
import PasswordResetSuccess from './components/PasswordResetSuccess';
import ServiceEWasteRecycling from './components/ServiceEWasteRecycling';
import ServiceResidential from './components/ServiceResidential';
import ServiceOndemand from './components/ServiceOndemand';
import ServiceBulk from './components/ServiceBulk';
import ServiceSchedule from './components/ServiceSchedule';
import AboutUs from './components/AboutUs';
import Blog from './components/Blog';
import Project from './components/Project';
import ServicesList from './components/ServicesList';
import { ThemeProvider } from './components/ThemeContext';
import './components/GlobalTheme.css'; 



// staff

import Stafflogin from './staffcomponents/Stafflogin'
import StaffLayout from "./staffcomponents/StaffLayout";
import StaffDashboard from './staffcomponents/StaffDashboard'
import StaffTasks from "./staffcomponents/StaffTasks";
import StaffPerformance from "./staffcomponents/StaffPerformance";
import StaffLogout from "./staffcomponents/StaffLogout";



// admin
import Adminlogin from './admincomponents/Adminlogin'
import AdminDashboard from './admincomponents/AdminDashboard'
import AdminDashboardLayout from './admincomponents/AdminDashboardLayout'
import AdminSidebar from './admincomponents/AdminSidebar'
import ManageUser from './admincomponents/ManageUser'
import UserDetails from "./admincomponents/UserDetails";
import WasteRequestList from "./admincomponents/WasteRequestList";
import WasteRequestDetail from "./admincomponents/WasteRequestDetail";
import WasteRequestWrapper from "./admincomponents/WasteRequestWrapper";
import RequestStatusList from "./admincomponents/RequestStatusList";
import UserUpdateList from "./admincomponents/UserUpdateList";
import UserCancelList from "./admincomponents/UserCancelList";
import UserProfileAdmin from "./admincomponents/UserProfileAdmin";
import CustomerMessage from "./admincomponents/CustomerMessage";
import AdminPickupDates from "./admincomponents/AdminPickupDates";
import AddStaff from "./admincomponents/AddStaff";
import StaffList from "./admincomponents/StaffList";
import StaffReport from "./admincomponents/StaffReport";

function App() {

  useEffect(() => {
    AOS.init({ duration: 1000 });
  }, []);

  return (
    <Router>
      <Routes>
      <Route path="/" element={<Homepage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/forget-password" element={<ForgetPasswordPage />} />
      <Route path="/reset-password/:uid/:token" element={<ResetPasswordPage />} />
      <Route path="/password-reset-success" element={<PasswordResetSuccess />} />
      <Route path="/service/e-waste" element={<ServiceEWasteRecycling />} />
      <Route path="/service/residentialpickup" element={<ServiceResidential />} />
      <Route path="/service/ondemand" element={<ServiceOndemand />} />
      <Route path="/service/bulk" element={<ServiceBulk />} />
      <Route path="/service/schedule" element={<ServiceSchedule />} />
      <Route path="/serviceslist" element={<ServicesList />} />
      <Route path="/service/aboutus" element={<AboutUs />} />
      <Route path="/project" element={<Project />} />
      <Route path="/blog" element={<Blog />} />
      
          <Route
      path="/"
      element={
        <ThemeProvider>
          <DashboardLayout />
        </ThemeProvider>
      }
    >

  
          <Route path="userdashboard" element={<UserDashboard />} />
          <Route path="/new-request" element={<NewRequest />} />
          <Route path="/myrequests" element={<MyRequest />} />
          <Route path="/trackpickup" element={<TrackPickup />} />
          <Route path="/paymenthistory" element={<PaymentHistory />} />
          <Route path="/feedback" element={<Feedback />} />
          <Route path="/contactus" element={<ContactUs />} />
          <Route path="/myprofile" element={<ProfileManagement />} />
       
          
        </Route>
        
         <Route path="/invoice/:id" element={<Invoice />} /> 
         <Route path="/" element={<Banner />} /> 
         <Route path="/" element={<ServicesCards />} /> 

         {/* staff */}
         <Route path="/staff/login" element={<Stafflogin/>}/>
         


         {/* Staff Section */}
        <Route path="/staff" element={<StaffLayout />}>
          <Route index element={<Navigate to="/staff/staffdashboard" />} />
          <Route path="staffdashboard" element={<StaffDashboard />} />
          <Route path="tasks" element={<StaffTasks />} />
          <Route path="performance" element={<StaffPerformance />} />
          <Route path="logout" element={<StaffLogout />} />
    
        </Route>
        {/* admin */}
        <Route path="/admin/login" element={<Adminlogin />} />
        <Route
      path="/"
      element={<AdminDashboardLayout /> }>
      <Route path="/admin/admindashboard" element={<AdminDashboard />} />
      <Route path="/admin/manageuser" element={<ManageUser />} />
      <Route path="/adminpanel/user/:userId" element={<UserDetails />} />
      {/* <Route
  path="/adminpanel/user/:userId/waste-requests"
  element={<WasteRequestWrapper />}
/> */}
<Route
  path="/adminpanel/user/:userId/waste-requests"
  element={<WasteRequestWrapper />}/>

<Route
  path="/adminpanel/wasterequest/:requestId"
  element={<WasteRequestDetail />}
/>
<Route
path="/adminpanel/user/:userId/request-status"
element={<RequestStatusList />}
/>
<Route
path="/adminpanel/user/:userId/user-updates"
element={<UserUpdateList/>}
/>
<Route
path="/adminpanel/user/:userId/user-cancel"
element={<UserCancelList/>}
/>
 <Route
 path="/adminpanel/user/:userId/user-profile"
 element={<UserProfileAdmin />}
/>
<Route path="/admin/messages" element={<CustomerMessage />} />
<Route path="/admin/city" element={<AdminPickupDates />} />
<Route path="/admin/addstaff" element={<AddStaff />} />
<Route path="/admin/stafflist" element={<StaffList />} />
<Route path="/admin/staffreport" element={<StaffReport />} />
      </Route>
      </Routes>
    </Router>
  );
}




export default App;
