"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ScratchCouponProps {
  couponCode: string;
  discount: string;
  description: string;
  onClose: () => void;
}

export default function ScratchCoupon({
  couponCode,
  discount,
  description,
  onClose,
}: ScratchCouponProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isRevealed, setIsRevealed] = useState(false);
  const [copied, setCopied] = useState(false);
  const isDrawing = useRef(false);
  const scratchedPixels = useRef(0);

  const CANVAS_W = 280;
  const CANVAS_H = 60;
  const REVEAL_THRESHOLD = 0.45;

  const initCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = "#3d3d3d";
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

    // scratch hint text
    ctx.fillStyle = "#aaa";
    ctx.font = "bold 14px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("✨ Scratch here to reveal ✨", CANVAS_W / 2, CANVAS_H / 2);
  }, []);

  useEffect(() => {
    initCanvas();
  }, [initCanvas]);

  const scratch = useCallback(
    (x: number, y: number) => {
      const canvas = canvasRef.current;
      if (!canvas || isRevealed) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.globalCompositeOperation = "destination-out";
      ctx.beginPath();
      ctx.arc(x, y, 18, 0, Math.PI * 2);
      ctx.fill();

      scratchedPixels.current += 1;
      const totalArea = (CANVAS_W * CANVAS_H) / (Math.PI * 18 * 18);
      if (scratchedPixels.current / totalArea > REVEAL_THRESHOLD) {
        setIsRevealed(true);
      }
    },
    [isRevealed]
  );

  const getPos = (
    e: React.MouseEvent | React.TouchEvent
  ): { x: number; y: number } => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const scaleX = CANVAS_W / rect.width;
    const scaleY = CANVAS_H / rect.height;

    if ("touches" in e) {
      return {
        x: (e.touches[0].clientX - rect.left) * scaleX,
        y: (e.touches[0].clientY - rect.top) * scaleY,
      };
    }
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const handleStart = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    isDrawing.current = true;
    const { x, y } = getPos(e);
    scratch(x, y);
  };

  const handleMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing.current) return;
    e.preventDefault();
    const { x, y } = getPos(e);
    scratch(x, y);
  };

  const handleEnd = () => {
    isDrawing.current = false;
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(couponCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 px-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 30 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 relative"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Header */}
          <div className="flex items-center gap-2 mb-5">
            <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-800">
              Exclusive KreditBee Offer
            </h3>
          </div>

          {/* Discount */}
          <motion.p
            initial={{ scale: 0.5 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
            className="text-5xl font-black text-emerald-600 mb-3"
          >
            {discount}
          </motion.p>

          <p className="text-gray-600 text-sm mb-6 leading-relaxed">
            {description}
          </p>

          {/* Coupon label */}
          <p className="text-gray-700 font-medium mb-3">Your discount coupon :</p>

          {/* Scratch area */}
          <div className="relative w-full max-w-[300px] mx-auto rounded-xl overflow-hidden border-2 border-dashed border-gray-200 bg-emerald-50">
            {/* Coupon code underneath */}
            <div className="flex items-center justify-between px-5 py-4">
              <span
                className={`font-mono text-lg font-bold tracking-wider transition-colors duration-300 ${
                  isRevealed ? "text-emerald-700" : "text-emerald-700/30"
                }`}
              >
                {couponCode}
              </span>
              {isRevealed && (
                <motion.button
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  onClick={handleCopy}
                  className="text-gray-500 hover:text-gray-700 transition-colors cursor-pointer"
                  title="Copy code"
                >
                  {copied ? (
                    <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  )}
                </motion.button>
              )}
            </div>

            {/* Canvas overlay */}
            {!isRevealed && (
              <canvas
                ref={canvasRef}
                width={CANVAS_W}
                height={CANVAS_H}
                className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing touch-none"
                onMouseDown={handleStart}
                onMouseMove={handleMove}
                onMouseUp={handleEnd}
                onMouseLeave={handleEnd}
                onTouchStart={handleStart}
                onTouchMove={handleMove}
                onTouchEnd={handleEnd}
              />
            )}
          </div>

          {/* Revealed state */}
          <AnimatePresence>
            {isRevealed && (
              <motion.p
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center text-emerald-600 text-sm font-medium mt-3"
              >
                {copied ? "Copied to clipboard!" : "Tap the copy icon to copy your code"}
              </motion.p>
            )}
          </AnimatePresence>

          {!isRevealed && (
            <p className="text-center text-gray-400 text-xs mt-3">
              Scratch the card above to reveal your coupon
            </p>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
