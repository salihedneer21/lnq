import { useState, useEffect } from "react";

export const useCountDown = (startTime: number) => {
  const [seconds, setSeconds] = useState(startTime);
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    let interval: NodeJS.Timeout | undefined = undefined;
    if (isActive) {
      interval = setInterval(() => {
        if (seconds < 0) {
          setIsActive(false);
        }
        setSeconds((seconds) => seconds - 1);
      }, 1000);
    } else if (!isActive && seconds !== 0) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isActive, seconds]);

  return { seconds, setSeconds, setIsActive };
};
