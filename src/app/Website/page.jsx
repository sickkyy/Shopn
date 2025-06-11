'use client'
import React, { useState, useEffect } from 'react';

// --- Mock Data and Configuration (No Firebase) ---
// We'll use a simple user object for currentUser simulation
const MOCK_CURRENT_USER = {
    uid: "mockUserId123",
    displayName: "Mock User",
    email: "mock@example.com",
};

// Dummy product data
const DUMMY_PRODUCTS = [
    {
        id: "prod1",
        name: "Vintage Camera",
        description: "A classic film camera from the 80s, in good working condition.",
        imageUrl: "https://via.placeholder.com/150/FF5733/FFFFFF?text=Camera",
        sellerId: "seller1",
        sellerName: "Alice Seller",
        initialPrice: 120.00,
        mockEndTime: Date.now() + 2 * 60 * 60 * 1000, // Ends in 2 hours
        status: 'active',
        createdAt: Date.now() - 5 * 60 * 60 * 1000, // 5 hours ago
    },
    {
        id: "prod2",
        name: "Handmade Ceramic Mug",
        description: "Beautifully crafted ceramic mug, perfect for your morning coffee.",
        imageUrl: "https://via.placeholder.com/150/33FF57/FFFFFF?text=Mug",
        sellerId: "mockUserId123", // This user's own item
        sellerName: "Mock User",
        initialPrice: 25.50,
        mockEndTime: Date.now() + 1 * 60 * 60 * 1000, // Ends in 1 hour
        status: 'active',
        createdAt: Date.now() - 2 * 60 * 60 * 1000, // 2 hours ago
    },
    {
        id: "prod3",
        name: "Wireless Headphones",
        description: "Noise-cancelling headphones with long battery life.",
        imageUrl: "https://via.placeholder.com/150/3357FF/FFFFFF?text=Headphones",
        sellerId: "seller3",
        sellerName: "Bob Tech",
        initialPrice: 75.00,
        mockEndTime: Date.now() - 1 * 60 * 60 * 1000, // Ended 1 hour ago
        status: 'expired', // Example of an expired product
        createdAt: Date.now() - 10 * 60 * 60 * 1000, // 10 hours ago
    },
];

