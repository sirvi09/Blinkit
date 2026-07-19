import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';

const LoginPopup = () => {
    const user = useSelector(state => state.user);
    const [show, setShow] = useState(false);

    useEffect(() => {
        // Delay the popup so it doesn't appear immediately before auth is checked
        if (!user._id) {
            const timer = setTimeout(() => {
                setShow(true);
            }, 3000); // Popup appears after 3 seconds for unlogged users
            return () => clearTimeout(timer);
        } else {
            setShow(false);
        }
    }, [user._id]);

    if (!show) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg p-6 max-w-sm w-full shadow-lg relative">
                <button 
                    onClick={() => setShow(false)} 
                    className="absolute top-2 right-4 text-gray-500 hover:text-black font-bold text-2xl"
                    aria-label="Close"
                >
                    &times;
                </button>
                <h2 className="text-2xl font-bold text-center mb-4 text-green-700">Welcome to Winkit!</h2>
                <p className="text-center mb-6 text-gray-600">Please log in or register to get the best experience, access your cart, and track orders.</p>
                <div className="flex flex-col gap-3">
                    <Link 
                        to="/login" 
                        onClick={() => setShow(false)}
                        className="bg-green-700 text-white text-center py-2 rounded hover:bg-green-800 transition font-semibold"
                    >
                        Login
                    </Link>
                    <Link 
                        to="/register" 
                        onClick={() => setShow(false)}
                        className="bg-blue-50 text-green-700 text-center py-2 rounded border border-green-700 hover:bg-blue-100 transition font-semibold"
                    >
                        Register
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default LoginPopup;
