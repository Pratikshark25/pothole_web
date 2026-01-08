import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const PotholeAnimation = () => {
  const [key, setKey] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setKey(prev => prev + 1);
    }, 25000); // Repeat every 25 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div key={key} className="relative w-full h-96 bg-gradient-to-b from-gray-800 via-gray-900 to-black overflow-hidden rounded-2xl shadow-2xl border-4 border-orange-500 p-2">
      {/* Moon */}
      <motion.div
        className="absolute top-10 right-10 text-5xl opacity-80"
        animate={{ rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      >
        🌙
      </motion.div>

      {/* Sky with clouds */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-700 via-gray-800 to-gray-900">
        <motion.div
          className="absolute top-10 left-10 text-4xl opacity-60"
          animate={{ x: [0, 400] }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        >
          ☁️
        </motion.div>
        <motion.div
          className="absolute top-16 right-20 text-3xl opacity-60"
          animate={{ x: [400, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
        >
          ☁️
        </motion.div>
      </div>

      {/* Road with damage */}
      <motion.div
        className="absolute bottom-0 w-full h-24 bg-gradient-to-b from-gray-600 via-gray-700 to-gray-800"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        {/* Road markings */}
        <div className="absolute top-1/2 left-0 w-full h-1 bg-yellow-300 transform -translate-y-1/2">
          <motion.div
            className="w-8 h-1 bg-white absolute"
            style={{ left: '4px' }}
            animate={{ opacity: [1, 0, 1] }}
            transition={{ duration: 0.5, repeat: Infinity }}
          />
          <motion.div
            className="w-8 h-1 bg-white absolute"
            style={{ left: '20px' }}
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 0.5, repeat: Infinity, delay: 0.25 }}
          />
          <motion.div
            className="w-8 h-1 bg-white absolute"
            style={{ left: '36px' }}
            animate={{ opacity: [1, 0, 1] }}
            transition={{ duration: 0.5, repeat: Infinity, delay: 0.5 }}
          />
          <motion.div
            className="w-8 h-1 bg-white absolute"
            style={{ left: '52px' }}
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 0.5, repeat: Infinity, delay: 0.75 }}
          />
        </div>
      </motion.div>

      {/* Car moving right to left */}
      <motion.div
        className="absolute bottom-24 right-0"
        initial={{ x: 150 }}
        animate={{ x: -450 }}
        transition={{ duration: 3, ease: "easeInOut" }}
      >
        <div className="text-5xl">🚗</div>
      </motion.div>

      {/* Truck moving right to left */}
      <motion.div
        className="absolute bottom-26 right-0"
        initial={{ x: 250 }}
        animate={{ x: -550 }}
        transition={{ duration: 5, ease: "easeInOut", delay: 1.5 }}
      >
        <div className="text-6xl">🚚</div>
      </motion.div>

      {/* Bike moving right to left */}
      <motion.div
        className="absolute bottom-22 right-0"
        initial={{ x: 100 }}
        animate={{ x: -250 }}
        transition={{ duration: 3.5, ease: "easeInOut", delay: 0.5 }}
      >
        <motion.div
          animate={{ x: [0, -15, 15, -15, 0] }}
          transition={{ delay: 2.8, duration: 0.6 }}
        >
          <div className="text-6xl">🚴‍♂️</div>
        </motion.div>
      </motion.div>

      {/* Pothole visible from start */}
      <motion.div
        className="absolute bottom-20 left-1/3 transform -translate-x-1/2"
        initial={{ scale: 1, opacity: 1 }}
        animate={{ scale: 1, opacity: 1 }}
      >
        <div className="text-6xl filter drop-shadow-lg">🕳️</div>
      </motion.div>

      {/* Person getting down from bike */}
      <motion.div
        className="absolute bottom-24 left-1/3 transform translate-x-10"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 3.5, duration: 0.5 }}
      >
        <motion.div
          animate={{ x: [0, -10, -15] }}
          transition={{ delay: 3.8, duration: 1.2 }}
        >
          <div className="text-4xl">🚶‍♂️</div>
        </motion.div>
      </motion.div>

      {/* Opening app animation */}
      <motion.div
        className="absolute bottom-40 left-1/3 transform -translate-x-1/2"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 4.5, duration: 0.5 }}
      >
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ delay: 4.8, duration: 0.4, repeat: 2 }}
        >
          <div className="text-5xl bg-blue-500 rounded-lg p-2 shadow-lg">📱�️</div>
        </motion.div>
      </motion.div>

    </motion.div>
  );
};

export default PotholeAnimation;