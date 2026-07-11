import React from "react";
import HeroWithNavbar from "./HeroWithNavbar";
import Banner from "./Banner";
import ServicesCards from "./ServicesCards";
import HowItWorks from "./HowItWorks";
import StatsSection from "./StatsSection";
import Testimonials from "./Testimonials";
import GetInTouch from './GetInTouch';
import MissionSection from './MissionSection';
import Footer from './Footer';
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
const Homepage = () => {
  const location = useLocation();
  useEffect(() => {
    if (location.state?.scrollToContact) {
      const section = document.getElementById("contact");
      if (section) {
        section.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, [location]);

  return (
    <>
      <HeroWithNavbar />
      <Banner />
      <ServicesCards />
      <HowItWorks/>
      <StatsSection/>
      <Testimonials/>
      <GetInTouch/>
      <MissionSection/>
      <Banner />
      <Footer/>

    </>
  );
};

export default Homepage;