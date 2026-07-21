import React, { useState, useRef } from 'react';
import { FaCaretRight, FaAngleDoubleRight } from 'react-icons/fa';

const SlideToProceed = ({ totalPrice, onProceed }) => {
    const [sliderPos, setSliderPos] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const containerRef = useRef(null);
    const thumbWidth = 52; // Width of the thumb button

    const handleTouchStart = () => {
        setIsDragging(true);
    };

    const handleTouchMove = (e) => {
        if (!containerRef.current || !isDragging) return;
        const containerRect = containerRef.current.getBoundingClientRect();
        const touch = e.touches[0];
        let newPos = touch.clientX - containerRect.left - (thumbWidth / 2);
        
        if (newPos < 0) newPos = 0;
        if (newPos > containerRect.width - thumbWidth - 8) newPos = containerRect.width - thumbWidth - 8;
        
        setSliderPos(newPos);
    };

    const handleTouchEnd = () => {
        setIsDragging(false);
        if (!containerRef.current) return;
        const containerRect = containerRef.current.getBoundingClientRect();
        
        // If slid more than 75% of the way, trigger proceed
        if (sliderPos > containerRect.width * 0.70) {
            setSliderPos(containerRect.width - thumbWidth - 8); // Snap to end
            setTimeout(() => {
                onProceed();
                setSliderPos(0); // Reset for next time
            }, 300);
        } else {
            setSliderPos(0); // Snap back to start
        }
    };

    return (
        <>
            {/* Desktop View - Just clickable */}
            <div 
                className='hidden lg:flex bg-white/70 backdrop-blur-lg border border-slate-200 hover:bg-slate-50 text-slate-800 px-6 font-bold text-base py-4 rounded-full items-center gap-4 justify-between cursor-pointer transition-colors shadow-sm'
                onClick={onProceed}
            >
                <div className='text-black'>{totalPrice}</div>
                <div className='flex items-center gap-1 text-slate-600'>
                    Proceed <span><FaCaretRight/></span>
                </div>
            </div>

            {/* Mobile View - Slide to proceed - Liquid Glass Theme */}
            <div 
                ref={containerRef}
                className='lg:hidden bg-slate-100/60 backdrop-blur-xl border border-white/60 shadow-[inset_0_2px_10px_rgba(0,0,0,0.05)] rounded-full flex items-center relative overflow-hidden h-16 select-none touch-none px-1'
            >
                {/* Background Text */}
                <div className='absolute w-full flex justify-center z-0'>
                    <span className='text-slate-400 font-medium tracking-wide pl-6'>Slide to Proceed</span>
                </div>
                
                {/* The thumb button */}
                <div 
                    className={`absolute left-1 top-1.5 h-13 w-13 p-3 bg-white/90 backdrop-blur-2xl rounded-full flex items-center justify-center cursor-pointer shadow-[0_4px_15px_rgba(0,0,0,0.1)] border border-white/80 z-20 ${isDragging ? 'transition-none' : 'transition-all duration-300 ease-out'}`}
                    style={{ transform: `translateX(${sliderPos}px)`, width: thumbWidth, height: thumbWidth }}
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                >
                    <FaAngleDoubleRight size={22} className="text-slate-600 drop-shadow-sm" />
                </div>
                
                {/* Total price fixed on the right side */}
                <div className='absolute right-5 z-10 pointer-events-none text-black font-extrabold drop-shadow-sm'>
                    {totalPrice}
                </div>
            </div>
        </>
    );
}

export default SlideToProceed;
