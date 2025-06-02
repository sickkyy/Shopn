// DialogueBox.jsx
import React from 'react';
import { motion } from 'framer-motion';

const DialogueBox = ({ speaker, children, isUser }) => {
  const containerVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  };

  return (
    <motion.div
      className={`flex ${
        isUser ? 'justify-end' : 'justify-start'
      } mb-4 w-full`}
      variants={containerVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.3, ease: 'easeInOut' }}
    >
      <div
        className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} max-w-md`}
      >
        {speaker && (
          <div className={`text-sm font-semibold ${isUser ? 'text-blue-600' : 'text-green-600'} mb-1`}>
            {speaker}
          </div>
        )}
        <div
          className={`rounded-xl py-2 px-4 ${
            isUser ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
          }`}
        >
          {children}
        </div>
      </div>
    </motion.div>
  );
};

export default DialogueBox;