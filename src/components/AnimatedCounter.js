import React, { useEffect, useState } from 'react';
import { Typography } from '@mui/material';

const AnimatedCounter = ({
  endValue,
  duration = 700,
  suffix = ''
}) => {
  const [count, setCount] = useState(1);

  useEffect(() => {
    let startTime = null;

    const animate = (time) => {
      if (!startTime) startTime = time;
      const progress = Math.min((time - startTime) / duration, 1);

      const current = Math.floor(1 + (endValue - 1) * progress);
      setCount(current);

      if (progress < 1) requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);
  }, [endValue, duration]);

  return (
    <Typography variant="h3">
      {count.toLocaleString()}{suffix}
    </Typography>
  );
};

export default AnimatedCounter;
