import React, { useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import "./Blog.css";
import Footer from './Footer';
import Header from './Header';
import MainNavbar from './MainNavbar';

const Blog = () => {
  useEffect(() => {
    AOS.init({ duration: 1000 });
  }, []);
  const blogPosts = [
    {
      id: 1,
      date: "20",
      month: "MAY",
      image: "/assets/about1.jpg",
      author: "Admin",
      category: "Waste Management",
      title: "Sustainable Waste Management Strategies for a Cleaner Planet",
      description: "Explore strategies to make waste disposal cleaner, greener, and healthier for future generations."
    },
    {
      id: 2,
      date: "22",
      month: "MAY",
      image: "/assets/ewaste3.jpg",
      author: "Admin",
      category: "Recycling",
      title: "Innovative Waste Management Solutions to Reduce Pollution",
      description: "Learn how innovative solutions can minimize waste and promote sustainability in communities."
    },
    {
      id: 3,
      date: "25",
      month: "MAY",
      image: "/assets/ewaste3.jpg",
      author: "Admin",
      category: "E-Waste",
      title: "E-Waste Disposal: Protecting the Environment from Toxic Materials",
      description: "Why e-waste is dangerous and how proper disposal helps reduce risks."
    },
    {
      id: 4,
      date: "28",
      month: "MAY",
      image: "/assets/ewaste3.jpg",
      author: "Admin",
      category: "Recycling",
      title: "The Benefits of Recycling: Saving Energy and Reducing Pollution",
      description: "Discover how recycling makes an impact on climate change and daily life."
    },
    {
      id: 5,
      date: "30",
      month: "MAY",
      image: "/assets/ewaste3.jpg",
      author: "Admin",
      category: "Plastic",
      title: "Plastic Waste Dangers and How to Reduce Usage at Home",
      description: "Practical steps you can take to minimize plastic waste in your household."
    },
    {
      id: 6,
      date: "01",
      month: "JUNE",
      image:"/assets/ewaste3.jpg",
      author: "Admin",
      category: "Community",
      title: "Success Stories: Cities Leading in Smart Waste Management",
      description: "Real-world examples of how smart waste practices improved urban living."
    }
  ];
  

  return (
    <>
    <Header/>
    <MainNavbar/>
    
    <div className="blog-hero d-flex align-items-center">
      <div className="container text-center text-white" data-aos="fade-up">
        {/* Breadcrumb */}
        <p className="breadcrumb-text">Home &gt; Blog</p>

        {/* Heading */}
        <h1 className="blog-title">Blog</h1>

        {/* Subheading */}
        <p className="blog-subtitle">
          Smart Waste Disposal for a Cleaner Future
        </p>
      </div>
    </div>
    <div className="container my-5">
      {blogPosts.map((post) => (
        <div
          className="row blog-row align-items-center mb-4"
          key={post.id}
          data-aos="fade-up"
        >
          {/* Left side - Image + Date */}
          <div className="col-md-5">
            <div className="blog-img-box">
              <img src={post.image} alt={post.title} className="img-fluid rounded" />
              <div className="date-badge">
                <span className="date">{post.date}</span>
                <span className="month">{post.month}</span>
              </div>
            </div>
          </div>

          {/* Right side - Content */}
          <div className="col-md-7">
            <p className="author">
              <i className="bi bi-person-circle"></i> {post.author} &nbsp; | &nbsp;
              <i className="bi bi-tags"></i> {post.category}
            </p>
            <h4 className="blog-heading">{post.title}</h4>
            <p className="blog-desc">{post.description}</p>
            <button className="btn btn-success btn-sm">Read More</button>
          </div>
        </div>
      ))}
    </div>
    <Footer/>
    </>
  );
};

export default Blog;
