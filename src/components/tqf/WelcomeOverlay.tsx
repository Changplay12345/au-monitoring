'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface WelcomeOverlayProps {
  isVisible: boolean;
  onGetStarted: () => void;
}

// Vertical banner with wind animation
const VerticalBanner = ({ 
  height, 
  delay, 
  position 
}: { 
  height: number; 
  delay: number; 
  position: 'left' | 'right';
}) => {
  const isLeft = position === 'left';
  
  return (
    <motion.div
      initial={{ y: -150, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, delay, ease: 'easeOut' }}
      className="relative"
      style={{
        width: '14px',
        height: `${height}px`,
        transformOrigin: 'top center',
      }}
    >
      {/* Main banner body with wave animation - includes the tip */}
      <motion.div
        animate={{
          skewX: isLeft ? [0, 2, -1, 1.5, -0.5, 0] : [0, -2, 1, -1.5, 0.5, 0],
          scaleX: [1, 1.02, 0.98, 1.01, 0.99, 1],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: 'easeInOut',
          times: [0, 0.2, 0.4, 0.6, 0.8, 1],
        }}
        className="absolute inset-0"
        style={{
          transformOrigin: 'top center',
        }}
      >
        {/* Banner body */}
        <div
          className="absolute inset-0 rounded-b-none overflow-hidden"
          style={{
            background: `linear-gradient(180deg, var(--au-red) 0%, var(--au-red-dark) 100%)`,
            boxShadow: isLeft 
              ? '2px 2px 8px rgba(254, 20, 20, 0.4)' 
              : '-2px 2px 8px rgba(254, 20, 20, 0.4)',
          }}
        >
          {/* Fabric texture/highlight */}
          <motion.div
            animate={{
              opacity: [0.1, 0.25, 0.1, 0.2, 0.1],
              x: isLeft ? [0, 2, -1, 1, 0] : [0, -2, 1, -1, 0],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="absolute inset-0"
            style={{
              background: `linear-gradient(${isLeft ? '90deg' : '270deg'}, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%)`,
            }}
          />
          
          {/* Vertical fold lines for fabric effect */}
          <div 
            className="absolute top-0 bottom-0 w-px opacity-20"
            style={{ 
              left: '30%', 
              background: 'linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.3) 50%, transparent 100%)' 
            }}
          />
          <div 
            className="absolute top-0 bottom-0 w-px opacity-20"
            style={{ 
              left: '70%', 
              background: 'linear-gradient(180deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%)' 
            }}
          />
        </div>
        
        {/* Bottom tip - now inside the animated container so it moves with body */}
        <div
          className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0"
          style={{
            borderLeft: '7px solid transparent',
            borderRight: '7px solid transparent',
            borderTop: '10px solid var(--au-red-dark)',
          }}
        />
      </motion.div>
    </motion.div>
  );
};

// Corner ribbons component - vertical banners
const CornerRibbons = ({ position }: { position: 'left' | 'right' }) => {
  const isLeft = position === 'left';
  const baseDelay = isLeft ? 0.2 : 0.4;
  
  return (
    <div 
      className={`absolute top-0 ${isLeft ? 'left-4' : 'right-4'} flex ${isLeft ? 'flex-row' : 'flex-row-reverse'} gap-2 pt-0`}
    >
      <VerticalBanner height={140} delay={baseDelay} position={position} />
      <VerticalBanner height={110} delay={baseDelay + 0.1} position={position} />
      <VerticalBanner height={80} delay={baseDelay + 0.2} position={position} />
    </div>
  );
};

// Mist/vignette effect
const MistVignette = () => (
  <>
    {/* Top mist */}
    <div 
      className="absolute top-0 left-0 right-0 h-48 pointer-events-none"
      style={{
        background: 'linear-gradient(to bottom, rgba(59, 59, 59, 0.4) 0%, transparent 100%)',
      }}
    />
    {/* Bottom mist */}
    <div 
      className="absolute bottom-0 left-0 right-0 h-48 pointer-events-none"
      style={{
        background: 'linear-gradient(to top, rgba(59, 59, 59, 0.4) 0%, transparent 100%)',
      }}
    />
    {/* Left mist */}
    <div 
      className="absolute top-0 bottom-0 left-0 w-48 pointer-events-none"
      style={{
        background: 'linear-gradient(to right, rgba(59, 59, 59, 0.3) 0%, transparent 100%)',
      }}
    />
    {/* Right mist */}
    <div 
      className="absolute top-0 bottom-0 right-0 w-48 pointer-events-none"
      style={{
        background: 'linear-gradient(to left, rgba(59, 59, 59, 0.3) 0%, transparent 100%)',
      }}
    />
    {/* Corner vignettes for extra depth */}
    <div 
      className="absolute top-0 left-0 w-64 h-64 pointer-events-none"
      style={{
        background: 'radial-gradient(ellipse at top left, rgba(59, 59, 59, 0.5) 0%, transparent 70%)',
      }}
    />
    <div 
      className="absolute top-0 right-0 w-64 h-64 pointer-events-none"
      style={{
        background: 'radial-gradient(ellipse at top right, rgba(59, 59, 59, 0.5) 0%, transparent 70%)',
      }}
    />
    <div 
      className="absolute bottom-0 left-0 w-64 h-64 pointer-events-none"
      style={{
        background: 'radial-gradient(ellipse at bottom left, rgba(59, 59, 59, 0.4) 0%, transparent 70%)',
      }}
    />
    <div 
      className="absolute bottom-0 right-0 w-64 h-64 pointer-events-none"
      style={{
        background: 'radial-gradient(ellipse at bottom right, rgba(59, 59, 59, 0.4) 0%, transparent 70%)',
      }}
    />
  </>
);

// Animated particles/steam effect - fixed sizes to avoid hydration mismatch
const steamParticleConfigs = [
  { x: 10, size: 45 },
  { x: 22, size: 55 },
  { x: 34, size: 48 },
  { x: 46, size: 60 },
  { x: 58, size: 52 },
  { x: 70, size: 58 },
  { x: 82, size: 50 },
  { x: 94, size: 65 },
];

const SteamParticle = ({ delay, x, size }: { delay: number; x: number; size: number }) => (
  <motion.div
    className="absolute rounded-full pointer-events-none"
    style={{
      left: `${x}%`,
      bottom: '-20px',
      width: size,
      height: size,
      background: 'rgba(255, 255, 255, 0.03)',
      filter: 'blur(8px)',
    }}
    initial={{ y: 0, opacity: 0 }}
    animate={{ 
      y: -400, 
      opacity: [0, 0.5, 0],
    }}
    transition={{
      duration: 8,
      delay,
      repeat: Infinity,
      ease: 'linear',
    }}
  />
);

const WelcomeOverlay: React.FC<WelcomeOverlayProps> = ({ isVisible, onGetStarted }) => {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: 'easeInOut' }}
        >
          {/* Blurred glassmorphism background */}
          <motion.div
            className="absolute inset-0"
            style={{
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              backgroundColor: 'rgba(244, 244, 244, 0.7)',
            }}
            exit={{ backdropFilter: 'blur(0px)', backgroundColor: 'rgba(244, 244, 244, 0)' }}
            transition={{ duration: 0.8 }}
          />

          {/* Mist/vignette effect */}
          <MistVignette />

          {/* Steam particles */}
          {steamParticleConfigs.map((config, i) => (
            <SteamParticle 
              key={i} 
              delay={i * 1.2} 
              x={config.x} 
              size={config.size}
            />
          ))}

          {/* Corner Ribbons - Top Left */}
          <CornerRibbons position="left" />
          
          {/* Corner Ribbons - Top Right */}
          <CornerRibbons position="right" />

          {/* Center Content */}
          <div className="relative z-10 flex flex-col items-center text-center px-4">
            {/* Welcome Text */}
            <motion.p
              initial={{ y: -60, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.3, ease: 'easeOut' }}
              className="text-xl font-medium tracking-wide"
              style={{ 
                color: 'var(--au-text-muted)',
                fontFamily: '"Inter", "SF Pro Text", system-ui, sans-serif',
              }}
            >
              Welcome to
            </motion.p>

            {/* TQF Master 2.0 */}
            <motion.h1
              initial={{ y: -60, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.5, ease: 'easeOut' }}
              className="text-6xl md:text-7xl font-bold mt-2 mb-8"
              style={{ 
                color: 'var(--au-text-main)',
                fontFamily: '"Inter", "SF Pro Text", system-ui, sans-serif',
                letterSpacing: '-0.02em',
              }}
            >
              TQF Master 2.0
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ y: -40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.7, ease: 'easeOut' }}
              className="text-lg mb-10"
              style={{ 
                color: 'var(--au-text-muted)',
                fontFamily: '"Inter", "SF Pro Text", system-ui, sans-serif',
              }}
            >
              Study Plan Extractor
            </motion.p>

            {/* Get Started Button */}
            <motion.button
              initial={{ y: -30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.9, ease: 'easeOut' }}
              whileHover={{ scale: 1.05, boxShadow: '0 12px 30px rgba(254, 20, 20, 0.35)' }}
              whileTap={{ scale: 0.98 }}
              onClick={onGetStarted}
              className="px-10 py-4 text-lg font-semibold text-white rounded transition-all duration-200 flex items-center gap-2"
              style={{
                background: 'linear-gradient(135deg, var(--au-red) 0%, var(--au-red-dark) 100%)',
                boxShadow: '0 8px 24px rgba(254, 20, 20, 0.3)',
              }}
            >
              Get Started
              <svg 
                className="w-5 h-5" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M9 5l7 7-7 7" 
                />
              </svg>
            </motion.button>

            {/* Video Players */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.1, ease: 'easeOut' }}
              className="mt-12 flex flex-wrap justify-center gap-6"
            >
              {[
                { title: 'Getting Started', src: '/Get started.mp4' },
                { title: 'Extraction', src: '/Extraction.mp4' },
                { title: 'Study Plan', src: '/Studyplan.mp4' },
              ].map((video, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 1.2 + index * 0.15 }}
                  className="flex flex-col items-center"
                >
                  <div
                    className="relative w-56 h-32 rounded-lg overflow-hidden"
                    style={{
                      background: 'var(--au-dark-bg)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      boxShadow: '0 8px 24px rgba(0, 0, 0, 0.2)',
                    }}
                  >
                    {/* Auto-playing looped video */}
                    <video
                      src={video.src}
                      autoPlay
                      loop
                      muted
                      playsInline
                      className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                      style={{ userSelect: 'none' }}
                    />
                  </div>
                  
                  {/* Video title */}
                  <p className="mt-2 text-xs font-medium" style={{ color: 'var(--au-text-muted)' }}>
                    {video.title}
                  </p>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* Decorative bottom gradient line */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 1, delay: 1.1, ease: 'easeOut' }}
            className="absolute bottom-0 left-0 right-0 h-1"
            style={{
              background: 'linear-gradient(90deg, transparent 0%, var(--au-red) 50%, transparent 100%)',
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default WelcomeOverlay;