export default function Home() {
    // Products are now managed locally
    const [products, setProducts] = useState(DUMMY_PRODUCTS);
    const [productDescription, setProductDescription] = useState("");
    const [productName, setProductName] = useState("");
    const [productPrice, setProductPrice] = useState("");
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [isListing, setIsListing] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    // Simulated user authentication
    const [currentUser, setCurrentUser] = useState(null);

    // New states for Favorites and Cart
    const [favoriteProducts, setFavoriteProducts] = useState(new Set()); // Store product IDs
    const [cartItems, setCartItems] = useState([]); // [{ productId, quantity, name, price, imageUrl }]

    // Effect to load data from localStorage on mount and simulate product status
    useEffect(() => {
        // Load favorites from localStorage
        const storedFavorites = localStorage.getItem('favoriteProducts');
        if (storedFavorites) {
            setFavoriteProducts(new Set(JSON.parse(storedFavorites)));
        }

        // Load cart items from localStorage
        const storedCart = localStorage.getItem('cartItems');
        if (storedCart) {
            setCartItems(JSON.parse(storedCart));
        }

        // Simulate initial products from DUMMY_PRODUCTS or localStorage if you want to persist local product listings
        // For this example, we'll just use DUMMY_PRODUCTS directly.
        // If you want persistence for newly listed items without Firebase,
        // you'd need to load/save the 'products' state to localStorage as well.

        // Simulating the user being logged in or out
        const storedUser = localStorage.getItem('mockCurrentUser');
        if (storedUser) {
            setCurrentUser(JSON.parse(storedUser));
        }

        // No need for Firestore snapshot listener or auction timers
        // as we're not dealing with a real-time backend or complex auction logic.

        // Cleanup (not strictly necessary without timers, but good practice for any future setup)
        return () => {
            // No cleanup for timers or listeners without Firebase
        };
    }, []); // Empty dependency array means this runs once on mount

    // Effect to save favorites to localStorage whenever it changes
    useEffect(() => {
        localStorage.setItem('favoriteProducts', JSON.stringify(Array.from(favoriteProducts)));
    }, [favoriteProducts]);

    // Effect to save cart items to localStorage whenever it changes
    useEffect(() => {
        localStorage.setItem('cartItems', JSON.stringify(cartItems));
    }, [cartItems]);

    // Effect to save mock user to localStorage
    useEffect(() => {
        localStorage.setItem('mockCurrentUser', JSON.stringify(currentUser));
    }, [currentUser]);

    // --- Mock Auth Handlers ---
    const handleSignIn = () => {
        setCurrentUser(MOCK_CURRENT_USER); // Simply set the mock user
        alert("Simulated login successful!");
    };

    const handleSignOut = () => {
        setCurrentUser(null); // Clear the mock user
        localStorage.removeItem('mockCurrentUser');
        // Clear user-specific local storage data on sign out
        localStorage.removeItem('favoriteProducts');
        localStorage.removeItem('cartItems');
        setFavoriteProducts(new Set());
        setCartItems([]);
        alert("Simulated logout successful!");
    };
    // --- End Mock Auth Handlers ---

    // Handle image selection and create preview URL
    const handleImageChange = (e) => {
        if (e.target.files[0]) {
            const file = e.target.files[0];
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        } else {
            setImageFile(null);
            setImagePreview(null);
        }
    };

    // Handle product deletion (only if current user is seller) - now modifies local state
    const handleDelete = (productId, sellerId) => {
        if (!currentUser || currentUser.uid !== sellerId) {
            alert("You are not authorized to delete this product.");
            return;
        }
        if (isDeleting) return;

        setIsDeleting(true);
        try {
            setProducts(prevProducts => prevProducts.filter(p => p.id !== productId));
            alert("Product deleted successfully (locally)!");
        } catch (error) {
            console.error("Error deleting product: ", error);
            alert("Error deleting product. Please try again.");
        } finally {
            setIsDeleting(false);
        }
    };

    // Remove selected image and revoke preview URL
    const removeImage = () => {
        if (imagePreview) {
            URL.revokeObjectURL(imagePreview);
        }
        setImageFile(null);
        setImagePreview(null);
    };

    // Submit form to create a new product listing - now adds to local state
    const handleSubmit = (e) => {
        e.preventDefault();

        if (!currentUser) {
            alert("Please log in to list an item.");
            return;
        }

        if (!productName.trim() || !productDescription.trim() || !productPrice.trim()) {
            alert("Please fill all required fields.");
            return;
        }

        const priceNum = parseFloat(productPrice);
        if (isNaN(priceNum) || priceNum <= 0) {
            alert("Please enter a valid initial price.");
            return;
        }

        setIsListing(true);

        let imageUrlToStore = null;
        if (imageFile) {
            const reader = new FileReader();
            reader.readAsDataURL(imageFile);

            // Use a Promise to wait for FileReader to complete
            reader.onloadend = () => {
                imageUrlToStore = reader.result; // This is the Base64 string
                // Basic size check for Base64 (simulated as we don't have Firestore limits now)
                if (imageUrlToStore && imageUrlToStore.length > 950 * 1024) {
                    alert("Image is too large! Please select a smaller image. (Max ~700KB original file size)");
                    setIsListing(false);
                    return; // Prevent listing if image is too large
                }

                // Add to local products state
                const newProduct = {
                    id: `local_prod_${Date.now()}`, // Simple unique ID
                    name: productName,
                    description: productDescription,
                    imageUrl: imageUrlToStore,
                    sellerId: currentUser.uid,
                    sellerName: currentUser.displayName || currentUser.email || "Anonymous Seller",
                    initialPrice: priceNum,
                    mockEndTime: Date.now() + 24 * 60 * 60 * 1000, // Auction lasts 24 hours from now
                    status: 'active',
                    createdAt: Date.now()
                };
                setProducts(prevProducts => [newProduct, ...prevProducts]); // Add new product to the top

                // Reset form
                setProductName("");
                setProductDescription("");
                setProductPrice("");
                removeImage();
                alert("Product listed successfully (locally)!");
                setIsListing(false);
            };
            reader.onerror = (error) => {
                console.error("Error reading file:", error);
                alert("Error reading image file.");
                setIsListing(false);
            };
        } else {
             // If no image, add to local products state immediately
             const newProduct = {
                id: `local_prod_${Date.now()}`,
                name: productName,
                description: productDescription,
                imageUrl: null,
                sellerId: currentUser.uid,
                sellerName: currentUser.displayName || currentUser.email || "Anonymous Seller",
                initialPrice: priceNum,
                mockEndTime: Date.now() + 24 * 60 * 60 * 1000,
                status: 'active',
                createdAt: Date.now()
            };
            setProducts(prevProducts => [newProduct, ...prevProducts]);

            setProductName("");
            setProductDescription("");
            setProductPrice("");
            removeImage();
            alert("Product listed successfully (locally)!");
            setIsListing(false);
        }
    };

    // --- Favorites Logic ---
    const handleToggleFavorite = (productId) => {
        if (!currentUser) {
            alert("Please log in to add to favorites.");
            return;
        }
        setFavoriteProducts(prevFavorites => {
            const newFavorites = new Set(prevFavorites);
            if (newFavorites.has(productId)) {
                newFavorites.delete(productId);
            } else {
                newFavorites.add(productId);
            }
            return newFavorites;
        });
    };

    // --- Cart Logic ---
    const handleAddToCart = (product) => {
        if (!currentUser) {
            alert("Please log in to add items to your cart.");
            return;
        }
        if (product.sellerId === currentUser.uid) {
            alert("You cannot add your own item to the cart.");
            return;
        }

        setCartItems(prevCart => {
            const existingItem = prevCart.find(item => item.productId === product.id);
            if (existingItem) {
                return prevCart.map(item =>
                    item.productId === product.id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            } else {
                return [...prevCart, {
                    productId: product.id,
                    name: product.name,
                    price: product.initialPrice,
                    imageUrl: product.imageUrl,
                    quantity: 1
                }];
            }
        });
        alert(`${product.name} added to cart!`);
    };

    const handleChangeQuantity = (productId, delta) => {
        setCartItems(prevCart => {
            return prevCart.map(item =>
                item.productId === productId
                    ? { ...item, quantity: Math.max(1, item.quantity + delta) }
                    : item
            );
        });
    };

    const handleRemoveFromCart = (productId) => {
        setCartItems(prevCart => prevCart.filter(item => item.productId !== productId));
    };

    const calculateCartTotal = () => {
        return cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
    };

    // Format timestamp (now just plain number for mock data)
    const formatDate = (timestamp) => {
        if (!timestamp) return "";
        const date = new Date(timestamp);
        return date.toLocaleDateString() + " " + date.toLocaleTimeString();
    };

    // Helper for auction end time and status display
    const getAuctionStatus = (mockEndTime, status) => {
        if (status === 'expired') return "Expired";
        if (!mockEndTime) return "";

        const remainingMs = mockEndTime - Date.now();
        if (remainingMs <= 0) {
            return "Expired";
        }
        const days = Math.floor(remainingMs / (1000 * 60 * 60 * 24));
        const hours = Math.floor((remainingMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((remainingMs % (1000 * 60)) / 1000);

        let parts = [];
        if (days > 0) parts.push(`${days}d`);
        if (hours > 0) parts.push(`${hours}h`);
        if (minutes > 0) parts.push(`${minutes}m`);
        if (seconds > 0) parts.push(`${seconds}s`);

        return parts.length > 0 ? `Ends in: ${parts.join(' ')}` : "Ending soon...";
    };

    return (
        <div className="max-w-md mx-auto p-4 bg-gray-100 min-h-screen">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-center mb-6 text-indigo-700">Client-Side Marketplace</h1>

                {/* Authentication Section (Simulated) */}
                <div className="bg-white p-4 rounded-lg shadow-md mb-6 text-center">
                    {currentUser ? (
                        <div>
                            <p className="mb-2 text-gray-700">Logged in as: <span className="font-semibold">{currentUser.displayName || currentUser.email}</span></p>
                            <button
                                onClick={handleSignOut}
                                className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition duration-200"
                            >
                                Log Out (Simulated)
                            </button>
                        </div>
                    ) : (
                        <div>
                            <p className="mb-2 text-gray-700">Please log in to list items, favorite, or shop.</p>
                            <button
                                onClick={handleSignIn}
                                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition duration-200 flex items-center justify-center mx-auto"
                            >
                                Sign In (Simulated)
                            </button>
                        </div>
                    )}
                </div>

                {/* Create Product Listing Form */}
                {currentUser && (
                    <div className="bg-white p-4 rounded-lg shadow-md mb-6">
                        <h2 className="text-xl font-semibold mb-4 text-indigo-600">List a New Item</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <input
                                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                type="text"
                                placeholder="Item Name"
                                value={productName}
                                onChange={(e) => setProductName(e.target.value)}
                            />

                            <textarea
                                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                rows="3"
                                placeholder="Item Description..."
                                value={productDescription}
                                onChange={(e) => setProductDescription(e.target.value)}
                            />

                            <input
                                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                type="number"
                                step="0.01"
                                placeholder="Starting Price ($)"
                                value={productPrice}
                                onChange={(e) => setProductPrice(e.target.value)}
                            />

                            {/* Image Preview and Removal */}
                            {imagePreview && (
                                <div className="relative">
                                    <img
                                        src={imagePreview}
                                        alt="Product Preview"
                                        className="w-full h-48 object-cover rounded-md border border-gray-200"
                                    />
                                    <button
                                        type="button"
                                        onClick={removeImage}
                                        className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full flex items-center justify-center w-6 h-6 text-sm hover:bg-red-600 transition duration-200"
                                    >
                                        ✕
                                    </button>
                                </div>
                            )}

                            <div className="flex items-center justify-between">
                                <label className="cursor-pointer text-indigo-500 hover:text-indigo-700 flex items-center justify-center w-10 h-10 text-2xl bg-gray-200 rounded-full hover:bg-gray-300 transition duration-200">
                                    📷
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={handleImageChange}
                                    />
                                </label>
                                <button
                                    type="submit"
                                    disabled={isListing}
                                    className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 disabled:bg-indigo-300 transition duration-200"
                                >
                                    {isListing ? "Listing..." : "List Item"}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Shopping Cart Section */}
                {currentUser && (
                    <div className="bg-white p-4 rounded-lg shadow-md mb-6">
                        <h2 className="text-xl font-semibold mb-4 text-green-600">Your Cart ({cartItems.length} items)</h2>
                        {cartItems.length === 0 ? (
                            <p className="text-gray-500">Your cart is empty.</p>
                        ) : (
                            <div>
                                {cartItems.map(item => (
                                    <div key={item.productId} className="flex items-center justify-between border-b border-gray-200 py-2 last:border-b-0">
                                        <div className="flex items-center space-x-3">
                                            {item.imageUrl && (
                                                <img src={item.imageUrl} alt={item.name} className="w-12 h-12 object-cover rounded" />
                                            )}
                                            <div>
                                                <p className="font-semibold text-gray-800">{item.name}</p>
                                                <p className="text-sm text-gray-600">${item.price.toFixed(2)} each</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <button
                                                onClick={() => handleChangeQuantity(item.productId, -1)}
                                                className="bg-gray-200 text-gray-700 w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-300"
                                            >
                                                -
                                            </button>
                                            <span className="font-semibold">{item.quantity}</span>
                                            <button
                                                onClick={() => handleChangeQuantity(item.productId, 1)}
                                                className="bg-gray-200 text-gray-700 w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-300"
                                            >
                                                +
                                            </button>
                                            <button
                                                onClick={() => handleRemoveFromCart(item.productId)}
                                                className="text-red-500 hover:text-red-700 ml-2"
                                                title="Remove from cart"
                                            >
                                                🗑️
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                <div className="mt-4 pt-4 border-t border-gray-300 flex justify-between items-center font-bold text-lg">
                                    <span>Total:</span>
                                    <span className="text-green-700">${calculateCartTotal().toFixed(2)}</span>
                                </div>
                                <button className="mt-4 w-full bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition duration-200">
                                    Proceed to Checkout (Simulated)
                                </button>
                            </div>
                        )}
                    </div>
                )}


                {/* Products Feed */}
                <div className="space-y-6">
                    {products && products.length > 0 ? (
                        products.map((product) => (
                            <div key={product.id} className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-800">{product.name}</h3>
                                        <p className="text-sm text-gray-600">Listed by: {product.sellerName}</p>
                                    </div>
                                    <div className="text-xs text-gray-500 text-right">
                                        <p>{formatDate(product.createdAt)}</p>
                                        <p className={`font-semibold ${product.status === 'active' ? 'text-green-600' : 'text-red-600'}`}>
                                            {getAuctionStatus(product.mockEndTime, product.status)}
                                        </p>
                                    </div>
                                </div>

                                {product.description && <p className="mb-3 text-gray-700">{product.description}</p>}

                                {/* Image Display */}
                                {product.imageUrl && (
                                    <img
                                        src={product.imageUrl}
                                        alt={product.name}
                                        className="w-full h-64 object-cover rounded-md mb-3 border border-gray-300"
                                    />
                                )}

                                <div className="flex items-center justify-between mb-3 text-lg font-semibold">
                                    <div>
                                        Price: <span className="text-green-700">${product.initialPrice.toFixed(2)}</span>
                                    </div>
                                    {currentUser && (
                                        <button
                                            onClick={() => handleToggleFavorite(product.id)}
                                            className={`text-2xl ${favoriteProducts.has(product.id) ? 'text-red-500' : 'text-gray-400'} hover:text-red-600 transition-colors duration-200`}
                                            title={favoriteProducts.has(product.id) ? "Remove from favorites" : "Add to favorites"}
                                        >
                                            ❤
                                        </button>
                                    )}
                                </div>

                                {/* Add to Cart button for active products */}
                                {product.status === 'active' && product.mockEndTime > Date.now() && (
                                    <div className="mt-2">
                                        <button
                                            onClick={() => handleAddToCart(product)}
                                            disabled={!currentUser || currentUser.uid === product.sellerId}
                                            className="w-full bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 disabled:bg-blue-300 transition duration-200"
                                        >
                                            Add to Cart
                                        </button>
                                    </div>
                                )}
                                {/* Display if product is expired */}
                                {product.status === 'expired' || product.mockEndTime <= Date.now() ? (
                                    <div className="mt-2 text-center text-red-600 font-semibold">
                                        Item Not Available
                                    </div>
                                ) : null}


                                {/* Seller-specific actions */}
                                {currentUser && currentUser.uid === product.sellerId && (
                                    <div className="mt-4 border-t pt-3 flex justify-end">
                                        <button
                                            onClick={() => handleDelete(product.id, product.sellerId)}
                                            disabled={isDeleting}
                                            className="text-red-500 hover:text-red-700 flex items-center space-x-1"
                                            title="Delete product"
                                        >
                                            🗑️ Delete My Listing (Local)
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))
                    ) : (
                        <div className="text-center text-gray-500 p-4 bg-white rounded-lg shadow-md">
                            No items listed yet. Be the first to list something!
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}