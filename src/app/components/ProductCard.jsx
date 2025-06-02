import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const ProductCard = ({ product }) => {
  const isAuction = product.type === 'auction';

  return (
    <motion.div
      className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden"
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Link to={`/products/${product.id}`}>
        <div className="h-48 w-full overflow-hidden">
          <img
            src={product.imageUrl || 'https://via.placeholder.com/400x300'}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
          />
        </div>
        <div className="p-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2 truncate">
            {product.name}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-2">
            {product.description}
          </p>
          <div className="flex justify-between items-center">
            {isAuction ? (
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-sm">Current Bid:</p>
                <p className="text-xl font-bold text-green-600 dark:text-green-400">
                  ${product.currentBid ? product.currentBid.toFixed(2) : '0.00'}
                </p>
              </div>
            ) : (
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-sm">Price:</p>
                <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
                  ${product.price.toFixed(2)}
                </p>
              </div>
            )}
            <span
              className={`text-xs px-2 py-1 rounded-full ${
                isAuction ? 'bg-purple-200 text-purple-800' : 'bg-blue-200 text-blue-800'
              }`}
            >
              {isAuction ? 'Auction' : 'Buy Now'}
            </span>
          </div>
          {isAuction && product.auctionEndTime && (
            <div className="mt-3 text-sm text-gray-500 dark:text-gray-400">
              Ends in: <CountdownTimer endTime={product.auctionEndTime} />
            </div>
          )}
        </div>
      </Link>
    </motion.div>
  );
};

export default ProductCard;