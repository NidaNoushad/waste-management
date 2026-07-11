import React from 'react';
import './Header.css';
import { FaFacebookF, FaTwitter, FaYoutube, FaPinterestP, FaInstagram } from 'react-icons/fa';

const Header = () => {
  return (
 
    <div className="top-bar bg-dark-green text-white py-2 px-4">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-center text-center text-md-start gap-2">
        
        {/* Left part: Availability and Contact Info */}
        <div className="text-center text-md-start">
          🕒 Monday – Friday: 7:00 AM – 5:00 PM &nbsp;&nbsp;
          📧 contact@gotrash &nbsp;&nbsp;
          📞 +91 98765 43210
        </div>
        {/* Right part: Social Media Icons */}
        <div className="social-icons d-flex justify-content-center justify-content-md-end gap-2">
          <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-white">
            <FaFacebookF />
          </a>
          <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-white">
            <FaTwitter />
          </a>
          <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="text-white">
            <FaYoutube />
          </a>
          <a href="https://pinterest.com" target="_blank" rel="noopener noreferrer" className="text-white">
            <FaPinterestP />
          </a>
          <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-white">
            <FaInstagram />
          </a>
        </div>
      </div>
    </div>
  );
};

export default Header;
