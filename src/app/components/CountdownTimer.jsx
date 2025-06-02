import React, { useState, useEffect } from 'react';

const CountdownTimer = ({ endTime }) => {
  const calculateTimeLeft = () => {
    const difference = +new Date(endTime) - +new Date();
    let timeLeft = {};

    if (difference > 0) {
      timeLeft = {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    } else {
      timeLeft = { days: 0, hours: 0, minutes: 0, seconds: 0 };
    }
    return timeLeft;
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());
  const [isEnded, setIsEnded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      const newTimeLeft = calculateTimeLeft();
      setTimeLeft(newTimeLeft);
      if (Object.values(newTimeLeft).every(val => val === 0)) {
        setIsEnded(true);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [timeLeft, endTime]); // Re-run effect if timeLeft or endTime changes

  const timerComponents = [];

  Object.keys(timeLeft).forEach((interval) => {
    if (timeLeft[interval] !== 0) {
      timerComponents.push(
        <span key={interval} className="mr-1">
          {timeLeft[interval]} {interval}{' '}
        </span>
      );
    }
  });

  return (
    <span className={`${isEnded ? 'text-red-500' : 'text-green-600 dark:text-green-400'} font-medium`}>
      {isEnded ? 'Ended' : (timerComponents.length ? timerComponents : <span>Time's up!</span>)}
    </span>
  );
};

export default CountdownTimer;