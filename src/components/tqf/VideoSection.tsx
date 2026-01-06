'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface VideoPlaceholderProps {
  index: number;
  title: string;
}

const VideoPlaceholder: React.FC<VideoPlaceholderProps> = ({ index, title }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6, delay: 0.2 + index * 0.15, ease: 'easeOut' }}
    className="flex flex-col items-center"
  >
    <div
      className="relative w-72 h-44 rounded-lg overflow-hidden group cursor-pointer"
      style={{
        background: 'var(--au-dark-bg)',
        border: '1px solid var(--au-border-soft)',
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(0, 0, 0, 0.08)',
      }}
    >
      {/* Play button overlay */}
      <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/40 transition-colors duration-200">
        <motion.div
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className="w-14 h-14 rounded-full flex items-center justify-center"
          style={{
            background: 'rgba(254, 20, 20, 0.9)',
            boxShadow: '0 4px 16px rgba(254, 20, 20, 0.4)',
          }}
        >
          <svg
            className="w-6 h-6 text-white ml-1"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M8 5v14l11-7z" />
          </svg>
        </motion.div>
      </div>

      {/* Video number indicator */}
      <div 
        className="absolute top-3 left-3 px-2 py-1 rounded text-xs font-medium"
        style={{
          background: 'rgba(0, 0, 0, 0.6)',
          color: 'white',
        }}
      >
        Video {index + 1}
      </div>

      {/* Duration placeholder */}
      <div 
        className="absolute bottom-3 right-3 px-2 py-1 rounded text-xs font-medium"
        style={{
          background: 'rgba(0, 0, 0, 0.6)',
          color: 'white',
        }}
      >
        0:00
      </div>
    </div>
    
    {/* Video title */}
    <p 
      className="mt-3 text-sm font-medium"
      style={{ color: 'var(--au-text-main)' }}
    >
      {title}
    </p>
  </motion.div>
);

const VideoSection: React.FC = () => {
  const videos = [
    { title: 'Getting Started' },
    { title: 'Upload & Extract' },
    { title: 'Generate Study Plan' },
  ];

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6, delay: 0.1 }}
      className="py-16"
      style={{ background: 'var(--au-light-bg)' }}
    >
      <div className="max-w-6xl mx-auto px-4">
        {/* Section Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 
            className="text-2xl font-bold mb-3"
            style={{ color: 'var(--au-text-main)' }}
          >
            How It Works
          </h2>
          <div 
            className="w-16 h-1 mx-auto rounded"
            style={{ background: 'var(--au-red)' }}
          />
          <p 
            className="mt-4 text-sm"
            style={{ color: 'var(--au-text-muted)' }}
          >
            Watch our quick tutorials to get started
          </p>
        </motion.div>

        {/* Video Grid */}
        <div className="flex flex-wrap justify-center gap-8">
          {videos.map((video, index) => (
            <VideoPlaceholder
              key={index}
              index={index}
              title={video.title}
            />
          ))}
        </div>
      </div>
    </motion.section>
  );
};

export default VideoSection;
