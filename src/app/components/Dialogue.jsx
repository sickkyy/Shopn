// Dialogue.jsx
import React, { useState, useEffect } from 'react';
import DialogueBox from './DialogueBox';
import { AnimatePresence } from 'framer-motion';

const dialogueLines = [
  { speaker: 'Mom', text: 'Dinner will be ready in 15 minutes!' },
  { speaker: 'Child 1', text: 'Can we have dessert after?' },
  { speaker: 'Dad', text: 'If you finish all your vegetables.' },
  { speaker: 'Child 2', text: 'Yay!' },
  { speaker: 'Mom', text: 'Help me set the table, please.' },
];

const Dialogue = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentIndex < dialogueLines.length - 1) {
        setCurrentIndex((prevIndex) => prevIndex + 1);
      }
    }, 1500); // Adjust the timing as needed

    return () => clearTimeout(timer); // Cleanup the timer on unmount or re-render
  }, [currentIndex]);

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Family Chat</h2>
      <AnimatePresence>
        {dialogueLines.slice(0, currentIndex + 1).map((line, index) => (
          <DialogueBox key={index} speaker={line.speaker}>
            {line.text}
          </DialogueBox>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default Dialogue;