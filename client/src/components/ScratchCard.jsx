import { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const ScratchCard = ({ width, height, coverColor = '#cbd5e1', onReveal, children }) => {
    const canvasRef = useRef(null);
    const [isRevealed, setIsRevealed] = useState(false);
    const [isScratching, setIsScratching] = useState(false);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        // Setup Canvas
        canvas.width = width;
        canvas.height = height;

        // Fill with cover color
        ctx.fillStyle = coverColor;
        ctx.fillRect(0, 0, width, height);

        // Add "Scratch Here" text
        ctx.fillStyle = '#64748b'; // Slate-500
        ctx.font = 'bold 20px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('SCRATCH HERE', width / 2, height / 2);

    }, [width, height, coverColor]);

    const scratch = (x, y) => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        ctx.globalCompositeOperation = 'destination-out';
        ctx.beginPath();
        ctx.arc(x, y, 20, 0, 2 * Math.PI);
        ctx.fill();

        checkReveal();
    };

    const handleMouseMove = (e) => {
        if (!isScratching) return;
        const rect = canvasRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        scratch(x, y);
    };

    const handleTouchMove = (e) => {
        if (!isScratching) return;
        const rect = canvasRef.current.getBoundingClientRect();
        const touch = e.touches[0];
        const x = touch.clientX - rect.left;
        const y = touch.clientY - rect.top;
        scratch(x, y);
    };

    const checkReveal = () => {
        if (isRevealed) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const imageData = ctx.getImageData(0, 0, width, height);
        const pixels = imageData.data;
        let transparentPixels = 0;

        for (let i = 3; i < pixels.length; i += 4) {
            if (pixels[i] === 0) {
                transparentPixels++;
            }
        }

        const percentage = (transparentPixels / (width * height)) * 100;

        if (percentage > 40) { // Reveal if 40% scratched
            setIsRevealed(true);
            if (onReveal) onReveal();
        }
    };

    return (
        <div className="relative overflow-hidden rounded-xl select-none" style={{ width, height }}>
            {/* Underlying Content (Reward) */}
            <div className="absolute inset-0 flex items-center justify-center bg-white dark:bg-slate-800 z-0">
                {children}
            </div>

            {/* Scratch Layer */}
            {!isRevealed && (
                <canvas
                    ref={canvasRef}
                    className="absolute inset-0 z-10 cursor-alias touch-none"
                    onMouseDown={() => setIsScratching(true)}
                    onMouseUp={() => setIsScratching(false)}
                    onMouseLeave={() => setIsScratching(false)}
                    onMouseMove={handleMouseMove}
                    onTouchStart={() => setIsScratching(true)}
                    onTouchEnd={() => setIsScratching(false)}
                    onTouchMove={handleTouchMove}
                />
            )}

            {/* Fade out animation mimic */}
            {isRevealed && (
                <motion.div
                    initial={{ opacity: 1 }}
                    animate={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                    className="absolute inset-0 bg-slate-200 pointer-events-none"
                />
            )}
        </div>
    );
};

export default ScratchCard;
