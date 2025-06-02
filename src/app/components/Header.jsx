import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const Header = () => {
  // const { user, logout } = useContext(AuthContext); // When you have AuthContext

  return (
    <motion.header
      className="bg-white dark:bg-gray-800 shadow-md py-4"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 120, damping: 10 }}
    >
      <div className="container mx-auto flex justify-between items-center px-4">
        <Link to="/" className="text-2xl font-bold text-blue-600 dark:text-blue-400">
          AuctionBay
        </Link>
        <nav>
          <ul className="flex space-x-6 items-center">
            <li>
              <Link to="/products" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition duration-200">
                Products
              </Link>
            </li>
            {/*
            {user ? (
              <>
                <li>
                  <Link to="/dashboard" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition duration-200">
                    Dashboard
                  </Link>
                </li>
                <li>
                  <button onClick={logout} className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition duration-200">
                    Logout
                  </button>
                </li>
              </>
            ) : (
              <>
                <li>
                  <Link to="/login" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-200">
                    Login
                  </Link>
                </li>
                <li>
                  <Link to="/register" className="text-blue-600 dark:text-blue-400 hover:underline">
                    Register
                  </Link>
                </li>
              </>
            )}
            */}
            <li>
              {/* Cart Icon - Example with Framer Motion */}
              <motion.div
                className="relative"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Link to="/cart">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 0a2 2 0 100 4 2 2 0 000-4z" />
                  </svg>
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                    0 {/* Replace with actual cart item count */}
                  </span>
                </Link>
              </motion.div>
            </li>
          </ul>
        </nav>
      </div>
    </motion.header>
  );
};

export default Header;