import React, { useState } from 'react';
import { FaStar, FaRegStar } from "react-icons/fa";

const StarRating = ({ rating, setRating, readonly = false, size = "md" }) => {
    const [hoverRating, setHoverRating] = useState(0);

    const sizes = {
        sm: "text-sm",
        md: "text-xl",
        lg: "text-3xl"
    };

    const handleMouseEnter = (index) => {
        if (!readonly) setHoverRating(index);
    };

    const handleMouseLeave = () => {
        if (!readonly) setHoverRating(0);
    };

    const handleClick = (index) => {
        if (!readonly && setRating) setRating(index);
    };

    return (
        <div className={`flex items-center gap-1 ${sizes[size]}`}>
            {[1, 2, 3, 4, 5].map((index) => (
                <div
                    key={index}
                    className={`cursor-${readonly ? 'default' : 'pointer'} ${
                        (hoverRating || rating) >= index ? "text-yellow-400" : "text-gray-300"
                    }`}
                    onMouseEnter={() => handleMouseEnter(index)}
                    onMouseLeave={handleMouseLeave}
                    onClick={() => handleClick(index)}
                >
                    {(hoverRating || rating) >= index ? <FaStar /> : <FaRegStar />}
                </div>
            ))}
        </div>
    );
};

export default StarRating;
