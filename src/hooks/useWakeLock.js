import { useEffect, useState } from 'react';

const useWakeLock = () => {
  const [wakeLock, setWakeLock] = useState(null);
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    if ('wakeLock' in navigator) {
      setIsSupported(true);
    }
  }, []);

  const requestWakeLock = async () => {
    if (!isSupported) return;
    try {
      const lock = await navigator.wakeLock.request('screen');
      setWakeLock(lock);

      const handleRelease = () => {
        setWakeLock(null);
      };

      lock.addEventListener('release', handleRelease);
    } catch (err) {
      console.error(`${err.name}, ${err.message}`);
    }
  };

  const releaseWakeLock = async () => {
    if (wakeLock) {
      await wakeLock.release();
      setWakeLock(null);
    }
  };

  useEffect(() => {
    return () => {
      if (wakeLock) {
        wakeLock.release().catch(() => {});
      }
    };
  }, [wakeLock]);

  return { isSupported, wakeLock, requestWakeLock, releaseWakeLock };
};

export default useWakeLock;
