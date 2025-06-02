import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 py-6 mt-12 shadow-inner">
      <div className="container mx-auto px-4 text-center">
        <p>&copy; {new Date().getFullYear()} AuctionBay. All rights reserved.</p>
        <p className="mt-2 text-sm">
          <a href="#" className="hover:underline mx-2">Privacy Policy</a> |
          <a href="#" className="hover:underline mx-2">Terms of Service</a> |
          <a href="#" className="hover:underline mx-2">Contact Us</a>
        </p>
        <div className="mt-4 flex justify-center space-x-4 text-lg">
          <a href="#" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200">
            <i className="fab fa-facebook"></i> {/* Example: Font Awesome icon */}
          </a>
          <a href="#" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200">
            <i className="fab fa-twitter"></i>
          </a>
          <a href="#" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200">
            <i className="fab fa-instagram"></i>
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;