import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import CountdownTimer from '../components/CountdownTimer';
// You'll need an API service for products and bids
// import { fetchProductById, placeBid, makeOffer } from '../services/apiService';
// import { useSocket } from '../hooks/useSocket'; // Custom hook for WebSocket connection

const ProductDetailPage = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bidAmount, setBidAmount] = useState('');
  const [offerAmount, setOfferAmount] = useState('');
  const [message, setMessage] = useState(''); // For success/error messages

  // Example for real-time updates (requires backend WebSocket)
  // const socket = useSocket('ws://localhost:5000'); // Connect to your WebSocket server

  useEffect(() => {
    const getProduct = async () => {
      // Simulate API call
      setLoading(true);
      setTimeout(() => {
        const mockProduct = {
          id: id,
          name: 'Vintage Gaming Console (Rare)',
          description: 'A classic 90s gaming console in excellent condition. Comes with 2 controllers and 5 games.',
          imageUrl: 'https://via.placeholder.com/600x400?text=Product+Image',
          price: 250.00, // For Buy Now option
          buyNowPrice: 300.00, // Optional buy now price
          currentBid: 180.00, // Current highest bid
          bidIncrement: 5.00,
          auctionEndTime: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3).toISOString(), // 3 days from now
          type: 'auction', // or 'buy_now'
          seller: 'RetroGamingStore',
          shipping: 'Free',
          condition: 'Used - Excellent',
          bestOfferAccepted: false,
          minOffer: 150.00, // Minimum acceptable offer
        };
        setProduct(mockProduct);
        setLoading(false);
      }, 500);

      // In a real app:
      // try {
      //   const data = await fetchProductById(id);
      //   setProduct(data);
      // } catch (error) {
      //   console.error('Error fetching product:', error);
      //   setMessage('Failed to load product details.');
      // } finally {
      //   setLoading(false);
      // }
    };

    getProduct();

    // Listen for real-time bid updates (if using WebSockets)
    // if (socket) {
    //   socket.on('newBid', (data) => {
    //     if (data.productId === id) {
    //       setProduct(prev => ({ ...prev, currentBid: data.newBidAmount }));
    //       setMessage(`New bid of $${data.newBidAmount.toFixed(2)} received!`);
    //     }
    //   });
    // }

    // return () => {
    //   if (socket) {
    //     socket.off('newBid');
    //   }
    // };
  }, [id]); // Add socket to dependencies if you uncomment socket logic

  const handlePlaceBid = async (e) => {
    e.preventDefault();
    if (!bidAmount || isNaN(bidAmount) || bidAmount <= (product?.currentBid || 0)) {
      setMessage('Please enter a valid bid amount higher than the current bid.');
      return;
    }
    // Simulate API call
    console.log(`Placing bid of $${parseFloat(bidAmount).toFixed(2)} for product ${id}`);
    setMessage('Placing your bid...');
    try {
      // In a real app:
      // const response = await placeBid(id, parseFloat(bidAmount));
      // if (response.success) {
      //   setProduct(prev => ({ ...prev, currentBid: parseFloat(bidAmount) })); // Update locally or via socket
      //   setMessage('Bid placed successfully!');
      //   setBidAmount('');
      // } else {
      //   setMessage(response.message || 'Failed to place bid.');
      // }
      // Simulate success
      setTimeout(() => {
        setProduct(prev => ({ ...prev, currentBid: parseFloat(bidAmount) }));
        setMessage('Bid placed successfully!');
        setBidAmount('');
      }, 1000);
    } catch (error) {
      console.error('Error placing bid:', error);
      setMessage('An error occurred while placing your bid.');
    }
  };

  const handleMakeOffer = async (e) => {
    e.preventDefault();
    if (!offerAmount || isNaN(offerAmount) || offerAmount < (product?.minOffer || 0)) {
      setMessage(`Please enter a valid offer amount (min $${product?.minOffer?.toFixed(2) || '0.00'}).`);
      return;
    }
    // Simulate API call
    console.log(`Making offer of $${parseFloat(offerAmount).toFixed(2)} for product ${id}`);
    setMessage('Submitting your offer...');
    try {
      // In a real app:
      // const response = await makeOffer(id, parseFloat(offerAmount));
      // if (response.success) {
      //   setMessage('Offer submitted successfully! Seller will review.');
      //   setOfferAmount('');
      // } else {
      //   setMessage(response.message || 'Failed to submit offer.');
      // }
      // Simulate success
      setTimeout(() => {
        setMessage('Offer submitted successfully! Seller will review.');
        setOfferAmount('');
      }, 1000);
    } catch (error) {
      console.error('Error making offer:', error);
      setMessage('An error occurred while submitting your offer.');
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-t-4 border-blue-500 rounded-full mx-auto"
        ></motion.div>
        <p className="mt-4 text-gray-700 dark:text-gray-300">Loading product...</p>
      </div>
    );
  }

  if (!product) {
    return <div className="text-center text-red-500 py-12">Product not found.</div>;
  }

  const isAuctionActive = product.type === 'auction' && new Date(product.auctionEndTime) > new Date();

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 lg:p-8">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          {product.name}
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Image */}
          <div className="relative rounded-lg overflow-hidden shadow-lg">
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-full h-auto object-cover"
            />
             {product.type === 'auction' && isAuctionActive && (
                 <div className="absolute top-4 left-4 bg-purple-600 text-white text-sm font-semibold px-3 py-1 rounded-full">
                     Live Auction
                 </div>
             )}
          </div>

          {/* Details & Actions */}
          <div>
            <p className="text-gray-700 dark:text-gray-300 text-lg mb-6 leading-relaxed">
              {product.description}
            </p>

            {product.type === 'auction' && (
              <div className="mb-6 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-900">
                <p className="text-lg text-gray-700 dark:text-gray-300 mb-2">
                  Current Highest Bid:{' '}
                  <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                    ${product.currentBid.toFixed(2)}
                  </span>
                </p>
                <p className="text-lg text-gray-700 dark:text-gray-300 flex items-center">
                  Auction Ends In:{' '}
                  <span className="ml-2">
                    <CountdownTimer endTime={product.auctionEndTime} />
                  </span>
                </p>
              </div>
            )}

            {product.type === 'buy_now' && (
                <div className="mb-6 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-900">
                    <p className="text-lg text-gray-700 dark:text-gray-300">
                        Price:{' '}
                        <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                            ${product.price.toFixed(2)}
                        </span>
                    </p>
                </div>
            )}

            <p className="text-gray-600 dark:text-gray-400 mb-2">Seller: {product.seller}</p>
            <p className="text-gray-600 dark:text-gray-400 mb-4">Condition: {product.condition}</p>

            <AnimatePresence>
              {message && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className={`mb-4 p-3 rounded-md text-sm ${
                    message.includes('success') ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200' :
                    'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200'
                  }`}
                >
                  {message}
                </motion.p>
              )}
            </AnimatePresence>

            {product.type === 'auction' && isAuctionActive && (
              <motion.form
                onSubmit={handlePlaceBid}
                className="mb-6 p-4 border border-blue-300 dark:border-blue-700 rounded-lg bg-blue-50 dark:bg-blue-900/10"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">Place Your Bid</h3>
                <div className="flex items-end space-x-2">
                  <div className="flex-1">
                    <label htmlFor="bid-amount" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Your Bid ($)
                    </label>
                    <input
                      type="number"
                      id="bid-amount"
                      value={bidAmount}
                      onChange={(e) => setBidAmount(e.target.value)}
                      min={(product.currentBid + product.bidIncrement).toFixed(2)}
                      step={product.bidIncrement.toFixed(2)}
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-blue-500 focus:border-blue-500"
                      placeholder={`Min: $${(product.currentBid + product.bidIncrement).toFixed(2)}`}
                      required
                    />
                  </div>
                  <motion.button
                    type="submit"
                    className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Bid
                  </motion.button>
                </div>
              </motion.form>
            )}

            {product.bestOfferAccepted === false && ( // Only show if best offer is an option
                <motion.form
                  onSubmit={handleMakeOffer}
                  className="mb-6 p-4 border border-teal-300 dark:border-teal-700 rounded-lg bg-teal-50 dark:bg-teal-900/10"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">Make a Best Offer</h3>
                  <div className="flex items-end space-x-2">
                    <div className="flex-1">
                      <label htmlFor="offer-amount" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Your Offer ($)
                      </label>
                      <input
                        type="number"
                        id="offer-amount"
                        value={offerAmount}
                        onChange={(e) => setOfferAmount(e.target.value)}
                        min={product.minOffer || 0}
                        step="0.01"
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-teal-500 focus:border-teal-500"
                        placeholder={`Min: $${product.minOffer?.toFixed(2) || '0.00'}`}
                        required
                      />
                    </div>
                    <motion.button
                      type="submit"
                      className="px-6 py-2 bg-teal-600 text-white font-semibold rounded-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Submit Offer
                    </motion.button>
                  </div>
                </motion.form>
            )}

            {product.buyNowPrice && (
                <motion.button
                  className="w-full py-3 bg-indigo-600 text-white font-bold text-lg rounded-md hover:bg-indigo-700 transition duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => alert(`Buying ${product.name} for $${product.buyNowPrice.toFixed(2)}`)} // Replace with actual add to cart/checkout logic
                >
                  Buy Now for ${product.buyNowPrice.toFixed(2)}
                </motion.button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ProductDetailPage;