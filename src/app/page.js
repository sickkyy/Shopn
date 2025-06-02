'use client'
import React, { useState, useEffect, useRef } from 'react';
import { collection, addDoc, Timestamp, orderBy, query, deleteDoc, doc, updateDoc, onSnapshot } from "firebase/firestore";
import { db } from "./firebase-config";
import { getAuth, onAuthStateChanged, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";

export default function Home() {
    const [products, setProducts] = useState(null);
    const [productDescription, setProductDescription] = useState("");
    const [productName, setProductName] = useState("");
    const [productPrice, setProductPrice] = useState("");
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [isListing, setIsListing] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);

    // New states for Favorites and Cart
    const [favoriteProducts, setFavoriteProducts] = useState(new Set()); // Store product IDs
    const [cartItems, setCartItems] = useState([]); // [{ productId, quantity, name, price, imageUrl }]

    const auth = getAuth();
    const auctionTimersRef = useRef({}); // To manage timeouts for auction ending

    useEffect(() => {
        const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
            setCurrentUser(user);
        });

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

        const q = query(collection(db, "products"), orderBy("createdAt", "desc"));
        const unsubscribeSnapshot = onSnapshot(q, (querySnapshot) => {
            let productsArray = [];
            querySnapshot.forEach((doc) => {
                productsArray.push({ id: doc.id, ...doc.data() });
            });
            setProducts(productsArray);

            // Clear any existing timers before setting new ones
            Object.values(auctionTimersRef.current).forEach(clearTimeout);
            auctionTimersRef.current = {};

            // Set timers for auctions to end (client-side simulation)
            productsArray.forEach(product => {
                if (product.status === 'active' && product.auctionEndTime) {
                    const timeLeft = product.auctionEndTime.toMillis() - Date.now();

                    if (timeLeft > 0) {
                        auctionTimersRef.current[product.id] = setTimeout(() => {
                            markAuctionAsEnded(product.id);
                        }, timeLeft);
                    } else {
                        if (product.status === 'active') {
                            markAuctionAsEnded(product.id);
                        }
                    }
                }
            });
        }, (error) => {
            console.error("Error loading products (real-time): ", error);
        });

        return () => {
            unsubscribeAuth();
            unsubscribeSnapshot();
            Object.values(auctionTimersRef.current).forEach(clearTimeout);
        };
    }, [currentUser]); // Re-run effect if currentUser changes to load user-specific data from localStorage

    // Effect to save favorites to localStorage whenever it changes
    useEffect(() => {
        localStorage.setItem('favoriteProducts', JSON.stringify(Array.from(favoriteProducts)));
    }, [favoriteProducts]);

    // Effect to save cart items to localStorage whenever it changes
    useEffect(() => {
        localStorage.setItem('cartItems', JSON.stringify(cartItems));
    }, [cartItems]);

    // --- Auction Ending Logic (Client-Side Simulation) ---
    const markAuctionAsEnded = async (productId) => {
        try {
            const productRef = doc(db, 'products', productId);
            await updateDoc(productRef, {
                status: 'expired',
                auctionEndTime: Timestamp.now(), // Update the end time to now to reflect it's past
            });
            console.log(`Auction for product ${productId} has ended.`);
        } catch (error) {
            console.error("Error marking auction as ended:", error);
        }
    };

    // --- Auth Handlers ---
    const handleGoogleSignIn = async () => {
        const provider = new GoogleAuthProvider();
        try {
            await signInWithPopup(auth, provider);
        } catch (error) {
            console.error("Error signing in with Google: ", error);
            alert("Error signing in. Please try again.");
        }
    };

    const handleSignOut = async () => {
        try {
            await signOut(auth);
            // Clear user-specific local storage data on sign out
            localStorage.removeItem('favoriteProducts');
            localStorage.removeItem('cartItems');
            setFavoriteProducts(new Set());
            setCartItems([]);
        } catch (error) {
            console.error("Error signing out: ", error);
            alert("Error signing out. Please try again.");
        }
    };
    // --- End Auth Handlers ---

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

    // Handle product deletion (only if current user is seller)
    const handleDelete = async (productId, sellerId) => {
        if (!currentUser || currentUser.uid !== sellerId) {
            alert("You are not authorized to delete this product.");
            return;
        }
        if (isDeleting) return;

        setIsDeleting(true);
        try {
            await deleteDoc(doc(db, 'products', productId));
            // Real-time listener will update `products` state automatically
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

    // Submit form to create a new product listing
    const handleSubmit = async (e) => {
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

            await new Promise((resolve) => {
                reader.onloadend = () => {
                    imageUrlToStore = reader.result;
                    resolve();
                };
                reader.onerror = (error) => {
                    console.error("Error reading file:", error);
                    alert("Error reading image file.");
                    setIsListing(false);
                    resolve();
                };
            });

            if (imageUrlToStore && imageUrlToStore.length > 950 * 1024) {
                alert("Image is too large! Please select a smaller image. (Max ~700KB original file size)");
                setIsListing(false);
                return;
            }
        }

        try {
            await addDoc(collection(db, 'products'), {
                name: productName,
                description: productDescription,
                imageUrl: imageUrlToStore,
                sellerId: currentUser.uid,
                sellerName: currentUser.displayName || currentUser.email || "Anonymous Seller",
                initialPrice: priceNum,
                auctionEndTime: Timestamp.fromMillis(Date.now() + 24 * 60 * 60 * 1000), // Auction lasts 24 hours
                status: 'active',
                createdAt: Timestamp.now()
            });

            setProductName("");
            setProductDescription("");
            setProductPrice("");
            removeImage();
            alert("Product listed successfully!");

        } catch (error) {
            console.error("Error adding product: ", error);
            alert("Error listing product. Please try again. (Check console for size limits)");
        } finally {
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
                    ? { ...item, quantity: Math.max(1, item.quantity + delta) } // Ensure quantity is at least 1
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

    // Format timestamp to readable date
    const formatDate = (timestamp) => {
        if (!timestamp) return "";
        const date = timestamp.toDate();
        return date.toLocaleDateString() + " " + date.toLocaleTimeString();
    };

    // Helper for auction end time and status display
    const getAuctionStatus = (auctionEndTime, status) => {
        if (status === 'expired') return "Expired";
        if (!auctionEndTime) return "";

        const remainingMs = auctionEndTime.toMillis() - Date.now();
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
                <h1 className="text-3xl font-bold text-center mb-6 text-indigo-700">Shopn</h1>

                {/* Authentication Section */}
                <div className="bg-white p-4 rounded-lg shadow-md mb-6 text-center">
                    {currentUser ? (
                        <div>
                            <p className="mb-2 text-gray-700">Logged in as: <span className="font-semibold">{currentUser.displayName || currentUser.email}</span></p>
                            <button
                                onClick={handleSignOut}
                                className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition duration-200"
                            >
                                Log Out
                            </button>
                        </div>
                    ) : (
                        <div>
                            <p className="mb-2 text-gray-700">Please log in to list items, favorite, or shop.</p>
                            <button
                                onClick={handleGoogleSignIn}
                                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition duration-200 flex items-center justify-center mx-auto"
                            >
                                <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Google_%22G%22_logo.svg/2048px-Google_%22G%22_logo.svg.png" alt="Google" className="w-5 h-5 mr-2" />
                                Sign In with Google
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
                                    Proceed to Checkout
                                </button>
                            </div>
                        )}
                    </div>
                )}


                {/* Products Feed */}
                <div className="space-y-6">
                    {products ? (
                        products.length > 0 ? (
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
                                                {getAuctionStatus(product.auctionEndTime, product.status)}
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
                                    {product.status === 'active' && product.auctionEndTime.toMillis() > Date.now() && (
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

                                    {/* Seller-specific actions */}
                                    {currentUser && currentUser.uid === product.sellerId && (
                                        <div className="mt-4 border-t pt-3 flex justify-end">
                                            <button
                                                onClick={() => handleDelete(product.id, product.sellerId)}
                                                disabled={isDeleting}
                                                className="text-red-500 hover:text-red-700 flex items-center space-x-1"
                                                title="Delete product"
                                            >
                                                🗑️ Delete My Listing
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))
                        ) : (
                            <div className="text-center text-gray-500 p-4 bg-white rounded-lg shadow-md">
                                No items listed yet. Be the first to list something!
                            </div>
                        ) 
                    ) : (
                        <div className="text-center text-gray-500 p-4 bg-white rounded-lg shadow-md">
                            Loading items...
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}